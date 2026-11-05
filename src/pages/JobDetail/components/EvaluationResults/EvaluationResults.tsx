import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import {
  getEvaluation,
  getJobEvaluations,
} from "../../../../commons/api/evaluation";
import {
  EvaluationMutantInterface,
  EvaluationPluginResultInterface,
  EvaluationRunDetailInterface,
  EvaluationRunInterface,
  EvaluationStateType,
} from "../../../../commons/interfaces/Evaluation.interface";
import { MutationResultInterface } from "../../../../commons/interfaces/Mutation.interface";
import Pagination from "../../../../commons/components/Pagination/Pagination";
import PageNumberDropDown from "../MutationResults/Input/PageNumberDropDown";
import { ProteinSequenceOverlay } from "../Overlay/ProteinSequenceOverlay";
import { formatDate } from "../../service/formatDate";
import Button from "../../../../commons/components/Button/Button";
import SelectInput from "../../../../commons/components/Input/SelectInput";
import { State } from "../../../../commons/interfaces/Job.interface";
import { RerunEvaluationOverlay } from "../Overlay/RerunEvaluationOverlay";
import { getErrorMessage } from "../../../../commons/api/utils";

const REFRESH_INTERVAL_MS = 5000;

const stateStyle: Record<
  EvaluationStateType,
  { name: string; className: string }
> = {
  PENDING: { name: "Pending", className: "text-pep-orange bg-yellow-100" },
  ONGOING: { name: "Ongoing", className: "text-pep-pink bg-pink-100" },
  COMPLETED: { name: "Completed", className: "text-pep-green bg-green-100" },
  FAILED: { name: "Failed", className: "text-error bg-red-100" },
};

function RunState({ state }: { state: EvaluationStateType }) {
  const style = stateStyle[state];
  return (
    <span
      className={clsx(
        "inline-block px-[10px] py-[3px] rounded-[30px] min-w-[94px] text-xs leading-5 text-center font-normal",
        style?.className,
      )}
    >
      {style?.name ?? state}
    </span>
  );
}

const formatValue = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(3);
  }
  if (value !== null && typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
};

function PluginCell({
  result,
  waitingLabel,
}: {
  result?: EvaluationPluginResultInterface;
  waitingLabel: string;
}) {
  if (!result) {
    return <span className="text-pep-gray">{waitingLabel}</span>;
  }
  if (result.state === "FAILED") {
    return (
      <span className="text-error" title={result.error}>
        Failed{result.error ? `: ${result.error}` : ""}
      </span>
    );
  }
  const entries = Object.entries(result.values ?? {});
  if (entries.length === 0) {
    return <span className="text-pep-gray">-</span>;
  }
  return (
    <div className="space-y-0.5">
      {entries.map(([key, value]) => (
        <div key={key} className="whitespace-nowrap">
          <span className="text-pep-dark-gray">{key}:</span>{" "}
          {formatValue(value)}
        </div>
      ))}
    </div>
  );
}

const waitingLabel = (run: EvaluationRunInterface, plugin: string) => {
  if (run.state !== "ONGOING") return "-";
  return run.plugins.indexOf(plugin) === run.current_plugin_index
    ? "Running"
    : "Waiting";
};

