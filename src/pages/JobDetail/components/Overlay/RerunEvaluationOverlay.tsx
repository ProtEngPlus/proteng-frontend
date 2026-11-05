import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import EvaluationPluginSelector from "../../../../commons/components/EvaluationPluginSelector/EvaluationPluginSelector";
import EvaluationDropdown from "../../../../commons/components/EvaluationPluginSelector/EvaluationDropdown";
import Button from "../../../../commons/components/Button/Button";
import {
  getEvaluationPlugins,
  rerunEvaluation,
} from "../../../../commons/api/evaluation";
import { getAllMutations } from "../../../../commons/api/mutation";
import { getErrorMessage, isResponseOk } from "../../../../commons/api/utils";
import { EvaluationRunInterface } from "../../../../commons/interfaces/Evaluation.interface";
import { MutationInterface } from "../../../../commons/interfaces/Mutation.interface";

export type RerunEvaluationProps = {
  jobid: string;
  onClose: () => void;
  onStarted: (run?: EvaluationRunInterface) => void;
};

export function RerunEvaluationOverlay({
  isVisible,
  rerunEvaluationProps,
}: {
  isVisible: boolean;
  rerunEvaluationProps: RerunEvaluationProps;
}) {
  const { jobid, onClose, onStarted } = rerunEvaluationProps;
  const [plugins, setPlugins] = useState<string[]>([]);
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);
  const [mutations, setMutations] = useState<MutationInterface[]>([]);
  const [mutationId, setMutationId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    let isCancelled = false;
    setErrorMessage("");
    setMutationId("");
    setPlugins([]);
    setSelectedPlugins([]);
    setMutations([]);
    setIsLoading(true);
    Promise.all([getEvaluationPlugins(), getAllMutations({ job_id: jobid })])
      .then(([pluginResponse, mutationResponse]) => {
        if (isCancelled) return;
        if (!mutationResponse || !isResponseOk(mutationResponse)) {
          throw new Error(
            mutationResponse?.message ||
              mutationResponse?.error ||
              "Unable to load mutation collections",
          );
        }
        const list: string[] = pluginResponse?.data ?? [];
        setPlugins(list);
        setMutations(
          ((mutationResponse?.data ?? []) as MutationInterface[])
            .filter((mutation) => mutation.state === "COMPLETED")
            .sort((a, b) => b.run_id - a.run_id),
        );
      })
      .catch((error) => {
        if (!isCancelled)
          setErrorMessage(
            getErrorMessage(error) || "Unable to load evaluation options",
          );
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });
    return () => {
      isCancelled = true;
    };
  }, [isVisible, jobid]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const response = await rerunEvaluation(jobid, {
        plugins: selectedPlugins,
        ...(mutationId && { mutation_id: mutationId }),
      });
      onStarted(response.data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    isVisible && (
      <div
        id="#rerun-evaluation-modal"
        className="fixed top-0 right-0 left-0 z-[90] flex justify-center items-center w-full h-full bg-gray-900/50 mt-0"
      >
        <div className="space-y-5 place-items-center place-self-center w-[55%] place-content-center text-center">
          <div className="bg-pep-blue-light opacity-100 px-5 py-8 m-auto z-[100] space-y-8">
            <div className="flex space-x-3 place-self-center items-center">
              <Icon
                icon="ic:round-refresh"
                className="text-pep-dark-gray size-8 min-w-8"
              />
              <span className="text-2xl text-pep-dark-gray">
                Rerun Evaluation
              </span>
            </div>

            <div className="bg-white rounded-lg p-8 font-light text-start space-y-6">
              <div className="grid grid-cols-[1fr,2fr] gap-x-3 items-center">
                <label id="rerun-mutation-label" htmlFor="rerun-mutation">
                  Mutation collection:
                </label>
                <EvaluationDropdown
                  id="rerun-mutation"
                  labelId="rerun-mutation-label"
                  options={[
                    { label: "Latest completed collection", value: "" },
                    ...mutations.map((mutation) => ({
                      label: mutation.name,
                      value: mutation.id,
                    })),
                  ]}
                  value={mutationId}
                  className="!w-full"
                  disabled={isLoading || isSubmitting}
                  onSelect={setMutationId}
                />
              </div>
              <EvaluationPluginSelector
                key={`${jobid}-${isVisible}`}
                id="rerun-evaluation-plugins"
                variant="dialog"
                emptyText="Select at least one plugin to run."
                plugins={plugins}
                selected={selectedPlugins}
                onChange={setSelectedPlugins}
                isLoading={isLoading}
                hasRegistryError={plugins.length === 0 && !!errorMessage}
                disabled={isSubmitting}
              />
              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-lg bg-red-50 px-4 py-3 text-sm text-error"
                >
                  {errorMessage}
                </div>
              )}
            </div>

            <div className="flex space-x-8 place-self-center">
              <Button
                id="cancel-rerun-evaluation"
                buttonType="cancel"
                text="Cancel"
                disabled={isSubmitting}
                onClick={onClose}
              />
              <Button
                id="confirm-rerun-evaluation"
                buttonType="submit"
                text={isSubmitting ? "Starting..." : "Run"}
                className="!font-light"
                disabled={
                  isLoading || isSubmitting || selectedPlugins.length === 0
                }
                onClick={handleConfirm}
              />
            </div>
          </div>
        </div>
      </div>
    )
  );
}
