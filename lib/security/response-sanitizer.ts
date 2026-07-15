import type { NormalizedKeapAccount } from "../keap/types";
import type { PublicAccountSummary } from "../../types/api";

function redactMiddle(value: string): string {
  if (value.length <= 1) {
    return "*";
  }

  return `${value[0]}${"*".repeat(Math.min(value.length - 1, 4))}`;
}

export function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return "masked-email";
  }

  return `${redactMiddle(localPart)}@${domain}`;
}

export function getDisplayName(account: NormalizedKeapAccount): string | undefined {
  const { preferredName, displayName, firstName, lastName } = account.identity;
  const derived = displayName ?? [preferredName ?? firstName, lastName].filter(Boolean).join(" ");
  return derived.trim() || undefined;
}

export function toPublicAccountSummary(account: NormalizedKeapAccount): PublicAccountSummary {
  const primaryEmail = account.identity.emails[0] ?? account.inputEmail;

  return {
    displayName: getDisplayName(account),
    maskedEmail: maskEmail(primaryEmail),
    membershipStatus: account.derived.leapActive ? "Active LEAP" : account.derived.membershipSummary,
    cohort: account.derived.leapCohort,
    podNumber: account.derived.podNumber,
    memberSince: account.derived.memberSince,
  };
}
