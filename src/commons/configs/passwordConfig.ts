export const passwordMinLength = 8;

export const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export const passwordPolicyHint =
  "At least 8 characters, with uppercase, lowercase, and a number.";

export const passwordPolicyValidation = {
  minLength: {
    value: passwordMinLength,
    message: `Password must be at least ${passwordMinLength} characters.`,
  },
  pattern: {
    value: passwordPattern,
    message: "Password must include uppercase, lowercase, and a number.",
  },
};
