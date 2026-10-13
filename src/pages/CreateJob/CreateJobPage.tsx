import { useNavigate } from "react-router-dom";
import { useAuth } from "../../commons/hooks/useAuth";
import { useEffect, useState } from "react";
import {
  CreateJobInterface,
  CreateJobDetail,
  CreateJobOption,
  JobOption,
  PipelineItem,
  stepsForCreateJob,
  JobConfiguration,
} from "../../commons/interfaces/CreateJob.interface";
import {
  createJobConfig,
  defaultCreateJobDetail,
  defaultPipeline,
} from "../../commons/configs/createJobConfig";
import {
  generateInitialJob,
  generateInitialJobConfig,
} from "./services/CreateJobConfig";
import { FieldValues, FormProvider, useForm } from "react-hook-form";
import CreateJobWithConfig from "./component/CreateJobOption/CreateJobWithConfig";
import CreateJob from "./component/CreateJobOption/CreateJob";
import Stepper from "../../commons/components/CreateJob/Stepper/Stepper";
import ProteinQuery from "./component/CreateJobForm/ProteinQuery/ProteinQuery";
import ProteinRepresentation from "./component/CreateJobForm/ProteinRepresentation/ProteinRepresentation";
import TopModel from "./component/CreateJobForm/TopModel/TopModel";
import Mutation from "./component/CreateJobForm/Mutation/Mutation";
import Button from "../../commons/components/Button/Button";
import Conclusion from "./component/CreateJobForm/Conclusion/Conclusion";
import UploadLabInput from "./component/CreateJobForm/UploadLabInput/UploadLabInput";
import {
  ConfirmOverlay,
  ConfirmOverlayProps,
} from "../../commons/components/ModalOverlay/ConfirmOverlay";
import {
  SuccessOverlay,
  SuccessOverlayProps,
} from "../../commons/components/ModalOverlay/SuccessOverlay";
import { createJob } from "../../commons/api/job";
import { QueryResult } from "../../commons/interfaces/QueryResult.interface";
import { getAllQueryResults } from "../../commons/api/queryResult";

