# w14c report — the reminder over dates and days (chat 174, 25 Nov 26)

Table: `raptor-port/docs/handpass/parts/swd/w14c-walk.md` (per-scenario summary, finding-candidates, lessons, every step).
Pictures: `raptor-port/docs/img/handpass/2026-11-24-sans-words/w14c/` (125, cropped); raw runs `D:/raptor-work/c174-walk/w14c/`
(`run1` desktop, `run1p` phone, `probe*`). Scripts `raptor-port/scripts/handpass/swd-w14c*.mjs` (uncommitted). Server on 4813
stopped by its port. Recipes appended to `D:/raptor-work/c174-walk/recipes.md` (§From w14c).

## Counts
192 judged steps (96 a size): PASS 138 · FAIL 0 · RECORDED 54 · NOT WALKED 0. Plus 108 set-up steps (all landed), 22 error
watches (none seen), 32 notes. Scenarios: B8 (a)+(b), B8 (c), B8 (c) variant, B8 (d)+(e), B10, B10 step 5, A1, A2 (a)(b)(c),
A5, A7, A10 — both sizes.

## Faults
None. The only red the scripts printed — a2c.3e at both sizes — was the walk's own "no window on a day he cannot file for"
check beside A2's NOT RULED tap; no ruling names it, so it is RECORDED (D2611) and listed as candidate 2 below.

## Probes
- P11 YES — on Sun 19 the Post out sheet moves the Fri 17 posting (already begun) to Tue 21, no refusal.
- P12 NO — no screen door moves a man's home squadron (the one code path, `state/units.ts setHome`, is reached from test
  support only; Admin → Users has no such control). B11 test-only.
- Routes proved: line ✕ / sim ✕ to empty a seat (both sizes), the posting moved to any day from any cell, a filing run across
  the month's end (the window's ›, then Sat 1 Aug), Ranger's own run + top-bar Undo / Redo, Saber's greyed Undo after a
  posting move, a bell line tapped and read back.

## RECORDED finding-candidates (both sizes alike)
1. A2 (b): "Your SANS date moved to Thu 16 Jul. · Saber" opens the SANS calendar on Sat 18, not Thu 16 (the reminder opens Thu 16).
2. A2 (c): "You're no longer SANS. · Saber" (nothing filed) opens Thu 16's day window with "+ Commitment" greyed — a window on a
   day he cannot file for (the plan's EXPECTED said none; unruled).
3. B8 (d): two date-move lines stand after two later moves ("moved to Sun 19" unread + "moved to Sat 18" read); A1 (with
   filings) kept one rewritten line.
4. B10 / P11: a posting already begun can be moved later; his reminder then vanishes, one "moved to Tue 21" line.
5. B10: on Sun 19 the past Sat 18 leaves the reminder ("Mon 20 Jul"), no relight.
6. B10 step 5: the title turns to "Your SANS availability is needed." at midnight without a reload (when the bell next opens).
7. A5: posted again from Sat 18, the B title "You're no longer posted out as SANS." stays over a body shrunk to Fri 17 (now
   untrue), read, not lit; moved back to Fri 17, the line goes entirely.
8. A10: "Fri 17, Sat 18, Mon 20 Jul and 3 more"; on Sun 19 past Fri 17, Sat 18 still lead "It comes back if you're SANS those days again."
9. A lead outside this part, to check: View-only Sched heads "Monday Jul 13 · Today" while the clock reads Fri 17 / Sun 19.

## PASSes worth naming
D2560 on real seats: a seen day put back stays read (B8 a), a new day lights (B8 b), a date moved earlier over a never-seen
day lights it with the D title alone beside it (B8 c — reverses w11 s12), never-read → one updated reminder and no D line
(variant), a later move keeps it read (B8 d), the week change leaves it unchanged (B8 e). D2394 2b's title on Fri 17 (B10).
A1's line back to nothing at Fri 17. A5's singular shrink. A7: Ranger's run / Undo / Redo leave the A line untouched;
Saber's Undo greyed with D350's reason.

## Not walked
B11 (no door). A7's phone run via the window, not a finger drag; B8 (a)'s "taken off" by the line ✕, not a drag.
