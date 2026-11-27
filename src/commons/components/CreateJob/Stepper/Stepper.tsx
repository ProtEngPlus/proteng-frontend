import { useLayoutEffect, useRef, useState } from "react";
import { stepsForCreateJob } from "../../../interfaces/CreateJob.interface";
export default function Stepper({
  step,
  changeStep,
}: {
  step: number;
  changeStep: (n: number) => void;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const [edges, setEdges] = useState({ left: 0, right: 0 });

  useLayoutEffect(() => {
    const list = listRef.current;
    const container = list?.parentElement;
    if (!list || !container) return;
    const measure = () => {
      const labels = list.querySelectorAll<HTMLElement>(":scope > li > div");
      if (labels.length < 2) return;
      const first = labels[0].offsetWidth;
      const last = labels[labels.length - 1].offsetWidth;
      const column =
        (container.clientWidth - (first + last) / 2) / (labels.length - 1);
      setEdges({ left: (first - column) / 2, right: (last - column) / 2 });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    list
      .querySelectorAll<HTMLElement>(":scope > li > div")
      .forEach((label) => observer.observe(label));
    return () => observer.disconnect();
  }, []);

  return (
    // start at i = 1
    <div className="space-y-2 mb-5 overflow-hidden">
      <ol
        ref={listRef}
        className="relative flex"
        style={{ marginLeft: edges.left, marginRight: edges.right }}
      >
        {[...Array(stepsForCreateJob.length - 1)].map((_, i) => (
          <li
            key={i + 1}
            className={`${
              i < stepsForCreateJob.length - 2
                ? "flex flex-1 basis-0 justify-center relative text-black after:content-[''] after:w-full after:h-0.5 after:inline-block after:absolute lg:after:top-5 after:top-3 after:left-1/2"
                : "flex flex-1 basis-0 justify-center relative text-gray-900"
            } ${
              i < step - 1 ? "after:bg-pep-blue" : "after:bg-pep-gray-border"
            }`}
          >
            <div className="block whitespace-nowrap z-10">
              <span
                className={`w-6 h-6 border-2 rounded-full flex justify-center items-center mx-auto mb-3 text-sm lg:w-10 lg:h-10 ${
                  i < step - 1
                    ? "bg-pep-blue text-white border-transparent cursor-pointer"
                    : i === step - 1
                      ? "bg-white border-pep-blue text-pep-blue"
                      : "bg-white border-pep-gray-border text-black"
                }`}
                onClick={() => step > i && changeStep(i + 1)}
              >
                {i + 1}
              </span>
              {i === 1 ? (
                <div className="text-center">
                  Protein <br /> Representation
                </div>
              ) : i === 2 ? (
                <div className="text-center">
                  Upload <br /> Lab Input
                </div>
              ) : (
                stepsForCreateJob[i]
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
