import { describe, expect, it } from "vitest";
import { RENEWAL_DESTINATIONS, isAllowlistedRenewalUrl } from "../../lib/renewal/destinations";
import { determineRenewalDestination } from "../../lib/renewal/determine-destination";
import type { NormalizedKeapAccount } from "../../lib/keap/types";

const account: NormalizedKeapAccount = {
  inputEmail: "person@example.com",
  contactId: 123,
  identity: { emails: ["person@example.com"], phones: [], addresses: [] },
  profile: {},
  appliedTags: [],
  customFields: [],
  notes: [],
  derived: { leapActive: true, tveAttendance: [], obvioLinks: [] },
  warnings: [],
};

describe("renewal routing", () => {
  it("contains all nine allowlisted cohort URLs", () => {
    expect(Object.keys(RENEWAL_DESTINATIONS)).toHaveLength(9);
    expect(RENEWAL_DESTINATIONS[1]).toBe("https://leap.sagehub.com/cohort-1-renewal-2026");
    expect(RENEWAL_DESTINATIONS[9]).toBe("https://leap.sagehub.com/cohort-9-renewal-2026");
  });

  it("defaults every Version 1 account to Cohort 1", () => {
    expect(determineRenewalDestination(account)).toEqual({
      cohort: 1,
      url: RENEWAL_DESTINATIONS[1],
      reasonCode: "V1_DEFAULT_ALL_CONTACTS_TO_COHORT_1",
    });
  });

  it("rejects arbitrary non-allowlisted URLs", () => {
    expect(isAllowlistedRenewalUrl("https://evil.example/redirect")).toBe(false);
    expect(isAllowlistedRenewalUrl(RENEWAL_DESTINATIONS[4])).toBe(true);
  });
});
