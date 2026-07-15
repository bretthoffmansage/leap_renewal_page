export type EmailValidationResult =
  | { ok: true; email: string }
  | { ok: false; code: "EMAIL_REQUIRED" | "EMAIL_TOO_LONG" | "EMAIL_INVALID"; message: string };

const MAX_EMAIL_LENGTH = 254;
const BASIC_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmailInput(value: string): string {
  return value.trim().toLowerCase();
}

export function validateEmailInput(value: unknown): EmailValidationResult {
  if (typeof value !== "string") {
    return { ok: false, code: "EMAIL_REQUIRED", message: "Email address is required." };
  }

  const email = normalizeEmailInput(value);

  if (!email) {
    return { ok: false, code: "EMAIL_REQUIRED", message: "Email address is required." };
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    return { ok: false, code: "EMAIL_TOO_LONG", message: "Email address is too long." };
  }

  if (!BASIC_EMAIL_PATTERN.test(email)) {
    return { ok: false, code: "EMAIL_INVALID", message: "Enter a valid email address." };
  }

  return { ok: true, email };
}
