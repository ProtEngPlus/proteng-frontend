import { useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import TextInput from "../../../../commons/components/Input/TextInput";
import PersonalField from "../PersonalTextfield/PersonalTextfield";
import Button from "../../../../commons/components/Button/Button";
import { Icon } from "@iconify/react";
import {
  ConfirmOverlay,
  ConfirmOverlayProps,
} from "../../../../commons/components/ModalOverlay/ConfirmOverlay";
import {
  SuccessOverlay,
  SuccessOverlayProps,
} from "../../../../commons/components/ModalOverlay/SuccessOverlay";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../commons/hooks/useAuth";
import { updateMe } from "../../../../commons/api/user";
import { Role } from "../../../../commons/interfaces/User.interface";
import { normalizeEmail } from "../../../../commons/utils/normalizeEmail";

type FormValues = {
  name: string;
  surname: string;
  email: string;
  user_role: string;
  role: Role[];
};

export default function PersonalInformation() {
  const { user, refreshUser } = useAuth();
  const form = useForm<FormValues>({
    defaultValues: {
      name: user?.name || "",
      surname: user?.surname || "",
      email: user?.email || "",
      user_role: user?.user_role || "",
    },
  });
  const { handleSubmit, setValue } = form;
  const navigate = useNavigate();

  const [userData, setUserData] = useState<FormValues | null>(null);
  useEffect(() => {
    if (user) {
      setValue("email", user.email);
    }
  }, [user, setValue]);

  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const ConfirmProps: ConfirmOverlayProps = {
    id: "update-user",
    onClose: () => {
      setConfirmVisible(false);
    },
    onConfirm: async () => {
      setConfirmVisible(false);
      if (userData) {
        try {
          await updateMe(userData);
          refreshUser();
          setSuccessVisible(true);
        } catch (error) {
          console.error(error);
        }
      }
    },
    title: "Do you want to confirm edit",
    message: "You made changes to this profile configuration",
  };

  const [isSuccessVisible, setSuccessVisible] = useState(false);
  const SuccessProps: SuccessOverlayProps = {
    id: "update-user",
    onClose: () => {
      setSuccessVisible(false);
    },
    title: "Profile Successfully Updated",
  };

  const onSubmit = handleSubmit((data) => {
    setUserData({
      name: data.name,
      surname: data.surname,
      email: normalizeEmail(data.email),
      user_role: data.user_role,
      role: ["user"],
    });
    setConfirmVisible(true);
  });

  return (
    <FormProvider {...form}>
      <ConfirmOverlay
        isVisible={isConfirmVisible}
        confirmProps={ConfirmProps}
      />
      <SuccessOverlay
        isVisible={isSuccessVisible}
        successProps={SuccessProps}
      />

      {/* Attach onSubmit handler to the form */}
      <form
        className="space-y-32 overflow-x-visible"
        noValidate
        onSubmit={onSubmit}
      >
        <div className="space-y-12">
          <div className="flex flex-row gap-x-7 items-center">
            <Icon icon="ph:user" className="text-gray-400 size-[1.875rem]" />
            <h1 className="text-[24px]">Personal Information</h1>
          </div>
          <div className="grid grid-flow-row gap-x-[3%] gap-y-[1.875rem] w-[77%] inputField:min-w-[900px] inputField:grid-cols-2">
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
          <hr />
          <div className="grid grid-cols-[9.375rem_25rem] gap-5 w-full">
            <div className="flex flex-row gap-x-3 items-center">
              <Icon icon="ion:mail-outline" className="text-gray-400 size-6" />
              <label className="font-light">Email:</label>
            </div>
            <TextInput
              id="email"
              autoLowercase
              placeholder="Email*"
              disabled
              className="w-full"
            />
            <div className="flex flex-row gap-x-[3%] items-center">
              <Icon icon="ph:key" className="text-gray-400 size-6" />
              <label className="font-light">Password:</label>
            </div>
            <Button
              id="change-password"
              buttonType="cancel"
              type="button"
              text="Change Password"
              onClick={() => navigate("/account-management/change-password")}
              className="min-w-fit"
            />
          </div>
        </div>

        <div className="flex space-x-2.5 justify-end items-end right-0 pb-[3.875rem]">
          <Button
            id="cancel-update-user"
            buttonType="cancel"
            text="Cancel"
            type="button"
            onClick={() => {
              form.reset({
                name: user?.name || "",
                surname: user?.surname || "",
                email: user?.email || "",
                user_role: user?.user_role || "",
              });
            }}
          />
          <Button
            id="submit-update-user"
            buttonType="submit"
            text="Save"
            type="submit"
          />
        </div>
      </form>
    </FormProvider>
  );
}