export default function CreateJobPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isWithConfig, setIsWithConfig] = useState(false);
  const [initialStep, setInitialStep] = useState(1);
  const [step, setStep] = useState(0);
  const [pipeline, setPipeline] = useState<PipelineItem[]>(defaultPipeline);
  const [jobDetail, setJobDetail] = useState<CreateJobDetail>(
    defaultCreateJobDetail,
  );
  const [jobOption, setJobOption] = useState<JobOption>(generateInitialJob());
  const [queryResult, setQueryResult] = useState<QueryResult>(); // for adding query result in create job request body

  // fetch query result
  useEffect(() => {
    const fetchQueryResults = async () => {
      if (isWithConfig && initialStep > 1 && jobDetail) {
        try {
          const data = await getAllQueryResults({
            job_id: jobDetail.ref_job_id,
          });
          if (data?.data) {
            setQueryResult(data.data[0]);
          }
        } catch (error) {
          console.error("Error fetching query results:", error);
        }
      }
    };

    fetchQueryResults();
  }, [isWithConfig, initialStep, jobDetail]);

  const form = useForm({
    mode: "onChange",
    defaultValues: {
      file_name: "",
      input_protein_field: jobDetail.input_protein,
      initial_input_protein: jobDetail.input_protein,
      ...jobDetail,
      ...jobOption,
    },
  });
  const { handleSubmit, reset } = form;

  // generate initial job
  const initialJobOption = (job?: JobConfiguration, stepConfig?: number) => {
    if (!isWithConfig) {
      setInitialStep(1);
      setJobOption(generateInitialJob());
      setPipeline(defaultPipeline);
      setInitialStep(1);
      setStep(1);
    } else if (job && stepConfig) {
      const data = generateInitialJobConfig(job, stepConfig);
      reset({
        ...data.initialJobDetail,
        ...data.initialJobOption,
        input_protein_field: data.initialJobDetail.input_protein,
        initial_input_protein: data.initialJobDetail.input_protein,
        file_name: job.lab_result.total > 0 ? "recent_lab_result" : "",
      });

      setJobOption(data.initialJobOption);
      setJobDetail(data.initialJobDetail);
      setPipeline(data.pipelineItem);
      setInitialStep(stepConfig);
      setStep(stepConfig);
    }
  };

  // for change step
  const handleBack = () => {
    setStep(step - 1);
  };
  const changeStep = (nextStep: number) => {
    handleSubmit(() => {
      if (nextStep <= stepsForCreateJob.length) {
        setStep(nextStep);
      }
    })();
  };

  // update info after clicking confirm (conclusion)
  const updateInfo = (): Promise<{
    detail: CreateJobDetail;
    option: CreateJobOption;
    meta: string[];
  }> => {
    return new Promise((resolve, reject) => {
      const newJobOption = {} as CreateJobOption;
      const meta = [] as string[];

      handleSubmit(
        (data: FieldValues) => {
          try {
            // Update jobDetail
            const newJobDetail: CreateJobDetail = {
              artifact: data["artifact"],
              ref_job_id: data["ref_job_id"],
              description: data["description"],
              input_protein: data["input_protein"],
              is_notification_on: data["is_notification_on"],
              lab_result: data["lab_result"],
              name: data["name"],
              run_type: data["run_type"],
            };

            // Update newJobInfo
            for (const step of pipeline) {
              const {
                method,
                subMethod,
              }: { method: string; subMethod: string } = step;
              meta.push(subMethod.toLowerCase());
              newJobOption[subMethod.toLowerCase()] = {};
              const jobConfig =
                createJobConfig[method].tool[subMethod].parameters;

              jobConfig.forEach((param) => {
                if (param.type === "rangeNumber") {
                  newJobOption[subMethod.toLowerCase()][`${param.id}_low`] =
                    Number(data[`${param.id}_low`]);
                  newJobOption[subMethod.toLowerCase()][`${param.id}_high`] =
                    Number(data[`${param.id}_high`]);
                } else if (
                  param.type === "dropdown" &&
                  typeof param.default === "number"
                ) {
                  newJobOption[subMethod.toLowerCase()][param.id] = Number(
                    data[param.id],
                  );
                } else {
                  newJobOption[subMethod.toLowerCase()][param.id] =
                    data[param.id];
                }
              });
            }

            resolve({ detail: newJobDetail, option: newJobOption, meta: meta });
          } catch (error) {
            reject(error);
          }
        },
        (errors) => {
          reject(errors);
        },
      )();
    });
  };

  // click confirm at conclusion step
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const ConfirmProps: ConfirmOverlayProps = {
    id: "confirm-create-job",
    onClose: () => {
      setIsConfirmVisible(false);
    },
    onConfirm: async () => {
      setIsConfirmVisible(false);
      const { detail, option, meta } = await updateInfo();
      const { lab_result, ...otherDetails } = detail;
      const labResult = lab_result.reduce(
        (acc, item) => {
          acc.sequences.push(item.sequence);
          acc.scores.push(item.score);
          acc.total++;
          return acc;
        },
        { total: 0, sequences: [] as string[], scores: [] as number[] },
      );

      const newJob: CreateJobInterface = {
        user_id: user?.id ?? "",
        stage_id: initialStep < 4 ? initialStep - 1 : initialStep - 2,
        options: option,
        lab_result: labResult,
        ...otherDetails,
        meta: meta,
        query_result: initialStep > 1 && queryResult ? queryResult : undefined,
      };

      console.log(newJob);

      try {
        await createJob(newJob);
        setIsSuccessVisible(true);
      } catch (error) {
        console.error(error);
      }
    },
    title: "Do you want to create this job?",
    message: "You can modify this setup later from the job detail page.",
  };

  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const SuccessProps: SuccessOverlayProps = {
    id: "success-create-job",
    onClose: () => {
      setIsSuccessVisible(false);
      navigate("/dashboard");
    },
    title: "Job Successfully Created",
  };

  return (
    <div className="h-full items-center justify-center">
      <ConfirmOverlay
        isVisible={isConfirmVisible}
        confirmProps={ConfirmProps}
      />
      <SuccessOverlay
        isVisible={isSuccessVisible}
        successProps={SuccessProps}
      />
      {/*------------------------------------------- Create Job Option --------------------------------------------*/}
      {step === 0 && !isWithConfig && (
        <CreateJob
          createJob={() => initialJobOption()}
          createJobWithConfig={() => setIsWithConfig(true)}
        />
      )}
      {step === 0 && isWithConfig && (
        <CreateJobWithConfig
          onCancel={() => setIsWithConfig(false)}
          onConfirm={(job: JobConfiguration | undefined, step: string) => {
            setInitialStep(Number(step));
            initialJobOption(job, Number(step));
          }}
        />
      )}
      {/*--------------------------------------------- Create Job Form -------------------------------------------*/}
      {step > 0 && (
        <div>
          <Stepper step={step} changeStep={setStep} />
          {step < 6 && (
            <h1 className="font-light text-pep-orange text-xl">
              {stepsForCreateJob[step - 1]}
            </h1>
          )}
          {/* ------------------- Context for each step ---------------------- */}

          <FormProvider {...form}>
            <form className="py-5 gap-5 min-w-fit min-h-fit">
              {step < 6 && (
                <div className="rounded-lg border border-pep-gray-border px-6 py-8 space-y-2">
                  {step === 1 && (
                    <ProteinQuery
                      isWithConfig={isWithConfig}
                      initialStep={initialStep}
                      pipeline={pipeline}
                      setPipeline={setPipeline}
                      step={step}
                      queryResult={queryResult}
                      setQueryResult={setQueryResult}
                    />
                  )}
                  {step === 2 && (
                    <ProteinRepresentation
                      initialStep={initialStep}
                      pipeline={pipeline}
                      setPipeline={setPipeline}
                      step={step}
                    />
                  )}
                  {step === 3 && (
                    <UploadLabInput initialStep={initialStep} step={step} />
                  )}

                  {step === 4 && (
                    <TopModel
                      initialStep={initialStep}
                      pipeline={pipeline}
                      setPipeline={setPipeline}
                      step={step}
                    />
                  )}
                  {step === 5 && (
                    <Mutation
                      initialStep={initialStep}
                      pipeline={pipeline}
                      setPipeline={setPipeline}
                      step={step}
                    />
                  )}
                </div>
              )}
              {step === 6 && (
                <Conclusion
                  isWithConfig={isWithConfig}
                  initialStep={initialStep}
                  pipeline={pipeline}
                  setPipeline={setPipeline}
                />
              )}

              {/* ------------------- Button for each step ---------------------- */}
              <div className="flex justify-between gap-2 py-5">
                <Button
                  type="button"
                  id="handleBack"
                  buttonType="cancel"
                  text="Cancel"
                  onClick={handleBack}
                />
                {step === 6 ? (
                  <Button
                    id="handleConfirm"
                    buttonType="submit"
                    type="button"
                    text="Confirm"
                    onClick={() => setIsConfirmVisible(true)}
                  />
                ) : (
                  <Button
                    type="button"
                    id="handleNext"
                    buttonType="next"
                    text="Next"
                    onClick={() => changeStep(step + 1)}
                  />
                )}
              </div>
            </form>
          </FormProvider>
        </div>
      )}
    </div>
  );
}
