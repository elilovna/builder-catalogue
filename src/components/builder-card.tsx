import type { Route } from "next";
import Link from "next/link";

import { BrickAvatar } from "@/components/brick-avatar";
import { readyPercent } from "@/domain/build";
import { formatNumber } from "@/lib/format";

type BuilderCardProps<Href extends string> = {
  username: string;
  location: string;
  pieces: number;
  readyCount: number;
  totalSets: number;
  avatarHex: string;
  href: Route<Href>;
};

export const BuilderCard = <Href extends string>({
  username,
  location,
  pieces,
  readyCount,
  totalSets,
  avatarHex,
  href,
}: BuilderCardProps<Href>) => (
  <article className="relative flex h-full flex-col gap-4.5 rounded-xl border bg-card p-5 transition-colors hover:border-foreground has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ring">
    <div className="flex items-center gap-3">
      <BrickAvatar hex={avatarHex} className="size-11" />
      <div className="grid min-w-0 gap-1">
        <h3
          className="font-mono text-[15px] font-semibold break-words"
          translate="no"
        >
          {/* The link covers the whole card, but its name is just the username. */}
          <Link
            href={href}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {username}
          </Link>
        </h3>
        <span className="justify-self-start rounded-full bg-muted px-2.5 py-0.5 font-mono text-xs font-medium">
          {location}
        </span>
      </div>
    </div>

    <div className="grid gap-2">
      <p className="flex items-baseline justify-between gap-2">
        <span className="font-heading text-[26px] font-bold tabular-nums">
          {formatNumber(pieces)}
        </span>
        <span className="text-[13px] text-muted-foreground">pieces</span>
      </p>
      <div
        className="h-2 overflow-hidden rounded-full bg-meter"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-ready"
          style={{ width: `${readyPercent(readyCount, totalSets)}%` }}
        />
      </div>
      <p className="text-sm font-semibold text-ready tabular-nums">
        {readyCount} {readyCount === 1 ? "set" : "sets"} ready{" "}
        <span className="font-medium text-muted-foreground">
          of {totalSets}
        </span>
      </p>
    </div>
  </article>
);
