export interface Content {
  number_of_jobs: {
    created: number;
    pending: number;
    ongoing: number;
    completed: number;
    failed: number;
  };
  recent_job: {
    id: string;
    name: string;
    description: string;
  };
}
