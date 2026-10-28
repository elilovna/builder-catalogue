import { describe, expect, it } from "vitest";

import type { Builder, PieceCounts } from "./domain-types";
import {
  completingPairs,
  pickGroup,
  rankPartners,
  type PartnerGroup,
} from "./partners";
import { counts } from "./test-utils";

const builder = (username: string, inventory: PieceCounts): Builder => ({
  id: username,
  username,
  location: "UKY",
  inventory,
});

const set = counts(["3023", 7, 4], ["4286", 5, 2]);
const owner = counts(["3023", 7, 3]);

describe("rankPartners", () => {
  it("marks a partner who owns the whole gap", () => {
    const [help] = rankPartners(set, owner, [
      builder("helper", counts(["3023", 7, 1], ["4286", 5, 2])),
    ]);

    expect(help).toMatchObject({ adds: 3, missingAfter: 0, completes: true });
  });

  it("counts only what fills the gap, not everything the partner owns", () => {
    const [help] = rankPartners(set, owner, [
      builder("hoarder", counts(["3023", 7, 50])),
    ]);

    expect(help).toMatchObject({ adds: 1, missingAfter: 2, completes: false });
  });

  it("ignores pieces in the wrong colour", () => {
    const [help] = rankPartners(set, owner, [
      builder("other-colour", counts(["4286", 1, 2])),
    ]);

    expect(help).toMatchObject({ adds: 0, missingAfter: 3 });
  });

  it("puts the partner who leaves the least missing first, then sorts by name", () => {
    const ranked = rankPartners(set, owner, [
      builder("zoe", counts(["3023", 7, 1])),
      builder("amy", counts(["3023", 7, 1])),
      builder("best", counts(["4286", 5, 2])),
    ]);

    expect(ranked.map((help) => help.builder.username)).toEqual([
      "best",
      "amy",
      "zoe",
    ]);
  });
});

describe("completingPairs", () => {
  it("finds two partners who complete it only together", () => {
    const pairs = completingPairs(set, owner, [
      builder("blue", counts(["3023", 7, 1])),
      builder("red", counts(["4286", 5, 2])),
    ]);

    expect(
      pairs.map((pair) => pair.map((partner) => partner.username)),
    ).toEqual([["blue", "red"]]);
  });

  it("adds both partners' pieces on the same line", () => {
    const pairs = completingPairs(set, owner, [
      builder("one-red", counts(["3023", 7, 1], ["4286", 5, 1])),
      builder("other-red", counts(["4286", 5, 1])),
    ]);

    expect(pairs).toHaveLength(1);
  });

  it("leaves out a partner who completes it alone", () => {
    const pairs = completingPairs(set, owner, [
      builder("helper", counts(["3023", 7, 1], ["4286", 5, 2])),
      builder("red", counts(["4286", 5, 2])),
    ]);

    expect(pairs).toEqual([]);
  });

  it("finds nothing when a line is missing from both partners", () => {
    const pairs = completingPairs(set, owner, [
      builder("blue", counts(["3023", 7, 1])),
      builder("also-blue", counts(["3023", 7, 9])),
    ]);

    expect(pairs).toEqual([]);
  });
});

describe("pickGroup", () => {
  const six = counts(
    ["3023", 1, 1],
    ["3023", 2, 1],
    ["3023", 3, 1],
    ["3023", 4, 1],
    ["3023", 5, 1],
    ["3023", 6, 1],
  );
  const usernames = (group: PartnerGroup) =>
    group.members.map((member) => member.builder.username);

  it("takes whoever adds the most of what is still missing, until nothing is", () => {
    const group = pickGroup(six, counts(), [
      builder("one-two", counts(["3023", 1, 1], ["3023", 2, 1])),
      builder(
        "three-to-six",
        counts(["3023", 3, 1], ["3023", 4, 1], ["3023", 5, 1], ["3023", 6, 1]),
      ),
      builder("one-only", counts(["3023", 1, 1])),
    ]);

    expect(group.members.map((member) => member.adds)).toEqual([4, 2]);
    expect(usernames(group)).toEqual(["three-to-six", "one-two"]);
    expect(group.missingAfter).toBe(0);
  });

  it("does not count a picked partner's pieces twice", () => {
    const group = pickGroup(counts(["3023", 26, 4]), counts(), [
      builder("half", counts(["3023", 26, 2])),
    ]);

    expect(group).toMatchObject({ missingAfter: 2 });
    expect(group.members).toHaveLength(1);
  });

  it("says how many pieces are still missing when everyone together falls short", () => {
    const group = pickGroup(six, counts(), [
      builder("one-two", counts(["3023", 1, 1], ["3023", 2, 1])),
      builder("nothing-useful", counts(["4286", 5, 9])),
    ]);

    expect(usernames(group)).toEqual(["one-two"]);
    expect(group.missingAfter).toBe(4);
  });

  it("can pick more partners than needed, which is why pairs are checked first", () => {
    const partners = [
      builder(
        "one-to-three",
        counts(["3023", 1, 1], ["3023", 2, 1], ["3023", 3, 1]),
      ),
      builder(
        "four-to-six",
        counts(["3023", 4, 1], ["3023", 5, 1], ["3023", 6, 1]),
      ),
      builder(
        "middle",
        counts(["3023", 1, 1], ["3023", 2, 1], ["3023", 4, 1], ["3023", 5, 1]),
      ),
    ];

    expect(usernames(pickGroup(six, counts(), partners))).toEqual([
      "middle",
      "one-to-three",
      "four-to-six",
    ]);
    expect(
      completingPairs(six, counts(), partners).map((pair) =>
        pair.map((partner) => partner.username),
      ),
    ).toEqual([["one-to-three", "four-to-six"]]);
  });
});
