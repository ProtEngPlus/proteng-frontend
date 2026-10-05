import { useState, useEffect, useCallback } from "react";
import { ValidationProps } from "../../../Input/InputPropsType";
import { useFormContext } from "react-hook-form";
import { Icon } from "@iconify/react/dist/iconify.js";

export type DropdownProps = {
  id: string;
  label: string;
  defaultValue?: number[];
  options: number[];
  disabled?: boolean;
  additionalValidation?: Record<string, ValidationProps>;
  onEdit?: boolean;
  onChange?: (selected: number[]) => void;
  formatInput?: number;
};

export default function MultiNumberDropdown({
  id,
  label,
  defaultValue = [],
  options,
  disabled = false,
  additionalValidation,
  onEdit = true,
  onChange,
}: DropdownProps) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  useEffect(() => {
    setValue(id, currentValue, { shouldValidate: true });
  }, []);

  const currentValue: number[] = Array.isArray(watch(id))
    ? watch(id)
    : defaultValue;

  const [isOpen, setIsOpen] = useState(false);

  const toggleSelection = useCallback(
    (value: number) => {
      const updated = currentValue.includes(value)
        ? currentValue.filter((item) => item !== value)
        : [...currentValue, value];

      setValue(id, updated, { shouldValidate: true });
      onChange?.(updated);
    },
    [currentValue, id, onChange, setValue],
  );

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
      className={`min-w-fit justify-between items-start space-x-3 grid grid-cols-[1fr,4fr] max-w-[1000px]`}
    >
      <label className="font-light">
        {label}
        {typeof additionalValidation?.required === "object" &&
          additionalValidation.required.value && (
            <span className="text-red-500">*</span>
          )}
        :
      </label>
      <div className="relative custom-select w-[336px] mb-5">
        {!onEdit ? (
          <div>{currentValue.join(", ")}</div>
        ) : (
          <div>
            <div>
              <div
                className={`flex flex-row bg-white border font-light rounded-md py-3 px-4 cursor-pointer gap-1 disabled:cursor-not-allowed disabled:bg-disabled disabled:border-disabled disabled:text-label
                 ${errors[id] ? "border-error" : "border-pep-gray-border"} ${
                   isOpen ? "border-pep-blue" : ""
                 } ${
                   disabled
                     ? "!cursor-not-allowed !bg-disabled !border-disabled !text-label"
                     : ""
                 }`}
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
              >
                <div
                  className={`grow ${disabled ? "text-label" : "text-black"}`}
                >
                  {currentValue
                    .slice()
                    .sort((a, b) => options.indexOf(a) - options.indexOf(b))
                    .join(", ")}
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
                <ul className="mt-2 absolute w-full bg-white rounded-md shadow-dropShadow z-10 py-2 space-y-1 text-sm text-placeholder">
                  {options.map((option) => (
                    <li
                      key={option}
                      className="px-5 py-2 space-x-4 text-label hover:text-pep-blue hover:bg-blue-50 focus:bg-blue-100 cursor-pointer"
                      onClick={() => toggleSelection(option)}
                    >
                      <input
                        type="checkbox"
                        checked={currentValue.includes(option)}
                        readOnly
                        className="size-5 checked:bg-selected border border-[#DFE4EA] rounded cursor-pointer"
                      />
                      <label
                        className={`font-normal w-full text-sm cursor-pointer ${
                          currentValue.includes(option)
                            ? "text-selected"
                            : "text-pep-dark-gray"
                        }`}
                      >
                        {option}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <input
              type="hidden"
              {...register(id, { ...(additionalValidation || {}) })}
              value={JSON.stringify(currentValue)}
            />

            {typeof errors[id]?.message === "string" && (
              <span className="absolute left-0 top-full mt-1 whitespace-nowrap font-light text-error text-xs">
                {errors[id]?.message}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
