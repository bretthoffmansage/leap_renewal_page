# PRD_SOURCE

## Document purpose

This file is the operational source version of the raw PRD for the **LEAP Membership Renewal Finder**. It preserves the user-supplied product intent in a structured, citeable form for planning, execution, package expansion, audit, hardening, fidelity uplift, and design work.

Raw source used: `raw_prd/renewal_landing_page.md`.

---

## Project identity

### Project name
LEAP Membership Renewal Finder

### One-sentence definition
A single-page Next.js web application that lets an existing LEAP member enter their membership email, confirm the matched Keap account, and receive the correct allowlisted LEAP renewal URL.

### Product category
Public membership-support utility / server-integrated renewal finder.

### Core identity rule
The product is a focused one-page renewal lookup flow backed by server-side Keap access. It is **not** a user-account system, admin dashboard, CRM replacement, persistent member database, Convex app, or generalized routing-rule editor for Version 1.

### Implementation implication
Implementation should prioritize a narrow, secure, maintainable Next.js App Router application with server-only Keap integration, temporary React state, and a replacement-friendly routing function.

---

## Strategic principles

### PRD-01 — Strategic principle set

#### SP-01 — One visible page
All member-facing workflow states happen on one public page. Internal API routes are allowed, but the visible user journey must not navigate among internal pages.

#### SP-02 — Server-side Keap boundary
All Keap calls and the Keap access token stay on the server. Browser code calls only the application API.

#### SP-03 — No persistence in Version 1
Version 1 must not persist progress, submitted emails, contact results, routing decisions, or sessions in localStorage, sessionStorage, cookies, URL parameters, Convex, or another database.

#### SP-04 — Safe public disclosure
Production member-facing responses and UI must expose only approved recognition fields, not unrestricted Keap portfolio data, notes, internal links, billing data, private fields, or raw errors.

#### SP-05 — Allowlisted routing only
Renewal URLs must come from a central typed allowlist. Neither Keap nor the browser may directly supply an arbitrary redirect URL.

#### SP-06 — Maintainable separation
Keap transport, lookup, normalization, routing, security/sanitization, validation, and UI state logic should be separate modules rather than embedded together.

#### SP-07 — Cohort 1 default for Version 1
All confirmed contacts route to Cohort 1 in Version 1. Final cohort classification is explicitly deferred.

### Implementation implication
When uncertain, prefer the simplest secure Version 1 flow over persistent infrastructure, admin tooling, or premature cohort intelligence.

---

## Core users and roles

### PRD-02 — Core users and roles

#### Primary user groups
- Existing LEAP members trying to locate their correct renewal page.
- LEAP/Sage operators or implementation team members testing Keap field availability during development.

#### Role definitions
##### LEAP member
A visitor who enters the email associated with their LEAP membership and confirms whether the displayed account summary belongs to them.

##### Implementation/operator user
A trusted internal person who may need development-mode visibility into normalized Keap payloads to identify future routing fields.

### Implementation implication
The public flow must be safe for unauthenticated visitors. Any development/raw portfolio visibility must be disabled by default and treated as restricted when connected to production Keap.

---

## Canonical entity hierarchy

### PRD-03 — Canonical entity hierarchy

#### Required hierarchy
1. Submitted email input.
2. Keap contact candidates.
3. Selected exact-match Keap contact.
4. Normalized internal account model.
5. Public account summary.
6. Routing decision.
7. Allowlisted renewal destination.

#### Definitions
##### Submitted email
Trimmed and lowercased user input validated on both client and server.

##### Keap contact
The source CRM record retrieved from Keap REST API v2.

##### NormalizedKeapAccount
Server-side internal representation that may include contact identity, profile, tags, custom fields, notes, derived fields, warnings, and optionally raw data in restricted debug mode.

##### PublicAccountSummary
Reduced safe shape for member review, such as display name, masked email, membership status, cohort if available, member-since year, and limited non-sensitive identifiers.

##### RenewalCohort
A typed cohort value from 1 through 9.

##### RoutingDecision
A server-approved object containing cohort, allowlisted URL, and internal reason code.

