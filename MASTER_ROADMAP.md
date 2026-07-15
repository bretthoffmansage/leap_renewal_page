# MASTER_ROADMAP

## MR-01 — Roadmap purpose

This roadmap converts `PRD_SOURCE.md` and `CURRENT_STATE_AUDIT.md` into a strategic transformation path for building the LEAP Membership Renewal Finder from a fresh ForgeShell workspace into a deployable Version 1 Next.js application.

---

## MR-02 — Transformation objective

Move from a shell-only repository with a raw PRD into a focused one-page renewal lookup app that:

- Runs on Next.js App Router + TypeScript.
- Keeps Keap credentials and CRM requests server-side.
- Lets members search by email, review a safe account summary, confirm, and deliberately open the Cohort 1 renewal URL.
- Uses no database or browser persistence in Version 1.
- Is secure, testable, and maintainable enough for Vercel deployment.

Grounding: PRD-01, PRD-04, PRD-08, PRD-09, PRD-12; audit sections 1, 3, 6, 15.

---

## MR-03 — Canonical product spine

The canonical product spine is:

1. One public page.
2. Temporary React state machine.
3. `POST /api/renewal-lookup` server route.
4. Server-side Keap lookup/enrichment/normalization.
5. Safe public account summary.
6. Explicit user confirmation.
7. Server-approved routing decision using allowlisted destinations.
8. Deliberate renewal-page button.
9. Reset/refresh clears all progression.

Everything else is supporting infrastructure or deferred future scope.

---

## MR-04 — Strategic principles for sequencing

1. **Scaffold before features:** Create a working Next.js/TypeScript baseline before implementing product modules.
2. **Pure typed foundations before external calls:** Build validation, types, destinations, routing, and sanitization before wiring Keap/network behavior.
3. **Server boundary before UI dependence:** Establish a safe API contract before the client relies on it.
4. **Core member flow before hardening extras:** Build the complete single-page state flow before polishing production hardening.
5. **Safety before deployment:** Add no-store headers, timeout behavior, rate limiting, tests, and deployment docs before final closeout.
6. **Defer explicitly:** Keep Convex, final cohort routing, email verification, admin tools, and analytics out of Version 1 implementation.

---

## MR-05 — Major roadmap chapters

1. Next.js application foundation.
2. Typed domain, validation, routing, and sanitization foundation.
3. Server-side Keap lookup API.
4. Single-page member renewal flow.
5. Production safety, tests, and deployment readiness.
6. Deferred future routing and verification expansion.

---

# MR-06 — Chapter 1: Next.js application foundation

## Purpose
Create the app/runtime baseline in the current root: package manifest, Next.js App Router files, TypeScript config, lint/build scripts, global styling, and a minimal page shell.

## Why this chapter comes first
The audit shows no application scaffold exists. Every product feature depends on a buildable Next.js foundation.

## Primary outcomes
- `package.json`, lockfile, Next/React/TypeScript dependencies, and scripts exist.
- `app/layout.tsx`, `app/page.tsx`, and `app/globals.css` exist.
- Build/lint/typecheck baseline is available.
- Shell files remain intact for lifecycle execution.

## Success condition
The repository can install dependencies and run a baseline Next.js build without product functionality yet.

---

# MR-07 — Chapter 2: Typed domain, validation, routing, and sanitization foundation

## Purpose
Create the pure TypeScript domain modules that define email validation, API shapes, normalized account types, destination allowlist, Cohort 1 routing, public response sanitization, and safe error codes.

## Why this chapter follows Chapter 1
These modules need TypeScript tooling and can be tested before external Keap calls, reducing integration risk.

## Primary outcomes
- Central typed nine-destination allowlist.
- `determineRenewalDestination` returns Cohort 1 for all confirmed accounts.
- Email validation/normalization helpers.
- Internal/public account type definitions.
- Safe public summary and error response helpers.
- Unit tests for pure modules.

## Success condition
Pure modules pass tests and provide stable contracts for API/UI packages.

---

# MR-08 — Chapter 3: Server-side Keap lookup API

## Purpose
Implement the `POST /api/renewal-lookup` server route and Keap modules: env validation, transport, email contact search, exact-match selection, full contact enrichment, tag/model/notes best-effort enrichment, normalization, no-store headers, and safe API responses.

## Why this chapter follows earlier chapters
It depends on TypeScript, validation, typed response shapes, and sanitizer/routing foundations. It also touches sensitive server-side integration code, so it should not be mixed with UI work.

## Primary outcomes
- Server-only Keap client with safe base URL construction and token handling.
- Email lookup via URLSearchParams, exact-match selection, duplicate response policy.
- Full contact, tag catalog, contact model, and notes enrichment with graceful notes failure.
- Normalized account response and safe public response behavior.
- Explicit error mapping for config/auth/rate-limit/service/timeout/unexpected cases.
- Mockable transport and tests for key server logic.

## Success condition
The API can be exercised with mocked Keap behavior and returns safe contract-compliant responses; live Keap smoke tests remain operator-dependent unless credentials are provided.

---

# MR-09 — Chapter 4: Single-page member renewal flow

## Purpose
Build the complete visible one-page renewal finder UI and client state machine.

## Why this chapter follows the API
The UI should consume the stable app API contract rather than inventing backend behavior. Confirmation and renewal CTA depend on typed routing outputs.

