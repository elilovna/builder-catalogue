import type { Metadata } from "next";
import { Suspense } from "react";

import { getBuilders, getCatalogSets, getColourNames } from "@/catalog/queries";

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
      {/* Only the page name, like the home page's "Builders": the cards explain their own answers. */}
      <div className="bg-studs text-white">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-8">
          <h1 className="text-[clamp(1.9rem,1.3rem+2.2vw,3rem)] leading-[1.1] font-extrabold">
            Community
          </h1>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 pt-8 pb-16">
        {/* The builder comes from the URL, which only a request has, so the heading above is prerendered without it. */}
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
