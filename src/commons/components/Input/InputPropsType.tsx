export type ValidationProps =
  | {
      value: string | number | RegExp | boolean;
      message?: string;
    }
  | ((arg0: string) => boolean | string);

type InputProps = {
  id: string;
  placeholder: string;
  className?: string;
  disabled?: boolean;
  additionalValidation?: Record<string, ValidationProps>;
  hint?: string;
};

export type { InputProps };
