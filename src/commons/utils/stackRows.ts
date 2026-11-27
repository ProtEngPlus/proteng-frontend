import { LabRow } from "../interfaces/AssayType.interface";

export const stackRows = (current: LabRow[], incoming: LabRow[]) => {
  const seen = new Set(current.map((row) => row.sequence.toUpperCase()));
  const added: LabRow[] = [];
  incoming.forEach((row) => {
    const key = row.sequence.toUpperCase();
    if (seen.has(key)) return;
    seen.add(key);
    added.push(row);
  });
  return {
    rows: [...current, ...added],
    skipped: incoming.length - added.length,
  };
};
