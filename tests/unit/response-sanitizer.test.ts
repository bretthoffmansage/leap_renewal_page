import { describe, expect, it } from "vitest";
import { maskEmail, toPublicAccountSummary } from "../../lib/security/response-sanitizer";
import type { NormalizedKeapAccount } from "../../lib/keap/types";

describe("response sanitizer", () => {
  it("masks the local part of an email address", () => {
    expect(maskEmail("jane.smith@example.com")).toBe("j****@example.com");
  });

  it("creates a limited public account summary", () => {
    const account: NormalizedKeapAccount = {
      inputEmail: "jane@example.com",
      contactId: 12345,
      identity: {
        firstName: "Jane",
        lastName: "Smith",
        emails: ["jane@example.com"],
        phones: ["555-111-2222"],
        addresses: [{ street: "Private" }],
      },
      profile: { createTime: "2023-04-01T00:00:00.000Z" },
      appliedTags: [{ id: 3097, name: "Status - LEAP - Active Member" }],
      customFields: [{ id: 1, fieldName: "PrivateField", value: "secret" }],
      notes: [{ body: "private note" }],
      derived: {
        leapActive: true,
        leapCohort: "Cohort 3",
        podNumber: "Pod 7",
        memberSince: "2023",
        tveAttendance: [],
        obvioLinks: [{ label: "private", url: "https://example.com" }],
      },
      warnings: [],
    };

    expect(toPublicAccountSummary(account)).toEqual({
      displayName: "Jane Smith",
      maskedEmail: "j***@example.com",
      membershipStatus: "Active LEAP",
      cohort: "Cohort 3",
      podNumber: "Pod 7",
      memberSince: "2023",
    });
  });
});
