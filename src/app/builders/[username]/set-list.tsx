import { FilterTabs } from "@/components/filter-tabs";
import { SetCard } from "@/components/set-card";
import { isOverHalfway } from "@/domain/build";
import type { BuildStatus, CatalogSet } from "@/domain/domain-types";
import type { ColourShare } from "@/lib/brick-colours";

const FILTERS = ["all", "ready", "half"] as const;
type Filter = (typeof FILTERS)[number];

const LABELS: Record<Filter, string> = {
  all: "All sets",
  ready: "Ready",
  half: "Over halfway",
};

const matches = (filter: Filter, status: BuildStatus): boolean => {
  if (filter === "ready") {
    return status.kind === "ready";
  }
  if (filter === "half") {
    return isOverHalfway(status);
  }
  return true;
};

const parseFilter = (value: string | string[] | undefined): Filter =>
  FILTERS.find((filter) => filter === value) ?? "all";

type SetListProps = {
  username: string;
  results: { set: CatalogSet; status: BuildStatus; colours: ColourShare[] }[];
  searchParams: PageProps<"/builders/[username]">["searchParams"];
};

export const SetList = async ({
  username,
  results,
  searchParams,
}: SetListProps) => {
  const { show } = await searchParams;
  const filter = parseFilter(show);
  const visible = results.filter(({ status }) => matches(filter, status));

  const tabs = FILTERS.map((value) => ({
    label: LABELS[value],
    count: results.filter(({ status }) => matches(value, status)).length,
    href: `?show=${value}` as const,
    current: value === filter,
  }));

  return (
    <section>
      <FilterTabs label="Filter sets" tabs={tabs} />

      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        {LABELS[filter]}: {visible.length} of {results.length} sets, closest
        first.
      </p>

      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ set, status, colours }) => (
          <li key={set.id}>
            <SetCard
              name={set.name}
              setNumber={set.setNumber}
              status={status}
              colours={colours}
              href={`/builders/${username}/sets/${set.name}`}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};