export default function EvaluationResults({
  jobid,
  jobState,
}: {
  jobid: string;
  jobState: State;
}) {
  const [runs, setRuns] = useState<EvaluationRunInterface[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState("");
  const [detail, setDetail] = useState<EvaluationRunDetailInterface | null>(
    null,
  );
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sequenceMutant, setSequenceMutant] =
    useState<MutationResultInterface | null>(null);
  const [runsVersion, setRunsVersion] = useState(0);
  const [isRerunVisible, setIsRerunVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const runForm = useForm<{ evaluation_run: string }>();
  const { setValue: setRunValue, watch: watchRun } = runForm;

  useEffect(() => {
    const subscription = watchRun((values, { name }) => {
      if (name !== "evaluation_run" || !values.evaluation_run) return;
      setSelectedRunId(values.evaluation_run);
      setCurrentPage(1);
    });
    return () => subscription.unsubscribe();
  }, [watchRun]);

  useEffect(() => {
    if (selectedRunId) setRunValue("evaluation_run", selectedRunId);
  }, [selectedRunId, setRunValue]);

  useEffect(() => {
    let isCancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let shouldPoll = false;
    setErrorMessage("");

    const load = async () => {
      try {
        const response = await getJobEvaluations(jobid);
        if (isCancelled) return;
        const list: EvaluationRunInterface[] = response?.data ?? [];
        shouldPoll =
          list.some((item) => item.state === "ONGOING") ||
          (jobState === "ONGOING" && list.length === 0);
        setRuns(list);
        setIsLoaded(true);
        const runId = list.some((item) => item.id === selectedRunId)
          ? selectedRunId
          : (list[0]?.id ?? "");
        if (runId) {
          const detailResponse = await getEvaluation(runId);
          if (isCancelled) return;
          if (!detailResponse.data) {
            throw new Error("No evaluation details were returned");
          }
          setDetail(detailResponse.data);
        } else {
          setDetail(null);
        }
        setSelectedRunId(runId);
        setErrorMessage("");
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(
            getErrorMessage(error) || "Unable to load evaluations",
          );
        }
      } finally {
        if (!isCancelled && shouldPoll) {
          timer = setTimeout(load, REFRESH_INTERVAL_MS);
        }
      }
    };

    void load();
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [jobid, jobState, selectedRunId, runsVersion]);

  const isOngoing = detail?.run.state === "ONGOING";

  const run = detail?.run.id === selectedRunId ? detail.run : undefined;
  const hasOngoingRun = runs.some((item) => item.state === "ONGOING");
  const canRerun =
    isLoaded && !errorMessage && jobState === "COMPLETED" && !hasOngoingRun;
  const rerunHint =
    jobState !== "COMPLETED"
      ? "Evaluation can be run after the job is completed"
      : hasOngoingRun
        ? "Wait until the running evaluation finishes"
        : undefined;
  const mutants: EvaluationMutantInterface[] = [
    ...(run ? (detail?.mutants ?? []) : []),
  ].sort(
    (a, b) => b.mutation_result.assay_score - a.mutation_result.assay_score,
  );
  const totalPages = Math.ceil(mutants.length / itemsPerPage);
  const pageRows = mutants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="rounded-lg border border-pep-gray-border px-6 py-8 font-light space-y-6">
      <RerunEvaluationOverlay
        isVisible={isRerunVisible}
        rerunEvaluationProps={{
          jobid,
          onClose: () => setIsRerunVisible(false),
          onStarted: (started) => {
            setIsRerunVisible(false);
            if (started?.id) setSelectedRunId(started.id);
            setCurrentPage(1);
            setRunsVersion((version) => version + 1);
          },
        }}
      />
      <ProteinSequenceOverlay
        isVisible={sequenceMutant !== null}
        proteinSequenceProps={{ onClose: () => setSequenceMutant(null) }}
        proteinSequence={sequenceMutant?.protein_sequence ?? ""}
        mutationPositions={sequenceMutant?.mutation_positions ?? []}
      />
      <div className="flex justify-between items-center border-l-4 border-pep-orange pl-6 text-xl gap-x-5">
        <div>Evaluation</div>
        <div className="flex items-center gap-5 text-sm">
          <button
            type="button"
            className="text-pep-blue underline"
            onClick={() => setRunsVersion((version) => version + 1)}
          >
            Refresh
          </button>
          {runs.length > 0 && (
            <div className="flex items-center gap-3">
              <label htmlFor="evaluation_run" className="text-pep-dark-gray">
                Evaluation run
              </label>
              <FormProvider {...runForm}>
                <div className="w-[360px] text-base">
                  <SelectInput
                    id="evaluation_run"
                    defaultValue={selectedRunId}
                    options={runs.map((item) => ({
                      label: `${formatDate(item.created_at)} · ${item.plugins.join(", ")}${item.rerun ? " · rerun" : ""}`,
                      value: item.id,
                    }))}
                  />
                </div>
              </FormProvider>
            </div>
          )}
          <Button
            id="rerun-evaluation"
            type="button"
            buttonType="next"
            text={runs.length > 0 ? "Rerun Evaluation" : "Run Evaluation"}
            className="w-fit text-base inline-flex items-center whitespace-nowrap place-content-center text-center gap-2 disabled:opacity-50"
            disabled={!canRerun}
            title={rerunHint}
            onClick={() => setIsRerunVisible(true)}
          >
            <Icon icon="ic:round-refresh" className="size-6" />
          </Button>
        </div>
      </div>
      <hr />

      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-error"
        >
          {errorMessage}
        </div>
      )}
      {!isLoaded && !errorMessage && <div>Loading evaluation runs...</div>}
      {isLoaded && !errorMessage && runs.length === 0 && (
        <div className="text-center">
          <div className="text-label text-xl">No evaluation run was found</div>
          <div className="font-light text-pep-gray">
            Evaluation runs after mutation when the job has evaluation plugins.
            A completed job can also be evaluated with Run Evaluation.
          </div>
        </div>
      )}

      {run && (
        <>
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <RunState state={run.state} />
              <div>
                <span className="text-pep-dark-gray">Plugins:</span>{" "}
                {run.plugins.join(", ")}
              </div>
              <div>
                <span className="text-pep-dark-gray">Started:</span>{" "}
                {formatDate(run.created_at)}
              </div>
              {run.state !== "ONGOING" && (
                <div>
                  <span className="text-pep-dark-gray">Finished:</span>{" "}
                  {formatDate(run.complete_at)}
                </div>
              )}
              {(isOngoing || hasOngoingRun) && (
                <div className="flex items-center gap-1 text-pep-gray">
                  <Icon
                    icon="ic:round-refresh"
                    width="16"
                    height="16"
                    className="animate-spin"
                  />
                  Refreshing every {REFRESH_INTERVAL_MS / 1000} s
                </div>
              )}
            </div>
            <PageNumberDropDown
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
          {run.state === "FAILED" && run.error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-error">
              {run.error}
            </div>
          )}
          <div className="relative overflow-auto rounded-xl border border-pep-gray-border shadow-table">
            <table className="w-full text-xs text-left">
              <thead className="leading-6 bg-blue-50 border-b h-[60px]">
                <tr>
                  {["Mutation Positions", "", "Predicted", ...run.plugins].map(
                    (title, index) => (
                      <th
                        key={index}
                        className="font-normal px-3 py-3 text-base"
                      >
                        {title}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="font-light leading-7">
                {pageRows.map(({ mutation_result: mutant, results }) => (
                  <tr key={mutant.id} className="bg-white border-b h-[60px]">
                    <td className="px-3 py-3 truncate max-w-[220px]">
                      {mutant.mutation_positions.join(", ")}
                    </td>
                    <td className="px-3 py-3 text-pep-blue whitespace-nowrap">
                      <button
                        type="button"
                        className="flex gap-1 underline items-center"
                        onClick={() => setSequenceMutant(mutant)}
                      >
                        View Sequence
                        <Icon
                          icon="iconamoon:eye-thin"
                          width="20"
                          height="20"
                        />
                      </button>
                    </td>
                    <td className="px-3 py-3">{mutant.assay_score}</td>
                    {run.plugins.map((plugin) => (
                      <td key={plugin} className="px-3 py-3 max-w-[260px]">
                        <PluginCell
                          result={results[plugin]}
                          waitingLabel={waitingLabel(run, plugin)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}
