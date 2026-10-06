import { pdf } from "@react-pdf/renderer";
import html2canvas from "html2canvas";
import { useEffect, useMemo, useRef, useState } from "react";
import Stepper from "../../../../commons/components/JobDetail/Stepper/Stepper";
import {
  JobInterface,
  Steps,
} from "../../../../commons/interfaces/Job.interface";
import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "../../../../commons/components/Button/Button";
import { useFormContext } from "react-hook-form";
import {
  createJobConfig,
  defaultPipeline,
  Pipelines,
} from "../../../../commons/configs/createJobConfig";
import {
  ConfirmOverlay,
  ConfirmOverlayProps,
} from "../../../../commons/components/ModalOverlay/ConfirmOverlay";
import {
  SuccessOverlay,
  SuccessOverlayProps,
} from "../../../../commons/components/ModalOverlay/SuccessOverlay";
import ProteinQuery from "./JobDetailForm/ProteinQuery";
import ProteinRepresentation from "./JobDetailForm/ProteinRepresentation";
import TopModel from "./JobDetailForm/TopModel";
import Mutation from "./JobDetailForm/Mutation";
import {
  SaveConfigOverlay,
  SaveConfigProps,
} from "../Overlay/SaveConfigOverlay";
import {
  CreateJobConfiguration,
  CreateJobOption,
  PipelineItem,
  ReportJobDetail,
} from "../../../../commons/interfaces/CreateJob.interface";
import {
  createJobConfiguration,
  updateJobDetail,
} from "../../../../commons/api/job";
import {
  QueryResult,
  QueryResultSearchParams,
  Result,
} from "../../../../commons/interfaces/QueryResult.interface";
import {
  getAllQueryResults,
  getReportQueryResults,
  updateQueryResult,
} from "../../../../commons/api/queryResult";
import { ReportInterface } from "../../../../commons/interfaces/Report.interface";
import { useAuth } from "../../../../commons/hooks/useAuth";
import ReportPDF from "../../../../commons/components/ReportPDF/ReportPDF";
import FitnessDistributionChartData from "../MutationResults/FitnessDistributionChart";
import { getMutationHistogram } from "../../../../commons/api/mutation";
import { MutationHistogram } from "../../../../commons/interfaces/Mutation.interface";
import {
  buildChartLabels,
  DEFAULT_SCORE_RANGE,
} from "../../../../commons/utils/histogram";
import { createRoot } from "react-dom/client";
import JSZip from "jszip";

