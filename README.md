# LEAP Membership Renewal Finder

A single-page Next.js application that lets an existing LEAP member enter their membership email, confirm a safe account summary from Keap, and receive the allowlisted LEAP Cohort 1 renewal URL.

This folder was prepared by **ForgeShell clean handoff** packaging. ForgeShell run evidence and planning artifacts are archived in `_forgeshell_archive/`.

## Run locally

```bash
npm install
npm run dev
```

Open the local Next.js URL shown in the terminal.

## Validation

```bash
npm run test
npm run build
npm run lint
npm run typecheck
npm audit --omit=dev
```

## Environment

Copy `.env.example` to `.env.local` and set real values outside Git.

Required:

- `KEAP_ACCESS_TOKEN` — server-only Keap / Infusionsoft REST API token. Never prefix this with `NEXT_PUBLIC_`.

Optional:

- `KEAP_BASE_URL` — defaults to `https://api.infusionsoft.com/crm/rest/v2`.
- `KEAP_REQUEST_TIMEOUT_MS` — defaults to `12000`.
- `KEAP_ACTIVE_LEAPER_TAG_ID` — default PRD value is `3097`.
- `ENABLE_RAW_KEAP_DEBUG` — keep `false` for public deployments.

## Deployment and launch

Deploy on Vercel with environment variables configured separately for Development, Preview, and Production.

Before public launch, follow `OPERATOR_LAUNCH_CHECKLIST.md` for Keap smoke tests, Vercel setup, preview access-control review, and public account-field approval.

## Version 1 scope

Implemented:

- One visible renewal finder page.
- Server-side Keap lookup route.
- Safe public account summary.
- Confirmation-time server-approved Cohort 1 renewal routing.
- Reset/refresh behavior with no browser persistence.
- Local test/build/lint/typecheck validation.

Deferred:

- Final cohort routing rules.
- Email ownership verification.
- Convex/database persistence.
- Admin/staff override tools.
- Analytics or durable confirmation/click logs.
