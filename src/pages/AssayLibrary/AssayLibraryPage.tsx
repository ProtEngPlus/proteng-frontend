import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import {
  createAssayType,
  deleteAssayType,
  exportLibrary,
  getAllAssayTypes,
  getLibraryJobs,
  getLibraryResults,
  saveCsvDownload,
  updateAssayType,
} from "../../commons/api/assayType";
import { getErrorMessage } from "../../commons/api/utils";
import AssayTypeDialog from "../../commons/components/AssayType/AssayTypeDialog";
import Button from "../../commons/components/Button/Button";
import {
  DeleteOverlay,
  DeleteOverlayProps,
} from "../../commons/components/ModalOverlay/DeleteOverlay";
import {
  AssayTypeSummary,
  LibraryJob,
  LibraryResult,
} from "../../commons/interfaces/AssayType.interface";

export default function AssayLibraryPage() {
  const [types, setTypes] = useState<AssayTypeSummary[]>([]);
  const [activeId, setActiveId] = useState("");
  const [jobs, setJobs] = useState<LibraryJob[]>([]);
  const [collapsed, setCollapsed] = useState(0);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState<Record<string, LibraryResult[]>>({});
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState({ text: "", isError: false });
  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const active = types.find((type) => type.id === activeId);

  const loadTypes = async (selectId?: string) => {
    const list = await getAllAssayTypes();
    setTypes(list);
    setActiveId((current) => {
      const wanted = selectId ?? current;
      return list.some((type) => type.id === wanted)
        ? wanted
        : (list[0]?.id ?? "");
    });
  };

  useEffect(() => {
    loadTypes().catch((error) =>
      setMessage({ text: getErrorMessage(error), isError: true }),
    );
  }, []);

  useEffect(() => {
    setLoaded({});
    setOpened({});
    setPicked({});
    setJobs([]);
    setCollapsed(0);
    if (!activeId) return;
    const timer = setTimeout(() => {
      getLibraryJobs(activeId, search.trim())
        .then((list) => {
          setJobs(list.jobs);
          setCollapsed(list.duplicates_collapsed);
        })
        .catch((error) =>
          setMessage({ text: getErrorMessage(error), isError: true }),
        );
    }, 250);
    return () => clearTimeout(timer);
  }, [activeId, search]);

  const loadResults = async (job: LibraryJob): Promise<LibraryResult[]> => {
    if (loaded[job.job_id]) return loaded[job.job_id];
    const results = await getLibraryResults(activeId, job.job_id);
    setLoaded((previous) => ({ ...previous, [job.job_id]: results }));
    return results;
  };

  const toggleOpen = async (job: LibraryJob) => {
    const isOpen = !opened[job.job_id];
    setOpened((previous) => ({ ...previous, [job.job_id]: isOpen }));
    if (isOpen) await loadResults(job).catch(console.error);
  };

  const toggleJob = async (job: LibraryJob) => {
    const results = await loadResults(job).catch(() => []);
    const allPicked = results.every((result) => picked[result.id]);
    setPicked((previous) => {
      const next = { ...previous };
      results.forEach((result) => {
        if (allPicked) delete next[result.id];
        else next[result.id] = true;
      });
      return next;
    });
  };

  const jobState = useMemo(() => {
    const state: Record<string, "all" | "some" | "none"> = {};
    jobs.forEach((job) => {
      const results = loaded[job.job_id] ?? [];
      const count = results.filter((result) => picked[result.id]).length;
      state[job.job_id] =
        count === 0 ? "none" : count === results.length ? "all" : "some";
    });
    return state;
  }, [jobs, loaded, picked]);

  const pickedIds = Object.keys(picked).filter((id) => picked[id]);

  const handleExport = async (ids: string[]) => {
    try {
      const download = await exportLibrary(activeId, ids);
      saveCsvDownload(download);
      setMessage({
        text: `Exported ${download.rowCount} rows to ${download.fileName}`,
        isError: false,
      });
    } catch (error) {
      console.error(error);
      setMessage({ text: "Nothing to export.", isError: true });
    }
  };

  const deleteProps: DeleteOverlayProps = {
    id: "delete-assay-type",
    title: `Delete "${active?.name ?? ""}"?`,
    onClose: () => setIsDeleting(false),
    onDelete: async () => {
      setIsDeleting(false);
      try {
        await deleteAssayType(activeId);
        await loadTypes();
        setMessage({ text: "Assay type deleted", isError: false });
      } catch (error) {
        setMessage({
          text: "This assay type is used by a job or a result, so it cannot be deleted.",
          isError: true,
        });
        console.error(error);
      }
    },
    children: <span>This cannot be undone.</span>,
  };

  return (
    <div className="grid h-full grid-cols-[300px_1fr] gap-6 font-light">
      <DeleteOverlay isVisible={isDeleting} deleteProps={deleteProps} />
      <AssayTypeDialog
        isVisible={dialog !== null}
        title={
          dialog === "edit"
            ? "Edit assay score type"
            : "Create assay score type"
        }
        initial={
          dialog === "edit" && active
            ? { name: active.name, description: active.description }
            : undefined
        }
        onClose={() => setDialog(null)}
        onSave={async (input) => {
          if (dialog === "edit") {
            await updateAssayType(activeId, input);
            await loadTypes();
          } else {
            const created = await createAssayType(input);
            await loadTypes(created.id);
          }
          setDialog(null);
        }}
      />

      <aside className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-normal">Assay score types</h1>
          <Button
            id="assay-type-new"
            type="button"
            buttonType="submit"
            text="New"
            className="!h-10 !w-fit !px-4 !py-1"
            onClick={() => setDialog("create")}
          />
        </div>
        <ul className="space-y-2">
          {types.map((type) => (
            <li key={type.id}>
              <button
                type="button"
                onClick={() => setActiveId(type.id)}
                className={`w-full rounded-lg border px-4 py-3 text-left ${
                  type.id === activeId
                    ? "border-pep-blue bg-pep-blue-light"
                    : "border-pep-gray-border bg-white hover:bg-blue-50"
                }`}
              >
                <div className="truncate">{type.name}</div>
                <div className="text-xs text-pep-gray">
                  {type.job_count} jobs, {type.result_count} results
                </div>
              </button>
            </li>
          ))}
          {types.length === 0 && (
            <li className="text-pep-gray">No assay score type yet.</li>
          )}
        </ul>
      </aside>

      <section className="min-w-0 space-y-4">
        {active ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-normal">{active.name}</h2>
                <p className="text-sm text-pep-dark-gray">
                  {active.description || "No description"}
                </p>
              </div>
              <div className="flex shrink-0 items-center space-x-3">
                <Icon
                  icon="ph:pencil-simple-line"
                  aria-label="Edit assay type"
                  className="size-6 cursor-pointer text-pep-gray"
                  onClick={() => setDialog("edit")}
                />
                <Icon
                  icon="streamline:delete-1-solid"
                  aria-label="Delete assay type"
                  className="size-5 cursor-pointer text-error"
                  onClick={() => setIsDeleting(true)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search job name"
                className="w-[320px] rounded-lg border border-pep-gray-border px-3 py-2 focus:border-pep-blue focus:ring-pep-blue"
              />
              <div className="flex space-x-3">
                <Button
                  id="library-export-selected"
                  type="button"
                  buttonType="cancel"
                  text={`Export selected (${pickedIds.length})`}
                  className="!w-fit"
                  disabled={pickedIds.length === 0}
                  onClick={() => handleExport(pickedIds)}
                />
                <Button
                  id="library-export-all"
                  type="button"
                  buttonType="submit"
                  text="Export all"
                  className="!w-fit"
                  disabled={active.result_count === 0}
                  onClick={() => handleExport([])}
                />
              </div>
            </div>

            {message.text && (
              <p
                className={`text-sm ${message.isError ? "text-error" : "text-pep-green"}`}
              >
                {message.text}
              </p>
            )}
            {collapsed > 0 && (
              <p className="text-sm text-pep-gray">
                {collapsed} repeated sequences are listed once, under the job
                with the newest measurement.
              </p>
            )}

            <div className="space-y-2">
              {jobs.length === 0 && (
                <p className="py-10 text-center text-pep-gray">
                  No lab results with this assay score type yet.
                </p>
              )}
              {jobs.map((job) => (
                <div
                  key={job.job_id}
                  className="rounded-lg border border-pep-gray-border bg-white"
                >
                  <div className="flex items-center space-x-3 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select all of ${job.job_name}`}
                      checked={jobState[job.job_id] === "all"}
                      ref={(element) => {
                        if (element)
                          element.indeterminate =
                            jobState[job.job_id] === "some";
                      }}
                      onChange={() => toggleJob(job)}
                    />
                    <button
                      type="button"
                      className="flex grow items-center justify-between text-left"
                      onClick={() => toggleOpen(job)}
                    >
                      <span className="truncate">{job.job_name}</span>
                      <span className="flex items-center space-x-4 text-sm text-pep-gray">
                        <span>
                          {job.completed_at &&
                          dayjs(job.completed_at).year() > 1
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
                    <table className="w-full border-t border-pep-gray-border text-sm">
                      <thead className="bg-pep-gray-light text-left">
                        <tr>
                          <th className="w-10 px-4 py-2" />
                          <th className="py-2 font-normal">Protein sequence</th>
                          <th className="py-2 font-normal">Mutations</th>
                          <th className="py-2 font-normal">Score</th>
                          <th className="py-2 font-normal">Measured</th>
                          <th className="py-2 pr-4 font-normal">Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(loaded[job.job_id] ?? []).map((result) => (
                          <tr key={result.id} className="border-t">
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                aria-label={`Select ${result.protein_sequence}`}
                                checked={!!picked[result.id]}
                                onChange={() =>
                                  setPicked((previous) => ({
                                    ...previous,
                                    [result.id]: !previous[result.id],
                                  }))
                                }
                              />
                            </td>
                            <td className="max-w-[260px] truncate py-2">
                              {result.protein_sequence}
                            </td>
                            <td className="max-w-[160px] truncate py-2">
                              {(result.mutation_positions ?? []).join(", ")}
                            </td>
                            <td className="py-2">
                              {result.actual_assay_score}
                            </td>
                            <td className="py-2">
                              {dayjs(result.measured_at).format("DD MMM YYYY")}
                            </td>
                            <td className="max-w-[200px] truncate py-2 pr-4">
                              {result.note}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="py-20 text-center text-pep-gray">
            Create an assay score type to start your library.
          </p>
        )}
      </section>
    </div>
  );
}
