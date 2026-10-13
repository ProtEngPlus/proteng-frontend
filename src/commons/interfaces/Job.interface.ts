export type RunType = "auto" | "one-step";

export type State = "CREATED" | "PENDING" | "ONGOING" | "FAILED" | "COMPLETED";

export type Order = "asc" | "desc";

export const Steps = [
  "Protein Query",
  "Protein Representation",
  "Top Model",
  "Mutation",
];

export type LabResult = {
  total: number;
  sequences: string[];
  scores: number[];
};

export type OptionValue =
  string | string[] | number | number[] | number[][] | boolean | undefined;

export interface JobInterface {
  id: string;
  user_id: string;
  stage_id: number;
  state: State;
  ref_job_id?: string;
  name: string;
  description: string;
  input_protein: string;
  meta: string[];
  lab_result: LabResult;
  options: Record<string, Record<string, OptionValue>>;
  is_notification_on: boolean;
  run_type: RunType;
  artifact: Record<string, object> | null;
  error_logs: string[];
  run_time?: Record<string, { start_time: string; end_time: string }>;
  created_at: string;
  updated_at: string;
  complete_at?: string;
}

export interface JobSearchParams {
  name?: string;
  state?: State | State[];
  created_at_from?: string;
  created_at_to?: string;
}
