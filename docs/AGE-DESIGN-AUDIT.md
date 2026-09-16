# Age gate and source-design audit — 2026-09-16

## Goal

Continue the existing migration goal by auditing the live WordPress homepage and the
verified SiteGround backup against the Astro preview. Restore the missing 21+ entry state,
source logo variants, homepage imagery, section structure, and hero media; validate the
result in a real browser at desktop and mobile widths; keep checkout and production out of
scope; push the reviewed branch and deploy only the existing dev custom domain.

The app already contains an unfinished migration goal and will not create a second goal.
This document is the follow-up acceptance record for that same goal.

## Source observations

- Initial state is a black full-viewport age gate with the full Neon City logo, the exact
  heading “You must be over the age of 21 to visit this website,” “Are you over 21?”, and
  Yes/No choices.
- The masthead uses a dedicated 250×98 cropped logo, not the larger homepage logo derivative.
- The hero uses `Neon-Final.mp4` and the heading “Welcome to Neon City Smoke Shop.”
- The About section uses `pexels-john-mor-3418814.jpg` inside a magenta/cyan frame.
- The three-column category section has three icon-and-copy items on each side of
  `pexels-aviz-3794457.jpg`, also framed in magenta/cyan.
- The lower contact callout uses the abstract colored-smoke video and cyan-to-black overlay.
- The live site contains an Order Online handoff to the existing QuickVee merchant. The dev
  preview now restores that exact outbound link after the age gate while keeping all cart,
  checkout, inventory, and payment behavior outside this Astro application.

## Implemented parity

- Added a keyboard-contained, labelled modal dialog that blocks the page until confirmation.
  Confirmation is stored only in session storage; a new browser session sees the gate again.
  The No choice leaves the site. Hero footage is not requested before confirmation.
- Restored the full logo for the gate and the exact cropped logo for header/footer use.
- Restored and optimized the two source portraits with AVIF/WebP delivery and intrinsic sizes.
- Restored all six source icons, three-column geometry, source About/category wording,
  contact heading, and the source hero heading/video. The adjacent 21+ notice and explicit
  no-purchase disclaimer keep the preview’s informational boundary visible.
- Retained the protected Resend/Turnstile form, privacy route, noindex controls, and dev-only
  Cloudflare route.

## Validation checklist

- New session: gate visible, background inaccessible, confirmation focused.
- Confirmation: gate closes, page receives focus, hero video begins only after acceptance.
- Session reload: confirmation persists; new session behavior remains gated.
- No choice: normal external leave-site link; no hidden bypass or tracking.
- Desktop and 320px mobile: no horizontal overflow; modal content and actions fit.
- About/category images retain frame geometry and do not distort.
- Keyboard: Tab remains within the gate until confirmation.
- Build/type/audit/dry-run and unit suite pass before deploy.
- Live version identity, noindex headers, age-gate HTML, assets, and route behavior must match
  the pushed commit after deploy; the exact version is recorded in the release handoff.

## Limits

This is a source-fidelity and functional audit, not legal advice or certification that the
age gate meets every jurisdiction’s requirements. Current inventory, hours, external order
availability, licensing of stock media outside the owner-provided backup, physical-device
screen-reader coverage, and production launch remain separate review items.

## Local browser evidence

- At 320×800, the gate had zero horizontal overflow, the full logo and copy fit, and focus
  moved Yes → No → Yes without entering the inert page.
- Before confirmation, `main` was inert and the hero video had no `src`; only its local
  `data-src` existed. After confirmation, `main` was restored and the 1920×1080 source
  hero played muted.
- Reloading at 1440×900 in the same tab kept the session confirmation and displayed the
  exact header logo, restored portrait layouts, six source icons, and three-column geometry.
- Full-page Chromium inspection found no horizontal overflow at either audited viewport.
- Automated quality passed with 27 tests, zero Astro/type diagnostics, the static artifact
  audit, and the Wrangler dry run.

## Dev edge evidence

- The first source-parity deployment produced Cloudflare Worker version
  `d1093ba8-3799-453b-8332-a3167a6d48b3` at `dev.neoncitysmokeshop.com`.
- Edge requests returned `200` for `/`, `/privacy/`, `/robots.txt`, `/version.json`, the
  restored full logo, and the restored MP4; an unknown route and `/sitemap.xml` returned
  `404` as intended for the non-indexable preview.
- Every checked response carried `X-Robots-Tag: noindex, nofollow, noarchive`; the MP4 and
  restored logo used `video/mp4` and `image/webp` content types.
- The edge HTML contained the age-gate questions and all principal source-derived section
  headings. A fresh Chrome session visibly opened on the gate; after accepting, Chrome
  rendered the original header logo and hero footage, the framed About portrait, and the
  three-column category layout with all six original icons.
- The final release handoff records the subsequent documentation commit and Cloudflare
  version so Git, `/version.json`, and the deployed Worker can be compared exactly.

## Detailed parity follow-up

- Removed the invented hero subtitle and call-to-action so the hero contains the original
  heading over `Neon-Final.mp4`, matching the source homepage.
- Matched the source age-gate line break and “Yes I am over 21” label while retaining the
  session-only confirmation note and stronger background isolation.
- Restored the original 38.96-second colored-smoke contact video. It is requested only after
  age confirmation and only when the section is visible; reduced-motion, data-saver, 2G,
  visibility, failure, and manual pause states keep the poster as the fallback.
- Restored the complete source contact paragraph, sticky masthead treatment, source homepage
  title, About button label, category-to-contact section order, and footer location, hours,
  phone, email, Instagram, TikTok, copyright, and designer attribution.
- Kept the protected development contact form immediately after the source-derived homepage
  sections because it is part of the approved migration work. The source Order Online button
  is an external QuickVee handoff; the preview has no local cart, checkout, inventory, or
  purchase processing.
