import Link from "next/link";

import { ColourLegend } from "@/components/colour-legend";
import { ColourStrip } from "@/components/colour-strip";
import { DarkChip } from "@/components/dark-chip";
import type { BuildStatus } from "@/domain/domain-types";
import type { ColourShare } from "@/lib/brick-colours";
import { formatNumber } from "@/lib/format";

type BiggestGap = ColourShare & { ownedByBuilder: boolean };

type SetHeaderProps = {
  username: string;
  setName: string;
  setNumber: string;
  status: BuildStatus;
  colours: ColourShare[];
  biggestGap: BiggestGap | null;
};

const GapSentence = ({
  username,
  status,
  biggestGap,
}: Pick<SetHeaderProps, "username" | "status" | "biggestGap">) => {
  const { needed, covered } = status.coverage;

  if (status.kind === "ready" || !biggestGap) {
    return (
      <>
        {username} owns every piece for this set, in the right colour and
        quantity.
      </>
    );
  }

  const gap = needed - covered;
  const ofThem =
    biggestGap.pieces === gap
      ? `all of them are ${biggestGap.name}`
      : `${formatNumber(biggestGap.pieces)} of them are ${biggestGap.name}`;
  const notOwned = biggestGap.ownedByBuilder
    ? ""
    : `, a colour ${username} does not own at all`;

  return (
    <>
      {username} owns{" "}
      <b className="font-semibold text-white tabular-nums">
        {formatNumber(covered)} of {formatNumber(needed)}
      </b>{" "}
      pieces for this set. The gap is {formatNumber(gap)} pieces, and {ofThem}
      {notOwned}.
    </>
  );
};

export const SetHeader = ({
  username,
  setName,
  setNumber,
  status,
  colours,
  biggestGap,
}: SetHeaderProps) => {
  const { needed, linesTotal } = status.coverage;

  return (
    <div className="bg-studs text-white [--ring:var(--brand)]">
      <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 pt-6 pb-8">
        <nav aria-label="Breadcrumb" className="text-sm text-on-dark-subtle">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="text-on-dark-muted hover:text-white">
                Builders
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/builders/${username}`}
                className="font-mono text-on-dark-muted hover:text-white"
                translate="no"
              >
                {username}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li
              aria-current="page"
              className="font-mono text-white"
              translate="no"
            >
              {setName}
            </li>
          </ol>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
          <div className="grid min-w-0 flex-[1_1_480px] gap-3.5">
            <ul aria-label="Set details" className="flex flex-wrap gap-2">
              <DarkChip>{setNumber}</DarkChip>
              <DarkChip>{formatNumber(needed)} pieces</DarkChip>
              <DarkChip>{formatNumber(linesTotal)} different pieces</DarkChip>
              <DarkChip>{colours.length} colours</DarkChip>
            </ul>

            <h1
              className="font-mono text-[clamp(1.9rem,1.3rem+2.2vw,3rem)] font-semibold tracking-tight break-words"
              translate="no"
            >
              {setName}
            </h1>

            {/* At least two lines tall, like the builder page's sentence, so both headers
                have the same height. No completion bar under it: the "Pieces owned" tile
                right below the header already shows it. */}
            <p className="min-h-[2lh] max-w-[56ch] text-lg text-on-dark-muted">
              <GapSentence
                username={username}
                status={status}
                biggestGap={biggestGap}
              />
            </p>
          </div>

          <div className="grid min-w-0 flex-[0_1_380px] gap-3">
            <p className="text-[13px] text-on-dark-subtle">
              What the set is made of
            </p>
            <ColourStrip
              colours={colours}
              className="h-4 overflow-hidden rounded-full"
            />
            <ColourLegend colours={colours} />
          </div>
        </div>
      </div>
    </div>
  );
};
