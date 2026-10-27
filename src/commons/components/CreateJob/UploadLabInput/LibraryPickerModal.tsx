import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import Button from "../../Button/Button";
import { getLibraryJobs, getLibraryResults } from "../../../api/assayType";
import {
  LabRow,
  LibraryJob,
  LibraryResult,
} from "../../../interfaces/AssayType.interface";

interface Props {
  isVisible: boolean;
  assayTypeId: string;
  takenSequences: Set<string>;
  selected: LabRow[];
  onClose: () => void;
  onConfirm: (rows: LabRow[]) => void;
}

export default function LibraryPickerModal({
  isVisible,
  assayTypeId,
  takenSequences,
  selected,
  onClose,
  onConfirm,
}: Props) {
  const [jobs, setJobs] = useState<LibraryJob[]>([]);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState<Record<string, LibraryResult[]>>({});
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const [picked, setPicked] = useState<Record<string, LabRow>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isVisible) return;
    setPicked(
      Object.fromEntries(
        selected
          .filter((row) => row.library_result_id)
          .map((row) => [row.library_result_id as string, row]),
      ),
    );
    setLoaded({});
    setOpened({});
    setSearch("");
    setMessage("");
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !assayTypeId) return;
    const timer = setTimeout(() => {
      getLibraryJobs(assayTypeId, search.trim())
        .then((list) => setJobs(list.jobs))
        .catch((error) => {
          console.error(error);
          setMessage("Could not load the library.");
        });
    }, 250);
    return () => clearTimeout(timer);
  }, [isVisible, assayTypeId, search]);

  const isTaken = (result: LibraryResult) =>
    takenSequences.has(result.protein_sequence.toUpperCase());

  const loadResults = async (job: LibraryJob): Promise<LibraryResult[]> => {
    if (loaded[job.job_id]) return loaded[job.job_id];
    const results = await getLibraryResults(assayTypeId, job.job_id);
    setLoaded((previous) => ({ ...previous, [job.job_id]: results }));
    return results;
  };

  const toRow = (result: LibraryResult, job: LibraryJob): LabRow => ({
    sequence: result.protein_sequence,
    score: result.actual_assay_score,
    source: "library",
    library_result_id: result.id,
    library_job_name: job.job_name,
  });

  const toggleOpen = async (job: LibraryJob) => {
    const isOpen = !opened[job.job_id];
    setOpened((previous) => ({ ...previous, [job.job_id]: isOpen }));
    if (isOpen) {
      try {
        await loadResults(job);
      } catch (error) {
        console.error(error);
        setMessage("Could not load the results.");
      }
    }
  };

  const toggleJob = async (job: LibraryJob) => {
    try {
      const results = (await loadResults(job)).filter((r) => !isTaken(r));
      const allPicked = results.every((r) => picked[r.id]);
      setPicked((previous) => {
        const next = { ...previous };
        results.forEach((result) => {
          if (allPicked) delete next[result.id];
          else next[result.id] = toRow(result, job);
        });
        return next;
      });
    } catch (error) {
      console.error(error);
      setMessage("Could not load the results.");
    }
  };

  const toggleResult = (result: LibraryResult, job: LibraryJob) =>
    setPicked((previous) => {
      const next = { ...previous };
      if (next[result.id]) delete next[result.id];
      else next[result.id] = toRow(result, job);
      return next;
    });

  const pickedCount = Object.keys(picked).length;

  const jobState = useMemo(() => {
    const state: Record<string, "all" | "some" | "none"> = {};
    jobs.forEach((job) => {
      const results = loaded[job.job_id];
      if (!results) {
        state[job.job_id] = "none";
        return;
      }
      const selectable = results.filter((r) => !isTaken(r));
      const count = selectable.filter((r) => picked[r.id]).length;
      state[job.job_id] =
        count === 0 ? "none" : count === selectable.length ? "all" : "some";
    });
    return state;
  }, [jobs, loaded, picked, takenSequences]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/50">
      <div
        role="dialog"
        aria-label="Add from library"
        className="flex max-h-[80vh] w-[720px] max-w-full flex-col space-y-4 rounded-lg border border-pep-gray-border bg-white p-6 shadow-dropShadow"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl">Add from library</h1>
          <Icon
            icon="mingcute:close-line"
            className="size-6 cursor-pointer text-pep-gray"
            onClick={onClose}
          />
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search job name"
          className="w-full rounded-lg border border-pep-gray-border px-3 py-2 font-light focus:border-pep-blue focus:ring-pep-blue"
        />
        {message && <p className="text-sm text-error">{message}</p>}
        <div className="min-h-[200px] grow space-y-2 overflow-y-auto">
          {jobs.length === 0 && (
            <p className="py-10 text-center font-light text-pep-gray">
              No library results for this assay score type yet.
            </p>
          )}
          {jobs.map((job) => (
            <div
              key={job.job_id}
              className="rounded-lg border border-pep-gray-border"
            >
              <div className="flex items-center space-x-3 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label={`Select all of ${job.job_name}`}
                  checked={jobState[job.job_id] === "all"}
                  ref={(element) => {
                    if (element)
                      element.indeterminate = jobState[job.job_id] === "some";
                  }}
                  onChange={() => toggleJob(job)}
                />
                <button
                  type="button"
                  className="flex grow items-center justify-between text-left"
                  onClick={() => toggleOpen(job)}
                >
                  <span className="truncate">{job.job_name}</span>
                  <span className="flex items-center space-x-3 text-sm font-light text-pep-gray">
                    <span>
                      {job.completed_at && dayjs(job.completed_at).year() > 1
                        ? dayjs(job.completed_at).format("DD MMM YYYY")
                        : ""}
                    </span>
                    <span>{job.result_count} results</span>
                    <Icon
                      icon={
                        opened[job.job_id]
                          ? "mingcute:up-line"
                          : "mingcute:down-line"
                      }
                    />
                  </span>
                </button>
              </div>
              {opened[job.job_id] && (
                <div className="border-t border-pep-gray-border">
                  {(loaded[job.job_id] ?? []).map((result) => (
                    <label
                      key={result.id}
                      className={`flex items-center space-x-3 px-6 py-2 text-sm font-light ${
                        isTaken(result)
                          ? "cursor-not-allowed text-pep-gray"
                          : "cursor-pointer"
                      }`}
                      title={
                        isTaken(result)
                          ? "This sequence is already in the training input"
                          : undefined
                      }
                    >
                      <input
                        type="checkbox"
                        disabled={isTaken(result)}
                        checked={!!picked[result.id]}
                        onChange={() => toggleResult(result, job)}
                      />
                      <span className="grow truncate">
                        {result.protein_sequence}
                      </span>
                      <span>{result.actual_assay_score}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-light">{pickedCount} selected</span>
          <div className="flex space-x-3">
            <Button
              id="library-cancel"
              type="button"
              buttonType="cancel"
              text="Cancel"
              onClick={onClose}
            />
            <Button
              id="library-confirm"
              type="button"
              buttonType="submit"
              text="Add selected"
              onClick={() => onConfirm(Object.values(picked))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