### Implementation implication
The browser should receive public summaries and routing outputs only, not unrestricted source objects except in explicitly guarded development debug mode.

---

## Core workflows

### PRD-04 — Core workflow lifecycle

#### Workflow stages
1. Email Entry.
2. Retrieving Account.
3. Account Found.
4. Account Not Found.
5. Retrieval Error.
6. Account Confirmed.
7. Renewal Link Ready.

#### Required transitions
- Page load and refresh always start at Email Entry.
- Valid submit transitions to Retrieving Account without putting the email in the URL.
- Successful exact match transitions to Account Found with account-review controls.
- No match transitions to Account Not Found.
- Keap/config/service failure transitions to Retrieval Error with generic member-facing copy.
- Deny, Reset, or equivalent start-over action clears browser state and returns to Email Entry.
- Confirm runs the routing function, assigns Cohort 1 in Version 1, and shows the renewal CTA without automatic redirect.
- Pressing Go to Renewal Page navigates only to the assigned allowlisted URL.

### Implementation implication
A small explicit client-side state machine should control page states. Progression should live only in React component state.

---

## Source-of-truth model

### PRD-05 — Source-of-truth rules

#### Canonical source(s) of truth
- Keap is the source of truth for member contact data.
- Code-owned typed renewal destination configuration is the source of truth for Version 1 renewal URLs.
- Code-owned routing function is the source of truth for Version 1 cohort assignment.

#### Derived/read-model behavior
Normalized accounts, public summaries, derived fields, warnings, and routing decisions are computed at request time and not persisted in Version 1.

#### Duplication rules
The app must not create a shadow member database, durable confirmation log, routing-rule datastore, or browser-persistent session in Version 1.

### Implementation implication
Architecture should integrate with Keap and compute transient responses rather than introducing Convex or another persistence layer.

---

## Collaboration and editing model

### PRD-06 — Collaboration model

Version 1 has no collaborative editing, staff dashboard, or role-based admin workflow.

#### Editable vs suggest-only boundaries
- Routing configuration is code-owned in Version 1.
- Keap data remains externally managed in Keap.
- Members do not edit account data in this app.

### Implementation implication
Do not build admin CRUD, editable rules, override tooling, or staff workflows during Version 1 unless later explicitly authorized.

---

## Permissions and access model

### PRD-07 — Permissions and access model

#### Access boundaries
- Public visitors may access the one-page renewal finder.
- Public visitors must not receive the Keap token or unrestricted Keap data.
- Development raw-debug output must default off and should be restricted whenever connected to production Keap.
- Preview deployments should not expose production member data without access controls.

#### Identity verification caveat
Entering an email and clicking confirmation is not strong identity verification. Version 1 may proceed only if displayed public information remains deliberately low-risk. Email ownership verification is a recommended future enhancement before exposing sensitive information.

### Implementation implication
Treat disclosure minimization as structural, not cosmetic. Use production-safe response sanitization by default.

---

## Product surfaces

### PRD-08 — Primary product surfaces

#### Surface list
- Single public renewal-finder page.
- Internal `POST /api/renewal-lookup` endpoint.
- Server-side Keap integration modules.
- Renewal destination and routing modules.
- Validation/security/sanitization modules.

#### Notes per surface
##### Single public page
Hosts the entire visible state machine and responsive accessible form/card UI.

##### Internal API endpoint
Accepts a JSON email body, validates and normalizes it, resolves the Keap contact, returns success/not-found/duplicate/rate-limited/config/error responses with no-store caching.

##### Keap modules
Handle REST v2 base URL construction, contact search, exact-match selection, full contact retrieval, tag catalog pagination, contact model lookup, notes enrichment, and normalization.

##### Routing modules
Contain nine allowlisted URLs and a server-side `determineRenewalDestination` function defaulting all contacts to Cohort 1.

### Implementation implication
Keep the product surface small but production-shaped enough that future cohort routing can replace the default without rewriting the page flow.

---

## Technical architecture direction

### PRD-09 — Technical architecture direction

