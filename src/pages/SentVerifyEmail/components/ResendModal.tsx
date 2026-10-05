import { useEffect, useState } from "react";
import Button from "../../../commons/components/Button/Button";
import { getRetryAfterSeconds } from "../../../commons/api/auth";
import { resendCooldownSeconds } from "../../../commons/configs/verificationConfig";

interface ResendModalProps {
  onClick: () => Promise<void>;
  initialCooldown?: number;
}

export default function ResendModal({
  onClick,
  initialCooldown = 0,
}: ResendModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialCooldown);
  const [feedback, setFeedback] = useState<
    "idle" | "success" | "wait" | "error"
  >("idle");

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleResend = async () => {
    try {
      await onClick();
      setFeedback("success");
      setSecondsLeft(resendCooldownSeconds);
    } catch (error: unknown) {
      const retryAfter = getRetryAfterSeconds(error);
      if (retryAfter !== null) {
        setFeedback("wait");
        setSecondsLeft(retryAfter);
        return;
      }
      console.error(error);
      setFeedback("error");
    }
  };

  return (
    <div className="modal-container border border-[#DFE4EA] rounded-lg px-8 py-5 space-y-11 w-fit mx-auto">
      <div className="modal-content">
        <h1 className="leading-loose">Haven't receive an email yet ?</h1>
        <label className="font-light leading-6">
          Click here to request a new verification email
        </label>
      </div>

      <Button
        id="resend-email"
        buttonType="submit"
        text={
          secondsLeft > 0
            ? `Resend in ${secondsLeft}s`
            : "Resend Verification Email"
        }
        className="min-w-fit"
        disabled={secondsLeft > 0}
        onClick={handleResend}
      />

      {/* Feedback Response */}
      {feedback === "success" && secondsLeft > 0 && (
        <p className="font-normal text-pep-green text-sm">
          Verification email sent.
        </p>
      )}
      {feedback === "wait" && secondsLeft > 0 && (
        <p className="font-normal text-gray-500 text-sm">
          A verification email was sent recently. Please wait before requesting
          another one.
        </p>
      )}
      {feedback === "error" && (
        <p className="font-normal text-error text-sm">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
