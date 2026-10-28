import type { Metadata } from "next";
import { Suspense } from "react";

import { getBuilders, getCatalogSets, getColourNames } from "@/catalog/queries";
import { PageHeader } from "@/components/page-header";

import { BuilderCommunity } from "./builder-community";

export const metadata: Metadata = { title: "Community" };

const CommunityPage = async ({ searchParams }: PageProps<"/community">) => {
  const [builders, sets, colourNames] = await Promise.all([
    getBuilders(),
    getCatalogSets(),
    getColourNames(),
  ]);

  return (
    <>
      <PageHeader title="Community" />

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 pt-8 pb-16">
        <Suspense
          fallback={
            <div
              role="status"
              className="h-96 rounded-xl border bg-card motion-safe:animate-pulse"
            >
              <span className="sr-only">Loading the community page</span>
            </div>
          }
        >
          <BuilderCommunity
            builders={builders}
            sets={sets}
            colourNames={colourNames}
            searchParams={searchParams}
          />
        </Suspense>
      </div>
    </>
  );
};

export default CommunityPage;
