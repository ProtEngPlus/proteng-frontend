import axios from "axios";
import { BACKEND_BASE_URL } from "../configs/apiConfig";
import {
  ApiErrorResponse,
  ApiResponse,
} from "../interfaces/ApiResponse.interface";
import { UserLogin, UserRegister } from "../interfaces/User.interface";
import { get, patch, post } from "./common";
import { isResponseOk } from "./utils";
import { addHoursToDate } from "../utils/utils";

/*------------------------- login-logout section -------------------------------------*/

export const register = async (user: UserRegister) => {
  const path = BACKEND_BASE_URL + "/proteng-user-mgmt/auth/register";
  return await post<UserRegister>(path, user);
};

export const login = async (email: string, password: string, role: string) => {
  const path = BACKEND_BASE_URL + "/proteng-user-mgmt/auth/login";
  const axios_response = await axios.post(path, { email, password, role });
  const res = axios_response.data as ApiResponse<UserLogin>;

  // Check if the response is ok
  if (!isResponseOk(res)) {
    throw new ApiErrorResponse(res.code, res.error || "Unknown error");
  }

  // Set the access token to the session storage
  if (res.data?.access_token) {
    sessionStorage.setItem("accessToken", res.data.access_token);
    sessionStorage.setItem(
      "token_expires",
      addHoursToDate(new Date(), 1 / (60 * 20)).toString(),
    );
  }

  return res;
};

export const isLoggedIn = () => {
  return sessionStorage.getItem("accessToken") !== null;
};

export const logout = () => {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("token_expires");
  sessionStorage.removeItem("user");
};

export const getToken = () => {
  return sessionStorage.getItem("accessToken");
};

export const getMe = async () => {
  const path = BACKEND_BASE_URL + "/proteng-user-mgmt/me";
  return await get<UserLogin>(path, true);
};

/*------------------------- password section -------------------------------------*/

export const forgotPassword = async (email: string) => {
  const path = BACKEND_BASE_URL + "/proteng-user-mgmt/auth/forgotpassword";
  const axios_response = await axios.post(path, { email });
  const res = axios_response.data as ApiResponse<{ email: string }>;

  // Check if the response is ok
  if (!isResponseOk(res)) {
    throw new ApiErrorResponse(res.code, res.error || "Unknown error");
  }

  return res;
};

export const resetPassword = async (password: string, token: string) => {
  const path =
    BACKEND_BASE_URL + `/proteng-user-mgmt/auth/resetpassword/${token}`;
  const axios_response = await axios.patch(path, { password });
  const res = axios_response.data as ApiResponse<null>;

  // Check if the response is ok
  if (!isResponseOk(res)) {
    throw new ApiErrorResponse(res.code, res.error || "Unknown error");
  }

  return res;
};

export const changePassword = async (
  current_password: string,
  new_password: string,
) => {
  const path = BACKEND_BASE_URL + "/proteng-user-mgmt/auth/changepassword";

  // Using the custom patch method and passing true to include headers
  const res = await patch(
    path,
    {
      current_password,
      new_password,
    },
    true,
  );

  // Check if the response is ok
  if (!isResponseOk(res)) {
    throw new ApiErrorResponse(res.code, res.error || "Unknown error");
  }

  return res;
};

/* ------------------------- for email verification ------------------------------------*/

export const sendVerification = async (email: string) => {
  const path = BACKEND_BASE_URL + "/proteng-user-mgmt/auth/sendverification";
  const axios_response = await axios.post(path, {
    email,
  });
  const res = axios_response.data as ApiResponse<null>;

  // Check if the response is ok
  if (!isResponseOk(res)) {
    throw new ApiErrorResponse(res.code, res.error || "Unknown error");
  }

  return res;
};

export const successVerification = async (token: string) => {
  const path =
    BACKEND_BASE_URL + `/proteng-user-mgmt/auth/verifyemail/${token}`;
  const axios_response = await axios.post(path, {});
  const res = axios_response.data as ApiResponse<UserLogin>;

  if (!isResponseOk(res)) {
    throw new ApiErrorResponse(res.code, res.error || "Unknown error");
  }

  if (res.data?.access_token) {
    sessionStorage.setItem("accessToken", res.data.access_token);
    sessionStorage.setItem(
      "token_expires",
      addHoursToDate(new Date(), 1 / (60 * 20)).toString(),
    );
  }

  return res;
};
