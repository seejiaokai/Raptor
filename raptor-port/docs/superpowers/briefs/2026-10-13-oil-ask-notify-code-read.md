# The brief — the read of `[OIL-ASK-NOTIFY]`'s FINISHED CODE — 13 Oct 26

**Why you:** Opus 5.5 planned and built this job; you did not write any of it. You are an independent reader of the
finished code (the owner's word for Fable: D784; a second reader reads beside you and you never see its report).
**Read-only: change no file but the ONE report named at the end; run no build, no test, no browser, no git command
that changes anything** (the PC's check set may be in flight as you read).

## What the job is, in the owner's words
- D780: *"If a holiday is made afterwards the input is there. There should be a notification to the schedulers to
  award oil on those inputs. And should not be silent."* — and of a swap: *"maybe u shouldn't allow the person to
  cancel the oil question until answered?"*
- D781: the admin declaring the holiday is told at once, and what he answers there notifies nobody; a swap's or an
  add's OIL question cannot be left open.
- D782: *"can the admin answering all the inputs for oil that day have a consolidated list that's easy to select oil
  yes or no for them? And a yes to all or no to all kinda button"*.
- D783 ("Yes to all" to the pictures): a swap or an add that raises an OIL question is NOT MADE until the question is
  answered — nothing moves; not answered, both pucks flash and a bar stays until tapped; the one list opens by itself
  when a holiday is saved; the schedulers' bell carries one line a holiday, counting what is left.
- D785: a scheduler is always an admin — the app is not built for, and no reader reports on, a scheduler who is not.
OIL is time off a person earns for work on a weekend or holiday (never pay — D25).

## What to read
1. **The rulings, in full** (the shell, never the Grep tool — a long row is hidden by it), from `C:/Users/User/projects/Raptor`:
   `grep -h '^| D780 |\|^| D781 |\|^| D782 |\|^| D783 |\|^| D785 |\|^| D762 |\|^| D755 |\|^| D769 |\|^| D103 |\|^| D21 |\|^| D2 |\|^| D292 |' .claude/decisions-full/*.md`
2. **The plan and the register:** `raptor-port/docs/superpowers/plans/2026-10-12-oil-ask-notify-plan.md` (§3 the
   design, §5a what a read of the PLAN changed) and
   `raptor-port/docs/superpowers/specs/2026-10-12-oil-ask-notify-behaviour-register.md` (ON1–ON16).
3. **The check's sheet:** `raptor-port/docs/handpass/2026-10-13-oil-ask-notify.md` — §4 the roll-call (every place
   the thing is drawn or decided, and its proof), §5 the door check, §8 the scenarios, and from §11 on what the walk
   of the running app found and what was changed for it.
4. **The code:** `git diff origin/main...HEAD -- raptor-port/src raptor-port/e2e` (about 2,900 lines), and every
   file it touches read WHOLE where the change sits — in particular `src/ui/reqdoor.ts`, `src/ui/oilwait.ts`,
   `src/ui/OilWaitSheet.tsx`, `src/ui/inputedit.tsx` (`dryRun`, `oilFirst`, `reassignInput`, `commitInputEdit`,
   `oilGate`, `askOilIfPending`), `src/ui/caldrag.ts`, `src/ui/drag.ts` (`applyDrop`), `src/state/view.ts`
   (`placeArmed`, `setPage`, `VIEW_RESET`), `src/state/store.ts` (`tryInputsBatch`, the writers that call
   `HOOKS.inputRow.write`), `src/leavewar/state/store.ts` (`newHolidayRuns`, `tellHolidays`, `gesture`,
   `persistNotify`), `src/leavewar/sync.ts` (`oilOpenOn`, `holidayLeft`, `tellHoliday`), `src/state/notices.ts`,
   `src/state/noticeseen.ts`, `src/ui/topbits.tsx` (`bellTap`, `openNotice`), `src/ui/OilDayList.tsx`,
   `src/ui/oilday.ts`. The area rules that govern them: `.claude/rules/decisions/oil.md`, `scheduler.md`,
   `leave-war.md`, `people-accounts.md`; the project guide `raptor-port/CLAUDE.md` (the mutation funnel, the
   persistence funnel, the command layer: `raptor-port/docs/undo-contract.md`).

## What is asked
**Do not merely review the changed code.** Starting from the owner's promise in each ruling, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
least-shared or most specialised surface.

Attack, at least, each of these:
1. **Every way a person is put on an input's row, or an input is moved onto a day that asks.** Is there a door that
   still WRITES FIRST and asks afterwards, or asks nothing — a caller of `rowPut` / `rowMove` / `reassignInput` /
   `commitChipMove` that treats `'asked'` (or `false`) as "written" or carries on to an older write path; a writer
   that reaches `commitInput` / `commitInputEdit` / `setInpField` / `fillSlot` / `setSlotVal` for an input's row
   without the door; the right-click, the typed boxes, the board's own buttons, a load, a plan switch, a template,
   an Undo or Redo that re-makes a swap; the input's own window (it always asked first — is that still true where
   its people or dates are changed there on a weekend)? Name every remaining caller of `askOilIfPending` and say
   whether each can still leave a change made and unanswered.
