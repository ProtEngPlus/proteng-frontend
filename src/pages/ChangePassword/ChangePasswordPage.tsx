import { useState } from "react";
import PasswordField from "./components/PasswordWithLabel";
import { useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { Icon } from "@iconify/react";
import Button from "../../commons/components/Button/Button";
import {
  ConfirmOverlay,
  ConfirmOverlayProps,
} from "../../commons/components/ModalOverlay/ConfirmOverlay";
import {
  SuccessOverlay,
  SuccessOverlayProps,
} from "../../commons/components/ModalOverlay/SuccessOverlay";
import { changePassword } from "../../commons/api/auth";

type FormValues = {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
};

export default function ChangePasswordPage() {
  const form = useForm<FormValues>();
  const { handleSubmit, setError, watch } = form;
  const navigate = useNavigate();

  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const ConfirmProps: ConfirmOverlayProps = {
    id: "confirm-change-password",
    onClose: () => {
      setConfirmVisible(false);
    },
    onConfirm: async () => {
      setConfirmVisible(false);
      const current_password = watch("current_password");
      const new_password = watch("new_password");
      try {
        await changePassword(current_password, new_password);
        setSuccessVisible(true);
      } catch (error) {
        console.error(error);
        setError("current_password", {
          type: "manual",
          message: "Incorrect Password",
        });
      }
    },
    title: "Do you want to change the password?",
    message: "Please ensure your new password is secure and memorable.",
  };

  const [isSuccessVisible, setSuccessVisible] = useState(false);
  const SuccessProps: SuccessOverlayProps = {
    id: "success-change-password",
    onClose: () => {
      setSuccessVisible(false);
      navigate("/account-management");
    },
    title: "Password Successfully Updated",
  };

  const onSubmit = handleSubmit(async (data) => {
    if (data.new_password !== data.confirm_new_password) {
      setError("new_password", {
        type: "manual",
      });
      setError("confirm_new_password", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }
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
      <form onSubmit={onSubmit} className="space-y-12">
        <div className="flex flex-row gap-x-7 items-center">
          <Icon icon="ph:key" className="text-gray-400 size-6" />
          <h1>Change Password</h1>
        </div>

        <PasswordField
          id="current_password"
          label="Current Password"
          placeholder="Current Password*"
          additionalValidation={{
            required: { value: true, message: "Current Password is required." },
          }}
        />

        <PasswordField
          id="new_password"
          label="New Password"
          placeholder="New Password*"
          additionalValidation={{
            required: { value: true, message: "New Password is required." },
          }}
        />

        <PasswordField
          id="confirm_new_password"
          label="Confirm New Password"
          placeholder="Confirm New Password*"
          additionalValidation={{
            required: {
              value: true,
              message: "Confirm New Password is required.",
            },
          }}
        />

        <div className="flex space-x-2.5 justify-end items-end right-0 pb-[3.875rem]">
          <Button
            id="cancel-change-password"
            buttonType="cancel"
            type="button"
            text="Cancel"
            onClick={() => navigate("/account-management")}
          />

          <Button
            id="change-password"
            buttonType="submit"
            text="Save"
            type="submit"
          />
        </div>
      </form>
    </FormProvider>
  );
}
