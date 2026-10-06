import { TabItem, Tabs, TabsInterface, TabsOptions } from "flowbite";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { JobInterface } from "../../commons/interfaces/Job.interface";
import { FormProvider, useForm } from "react-hook-form";
import {
  deleteJob,
  getJob,
  runJob,
  updateJobDetail,
} from "../../commons/api/job";
import Pipeline from "./components/Pipeline/Pipeline";
import LabInput from "./components/LabInput/LabInput";
import JobRunTypeIcon from "../../commons/components/Job/JobRunTypeIcon/JobRunTypeIcon";
import JobState from "../../commons/components/Job/JobState/JobState";
import onEditIcon from "../../assets/images/CreateJob/onEditIcon.svg";
import editIcon from "../../assets/images/CreateJob/editIcon.svg";
import TextInput from "../../commons/components/Input/TextInput";
import Textarea from "../../commons/components/CreateJob/InputField/InputField/Textarea";
import { Icon } from "@iconify/react/dist/iconify.js";
import { formatDate } from "./service/formatDate";
import {
  SuccessOverlay,
  SuccessOverlayProps,
} from "../../commons/components/ModalOverlay/SuccessOverlay";
import {
  DeleteOverlay,
  DeleteOverlayProps,
} from "../../commons/components/ModalOverlay/DeleteOverlay";
import MutationResults from "./components/MutationResults/MutationResults";
import { defaultPipeline } from "../../commons/configs/createJobConfig";
import WetLabResults from "./components/WetLabResults/WetLabResults";

