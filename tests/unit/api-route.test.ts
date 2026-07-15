import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as lookupPost } from "../../app/api/renewal-lookup/route";
import { POST as destinationPost } from "../../app/api/renewal-destination/route";
import { resetRateLimitForTests } from "../../lib/security/rate-limit";

describe("API route contracts", () => {
  afterEach(() => {
    delete process.env.KEAP_ACCESS_TOKEN;
    delete process.env.KEAP_BASE_URL;
    vi.unstubAllGlobals();
    resetRateLimitForTests();
  });

  it("rejects malformed lookup JSON", async () => {
    const response = await lookupPost(
      new Request("http://localhost/api/renewal-lookup", { method: "POST", body: "not-json" }) as never,
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({ ok: false, code: "INVALID_REQUEST" });
  });

  it("maps missing Keap token to a service configuration response", async () => {
    const response = await lookupPost(
      new Request("http://localhost/api/renewal-lookup", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "10.0.0.1" },
        body: JSON.stringify({ email: "person@example.com" }),
      }) as never,
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({ ok: false, code: "SERVICE_CONFIGURATION_ERROR" });
  });

  it("returns a public-safe successful lookup without exposing routing or raw Keap data", async () => {
    process.env.KEAP_ACCESS_TOKEN = "test-token";
    process.env.KEAP_BASE_URL = "https://api.infusionsoft.com/crm/rest/v2";

    const fetchMock = vi.fn(async (input: URL | RequestInfo) => {
      const url = input.toString();

      if (url.includes("/contacts?") && url.includes("filter=email%3D%3Dperson%40example.com")) {
        // Keap REST v2 returns string ids; production was 502ing when only numbers were accepted.
        return jsonResponse({ contacts: [{ id: "123", email_addresses: [{ email: "person@example.com" }] }] });
      }

      if (url.endsWith("/contacts/123?optional_properties=email_addresses%2Cphone_numbers%2Caddresses%2Ccustom_fields%2Cjob_title%2Csocial_accounts%2Ccompany%2Ccontact_type%2Csource_type%2Cowner_id%2Cleadsource_id%2Ccreate_time%2Cupdate_time%2Cnotes%2Cwebsite%2Cutm_parameters%2Cbilling_information%2Cfax_numbers%2Cpreferred_name%2Cmiddle_name%2Cprefix%2Csuffix%2Cbirth_date%2Canniversary_date%2Cspouse_name%2Ctime_zone%2Corigin%2Ctag_ids%2Cgroups%2Clinks%2Ccreated_by%2Clast_updated_by%2Caccount_id%2Cassistant_name%2Cassistant_phone%2Cpreferred_locale%2Creferral_code%2Cscore_value")) {
        return jsonResponse({
          id: 123,
          given_name: "Jane",
          family_name: "Member",
          email_addresses: [{ email: "person@example.com" }],
          tag_ids: [3097],
          create_time: "2023-01-01T00:00:00Z",
          custom_fields: [{ id: 10, value: "Cohort 2" }],
          notes: [{ body: "should not reach browser" }],
        });
      }

      if (url.endsWith("/tags")) {
        return jsonResponse({ tags: [{ id: 3097, name: "Status - LEAP - Active Member" }] });
      }

      if (url.endsWith("/contacts/model")) {
        return jsonResponse({ custom_fields: [{ id: 10, field_name: "LEAPCohort", label: "LEAP Cohort" }] });
      }

      if (url.endsWith("/contacts/123/notes")) {
        return jsonResponse({ notes: [{ body: "private note" }] });
      }

      throw new Error(`Unexpected URL ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    const response = await lookupPost(
      new Request("http://localhost/api/renewal-lookup", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "10.0.0.2" },
        body: JSON.stringify({ email: " Person@Example.com " }),
      }) as never,
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      inputEmail: "person@example.com",
      account: {
        displayName: "Jane Member",
        maskedEmail: "p****@example.com",
        membershipStatus: "Active LEAP",
        cohort: "Cohort 2",
        memberSince: "2023",
      },
    });
    expect(JSON.stringify(body)).not.toContain("test-token");
    expect(JSON.stringify(body)).not.toContain("private note");
    expect(body).not.toHaveProperty("routing");
  });

  it("returns the server-approved Cohort 1 destination after confirmation", async () => {
    const response = await destinationPost(
      new Request("http://localhost/api/renewal-destination", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ account: { maskedEmail: "p****@example.com" } }),
      }) as never,
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ok: true,
      routing: {
        cohort: 1,
        url: "https://leap.sagehub.com/cohort-1-renewal-2026",
      },
    });
  });

  it("rejects invalid destination confirmation requests", async () => {
    const response = await destinationPost(
      new Request("http://localhost/api/renewal-destination", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }) as never,
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({ ok: false, code: "INVALID_REQUEST" });
  });
});

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
