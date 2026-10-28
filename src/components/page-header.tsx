import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

type Stat = { label: string; value: number };

type PageHeaderProps = {
  title: string;
  titleId?: string;
  stats?: Stat[];
};

const NO_STATS: Stat[] = ["a", "b", "c", "d"].map((label) => ({
  label,
  value: 0,
}));

export const PageHeader = ({ title, titleId, stats }: PageHeaderProps) => (
  <div className="bg-studs text-white">
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 pt-6 pb-8">
      <h1
        id={titleId}
        className="text-[clamp(1.9rem,1.3rem+2.2vw,3rem)] leading-[1.1] font-extrabold"
      >
        {title}
      </h1>
      <dl
        className={cn(
          "grid grid-cols-2 gap-x-6 gap-y-4 md:flex md:justify-between",
          !stats && "invisible order-first",
        )}
      >
        {(stats ?? NO_STATS).map((stat) => (
          <div key={stat.label} className="flex flex-col gap-0.5">
            <dt className="text-[13px] text-on-dark-subtle">{stat.label}</dt>
            <dd className="font-heading text-[28px] font-bold tabular-nums">
              {formatNumber(stat.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  </div>
);
