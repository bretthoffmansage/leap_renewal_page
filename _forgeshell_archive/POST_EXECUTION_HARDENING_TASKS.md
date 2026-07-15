# POST_EXECUTION_HARDENING_TASKS

## Hardening execution order

### Pass H-1 — Tooling and lint signal cleanup
**Tags:** tooling/CI, code cleanup  
**Goal:** Make app lint output clean and app-focused without modifying product behavior.

Tasks:
1. Scope ESLint ignores so ForgeShell bootstrap/packaging scripts do not create app lint warnings.
2. Run `npm run lint`, `npm run test`, `npm run build`, and `npm run typecheck`.
3. Log and commit the pass.

### Pass H-2 — API contract and disclosure tests
**Tags:** backend hardening, test coverage  
**Goal:** Strengthen tests around mocked successful Keap lookup and confirmation routing.

Tasks:
1. Add a mocked successful `/api/renewal-lookup` route test that proves the response is public-safe and contains no routing URL at account-review time.
2. Add/verify invalid confirmation request behavior for `/api/renewal-destination`.
3. Run validation.
4. Log and commit the pass.

### Pass H-3 — UI behavior test baseline
**Tags:** UI assurance, test coverage  
**Goal:** Add a small component-level test baseline for default state and validation behavior.

Tasks:
1. Add minimal testing-library/jsdom setup if needed.
2. Test default email-entry rendering.
3. Test invalid email validation without network request.
4. Run validation.
5. Log and commit the pass.

### Pass H-4 — Operator launch checklist
**Tags:** documentation-only, environment/readiness documentation  
**Goal:** Create concise operator-facing launch checklist documentation.

Tasks:
1. Add `OPERATOR_LAUNCH_CHECKLIST.md` covering env vars, Vercel setup, Keap smoke tests, public-data review, and deferred decisions.
2. Link it from README.
3. Run documentation-appropriate validation plus standard checks if files affect tooling.
4. Log and commit the pass.

## Not hardening scope

- Final cohort routing.
- Email verification.
- Convex/database introduction.
- Admin dashboards.
- Live Keap or Vercel mutation without operator-provided safe setup.
