import { get, post } from "./common";
import { BACKEND_BASE_URL } from "../configs/apiConfig";
import {
  EvaluationRunDetailInterface,
  EvaluationRunInterface,
  RerunEvaluationInput,
} from "../interfaces/Evaluation.interface";

const CONDUCTOR_PATH = BACKEND_BASE_URL + "/proteng-conductor";

export const getEvaluationPlugins = async () => {
  const path = CONDUCTOR_PATH + "/evaluation-plugins";
  return await get<string[]>(path);
};

export const getJobEvaluations = async (jobId: string) => {
  const path = CONDUCTOR_PATH + `/jobs/${jobId}/evaluations`;
  return await get<EvaluationRunInterface[]>(path);
};

export const getEvaluation = async (evaluationRunId: string) => {
  const path = CONDUCTOR_PATH + `/evaluations/${evaluationRunId}`;
  return await get<EvaluationRunDetailInterface>(path);
};

export const rerunEvaluation = async (
  jobId: string,
  input: RerunEvaluationInput,
) => {
  const path = CONDUCTOR_PATH + `/jobs/${jobId}/evaluations`;
  return await post<RerunEvaluationInput>(path, input);
};
