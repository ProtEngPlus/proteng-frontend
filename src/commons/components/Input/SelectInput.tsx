import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useFormContext } from "react-hook-form";
import clsx from "clsx";
import { ValidationProps } from "./InputPropsType";

export type Option = {
  label: string;
  value: string;
};

export type SelectInputProps = {
  id: string;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  disabled?: boolean;
  additionalValidation?: Record<string, ValidationProps>;
  options: Option[];
  onEdit?: boolean;
  formatInput?: number;
};

export default function SelectInput({
  id,
  placeholder,
  defaultValue,
  className,
  disabled = false,
  additionalValidation,
  options,
  onEdit = true,
  formatInput = 1,
}: SelectInputProps) {
  const {
    register,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useFormContext();

  const [isOpen, setIsOpen] = useState(false);
  const currentValue = watch(id) ?? defaultValue;

  const handleOptionClick = (optionValue: string) => {
    setValue(id, optionValue);
    clearErrors(id);
    setIsOpen(false);
  };

  // set value at beginning
  useEffect(() => {
    if (currentValue) {
      setValue(id, currentValue);
    } else if (defaultValue) {
      setValue(id, defaultValue);
    } else if (!placeholder && options.length > 0) {
      setValue(id, options[0].value);
    }
  }, []);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".custom-select")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`
      ${formatInput === 2 ? "w-24 text-start" : "w-full"}
       relative custom-select mb-5`}
    >
      {!onEdit ? (
        <div>{currentValue}</div>
      ) : (
        <div id={id}>
          <div
            id={id}
            className={clsx(
              "flex flex-row bg-white border font-light rounded-md py-3 px-4 cursor-pointer gap-1 disabled:cursor-not-allowed disabled:bg-disabled disabled:border-disabled disabled:text-label",
              {
                "border-error": !!errors[id],
                "border-pep-gray-border": !errors[id],
                "border-pep-blue": isOpen,
                "!cursor-not-allowed !bg-disabled !border-disabled !text-label":
                  disabled,
                "h-10 pt-1.5 pr-1.5": formatInput === 2,
              },
              className,
            )}
            onClick={() => !disabled && setIsOpen((prev) => !prev)}
          >
            <div
              className={`grow ${
                disabled
                  ? "text-label"
                  : options.find((option) => option.value === currentValue)
                    ? "text-black"
                    : "text-placeholder"
              }`}
            >
              {options.find((option) => option.value === currentValue)?.label ||
                placeholder}
            </div>
            <Icon
              data-testid={`${id}-dropdown`}
              icon="quill:chevron-down"
              className={`text-pep-dark-gray size-4 my-auto ${
                disabled ? "text-gray-400" : "text-pep-dark-gray"
              }`}
            />
          </div>

          {isOpen && !disabled && (
            <ul
              data-testid={`${id}-list`}
              className={clsx(
                "mt-2 absolute w-full bg-white rounded-md shadow-dropShadow z-10 py-2",
                className,
              )}
            >
              {options.map((option) => (
                <li
                  key={option.value}
                  className={clsx(
                    "px-5 py-2 font-light text-label hover:text-pep-blue hover:bg-blue-50 focus:bg-blue-100 cursor-pointer",
                    className,
                  )}
                  onClick={() => handleOptionClick(option.value)}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}

          <input
            type="hidden"
            {...register(id, { ...(additionalValidation || {}) })}
            value={currentValue || ""}
          />

          {typeof errors[id]?.message === "string" && (
            <span className="absolute left-0 top-full mt-1 whitespace-nowrap font-light text-error text-xs">
              {errors[id]?.message}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
