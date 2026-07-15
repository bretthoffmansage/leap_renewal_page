import "server-only";
import type { KeapClientConfig } from "./client";
import { keapFetchJson, KeapRequestError } from "./client";
import { parseKeapId } from "./ids";

export type KeapContactCandidate = Record<string, unknown>;

export type ContactSelection =
  | { status: "selected"; contact: KeapContactCandidate; contactId: number }
  | { status: "not_found" }
  | { status: "duplicate"; count: number };

export function extractContactArray(response: unknown): KeapContactCandidate[] {
  if (!response || typeof response !== "object") return [];
  const record = response as Record<string, unknown>;
  const candidates = [record.contacts, record.data, record.items, record.results];
  const firstArray = candidates.find(Array.isArray);
  return (firstArray ?? []).filter((item): item is KeapContactCandidate => Boolean(item) && typeof item === "object");
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function getContactId(contact: KeapContactCandidate): number | undefined {
  return parseKeapId(contact.id ?? contact.contact_id ?? contact.contactId);
}

export function extractContactEmails(contact: KeapContactCandidate): string[] {
  const emails = new Set<string>();
  const direct = [contact.email, contact.email_address, contact.emailAddress];

  for (const value of direct) {
    if (typeof value === "string") emails.add(normalizeEmail(value));
  }

  const emailAddresses = contact.email_addresses;
  if (Array.isArray(emailAddresses)) {
    for (const item of emailAddresses) {
      if (!item || typeof item !== "object") continue;
      const record = item as Record<string, unknown>;
      for (const value of [record.email, record.email_address, record.emailAddress, record.address]) {
        if (typeof value === "string") emails.add(normalizeEmail(value));
      }
    }
  }

  return [...emails];
}

export function selectExactEmailContact(response: unknown, submittedEmail: string): ContactSelection {
  const normalizedSubmitted = normalizeEmail(submittedEmail);
  const matches = extractContactArray(response).filter((contact) => {
    const id = getContactId(contact);
    return typeof id === "number" && extractContactEmails(contact).includes(normalizedSubmitted);
  });

  if (matches.length === 0) {
    return { status: "not_found" };
  }

  if (matches.length > 1) {
    return { status: "duplicate", count: matches.length };
  }

  const contact = matches[0];
  const contactId = getContactId(contact);

  if (typeof contactId !== "number") {
    return { status: "not_found" };
  }

  return { status: "selected", contact, contactId };
}

export async function findKeapContactByEmail({
  email,
  config,
  fetchImpl,
}: {
  email: string;
  config?: KeapClientConfig;
  fetchImpl?: typeof fetch;
}): Promise<ContactSelection> {
  const searchParams = new URLSearchParams();
  searchParams.set("filter", `email==${email}`);
  // Keap v2 docs use `fields`; some tenants still honor `optional_properties`.
  const contactFields = "id,email_addresses,tag_ids,custom_fields,create_time,given_name,family_name";
  searchParams.set("fields", contactFields);
  searchParams.set("optional_properties", contactFields);

  const response = await keapFetchJson<unknown>({ path: "contacts", searchParams, config, fetchImpl });
  const selection = selectExactEmailContact(response, email);

  if (selection.status === "not_found" && extractContactArray(response).length === 1) {
    throw new KeapRequestError(
      "UNEXPECTED_RESPONSE",
      "Keap returned one contact but did not confirm the submitted email address.",
      502,
    );
  }

  return selection;
}
