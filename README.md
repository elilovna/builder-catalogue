# Builder Catalogue

**Live:** https://builder-catalogue-xi.vercel.app

## Stack

Next.js 16 (App Router, Cache Components, React Compiler, typed routes), React 19, TypeScript in strict mode, Tailwind CSS 4, Zod, Vitest, Playwright with axe, ESLint and Biome, Bun, Vercel.

## Pages

| Page                                                             | What it shows                                                                                     | Example                                                                                                                      |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `/`                                                              | Every builder, and how many sets each can build                                                   | [Builders](https://builder-catalogue-xi.vercel.app/)                                                                         |
| `/builders/[username]?show=all\|ready\|half`                     | The sets a builder can build, and how close they are to the rest                                  | [brickfan35](https://builder-catalogue-xi.vercel.app/builders/brickfan35)                                                    |
| `/builders/[username]/sets/[setName]?show=missing\|covered\|all` | The pieces still missing, and who could help finish the set                                       | [landscape-artist / tropical-island](https://builder-catalogue-xi.vercel.app/builders/landscape-artist/sets/tropical-island) |
| `/community?builder=…&budget=others\|owned`                      | What a builder could design with pieces the others own, and which sets colour swaps would open up | [dr_crocodile](https://builder-catalogue-xi.vercel.app/community?builder=dr_crocodile)                                       |

A builder can build a set when they own every piece of it (a design ID in a colour) in at least the quantity the set needs. Each set is judged on its own, so building one does not use up pieces for another.

## Running locally

Needs Node 24 and Bun 1.4 (the exact version is in `packageManager` in `package.json`). Bun installs the packages and runs the scripts; the app, Vitest and Playwright run on Node.

```bash
bun install
bun run dev                    # http://localhost:3000
bun run build && bun run start # production build
```

| Command                   | What it does                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `bun run test`            | Vitest unit tests on recorded data. Not `bun test`, which is Bun's own test runner.                           |
| `bun run typecheck`       | Generates the route types, then runs `tsc` in strict mode.                                                    |
| `bun run lint`            | ESLint with the Next.js rules and `jsx-a11y` in strict mode.                                                  |
| `bun run format:check`    | Biome: formatting and Tailwind class order.                                                                   |
| `bun run test:e2e`        | Builds, then runs Playwright on the production build. The first time, run `bunx playwright install chromium`. |
| `bun run fixtures:record` | Records the API into `test/fixtures/` again.                                                                  |

`CATALOG_API_BASE_URL` is optional and defaults to `https://d30r5p5favh3z8.cloudfront.net`.

## Testing

- **Unit tests** (Vitest) cover the domain logic and the API layer. They run on API data recorded in `test/fixtures/` and never call the live API. [`catalog.test.ts`](src/catalog/catalog.test.ts) checks every answer the brief asks for on that data.
- **End-to-end tests** (Playwright) run on the production build at desktop and phone size: the main journeys, the 404 pages and their status, axe with the WCAG 2.0 to 2.2 A and AA rules, pages that fit 320, 375 and 412 px wide screens, and two keyboard-only journeys.
- **CI** ([`ci.yml`](.github/workflows/ci.yml)) runs install, typecheck, lint, format check, unit tests, build and the end-to-end tests on every push to `main` and every pull request.

## Deployment

Vercel deploys every push to `main`, and gives each pull request a preview URL.

- [`vercel.json`](vercel.json) installs with `bun install --frozen-lockfile`, and `package.json` pins Node 24, so a deploy uses the same packages and Node version as CI.
- Production waits for the CI `check` job (Vercel Deployment Checks), so a commit that fails CI never goes live.
- The build prerenders every builder and set page from the live API. If the API is down, the deploy fails and the previous version stays live. A cached page refreshes in the background at most once a day (`cacheLife("days")`).

## Project structure

```
src/
├─ app/         routes, kept thin: load data, call the domain, render components
├─ catalog/     server-only: fetch with a timeout → Zod schemas → mappers → cached queries
├─ domain/      pure TypeScript: piece counts, coverage, partners, custom build budget, colour swaps
├─ components/  presentational components with plain props (ui/ holds the shadcn primitives)
└─ lib/         formatting, brick colours, cn()
```
