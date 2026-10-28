import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL =
  process.env.CATALOG_API_BASE_URL ?? "https://d30r5p5favh3z8.cloudfront.net";
const OUT_DIR = path.join(import.meta.dirname, "..", "test", "fixtures");

const fetchJson = async (apiPath: string): Promise<unknown> => {
  const response = await fetch(new URL(apiPath, BASE_URL));
  if (!response.ok) {
    throw new Error(`${apiPath} answered ${response.status}`);
  }
  return response.json();
};

const save = (file: string, json: unknown) =>
  writeFile(path.join(OUT_DIR, file), `${JSON.stringify(json, null, 2)}\n`);

type Listing = { id: string };
const { Users } = (await fetchJson("/api/users")) as { Users: Listing[] };
const { Sets } = (await fetchJson("/api/sets")) as { Sets: Listing[] };

const [builders, sets] = await Promise.all([
  Promise.all(Users.map((user) => fetchJson(`/api/user/by-id/${user.id}`))),
  Promise.all(Sets.map((set) => fetchJson(`/api/set/by-id/${set.id}`))),
]);

await mkdir(OUT_DIR, { recursive: true });
await save("builders.json", builders);
await save("sets.json", sets);

console.log(`Recorded ${builders.length} builders and ${sets.length} sets.`);
