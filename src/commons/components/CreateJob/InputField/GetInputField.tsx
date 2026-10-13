import NumberInput from "./InputField/NumberInput";
import PercentInput from "./InputField/PercentInput";
import RangeNumberInput from "./InputField/RangeNumberInput";
import DropdownInput from "./InputField/Dropdown";
import MultiNumberDropdown from "./InputField/MultiNumberDropdown";
import { MethodParameter } from "../../../../commons/configs/createJobConfig";
import { ValidationProps } from "../../../../commons/components/Input/InputPropsType";
import RangePercentInput from "./InputField/RangePercentInput";
import RegionListInput from "./InputField/RegionListInput";
import { Region } from "../../../utils/mutationRegions";

interface GetInputFieldProps {
  id: MethodParameter["id"];
  label: MethodParameter["name"];
  type: MethodParameter["type"];
  value: MethodParameter["default"] | { low?: number; high?: number };
  options?: MethodParameter["dropdownItems"];
  additionalValidation?: MethodParameter["additionalValidation"];
  disable?: boolean;
  onEdit?: boolean;
  formatInput?: number;
  proteinLength?: number;
}

export default function GetInputField({
  id,
  label,
  type,
  value,
  options,
  additionalValidation,
  disable = false,
  onEdit = true,
  formatInput = 2,
  proteinLength,
}: GetInputFieldProps) {
  // Filter out undefined validation rules
  const filteredValidation: Record<string, ValidationProps> | undefined =
    additionalValidation
      ? Object.fromEntries(
          Object.entries(additionalValidation).filter(
            ([, rule]) => rule !== undefined,
          ),
        )
      : undefined;

  switch (type) {
    case "dropdown":
      return (
        <DropdownInput
          id={id}
          label={label}
          defaultValue={value ? value.toString() : undefined}
          options={
            options?.map((item) => (item !== null ? item.toString() : "")) || []
          }
          additionalValidation={filteredValidation}
          disabled={disable}
          onEdit={onEdit}
          formatInput={formatInput}
        />
      );

    case "number":
      return (
        <NumberInput
          id={id}
          label={label}
          defaultValue={Number.isNaN(Number(value)) ? undefined : Number(value)}
          additionalValidation={filteredValidation}
          disabled={disable}
          onEdit={onEdit}
          formatInput={formatInput}
        />
      );

    case "percent":
      return (
        <PercentInput
          id={id}
          label={label}
          defaultValue={Number.isNaN(Number(value)) ? undefined : Number(value)}
          additionalValidation={filteredValidation}
          disabled={disable}
          onEdit={onEdit}
          formatInput={formatInput}
        />
      );

    case "rangeNumber": {
      const low =
        value && typeof value === "object" && "low" in value
          ? value.low
          : undefined;
      const high =
        value && typeof value === "object" && "high" in value
          ? value.high
          : undefined;

      return (
        <RangeNumberInput
          id={id}
          label={label}
          defaultLow={low}
          defaultHigh={high}
          additionalValidation={filteredValidation}
          disabled={disable}
          onEdit={onEdit}
          formatInput={formatInput}
        />
      );
    }

    case "regionList":
      return (
        <RegionListInput
          id={id}
          label={label}
          defaultValue={Array.isArray(value) ? (value as Region[]) : undefined}
          disabled={disable}
          onEdit={onEdit}
          formatInput={formatInput}
          proteinLength={proteinLength}
        />
      );

    case "rangePercent": {
      const low =
        value && typeof value === "object" && "low" in value
          ? value.low
          : undefined;
      const high =
        value && typeof value === "object" && "high" in value
          ? value.high
          : undefined;

      return (
        <RangePercentInput
          id={id}
          label={label}
          defaultLow={low}
          defaultHigh={high}
          additionalValidation={filteredValidation}
          disabled={disable}
          onEdit={onEdit}
        />
      );
    }

    case "multiNumberDropdown":
      return (
        <MultiNumberDropdown
          id={id}
          label={label}
          defaultValue={
            Array.isArray(value)
              ? value.map((item) => (item !== null ? Number(item) : 0))
              : []
          }
          options={
            options?.map((item) => (item !== null ? Number(item) : 0)) || []
          }
          additionalValidation={filteredValidation}
          disabled={disable}
          onEdit={onEdit}
          formatInput={formatInput}
        />
      );
  }
}
