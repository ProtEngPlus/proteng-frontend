import { useState } from "react";
import { JobInterface } from "../../../../commons/interfaces/Job.interface";
import {
  DeleteOverlay,
  DeleteOverlayProps,
} from "../../../../commons/components/ModalOverlay/DeleteOverlay";
import { Icon } from "@iconify/react/dist/iconify.js";
import JobRunTypeIcon from "../../../../commons/components/Job/JobRunTypeIcon/JobRunTypeIcon";
import JobState from "../../../../commons/components/Job/JobState/JobState";
import { formatDate } from "../../../../commons/utils/formatDate";
import {
  SuccessOverlay,
  SuccessOverlayProps,
} from "../../../../commons/components/ModalOverlay/SuccessOverlay";
import { deleteJob, runJob } from "../../../../commons/api/job";
import Stepper from "./Stepper";
import { useNavigate } from "react-router-dom";
import { getTotalTime } from "../../service/getTotalTime";

const headers = [
  "Job Name",
  "Status",
  "Stages",
  "Created At",
  "Last Updated At",
];

export default function JobTable({
  jobs,
  refresh,
}: {
  jobs: JobInterface[];
  refresh: () => void;
}) {
  const navigate = useNavigate();
  const [isDeleteVisible, setDeleteVisible] = useState(false);
  const [currentJob, setCurrentJob] = useState<JobInterface | null>(null);

  // for delete job
  const handleDelete = (job: JobInterface) => {
    setCurrentJob(job);
    setDeleteVisible(true);
  };
  const DeleteProps: DeleteOverlayProps = {
    id: "delete-job",
    onClose: () => {
      setDeleteVisible(false);
    },
    onDelete: async () => {
      if (currentJob) {
        await deleteJob(currentJob.id);
      }
      setDeleteVisible(false);
      setIsDeleteSuccessVisible(true);
      refresh();
    },
    title: "Do you want to delete this job?",
    children: (
      <div className="flex flex-col font-light mt-4">
        <label>
          Job name: {currentJob?.name} <br />
          Description: {currentJob?.description}
        </label>
      </div>
    ),
  };

  const [isDeleteSuccessVisible, setIsDeleteSuccessVisible] = useState(false);
  const DeleteSuccessProps: SuccessOverlayProps = {
    id: "success-update-job",
    onClose: () => {
      setIsDeleteSuccessVisible(false);
    },
    title: "The Job Delete Successfully",
  };

  // run job
  const handleRunJob = async (job: JobInterface) => {
    await runJob(job.id);
    refresh();
  };

  //for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = jobs.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };
  return (
    <div>
      <DeleteOverlay isVisible={isDeleteVisible} deleteProps={DeleteProps} />
      <SuccessOverlay
        successProps={DeleteSuccessProps}
        isVisible={isDeleteSuccessVisible}
      />
      {jobs.length == 0 ? (
        <div className="text-center">
          <div className="text-label text-xl">No job was found</div>
          <div className="font-light text-pep-gray">
            Change the filter or create new job
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Job Table */}
          <div
            id="job-table"
            className="relative overflow-auto rounded-xl border border-[#DFE4EA] shadow-table"
          >
            <table className="w-full text-xs text-left rtl:text-right">
              <thead className="leading-6 bg-[#F9FAFB] text-center border-b">
                <tr>
                  <th
                    scope="col"
                    className="font-normal px-6 py-3 text-base"
                  ></th>
                  <th
                    scope="col"
                    className="font-normal px-6 py-3 text-base"
                  ></th>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="font-normal px-6 py-3 text-base"
                    >
                      {header}
                    </th>
                  ))}
                  <th
                    scope="col"
                    className="font-normal px-6 py-3 text-base"
                  ></th>
                </tr>
              </thead>
              <tbody className="font-light leading-7">
                {currentJobs.map((job, index) => (
                  <tr
                    key={job.id}
                    className="font-light bg-white border-b h-[80px]"
                  >
                    <td className="items-center text-center pl-5 pr-3 py-3 w-fit">
                      <label className="text-center text-black text-sm">
                        {indexOfFirstItem + index + 1}
                      </label>
                      {job.run_type === "auto" && (
                        <div className="bg-error text-white rounded-3xl leading-snug px-2 w-fit h-fit text-[8px] mx-auto">
                          Auto
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <JobRunTypeIcon
                        onClick={() => {
                          if (job.state !== "FAILED") handleRunJob(job);
                        }}
                        runType={job.run_type}
                        state={job.state}
                      />
                    </td>
                    <td
                      id="table-job-detail"
                      className="flex grow flex-col px-3 py-3"
                    >
                      <label
                        id="table-job-name"
                        className="truncate text-blue-500 font-normal text-sm leading-5 underline cursor-pointer"
                        onClick={() =>
                          navigate(`/dashboard/job-detail/${job.id}`)
                        }
                      >
                        {job.name}
                      </label>
                      <label
                        id="table-job-description"
                        className="truncate text-sm"
                      >
                        {job.description}
                      </label>
                    </td>
                    <td id="table-job-status" className="px-3 py-3 text-center">
                      <JobState state={job.state} className="mx-auto" />
                      {job.state === "COMPLETED" && job.complete_at && (
                        <label>
                          Total Time:{" "}
                          {getTotalTime(job.created_at, job.complete_at)} Min
                        </label>
                      )}
                    </td>
                    <td className="place-items-center px-3 py-3">
                      <Stepper
                        stageId={job.stage_id}
                        state={job.state}
                        evaluationPlugins={job.evaluation_plugins}
                        evaluationState={job.evaluation_state}
                      />
                    </td>
                    <td
                      id="table-job-created-at"
                      className="text-label px-3 py-3 text-center"
                    >
                      {job.created_at ? formatDate(job.created_at) : ""}
                    </td>
                    <td className="text-label px-3 py-3 text-center">
                      {job.updated_at ? formatDate(job.updated_at) : ""}
                    </td>
                    <td className="pl-3 pr-12 py-3 place-items-center">
                      <div className="flex space-x-2">
                        <Icon
                          icon="ic:round-refresh"
                          className={`size-7 ${
                            job.state === "FAILED"
                              ? "text-pep-gray cursor-pointer"
                              : "text-pep-gray-border cursor-not-allowed"
                          }`}
                          onClick={() => {
                            if (job.state === "FAILED") handleRunJob(job);
                          }}
                        />
                        <Icon
                          icon="streamline:delete-1-solid"
                          className="text-error size-5 self-center cursor-pointer"
                          onClick={() => handleDelete(job)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className="px-3 py-2 w-fit rounded-[45px] bg-white">
            <ul className="flex items-center space-x-2 h-8 text-sm">
              <li>
                <button
                  className="flex items-center justify-center size-[35px] text-label border border-pep-gray-border transition-colors duration-150 rounded-full focus:border-none focus:text-white focus:bg-pep-gray hover:bg-pep-light-gray disabled:cursor-not-allowed"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <svg
                    className="w-3.5 h-3.5 rtl:rotate-180"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="M13 5H1m0 0 4 4M1 5l4-4"
                    />
                  </svg>
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => (
                <li key={index}>
                  <button
                    className={`size-[35px] text-pep-dark-gray border border-pep-gray-border transition-colors duration-150 rounded-full focus:border-none focus:text-white focus:bg-pep-gray ${
                      currentPage === index + 1
                        ? "bg-pep-gray border-none text-white"
                        : "hover:bg-pep-light-gray"
                    }`}
                    onClick={() => handlePageClick(index + 1)}
                    type="button"
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li>
                <button
                  className="flex items-center justify-center size-[35px] text-label border border-pep-gray-border transition-colors duration-150 rounded-full focus:border-none focus:text-white focus:bg-pep-gray hover:bg-pep-light-gray disabled:cursor-not-allowed"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <svg
                    className="w-3.5 h-3.5 rtl:rotate-180"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="M1 5h12m0 0L9 1m4 4L9 9"
                    />
                  </svg>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
