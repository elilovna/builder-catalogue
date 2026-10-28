import type { ColourShare } from "@/lib/brick-colours";
import { formatNumber } from "@/lib/format";

export const ColourLegend = ({ colours }: { colours: ColourShare[] }) => (
  <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-on-dark-muted">
    {colours.map((colour) => (
      <li key={colour.code} className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="size-2.5 rounded-[3px]"
          style={{ backgroundColor: colour.hex }}
        />
        {colour.name}{" "}
        <b className="font-semibold text-white tabular-nums">
          {formatNumber(colour.pieces)}
        </b>
      </li>
    ))}
  </ul>
);
