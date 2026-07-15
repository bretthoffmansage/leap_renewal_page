# CURRENT_STATE_AUDIT

## Audit metadata

- **Audit date:** 2026-07-15
- **Repository / project name:** `shell-core` / LEAP Membership Renewal Finder workspace
- **Scope:** Static inspection of the shell project root, raw PRD, runtime control docs, and top-level files after fresh local git initialization.
- **Method:** Static filesystem and git inspection; no application runtime exists yet.
- **Important limitations:** No Next.js application scaffold, package manifest, routes, tests, deployment config, environment variables, or live Keap credentials were present at audit time.

---

## Start here (fastest path to understanding)

| Order | Path | Why |
|------:|------|-----|
| 1 | `PRD_SOURCE.md` | Normalized product-truth source for the renewal finder. |
| 2 | `raw_prd/renewal_landing_page.md` | Full original PRD supplied by the operator. |
| 3 | `shell/reusable/REUSABLE_SHELL_WORKFLOW.md` | Governs phase, package, closeout, and continuation behavior. |
| 4 | `shell/reusable/REUSABLE_SHELL_PROMPTS.md` | Provides prompt behavior for planning and execution phases. |
| 5 | `.forgeshell/packaging.json` | Indicates optional ForgeShell handoff packaging can occur after final closeout. |

### Critical wiring note
The repository currently contains the ForgeShell runtime/control workspace and raw PRD, but **no application implementation yet**. The first execution package must scaffold the Next.js/TypeScript app before product behavior can be built.

---

# 1. Executive audit summary

## What the application appears to be
At audit time, there is no application. The workspace is a newly initialized local ForgeShell run containing shell control documents, templates, bootstrap helpers, raw PRD input, and generated planning artifacts.

## What the main product does in practice today
No user-facing product flows exist yet.

## What the app appears optimized around right now
- Reusable autonomous shell workflow execution.
- Raw PRD intake and lifecycle orchestration.
- Later cleanup/handoff via ForgeShell packaging.

## What looks most complete
- Shell control docs and templates.
- Canonical raw PRD input.
- Local git repository baseline.

## What looks least complete
- Next.js application scaffold.
- Keap integration.
- Renewal finder UI and API.
- Tests/build/deployment setup.

## Biggest apparent architectural strengths
- Clear PRD with detailed product, security, and test expectations.
- Shell has strong workflow/closeout controls.

## Biggest apparent product/technical gaps
- No package manifest or app code.
- No server route handler or Keap client.
- No UI state machine.
- No security headers, rate limiting, or tests.

## Signs of drift from a single product direction
No product-code drift exists yet because no app implementation exists. The main risk is accidentally overbuilding beyond the PRD while introducing the initial stack.

---

# 2. Repository / project structure

## Top-level tree (conceptual)

```text
shell-core/
├── .claude/
├── .codex/
├── .forgeshell/
├── agent_runs/
├── bootstrap/
├── dry_runs/
├── raw_prd/
├── scripts/
├── shell/
├── README.md
├── PRD_SOURCE.md
├── CURRENT_STATE_AUDIT.md
└── .gitignore
```

## Major folders

| Path | Role | Active vs legacy |
|------|------|------------------|
| `.claude/` | Claude CLI runtime configuration and hooks for shell operation. | Active shell support |
| `.codex/` | Codex runtime instructions/config. | Active shell support |
| `.forgeshell/` | ForgeShell handoff packaging metadata. | Active shell support |
| `agent_runs/` | Runtime logs and evidence. | Active shell support |
| `bootstrap/` | Shell bootstrap launch helpers. | Active shell support |
| `dry_runs/` | Shell dry-run support artifacts. | Active shell support |
| `raw_prd/` | Canonical raw PRD intake folder. | Active project input |
| `scripts/` | ForgeShell packaging handoff script. | Active shell support |
| `shell/` | Shell control, reusable docs, runtime references, and templates. | Active shell support |

## Duplicated or parallel structures
None observed for the application because no application exists yet.

## Especially important root config files
- `.gitignore` — Current ignore rules before app scaffold.
- `.forgeshell/packaging.json` — Enables optional post-closeout handoff packaging.
- `README.md` — Shell-oriented README, not yet an app README.

---

# 3. Application architecture

## Frameworks and major technologies
- **Frontend:** Not implemented. PRD requires Next.js App Router + React + TypeScript.
- **Backend:** Not implemented. PRD requires Next.js Route Handler on Node.js runtime.
- **Auth:** None required for public Version 1; preview/prod data exposure controls remain deployment-sensitive.
- **Styling/UI:** Not implemented.
- **State/data fetching:** Not implemented. PRD requires temporary React component state and browser fetch to internal API.

## App / runtime structure
No `app/`, `components/`, `lib/`, `types/`, `package.json`, or Next.js config exists yet.

## Frontend architecture
Missing.

## Backend architecture
Missing.

## State / data flow
Planned-only per PRD:
1. Browser submits normalized email to app API.
2. Server route queries Keap and returns a safe result.
3. Browser renders account review.
4. Confirmation derives routing decision and shows allowlisted CTA.

## Server vs client component patterns
Not implemented.

## Conventions
No application conventions exist yet.

## Inconsistencies / technical debt
- Shell files occupy the root that will also become the app root; packaging phase must later remove/archive shell internals if the operator chooses handoff cleanup.
- App setup must avoid committing secrets in `.env.local`.

---

# 4. Routing / navigation map

## Route table

| Route | File | Purpose | Data source | Notes |
|------|------|---------|-------------|------|
| `/` | Missing | Single visible renewal finder page | Planned React state + API | Must be created. |
| `/api/renewal-lookup` | Missing | Server-side Keap lookup endpoint | Keap REST v2 | Must be created. |

