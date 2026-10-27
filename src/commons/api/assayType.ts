import axios from "axios";
import { del, get, post, put } from "./common";
import { getHeaderWithToken } from "./utils";
import { BACKEND_BASE_URL } from "../configs/apiConfig";
import {
  AssayType,
  AssayTypeInput,
  AssayTypeSummary,
  CsvDownload,
  LibraryJobList,
  LibraryResult,
} from "../interfaces/AssayType.interface";

const ASSAY_TYPE_PATH = BACKEND_BASE_URL + "/proteng-conductor/assay-types";
const JOB_EXPORT_PATH =
  BACKEND_BASE_URL + "/proteng-conductor/mutations/experimental-results/export";

export const getAllAssayTypes = async (): Promise<AssayTypeSummary[]> => {
  const response = await get<AssayTypeSummary[]>(ASSAY_TYPE_PATH, true);
  return response.data ?? [];
};

export const createAssayType = async (input: AssayTypeInput) => {
  const response = await post<AssayTypeInput | AssayType>(
    ASSAY_TYPE_PATH,
    input,
    true,
  );
  return response.data as AssayType;
};

export const updateAssayType = async (id: string, input: AssayTypeInput) => {
  const response = await put<AssayTypeInput | AssayType>(
    ASSAY_TYPE_PATH + `/${id}`,
    input,
    true,
  );
  return response.data as AssayType;
};

export const deleteAssayType = async (id: string) => {
  return await del(ASSAY_TYPE_PATH + `/${id}`, true);
};

export const getLibraryJobs = async (
  id: string,
  q?: string,
): Promise<LibraryJobList> => {
  const response = await get<LibraryJobList>(
    ASSAY_TYPE_PATH + `/${id}/library/jobs`,
    true,
    q ? { q } : undefined,
  );
  return response.data ?? { jobs: [], duplicates_collapsed: 0 };
};

export const getLibraryResults = async (
  id: string,
  jobId: string,
): Promise<LibraryResult[]> => {
  const response = await get<LibraryResult[]>(
    ASSAY_TYPE_PATH + `/${id}/library`,
    true,
    { job_id: jobId },
  );
  return response.data ?? [];
};

const downloadCsv = async (
  path: string,
  params: Record<string, string>,
): Promise<CsvDownload> => {
  const response = await axios.get(path, {
    headers: getHeaderWithToken(),
    params,
    responseType: "blob",
  });
  const disposition: string = response.headers["content-disposition"] ?? "";
  const match = /filename="?([^";]+)"?/.exec(disposition);
  return {
    blob: response.data as Blob,
    fileName: match ? match[1] : "export.csv",
    rowCount: Number(response.headers["x-row-count"] ?? 0),
  };
};

export const exportLibrary = async (id: string, resultIds: string[]) =>
  downloadCsv(
    ASSAY_TYPE_PATH + `/${id}/library/export`,
    resultIds.length ? { ids: resultIds.join(",") } : {},
  );

export const exportJobResults = async (jobId: string) =>
  downloadCsv(JOB_EXPORT_PATH, { job_id: jobId });

export const saveCsvDownload = ({ blob, fileName }: CsvDownload) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
