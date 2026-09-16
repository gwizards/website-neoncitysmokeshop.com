# Blog and Order Online audit — 2026-09-16

## Scope and source evidence

This follow-up extends the existing Neon City migration goal. It uses the verified
SiteGround database and file backups captured on 2026-09-16 as the article and image source.
The published WordPress inventory contains one blog archive and 13 posts dated from
2023-10-28 through 2025-05-22. The current source header sends Order Online visitors to:

`https://quickvee.com/merchant/MAR630037NV?orderMethod=delivery`

## Implemented routes and content

- Added `/blog/` with all 13 published source posts, dates, descriptions, and restored local
  featured images.
- Added one static Astro route per original post slug, preserving the source article text,
  headings, lists, links, calls to action, and rendered FAQ answers.
- Removed WordPress comments, block metadata, table-of-contents payloads, scripts, forms,
  iframes, remote inline images, and other runtime dependencies from the migrated HTML.
- Rewrote source-site internal calls to the matching local homepage sections and ensured that
  heading identifiers are unique within each post.
- Added the Blog route to the header and footer and restored the source-style Order Online
  button. It opens the exact QuickVee merchant URL in a new tab with an accessible label and
  `noopener noreferrer` protection.

## Commerce boundary

The Astro application does not contain a storefront, product inventory, cart, checkout,
payment form, or purchase API. Order Online is a visible handoff to the existing external
QuickVee merchant after the visitor confirms the 21+ gate. No test order or purchase was
placed during validation.

## Validation

- Astro/type checks passed with zero diagnostics.
- Six Vitest files passed with 32 tests, including complete route/image inventory, sanitized
  body HTML, and unique article heading identifiers.
- The static build generated 17 pages: homepage, privacy, 404, blog archive, and 13 posts.
- The artifact audit verified noindex directives, local assets, the exact QuickVee target,
  article headings, and absence of WordPress runtime paths, analytics, cart, and checkout.
- Wrangler validated the 81-asset Worker bundle in dry-run mode.
- Chrome showed the age gate in a fresh session. After confirmation, the blog archive exposed
  all 13 cards and the representative bong-cleaning article rendered its source title, date,
  featured image, body headings, FAQ content, header navigation, and Order Online handoff.

## Preview boundary

All dev pages remain `noindex, nofollow, noarchive`, `robots.txt` disallows crawling, and no
sitemap or `llms.txt` is emitted. Production WordPress, DNS, production routes, search-platform
submissions, QuickVee configuration, inventory accuracy, and purchase processing remain
outside this dev release.
