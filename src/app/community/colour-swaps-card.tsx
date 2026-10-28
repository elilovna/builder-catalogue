import Link from "next/link";

import { ColourSwatch } from "@/components/colour-swatch";
import { setsWithColourSwaps } from "@/domain/colour-swaps";
import type { Builder, CatalogSet, ColourCode } from "@/domain/domain-types";
import { brickHex } from "@/lib/brick-colours";

type ColourSwapsCardProps = {
  builder: Builder;
  sets: CatalogSet[];
  colourNames: ReadonlyMap<ColourCode, string>;
};

export const ColourSwapsCard = ({
  builder,
  sets,
  colourNames,
}: ColourSwapsCardProps) => {
  const builds = setsWithColourSwaps(sets, builder.inventory);
  const answer =
    builds.length === 0
      ? "can’t build any more sets"
      : `can build ${builds.length} more ${builds.length === 1 ? "set" : "sets"}`;
  const colour = (code: ColourCode) => (
    <ColourSwatch
      name={colourNames.get(code) ?? `Colour ${code}`}
      hex={brickHex(code)}
    />
  );

  return (
    <section
      aria-labelledby="colour-swaps-heading"
      className="grid gap-5 rounded-xl border bg-card p-4 sm:p-6"
    >
      <div className="grid gap-3">
        <p className="font-mono text-[13px] tracking-[0.06em] text-link uppercase">
          Colour swaps
        </p>
        {/* Read out when another builder is chosen, like the budget card's heading. */}
        <h2
          id="colour-swaps-heading"
          aria-live="polite"
          aria-atomic="true"
          className="text-[28px] font-bold"
        >
          <span className="font-mono font-semibold" translate="no">
            {builder.username}
          </span>{" "}
          {answer} by swapping colours
        </h2>
      </div>

      {builds.length > 0 && (
        <ul className="grid gap-6">
          {builds.map(({ set, swaps }) => (
            <li key={set.id} className="grid gap-2.5">
              <h3 className="font-mono text-lg font-bold" translate="no">
                <Link
                  href={`/builders/${builder.username}/sets/${set.name}`}
                  className="underline decoration-input underline-offset-3 hover:decoration-current"
                >
                  {set.name}
                </Link>
              </h3>
              <ul className="grid gap-2 text-sm sm:flex sm:flex-wrap sm:gap-x-6">
                {[...swaps].map(([from, to]) => (
                  <li key={from} className="flex items-center gap-2">
                    {colour(from)}
                    <span aria-hidden="true">→</span>
                    <span className="sr-only"> becomes </span>
                    {colour(to)}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
