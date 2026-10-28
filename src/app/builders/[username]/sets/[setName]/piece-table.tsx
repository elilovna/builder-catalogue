import { ColourSwatch } from "@/components/colour-swatch";
import { FilterTabs } from "@/components/filter-tabs";
import { Badge } from "@/components/ui/badge";
import type { ColourCode, LineCheck } from "@/domain/domain-types";
import { parsePieceKey } from "@/domain/pieces";
import { brickHex } from "@/lib/brick-colours";
import { cn } from "@/lib/utils";

type PieceTableProps = {
  lines: LineCheck[];
  colourNames: ReadonlyMap<ColourCode, string>;
  searchParams: PageProps<"/builders/[username]/sets/[setName]">["searchParams"];
};

type Show = "missing" | "covered" | "all";

const parseShow = (
  value: string | string[] | undefined,
  missingCount: number,
): Show => {
  if (value === "missing" || value === "covered" || value === "all") {
    return value;
  }
  return missingCount > 0 ? "missing" : "all";
};

const EMPTY: Record<Show, string> = {
  missing: "Nothing missing.",
  covered: "Nothing covered yet.",
  all: "",
};

export const PieceTable = async ({
  lines,
  colourNames,
  searchParams,
}: PieceTableProps) => {
  const missing = lines.filter((line) => line.short > 0);
  const covered = lines.filter((line) => line.short === 0);
  const show = parseShow((await searchParams).show, missing.length);
  const visible = { missing, covered, all: lines }[show];
  const showShort = show !== "covered";

  return (
    <section
      aria-labelledby="pieces-heading"
      className="grid gap-4 rounded-xl border bg-card p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="pieces-heading" className="text-[22px] font-bold">
          Pieces
        </h2>
        <FilterTabs
          label="Which pieces to show"
          tabs={[
            {
              label: "Missing",
              count: missing.length,
              href: "?show=missing",
              current: show === "missing",
            },
            {
              label: "Covered",
              count: covered.length,
              href: "?show=covered",
              current: show === "covered",
            },
            {
              label: "All",
              count: lines.length,
              href: "?show=all",
              current: show === "all",
            },
          ]}
        />
      </div>

      <div
        role="region"
        aria-label="Pieces table"
        tabIndex={0}
        className="relative overflow-x-auto"
      >
        <table aria-labelledby="pieces-heading" className="w-full text-[15px]">
          <thead>
            <tr className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
              <th
                scope="col"
                aria-sort="ascending"
                className="py-2 pr-3 text-left font-semibold"
              >
                Piece
              </th>
              <th scope="col" className="py-2 pl-2 text-right font-semibold">
                Need
              </th>
              <th scope="col" className="py-2 pl-2 text-right font-semibold">
                Have
              </th>
              {showShort && (
                <th scope="col" className="py-2 pl-2 text-right font-semibold">
                  Short
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {visible.map((line) => {
              const { designId, colourCode } = parsePieceKey(line.key);
              return (
                <tr
                  key={line.key}
                  className="border-t border-meter hover:bg-accent"
                >
                  <td className="py-2 pr-3">
                    <span className="flex flex-col gap-0.5 leading-tight sm:flex-row sm:items-center sm:gap-3">
                      <span className="font-mono sm:min-w-[6ch]" translate="no">
                        {designId}
                      </span>
                      <ColourSwatch
                        name={
                          colourNames.get(colourCode) ?? `Colour ${colourCode}`
                        }
                        hex={brickHex(colourCode)}
                      />
                    </span>
                  </td>
                  <td className="py-2 pl-2 text-right tabular-nums">
                    {line.need}
                  </td>
                  <td
                    className={cn(
                      "py-2 pl-2 text-right tabular-nums",
                      line.have === 0 && "text-muted-foreground",
                    )}
                  >
                    {line.have}
                  </td>
                  {showShort && (
                    <td className="py-2 pl-2 text-right">
                      {line.short > 0 ? (
                        <Badge variant="short" className="tabular-nums">
                          <span aria-hidden="true">−{line.short}</span>
                          <span className="sr-only">{line.short} short</span>
                        </Badge>
                      ) : (
                        <Badge variant="ready">Covered</Badge>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr className="border-t border-meter">
                <td
                  colSpan={showShort ? 4 : 3}
                  className="py-5 text-center text-muted-foreground"
                >
                  {EMPTY[show]}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
