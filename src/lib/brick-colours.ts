import type { ColourCode, PieceCounts } from "@/domain/domain-types";
import { piecesByColour } from "@/domain/pieces";

const BRICK_HEX: Record<ColourCode, string> = {
  1: "#f4f4f4",
  2: "#dec69c",
  3: "#f2cd37",
  4: "#fe8a18",
  5: "#c91a09",
  7: "#0055bf",
  8: "#583927",
  9: "#a0a5a9",
  34: "#bbe90b",
  152: "#adc3c0",
  155: "#9b9a5a",
};

const UNKNOWN_HEX = "#aeb6c0";

export const WHITE: ColourCode = 1;

export const brickHex = (code: ColourCode): string =>
  BRICK_HEX[code] ?? UNKNOWN_HEX;

export type ColourShare = {
  code: ColourCode;
  name: string;
  hex: string;
  pieces: number;
};

export const colourShares = (
  counts: PieceCounts,
  names: ReadonlyMap<ColourCode, string>,
): ColourShare[] =>
  piecesByColour(counts).map(({ colourCode, pieces }) => ({
    code: colourCode,
    name: names.get(colourCode) ?? `Colour ${colourCode}`,
    hex: brickHex(colourCode),
    pieces,
  }));

const AVATAR_COLOURS: ColourCode[] = [5, 3, 7, 34, 152, 4, 155, 9, 2];

export const avatarHex = (builderId: string): string => {
  let hash = 0x811c9dc5;
  for (const character of builderId) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 0x01000193) >>> 0;
  }
  return brickHex(AVATAR_COLOURS[hash % AVATAR_COLOURS.length] ?? WHITE);
};
