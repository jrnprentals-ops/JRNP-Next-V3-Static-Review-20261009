# JRNP Next V3 — isolated frontend preview

This private GitHub repository contains only a read-only static snapshot of approved JRNP Next public pages. It was prepared from the Mac Mini LAN preview on 2026-10-09, with all 100 original property photos. Preview only; not the Mac Mini owner's active source. No backend, CMP, persistence, booking, Stripe, provider messaging or credentials are included.

All documents include noindex/nofollow. This snapshot omits an inaccessible `/jrnp-next/range-calendar.js` reference, retaining the native date inputs and date-order validation. It must not be promoted to production, treated as a complete booking platform, or treated as owner-source-frozen V3.

Render static site config: publish `public/`, disable autoDeploy, and use a buildCommand that verifies all public listing files and the 100 original JPGs, then copies `public/jrnp-next/index.html` to `public/index.html`. Render onrender.com only, no domain assignment.

## Read-only calendar visual review (October 9, 2026)

The homepage now presents a single date-range selector, and five listing calendars visualize muted-red booked dates, light-green available dates, and nightly estimates using `public/jrnp-next/data/availability-preview.json`. This is an **expiring, sanitized snapshot** of property/day/rate/availability only (no guest names, iCal URLs, private fees, payment credentials, or booking data). Invalid and blocked ranges are rejected and unverified dates are disabled. The quote and reservation backend remain unavailable on this static Render preview; no booking, payment, or database writes occur here.

The snapshot **expires after 12 hours** by design. The calendar then disables selection rather than claiming stale dates are available. Production requires an independently reviewed, sanitized **read-only availability API** and a working quote/booking service. Do not reuse a broad service-role credential or expose private pricing logic in browser code. This branch is not the authoritative Mac Mini V3 source.

Review QA: `calendar-ui-qa.cjs` (12/12) plus the existing mobile-motion tests (10/10); screenshots and reports are kept locally outside published `public/` content.
