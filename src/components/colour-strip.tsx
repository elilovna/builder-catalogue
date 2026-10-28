import { type ColourShare, WHITE } from "@/lib/brick-colours";
import { cn } from "@/lib/utils";

type ColourStripProps = {
  colours: ColourShare[];
  className?: string;
};

export const ColourStrip = ({ colours, className }: ColourStripProps) => (
  <div className={cn("flex gap-0.5", className)} aria-hidden="true">
    {colours.map((colour) => (
      <span
        key={colour.code}
        className={cn(
          "basis-0",
          colour.code === WHITE && "shadow-[inset_0_0_0_1px_var(--border)]",
        )}
        style={{ flexGrow: colour.pieces, backgroundColor: colour.hex }}
      />
    ))}
  </div>
);
