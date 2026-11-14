# The Leave War's double-tap guard on its other windows — the blind code read's brief (11 Nov 26, chat 64, job 4)

Sent word for word to Astra (`codex exec`, reasoning high, read-only) and to a fresh, blind Opus reader. You are one of
two readers, blind to each other. READ ONLY: change no file in the checkout, commit nothing, push nothing, run nothing
that builds (no browser tests, no `npm run build`, no full unit suite — a walker is using the built app). Work in
`C:\Users\User\projects\Raptor\.claude\worktrees\next-jobs-recommendation-fixes-3756f8`, branch
`claude/lw-doubletap-windows`. The code under review is the two commits over `main` (`24a75372d`):
`git diff 24a75372d 245dd9a4e -- raptor-port/src raptor-port/e2e`
(`f5a0c99f7` the tests, `245dd9a4e` the fix). Do NOT open `HANDOFF.md`, anything under `raptor-port/docs/handpass/` or
`raptor-port/docs/img/`, or any other reader's report; if a handoff block is pasted into your chat after a compaction,
do not read it, and say in your report that it appeared.

## Background
A flying-schedule planner (React + TypeScript, `raptor-port/`). Its Leave War tab is a second app with its own store
(`raptor-port/src/leavewar/`): a grid of people against days, with windows that open over it. Its rulings and
architecture: `.claude/rules/decisions/leave-war.md`, `.claude/rules/seams/leave-war.md` (a ruling's full row:
`grep -h '^| D149 |' .claude/decisions-full/*.md` in the shell). The screen-design rulings:
`.claude/rules/decisions/design.md`.

## What changed, and the promise
On a phone, when a window over the Leave War's grid closes by a tap, a fast second tap in the same place used to land
on the grid behind it and open a day. On 6 Nov a guard was built for two windows (the one-day window and the drag
window): for about 600 ms after the close, a press within about 32px of the closing tap is swallowed
(`raptor-port/src/leavewar/ui/Matrix.tsx`, `guardGrid`; its unit tests `raptor-port/src/leavewar/ui/doubletap.test.tsx`).
This change extends the SAME guard — never a second one — to every window over the grid: the person window, ⚙
Settings, the event window, the counter form, the Events list, the Manning sheet, the full-screen OIL tracker, and the
event box (the small box a tap on an event opens). The builder's mechanism: each window is one bit; a bit that drops
arms the guard; a press inside the event box counts as inside a window. The place, the time and everything the guard
lets through are said to be unchanged.

**The promise:** after any of those windows closes by a tap, a fast second tap in the same place does not reach the
grid (no day opens, nothing is written). **And nothing else changes:** a tap elsewhere, a tap after the time, a press
on the top bar (Undo, the bell, the menu), a scroll or a pinch begun at once, a mouse on a desktop, the keyboard, and a
window that hands over to another window all behave as before. The backlog item: `[LW-DOUBLETAP-OTHER-WINDOWS]` in
`OUTSTANDING.md` (grep it).

## What to do — use this wording as your method
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
or most specialised surface.

## Questions to answer, each with evidence (file and line) — say plainly where you find nothing
1. **Every window over the grid.** List every window, sheet, menu, pop-up, picker or box the Leave War can open over
   its grid (search `src/leavewar/ui/` — not only the eight named: Open for bidding, Grades, New period, the View
   picker, a ⋯ menu, a question card, the document viewer, the legend, My leave, Balances, Approvals). For each: does
   its closing by a tap now arm the guard, should it, and can a second tap after it reach the grid? Which were left
   out, and is each omission safe?
2. **Every way each window closes.** ✕, Save, Cancel, Delete, its own actions, a tap outside it, a hand-over to
   another window, a close caused by something else (an Undo, a store change, the page left, a save that fails and
   keeps it open). Is the guard armed exactly when a tap closed it, and never when nothing was tapped (a key, a timer,
   a store change) — and when it is armed without a tap, what "place" does it check?
3. **False swallows — the worse fault.** Find any ordinary press the guard can now eat: a second, deliberate tap on a
   day right after a close but elsewhere; a tap on a window that opened in the first one's place (a hand-over: is the
   new window's first button under the old ✕?); a press on the top bar; the first touch of a scroll or pinch; a tap
   after one window of two closes while the other stays open (the bits); a mouse click on a desktop; a pen. Can the
   guard stay armed for longer than its time, or for ever (a bit that never clears, a window unmounted without its
   bit dropping, two windows closing in one render)?
4. **The bits.** How is each window's bit read — from state that is true exactly while the window is on screen? A
   window opened and closed inside one render, two windows swapped in one render (one bit drops while another rises:
   is the guard armed over the NEW window, eating a tap meant for it?), the event box against the event window.
5. **"A press inside the event box counts as inside a window."** What did that change — can a press inside the event
   box now be swallowed or be let through where it was not before?
6. **Roles and sizes.** A member, an admin, a guest or view-only person; a phone, a tablet, a desktop with touch.
7. **The tests.** Is any new test hollow (passing with the fix reverted)? Which promised behaviour has no test — in
   particular the "must still get through" cases and the hand-overs?
8. **The first guard.** Is the one-day and drag windows' behaviour changed in any way?
9. **Tidiness note (filed, not fixed):** of the changed lines only — is anything duplicated that the page already had,
   named misleadingly, or longer than its job? No size number.

## What is NOT a finding
This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
NEW data, report it: that is a real finding and this exclusion does not touch it. Also not a finding: a scheduler who
is not an admin (there is none — D785); a fault in code this change did not touch and did not make newly reachable
(mention it in one line under "older, in passing"). Two points already known and put to the owner — do not report
them, but do say if the code contradicts either: (a) the Events list's and the OIL tracker's ✕ stand over the top
bar's bell, so a second tap there opens the bell's list (the guard never eats a press on the top bar); (b) a window
closed by a tap on the grid beside it, the same spot tapped again at once, opens that day (the 6 Nov guard's own
reading, kept).

## How to report
For each finding: its number, a one-line claim, the concrete failure (the account, the size, each press in order, what
the person sees, what they should see), the file and line of the cause, whether `main` does the same (compare before
calling anything new), and **exact, step-by-step fix instructions** — not a direction — with the test that would have
caught it. Give **explicit negatives** for every question where you found nothing ("I checked X by reading Y and
found nothing"). You cannot build or run browser tests here: for any case you would run, name the exact input and
steps; if you can run a unit test, put any proof test of your own in a scratch folder OUTSIDE `raptor-port/src` and
`raptor-port/e2e` and delete nothing of the app's. End with a one-line verdict.
