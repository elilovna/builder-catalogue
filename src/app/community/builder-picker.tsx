import type { Route } from "next";
import Link from "next/link";

import { BrickAvatar } from "@/components/brick-avatar";
import { cn } from "@/lib/utils";

export type BuilderOption = {
  username: string;
  avatarHex: string;
  href: Route;
  current: boolean;
};

type BuilderPickerProps = {
  options: BuilderOption[];
};

export const BuilderPicker = ({ options }: BuilderPickerProps) => (
  <nav aria-labelledby="builder-picker-label" className="grid gap-2.5">
    <p id="builder-picker-label" className="text-sm font-semibold">
      Builder
    </p>
    <ul className="flex flex-wrap gap-2">
      {options.map((option) => (
        <li key={option.username}>
          <Link
            href={option.href}
            scroll={false}
            aria-current={option.current ? "page" : undefined}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 font-mono text-[13px] font-semibold sm:pl-1.5",
              option.current
                ? "border-primary bg-primary text-primary-foreground forced-color-adjust-none forced-colors:border-[Highlight] forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] forced-colors:outline-[CanvasText]"
                : "text-foreground/80 hover:bg-accent",
            )}
            translate="no"
          >
            <BrickAvatar
              hex={option.avatarHex}
              className="hidden size-6 sm:inline-block"
            />
            {option.username}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
);
