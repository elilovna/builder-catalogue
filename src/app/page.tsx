import { getBuilders, getCatalogSets } from "@/catalog/queries";
import { BuilderCard } from "@/components/builder-card";
import { canBuild } from "@/domain/build";
import { countColours, summariseInventory } from "@/domain/pieces";
import { avatarHex } from "@/lib/brick-colours";
import { formatNumber } from "@/lib/format";

const HomePage = async () => {
  const [builders, sets] = await Promise.all([getBuilders(), getCatalogSets()]);

  const cards = builders
    .map((builder) => ({
      builder,
      pieces: summariseInventory(builder.inventory).pieces,
      readyCount: sets.filter((set) =>
        canBuild(set.required, builder.inventory),
      ).length,
    }))
    // Most sets ready first, then A to Z.
    .sort(
      (a, b) =>
        b.readyCount - a.readyCount ||
        a.builder.username.localeCompare(b.builder.username),
    );

  const stats = [
    { label: "Builders", value: builders.length },
    { label: "Sets in the catalogue", value: sets.length },
    {
      label: "Colours in use",
      value: countColours([
        ...builders.map((builder) => builder.inventory),
        ...sets.map((set) => set.required),
      ]),
    },
    {
      label: "Pieces tracked",
      value: cards.reduce((sum, card) => sum + card.pieces, 0),
    },
  ];

  return (
    <>
      {/* The title and the catalogue's totals, in the same dark header as every other page.
          The totals sit above the cards, so they stay on the first screen however many
          builders there are: under a long list, nobody would scroll down to them. */}
      <div className="bg-studs text-white">
        <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 pt-6 pb-8">
          <h1
            id="builders-heading"
            className="text-[clamp(1.9rem,1.3rem+2.2vw,3rem)] leading-[1.1] font-extrabold"
          >
            Builders
          </h1>
          {/* Phones: two by two. Wider: one row from edge to edge, first number on the left,
              last on the right, the same gap between each. */}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:flex md:justify-between">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-0.5">
                <dt className="text-[13px] text-on-dark-subtle">
                  {stat.label}
                </dt>
                <dd className="font-heading text-[28px] font-bold tabular-nums">
                  {formatNumber(stat.value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section
        aria-labelledby="builders-heading"
        className="mx-auto w-full max-w-6xl px-4 pt-8 pb-16"
      >
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map(({ builder, pieces, readyCount }) => (
            <li key={builder.id}>
              <BuilderCard
                username={builder.username}
                location={builder.location}
                pieces={pieces}
                readyCount={readyCount}
                totalSets={sets.length}
                avatarHex={avatarHex(builder.id)}
                href={`/builders/${builder.username}`}
              />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default HomePage;
