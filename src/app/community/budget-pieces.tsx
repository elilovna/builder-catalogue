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
  // On a phone the last colour is the last column, since Total is left off, so it keeps clear of the box's edge.
  const edge = (index: number) =>
    index === colours.length - 1 ? "max-sm:pr-3" : undefined;

  return (
    <details className="group/pieces min-w-0 rounded-lg border">
      {/* Open, a line marks where the table starts, so the column names do not read as part of the summary.
        The focus ring sits inside the box: outside it, it looked like a separate button with the table hanging below. */}
      <summary className="cursor-pointer rounded-lg px-4 py-3 font-semibold group-open/pieces:rounded-b-none group-open/pieces:border-b hover:bg-accent focus-visible:-outline-offset-3">
        See the pieces
      </summary>

      {/* Scrolls sideways on a narrow phone instead of the whole page, like the set page's table.
        Relative, so it also clips the screen-reader-only "0"s: they are absolute, and without a
        positioned box they stick out of it and make the whole page scroll sideways. */}
      <div
        role="region"
        aria-label="Pieces in the budget"
        tabIndex={0}
        className="relative overflow-x-auto pb-2"
      >
        {/* Equal columns from a laptop up, so the numbers sit evenly however long a colour's name is. Narrower screens size the columns by their content, or the piece IDs would not fit. */}
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
                  {/* On a phone the swatch goes under the name, so the swatches line up right above the numbers. */}
                  <span className="ml-auto flex flex-col-reverse items-end gap-1.5 sm:flex-col">
                    <Swatch hex={brickHex(colour.colourCode)} />
                    <span className={UPRIGHT}>
                      {colourNames.get(colour.colourCode) ??
                        `Colour ${colour.colourCode}`}
                    </span>
                  </span>
                </th>
              ))}
              {/* Each shape's total is left off on a phone to make room for every colour: a designer picks a shape and a colour, and the grand total is the heading. */}
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
                        // A dash to the eye, a 0 to a screen reader.
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
