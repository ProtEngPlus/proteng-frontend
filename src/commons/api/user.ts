import { get, put, del } from "./common";
import { BACKEND_BASE_URL } from "../configs/apiConfig";
import { User, UserRegister } from "../interfaces/User.interface";

const ME_PATH = BACKEND_BASE_URL + "/proteng-user-mgmt/me";
const USER_PATH = BACKEND_BASE_URL + "/proteng-user-mgmt/users";

/* USER API for User */

export const getMe = async () => {
  const path = ME_PATH;
  return await get<User>(path, true);
};

export const updateMe = async (user: Partial<UserRegister>) => {
  const path = ME_PATH;
  return await put<UserRegister>(path, user, true);
};

export const deleteMe = async () => {
  const path = ME_PATH;
  return await del(path, true);
};

/*------------------------*/

/* USER API for Admin */

export const getAllUsers = async () => {
  const path = USER_PATH;
  return await get<User[]>(path, true);
};

export const getUser = async (id: string) => {
  const path = USER_PATH + `/${id}`;
  return await get<User>(path, true);
};

export const updateUser = async (id: string, user: Partial<UserRegister>) => {
  const path = USER_PATH + `/${id}`;
  return await put<UserRegister>(path, user, true);
};

export const deleteUser = async (id: string) => {
  const path = USER_PATH + `/${id}`;
  return await del(path);
};
