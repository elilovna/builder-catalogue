# Builder Catalogue

Which sets can a builder complete with the pieces they already own? A Next.js app that answers this for every builder in the catalogue API, shows how close the other sets are, and answers all three stretch goals.

## The answer

**brickfan35 can build 3 of the 15 sets: `car-wash`, `castaway` and `undersea-monster`.**

See it at `/builders/brickfan35`. The test `can build car-wash, castaway and undersea-monster` in [`src/catalog/catalog.test.ts`](src/catalog/catalog.test.ts) pins it on recorded API data.

| Stretch goal                                                            | Answer                                                          | Where                                             |
| ----------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------- |
| 1. Who can complete `tropical-island` together with `landscape-artist`? | **spaceman77**, the only builder who covers the whole gap alone | `/builders/landscape-artist/sets/tropical-island` |
| 2. Largest collection that at least half the other builders could build | **618 pieces** (423 if megabuilder99 must also own them)        | `/community`                                      |
| 3. New sets for `dr_crocodile` with colour swaps                        | **coffee-bar**, with 4 colour swaps                             | `/community?builder=dr_crocodile`                 |

"Can build" means: for every line of the set (a design ID in a colour), the builder owns at least the quantity the set needs. Each set is judged on its own; building one does not use up pieces for another.

## How to run

Needs Node 24 and Bun 1.4 (the exact version is in `packageManager` in `package.json`). Bun installs the packages and runs the scripts; the app, Vitest and Playwright run on Node.

```bash
bun install
bun run dev                    # http://localhost:3000
bun run build && bun run start # production build
```

| Command                   | What it does                                                                                                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run test`            | Vitest unit tests. They use recorded data and never call the live API. Not `bun test`, which is Bun's own test runner.                                                       |
| `bun run typecheck`       | Generates the route types, then runs `tsc` in strict mode.                                                                                                                   |
| `bun run lint`            | ESLint with the Next.js rules and `jsx-a11y` in strict mode.                                                                                                                 |
| `bun run format:check`    | Biome: formatting and Tailwind class order.                                                                                                                                  |
| `bun run test:e2e`        | Builds, then runs Playwright on the production build at desktop and phone size: the main journeys, the 404s and axe. The first time, run `bunx playwright install chromium`. |
| `bun run fixtures:record` | Records the API into `test/fixtures/` again.                                                                                                                                 |

`CATALOG_API_BASE_URL` is optional and defaults to `https://d30r5p5favh3z8.cloudfront.net`. The build prerenders pages with data from the live API, so `build` and `start` should use the same value.

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs install, typecheck, lint, format check, unit tests, build and the end-to-end tests on every push to `main` and every pull request.

## How it works

```
src/
├─ app/         routes, kept thin: load data, call the domain, render components
├─ catalog/     server-only: fetch with a timeout → Zod schemas → mappers → cached queries
├─ domain/      pure TypeScript: piece counts, coverage, partners, custom build budget, colour swaps
├─ components/  presentational components with plain props (ui/ holds the shadcn primitives)
└─ lib/         formatting, brick colours, cn()
```

| Route                                                   | Question it answers                                            |
| ------------------------------------------------------- | -------------------------------------------------------------- |
| `/`                                                     | Who are the builders, and how many sets can each build?        |
| `/builders/[username]?show=all\|ready\|half`            | Which sets can this builder build, and how close are the rest? |
| `/builders/[username]/sets/[setName]?show=missing\|all` | Which pieces are missing, and who could help?                  |
| `/community?builder=…&budget=others\|owned`             | Stretch goals 2 and 3, for any builder                         |
