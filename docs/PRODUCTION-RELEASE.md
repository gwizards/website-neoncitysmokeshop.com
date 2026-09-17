# Production release contract — 2026-09-16

## Public topology

- Canonical origin: `https://neoncitysmokeshop.com`
- Redirect origin: `https://www.neoncitysmokeshop.com` (HTTP 308 to the apex)
- Preview origin: `https://dev.neoncitysmokeshop.com` (continues to be noindex)
- Production Worker: `neon-city-smoke-shop-production`
- CI source: the exact GitHub `main` commit

The production Worker has separate Turnstile configuration and secrets. Resend continues to
use the verified Wizards sender and the owner review recipient already validated on dev.

## CI contract

A push to `main` runs `.github/workflows/production.yml`. It installs the lockfile, audits
production dependencies, runs 39 unit tests and Astro diagnostics, builds and audits the
production indexing contract, performs a Wrangler dry run, confirms all three Worker secrets,
rejects a superseded commit, deploys the exact build, and compares the public `/version.json`
commit with `github.sha`.

## Discovery contract

Production publishes canonical metadata and `index, follow` on 20 substantive routes. The
legacy author archive, direct thank-you route, 404, APIs, and version endpoint remain noindex.
`robots.txt` advertises the source-derived 20-URL sitemap. `llms.txt` identifies the business,
primary pages, adult-only scope, live-inventory boundary, and external QuickVee ordering.
No search-platform submission is included in this release.

## Rollback

1. Identify the last known-good production version with
   `npx wrangler deployments list --env production`.
2. Run `npx wrangler rollback <version-id> --env production` and verify the displayed target.
3. Confirm `/version.json`, home, sitemap, contact rejection paths, and the `www` redirect.

Worker rollback does not revert secrets or restore the former SiteGround DNS target. The
verified SiteGround backup is retained as disaster-recovery evidence; a full restore rehearsal
has not been performed.
