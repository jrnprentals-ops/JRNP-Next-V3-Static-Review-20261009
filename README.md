# JRNP Next V3 — production guest frontend

This public repository contains the approved guest-facing V3 HTML/CSS/JS and original property photos. It contains no CMP private logic, host credentials, payment keys, guest records, or server-side booking code.

## Availability and request-to-book

The homepage and five listing pages use the existing JRNP backend for quotes and read-only calendar data. Calendar reads include `skipSync=1`, publish confirmed blocked dates only, and leave every other date unverified until the quote endpoint rechecks the requested stay.

A successful quote can be submitted as a Request to Book using a stable idempotency key. The backend revalidates availability and saves the request for host review. A request is not a confirmed reservation, and this frontend does not charge a payment or send automated guest messages.

## Deployment and safety

Production target: `jrnp-next-v3-guest-stage` on Vercel, served at `https://jrnprentals.com/`. `vercel.json` exposes only the quote, booking-request, and read-only property-calendar paths from the existing `jrnp-backend` service.

Keep live payments and automated guest sends disabled until they are separately verified and authorized. Preview the exact release artifact, run desktop/mobile smoke checks, and retain the previous production deployment as the rollback target before promotion.

Run `node --test scripts/production-booking-contract.test.cjs` for the release contract checks.
