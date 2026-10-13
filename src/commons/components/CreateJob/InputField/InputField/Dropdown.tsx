import { ValidationProps } from "../../../Input/InputPropsType";
import SelectInput, { Option } from "../../../Input/SelectInput";

export type DropdownProps = {
  id: string;
  label: string;
  defaultValue?: string;
  options: string[];
  disabled?: boolean;
  additionalValidation?: Record<string, ValidationProps>;
  onEdit?: boolean;
  formatInput?: number;
};

export default function DropdownInput({
  id,
  label,
  defaultValue,
  options,
  disabled,
  additionalValidation,
  onEdit = true,
  formatInput = 1,
}: DropdownProps) {
  const optionsValue: Option[] = options.map((option) => ({
    label: option,
    value: option,
  }));

  return (
    <div
      className={`
      ${formatInput === 1 ? "w-[40%]" : "w-full"}
        min-w-fit`}
    >
      <div
        className={`
        ${
          formatInput === 2
            ? "flex flex-row justify-between max-w-[1000px] min-w-fit space-x-3 items-start"
            : formatInput === 4
              ? "min-w-fit items-start space-x-3 grid grid-cols-[1fr,2fr] max-w-[1000px]"
              : "min-w-fit justify-between items-start space-x-3 grid grid-cols-[1fr,4fr] max-w-[1000px]"
        }`}
      >
        <label className={`font-light ${formatInput === 1 ? "w-[40%]" : ""}`}>
          {label}
          {typeof additionalValidation?.required === "object" &&
            additionalValidation.required.value && (
              <span className="text-red-500">*</span>
            )}
          :
        </label>
        <SelectInput
          id={id}
          defaultValue={defaultValue}
          options={optionsValue}
          className={`
            ${formatInput === 2 ? "w-24" : "!w-[336px]"}`}
          disabled={disabled}
          additionalValidation={additionalValidation}
          onEdit={onEdit}
          formatInput={formatInput}
        />
      </div>
    </div>
  );
}
