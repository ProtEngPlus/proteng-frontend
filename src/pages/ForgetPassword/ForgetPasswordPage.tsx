import logoWithText from "../../assets/images/LogoWithText/logoWithText.svg";
import TextInput from "../../commons/components/Input/TextInput";
import Button from "../../commons/components/Button/Button";
import { useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { Icon } from "@iconify/react/dist/iconify.js";
import { forgotPassword } from "../../commons/api/auth";
import { normalizeEmail } from "../../commons/utils/normalizeEmail";

type FormValues = {
  email: string;
};

export default function ForgetPasswordPage() {
  const form = useForm<FormValues>();
  const { handleSubmit } = form;
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await forgotPassword(normalizeEmail(data.email));
      navigate("/sign-in");
    } catch (error: unknown) {
      console.error(error);
    }
  });

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-[28%] min-w-fit h-auto py-6 px-4 m-auto bg-white rounded-xl shadow-dropShadow">
        <div className="flex justify-center items-center mb-10 relative">
          <Icon
            icon="weui:arrow-outlined"
            className="text-gray-500 w-[0.9rem] h-[1.8rem] absolute left-0 top-[-0.75rem] hover:cursor-pointer"
            style={{ transform: "scaleX(-1)" }}
            onClick={() => navigate("/sign-in")}
          />
          <img src={logoWithText} alt="logo-with-text" className="mx-auto" />
        </div>
        <div className="leading-6 mb-9 text-center">
          <h1>Forget Password ?</h1>
          <label className="font-light">Enter your registered email</label>
        </div>
        <FormProvider {...form}>
          <form
            onSubmit={onSubmit}
            id="forget-password-form"
            className="space-y-5"
            noValidate
          >
            <TextInput
              id="email"
              placeholder="Email"
              autoLowercase
              additionalValidation={{
                required: { value: true },
                pattern: {
                  value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Incorrect email format.",
                },
              }}
            />
            <Button
              id="reset-password"
              buttonType="submit"
              type="submit"
              text="Reset Password"
              className="w-full"
            />
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
