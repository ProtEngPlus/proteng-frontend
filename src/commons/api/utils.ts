import axios from "axios";
import { ApiResponse } from "../interfaces/ApiResponse.interface";

export const getErrorMessage = (error: unknown): string => {
  let errorMessage = "";
  if (axios.isAxiosError(error)) {
    if (error.response) {
      errorMessage = error.response.data.message || error.response.data.error;
    } else {
      errorMessage = error.message;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = "Unknown error";
  }
  return errorMessage;
};

export const isResponseOk = (response: ApiResponse<unknown>): boolean => {
  if (String(response.code).slice(0, 2) === "20") {
    return true;
  } else {
    return false;
  }
};
