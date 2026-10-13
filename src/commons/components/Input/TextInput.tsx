import { useFormContext } from "react-hook-form";
import clsx from "clsx";
import { ValidationProps } from "./InputPropsType";

export type TextProps = {
  id: string;
  placeholder: string;
  className?: string;
  disabled?: boolean;
  autoLowercase?: boolean;
  additionalValidation?: Record<string, ValidationProps>;
  onEdit?: boolean;
};

export default function TextInput({
  id,
  placeholder,
  className,
  disabled,
  additionalValidation,
  autoLowercase = false,
  onEdit = true,
}: TextProps) {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  const currentValue = watch(id);
  const registration = register(id, { ...additionalValidation });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (autoLowercase) {
      const el = e.target;
      const lowered = el.value.toLowerCase();
      if (lowered !== el.value) {
        const pos = el.selectionStart;
        el.value = lowered;
        el.setSelectionRange(pos, pos);
      }
    }
    return registration.onChange(e);
  };

  return (
    <div>
      {!onEdit ? (
        <div>{currentValue}</div>
      ) : (
        <div>
          <input
            id={id}
            placeholder={placeholder}
            className={clsx(
              "h-[50px] w-full p-3 bg-white border font-light placeholder:text-placeholder rounded-md focus:border-pep-blue focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:border-gray-100 disabled:text-label",
              {
                "border-error": !!errors[id],
                "border-gray-border": !errors[id],
              },
              className,
            )}
            disabled={disabled}
            {...registration}
            onChange={handleChange}
            autoComplete="off"
          />
          {errors[id]?.message && (
            <span className="font-light text-error text-xs">
              {errors[id]?.message as string}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
