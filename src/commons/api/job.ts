import { del, get, post, put } from "./common";
import { BACKEND_BASE_URL } from "../configs/apiConfig";
import { JobInterface, JobSearchParams } from "../interfaces/Job.interface";
import { Params } from "../interfaces/ApiResponse.interface";
import {
  CreateJobConfiguration,
  CreateJobInterface,
  JobConfiguration,
} from "../interfaces/CreateJob.interface";
import { Content } from "../interfaces/Dashboard.interface";

const JOB_PATH = BACKEND_BASE_URL + "/proteng-conductor/jobs";
const UNI_PROT_PATH = BACKEND_BASE_URL + "/proteng-conductor/uniProt";
const DASHBOARD_PATH = BACKEND_BASE_URL + "/proteng-conductor/jobs/dashboard";
const JOB_CONFIG_PATH =
  BACKEND_BASE_URL + "/proteng-conductor/jobs/configurations";

export const getAllJobs = async (params: JobSearchParams) => {
  const path = JOB_PATH;
  return await get<JobInterface[]>(path, params as Params);
};

export const getJob = async (id: string) => {
  const path = JOB_PATH + `/${id}`;
  return await get<JobInterface>(path);
};

export const createJob = async (job: CreateJobInterface) => {
  const path = JOB_PATH;
  const requestBody = { job };
  return await post<typeof requestBody>(path, requestBody);
};

export const getAllConfigurationJobs = async () => {
  const path = JOB_PATH + "/configurations";
  return await get<JobConfiguration[]>(path);
};

export const getUniProtId = async (uniProtId: string) => {
  const path = UNI_PROT_PATH + `/${uniProtId}`;
  return await get<string>(path);
};

export const updateJobDetail = async (
  id: string,
  updateData: Partial<JobInterface>,
) => {
  const path = JOB_PATH + `/${id}`;
  return await put<JobInterface>(path, updateData);
};

export const deleteJob = async (id: string) => {
  const path = JOB_PATH + `/${id}`;
  return await del(path);
};

export const runJob = async (id: string) => {
  const path = JOB_PATH + `/${id}/run`;
  return await post(path, null);
};

export const createJobConfiguration = async (job: CreateJobConfiguration) => {
  return await post<CreateJobConfiguration>(JOB_CONFIG_PATH, job);
};

export const getDashboardContent = async () => {
  return await get<Content>(DASHBOARD_PATH);
};
