import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  getBuilder,
  getCatalogSets,
  getColourNames,
  getUsernames,
} from "@/catalog/queries";
import { buildStatus, coveredShare } from "@/domain/build";
import { summariseInventory } from "@/domain/pieces";
import { avatarHex, colourShares } from "@/lib/brick-colours";

import { BuilderHeader } from "./builder-header";
import { SetList } from "./set-list";

// Next.js's dev-only instant check reports notFound() for an unknown name as an error.
export const instant = false;

export const generateStaticParams = async () => {
  const usernames = await getUsernames();
  return usernames.map((username) => ({ username }));
};

export const generateMetadata = async ({
  params,
}: PageProps<"/builders/[username]">): Promise<Metadata> => {
  const { username } = await params;
  const builder = await getBuilder(username);
  return { title: builder ? builder.username : "Builder not found" };
};

const SetListSkeleton = () => (
  <div role="status" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    <span className="sr-only">Loading sets</span>
    {Array.from({ length: 6 }, (_, index) => (
      <div
        key={index}
        className="h-40 rounded-xl border bg-card motion-safe:animate-pulse"
      />
    ))}
  </div>
);

const BuilderPage = async ({
  params,
  searchParams,
}: PageProps<"/builders/[username]">) => {
  const { username } = await params;
  const [builder, sets, colourNames] = await Promise.all([
    getBuilder(username),
    getCatalogSets(),
    getColourNames(),
  ]);

  if (!builder) {
    notFound();
  }

  const results = sets
    .map((set) => ({
      set,
      status: buildStatus(set.required, builder.inventory),
      colours: colourShares(set.required, colourNames).slice(0, 4),
    }))
    .sort((a, b) => coveredShare(b.status) - coveredShare(a.status));
  const readySetNames = results
    .filter(({ status }) => status.kind === "ready")
    .map(({ set }) => set.name)
    .sort();
  const inventory = summariseInventory(builder.inventory);

  return (
    <>
      <BuilderHeader
        username={builder.username}
        location={builder.location}
        pieces={inventory.pieces}
        colours={inventory.colours}
        readySetNames={readySetNames}
        totalSets={results.length}
        avatarHex={avatarHex(builder.id)}
      />

      <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-16">
        <Suspense fallback={<SetListSkeleton />}>
          <SetList
            username={builder.username}
            results={results}
            searchParams={searchParams}
          />
        </Suspense>
      </div>
    </>
  );
};

export default BuilderPage;
