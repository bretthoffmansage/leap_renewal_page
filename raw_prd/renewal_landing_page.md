Product Requirements Document

LEAP Membership Renewal Finder

Document status: Initial implementation specification
Application type: Single-page Next.js web application
Hosting: Vercel
Primary integration: Keap / Infusionsoft REST API v2
Database: None for Version 1
Optional future backend: Convex
Audience: Existing LEAP members who need to locate the correct membership renewal page

⸻

1. Product Summary

The LEAP Membership Renewal Finder is a simple web application that helps an existing LEAP member locate the correct renewal page for their account.

The member enters the email address associated with their LEAP membership. The application securely searches Keap for the matching contact, retrieves the relevant account information, and asks the member to confirm that the account is theirs.

After confirmation, the application determines which of nine cohort-specific renewal links applies to the member and presents a button linking to the correct renewal page.

During the initial implementation, all successfully confirmed contacts will be assigned to the Cohort 1 renewal page. The cohort-classification logic will be added later after the appropriate Keap fields, tags, or other account parameters are finalized.

The entire experience must occur on one page. The interface changes between states without navigating among separate internal pages.

⸻

2. Product Goals

The application must:

1. Allow a LEAP member to search for their account using an email address.
2. Retrieve the corresponding account from Keap.
3. Present enough information for the member to recognize and confirm the account.
4. Allow the member to reject the result and begin again.
5. Determine the appropriate renewal destination from account information.
6. Present the appropriate renewal page as a clear call-to-action button.
7. Return to its initial state whenever the browser page is refreshed.
8. Avoid storing member information unless a future requirement makes storage necessary.
9. Keep the Keap access token and all Keap requests entirely server-side.
10. Be easy to deploy and maintain on Vercel.

⸻

3. Version 1 Decision: No Convex

Convex is not required for the initial version.

Version 1 has no requirement to:

* Create user accounts.
* Save searches.
* Persist a member’s progress.
* Maintain an application-side contact database.
* Record renewal confirmations.
* Create an admin dashboard.
* Synchronize Keap records.
* Store routing rules outside the codebase.
* Resume a session after a refresh.

The Next.js application can use a server-side Route Handler to query Keap. The browser will call the application’s own endpoint, and that endpoint will call Keap using the server-side access token.

Next.js Route Handlers support custom server request handlers inside the App Router, and Vercel deploys this server-side functionality as Vercel Functions. Sensitive environment variables can remain available only to server-side code. (Next.js)

Convex should be reconsidered later if the product needs:

* Editable routing rules.
* Search or confirmation audit logs.
* Renewal-attempt tracking.
* Staff review tools.
* Manual account overrides.
* Analytics tied to individual members.
* Keap response caching.
* Persistent verification sessions.
* A staff-facing admin panel.

⸻

4. Primary User Story

As an existing LEAP member, I want to enter the email address associated with my account, confirm the account the system finds, and receive the correct renewal link so that I do not have to determine which renewal page applies to me.

⸻

5. User Experience Overview

The application consists of one public URL and one visible page.

The page moves through the following interface states:

1. Email Entry
2. Retrieving Account
3. Account Found
4. Account Not Found
5. Retrieval Error
6. Account Confirmed
7. Renewal Link Ready

These are interface states within the same page. They are not separate Next.js pages or routes.

A separate internal API endpoint may be used for the Keap lookup, but the user will remain on the same visible page throughout the process.

⸻

6. Single-Page State Flow

State 1: Email Entry

This is the default state whenever the page first loads or is refreshed.

Visible elements

* LEAP branding.
* Page heading.
* Brief instruction.
* Email input.
* Confirm button.

Suggested copy

Heading: Find Your LEAP Renewal Page

Instruction: Enter the email address connected to your LEAP membership.

Input label: Email address

Primary button: Confirm Email

Behavior

* The email input is required.
* The email must pass basic email-format validation.
* Leading and trailing spaces must be removed.
* The email should be converted to lowercase before lookup.
* Pressing Enter should perform the same action as pressing the Confirm Email button.
* The form must prevent repeated submissions while a request is active.
* No previous account result may be visible in this state.

⸻

State 2: Retrieving Account

This state appears immediately after the member submits a valid email address.

Visible elements

