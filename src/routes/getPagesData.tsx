import { RouteProps, Navigate } from "react-router-dom";

import SignInApp from "../pages/SignIn/SignInApp";
import SignUpApp from "../pages/SignUp/SignUpApp";
import ForgetPasswordApp from "../pages/ForgetPassword/ForgetPasswordApp";
import ResetPasswordApp from "../pages/ResetPassword/ResetPasswordApp";
import SentResetPasswordApp from "../pages/SentResetPassword/SentResetPasswordApp";
import SentVerifyEmailApp from "../pages/SentVerifyEmail/SentVerifyEmailApp";
import SuccessVerifyEmailApp from "../pages/SuccessVerifyEmail/SuccessVerifyEmailApp";
import DashboardApp from "../pages/Dashboard/DashboardApp";
import AccountManagementApp from "../pages/AccountManagement/AccountManagementApp";
import ChangePasswordApp from "../pages/ChangePassword/ChangePasswordApp";
import CreateJobApp from "../pages/CreateJob/CreateJobApp";
import JobDetailApp from "../pages/JobDetail/JobDetailApp";

const pagesData = [
  {
    path: "/",
    element: <Navigate to="/sign-in" replace />,
  },
  {
    path: "/sign-in",
    element: <SignInApp />,
  },
  {
    path: "/forget-password",
    element: <ForgetPasswordApp />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordApp />,
  },
  {
    path: "/sent-reset-password-email",
    element: <SentResetPasswordApp />,
  },
  {
    path: "/sign-up",
    element: <SignUpApp />,
  },
  {
    path: "/sent-verification-email",
    element: <SentVerifyEmailApp />,
  },
  {
    path: "/success-verified",
    element: <SuccessVerifyEmailApp />,
  },
  {
    path: "/account-management",
    element: <AccountManagementApp />,
  },
  {
    path: "/account-management/change-password",
    element: <ChangePasswordApp />,
  },
  {
    path: "/dashboard",
    element: <DashboardApp />,
  },
  {
    path: "/create-job",
    element: <CreateJobApp />,
  },
  {
    path: "/dashboard/job-detail/:jobid",
    element: <JobDetailApp />,
  },
] as unknown as RouteProps[];

export default pagesData;
