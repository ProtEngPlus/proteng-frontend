import { Icon } from "@iconify/react";
import { RunType } from "../../../interfaces/Job.interface";

const getTooltipText = (isOn: boolean, runType: RunType): string => {
  if (!isOn) return "Email notifications are off";
  return runType === "auto"
    ? "Emails you when the job completes or fails"
    : "Emails you after each step and when the job completes or fails";
};

export default function NotificationToggle({
  isOn,
  runType,
  disabled = false,
  onToggle,
}: {
  isOn: boolean;
  runType: RunType;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative group">
      <Icon
        data-testid={`isnotification-${isOn}`}
        icon={
          isOn ? "carbon:notification-filled" : "carbon:notification-off-filled"
        }
        className={`size-[30px] ${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${isOn ? "text-pep-orange" : "text-error"}`}
        onClick={() => !disabled && onToggle()}
      />
      <div className="hidden group-hover:block absolute right-0 top-full mt-2 z-10 px-2 py-1 w-max max-w-56 text-xs font-light text-white bg-label rounded-md">
        {getTooltipText(isOn, runType)}
        <div className="bg-label size-2 rotate-45 absolute right-3 top-0 -translate-y-1/2 z-[-10]"></div>
      </div>
    </div>
  );
}
