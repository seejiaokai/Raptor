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

## The narrow read of the fix round, commit d1e34600b — a second fresh Opus reader (3 Nov 26)
All 34 swipe tests pass, each new one alone too. Sound: the cross check before the clearing; a release is never missed (rest
lies past the let-go mark); a cancel the touch reading crossed on cannot cross twice; the flick's turnaround, the snap easing
in, the easing back after a short drag.
1. **MEDIUM — a cancelled short tug crosses where a touch end would stay.** Monday armed at rest; a touch to dx 20, strip -14;
   Safari cancels (stay); on release -12 arms and -4 crosses. Fix: on a cancel that stays, keep the strip's position, and arm
   only a pull that goes PULL_OVER further out than it; a red test (cancel at -14, then -12, -4, 12 → stays).
2. **LOW–MEDIUM — one late frame within 24 px of the end still fakes a rest** (414, 300, 160, 20, then -30 after 110 ms, -38,
   -22 → crosses), on an unread flick or the momentum after a read one. Fix: a gap counts as rest only if the strip also
   arrived at that place slowly; a test.
3. **LOW — dead code.** The `pullSide = 0` clearing can never run (an armed pull crosses before the strip is half a day in),
   so a held finger dragged back into the week crosses — not tellable without touches; delete it or correct the comment.
   The Monday cross has no `return`, Sunday's has — match them.
4. **LOW — a held finger at the shallow end** (12, 0, -9, -5: a 4 px wobble) crosses on max(3, 3.6). Fix: a floor of 6.
5. **LOW — a double cross possible since c40723cc4:** a touch seen, then silent over 1 s; the scroll reading crosses; a late
   touchend crosses again. Fix: clear the touch being read in the scroll reading's cross.
Tests: "two pulls in a row" holds one pull — rename; "read afresh" never arms its first pull — cannot be tested (an armed pull
always crosses).

## The last narrow read, commit 623178b30 — a third fresh Opus reader (3 Nov 26)
38 / 38, each new test alone too; each of the four new tests would fail on the code before (worked by hand). Sound: (f) the
cancel's standing place, both ends, cleared at the right times; (h) clearing a silent touch at a strip cross; the dead
clearing gone and its comment true; the in-week snap onto Monday, a spring-back onto Monday, a cross's landing and a page
switch all still arm; the originally reported case (easing in at ~0.06 px/ms) still caught.
1. **HIGH — fix (e) missed a pull begun by catching the glide in its last few px** — the very moment Safari swallows the touch:
   the glide's tail runs 0.2–0.45 px/ms (over PULL_REST), the finger stops it, the strip stands, then the pull; the stand's
   arrival was judged by PULL_REST, and the slow frame after it skipped by `else if`. Fix: a separate arrival limit (about
   1 px/ms) and the easing test on its own `if`; the sequence as a red test.
2. **LOW — no test of a real snap tail before a rest** — add one.
3. **LOW — nothing pins (f)'s other half** (a cancel past the end, then an unseen further pull, crossing) — add one.
Fixed in the next commit, the three tests with it (the first red first); the third fix round, the last (§5's cap) — no
further read; what carries the rest: the 41 swipe tests and his iPhone look.
