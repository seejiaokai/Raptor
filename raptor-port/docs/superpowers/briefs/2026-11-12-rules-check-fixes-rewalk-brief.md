# The re-walk of the rules check's fixes — the walker's brief (12 Nov 26)

You are a Sonnet walker. You drive the running app with a real browser, pressing its own controls, and you take
pictures. You do not read the app's code for bugs and you do not change any file under `raptor-port/src`. The first
walk of this change (three walkers) found faults; they have been fixed. You walk **what the fixes touched**, and nothing
of the rest.

## Read first

1. The first walk's brief, whole: `raptor-port/docs/superpowers/briefs/2026-11-12-rules-check-fixes-walk-brief.md` —
   its sections "Read first", "The build and the machine", "Known traps in the drivers", "Judging" and "Hand-back"
   apply to you unchanged, EXCEPT the build and port below.
2. `raptor-port/docs/walk-scripts.md` (how a walk script is written, and its traps).
3. The first walkers' reports — they show the exact control paths that worked:
   `raptor-port/docs/handpass/parts/2026-11-12-rcf-w1.md` (S03, the AVALON desk) and `…-rcf-w2.md` (two clashes worded
   the same; S29). Their scripts are in `raptor-port/scripts/handpass/rcf/` (`rcf-w1-s03*.mjs`, `rcf-w2-a.mjs`,
   `rcf-w2-d.mjs`, `rcf-w2-lib.mjs`, `rcf-w1-lib.mjs`) — copy and adapt them; do not edit them.

## The build and the machine (this replaces the first brief's port)

- The frozen build of commit `2543c77c4` is served at **`http://localhost:4292/`** (already running; do not start,
  stop or rebuild anything; never run `npm run build`, a Playwright test file or the unit tests). Its main bundle is
  `index-M7uAG4yZ.js` — check your first picture's page loaded it.
- Your scripts: `raptor-port/scripts/handpass/rcf/rcf-rw-*.mjs`. Your pictures:
  `raptor-port/docs/img/handpass/2026-11-12-rules-check-fixes/rewalk/`. Your report:
  `raptor-port/docs/handpass/parts/2026-11-12-rcf-rewalk.md`. Write nowhere else. Do not commit.
- Sizes: desktop 1536 × 864; phone 402 × 874 where a row below says "phone".

## What to walk

Each scenario: set it up through the app's own controls (the first walkers' paths), take a picture at each step, and
read the result off the screen and the page (the list line's class, the puck's class), as they did.

**R1 — two clashes worded the same, one hidden (D2001: a hidden clash stays hidden while the same man is on the same
two items, and comes back when either item is a different one).** Board, a clean weekday. Ranger on a VL BFM line
12:00–13:00 and on a BRIEFING row 12:00–12:30: one red clash line. Hide it (✕). Then make a SECOND clash worded the same
for Ranger — the path W2 used (a second VL BFM line and a second BRIEFING row at 15:00, Ranger on both), or a second
BRIEFING row overlapping the first VL line.
Expected:
- The clash line shows live and red.
- Ranger's pucks ring red on the board and on the week behind it.
Then delete the second BRIEFING row. Expected: the line is struck (hidden) again and his pucks are plain. Then press
the struck line's Reset arrow. Expected: live and red again. Desktop only.

**R2 — a flying shift under Advisory (D1996: a standby line that flies is checked like a sortie; a clash with it is
red).** As W2's S29:
1. Logic → ✎ Edit → under "SC MAIN clashes" untick "another shift" (it reads Advisory).
2. Board: SC wave, AM rally (R) 06:30 typed, PM START 09:00 END 15:00, Ranger on the MAIN seat of both.
   Expected: one RED line for Ranger, his pucks red.
3. Clear AM's R. Expected: the amber line, pucks amber, as before.
4. Type AM's R again, then clear PM's times back and tick the PM row FLIES by hand instead, AM's R cleared.
   Expected: red.
5. Restore Logic ("another shift" ticked, Warning).
Desktop only.

**R3 — the desk of a flying AVALON wave (D1997: once its wave flies, a desk from that wave's template is fully
checked).** As W1's S03: an AVALON wave, "+ Block" → the AVALON desk (SXO 19:00–07:00), Ranger on the desk and on a
VIPER sortie 20:00–21:00.
1. Standing by (no R): no clash line; Ranger's desk puck plain.
2. Type the AVALON formation's R (18:00). Expected: the clash line red, and Ranger's puck ON THE DESK rings red on the
   board AND on Edit Schedule's week — as an ordinary SDO desk's does (W1's control).
3. Clear R. Expected: back to plain.
4. The same with the wave flying by a row's FLIES tick instead of R. Expected: the desk puck rings red.
Desktop, then the step-2 picture again at phone 402 on the board.

**R4 — the Logic page's two changed lines.** Logic → the checks:
- the tight-turn line (Tight turning) must end "…is later, so his rest clears.";
- the "A standby row that flies" line must read "A row that flies has its clashes and turns checked as a sortie's
  are, counts as a jet…".
One picture of each, cut to the line, desktop and phone 402.

**R5 — next week's published Monday and this week's Sunday (D1991: a Logic change never starts a flag on a published
day; it is checked by the settings it was published under).** Only if R1–R4 are done and you still have time
(stop at about 45 minutes of walking either way).
1. Week of 20 Jul: on Monday a VL BFM line, take-off 12:00, landing 13:00, B blank, Ranger on it.
2. Publish Monday, with the four sign-offs, as W1 published Friday.
3. Week of 13 Jul: Sunday — clear Ranger's other tasks, give him a duty desk 13:00–21:30.
4. View-only Sched: Sunday shows no "breaks Monday" mark for Ranger.
5. Logic: raise "Brief before take-off" so the B would print 08:40 (200 minutes).
6. View-only Sched, Sunday: still NO "breaks Monday" mark on Ranger. Monday's published face, next week on View-only
   Sched: no crew-rest line either.
7. Restore the Logic value.
Record what Edit Schedule (the working copy) shows too. This one is RECORD: the working copy may flag; only the
published faces are judged.

## Hand-back

Your report as the first brief's Hand-back says: a table of scenario, controls pressed, PASS / FAIL / RECORD / NOT
WALKED, what the screen showed, pictures; the console errors; what you did not walk. Your final message is that
report's summary with its path.
