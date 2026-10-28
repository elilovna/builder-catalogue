# Builder Catalogue

Which sets can a builder complete with the pieces they already own? A Next.js app that answers this for every builder in the catalogue API, shows how close the other sets are, and answers two of the three stretch goals.

## The answer

**brickfan35 can build 3 of the 15 sets: `car-wash`, `castaway` and `undersea-monster`.**

See it at `/builders/brickfan35`. The test `can build car-wash, castaway and undersea-monster` in [`src/catalog/catalog.test.ts`](src/catalog/catalog.test.ts) pins it on recorded API data.

| Stretch goal                                                            | Answer                                                                  | Where                                             |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------- |
| 1. Who can complete `tropical-island` together with `landscape-artist`? | **spaceman77**, the only builder who covers the whole gap alone         | `/builders/landscape-artist/sets/tropical-island` |
| 2. Largest collection that at least half the other builders could build | **618 pieces** (423 if megabuilder99 must also own them)                | `/community`                                      |
| 3. New sets for `dr_crocodile` with colour swaps                        | **coffee-bar**, explained [below](#3-colour-swaps-not-built), not built | —                                                 |

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
├─ domain/      pure TypeScript: piece counts, coverage, partners, custom build budget
├─ components/  presentational components with plain props (ui/ holds the shadcn primitives)
└─ lib/         formatting, brick colours, cn()
```

| Route                                                   | Question it answers                                            |
| ------------------------------------------------------- | -------------------------------------------------------------- |
| `/`                                                     | Who are the builders, and how many sets can each build?        |
| `/builders/[username]?show=all\|ready\|half`            | Which sets can this builder build, and how close are the rest? |
| `/builders/[username]/sets/[setName]?show=missing\|all` | Which pieces are missing, and who could help?                  |
| `/community`                                            | Stretch goal 2                                                 |

## Main decisions

**Render on the server, cache the parsed data.** The data is public and the same for everyone, so pages are Server Components and the queries in [`src/catalog/queries.ts`](src/catalog/queries.ts) use `'use cache'` with `cacheLife("days")`. The cache holds validated domain objects, not raw JSON. _Instead of_ fetching in the browser, which would repeat the same API calls in every visitor's browser.

**Validate and normalise at the boundary.** The API sends an inventory colour as `"155"` and a set colour as `155`, and calls the same thing `pieceId` and `designID`. Zod schemas mirror the raw API, and one mapper turns both into the domain's `designId` and `colourCode`. _Instead of_ `as` casts, where `"155" !== 155` would quietly make every set unbuildable.

**Domain logic as pure functions.** [`src/domain`](src/domain) has no React and no network, so the logic is tested in milliseconds and the pages stay thin.

**"Does not exist" is not "could not load".** The API is static files behind CloudFront, so a missing name answers 403. A 403 or 404 on a name lookup answers with a 404 status and the not-found page. A timeout, a network error, a 5xx, or a 403 for an id the API itself listed throws `CatalogUnavailableError` and shows the error page with Try again. A set that failed to load is never shown as a set you cannot build.

**A real 404 status.** Once a response starts streaming, its status is 200. So there is no `loading.tsx` above the builder and set pages, `partialPrefetching` is off, and each page looks the name up before any Suspense boundary. [`sets/layout.tsx`](src/app/builders/[username]/sets/layout.tsx) checks the builder first, so a wrong builder name gets the builder's 404, not the set's.

**The URL holds the state.** Filters are links (`?show=ready`, `?show=missing`) with `aria-current`, so a view can be shared, survives a refresh and works before JavaScript loads.

**One app, layered folders.** No Nx: one app with one consumer does not need a workspace, and the folders already keep the boundaries. Nx would pay off with a second app, or a second team using the components.

**Exact where it is cheap.** Stretch 2 tries every group (252), and stretch 1 tries every pair of partners (at most 45). Only beyond pairs does it fall back to a greedy pick.

## Accessibility

The target is WCAG 2.2 AA. What the app does:

- Colour never carries meaning alone: every swatch shows its colour name, and every status has a word or number ("Ready", "Covered", "68%").
- A skip link, one `h1` per page, labelled landmarks and breadcrumbs, and tables with column headers.
- Filters are links with `aria-current`; the result count under them is a polite live region.
- A shortfall shows as "−11" but is read as "11 short".
- Usernames, set names and piece IDs have `translate="no"`, so browser translation leaves them alone.
- A 3px focus ring on every control, yellow on the dark header. Loading placeholders only pulse when reduced motion is off.
- On narrow phones the piece table scrolls sideways inside a focusable, labelled region instead of widening the page.

How it was checked:

- `eslint-plugin-jsx-a11y` in strict mode on every file.
- In Playwright, on the production build ([`e2e/accessibility.spec.ts`](e2e/accessibility.spec.ts)): axe with the WCAG 2.0 to 2.2 A and AA rules on six pages, at desktop and phone size; the same pages, and a 404 for a very long name, fit phone screens 320, 375 and 412 px wide without sideways scrolling, and at 412 px so does the open piece table on the community page; and two keyboard-only journeys: from the skip link to a set's piece table, and choosing a builder on the community page, where focus stays on their name.
- By hand at 320, 375 and 390 px wide, including scrolling the piece table with the keyboard.

Not checked yet: a screen reader pass, and forced colours.

## Known limits

- **Data can be up to about a week old.** `cacheLife("days")` serves a cached copy, refreshes it in the background on a visit after a day, and drops an entry nobody asked for in a week. `revalidateTag("catalog", "max")` would refresh it on demand, but nothing calls it.
- **The build needs the live API**, because it prerenders every builder and set page. So CI fails if the API is down.
- **The not-found page for an unknown builder or set needs JavaScript.** The status is 404, but the server sends an empty document and the message appears once the page's JavaScript runs. The site-wide 404 (any other address) is complete HTML.
- **The cache is in memory, per server instance.** Several instances would need a shared cache handler.
- **Colour swatches use a local table** ([`src/lib/brick-colours.ts`](src/lib/brick-colours.ts)), because the API has colour names but no RGB values. An unknown code gets a grey swatch and still shows its name.
- **The group search in stretch 1 is greedy**, so it can pick more partners than needed. The page says so when it shows more than three. In the data, one builder and set needs a group at all.
- **Stretch 2 tries every group.** That is 252 groups for 10 builders, but the number grows fast. With many builders it would need a greedy search or an integer program.
- **The end-to-end tests use the live API too**, and the error page has none: the API is called on the server, where a browser test cannot make it fail. That needs a fake API server.
- **No Storybook yet.**

## Stretch goals

### 1. Build it together

**spaceman77** can complete `tropical-island` with `landscape-artist`. landscape-artist owns 590 of its 650 pieces; spaceman77 is the only builder who owns the 60 missing ones, and technical-spike comes next, 6 pieces short.

It is on every incomplete set page, for every builder. [`src/domain/partners.ts`](src/domain/partners.ts):

- `rankPartners` treats the missing pieces as a small set of their own and checks each other builder against it.
- `completingPairs` tries every pair when nobody can complete the set alone.
- `pickGroup` handles the rest: it adds the builder who covers the most of what is still missing, until nothing is. Finding the smallest group is the set cover problem, so this is greedy on purpose.

Across all 146 unfinished builder and set combinations in the data: 126 have one partner who completes the set, 19 need a pair, 1 needs a group of three, and none is impossible. A test checks this, and that every pair really builds its set.

### 2. Custom build budget

**megabuilder99 can design with up to 618 pieces**, which arts-n-bricks, captain-pieces, dr_crocodile, green-bricks-only and spaceman77 all own. If megabuilder99 must also own every piece, the budget is 423, with a different group.

"At least 50% of the other users" is read as 5 of the 10 other builders. The build must be completable by one group, so [`customBuildBudget`](src/domain/custom-build.ts) takes every group of 5 (252 of them), keeps the pieces all 5 own in the smallest quantity any of them has, and picks the group with the most pieces. Taking each piece on its own, for example its median count, would mix different builders, and no single group could build the result. A test checks that every member of the winning group can build the budget.

### 3. Colour swaps (not built)

**coffee-bar** becomes buildable for dr_crocodile, for example with Tan → White, White → Tan, Orange → Light Gray and Brown → Red. (One other mapping works too; both need 4 swaps. car-wash and lunar-module were already buildable.) I found this with a throwaway script on the recorded data. It is not in the app.

How I would build it: group the set's pieces by colour. A set colour can become one of the builder's colours if the builder owns every piece of that group, in quantity, in the new colour. No two groups may end up the same colour, so they never compete for the same pieces. That makes it bipartite matching between set colours and owned colours: the set is buildable when a matching covers every set colour. Kuhn's augmenting paths find one in O(V·E), and one valid mapping per set is all the brief asks for. The tests would check that each mapping is one-to-one, covers every piece in quantity, and that sets already buildable are left out.

I did not build it because the core journey, the error handling and the tests came first.

## Next steps

- A small fake API server for the end-to-end tests, so they can cover a slow or failing API and the error page.
- Storybook stories for the reusable components, with the accessibility addon.
- Stretch 3, as described above.
- Fit the header navigation at 320 px.
- At scale: compute a builder's buildable sets when their inventory changes and store the result, index sets by their rarest piece, and ask for batch endpoints instead of one call per set.

---

LEGO® is a trademark of the LEGO Group. This is an interview exercise and is not affiliated with the LEGO Group.