* Loading indicator.
* Status message.

Required copy

Retrieving account…

Behavior

* The email field and submit button are hidden or disabled.
* The lookup request is sent to the application’s server endpoint.
* The member cannot submit another lookup until the current request succeeds, fails, or is reset.
* The page must not navigate.
* The browser URL must not contain the entered email address.
* The email must not be placed in a query string.

⸻

State 3: Account Found

This state appears when exactly one valid Keap contact has been selected.

Visible elements

* Account information panel.
* Confirmation question.
* Confirm button.
* Deny button.
* Reset button.

Suggested copy

Heading: Is this your account?

Primary button: Yes, This Is My Account

Secondary button: No, Start Over

Initial development behavior

During development, the account panel may render the full normalized API response so the implementation team can evaluate which fields should be used.

Public-production behavior

Before public launch, the member-facing account panel must display only a limited account-recognition summary, such as:

* First and last name.
* Masked email address.
* Membership status.
* LEAP cohort, when available.
* Pod number, when useful.
* Member-since year.
* A limited set of non-sensitive membership identifiers.

The public page must not expose unrestricted Keap information such as:

* Internal notes.
* Full street addresses.
* Complete phone numbers.
* Birth dates.
* Billing information.
* Internal staff comments.
* Lead-source information.
* UTM history.
* Private Obvio magic links.
* Other sensitive custom-field values.

Confirm behavior

When the member confirms the account:

1. The application assigns a destination using the routing function.
2. In Version 1, the routing function always assigns Cohort 1.
3. The interface moves to the Account Confirmed state.
4. No immediate automatic redirect occurs.

Deny behavior

When the member selects No, Start Over:

1. The account information is removed from browser state.
2. The submitted email is removed from browser state.
3. The routing result is removed.
4. The application returns to the Email Entry state.
5. The email input is blank and ready for use.

⸻

State 4: Account Not Found

This state appears when no Keap contacts match the submitted email.

Suggested copy

Heading: We couldn’t find that account

Message: Check that you entered the same email address used for your LEAP membership.

Visible actions

* Try Again
* Reset

Both actions may return the interface to the Email Entry state.

The previous email may optionally remain in the input after Try Again, but Reset must clear it.

The system must not disclose whether an email belongs to some other Sage program.

⸻

State 5: Retrieval Error

This state appears when Keap cannot complete the request.

Error categories

* Invalid application configuration.
* Unauthorized Keap token.
* Insufficient Keap permissions.
* Keap rate limit.
* Keap service failure.
* Request timeout.
* Unexpected response format.
* Internal application error.

Member-facing copy

The public interface should use a generic message:

We couldn’t retrieve your account right now. Please try again.

Do not expose:

* Access tokens.
* Raw Keap errors.
* Stack traces.
* Internal endpoint paths.
* Contact IDs.
* Vercel deployment details.

Available actions

* Try Again
* Reset

⸻

State 6: Account Confirmed

This state indicates that the member has confirmed the returned account.

Required behavior

The system runs the renewal-routing function against the retrieved account information.

For Version 1:

All confirmed accounts → Cohort 1 renewal URL

Suggested copy

Heading: Your renewal page is ready

Message: Use the button below to continue to your LEAP renewal page.

⸻

State 7: Renewal Link Ready

Visible elements

* Go to Renewal Page button.
* Reset button.
* Optional display of the assigned cohort.

Primary button

Go to Renewal Page

Version 1 destination

https://leap.sagehub.com/cohort-1-renewal-2026

Redirect behavior

* The redirect occurs only after the member deliberately presses the button.
* The link may open in the same browser tab.
* The destination URL must come from the server-approved routing configuration.
* The browser must never be allowed to provide an arbitrary redirect URL.
* The application must not automatically redirect immediately after account confirmation.

Reset behavior

The Reset button must:

* Clear the email.
* Clear the account information.
* Clear the selected destination.
* Clear all errors.
* Return the interface to the Email Entry state.
* Avoid a full-page navigation unless needed.

⸻

7. Refresh and Session Behavior

The page must always open in the Email Entry state.

Refreshing the browser must clear:

* Submitted email.
* Loading state.
* Contact result.
* Confirmation state.
* Selected cohort.
* Renewal URL.
* Error messages.
* Any other progression through the flow.

