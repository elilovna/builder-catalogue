import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { buildStatus, canBuild, isOverHalfway } from "@/domain/build";
import { setsWithColourSwaps } from "@/domain/colour-swaps";
import { customBuildBudget } from "@/domain/custom-build";
import type { Builder, PieceCounts } from "@/domain/domain-types";
import { completingPairs, pickGroup, rankPartners } from "@/domain/partners";
import {
  countColours,
  parsePieceKey,
  pieceMatrix,
  summariseInventory,
  toPieceCounts,
} from "@/domain/pieces";
import { combine } from "@/domain/test-utils";

import { toBuilder, toCatalogSet } from "./mappers";
import { SetDetailSchema, UserDetailSchema } from "./schemas";

const readFixture = (file: string): unknown =>
  JSON.parse(
    readFileSync(path.join(process.cwd(), "test", "fixtures", file), "utf8"),
  );

const users = UserDetailSchema.array().parse(readFixture("builders.json"));
const sets = SetDetailSchema.array().parse(readFixture("sets.json"));
const builders = users.map(toBuilder);
const catalog = sets.map(toCatalogSet);

const findBuilder = (username: string) => {
  const builder = builders.find((candidate) => candidate.username === username);
  if (!builder) {
    throw new Error(`No recorded builder called ${username}`);
  }
  return builder;
};

const findSet = (name: string) => {
  const set = catalog.find((candidate) => candidate.name === name);
  if (!set) {
    throw new Error(`No recorded set called ${name}`);
  }
  return set;
};

describe("recorded API data", () => {
  it("has every builder and every set", () => {
    expect(builders).toHaveLength(11);
    expect(catalog).toHaveLength(15);
  });

  it("turns an inventory colour sent as text into a number", () => {
    expect(findBuilder("brickfan35").inventory.get("3710:155")).toBe(9);
  });

  it("uses 11 colours, far fewer than the API's colour list names", () => {
    const inventories = [
      ...builders.map((builder) => builder.inventory),
      ...catalog.map((set) => set.required),
    ];

    expect(countColours(inventories)).toBe(11);
  });

  it("adds up to the totals the API reports", () => {
    for (const user of users) {
      expect(summariseInventory(toBuilder(user).inventory).pieces).toBe(
        user.brickCount,
      );
    }
    for (const set of sets) {
      expect(summariseInventory(toCatalogSet(set).required).pieces).toBe(
        set.totalPieces,
      );
    }
  });
});

describe("the brief: brickfan35", () => {
  const { inventory } = findBuilder("brickfan35");

  it("can build car-wash, castaway and undersea-monster", () => {
    const buildable = catalog
      .filter((set) => canBuild(set.required, inventory))
      .map((set) => set.name)
      .sort();

    expect(buildable).toEqual(["car-wash", "castaway", "undersea-monster"]);
  });

  it("has 466 of 690 pieces for peacock-farm, short on 63 of 142 lines", () => {
    const { coverage } = buildStatus(
      findSet("peacock-farm").required,
      inventory,
    );

    expect(coverage.covered).toBe(466);
    expect(coverage.needed).toBe(690);
    expect(coverage.missing.size).toBe(63);
    expect(coverage.linesTotal).toBe(142);
  });

  it("has 7 sets over halfway", () => {
    const overHalfway = catalog.filter((set) =>
      isOverHalfway(buildStatus(set.required, inventory)),
    );

    expect(overHalfway).toHaveLength(7);
  });
});

describe("stretch 1: landscape-artist and tropical-island", () => {
  const landscapeArtist = findBuilder("landscape-artist");
  const tropicalIsland = findSet("tropical-island").required;
  const ranked = rankPartners(
    tropicalIsland,
    landscapeArtist.inventory,
    builders.filter((builder) => builder !== landscapeArtist),
  );

  it("only spaceman77 can complete it with landscape-artist", () => {
    const completers = ranked
      .filter((help) => help.completes)
      .map((help) => help.builder.username);

    expect(completers).toEqual(["spaceman77"]);
  });

  it("really is buildable when landscape-artist and spaceman77 pool their pieces", () => {
    const pooled = combine(
      landscapeArtist.inventory,
      findBuilder("spaceman77").inventory,
    );

    expect(canBuild(tropicalIsland, landscapeArtist.inventory)).toBe(false);
    expect(canBuild(tropicalIsland, pooled)).toBe(true);
  });

  it("has technical-spike next, 6 pieces short", () => {
    expect(ranked[1]).toMatchObject({ adds: 54, missingAfter: 6 });
    expect(ranked[1]?.builder.username).toBe("technical-spike");
  });
});

