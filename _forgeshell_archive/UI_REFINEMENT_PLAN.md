# UI_REFINEMENT_PLAN

## Scope boundaries

### In scope
- Refine the page shell, card, brand/header treatment, account summary surface, buttons, and responsive rhythm.
- Preserve all current state logic and API calls.
- Add decorative/structural markup only when it improves clarity without changing behavior.

### Out of scope
- Feature expansion.
- API/business logic changes.
- Final cohort routing.
- Live Keap/Vercel work.

## Shared-system refinement

1. Add a product-shell frame with more intentional background composition.
2. Add a refined brand strip inside the card.
3. Improve card layers, button polish, summary rows, and loading indicator.
4. Preserve accessible focus and mobile full-width controls.

## Surface refinement plan

### Home / primary page
- Improve the visual frame and card header.
- Make the page feel trustworthy before the user enters an email.

### List / search surfaces
- Not applicable; this app has no list/search surface beyond the email lookup form.

### Detail / profile-heavy surfaces
- Refine account summary rows without adding sensitive fields.

### Dense/raw data access preservation
- No public raw data is shown. Future raw/debug content should remain restricted and collapsible.

## Ordered implementation slices

| Slice | Scope | Why now | Validation |
|---|---|---|---|
| DESIGN-S1 | Brand/header markup and card hierarchy | Improves trust and orientation | tests/build/lint/typecheck |
| DESIGN-S2 | CSS refinement for shell, surfaces, buttons, summary, responsive rhythm | Raises perceived quality | tests/build/lint/typecheck |

## Functional preservation checks required

After design execution verify:

- `/` still builds.
- Email form and validation remain present.
- Lookup/loading/error/account/renewal states remain in component code.
- API route behavior is unchanged by tests.
- Tests, build, lint, typecheck, and production audit pass.

## Deferred design items

| Deferred item | Reason deferred | Candidate later phase |
|---|---|---|
| Brand-accurate logo assets | No official asset supplied in PRD/repo | Future brand asset pass |
| Browser E2E visual regression | Not required for current bounded pass | Future CI/tooling phase |