The application must not use the following for flow persistence in Version 1:

* localStorage
* sessionStorage
* Cookies
* URL query parameters
* URL fragments
* Convex
* Another database

All progression should exist only in temporary React component state.

⸻

8. Renewal Destinations

The application must contain the following allowlisted destinations:

Cohort	Renewal URL
Cohort 1	https://leap.sagehub.com/cohort-1-renewal-2026
Cohort 2	https://leap.sagehub.com/cohort-2-renewal-2026
Cohort 3	https://leap.sagehub.com/cohort-3-renewal-2026
Cohort 4	https://leap.sagehub.com/cohort-4-renewal-2026
Cohort 5	https://leap.sagehub.com/cohort-5-renewal-2026
Cohort 6	https://leap.sagehub.com/cohort-6-renewal-2026
Cohort 7	https://leap.sagehub.com/cohort-7-renewal-2026
Cohort 8	https://leap.sagehub.com/cohort-8-renewal-2026
Cohort 9	https://leap.sagehub.com/cohort-9-renewal-2026

The URLs should be represented in one central, typed configuration object.

Example conceptual structure:

export const RENEWAL_DESTINATIONS = {
  1: "https://leap.sagehub.com/cohort-1-renewal-2026",
  2: "https://leap.sagehub.com/cohort-2-renewal-2026",
  3: "https://leap.sagehub.com/cohort-3-renewal-2026",
  4: "https://leap.sagehub.com/cohort-4-renewal-2026",
  5: "https://leap.sagehub.com/cohort-5-renewal-2026",
  6: "https://leap.sagehub.com/cohort-6-renewal-2026",
  7: "https://leap.sagehub.com/cohort-7-renewal-2026",
  8: "https://leap.sagehub.com/cohort-8-renewal-2026",
  9: "https://leap.sagehub.com/cohort-9-renewal-2026",
} as const;

No destination supplied by Keap or the browser may be used directly without validation against this allowlist.

⸻

9. Routing Logic

Routing logic must be isolated in a dedicated server-side function.

Suggested function contract:

type RenewalCohort = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type RoutingDecision = {
  cohort: RenewalCohort;
  url: string;
  reasonCode: string;
};
function determineRenewalDestination(
  account: NormalizedKeapAccount
): RoutingDecision;

Version 1 rule

return {
  cohort: 1,
  url: RENEWAL_DESTINATIONS[1],
  reasonCode: "V1_DEFAULT_ALL_CONTACTS_TO_COHORT_1",
};

Future routing candidates

The final classification rules may consider:

* LEAPCohort custom field.
* LEAP membership tags.
* Payment option.
* Membership status.
* Join or create date.
* Renewal tags.
* Cohort-specific tags.
* Pod number.
* A combination of fields with precedence rules.
* Manual exception or override fields.

Routing logic must not be embedded directly in React components.

⸻

10. Technical Architecture

Frontend

* Next.js App Router.
* TypeScript.
* React Client Component for the interactive state machine.
* One visible application page.
* Responsive layout.
* Accessible form controls.
* No client-side Keap credentials.
* No persistent browser storage.

Server

* Next.js Route Handler.
* Node.js runtime.
* Server-side Keap client.
* Server-side email lookup and contact enrichment.
* Server-side routing decision.
* cache: "no-store" for Keap requests.
* Environment-based configuration.
* Structured error handling.

Next.js pages are Server Components by default, while interactive state and event handlers belong in Client Components. API keys and third-party API access should remain in server-side code. (Next.js)

Deployment

* Vercel project connected to the source repository.
* Production, Preview, and Development environment variables configured separately.
* Automatic deployment from the chosen production branch.
* Preview deployments may use a test Keap token or test-access restrictions.

Vercel supports environment-specific variables and makes them available during builds or function execution. Changes to Vercel environment variables apply to new deployments rather than already-created deployments. (Vercel)

⸻

11. Suggested Project Structure

app/
  api/
    renewal-lookup/
      route.ts
  page.tsx
  layout.tsx
  globals.css
components/
  renewal-finder/
    RenewalFinder.tsx
    EmailEntry.tsx
    RetrievingAccount.tsx
    AccountReview.tsx
    AccountNotFound.tsx
    LookupError.tsx
    RenewalReady.tsx
