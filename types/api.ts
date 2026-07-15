import type { RoutingDecision } from "../lib/renewal/types";

export type PublicAccountSummary = {
  displayName?: string;
  maskedEmail: string;
  membershipStatus?: string;
  cohort?: string;
  podNumber?: string;
  memberSince?: string;
};

export type LookupErrorCode =
  | "INVALID_REQUEST"
  | "INVALID_EMAIL"
  | "CONTACT_NOT_FOUND"
  | "MULTIPLE_CONTACTS_FOUND"
  | "RATE_LIMITED"
  | "SERVICE_CONFIGURATION_ERROR"
  | "SERVICE_UNAUTHORIZED"
  | "SERVICE_FORBIDDEN"
  | "SERVICE_UNAVAILABLE"
  | "REQUEST_TIMEOUT"
  | "UNEXPECTED_RESPONSE"
  | "INTERNAL_ERROR";

export type LookupSuccessResponse = {
  ok: true;
  inputEmail: string;
  account: PublicAccountSummary;
  warnings?: string[];
};

export type LookupErrorResponse = {
  ok: false;
  code: LookupErrorCode;
  message: string;
  requestId?: string;
};

export type RenewalLookupResponse = LookupSuccessResponse | LookupErrorResponse;

export type RenewalDestinationSuccessResponse = {
  ok: true;
  routing: RoutingDecision;
};

export type RenewalDestinationResponse = RenewalDestinationSuccessResponse | LookupErrorResponse;
