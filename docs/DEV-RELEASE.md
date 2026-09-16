> Superseded visually by [the design correction](DESIGN-CORRECTION.md). This receipt records the initial form launch.

# Dev release receipt — 2026-09-16

URL: https://dev.neoncitysmokeshop.com/

- Cloudflare account: Wizards (`b1f3256ea310e5e1accb187d34911ebe`).
- Worker: `neon-city-support-dev`.
- Final version: `daa8abb0-9628-4598-987b-54f6f785f1d2`.
- Source SHA-256: `1a1402e137c1c0c414fa65d08b24c73b02136a9dee46f70c1d0e6b11b814795d`.
- Build time: `2026-09-16T17:10:22.303Z`.
- Branch: `codex/support-dev`, unborn; no commit, push, or merge performed.
- Remote: `https://github.com/gwizards/website-neoncitysmokeshop.com`.

## Passed

- Astro/type checks: zero errors, warnings or hints.
- Fifteen Worker tests covering validation, injection, origins, bounds, rate limiting,
  Turnstile action/host/boolean checks, provider failure, email payload, context escaping,
  idempotency keys and preview headers.
- Build, static artifact audit, Wrangler dry run; dependency audit: zero vulnerabilities.
- Live HTTP 200 for home/privacy/robots/version, correct 404s for missing pages,
  sitemap and llms paths, 405 for non-POST contact; noindex headers across all cases.
- Live foreign-origin and missing-token submissions rejected with 403.
- Real Turnstile/Resend submission through built local Worker: success; provider Delivered.
- Local-only replay fixture: first submission succeeded; identical spent Turnstile token
  returned `403 verification_failed`. The fixture is ignored and was never deployed.
- Live public dev form submitted successfully after the user explicitly approved
  completing its interactive Cloudflare checkbox.
- Resend confirmed **Delivered** for the live submission:
  `01a0ab32-eaf0-716d-a667-57b53fee084a`.
  [Provider receipt](https://resend.com/emails/01a0ab32-eaf0-716d-a667-57b53fee084a).
- Recipient: `fernando@wizards.global`. Reply address, branded HTML/text notification
  and Wizards Services attribution verified in the provider preview.
- Desktop and mobile browser inspection; 320px/390px layouts checked for horizontal
  overflow, with compact Turnstile for narrow screens. Mobile input text is 16px.

The earlier DNS NXDOMAIN cache cleared; final HTTP and browser checks used normal
hostname resolution and TLS. No resolver settings were changed.

## Boundaries and follow-up

This release is the approved **non-promotional support preview**, not a full commercial
site clone or production migration. Root/www DNS, production website and mail routing
were not changed. The form is explicitly a dev test and routes to the owner review inbox.

Provider Delivered means the recipient mail server accepted the message; the user's
mailbox placement/read status and a real reply have not been independently verified.
No full backup restore rehearsal or comparative Core Web Vitals study was performed.

Portfolio enrollment is documented but not applied to the already-dirty root registry
and governance files. Those changes require integration with the existing root work.
The broader original migration goal is therefore not reported as fully complete.

## Rollback

Use the repository's dev-only config and inspect `wrangler deployments list` first.
The immediately preceding dev version is `c87c4e2d-5224-4af8-9a86-bbd3ccef33f4`.
Code rollback does not revert secrets or the dev custom domain. See README for initial
launch withdrawal boundaries. Never apply rollback to the apex/www WordPress website.
