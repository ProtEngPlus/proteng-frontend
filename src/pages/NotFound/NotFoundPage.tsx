import { Icon } from "@iconify/react/dist/iconify.js";
import { useNavigate } from "react-router-dom";
import Button from "../../commons/components/Button/Button";
import { useAuth } from "../../commons/hooks/useAuth";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex h-screen min-h-fit items-center justify-center py-8 px-4">
      <div className="w-[60%] min-w-fit bg-white rounded-xl py-16 px-8 shadow-dropShadow text-center">
        <div className="m-auto text-center space-y-12">
          <Icon
            icon="heroicons-outline:exclamation-circle"
            className="mx-auto text-pep-blue"
            width={96}
            height={96}
          />
          <div className="space-y-3">
            <h1 className="text-4xl">Page not found</h1>
            <p className="font-light text-gray-500 text-2xl leading-loose">
              The page you are looking for does not exist or has been moved.
            </p>
            <hr className="w-[50%] mx-auto" />
          </div>
          <Button
            id="to-home"
            text={isAuthenticated ? "Back to dashboard" : "Back to sign in"}
            buttonType="submit"
            className="!w-fit min-w-48 whitespace-nowrap"
            onClick={() =>
              navigate(isAuthenticated ? "/dashboard" : "/sign-in")
            }
          />
        </div>
      </div>
    </div>
  );
}
