import sentVerify from "../../assets/images/sentVerifyEmail/sentVerification.svg";
import ResendModal from "./components/ResendModal";
import { sendVerification } from "../../commons/api/auth";
import { Navigate, useLocation } from "react-router-dom";

export default function SentVerificationPage() {
  const location = useLocation();
  const { email } = location.state || {};

  if (!email) {
    return <Navigate to="/sign-in" replace />;
  }

  const resendEmail = async () => {
    try {
      console.log(`resend email ${email}`);
      await sendVerification(email);
    } catch (error: unknown) {
      console.error(error);
    }
  };
  return (
    <div className="flex h-screen min-h-fit items-end justify-center">
      <div className="w-[75%] min-w-fit h-[85%] min-h-fit mt-[15%] bg-white rounded-t-xl py-6 px-4 shadow-dropShadow text-center">
        <div className="m-auto text-center space-y-12">
          <img src={sentVerify} className="mx-auto mt-[76px]" />
          <div className="space-y-3">
            <h1 className="text-4xl">Almost There!</h1>
            <h1 className="mb-3 text-4xl">Verify your email address</h1>
            <p className="font-light text-gray-500">
              A verification email has been sent to your inbox. <br />
              Please check your email and click the link to complete your
              registration.
            </p>
          </div>
          <ResendModal onClick={resendEmail} />
        </div>
      </div>
    </div>
  );
}
