"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { startTransition, useOptimistic } from "react";

import { formatNumber } from "@/lib/format";

type OwnedCheckboxProps = {
  designer: string;
  count: number;
  checked: boolean;
  checkedHref: Route;
  uncheckedHref: Route;
};

export const OwnedCheckbox = ({
  designer,
  count,
  checked,
  checkedHref,
  uncheckedHref,
}: OwnedCheckboxProps) => {
  const router = useRouter();
  const [shownChecked, setShownChecked] = useOptimistic(checked);

  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        checked={shownChecked}
        onChange={(event) => {
          const next = event.target.checked;
          startTransition(() => {
            setShownChecked(next);
            router.push(next ? checkedHref : uncheckedHref, { scroll: false });
          });
        }}
        className="size-5 shrink-0 cursor-pointer accent-primary"
      />
      <span>
        <span className="font-mono font-semibold" translate="no">
          {designer}
        </span>{" "}
        must own the pieces too{" "}
        <span className="ml-1 rounded-full bg-foreground/10 px-2 py-0.5 font-mono text-xs whitespace-nowrap tabular-nums">
          {formatNumber(count)}
          <span className="sr-only"> pieces</span>
        </span>
      </span>
    </label>
  );
};
