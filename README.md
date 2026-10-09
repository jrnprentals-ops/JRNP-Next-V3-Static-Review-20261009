# JRNP Next V3 — isolated, read-only guest frontend preview

This PUBLIC GitHub repository contains only reviewed guest-facing HTML/CSS/JS and 100 original property photos for a separate Render noindex preview. It is NOT the Mac Mini frontend owner's authoritative source. No CMP private logic, host credentials, payment keys, guest records, or server-side booking code belongs here.

## Preview-only public calendar

The homepage is a single check-in → check-out range picker, while all five listing pages show green available dates, muted red blocked dates, nightly rate estimates, minimum-night rules, and a disabled gray/unverified state. Data loads on demand from the **existing** Supabase `jrnp-public-booking` public calendar endpoint using the browser-safe `sb_publishable_` key. Each GET includes `skipSync=1`: it only reads existing JRNP property and inventory records; it does not initiate imports, payment, booking, or any server-side writes. Internal response fields are stripped before rendering.

The public pricing is a nightly estimate, not an all-in quote or reservation. Airbnb/Vrbo availability is only as current as the underlying already-imported inventory; final host verification is required. If API verification fails, dates become unselectable rather than falsely green. The former 12-hour preview-only JSON snapshot was removed. No public booking form can submit a reservation on this static preview; the quote/host CMP/payment backend remains separate and unverified.

## Deployment and safety

Render static site URL: https://jrnp-next-v3-review-only-20261009.onrender.com/jrnp-next/
Render autoDeploy OFF, no custom domain, no production DNS mutation, noindex/nofollow. The build copies `public/jrnp-next/index.html` to `public/index.html`; CDN root may cache previous versions for up to 5 minutes, so use `/jrnp-next/` for the freshest preview while validating.

Do not promote this branch as a production booking app without full host CMP auth/persistence verification, iCal freshness controls, secure request-to-book flow, quote calculations and production release signoff. No Render paid plan required for the preview.

Local QA: `calendar-ui-qa.cjs` passed 13/13 including blocked-date rejection and simulated API outage; `qa_fixed_mobile_motion.cjs` passed 10/10. These QA screenshots and scripts reside on iMac outside the Render published `public` tree.
