import type {
  BuildStatus,
  Coverage,
  LineCheck,
  PieceCounts,
  PieceKey,
} from "./domain-types";

export const canBuild = (
  required: PieceCounts,
  inventory: PieceCounts,
): boolean =>
  [...required].every(([key, needed]) => (inventory.get(key) ?? 0) >= needed);

const getCoverage = (
  required: PieceCounts,
  inventory: PieceCounts,
): Coverage => {
  let needed = 0;
  let covered = 0;
  const missing = new Map<PieceKey, number>();

  // Look at the set one line at a time, e.g. key "3023:7", need 4.
  for (const [key, need] of required) {
    const have = inventory.get(key) ?? 0; // how many the builder owns, 0 if none

    needed += need;
    covered += Math.min(need, have); // extra pieces don't count beyond the need

    if (have < need) {
      missing.set(key, need - have); // remember how many are short
    }
  }

  return { needed, covered, missing, linesTotal: required.size };
};

export const buildStatus = (
  required: PieceCounts,
  inventory: PieceCounts,
): BuildStatus => {
  const coverage = getCoverage(required, inventory);

  return coverage.missing.size === 0
    ? { kind: "ready", coverage }
    : { kind: "incomplete", coverage };
};

export const isOverHalfway = (status: BuildStatus): boolean =>
  status.kind === "incomplete" &&
  2 * status.coverage.covered >= status.coverage.needed;

export const isAlmostThere = (status: BuildStatus): boolean =>
  status.kind === "incomplete" &&
  10 * status.coverage.covered >= 9 * status.coverage.needed;

export const coveredShare = ({ coverage }: BuildStatus): number =>
  coverage.needed === 0 ? 1 : coverage.covered / coverage.needed;

export const readyPercent = (readyCount: number, totalSets: number): number =>
  totalSets === 0 ? 0 : (100 * readyCount) / totalSets;

export const completionPercent = (status: BuildStatus): number => {
  if (status.kind === "ready") {
    return 100;
  }

  const { covered, needed } = status.coverage;
  return Math.min(Math.round((100 * covered) / needed), 99);
};

export const checkLines = (
  required: PieceCounts,
  inventory: PieceCounts,
): LineCheck[] =>
  [...required]
    .map(([key, need]) => {
      const have = inventory.get(key) ?? 0;
      return { key, need, have, short: Math.max(need - have, 0) };
    })
    .sort((a, b) => a.key.localeCompare(b.key, "en", { numeric: true }));
