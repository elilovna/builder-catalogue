import type { Route } from "next";
import Link from "next/link";

import { BrickAvatar } from "@/components/brick-avatar";
import {
  type CustomBuildBudget,
  customBuildBudget,
} from "@/domain/custom-build";
import type { Builder, ColourCode } from "@/domain/domain-types";
import { avatarHex } from "@/lib/brick-colours";
import { formatNumber } from "@/lib/format";

import { BudgetPieces } from "./budget-pieces";
import { OwnedCheckbox } from "./owned-checkbox";

const SHARE = 0.5;

export type Reading = "others" | "owned";

type CustomBuildCardProps = {
  designer: Builder;
  builders: Builder[];
  reading: Reading;
  othersHref: Route;
  ownedHref: Route;
  colourNames: ReadonlyMap<ColourCode, string>;
};

export const CustomBuildCard = ({
  designer,
  builders,
  reading,
  othersHref,
  ownedHref,
  colourNames,
}: CustomBuildCardProps) => {
  const others = builders.filter((builder) => builder !== designer);
  const budgets: Record<Reading, CustomBuildBudget> = {
    others: customBuildBudget(others, SHARE),
    owned: customBuildBudget(others, SHARE, designer.inventory),
  };
  const budget = budgets[reading];

  return (
    <section
      aria-labelledby="custom-build-heading"
      className="grid gap-5 rounded-xl border bg-card p-4 sm:p-6"
    >
      <div className="grid gap-3">
        <p className="font-mono text-[13px] tracking-[0.06em] text-link uppercase">
          Custom build budget
        </p>
        <h2
          id="custom-build-heading"
          aria-live="polite"
          aria-atomic="true"
          className="text-[28px] font-bold"
        >
          <span className="font-mono font-semibold" translate="no">
            {designer.username}
          </span>{" "}
          can design with up to{" "}
          <span className="tabular-nums">{formatNumber(budget.total)}</span>{" "}
          pieces
        </h2>
      </div>

      <div>
        <OwnedCheckbox
          designer={designer.username}
          count={budgets.owned.total}
          checked={reading === "owned"}
          checkedHref={ownedHref}
          uncheckedHref={othersHref}
        />
      </div>

      <div className="grid gap-3">
        <p className="max-w-[60ch] text-foreground/80">
          {budget.group.length} of the {others.length} other builders can build
          it:
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2.5 text-sm">
          {budget.group.map((member) => (
            <li key={member.id} className="flex items-center gap-2.5">
              <BrickAvatar hex={avatarHex(member.id)} />
              <Link
                href={`/builders/${member.username}`}
                className="font-mono font-semibold underline decoration-input underline-offset-3 hover:decoration-current"
                translate="no"
              >
                {member.username}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <BudgetPieces pieces={budget.pieces} colourNames={colourNames} />
    </section>
  );
};
