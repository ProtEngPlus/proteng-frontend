import { ValidationProps } from "../../../Input/InputPropsType";
import { useFormContext } from "react-hook-form";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { useEffect } from "react";

export type NumberInputProps = {
  id: string;
  label: string;
  defaultValue?: number;
  className?: string;
  disabled?: boolean;
  additionalValidation?: Record<string, ValidationProps>;
  onEdit?: boolean;
  formatInput?: number;
};

export default function NumberInput({
  id,
  label,
  defaultValue,
  className,
  disabled,
  additionalValidation,
  onEdit = true,
  formatInput = 2,
}: NumberInputProps) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  useEffect(() => {
    setValue(id, currentValue, { shouldValidate: true });
  }, []);

  const currentValue = Number(watch(id)) || defaultValue || 0;

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    setValue(id, Number(currentValue) + 1, { shouldValidate: true });
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    setValue(id, Math.max(0, Number(currentValue) - 1), {
      shouldValidate: true,
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();

    if (raw === "" || isNaN(Number(raw))) {
      setValue(id, defaultValue || 0, { shouldValidate: true });
    } else {
      setValue(id, Number(parseFloat(raw)), { shouldValidate: true });
    }
  };

  return (
    <div
      className={`
          ${
            formatInput === 1
              ? "grid grid-cols-2 w-[22%] place-items-start"
              : formatInput === 2
                ? "flex flex-row justify-between max-w-[1000px]"
                : formatInput === 3
                  ? "grid grid-cols-[1fr,4fr] max-w-[1000px]"
                  : "grid grid-cols-[1fr,2fr] max-w-[1000px]"
          }
         min-w-fit space-x-3 items-start`}
    >
      <label className="font-light ">
        {label}
        {typeof additionalValidation?.required === "object" &&
          additionalValidation.required.value && (
            <span className="text-red-500">*</span>
          )}
        :
      </label>
      <div className="w-fit min-w-fit">
        {!onEdit ? (
          <div className="w-24 text-start">{currentValue}</div>
        ) : (
          <div>
            <div className="relative w-fit min-w-fit mb-5">
              <input
                id={id}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                defaultValue={defaultValue}
                {...register(id, {
                  ...(additionalValidation || {}),
                  onBlur: handleBlur,
                })}
                onKeyDown={(e) => {
                  const allowedKeys = [
                    "Backspace",
                    "Tab",
                    "ArrowLeft",
                    "ArrowRight",
                    "Delete",
                    "Home",
                    "End",
                  ];

                  // Allow digits, control keys
                  if (/[0-9]/.test(e.key) || allowedKeys.includes(e.key)) {
                    return;
                  }

                  // Allow only one dot
                  const value = e.currentTarget.value;
                  if (e.key === "." && !value.includes(".")) {
                    return;
                  }

                  // Block all other keys
                  e.preventDefault();
                }}
                className={clsx(
                  "h-[40px] w-24 p-2 bg-white border text-sm border-pep-gray-border font-light placeholder:text-placeholder rounded-md focus:ring-0 focus:border-pep-blue focus:outline-none disabled:cursor-not-allowed disabled:bg-disabled disabled:border-disabled disabled:text-label",
                  {
                    "border-error": !!errors[id],
                    "border-gray-border": !errors[id],
                  },
                  className,
                )}
                disabled={disabled}
                autoComplete="off"
                aria-label={`Percentage input for ${id}`}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1">
                {/* Increase button */}
                <Icon
                  icon="mingcute:up-line"
                  className="text-pep-dark-gray size-[15px] hover:text-pep-gray cursor-pointer"
                  onClick={handleIncrease}
                />
                {/* Decrease button */}
                <Icon
                  icon="mingcute:down-line"
                  className="text-pep-dark-gray size-[15px] hover:text-pep-gray cursor-pointer"
                  onClick={handleDecrease}
                />
              </div>

              {errors[id]?.message && (
                <span className="absolute left-0 top-full mt-1 whitespace-nowrap font-light text-error text-xs">
                  {errors[id]?.message as string}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
