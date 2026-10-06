import { formatInput, MethodParameter } from "../../../configs/createJobConfig";
import GetInputField from "./GetInputField";

export default function InputFields({
  jobValue,
  jobConfig,
  disable,
  isEdit,
  proteinLength,
}: {
  jobValue: Record<string, MethodParameter["default"]>;
  jobConfig: {
    formatInput: number;
    description: string;
    parameters: MethodParameter[];
  };
  disable?: boolean;
  isEdit: boolean;
  proteinLength?: number;
}) {
  if (!jobConfig || !Array.isArray(jobConfig.parameters)) return null;

  // old jobs may not have this parameter, use the default when editing
  const getFieldValue = (value: MethodParameter) => {
    if (value.type === "rangeNumber") {
      const low =
        jobValue[`${value.id}_low`] ?? (isEdit ? value.low : undefined);
      const high =
        jobValue[`${value.id}_high`] ?? (isEdit ? value.high : undefined);
      return {
        low: low === undefined ? undefined : Number(low),
        high: high === undefined ? undefined : Number(high),
      };
    }
    return jobValue[value.id] ?? (isEdit ? value.default : undefined);
  };

  return (
    <div
      className={
        formatInput[jobConfig.formatInput ?? 1]?.input ||
        "flex flex-row gap-x-[5%] gap-y-4 flex-wrap"
      }
    >
      {jobConfig.parameters.map((value) => (
        <GetInputField
          key={value.id}
          id={value.id}
          type={value.type}
          label={value.name}
          options={value.dropdownItems}
          value={getFieldValue(value)}
          disable={disable}
          onEdit={isEdit}
          additionalValidation={
            disable ? undefined : value.additionalValidation
          }
          formatInput={jobConfig.formatInput}
          proteinLength={proteinLength}
        />
      ))}
    </div>
  );
}
