import { useEffect, useRef, useState } from "react";
import { useController, useFormContext, useWatch } from "react-hook-form";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import {
  findRegionsProblem,
  formatRegions,
  hasIncompleteRow,
  MAX_MUTATION_REGIONS,
  mergeRegions,
  MutationLimits,
  Region,
  RegionRow,
  regionsToRows,
  rowsToRegions,
} from "../../../../utils/mutationRegions";

export type RegionListInputProps = {
  id: string;
  label: string;
  defaultValue?: Region[];
  disabled?: boolean;
  onEdit?: boolean;
  formatInput?: number;
  proteinLength?: number;
};

const layoutClass = (formatInput: number) =>
  formatInput === 1
    ? "grid grid-cols-2 w-[22%] place-items-start"
    : formatInput === 2
      ? "flex flex-row justify-between max-w-[1000px]"
      : formatInput === 3
        ? "grid grid-cols-[1fr,4fr] max-w-[1000px]"
        : "grid grid-cols-[1fr,2fr] max-w-[1000px]";

export default function RegionListInput({
  onEdit = true,
  ...props
}: RegionListInputProps) {
  return onEdit ? (
    <RegionListEditor {...props} />
  ) : (
    <RegionListReadOnly {...props} />
  );
}

function RegionListReadOnly({
  id,
  label,
  defaultValue,
  formatInput = 3,
}: RegionListInputProps) {
  const { control } = useFormContext();
  const value = useWatch({ control, name: id }) ?? defaultValue;

  return (
    <div
      className={`${layoutClass(formatInput)} min-w-fit space-x-3 items-start`}
    >
      <label className="font-light">{label}:</label>
      <div className="text-start">
        {value === undefined ? "-" : formatRegions(value)}
      </div>
    </div>
  );
}

function RegionListEditor({
  id,
  label,
  defaultValue,
  disabled,
  formatInput = 3,
  proteinLength,
}: RegionListInputProps) {
  const { control, getValues, setValue, clearErrors, watch } = useFormContext();

  const [rows, setRows] = useState<RegionRow[]>(() =>
    regionsToRows(getValues(id) ?? defaultValue),
  );
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const currentLimits = (): MutationLimits => ({
    proteinLength: proteinLength ?? getValues("input_protein")?.length,
    numMutationsLow: Number(getValues("num_mutations_low")),
    numMutationsHigh: Number(getValues("num_mutations_high")),
    numTrajectories: Number(getValues("num_trajectories")),
  });

  const { fieldState } = useController({
    name: id,
    control,
    defaultValue: defaultValue ?? [],
    rules: {
      validate: (value: Region[] | undefined) => {
        if (hasIncompleteRow(rowsRef.current)) {
          return "Fill in both the start and the end of every region, or remove the row.";
        }
        return (
          findRegionsProblem(mergeRegions(value ?? []), currentLimits()) ?? true
        );
      },
    },
  });

  // re-check when these change
  watch([
    "num_mutations_low",
    "num_mutations_high",
    "num_trajectories",
    "input_protein",
  ]);

  const typed = rowsToRegions(rows);
  const regions = mergeRegions(typed);

  // set value at beginning
  useEffect(() => {
    setValue(id, regions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const problem =
    findRegionsProblem(regions, currentLimits()) ?? fieldState.error?.message;

  const commit = (next: RegionRow[]) => {
    setRows(next);
    setValue(id, mergeRegions(rowsToRegions(next)), { shouldDirty: true });
    clearErrors(id);
  };

  const updateRow = (index: number, key: keyof RegionRow, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    commit(
      rows.map((row, i) => (i === index ? { ...row, [key]: digits } : row)),
    );
  };

  const addRegionButton = (
    <button
      type="button"
      disabled={disabled || rows.length >= MAX_MUTATION_REGIONS}
      onClick={() => commit([...rows, { start: "", end: "" }])}
      className="flex items-center gap-1 text-sm font-light text-pep-blue hover:underline disabled:cursor-not-allowed disabled:text-label disabled:no-underline"
    >
      <Icon icon="mingcute:add-line" className="size-4" />
      Add region
    </button>
  );

  const inputClass = clsx(
    "h-[40px] w-24 p-2 bg-white border text-sm font-light placeholder:text-placeholder rounded-md focus:ring-0 focus:border-pep-blue focus:outline-none disabled:cursor-not-allowed disabled:bg-disabled disabled:border-disabled disabled:text-label",
    problem ? "border-error" : "border-pep-gray-border",
  );

  return (
    <div
      className={`${layoutClass(formatInput)} min-w-fit space-x-3 items-start`}
    >
      <label className="font-light leading-[40px]">{label}:</label>
      <div className="space-y-2">
        {rows.length === 0 && (
          <div className="flex items-center gap-6 h-[40px]">
            <span className="text-sm">Whole sequence</span>
            {addRegionButton}
          </div>
        )}

        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-3">
            <input
              type="text"
              inputMode="numeric"
              value={row.start}
              onChange={(e) => updateRow(index, "start", e.target.value)}
              className={inputClass}
              disabled={disabled}
              autoComplete="off"
              placeholder="Start"
              aria-label={`Start of region ${index + 1}`}
            />
            <div className="text-pep-gray font-light text-sm">to</div>
            <input
              type="text"
              inputMode="numeric"
              value={row.end}
              onChange={(e) => updateRow(index, "end", e.target.value)}
              className={inputClass}
              disabled={disabled}
              autoComplete="off"
              placeholder="End"
              aria-label={`End of region ${index + 1}`}
            />
            <button
              type="button"
              disabled={disabled}
              onClick={() => commit(rows.filter((_, i) => i !== index))}
              className="text-pep-dark-gray hover:text-pep-gray disabled:cursor-not-allowed"
              aria-label={`Remove region ${index + 1}`}
            >
              <Icon icon="mingcute:close-line" className="size-5" />
            </button>
          </div>
        ))}

        {rows.length > 0 && addRegionButton}

        {regions.length < typed.length && (
          <p className="font-light text-xs text-pep-gray">
            Overlapping regions are merged into {formatRegions(regions)}.
          </p>
        )}

        {problem && (
          <span className="block font-light text-error text-xs">{problem}</span>
        )}
      </div>
    </div>
  );
}
