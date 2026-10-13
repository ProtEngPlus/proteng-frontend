import sentVerify from "../../assets/images/sentVerifyEmail/sentVerification.svg";
import ResendModal from "../SentVerifyEmail/components/ResendModal";
import Button from "../../commons/components/Button/Button";
import { forgotPassword } from "../../commons/api/auth";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

export default function SentResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, cooldown } = location.state || {};

  if (!email) {
    return <Navigate to="/forget-password" replace />;
  }

  const resendEmail = async () => {
    await forgotPassword(email);
  };

  return (
    <div className="flex h-screen min-h-fit items-center justify-center py-8 px-4">
      <div className="w-[60%] min-w-fit h-[80%] min-h-fit bg-white rounded-xl py-6 px-8 shadow-dropShadow text-center">
        <div className="m-auto text-center space-y-12">
          <img src={sentVerify} className="mx-auto mt-[76px]" />
          <div className="space-y-3">
            <h1 className="text-4xl">Check your email</h1>
            <p className="font-light text-gray-500">
              A password reset link has been sent to your inbox. <br />
              Please check your email and click the link to reset your password.
            </p>
          </div>
          <ResendModal
            onClick={resendEmail}
            initialCooldown={cooldown ?? 0}
            description="Click here to request a new password reset email"
            buttonText="Resend Reset Email"
            successText="Password reset email sent."
            waitText="A password reset email was sent recently. Please wait before requesting another one."
          />
          <Button
            id="back-to-sign-in"
            text="Back to Sign In"
            buttonType="submit"
            onClick={() => navigate("/sign-in")}
          />
        </div>
      </div>
    </div>
  );
}
