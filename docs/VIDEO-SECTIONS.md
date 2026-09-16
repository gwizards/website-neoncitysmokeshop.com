> Superseded media: see `ORIGINAL-VIDEO.md` for the backup-sourced replacement.

# Video and support section expansion — 2026-09-16

Approved non-promotional preview continued with original abstract neon footage,
not the original website's smoking footage.

## Added

- Original silent 8-second 1280×720 H.264 loop, 311,768 bytes, with fast-start metadata.
- Local WebP poster, muted inline playback, loop, and an explicit pause/play button.
- Video is not fetched automatically when reduced motion or Save-Data is enabled,
  or the browser reports a 2G connection. Explicit Play remains available.
- Video pauses offscreen and in a hidden tab. Explicit pause is preserved.
- Native playback rejection leaves the Play control available. Video errors retain
  the poster and hide the unusable control. No third-party video player or embed.
- Six support navigation cards around the original logo.
- Four native keyboard-accessible FAQ disclosures.
- A contact banner and anchor navigation to the existing support form.

The loop is generated from mathematical curves and colors by
`scripts/generate-neon-video.py` (NumPy, Pillow, FFmpeg). There is no external footage,
voice, music or product imagery, and no asset license purchase is involved.
Captions are not applicable to a silent decorative background; the video is hidden
from assistive technology while the playback button has a readable accessible label.

## Validation

- Desktop browser playback, pause/play, offscreen pause and FAQ keyboard toggle passed.
- 390px mobile layout inspected; no horizontal page overflow.
- Unit coverage exercises reduced-motion/Save-Data loading prevention, explicit play,
  user-pause preservation, autoplay rejection and video-error fallback.
- Existing form tests remain part of the quality suite. No further test emails sent.
- Source metadata verified with ffprobe: one H.264 video stream, no audio stream,
  eight seconds, 1280×720, 311,768 bytes.

Reduced-motion/Save-Data and network-failure branches were tested with mocked browser
interfaces; no claim is made of physical-device or WebKit testing.

Deployed version: `7b255113-77dc-4ae7-8a18-9c994663eee4`.
Source SHA-256: `5dbc69f53ba757ecbe82f07ce4d8e8e25149a01fc67a1ea1933671608de9e0b2`.
Live source identity verified; build, types, artifact audit, dry run, and all 20 tests passed.
