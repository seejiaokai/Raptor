# A man held at the week's side steps the week a day — his D1529 (31 Oct 26)

**The job:** `[WEEK-DRAG-EDGE-PAN]` — on Edit Schedule a man carried with the mouse could only be dropped on a day already in
view: held at the week's left or right side, the week never moved (found 30 Oct 26, the arrows' walk). Put to him first with
two marked pictures and three choices (https://claude.ai/artifact/313NUfzzM3XrGKu6T3QYbv); his answer *"A — a day at a time"*
(D1529). Branch `claude/jolly-volhard-4458db`, pull request 595.

**What was built:** `src/ui/drag.ts` — a frame loop for a mouse drag on Edit Schedule above 820 wide (`weekStepLoop`): held in
the app's mouse edge band (`src/ui/edgescroll.ts` `EDGE`, 36px) at the week's side — over the week, a ‹ › arrow, or the board's
bare margin beside the week — for `WEEK_STEP_WAIT` (500 ms, counted from where the week last came to rest), the week steps one
day through `src/ui/pan.ts` `panDays` (the arrows' own step); `panDays(dir, false)` stops at Monday and Sunday instead of loading
another week. The band the man was picked up in is dead until left. While the week glides the cell under the pointer is read
again. The finger's drag, the board's phone layout and the up-and-down edge scroll are untouched.

## The eight questions and the tier

1. Money — no: nothing about OIL or counts; the drop path (`applyDrop`) is unchanged, only where the week stands when it runs.
2. The published record — no: same reason; a drop on a published day goes through the same door as before.
3. Saved data — no: nothing stored changes.
4. A shared drawer — no: no drawing routine changes.
5. A new gesture or mode — **yes**: holding a carried man at the week's side now does something.
6. A new surface — no.
7. Roles — no: the drag exists only on Edit Schedule, as before.
8. The warning list — no.

**Tier: WALK** (question 5). Told to him before the work started.

## The roll-call

| Place the week can be moved from | Has it / must not, because… |
|---|---|
| Edit Schedule, a man from the crew panel held at the week's right side | has it (W1, W2, W4, X1) |
| Edit Schedule, a man from a seat held at the left side (over ‹) | has it (W6, W7) |
| Edit Schedule, crew panel hidden, held at the window's right edge | has it (W12 — missing at first, fixed) |
| The ‹ › arrows pressed | unchanged (W13; `pan.test.tsx`) |
| View-only Sched | must not — it has no drag |
| Below 820 wide (no desktop arrows) and a phone | must not — the ruling covers the desktop mouse; the finger's drag unchanged (Y1; `weekdragstep.test.tsx` "a finger's drag is unchanged") |
| The Scheduler Board over Edit Schedule | must not — the side counts only over the week, an arrow or the board's bare margin (the code read's question) |

**The door check (a gesture):** the one action — "move the week while carrying a man" — has its control on screen in every
state the week can be in: the ‹ › arrows (pressed), and now the side of the week (held). A keyboard way: none for a drag, as
before (the design guide's rule names the drag as mouse or finger).

## The sizing (§7.0)

1. **Type:** C — a new gesture.
2. **What only a walk could find:** the real glide's timing against the wait; the crew panel's edge, the arrows and the
   changes window at the week's side; the crew panel hidden (§7.11 lesson 17); a second desktop size (lesson 11); a fast and a
   slow pass (lesson 2); a window open (lesson 4); the drop after steps.
3. **The ledger:** type C walks have found faults in the states nobody set up (the 24 Oct 26 row: a quick swipe, a placed bid).
4. **The walk chosen:** the host alone, one script on the built bundle, real mouse: 14 steps at his PC's 1536 × 730 at 1.25,
   one at 1366 × 700, one at 800; the deciding pictures opened by the host. Carried by tests: the timing edges (exactly when the
   first and next step come), a finger's drag, the band picked up in — `src/ui/weekdragstep.test.tsx`, which drives the real
   pointer machine (pointer events through `onPointerDown/Move`), not the scroll directly.
5. **The row:** added to `docs/walk-ledger.md`.

## The walk — `scripts/handpass/week-drag-step-walk.mjs`

First run (`docs/img/handpass/2026-10-31-week-drag-edge-pan/walk/`): 15/18, then 17/18 after a script fix — two faults:
- **W1 — the day never stood still between steps.** The wait was counted from the press; a glide takes about a third of a
  second, so the next step began a moment after the week landed — not what he was told ("between steps the day you are aiming
  at stands still"). **Fixed red first:** the wait restarts on every frame the week moves (`weekdragstep.test.tsx`, "the day
  stands still a full wait after the week lands").
- **W12 — with the crew panel hidden, the window's edge did nothing.** The last 26px at the window's right edge are the board's
  own margin, not the week, and the side counted only over the week or an arrow. **Fixed red first:** the board's bare margin
  counts (`weekdragstep.test.tsx`, "with the crew panel hidden, the strip beside the week…").
- Two script faults, not the app's: W1/W6 read the week mid-glide (gone with the W1 fix); W12 picked a day with no man on screen.

Re-walk (`…/rewalk/`): **18/18**.

| # | Check | Result | Picture |
|---|---|---|---|
| W1 | held at the right side: nothing for the first moment, then one day (851 ms after arriving), Tuesday at the front | PASS | `rewalk/w1-one-day.png` |
| W2 | still held: a second day; moved away, it stops on a whole day (Wednesday) | PASS | |
| W3 | away from the side nothing more moves | PASS | |
| W4 | after the steps the Thursday cell under him is marked, and he lands there | PASS | `rewalk/w4-over-thursday.png`, `rewalk/w4-dropped-thursday.png` |
| W5 | a fast pass and a third-of-a-second pass through the side move nothing | PASS | |
| W6 | held at the left over ‹ (it slides out): back a day, Wednesday at the front | PASS | `rewalk/w6-left-one-day.png` |
| W7 | held on: back to Monday and stops; no other week loads | PASS | `rewalk/w7-monday-end.png` |
| W8 | Sunday at the front, held at the right: nothing; no other week | PASS | |
| W9 | held over the crew panel beside the week: nothing | PASS | |
| W10 | the page scrolled 600 down: the side still steps | PASS | |
| W11 | held over the open changes window at the week's side: nothing | PASS | `rewalk/w11-over-window.png` |
| W12 | crew panel hidden, held at the window's right edge: one day | PASS (after the fix) | `rewalk/w12-panel-hidden.png` |
| W13 | a press of › still moves one day | PASS | |
| W14 | no page errors at 1536 | PASS | |
| X1 | 1366 × 700: held at the right, one day | PASS | `rewalk/x1-1366-one-day.png` |
| X2 | no page errors at 1366 | PASS | |
| Y1 | 800 wide: a mouse held at the right moves nothing new | PASS | `rewalk/y1-800-wide.png` |
| Y2 | no page errors at 800 | PASS | |

**Met in passing, older, not this change's:** (1) Escape does not cancel a mouse drag — the walk's "Escape, then let go"
dropped the man where the mouse was (the Thursday "changes" in the later pictures); nothing in `drag.ts` listens for Escape.
(2) The arrows remember where their last press was heading; a week moved back inside that span by something other than a wheel
or the foot bar (a warning click, a script) makes the next press count from the old target — `pan.ts`'s own documented
residual. The walk script resets it as a hand's wheel does.

## Tests and break tests

- `src/ui/weekdragstep.test.tsx` — 10 (4 red before the build; 2 more red before the walk's fixes).
- Break tests, each caught: the drag allowed to cross into another week (2 failed); no wait (5 failed).
- `src/ui/drag.test.tsx`, `src/ui/pan.test.tsx` — green with it (109 in the three files).
- `e2e/geometry.spec.ts` "the week pans by whole day boxes" — 3/3 in Chromium at 1536 × 730, the new test among them.
- GitHub's run of pull request 595: green on the first push; the last push's run — see the closing report.

## The code read

A fresh, blind Opus reader (D790), given the ruling, the diff, this sheet's walk and the exclusions (D56; the two older items
above). Its findings and their dispositions: below.

## Not walked, and why

- A finger: the ruling is the mouse; the finger's path is untouched in code (`tdArm` starts the loop only for a mouse) and a
  test carries it. A phone shows no desktop week arrows and no side band.
- WebKit (his iPhone's engine): no mouse drag on a phone; the desktop is Windows.
