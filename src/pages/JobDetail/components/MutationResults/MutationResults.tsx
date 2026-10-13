import { useEffect, useState } from "react";
import {
  CreateMutationInterface,
  MutationInterface,
  MutationHistogram,
  MutationSearchParams,
} from "../../../../commons/interfaces/Mutation.interface";
import { OptionValue } from "../../../../commons/interfaces/Job.interface";
import {
  createMutation,
  deleteMutation,
  getAllMutations,
  getMutationHistogram,
  runMutation,
} from "../../../../commons/api/mutation";
import FitnessDistributionChartData from "./FitnessDistributionChart";
import Button from "../../../../commons/components/Button/Button";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  NewMutationOverlay,
  NewMutationProps,
} from "../Overlay/NewMutationOverlay";
import { PipelineItem } from "../../../../commons/interfaces/CreateJob.interface";
import { useFormContext } from "react-hook-form";
import {
  createJobConfig,
  defaultPipeline,
} from "../../../../commons/configs/createJobConfig";
import MutationTable from "./MutationTable";
import MutationParameterSetup from "../../../../commons/components/Mutation/MutationParameterSetup/MutationParameterSetup";
import { getTotalTime } from "../../../Dashboard/service/getTotalTime";
import {
  DeleteOverlay,
  DeleteOverlayProps,
} from "../../../../commons/components/ModalOverlay/DeleteOverlay";
import MutationProteinSequenceSection from "./MutationProteinSequenceSection";
import {
  buildChartLabels,
  DEFAULT_SCORE_RANGE,
} from "../../../../commons/utils/histogram";

