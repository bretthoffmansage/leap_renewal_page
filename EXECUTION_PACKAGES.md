# EXECUTION_PACKAGES

## EP-00 — Global execution model

Allowed package statuses: `draft`, `ready`, `in_progress`, `blocked`, `needs_review`, `complete`.

Every package must confirm scope, consult PRD anchors, run relevant checks, log evidence in `agent_runs/`, perform closeout, commit completed work, and verify a clean tree before the next package begins.

Material PRD commitments are represented below as package scope, intentional deferment, or ambiguity. Deferred future scope includes final cohort classification, Convex/database persistence, email ownership verification, admin tooling, durable analytics/logging, and automatic duplicate resolution beyond controlled duplicate response.

---

## Package group A: Application foundation

This group creates the buildable Next.js application baseline needed before product logic can exist.

---

## WP-1.1 — Scaffold Next.js App Router foundation

**Status:** complete  
**Priority:** critical  
**Depends on:** none  
**Blocks:** WP-1.2, WP-2.1, WP-3.1, WP-4.1  
**Human approval required:** no  
**Data migration involved:** no

### Purpose
Create a minimal buildable Next.js/TypeScript application in the current shell root.

### Why now
The audit found no application scaffold, package manifest, app routes, or build scripts.

### PRD anchors
- PRD-09 — Technical architecture direction
- PRD-13 — Stack guidance
- PRD-16 — Canonical implementation bias

### Current-state anchors
- CURRENT_STATE_AUDIT §1, §3, §15
- MASTER_ROADMAP MR-06

### Scope
- Add package manifest, lockfile, Next/React/TypeScript dependencies, and scripts.
- Add TypeScript, Next, lint config, and baseline app files.
- Add `app/layout.tsx`, `app/page.tsx`, `app/globals.css` with a minimal non-final page shell.
- Preserve ForgeShell runtime files.

### Out of scope
- Keap API logic.
- Renewal state machine.
- Production hardening.
- Deployment to Vercel.

### Preconditions
- Git baseline is clean.
- No app scaffold exists.

### Likely files / systems involved
- `package.json`, package lockfile.
- `next.config.*`, `tsconfig.json`, ESLint config.
- `app/` files.

### Sensitive systems
- Root repo layout shared with ForgeShell files.

### Allowed actions
- Install app dependencies.
- Create minimal app scaffold.
- Run install/build/lint/typecheck where available.

### Forbidden actions
- Add secrets or `.env.local` values.
- Remove ForgeShell control files.
- Add Convex/database infrastructure.

### Required checks
- `npm install` or equivalent succeeds.
- `npm run build` succeeds.
- `npm run lint` succeeds if configured.

### Regression checks
- `git status` and shell control files remain present.
- No secrets are introduced.

### Definition of done
A buildable Next.js TypeScript app scaffold exists and the package is logged, committed, and clean.

### Completion evidence
- Build/lint command output.
- Package run log.
- Git commit hash and clean-tree verification.

### Notes for future package expansion
Future packages can replace the placeholder page with the actual renewal finder.

---

## Package group B: Typed domain foundation

This group builds pure, testable modules before networked Keap work or UI state dependence.

---

## WP-1.2 — Add typed renewal, validation, API, and sanitizer modules

**Status:** ready  
**Priority:** critical  
**Depends on:** WP-1.1  
**Blocks:** WP-2.1, WP-3.1  
**Human approval required:** no  
**Data migration involved:** no

### Purpose
Create the typed pure-function foundation for Version 1 renewal lookup.

### Why now
Keap API and UI packages need stable types, email validation, safe responses, and allowlisted routing.

### PRD anchors
- PRD-03 — Canonical entity hierarchy
- PRD-05 — Source-of-truth rules
- PRD-08 — Primary product surfaces
- PRD-10 — Data model and persistence expectations
- PRD-12 — Non-functional requirements

### Current-state anchors
- CURRENT_STATE_AUDIT §7, §8, §9, §15
- MASTER_ROADMAP MR-07

### Scope
- Add email validation/normalization helper.
- Add renewal destination allowlist for cohorts 1–9.
- Add `determineRenewalDestination` defaulting all accounts to Cohort 1.
- Add internal/public account and API response types.
- Add public-summary sanitization helpers including email masking.
- Add unit tests for pure helpers.

### Out of scope
- Live Keap fetches.
- Route handler implementation.
- Client UI state machine.

### Preconditions
- WP-1.1 complete.

### Likely files / systems involved
- `lib/validation/email.ts`
- `lib/renewal/*`
- `lib/keap/types.ts`, `lib/keap/contact-model.ts`
- `lib/security/response-sanitizer.ts`
- `types/api.ts`
- Test setup/files.

### Sensitive systems
- Public response shape and redirect allowlist.

### Allowed actions
- Add pure TypeScript modules and tests.
- Add test tooling if absent.

### Forbidden actions
- Query Keap.
- Add secrets.
- Persist submitted email/contact data.

