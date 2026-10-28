import "server-only";

import { z } from "zod";

const BASE_URL = z
  .url()
  .default("https://d30r5p5favh3z8.cloudfront.net")
  .parse(process.env.CATALOG_API_BASE_URL);

const TIMEOUT_MS = 10_000;

export class CatalogUnavailableError extends Error {
  constructor(path: string, cause: unknown) {
    super(`Could not load ${path} from the catalog API`, { cause });
    this.name = "CatalogUnavailableError";
  }
}

export type FetchResult = { kind: "ok"; json: unknown } | { kind: "absent" };

export const catalogFetch = async (path: string): Promise<FetchResult> => {
  try {
    const response = await fetch(new URL(path, BASE_URL), {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (response.status === 403 || response.status === 404) {
      return { kind: "absent" };
    }
    if (!response.ok) {
      throw new Error(`The API answered ${response.status}`);
    }
    return { kind: "ok", json: await response.json() };
  } catch (error) {
    throw new CatalogUnavailableError(path, error);
  }
};
