import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useRef, useState } from "react";
import Papa, { ParseResult } from "papaparse";
import { useFormContext } from "react-hook-form";
import {
  ManualInput,
  ManualInputOverlayProps,
} from "../../../../commons/components/CreateJob/UploadLabInput/ManualInputOverlay";
import {
  InputProteinOverlay,
  InputProteinOverlayProps,
} from "../../../../commons/components/CreateJob/InputProteinOverlay/InputProteinOverlay";
import DownloadCSVButton from "../../../../commons/components/Button/DownloadCSVButton";
import { UploadInputTemplate } from "../../../CreateJob/services/UploadInputTemplate";
import { LabInputTable } from "../../../../commons/components/CreateJob/UploadLabInput/LabInputTable";
import Button from "../../../../commons/components/Button/Button";
import { LabResult } from "../../../../commons/interfaces/Job.interface";
import { LabRow } from "../../../../commons/interfaces/AssayType.interface";
import { updateJobDetail } from "../../../../commons/api/job";
import { stackRows } from "../../../../commons/utils/stackRows";

export const exampleLabResult = [
  { sequence: "ASIQHFHW", score: 0.002914 },
  { sequence: "CSIQHFHW", score: 0.00302 },
  { sequence: "DSIQHFHW", score: 0.002219 },
  { sequence: "ESIQHFHW", score: 0.004379 },
];

const toLabResult = (rows: LabRow[]): LabResult =>
  rows.reduce(
    (acc, item) => {
      acc.sequences.push(item.sequence);
      acc.scores.push(item.score);
      acc.sources?.push(item.source ?? "upload");
      acc.total++;
      return acc;
    },
    {
      total: 0,
      sequences: [] as string[],
      scores: [] as number[],
      sources: [] as ("upload" | "manual" | "library")[],
    },
  );