## Declared navigation vs visible navigation
No navigation exists. PRD requires one visible page with state changes only.

## Auth expectations vs actual code
No auth or access controls are implemented. Public Version 1 does not require member auth, but production-connected preview access remains a deployment risk.

## Placeholder / low-value routes
None implemented.

---

# 5. Authentication / authorization / tenant model

## How auth is implemented
Not implemented and not required for public Version 1.

## How user identity is used
No user identity system exists.

## Organization / tenant model
None.

## Role checks today
None.

## Missing or partial enforcement
- No protection exists yet against exposing production Keap data in preview/development deployments.
- No debug-mode guard exists yet.

---

# 6. Current product surface area

## Public renewal finder page
- **What it does:** Missing.
- **Completeness:** Not started.
- **Production readiness:** None.
- **Key files:** Planned `app/page.tsx`, components under `components/renewal-finder/`.
- **Notes / risks:** Must satisfy single-page, no-persistence, accessibility, and responsive requirements.

## Internal renewal lookup API
- **What it does:** Missing.
- **Completeness:** Not started.
- **Production readiness:** None.
- **Key files:** Planned `app/api/renewal-lookup/route.ts` and `lib/keap/*`.
- **Notes / risks:** Sensitive due to token handling and member data.

## Routing and renewal destinations
- **What it does:** Missing.
- **Completeness:** Not started.
- **Production readiness:** None.
- **Key files:** Planned `lib/renewal/destinations.ts`, `lib/renewal/determine-destination.ts`.
- **Notes / risks:** Must prevent arbitrary redirects and default all Version 1 contacts to Cohort 1.

---

# 7. Core-domain functionality audit

## Does the app revolve around its core unit?
No. The app does not exist yet.

## Current primary domain model
None implemented.

## Operational capabilities matrix

| Capability | State | Where |
|-----------|-------|------|
| Email entry and validation | Missing | Planned UI + validation module |
| Server-side Keap lookup | Missing | Planned API route + Keap modules |
| Exact-match selection | Missing | Planned Keap lookup module |
| Contact normalization | Missing | Planned normalizer |
| Public account summary | Missing | Planned sanitizer |
| Cohort 1 routing | Missing | Planned renewal routing module |
| Reset/refresh state clearing | Missing | Planned React state machine |
| Security/rate limiting/logging | Missing | Planned security modules |

## Alignment with claimed product identity
- **Aligned:** Raw PRD and normalized PRD are aligned.
- **Divergent / early:** Implementation has not begun.

---

# 8. Data model / schema audit

There is no schema layer and no persistence. This matches the PRD's no-database Version 1 direction but means all required typed models still need implementation.

---

# 9. Backend / service layer audit

No backend/service application modules exist yet.

## Required future modules
| Module | Primary responsibilities |
|--------|--------------------------|
| `lib/validation/email.ts` | Email trim/lowercase/format/length validation. |
| `lib/keap/client.ts` | Server-side Keap HTTP transport and URL construction. |
| `lib/keap/lookup-by-email.ts` | Contact search and exact-match selection. |
| `lib/keap/normalize-contact.ts` | Normalize contact, tags, fields, notes, derived values. |
| `lib/security/response-sanitizer.ts` | Convert internal account to safe public response. |
| `lib/security/rate-limit.ts` | Best-effort in-memory lookup rate limiting. |
| `lib/renewal/*` | Destination allowlist and Cohort 1 routing decision. |

---

# 10. Frontend component audit

No application components exist yet. The PRD's suggested component structure is appropriate for execution planning but can be implemented as a bounded set of components rather than over-fragmenting prematurely.

---

# 11. State management / data fetching audit

No application state exists. Required future posture:
- Temporary React component state only.
- No localStorage/sessionStorage/cookies/query-string flow persistence.
- Browser fetches `POST /api/renewal-lookup`.
- Confirmation derives/uses server-approved routing data without accepting arbitrary redirect input.

---

# 12. Integration / environment audit

## Keap
Not implemented. Required env vars are not present in committed repo and should not be committed.

## Vercel
No Vercel project metadata is present. Deployment is operator setup after build.

## Convex
Not present and intentionally unnecessary for Version 1.

---

# 13. Testing / validation audit

No test framework or test files exist yet. No build/lint scripts exist because no package manifest exists.

Required future baseline:
- Install/build validation for Next.js app.
- Unit tests for pure validation/routing/normalization/sanitization helpers.
- API route behavior checks with mocked Keap transport where practical.
- Manual or automated UI state checks.

---

# 14. Security / privacy audit

No product implementation exists yet, so no token exposure was observed. Primary risks for upcoming packages:
- Accidentally exposing raw Keap payloads or token to browser.
- Persisting email/contact data contrary to PRD.
- Returning arbitrary redirect URLs.
- Logging full emails or raw contact objects.
- Treating email confirmation as identity verification.
- Public preview deployment against production Keap without restrictions.

---

# 15. PRD coverage gaps to carry into roadmap/packages

All material PRD requirements are currently unimplemented. Roadmap and packages must account for:
- Next.js app scaffold.
- Single-page state machine.
- Server-only Keap API lookup and enrichment.
- Typed destination allowlist and Cohort 1 routing.
- Safe public summary and debug-mode restrictions.
- No-persistence refresh/reset behavior.
- Rate limiting, timeout, no-store caching, safe errors, and security headers.
- Tests and deployment-readiness documentation.
- Explicit deferment of Convex, final routing, email verification, admin tools, and analytics.

---

# 16. Audit conclusion

The project is a fresh ForgeShell workspace with a detailed PRD and no app code. The correct next move is to create a dependency-aware roadmap and execution package sequence that first scaffolds the Next.js foundation, then builds typed core modules, server-side Keap lookup, the single-page UI, and finally production-safety hardening.
