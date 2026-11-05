import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { getEvaluationPlugins } from "../../../../../commons/api/evaluation";
import { getErrorMessage } from "../../../../../commons/api/utils";
import EvaluationPluginSelector from "../../../../../commons/components/EvaluationPluginSelector/EvaluationPluginSelector";
import ContextWithHelperText from "../../../../../commons/components/CreateJob/Context/ContextWithHelper";
import EvaluationHelperText from "./EvaluationHelperText";

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
  const [activePlugin, setActivePlugin] = useState("");

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

  return (
    <ContextWithHelperText
      title="Evaluation"
      helperText={<EvaluationHelperText plugin={activePlugin} />}
      isConclusion={isConclusion}
      onEdit={isEdit}
      onEditChange={() => setIsEdit(!isEdit)}
    >
      <EvaluationPluginSelector
        id="create-evaluation-plugins"
        plugins={plugins}
        selected={selected}
        isLoading={isLoading}
        hasRegistryError={!!errorMessage}
        readOnly={!isEdit}
        emptyText="No plugins selected. Evaluation will be skipped."
        onActiveChange={setActivePlugin}
        onChange={(next) =>
          setValue("evaluation_plugins", next, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      />
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
    </ContextWithHelperText>
  );
}
