import { getBuilders, getCatalogSets } from "@/catalog/queries";
import { BuilderCard } from "@/components/builder-card";
import { PageHeader } from "@/components/page-header";
import { canBuild } from "@/domain/build";
import { countColours, summariseInventory } from "@/domain/pieces";
import { avatarHex } from "@/lib/brick-colours";

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
      <PageHeader title="Builders" titleId="builders-heading" stats={stats} />

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
