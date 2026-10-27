import { useEffect, useState } from "react";
import { useAuth } from "../../commons/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Content } from "../../commons/interfaces/Dashboard.interface";
import { getAllJobs, getDashboardContent } from "../../commons/api/job";
import {
  JobInterface,
  JobSearchParams,
  State,
} from "../../commons/interfaces/Job.interface";
import Card from "./components/DashboardContent/Card";
import BookmarkTable from "./components/DashboardContent/BookmarkTable";
import SearchName from "./components/SearchBar/SearchName";
import FilterDropdown from "./components/SearchBar/FilterDropdown";
import Button from "../../commons/components/Button/Button";
import { Icon } from "@iconify/react/dist/iconify.js";
import JobTable from "./components/JobTable/JobTable";
import DateRangePicker, {
  DateRange,
} from "./components/SearchBar/DateRangePicker";
import ongoing from "../../assets/images/Dashboard/ongoing.svg";
import Bar from "./components/DashboardContent/Chart/Bar";

const allState: State[] = [
  "CREATED",
  "PENDING",
  "ONGOING",
  "FAILED",
  "COMPLETED",
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState<Content>(); // for display on dashboard's content
  const [jobs, setJobs] = useState<JobInterface[]>([]); // for display on job's table

  // search job params
  const [name, setName] = useState("");
  const [state, setState] = useState<State[]>([]);
  const [date, setDate] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

  // to refresh getJob
  const [fetchJob, setFetchJob] = useState(false);
  const refresh = () => {
    setFetchJob(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const data = await getDashboardContent();
        if (data.data) {
          setContent(data.data);
        }
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const params: JobSearchParams = {
      state: state.length === 0 ? allState : state,
      name: name,
      created_at_from: date.startDate?.toISOString() ?? undefined,
      created_at_to: date.endDate?.toISOString() ?? undefined,
    };
    getAllJobs(params)
      .then((response) => {
        setJobs(response.data ? response.data : []);
      })
      .catch((error) => {
        console.error(error);
      });
    setFetchJob(false);
  }, [state, name, fetchJob, date]);

  return (
    <div className="space-y-[3%] py-5">
      {content && (
        <div className="grid grid-cols-[1fr,1fr,2fr] gap-8 min-w-fit">
          <Bar
            series={[
              content.number_of_jobs.created,
              content.number_of_jobs.pending,
              content.number_of_jobs.ongoing,
              content.number_of_jobs.completed,
              content.number_of_jobs.failed,
            ]}
          />
          <div className="grid grid-flow-row gap-5 min-w-conte w-full">
            <Card
              id="on-going-card"
              icon={ongoing}
              bgColor="bg-[rgba(251,113,133,0.08)]"
              dropdownText="View Jobs"
              labelText="Now Ongoing"
              onClick={() => {
                setState(["ONGOING"]);
              }}
            >
              <p>{content.number_of_jobs.ongoing} Jobs</p>
            </Card>
            <Card
              id="recent-job-card"
              isRecentJob={true}
              icon="carbon:view"
              bgColor="bg-pep-blue-light"
              dropdownText="View Job"
              labelText="Recent Job"
              onClick={() => {
                navigate(`/dashboard/job-detail/${content.recent_job.id}`);
              }}
            >
              <div className="relative flex flex-col pt-2 pb-[10px]">
                <span className="text-nowrap truncate text-sm">
                  {content.recent_job?.name}
                </span>
                <span className="text-label text-nowrap truncate text-[10px]">
                  {content.recent_job?.description}
                </span>
              </div>
            </Card>
          </div>
          <BookmarkTable />
        </div>
      )}
      <hr />
      <div className="w-full grid grid-flow-col gap-4 rounded-lg border border-pep-gray-border px-5 py-4">
        <form className="flex space-x-4">
          <SearchName name={name} setName={setName} />
          <div data-testid="date-picker">
            <DateRangePicker date={date} setDate={setDate} />
          </div>
          <FilterDropdown state={state} setState={setState} />
        </form>

        <Button
          id="create-job"
          buttonType="submit"
          text="Create Job"
          className="justify-self-end flex flex-row items-center !space-x-2 !font-light text-sm w-fit !p-2 h-[40px]"
          onClick={() => {
            navigate("/create-job");
          }}
        >
          <Icon icon="basil:add-outline" className="text-white size-5" />
        </Button>
      </div>
      <JobTable jobs={jobs} refresh={refresh} />
    </div>
  );
}
