import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "../../../../../commons/components/Button/Button";
import { useEffect, useRef, useState } from "react";
import Papa, { ParseResult } from "papaparse";
import {
  InputProteinOverlay,
  InputProteinOverlayProps,
} from "../../../../../commons/components/CreateJob/InputProteinOverlay/InputProteinOverlay";
import { useFormContext } from "react-hook-form";
import DownloadCSVButton from "../../../../../commons/components/Button/DownloadCSVButton";
import { LabInputTable } from "../../../../../commons/components/CreateJob/UploadLabInput/LabInputTable";
import {
  ManualInput,
  ManualInputOverlayProps,
} from "../../../../../commons/components/CreateJob/UploadLabInput/ManualInputOverlay";
import { stepsForCreateJob } from "../../../../../commons/interfaces/CreateJob.interface";
import onEditIcon from "../../../../../assets/images/CreateJob/onEditIcon.svg";
import editIcon from "../../../../../assets/images/CreateJob/editIcon.svg";
import { ViewLabResult, ViewLabResultOverlayProps } from "./ViewLabResultModal";
import { UploadInputTemplate } from "../../../services/UploadInputTemplate";
import LibraryPickerModal from "../../../../../commons/components/CreateJob/UploadLabInput/LibraryPickerModal";
import { LabRow } from "../../../../../commons/interfaces/AssayType.interface";
import { stackRows } from "../../../../../commons/utils/stackRows";

export const exampleLabResult = [
  { sequence: "ASIQHFHW", score: 0.002914 },
  { sequence: "CSIQHFHW", score: 0.00302 },
  { sequence: "DSIQHFHW", score: 0.002219 },
  { sequence: "ESIQHFHW", score: 0.004379 },
];

interface Props {
  initialStep: number;
  step: number;
  isConclusion?: boolean;
  onEdit?: boolean;
}

