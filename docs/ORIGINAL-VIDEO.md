# Original backup video inspection — 2026-09-16

Inspected the verified SiteGround files archive and the homepage Elementor data
(post 1463) in the SQL backup. The source archives remain outside Git.

| Backup upload | Bytes | Duration | Homepage use |
| --- | ---: | ---: | --- |
| `Neon-Final.mp4` | 22,729,062 | 17.718 s | Hero, Elementor section `6de79f31` |
| `Neon.mp4` | 19,799,869 | 20.954 s | Earlier montage; not referenced by this homepage's active Elementor data |
| `pexels_videos_2324293-720p.mp4` | 7,163,951 | 38.975 s | Contact section `4a90191a`, cyan-to-black overlay at 0.8 opacity |

The two Neon clips contain people smoking/vaping and product imagery. The Pexels-named
clip contains abstract colored smoke; inspected a contact sheet sampled once per second
across its duration. The backup establishes provenance, not an independently verified
stock-license record. Reuse is within the owner's requested migration of site assets.

## Preview implementation

The abstract source replaces the generated curves in the support hero. Its 24-second
frame also supplies the contact banner background and video poster. This is an intentional
placement difference: the original hero used the smoking montage. The approved support-only
preview does not reproduce that montage or the original promotional copy.

Full-duration 1280×720 H.264 at 25 fps, fast-start MP4, no audio track. Original audio
was removed because this is a decorative background. Existing pause/play, offscreen pause,
reduced-motion, Save-Data, and poster/error behavior remain unchanged.

Original SHA-256: `3c65b386d73294f49219b0700ce2a30e785fa346d4351b7ff7328a5b1dec2a62`.
Optimized SHA-256: `7639ef6d894ea94758a8a307938f2d311dcf51152f94359188a600697d355af4`.
Output: 2,196,070 bytes, 38.96 seconds (69.3% smaller than the backup file).
This measures file bytes, not page speed or Core Web Vitals.

Reproduction, with SOURCE set to the extracted backup upload:

```sh
ffmpeg -i "$SOURCE" -map 0:v:0 -an -c:v libx264 -preset slow -crf 27 \
  -pix_fmt yuv420p -movflags +faststart public/video/original-colored-smoke.mp4
ffmpeg -ss 24 -i "$SOURCE" -frames:v 1 -c:v libwebp -quality 80 \
  public/video/original-colored-smoke-poster.webp
```

The earlier generated files remain available but are no longer referenced by the homepage.

## Release verification

Cloudflare dev version: `b3aa69a6-5fb7-4cb1-b346-1a2990b63d7e`.
`npm run quality`: 20 tests passed, framework/type checks clean, static artifact audit
and Wrangler dry run passed. Live Chromium playback reports the new source, 1280×720,
38.96 seconds, muted, playing, with no media error. The live Pause button stops playback
and changes its label to Play. Desktop appearance inspected. No new form emails sent.
Live source checksum matches the build:
`61fb0b6a4afa3a24683165ae53051385003cdbfcac2797e7cc12e5150efd036a`.
The deployed MP4 returns HTTP 200, `video/mp4`, and noindex headers; its complete
SHA-256 matches the local optimized asset. Route and API rejection probes passed
(`docs/edge-validation.json`). No production deployment or Git commit/push occurred.
