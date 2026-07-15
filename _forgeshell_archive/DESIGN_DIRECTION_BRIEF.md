# DESIGN_DIRECTION_BRIEF

## Purpose

Phase F should refine the LEAP Membership Renewal Finder from a functional developer-quality form into a calm, trustworthy, high-end member support experience without changing workflow logic.

## Functional preservation lock

Preserve:

- Route `/` and API routes `/api/renewal-lookup`, `/api/renewal-destination`.
- Email validation, lookup, account review, deny/reset, confirmation, renewal CTA, loading, not-found, and error states.
- No browser persistence and no URL/query/hash email exposure.
- Server-side Keap and routing behavior.
- Safe account summary fields.
- All tests and validation commands.

## UI/UX inventory and pain points

### Page inventory
- One public page containing a centered renewal-finder card.

### Workflow inventory
- Email Entry → Retrieving → Account Found / Not Found / Error → Renewal Ready.

### Major pain points
- The interface is functional but could better communicate trust, calm progression, and brand polish.
- State panels share layout but lack a refined product shell/header.
- Account summary is readable but can feel utilitarian.

## Design direction

### Product feel
Warm, calm, trustworthy, precise, membership-oriented, and low-friction.

### Visual hierarchy direction
Keep a single dominant heading per state, a concise explanatory line, then one clear primary action. Secondary actions stay visible but visually quieter.

### Layout and spacing rhythm
Use a centered card with generous edge padding, subtle layered background, and consistent vertical rhythm. On mobile, maintain full-width actions and compact detail rows.

### Typography system direction
Use strong condensed-feeling headings through letterspacing/scale, readable body copy, and small uppercase labels for brand/status metadata.

### Surface and background direction
Use warm paper-like card surfaces, soft Sage-green accents, thin borders, and restrained depth rather than heavy shadows or dashboard chrome.

### Color and navigation direction
No navigation is needed. Sage green indicates primary action and trust; muted warm neutrals support calm readability; errors use a dedicated red tone.

### Responsiveness direction
Mobile should feel like a focused single task card. Desktop should feel centered and premium without introducing extra columns or distractions.

## Dense/raw data handling strategy

The public product should not expose raw Keap data. Safe account summary rows remain visible and structured. If future development-mode raw data is reintroduced, it should be placed behind restricted collapsible/advanced sections, not mixed into member-facing summary.

## Out of scope

- New features or routes.
- Final cohort routing.
- Email verification.
- Data/API behavior changes.
- Gimmicky animation.

## Phase F success criteria

- The page feels more polished and intentional.
- Existing workflow controls and tests remain intact.
- Validation passes after design changes.
