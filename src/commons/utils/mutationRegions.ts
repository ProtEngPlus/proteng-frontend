export type Region = [number, number];

export interface RegionRow {
  start: string;
  end: string;
}

export interface MutationLimits {
  proteinLength?: number;
  numMutationsLow?: number;
  numMutationsHigh?: number;
  numTrajectories?: number;
}

export const MAX_MUTATION_REGIONS = 10;

const isUsable = (value: number | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value);

// overlapping regions are merged, touching ones (3-10, 11-15) stay separate
export function mergeRegions(regions: Region[]): Region[] {
  const sorted = regions
    .map(([start, end]): Region => [start, end])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const merged: Region[] = [];
  for (const region of sorted) {
    const last = merged[merged.length - 1];
    if (last && region[0] <= last[1]) {
      last[1] = Math.max(last[1], region[1]);
    } else {
      merged.push(region);
    }
  }
  return merged;
}

export function regionsToRows(value: unknown): RegionRow[] {
  if (!Array.isArray(value)) return [];
  return value.map((region) => ({
    start: String(region?.[0] ?? ""),
    end: String(region?.[1] ?? ""),
  }));
}

const isDigits = (text: string) => /^\d+$/.test(text);

export function rowsToRegions(rows: RegionRow[]): Region[] {
  return rows
    .filter((row) => isDigits(row.start) && isDigits(row.end))
    .map((row): Region => [Number(row.start), Number(row.end)]);
}

export function hasIncompleteRow(rows: RegionRow[]): boolean {
  return rows.some((row) => (row.start === "") !== (row.end === ""));
}

// same rules as the conductor, values that are not known yet are skipped
export function findRegionsProblem(
  regions: Region[],
  limits: MutationLimits,
): string | undefined {
  const {
    proteinLength,
    numMutationsLow: low,
    numMutationsHigh: high,
    numTrajectories,
  } = limits;

  if (regions.length > MAX_MUTATION_REGIONS) {
    return `Use at most ${MAX_MUTATION_REGIONS} regions.`;
  }

  for (const [start, end] of regions) {
    if (start < 1 || start > end) {
      return `Region ${start}-${end} is not valid, it has to start at 1 or later and not end before it starts.`;
    }
    if (isUsable(proteinLength) && end > proteinLength) {
      return `Region ${start}-${end} goes past the end of the protein (length ${proteinLength}).`;
    }
  }

  const positions =
    regions.length > 0
      ? regions.reduce((sum, [start, end]) => sum + (end - start + 1), 0)
      : proteinLength;
  if (isUsable(high) && isUsable(positions) && high > positions) {
    return `Number of Mutations can not go up to ${high} when only ${positions} positions can mutate.`;
  }

  if (regions.length >= 2) {
    if (isUsable(low)) {
      const small = regions.find(([start, end]) => end - start + 1 < low);
      if (small) {
        const size = small[1] - small[0] + 1;
        return `Region ${small[0]}-${small[1]} has ${size} positions, fewer than the minimum Number of Mutations (${low}).`;
      }
    }
    // one trajectory per region and one more that combines them
    if (isUsable(numTrajectories) && numTrajectories < regions.length + 1) {
      return `Number of Trajectories must be at least ${regions.length + 1} for ${regions.length} regions.`;
    }
  }

  return undefined;
}

export function formatRegions(regions: unknown): string {
  if (!Array.isArray(regions) || regions.length === 0) return "Whole sequence";
  return regions.map((region) => `${region[0]}-${region[1]}`).join(", ");
}

export function formatRange(low: unknown, high: unknown): string {
  return `${low} - ${high}`;
}

// old mutations have mutate_pos_range instead of the new options
export function describeMutationOptions(
  options: Record<string, unknown>,
): { label: string; text: string }[] {
  const rows: { label: string; text: string }[] = [];
  const addText = (label: string, key: string) => {
    if (key in options) rows.push({ label, text: String(options[key]) });
  };

  addText("Number Of Trajectories", "num_trajectories");
  addText("Number Of Iterations", "num_iterations");
  if ("mutate_regions" in options) {
    rows.push({
      label: "Mutation Regions",
      text: formatRegions(options.mutate_regions),
    });
  }
  if ("num_mutations_low" in options || "num_mutations_high" in options) {
    rows.push({
      label: "Number Of Mutations",
      text: formatRange(options.num_mutations_low, options.num_mutations_high),
    });
  }
  addText("Amino Acids", "amino_acid_set");
  addText("Temperature", "temperature");
  addText("Mutate Position Range", "mutate_pos_range");
  return rows;
}
