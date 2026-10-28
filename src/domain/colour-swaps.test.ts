import { describe, expect, it } from "vitest";

import { findColourSwaps, setsWithColourSwaps } from "./colour-swaps";
import type { CatalogSet, PieceCounts } from "./domain-types";
import { counts } from "./test-utils";

const catalogSet = (name: string, required: PieceCounts): CatalogSet => ({
  id: name,
  name,
  setNumber: "000XX",
  required,
});

describe("findColourSwaps", () => {
  it("swaps a colour the builder lacks for one they own", () => {
    const set = counts(["3023", 5, 4]);
    const inventory = counts(["3023", 7, 4]);

    expect(findColourSwaps(set, inventory)).toEqual(new Map([[5, 7]]));
  });

  it("keeps a colour that already fits", () => {
    const set = counts(["3023", 5, 4], ["3001", 1, 2]);
    const inventory = counts(["3023", 7, 4], ["3001", 3, 5], ["3001", 1, 2]);

    expect(findColourSwaps(set, inventory)).toEqual(new Map([[5, 7]]));
  });

  it("can give a colour to another colour of the set, as in the brief", () => {
    const set = counts(["3001", 1, 4], ["3039", 5, 2], ["3024", 34, 1]);
    const inventory = counts(["3001", 5, 4], ["3039", 7, 2], ["3024", 34, 1]);

    expect(findColourSwaps(set, inventory)).toEqual(
      new Map([
        [1, 5],
        [5, 7],
      ]),
    );
  });

  it("moves every piece of a colour together", () => {
    const set = counts(["3023", 5, 4], ["3001", 5, 2]);
    const inventory = counts(["3023", 7, 4], ["3001", 3, 2]);

    expect(findColourSwaps(set, inventory)).toBeUndefined();
  });

  it("never turns two colours into the same one", () => {
    const set = counts(["3023", 5, 2], ["3001", 1, 2]);
    const inventory = counts(["3023", 7, 2], ["3001", 7, 2]);

    expect(findColourSwaps(set, inventory)).toBeUndefined();
  });
});

describe("setsWithColourSwaps", () => {
  it("lists only the sets that swaps make buildable", () => {
    const inventory = counts(["3023", 7, 4]);
    const sets = [
      catalogSet("already-buildable", counts(["3023", 7, 4])),
      catalogSet("needs-a-swap", counts(["3023", 5, 4])),
      catalogSet("out-of-reach", counts(["3023", 5, 9])),
    ];

    expect(setsWithColourSwaps(sets, inventory)).toEqual([
      { set: sets[1], swaps: new Map([[5, 7]]) },
    ]);
  });
});
