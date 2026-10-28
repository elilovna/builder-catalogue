import { readFileSync } from "node:fs";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getBuilder, getBuilders } from "./queries";
import { UserDetailSchema } from "./schemas";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ cacheLife: () => {}, cacheTag: () => {} }));

const users = UserDetailSchema.array().parse(
  JSON.parse(
    readFileSync(
      path.join(process.cwd(), "test", "fixtures", "builders.json"),
      "utf8",
    ),
  ),
);

type UserDetail = (typeof users)[number];

const summary = ({ id, username, location, brickCount }: UserDetail) => ({
  id,
  username,
  location,
  brickCount,
});

const answer = (pathname: string): Response => {
  if (pathname === "/api/users") {
    return Response.json({ Users: users.map(summary) });
  }
  const byId = users.find((user) => pathname === `/api/user/by-id/${user.id}`);
  if (byId) {
    return Response.json(byId);
  }
  const byName = users.find(
    (user) => pathname === `/api/user/by-username/${user.username}`,
  );
  if (byName) {
    return Response.json(summary(byName));
  }
  return new Response(null, { status: 403 });
};

const requested: string[] = [];

beforeEach(() => {
  requested.length = 0;
  vi.stubGlobal("fetch", async (url: URL) => {
    requested.push(url.pathname);
    return answer(url.pathname);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getBuilders", () => {
  it("loads every builder with one call for the list and one per builder", async () => {
    const builders = await getBuilders();

    expect(builders.map((builder) => builder.username)).toEqual(
      users.map((user) => user.username),
    );
    expect(requested).toHaveLength(12);
    expect(requested[0]).toBe("/api/users");
  });
});

describe("getBuilder", () => {
  it("finds a builder by username, then loads everything they own by id", async () => {
    const builder = await getBuilder("brickfan35");

    expect(builder?.inventory.get("3710:155")).toBe(9);
    expect(requested).toEqual([
      "/api/user/by-username/brickfan35",
      `/api/user/by-id/${builder?.id}`,
    ]);
  });

  it("returns null when no builder has the username", async () => {
    expect(await getBuilder("nobody")).toBeNull();
    expect(requested).toEqual(["/api/user/by-username/nobody"]);
  });
});
