import axios from "axios";
import {
  ApiErrorResponse,
  ApiResponse,
  Params,
} from "../interfaces/ApiResponse.interface";
import { apiClient } from "./client";
import { getHeaderWithToken, isResponseOk } from "./utils";

export const get = async <T>(
  path: string,
  withHeader: boolean = false,
  params?: Params,
) => {
  try {
    const headers = withHeader ? getHeaderWithToken() : {};
    const axios_response = await apiClient.get(path, {
      headers,
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

export const getRaw = async (
  path: string,
  withHeader: boolean = false,
  params?: Params,
) => {
  try {
    const headers = withHeader ? getHeaderWithToken() : {};
    const axios_response = await apiClient.get(path, {
      headers,
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

export const post = async <T>(
  path: string,
  data: T,
  withHeader: boolean = false,
) => {
  const headers = withHeader ? getHeaderWithToken() : {};
  const axios_response = await apiClient.post(path, data, { headers });
  const res = axios_response.data as ApiResponse<T>;
  if (!isResponseOk(res)) {
    throwError(res.code, res.error);
  }
  return res;
};

export const put = async <T>(
  path: string,
  data: Partial<T>,
  withHeader: boolean = false,
) => {
  const headers = withHeader ? getHeaderWithToken() : {};
  const axios_response = await apiClient.put(path, data, { headers });
  const res = axios_response.data as ApiResponse<T>;
  if (!isResponseOk(res)) {
    throwError(res.code, res.error);
  }
  return res;
};

export const patch = async <T>(
  path: string,
  data: Partial<T>,
  withHeader: boolean = false,
) => {
  const headers = withHeader ? getHeaderWithToken() : {};
  const axios_response = await apiClient.patch(path, data, { headers });
  const res = axios_response.data as ApiResponse<T>;
  if (!isResponseOk(res)) {
    throwError(res.code, res.error);
  }
  return res;
};

export const del = async (path: string, withHeader: boolean = false) => {
  const headers = withHeader ? getHeaderWithToken() : {};
  const axios_response = await apiClient.delete(path, { headers });
  const res = axios_response.data as ApiResponse<null>;
  if (!isResponseOk(res)) {
    throwError(res.code, res.error);
  }
  return res;
};

const throwError = (code: number, message: string | undefined) => {
  throw new ApiErrorResponse(code, message || "Unknown error");
};
