import { describe, expect, it } from "vitest";
import { normalizeKeapContact } from "../../lib/keap/normalize-contact";

describe("normalizeKeapContact", () => {
  it("maps tags, custom fields, derived fields, and safe defaults", () => {
    const account = normalizeKeapContact({
      inputEmail: "person@example.com",
      contact: {
        id: 123,
        given_name: "Pat",
        family_name: "Member",
        email_addresses: [{ email: "person@example.com" }],
        tag_ids: [3097, 999],
        create_time: "2023-06-01T00:00:00Z",
        custom_fields: [
          { id: 10, value: "Cohort 4" },
          { id: 11, value: "Pod 2" },
          { id: 12, value: "https://obvio.example/link" },
        ],
      },
      contactModel: {
        custom_fields: [
          { id: 10, field_name: "LEAPCohort", label: "LEAP Cohort" },
          { id: 11, field_name: "PodNumber", label: "Pod Number" },
          { id: 12, field_name: "ObvioMagicLink", label: "Obvio Magic Link" },
        ],
      },
      tagCatalog: new Map([
        [3097, { id: 3097, name: "Status - LEAP - Active Member" }],
        [999, { id: 999, name: "TVE 2024 Attendee" }],
      ]),
    });

    expect(account.contactId).toBe(123);
    expect(account.identity.displayName).toBeUndefined();
    expect(account.derived.leapActive).toBe(true);
    expect(account.derived.leapCohort).toBe("Cohort 4");
    expect(account.derived.podNumber).toBe("Pod 2");
    expect(account.derived.memberSince).toBe("2023");
    expect(account.derived.tveAttendance).toEqual(["TVE 2024 Attendee"]);
    expect(account.derived.obvioLinks).toEqual([{ label: "Obvio Magic Link", url: "https://obvio.example/link" }]);
  });

  it("normalizes string contact and tag ids from Keap REST v2", () => {
    const account = normalizeKeapContact({
      inputEmail: "person@example.com",
      contact: {
        id: "123",
        email_addresses: [{ email: "person@example.com" }],
        tag_ids: ["3097", "999"],
        create_time: "2023-06-01T00:00:00Z",
      },
      tagCatalog: new Map([
        [3097, { id: 3097, name: "Status - LEAP - Active Member" }],
        [999, { id: 999, name: "TVE 2024 Attendee" }],
      ]),
    });

    expect(account.contactId).toBe(123);
    expect(account.derived.leapActive).toBe(true);
    expect(account.derived.membershipSummary).toBe("Active LEAP");
    expect(account.derived.tveAttendance).toEqual(["TVE 2024 Attendee"]);
  });
});
