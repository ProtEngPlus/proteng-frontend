import { OptionValue, Order } from "./Job.interface";

export type MutationStateType = "PENDING" | "ONGOING" | "FAILED" | "COMPLETED";

export interface MutationHistogram {
  mutation_id?: string;
  name: string;
  data: number[];
  min?: number;
  max?: number;
}

export interface MutationInterface {
  id: string;
  name: string;
  job_id: string;
  run_id: number;
  input_protein: string;
  options: string;
  tool: string;
  state: MutationStateType;
  is_bookmark: boolean;
  user_id: string;
  histogram_data: number[];
  created_at: string;
  complete_at: string;
  job_description?: string;
  job_name?: string;
}

export interface MutationSearchParams {
  job_id?: string;
  is_bookmark?: boolean;
}

export interface MutationResultSearchParams {
  mutation_id?: string;
  job_id?: string;
  is_bookmark?: boolean;
  sort?: string;
  min_value?: number;
  max_value?: number;
  order?: Order;
}

export interface CreateMutationInterface {
  name: string;
  job_id: string;
  input_protein: string;
  options: Record<string, OptionValue>;
  tool: string;
}

export interface MutationResultInterface {
  id: string;
  mutation_id: string;
  job_id: string;
  user_id: string;
  protein_sequence: string;
  mutation_positions: string[];
  assay_score: number;
  is_bookmark: boolean;
}

export interface ExperimentalResultInterface {
  id: string;
  mutation_result_id: string;
  mutation_id: string;
  job_id: string;
  user_id: string;
  actual_assay_score: number;
  note: string;
  measured_at: string;
}

export interface ExperimentalResultInput {
  actual_assay_score: number;
  note: string;
  measured_at?: string;
}
