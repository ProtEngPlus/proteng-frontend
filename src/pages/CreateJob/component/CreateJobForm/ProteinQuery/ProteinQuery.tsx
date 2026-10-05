import { useFormContext } from "react-hook-form";
import { createJobConfig } from "../../../../../commons/configs/createJobConfig";
import {
  PipelineItem,
  stepsForCreateJob,
} from "../../../../../commons/interfaces/CreateJob.interface";
import { useEffect, useMemo, useState } from "react";
import Context from "../../../../../commons/components/CreateJob/Context/Context";
import { Icon } from "@iconify/react/dist/iconify.js";
import Textarea from "../../../../../commons/components/CreateJob/InputField/InputField/Textarea";
import TextInput from "../../../../../commons/components/Input/TextInput";
import ContextWithHelperText from "../../../../../commons/components/CreateJob/Context/ContextWithHelper";
import DropdownInput from "../../../../../commons/components/CreateJob/InputField/InputField/Dropdown";
import HelperText from "../../../../../commons/components/CreateJob/InputField/HelperText";
import InputProtein from "../../../../../commons/components/CreateJob/InputProtein/InputProtein";
import InputFields from "../../../../../commons/components/CreateJob/InputField/InputFields";
import { QueryResult } from "../../../../../commons/interfaces/QueryResult.interface";

interface Props {
  isWithConfig?: boolean;
  initialStep: number;
  step: number;
  pipeline: PipelineItem[];
  setPipeline: (p: PipelineItem[]) => void;
  isConclusion?: boolean;
  onEditInfo?: boolean;
  onEditOption?: boolean;
  queryResult?: QueryResult;
  setQueryResult?: (queryResult: QueryResult) => void;
}

export default function ProteinQuery({
  isWithConfig = true,
  initialStep,
  step,
  pipeline,
  setPipeline,
  isConclusion = false,
  onEditInfo = true,
  onEditOption = true,
  queryResult,
  setQueryResult,
}: Props) {
  const { getValues, watch } = useFormContext();

  const currentSubMethod =
    watch(`tool_${stepsForCreateJob[step - 1]}`) ??
    pipeline[step - 1].subMethod;

  // isEdit (for conclusion step)
  const [isEditInfo, setEditInfo] = useState(onEditInfo);
  const [isEditOption, setEditOption] = useState(onEditOption);

  // update pipeline
  useEffect(() => {
    const updatedPipeline = [...pipeline];
    updatedPipeline[step - 1].subMethod = currentSubMethod;
    setPipeline(updatedPipeline);
  }, [currentSubMethod]);

  const jobConfig = useMemo(() => {
    return createJobConfig[stepsForCreateJob[step - 1]]?.tool[currentSubMethod];
  }, [currentSubMethod]);

  const HelperTextWithInputProtein = (
    <HelperText
      currentSubMethod={currentSubMethod}
      jobConfig={jobConfig}
      step={step}
      stepsFormat={stepsForCreateJob}
    >
      <div className="flex rounded-lg border border-pep-gray-border space-x-3 font-light items-center p-3 h-[70px] min-h-fit">
        <Icon
          icon="hugeicons:dna"
          className="size-6 min-w-6 min-h-6 text-pep-gray"
        />
        <label className="text-center text-nowrap">Input Protein:</label>
        <div className="grow truncate">
          {createJobConfig["Protein Input"].description}
        </div>
      </div>
    </HelperText>
  );

  return (
    <div className="space-y-11">
      <Context
        title="General"
        isConclusion={isConclusion}
        onEdit={isEditInfo}
        onEditChange={() => setEditInfo(!isEditInfo)}
      >
        <div className="grid grid-cols-[10.625rem_31.25rem] gap-5">
          <div className="flex flex-row gap-x-3 items-center">
            <Icon
              icon="ph:pencil-simple-line"
              className="text-gray-400 size-6"
            />
            <label>
              Job Name<span className="text-red-500">*</span> :
            </label>
          </div>

          <TextInput
            id="name"
            placeholder="Job Name"
            additionalValidation={{
              required: { value: true, message: "Job Name is required." },
            }}
            onEdit={isEditInfo}
          />

          <div className="flex flex-row gap-x-3 items-start">
            <Icon icon="ph:note" className="text-gray-400 size-6" />
            <label>Job Description:</label>
          </div>

          <Textarea
            id="description"
            maxLength={50}
            placeholder="Job Description"
            additionalValidation={{
              maxLength: {
                value: 50,
              },
            }}
            onEdit={isEditInfo}
          />
        </div>
      </Context>
      <ContextWithHelperText
        title={stepsForCreateJob[step - 1]}
        helperText={HelperTextWithInputProtein}
        isConclusion={isConclusion}
        onEdit={isEditOption}
        onEditChange={() => setEditOption(!isEditOption)}
      >
        <div className="space-y-4">
          {/* Select SubMethod's Tool */}
          <DropdownInput
            id={`tool_${stepsForCreateJob[step - 1]}`}
            label="Tool"
            defaultValue={currentSubMethod}
            options={Object.keys(
              createJobConfig[stepsForCreateJob[step - 1]]?.tool ?? {},
            )}
            onEdit={isEditOption}
            disabled={initialStep > step}
          />

          {/* SubMethod description */}
          {!isConclusion && (
            <div className="space-y-2 text-pep-dark-gray">
              <h1 className="text-2xl font-normal ">{currentSubMethod}</h1>
              <span className="text-sm font-light ">
                {createJobConfig[stepsForCreateJob[step - 1]]?.tool[
                  currentSubMethod
                ]
                  ? createJobConfig[stepsForCreateJob[step - 1]]?.tool[
                      currentSubMethod
                    ].description
                  : ""}
              </span>
              <hr />
            </div>
          )}
        </div>

        {/* SubMethod's input */}
        <div className="space-y-2">
          <InputFields
            jobConfig={jobConfig}
            jobValue={getValues(
              `${stepsForCreateJob[step - 1]}.${currentSubMethod}`,
            )}
            isEdit={isEditOption}
            disable={initialStep > step}
          />
        </div>
        {!isEditOption && (
          <InputProtein
            isJobDetail={false}
            onEdit={isEditOption}
            isWithConfig={isWithConfig}
            initialStep={initialStep}
            isConclusion={isConclusion}
            queryResult={queryResult}
            setQueryResult={setQueryResult}
          />
        )}
      </ContextWithHelperText>

      {isEditOption && (
        <InputProtein
          isJobDetail={false}
          onEdit={isEditOption}
          isWithConfig={isWithConfig}
          initialStep={initialStep}
          isConclusion={isConclusion}
          queryResult={queryResult}
          setQueryResult={setQueryResult}
        />
      )}
    </div>
  );
}
