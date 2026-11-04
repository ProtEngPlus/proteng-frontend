import { del, get, getRaw, post, put } from "./common";
import { BACKEND_BASE_URL } from "../configs/apiConfig";
import {
  MutationInterface,
  MutationHistogram,
  CreateMutationInterface,
  MutationResultInterface,
  MutationResultSearchParams,
  MutationSearchParams,
  ExperimentalResultInterface,
  ExperimentalResultInput,
} from "../interfaces/Mutation.interface";
import { Params } from "../interfaces/ApiResponse.interface";

const MUTATION_PATH = BACKEND_BASE_URL + "/proteng-conductor/mutations";
const MUTATION_RESULT_PATH =
  BACKEND_BASE_URL + "/proteng-conductor/mutations/results";
const EXPERIMENTAL_RESULT_PATH =
  BACKEND_BASE_URL + "/proteng-conductor/mutations/experimental-results";

export const getMutationHistogram = async (jobId: string) => {
  const path = MUTATION_PATH + `/histograms?job_id=${jobId}`;
  return await get<MutationHistogram[]>(path);
};

export const getMutation = async (mutationId: string) => {
  const path = MUTATION_PATH + `/${mutationId}`;
  return await get<MutationInterface>(path);
};

export const getAllMutations = async (params: MutationSearchParams) => {
  return await get<MutationInterface[]>(MUTATION_PATH, params as Params);
};

export const getAllMutationResult = async (
  params: MutationResultSearchParams,
) => {
  return await get<MutationResultInterface[]>(
    MUTATION_RESULT_PATH,
    params as Params,
  );
};

export const createMutation = async (mutation: CreateMutationInterface) => {
  return await post<CreateMutationInterface>(MUTATION_PATH, mutation);
};

export const deleteMutation = async (mutationId: string) => {
  const path = MUTATION_PATH + `/${mutationId}`;
  return await del(path);
};

export const runMutation = async (mutationId: string) => {
  const path = MUTATION_PATH + `/${mutationId}/run`;
  return await post(path, {});
};

export const updateMutationDetail = async (
  mutationId: string,
  updateData: Partial<MutationInterface>,
) => {
  const path = MUTATION_PATH + `/${mutationId}`;
  return await put<MutationInterface>(path, updateData);
};

export const updateMutationResultDetail = async (
  mutationResultId: string,
  updateData: Partial<MutationResultInterface>,
) => {
  const path = MUTATION_RESULT_PATH + `/${mutationResultId}`;
  return await put<MutationResultInterface>(path, updateData);
};

export const downloadMutationResults = async (
  mutationId: string,
  params: MutationResultSearchParams,
) => {
  const path = MUTATION_PATH + `/${mutationId}/download`;
  return await getRaw(path, params as Params);
};

export const getAllExperimentalResults = async (jobId: string) => {
  return await get<ExperimentalResultInterface[]>(EXPERIMENTAL_RESULT_PATH, {
    job_id: jobId,
  } as Params);
};

export const upsertExperimentalResult = async (
  mutationResultId: string,
  input: ExperimentalResultInput,
) => {
  const path =
    EXPERIMENTAL_RESULT_PATH + `/by-mutation-result/${mutationResultId}`;
  return await put<ExperimentalResultInput>(path, input);
};

export const deleteExperimentalResult = async (mutationResultId: string) => {
  const path =
    EXPERIMENTAL_RESULT_PATH + `/by-mutation-result/${mutationResultId}`;
  return await del(path);
};
