# FIDELITY_UPLIFT_PLAN

## Purpose

This plan defines the bounded Phase E uplift work needed to improve functional fidelity to the raw PRD and `PRD_SOURCE.md` without expanding product scope.

## Uplift objectives

1. Align Account Found controls with the raw PRD visible-elements list.
2. Preserve existing one-page/no-persistence behavior.
3. Re-run validation and update the fidelity audit.

## Scope boundaries

### In scope
- Add an explicit Reset button to Account Found.
- Keep `No, Start Over` behavior intact.
- Run standard validation.
- Update `POST_BUILD_FIDELITY_AUDIT.md` post-uplift section.

### Out of scope
- Visual redesign beyond required control addition.
- Final cohort classification.
- Email ownership verification.
- Convex/database/admin/analytics additions.
- Live Keap/Vercel work.

## Ordered uplift work items

| Uplift ID | Fidelity gap reference | Work item | Why now | Validation |
|---|---|---|---|---|
| UPLIFT-01 | INTENT-06 thin | Add explicit Reset button in Account Found state | Raw PRD lists Reset separately | test/build/lint/typecheck |
| UPLIFT-02 | Phase E audit | Update post-uplift audit status | Required by workflow | doc review + validation evidence |

## Execution guardrails

- Touch only the UI component and Phase E docs unless validation requires a narrow fix.
- Do not change API behavior or routing semantics.
- Do not introduce persistence.

## Explicit deferred fidelity gaps

| Deferred ID | Gap summary | Why deferred now | Suggested later phase |
|---|---|---|---|
| DEFER-01 | Live Keap smoke tests | Requires safe operator credentials/environment | Operator launch readiness |
| DEFER-02 | Email ownership verification | Explicit future enhancement | Future product package |
| DEFER-03 | Final cohort routing | Keap precedence rules unresolved | Future product package |

## Phase completion statement

Phase E is complete when the Account Found Reset button is added, validation passes, and `POST_BUILD_FIDELITY_AUDIT.md` records the post-uplift result.
