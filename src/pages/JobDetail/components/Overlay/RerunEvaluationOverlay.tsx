import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
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
        setSelectedPlugins(list);
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

  const togglePlugin = (plugin: string) =>
    setSelectedPlugins((prev) =>
      prev.includes(plugin)
        ? prev.filter((item) => item !== plugin)
        : plugins.filter((item) => item === plugin || prev.includes(item)),
    );

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
              <div className="grid grid-cols-[1fr,2fr] gap-x-3 items-start">
                <div>Plugins:</div>
                <div className="space-y-2">
                  {isLoading && (
                    <div className="text-pep-gray">Loading plugins...</div>
                  )}
                  {!isLoading && !errorMessage && plugins.length === 0 && (
                    <div className="text-pep-gray">No plugin is available</div>
                  )}
                  {plugins.map((plugin) => (
                    <div key={plugin} className="flex items-center gap-3">
                      <input
                        id={`rerun-plugin-${plugin}`}
                        type="checkbox"
                        className="w-5 h-5 rounded-md border-pep-blue border cursor-pointer"
                        checked={selectedPlugins.includes(plugin)}
                        onChange={() => togglePlugin(plugin)}
                      />
                      <label
                        htmlFor={`rerun-plugin-${plugin}`}
                        className="cursor-pointer"
                      >
                        {plugin}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-[1fr,2fr] gap-x-3 items-center">
                <label htmlFor="rerun-mutation">Mutation collection:</label>
                <select
                  id="rerun-mutation"
                  className="h-[50px] px-3 bg-white border border-pep-gray-border font-light rounded-md focus:border-pep-blue focus:ring-pep-blue"
                  value={mutationId}
                  onChange={(e) => setMutationId(e.target.value)}
                >
                  <option value="">Latest completed collection</option>
                  {mutations.map((mutation) => (
                    <option key={mutation.id} value={mutation.id}>
                      {mutation.name}
                    </option>
                  ))}
                </select>
              </div>
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
