import { beforeEach, describe, expect, it } from "vitest";
import { checkLookupRateLimit, resetRateLimitForTests } from "../../lib/security/rate-limit";

describe("lookup rate limiting", () => {
  beforeEach(() => resetRateLimitForTests());

  it("limits repeated attempts for the same normalized email hash", () => {
    const now = Date.now();
    expect(checkLookupRateLimit({ ip: "1.1.1.1", email: "person@example.com", now })).toEqual({ allowed: true });
    expect(checkLookupRateLimit({ ip: "1.1.1.2", email: "person@example.com", now })).toEqual({ allowed: true });
    expect(checkLookupRateLimit({ ip: "1.1.1.3", email: "person@example.com", now })).toEqual({ allowed: true });
    expect(checkLookupRateLimit({ ip: "1.1.1.4", email: "person@example.com", now })).toMatchObject({ allowed: false });
  });
});