export default function Pipeline({
  job,
  isEditPipeline,
  setIsEditPipeline,
  fetchJob,
}: {
  job: JobInterface;
  isEditPipeline: boolean;
  setIsEditPipeline: (isEditPipeline: boolean) => void;
  fetchJob: () => void;
}) {
  const { setValue, watch, getValues } = useFormContext();
  const formData = watch();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(job.stage_id);
  const [isOpen, setIsOpen] = useState(false);
  const [pipeline, setPipeline] = useState<PipelineItem[]>(defaultPipeline);
  const [queryResult, setQueryResult] = useState<QueryResult>();

  useEffect(() => {
    const updatedPipeline = [...pipeline];

    job.meta.forEach((subMethod, index) => {
      Pipelines[index].subMethod.forEach((value) => {
        if (value.toLowerCase() === subMethod || value === subMethod) {
          updatedPipeline[index] = {
            ...updatedPipeline[index],
            subMethod: value,
          };
        }
      });
    });
    setPipeline(updatedPipeline);
  }, [job.meta]);

  // handle click outside for ...'s button
  useEffect(() => {
    const handleClickOutSide = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".custome-select") &&
        !target.closest(".dropdown-menu")
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutSide);
    return () => {
      document.removeEventListener("mousedown", handleClickOutSide);
    };
  });

  const jobConfig = useMemo(() => {
    return createJobConfig[Steps[currentStep]]?.tool[
      pipeline[currentStep].subMethod
    ];
  }, [currentStep, pipeline]);

  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const ConfirmProps: ConfirmOverlayProps = {
    id: "confirm-update-job",
    onClose: () => {
      setIsConfirmVisible(false);
    },
    onConfirm: async () => {
      await handleJobUpdate();
      fetchJob();
    },
    title: "Do you want to confirm edit?",
    message: "You made changes to this job configuration.",
  };

  const handleJobUpdate = async () => {
    try {
      if (currentStep == 0 && job.stage_id == 1 && queryResult) {
        await updateQueryResult(queryResult.id, queryResult);
      }
      const data = watch();
      const newJobOption = {} as CreateJobOption;
      const meta = [] as string[];
      // Update newJobInfo
      for (const step of pipeline) {
        const { method, subMethod }: { method: string; subMethod: string } =
          step;
        meta.push(subMethod.toLowerCase());
        newJobOption[subMethod.toLowerCase()] = {};
        const jobConfig = createJobConfig[method].tool[subMethod].parameters;
        const jobOptions = job["options"][subMethod.toLowerCase()] || {};

        jobConfig.forEach((param) => {
          if (param.type === "rangeNumber") {
            newJobOption[subMethod.toLowerCase()][`${param.id}_low`] =
              data[`${param.id}_low`] ?? jobOptions[`${param.id}_low`];

            newJobOption[subMethod.toLowerCase()][`${param.id}_high`] =
              data[`${param.id}_high`] ?? jobOptions[`${param.id}_high`];
          } else if (param.type == "percent") {
            const num = Number(data[param.id]);
            newJobOption[subMethod.toLowerCase()][param.id] = isNaN(num)
              ? jobOptions[param.id]
              : num;
          } else if (param.type === "multiNumberDropdown") {
            let array: number[] = [];

            const value = data[param.id];
            if (Array.isArray(value)) {
              array = value
                .filter((v): v is number => typeof v === "number")
                .sort((n1, n2) => n1 - n2);
            }
            newJobOption[subMethod.toLowerCase()][param.id] =
              array.length === 0 ? jobOptions[param.id] : array;
          } else {
            newJobOption[subMethod.toLowerCase()][param.id] =
              data[param.id] ?? jobOptions[param.id];
          }
        });
      }

      await updateJobDetail(job.id, {
        meta: meta,
        options: newJobOption,
        input_protein: getValues("input_protein") ?? job.input_protein,
      });

      setIsConfirmVisible(false);
      setIsSuccessVisible(true);
    } catch (error) {
      console.error("Failed to update job:", error);
    }
  };

  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const SuccessProps: SuccessOverlayProps = {
    id: "success-update-job",
    onClose: () => {
      setIsSuccessVisible(false);
      setIsEditPipeline(false);
    },
    title: "Job Successfully Updated",
  };

  const [isSaveConfigVisible, setIsSaveConfigVisible] = useState(false);
  const SaveConfigProps: SaveConfigProps = {
    onClose: () => {
      setIsSaveConfigVisible(false);
    },
    onConfirm: async (name, description) => {
      setIsSaveConfigVisible(false);
      const jobConfig: CreateJobConfiguration = {
        name: name,
        description: description,
        ref_job_id: job.id,
        state: job.state,
        stage_id: job.stage_id,
        artifact: job.artifact ?? {},
        input_protein: job.input_protein,
        meta: job.meta,
        options: job.options,
        lab_result: job.lab_result,
        run_type: job.run_type,
        is_notification_on: job.is_notification_on,
        user_id: job.user_id,
      };

      if (jobConfig.options.mmseqs2) {
        const covMode = jobConfig.options.mmseqs2.cov_mode;
        if (typeof covMode === "string") {
          jobConfig.options.mmseqs2.cov_mode = parseInt(covMode, 10);
        }
      }

      await createJobConfiguration(jobConfig);
    },
  };

  const runType = watch("run_type");
  const isNotificationOn = watch("is_notification_on");

  // last values saved on the job, so loading the page does not write and bump updated_at
  const savedSettings = useRef({
    run_type: job.run_type,
    is_notification_on: job.is_notification_on,
  });

  useEffect(() => {
    if (runType === undefined || isNotificationOn === undefined) return;
    const saved = savedSettings.current;
    if (
      runType === saved.run_type &&
      isNotificationOn === saved.is_notification_on
    )
      return;

    const updateJob = async () => {
      await updateJobDetail(job.id, {
        run_type: runType,
        is_notification_on: isNotificationOn,
      });
      savedSettings.current = {
        run_type: runType,
        is_notification_on: isNotificationOn,
      };
    };

    updateJob();
  }, [runType, isNotificationOn, job.id]);

  const getReportData = () => {
    const newJobDetail: ReportJobDetail = {
      artifact: formData["artifact"],
      ref_job_id: formData["ref_job_id"],
      description: formData["description"],
      input_protein: formData["input_protein"],
      is_notification_on: formData["is_notification_on"],
      lab_result: formData["lab_result"],
      name: formData["name"],
      run_type: formData["run_type"],
      run_time: formData["run_time"],
    };

    const newJobOption: CreateJobOption = formData["options"];
    const meta: string[] = formData["meta"];

    const { lab_result, ...otherDetails } = newJobDetail;
    const labResult = lab_result;

    const newJob: ReportInterface = {
      user_id: user?.id ?? "",
      username: user ? `${user.name} ${user.surname}` : "",
      options: newJobOption,
      lab_result: labResult,
      ...otherDetails,
      meta: meta,
    };

    return newJob;
  };

  const onPDFDownload = async () => {
    try {
      let chartSeries: { name: string; data: number[] }[] = [];
      let chartLabels = buildChartLabels(
        DEFAULT_SCORE_RANGE[0],
        DEFAULT_SCORE_RANGE[1],
      );

      if (formData) {
        const { data } = await getMutationHistogram(formData["id"]);
        const hist: MutationHistogram[] = data || [];
        if (hist.length > 0) {
          chartSeries = hist.map(({ name, data: d }) => ({ name, data: d }));
          chartLabels = buildChartLabels(
            hist[0].min ?? DEFAULT_SCORE_RANGE[0],
            hist[0].max ?? DEFAULT_SCORE_RANGE[1],
          );
        }
      }

      const hiddenDiv = document.createElement("div");
      hiddenDiv.style.position = "fixed";
      hiddenDiv.style.left = "-9999px";
      hiddenDiv.style.top = "0";

      document.body.appendChild(hiddenDiv);

      // Render the chart inside the hidden div
      const chartContainer = document.createElement("div");
      chartContainer.id = "hidden-chart";
      hiddenDiv.appendChild(chartContainer);

      const root = createRoot(chartContainer);
      root.render(
        <FitnessDistributionChartData
          chartLabels={chartLabels}
          chartSeries={chartSeries}
        />,
      );

      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(chartContainer);
      const chartImage = canvas.toDataURL("image/png");

      root.unmount();
      document.body.removeChild(hiddenDiv);

      const params: QueryResultSearchParams = {
        job_id: job.id,
      };

      const today = new Date().toISOString().split("T")[0];

      const response = await getAllQueryResults(params);
      const queryResults: Result[] = response.data
        ? response.data[0].result
        : [];

      const pdfBlob = await pdf(
        <ReportPDF
          jobData={getReportData()}
          chart={chartImage}
          queryResultData={queryResults}
        />,
      ).toBlob();

      const zip = new JSZip();
      zip.file(`Report_${formData["name"]}_${today}.pdf`, pdfBlob);

      if (response.data) {
        const queryResultResponse = await getReportQueryResults(job.id); // CSV blob
        const csvBlob = new Blob([queryResultResponse], { type: "text/csv" });
        zip.file(`QueryResult_${formData["name"]}_${today}.csv`, csvBlob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;

      link.download = `Report_${formData["name"]}_${today}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <ConfirmOverlay
        confirmProps={ConfirmProps}
        isVisible={isConfirmVisible}
      />
      <SuccessOverlay
        successProps={SuccessProps}
        isVisible={isSuccessVisible}
      />
      <SaveConfigOverlay
        isVisible={isSaveConfigVisible}
        saveConfigProps={SaveConfigProps}
      />
      <div className="space-y-8">
        <div className="space-y-24">
          <div className="flex space-x-6 items-center justify-end">
            <Icon
              data-testid={`isnotification-${isNotificationOn}`}
              icon={
                isNotificationOn
                  ? "carbon:notification-filled"
                  : "carbon:notification-off-filled"
              }
              className={` ${
                job.state === "COMPLETED"
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              }  size-[30px] ${
                isNotificationOn ? "text-pep-orange" : "text-error"
              }`}
              onClick={() =>
                job.state !== "COMPLETED" &&
                setValue("is_notification_on", !isNotificationOn)
              }
            />
            <div className="flex space-x-2 items-center">
              <Button
                data-testid={`auto-run-${runType === "auto"}`}
                id="auto-run"
                disabled={job.state === "COMPLETED"}
                type="button"
                buttonType={runType === "auto" ? "next" : "cancel"}
                text="Auto Run"
                className="inline-flex items-center whitespace-nowrap place-content-center text-center gap-2"
                onClick={() => setValue("run_type", "auto")}
              >
                <Icon
                  icon="fa-solid:running"
                  className={`w-[20px] h-[25px] ${
                    runType === "auto" ? "text-white" : "text-pep-gray"
                  }`}
                />
              </Button>
              <Button
                data-testid={`one-step-run-${runType === "one-step"}`}
                id="one-step-run"
                disabled={job.state === "COMPLETED"}
                type="button"
                buttonType={runType === "one-step" ? "next" : "cancel"}
                text="One-Step Run"
                className="inline-flex items-center whitespace-nowrap place-content-center text-center gap-2"
                onClick={() => setValue("run_type", "one-step")}
              >
                <Icon
                  icon="ic:baseline-checklist-rtl"
                  className={`size-[20px] ${
                    runType === "one-step" ? "text-white" : "text-pep-gray"
                  }`}
                />
              </Button>
            </div>
            <Icon
              icon="pepicons-pencil:dots-x"
              className="size-5 text-labwl cursor-pointer"
              onClick={() => {
                setIsOpen(!isOpen);
              }}
            />
            {isOpen && (
              <ul className="dropdown-menu mt-[7rem] absolute w-[232px] min-w-fit bg-white rounded-md shadow-dropShadow z-10 py-2">
                <li
                  key="downlad-pdf"
                  className="px-5 py-2 font-light text-label hover:text-pep-blue hover:bg-pep-blue-light cursor-pointer"
                  onClick={() => {
                    if (isEditPipeline) {
                      setIsOpen(false);
                      setIsConfirmVisible(true);
                    } else {
                      setIsOpen(false);
                      {
                        onPDFDownload();
                      }
                    }
                  }}
                >
                  Download PDF
                </li>
                <li
                  key="save-config"
                  className={`px-5 py-2 font-light text-label ${
                    job.state === "COMPLETED"
                      ? "cursor-pointer hover:text-pep-blue hover:bg-pep-blue-light"
                      : "cursor-not-allowed"
                  }`}
                  onClick={() => {
                    if (isEditPipeline) {
                      setIsOpen(false);
                      setIsConfirmVisible(true);
                    } else if (job.state === "COMPLETED") {
                      setIsOpen(false);
                      setIsSaveConfigVisible(true);
                    }
                  }}
                >
                  Save Job's Configuration
                </li>
              </ul>
            )}
          </div>
          <div className="space-y-7">
            {job.stage_id === 2 &&
              job.state === "FAILED" &&
              job.lab_result.total === 0 && (
                <div className="text-error w-fit mx-auto bg-red-50 p-5">
                  Error: No Lab Input Uploaded yet, Please upload your lab input
                </div>
              )}
            <Stepper
              state={job.state}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              stageId={job.stage_id}
              handleChange={() => {
                if (isEditPipeline) {
                  setIsConfirmVisible(true);
                  return false;
                }
                return true;
              }}
            />
          </div>
        </div>
        <div className="rounded-lg border border-pep-gray-border px-6 py-8">
          {currentStep === 0 && (
            <ProteinQuery
              isEdit={isEditPipeline}
              currentStep={currentStep}
              disable={job.stage_id > 0}
              handleChange={() =>
                isEditPipeline
                  ? setIsConfirmVisible(true)
                  : setIsEditPipeline(true)
              }
              jobConfig={jobConfig}
              stageId={job.stage_id}
              state={job.state}
              pipeline={pipeline}
              setPipeline={setPipeline}
              queryResult={queryResult}
              setQueryResult={setQueryResult}
            />
          )}
          {currentStep === 1 && (
            <ProteinRepresentation
              isEdit={isEditPipeline}
              stageId={job.stage_id}
              currentStep={currentStep}
              disable={
                job.stage_id > 1 ||
                (job.state === "ONGOING" && job.stage_id === 1)
              }
              handleChange={() =>
                isEditPipeline
                  ? setIsConfirmVisible(true)
                  : setIsEditPipeline(true)
              }
              jobConfig={jobConfig}
              pipeline={pipeline}
              setPipeline={setPipeline}
            />
          )}
          {currentStep === 2 && (
            <TopModel
              isEdit={isEditPipeline}
              stageId={job.stage_id}
              currentStep={currentStep}
              disable={
                job.stage_id > 2 ||
                (job.state === "ONGOING" && job.stage_id === 2)
              }
              handleChange={() =>
                isEditPipeline
                  ? setIsConfirmVisible(true)
                  : setIsEditPipeline(true)
              }
              jobConfig={jobConfig}
              pipeline={pipeline}
              setPipeline={setPipeline}
            />
          )}
          {currentStep === 3 && (
            <Mutation
              isEdit={isEditPipeline}
              stageId={job.stage_id}
              currentStep={currentStep}
              disable={
                job.stage_id === 3 &&
                (job.state === "COMPLETED" || job.state === "ONGOING")
              }
              handleChange={() =>
                isEditPipeline
                  ? setIsConfirmVisible(true)
                  : setIsEditPipeline(true)
              }
              jobConfig={jobConfig}
              pipeline={pipeline}
              setPipeline={setPipeline}
            />
          )}
        </div>
      </div>
    </div>
  );
}
