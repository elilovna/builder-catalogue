import { expect, test } from "@playwright/test";

test("the home page counts the builders, sets, colours and pieces", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("term")).toHaveText([
    "Builders",
    "Sets in the catalogue",
    "Colours in use",
    "Pieces tracked",
  ]);
  // 11 colours: the ones collections and sets use, not the API's list of 73.
  await expect(page.getByRole("definition")).toHaveText([
    "11",
    "15",
    "11",
    "20,328",
  ]);
});

test("brickfan35 can build car-wash, castaway and undersea-monster", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("region", { name: "Builders" })
    .getByRole("link", { name: "brickfan35", exact: true })
    .click();

  await expect(page).toHaveURL("/builders/brickfan35");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "brickfan35",
  );
  await expect(page.getByRole("main")).toContainText(
    "brickfan35 can build 3 of 15 sets right now: car-wash, castaway and undersea-monster.",
  );

  await page.getByRole("link", { name: /^Ready/ }).click();
  await expect(page).toHaveURL("/builders/brickfan35?show=ready");
  const cards = page.getByRole("article");
  await expect(cards).toHaveCount(3);
  const names = await cards.getByRole("heading").allTextContents();
  expect(names.sort()).toEqual(["car-wash", "castaway", "undersea-monster"]);

  await page.getByRole("link", { name: "car-wash", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("car-wash");
  await expect(page.getByRole("main")).toContainText(
    "brickfan35 owns every piece for this set",
  );

  // The filter lives in the URL, so Back returns to the same filtered list.
  await page.goBack();
  await expect(page).toHaveURL("/builders/brickfan35?show=ready");
  await expect(cards).toHaveCount(3);
});

test("peacock-farm lists the pieces brickfan35 is missing", async ({
  page,
}) => {
  await page.goto("/builders/brickfan35/sets/peacock-farm");
  await expect(page.getByRole("main")).toContainText(
    "brickfan35 owns 466 of 690 pieces",
  );

  // An incomplete set shows its missing lines first: 63 of 142, plus the header row.
  const table = page.getByRole("table", { name: "Pieces" });
  await expect(table.getByRole("row")).toHaveCount(64);

  const filters = page.getByRole("navigation", {
    name: "Which pieces to show",
  });
  // The other 79 lines are covered.
  await filters.getByRole("link", { name: /^Covered/ }).click();
  await expect(page).toHaveURL(
    "/builders/brickfan35/sets/peacock-farm?show=covered",
  );
  await expect(table.getByRole("row")).toHaveCount(80);

  await filters.getByRole("link", { name: /^All/ }).click();
  await expect(page).toHaveURL(
    "/builders/brickfan35/sets/peacock-farm?show=all",
  );
  await expect(table.getByRole("row")).toHaveCount(143);
});

test("stretch 1: spaceman77 can complete tropical-island with landscape-artist", async ({
  page,
}) => {
  await page.goto("/builders/landscape-artist/sets/tropical-island");

  await expect(
    page.getByRole("region", { name: "Build it together" }),
  ).toContainText("spaceman77 can complete it with landscape-artist.");
});

test("stretch 2: megabuilder99 can design with up to 618 pieces", async ({
  page,
}) => {
  await page.goto("/community");

  await expect(
    page.getByRole("heading", {
      name: "megabuilder99 can design with up to 618 pieces",
    }),
  ).toBeVisible();
});

test("stretch 2: any builder can be the designer", async ({ page }) => {
  await page.goto("/community");

  await page
    .getByRole("navigation", { name: "Builder" })
    .getByRole("link", { name: "dr_crocodile" })
    .click();
  await expect(page).toHaveURL("/community?builder=dr_crocodile&budget=others");
  await expect(
    page.getByRole("heading", {
      name: "dr_crocodile can design with up to 502 pieces",
    }),
  ).toBeVisible();

  // The other reading keeps the chosen builder.
  const owned = page.getByRole("checkbox", {
    name: /^dr_crocodile must own the pieces too/,
  });
  await owned.check();
  await expect(page).toHaveURL("/community?builder=dr_crocodile&budget=owned");
  await expect(owned).toBeChecked();
  await expect(
    page.getByRole("heading", {
      name: "dr_crocodile can design with up to 477 pieces",
    }),
  ).toBeVisible();
});

test("stretch 3: dr_crocodile can build coffee-bar by swapping colours", async ({
  page,
}) => {
  await page.goto("/community");

  // The page opens on megabuilder99, who gains nothing from swaps.
  await expect(
    page.getByRole("heading", {
      name: "megabuilder99 can’t build any more sets by swapping colours",
    }),
  ).toBeVisible();

  await page
    .getByRole("navigation", { name: "Builder" })
    .getByRole("link", { name: "dr_crocodile" })
    .click();
  await expect(page).toHaveURL("/community?builder=dr_crocodile&budget=others");

  const card = page.getByRole("region", {
    name: "dr_crocodile can build 1 more set by swapping colours",
  });
  await expect(card.getByRole("link", { name: "coffee-bar" })).toBeVisible();
});

const NOT_FOUND = [
  ["/builders/nobody123", "No builder called nobody123"],
  ["/builders/brickfan35/sets/nope", "No set called nope"],
  // The builder is checked first, so a wrong builder is named even on a set address.
  ["/builders/nobody123/sets/car-wash", "No builder called nobody123"],
  // Any other unknown address gets the site-wide page.
  ["/nope", "Page not found"],
] as const;

for (const [path, message] of NOT_FOUND) {
  test(`${path} answers 404`, async ({ page }) => {
    const response = await page.goto(path);

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(message);
  });
}
