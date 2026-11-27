import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import clsx from "clsx";

export type EvaluationDropdownOption = {
  label: string;
  value: string;
};

interface Props {
  id: string;
  labelId?: string;
  options: EvaluationDropdownOption[];
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onSelect: (value: string) => void;
}

export default function EvaluationDropdown({
  id,
  labelId,
  options,
  value,
  placeholder = "",
  disabled = false,
  className,
  onSelect,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  const choose = (optionValue: string) => {
    onSelect(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={clsx("relative w-[336px] max-w-full", className)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setIsOpen(false);
      }}
    >
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={labelId ? `${labelId} ${id}` : undefined}
        disabled={disabled}
        className={clsx(
          "flex w-full flex-row items-center gap-1 rounded-md border bg-white px-4 py-3 text-start font-light",
          {
            "border-pep-blue": isOpen,
            "border-pep-gray-border": !isOpen,
            "cursor-pointer": !disabled,
            "!cursor-not-allowed !bg-disabled !border-disabled !text-label":
              disabled,
          },
        )}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span
          className={`grow ${
            disabled
              ? "text-label"
              : current
                ? "text-black"
                : "text-placeholder"
          }`}
        >
          {current?.label ?? placeholder}
        </span>
        <Icon
          icon="quill:chevron-down"
          className={`size-4 my-auto ${
            disabled ? "text-gray-400" : "text-pep-dark-gray"
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <ul
          role="listbox"
          aria-labelledby={labelId}
          className="mt-2 absolute w-full bg-white rounded-md shadow-dropShadow z-10 py-2"
        >
          {options.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              tabIndex={0}
              className="px-5 py-2 font-light text-label hover:text-pep-blue hover:bg-blue-50 focus:bg-blue-100 cursor-pointer"
              onClick={() => choose(option.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  choose(option.value);
                }
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
