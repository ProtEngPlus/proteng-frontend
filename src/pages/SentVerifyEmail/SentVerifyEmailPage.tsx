import sentVerify from "../../assets/images/sentVerifyEmail/sentVerification.svg";
import ResendModal from "./components/ResendModal";
import { sendVerification } from "../../commons/api/auth";
import { Navigate, useLocation } from "react-router-dom";

export default function SentVerificationPage() {
  const location = useLocation();
  const { email, emailFailed } = location.state || {};

  if (!email) {
    return <Navigate to="/sign-in" replace />;
  }

  const resendEmail = async () => {
    await sendVerification(email);
  };

  return (
    <div className="flex h-screen min-h-fit items-center justify-center py-8 px-4">
      <div className="w-[60%] min-w-fit h-[80%] min-h-fit bg-white rounded-xl py-6 px-8 shadow-dropShadow text-center">
        <div className="m-auto text-center space-y-12">
          <img src={sentVerify} className="mx-auto mt-[76px]" />
          <div className="space-y-3">
            <h1 className="text-4xl">Almost There!</h1>
            <h1 className="mb-3 text-4xl">Verify your email address</h1>
            {emailFailed ? (
              <p className="font-light text-gray-500">
                Your account was created, but we could not send the verification
                email. <br />
                Please request a new one with the button below.
              </p>
            ) : (
              <p className="font-light text-gray-500">
                A verification email has been sent to your inbox. <br />
                Please check your email and click the link to complete your
                registration.
              </p>
            )}
          </div>
          <ResendModal onClick={resendEmail} startWithCooldown={emailFailed} />
        </div>
      </div>
    </div>
  );
}
