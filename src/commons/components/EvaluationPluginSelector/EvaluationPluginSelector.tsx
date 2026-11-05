import { useState } from "react";
import EvaluationDropdown from "./EvaluationDropdown";

interface Props {
  id: string;
  plugins: string[];
  selected: string[];
  onChange: (plugins: string[]) => void;
  isLoading?: boolean;
  hasRegistryError?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  variant?: "form" | "dialog";
}

export default function EvaluationPluginSelector({
  id,
  plugins,
  selected,
  onChange,
  isLoading = false,
  hasRegistryError = false,
  disabled = false,
  readOnly = false,
  variant = "form",
}: Props) {
  const [activePlugin, setActivePlugin] = useState("");
  const active = selected.includes(activePlugin)
    ? activePlugin
    : (selected[0] ?? "");
  const available = plugins.filter((plugin) => !selected.includes(plugin));
  const registryReady = !isLoading && !hasRegistryError;
  const canAdd = !disabled && registryReady && available.length > 0;
  const labelId = `${id}-label`;

  const addPlugin = (plugin: string) => {
    if (!canAdd || !available.includes(plugin)) return;
    onChange([...selected, plugin]);
    setActivePlugin(plugin);
  };

  return (
    <div className="space-y-6">
      <div className={variant === "form" ? "w-[40%] min-w-fit" : ""}>
        <div
          className={
            variant === "form"
              ? "min-w-fit justify-between items-start space-x-3 grid grid-cols-[1fr,4fr] max-w-[1000px]"
              : "grid grid-cols-[1fr,2fr] gap-x-3 items-start"
          }
        >
          <label
            id={labelId}
            htmlFor={readOnly ? undefined : id}
            className={`font-light ${variant === "form" ? "w-[40%]" : ""}`}
          >
            Plugins:
          </label>
          <div className="space-y-3">
            {!readOnly && (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <EvaluationDropdown
                  id={id}
                  labelId={labelId}
                  options={available.map((plugin) => ({
                    label: plugin,
                    value: plugin,
                  }))}
                  placeholder={
                    isLoading ? "Loading plugins..." : "Select a plugin"
                  }
                  disabled={!canAdd}
                  onSelect={addPlugin}
                />
              </div>
            )}
            {!readOnly && registryReady && plugins.length === 0 && (
              <div className="text-sm text-pep-dark-gray">
                No evaluation plugin is available
              </div>
            )}
            {!readOnly &&
              registryReady &&
              plugins.length > 0 &&
              available.length === 0 && (
                <div className="text-sm text-pep-dark-gray">
                  All available plugins are selected
                </div>
              )}
            {selected.length === 0 ? (
              <div className="text-sm text-pep-dark-gray">
                No plugins selected
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {selected.map((plugin) => (
                    <div
                      key={plugin}
                      className={`inline-flex items-center rounded-md border bg-white ${
                        active === plugin
                          ? "border-pep-blue text-pep-blue"
                          : "border-pep-gray-border text-pep-dark-gray"
                      }`}
                    >
                      <button
                        type="button"
                        className="px-3 py-2 rounded-md focus-visible:outline focus-visible:outline-pep-blue"
                        aria-label={`Show details for ${plugin}`}
                        aria-pressed={active === plugin}
                        aria-controls={`${id}-details`}
                        disabled={disabled}
                        onClick={() => setActivePlugin(plugin)}
                      >
                        {plugin}
                        {registryReady && !plugins.includes(plugin) && (
                          <span className="text-error text-sm ml-2">
                            Unavailable
                          </span>
                        )}
                      </button>
                      {!readOnly && (
                        <button
                          type="button"
                          className="size-11 shrink-0 inline-flex items-center justify-center rounded-r-md border-l border-pep-gray-border hover:bg-pep-blue-light focus-visible:outline focus-visible:outline-pep-blue disabled:opacity-50"
                          aria-label={`Remove plugin ${plugin}`}
                          disabled={disabled || isLoading}
                          onClick={() =>
                            onChange(selected.filter((item) => item !== plugin))
                          }
                        >
                          <svg
                            aria-hidden="true"
                            className="size-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          >
                            <path d="M6 6l12 12M18 6L6 18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-pep-dark-gray">
                  Plugins run in the order shown. Select a plugin name to view
                  its details.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      {active && (
        <section
          id={`${id}-details`}
          aria-label="Plugin details"
          className="space-y-2 text-pep-dark-gray"
        >
          <h3 className="text-2xl font-normal">{active}</h3>
          {registryReady && !plugins.includes(active) ? (
            <p className="text-sm font-light text-error">
              This plugin is unavailable. Remove it before continuing.
            </p>
          ) : active === "mock" ? (
            <>
              <p className="text-sm font-light">
                Test plugin that returns generated scores to check the
                evaluation workflow. These scores are not biological
                predictions.
              </p>
              <p className="text-sm font-light">
                Output: <span className="font-semibold">mock_score</span>
              </p>
            </>
          ) : (
            <p className="text-sm font-light">
              No description is available for this plugin.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
