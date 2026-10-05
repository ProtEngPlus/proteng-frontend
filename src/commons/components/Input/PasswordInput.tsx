import { useState } from "react";
import { useFormContext } from "react-hook-form";
import clsx from "clsx";
import { InputProps } from "./InputPropsType";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function PasswordInput({
  id,
  placeholder,
  className,
  disabled,
  additionalValidation,
  hint,
}: InputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          type={isPasswordVisible ? "text" : "password"}
          className={clsx(
            "h-[50px] w-full pl-3 pr-[60px] bg-white border font-light placeholder:text-placeholder rounded-md focus:border-pep-blue focus:outline-none disabled:cursor-not-allowed disabled:bg-disabled disabled:border-disabled disabled:text-label",
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

        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-3 flex items-center z-20 cursor-pointer text-gray-400"
        >
          {isPasswordVisible ? (
            <Icon icon="carbon:view" className="size-6" />
          ) : (
            <Icon icon="carbon:view-off" className="size-6" />
          )}
        </button>
      </div>

      {errors[id]?.message ? (
        <span className="font-light text-error text-xs">
          {errors[id]?.message as string}
        </span>
      ) : (
        hint && <span className="font-light text-label text-xs">{hint}</span>
      )}
    </div>
  );
}