describe("stretch 1: when nobody completes a set alone", () => {
  const lunarNewYear = findSet("lunar-new-year").required;
  const partnersOf = (owner: Builder, required: PieceCounts) =>
    rankPartners(
      required,
      owner.inventory,
      builders.filter((builder) => builder !== owner),
    ).map((help) => help.builder);
  const usernames = (partners: Builder[]) =>
    partners.map((partner) => partner.username);

  it("megabuilder99 needs a group of three for lunar-new-year", () => {
    const megabuilder99 = findBuilder("megabuilder99");
    const partners = partnersOf(megabuilder99, lunarNewYear);
    const group = pickGroup(lunarNewYear, megabuilder99.inventory, partners);
    const members = group.members.map((member) => member.builder);

    expect(
      completingPairs(lunarNewYear, megabuilder99.inventory, partners),
    ).toEqual([]);
    expect(usernames(members)).toEqual([
      "green-bricks-only",
      "landscape-artist",
      "dr_crocodile",
    ]);
    expect(group.missingAfter).toBe(0);

    const pooled = members.reduce(
      (pieces, member) => combine(pieces, member.inventory),
      megabuilder99.inventory,
    );
    expect(canBuild(lunarNewYear, pooled)).toBe(true);
  });

  it("technical-spike has three pairs for lunar-new-year, where greedy picks three builders", () => {
    const technicalSpike = findBuilder("technical-spike");
    const partners = partnersOf(technicalSpike, lunarNewYear);

    expect(
      completingPairs(lunarNewYear, technicalSpike.inventory, partners).map(
        usernames,
      ),
    ).toEqual([
      ["landscape-artist", "green-bricks-only"],
      ["landscape-artist", "underground-bricks"],
      ["green-bricks-only", "arts-n-bricks"],
    ]);
    expect(
      pickGroup(lunarNewYear, technicalSpike.inventory, partners).members,
    ).toHaveLength(3);
  });

  it("has a partner, a pair or a group for every unfinished set, and every pair really builds it", () => {
    const found = { alone: 0, pair: 0, group: 0, nobody: 0 };

    for (const owner of builders) {
      for (const set of catalog) {
        if (canBuild(set.required, owner.inventory)) {
          continue;
        }
        const partners = partnersOf(owner, set.required);
        const pairs = completingPairs(set.required, owner.inventory, partners);

        for (const [first, second] of pairs) {
          const pooled = combine(
            combine(owner.inventory, first.inventory),
            second.inventory,
          );
          expect(canBuild(set.required, pooled)).toBe(true);
        }

        if (
          rankPartners(set.required, owner.inventory, partners)[0]?.completes
        ) {
          found.alone += 1;
        } else if (pairs.length > 0) {
          found.pair += 1;
        } else if (
          pickGroup(set.required, owner.inventory, partners).missingAfter === 0
        ) {
          found.group += 1;
        } else {
          found.nobody += 1;
        }
      }
    }

    expect(found).toEqual({ alone: 126, pair: 19, group: 1, nobody: 0 });
  });
});

describe("stretch 2: megabuilder99's custom build", () => {
  const megabuilder99 = findBuilder("megabuilder99");
  const others = builders.filter((builder) => builder !== megabuilder99);
  const budget = customBuildBudget(others, 0.5);

  it("can use up to 618 pieces that 5 of the 10 others all own", () => {
    expect(budget.total).toBe(618);
    expect(budget.pieces.size).toBe(170);
    expect(budget.group.map((member) => member.username)).toEqual([
      "arts-n-bricks",
      "captain-pieces",
      "dr_crocodile",
      "green-bricks-only",
      "spaceman77",
    ]);
  });

  it("really can be built by each of those 5 builders", () => {
    for (const member of budget.group) {
      expect(canBuild(budget.pieces, member.inventory)).toBe(true);
    }
  });

  it("fits one table of 24 shapes by 8 colours", () => {
    const matrix = pieceMatrix(budget.pieces);

    expect(matrix.shapes).toHaveLength(24);
    expect(matrix.colours).toHaveLength(8);
  });

  describe("when megabuilder99 must own the pieces too", () => {
    const owned = customBuildBudget(others, 0.5, megabuilder99.inventory);

    it("is 423 pieces, shared by a different group of 5", () => {
      expect(owned.total).toBe(423);
      expect(owned.pieces.size).toBe(109);
      expect(owned.group.map((member) => member.username)).toEqual([
        "arts-n-bricks",
        "captain-pieces",
        "dr_crocodile",
        "technical-spike",
        "wizard13",
      ]);
    });

    it("really can be built by megabuilder99 and each of those 5", () => {
      for (const member of [megabuilder99, ...owned.group]) {
        expect(canBuild(owned.pieces, member.inventory)).toBe(true);
      }
    });
  });
});

describe("stretch 3: dr_crocodile with colour swaps", () => {
  const drCrocodile = findBuilder("dr_crocodile");
  const builds = setsWithColourSwaps(catalog, drCrocodile.inventory);

  it("can build one more set, coffee-bar", () => {
    expect(builds.map(({ set }) => set.name)).toEqual(["coffee-bar"]);
  });

  it("really can build coffee-bar once its colours are swapped", () => {
    for (const { set, swaps } of builds) {
      const recoloured = toPieceCounts(
        [...set.required].map(([key, quantity]) => {
          const { designId, colourCode } = parsePieceKey(key);
          return {
            designId,
            colourCode: swaps.get(colourCode) ?? colourCode,
            quantity,
          };
        }),
      );

      expect(recoloured.size).toBe(set.required.size);
      expect(canBuild(recoloured, drCrocodile.inventory)).toBe(true);
    }
  });
});