#### Architecture posture
Next.js App Router, TypeScript, React Client Component for the interactive state machine, Next.js Route Handler for server lookup, Node.js runtime, and Vercel deployment.

#### Important technical constraints
- One visible page.
- Server-only Keap token in `KEAP_ACCESS_TOKEN` with no `NEXT_PUBLIC_` prefix.
- `cache: "no-store"` for Keap requests and private no-store headers for application API responses.
- No database / no Convex in Version 1.
- Keap transport must be mockable for tests.
- Request timeout and structured sanitized error handling are required.
- Basic response security headers should be configured.

#### Integration posture
Integrate with Keap as the source CRM; do not replicate Keap. Keep optional Convex reconsideration for future persistence needs.

### Implementation implication
Scaffold a maintainable Next.js app directly in the shell project root, preserving server/client boundaries and deployment suitability for Vercel.

---

## Data and persistence expectations

### PRD-10 — Data model and persistence expectations

#### Important data concepts
- Email validation and normalization.
- Exact-match contact selection and duplicate handling.
- `NormalizedKeapAccount` internal model.
- `PublicAccountSummary` safe response model.
- Derived fields: member-since, active LEAP, LEAP cohort, payment option, pod number, TVE attendance, Obvio links, membership summary.
- `RoutingDecision` and allowlisted destination configuration.

#### Persistence expectations
No application-side persistence in Version 1. All progression is temporary React state; all server results are transient request/response data.

#### Migration sensitivity
There is no Version 1 schema migration. Future Convex or database introduction would be a major architectural change and must be explicitly scoped.

### Implementation implication
Prefer pure functions, typed structures, and request-scoped data over storage-heavy architecture.

---

## External integrations

### PRD-11 — Integration direction

#### Expected integrations
- Keap / Infusionsoft REST API v2 — **scaffold/build now**, requiring `KEAP_ACCESS_TOKEN` supplied by operator/Vercel.
- Vercel hosting and environment variables — **requires user setup after build**.
- Optional future Convex — **explicitly deferred**.
- Optional future email verification service — **explicitly deferred**.

#### Integration philosophy
Keep secrets server-side; build integration modules that can fail safely and be tested without production API calls.

### Implementation implication
The shell can build the Keap integration surface and environment validation now, but live Keap smoke tests requiring real credentials are post-build/operator tasks unless credentials are already provided safely.

---

## Non-functional requirements

### PRD-12 — Non-functional requirements

#### Stability requirements
- Optional notes enrichment failure must not fail an otherwise valid lookup.
- Rate-limited, unauthorized, service-failure, timeout, and malformed responses must be handled explicitly.
- No automatic retry is required in Version 1.

#### Performance requirements
- Loading state appears immediately.
- Duplicate submissions are prevented.
- Request timeout is enforced.
- After resolving contact ID, enrichment requests that can run concurrently should do so.
- Lookup responses are not browser/CDN cached.

#### Security / safety requirements
- No token, raw errors, stack traces, internal endpoint paths, contact IDs, notes, internal links, or sensitive fields exposed publicly.
- Logs redact full emails and avoid raw contact records.
- Repeated submissions are rate-limited by IP and normalized email hash where feasible.
- Input validation on client and server.
- Redirect URL allowlist.
- Security headers.

#### Accessibility / responsive requirements
- Visible labels, descriptive buttons, accessible live region, associated errors, keyboard operation, focus management, visible focus states, readable mobile type, zoom support, responsive single-column card layout.

#### Testability requirements
Unit, integration, UI, and smoke-test coverage should cover email validation, contact selection, duplicate detection, mappings, routing, sanitization, reset behavior, error categories, and key UI states.

### Implementation implication
Validation and tests are part of the product requirements, not optional polish.

---

## Stack or implementation assumptions

### PRD-13 — Stack guidance

#### Explicitly specified stack
- Next.js App Router.
- TypeScript.
- React Client Component.
- Next.js Route Handler.
- Node.js runtime.
- Vercel.
- Keap REST API v2.
- No Convex / no database for Version 1.

