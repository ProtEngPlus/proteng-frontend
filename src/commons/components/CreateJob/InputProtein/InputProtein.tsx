import { Icon } from "@iconify/react";
import Button from "../../Button/Button";
import { useFormContext } from "react-hook-form";
import DownloadCSVButton from "../../Button/DownloadCSVButton";
import ViewButton from "../../Button/ViewButton";
import { useEffect, useState } from "react";
import { getUniProtId } from "../../../api/job";
import QueryResultTable from "./QueryResultTable";
import { State } from "../../../interfaces/Job.interface";
import {
  inputProteinProtSeq,
  inputProteinUniprotId,
} from "../../../configs/createJobConfig";
import { QueryResult } from "../../../interfaces/QueryResult.interface";
import {
  QueryResultOverlay,
  QueryResultOverlayProps,
} from "./QueryResultOverlay";
import { DownloadQueryResult } from "../../../../pages/CreateJob/services/DownloadQueryResult";

interface Props {
  isJobDetail: boolean;
  stage?: number;
  state?: State;
  onEdit: boolean;
  isWithConfig?: boolean;
  initialStep?: number;
  isConclusion?: boolean;
  queryResult?: QueryResult;
  setQueryResult?: (queryResult: QueryResult) => void; // for create job page
}

export default function InputProtein({
  isJobDetail,
  stage = 1,
  state = "CREATED",
  isWithConfig = true,
  onEdit,
  initialStep = 1,
  isConclusion = false,
  queryResult,
  setQueryResult,
}: Props) {
  const {
    register,
    formState: { errors },
    setValue,
    getValues,
    watch,
    trigger,
  } = useFormContext();

  // to display query result
  const jobId = getValues(isJobDetail ? "id" : "ref_job_id");
  const formData = watch();
  const hasQueryResult = isJobDetail
    ? stage > 0
    : initialStep > 1 && isWithConfig;
  const canEditQueryResult = isJobDetail
    ? stage == 1 && state === "PENDING"
    : initialStep == 2 && isWithConfig;
  const canEditInputProtein = isJobDetail ? stage == 0 : initialStep == 1;

  const inputProtein = watch("input_protein");
  const inputProteinField = watch("input_protein_field");
  const inputMode = watch("input_mode") ?? "prot_seq";
  const [isError, setIsError] = useState({
    isValidate: true,
    errorMessage: "",
  });

  useEffect(() => {
    if (inputMode === "prot_seq") {
      setValue(
        "input_protein",
        (getValues("input_protein_field") ?? "").replace(/\s/g, ""),
      );
    }
  }, [inputProteinField, inputMode]);

  const getUniProt = async (inputId: string) => {
    const data = await getUniProtId(inputId.trim());

    if (data.data) {
      setValue("input_protein", data.data.sequence);
      setIsError({ isValidate: true, errorMessage: "" });
    } else {
      setIsError({ isValidate: false, errorMessage: data.message });
    }
  };

  const inputProteinFieldProps = {
    id: "input_protein_field",
    disabled: !canEditInputProtein,
    placeholder: "Input Protein*",
    autoComplete: "off",
    spellCheck: false,
    ...register("input_protein_field", {
      required: inputMode === "prot_seq" ? "Protein input is required." : false,

      validate:
        inputMode === "prot_seq"
          ? (value) => {
              const sequence = value.replace(/\s/g, "");
              const invalidAminoAcids = /[BJOUXZ]/i.test(sequence);
              const containsExactATGC = /ATGC/i.test(sequence);

              if (invalidAminoAcids || containsExactATGC) {
                return "Incorrect protein sequence format.";
              }

              return true;
            }
          : !isError.isValidate
            ? () => isError.errorMessage
            : undefined,
    }),
    onBlur: () => {
      if (inputMode === "prot_seq") {
        trigger("input_protein_field");
      } else {
        getUniProt(inputProteinField);
      }
    },
  };

  const inputProteinFieldClassName = `block w-full min-w-fit px-3 bg-white border font-light placeholder:text-placeholder rounded-md focus:border-pep-blue focus:outline-none disabled:cursor-not-allowed disabled:bg-disabled disabled:border-disabled disabled:text-label ${
    (errors.input_protein_field && inputMode === "prot_seq") ||
    (!isError.isValidate && inputMode === "uniprot_id")
      ? "border-error"
      : "border-gray-border"
  }`;

  // query result filter
  const [isQueryResultVisible, setQueryResultVisible] = useState(false);
  const queryResultOverlayProps: QueryResultOverlayProps = {
    inputProtein,
    jobId,
    onClose: () => {
      setQueryResultVisible(false);
    },
  };

  return (
    <div>
      {/* Add Protein Table Overlay & Query Result Filter Here */}
      <QueryResultOverlay
        isVisible={isQueryResultVisible}
        queryResultProps={queryResultOverlayProps}
      />
      <div className="space-y-12">
        {/* Header Section */}
        <div
          className={`space-y-3 rounded-lg border-pep-gray-border ${
            onEdit ? "bg-pep-blue-light p-5" : ""
          } `}
        >
          <div className="flex items-center space-x-3">
            <Icon
              icon="hugeicons:dna"
              className="size-6 text-pep-gray min-w-6"
            />
            <label className="text-center text-nowrap font-light">
              Input Protein
            </label>

            {/*---------------------------------------------- For Input Protein ---------------------------------------*/}

            <div className="grow">
              {onEdit ? (
                <div className="grow relative">
                  {inputMode === "uniprot_id" ? (
                    <input
                      {...inputProteinFieldProps}
                      className={`h-[50px] ${inputProteinFieldClassName}`}
                    />
                  ) : (
                    <textarea
                      {...inputProteinFieldProps}
                      rows={2}
                      className={`max-h-48 resize-y overflow-y-auto break-all py-3 ${inputProteinFieldClassName}`}
                    />
                  )}
                  {errors.input_protein_field && inputMode === "prot_seq" ? (
                    <span className="absolute font-light text-error text-xs">
                      {typeof errors.input_protein_field.message === "string"
                        ? errors.input_protein_field.message
                        : ""}
                    </span>
                  ) : !isError.isValidate && inputMode === "uniprot_id" ? (
                    <span className="absolute font-light text-error text-xs">
                      {isError.errorMessage}
                    </span>
                  ) : null}
                  {inputProtein &&
                    (inputMode === "prot_seq" || isError.isValidate) && (
                      <span className="absolute right-0 font-light text-label text-xs">
                        Length: {inputProtein.length}
                      </span>
                    )}
                </div>
              ) : (
                <div className="line-clamp-2 break-all overflow-hidden max-w-full">
                  {inputProteinField}
                </div>
              )}
            </div>

            {/*------------------------------------------------------ For Button  -------------------------------------------------*/}

            {onEdit ? (
              <div className="flex items-center space-x-3">
                <Button
                  id="prot_seq"
                  buttonType={inputMode === "prot_seq" ? "submit" : "cancel"}
                  type="button"
                  onClick={() => {
                    if (canEditInputProtein) {
                      setValue("input_mode", "prot_seq");
                      setValue("input_protein_field", inputProteinProtSeq);
                    }
                  }}
                  text="Amino Acid Sequence"
                  className={`!font-light !p-0 w-[100px] text-sm ${
                    canEditInputProtein
                      ? "cursor-pointer"
                      : "cursor-not-allowed hover:bg-pep-blue"
                  }`}
                />
                <Button
                  disabled={!canEditInputProtein}
                  id="uniprot_id"
                  buttonType={inputMode === "uniprot_id" ? "submit" : "cancel"}
                  type="button"
                  onClick={() => {
                    if (inputMode === "uniprot_id") {
                      getUniProt(inputProteinField);
                    } else {
                      setValue("input_mode", "uniprot_id");
                      setValue("input_protein_field", inputProteinUniprotId);
                      getUniProt(inputProteinUniprotId);
                    }
                  }}
                  text="UniprotID"
                  className="!font-light !p-0 w-[100px] text-sm disabled:bg-white !disabled:text-black"
                />
                {inputMode === "uniprot_id" && (
                  <ViewButton
                    inputProtein={inputProtein}
                    disable={!isError.isValidate || !watch("input_protein")}
                  />
                )}
              </div>
            ) : hasQueryResult ? (
              <div className="flex items-center space-x-3">
                <Button
                  id="btn-view-protein-with-table"
                  buttonType="cancel"
                  type="button"
                  text="View"
                  className="w-fit px-3 py-2 font-normal inline-flex items-center whitespace-nowrap place-content-center text-center gap-3 text-pep-dark-gray"
                  onClick={() => {
                    setQueryResultVisible(true);
                  }}
                >
                  <Icon
                    icon="carbon:view"
                    className="size-[30px] text-pep-gray"
                  />
                </Button>
                <DownloadCSVButton
                  onClick={() => DownloadQueryResult(formData, jobId)}
                />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <ViewButton inputProtein={inputProtein} />
              </div>
            )}
          </div>
          {/*--------------------------- Input Protein Table -------------------------------*/}
          {onEdit && hasQueryResult && (
            <QueryResultTable
              isJobDetail={isJobDetail}
              isOverlay={false}
              disable={!canEditQueryResult}
              jobId={jobId}
              queryResult={queryResult}
              setQueryResult={setQueryResult}
            />
          )}
        </div>
        {/* Note for no query result */}
        {!isConclusion && onEdit && !hasQueryResult && (
          <div className="text-center text-label font-light">
            Note: Query Results can be manually filtered and selected only in{" "}
            <span className="text-pep-orange font-normal">'One-Step Run'</span>{" "}
            mode
          </div>
        )}
      </div>
    </div>
  );
}
