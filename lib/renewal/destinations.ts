import type { RenewalCohort } from "./types";

export const RENEWAL_DESTINATIONS = {
  1: "https://leap.sagehub.com/cohort-1-renewal-2026",
  2: "https://leap.sagehub.com/cohort-2-renewal-2026",
  3: "https://leap.sagehub.com/cohort-3-renewal-2026",
  4: "https://leap.sagehub.com/cohort-4-renewal-2026",
  5: "https://leap.sagehub.com/cohort-5-renewal-2026",
  6: "https://leap.sagehub.com/cohort-6-renewal-2026",
  7: "https://leap.sagehub.com/cohort-7-renewal-2026",
  8: "https://leap.sagehub.com/cohort-8-renewal-2026",
  9: "https://leap.sagehub.com/cohort-9-renewal-2026",
} as const satisfies Record<RenewalCohort, string>;

export function isRenewalCohort(value: unknown): value is RenewalCohort {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 9;
}

export function getRenewalDestination(cohort: RenewalCohort): string {
  return RENEWAL_DESTINATIONS[cohort];
}

export function isAllowlistedRenewalUrl(url: string): boolean {
  return Object.values(RENEWAL_DESTINATIONS).includes(url as (typeof RENEWAL_DESTINATIONS)[RenewalCohort]);
}
