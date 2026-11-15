import { get, put, del } from "./common";
import { BACKEND_BASE_URL } from "../configs/apiConfig";
import { User, UserRegister } from "../interfaces/User.interface";

const ME_PATH = BACKEND_BASE_URL + "/proteng-user-mgmt/me";

export const getMe = async () => {
  const path = ME_PATH;
  return await get<User>(path);
};

export const updateMe = async (user: Partial<UserRegister>) => {
  const path = ME_PATH;
  return await put<UserRegister>(path, user);
};

export const deleteMe = async () => {
  const path = ME_PATH;
  return await del(path);
};
