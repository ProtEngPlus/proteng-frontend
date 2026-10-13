import { Icon } from "@iconify/react";
import {
  MutationHistogram,
  MutationInterface,
} from "../../../interfaces/Mutation.interface";
import FitnessDistributionChartData from "../../../../pages/JobDetail/components/MutationResults/FitnessDistributionChart";
import { useState } from "react";
import HelperText from "../../CreateJob/InputField/HelperText";
import {
  PipelineItem,
  stepsForCreateJob,
} from "../../../interfaces/CreateJob.interface";
import {
  createJobConfig,
  defaultPipeline,
} from "../../../configs/createJobConfig";
import { describeMutationOptions } from "../../../utils/mutationRegions";

export default function MutationParameterSetup({
  mutation,
  isShowChart = false,
  chartLabels,
  chartSeries,
  currentStep = 3,
  pipeline = defaultPipeline,
}: {
  mutation: MutationInterface;
  isShowChart?: boolean;
  chartLabels?: string[];
  chartSeries?: MutationHistogram[];
  currentStep?: number;
  pipeline?: PipelineItem[];
}) {
  const [isRead, setRead] = useState(false);
  const mutationOptions = describeMutationOptions(mutation.options);
  const { method, subMethod }: { method: string; subMethod: string } =
    pipeline && currentStep !== undefined
      ? pipeline[currentStep]
      : { method: "", subMethod: "" };
  const jobConfig = createJobConfig[method].tool[subMethod];
  const HelperTextMethod = (
    <HelperText
      currentSubMethod={subMethod}
      jobConfig={jobConfig}
      step={currentStep ? currentStep + 1 : 4}
      stepsFormat={stepsForCreateJob}
    />
  );
  return (
    <div className="space-y-6 relative">
      <div
        className={`space-y-6 px-5 py-6 font-light rounded-lg h-fit bg-gray-50 drop-shadow-md ${isShowChart ? "grid grid-cols-[1fr,2fr] gap-4 " : ""}`}
      >
        <div className="space-y-7">
          <div className="flex w-full justify-between items-center">
            <div className="flex space-x-3 items-center">
              <Icon icon="ep:setting" className="text-pep-gray size-8" />
              <label>Parameter Setup</label>
            </div>
            <Icon
              icon="material-symbols:info-outline"
              className={`size-8 cursor-pointer ${
                isRead ? "text-pep-blue" : "text-pep-gray"
              } `}
              onClick={() => setRead(!isRead)}
            />
          </div>
          <div className="grid grid-cols-[4fr,5fr]">
            <label>Collection Name:</label>
            <label className="text-pep-blue">{mutation.name}</label>
          </div>
          {mutationOptions.map((option) => (
            <div key={option.label} className="grid grid-cols-[4fr,5fr]">
              <label>{option.label}:</label>
              <label>{option.text}</label>
            </div>
          ))}
        </div>
        {isShowChart &&
          chartLabels &&
          chartSeries &&
          chartSeries.length > 0 && (
            <div className="!mt-0 bg-white rounded-sm">
              <FitnessDistributionChartData
                chartLabels={chartLabels}
                chartSeries={chartSeries}
                isShowLegend={false}
              />
            </div>
          )}
      </div>
      {mutation.state === "FAILED" && (
        <div className="flex justify-center items-center p-5 text-red-500 bg-red-50 w-full font-normal">
          Error: Unable to mutate, click ‘rerun’ button to recompute
        </div>
      )}
      {/* Helper Text */}
      {isRead && (
        <div className="absolute inset-0 z-10 min-h-fit !my-16 space-y-6">
          <div className="bg-pep-blue-light rounded-lg px-5 pt-2 pb-5 min-h-fit mb-6">
            {HelperTextMethod}
          </div>
        </div>
      )}
    </div>
  );
}
