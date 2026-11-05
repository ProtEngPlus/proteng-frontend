import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { getJob } from "../../api/job";

const nameMapping: { [key: string]: string } = {
  dashboard: "Dashboard",
  "assay-library": "Assay Library",
  "create-job": "Create Job",
  "account-management": "Account Management",
  "job-detail": "Job Detail",
  "change-password": "Change Password",
};

export default function Breadcrumb() {
  const pathNameArray = useLocation().pathname.split("/").filter(Boolean);
  const [jobName, setJobName] = useState<string | null>(null);

  useEffect(() => {
    const jobDetailIndex = pathNameArray.indexOf("job-detail");
    if (jobDetailIndex !== -1 && pathNameArray[jobDetailIndex + 1]) {
      const jobId = pathNameArray[jobDetailIndex + 1];
      getJob(jobId).then((data) => {
        if (data?.data?.name) {
          setJobName(data.data.name);
        }
      });
    }
  }, [pathNameArray]);

  const pathArray = pathNameArray.reduce(
    (acc, path) => {
      const newPath =
        acc.length > 0 ? acc[acc.length - 1]?.path + "/" + path : "/" + path;

      if (path === "job-detail" && jobName) {
        acc.push({ name: jobName, path: newPath });
      } else if (nameMapping[path]) {
        acc.push({ name: nameMapping[path] || path, path: newPath });
      }

      return acc;
    },
    [] as { name: string; path: string }[],
  );

  return (
    <nav className="w-full  text-black whitespace-nowrap">
      <ol className="list-reset flex space-x-2 text-2xl">
        {pathArray.map((pathInfo, index) => (
          <li
            key={pathInfo.path}
            className="flex items-center text-black space-x-2"
          >
            <span>
              <Icon icon="weui:arrow-outlined" className="w-3.5 h-7" />
            </span>
            {index === pathArray.length - 1 ? (
              <span>{pathInfo.name}</span>
            ) : (
              <Link to={pathInfo.path}>{pathInfo.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
