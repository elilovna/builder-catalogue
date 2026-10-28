import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  getBuilder,
  getCatalogSets,
  getColourNames,
  getUsernames,
} from "@/catalog/queries";
import { buildStatus, checkLines } from "@/domain/build";
import { piecesByColour } from "@/domain/pieces";
import { colourShares } from "@/lib/brick-colours";

import { BuildTogether } from "./build-together";
import { PieceTable } from "./piece-table";
import { SetHeader } from "./set-header";
import { SetTiles } from "./set-tiles";

export const generateStaticParams = async () => {
  const [usernames, sets] = await Promise.all([
    getUsernames(),
    getCatalogSets(),
  ]);

  return usernames.flatMap((username) =>
    sets.map((set) => ({ username, setName: set.name })),
  );
};

export const generateMetadata = async ({
  params,
}: PageProps<"/builders/[username]/sets/[setName]">): Promise<Metadata> => {
  const { username, setName } = await params;
  const [builder, sets] = await Promise.all([
    getBuilder(username),
    getCatalogSets(),
  ]);
  const set = sets.find((candidate) => candidate.name === setName);

  return {
    title: builder && set ? `${set.name} for ${builder.username}` : "Not found",
  };
};

const SetPage = async ({
  params,
  searchParams,
}: PageProps<"/builders/[username]/sets/[setName]">) => {
  const { username, setName } = await params;
  const [builder, sets, colourNames] = await Promise.all([
    getBuilder(username),
    getCatalogSets(),
    getColourNames(),
  ]);
  const set = sets.find((candidate) => candidate.name === setName);

  // A missing builder already got their own 404 from ../layout.tsx. Checking again tells TypeScript.
  if (!builder || !set) {
    notFound();
  }

  const status = buildStatus(set.required, builder.inventory);
  const ownedColours = new Set(
    piecesByColour(builder.inventory).map(({ colourCode }) => colourCode),
  );
  const shortfall = colourShares(status.coverage.missing, colourNames);

  return (
    <>
      <SetHeader
        username={builder.username}
        setName={set.name}
        setNumber={set.setNumber}
        status={status}
        colours={colourShares(set.required, colourNames)}
        biggestGap={
          shortfall[0]
            ? {
                ...shortfall[0],
                ownedByBuilder: ownedColours.has(shortfall[0].code),
              }
            : null
        }
      />

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 pt-8 pb-16">
        <SetTiles status={status} shortfall={shortfall} />

        <div className="flex flex-wrap items-start gap-5">
          <div className="min-w-0 flex-[999_1_560px]">
            <Suspense
              fallback={
                <div
                  role="status"
                  className="h-96 rounded-xl border bg-card motion-safe:animate-pulse"
                >
                  <span className="sr-only">Loading pieces</span>
                </div>
              }
            >
              <PieceTable
                lines={checkLines(set.required, builder.inventory)}
                colourNames={colourNames}
                searchParams={searchParams}
              />
            </Suspense>
          </div>

          {/* Stretch goal 1: only an incomplete set needs help from others. */}
          {status.kind === "incomplete" && (
            <aside className="min-w-0 flex-[1_1_340px]">
              <Suspense
                fallback={
                  <div
                    role="status"
                    className="h-80 rounded-xl border bg-card motion-safe:animate-pulse"
                  >
                    <span className="sr-only">Loading partners</span>
                  </div>
                }
              >
                <BuildTogether
                  owner={builder}
                  setName={set.name}
                  required={set.required}
                  coverage={status.coverage}
                />
              </Suspense>
            </aside>
          )}
        </div>
      </div>
    </>
  );
};

export default SetPage;
