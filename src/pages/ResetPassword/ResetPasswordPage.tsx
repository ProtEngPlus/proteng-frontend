import logoWithText from "../../assets/images/LogoWithText/logoWithText.svg";
import PasswordInput from "../../commons/components/Input/PasswordInput";
import Button from "../../commons/components/Button/Button";
import { useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { resetPassword } from "../../commons/api/auth";

type FormValues = {
  new_password: string;
  confirm_new_password: string;
};

export default function ResetPasswordPage() {
  const form = useForm<FormValues>();
  const { handleSubmit, watch } = form;
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const onSubmit = handleSubmit(async (data) => {
    try {
      await resetPassword(data.new_password, token!);
      navigate("/sign-in");
    } catch (error: unknown) {
      console.error(error);
    }
  });

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-[28%] min-w-fit h-auto py-6 px-4 m-auto bg-white rounded-xl shadow-dropShadow">
        <img
          src={logoWithText}
          alt="logo-with-text"
          className="mb-10 mx-auto"
        />
        <h1 className="text-center mb-9">Reset Your Password ?</h1>
        <FormProvider {...form}>
          <form
            onSubmit={onSubmit}
            id="reset-password-form"
            className="space-y-5"
            noValidate
          >
            <PasswordInput
              id="new_password"
              placeholder="New Password"
              additionalValidation={{
                required: { value: true, message: "New Password is required." },
                validate: (value: string) =>
                  value === watch("confirm_new_password"),
              }}
            />

            <PasswordInput
              id="confirm_new_password"
              placeholder="Confirm New Password"
              additionalValidation={{
                required: {
                  value: true,
                  message: "Confirm New Password is required.",
                },
                validate: (value: string) =>
                  value === watch("new_password") || "Password do not match!",
              }}
            />
            <Button
              id="reset-password"
              type="submit"
              buttonType="submit"
              text="Reset Password"
              className="w-full"
              onClick={onSubmit}
            />
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
