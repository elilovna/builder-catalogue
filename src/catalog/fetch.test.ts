import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { catalogFetch, CatalogUnavailableError } from "./fetch";

vi.mock("server-only", () => ({}));

const fakeFetch = vi.fn<typeof fetch>();

const realTimeout = AbortSignal.timeout.bind(AbortSignal);

beforeEach(() => {
  fakeFetch.mockReset();
  vi.stubGlobal("fetch", fakeFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("catalogFetch", () => {
  it("returns the JSON when the API answers 200", async () => {
    fakeFetch.mockResolvedValue(Response.json({ Sets: [] }));

    await expect(catalogFetch("/api/sets")).resolves.toEqual({
      kind: "ok",
      json: { Sets: [] },
    });

    const [url, init] = fakeFetch.mock.lastCall ?? [];
    expect(String(url)).toBe("https://d30r5p5favh3z8.cloudfront.net/api/sets");
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it.each([403, 404])(
    "returns absent when the API answers %i",
    async (status) => {
      fakeFetch.mockResolvedValue(new Response(null, { status }));

      await expect(
        catalogFetch("/api/user/by-username/nobody"),
      ).resolves.toEqual({ kind: "absent" });
    },
  );

  it.each([500, 503])("throws when the API answers %i", async (status) => {
    fakeFetch.mockResolvedValue(new Response(null, { status }));

    const loading = catalogFetch("/api/set/by-id/abc");
    await expect(loading).rejects.toBeInstanceOf(CatalogUnavailableError);
    await expect(loading).rejects.toMatchObject({
      message: "Could not load /api/set/by-id/abc from the catalog API",
      cause: { message: `The API answered ${status}` },
    });
  });

  it("throws when the API cannot be reached", async () => {
    fakeFetch.mockRejectedValue(new TypeError("fetch failed"));

    await expect(catalogFetch("/api/sets")).rejects.toMatchObject({
      name: "CatalogUnavailableError",
      cause: { message: "fetch failed" },
    });
  });

  it("throws when the API does not answer in time", async () => {
    fakeFetch.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          const signal = init?.signal;
          signal?.addEventListener("abort", () => reject(signal.reason));
        }),
    );
    const timeout = vi
      .spyOn(AbortSignal, "timeout")
      .mockImplementation(() => realTimeout(1));

    await expect(catalogFetch("/api/sets")).rejects.toMatchObject({
      name: "CatalogUnavailableError",
      cause: { name: "TimeoutError" },
    });
    expect(timeout).toHaveBeenCalledWith(10_000);
  });

  it("throws when a 200 answer is not JSON", async () => {
    fakeFetch.mockResolvedValue(new Response("<html>Error</html>"));

    await expect(catalogFetch("/api/sets")).rejects.toMatchObject({
      name: "CatalogUnavailableError",
      cause: { name: "SyntaxError" },
    });
  });
});
