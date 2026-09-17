# Neon City website

Site id: `neoncitysmokeshop`. Read `README.md`, `docs/IMPLEMENTATION.md`, and
`docs/PRODUCTION-RELEASE.md` first.

This repository contains the age-gated Neon City Smoke Shop Astro website. Source-derived
product-category information, blog content, and brand imagery may be shown for migration
fidelity. Order Online hands age-confirmed visitors to the existing QuickVee merchant; do not
implement an embedded storefront, cart, checkout, inventory, or payment processing.

- Preserve existing user work. Do not commit or push without authorization.
- Run `npm run quality` for dev changes and `npm run quality:production` before production work.
- Secrets belong only in ignored local files, Cloudflare Worker secrets, and GitHub Actions secrets.
- Production releases come only from the exact `main` commit through `.github/workflows/production.yml`.
- Keep `dev.neoncitysmokeshop.com` noindex with no sitemap or llms file.
- Production uses canonical apex URLs, redirects `www`, and publishes source-derived robots,
  sitemap, and llms surfaces. Do not change search-platform accounts without separate authorization.
- Use `$maintain-sitemaps`, `$maintain-discovery-surfaces`, and `$audit-web-discoverability`
  for discovery changes, and `$implement-resend-cloudflare` for form changes.
- Source identity is at `/version.json`; an unborn Git repository must report a null commit and
  deterministic source checksum, never an invented commit.
