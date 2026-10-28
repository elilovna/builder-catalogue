import { Swatch } from "@/components/colour-swatch";
import type { ColourCode, PieceCounts } from "@/domain/domain-types";
import { pieceMatrix } from "@/domain/pieces";
import { brickHex } from "@/lib/brick-colours";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

type BudgetPiecesProps = {
  pieces: PieceCounts;
  colourNames: ReadonlyMap<ColourCode, string>;
};

const STICKY =
  "sticky left-0 bg-card shadow-[inset_-1px_0_0_var(--border)] pl-4 pr-2 text-left sm:pr-4";

const UPRIGHT =
  "max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 max-sm:leading-tight";

export const BudgetPieces = ({ pieces, colourNames }: BudgetPiecesProps) => {
  const { colours, shapes } = pieceMatrix(pieces);
  const total = colours.reduce((sum, colour) => sum + colour.pieces, 0);
  const edge = (index: number) =>
    index === colours.length - 1 ? "max-sm:pr-3" : undefined;

  return (
    <details className="group/pieces min-w-0 rounded-lg border">
      <summary className="cursor-pointer rounded-lg px-4 py-3 font-semibold group-open/pieces:rounded-b-none group-open/pieces:border-b hover:bg-accent focus-visible:-outline-offset-3">
        See the pieces
      </summary>

      <div
        role="region"
        aria-label="Pieces in the budget"
        tabIndex={0}
        className="relative overflow-x-auto pb-2"
      >
        <table className="w-full text-sm tabular-nums sm:text-[15px] lg:table-fixed">
          <thead>
            <tr className="text-[13px] font-semibold">
              <th
                scope="col"
                className={cn(
                  STICKY,
                  "py-2 align-bottom font-mono text-xs tracking-wide text-muted-foreground uppercase",
                )}
              >
                Piece
              </th>
              {colours.map((colour, index) => (
                <th
                  key={colour.colourCode}
                  scope="col"
                  className={cn(
                    "px-1 py-2 text-right align-bottom sm:px-2",
                    edge(index),
                  )}
                >
                  <span className="ml-auto flex flex-col-reverse items-end gap-1.5 sm:flex-col">
                    <Swatch hex={brickHex(colour.colourCode)} />
                    <span className={UPRIGHT}>
                      {colourNames.get(colour.colourCode) ??
                        `Colour ${colour.colourCode}`}
                    </span>
                  </span>
                </th>
              ))}
              <th
                scope="col"
                className="py-2 pr-4 pl-2 text-right align-bottom font-mono text-xs tracking-wide text-muted-foreground uppercase max-sm:hidden"
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {shapes.map((shape) => (
              <tr key={shape.designId} className="border-t border-meter">
                <th
                  scope="row"
                  className={cn(STICKY, "py-2 font-mono font-normal")}
                  translate="no"
                >
                  {shape.designId}
                </th>
                {colours.map((colour, index) => {
                  const count = shape.byColour.get(colour.colourCode);
                  return (
                    <td
                      key={colour.colourCode}
                      className={cn(
                        "px-1 py-2 text-right sm:px-2",
                        edge(index),
                      )}
                    >
                      {count ? (
                        formatNumber(count)
                      ) : (
                        <>
                          <span
                            aria-hidden="true"
                            className="text-muted-foreground"
                          >
                            –
                          </span>
                          <span className="sr-only">0</span>
                        </>
                      )}
                    </td>
                  );
                })}
                <td className="py-2 pr-4 pl-2 text-right font-semibold max-sm:hidden">
                  {formatNumber(shape.pieces)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-foreground font-semibold">
              <th scope="row" className={cn(STICKY, "py-2")}>
                Total
              </th>
              {colours.map((colour, index) => (
                <td
                  key={colour.colourCode}
                  className={cn("px-1 py-2 text-right sm:px-2", edge(index))}
                >
                  {formatNumber(colour.pieces)}
                </td>
              ))}
              <td className="py-2 pr-4 pl-2 text-right max-sm:hidden">
                {formatNumber(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </details>
  );
};
