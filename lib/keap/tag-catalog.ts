import "server-only";
import type { KeapClientConfig } from "./client";
import { keapFetchJson } from "./client";
import { parseKeapId } from "./ids";
import type { KeapTagSummary } from "./types";

function extractTags(response: unknown): KeapTagSummary[] {
  if (!response || typeof response !== "object") return [];
  const record = response as Record<string, unknown>;
  const values = [record.tags, record.data, record.items].find(Array.isArray) ?? [];

  return values.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const tag = item as Record<string, unknown>;
    const id = parseKeapId(tag.id);
    const name = tag.name;
    if (typeof id !== "number" || typeof name !== "string") return [];
    return [{ id, name, category: tag.category }];
  });
}

function getNextPageToken(response: unknown): string | undefined {
  if (!response || typeof response !== "object") return undefined;
  const record = response as Record<string, unknown>;
  const token = record.next_page_token ?? record.nextPageToken;
  return typeof token === "string" && token ? token : undefined;
}

export async function fetchTagCatalog({
  config,
  fetchImpl,
}: {
  config?: KeapClientConfig;
  fetchImpl?: typeof fetch;
} = {}): Promise<Map<number, KeapTagSummary>> {
  const tags = new Map<number, KeapTagSummary>();
  let pageToken: string | undefined;

  do {
    const searchParams = new URLSearchParams();
    if (pageToken) searchParams.set("page_token", pageToken);

    const response = await keapFetchJson<unknown>({ path: "tags", searchParams, config, fetchImpl });
    for (const tag of extractTags(response)) tags.set(tag.id, tag);
    pageToken = getNextPageToken(response);
  } while (pageToken);

  return tags;
}
