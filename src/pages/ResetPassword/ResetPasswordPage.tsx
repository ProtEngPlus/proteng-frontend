import logoWithText from "../../assets/images/LogoWithText/logoWithText.svg";
import PasswordInput from "../../commons/components/Input/PasswordInput";
import Button from "../../commons/components/Button/Button";
import { Navigate, useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { checkResetToken, resetPassword } from "../../commons/api/auth";
import {
  passwordPolicyHint,
  passwordPolicyValidation,
} from "../../commons/configs/passwordConfig";
import { useEffect, useState } from "react";
import axios from "axios";

type FormValues = {
  new_password: string;
  confirm_new_password: string;
};

export default function ResetPasswordPage() {
  const form = useForm<FormValues>();
  const {
    handleSubmit,
    watch,
    setError,
    formState: { isSubmitting },
  } = form;
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const [tokenStatus, setTokenStatus] = useState<
    "loading" | "valid" | "invalid"
  >("loading");

  useEffect(() => {
    if (!token) return;
    checkResetToken(token)
      .then(() => setTokenStatus("valid"))
      .catch((error: unknown) => {
        const isInvalid =
          axios.isAxiosError(error) && error.response?.status === 400;
        setTokenStatus(isInvalid ? "invalid" : "valid");
      });
  }, [token]);

  if (!token) {
    return <Navigate to="/forget-password" replace />;
  }

  if (tokenStatus === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="font-light text-gray-500 text-lg">
          Checking your reset link…
        </p>
      </div>
    );
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      await resetPassword(data.new_password, token!);
      navigate("/sign-in");
    } catch (error: unknown) {
      console.error(error);
      setError("new_password", {
        type: "manual",
        message:
          "This reset link is invalid or has expired. Please request a new one.",
      });
    }
  });

  if (tokenStatus === "invalid") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-[36%] min-w-[440px] h-auto py-10 px-8 m-auto bg-white rounded-xl shadow-dropShadow">
          <img
            src={logoWithText}
            alt="logo-with-text"
            className="mb-10 mx-auto"
          />
          <h1 className="text-center mb-4">Reset Link Unavailable</h1>
          <p className="text-center font-light text-gray-500 mb-9">
            This reset link is invalid or has expired. Please request a new one.
          </p>
          <Button
            id="request-new-reset-link"
            buttonType="submit"
            text="Request a New Link"
            className="w-full"
            onClick={() => navigate("/forget-password")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-[36%] min-w-[440px] h-auto py-10 px-8 m-auto bg-white rounded-xl shadow-dropShadow">
        <img
          src={logoWithText}
          alt="logo-with-text"
          className="mb-10 mx-auto"
        />
        <h1 className="text-center mb-9">Reset Your Password</h1>
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
              hint={passwordPolicyHint}
              additionalValidation={{
                required: { value: true, message: "New Password is required." },
                ...passwordPolicyValidation,
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
              buttonType="submit"
              type="submit"
              text={isSubmitting ? "Please wait..." : "Reset Password"}
              className="w-full"
              disabled={isSubmitting}
            />
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
