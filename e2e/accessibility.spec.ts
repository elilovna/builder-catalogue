import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";

const PAGES = [
  "/",
  "/builders/brickfan35",
  "/builders/brickfan35/sets/peacock-farm?show=all",
  "/builders/landscape-artist/sets/tropical-island",
  "/community",
  "/builders/nobody123",
];

test.describe("axe", () => {
  for (const path of PAGES) {
    test(`${path} has no WCAG A or AA violations`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      expect(
        violations.map(
          (violation) =>
            `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
        ),
      ).toEqual([]);
    });
  }
});

test.describe("on a phone", () => {
  test.skip(({ isMobile }) => !isMobile, "Only the phone project");

  for (const width of [320, 375, 412]) {
    test.describe(`${width} px wide`, () => {
      test.use({ viewport: { width, height: 800 } });

      for (const path of PAGES) {
        test(`${path} fits the screen without sideways scrolling`, async ({
          page,
        }) => {
          await page.goto(path);
          await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

          const pageWidth = await page.evaluate(
            () => document.documentElement.scrollWidth,
          );
          expect(pageWidth).toBeLessThanOrEqual(width);
        });
      }

      test("a 404 for a long name wraps it instead of widening the page", async ({
        page,
      }) => {
        const name = "nobody".repeat(8);
        await page.goto(`/builders/${name}`);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
          `No builder called ${name}`,
        );

        const pageWidth = await page.evaluate(
          () => document.documentElement.scrollWidth,
        );
        expect(pageWidth).toBeLessThanOrEqual(width);
      });
    });
  }

  test("the budget's pieces show every colour without sideways scrolling", async ({
    page,
  }) => {
    await page.goto("/community");
    await page.getByText("See the pieces").click();
    const pieces = page.getByRole("region", { name: "Pieces in the budget" });
    await expect(pieces).toBeVisible();

    expect(
      await pieces.evaluate((box) => box.scrollWidth <= box.clientWidth),
    ).toBe(true);
    const pageWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(pageWidth).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
  });
});

const tabTo = async (page: Page, target: Locator) => {
  for (let presses = 0; presses < 50; presses += 1) {
    await page.keyboard.press("Tab");
    if (
      await target.evaluate((element) => element === document.activeElement)
    ) {
      return;
    }
  }
  throw new Error("Tab never reached the element");
};

test.describe("keyboard only", () => {
  test.skip(({ isMobile }) => isMobile, "Phones have no Tab key");

  test("the first Tab reaches the skip link, which moves focus to the content", async ({
    page,
  }) => {
    await page.goto("/builders/brickfan35");

    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Skip to content" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
  });

  test("from the home page to car-wash's pieces", async ({ page }) => {
    await page.goto("/");

    await tabTo(
      page,
      page
        .getByRole("region", { name: "Builders" })
        .getByRole("link", { name: "brickfan35", exact: true }),
    );
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/builders/brickfan35");

    await tabTo(page, page.getByRole("link", { name: /^Ready/ }));
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/builders/brickfan35?show=ready");

    await tabTo(
      page,
      page.getByRole("link", { name: "car-wash", exact: true }),
    );
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "car-wash",
    );

    await tabTo(page, page.getByRole("region", { name: "Pieces table" }));
  });

  test("choosing a builder keeps focus on their name", async ({ page }) => {
    await page.goto("/community");
    const wizard = page
      .getByRole("navigation", { name: "Builder" })
      .getByRole("link", { name: "wizard13" });

    await tabTo(page, wizard);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/community?builder=wizard13&budget=others");

    await expect(wizard).toBeFocused();
    await expect(wizard).toHaveAttribute("aria-current", "page");
  });
});
