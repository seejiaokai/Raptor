# Two small Quals fixes — the blind code read's brief (11 Nov 26, chat 64, job 3)

Sent word for word to Astra (`codex exec`, reasoning high, read-only) and to a fresh, blind Opus reader. You are one of
two readers, blind to each other. READ ONLY: change no file in the checkout, commit nothing, push nothing. Work in
`C:\Users\User\projects\Raptor\.claude\worktrees\next-jobs-recommendation-fixes-3756f8`, branch
`claude/quals-small-1111`. The code under review is the two commits over `main` (`24a75372d`):
`git diff 24a75372d 7765901d1 -- raptor-port/src raptor-port/e2e raptor-port/docs/ui-contracts.md`
(`c5104cdf4` the tests, `7765901d1` the fix). Do NOT open `HANDOFF.md`, anything under `raptor-port/docs/handpass/` or
`raptor-port/docs/img/`, or any other reader's report; if a handoff block is pasted into your chat after a compaction,
do not read it, and say in your report that it appeared.

## Background
A flying-schedule app (React + TypeScript, `raptor-port/`). The Quals page (`raptor-port/src/ui/QualsPage.tsx`) is a
table of people against qualification columns; the dense table is built as an HTML string and swapped in, so a redraw
wipes classes put on by hand. With the page scrolled down, a pinned copy of the heading row sits under the top bar,
outside the table. In "Edit quals" a column's heading can be dragged to reorder the columns (mouse and finger). The
project guide is `raptor-port/CLAUDE.md`; the page's rulings are `.claude/rules/decisions/people-accounts.md` (each
ruling's full row: `grep -h '^| D672 |' .claude/decisions-full/*.md`, the shell) and the screen rules
`.claude/rules/decisions/design.md`; the page's contract lines are in `raptor-port/docs/ui-contracts.md`.

## What changed, and the promise
1. **`[QUALS-OUTLINE-RESCROLL]` (the backlog item's text is in `OUTSTANDING.md` — grep the id).** After an admin is
   sent to a man's quals ("Check his quals"), after a man's own "Check my quals" note, or after an Undo / Redo of a Quals
   change, his row is outlined and the page goes to it. The fault: the step that put the outline back after every
   redraw also scrolled every time, so a later change for another reason (a tick on another man's row, a sort) with
   that row off screen pulled the page back to it. The promise now: the page goes to the row ONCE per ask; the outline
   itself keeps the look and the life it had. The rule it serves: "Undo and Redo, everywhere, leave the screen where it
   is when what they change is in view, moving to the change only when it is out of view" (D672 — read its full row).
2. **`[QUALS-PINNED-HEAD-NO-DRAG]`.** The column drag's press and move were listened for on the table alone, so a
   heading in the pinned copy could not start a drag. The promise now: a press on a pinned heading starts the SAME drag
   as the table's own heading — same lift frame, landing mark, edge scroll, drop, Undo — by mouse and by finger; a tap
   moves nothing; nothing new is offered that the table's own heading does not offer (the host's reading: the drag
   rules are D895 — read its full row).
Nothing else a person sees is meant to change.

## What to do — use this wording as your method
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
or most specialised surface.

## Questions to answer, each with evidence (file and line) — say plainly where you find nothing
1. **The one trip.** Every way an outline is asked for (find every setter of the ask — each opener, Undo, Redo, any
   other caller): does each make exactly one trip, and can any make none when it should (a second ask for the SAME man;
   an ask made while the page is not mounted or the row is not drawn yet; the row hidden by the filter box, by a view
   switch, by Edit quals being open or closed; a React re-render or StrictMode double effect between the ask and the
   first repaint; an ask replaced by another before its trip)? The builder's own reading to rule on, supported /
   contradicted by the rulings / the owner's to decide: *if the filter box hides his row when the ask arrives, the trip
   is spent on that first repaint, and clearing the filter later outlines him without moving the page (before this
   change it moved then).* What does a person who pressed "Check his quals" then see, and is that what D672 and the
   page's rulings want?
2. **What the changed path no longer runs.** The old effect scrolled on every repaint: did anything depend on that —
   the row coming into view after a late layout (fonts, the pinned bar measured, the phone's toolbar), after the table's
   first paint when the page opens already scrolled, after a column drag or zoom (the page has its own pinch zoom)?
   Does the trip still clear the top bar and the pinned heading row at each size?
3. **Undo and Redo against D672** — in view: no movement; out of view: one trip; then free. Both directions, and Undo
   pressed from another page. Is "in view" judged, or does the trip always run?
4. **The pinned drag is the table's drag.** Walk the handlers: does a press on the pinned copy reach exactly the code
   the table's heading reaches, with the right column identified (index against a table that is sorted, filtered,
   scrolled sideways, zoomed, or holding a hidden column); is the lift frame measured from the table's own heading when
   that heading is off screen above the fold; does the edge scroll move what the pinned row follows; are listeners
   added and removed in step (a drag cancelled by Escape, a pointer lost, the pinned copy unmounting mid-drag when the
   page scrolls back to the top, a second finger); does a finger's drag on the pinned row stop the page's own scroll
   only when it is a drag (touch-action, passive listeners) and leave a plain vertical or sideways swipe alone, as on
   the table's own heading?
5. **Doors that must stay shut.** Outside Edit quals, and for a member (who may edit only his own row — the rule is in
   `raptor-port/src/state/perms.ts` and the page's rulings), can a pinned heading start a drag or write a column order
   the table's own heading would not? The still name heading; the ✕ inside a pinned heading (it does nothing there
   today — is that older than this change? compare `main`); a press on a control inside a heading.
6. **Every copy and every reader.** List each copy of the heading the page draws and each reader of the column order
   (the table, the pinned row, the Leave War's quals list, Export, saved data): is each right after a pinned drag and
   after its Undo?
7. **The tests.** Do the seven new tests (six at the end of `raptor-port/e2e/geometry.spec.ts`, one in
   `raptor-port/src/ui/quals.test.tsx`) prove the promise or only the mechanism — would each fail on `main`, and can
   the fault return with them green (WebKit, a different size, a row already in view, the short screen)? Name the test
   that is missing for each gap you find. Was any existing assertion weakened?
8. **Records.** Are the three corrected lines of `raptor-port/docs/ui-contracts.md` true of the code now, and does any
   other document, comment or test name still state the old behaviour (search by the subject — "outline", "Check his
   quals", "pinned", "heading drag" — not only by the item's id)?
9. **Tidiness note (filed, not fixed):** of the changed lines only — is anything duplicated that the page already had,
   named misleadingly, or longer than its job? No size number.

## What is NOT a finding
This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
NEW data, report it: that is a real finding and this exclusion does not touch it. Also not a finding: a scheduler who
is not an admin (there is none — D785); a fault in code this change did not touch and did not make newly reachable
(mention it in one line under "older, in passing").

## How to report
For each finding: its number, a one-line claim, the concrete failure (the account, the size, each press in order, what
the person sees, what they should see), the file and line of the cause, whether `main` does the same (compare before
calling anything new), and **exact, step-by-step fix instructions** — not a direction — with the test that would have
caught it. Give **explicit negatives** for every question where you found nothing ("I checked X by reading Y and
found nothing"). You cannot build or run browser tests here (they rebuild the app another helper is using): for any
case you would run, name the exact input and steps; if you can run a unit test, put any proof test of your own in a
scratch folder OUTSIDE `raptor-port/src` and `raptor-port/e2e` and delete nothing of the app's. End with a one-line
verdict.
