import { describe, expect, it } from "vitest";

// @ts-expect-error next.config.mjs is runtime configuration without a generated declaration file.
import nextConfig from "../../next.config.mjs";

type HeaderEntry = { key: string; value: string };

describe("security configuration", () => {
  it("sets baseline response security headers", async () => {
    const headerConfig = await nextConfig.headers?.();
    const values = Object.fromEntries(
      headerConfig?.[0]?.headers.map((header: HeaderEntry) => [header.key, header.value]) ?? [],
    );

    expect(values["X-Content-Type-Options"]).toBe("nosniff");
    expect(values["X-Frame-Options"]).toBe("DENY");
    expect(values["Referrer-Policy"]).toBe("no-referrer");
    expect(values["Permissions-Policy"]).toContain("camera=()");
  });
});