export default function JobDetailPage() {
  const navigate = useNavigate();
  const { jobid } = useParams<{ jobid: string }>();
  const [job, setJob] = useState<JobInterface>();
  const [isEditDescription, setEditDescription] = useState(false);
  const [isEditPipeline, setIsEditPipeline] = useState(false);
  const [wetLabVisit, setWetLabVisit] = useState(0);

  const form = useForm();
  const { watch } = form;
  const name = watch("name") ?? "";
  const description = watch("description") ?? "";

  const fetchJob = async () => {
    if (!jobid) return;
    try {
      const data = await getJob(jobid);
      if (!data) return;

      if (data.data) {
        setJob(data.data);
        form.reset({
          ...data.data,
          input_protein_field: data.data.input_protein,
          initial_input_protein: data.data.input_protein,
        });
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [jobid]);

  const handleEditDescription = async () => {
    if (isEditDescription && job) {
      await updateJobDetail(job.id, { name: name, description: description });
      setEditDescription(false);
    } else {
      setEditDescription(true);
    }
  };

  useEffect(() => {
    if (!job) return;
    const tabsElement = document.getElementById("tabs");

    if (tabsElement) {
      const tabElements: TabItem[] = [
        {
          id: "pipeline-tab",
          triggerEl: document.querySelector("#pipeline-tab"),
          targetEl: document.querySelector("#pipeline-content"),
        },
        {
          id: "lab-input-tab",
          triggerEl: document.querySelector("#lab-input-tab"),
          targetEl: document.querySelector("#lab-input-content"),
        },
        {
          id: "mutaion-results-tab",
          triggerEl: document.querySelector("#mutaion-results-tab"),
          targetEl: document.querySelector("#mutaion-results-content"),
        },
        {
          id: "wet-lab-results-tab",
          triggerEl: document.querySelector("#wet-lab-results-tab"),
          targetEl: document.querySelector("#wet-lab-results-content"),
        },
      ].filter(
        (item) => item.triggerEl !== null && item.targetEl !== null,
      ) as TabItem[];

      const options: TabsOptions = {
        defaultTabId: "pipeline-tab",
        activeClasses:
          "text-pep-orange hover:text-pep-orange border-pep-orange",
        inactiveClasses: "text-label border-white hover:border-pep-gray-border",
      };

      const tabs: TabsInterface = new Tabs(tabsElement, tabElements, options);

      tabs.show("pipeline-tab");
    } else {
      console.error("Tabs element not found!");
    }
  }, [job]);

  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const DeleteProps: DeleteOverlayProps = {
    id: "delete-job",
    onClose: () => {
      setIsDeleteVisible(false);
    },
    onDelete: async () => {
      if (job) {
        await deleteJob(job.id);
        setIsDeleteVisible(false);
        setIsDeleteSuccessVisible(true);
      }
    },
    title: "Do you want to delete this job?",
    children: (
      <div className="text-center flex flex-col font-light">
        <label>
          Job name: {job?.name} <br />
          Description: {job?.description}
        </label>
      </div>
    ),
  };

  const [isDeleteSuccessVisible, setIsDeleteSuccessVisible] = useState(false);
  const DeleteSuccessProps: SuccessOverlayProps = {
    id: "success-update-job",
    onClose: () => {
      setIsDeleteSuccessVisible(false);
      navigate("/dashboard");
    },
    title: "The Job Delete Successfully",
  };

  const handleRunJob = async () => {
    if (job) {
      await runJob(job.id);
      fetchJob();
    }
  };
  return (
    <FormProvider {...form}>
      <DeleteOverlay deleteProps={DeleteProps} isVisible={isDeleteVisible} />
      <SuccessOverlay
        successProps={DeleteSuccessProps}
        isVisible={isDeleteSuccessVisible}
      />
      {job && (
        <div className="space-y-8 py-5">
          <div
            data-testid="job-information"
            className="p-5 space-y-5 border border-pep-gray-border rounded-xl"
          >
            <div className="flex justify-between items-center space-x-8">
              <div className="flex space-x-8 items-center">
                <JobRunTypeIcon
                  onClick={() => {
                    if (job.state !== "FAILED") handleRunJob();
                  }}
                  runType={job.run_type}
                  state={job.state}
                />
                <div className="flex border-l-4 border-pep-orange px-6 space-x-8 items-center">
                  {isEditDescription ? (
                    <div className="flex flex-col space-y-2 w-[500px]">
                      <TextInput id="name" placeholder="" />
                      <Textarea
                        id="description"
                        placeholder=""
                        maxLength={50}
                        additionalValidation={{
                          maxLength: {
                            value: 50,
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <label className="text-black font-normal text-2xl">
                        {name}
                      </label>
                      <label className="text-sm">{description}</label>
                    </div>
                  )}
                  <img
                    src={isEditDescription ? onEditIcon : editIcon}
                    alt="edit"
                    className="size-8 cursor-pointer"
                    onClick={handleEditDescription}
                  />
                </div>
                <JobState state={job.state} />
              </div>
              <div className="flex space-x-1 items-center">
                <Icon
                  icon="ic:round-refresh"
                  className={`size-7 ${
                    job.state === "FAILED"
                      ? "text-pep-gray cursor-pointer"
                      : "text-pep-gray-border cursor-not-allowed"
                  }`}
                  onClick={() => {
                    if (job.state === "FAILED") handleRunJob();
                  }}
                />
                <Icon
                  icon="streamline:delete-1-solid"
                  className="text-error cursor-pointer size-5"
                  onClick={() => setIsDeleteVisible(true)}
                />
              </div>
            </div>
            <hr />
            <div className="flex space-x-5 text-sm items-center">
              <div className="flex space-x-8  place-items-center">
                <Icon
                  icon="mingcute:time-line"
                  className="text-pep-gray size-5 w-5"
                />
                <label className="font-normal">Created At</label>
                <label className="text-xs font-light">
                  {formatDate(job.created_at)}
                </label>
              </div>
              <div className="border-l border-pep-gray-border pl-5 flex space-x-8 place-items-center">
                <label className="font-normal">Last Updated At</label>
                <label className="text-xs font-light">
                  {formatDate(job.updated_at)}
                </label>
              </div>
            </div>
            <div>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Icon
                    icon="hugeicons:dna"
                    className="size-7 text-pep-gray min-w-6"
                  />
                  <label className="text-center text-black text-nowrap font-normal">
                    Input Protein
                  </label>
                </div>
                <div className="px-2 rounded-xl bg-pep-blue text-white break-all font-light w-fit">
                  {job.input_protein}
                </div>
              </div>
            </div>
          </div>
          <div className="mb-8 border-b text-gray-500 border-gray-500">
            <ul className="flex flex-wrap -mb-px text-center" id="tabs">
              <li className="me-2">
                <button
                  className="inline-block p-4 border-b-2 rounded-t-lg"
                  id="pipeline-tab"
                  type="button"
                  role="tab"
                  aria-controls="pipeline-content"
                  aria-selected="true"
                >
                  Pipeline
                </button>
              </li>
              <li className="me-2">
                <button
                  disabled={isEditPipeline}
                  className="flex p-4 border-b-2 rounded-t-lg gap-x-2"
                  id="lab-input-tab"
                  type="button"
                  role="tab"
                  aria-controls="lab-input-content"
                  aria-selected="false"
                >
                  {job.state === "FAILED" &&
                    job.stage_id === 2 &&
                    job.lab_result.total === 0 && (
                      <div className="rounded-full border-2 border-error text-error size-6 flex items-center justify-center">
                        !
                      </div>
                    )}
                  Lab Input
                </button>
              </li>

              <li className="me-2">
                <button
                  disabled={job.stage_id < 3 || isEditPipeline}
                  className="inline-block p-4 border-b-2 rounded-t-lg disabled:cursor-not-allowed disabled:text-gray-300"
                  id="mutaion-results-tab"
                  type="button"
                  role="tab"
                  aria-controls="mutaion-results-content"
                  aria-selected="false"
                >
                  Mutation Results
                </button>
              </li>
              <li className="me-2">
                <button
                  disabled={job.stage_id < 3 || isEditPipeline}
                  className="inline-block p-4 border-b-2 rounded-t-lg disabled:cursor-not-allowed disabled:text-gray-300"
                  id="wet-lab-results-tab"
                  type="button"
                  role="tab"
                  aria-controls="wet-lab-results-content"
                  aria-selected="false"
                  onClick={() => setWetLabVisit((visit) => visit + 1)}
                >
                  Wet-lab Results
                </button>
              </li>
            </ul>
          </div>
          <div id="default-styled-tab-content">
            <div id="pipeline-content" aria-labelledby="pipeline-tab">
              <Pipeline
                job={job}
                setIsEditPipeline={setIsEditPipeline}
                isEditPipeline={isEditPipeline}
                fetchJob={fetchJob}
              />
            </div>
            <div
              id="lab-input-content"
              role="tabpanel"
              aria-labelledby="lab-input-tab"
            >
              <LabInput
                id={job.id}
                disable={job.state === "ONGOING" || job.stage_id > 2}
              />
            </div>
            <div
              id="mutaion-results-content"
              role="tabpanel"
              aria-labelledby="mutaion-results-tab"
            >
              <MutationResults
                jobid={job.id}
                inputProtein={job.input_protein}
                currentStep={job.stage_id}
                pipeline={defaultPipeline}
              />
            </div>
            <div
              id="wet-lab-results-content"
              role="tabpanel"
              aria-labelledby="wet-lab-results-tab"
            >
              <WetLabResults key={wetLabVisit} jobid={job.id} />
            </div>
          </div>
        </div>
      )}
    </FormProvider>
  );
}