lib/
  keap/
    client.ts
    lookup-by-email.ts
    enrich-contact.ts
    normalize-contact.ts
    tag-catalog.ts
    contact-model.ts
    types.ts
  renewal/
    destinations.ts
    determine-destination.ts
    types.ts
  security/
    rate-limit.ts
    response-sanitizer.ts
  validation/
    email.ts
types/
  api.ts

This structure is a recommendation rather than a strict visual requirement.

⸻

12. Environment Variables

Required

KEAP_ACCESS_TOKEN

Optional

KEAP_BASE_URL
KEAP_ACTIVE_LEAPER_TAG_ID
KEAP_CONTACT_MODEL_URL
ENABLE_RAW_KEAP_DEBUG

Recommended defaults

KEAP_BASE_URL=https://api.infusionsoft.com/crm/rest/v2
KEAP_ACTIVE_LEAPER_TAG_ID=3097
ENABLE_RAW_KEAP_DEBUG=false

Security requirements

* KEAP_ACCESS_TOKEN must never use the NEXT_PUBLIC_ prefix.
* The token must never be returned in an API response.
* The token must never be logged.
* The token must not appear in browser source code.
* The token must not be committed to Git.
* Local development should use .env.local.
* Production should use Vercel project environment variables.

Next.js exposes variables to browser bundles only when they are deliberately made public, most commonly through the NEXT_PUBLIC_ prefix. Variables not exposed this way can remain server-only. (Next.js)

⸻

13. Internal API Contract

Endpoint

POST /api/renewal-lookup

Request body

{
  "email": "person@example.com"
}

Successful development response

{
  "ok": true,
  "inputEmail": "person@example.com",
  "account": {
    "contactId": 12345,
    "contact": {},
    "appliedTags": [],
    "customFields": [],
    "notes": [],
    "derived": {},
    "warnings": []
  }
}

At the account-review stage, the API should not yet return a usable renewal URL. The renewal destination should be generated only after account confirmation or retained as an internal server-side decision.

Public account-review response

The final public response should be reduced to a safe shape:

{
  "ok": true,
  "account": {
    "displayName": "Jane Smith",
    "maskedEmail": "j***@example.com",
    "membershipStatus": "Active LEAP",
    "cohort": "Cohort 3",
    "memberSince": "2023"
  }
}

Not-found response

{
  "ok": false,
  "code": "CONTACT_NOT_FOUND",
  "message": "No matching membership account was found."
}

Recommended HTTP status:

404

Duplicate response

{
  "ok": false,
  "code": "MULTIPLE_CONTACTS_FOUND",
  "message": "More than one account matched this email."
}

A duplicate must not be selected arbitrarily unless the exact-match resolution logic produces one clearly superior match.

Rate-limited response

{
  "ok": false,
  "code": "RATE_LIMITED",
  "message": "Please wait before trying again."
}

Recommended HTTP status:

429

Configuration failure

{
  "ok": false,
  "code": "SERVICE_CONFIGURATION_ERROR",
  "message": "The account service is unavailable."
}

Recommended HTTP status:

503

⸻

14. Keap Lookup Process

Step A: Validate and normalize email

The server must:

1. Confirm the body is valid JSON.
2. Confirm email is a string.
3. Trim whitespace.
4. Convert the email to lowercase.
5. Validate its basic structure.
6. Reject unreasonable input lengths.
7. Reject unexpected additional data when practical.

Step B: Resolve the contact by email

Request:

GET /contacts

Parameters:

filter=email==person@example.com
optional_properties=email_addresses,tag_ids,custom_fields,create_time

The value must be encoded using URL search parameters rather than concatenated manually.

Step C: Select an exact match

Keap may return zero, one, or multiple contacts.

Selection order:

1. Extract all supported contact arrays from the response.
2. Inspect each contact’s returned email addresses.
3. Compare normalized returned addresses to the normalized submitted address.
4. Prefer a unique exact match.
5. If there is one result and its email data confirms the address, select it.
6. If multiple exact matches remain, return a duplicate-contact result or apply a separately documented deterministic rule.
7. Never quietly select the first record merely because it appears first.

Step D: Retrieve the full contact

Request:

GET /contacts/{contactId}

