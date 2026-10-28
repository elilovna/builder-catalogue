import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type FilterTab = {
  label: string;
  count: number;
  href: Route;
  current: boolean;
};

type FilterTabsProps = {
  label: string;
  tabs: FilterTab[];
};

export const FilterTabs = ({ label, tabs }: FilterTabsProps) => (
  <nav
    aria-label={label}
    className="flex w-full flex-wrap gap-1 rounded-xl border bg-card p-1 sm:inline-flex sm:w-auto"
  >
    {tabs.map((tab) => (
      <Link
        key={tab.href}
        href={tab.href}
        scroll={false}
        aria-current={tab.current ? "page" : undefined}
        className={cn(
          "inline-flex h-11 flex-1 items-center justify-center gap-1 rounded-lg px-2 text-sm font-semibold whitespace-nowrap sm:flex-none sm:gap-2 sm:px-4 sm:text-base",
          // High Contrast mode drops the dark fill, so the current tab takes the system's selection colours.
          tab.current
            ? "bg-primary text-primary-foreground forced-color-adjust-none forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] forced-colors:outline-[CanvasText]"
            : "text-foreground/80 hover:bg-accent",
        )}
      >
        {tab.label}
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 font-mono text-xs sm:px-2",
            tab.current ? "bg-white/20" : "bg-foreground/10",
          )}
        >
          {tab.count}
        </span>
      </Link>
    ))}
  </nav>
);
