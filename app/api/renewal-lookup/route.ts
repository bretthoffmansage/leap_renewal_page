import { NextResponse, type NextRequest } from "next/server";
import { getKeapClientConfig, KeapRequestError } from "../../../lib/keap/client";
import { lookupAndNormalizeKeapAccount } from "../../../lib/keap/enrich-contact";
import { validateEmailInput } from "../../../lib/validation/email";
import { toPublicAccountSummary } from "../../../lib/security/response-sanitizer";
import { checkLookupRateLimit } from "../../../lib/security/rate-limit";
import type { LookupErrorCode, LookupErrorResponse, RenewalLookupResponse } from "../../../types/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JSON_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "X-Robots-Tag": "noindex, nofollow",
};

function jsonResponse(body: RenewalLookupResponse, status: number) {
  return NextResponse.json(body, { status, headers: JSON_HEADERS });
}

function errorResponse(code: LookupErrorCode, status: number, requestId: string): NextResponse<LookupErrorResponse> {
  const messages: Record<LookupErrorCode, string> = {
    INVALID_REQUEST: "Invalid request.",
    INVALID_EMAIL: "Enter a valid email address.",
    CONTACT_NOT_FOUND: "No matching membership account was found.",
    MULTIPLE_CONTACTS_FOUND: "More than one account matched this email.",
    RATE_LIMITED: "Please wait before trying again.",
    SERVICE_CONFIGURATION_ERROR: "The account service is unavailable.",
    SERVICE_UNAUTHORIZED: "The account service is unavailable.",
    SERVICE_FORBIDDEN: "The account service is unavailable.",
    SERVICE_UNAVAILABLE: "We couldn’t retrieve your account right now. Please try again.",
    REQUEST_TIMEOUT: "We couldn’t retrieve your account right now. Please try again.",
    UNEXPECTED_RESPONSE: "We couldn’t retrieve your account right now. Please try again.",
    INTERNAL_ERROR: "We couldn’t retrieve your account right now. Please try again.",
  };

  return jsonResponse({ ok: false, code, message: messages[code], requestId }, status) as NextResponse<LookupErrorResponse>;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

function mapErrorToStatus(error: KeapRequestError): number {
  if (error.code === "SERVICE_CONFIGURATION_ERROR") return 503;
  if (error.code === "SERVICE_UNAUTHORIZED") return 503;
  if (error.code === "SERVICE_FORBIDDEN") return 503;
  if (error.code === "RATE_LIMITED") return 429;
  if (error.code === "REQUEST_TIMEOUT") return 504;
  if (error.code === "SERVICE_UNAVAILABLE") return 503;
  return 502;
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_REQUEST", 400, requestId);
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : undefined;
  if (!record || Object.keys(record).some((key) => key !== "email")) {
    return errorResponse("INVALID_REQUEST", 400, requestId);
  }

  const emailResult = validateEmailInput(record.email);
  if (!emailResult.ok) {
    return errorResponse("INVALID_EMAIL", 400, requestId);
  }

  const rateLimit = checkLookupRateLimit({ ip: getClientIp(request), email: emailResult.email });
  if (!rateLimit.allowed) {
    return errorResponse("RATE_LIMITED", 429, requestId);
  }

  try {
    const config = getKeapClientConfig();
    const includeRaw = process.env.ENABLE_RAW_KEAP_DEBUG === "true" && process.env.NODE_ENV !== "production";
    const result = await lookupAndNormalizeKeapAccount({ email: emailResult.email, config, includeRaw });

    if ("status" in result && result.status === "not_found") {
      return errorResponse("CONTACT_NOT_FOUND", 404, requestId);
    }

    if ("status" in result && result.status === "duplicate") {
      return errorResponse("MULTIPLE_CONTACTS_FOUND", 409, requestId);
    }

    return jsonResponse(
      {
        ok: true,
        inputEmail: emailResult.email,
        account: toPublicAccountSummary(result),
        warnings: result.warnings.length ? result.warnings : undefined,
      },
      200,
    );
  } catch (error) {
    if (error instanceof KeapRequestError) {
      return errorResponse(error.code, mapErrorToStatus(error), requestId);
    }

    return errorResponse("INTERNAL_ERROR", 500, requestId);
  }
}
