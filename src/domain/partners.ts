import { buildStatus, canBuild } from "./build";
import type { Builder, PieceCounts } from "./domain-types";

export type PartnerHelp = {
  builder: Builder;
  adds: number;
  missingAfter: number;
  completes: boolean;
};

export type GroupMember = {
  builder: Builder;
  adds: number;
};

export type PartnerGroup = {
  members: GroupMember[];
  missingAfter: number;
};

export const rankPartners = (
  required: PieceCounts,
  inventory: PieceCounts,
  partners: Builder[],
): PartnerHelp[] => {
  const { needed, covered, missing } = buildStatus(
    required,
    inventory,
  ).coverage;
  const gap = needed - covered;

  return partners
    .map((builder) => {
      const adds = buildStatus(missing, builder.inventory).coverage.covered;
      return {
        builder,
        adds,
        missingAfter: gap - adds,
        completes: adds === gap,
      };
    })
    .sort(
      (a, b) =>
        a.missingAfter - b.missingAfter ||
        a.builder.username.localeCompare(b.builder.username),
    );
};

export const completingPairs = (
  required: PieceCounts,
  inventory: PieceCounts,
  partners: Builder[],
): [Builder, Builder][] => {
  const { missing } = buildStatus(required, inventory).coverage;
  const candidates = partners
    .map((builder) => ({
      builder,
      stillMissing: buildStatus(missing, builder.inventory).coverage.missing,
    }))
    .filter(({ stillMissing }) => stillMissing.size > 0);

  const pairs: [Builder, Builder][] = [];
  candidates.forEach(({ builder: first, stillMissing }, index) => {
    for (const { builder: second } of candidates.slice(index + 1)) {
      if (canBuild(stillMissing, second.inventory)) {
        pairs.push([first, second]);
      }
    }
  });
  return pairs;
};

export const pickGroup = (
  required: PieceCounts,
  inventory: PieceCounts,
  partners: Builder[],
): PartnerGroup => {
  const { needed, covered, missing } = buildStatus(
    required,
    inventory,
  ).coverage;
  let stillMissing = missing;
  let missingAfter = needed - covered;
  let left = partners;
  const members: GroupMember[] = [];

  while (stillMissing.size > 0) {
    let best: GroupMember | undefined;
    for (const builder of left) {
      const adds = buildStatus(stillMissing, builder.inventory).coverage
        .covered;
      if (adds > (best?.adds ?? 0)) {
        best = { builder, adds };
      }
    }
    if (!best) {
      break;
    }

    const picked = best.builder;
    members.push(best);
    missingAfter -= best.adds;
    stillMissing = buildStatus(stillMissing, picked.inventory).coverage.missing;
    left = left.filter((builder) => builder !== picked);
  }

  return { members, missingAfter };
};
