import { useState } from "react";

interface Props {
  id: string;
  plugins: string[];
  selected: string[];
  onChange: (plugins: string[]) => void;
  isLoading?: boolean;
  hasRegistryError?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
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
}: Props) {
  const [activePlugin, setActivePlugin] = useState("");
  const active = selected.includes(activePlugin)
    ? activePlugin
    : (selected[0] ?? "");
  const available = plugins.filter((plugin) => !selected.includes(plugin));
  const registryReady = !isLoading && !hasRegistryError;

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="space-y-2 max-w-[420px]">
          <label htmlFor={id} className="block">
            Add evaluation plugin:
          </label>
          <select
            id={id}
            className="h-[50px] w-full px-4 bg-white border border-pep-gray-border font-light rounded-md focus:border-pep-blue focus:ring-pep-blue disabled:cursor-not-allowed disabled:bg-disabled"
            value=""
            disabled={disabled || !registryReady || available.length === 0}
            onChange={(event) => {
              const plugin = event.target.value;
              if (!available.includes(plugin) || disabled || !registryReady)
                return;
              onChange([...selected, plugin]);
              setActivePlugin(plugin);
            }}
          >
            <option value="" disabled>
              {isLoading ? "Loading plugins..." : "Select a plugin"}
            </option>
            {available.map((plugin) => (
              <option key={plugin} value={plugin}>
                {plugin}
              </option>
            ))}
          </select>
          {registryReady && plugins.length === 0 && (
            <div className="text-sm text-pep-dark-gray">
              No evaluation plugin is available
            </div>
          )}
          {registryReady && plugins.length > 0 && available.length === 0 && (
            <div className="text-sm text-pep-dark-gray">
              All available plugins are selected
            </div>
          )}
        </div>
      )}
      {selected.length === 0 ? (
        <div className="text-sm text-pep-dark-gray">No plugins selected</div>
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
                    <span className="text-error text-sm ml-2">Unavailable</span>
                  )}
                </button>
                {!readOnly && (
                  <button
                    type="button"
                    className="px-3 py-2 rounded-md hover:bg-pep-blue-light focus-visible:outline focus-visible:outline-pep-blue"
                    aria-label={`Remove plugin ${plugin}`}
                    disabled={disabled || isLoading}
                    onClick={() =>
                      onChange(selected.filter((item) => item !== plugin))
                    }
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-pep-dark-gray">
            Plugins run in the order shown. Select a plugin name to view its
            details.
          </p>
          <section
            id={`${id}-details`}
            aria-label="Plugin details"
            className="rounded-md border border-pep-gray-border bg-white p-4 space-y-2"
          >
            <h3 className="font-medium text-black">{active}</h3>
            {registryReady && !plugins.includes(active) ? (
              <p className="text-error text-sm">
                This plugin is unavailable. Remove it before continuing.
              </p>
            ) : active === "mock" ? (
              <>
                <p className="text-sm text-pep-dark-gray">
                  Test plugin that returns generated scores to check the
                  evaluation workflow. These scores are not biological
                  predictions.
                </p>
                <p className="text-sm text-pep-dark-gray">
                  Output: <span className="text-black">mock_score</span>
                </p>
              </>
            ) : (
              <p className="text-sm text-pep-dark-gray">
                No description is available for this plugin.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