Use the supplied optional-property list:

email_addresses,
phone_numbers,
addresses,
custom_fields,
job_title,
social_accounts,
company,
contact_type,
source_type,
owner_id,
leadsource_id,
create_time,
update_time,
notes,
website,
utm_parameters,
billing_information,
fax_numbers,
preferred_name,
middle_name,
prefix,
suffix,
birth_date,
anniversary_date,
spouse_name,
time_zone,
origin,
tag_ids,
groups,
links,
created_by,
last_updated_by,
account_id,
assistant_name,
assistant_phone,
preferred_locale,
referral_code,
score_value

Step E: Resolve tag names

1. Retrieve the /tags catalog.
2. Follow Keap pagination.
3. Map the contact’s tag_ids to tag names and metadata.
4. Represent unresolved IDs as Unknown tag.
5. The tag catalog may be cached briefly within a server instance, but the lookup response itself must not be publicly cached.

Step F: Load contact-field metadata

Retrieve:

https://api.infusionsoft.com/crm/rest/v2/contacts/model

Use the model to map each custom-field ID to its field name or label.

The Keap API origin and route construction must avoid duplicating /crm/rest/v2 in the URL.

Step G: Load notes

Retrieve:

GET /contacts/{contactId}/notes

Notes are best-effort enrichment.

If notes fail:

* Return the contact.
* Add a warning.
* Do not fail the entire lookup.

Notes must not be displayed on the public member-facing page.

Step H: Normalize the result

The server should produce one predictable internal model regardless of minor Keap response-shape differences.

⸻

15. Normalized Internal Account Shape

