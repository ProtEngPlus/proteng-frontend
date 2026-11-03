import { pdf } from "@react-pdf/renderer";
import { Icon } from "@iconify/react";
import Button from "../../../../../commons/components/Button/Button";
import ProteinQuery from "../ProteinQuery/ProteinQuery";
import ProteinRepresentation from "../ProteinRepresentation/ProteinRepresentation";
import UploadLabInput from "../UploadLabInput/UploadLabInput";
import TopModel from "../TopModel/TopModel";
import Mutation from "../Mutation/Mutation";
import {
  CreateJobOption,
  PipelineItem,
  ReportJobDetail,
} from "../../../../../commons/interfaces/CreateJob.interface";
import { useFormContext } from "react-hook-form";
import ReportPDF from "../../../../../commons/components/ReportPDF/ReportPDF";
import { createJobConfig } from "../../../../../commons/configs/createJobConfig";
import { useAuth } from "../../../../../commons/hooks/useAuth";
import { ReportInterface } from "../../../../../commons/interfaces/Report.interface";
import NotificationToggle from "../../../../../commons/components/Job/NotificationToggle/NotificationToggle";

interface Props {
  isWithConfig: boolean;
  initialStep: number;
  pipeline: PipelineItem[];
  setPipeline: (p: PipelineItem[]) => void;
}

export default function Conclusion({
  isWithConfig,
  initialStep,
  pipeline,
  setPipeline,
}: Props) {
  const { watch, setValue } = useFormContext();
  const formData = watch();
  const { user } = useAuth();

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
    };

    const newJobOption: CreateJobOption = {} as CreateJobOption;
    const meta: string[] = [];

    for (const step of pipeline) {
      const { method, subMethod }: { method: string; subMethod: string } = step;
      meta.push(subMethod.toLowerCase());
      newJobOption[subMethod.toLowerCase()] = {};
      const jobConfig = createJobConfig[method].tool[subMethod].parameters;

      jobConfig.forEach((param) => {
        if (param.type === "rangeNumber") {
          newJobOption[subMethod.toLowerCase()][`${param.id}_low`] =
            formData[`${param.id}_low`];
          newJobOption[subMethod.toLowerCase()][`${param.id}_high`] =
            formData[`${param.id}_high`];
        } else {
          newJobOption[subMethod.toLowerCase()][param.id] = formData[param.id];
        }
      });
    }

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

  const is_notification_on = watch("is_notification_on");
  const run_type = watch("run_type");

  const onPDFDownload = async () => {
    const blob = await pdf(<ReportPDF jobData={getReportData()} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const today = new Date().toISOString().split("T")[0];
    link.download = `Report_${formData["name"]}_${today}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* for setting notification, run_type */}
      <div className="flex flex-row justify-between space-x-6">
        <h1 className="font-light text-pep-orange text-xl">Conclusion</h1>
        <div className="flex space-x-6 items-center">
          <NotificationToggle
            isOn={is_notification_on}
            runType={run_type}
            onToggle={() => setValue("is_notification_on", !is_notification_on)}
          />

          <div className="space-x-2">
            <Button
              id="auto-run"
              type="button"
              buttonType={run_type === "auto" ? "next" : "cancel"}
              text="Auto Run"
              className="inline-flex items-center whitespace-nowrap place-content-center text-center gap-2"
              onClick={() => setValue("run_type", "auto")}
            >
              <Icon
                icon="fa-solid:running"
                className={`w-[20px] h-[25px] ${
                  run_type === "auto" ? "text-white" : "text-pep-gray"
                }`}
              />
            </Button>
            <Button
              id="one-step-run"
              type="button"
              buttonType={run_type === "one-step" ? "next" : "cancel"}
              text="One-Step Run"
              className="inline-flex items-center whitespace-nowrap place-content-center text-center gap-2"
              onClick={() => setValue("run_type", "one-step")}
            >
              <Icon
                icon="ic:baseline-checklist-rtl"
                className={`size-[20px] ${
                  run_type === "one-step" ? "text-white" : "text-pep-gray"
                }`}
              />
            </Button>
          </div>
          <div className="flex items-center space-x-2" onClick={onPDFDownload}>
            <span>Download PDF</span>
            <div className="bg-pep-orange rounded-full p-[5px] cursor-pointer">
              <Icon
                icon="heroicons-outline:download"
                className="text-white size-[30px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* All steps */}
      <div className="rounded-lg border border-pep-gray-border px-6 py-8 space-y-11">
        <ProteinQuery
          step={1}
          initialStep={initialStep}
          pipeline={pipeline}
          setPipeline={setPipeline}
          isConclusion={true}
          onEditInfo={false}
          onEditOption={false}
          isWithConfig={isWithConfig}
        />

        <ProteinRepresentation
          step={2}
          initialStep={initialStep}
          pipeline={pipeline}
          setPipeline={setPipeline}
          isConclusion={true}
          onEdit={false}
        />

        <UploadLabInput
          initialStep={initialStep}
          step={3}
          isConclusion={true}
          onEdit={false}
        />

        <TopModel
          step={4}
          initialStep={initialStep}
          pipeline={pipeline}
          setPipeline={setPipeline}
          isConclusion={true}
          onEdit={false}
        />

        <Mutation
          step={5}
          initialStep={initialStep}
          pipeline={pipeline}
          setPipeline={setPipeline}
          isConclusion={true}
          onEdit={false}
        />
      </div>
    </div>
  );
}