## Primary outcomes
- Email Entry, Retrieving Account, Account Found, Account Not Found, Retrieval Error, and Renewal Link Ready states.
- Client validation, Enter-key submit, duplicate-submit prevention.
- Deny/reset/refresh behavior clears state.
- Accessible live loading/error states and focus-aware controls.
- Responsive LEAP/Sage-branded card layout.
- Deliberate `Go to Renewal Page` button using allowlisted URL from the server-approved result.

## Success condition
The one-page flow is usable without internal navigation, stores no progress in browser persistence, and preserves all PRD state transitions.

---

# MR-10 — Chapter 5: Production safety, tests, and deployment readiness

## Purpose
Harden Version 1 behavior for public safety and maintainability.

## Why this chapter follows core flow
Safety scaffolding should be validated against the real API/UI shape, but must complete before final closeout or public deployment.

## Primary outcomes
- Rate limiting policy implemented with no plain-email storage where feasible.
- Request timeout behavior.
- Security headers and no-store/private caching headers.
- Sanitized structured logs with correlation IDs and no raw contacts/full emails.
- Production/debug mode guards (`ENABLE_RAW_KEAP_DEBUG=false` default).
- README/env docs and Vercel setup notes.
- Unit/integration/UI-oriented tests cover critical paths.

## Success condition
Build/check/test evidence supports deployment readiness, with documented operator smoke-test steps for real Keap and Vercel.

---

# MR-11 — Chapter 6: Deferred future routing and verification expansion

## Purpose
Preserve future product direction without implementing it in Version 1.

## Why this chapter is deferred
The PRD explicitly postpones final cohort classification, email ownership verification, Convex, admin overrides, analytics, and click logging.

## Primary outcomes
- Deferred decisions remain documented in final audit.
- Code seams support future routing replacement.
- No Version 1 package accidentally introduces durable infrastructure.

## Success condition
Version 1 ships with Cohort 1 default routing and clear future-extension seams, not hidden overbuild.

---

# MR-12 — Dependency logic across chapters

## Chapter 1 depends on
Fresh shell baseline and resolved PRD intake.

## Chapter 2 depends on
Chapter 1 buildable TypeScript foundation.

## Chapter 3 depends on
Chapter 2 validation/types/sanitization contracts.

## Chapter 4 depends on
Chapter 3 API contract and Chapter 2 routing/response types.

## Chapter 5 depends on
Chapters 2–4 so tests and hardening target real code.

## Chapter 6 depends on
Final audit/hardening to document what remains intentionally future scope.

---

# MR-13 — Systems to preserve, elevate, or resolve

## Preserve and elevate
- ForgeShell workflow artifacts until optional Phase I packaging.
- Raw PRD and `PRD_SOURCE.md` traceability.
- No-database Version 1 posture.
- Server-only integration boundary.

## Elevate substantially
- Application scaffold from missing to buildable.
- Keap integration from planned-only to testable server modules.
- UI from missing to complete one-page state flow.
- Security/test posture from absent to deployment-ready.

## Resolve explicitly
- Production-vs-development data disclosure.
- Exact-match and duplicate contact behavior.
- Redirect allowlist enforcement.
- Browser persistence prohibition.
- Live Keap/Vercel smoke tests as operator-dependent setup.

---

# MR-14 — What the roadmap is trying to avoid

### Avoidance target 1 — Persistence overbuild
Do not introduce Convex, databases, cookies, localStorage, or sessions for Version 1.

### Avoidance target 2 — Unsafe CRM exposure
Do not expose unrestricted Keap records, notes, internal links, raw errors, or tokens to public visitors.

### Avoidance target 3 — Arbitrary routing
Do not let the browser or Keap provide arbitrary redirect URLs.

### Avoidance target 4 — Premature cohort intelligence
Do not invent final cohort rules before Keap field/tag precedence is known.

### Avoidance target 5 — Feature-first disorder
Do not build UI flows before the typed/API contracts needed to keep them safe.

---

# MR-15 — Recommended strategic order of execution

1. Next.js application foundation.
2. Typed domain, validation, routing, and sanitization foundation.
3. Server-side Keap lookup API.
4. Single-page member renewal flow.
5. Production safety, tests, and deployment readiness.
6. Deferred future routing and verification expansion documentation.

---

# MR-16 — How this roadmap should be used

Agents should use `EXECUTION_PACKAGES.md` for concrete work. This roadmap governs dependency order and strategic boundaries. If package scope conflicts with this roadmap, prefer the narrower package unless doing so would silently drop a material PRD commitment.

---

# MR-17 — Near-term implementation implication

The next actionable step is execution-package generation. The first package should scaffold the app and stop before Keap/product logic. Subsequent packages should build typed foundations, API, UI, and hardening in order.

---

# MR-18 — Quick chapter reference

## Chapter order
1. Foundation scaffold.
2. Typed pure modules.
3. Keap API.
4. Single-page UI.
5. Hardening/tests/docs.
6. Deferred future expansion documentation.

## Core recurring product themes
- One-page state flow.
- Server-only Keap integration.
- No persistence.
- Safe public disclosure.
- Allowlisted Cohort 1 routing.

## Most important strategic rule
Build the thinnest secure Version 1 renewal finder; defer durable infrastructure and final cohort intelligence.

---

# MR-19 — Final summary

The correct transformation path is not “add random features.” It is:

- establish a buildable Next.js foundation,
- add typed safe contracts,
- implement server-side Keap lookup,
- build the one-page member flow,
- harden and test the deployment posture,
- document deferred future routing/verification work.

This document defines that strategic path. `EXECUTION_PACKAGES.md` should now drive concrete execution.
