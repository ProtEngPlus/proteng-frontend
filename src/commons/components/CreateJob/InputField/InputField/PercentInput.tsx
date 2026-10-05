import { ValidationProps } from "../../../Input/InputPropsType";
import { NumberInputProps } from "./NumberInput";
import { useFormContext } from "react-hook-form";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

export type RangeNumberInputProps = {
  id: string;
  label: string;
  defaultValue: number;
  className?: string;
  disabled?: boolean;
  additionalValidation?: Record<string, ValidationProps>;
  onEdit?: boolean;
  formatInput?: number;
};

export default function PercentInput({
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

  const currentValue = (() => {
    const watchedValue = parseFloat(watch(id)) ?? defaultValue;
    if (!isNaN(watchedValue)) return watchedValue;
    return defaultValue ?? 0;
  })();

  const [localValue, setLocalValue] = useState<string>(
    `${currentValue.toFixed(2)}%`,
  );

  // format value
  const formatValue = (input: string): string => {
    let numericValue = parseFloat(input.replace("%", ""));
    if (isNaN(numericValue)) numericValue = defaultValue || 0;
    if (numericValue > 100) numericValue = 100;
    return `${numericValue.toFixed(2)}%`;
  };

  // handle change from typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setLocalValue(inputValue === "" ? "" : `${inputValue}%`);
    const updatedCursorPosition = Math.min(cursorPosition, inputValue.length);
    requestAnimationFrame(() => {
      e.target.setSelectionRange(updatedCursorPosition, updatedCursorPosition);
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    const numericValue = parseFloat(value.replace("%", ""));
    const formattedValue = formatValue(value);

    setLocalValue(formattedValue);
    setValue(id, isNaN(numericValue) ? defaultValue : numericValue, {
      shouldValidate: true,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const numericValue = parseFloat(localValue.replace("%", ""));
      const formattedValue = formatValue(localValue);

      setLocalValue(formattedValue);
      setValue(id, isNaN(numericValue) ? defaultValue : numericValue, {
        shouldValidate: true,
      });
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(localValue.replace("%", "")) || 0;
    const newValue = Math.min(100, numericValue + 1);

    setLocalValue(`${newValue.toFixed(2)}%`);
    setValue(id, newValue, { shouldValidate: true });
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(localValue.replace("%", "")) || 0;
    const newValue = Math.max(0, numericValue - 1);

    setLocalValue(`${newValue.toFixed(2)}%`);
    setValue(id, newValue, { shouldValidate: true });
  };

  return (
    <div
      className={`
        ${
          formatInput === 1
            ? "grid grid-cols-2 w-[22%] place-items-start"
            : formatInput === 2
              ? "flex flex-row justify-between max-w-[1000px]"
              : "grid grid-cols-[1fr,4fr] max-w-[1000px]"
        }
         min-w-fit space-x-3 items-start`}
    >
      <label className="font-light">
        {label}
        {typeof additionalValidation?.required === "object" &&
          additionalValidation.required.value && (
            <span className="text-red-500">*</span>
          )}
        :
      </label>
      {!onEdit ? (
        <div className="w-24 text-start">{localValue}</div>
      ) : (
        <div className="w-fit min-w-fit">
          <div className="relative w-fit min-w-fit mb-5">
            <input
              id={id}
              type="text"
              value={localValue}
              onKeyDown={handleKeyDown}
              {...register(id, {
                ...(additionalValidation || {}),
                onChange: (e) => {
                  handleInputChange(e);
                },
                valueAsNumber: true,
                onBlur: handleBlur,
              })}
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
  );
}
