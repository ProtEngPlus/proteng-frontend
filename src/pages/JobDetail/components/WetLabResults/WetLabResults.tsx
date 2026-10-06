import { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import dayjs from "dayjs";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  deleteExperimentalResult,
  getAllExperimentalResults,
  getAllMutationResult,
  getAllMutations,
  upsertExperimentalResult,
} from "../../../../commons/api/mutation";
import {
  ExperimentalResultInterface,
  MutationResultInterface,
} from "../../../../commons/interfaces/Mutation.interface";
import { rmse, spearman } from "../../../../commons/utils/assayStats";
import Pagination from "../../../../commons/components/Pagination/Pagination";
import PageNumberDropDown from "../MutationResults/Input/PageNumberDropDown";
import { ProteinSequenceOverlay } from "../Overlay/ProteinSequenceOverlay";

type Draft = { actual: string; note: string; measured: string };
type Status = { text: string; isError: boolean };

const toDraft = (result?: ExperimentalResultInterface): Draft => ({
  actual: result ? String(result.actual_assay_score) : "",
  note: result?.note ?? "",
  measured: result ? dayjs(result.measured_at).format("YYYY-MM-DD") : "",
});

const fieldClass =
  "w-full rounded-lg border border-pep-gray-border px-2 py-1.5 text-xs font-light focus:border-pep-blue focus:ring-pep-blue";

