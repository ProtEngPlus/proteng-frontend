import { LabResult, OptionValue, RunType, State } from "./Job.interface";
import { QueryResult } from "./QueryResult.interface";
import { RunTime } from "./Report.interface";

export const stepsForCreateJob = [
  "Protein Query",
  "Protein Representation",
  "Upload Lab Input",
  "Top Model",
  "Mutation",
  "Evaluation",
  "Conclusion",
];

export interface PipelineItem {
  method: string;
  subMethod: string;
}

export interface PipelineItems {
  method: string;
  subMethod: string[];
}

export interface CreateJobInterface {
  evaluation_plugins?: string[];
  user_id: string;
  ref_job_id?: string;
  stage_id: number;
  name: string;
  description: string;
  input_protein: string;
  meta: string[];
  lab_result: LabResult;
  options: Record<string, Record<string, OptionValue>>;
  is_notification_on: boolean;
  run_type: RunType;
  artifact: Record<string, object> | null;
  query_result?: QueryResult;
}

export interface CreateJobDetail {
  name: string;
  description: string;
  input_protein: string;
  lab_result: { sequence: string; score: number }[]; // to add in table and export csv easier;
  run_type: RunType;
  run_time?: Record<string, RunTime> | null;
  is_notification_on: boolean;
  ref_job_id?: string;
  artifact: Record<string, object> | null;
  evaluation_plugins: string[];
}

export interface ReportJobDetail {
  name: string;
  description: string;
  input_protein: string;
  lab_result: LabResult;
  run_type: RunType;
  run_time?: Record<string, RunTime> | null;
  is_notification_on: boolean;
  ref_job_id?: string;
  artifact: Record<string, object> | null;
}

// option that send to backend
export interface CreateJobOption {
  [subMethod: string]: {
    [key: string]: OptionValue;
  };
}

// option that use on website
export interface JobOption {
  [method: string]: {
    [subMethod: string]: {
      [key: string]: OptionValue;
    };
  };
}

export interface JobConfiguration {
  evaluation_plugins?: string[];
  state: State;
  stage_id: number;
  id: string;
  user_id: string;
  ref_job_id: string;
  name: string;
  description: string;
  input_protein: string;
  meta: string[];
  lab_result: LabResult;
  options: Record<string, Record<string, OptionValue>>;
  is_notification_on: boolean;
  run_type: RunType;
  artifact: Record<string, object>;
}

export interface CreateJobConfiguration {
  evaluation_plugins?: string[];
  state: State;
  stage_id: number;
  user_id: string;
  ref_job_id: string;
  name: string;
  description: string;
  input_protein: string;
  meta: string[];
  lab_result: LabResult;
  options: Record<string, Record<string, OptionValue>>;
  is_notification_on: boolean;
  run_type: RunType;
  artifact: Record<string, object>;
}
