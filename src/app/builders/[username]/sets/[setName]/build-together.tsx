import Link from "next/link";

import { getBuilders } from "@/catalog/queries";
import { BrickAvatar } from "@/components/brick-avatar";
import type { Builder, Coverage, PieceCounts } from "@/domain/domain-types";
import { completingPairs, pickGroup, rankPartners } from "@/domain/partners";
import { avatarHex } from "@/lib/brick-colours";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const PARTNERS_SHOWN = 5;
const PAIRS_SHOWN = 3;

type BuildTogetherProps = {
  owner: Builder;
  setName: string;
  required: PieceCounts;
  coverage: Coverage;
};

const listFormat = new Intl.ListFormat("en-GB", { type: "conjunction" });

const Name = ({ builder }: { builder: Builder }) => (
  <span className="font-mono font-semibold whitespace-nowrap" translate="no">
    {builder.username}
  </span>
);

type TeamUpProps = {
  owner: Builder;
  required: PieceCounts;
  partners: Builder[];
};

const TeamUp = ({ owner, required, partners }: TeamUpProps) => {
  const pairs = completingPairs(required, owner.inventory, partners);
  if (pairs.length > 0) {
    return (
      <div className="grid gap-1.5 text-[15px]">
        <p>
          Nobody completes it alone, but{" "}
          {pairs.length === 1 ? "one pair" : `${pairs.length} pairs`} can,
          together with {owner.username}:
        </p>
        <ul className="list-disc ps-5">
          {pairs.slice(0, PAIRS_SHOWN).map(([first, second]) => (
            <li key={`${first.id}+${second.id}`}>
              <Name builder={first} /> and <Name builder={second} />
            </li>
          ))}
        </ul>
        {pairs.length > PAIRS_SHOWN && (
          <p className="text-sm text-muted-foreground">
            And {pairs.length - PAIRS_SHOWN} more.
          </p>
        )}
      </div>
    );
  }

  const { members, missingAfter } = pickGroup(
    required,
    owner.inventory,
    partners,
  );
  if (missingAfter > 0) {
    return (
      <p className="text-[15px]">
        Not even all the other builders together can complete it:{" "}
        {formatNumber(missingAfter)} pieces are still missing.
      </p>
    );
  }

  return (
    <div className="grid gap-1.5 text-[15px]">
      <p>
        Nobody completes it alone or in a pair, but these {members.length} can,
        together with {owner.username}:
      </p>
      <ol className="list-decimal ps-5 tabular-nums">
        {members.map(({ builder, adds }) => (
          <li key={builder.id}>
            <Name builder={builder} /> adds {formatNumber(adds)}
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted-foreground">
        Picked one at a time: each adds the most of what is still missing.
        {members.length > 3 && " A smaller group may exist."}
      </p>
    </div>
  );
};

export const BuildTogether = async ({
  owner,
  setName,
  required,
  coverage,
}: BuildTogetherProps) => {
  let builders: Builder[];
  try {
    builders = await getBuilders();
  } catch {
    return (
      <section className="rounded-xl border bg-card p-5">
        <h2 className="text-[22px] font-bold">Build it together</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The other builders could not be loaded. Try again in a moment.
        </p>
      </section>
    );
  }

  const ranked = rankPartners(
    required,
    owner.inventory,
    builders.filter((builder) => builder.id !== owner.id),
  );
  const completers = ranked
    .filter((help) => help.completes)
    .map((help) => help.builder.username);
  const shown = ranked.slice(0, PARTNERS_SHOWN);
  const ownShare = (100 * coverage.covered) / coverage.needed;

  return (
    <section
      aria-labelledby="together-heading"
      className="grid gap-3 rounded-xl border bg-card p-5"
    >
      <h2 id="together-heading" className="text-[22px] font-bold">
        Build it together
      </h2>
      {completers.length > 0 ? (
        <p className="text-[15px]">
          <span className="font-mono font-semibold" translate="no">
            {listFormat.format(completers)}
          </span>{" "}
          can complete it with {owner.username}.
        </p>
      ) : (
        <TeamUp
          owner={owner}
          required={required}
          partners={ranked.map((help) => help.builder)}
        />
      )}

      <ul>
        {shown.map((help, index) => (
          <li
            key={help.builder.id}
            className={cn(
              "grid grid-cols-[36px_minmax(0,1fr)] items-center gap-x-3 gap-y-2 py-3",
              index > 0 && "border-t border-meter",
            )}
          >
            <BrickAvatar hex={avatarHex(help.builder.id)} className="size-9" />
            <div className="grid min-w-0 gap-0.5">
              <Link
                href={`/builders/${help.builder.username}/sets/${setName}`}
                className="font-mono text-[15px] font-semibold underline decoration-input underline-offset-3 hover:decoration-current"
                translate="no"
              >
                {help.builder.username}
              </Link>
              {help.completes ? (
                <span className="text-[13px] font-semibold text-ready">
                  Completes the set
                </span>
              ) : (
                <span className="text-[13px] text-muted-foreground tabular-nums">
                  Adds {formatNumber(help.adds)} ·{" "}
                  {formatNumber(help.missingAfter)} still missing
                </span>
              )}
            </div>
            <div
              aria-hidden="true"
              className="col-start-2 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-meter"
            >
              <span className="bg-link" style={{ width: `${ownShare}%` }} />
              <span
                className={help.completes ? "bg-ready" : "bg-almost-bar"}
                style={{ width: `${(100 * help.adds) / coverage.needed}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <ul
        aria-hidden="true"
        className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-t border-meter pt-3 text-xs text-muted-foreground"
      >
        <li className="inline-flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-link" />
          {owner.username}’s pieces
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-ready" />
          Partner completes it
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-almost-bar" />
          Partner adds some
        </li>
      </ul>
    </section>
  );
};
