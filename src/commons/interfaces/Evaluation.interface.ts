import { MutationResultInterface } from "./Mutation.interface";

export type EvaluationStateType =
  "PENDING" | "ONGOING" | "COMPLETED" | "FAILED";

export interface EvaluationRunInterface {
  id: string;
  job_id: string;
  mutation_id: string;
  mutation_result_ids: string[];
  plugins: string[];
  current_plugin_index: number;
  plugin_started_at: string;
  plugin_errors?: string[];
  state: EvaluationStateType;
  error: string;
  created_at: string;
  complete_at: string;
  rerun: boolean;
}

export interface EvaluationPluginResultInterface {
  state: EvaluationStateType;
  values: Record<string, unknown>;
  error: string;
}

export interface EvaluationMutantInterface {
  mutation_result: MutationResultInterface;
  results: Record<string, EvaluationPluginResultInterface>;
}

export interface EvaluationRunDetailInterface {
  run: EvaluationRunInterface;
  mutants: EvaluationMutantInterface[];
}

export interface RerunEvaluationInput {
  plugins: string[];
  mutation_id?: string;
}
