import type { Builder, PieceCounts, PieceKey } from "./domain-types";
import { summariseInventory } from "./pieces";

export const sharedPieces = (inventories: PieceCounts[]): PieceCounts => {
  const [first, ...rest] = inventories;
  const shared = new Map<PieceKey, number>();
  if (!first) {
    return shared;
  }

  for (const [key, count] of first) {
    let smallest = count;
    for (const inventory of rest) {
      smallest = Math.min(smallest, inventory.get(key) ?? 0);
    }
    if (smallest > 0) {
      shared.set(key, smallest);
    }
  }
  return shared;
};

const groupsOf = <Item>(items: Item[], size: number): Item[][] => {
  if (size === 0) {
    return [[]];
  }
  const [first, ...rest] = items;
  if (first === undefined || items.length < size) {
    return [];
  }

  const withFirst = groupsOf(rest, size - 1).map((group) => [first, ...group]);
  const withoutFirst = groupsOf(rest, size);
  return [...withFirst, ...withoutFirst];
};

export type CustomBuildBudget = {
  group: Builder[];
  pieces: PieceCounts;
  total: number;
};

export const customBuildBudget = (
  others: Builder[],
  share: number,
  within?: PieceCounts,
): CustomBuildBudget => {
  const groupSize = Math.max(1, Math.ceil(share * others.length));
  let best: CustomBuildBudget = { group: [], pieces: new Map(), total: 0 };

  for (const group of groupsOf(others, groupSize)) {
    const inventories = group.map((builder) => builder.inventory);
    const pieces = sharedPieces(
      within ? [within, ...inventories] : inventories,
    );
    const total = summariseInventory(pieces).pieces;

    if (total > best.total) {
      best = { group, pieces, total };
    }
  }
  return best;
};
