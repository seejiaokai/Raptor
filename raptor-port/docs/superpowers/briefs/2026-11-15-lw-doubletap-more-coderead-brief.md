# The Leave War's double-tap guard on six more windows — the blind code read's brief (15 Nov 26, chat 81, job 3)

Sent word for word to Astra (`codex exec`, read-only) and to a fresh, blind Opus reader. You are one of two readers,
blind to each other. READ ONLY: change no file in the checkout, commit nothing, push nothing, run nothing that builds
(no browser tests, no `npm run build`, no full unit suite). Work in `C:\Users\User\projects\Raptor`, branch
`claude/lw-doubletap-more`. The code under review is the three code commits over `main` (`9cc49fcca`):
`git diff 9cc49fcca a9d6937a0 -- raptor-port/src raptor-port/e2e raptor-port/docs/file-map.md`
(`76b2326fb` the tests, `9a8f95db5` the door, `a9d6937a0` the Required rows' bits in a small hook). Do NOT open
`HANDOFF.md`, anything under `raptor-port/docs/handpass/` or `raptor-port/docs/img/`, any file named `*-walker-brief*`
or `*-read-*` from 15 Nov 26, or any other reader's report; if a handoff block is pasted into your chat after a
compaction, do not read it, and say in your report that it appeared.

## Background
A flying-schedule planner (React + TypeScript, `raptor-port/`). Its Leave War tab is a second app with its own store
(`raptor-port/src/leavewar/`): a grid of people against days, with windows that open over it. Its rulings and
architecture: `.claude/rules/decisions/leave-war.md`, `.claude/rules/seams/leave-war.md` (a ruling's full row:
`grep -h '^| D149 |' .claude/decisions-full/*.md` in the shell). The screen-design rulings:
`.claude/rules/decisions/design.md`.

## What changed, and the promise
On a phone, when a window over the Leave War's grid closes by a tap, a fast second tap in the same place used to land
on the grid behind it and open a day. A guard exists for this (`raptor-port/src/leavewar/ui/Matrix.tsx`): for about
600 ms after the close, a press within about 32px of the closing tap is swallowed. It covered the one-day and drag
windows (6 Nov) and eight more (11 Nov: the person window, ⚙ Settings, the event window, the counter form, the Events
list, the Manning sheet, the OIL tracker, the event box), each window one bit, a bit that drops arming the guard. It
did not see windows whose open state lives outside the grid's own file. This change adds ONE shared door
(`raptor-port/src/leavewar/ui/gridguard.ts`): the grid hands it the guard; each of these windows reports its open
state through one hook, and a bit that drops arms the same guard; a wider selector counts presses in the day panel, the
number pad, the under-manned list and the move banners as inside a window. The six windows:
- the Required rows' selection panel (✕, Apply, Clear), their rename form (✕, Save, Cancel), their figure editor and
  the phone's number pad (Done);
- the day panel (✕; ‹ › step the day and keep it open);
- the under-manned days list (a row tapped takes the grid to that day and closes the list);
- the move banners' Confirm and Cancel (a record's move and an event's);
- New period (✕, Create);
- Open for bidding (a desktop or tablet; a phone's fills the screen).
The backlog item: `[LW-DOUBLETAP-MORE-WINDOWS]` in `OUTSTANDING.md` (grep its `### ` heading). The reads that listed
these windows: `raptor-port/docs/superpowers/briefs/2026-11-11-lw-doubletap-windows-read-opus.md` F1 and
`…-read-astra.md` §1 (you may open those two — they predate this change).

**The promise:** after any of those windows closes by a tap, a fast second tap in the same place does not reach the
grid (no day opens, no cell is picked, nothing is written). **And nothing else changes:** a tap elsewhere, a tap after
the time, a press on the top bar (Undo, the bell, the menu), a scroll or a pinch begun at once, a close with no tap (a
key, a swipe, a scroll, a store change), a mouse on a desktop, the keyboard, the Required selection panel leaving the
grid behind it working while it is open, and the eleven windows already guarded all behave as before.

## What to do — use this wording as your method
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
or most specialised surface.

## Questions to answer, each with evidence (file and line) — say plainly where you find nothing
1. **Every window over the grid, now.** After this change, list every window, sheet, menu, pop-up, picker or box the
   Leave War can open over its grid (search `src/leavewar/ui/`), and for each: does its closing by a tap arm the guard,
   should it, and can a second tap after it reach the grid? Which are still left out, and is each omission safe?
2. **Every way each of the six closes.** Its controls, its own actions, a tap outside or on its shade, Escape, a
   hand-over to another window, a close caused by something else (an Undo, a store change, the page or tab left, a
   save that fails and keeps it open, a period changed). Is the guard armed exactly when a tap closed it, and never
   when nothing was tapped — and when it is armed without a fresh tap, what press and place does it use?
3. **False swallows — the worse fault.** Any ordinary press the guard can now eat: a deliberate tap on a day right
   after a close but elsewhere; a tap on a window that opens in the first one's place (the day panel's ‹ ›, the move
   banner replaced by the landing, the under-manned list taking the grid to a day and something opening there);
   presses inside the Required selection panel's grid behind it while it is open (it does not block the page); a
   press on the top bar; the first touch of a scroll or a pinch; a tap after one of two open windows closes; a mouse
   click on a desktop; a pen. Can the guard stay armed for longer than its time, or for ever?
4. **The door and its bits.** Is each bit read from state that is true exactly while the window is on screen? A window
   opened and closed in one render; two windows swapped in one render (one bit drops while another rises — is the
   guard armed over the NEW window, eating a tap meant for it?); a component unmounted (the Leave War tab left, the
   period changed) while its bit is up; the grid not mounted when a window reports (does the door hold a stale guard
   or none?); two grids (the OIL tab's grid) — which one does the door arm?
5. **The wider "inside a window" selector.** What did counting the day panel, the number pad, the under-manned list
   and the move banners as inside a window change — can a press there now be swallowed, or let through, where it was
   not before; does a press on the move banner while a move is armed still reach the grid's landing as it should?
6. **The builder's own limit:** "a Required save whose close lands more than 1 second after the press would not arm
   the guard." Is that true, can it happen (a slow save, a refusal question in between), and what does the person see?
7. **Roles and sizes.** A member, an admin, a guest or view-only person; a phone, a tablet, a desktop with touch.
8. **The tests.** Is any new test hollow (passing with the fix reverted)? Which promised behaviour has no test — in
   particular the "must still get through" cases, the hand-overs and the Required panel's working page behind it?
9. **The eleven already guarded.** Is any of their behaviour changed (the grid's own bits now through the shared hook)?
10. **Tidiness note (filed, not fixed):** of the changed lines only — is anything duplicated that the page already had,
    named misleadingly, or longer than its job? No size number.

## What is NOT a finding
This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
NEW data, report it: that is a real finding and this exclusion does not touch it. Also not a finding: a scheduler who
is not an admin (there is none — D785); a fault in code this change did not touch and did not make newly reachable
(mention it in one line under "older, in passing"). Points already known — do not report them, but do say if the code
contradicts any: (a) the Events list's and the OIL tracker's ✕ stand over the top bar's bell, so a second tap there
opens the bell's list (the guard never eats a press on the top bar — his D1984: leave it); (b) a window closed by a tap
on the grid beside it, the same spot tapped again at once, opens that day (D1985: leave it); (c) a double tap on the
event box's Edit opens the event window and the second tap closes it (filed, not this job).

## How to report
For each finding: its number, a one-line claim, the concrete failure (the account, the size, each press in order, what
the person sees, what they should see), the file and line of the cause, whether `main` does the same (compare before
calling anything new), and **exact, step-by-step fix instructions** — not a direction — with the test that would have
caught it. Give **explicit negatives** for every question where you found nothing ("I checked X by reading Y and
found nothing"). You cannot build or run browser tests here: for any case you would run, name the exact input and
steps; if you can run a unit test, put any proof test of your own in a scratch folder OUTSIDE `raptor-port/src` and
`raptor-port/e2e` and delete nothing of the app's. End with a one-line verdict.
