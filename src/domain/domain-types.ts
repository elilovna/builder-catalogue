export type DesignId = string;

export type ColourCode = number;

export type PieceKey = `${DesignId}:${ColourCode}`;

export type PieceCounts = ReadonlyMap<PieceKey, number>;

export type PieceLine = {
  designId: DesignId;
  colourCode: ColourCode;
  quantity: number;
};

export type Coverage = {
  needed: number;
  covered: number;
  missing: PieceCounts;
  linesTotal: number;
};

export type LineCheck = {
  key: PieceKey;
  need: number;
  have: number;
  short: number;
};

export type BuildStatus =
  | { kind: "ready"; coverage: Coverage }
  | { kind: "incomplete"; coverage: Coverage };

export type Builder = {
  id: string;
  username: string;
  location: string;
  inventory: PieceCounts;
};

export type CatalogSet = {
  id: string;
  name: string;
  setNumber: string;
  required: PieceCounts;
};

export type InventorySummary = {
  pieces: number;
  lines: number;
  designs: number;
  colours: number;
};
