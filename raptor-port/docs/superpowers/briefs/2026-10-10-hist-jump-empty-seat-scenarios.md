# Brief for Astra — scenario design for `[HIST-JUMP-EMPTY-SEAT]` (10 Oct 26)

**Your job: scenario design, read-only (the checking guide §4 rank 1, D353). You change no file.** Opus 5.5 built the
change and has walked it; you are asked what is MISSING from that walk — not whether the code is tidy.

## Read first, with your own reads (nothing here loads by itself for you)

- `AGENTS.md`; `.claude/rules/plain-language.md`; `.claude/rules/bug-check.md`.
- The area's rulings: `.claude/rules/decisions/scheduler.md` — D733 (new, this job), D107, D167, D168, D339, D345, D726;
  a ruling's full row: `grep -h '^| D733 |' .claude/decisions-full/*.md`.
- The backlog item, as he found it: it is on the branch `claude/day-window-compact`, not on this one —
  `git show origin/claude/day-window-compact:OUTSTANDING.md | grep -n -A6 'HIST-JUMP-EMPTY-SEAT\] A change'`.
- The change, uncommitted in this folder (branch `claude/hist-jump-empty-seat`, cut from `main`): `git diff` and
  `git status`. Its three source files: `raptor-port/src/ui/interactions.ts` (`jumpToChange`),
  `raptor-port/src/ui/histbubble.ts` (`onlyOn`, `isSeatKey`, `findSeatRow`), `raptor-port/src/probe-bridge.ts` (one line).
- Its tests: `raptor-port/src/ui/histjump.test.tsx`. Its walk script: `raptor-port/scripts/handpass/hj-walk.mjs`.
- Who calls the tap: `raptor-port/src/ui/ChangesWindow.tsx` (`jumpOf`, `canGo`, both `jumpToChange` calls),
  `raptor-port/src/ui/pendlist.ts` (`pendKeysFor`). How each page draws a seat: `raptor-port/src/ui/html.ts`
  (`lSeat`, `slotCell`, `lCell`, the programme / duty / sim / ground builders), `raptor-port/src/ui/board-html.ts`.

## What he found, and what was built

His words (10 Oct 26, his iPhone): *"If that change is no longer to be found … It says the detail is shown on the
scheduler board. But when I go to the schedule board and click the same thing it says the detail is shown on the week,
not on the board."* In the changes window a tap on a change whose seat is empty now sent him from each page to the other.

Built: (1) when the seat a change names is not drawn and nobody is in it, the tap lands on the row — its people box,
else the people cell another man of that row stands in (View-only Sched), else the row's name — with the passing note
"That seat is empty now" and the same brief ring; no History bubble; (2) "shown on the week, not on the board" /
"shown on the scheduler board" are said only of a box the other page alone draws (`onlyOn`), otherwise "That detail is
not shown on this page"; (3) a row deleted since keeps "That detail is no longer on this day"; (4) his ruling D733 —
a place another man has since taken: the tap lands there, whoever stands there now, and says nothing.

## What has been walked (44 steps, all passing, by script on the built app)

Monday of the demo week. Fixture through the app's controls: Ranger dragged FLIGHT SAFETY STAND-DOWN → SODB → WPNS &
TACTICS SYNC; an extra man added under the SXO desk then taken off; men taken off the SDO desk, a ground row, a sim's
front seat, an AMT passenger and a flying seat (right-click). Then every one of those lines pressed at a point:
desktop at 125% on the Scheduler Board and on Edit Schedule (8 each); a phone by touch on Edit Schedule (6) and on the
board (5); a member on View-only Sched (3); the refilled seat on desktop and phone (D733); the SODB row deleted.

## The brief (the guide's own wording)

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order
> of actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item,
> state where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

## What to hand back

1. **Scenarios NOT in the walk above**, ranked, at most 15: setup through the app's own controls, the tap, what should
   be seen, and the one observation that would disprove it. Think of: the "To go out" tab's lines on a published day
   (its keys come from `pendKeysFor`, several per line); a published day's working copy and View-only Sched's issued
   face; a version look (a saved plan, an older issue); a line of ANOTHER day while the board shows a different one; a
   phone week on another day; a folded or hidden section; a row's free-text name where a man stood; a row whose order
   changed (dragged, auto-sorted) or whose block was deleted; an input's row; a placeholder (ALL / ALL AVAIL) and its
   crowd; OIL Earn mode on; the History mode's gold dots; Undo and Redo of the move after the tap.
2. **Any place the code would now say something untrue or land on the wrong row** — a concrete failure, its cause and
   its exact fix, step by step (D489). Explicit negatives too ("I checked X and found nothing").
3. Anything in the three source files that is a wrong line. Plain words; no praise; no summary of what the code does.
