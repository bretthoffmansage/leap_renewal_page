import { afterEach, describe, expect, it } from "vitest";
import { POST as lookupPost } from "../../app/api/renewal-lookup/route";
import { POST as destinationPost } from "../../app/api/renewal-destination/route";
import { resetRateLimitForTests } from "../../lib/security/rate-limit";

describe("API route contracts", () => {
  afterEach(() => {
    delete process.env.KEAP_ACCESS_TOKEN;
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
});