#### Existing codebase stack
At intake, the repository is a ForgeShell workspace without an application scaffold.

### Implementation implication
The first implementation package should create the Next.js/TypeScript project foundation in the current root without adding persistence.

---

## Deferred or intentionally out-of-scope areas

### PRD-14 — Explicitly deferred work

#### Out of scope now
- Convex database or any other persistent app database.
- User accounts.
- Saved searches.
- Progress/session persistence.
- Admin dashboard.
- Keap synchronization database.
- Editable routing rules.
- Search/confirmation/click audit logs tied to members.
- Staff review/manual override tools.
- Email ownership verification.
- Final cohort classification logic beyond the Cohort 1 default.
- Automatic duplicate-contact resolution beyond exact unique matching.

#### Future expansion areas
- Final cohort routing based on Keap custom fields/tags and precedence rules.
- Email verification flow.
- Staff-facing override/review tooling.
- Analytics or renewal-click tracking.
- Convex-backed persistent routing rules or verification sessions.

### Implementation implication
Early packages must avoid overbuilding durable infrastructure and must keep deferred items visible for final audit rather than silently implementing them.

---

## Ambiguities and unresolved items

### PRD-15 — Known ambiguities

- Exact public account-recognition fields are not finalized.
- Whether email ownership verification is required before public launch remains a future decision.
- Which Keap parameter determines final cohort is unresolved.
- Tags vs custom fields precedence is unresolved.
- Automatic duplicate-contact resolution is unresolved beyond returning a controlled duplicate response.
- Same-tab vs new-tab renewal behavior is left open; same-tab is acceptable in Version 1.
- Whether ineligible/former/non-LEAP accounts receive support instructions is unresolved.
- Whether production-connected preview deployments require a separate access-control layer depends on deployment environment choices.

### Rule for later phases
These ambiguities should be narrowed safely where possible, deferred honestly where appropriate, and escalated only if they block a required Version 1 implementation decision.

---

## Canonical implementation bias

### PRD-16 — Canonical implementation bias

When the shell must choose among plausible implementation directions, prefer:

- Secure transient request/response flow over persisted state.
- Server-side integration boundaries over client-side convenience.
- Explicit typed modules over page-level monoliths.
- Public-safe summaries over broad data exposure.
- Cohort 1 default routing over speculative cohort intelligence.
- Environment-driven configuration over hardcoded secrets.
- Tests and mockable Keap transport over live-production-only verification.

Avoid bias toward:

- Convex/database introduction in Version 1.
- Admin dashboards or staff workflows before public member flow.
- Raw JSON exposure in production.
- Arbitrary redirect handling.
- Selecting duplicate Keap records by list order.

---

## Quick reference map

### Appendix A — Quick reference map

#### Most important sections for everyday decisions
- PRD-01 — Strategic principle set.
- PRD-04 — Core workflow lifecycle.
- PRD-08 — Primary product surfaces.
- PRD-14 — Explicitly deferred work.

#### Most important sections for architecture decisions
- PRD-05 — Source-of-truth rules.
- PRD-09 — Technical architecture direction.
- PRD-10 — Data model and persistence expectations.
- PRD-11 — Integration direction.
- PRD-12 — Non-functional requirements.

#### Most important sections for future expansion
- PRD-14 — Explicitly deferred work.
- PRD-15 — Known ambiguities.
- PRD-16 — Canonical implementation bias.

---

## Source normalization note

### Appendix B — Source normalization note

#### Raw source inputs used
- `raw_prd/renewal_landing_page.md` via canonical raw PRD intake.

#### Normalization choices made
- The raw PRD's numbered sections were consolidated into stable PRD anchors focused on execution usefulness.
- Development-mode raw visibility was preserved as a controlled, non-production capability rather than a public behavior.
- Final cohort routing, email verification, Convex, admin tooling, and analytics were recorded as deferred rather than included in Version 1 scope.

#### Important caveats
- Live Keap verification depends on real credentials and safe target-environment setup.
- Deployment to Vercel requires operator project/environment configuration after code is buildable.
