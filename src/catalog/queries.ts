import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { Builder, CatalogSet, ColourCode } from "@/domain/domain-types";

import { catalogFetch, CatalogUnavailableError } from "./fetch";
import { toBuilder, toCatalogSet } from "./mappers";
import {
  ColoursSchema,
  SetDetailSchema,
  SetsSchema,
  UserDetailSchema,
  UsersSchema,
  UserSummarySchema,
} from "./schemas";

const fetchListed = async (path: string): Promise<unknown> => {
  const result = await catalogFetch(path);

  if (result.kind === "absent") {
    throw new CatalogUnavailableError(
      path,
      new Error("Listed by the API, but missing"),
    );
  }
  return result.json;
};

const getBuilderById = async (id: string): Promise<Builder> => {
  "use cache";
  cacheLife("days");
  cacheTag("catalog");

  const detail = UserDetailSchema.parse(
    await fetchListed(`/api/user/by-id/${id}`),
  );
  return toBuilder(detail);
};

export const getBuilder = async (username: string): Promise<Builder | null> => {
  "use cache";
  cacheTag("catalog");

  const lookup = await catalogFetch(
    `/api/user/by-username/${encodeURIComponent(username)}`,
  );

  if (lookup.kind === "absent") {
    cacheLife("minutes"); // if this builder signs up, they show up soon
    return null;
  }
  cacheLife("days");

  const summary = UserSummarySchema.parse(lookup.json);
  return getBuilderById(summary.id);
};

const getCatalogSet = async (id: string): Promise<CatalogSet> => {
  "use cache";
  cacheLife("days");
  cacheTag("catalog");

  const detail = SetDetailSchema.parse(
    await fetchListed(`/api/set/by-id/${id}`),
  );
  return toCatalogSet(detail);
};

export const getCatalogSets = async (): Promise<CatalogSet[]> => {
  "use cache";
  cacheLife("days");
  cacheTag("catalog");

  const { Sets } = SetsSchema.parse(await fetchListed("/api/sets"));
  return Promise.all(Sets.map((summary) => getCatalogSet(summary.id)));
};

const getUserList = async () => {
  "use cache";
  cacheLife("days");
  cacheTag("catalog");

  const { Users } = UsersSchema.parse(await fetchListed("/api/users"));
  return Users;
};

export const getUsernames = async (): Promise<string[]> => {
  const users = await getUserList();
  return users.map((user) => user.username);
};

export const getColourNames = async (): Promise<
  ReadonlyMap<ColourCode, string>
> => {
  "use cache";
  cacheLife("days");
  cacheTag("catalog");

  const { colours } = ColoursSchema.parse(await fetchListed("/api/colours"));
  return new Map(colours.map((colour) => [colour.code, colour.name]));
};

export const getBuilders = async (): Promise<Builder[]> => {
  const users = await getUserList();
  return Promise.all(users.map((user) => getBuilderById(user.id)));
};
