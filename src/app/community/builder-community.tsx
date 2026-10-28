import type { Route } from "next";

import type { Builder, CatalogSet, ColourCode } from "@/domain/domain-types";
import { avatarHex } from "@/lib/brick-colours";

import { BuilderPicker } from "./builder-picker";
import { ColourSwapsCard } from "./colour-swaps-card";
import { CustomBuildCard, type Reading } from "./custom-build-card";

const DEFAULT_BUILDER = "megabuilder99";

const parseBuilder = (
  value: string | string[] | undefined,
  builders: Builder[],
): Builder | undefined =>
  builders.find((builder) => builder.username === value) ??
  builders.find((builder) => builder.username === DEFAULT_BUILDER);

const parseReading = (value: string | string[] | undefined): Reading =>
  value === "owned" ? "owned" : "others";

const viewHref = (builder: string, reading: Reading): Route =>
  `?${new URLSearchParams({ builder, budget: reading })}`;

type BuilderCommunityProps = {
  builders: Builder[];
  sets: CatalogSet[];
  colourNames: ReadonlyMap<ColourCode, string>;
  searchParams: PageProps<"/community">["searchParams"];
};

export const BuilderCommunity = async ({
  builders,
  sets,
  colourNames,
  searchParams,
}: BuilderCommunityProps) => {
  const params = await searchParams;
  const builder = parseBuilder(params.builder, builders);
  const reading = parseReading(params.budget);

  if (!builder) {
    return null;
  }

  const options = builders
    .map((option) => ({
      username: option.username,
      avatarHex: avatarHex(option.id),
      href: viewHref(option.username, reading),
      current: option === builder,
    }))
    .sort((a, b) => a.username.localeCompare(b.username));

  return (
    <>
      <BuilderPicker options={options} />
      <CustomBuildCard
        designer={builder}
        builders={builders}
        reading={reading}
        othersHref={viewHref(builder.username, "others")}
        ownedHref={viewHref(builder.username, "owned")}
        colourNames={colourNames}
      />
      <ColourSwapsCard
        builder={builder}
        sets={sets}
        colourNames={colourNames}
      />
    </>
  );
};
