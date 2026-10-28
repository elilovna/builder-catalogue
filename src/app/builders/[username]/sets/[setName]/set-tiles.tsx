import type { ReactNode } from "react";

import { ColourStrip } from "@/components/colour-strip";
import { completionPercent } from "@/domain/build";
import type { BuildStatus } from "@/domain/domain-types";
import type { ColourShare } from "@/lib/brick-colours";
import { formatNumber } from "@/lib/format";

type SetTilesProps = {
  status: BuildStatus;
  shortfall: ColourShare[];
};

const Tile = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-2 rounded-xl border bg-card px-5 py-4.5">
    <dt className="text-[13px] text-muted-foreground">{label}</dt>
    <dd className="grid gap-2">{children}</dd>
  </div>
);

const Meter = ({ percent }: { percent: number }) => (
  <div className="h-2 overflow-hidden rounded-full bg-meter" aria-hidden="true">
    <div
      className="h-full rounded-full bg-link"
      style={{ width: `${percent}%` }}
    />
  </div>
);

const Count = ({ value, total }: { value: number; total: number }) => (
  <span className="font-heading text-3xl font-bold tabular-nums">
    {formatNumber(value)}{" "}
    <small className="text-[15px] font-medium text-muted-foreground">
      of {formatNumber(total)}
    </small>
  </span>
);

export const SetTiles = ({ status, shortfall }: SetTilesProps) => {
  const { needed, covered } = status.coverage;
  const gap = needed - covered;

  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      <Tile label="Pieces owned">
        <Count value={covered} total={needed} />
        <Meter percent={completionPercent(status)} />
      </Tile>

      <Tile label={`Shortfall by colour · ${formatNumber(gap)} pieces`}>
        {shortfall.length === 0 ? (
          <span className="text-sm">Nothing missing.</span>
        ) : (
          <>
            <ColourStrip
              colours={shortfall}
              className="h-3.5 overflow-hidden rounded-full"
            />
            <span className="text-[13px] tabular-nums">
              {shortfall
                .map(
                  (colour) => `${colour.name} ${formatNumber(colour.pieces)}`,
                )
                .join(" · ")}
            </span>
          </>
        )}
      </Tile>
    </dl>
  );
};
