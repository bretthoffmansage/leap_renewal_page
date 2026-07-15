/**
 * Keap REST v2 models expose many identifiers as strings (see Contact.id, tag_ids).
 * Normalize them to finite numbers for comparison and URL path segments.
 */
export function parseKeapId(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

export function parseKeapIdArray(value: unknown): number[] {
  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((part) => parseKeapId(part.trim()))
      .filter((id): id is number => typeof id === "number");
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const id = parseKeapId(item);
    return typeof id === "number" ? [id] : [];
  });
}
