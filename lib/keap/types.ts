export type KeapTagSummary = {
  id: number;
  name: string;
  category?: unknown;
};

export type NormalizedCustomField = {
  id: string | number;
  fieldName?: string;
  label?: string;
  value: unknown;
};

export type NormalizedKeapAccount = {
  inputEmail: string;
  contactId: number;
  identity: {
    firstName?: string;
    lastName?: string;
    preferredName?: string;
    displayName?: string;
    emails: string[];
    phones: string[];
    addresses: unknown[];
  };
  profile: {
    company?: unknown;
    jobTitle?: string;
    website?: string;
    contactType?: unknown;
    sourceType?: unknown;
    createTime?: string;
    updateTime?: string;
    origin?: unknown;
    timeZone?: string;
  };
  appliedTags: KeapTagSummary[];
  customFields: NormalizedCustomField[];
  notes: unknown[];
  derived: {
    memberSince?: string;
    leapActive: boolean;
    leapCohort?: string;
    paymentOption?: string;
    podNumber?: string;
    tveAttendance: string[];
    obvioLinks: Array<{
      label: string;
      url: string;
    }>;
    membershipSummary?: string;
  };
  warnings: string[];
  raw?: {
    contact: unknown;
    notes: unknown;
    model?: unknown;
  };
};
