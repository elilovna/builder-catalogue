import type {
  ColourCode,
  DesignId,
  InventorySummary,
  PieceCounts,
  PieceKey,
  PieceLine,
} from "./domain-types";

export const pieceKey = (
  designId: DesignId,
  colourCode: ColourCode,
): PieceKey => `${designId}:${colourCode}`;

export const toPieceCounts = (lines: Iterable<PieceLine>): PieceCounts => {
  const counts = new Map<PieceKey, number>();

  for (const piece of lines) {
    const key = pieceKey(piece.designId, piece.colourCode);
    counts.set(key, (counts.get(key) ?? 0) + piece.quantity);
  }
  return counts;
};

export const parsePieceKey = (
  key: PieceKey,
): { designId: DesignId; colourCode: ColourCode } => {
  const separator = key.lastIndexOf(":");

  return {
    designId: key.slice(0, separator),
    colourCode: Number(key.slice(separator + 1)),
  };
};

export const summariseInventory = (
  inventory: PieceCounts,
): InventorySummary => {
  const designs = new Set<DesignId>();
  const colours = new Set<ColourCode>();
  let pieces = 0;

  for (const [key, count] of inventory) {
    const { designId, colourCode } = parsePieceKey(key);
    designs.add(designId);
    colours.add(colourCode);
    pieces += count;
  }

  return {
    pieces,
    lines: inventory.size,
    designs: designs.size,
    colours: colours.size,
  };
};

export const countColours = (inventories: Iterable<PieceCounts>): number => {
  const colours = new Set<ColourCode>();

  for (const inventory of inventories) {
    for (const key of inventory.keys()) {
      colours.add(parsePieceKey(key).colourCode);
    }
  }
  return colours.size;
};

export const piecesByColour = (
  counts: PieceCounts,
): { colourCode: ColourCode; pieces: number }[] => {
  const totals = new Map<ColourCode, number>();

  for (const [key, count] of counts) {
    const { colourCode } = parsePieceKey(key);
    totals.set(colourCode, (totals.get(colourCode) ?? 0) + count);
  }

  return [...totals]
    .map(([colourCode, pieces]) => ({ colourCode, pieces }))
    .sort((a, b) => b.pieces - a.pieces);
};

export const linesByColour = (
  counts: PieceCounts,
): { colourCode: ColourCode; pieces: number; lines: PieceLine[] }[] => {
  const lines = new Map<ColourCode, PieceLine[]>();

  for (const [key, quantity] of counts) {
    const { designId, colourCode } = parsePieceKey(key);
    const group = lines.get(colourCode) ?? [];
    group.push({ designId, colourCode, quantity });
    lines.set(colourCode, group);
  }

  return piecesByColour(counts).map(({ colourCode, pieces }) => ({
    colourCode,
    pieces,
    lines: (lines.get(colourCode) ?? []).sort(
      (a, b) => b.quantity - a.quantity || a.designId.localeCompare(b.designId),
    ),
  }));
};

export const pieceMatrix = (
  counts: PieceCounts,
): {
  colours: { colourCode: ColourCode; pieces: number }[];
  shapes: {
    designId: DesignId;
    pieces: number;
    byColour: ReadonlyMap<ColourCode, number>;
  }[];
} => {
  const shapes = new Map<DesignId, Map<ColourCode, number>>();

  for (const [key, quantity] of counts) {
    const { designId, colourCode } = parsePieceKey(key);
    const byColour = shapes.get(designId) ?? new Map<ColourCode, number>();
    byColour.set(colourCode, quantity);
    shapes.set(designId, byColour);
  }

  return {
    colours: piecesByColour(counts),
    shapes: [...shapes]
      .map(([designId, byColour]) => ({
        designId,
        pieces: [...byColour.values()].reduce((sum, count) => sum + count, 0),
        byColour,
      }))
      .sort((a, b) =>
        a.designId.localeCompare(b.designId, "en", { numeric: true }),
      ),
  };
};
