import { describe, expect, it } from "vitest";
import { buildKeapUrl, getKeapClientConfig } from "../../lib/keap/client";
import { parseKeapId, parseKeapIdArray } from "../../lib/keap/ids";
import { extractContactEmails, getContactId, selectExactEmailContact } from "../../lib/keap/lookup-by-email";

describe("Keap client helpers", () => {
  it("normalizes base URLs without duplicating the Keap API path", () => {
    const config = getKeapClientConfig({ KEAP_ACCESS_TOKEN: "token", KEAP_BASE_URL: "https://api.infusionsoft.com" });
    expect(config.baseUrl).toBe("https://api.infusionsoft.com/crm/rest/v2");
    expect(buildKeapUrl("contacts", config).toString()).toBe("https://api.infusionsoft.com/crm/rest/v2/contacts");
  });
});

describe("Keap id parsing", () => {
  it("accepts numeric and string identifiers from Keap REST v2", () => {
    expect(parseKeapId(123)).toBe(123);
    expect(parseKeapId("123")).toBe(123);
    expect(parseKeapId(" 456 ")).toBe(456);
    expect(parseKeapId("abc")).toBeUndefined();
    expect(parseKeapIdArray(["3097", 999, "bad"])).toEqual([3097, 999]);
    expect(parseKeapIdArray("3097,999")).toEqual([3097, 999]);
  });
});

describe("Keap contact selection", () => {
  it("extracts email addresses from supported shapes", () => {
    expect(
      extractContactEmails({
        email_addresses: [{ email: "PERSON@example.com" }, { email_address: "other@example.com" }],
      }),
    ).toEqual(["person@example.com", "other@example.com"]);
  });

  it("selects a unique exact email match", () => {
    const result = selectExactEmailContact(
      { contacts: [{ id: 1, email_addresses: [{ email: "person@example.com" }] }] },
      "person@example.com",
    );

    expect(result).toMatchObject({ status: "selected", contactId: 1 });
  });

  it("selects contacts when Keap returns string ids (REST v2)", () => {
    expect(getContactId({ id: "42" })).toBe(42);

    const result = selectExactEmailContact(
      { contacts: [{ id: "42", email_addresses: [{ email: "person@example.com" }] }] },
      "person@example.com",
    );

    expect(result).toMatchObject({ status: "selected", contactId: 42 });
  });

  it("does not quietly choose between duplicate exact matches", () => {
    const result = selectExactEmailContact(
      {
        contacts: [
          { id: 1, email_addresses: [{ email: "person@example.com" }] },
          { id: 2, email_addresses: [{ email: "person@example.com" }] },
        ],
      },
      "person@example.com",
    );

    expect(result).toEqual({ status: "duplicate", count: 2 });
  });
});
