# Evidence sheet — the Tracker's chart scrolled by the phone itself, the pinch as a picture (`[TRK-CHART-FPS]`, D992), 18 Oct 26

Branch `claude/trk-chart-fps`. Built by Opus 5.5 in this chat; read by a fresh, blind Opus reader (D790). The walk:
`scripts/handpass/trk-fps-walk.mjs` (real fingers through Chromium's touch input, and a real mouse, on the production
bundle), its pictures `docs/img/handpass/2026-10-18-trk-chart-fps/walk/`, its results `docs/handpass/parts/trk-fps/walk.json`.

## Questions waiting for him

None. His look on his iPhone carries the lines only a real device can prove (the last section).

## Why — what was measured before anything was built

His report (17–18 Oct 26): the chart looks choppy when it moves; it is the chart's finger scroll; his phone is an iPhone 17
Pro (a 120-frame screen) and he opens the app in Chrome. Found: Safari on such a phone draws a page's own motion near 60
frames by default ("Prefer Page Rendering Updates near 60fps"), and Chrome on an iPhone (Apple's WebKit underneath) holds it
there with no setting; the iPhone's own scrolling runs at 120. The chart's scroll was the app's own (the glide of
`[TRK-SCROLL-GLIDE]`), so it was held at 60. **His test:** in Safari with that setting off, the chart scrolled smoother —
"Ok it's smoother now on safari" — then "The scroll is smoother than the pinch. The pinch feels like slower FPS".

Measured here (390 × 844, a finger through Chromium's touch input, frames a second while the gesture runs; the computer
slowed by the factor shown; the same script, `fps` below, on the old build and the new):

| Gesture | Before — normal / ½ speed / ¼ speed | After — normal / ½ / ¼ | Why |
|---|---|---|---|
| A finger scroll | 60 / 60 / 60 | the phone's own scroll (this test browser shows the page's frames at 60 / 59 / ~50 while it moves; the scroll itself runs off the page's drawing) | before: drawing was cheap — the only limit was the 60-frame hold on a page's own motion |
| A pinch | 59 / 24 / 12 | **60 / 59 / 30** | before: each step of the fingers set the chart's zoom and laid the whole chart out again (about 80 thousandths of a second a step at ¼ speed, against 33 for a scroll step); after: one transform a step, one layout at the lift |

At ¼ speed the two slow frames left in a pinch are its start (the measure of the transform's pixel) and its lift (the one
layout); the frames between them hold. The test browser here draws at 60, so 120 can be seen only on his iPhone.

## The eight questions and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL) | NO — scrolling and zooming move no mark, date or credit. |
| 2 | The published record | NO — the Tracker has none; nothing is written. |
| 3 | Saved data | NO — nothing stored changes; the zoom and the scroll place are not saved. |
| 4 | A shared drawer | YES — `dragScroll` serves two places (the chart's board and the Info half). |
| 5 | A new gesture or mode | YES — a finger is now the browser's scroll; the pinch draws differently while it runs. |
| 6 | A new surface | NO. |
| 7 | Roles | NO — the Tracker reads no role (D121). |
| 8 | The warning list | NO. |

**Tier: WALK** (4 and 5), with the fresh Opus code read on top (D790) — a gesture on the most-used Tracker surface.

## The rulings swept

D992 (this job) · D991 (speed is part of how good the app feels) · D985–D987 (the glide, the touch that only stops it, the
bounce — now the phone's own) · D988 (a mouse drag stops where it is let go, never bounces) · D989 (two fingers stop a
glide; the app's own move wins; Edit chart layout untouched) · D134 (the pinch take-back; after a pinch the finger left
down does nothing until it lifts) · D984 (the landing) · D980 (the chart by keyboard — Home / End stop a glide first) ·
D899 (Edit chart layout's edge pan) · D158 (the test browser's tap-after-drag quirk) · the design guide §5 (motion: D987's
bounce, D991's "smooth") · `docs/performance.md` Part 1 (nothing new on a hot path; a transform for the pinch).
