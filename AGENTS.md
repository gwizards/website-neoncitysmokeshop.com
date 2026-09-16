# Neon City support preview

Site id: `neoncitysmokeshop`. Read `README.md` and `docs/IMPLEMENTATION.md` first.

This repository is an age-gated informational and administrative support preview authorized
for `https://dev.neoncitysmokeshop.com`. Source-derived product-category information and
brand imagery may be shown for migration fidelity. Do not add shopping links, sales forms,
checkout behavior, or production routes. Production WordPress remains separate.

- Preserve existing user work. Do not commit or push without authorization.
- Run `npm run quality` before deploying. Use the exact dev Wrangler configuration.
- Secrets belong only in ignored `.dev.vars` and Cloudflare secrets.
- Keep the dev recipient at the owner's review inbox until a separately approved change.
- Keep HTML noindex, Worker X-Robots-Tag, and robots disallow. No sitemap or llms file.
- Use `$maintain-sitemaps`, `$maintain-discovery-surfaces`, and
  `$audit-web-discoverability` with site id `neoncitysmokeshop` for discovery changes.
- Use the portfolio's `$implement-resend-cloudflare` for form changes.
- Source identity is at `/version.json`; an unborn Git repository must report a
  null commit and a deterministic source checksum, never an invented commit.

Deployment authority currently covers the dev subdomain only.