### Required checks
- Unit tests for validation/routing/sanitization pass.
- Build/typecheck passes.
- Lint passes where configured.

### Regression checks
- Renewal destination URLs exactly match PRD allowlist.
- Cohort 1 default reason code is present.

### Definition of done
Typed pure modules exist, are tested, and provide stable contracts for API/UI work.

### Completion evidence
- Test/build/lint output.
- Package run log.
- Commit and clean-tree verification.

### Notes for future package expansion
Future final-routing package can replace only `determineRenewalDestination` internals while preserving the contract.

---

## Package group C: Server-side Keap lookup

This group creates the sensitive server-only API and integration layer.

---

## WP-2.1 — Implement server-side Keap lookup API

**Status:** ready  
**Priority:** critical  
**Depends on:** WP-1.2  
**Blocks:** WP-3.1, WP-4.1  
**Human approval required:** no for mocked/local implementation; conditional for live Keap smoke tests  
**Data migration involved:** no

### Purpose
Build the `POST /api/renewal-lookup` endpoint and supporting Keap modules with safe server-only behavior.

### Why now
The member UI depends on a safe API contract and Keap must remain server-side.

### PRD anchors
- PRD-01 — SP-02, SP-04
- PRD-08 — Primary product surfaces
- PRD-09 — Technical architecture direction
- PRD-11 — Integration direction
- PRD-12 — Non-functional requirements
- PRD-15 — Known ambiguities

### Current-state anchors
- CURRENT_STATE_AUDIT §9, §12, §14, §15
- MASTER_ROADMAP MR-08

### Scope
- Add `app/api/renewal-lookup/route.ts` with `POST` only.
- Validate JSON body and normalized email server-side.
- Add Keap client with server-only token usage, base URL defaults, timeout, and `cache: "no-store"`.
- Implement `/contacts` search using `URLSearchParams` and exact-match contact selection.
- Implement full contact, tag catalog, contact model, and notes enrichment helpers.
- Normalize internal account shape with warnings and derived fields.
- Return controlled not-found, duplicate, rate-limited, configuration, unauthorized, service, timeout, and unexpected responses.
- Ensure app API responses use private no-store headers.
- Add mock-based tests for API/server helper behavior.

### Out of scope
- Real Keap credential setup or live production data mutation.
- Final cohort classification beyond default.
- UI state machine.
- Persistent audit logs.

### Preconditions
- WP-1.2 complete.
- No required live secrets are committed.

### Likely files / systems involved
- `app/api/renewal-lookup/route.ts`
- `lib/keap/client.ts`
- `lib/keap/lookup-by-email.ts`
- `lib/keap/enrich-contact.ts`
- `lib/keap/normalize-contact.ts`
- `lib/keap/tag-catalog.ts`
- `lib/security/rate-limit.ts`
- `types/api.ts`

### Sensitive systems
- Server-side secret handling.
- CRM/member data disclosure.
- Error logging and API response shape.

### Allowed actions
- Implement mocked/testable server modules.
- Add env example/documentation without real token.

### Forbidden actions
- Commit `KEAP_ACCESS_TOKEN`.
- Run live Keap calls without safe credentials/environment confirmation.
- Expose raw Keap portfolio data publicly by default.
- Persist member lookup data.

### Required checks
- Build/typecheck passes.
- Tests for server helpers/API behavior pass.
- Lint passes where configured.

### Regression checks
- Token is never referenced in client components.
- API route rejects non-POST methods by default Next behavior or explicit handler absence.
- Duplicate contacts are not selected arbitrarily.

### Definition of done
The server API can be validated through tests/mocks and is ready for UI integration. Live Keap smoke tests may remain documented operator tasks if credentials are not available.

### Completion evidence
- Test/build/lint output.
- Package run log including environment safety note.
- Commit and clean-tree verification.

### Notes for future package expansion
If Keap response shapes differ during live testing, update normalization narrowly and record observed fixtures without sensitive data.

---

## Package group D: Member-facing one-page flow

This group builds the visible renewal finder on top of the API and typed modules.

---

## WP-3.1 — Implement accessible single-page renewal finder UI

**Status:** ready  
**Priority:** critical  
**Depends on:** WP-2.1  
**Blocks:** WP-4.1  
**Human approval required:** no  
**Data migration involved:** no

### Purpose
Create the full one-page member flow and visual interface.

### Why now
The API contract and routing modules are available; the member-facing value can now be implemented safely.

### PRD anchors
- PRD-04 — Core workflow lifecycle
- PRD-07 — Permissions and access model
- PRD-08 — Primary product surfaces
- PRD-12 — Non-functional requirements
- PRD-16 — Canonical implementation bias

### Current-state anchors
- CURRENT_STATE_AUDIT §6, §10, §11, §15
- MASTER_ROADMAP MR-09

