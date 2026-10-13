import { useFormContext } from "react-hook-form";
import TextInput from "../../../../commons/components/Input/TextInput";
import SelectInput from "../../../../commons/components/Input/SelectInput";
import { userRoleMapper } from "../../../../commons/interfaces/User.interface";

interface PersonalProps {
  label: string;
  id: string;
  placeholder: string;
  type: string;
}

const userRoleOptions = Object.entries(userRoleMapper).map(([key, value]) => ({
  label: value,
  value: key,
}));

export default function PersonalField({
  label,
  id,
  placeholder,
  type,
}: PersonalProps) {
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <div className="flex flex-row items-center space-x-3">
      <div className="flex flex-row gap-x-3 items-center">
        {errors[id] && <span className="text-red-500">*</span>}
        <label className="w-[5.5rem] font-light text-base">{label}:</label>
      </div>
      <div className="grow">
        {type === "text" && (
          <TextInput
            id={id}
            placeholder={placeholder}
            additionalValidation={{
              required: {
                value: true,
                message: `${label} is required.`,
              },
            }}
          />
        )}
        {type === "select" && (
          <SelectInput
            id={id}
            placeholder={placeholder}
            options={userRoleOptions}
            additionalValidation={{
              required: {
                value: true,
                message: `${label} is required.`,
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
