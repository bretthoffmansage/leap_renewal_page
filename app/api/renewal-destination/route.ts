import { NextResponse, type NextRequest } from "next/server";
import { determineRenewalDestination } from "../../../lib/renewal/determine-destination";
import type { NormalizedKeapAccount } from "../../../lib/keap/types";
import type { RenewalDestinationResponse } from "../../../types/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JSON_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "X-Robots-Tag": "noindex, nofollow",
};

function placeholderAccount(): NormalizedKeapAccount {
  return {
    inputEmail: "confirmed@example.invalid",
    contactId: 0,
    identity: { emails: ["confirmed@example.invalid"], phones: [], addresses: [] },
    profile: {},
    appliedTags: [],
    customFields: [],
    notes: [],
    derived: { leapActive: true, tveAttendance: [], obvioLinks: [] },
    warnings: [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const account = body && typeof body === "object" ? (body as Record<string, unknown>).account : undefined;
    if (!account || typeof account !== "object") {
      return NextResponse.json(
        { ok: false, code: "INVALID_REQUEST", message: "Invalid request." } satisfies RenewalDestinationResponse,
        { status: 400, headers: JSON_HEADERS },
      );
    }
  } catch {
    return NextResponse.json(
      { ok: false, code: "INVALID_REQUEST", message: "Invalid request." } satisfies RenewalDestinationResponse,
      { status: 400, headers: JSON_HEADERS },
    );
  }

  return NextResponse.json(
    { ok: true, routing: determineRenewalDestination(placeholderAccount()) } satisfies RenewalDestinationResponse,
    { status: 200, headers: JSON_HEADERS },
  );
}
