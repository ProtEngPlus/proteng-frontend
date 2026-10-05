import logo from "../../assets/images/SignUp/Logo.png";
import TextInput from "../../commons/components/Input/TextInput";
import PasswordInput from "../../commons/components/Input/PasswordInput";
import PersonalField from "./components/SignUpForm/PersonalTextfield";
import Button from "../../commons/components/Button/Button";
import { useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Role, UserRole } from "../../commons/interfaces/User.interface";
import { createUser } from "../../commons/api/user";
import { sendVerification } from "../../commons/api/auth";
import { normalizeEmail } from "../../commons/utils/normalizeEmail";

type FormValues = {
  email: string;
  password: string;
  re_password: string;
  name: string;
  surname: string;
  user_role: UserRole;
};

export default function SignUpPage() {
  const form = useForm<FormValues>();
  const { handleSubmit, setError, watch } = form;
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    const email = normalizeEmail(data.email);
    const userData = {
      email,
      password: data.password,
      name: data.name,
      surname: data.surname,
      user_role: data.user_role,
      role: ["user"] as Role[],
    };

    try {
      await createUser(userData);
      await sendVerification(email);
      navigate("/sent-verification-email", { state: { email } });
    } catch (error: unknown) {
      console.error(error);
      setError("email", {
        type: "manual",
        message: "Email is already registered.",
      });
    }
  });

  return (
    <div className="flex h-screen min-h-fit items-end justify-center">
      <div className="w-[75%] min-w-fit h-[85%] min-h-fit mt-[15%] bg-white rounded-t-xl py-6 px-10 shadow-dropShadow">
        {/* Logo */}
        <div className="relative flex justify-end mx-2">
          <img src={logo} alt="Logo" className="absolute h-36" />
        </div>

        <FormProvider {...form}>
          <form
            onSubmit={onSubmit}
            className="w-[84%] min-w-fit flex flex-col gap-y-[3.125rem] mx-auto mt-[11%]"
            noValidate
          >
            <h1 className="text-[40px]">Sign Up</h1>
            <div className="grid grid-cols-[9.375rem_25rem] gap-5">
              <div className="flex flex-row gap-x-3 items-center">
                <Icon
                  icon="ion:mail-outline"
                  className="text-gray-400 size-6"
                />
                <label className="font-light">Email:</label>
              </div>
              <TextInput
                id="email"
                autoLowercase
                placeholder="Email*"
                additionalValidation={{
                  required: { value: true },
                  pattern: {
                    value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Incorrect email format.",
                  },
                }}
              />

              <div className="flex flex-row gap-x-3 items-center">
                <Icon icon="ph:key" className="text-gray-400 size-6" />
                <label className="font-light">Password:</label>
              </div>
              <PasswordInput
                id="password"
                placeholder="Password*"
                additionalValidation={{
                  required: { value: true },
                  validate: (value: string) => value === watch("re_password"),
                }}
              />

              <div className="flex flex-row gap-x-3 items-center">
                <Icon icon="ph:key" className="text-gray-400 size-6" />
                <label className="font-light">Re-Password:</label>
              </div>
              <PasswordInput
                id="re_password"
                placeholder="Re-Password*"
                additionalValidation={{
                  required: { value: true },
                  validate: (value: string) =>
                    value === watch("password") || "Password do not match!",
                }}
              />
            </div>

            <div>
              <div className="flex flex-row gap-x-7 items-center mb-[1.875rem]">
                <Icon
                  icon="ph:user"
                  className="text-gray-400 size-[1.875rem]"
                />
                <h1 className="text-[24px]">Personal Information</h1>
              </div>
              <div className="grid grid-cols-2 gap-x-7 gap-y-[1.875rem]">
                <PersonalField
                  type="text"
                  label="First name"
                  id="name"
                  placeholder="First name*"
                />
                <PersonalField
                  type="text"
                  label="Last name"
                  id="surname"
                  placeholder="Last name*"
                />
                <PersonalField
                  type="select"
                  label="Role"
                  id="user_role"
                  placeholder="Role*"
                />
              </div>
            </div>

            <div className="grid grid-flow-col justify-end space-x-2.5 py-[3.875rem]">
              <Button
                id="cancel-sign-up"
                buttonType="cancel"
                text="Cancel"
                type="button"
                className="w-[11.875rem] px-7 py-3.5"
                onClick={() => navigate("/sign-in")}
              />

              <Button
                id="submit-sign-up"
                buttonType="submit"
                type="submit"
                text="Create Account"
                className="w-[11.875rem] px-7 py-3.5"
              />
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
