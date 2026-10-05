import { useFormContext } from "react-hook-form";
import clsx from "clsx";
import { ValidationProps } from "../../../Input/InputPropsType";

export type TextareaProps = {
  id: string;
  maxLength?: number;
  placeholder: string;
  defaultValue?: string;
  className?: string;
  disabled?: boolean;
  additionalValidation?: Record<string, ValidationProps>;
  onEdit?: boolean;
};

export default function Textarea({
  id,
  maxLength,
  placeholder,
  className,
  disabled,
  additionalValidation,
  onEdit = true,
}: TextareaProps) {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();
  const textareaValue = watch(id) ?? "";
  return (
    <div>
      {!onEdit ? (
        <div>{textareaValue}</div>
      ) : (
        <div>
          <textarea
            id={id}
            placeholder={placeholder}
            className={clsx(
              "min-h-[188px] w-full p-3 bg-white border font-light placeholder:text-placeholder rounded-md focus:ring-0 focus:border-pep-blue focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:border-gray-100 disabled:text-label",
              {
                "border-error": !!errors[id],
                "border-pep-gray-border": !errors[id],
              },
              className,
            )}
            disabled={disabled}
            {...register(id, { ...additionalValidation })}
            autoComplete="off"
          />
          {errors[id]?.message && (
            <span className="block mt-1 font-light text-error text-xs">
              {errors[id]?.message as string}
            </span>
          )}
          <div className="w-full flex justify-end text-right ml-auto text-sm font-light">
            {maxLength && (
              <span className={`text-${errors[id] ? "error" : "black"}`}>
                {textareaValue.length}/{maxLength}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