export default function WetLabResults({ jobid }: { jobid: string }) {
  const [mutants, setMutants] = useState<MutationResultInterface[]>([]);
  const [collectionNames, setCollectionNames] = useState<
    Record<string, string>
  >({});
  const [saved, setSaved] = useState<
    Record<string, ExperimentalResultInterface>
  >({});
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [isBookmarkOnly, setIsBookmarkOnly] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sequenceMutant, setSequenceMutant] =
    useState<MutationResultInterface | null>(null);

  useEffect(() => {
    Promise.all([
      getAllMutationResult({ job_id: jobid }),
      getAllExperimentalResults(jobid),
      getAllMutations({ job_id: jobid }),
    ])
      .then(([mutantResponse, resultResponse, mutationResponse]) => {
        const results: Record<string, ExperimentalResultInterface> = {};
        (resultResponse?.data ?? []).forEach(
          (result: ExperimentalResultInterface) =>
            (results[result.mutation_result_id] = result),
        );
        const list: MutationResultInterface[] = (
          mutantResponse?.data ?? []
        ).sort(
          (a: MutationResultInterface, b: MutationResultInterface) =>
            b.assay_score - a.assay_score,
        );
        const names: Record<string, string> = {};
        (mutationResponse?.data ?? []).forEach(
          (mutation: { id: string; name: string }) =>
            (names[mutation.id] = mutation.name),
        );
        setMutants(list);
        setSaved(results);
        setCollectionNames(names);
        setDrafts(
          Object.fromEntries(list.map((m) => [m.id, toDraft(results[m.id])])),
        );
      })
      .catch(console.error);
  }, [jobid]);

  const editDraft = (id: string, change: Partial<Draft>) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...change } }));

  const showStatus = (id: string, text: string, isError = false) => {
    setStatus((prev) => ({ ...prev, [id]: { text, isError } }));
    setTimeout(
      () =>
        setStatus((prev) =>
          prev[id]?.text === text
            ? { ...prev, [id]: { text: "", isError } }
            : prev,
        ),
      2000,
    );
  };

  const handleSave = async (mutant: MutationResultInterface) => {
    const draft = drafts[mutant.id];
    const actual = Number(draft.actual);
    if (draft.actual.trim() === "" || !isFinite(actual)) {
      showStatus(mutant.id, "Enter a score", true);
      return;
    }
    try {
      const response = await upsertExperimentalResult(mutant.id, {
        actual_assay_score: actual,
        note: draft.note,
        ...(draft.measured && {
          measured_at: dayjs(draft.measured).toISOString(),
        }),
      });
      const result = response.data as unknown as ExperimentalResultInterface;
      setSaved((prev) => ({ ...prev, [mutant.id]: result }));
      editDraft(mutant.id, toDraft(result));
      showStatus(mutant.id, "Saved");
    } catch (error) {
      console.error(error);
      showStatus(mutant.id, "Save failed", true);
    }
  };

  const handleClear = async (mutant: MutationResultInterface) => {
    try {
      await deleteExperimentalResult(mutant.id);
      setSaved((prev) => {
        const next = { ...prev };
        delete next[mutant.id];
        return next;
      });
      editDraft(mutant.id, toDraft());
    } catch (error) {
      console.error(error);
      showStatus(mutant.id, "Clear failed", true);
    }
  };

  const shown = isBookmarkOnly ? mutants.filter((m) => m.is_bookmark) : mutants;
  const totalPages = Math.ceil(shown.length / itemsPerPage);
  const pageRows = shown.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const measured = shown.filter((m) => saved[m.id]);
  const predicted = measured.map((m) => m.assay_score);
  const actual = measured.map((m) => saved[m.id].actual_assay_score);

  return (
    <div className="rounded-lg border border-pep-gray-border px-6 py-8 font-light space-y-6">
      <ProteinSequenceOverlay
        isVisible={sequenceMutant !== null}
        proteinSequenceProps={{ onClose: () => setSequenceMutant(null) }}
        proteinSequence={sequenceMutant?.protein_sequence ?? ""}
        mutationPositions={sequenceMutant?.mutation_positions ?? []}
      />
      <div className="flex justify-between items-center border-l-4 border-pep-orange pl-6 text-xl gap-x-5">
        <div>Wet-lab Results</div>
        <div className="text-sm text-pep-dark-gray">
          {measured.length} of {shown.length} measured
        </div>
      </div>
      <hr />

      {mutants.length === 0 ? (
        <div className="text-center">
          <div className="text-label text-xl">No mutation result was found</div>
          <div className="font-light text-pep-gray">
            Run a mutation collection in the Mutation Results tab to record lab
            scores here
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <input
                id="wet-lab-bookmark-only"
                type="checkbox"
                className="w-5 h-5 rounded-md border-pep-blue border cursor-pointer"
                checked={isBookmarkOnly}
                onChange={() => {
                  setIsBookmarkOnly((prev) => !prev);
                  setCurrentPage(1);
                }}
              />
              <label
                htmlFor="wet-lab-bookmark-only"
                className="text-md font-normal text-gray-500 cursor-pointer"
              >
                show bookmark only
              </label>
            </div>
            <PageNumberDropDown
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
          <div className="relative overflow-auto rounded-xl border border-pep-gray-border shadow-table">
            <table className="w-full text-xs text-left">
              <thead className="leading-6 bg-blue-50 border-b h-[60px]">
                <tr>
                  {[
                    "",
                    "Collection",
                    "Mutation Positions",
                    "",
                    "Predicted",
                    "Actual",
                    "Note",
                    "Measured At",
                    "",
                  ].map((title, index) => (
                    <th key={index} className="font-normal px-3 py-3 text-base">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-light leading-7">
                {shown.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-3 py-6 text-center text-pep-gray"
                    >
                      No bookmarked mutant. Bookmark mutants in the Mutation
                      Results tab or turn off the filter.
                    </td>
                  </tr>
                )}
                {pageRows.map((mutant) => {
                  const draft = drafts[mutant.id] ?? toDraft();
                  return (
                    <tr key={mutant.id} className="bg-white border-b h-[60px]">
                      <td className="pl-3 py-3">
                        <Icon
                          icon="cil:bookmark"
                          aria-label={
                            mutant.is_bookmark ? "Bookmarked" : "Not bookmarked"
                          }
                          className={`text-xl ${mutant.is_bookmark ? "text-pep-orange" : "text-pep-gray-border"}`}
                        />
                      </td>
                      <td className="px-3 py-3">
                        {collectionNames[mutant.mutation_id] ?? "-"}
                      </td>
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
                      <td className="px-3 py-3 min-w-[100px]">
                        <input
                          type="number"
                          step="any"
                          aria-label="Actual assay score"
                          className={fieldClass}
                          value={draft.actual}
                          placeholder="-"
                          onChange={(e) =>
                            editDraft(mutant.id, { actual: e.target.value })
                          }
                        />
                      </td>
                      <td className="px-3 py-3 min-w-[160px]">
                        <input
                          type="text"
                          aria-label="Note"
                          className={fieldClass}
                          value={draft.note}
                          placeholder="Optional"
                          onChange={(e) =>
                            editDraft(mutant.id, { note: e.target.value })
                          }
                        />
                      </td>
                      <td className="px-3 py-3 min-w-[140px]">
                        <input
                          type="date"
                          aria-label="Measured at"
                          className={fieldClass}
                          value={draft.measured}
                          onChange={(e) =>
                            editDraft(mutant.id, { measured: e.target.value })
                          }
                        />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg bg-pep-blue hover:bg-pep-blue-hover text-white"
                          onClick={() => handleSave(mutant)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg text-error hover:bg-red-50 disabled:text-pep-gray disabled:hover:bg-transparent disabled:cursor-not-allowed"
                          disabled={!saved[mutant.id]}
                          onClick={() => handleClear(mutant)}
                        >
                          Clear
                        </button>
                        <span
                          className={`ml-1 ${status[mutant.id]?.isError ? "text-error" : "text-pep-green"}`}
                        >
                          {status[mutant.id]?.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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

          <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
            <PredictedActualChart
              names={measured.map((m) => m.mutation_positions.join(", "))}
              predicted={predicted}
              actual={actual}
            />
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
              <StatCard
                title="Spearman ρ"
                value={measured.length >= 3 ? spearman(predicted, actual) : NaN}
                hint="Rank agreement, closer to 1 is better"
                color="text-pep-blue"
              />
              <StatCard
                title="RMSE"
                value={measured.length ? rmse(predicted, actual) : NaN}
                hint="Average gap, lower is better"
                color="text-pep-orange"
              />
              <StatCard
                title="n"
                value={measured.length}
                hint="Mutants with a lab score"
                color="text-black"
                isCount
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
  color,
  isCount = false,
}: {
  title: string;
  value: number;
  hint: string;
  color: string;
  isCount?: boolean;
}) {
  return (
    <div className="p-4 rounded-xl shadow-statistic">
      <div className="text-sm text-label">{title}</div>
      <div className={`text-3xl ${color}`}>
        {isCount ? value : isFinite(value) ? value.toFixed(2) : "-"}
      </div>
      <div className="text-xs text-pep-gray">{hint}</div>
    </div>
  );
}

function PredictedActualChart({
  names,
  predicted,
  actual,
}: {
  names: string[];
  predicted: number[];
  actual: number[];
}) {
  const all = predicted.concat(actual);
  const low = all.length ? Math.floor(Math.min(...all) * 2) / 2 : 0;
  const high = all.length
    ? Math.max(Math.ceil(Math.max(...all) * 2) / 2, low + 0.5)
    : 1;

  const series: ApexAxisChartSeries = predicted.length
    ? [
        {
          name: "Mutant",
          type: "scatter",
          data: predicted.map((x, i) => ({ x, y: actual[i] })),
        },
        {
          name: "y = x",
          type: "line",
          data: [
            { x: low, y: low },
            { x: high, y: high },
          ],
        },
      ]
    : [];

  const options: ApexOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Mitr",
      animations: { enabled: false },
    },
    colors: ["#2578D3", "#9CA3AF"],
    stroke: { width: [0, 1.5], dashArray: [0, 6] },
    markers: { size: [7, 0] },
    grid: { borderColor: "#F1F1F1", strokeDashArray: 3 },
    xaxis: {
      type: "numeric",
      tickAmount: Math.round((high - low) * 2),
      min: low,
      max: high,
      decimalsInFloat: 1,
      title: { text: "Predicted assay score" },
    },
    yaxis: {
      min: low,
      max: high,
      decimalsInFloat: 1,
      title: { text: "Actual assay score" },
    },
    legend: { position: "bottom", horizontalAlign: "left" },
    tooltip: {
      shared: false,
      intersect: true,
      custom: ({ seriesIndex, dataPointIndex }) =>
        seriesIndex
          ? ""
          : `<div class="px-3 py-2 text-xs">${names[dataPointIndex]}<br>predicted ${predicted[dataPointIndex].toFixed(2)} · actual ${actual[dataPointIndex].toFixed(2)}</div>`,
    },
    noData: { text: "Enter lab scores to compare with predictions" },
  };

  return (
    <div className="p-4 border border-pep-light-gray rounded-md [&_.apexcharts-xaxis-label]:!inline">
      <div className="text-pep-blue text-2xl font-medium">
        Predicted vs Actual
      </div>
      <div className="text-pep-dark-blue text-sm">
        Points on the dashed line match the prediction exactly
      </div>
      <ReactApexChart
        type="line"
        options={options}
        series={series}
        height={360}
      />
    </div>
  );
}
