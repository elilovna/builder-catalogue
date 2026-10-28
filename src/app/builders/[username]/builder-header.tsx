import Link from "next/link";

import { BrickAvatar } from "@/components/brick-avatar";
import { DarkChip } from "@/components/dark-chip";
import { formatNumber } from "@/lib/format";

type BuilderHeaderProps = {
  username: string;
  location: string;
  pieces: number;
  colours: number;
  readySetNames: string[];
  totalSets: number;
  avatarHex: string;
};

const setNameList = new Intl.ListFormat("en-GB", { type: "conjunction" });

const SetNames = ({ names }: { names: string[] }) => (
  <>
    {setNameList.formatToParts(names).map((part, index) =>
      part.type === "element" ? (
        <span
          key={index}
          className="font-mono whitespace-nowrap text-white"
          translate="no"
        >
          {part.value}
        </span>
      ) : (
        part.value
      ),
    )}
  </>
);

export const BuilderHeader = ({
  username,
  location,
  pieces,
  colours,
  readySetNames,
  totalSets,
  avatarHex,
}: BuilderHeaderProps) => {
  const readyCount = readySetNames.length;

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
            <li
              aria-current="page"
              className="font-mono text-white"
              translate="no"
            >
              {username}
            </li>
          </ol>
        </nav>

        <div className="grid gap-3.5">
          <ul aria-label="Collection" className="flex flex-wrap gap-2">
            <DarkChip>{location}</DarkChip>
            <DarkChip>{formatNumber(pieces)} pieces</DarkChip>
            <DarkChip>{colours} colours</DarkChip>
          </ul>

          <h1
            className="flex items-center gap-3 font-mono text-[clamp(1.9rem,1.3rem+2.2vw,3rem)] font-semibold tracking-tight"
            translate="no"
          >
            <BrickAvatar hex={avatarHex} className="size-9" />
            <span className="min-w-0 break-words">{username}</span>
          </h1>

          {/* At least two lines tall, like the set page's sentence, so both headers have the same height. */}
          <p className="min-h-[2lh] max-w-[56ch] text-lg text-on-dark-muted">
            {username} can build{" "}
            <b className="font-semibold text-white tabular-nums">
              {readyCount} of {totalSets}
            </b>{" "}
            sets right now
            {readyCount > 0 ? (
              <>
                : <SetNames names={readySetNames} />.
              </>
            ) : (
              "."
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
