# JRNP Next V3 — isolated frontend preview

This private GitHub repository contains only a read-only static snapshot of approved JRNP Next public pages. It was prepared from the Mac Mini LAN preview on 2026-10-09, with all 100 original property photos. Preview only; not the Mac Mini owner's active source. No backend, CMP, persistence, booking, Stripe, provider messaging or credentials are included.

All documents include noindex/nofollow. This snapshot omits an inaccessible `/jrnp-next/range-calendar.js` reference, retaining the native date inputs and date-order validation. It must not be promoted to production, treated as a complete booking platform, or treated as owner-source-frozen V3.

Render static site config: publish `public/`, disable autoDeploy, and use a buildCommand that verifies all public listing files and the 100 original JPGs, then copies `public/jrnp-next/index.html` to `public/index.html`. Render onrender.com only, no domain assignment.
