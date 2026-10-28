import type { Route } from "next";
import Link from "next/link";

import { ColourStrip } from "@/components/colour-strip";
import { Badge } from "@/components/ui/badge";
import { completionPercent, isAlmostThere } from "@/domain/build";
import type { BuildStatus } from "@/domain/domain-types";
import type { ColourShare } from "@/lib/brick-colours";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

type SetCardProps<Href extends string> = {
  name: string;
  setNumber: string;
  status: BuildStatus;
  colours: ColourShare[];
  href: Route<Href>;
};

const toneOf = (status: BuildStatus) => {
  if (status.kind === "ready") {
    return "ready";
  }
  if (isAlmostThere(status)) {
    return "almost";
  }
  return "far";
};

const barColour = {
  ready: "bg-ready",
  almost: "bg-almost-bar",
  far: "bg-link",
};

export const SetCard = <Href extends string>({
  name,
  setNumber,
  status,
  colours,
  href,
}: SetCardProps<Href>) => {
  const { needed, covered, missing } = status.coverage;
  const percent = completionPercent(status);
  const tone = toneOf(status);

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-foreground has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ring">
      <ColourStrip colours={colours} className="h-3.5" />
      <div className="flex flex-1 flex-col gap-4 p-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              className="font-mono text-base font-semibold break-words"
              translate="no"
            >
              <Link
                href={href}
                className="after:absolute after:inset-0 focus-visible:outline-none"
              >
                {name}
              </Link>
            </h2>
            <p className="text-sm text-muted-foreground">
              {setNumber} · {formatNumber(needed)} pieces
            </p>
          </div>
          <Badge variant={tone}>
            {status.kind === "ready" ? "Ready" : `${percent}%`}
          </Badge>
        </div>

        <div
          className="h-2 overflow-hidden rounded-full bg-meter"
          aria-hidden="true"
        >
          <div
            className={cn("h-full rounded-full", barColour[tone])}
            style={{ width: `${percent}%` }}
          />
        </div>

        {status.kind === "incomplete" && (
          <p className="text-sm">
            {formatNumber(needed - covered)} pieces missing ({missing.size}{" "}
            different)
          </p>
        )}
      </div>
    </article>
  );
};
