# Neon City Smoke Shop

Astro and Cloudflare Worker website for [neoncitysmokeshop.com](https://neoncitysmokeshop.com),
with an isolated preview at [dev.neoncitysmokeshop.com](https://dev.neoncitysmokeshop.com).
The site is age-gated and links external online orders to the existing QuickVee merchant. It
does not implement inventory, a cart, checkout, or payments.

## Development

Node 22.12+ is required. Run `npm ci`, `npm run types`, then `npm run quality`. Use
`npm run dev` for Astro UI development. The real public Turnstile sitekey is in
`shared/site.ts`; secrets stay in ignored `.dev.vars` and Cloudflare Worker secrets.

## Environments

The default Wrangler environment is the noindex development Worker on
`dev.neoncitysmokeshop.com`. It blocks crawling and publishes no canonical, sitemap, or
`llms.txt` artifact.

The `production` Wrangler environment is the public Worker on `neoncitysmokeshop.com` and
`www.neoncitysmokeshop.com`. The Worker redirects `www` to the canonical apex. Production
builds publish canonical metadata, indexable headers, `robots.txt`, `sitemap.xml`, and
`llms.txt`; legacy utility routes remain noindex.

Run `npm run quality:production` to validate the complete production artifact. Production
releases are made by `.github/workflows/production.yml` from the exact `main` commit. The
workflow refuses stale commits, verifies required Worker secrets, deploys, and audits the
public edge against `/version.json`.

## Contact delivery

The Worker protects `/api/contact` with same-origin checks, strict validation, Cloudflare
Turnstile, rate limiting, and Resend. Messages go to `fernando@wizards.global`; the visible
public email remains `neoncitysmokeshop@gmail.com`. No automatic visitor confirmation is sent.
Development and production use separate Turnstile widgets and Worker secrets.

## Backup

The original SiteGround files and database were exported, packaged, uploaded to
[the private Drive recovery folder](https://drive.google.com/drive/folders/1VbAbuEw1kr88pwfRLwQdxLpF488DdwN0),
then downloaded and checksum-verified. No backup archive, database export, customer data, or
credential belongs in this repository.

## Release identity and rollback

`/version.json` records the source commit, deterministic checksum, environment, and build time.
Cloudflare Worker versions provide code rollback; a code rollback does not restore DNS,
secrets, external email state, or the prior SiteGround application. See
`docs/PRODUCTION-RELEASE.md` for current release evidence and rollback steps.
