import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../commons/components/Button/Button";
import successVerified from "../../assets/images/SucessVerified/successVerified.svg";
import { successVerification } from "../../commons/api/auth";

export default function SuccessVerifyEmailPage() {
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await successVerification(token!);
        const data = res?.data;
        const name = `${data?.name ?? ""} ${data?.surname?.[0] ?? ""}.`;
        setName(name);
      } catch (error) {
        console.error("Error verifying email:", error);
        navigate("/sign-in");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex h-screen min-h-fit items-center justify-center py-8 px-4">
      <div className="w-[60%] min-w-fit h-[80%] min-h-fit bg-white rounded-xl py-6 px-8 shadow-dropShadow text-center">
        <div className="m-auto text-center space-y-12">
          <img src={successVerified} className="mx-auto mt-[76px]" />
          <div className="space-y-12">
            <div className="space-y-3">
              <h1 className="text-4xl">Verified</h1>
              <p className="font-light text-gray-500 text-2xl leading-loose">
                Your account has successfully been created.
              </p>
              <hr className="w-[50%] mx-auto" />
            </div>
            <div>
              <p className="font-light text-gray-500 text-2xl mt-12 leading-loose">
                {loading ? "Welcome" : `Welcome, ${name}`}
              </p>
              <Button
                id="to-sign-in"
                text="Continue"
                buttonType="submit"
                onClick={() => navigate("/dashboard")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
