import { evaluationPluginInfo } from "../../../../../commons/configs/evaluationPluginConfig";

export default function EvaluationHelperText({ plugin }: { plugin: string }) {
  const info = plugin ? evaluationPluginInfo[plugin] : undefined;
  return (
    <div className="mt-4 space-y-4 text-pep-dark-gray">
      <div className="grid grid-cols-[1fr,4fr] space-x-3 text-start">
        <label className="font-light w-[88px]">Plugins:</label>
        <span>
          Optional checks that score each generated mutant after mutation. They
          run one after another, in the order shown. Leave the selection empty
          to skip evaluation.
        </span>
      </div>
      {plugin ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-normal">{plugin}</h1>
            <span className="text-sm font-light">
              {info?.description ??
                "No description is available for this plugin."}
            </span>
          </div>
          <hr />
          {info?.outputs.map((output) => (
            <div
              key={output.name}
              className="grid grid-cols-[1fr,4fr] space-x-3 text-start"
            >
              <span className="text-nowrap">Output:</span>
              <span>
                <span className="font-semibold">{output.name}</span>:{" "}
                {output.description}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm font-light">
          Select a plugin to see its details here.
        </p>
      )}
      <div className="grid grid-cols-[1fr,4fr] space-x-3 text-start">
        <span className="text-nowrap">Failures:</span>
        <span>
          If a plugin fails, the next plugin still runs and the job still
          completes.
        </span>
      </div>
      <div className="grid grid-cols-[1fr,4fr] space-x-3 text-start">
        <span className="text-nowrap">Run again:</span>
        <span>
          You can run evaluation again later from Job Detail, in the Evaluation
          tab.
        </span>
      </div>
    </div>
  );
}
