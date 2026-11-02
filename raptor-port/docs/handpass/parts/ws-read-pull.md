# The fresh blind Opus read of commit c40723cc4 (the pull past an end day no touch was read for) — 3 Nov 26

A fresh Opus reader that did not write the change (D790), handed the commit, the problem and five questions; the
owner's demo-data exclusion (D56) in its brief. Verdict as returned, condensed by the host to its findings (nothing changed in meaning):

**Sound:** programmatic writes (landing, scroll hold, glide re-land, arrows) are clamped to 0..max, so none can start a pull;
desktop, the Scheduler Board and a page switch reset the reading; View-only / Edit swap the strip element, which resets it; no
double cross (a read touch's end resets; every cross starts 700 ms of quiet); the glide's frozen copies only ever reset the
reading; the two width reads come before any write in the frame — no added layout; the clock guard is harmless; without
`?swdebug` the log changes nothing.

1. **HIGH — a flick inside the week can cross falsely.** "No scroll for 100 ms" is read as rest anywhere within half a day of
   the end, so one late frame mid-flick (380 @50, 180 @66, then -28 @176, -36 @192, -30 @208) arms the pull at 180 and crosses on
   the next 6 px. Fix: a gap counts as rest only within EDGE_SLOP (24 px) of the end; keep the slow-easing case; a test with a
   110 ms gap mid-flick.
2. **MEDIUM — it can cross while the finger is still down.** A 3 px retreat cannot tell a release from a finger easing back.
   Fix: a proportional spring-back, at least max(3, 0.4 × the overshoot); a test of a held pull wobbling 3–5 px.
3. **MEDIUM — Sunday may still fail.** His log's Sunday overshoots were +10 to +16, the mark is 12; Monday needs 24 px from its
   rest (12 in), Sunday 12. Fix: measure from rest, or lower the mark (~8).
4. **LOW–MEDIUM — a browser cancel after 10–23 px loses the pull.** The cancel resets the pull reading; the finger then pulls on
   unseen. Fix: reset only on a normal touch end (or a cross).
5. **LOW — tests.** "too short to cross" passes without its reset when run alone (add a scroll at 12 before the touch); "two
   pulls in a row" never arms its first pull (make it reach the mark, or rename); the flick test has no gap frame.
6. **LOW — a repaint mid-pull could finish a pull early** (the scroll hold writes back a clamped position). Unverified; the
   day-follow repaint fires only when the day at the left changes.
**Note:** the sparse scroll events in his log may partly be the log's own cost; re-check the marks with it off.
