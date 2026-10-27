import {
  createJobConfig,
  defaultPipeline,
  Pipelines,
} from "../../../commons/configs/createJobConfig";
import {
  CreateJobDetail,
  JobConfiguration,
  JobOption,
  PipelineItem,
} from "../../../commons/interfaces/CreateJob.interface";

export function generateInitialJob(): JobOption {
  const initialJob = {} as JobOption;
  for (const pipeline of Pipelines) {
    const { method, subMethod } = pipeline;
    initialJob[method] = {};
    for (const tool of subMethod) {
      initialJob[method][tool] = {};
      const toolConfig = createJobConfig[method]?.tool?.[tool];
      if (toolConfig?.parameters) {
        for (const param of toolConfig.parameters) {
          if (param.type === "rangeNumber") {
            initialJob[method][tool][`${param.id}_low`] = param.low;
            initialJob[method][tool][`${param.id}_high`] = param.high;
          } else {
            initialJob[method][tool][param.id] = param.default;
          }
        }
      }
    }
  }
  return initialJob;
}

export function generateInitialJobConfig(
  jobConfig: JobConfiguration,
  stepConfig: number,
): {
  initialJobOption: JobOption;
  initialJobDetail: CreateJobDetail;
  pipelineItem: PipelineItem[];
} {
  const initialJobOption = {} as JobOption;
  const pipelineItem = defaultPipeline;

  // query result option
  if (stepConfig > 1 && jobConfig.options["query result"]) {
    initialJobOption["Protein Input"] = {};
    initialJobOption["Protein Input"]["Query Result"] =
      jobConfig.options["query result"];
  }

  jobConfig.meta.forEach((subMethod, index) => {
    const currentMethod = pipelineItem[index].method;
    initialJobOption[currentMethod] = {};

    Pipelines[index].subMethod.forEach((value) => {
      if (value.toLowerCase() === subMethod) {
        pipelineItem[index].subMethod = value;
        initialJobOption[currentMethod][value] = jobConfig.options[subMethod];
      }
    });
  });

  const artifact = {} as Record<string, object>;

  pipelineItem.forEach((value, index) => {
    if (index < stepConfig - 1)
      artifact[value.subMethod.toLowerCase()] =
        jobConfig.artifact[value.subMethod.toLowerCase()];
  });

  const initialJobDetail: CreateJobDetail = {
    name: jobConfig.name,
    description: jobConfig.description,
    input_protein: jobConfig.input_protein,
    lab_result: jobConfig.lab_result.sequences.map((sequence, index) => ({
      sequence: sequence,
      score: jobConfig.lab_result.scores[index],
      source:
        jobConfig.lab_result.sources?.[index] === "manual"
          ? ("manual" as const)
          : ("upload" as const),
    })),
    assay_type_id: jobConfig.assay_type_id,
    run_type: jobConfig.run_type,
    is_notification_on: jobConfig.is_notification_on,
    ref_job_id: jobConfig.ref_job_id,
    artifact: artifact,
  };

  return {
    initialJobOption: initialJobOption,
    initialJobDetail: initialJobDetail,
    pipelineItem: pipelineItem,
  };
}
