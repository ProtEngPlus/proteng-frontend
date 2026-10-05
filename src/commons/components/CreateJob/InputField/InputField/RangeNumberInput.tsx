import { ValidationProps } from "../../../Input/InputPropsType";
import { useFormContext } from "react-hook-form";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { useEffect } from "react";

export type RangeNumberInputProps = {
  id: string;
  label: string;
  defaultLow?: number;
  defaultHigh?: number;
  className?: string;
  disabled?: boolean;
  additionalValidation?: Record<string, ValidationProps>;
  onEdit?: boolean;
};

export default function RangeNumberInput({
  id,
  label,
  defaultLow = undefined,
  defaultHigh = undefined,
  className,
  disabled,
  additionalValidation,
  onEdit = true,
}: RangeNumberInputProps) {
  const {
    register,
    watch,
    formState: { errors },
    setValue,
    getValues,
  } = useFormContext();

  const currentValueLow = watch(`${id}_low`) ?? defaultLow;
  const currentValueHigh = watch(`${id}_high`) ?? defaultHigh;

  useEffect(() => {
    setValue(`${id}_low`, watch(`${id}_low`) || defaultLow || undefined, {
      shouldValidate: true,
    });
    setValue(`${id}_high`, watch(`${id}_high`) || defaultHigh || undefined, {
      shouldValidate: true,
    });
  }, [defaultLow, defaultHigh, id, setValue]);

  const handleIncrease = (field: string) => {
    const currentValue = parseFloat(getValues(field)) || 0;
    setValue(field, Number(currentValue + 1), { shouldValidate: true });
  };

  const handleDecrease = (field: string) => {
    const currentValue = parseFloat(getValues(field)) || 0;
    setValue(field, Math.max(0, currentValue - 1), { shouldValidate: true });
  };

  const handleBlur = (field: string, defaultValue: number | undefined) => {
    const currentValue = parseFloat(getValues(field));
    if (isNaN(currentValue)) {
      setValue(field, Number(defaultValue) || undefined, {
        shouldValidate: true,
      });
    }
  };

  return (
    <div className="w-full flex flex-nowrap text-nowrap">
      {!onEdit ? (
        <div className="w-full min-w-fit flex flex-row justify-between space-x-3 items-center">
          <label>{label}:</label>
          <div className="w-24 min-w-fit text-start">
            {currentValueLow} - {currentValueHigh}
          </div>
        </div>
      ) : (
        <div className="relative space-y-2 w-fit mb-5">
          <label className="font-light leading-loose">
            {label}
            {typeof additionalValidation?.required === "object" &&
              additionalValidation.required.value && (
                <span className="text-red-500">*</span>
              )}
          </label>
          <div className="flex gap-3 items-center">
            {/*----------------------------------- Min Input ------------------------------------------*/}

            <div className="relative w-fit min-w-fit">
              <input
                id={`${id}_low`}
                type="text"
                defaultValue={defaultLow ?? ""}
                {...register(`${id}_low`, {
                  ...(additionalValidation || {}),
                  valueAsNumber: true,
                  onBlur: () => handleBlur(`${id}_low`, defaultLow),
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
                    "border-error": !!errors[`${id}_low`],
                    "border-gray-border": !errors[`${id}_low`],
                  },
                  className,
                )}
                disabled={disabled}
                autoComplete="off"
                aria-label={`Minimum value for ${id}`}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1">
                <Icon
                  icon="mingcute:up-line"
                  className="text-pep-dark-gray size-[15px] hover:text-pep-gray cursor-pointer"
                  onClick={() => handleIncrease(`${id}_low`)}
                />
                <Icon
                  icon="mingcute:down-line"
                  className="text-pep-dark-gray size-[15px] hover:text-pep-gray cursor-pointer"
                  onClick={() => handleDecrease(`${id}_low`)}
                />
              </div>
            </div>

            <div className="text-pep-gray font-light text-sm">to</div>

            {/*----------------------------------- Max Input ------------------------------------------*/}
            <div className="relative w-fit min-w-fit">
              <input
                id={`${id}_high`}
                type="text"
                defaultValue={defaultHigh ?? ""}
                {...register(`${id}_high`, {
                  ...(additionalValidation || {}),
                  validate: (value: string) => {
                    const extra = additionalValidation?.validate;
                    if (typeof extra === "function") {
                      const result = extra(value);
                      if (result !== true) return result;
                    }
                    const min = parseFloat(watch(`${id}_low`)) || 0;
                    const max = parseFloat(value) || 0;
                    if (min > max) {
                      return "Max value should be greater than min value.";
                    }
                    return true;
                  },
                  valueAsNumber: true,
                  onBlur: () => handleBlur(`${id}_high`, defaultHigh),
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
                    "border-error": !!errors[`${id}_high`],
                    "border-gray-border": !errors[`${id}_high`],
                  },
                  className,
                )}
                disabled={disabled}
                autoComplete="off"
                aria-label={`Maximum value for ${id}`}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1">
                <Icon
                  icon="mingcute:up-line"
                  className="text-pep-dark-gray size-[15px] hover:text-pep-gray cursor-pointer"
                  onClick={() => handleIncrease(`${id}_high`)}
                />
                <Icon
                  icon="mingcute:down-line"
                  className="text-pep-dark-gray size-[15px] hover:text-pep-gray cursor-pointer"
                  onClick={() => handleDecrease(`${id}_high`)}
                />
              </div>
            </div>
          </div>

          {(errors[`${id}_low`]?.message || errors[`${id}_high`]?.message) && (
            <span className="absolute left-0 top-full mt-1 whitespace-nowrap font-light text-error text-xs">
              {
                (errors[`${id}_low`]?.message ||
                  errors[`${id}_high`]?.message) as string
              }
            </span>
          )}
        </div>
      )}
    </div>
  );
}
