import "server-only";
import type { KeapClientConfig } from "./client";
import { keapFetchJson, KeapRequestError } from "./client";
import { findKeapContactByEmail } from "./lookup-by-email";
import { normalizeKeapContact } from "./normalize-contact";
import { fetchTagCatalog } from "./tag-catalog";
import type { NormalizedKeapAccount } from "./types";

const FULL_CONTACT_OPTIONAL_PROPERTIES = [
  "email_addresses",
  "phone_numbers",
  "addresses",
  "custom_fields",
  "job_title",
  "social_accounts",
  "company",
  "contact_type",
  "source_type",
  "owner_id",
  "leadsource_id",
  "create_time",
  "update_time",
  "notes",
  "website",
  "utm_parameters",
  "billing_information",
  "fax_numbers",
  "preferred_name",
  "middle_name",
  "prefix",
  "suffix",
  "birth_date",
  "anniversary_date",
  "spouse_name",
  "time_zone",
  "origin",
  "tag_ids",
  "groups",
  "links",
  "created_by",
  "last_updated_by",
  "account_id",
  "assistant_name",
  "assistant_phone",
  "preferred_locale",
  "referral_code",
  "score_value",
].join(",");

function extractNotes(response: unknown): unknown[] {
  if (!response || typeof response !== "object") return [];
  const record = response as Record<string, unknown>;
  const notes = [record.notes, record.data, record.items].find(Array.isArray);
  return notes ?? [];
}

export async function lookupAndNormalizeKeapAccount({
  email,
  config,
  fetchImpl,
  includeRaw = false,
}: {
  email: string;
  config?: KeapClientConfig;
  fetchImpl?: typeof fetch;
  includeRaw?: boolean;
}): Promise<NormalizedKeapAccount | { status: "not_found" } | { status: "duplicate"; count: number }> {
  const selection = await findKeapContactByEmail({ email, config, fetchImpl });

  if (selection.status !== "selected") {
    return selection;
  }

  const fullContactParams = new URLSearchParams();
  fullContactParams.set("optional_properties", FULL_CONTACT_OPTIONAL_PROPERTIES);

  const [fullContact, tagCatalogResult, contactModelResult, notesResult] = await Promise.allSettled([
    keapFetchJson<unknown>({ path: `contacts/${selection.contactId}`, searchParams: fullContactParams, config, fetchImpl }),
    fetchTagCatalog({ config, fetchImpl }),
    keapFetchJson<unknown>({ path: "contacts/model", config, fetchImpl }),
    keapFetchJson<unknown>({ path: `contacts/${selection.contactId}/notes`, config, fetchImpl }),
  ]);

  if (fullContact.status === "rejected") {
    throw fullContact.reason;
  }

  const warnings: string[] = [];
  const tagCatalog = tagCatalogResult.status === "fulfilled" ? tagCatalogResult.value : new Map();
  if (tagCatalogResult.status === "rejected") warnings.push("TAG_CATALOG_UNAVAILABLE");

  const contactModel = contactModelResult.status === "fulfilled" ? contactModelResult.value : undefined;
  if (contactModelResult.status === "rejected") warnings.push("CONTACT_MODEL_UNAVAILABLE");

  let notes: unknown[] = [];
  if (notesResult.status === "fulfilled") {
    notes = extractNotes(notesResult.value);
  } else if (notesResult.reason instanceof KeapRequestError) {
    warnings.push("NOTES_UNAVAILABLE");
  }

  return normalizeKeapContact({
    inputEmail: email,
    contact: fullContact.value,
    tagCatalog,
    contactModel,
    notes,
    includeRaw,
    warnings,
  });
}
