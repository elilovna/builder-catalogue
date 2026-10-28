import { canBuild } from "./build";
import type { CatalogSet, ColourCode, PieceCounts } from "./domain-types";
import { linesByColour, pieceKey, piecesByColour } from "./pieces";

type Swap = [from: ColourCode, to: ColourCode];

export const findColourSwaps = (
  required: PieceCounts,
  inventory: PieceCounts,
): ReadonlyMap<ColourCode, ColourCode> | undefined => {
  const owned = piecesByColour(inventory).map(({ colourCode }) => colourCode);

  // For each colour of the set, the owned colours with enough of every one of its pieces.
  // Its own colour is tried first, so a colour that can stay usually does.
  const colours = linesByColour(required).map(({ colourCode, lines }) => ({
    from: colourCode,
    options: [
      colourCode,
      ...owned.filter((code) => code !== colourCode),
    ].filter((to) =>
      lines.every(
        (line) =>
          (inventory.get(pieceKey(line.designId, to)) ?? 0) >= line.quantity,
      ),
    ),
  }));

  // Gives the colours a new colour one at a time, and steps back when a later colour has
  // none left. A set has at most a handful of colours, so this stays fast.
  const assign = (chosen: Swap[]): Swap[] | undefined => {
    const colour = colours[chosen.length];
    if (!colour) {
      return chosen; // every colour has one
    }

    for (const to of colour.options) {
      if (chosen.some(([, taken]) => taken === to)) {
        continue; // another colour already became this one
      }
      const found = assign([...chosen, [colour.from, to]]);
      if (found) {
        return found;
      }
    }
    return undefined;
  };

  const swaps = assign([]);
  return swaps ? new Map(swaps.filter(([from, to]) => from !== to)) : undefined;
};

export type ColourSwapBuild = {
  set: CatalogSet;
  swaps: ReadonlyMap<ColourCode, ColourCode>;
};

export const setsWithColourSwaps = (
  sets: CatalogSet[],
  inventory: PieceCounts,
): ColourSwapBuild[] =>
  sets.flatMap((set) => {
    if (canBuild(set.required, inventory)) {
      return [];
    }
    const swaps = findColourSwaps(set.required, inventory);
    return swaps ? [{ set, swaps }] : [];
  });
