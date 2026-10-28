import { describe, expect, it } from "vitest";

import { customBuildBudget, sharedPieces } from "./custom-build";
import type { Builder, PieceCounts } from "./domain-types";
import { counts } from "./test-utils";

const builder = (username: string, inventory: PieceCounts): Builder => ({
  id: username,
  username,
  location: "UKY",
  inventory,
});

const amy = builder("amy", counts(["3023", 5, 4], ["3001", 1, 2]));
const ben = builder("ben", counts(["3023", 5, 3], ["3001", 1, 5]));
const cat = builder("cat", counts(["3023", 5, 9]));
const dan = builder("dan", counts(["9999", 2, 1]));

describe("sharedPieces", () => {
  it("keeps the smallest quantity any of them owns", () => {
    expect([...sharedPieces([amy.inventory, ben.inventory])]).toEqual([
      ["3023:5", 3],
      ["3001:1", 2],
    ]);
  });

  it("drops a piece that one of them does not own", () => {
    expect(sharedPieces([amy.inventory, cat.inventory]).has("3001:1")).toBe(
      false,
    );
  });
});

describe("customBuildBudget", () => {
  it("picks the group whose shared pieces add up to the most", () => {
    const budget = customBuildBudget([amy, ben, cat, dan], 0.5);

    expect(budget.group.map((member) => member.username)).toEqual([
      "amy",
      "ben",
    ]);
    expect(budget.total).toBe(5);
  });

  it("rounds half of an odd number of builders up", () => {
    expect(customBuildBudget([amy, ben, cat], 0.5).group).toHaveLength(2);
  });

  it("can be limited to pieces the designer owns too", () => {
    const designer = counts(["3023", 5, 1]);

    expect(customBuildBudget([amy, ben, cat, dan], 0.5, designer).total).toBe(
      1,
    );
  });
});
