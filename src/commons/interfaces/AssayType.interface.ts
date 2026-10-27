export interface AssayType {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface AssayTypeSummary extends AssayType {
  job_count: number;
  result_count: number;
}

export interface AssayTypeInput {
  name: string;
  description: string;
}

export interface LibraryJob {
  job_id: string;
  job_name: string;
  completed_at: string;
  result_count: number;
}

export interface LibraryJobList {
  jobs: LibraryJob[];
  duplicates_collapsed: number;
}

export interface LibraryResult {
  id: string;
  protein_sequence: string;
  mutation_positions: string[] | null;
  actual_assay_score: number;
  measured_at: string;
  note: string;
}

export type LabSource = "upload" | "manual" | "library";

export interface LabRow {
  sequence: string;
  score: number;
  source?: LabSource;
  library_result_id?: string;
  library_job_name?: string;
}

export interface CsvDownload {
  blob: Blob;
  fileName: string;
  rowCount: number;
}
