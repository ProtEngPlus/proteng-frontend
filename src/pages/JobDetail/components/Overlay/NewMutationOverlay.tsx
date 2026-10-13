import { useMemo, useState } from "react";
import onEditIcon from "../../../../assets/images/CreateJob/onEditIcon.svg";
import Button from "../../../../commons/components/Button/Button";
import { PipelineItem } from "../../../../commons/interfaces/CreateJob.interface";
import { createJobConfig } from "../../../../commons/configs/createJobConfig";
import { Steps } from "../../../../commons/interfaces/Job.interface";
import InputFields from "../../../../commons/components/CreateJob/InputField/InputFields";
import { useFormContext } from "react-hook-form";
import SelectInput from "../../../../commons/components/Input/SelectInput";

export type NewMutationProps = {
  onClose: () => void;
  onConfirm: (name: string) => void;
};

export function NewMutationOverlay({
  isVisible,
  newMutationProps,
  currentStep,
  pipeline,
  inputProtein,
}: {
  isVisible: boolean;
  newMutationProps: NewMutationProps;
  currentStep: number;
  pipeline: PipelineItem[];
  inputProtein: string;
}) {
  const { onClose, onConfirm } = newMutationProps;
  const [name, setName] = useState("");

  const jobConfig = useMemo(() => {
    const stepKey = Steps[currentStep];
    const pipelineStep = pipeline[currentStep]?.subMethod;
    const config = createJobConfig[stepKey]?.tool?.[pipelineStep];
    return {
      formatInput: 4,
      description: config?.description || "",
      parameters: config?.parameters || {},
    };
  }, [currentStep, pipeline]);
  const { getValues, trigger } = useFormContext();

  const [isError, setIsError] = useState(false);
  const handleConfirm = async () => {
    if (name.length === 0) {
      setIsError(true);
      return;
    }

    // check the parameters before anything is created
    const fieldNames = Array.isArray(jobConfig.parameters)
      ? jobConfig.parameters.flatMap((param) =>
          param.type === "rangeNumber"
            ? [`${param.id}_low`, `${param.id}_high`]
            : [param.id],
        )
      : [];
    if (await trigger(fieldNames)) {
      onConfirm(name);
    }
  };

  return (
    isVisible && (
      <div
        id="#new-mutation-modal"
        className="fixed top-0 right-0 left-0 z-[90] flex justify-center items-center w-full h-full bg-gray-900/50 mt-0"
      >
        <div className="space-y-5 place-items-center place-self-center w-[55%] place-content-center text-center">
          <div className="bg-pep-blue-light opacity-100 px-5 py-8 m-auto z-[100] space-y-8">
            <div className="flex space-x-3 place-self-center">
              <img
                src={onEditIcon}
                alt="edit"
                className="text-pep-gray size-8 min-w-8"
              />
              <span className="text-2xl text-pep-dark-gray">New Mutation</span>
            </div>

            <div className="bg-white rounded-lg p-8 gap-x-3 gap-y-4 font-light text-start">
              <div className="space-y-4">
                <div className="items-center space-x-3 grid grid-cols-[1fr,2fr] max-w-[1000px]">
                  <label>Collection Name:</label>
                  <input
                    id="collection-name"
                    value={name}
                    onChange={(e) => {
                      setIsError(false);
                      setName(e.target.value);
                    }}
                    placeholder="Collection Name*"
                    className={`
                  h-[50px] p-3 bg-white border font-light placeholder:text-placeholder rounded-md focus:border-pep-blue focus:outline-none
                  ${isError ? "border-error" : "border-pep-gray-border"}
                `}
                    autoComplete="off"
                  />
                </div>

                {/* Select SubMethod's Tool */}
                <div className="items-center space-x-3 grid grid-cols-[1fr,2fr] max-w-[1000px]">
                  <label className="font-light w-[40%]">Tool:</label>
                  <SelectInput
                    id={`tool_${Steps[currentStep]}`}
                    defaultValue={pipeline[currentStep].subMethod}
                    options={Object.keys(
                      createJobConfig[Steps[currentStep]]?.tool ?? {},
                    ).map((option) => ({
                      label: option,
                      value: option,
                    }))}
                    className="!w-[336px]"
                    disabled={false}
                    onEdit={true}
                  />
                </div>

                {/* SubMethod description */}
                <div className="space-y-4 text-pep-dark-gray pb-4">
                  <h1 className="text-2xl font-normal ">
                    {pipeline[currentStep].subMethod}
                  </h1>
                  <span className="text-sm font-light ">
                    {createJobConfig[Steps[currentStep]]?.tool[
                      pipeline[currentStep].subMethod
                    ]
                      ? createJobConfig[Steps[currentStep]]?.tool[
                          pipeline[currentStep].subMethod
                        ].description
                      : ""}
                  </span>
                  <hr />
                </div>
              </div>

              {/* SubMethod's input */}
              <div className="space-y-2">
                <InputFields
                  jobConfig={jobConfig}
                  jobValue={getValues(
                    `options.${pipeline[currentStep].subMethod.toLowerCase()}`,
                  )}
                  isEdit={true}
                  disable={false}
                  proteinLength={inputProtein.length}
                />
              </div>
            </div>

            <div className="flex space-x-8 place-self-center">
              <Button
                id="cancel"
                buttonType="cancel"
                text="Cancel"
                onClick={onClose}
              />
              <Button
                id="create"
                buttonType="submit"
                text="Create"
                className="!font-light"
                onClick={handleConfirm}
              />
            </div>
          </div>
        </div>
      </div>
    )
  );
}
