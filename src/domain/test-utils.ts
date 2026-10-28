import type { ColourCode, DesignId, PieceCounts } from "./domain-types";
import { toPieceCounts } from "./pieces";

export const counts = (
  ...lines: [DesignId, ColourCode, number][]
): PieceCounts =>
  toPieceCounts(
    lines.map(([designId, colourCode, quantity]) => ({
      designId,
      colourCode,
      quantity,
    })),
  );

export const combine = (a: PieceCounts, b: PieceCounts): PieceCounts => {
  const result = new Map(a);
  for (const [key, count] of b) {
    result.set(key, (result.get(key) ?? 0) + count);
  }
  return result;
};
