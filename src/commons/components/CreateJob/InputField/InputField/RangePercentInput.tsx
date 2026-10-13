import { ValidationProps } from "../../../Input/InputPropsType";
import { useFormContext } from "react-hook-form";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { useEffect, useState } from "react";

export type RangePercentInputProps = {
  id: string;
  label: string;
  defaultLow?: number;
  defaultHigh?: number;
  className?: string;
  disabled?: boolean;
  additionalValidation?: Record<string, ValidationProps>;
  onEdit?: boolean;
};

export default function RangePercentInput({
  id,
  label,
  defaultLow = undefined,
  defaultHigh = undefined,
  className,
  disabled,
  additionalValidation,
  onEdit = true,
}: RangePercentInputProps) {
  const {
    register,
    watch,
    formState: { errors },
    setValue,
    getValues,
  } = useFormContext();

  const currentValueLow = watch(`${id}_low`) ?? defaultLow ?? undefined;
  const currentValueHigh = watch(`${id}_high`) ?? defaultHigh ?? undefined;

  useEffect(() => {
    setValue(`${id}_low`, watch(`${id}_low`) || defaultLow || undefined, {
      shouldValidate: true,
    });
    setValue(`${id}_high`, watch(`${id}_high`) || defaultHigh || undefined, {
      shouldValidate: true,
    });
  }, [defaultLow, defaultHigh, id, setValue]);

  // Local state for formatted values
  const [localLow, setLocalLow] = useState<string>(
    currentValueLow ? `${currentValueLow.toFixed(2)}%` : "",
  );
  const [localHigh, setLocalHigh] = useState<string>(
    currentValueHigh ? `${currentValueHigh.toFixed(2)}%` : "",
  );

  // format value
  const formatValue = (field: string, input: string): string => {
    let numericValue = parseFloat(input.replace("%", "")) || undefined;

    if (!numericValue) {
      numericValue = (field === "low" ? defaultLow : defaultHigh) ?? undefined;
    }
    if (numericValue && numericValue > 100) numericValue = 100;

    return numericValue ? `${numericValue.toFixed(2)}%` : "";
  };

  // handle change from typing
  const handleInputChange = (
    field: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const cursorPosition = e.target.selectionStart
      ? e.target.selectionStart + 1
      : 0;
    let inputValue = e.target.value.replace("%", "").replace(/[^0-9.]/g, "");

    if (
      inputValue.length >= 3 &&
      inputValue.length <= 4 &&
      !inputValue.includes(".")
    ) {
      inputValue = inputValue.slice(0, 2) + "." + inputValue.slice(2, 3);
    } else if (inputValue.length === 5) {
      if (inputValue.indexOf(".") === 1)
        inputValue =
          inputValue.slice(0, 1) +
          inputValue.slice(2, 3) +
          "." +
          inputValue.slice(3, 5);
    } else if (inputValue.length >= 6) {
      if (
        inputValue === "10.000" ||
        inputValue === "100.00" ||
        inputValue === "100.000"
      )
        inputValue = "100.00";
      else {
        inputValue = inputValue.slice(0, 2) + "." + inputValue.slice(3, 5);
      }
    }

    if (field === `${id}_low`) {
      setLocalLow(inputValue === "" ? "" : `${inputValue}%`);
    } else {
      setLocalHigh(inputValue === "" ? "" : `${inputValue}%`);
    }

    const updatedCursorPosition = Math.min(cursorPosition, inputValue.length);
    requestAnimationFrame(() => {
      e.target.setSelectionRange(updatedCursorPosition, updatedCursorPosition);
    });
  };

  const handleBlur = (field: string) => {
    const value = field === `${id}_low` ? localLow : localHigh;
    const numericValue = parseFloat(value.replace("%", ""));
    const formattedValue = formatValue(field, value);

    if (field === `${id}_low`) {
      setLocalLow(formattedValue);
      setValue(field, isNaN(numericValue) ? defaultLow : numericValue, {
        shouldValidate: true,
      });
    } else {
      setLocalHigh(formattedValue);
      setValue(field, isNaN(numericValue) ? defaultHigh : numericValue, {
        shouldValidate: true,
      });
    }
  };

  const handleKeyDown = (
    field: string,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      const value = field === `${id}_low` ? localLow : localHigh;
      const numericValue = parseFloat(value.replace("%", ""));
      const formattedValue = formatValue(field, value);

      if (field === `${id}_low`) {
        setLocalLow(formattedValue);
        setValue(field, isNaN(numericValue) ? defaultLow : numericValue, {
          shouldValidate: true,
        });
      } else {
        setLocalHigh(formattedValue);
        setValue(field, isNaN(numericValue) ? defaultHigh : numericValue, {
          shouldValidate: true,
        });
      }
    }
  };

  const handleIncrease = (field: string) => {
    const numericValue = parseFloat(getValues(field)) || 0;
    const newValue = Math.min(100, numericValue + 1);

    if (field === `${id}_low`) {
      setLocalLow(`${newValue.toFixed(2)}%`);
    } else {
      setLocalHigh(`${newValue.toFixed(2)}%`);
    }
    setValue(field, newValue, { shouldValidate: true });
  };

  const handleDecrease = (field: string) => {
    const numericValue = parseFloat(getValues(field)) || 0;
    const newValue = Math.max(0, numericValue - 1);

    if (field === `${id}_low`) {
      setLocalLow(`${newValue.toFixed(2)}%`);
    } else {
      setLocalHigh(`${newValue.toFixed(2)}%`);
    }
    setValue(field, newValue, { shouldValidate: true });
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
                value={localLow}
                onKeyDown={(e) => handleKeyDown(`${id}_low`, e)}
                {...register(`${id}_low`, {
                  ...(additionalValidation || {}),
                  onChange: (e) => {
                    handleInputChange(`${id}_low`, e);
                  },
                  valueAsNumber: true,
                  onBlur: () => handleBlur(`${id}_low`),
                })}
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
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1">
                {/* Increase button */}
                <Icon
                  icon="mingcute:up-line"
                  className="text-pep-dark-gray size-[15px] hover:text-pep-gray cursor-pointer"
                  onClick={() => handleIncrease(`${id}_low`)}
                />
                {/* Decrease button */}
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
                value={localHigh}
                onKeyDown={(e) => handleKeyDown(`${id}_high`, e)}
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
                  onChange: (e) => {
                    handleInputChange(`${id}_high`, e);
                  },
                  valueAsNumber: true,
                  onBlur: () => handleBlur(`${id}_high`),
                })}
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
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1">
                {/* Increase button */}
                <Icon
                  icon="mingcute:up-line"
                  className="text-pep-dark-gray size-[15px] hover:text-pep-gray cursor-pointer"
                  onClick={() => handleIncrease(`${id}_high`)}
                />
                {/* Decrease button */}
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
