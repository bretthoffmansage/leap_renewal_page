import type { NormalizedCustomField } from "./types";

export const ACTIVE_LEAP_TAG_ID = 3097;

export function normalizeFieldKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function findCustomFieldValue(fields: NormalizedCustomField[], expectedName: string): unknown {
  const expected = normalizeFieldKey(expectedName);

  return fields.find((field) => {
    const names = [field.fieldName, field.label].filter((value): value is string => Boolean(value));
    return names.some((name) => normalizeFieldKey(name) === expected);
  })?.value;
}

export function isActiveLeapMember(tagIds: number[]): boolean {
  return tagIds.includes(ACTIVE_LEAP_TAG_ID);
}
