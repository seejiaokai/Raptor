# Evidence — the night of 3 Nov 26: the swipe across weeks, the keyboard leftovers, the schedule's React Doctor warnings

Branch `claude/week-swipe-pdf-print` (its name kept from the plan; [PDF-PRINT-TWICE] was skipped on his word, 3 Nov 26).
Tier: **WALK** for the batch — a changed gesture (the swipe), keys added to existing controls; no published record, saved
data, roles or warnings (bug-check-order §5, questions 1–3, 7, 8 answered NO: nothing here writes, publishes or decides who
may do what; 5 YES — a gesture's reading and new keys).

## 0. The jobs
1. **[WEEK-SWIPE-CROSS]** — his iPhone recording, 3 Nov 26 00:05 (frames `raptor-port/docs/img/handpass/2026-11-03-week-swipe/owner/`).
2. **The keyboard leftovers** — [BOARD-OPEN-BY-KEYS]; [VEILED-WINDOWS-BAR]'s Escape part (the board's small menus, the
   Traffic and day-details windows). His word: "Skip the pdf replace with something else" — the agent's pick, the job offered.
3. **The schedule's React Doctor warnings** (D1534, D490 — they ride with the area's batch), after D1572's full run.

## 1. Job 1 — the builder's report (a fresh Opus helper, saved as it arrived, commit `4b377ec6e`)

**Reduce Motion ruled out** (his answer: off), and the glide does run on his iPhone: frames f02.75 and f06.50 of his
recording catch the two copies near the end of their slide.

**Why the cross felt abrupt (`ui/weekglide.ts`):**
- A1 — the leaving copy jumped back first: snapped to the day's resting place, not where the day stood (Sunday stood at 24px,
  its copy went up at 12; on the iPhone the jump would be Safari's whole pull past the end, about 80px in his recording).
- A2 — each copy snapped itself: the copies carry the week's class and so its scroll-snap; the arriving card drifted 12px
  mid-slide and settled 12px off where the real day rests, so the day hopped again as the copies came off — both directions.
- A3 — the slide was too fast: about 3.9px/ms at the start, three-quarters across in about 100ms; the browser's own snap for a
  within-week swipe peaks at about 2.3px/ms. At his recording's four frames a second a 280ms slide is one frame.
- A4 — Monday landed 12px off its snap point (0, where Monday's point is 12px in); Safari does not re-snap after a scroll the
  page writes (the snap-hold note), so on the iPhone Monday would sit 12px off.

**Why the swipe sometimes did not cross (`ui/pan.ts`):**
- M1 — a second swipe while the week was still settling: the week was 139–197px out, not read as at the edge.
- M2 — a short quick flick (under 45px) never crossed at the edge (both engines).
- M3 — direction judged on the whole path: a thumb's arc curling down (70 across, 80 down) was refused; the same rule crossed
  weeks on a drag begun down the day that drifted sideways (a second fault, found by the new test).

**What changed:** `pan.ts` — the end day counts while the week is still moving toward it (within half a day and 150ms); a
flick of 24px or more crosses if it is still moving at 0.3px/ms over its last 100ms; direction from the first 10px, held;
`weekLanding()` the one reading of where a cross lands. `weekglide.ts` — the leaving copy keeps its live place (a pull capped
at a quarter of a day); neither copy snaps; landing from `weekLanding`; 340ms from about 2.4px/ms, easing out.
`EditWeek.tsx`, `ViewWeek.tsx` — the Monday and Sunday landings use `weekLanding`. Tests: `e2e/weekswipe.spec.ts` (new,
registered in `playwright.config.ts`), `src/ui/swipeweeks.test.tsx` (+6), `src/ui/weekglide.test.ts` (+2; one timing 400 →
470ms for the longer slide). Records: `docs/ui-contracts.md` (the bullet after the snap-hold), `docs/file-map.md`.

**Red first:** 4 of the 6 new swipe unit tests failed on the old reading (the other 2 pin what must still not cross — at
rest, a slow drag, a held flick, a jiggle); both new glide tests failed (offset 0 where 60 expected; start 3.86px/ms); the new
browser spec failed its 4 new cases on the old code (the within-week guard passed); A2 shown red on an intermediate build.
**Now:** the browser spec 5/5, and 20/20 at 3× CPU slowdown; 13 existing week, arrow and board browser tests alongside;
63 unit files near the landing, 1,395 tests; build clean; `lint:changed` no new finding; docsize OK.

**The builder's own check by finger** (Chromium by real touch, 402 × 874; WebKit by touches inside the page with a
frame-position trace): Mon 13 → Sun 12 slow, back by a 40px flick; Sun 19 → wave-dense Mon 20 slow; Mon 20 → Sun 19 begun
on a wave block; Sun 19 → Mon 20 by flick; Tue 21 → Mon 20 and straight on to Sun 19; Wed → Thu inside the week one day
(390px), no glide. WebKit: the leaving copy goes up where the day stood (0 Monday, 24 Sunday), the arriving copy ends where
the real day rests, both directions; a 40px flick crosses, a slow 34px drag does not. Pictures
`raptor-port/docs/img/handpass/2026-11-03-week-swipe/build/` (`chromium-1…7`, `webkit-1`).

**Only his iPhone can show:** whether Safari reports its pull past the end as a scroll below 0 (if so the leaving day holds
it; if not, no worse than before); the feel of the 340ms pace; the 130–190ms pause after the lift while the week loads
(Safari's bounce plays in it — not changed); iOS momentum — whether a short flick and a swipe during settling now cross every time.
**A possible later step, not built:** put up the frozen copy of the day being left the instant the finger lifts, before the
week loads — within the settled design, more moving parts; wait for his look first.
**Seen in passing (older, not this job's):** old previews of other chats still hold ports 4179, 4180, 4188, 4191, 4197, 4290,
4301, 4311; the `?kbdebug` readout writes only on focus, resize and the visible screen's scroll — no frames lost to it.

## 2. The lesson (D1297)
`bug-check-order.md` §7.11 lesson 20 — a gesture walked once, slowly, pictured only at rest.

## 3. React Doctor's full run (D1572), 3 Nov 26, `main` at `0becbf0e7` plus the night's records
742 findings: 1 error — `no-eval` in `reference/probes/tdrag.js`, read-only, left (as D1572 found) — so the app's own errors
stay 0; 741 warnings (performance 427, bugs 72, security 1, maintainability 139, accessibility 102 — by the tool's groups).
By place: `src/ui` 333, `src/engine` 105, `docs` (old walk and mock-up scripts) 119, `reference` 66, `src/state` 58,
`scripts` 32, the rest 29. The schedule's own screens and windows carry about 65 (job 3); the input window's 91
(`ui/inputedit.tsx`) ride with the next Inputs batch.