export default function UploadLabInput({
  initialStep,
  step,
  isConclusion = false,
  onEdit = true,
}: Props) {
  const { watch, getValues, setValue } = useFormContext();
  const minimumSize =
    getValues("train_batch_sizes")?.[0] ??
    getValues("Top Model.RidgeCV.train_batch_sizes")?.[0];

  const labResult = watch("lab_result");
  const inputProtein = watch("input_protein");
  const assayTypeId = watch("assay_type_id") ?? "";

  const [isExpand, setIsExpand] = useState(false);
  const [isEdit, setEdit] = useState(onEdit);
  const [isRead, setRead] = useState(false);
  const [labResultForm, setLabResultForm] = useState<LabRow[]>(labResult ?? []);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isError, setIsError] = useState({
    isValidate: true,
    errorMessage: "",
  });
  const [skippedCount, setSkippedCount] = useState(0);

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

  const formatError = (data: LabRow[]) => {
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
        return "Uploaded file mismatch !";
      }
    }

    return "";
  };

  const repeatedSequences = (data: LabRow[]) => {
    const seen = new Set<string>();
    const repeated = new Set<string>();
    data.forEach(({ sequence }) => {
      const key = sequence.toUpperCase();
      if (seen.has(key)) repeated.add(key);
      seen.add(key);
    });
    return [...repeated];
  };

  const sourceNames = {
    upload: "Uploaded file",
    manual: "Manual input",
    library: "Library",
  };

  const commit = (rows: LabRow[], skipped = 0) => {
    setLabResultForm(rows);
    setSkippedCount(skipped);
    const names = new Set(rows.map((row) => row.source));
    setValue(
      "file_name",
      [...names]
        .map((name) => (name ? sourceNames[name] : "recent_lab_result"))
        .join(", "),
    );

    let errorMessage = "";
    const repeated = repeatedSequences(rows);
    if (repeated.length > 0) {
      errorMessage = `Duplicate sequences are not allowed: ${repeated.slice(0, 3).join(", ")}${repeated.length > 3 ? ` and ${repeated.length - 3} more` : ""}`;
    } else if (rows.length < minimumSize) {
      errorMessage = `Total sequences should match minimum training batch size !\nMinimum training batch size can be modify in Step-4 “Top Model”`;
    }

    setIsError({ isValidate: errorMessage === "", errorMessage });
    setValue("lab_result", errorMessage === "" ? rows : []);
  };

  const libraryRows = labResultForm.filter((row) => row.source === "library");
  const otherRows = labResultForm.filter((row) => row.source !== "library");
  const takenSequences = new Set(
    otherRows.map((row) => row.sequence.toUpperCase()),
  );

  const previousAssayTypeId = useRef(assayTypeId);
  useEffect(() => {
    if (previousAssayTypeId.current !== assayTypeId) {
      previousAssayTypeId.current = assayTypeId;
      if (libraryRows.length > 0) commit(otherRows);
    }
  }, [assayTypeId]);

  useEffect(() => {
    if (file) {
      console.log(file);
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

          const message = formatError(fileData);
          if (message) {
            setIsError({ isValidate: false, errorMessage: message });
          } else {
            const { rows, skipped } = stackRows(labResultForm, fileData);
            commit(rows, skipped);
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
    onConfirm: (data) => {
      const rows: LabRow[] = data.map((row) => ({ ...row, source: "manual" }));
      const message = formatError(rows);
      if (message) {
        setIsError({ isValidate: false, errorMessage: message });
      } else {
        const stacked = stackRows(labResultForm, rows);
        commit(stacked.rows, stacked.skipped);
      }
      setManualInputVisible(false);
    },
  };

  const [isLibraryVisible, setLibraryVisible] = useState(false);

  const [isProteinVisible, setProteinVisible] = useState(false);
  const InputProteinProps: InputProteinOverlayProps = {
    inputProtein: inputProtein,
    onClose: () => {
      setProteinVisible(false);
    },
  };

  const [isViewVisible, setViewVisible] = useState(false);
  const ViewLabResultProps: ViewLabResultOverlayProps = {
    fileName: getValues("file_name"),
    labResult: labResult,
    inputProtein: inputProtein,
    onClose: () => {
      setViewVisible(false);
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
      <LibraryPickerModal
        isVisible={isLibraryVisible}
        assayTypeId={assayTypeId}
        takenSequences={takenSequences}
        selected={libraryRows}
        onClose={() => setLibraryVisible(false)}
        onConfirm={(rows) => {
          commit([...otherRows, ...rows]);
          setLibraryVisible(false);
        }}
      />
      <ViewLabResult
        isVisible={isViewVisible}
        viewLabResultProps={ViewLabResultProps}
      />
      <div className="space-y-11">
        {/*------------------------------------ Lab Input Template ----------------------------------*/}
        {!isConclusion && (
          <div className="space-y-6 font-light">
            <div className="flex border-l-4 border-pep-orange px-6 text-xl">
              Lab Input Template
            </div>
            <hr />
            <div className="flex justify-between space-x-4">
              <Icon
                id="expand-example-table"
                icon={isExpand ? "mingcute:up-line" : "mingcute:down-line"}
                onClick={() => setIsExpand(!isExpand)}
                className="cursor-pointer text-pep-gray size-[30px]"
              />
              <DownloadCSVButton onClick={() => UploadInputTemplate()} />
            </div>
            <div className="rounded-lg bg-pep-blue-light p-5 text-pep-dark-gray">
              {isExpand ? (
                <div className="mx-auto w-fit">
                  <LabInputTable data={exampleLabResult} isExample={true} />
                </div>
              ) : (
                "Click expand to see full template"
              )}
            </div>
          </div>
        )}

        {/*------------------------------------ Upload Lab Input ----------------------------------*/}
        <div className="space-y-6 font-light">
          <div className="w-[353px] min-w-fit flex justify-between border-l-4 border-pep-orange px-6 font-light text-xl gap-x-5">
            {stepsForCreateJob[step - 1]}
            <Icon
              icon="material-symbols:info-outline"
              className={`size-8 cursor-pointer ${
                isRead ? "text-pep-blue" : "text-pep-gray"
              }
           
            `}
              onClick={() => setRead(!isRead)}
            />
            {isConclusion && (
              <img
                src={isEdit ? onEditIcon : editIcon}
                alt="edit"
                className="size-8 cursor-pointer"
                onClick={() => setEdit(!isEdit)}
              />
            )}
          </div>
          <hr />
          <div className="relative space-y-8">
            <div className="flex justify-between space-x-5 place-items-center">
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
              ) : labResult.length === 0 ? (
                <div>Please upload your lab input</div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Icon
                    icon="heroicons:paper-clip-20-solid"
                    className="text-pep-gray size-5"
                  />
                  <div>{getValues("file_name")}</div>
                  {skippedCount > 0 && (
                    <div className="text-pep-gray">
                      ({skippedCount} duplicate sequences skipped)
                    </div>
                  )}
                </div>
              )}

              {isEdit ? (
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
                      disabled={initialStep > step}
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
                    disabled={initialStep > step}
                    onClick={() => setManualInputVisible(true)}
                  >
                    <Icon
                      icon="material-symbols-light:keyboard-external-input-rounded"
                      className="size-5"
                    />
                  </Button>

                  {/* -------------------------------------From Library Button----------------------------------------- */}
                  <Button
                    id="upload-lab-input-library"
                    type="button"
                    buttonType="submit"
                    text="From Library"
                    title={
                      assayTypeId
                        ? undefined
                        : "Select an assay score type in Step 1 first"
                    }
                    className="w-fit font-normal inline-flex items-center whitespace-nowrap place-content-center text-center gap-2 !px-2"
                    disabled={initialStep > step || !assayTypeId}
                    onClick={() => setLibraryVisible(true)}
                  >
                    <Icon icon="ph:books" className="size-5" />
                  </Button>
                </div>
              ) : (
                labResultForm.length !== 0 && (
                  <Button
                    id="btn-view-protein"
                    buttonType="cancel"
                    type="button"
                    text="View"
                    className="w-fit px-3 py-2 font-normal inline-flex items-center whitespace-nowrap place-content-center text-center gap-3 text-pep-dark-gray"
                    onClick={() => {
                      setViewVisible(true);
                    }}
                  >
                    <Icon
                      icon="carbon:view"
                      className="size-[30px] text-pep-gray"
                    />
                  </Button>
                )
              )}
            </div>
          </div>

          <div className="relative rounded-lg bg-pep-blue-light place-items-center">
            {/*----------------------------------- Lab Input Table --------------------------------------------*/}
            {isEdit && labResultForm.length > 0 && (
              <div className="w-[738px] space-y-8 p-5 min-w-fit mx-auto">
                <div className="flex space-x-2 text-start">
                  <span className="text-pep-dark-gray font-normal">Total:</span>
                  <span className="font-light text-pep-blue">
                    {labResultForm.length} sequences
                  </span>
                </div>
                <div>
                  <LabInputTable
                    data={labResultForm}
                    isExample={false}
                    inputProtein={inputProtein}
                    setProteinVisible={setProteinVisible}
                    onRemove={(index) =>
                      commit(labResultForm.filter((_, i) => i !== index))
                    }
                  />
                </div>
              </div>
            )}
            {/*------------------------------------- Helper Text -------------------------------------------------*/}
            {isRead && (
              <div className="absolute inset-0 rounded-lg p-5 z-10 bg-pep-blue-light h-fit">
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