### Scope
- Add `components/renewal-finder/` client component(s).
- Implement Email Entry, Retrieving Account, Account Found, Account Not Found, Retrieval Error, and Renewal Link Ready UI states.
- Add client email validation, trimming/lowercasing, Enter submit, duplicate-submit prevention.
- Implement Confirm, Deny, Try Again, Reset, and Go to Renewal Page behaviors.
- Ensure refresh naturally resets to initial state by using only React state.
- Provide responsive LEAP/Sage-branded styling and accessible labels/live regions/focus states.
- Keep account display to safe public summary fields.

### Out of scope
- Live Keap credential setup.
- Final cohort routing.
- Browser or database persistence.
- Admin/support workflows.

### Preconditions
- WP-2.1 complete.

### Likely files / systems involved
- `app/page.tsx`
- `app/globals.css`
- `components/renewal-finder/*`
- `types/api.ts`

### Sensitive systems
- Client/server data boundary.
- Public account display.
- Redirect behavior.

### Allowed actions
- Build UI and client fetch logic.
- Add UI tests if tooling is present/practical.

### Forbidden actions
- Store flow state in localStorage/sessionStorage/cookies/query/query fragment.
- Display notes/raw contact/internal links/contact ID in production UI.
- Automatically redirect after confirmation.

### Required checks
- Build/typecheck passes.
- Lint passes.
- Relevant tests pass.
- Manual/static verification of no browser persistence APIs for flow state.

### Regression checks
- API route remains server-only.
- Allowlisted Cohort 1 URL remains unchanged.
- Reset and Deny clear state to blank Email Entry.

### Definition of done
The full single-page flow is implemented and validates locally without requiring live Keap credentials.

### Completion evidence
- Build/lint/test output.
- Package run log.
- Commit and clean-tree verification.

### Notes for future package expansion
A later design pass may refine visual quality without changing workflow semantics.

---

## Package group E: Production safety and deployment readiness

This group hardens the completed Version 1 flow before audit and closeout.

---

## WP-4.1 — Add production safety hardening, docs, and test coverage

**Status:** ready  
**Priority:** high  
**Depends on:** WP-3.1  
**Blocks:** final audit and hardening phases  
**Human approval required:** conditional for live Keap/Vercel smoke tests  
**Data migration involved:** no

### Purpose
Add the safety, documentation, and validation coverage needed for Version 1 deployment readiness.

### Why now
The core app exists; hardening should target the real implementation before final execution audit.

### PRD anchors
- PRD-12 — Non-functional requirements
- PRD-14 — Explicitly deferred work
- PRD-15 — Known ambiguities
- PRD-16 — Canonical implementation bias

### Current-state anchors
- CURRENT_STATE_AUDIT §13, §14, §15
- MASTER_ROADMAP MR-10 and MR-11

### Scope
- Ensure rate limiting is in place and does not store plain emails.
- Ensure timeout/no-store/security header behavior is covered.
- Ensure debug/raw output defaults off and is documented.
- Add or improve tests for critical validation, routing, API, and UI state behavior.
- Add `.env.example` and README sections for Keap/Vercel setup and smoke-test checklist.
- Document deferred decisions and operator-dependent live smoke tests.

### Out of scope
- Actual Vercel deployment.
- Live Keap production data smoke tests unless safe credentials are already configured and explicitly confirmed.
- Final cohort classification.
- Email verification implementation.
- Convex/database/admin/analytics systems.

### Preconditions
- WP-3.1 complete.

### Likely files / systems involved
- `README.md`
- `.env.example`
- `next.config.*`
- `lib/security/*`
- tests and package scripts.

### Sensitive systems
- Env docs/secrets.
- Logs and member data.
- Security headers.

### Allowed actions
- Add docs and tests.
- Strengthen safe defaults.
- Run local build/lint/test.

### Forbidden actions
- Commit real tokens.
- Deploy or mutate external services without explicit safe setup.
- Introduce persistence contrary to Version 1.

### Required checks
- Build passes.
- Lint passes.
- Tests pass.
- Static grep confirms no `NEXT_PUBLIC_KEAP_ACCESS_TOKEN` or committed token value.

### Regression checks
- Renewal flow still works with mocked API paths/tests.
- Cohort 1 default remains intact.
- No browser persistence APIs introduced for flow state.

### Definition of done
The Version 1 codebase has safety docs/checks/tests sufficient for final audit, with live external smoke tests documented as operator tasks if not run.

### Completion evidence
- Build/lint/test output.
- Package run log.
- Commit and clean-tree verification.

### Notes for future package expansion
Post-package hardening may add additional fixes found by final audit without broad feature expansion.

---

## EP-99 — Explicit deferred and out-of-scope commitments

The following material PRD items are intentionally deferred beyond Version 1 and must be restated in final audit if still deferred:

- Final cohort routing based on Keap tags/custom fields and precedence rules.
- Email ownership verification.
- Convex/database-backed persistent sessions, logs, analytics, or routing rules.
- Admin dashboard, staff review, and manual override tools.
- Automatic duplicate-contact resolution beyond controlled duplicate response.
- Production Vercel project creation and real Keap credential provisioning, unless the operator separately supplies safe setup.
