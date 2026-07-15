import "server-only";
import { ACTIVE_LEAP_TAG_ID, findCustomFieldValue } from "./contact-model";
import type { KeapTagSummary, NormalizedCustomField, NormalizedKeapAccount } from "./types";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberArray(value: unknown): number[] {
  return Array.isArray(value) ? value.filter((item): item is number => typeof item === "number") : [];
}

function extractEmails(contact: Record<string, unknown>, inputEmail: string): string[] {
  const emails = new Set<string>();
  for (const value of [contact.email, contact.email_address, contact.emailAddress]) {
    if (typeof value === "string") emails.add(value.trim().toLowerCase());
  }

  if (Array.isArray(contact.email_addresses)) {
    for (const item of contact.email_addresses) {
      const record = asRecord(item);
      for (const value of [record.email, record.email_address, record.emailAddress, record.address]) {
        if (typeof value === "string") emails.add(value.trim().toLowerCase());
      }
    }
  }

  if (emails.size === 0) emails.add(inputEmail);
  return [...emails];
}

function mapCustomFields(contact: Record<string, unknown>, model: unknown): NormalizedCustomField[] {
  const fields = Array.isArray(contact.custom_fields) ? contact.custom_fields : [];
  const modelMap = buildFieldModelMap(model);

  return fields.flatMap((item): NormalizedCustomField[] => {
    const field = asRecord(item);
    const id = field.id ?? field.content_type_id ?? field.custom_field_id;
    if (typeof id !== "number" && typeof id !== "string") return [];
    const modelEntry = modelMap.get(String(id));
    return [
      {
        id,
        fieldName: stringValue(field.field_name) ?? stringValue(modelEntry?.fieldName),
        label: stringValue(field.label) ?? stringValue(modelEntry?.label),
        value: field.value,
      },
    ];
  });
}

function buildFieldModelMap(model: unknown): Map<string, { fieldName?: string; label?: string }> {
  const map = new Map<string, { fieldName?: string; label?: string }>();
  const record = asRecord(model);
  const values = [record.custom_fields, record.fields, record.data].find(Array.isArray) ?? [];

  for (const item of values) {
    const field = asRecord(item);
    const id = field.id ?? field.content_type_id ?? field.custom_field_id;
    if (typeof id !== "number" && typeof id !== "string") continue;
    map.set(String(id), {
      fieldName: stringValue(field.field_name) ?? stringValue(field.name),
      label: stringValue(field.label),
    });
  }

  return map;
}

function deriveYear(value?: string): string | undefined {
  if (!value) return undefined;
  const match = value.match(/\b(20\d{2}|19\d{2})\b/);
  return match?.[1];
}

function extractHttpsLinks(fields: NormalizedCustomField[]): Array<{ label: string; url: string }> {
  return fields.flatMap((field) => {
    const label = field.label ?? field.fieldName ?? String(field.id);
    const value = typeof field.value === "string" ? field.value : undefined;
    if (!value || !/^https:\/\//i.test(value)) return [];
    if (!/obvio/i.test(label)) return [];
    return [{ label, url: value }];
  });
}

export function normalizeKeapContact({
  inputEmail,
  contact,
  tagCatalog = new Map(),
  contactModel,
  notes = [],
  includeRaw = false,
  warnings = [],
}: {
  inputEmail: string;
  contact: unknown;
  tagCatalog?: Map<number, KeapTagSummary>;
  contactModel?: unknown;
  notes?: unknown[];
  includeRaw?: boolean;
  warnings?: string[];
}): NormalizedKeapAccount {
  const record = asRecord(contact);
  const contactId = typeof record.id === "number" ? record.id : Number(record.id ?? record.contact_id ?? 0);
  const tagIds = numberArray(record.tag_ids ?? record.tagIds ?? record.groups);
  const customFields = mapCustomFields(record, contactModel);
  const appliedTags = tagIds.map((id) => tagCatalog.get(id) ?? { id, name: "Unknown tag" });
  const leapCohort = findCustomFieldValue(customFields, "LEAPCohort");
  const paymentOption = findCustomFieldValue(customFields, "PaymentOption");
  const podNumber = findCustomFieldValue(customFields, "PodNumber");
  const createTime = stringValue(record.create_time ?? record.createTime);

  return {
    inputEmail,
    contactId,
    identity: {
      firstName: stringValue(record.given_name ?? record.first_name ?? record.firstName),
      lastName: stringValue(record.family_name ?? record.last_name ?? record.lastName),
      preferredName: stringValue(record.preferred_name ?? record.preferredName),
      displayName: stringValue(record.display_name ?? record.displayName ?? record.full_name),
      emails: extractEmails(record, inputEmail),
      phones: [],
      addresses: Array.isArray(record.addresses) ? record.addresses : [],
    },
    profile: {
      company: record.company,
      jobTitle: stringValue(record.job_title ?? record.jobTitle),
      website: stringValue(record.website),
      contactType: record.contact_type ?? record.contactType,
      sourceType: record.source_type ?? record.sourceType,
      createTime,
      updateTime: stringValue(record.update_time ?? record.updateTime),
      origin: record.origin,
      timeZone: stringValue(record.time_zone ?? record.timeZone),
    },
    appliedTags,
    customFields,
    notes,
    derived: {
      memberSince: deriveYear(createTime),
      leapActive: tagIds.includes(ACTIVE_LEAP_TAG_ID),
      leapCohort: typeof leapCohort === "string" ? leapCohort : undefined,
      paymentOption: typeof paymentOption === "string" ? paymentOption : undefined,
      podNumber: typeof podNumber === "string" ? podNumber : undefined,
      tveAttendance: appliedTags.filter((tag) => /tve/i.test(tag.name)).map((tag) => tag.name),
      obvioLinks: extractHttpsLinks(customFields),
      membershipSummary: tagIds.includes(ACTIVE_LEAP_TAG_ID) ? "Active LEAP" : undefined,
    },
    warnings,
    raw: includeRaw ? { contact, notes, model: contactModel } : undefined,
  };
}
