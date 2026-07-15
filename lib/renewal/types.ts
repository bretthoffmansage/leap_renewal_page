export type RenewalCohort = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type RoutingDecision = {
  cohort: RenewalCohort;
  url: string;
  reasonCode: "V1_DEFAULT_ALL_CONTACTS_TO_COHORT_1" | string;
};
