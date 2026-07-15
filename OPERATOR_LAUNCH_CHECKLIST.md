# OPERATOR_LAUNCH_CHECKLIST

This checklist separates code readiness from the external setup required before the LEAP Membership Renewal Finder is shared publicly.

## 1. Local code validation

Run:

```bash
npm install
npm run test
npm run build
npm run lint
npm run typecheck
npm audit --omit=dev
```

Expected current baseline:

- Tests pass.
- Production build passes.
- Lint passes with no warnings.
- Typecheck passes.
- Production dependency audit reports 0 vulnerabilities.

## 2. Keap environment setup

Configure secrets outside Git:

- `KEAP_ACCESS_TOKEN` — required server-only token. Never use `NEXT_PUBLIC_`.
- `KEAP_BASE_URL` — optional; default is `https://api.infusionsoft.com/crm/rest/v2`.
- `KEAP_REQUEST_TIMEOUT_MS` — optional; default is `12000`.
- `ENABLE_RAW_KEAP_DEBUG=false` — keep false for public deployments.

Confirm the token has the required permissions for:

- contact search,
- full contact retrieval,
- tag catalog retrieval,
- contact model retrieval,
- notes retrieval if available.

## 3. Vercel setup

In Vercel, configure environment variables separately for:

- Development,
- Preview,
- Production.

Do not assume variables changed in Vercel affect already-created deployments. Redeploy after changes.

If Preview uses production Keap data, restrict Preview access before sharing links.

## 4. Live Keap smoke tests

Use known safe test contacts and confirm:

1. `/tags/3097` works with the configured token.
2. Email lookup returns the expected contact.
3. Duplicate exact matches return a controlled duplicate response.
4. Full contact endpoint returns tag IDs and custom fields.
5. Tag catalog pagination works.
6. Contact model metadata maps custom fields such as `LEAPCohort`.
7. Notes failure does not fail an otherwise valid lookup.
8. Active LEAP tag detection works for known members.
9. Public responses do not expose raw notes, billing fields, internal links, contact IDs, or full addresses.

## 5. Member-flow smoke tests

In the browser, confirm:

1. Page opens at Email Entry.
2. Invalid email is rejected before network request.
3. Valid email shows `Retrieving account…` immediately.
4. Account Found shows only limited recognition fields.
5. Deny returns to a blank email form.
6. Reset clears all visible state.
7. Refresh returns to Email Entry.
8. Confirm shows the renewal CTA without automatic redirect.
9. The CTA URL is exactly `https://leap.sagehub.com/cohort-1-renewal-2026`.
10. The browser URL never contains the submitted email.

## 6. Public-data review before launch

Before public launch, an authorized operator should approve the actual recognition fields displayed to members. If the fields are too sensitive, defer launch until email ownership verification or a reduced summary is implemented.

## 7. Deferred Version 1 decisions

Do not treat these as launch blockers unless the operator makes them blockers:

- final cohort routing,
- email ownership verification,
- Convex/database persistence,
- admin override tools,
- analytics or durable click logs,
- automatic duplicate-contact resolution beyond controlled duplicate response.

## 8. Launch/no-launch decision

Launch only when:

- local validation passes,
- Vercel environment variables are configured,
- live Keap smoke tests pass,
- preview data exposure is controlled,
- public account-summary fields are approved,
- and the operator accepts the Version 1 deferred-decision list.
