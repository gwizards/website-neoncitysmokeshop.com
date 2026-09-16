# Neon City information and support

Approved non-promotional Astro website at https://dev.neoncitysmokeshop.com.
This is a development preview, not a full replica or replacement of the commercial WordPress site.

## Development

Node 22.12+ is required. Run `npm ci`, `npm run types`, then `npm run quality`.
Use `npm run dev` for Astro UI development. For Worker behavior use `wrangler dev`
with a local-only configuration whose origin/expected hostname match the local server.
Never widen the deployed expected-hostname allowlist to include localhost.

The real widget sitekey is public in `shared/site.ts`. Set `RESEND_API_KEY`,
`TURNSTILE_SECRET`, and `RATE_LIMIT_PEPPER` in ignored `.dev.vars` for local API work.
`.dev.vars.example` contains placeholders. Cloudflare secrets are configured separately.

## Preview delivery

The Worker `neon-city-support-dev` serves static Astro assets and `/api/contact`.
Messages go to `fernando@wizards.global` for development review. The visible email
alternative is the source site's public administrative address.
The sender is `Neon City Support <neoncity@updates.wizards.us>`.
No automatic visitor confirmation is sent.

Deploy only with this repository's `wrangler.jsonc`. It contains only the dev custom
domain and disables workers.dev and version preview URLs. The root and www website
are not part of this deployment. No production configuration is provided.

## Verification

`npm run quality` runs framework/type checks, security and email-contract tests,
static build, preview artifact audit, and a Wrangler dry run. `docs/edge-validation.json`
records the live HTTP checks. `/version.json` identifies the source by SHA-256 and
Git commit. `committed` is true only when the build starts from a clean Git checkout.
The development branch is `codex/support-dev`.

## Backup

The original SiteGround files and database were exported, packaged, uploaded to
[the private Drive recovery folder](https://drive.google.com/drive/folders/1VbAbuEw1kr88pwfRLwQdxLpF488DdwN0),
then downloaded and checksum-verified. The folder includes reconstruction instructions.
No database export, customer data, credentials, or backup archive belongs in this repository.

## Release and rollback boundary

Only the `dev.neoncitysmokeshop.com` custom domain points to this Worker. Subsequent
dev releases can be rolled back with `wrangler rollback <version-id>` after confirming
the target with `wrangler deployments list`. Rollback of code does not roll back secret
values or DNS. Initial launch can be withdrawn by removing this dev custom domain;
do not remove the zone, apex/www records, or unrelated Workers. Production restoration
from the SiteGround backup is a separate procedure and has not been rehearsed.

## Decorative video

The current preview uses the abstract colored-smoke footage recovered from the
original SiteGround backup, re-encoded without audio. See `docs/ORIGINAL-VIDEO.md`
for provenance, original section mapping, and reproduction commands.
The earlier generated-curve asset and generator remain available as a fallback.
