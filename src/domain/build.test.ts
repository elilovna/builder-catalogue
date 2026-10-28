import { describe, expect, it } from "vitest";

import {
  buildStatus,
  canBuild,
  checkLines,
  completionPercent,
  coveredShare,
  isAlmostThere,
  isOverHalfway,
  readyPercent,
} from "./build";
import { counts } from "./test-utils";

// The example set from the brief: 4 × 3023 in Blue, 2 × 4286 in Red, 1 × 4286 in White.
const set = counts(["3023", 7, 4], ["4286", 5, 2], ["4286", 1, 1]);
const exactly = counts(["3023", 7, 4], ["4286", 5, 2], ["4286", 1, 1]);

describe("canBuild", () => {
  it("builds when every piece is owned in the exact quantity", () => {
    expect(canBuild(set, exactly)).toBe(true);
  });

  it("builds when the builder has pieces left over", () => {
    const owned = counts(
      ["3023", 7, 10],
      ["4286", 5, 2],
      ["4286", 1, 1],
      ["3001", 3, 8],
    );

    expect(canBuild(set, owned)).toBe(true);
  });

  it("does not build when one piece is short by one", () => {
    const owned = counts(["3023", 7, 3], ["4286", 5, 2], ["4286", 1, 1]);

    expect(canBuild(set, owned)).toBe(false);
  });

  it("does not build when a piece is owned only in another colour", () => {
    const owned = counts(["3023", 1, 4], ["4286", 5, 2], ["4286", 1, 1]);

    expect(canBuild(set, owned)).toBe(false);
  });

  it("builds a set that needs no pieces", () => {
    expect(canBuild(counts(), counts())).toBe(true);
  });
});

describe("buildStatus", () => {
  it("is ready when nothing is missing", () => {
    const status = buildStatus(set, exactly);

    expect(status.kind).toBe("ready");
    expect(status.coverage).toMatchObject({
      needed: 7,
      covered: 7,
      linesTotal: 3,
    });
    expect(status.coverage.missing.size).toBe(0);
  });

  it("never counts more pieces than a line needs", () => {
    const status = buildStatus(set, counts(["3023", 7, 40]));

    expect(status.coverage.covered).toBe(4);
  });

  it("records how many pieces each short line is missing", () => {
    const status = buildStatus(set, counts(["3023", 7, 3], ["4286", 5, 2]));

    expect(status.kind).toBe("incomplete");
    expect([...status.coverage.missing]).toEqual([
      ["3023:7", 1],
      ["4286:1", 1],
    ]);
  });

  it("says ready exactly when canBuild says yes", () => {
    const inventories = [
      counts(),
      exactly,
      counts(["3023", 7, 3], ["4286", 5, 2], ["4286", 1, 1]),
      counts(["3023", 1, 4], ["4286", 5, 2], ["4286", 1, 1]),
    ];

    for (const inventory of inventories) {
      expect(buildStatus(set, inventory).kind === "ready").toBe(
        canBuild(set, inventory),
      );
    }
  });
});

describe("isOverHalfway", () => {
  it("counts a set that is exactly half covered", () => {
    const twoPieces = counts(["3001", 1, 2]);

    expect(isOverHalfway(buildStatus(twoPieces, counts(["3001", 1, 1])))).toBe(
      true,
    );
  });

  it("leaves out a set just under half", () => {
    // 3 of 7 pieces is 43%.
    expect(isOverHalfway(buildStatus(set, counts(["3023", 7, 3])))).toBe(false);
  });

  it("leaves out ready sets, which have their own tab", () => {
    expect(isOverHalfway(buildStatus(set, exactly))).toBe(false);
  });
});

describe("isAlmostThere", () => {
  const tenPieces = counts(["3001", 1, 10]);

  it("marks an incomplete set with at least 90% covered", () => {
    expect(isAlmostThere(buildStatus(tenPieces, counts(["3001", 1, 9])))).toBe(
      true,
    );
  });

  it("leaves out a set below 90%", () => {
    expect(isAlmostThere(buildStatus(tenPieces, counts(["3001", 1, 8])))).toBe(
      false,
    );
  });
});

describe("coveredShare", () => {
  it("is the share of the set's pieces that are covered", () => {
    // 4 of 7 pieces.
    expect(coveredShare(buildStatus(set, counts(["3023", 7, 4])))).toBe(4 / 7);
  });

  it("is 1 for a set that needs no pieces, not NaN", () => {
    expect(coveredShare(buildStatus(counts(), counts()))).toBe(1);
  });
});

describe("readyPercent", () => {
  it("is the share of the catalogue's sets that are ready", () => {
    expect(readyPercent(3, 15)).toBe(20);
  });

  it("is 0 when the catalogue has no sets, not NaN", () => {
    expect(readyPercent(0, 0)).toBe(0);
  });
});

describe("completionPercent", () => {
  it("rounds to the nearest whole percent", () => {
    // 2 of 3 pieces is 66.7%.
    const status = buildStatus(counts(["3001", 1, 3]), counts(["3001", 1, 2]));

    expect(completionPercent(status)).toBe(67);
  });

  it("never shows 100 for a set that is not ready", () => {
    // 999 of 1000 pieces is 99.9%, which would round up to 100.
    const status = buildStatus(
      counts(["3001", 1, 1000]),
      counts(["3001", 1, 999]),
    );

    expect(completionPercent(status)).toBe(99);
  });

  it("shows 100 for a ready set", () => {
    expect(completionPercent(buildStatus(set, exactly))).toBe(100);
  });
});

describe("checkLines", () => {
  it("lists every line with need, have and short, by piece", () => {
    const owned = counts(["3023", 7, 3], ["4286", 1, 5]);

    expect(checkLines(set, owned)).toEqual([
      { key: "3023:7", need: 4, have: 3, short: 1 },
      { key: "4286:1", need: 1, have: 5, short: 0 },
      { key: "4286:5", need: 2, have: 0, short: 2 },
    ]);
  });

  it("orders piece IDs as numbers, not by how short a line is", () => {
    const required = counts(["11211", 1, 9], ["4286", 5, 2], ["4286", 1, 2]);

    expect(checkLines(required, new Map()).map((line) => line.key)).toEqual([
      "4286:1",
      "4286:5",
      "11211:1",
    ]);
  });
});
