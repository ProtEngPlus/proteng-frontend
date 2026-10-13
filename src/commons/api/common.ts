import axios from "axios";
import {
  ApiErrorResponse,
  ApiResponse,
  Params,
} from "../interfaces/ApiResponse.interface";
import { apiClient } from "./client";
import { isResponseOk } from "./utils";

export const get = async <T>(path: string, params?: Params) => {
  try {
    const axios_response = await apiClient.get(path, {
      params,
      paramsSerializer: { indexes: null },
    });

    const res = axios_response.data as ApiResponse<T>;

    if (!isResponseOk(res)) {
      throw new Error(res.message || "Unknown error from server");
    }

    return res;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};

export const getRaw = async (path: string, params?: Params) => {
  try {
    const axios_response = await apiClient.get(path, {
      params,
      paramsSerializer: { indexes: null },
    });

    const res = axios_response.data as Blob;
    return res;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};

export const post = async <T>(path: string, data: T) => {
  const axios_response = await apiClient.post(path, data);
  const res = axios_response.data as ApiResponse<T>;
  if (!isResponseOk(res)) {
    throwError(res.code, res.error);
  }
  return res;
};

export const put = async <T>(path: string, data: Partial<T>) => {
  const axios_response = await apiClient.put(path, data);
  const res = axios_response.data as ApiResponse<T>;
  if (!isResponseOk(res)) {
    throwError(res.code, res.error);
  }
  return res;
};

export const patch = async <T>(path: string, data: Partial<T>) => {
  const axios_response = await apiClient.patch(path, data);
  const res = axios_response.data as ApiResponse<T>;
  if (!isResponseOk(res)) {
    throwError(res.code, res.error);
  }
  return res;
};

export const del = async (path: string) => {
  const axios_response = await apiClient.delete(path);
  const res = axios_response.data as ApiResponse<null>;
  if (!isResponseOk(res)) {
    throwError(res.code, res.error);
  }
  return res;
};

const throwError = (code: number, message: string | undefined) => {
  throw new ApiErrorResponse(code, message || "Unknown error");
};
