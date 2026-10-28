import { describe, expect, it } from "vitest";

import {
  countColours,
  linesByColour,
  parsePieceKey,
  pieceKey,
  pieceMatrix,
  piecesByColour,
  summariseInventory,
  toPieceCounts,
} from "./pieces";
import { counts } from "./test-utils";

describe("pieceKey", () => {
  it("joins the design id and the colour code", () => {
    expect(pieceKey("3023", 5)).toBe("3023:5");
  });

  it("gives the same shape in another colour a different key", () => {
    expect(pieceKey("3023", 5)).not.toBe(pieceKey("3023", 1));
  });
});

describe("parsePieceKey", () => {
  it("splits a key back into its shape and colour", () => {
    expect(parsePieceKey("3069b:155")).toEqual({
      designId: "3069b",
      colourCode: 155,
    });
  });

  it("gives back what pieceKey was made from", () => {
    expect(parsePieceKey(pieceKey("75523", 4))).toEqual({
      designId: "75523",
      colourCode: 4,
    });
  });
});

describe("toPieceCounts", () => {
  it("adds up two lines for the same piece", () => {
    const result = toPieceCounts([
      { designId: "3023", colourCode: 5, quantity: 4 },
      { designId: "3023", colourCode: 5, quantity: 2 },
    ]);

    expect(result.get("3023:5")).toBe(6);
  });

  it("keeps the same shape in different colours apart", () => {
    const result = toPieceCounts([
      { designId: "3023", colourCode: 5, quantity: 4 },
      { designId: "3023", colourCode: 1, quantity: 2 },
    ]);

    expect(result.get("3023:5")).toBe(4);
    expect(result.get("3023:1")).toBe(2);
  });
});

describe("summariseInventory", () => {
  it("counts pieces, lines, shapes and colours", () => {
    const inventory = counts(["3023", 5, 4], ["3023", 1, 2], ["4286", 5, 3]);

    expect(summariseInventory(inventory)).toEqual({
      pieces: 9,
      lines: 3,
      designs: 2,
      colours: 2,
    });
  });
});

describe("countColours", () => {
  it("counts a colour once, however many inventories use it", () => {
    const amy = counts(["3023", 5, 4], ["3023", 1, 2]);
    const ben = counts(["4286", 5, 3], ["3001", 155, 1]);

    // Red (5) is in both, so 5, 1 and 155 make three.
    expect(countColours([amy, ben])).toBe(3);
  });

  it("is 0 with nothing to count", () => {
    expect(countColours([])).toBe(0);
  });
});

describe("piecesByColour", () => {
  it("adds up pieces per colour, most used first", () => {
    const inventory = counts(["3023", 1, 2], ["3023", 5, 4], ["4286", 5, 3]);

    expect(piecesByColour(inventory)).toEqual([
      { colourCode: 5, pieces: 7 },
      { colourCode: 1, pieces: 2 },
    ]);
  });
});

describe("linesByColour", () => {
  it("groups lines by colour, most used colour and biggest line first", () => {
    const inventory = counts(
      ["3023", 1, 2],
      ["3023", 5, 1],
      ["4286", 5, 6],
      ["3001", 5, 1],
    );

    expect(linesByColour(inventory)).toEqual([
      {
        colourCode: 5,
        pieces: 8,
        lines: [
          { designId: "4286", colourCode: 5, quantity: 6 },
          { designId: "3001", colourCode: 5, quantity: 1 },
          { designId: "3023", colourCode: 5, quantity: 1 },
        ],
      },
      {
        colourCode: 1,
        pieces: 2,
        lines: [{ designId: "3023", colourCode: 1, quantity: 2 }],
      },
    ]);
  });
});

describe("pieceMatrix", () => {
  it("puts each shape on one row, with its amount in every colour it comes in", () => {
    const matrix = pieceMatrix(
      counts(["3023", 1, 2], ["3023", 5, 4], ["4286", 5, 1]),
    );

    expect(matrix.colours).toEqual([
      { colourCode: 5, pieces: 5 },
      { colourCode: 1, pieces: 2 },
    ]);
    expect(matrix.shapes).toEqual([
      {
        designId: "3023",
        pieces: 6,
        byColour: new Map([
          [1, 2],
          [5, 4],
        ]),
      },
      { designId: "4286", pieces: 1, byColour: new Map([[5, 1]]) },
    ]);
  });

  it("puts shapes in design ID order, as numbers, whatever their totals", () => {
    const matrix = pieceMatrix(
      counts(["11211", 1, 9], ["3069b", 5, 1], ["4286", 5, 3]),
    );

    expect(matrix.shapes.map((shape) => shape.designId)).toEqual([
      "3069b",
      "4286",
      "11211",
    ]);
  });
});
