# Final development audit — 2026-09-16

## Scope and release boundary

This audit covers the authorized Astro and Cloudflare development preview. The original
WordPress site at the apex and `www` remains production. The preview stays excluded from
search and AI crawling until a separately authorized production launch. The verified
SiteGround file and database backup and its private Drive recovery copy remain outside Git.

## Route and section census

| Surface | Result |
| --- | --- |
| Home | Source-style header, original logo and backup video, about, six product categories, contact banner, protected form, footer and 21+ gate. |
| About | Restored source-backed business story, values, imagery, calls to location and contact. |
| Products and services | Six source categories with 21+ and live-availability boundaries; no invented prices, inventory, cart or checkout. |
| Location | Published address, hours, telephone, email and external directions. |
| Contact | Published contact facts and shared Turnstile/Resend form. |
| Blog | Archive and all 13 published source articles with dates, descriptions, body content, headings and local featured images. |
| Author archive | Legacy route retained without inventing a biography. |
| Thank-you route | Legacy route retained; a direct visit does not falsely claim that a message was sent. |
| Privacy and 404 | Processing disclosure, recovery links, one H1 and preview indexing controls. |
| Order Online | Exact external QuickVee merchant handoff; no local commerce behavior. |

The static build contains 23 HTML pages. The artifact audit checks 10 key documents plus
all 13 articles, one H1 per document, internal routes and assets, JSON-LD parsing, social
metadata, the exact QuickVee link, and absence of WordPress runtime, analytics, cart and
checkout dependencies.

## SEO, AEO and structured data

The content and extraction layers are ready for a later production release:

- Unique page titles and descriptions, semantic headings, descriptive links and connected
  navigation cover the restored route inventory.
- Open Graph and Twitter metadata use page-specific title, description, URL and image.
- A source-derived JSON-LD graph describes `WebSite` and `LocalBusiness`, with published
  address, telephone, email, opening hours and social profiles.
- The blog archive adds `CollectionPage` and `ItemList`; each article adds `BlogPosting`
  with dates, image, page identity, publisher and author references.
- Visible business facts, metadata and structured data use shared source values where
  practical. No ratings, prices, inventory, medical claims or unsupported credentials exist.

Eligibility is intentionally disabled on this development host: every response and page is
`noindex, nofollow, noarchive`, `robots.txt` disallows crawling, and sitemap, canonical and
`llms.txt` publication are withheld. A Lighthouse SEO score on this host will therefore be
suppressed by policy and is not a production SEO score. Production launch requires a fresh
crawl/indexing plan, canonical origin switch, generated sitemap and discovery-surface audit.

## Performance and delivery

- Astro emits static HTML and about 28 KB of uncompressed first-party CSS/JS across the
  shared hashed bundles; pages contain no framework hydration runtime.
- The original videos are muted and held behind age confirmation, viewport proximity,
  reduced-motion and data-saver checks, with local poster fallbacks.
- Turnstile is requested only after age confirmation and when the form approaches the
  viewport. This keeps the third-party challenge off initial visits that do not use the form.
- The age gate and footer use a 640-pixel display logo; the larger image remains available
  for social sharing.
- Hashed `/_astro/` resources receive one-year immutable caching. Images, fonts and videos
  receive a one-day public cache with seven-day stale revalidation. HTML, API, robots and
  version responses remain uncached.
- Images below the initial view use lazy loading, explicit dimensions and AVIF/WebP where
  available. The two backup-sourced videos remain the main transfer-size cost when played.

Lab measurements are recorded against the final deployed Worker in the task handoff. They
are synthetic diagnostics, not field Core Web Vitals, and the age gate is part of the real
first-visit experience.

## Accessibility, security and forms

- The 21+ modal traps keyboard focus, marks the underlying page inert, preserves a same-tab
  session choice and restores focus to content without moving the visitor's scroll position.
- Skip navigation, semantic regions, labelled form controls, persistent field help, live
  status text, visible focus, reduced-motion support and explicit video controls are present.
- The Worker accepts same-origin JSON POST only, validates size and fields, rate-limits by a
  keyed request identity, requires the exact Turnstile action and dev hostname, escapes email
  content and sends through Resend with deterministic idempotency.
- The form clearly identifies the development-review recipient and offers the public email as
  a fallback. Prior delivery evidence is recorded in `DEV-RELEASE.md`; this audit did not send
  another message.

Astro/type checks pass with zero diagnostics. Seven Vitest files pass with 38 tests. The static
artifact audit and Wrangler dry-run pass. Desktop Chrome inspection covered the age-gated
homepage, About, Products, Location and Contact layouts; the contact challenge renders only
when its deferred conditions are met. Emulated mobile performance and layout checks are part
of the final deployed measurement. A 390 × 844 Chromium pass found no horizontal overflow
across the home, About, Products, Location, Contact, Blog, representative article, Privacy and
Thank-you routes. The compact menu stayed sticky, fit within the viewport and exposed full-width
touch targets for every destination.

## Remaining production gates

- The site is not registered in the workspace portfolio registry, so shared portfolio
  discovery and drift commands cannot address it by site id.
- Preview indexing controls must not be copied unchanged to production. Production needs an
  approved canonical host, sitemap/discovery files and search-platform handoff.
- Product availability, business/legal review, cross-browser physical-device testing,
  screen-reader testing and a full backup restore rehearsal are owner or specialist checks.
- Field Core Web Vitals require real production traffic; lab traces cannot establish them.
