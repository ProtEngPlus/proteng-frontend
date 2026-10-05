import logoWithText from "../../assets/images/LogoWithText/logoWithText.svg";
import TextInput from "../../commons/components/Input/TextInput";
import PasswordInput from "../../commons/components/Input/PasswordInput";
import Button from "../../commons/components/Button/Button";
import { useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { useAuth } from "../../commons/hooks/useAuth";
import { sendVerification } from "../../commons/api/auth";
import { ENVIRONMENT } from "../../commons/configs/envConfig";
import axios from "axios";
import { normalizeEmail } from "../../commons/utils/normalizeEmail";

type FormValues = {
  email: string;
  password: string;
};

export default function SignInPage() {
  const form = useForm<FormValues>();
  const { login } = useAuth();
  const { handleSubmit, setError } = form;
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    const email = normalizeEmail(data.email);
    try {
      await login(email, data.password, "user");
      navigate("/dashboard");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const { message } = error.response.data;

        if (message === "error: email not verified") {
          await sendVerification(email);
          navigate("/sent-verification-email", {
            state: { email },
          });
        } else if (message === "error: invalid email or password") {
          setError("email", {
            type: "manual",
          });
          setError("password", {
            type: "manual",
            message: "The email or password is incorrect",
          });
        } else {
          console.error(message);
        }
      } else {
        console.error(error);
      }
    }
  });

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-[28%] min-w-fit h-auto py-6 px-4 m-auto bg-white rounded-xl shadow-dropShadow">
        <img src={logoWithText} alt="logo-with-text" className="mb-6 mx-auto" />
        <FormProvider {...form}>
          <form
            onSubmit={onSubmit}
            id="sign-in-form"
            className="space-y-5 mb-9"
            noValidate
          >
            <TextInput
              id="email"
              autoLowercase
              placeholder="Email"
              additionalValidation={{
                required: {
                  value: true,
                },
              }}
            />
            <PasswordInput
              id="password"
              placeholder="Password"
              additionalValidation={{
                required: {
                  value: true,
                },
              }}
            />

            <Button
              buttonType="submit"
              id="submit-button"
              text="Sign In"
              type="submit"
              className="w-full"
            />
          </form>
        </FormProvider>
        <div className="flex flex-col text-center">
          <a
            className="cursor-pointer"
            onClick={() => navigate("/forget-password")}
          >
            Forget Password?
          </a>
          <label className="font-light">
            Not a member yet?{" "}
            <a
              className="text-pep-orange font-normal cursor-pointer"
              onClick={() => navigate("/sign-up")}
            >
              Sign Up
            </a>
          </label>
        </div>

        {ENVIRONMENT !== "production" && (
          <p className="text-center pt-6 text-lg text-gray-400">
            Environment: {ENVIRONMENT}
          </p>
        )}
      </div>
    </div>
  );
}