2. **The save that is tried and thrown away** (`tryInputsBatch`, `dryRun`, `gated`, `oilFirst`). Can the try and the
   real run disagree (asked, then refused — or made although the try refused)? Does the thrown-away batch leave
   ANYTHING behind — a store not enlisted (the Leave War's absence door, the week stash, the change history, the
   notices, the read-state, `LANDED`, `TRYING`, the armed place, a deferred effect, a toast, a repaint, an Undo
   step, a row id minted, a notice told, a pending mark on a published day, a sign-off dropped)? "A refused try puts
   every record back as a NEW object": which callers hold an input, a row or a `Place` across it and use it after?
   What does a try cost on a big week, and can a drag fire it on every pointer move (it must run only at the drop)?
3. **Answered.** The change and the answer in ONE command: is the answer written for every kind (join, replace,
   move, the Unavailable row's two branches, the calendar's drag for one person and for several), AFTER anything
   that voids an answer in the same save (`commitInputEdit`'s hand-over, `voidedOil` / `repricedOil`, a re-date that
   drops answers for days no longer covered)? Is a No (0) kept as an answer everywhere it is read? One Undo, one
   Redo, a reload — and the person's seat he was dragged from. The gesture's own ending (`pre` / `post`, `LANDED`):
   the landing flash, the "already busy" note, the arm put down, the phone's drawer.
4. **Not answered.** The bar and what it holds (`OILBAR.wait` keeps closures): the row deleted, moved, re-ordered,
   another man put on it, the input answered by someone else meanwhile, the day published or unpublished, the week
   changed, the page changed, another person signed in, an Undo of an unrelated change, a second waiting change
   started while the bar is up, the Scheduler Board closed, the day stepped on the board (does the bar outlive the
   day it names — `setBoardDay`?), a version being looked at. Can "Answer OIL" ever write to the wrong row or person?
5. **A published day** (D103, D2): nothing pending and no sign-off dropped until the answer; then exactly one
   pending change. The list's Save on a published day. A holiday declared on a published day.
6. **Every way a working day becomes a non-working day** — find them by reading the Leave War store's writers, not
   by trusting the plan's list: the Holidays list (add, change, remove-and-add), the Event row (the sheet, a typed
   word, a band, a range), an event TYPE's kind changed, a preset, a new period created over inputs, an import or a
   load of a saved Leave War file, a reset, the projections and restores that must NOT tell. Is `tellHolidays`
   called at every end a person's own write passes, exactly once (a nested command, a `gesture` inside
   `persistNotify` or the reverse — two tellings; `LW_BASELINE` stale or advanced early), and never from a restore?
   `newHolidayRuns`: a date in no period, a period whose days array is replaced whole, two periods, a weekend, an
   Off day (D21 — an Off day earns no OIL: must it tell?), a holiday on a day already non-working by another route.
7. **Who is told** (`schedulerIds`, `noticeHoliday`): every admin account that is on and tied to a person, the maker
   included; never a member; an admin in the member view (D292); an account switched off, suspended by a posting,
   archived; a person with two accounts; nobody signed in as a person (`me()` null). The notices are written by a
   scheduler-store command INSIDE a Leave War command: Undo, Redo, a refused holiday, the permissions check on what
   a command changed, the save's row writer, the thirty-line cut, the read-state.
8. **The line and the bell** (`noticeLive`, `noticeLeft`, `holidayLeft`'s remembered count, `noticesFor`, `isUnread`,
   `unreadFor`, `markAllNoticesRead`, `bellTap`, `openNotice`, both bells): a count that is stale (what moves it that
   bumps neither store's version nor the list's length — an answer written in place, a holiday removed, a week
   loaded, an input re-dated); a line shown at 0; a bell lit with an empty list; two lines for one holiday; a run
   whose dates were later changed; a member's bell changed in any way; the scheduler whose OWN unanswered input the
   line covers — and the same man in the member view.
9. **The one list** (`oilOpenOn`, `OilDayList`, `saveOilDay`): what it lists against what the "OIL?" tag and
   `oilPendingFor` say (three readers of "unanswered" — do they agree for a multi-day input, an input of several, a
   cancelled input, an information-only one, one taken off the programme, a kind that never asks, a Personal input,
   a day with no Leave War period — D19, a locked week)? The Save: one command, only the run's unanswered days,
   stamped, refused whole or in part (what does the window do on `-1`?), a pick for an input deleted or answered
   meanwhile, a published day, who may (the write path, not only the window), `fresh` after a reload, the window
   left open across a sign-out, a page change, a week change.
10. **What a change here could have BROKEN elsewhere:** `InputCard`'s new `action`, `OilConfirm`'s new labels (the
    input's own window still says Cancel / Save), `RowAnswer` widened (every `switch` or `=== 'done'` on it),
    `reassignInput` now returning a boolean, the nine older tests re-expressed for "made, then asked".

## Not findings
Harm that lives only in data already stored when the code is right going forward (D56 — the whole store is demo data,
cleared before the database step; if the app would do it again to NEW data, report it). A scheduler who is not an
admin (D785). The behaviour register's ids of the PREVIOUS job not yet wired into the rule check. Two devices never
seeing each other's changes (one browser's storage in this build).

## How to report
A claim is a finding only with a concrete failure, its cause, whether it is silent, whether it is NEW against
`origin/main` or older, and step-by-step fix instructions precise enough to build from; explicit negatives for what
you traced and found sound. End with a verdict — **CLEAN / CLEAN WITH THESE EXACT CHANGES / NOT CLEAN** — on the
branch as it stands, what (if anything) must be fixed before the owner's "merge live", and the scenarios a walk of
the running app should still drive. **Save the whole report yourself**, with the Write tool, to the ONE file your
message names, and hand back a summary of at most forty lines: the verdict, each finding in one sentence with its
severity, and the scenarios for the walk.
