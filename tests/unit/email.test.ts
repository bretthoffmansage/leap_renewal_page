import { describe, expect, it } from "vitest";
import { normalizeEmailInput, validateEmailInput } from "../../lib/validation/email";

describe("email validation", () => {
  it("trims and lowercases submitted emails", () => {
    expect(normalizeEmailInput("  PERSON@Example.COM  ")).toBe("person@example.com");
  });

  it("accepts a basic valid email", () => {
    expect(validateEmailInput(" Person@Example.com ")).toEqual({ ok: true, email: "person@example.com" });
  });

  it("rejects malformed email input", () => {
    expect(validateEmailInput("not-an-email")).toMatchObject({ ok: false, code: "EMAIL_INVALID" });
  });
});
