import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { getEvaluationPlugins } from "../../../../../commons/api/evaluation";
import { getErrorMessage } from "../../../../../commons/api/utils";
import Context from "../../../../../commons/components/CreateJob/Context/Context";

export default function Evaluation({
  isConclusion = false,
  onEdit = true,
}: {
  isConclusion?: boolean;
  onEdit?: boolean;
}) {
  const {
    register,
    clearErrors,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useFormContext();
  const selected: string[] = watch("evaluation_plugins") ?? [];
  const [plugins, setPlugins] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reload, setReload] = useState(0);
  const [isEdit, setIsEdit] = useState(onEdit);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setErrorMessage("");
    getEvaluationPlugins()
      .then((response) => {
        if (!isCancelled) setPlugins(response.data ?? []);
      })
      .catch((error) => {
        if (!isCancelled) {
          setErrorMessage(getErrorMessage(error) || "Unable to load plugins");
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });
    return () => {
      isCancelled = true;
    };
  }, [reload]);

  useEffect(() => {
    let isActive = true;
    register("evaluation_plugins", {
      validate: (value: string[]) => {
        if (!isActive || !value?.length) return true;
        if (isLoading) return "Wait for the plugin list to load";
        if (errorMessage) return "Reload the plugin list before continuing";
        return (
          value.every((plugin) => plugins.includes(plugin)) ||
          "Remove unavailable plugins before continuing"
        );
      },
    });
    if (!isLoading) void trigger("evaluation_plugins");
    return () => {
      isActive = false;
      clearErrors("evaluation_plugins");
    };
  }, [register, clearErrors, trigger, plugins, isLoading, errorMessage]);

  const options = [...new Set([...plugins, ...selected])];
  const togglePlugin = (plugin: string) => {
    const next = selected.includes(plugin)
      ? selected.filter((item) => item !== plugin)
      : options.filter((item) => item === plugin || selected.includes(item));
    setValue("evaluation_plugins", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <Context
      title="Evaluation"
      isConclusion={isConclusion}
      onEdit={onEdit}
      onEditChange={setIsEdit}
    >
      <p className="text-sm text-pep-dark-gray">
        Selected plugins evaluate the generated mutants after mutation. Leave
        all plugins unchecked to skip evaluation.
      </p>
      {!isEdit ? (
        <div>
          {selected.length > 0 ? selected.join(", ") : "No plugins selected"}
        </div>
      ) : (
        <div className="space-y-3">
          {isLoading && <div>Loading plugins...</div>}
          {!isLoading && !errorMessage && options.length === 0 && (
            <div>No evaluation plugin is available</div>
          )}
          {options.map((plugin) => (
            <label key={plugin} className="flex items-center gap-3 w-fit">
              <input
                type="checkbox"
                className="size-5 rounded-md border-pep-blue cursor-pointer"
                checked={selected.includes(plugin)}
                disabled={isLoading}
                onChange={() => togglePlugin(plugin)}
              />
              {plugin}
              {!isLoading && !errorMessage && !plugins.includes(plugin) && (
                <span className="text-error text-sm">Unavailable</span>
              )}
            </label>
          ))}
        </div>
      )}
      {errorMessage && (
        <div role="alert" className="text-error text-sm space-x-3">
          <span>{errorMessage}</span>
          <button
            type="button"
            className="underline text-pep-blue"
            onClick={() => setReload((count) => count + 1)}
          >
            Retry
          </button>
        </div>
      )}
      {errors.evaluation_plugins?.message && (
        <div role="alert" className="text-error text-sm">
          {String(errors.evaluation_plugins.message)}
        </div>
      )}
    </Context>
  );
}
