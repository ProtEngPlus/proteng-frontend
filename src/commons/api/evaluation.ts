import { apiClient } from "./client";
import { isResponseOk } from "./utils";
import {
  ApiErrorResponse,
  ApiResponse,
} from "../interfaces/ApiResponse.interface";
import { BACKEND_BASE_URL } from "../configs/apiConfig";
import {
  EvaluationRunDetailInterface,
  EvaluationRunInterface,
  RerunEvaluationInput,
} from "../interfaces/Evaluation.interface";

const CONDUCTOR_PATH = BACKEND_BASE_URL + "/proteng-conductor";

const checkResponse = <T>(response: ApiResponse<T>) => {
  if (!response || !isResponseOk(response)) {
    throw new ApiErrorResponse(
      response?.code ?? 0,
      response?.message || response?.error || "Unable to load evaluation data",
    );
  }
  return response;
};

const getEvaluationData = async <T>(path: string) => {
  const response = await apiClient.get<ApiResponse<T>>(path);
  return checkResponse(response.data);
};

export const getEvaluationPlugins = async () => {
  const path = CONDUCTOR_PATH + "/evaluation-plugins";
  return await getEvaluationData<string[]>(path);
};

export const getJobEvaluations = async (jobId: string) => {
  const path = CONDUCTOR_PATH + `/jobs/${jobId}/evaluations`;
  return await getEvaluationData<EvaluationRunInterface[]>(path);
};

export const getEvaluation = async (evaluationRunId: string) => {
  const path = CONDUCTOR_PATH + `/evaluations/${evaluationRunId}`;
  return await getEvaluationData<EvaluationRunDetailInterface>(path);
};

export const rerunEvaluation = async (
  jobId: string,
  input: RerunEvaluationInput,
) => {
  const path = CONDUCTOR_PATH + `/jobs/${jobId}/evaluations`;
  const response = await apiClient.post<ApiResponse<EvaluationRunInterface>>(
    path,
    input,
  );
  return checkResponse(response.data);
};
