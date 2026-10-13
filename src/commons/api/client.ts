import axios, { InternalAxiosRequestConfig } from "axios";
import { BACKEND_BASE_URL } from "../configs/apiConfig";

const REFRESH_URL = BACKEND_BASE_URL + "/proteng-user-mgmt/auth/refresh";
const NO_REFRESH_PATHS = ["/auth/login", "/auth/refresh", "/auth/logout"];
const CONFLICT_RETRY_DELAY_MS = 500;

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retried?: boolean;
};

export const apiClient = axios.create({ withCredentials: true });

let refreshing: Promise<void> | null = null;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const refreshSession = (): Promise<void> => {
  if (!refreshing) {
    refreshing = axios
      .post(REFRESH_URL, null, { withCredentials: true })
      .then(() => undefined)
      .catch(async (error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
          await wait(CONFLICT_RETRY_DELAY_MS);
          return;
        }
        throw error;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
};

apiClient.interceptors.response.use(undefined, async (error: unknown) => {
  if (
    !axios.isAxiosError(error) ||
    error.response?.status !== 401 ||
    !error.config
  ) {
    return Promise.reject(error);
  }

  const config: RetriableRequestConfig = error.config;
  if (
    config._retried ||
    NO_REFRESH_PATHS.some((path) => config.url?.includes(path))
  ) {
    return Promise.reject(error);
  }
  config._retried = true;

  try {
    await refreshSession();
  } catch {
    return Promise.reject(error);
  }
  return apiClient(config);
});
