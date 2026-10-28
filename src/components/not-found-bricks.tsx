import type { CSSProperties } from "react";

import type { ColourCode } from "@/domain/domain-types";
import { brickHex } from "@/lib/brick-colours";

type Brick = {
  colour: ColourCode;
  column: number;
  row: number;
  width: number;
  height: number;
};

const RED: ColourCode = 5;
const YELLOW: ColourCode = 3;
const BLUE: ColourCode = 7;

const BRICKS: Brick[] = [
  // 4
  { colour: RED, column: 0, row: 0, width: 1, height: 2 },
  { colour: RED, column: 2, row: 0, width: 1, height: 2 },
  { colour: RED, column: 0, row: 2, width: 3, height: 1 },
  { colour: RED, column: 2, row: 3, width: 1, height: 2 },
  // 0, with a hole at column 6, row 2: that brick has fallen off
  { colour: YELLOW, column: 4, row: 0, width: 3, height: 1 },
  { colour: YELLOW, column: 4, row: 1, width: 1, height: 3 },
  { colour: YELLOW, column: 6, row: 1, width: 1, height: 1 },
  { colour: YELLOW, column: 6, row: 3, width: 1, height: 1 },
  { colour: YELLOW, column: 4, row: 4, width: 3, height: 1 },
  // 4
  { colour: BLUE, column: 8, row: 0, width: 1, height: 3 },
  { colour: BLUE, column: 10, row: 0, width: 1, height: 2 },
  { colour: BLUE, column: 9, row: 2, width: 2, height: 1 },
  { colour: BLUE, column: 10, row: 3, width: 1, height: 2 },
];

const STEP = 80;

export const NotFoundBricks = () => (
  <div
    aria-hidden="true"
    className="relative w-fit pb-[calc(var(--stud)*1.6)] [--gap:3px] [--stud:min(32px,calc((100vw-2rem)/11))] lg:[--stud:36px]"
  >
    {/* 11 studs wide, so on a phone a stud is an 11th of the screen minus its margins. */}
    <div className="grid w-fit auto-rows-[calc(var(--stud)-var(--gap))] grid-cols-[repeat(11,calc(var(--stud)-var(--gap)))] gap-(--gap)">
      {BRICKS.map((brick, index) => (
        <div
          key={index}
          className="brick hover:-translate-y-0.5 motion-safe:animate-brick-snap motion-safe:transition-transform"
          style={{
            gridColumn: `${brick.column + 1} / span ${brick.width}`,
            gridRow: `${brick.row + 1} / span ${brick.height}`,
            backgroundColor: brickHex(brick.colour),
            animationDelay: `${200 + index * STEP}ms`,
          }}
        />
      ))}
    </div>

    {/* The missing piece, lying under the 0. It starts in the hole:
        --from-x and --from-y are the way back up to it. */}
    <div
      className="absolute top-[calc(var(--stud)*5.4)] left-[calc(var(--stud)*6.3)] size-[calc(var(--stud)-var(--gap))] rotate-(--tilt) brick hover:-translate-y-0.5 motion-safe:animate-brick-fall motion-safe:transition-transform"
      style={
        {
          backgroundColor: brickHex(YELLOW),
          animationDelay: `${200 + BRICKS.length * STEP}ms`,
          // Lying loose, so it casts a longer shadow than the bricks that are pressed into place.
          "--brick-shadow": "0 10px 18px rgb(0 0 0 / 0.45)",
          "--tilt": "28deg",
          "--from-x": "calc(var(--stud) * -0.3)",
          "--from-y": "calc(var(--stud) * -3.4)",
        } as CSSProperties
      }
    />
  </div>
);
