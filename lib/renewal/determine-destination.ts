import type { NormalizedKeapAccount } from "../keap/types";
import { getRenewalDestination } from "./destinations";
import type { RoutingDecision } from "./types";

export function determineRenewalDestination(account: NormalizedKeapAccount): RoutingDecision {
  void account;

  return {
    cohort: 1,
    url: getRenewalDestination(1),
    reasonCode: "V1_DEFAULT_ALL_CONTACTS_TO_COHORT_1",
  };
}