type NormalizedKeapAccount = {
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
  appliedTags: Array<{
    id: number;
    name: string;
    category?: unknown;
  }>;
  customFields: Array<{
    id: string | number;
    fieldName?: string;
    label?: string;
    value: unknown;
  }>;
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

The raw field must be disabled in production unless access to the application is restricted to authorized internal staff.

⸻

16. Derived Fields

The initial normalizer should attempt to derive:

* Member since.
* Active LEAP status.
* LEAP cohort.
* Payment option.
* Pod number.
* TVE attendance.
* Obvio-related links.
* Membership summary.

Active LEAP

Initial rule:

Contact contains tag ID 3097

Approximate tag name:

Status - LEAP - Active Member

Cohort

Search custom fields by normalized field name or label:

LEAPCohort

The exact value format must be recorded during testing. Possible examples might include:

* 1
* Cohort 1
* LEAP Cohort 1
* Another internal label

The routing function must normalize the final format later.

Payment option

Search:

PaymentOption

Pod number

Search:

PodNumber

TVE attendance

Use known TVE attendance tag IDs and supported tag-name patterns.

Obvio links

Identify custom fields whose:

* Name or label contains obvio.
* Value is a valid HTTPS URL.

These links must remain internal unless explicitly approved for member display.

⸻

17. Account Confirmation Architecture

Entering an email address alone is not strong identity verification.

For Version 1, the account-confirmation button means only:

The visitor states that the displayed account belongs to them.

It does not cryptographically prove ownership of the email address.

Because of this, Version 1 must not disclose the full Keap portfolio publicly.

Recommended public-launch enhancement

Before displaying sensitive information or a renewal destination tied to private account status, implement email ownership verification:

1. Member submits email.
2. Server locates the Keap contact.
3. Server sends a short-lived verification link or one-time code to that email.
4. Member opens the link or enters the code.
5. Server marks the temporary lookup session as verified.
6. Account summary and renewal routing become available.

This enhancement would likely require:

* An email delivery service.
* Temporary verification records.
* Signed tokens or Convex storage.
* Expiration and attempt limits.

It may be deferred only if the public result is deliberately limited to low-risk information.

⸻

18. Privacy and Security Requirements

Required

* All Keap calls occur on the server.
* Keap token is stored as a secret environment variable.
* No raw contact data is placed in the URL.
* Keap responses use no-store.
* Application API responses use private, no-store caching headers.
* Member-facing errors remain generic.
* Logs redact email addresses where practical.
* Logs do not contain raw contact records.
* Internal notes never appear publicly.
* Redirect URLs come from a fixed allowlist.
* Input is validated on both client and server.
* Repeated submissions are rate-limited.
* A request timeout is enforced.
* The API accepts only the expected HTTP method.
* Response security headers are configured.
* Preview deployments should not expose production member data without access controls.

Recommended rate limiting

Apply limits by a combination of:

* IP address.
* Normalized email hash.
* Time window.

Suggested starting policy:

5 lookup attempts per IP per 10 minutes
3 lookup attempts per email per 10 minutes

The exact policy may be adjusted after observing legitimate usage.

Do not store plain submitted emails solely for rate limiting. Use a one-way server-side hash where feasible.

Enumeration resistance

The system should not reveal excessive differences among:

* An email that does not exist.
* An email associated with a former member.
* An email associated with a different Sage product.
* An email with an account that is not eligible for renewal.

Public messages should remain limited and deliberate.

⸻

19. Error Handling Requirements

The Keap client must explicitly recognize:

Status	Meaning	Application response
400	Invalid Keap request	Log sanitized details; show generic failure
401	Invalid or expired token	Mark service unavailable
403	Token lacks required access	Mark service unavailable
404	Requested Keap resource unavailable	Handle according to lookup stage
429	Keap rate limit	Return retry-later response
500–599	Keap service error	Show temporary failure
Timeout	Request exceeded allowed duration	Show temporary failure

No automatic retry is required in the first implementation.

A later version may use conservative retry behavior for:

* 429
* 502
* 503
* 504

Any retry must be bounded and must not cause duplicate user submissions.

⸻

20. Loading and Performance

Requirements

* The loading state must appear immediately.
* The page must remain responsive during lookup.
* The submit button must not generate duplicate requests.
* Keap requests that can run concurrently should do so after the contact ID is known.
* Nonessential enrichment failures must not prevent a successful result.
* The server should enforce an overall request timeout.
* The account result should not be cached in the browser or CDN.

Suggested enrichment sequence

Sequential:

1. Resolve contact from email.
2. Determine contact ID.

Then parallelize:

* Full contact.
* Contact model.
* Notes.
* Tag catalog.

If the tag catalog is safely cached server-side, reuse it rather than retrieving it for every request.

⸻

21. Accessibility Requirements

* Every input must have a visible label.
* Buttons must use descriptive text.
* Loading state must use an accessible live region.
* Error messages must be associated with the email input where applicable.
* Keyboard-only operation must be supported.
* Focus should move appropriately when states change.
* Color must not be the only indicator of an error or successful state.
* The account review panel must have a clear heading.
* Buttons must maintain visible focus states.
* The design must support mobile zoom and readable type.

⸻

22. Responsive Design Requirements

The application must work on:

* Mobile phones.
* Tablets.
* Desktop browsers.

Suggested layout:

* Centered single-column card.
* Comfortable maximum width.
* Full-width primary button on mobile.
* Side-by-side confirmation controls only when enough width is available.
* Account information arranged in readable sections rather than a raw horizontal table.

The development-only raw response may use a scrollable formatted JSON panel.

⸻

23. Visual Direction

The interface should feel:

* Simple.
* Trustworthy.
* Clear.
* Consistent with LEAP and Sage branding.
* Focused on one action at a time.

Avoid:

* Dashboard-style navigation.
* Multiple competing calls to action.
* Large amounts of explanatory copy.
* Visible technical terminology.
* Displaying raw JSON in production.
* Unnecessary animation.

Suggested page structure:

LEAP/Sage branding
Find Your LEAP Renewal Page
Enter the email connected to your membership.
[ Email address                         ]
[ Confirm Email ]

Each subsequent state replaces the primary card’s contents while retaining the same page shell.

⸻

24. Functional Requirements

FR-1: Default state

The page must load with only the renewal-finder introduction, email input, and submit button.

FR-2: Email validation

The application must reject empty or malformed email input before calling the server.

FR-3: Server-side lookup

The application must call Keap only from server-side code.

FR-4: Loading feedback

The interface must display Retrieving account… while the request is active.

FR-5: Contact enrichment

The server must retrieve and normalize the selected Keap contact, tags, custom fields, and best-effort notes.

FR-6: Account review

The page must present the account result and provide Confirm and Deny actions.

FR-7: Denial reset

Deny must clear the result and return to the blank Email Entry state.

FR-8: Confirmation

Confirm must run the renewal-routing decision and present the renewal call to action.

FR-9: Version 1 routing

Every confirmed contact must be assigned to Cohort 1.

FR-10: Renewal action

Pressing Go to Renewal Page must navigate to the assigned allowlisted URL.

FR-11: Manual reset

A Reset action must be available after a result has been retrieved.

FR-12: Refresh reset

Browser refresh must return the page to its original Email Entry state.

FR-13: Single-page operation

No step in the visible workflow may require navigating to another internal application page.

FR-14: Secure configuration

The Keap token must be provided through a server-only environment variable.

FR-15: Safe response

Production responses must not expose the unrestricted Keap contact portfolio.

⸻

25. Nonfunctional Requirements

Reliability

A failure to retrieve optional notes must not fail an otherwise valid contact lookup.

Maintainability

Keap transport, normalization, routing, and UI state logic must exist in separate modules.

Security

No private credential or unrestricted Keap response may be exposed to the browser without an explicit documented reason.

Observability

Server logs should include:

* Request correlation ID.
* Result category.
* Keap response status.
* Request duration.
* Sanitized warning codes.

Logs should not include:

* Access token.
* Raw contact object.
* Notes.
* Full email address.
* Sensitive custom fields.

Testability

Keap transport should be mockable so the application can be tested without making production API requests.

⸻

26. Suggested UI State Model

type RenewalFinderState =
  | { status: "email-entry" }
  | {
      status: "retrieving";
      email: string;
    }
  | {
      status: "account-found";
      email: string;
      account: PublicAccountSummary;
    }
  | {
      status: "not-found";
      email: string;
    }
  | {
      status: "error";
      email?: string;
      code: string;
    }
  | {
      status: "renewal-ready";
      account: PublicAccountSummary;
      cohort: RenewalCohort;
      renewalUrl: string;
    };

Reset should replace the complete state with:

{ status: "email-entry" }

⸻

27. Duplicate Contact Policy

Duplicate Keap contacts are a known possibility.

Version 1 must follow this policy:

1. Compare every returned email address using normalized exact matching.
2. If exactly one contact matches exactly, select it.
3. If more than one contact matches exactly, do not expose both records publicly.
4. Return a controlled duplicate-account response.
5. Provide a support path or a generic message instructing the member to contact the LEAP team.

A later rule may select among duplicates using:

* Active LEAP tag.
* Most recently updated contact.
* Most complete LEAP metadata.
* A canonical-contact custom field.
* A manual merge or override table.

That later rule must be explicitly documented before implementation.

⸻

28. Development and Production Modes

Development mode

Allowed:

* Render normalized full contact information.
* Render tag and custom-field labels.
* Render sanitized raw JSON.
* Display routing reason codes.
* Display warnings.
* Test known Keap contacts.

Development access should be restricted whenever it connects to production Keap.

Production mode

Required:

* Render only approved account-summary fields.
* Hide raw response.
* Hide notes.
* Hide internal links.
* Hide contact ID.
* Hide routing reason code.
* Use generic error messages.
* Apply rate limiting.
* Apply production security headers.

Suggested environment flag:

ENABLE_RAW_KEAP_DEBUG=false

The code must default to false when the variable is absent.

⸻

29. Testing Requirements

Unit tests

Test:

* Email normalization.
* Email validation.
* Contact-array extraction.
* Exact-match selection.
* Duplicate detection.
* Custom-field label mapping.
* Tag mapping.
* Active LEAP detection.
* Cohort parsing.
* Redirect allowlist.
* Version 1 Cohort 1 routing.
* Response sanitization.
* Reset-state behavior.

Integration tests

Test:

* Successful Keap lookup.
* Contact not found.
* Multiple exact matches.
* Contact enrichment.
* Tags pagination.
* Contact model failure.
* Notes failure.
* Keap 401.
* Keap 403.
* Keap 429.
* Keap 500.
* Request timeout.
* Unexpected Keap response body.

User-interface tests

Test:

* Default page.
* Invalid email.
* Loading state.
* Successful account review.
* Deny behavior.
* Confirm behavior.
* Renewal link behavior.
* Reset behavior.
* Browser refresh.
* Keyboard submission.
* Mobile presentation.
* Double-click protection.

⸻

30. Smoke-Test Checklist

Before deployment:

1. Confirm /tags/3097 works with the configured Keap token.
2. Confirm an email lookup returns the expected contact.
3. Confirm the full contact endpoint returns tag IDs and custom fields.
4. Confirm the complete tag catalog can be paginated.
5. Confirm custom-field model metadata can be retrieved.
6. Confirm notes can be retrieved or safely fail.
7. Confirm the active LEAP tag is detected.
8. Confirm LEAPCohort is discoverable for known members.
9. Confirm the browser never receives the Keap access token.
10. Confirm refresh clears the page state.
11. Confirm Deny clears the page state.
12. Confirm Reset clears the page state.
13. Confirm Confirm assigns Cohort 1.
14. Confirm the displayed renewal button directs to the exact Cohort 1 URL.
15. Confirm arbitrary redirect URLs cannot be injected.
16. Confirm production mode hides raw portfolio data.

⸻

31. Acceptance Criteria for Version 1

Version 1 is complete when all of the following are true:

* The application is deployed to Vercel.
* The application consists of one visible page.
* A member can enter an email and submit it.
* The interface displays Retrieving account….
* The server searches Keap by email.
* The server retrieves and normalizes the matching contact.
* Development mode can display the complete normalized information portfolio.
* The result screen contains Confirm and Deny controls.
* Deny returns to a blank email form.
* Confirm assigns the contact to Cohort 1.
* Confirm reveals a Go to Renewal Page button.
* The button goes to the Cohort 1 renewal URL.
* A Reset button clears the workflow.
* Refreshing the browser returns to the initial state.
* The Keap token is never exposed to the client.
* No Convex project is required.
* Production mode does not expose private Keap information.
* The nine renewal URLs exist in the application’s allowlisted routing configuration.
* The routing function can later be replaced without rewriting the page flow.

⸻

32. Deferred Decisions

The following decisions are intentionally postponed:

1. Which Keap parameter determines the cohort.
2. Whether tags or custom fields take precedence.
3. How duplicate contacts should be resolved automatically.
4. Exactly which account fields members should see.
5. Whether email ownership verification is required.
6. Whether confirmation events should be logged.
7. Whether staff need an admin override interface.
8. Whether members who are not active should receive a different result.
9. Whether ineligible accounts should receive support instructions.
10. Whether the destination should open in the same tab or a new tab.
11. Whether the application should record successful renewal-page clicks.
12. Whether routing rules should later move to Convex.

⸻

33. Recommended Implementation Phases

Phase 1: Keap connection and internal testing

* Create Next.js project.
* Add server-only Keap client.
* Add email lookup.
* Add contact enrichment.
* Add normalized response.
* Display full development payload.
* Confirm known test contacts.

Phase 2: Single-page member flow

* Implement all page states.
* Add loading state.
* Add account confirmation.
* Add denial and reset.
* Add refresh-reset behavior.
* Add Cohort 1 default routing.
* Add all nine allowlisted destinations.

Phase 3: Public-data reduction

* Select approved recognition fields.
* Mask email and other identifiers.
* Remove notes and sensitive fields.
* Disable raw-debug output in production.
* Add safe error messages.

Phase 4: Production hardening

* Add rate limiting.
* Add request timeouts.
* Add structured sanitized logging.
* Add security headers.
* Add automated tests.
* Restrict production-connected preview deployments.
* Complete Vercel deployment checks.

Phase 5: Final cohort routing

* Audit Keap cohort data.
* Define precedence rules.
* Implement normalization.
* Add test fixtures for all nine cohorts.
* Replace Cohort 1 default with finalized classification logic.

⸻

34. Final Architecture Recommendation

Build Version 1 as:

Browser
   ↓
Single Next.js client-side renewal finder
   ↓
POST /api/renewal-lookup
   ↓
Server-side Next.js Route Handler on Vercel
   ↓
Keap REST v2

Use:

* Next.js
* TypeScript
* App Router
* One interactive Client Component
* One or two server Route Handlers
* Vercel environment variables
* Server-side Keap integration
* No database
* No Convex

Add Convex only when the product introduces persistent routing rules, verification sessions, logging, analytics, staff overrides, or other durable application data.