export default function UploadLabInput({
  id,
  disable,
}: {
  id: string;
  disable: boolean;
}) {
  const { getValues } = useFormContext();
  const minimumSize = getValues(`options.ridgecv.train_batch_sizes`)?.[0];
  const labData: LabResult = getValues("lab_result");
  const inputProtein = getValues("input_protein");
  const labResult: LabRow[] | undefined = labData?.sequences?.map(
    (sequence, index) => ({
      sequence,
      score: labData.scores?.[index],
      source: labData.sources?.[index],
    }),
  );

  const [isExpand, setIsExpand] = useState(false);
  const [isRead, setRead] = useState(false);
  const [labResultForm, setLabResultForm] = useState<LabRow[]>(labResult ?? []);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isError, setIsError] = useState({
    isValidate: true,
    errorMessage: "",
  });
  const [skippedCount, setSkippedCount] = useState(0);

  const saveRows = async (rows: LabRow[], skipped: number) => {
    await updateJobDetail(id, {
      lab_result: toLabResult(rows),
      library_result_ids: getValues("library_result_ids") ?? [],
    });
    setLabResultForm(rows);
    setSkippedCount(skipped);
  };

  const tooFewMessage = `Total sequences should match minimum training batch size !\nMinimum training batch size can be modify in Step-4 “Top Model”`;

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList && fileList.length > 0) {
      setFile(fileList[0]);
    }
  };

  const checkValidate = (data: { sequence: string; score: number }[]) => {
    // Regular expression for valid amino acid sequences
    const validSequenceRegex = /^(?!.*[BJOUXZ])[A-Z]+$/i;

    for (const { sequence, score } of data) {
      if (
        !sequence ||
        score == null ||
        isNaN(score) ||
        !validSequenceRegex.test(sequence) ||
        sequence.toUpperCase().includes("ATGC") ||
        (sequence !== sequence.toUpperCase() &&
          sequence !== sequence.toLowerCase())
      ) {
        return {
          isValidate: false,
          errorMessage: "Uploaded file mismatch!",
        };
      }
    }

    return { isValidate: true, errorMessage: "" };
  };

  useEffect(() => {
    if (file) {
      const parseFile = async () => {
        try {
          const results = await new Promise<ParseResult<string[]>>(
            (resolve, reject) => {
              Papa.parse(file, {
                header: false,
                skipEmptyLines: true,
                delimiter: ",",
                complete: resolve,
                error: reject,
              });
            },
          );

          const fileData: LabRow[] = results.data.map((line) => {
            return {
              sequence: line[0].trim(),
              score: Number(line[1]),
              source: "upload",
            };
          });

          const validation = checkValidate(fileData);
          const stacked = stackRows(labResultForm, fileData);
          if (validation.isValidate && stacked.rows.length < minimumSize) {
            setIsError({ isValidate: false, errorMessage: tooFewMessage });
          } else {
            setIsError(validation);
            if (validation.isValidate) {
              await saveRows(stacked.rows, stacked.skipped);
            }
          }
        } catch (error) {
          console.error("Error during file parsing or job update:", error);
        }
      };

      parseFile();
    }
  }, [file]);

  const [isManualInputVisible, setManualInputVisible] = useState(false);
  const ManualInputProps: ManualInputOverlayProps = {
    onClose: () => setManualInputVisible(false),
    onConfirm: async (data) => {
      const rows: LabRow[] = data.map((row) => ({ ...row, source: "manual" }));
      const validation = checkValidate(rows);
      const stacked = stackRows(labResultForm, rows);
      if (validation.isValidate && stacked.rows.length < minimumSize) {
        setIsError({ isValidate: false, errorMessage: tooFewMessage });
      } else {
        setIsError(validation);
        if (validation.isValidate) {
          await saveRows(stacked.rows, stacked.skipped);
        }
      }
      setManualInputVisible(false);
    },
  };

  const [isProteinVisible, setProteinVisible] = useState(false);
  const InputProteinProps: InputProteinOverlayProps = {
    inputProtein: inputProtein,
    onClose: () => {
      setProteinVisible(false);
    },
  };

  return (
    <div>
      <InputProteinOverlay
        isVisible={isProteinVisible}
        inputProteinProps={InputProteinProps}
      />
      <ManualInput
        setProteinVisible={setProteinVisible}
        isVisible={isManualInputVisible}
        manualInputProps={ManualInputProps}
      />
      <div className="space-y-11 rounded-lg border border-pep-gray-border px-6 py-8">
        {/*------------------------------------ Lab Input Template ----------------------------------*/}
        {labResultForm.length === 0 && (
          <div className="space-y-6 font-light">
            <div className="flex border-l-4 border-pep-orange px-6 text-xl">
              Lab Input Template
            </div>
            <hr />
            <div className="flex justify-between space-x-4">
              <Icon
                icon={isExpand ? "mingcute:up-line" : "mingcute:down-line"}
                onClick={() => setIsExpand(!isExpand)}
                className="cursor-pointer text-pep-gray size-[30px]"
              />
              <DownloadCSVButton onClick={() => UploadInputTemplate()} />
            </div>
            <div className="rounded-lg bg-pep-blue-light p-5 text-pep-dark-gray">
              {isExpand ? (
                <LabInputTable data={exampleLabResult} isExample={true} />
              ) : (
                "Click expand to see full template"
              )}
            </div>
          </div>
        )}

        {/*------------------------------------ Upload Lab Input ----------------------------------*/}
        <div className="space-y-6 font-light">
          <div className="w-[353px] min-w-fit flex justify-between border-l-4 border-pep-orange px-6 font-light text-xl gap-x-5">
            Upload Lab Input
            <Icon
              icon="material-symbols:info-outline"
              className={`size-8 cursor-pointer ${
                isRead ? "text-pep-blue" : "text-pep-gray"
              }
           
            `}
              onClick={() => setRead(!isRead)}
            />
          </div>
          <hr />
          <div className="relative space-y-8">
            <div
              className={`flex space-x-5  ${
                !isError.isValidate || labResultForm.length === 0
                  ? "justify-between items-center"
                  : "justify-end"
              }`}
            >
              {!isError.isValidate ? (
                <div className="text-error flex flex-row items-center space-x-[10px]">
                  <div>*</div>
                  <div
                    className="text-wrap"
                    dangerouslySetInnerHTML={{
                      __html: isError.errorMessage.replace(/\n/g, "<br />"),
                    }}
                  ></div>
                </div>
              ) : labResultForm.length === 0 ? (
                <div>Please upload your lab input</div>
              ) : undefined}

              <div className="flex space-x-5">
                {/* --------------------------------Upload lab Button------------------------------------ */}
                <div>
                  <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    id="upload-lab-input"
                    type="button"
                    buttonType="submit"
                    text="Upload"
                    className="w-fit font-normal inline-flex items-center whitespace-nowrap place-content-center text-center gap-2 !px-2"
                    onClick={handleButtonClick}
                    disabled={disable}
                  >
                    <Icon icon="uil:upload" className="size-5" />
                  </Button>
                </div>

                {/* -------------------------------------Manual input Button----------------------------------------- */}
                <Button
                  id="upload-lab-input-manual"
                  type="button"
                  buttonType="submit"
                  text="Manual Input"
                  className={`w-fit font-normal inline-flex items-center whitespace-nowrap place-content-center text-center gap-2 !px-2`}
                  disabled={disable}
                  onClick={() => setManualInputVisible(true)}
                >
                  <Icon
                    icon="material-symbols-light:keyboard-external-input-rounded"
                    className="size-5"
                  />
                </Button>
              </div>
            </div>
          </div>

          <div className="relative rounded-lg bg-pep-blue-light place-items-center">
            {/*----------------------------------- Lab Input Table --------------------------------------------*/}
            {labResultForm.length > 0 && (
              <div className="w-[738px] space-y-8 p-5 min-w-fit mx-auto">
                <div className="flex space-x-2 text-start">
                  <span className="text-pep-dark-gray font-normal">Total:</span>
                  <span className="font-light text-pep-blue">
                    {labResultForm.length} sequences
                  </span>
                  {skippedCount > 0 && (
                    <span className="text-pep-gray">
                      ({skippedCount} duplicate sequences skipped)
                    </span>
                  )}
                </div>
                <div>
                  <LabInputTable
                    data={labResultForm}
                    isExample={false}
                    inputProtein={inputProtein}
                    setProteinVisible={setProteinVisible}
                  />
                </div>
              </div>
            )}
            {/*------------------------------------- Helper Text -------------------------------------------------*/}
            {isRead && (
              <div className="absolute inset-0 rounded-lg p-5 z-10 bg-pep-blue-light min-h-fit">
                <div className="flex space-x-3">
                  <Icon icon="ep:setting" className="text-pep-gray size-6" />
                  <label>Parameter Setup</label>
                </div>
                <div className="flex mt-4 space-x-5 text-pep-dark-gray items-center">
                  <span className="text-nowrap">Upload Lab Result:</span>
                  <span className="leading-10">
                    Upload your lab results with the experimented protein
                    sequences and their scores. This data will be used to train
                    the model for low-n engineering.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