export default function MutationResults({
  jobid,
  inputProtein,
  currentStep = 3,
  pipeline = defaultPipeline,
}: {
  jobid: string;
  inputProtein: string;
  currentStep: number;
  pipeline: PipelineItem[];
}) {
  const { watch } = useFormContext();
  const [chartSeries, setChartSeries] = useState<MutationHistogram[]>([]);
  const chartLabels = buildChartLabels(
    chartSeries[0]?.min ?? DEFAULT_SCORE_RANGE[0],
    chartSeries[0]?.max ?? DEFAULT_SCORE_RANGE[1],
  );
  const [mutations, setMutations] = useState<MutationInterface[]>([]);
  const [currentMutation, setCurrentMutation] =
    useState<MutationInterface | null>(null);
  const [fetchMutation, setFetchMutation] = useState(false);
  const [isNewMutationVisible, setIsNewMutationVisible] = useState(false);
  const [isBookmarkOnly, setIsBookmarkOnly] = useState(false);
  const [isSelectCollection, setIsSelectCollection] = useState(false);
  const [isDeleteVisible, setDeleteVisible] = useState(false);

  const refresh = () => {
    setFetchMutation(true);
    setIsSelectCollection(false);
  };

  const NewMutationProps: NewMutationProps = {
    onClose: () => {
      setIsNewMutationVisible(false);
    },
    onConfirm: async (name) => {
      setIsNewMutationVisible(false);

      try {
        const data = watch();
        const options = {} as Record<string, OptionValue>;

        const { method, subMethod }: { method: string; subMethod: string } =
          pipeline[currentStep];
        const jobConfig = createJobConfig[method].tool[subMethod].parameters;

        jobConfig.forEach((param) => {
          if (param.type === "rangeNumber") {
            options[`${param.id}_low`] = data[`${param.id}_low`];
            options[`${param.id}_high`] = data[`${param.id}_high`];
          } else {
            options[param.id] = data[param.id];
          }
        });

        const newMutation: CreateMutationInterface = {
          name,
          job_id: jobid,
          input_protein: inputProtein,
          options: options,
          tool: subMethod.toLowerCase(),
        };
        await createMutation(newMutation);
        refresh();
      } catch (error) {
        console.error("Failed to create new mutation:", error);
      }
    },
  };

  const handleRunMutation = async (mutation: MutationInterface) => {
    await runMutation(mutation.id);
    refresh();
  };

  const handleDelete = (mutation: MutationInterface) => {
    setCurrentMutation(mutation);
    setDeleteVisible(true);
  };
  const DeleteProps: DeleteOverlayProps = {
    id: "delete-job",
    onClose: () => {
      setDeleteVisible(false);
    },
    onDelete: async () => {
      if (currentMutation) {
        await deleteMutation(currentMutation.id);
      }
      setDeleteVisible(false);
      refresh();
    },
    title: "Do you want to delete this mutation collection?",
    children: (
      <div className="flex flex-col font-light mt-4 gap-y-2">
        <label>
          Collection name: {currentMutation?.name} <br />
        </label>
        <label className="text-red-500">
          Delete the mutate will delete all this mutate's bookmark
        </label>
      </div>
    ),
  };

  useEffect(() => {
    const fetchChartData = async () => {
      // Call the API to get FitnessDistributionChart data
      if (jobid) {
        const { data } = await getMutationHistogram(jobid);
        if (data) {
          setChartSeries(data);
        }
      }
    };
    fetchChartData();
    setFetchMutation(false);
  }, [fetchMutation, mutations]);

  useEffect(() => {
    const params: MutationSearchParams = isBookmarkOnly
      ? { job_id: jobid, is_bookmark: true }
      : { job_id: jobid };

    getAllMutations(params)
      .then((response) => setMutations(response.data || []))
      .catch(console.error);

    setFetchMutation(false);
    setCurrentMutation(null);
  }, [fetchMutation, isBookmarkOnly]);

  return (
    <div>
      <NewMutationOverlay
        isVisible={isNewMutationVisible}
        newMutationProps={NewMutationProps}
        currentStep={currentStep}
        pipeline={pipeline}
        inputProtein={inputProtein}
      />
      <DeleteOverlay isVisible={isDeleteVisible} deleteProps={DeleteProps} />
      <div className="rounded-lg border border-pep-gray-border px-6 py-8 font-light">
        {!isSelectCollection && (
          <div className="space-y-6">
            <div className="w-full min-w-fit flex justify-between items-center border-l-4 border-pep-orange pl-6 font-light text-xl gap-x-5">
              <div>Mutation</div>
              <Button
                id="new-mutation"
                type="button"
                buttonType={"next"}
                text="New Mutation"
                className="w-fit text-base inline-flex items-center whitespace-nowrap place-content-center text-center gap-2"
                onClick={() => {
                  setIsNewMutationVisible(true);
                }}
              >
                <Icon icon="basil:add-outline" className="size-6" />
              </Button>
            </div>
            <hr />

            <FitnessDistributionChartData
              chartLabels={chartLabels}
              chartSeries={chartSeries}
            />

            <div className="flex justify-start items-center py-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded-md border-pep-blue border cursor-pointer"
                  checked={isBookmarkOnly}
                  onChange={() => setIsBookmarkOnly((prev) => !prev)}
                />
                <div className="text-md font-normal text-gray-500">
                  show bookmark only
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <MutationTable
                mutations={mutations}
                refresh={refresh}
                currentMutation={currentMutation}
                setCurrentMutation={setCurrentMutation}
                setIsSelectCollection={setIsSelectCollection}
                handleRunMutation={handleRunMutation}
                handleDelete={handleDelete}
              />
              {currentMutation && (
                <MutationParameterSetup
                  mutation={currentMutation}
                  isShowChart={false}
                />
              )}
            </div>
          </div>
        )}
        {isSelectCollection && currentMutation && (
          <div className="space-y-6">
            <div className="w-full min-w-fit flex justify-start items-center text-xl">
              <div
                className="flex items-center gap-x-5 text-xl cursor-pointer"
                onClick={() => setIsSelectCollection(false)}
              >
                <Icon icon="weui:back-outlined" className="w-3.5 h-7" />
                <div>Mutation</div>
              </div>
            </div>
            <hr />
            {currentMutation.state !== "ONGOING" ? (
              <>
                <div className="w-full min-w-fit flex justify-between items-center border-l-4 border-pep-orange pl-6 font-light text-xl gap-x-5">
                  <div className="flex justify-between items-center w-2/5">
                    <div>{currentMutation.name}</div>
                    <div className="text-gray-500 text-base font-light">
                      Run Time:{" "}
                      {getTotalTime(
                        currentMutation.created_at,
                        currentMutation.complete_at,
                      )}{" "}
                      Minutes
                    </div>
                  </div>
                  <div className="flex space-x-4 items-center">
                    <Icon
                      icon="ic:round-refresh"
                      className={`size-7 ${
                        currentMutation.state === "FAILED"
                          ? "text-pep-gray cursor-pointer"
                          : "text-pep-gray-border cursor-not-allowed"
                      }`}
                      onClick={() => {
                        if (currentMutation.state === "FAILED")
                          handleRunMutation(currentMutation);
                      }}
                    />
                    <Icon
                      icon="streamline:delete-1-solid"
                      className="text-error size-5 self-center cursor-pointer"
                      onClick={() => handleDelete(currentMutation)}
                    />
                  </div>
                </div>

                <MutationParameterSetup
                  mutation={currentMutation}
                  isShowChart={true}
                  chartLabels={chartLabels}
                  chartSeries={chartSeries.filter(
                    (s) => s.mutation_id === currentMutation.id,
                  )}
                  currentStep={currentStep}
                  pipeline={pipeline}
                />

                <MutationProteinSequenceSection
                  mutationId={currentMutation.id}
                  mutationName={currentMutation.name}
                  inputProtein={currentMutation.input_protein}
                />
              </>
            ) : (
              <div className="text-gray-500 text-base font-light">
                Mutation collection {currentMutation.name} is running...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
