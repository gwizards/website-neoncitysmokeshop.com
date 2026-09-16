# Design correction — 2026-09-16

The user correctly identified that the initial lime/charcoal design did not match the
source website. Inspected https://neoncitysmokeshop.com/ visually in Chrome after its
automatic connection check, including the hero, navigation, light about section and
black information/product section. Read DOM-derived computed heading styles.

Observed: Montserrat 800 headings (85px desktop hero, 42.5px section headings), Roboto
body copy, cyan rgb(51,189,196), magenta accents, a 250×98 header logo, centered hero,
light-gray two-column section, black section and multicolumn footer.

Applied those typography, brand, layout and color characteristics to the approved
non-promotional support preview. Replaced the invented lime design and abstract orbit
art. Updated the email notification accents to cyan as well.

This is not an exact visual clone: smoking photographs, product promotion, ordering
links and sales sections are excluded. Hero background is a neutral dark gradient;
the image panel contains the business logo; navigation and copy serve administrative
support. These differences are intentional and must not be described as pixel-perfect fidelity.

Logo and Latin WOFF2 files were copied from the verified SiteGround backup:
- `wp-content/uploads/2023/09/cropped-NEON-CITY-COLORS-1-768x301.png.webp`
- `wp-content/uploads/elementor/google-fonts/fonts/montserrat-jtusjig1_i6t8kchkm459wlhyw.woff2`
- `wp-content/uploads/elementor/google-fonts/fonts/roboto-kfo7cnqeu92fr1me7ksn66agldtyluama3yuba.woff2`

Google Fonts OFL notices are included with the self-hosted fonts, obtained from the
Google Fonts repository's `ofl/montserrat/OFL.txt` and `ofl/roboto/OFL.txt`.
Desktop and 390px mobile layout reviewed in Chrome; no horizontal page overflow.
Existing support submission controls, Turnstile verification, dev recipient and
preview indexing policy retained. No new test emails needed for this visual revision.

Deployment verified: `3e1f3175-3d18-47de-8135-a4fcf63ead3c`.
Source SHA-256: `c641f0bd6d9611d35712402de0128b51448086318b51c0612e3f1714e624a4ba`.
Build time: `2026-09-16T17:17:41.503Z`.
15 tests, framework/types, artifact audit and Wrangler dry run passed.
Live route/noindex/error checks passed; live source identity matches the local build.
