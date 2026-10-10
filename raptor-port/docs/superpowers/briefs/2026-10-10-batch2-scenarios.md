# Brief — design the test scenarios for "the second batch of the Inputs pages" (one designer; read-only)

**You are designing what a walker will DO in the running app** (owner D6, D353: the other provider designs the
scenarios, Opus executes them). The batch is BUILT on `claude/day-window-compact` — the working tree as you find it,
NOT yet committed: `git diff HEAD` and the three new files below are the change. Change no file; you cannot run
anything — read the source, and where you would run something, name the exact case and the host will run it. You are
not reviewing the code for bugs line by line — a code read comes after the walk.

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order
> of actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item,
> state where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

## What was built — twenty small pieces, one batch (`OUTSTANDING.md` `[SEEN-BATCH-2]`; owner D730, D731)
His answers, each exactly as he approved it: `grep -h '^| D731 |' .claude/decisions-full/*.md` (read the whole row,
its four "readings" included). The page he answered: `raptor-port/docs/mock/batch2-choices.html`.

**List A — faults with one plainly right behaviour:**
- **A1** the "Unsaved changes" question of an input's window is asked from the FRONT: the window comes forward when it
  asks (a card pressed in the opened day had left it behind that day's window — on a phone, unseen).
- **A2** Enter in a new input's Remarks or Title box saves it once; the same key press no longer presses the "+ Input"
  button the keyboard returns to (a blank "New input" opened again).
- **A3** in a window its reader may not change, the people picker's yellow "why you cannot pick this" box is not drawn.
- **A4** the desktop list row's paperclip and OIL chips are `<button>`s (were `<span>`s), same look and size.
- **A5** an OIL day in another year carries its year, everywhere an OIL day is named (`oilDayLabel`).
- **A6** Escape closes the List's dates calendar — that calendar only, when a window is also up.
- **A7** a reader's OIL line in the window draws no "Change…" (his form is inert; it was a dead button).
- **A8** a shared input's OIL question is headed for the group — "Ace +1" — by every door that asks it (Change…,
  Answer…, the bell, the question that follows a bar's drag), not only by the save; a man's OWN answer keeps his name.
- **A9** the Quals save note reads "Quals saved".
- **A10** in an input's window, a "Changed while this window was open" note goes when the record behind comes back to
  the value his change was typed over (a bar's drag undone); and the note now repaints when "theirs" moves again.

**List B — his answers (D731):**
- **(1)** on a phone, while a window of the shell is up, the passing note (the toast) is drawn at the TOP of the screen.
- **(2)** a day opened on the Inputs calendar whose inputs are all hidden by a filter says "No inputs match on this
  day." with a "Clear filters" button; a day with none at all says what it always said.
- **(3)** the List's dates calendar stays open after its end date is tapped; a press outside closes it (a finger's too).
- **(4)** a shared input's OIL line in its window counts its people where their answers differ — "credited for 2 of 3 —
  Ranger: no"; where all are alike it reads as before (`oilSummaryOf`).
- **(5)** taking a request off names it — "Ranger's Sports day taken off the programme" (and "…taken off Tuesday's
  programme" where its row stood on another day; "…taken out of Unavailable" where it was filed there).
- **(7)** an OIL answer for a day the input no longer covers STAYS on the record — nothing built; pinned by a test.
- **(8)** with members' filing for other people switched off, the member who FILED a shared input is told "Filing for
  other people is switched off — an admin can change this." at every door that used to say "Only <himself> — who
  filed it — or an admin can …" (the window's foot, Delete for everyone, a save, the Delete key on the day's line, a
  bar's drag). No right changes: `state/perms.ts filerSwitchedOff` only picks the sentence.
- **(9)** Escape while a planning note is typed in an opened day puts the note box away, writes nothing, and leaves the
  day open; the next Escape closes the day.
- **(10)** the document viewer keeps "Edit input" and "Close" pinned at its foot.
- **(11)** several days picked on the month open the new-input window at once — kept as built; nothing changed.
- **(12)** on a phone the days of the List's dates calendar are a finger's size and the calendar fills its pop-up.

## Read
- The rulings: `.claude/rules/decisions/scheduler.md` (D731 at its head; the rulings that bind these screens — D654–D660
  and D681–D682 a group input and its OIL question; D700–D714 ALL AVAIL and Event; D715–D729 the title, the card, the
  design vet; D641 windows do not block the page; D683–D695 the opened day and its notes; D725 the window's calendar),
  `.claude/rules/decisions/oil.md`, `.claude/rules/decisions/how-we-work.md` (D56, D487, D726),
  `.claude/rules/decisions/people-accounts.md`, `.claude/rules/raptor-executor.md`. Full rows:
  `grep -h '^| D682 |' .claude/decisions-full/*.md`.
- The change: `git diff HEAD -- raptor-port/src raptor-port/e2e raptor-port/playwright.config.ts`, and the new files
  `raptor-port/src/ui/batch2.test.tsx`, `raptor-port/src/ui/toastplace.test.tsx`, `raptor-port/e2e/inputs-batch2.spec.ts`
  (what the builder already tests — design AROUND these, not over them).
- The code, to learn what a control does: `raptor-port/src/ui/inputedit.tsx` (search "D731", "`[TITLE-CHECK-SEEN]`",
  "`[CAL-CHECK-SEEN]`", `oilSummaryOf`, `oilDayLabel`, `sharedRefusal`, `madeOver`, `bringForward`),
  `raptor-port/src/ui/InputsPage.tsx` (the dates calendar's effect; the row's last cell), `raptor-port/src/ui/InputsCal.tsx`
  (`noteKey`, `hidden`, `idy-clear`), `raptor-port/src/ui/toast.ts` (`placeToast`), `raptor-port/src/ui/FloatWindow.tsx`,
  `raptor-port/src/ui/PeoplePick.tsx`, `raptor-port/src/ui/OilConfirm.tsx`, `raptor-port/src/ui/caldrag.ts`,
  `raptor-port/src/ui/interactions.ts` (search "THE TAKE-OFF NAMES IT"), `raptor-port/src/ui/DocViewer.tsx`,
  `raptor-port/src/state/perms.ts` (`filerSwitchedOff`), and the styles
  `raptor-port/src/ui/scheduler/06-inputs.css`, `…/16-medical.css`, `…/24-sans-calendar.css`.
- How a walker signs in and moves: `raptor-port/CLAUDE.md` §Build & verify. Roles: an admin (Saber), a member
  (Ranger). The loaded week is 13–19 Jul 2026; the Inputs list opens on today onward — "All dates" shows everything.

## What I most want from you
1. **The other places.** Each fix was made at the places the earlier walkers named. For EACH of A1, A3, A5, A7, A8,
   (1), (4), (5), (8) and (9): which OTHER surface, door or role shows the same thing and was not changed? (For
   example: where else is an OIL day named; which other window can be left behind its own question; which other
   box inside a window should take Escape first; where else is a shared input's OIL standing printed.)
2. **What the fix could have broken.** The chips became buttons inside a row that opens on click; the dates calendar
   now takes Escape before everything; the toast moves; a reader's picker says nothing; `madeOver` changes when a
   field counts as in dispute; the OIL line is now drawn for a shared input while ANY man has answered.
3. **Orders.** Both orders of each pair that can meet: a note box and the people picker and Escape; the dates
   calendar and a window and Escape; the members' switch turned off and on again under an open window; a clash note
   with "Keep mine" / "Take theirs" and a second change behind; Undo and Redo after each.
4. **Sizes.** A phone (390 × 844, and 390 × 568), a desktop (1440 × 900), and his PC's 125% scaling where a pinned
   foot or a pop-up could run off.

## The form of the answer
A numbered list of at most 40 scenarios, most valuable first. For each: the role and the size; the setup **through the
app's own controls** (say where a setup cannot be reached that way — that is itself a finding); the action; the
EXPECTED result in the app's own words; and the one observation that would disprove correctness. Then a short list
of "explicit negatives" — what you looked for and did not find.

## NOT a finding (owner D56)
> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database
> step. **Do not report a problem whose harm exists only in data already stored when the code is already correct
> going forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it
> again to NEW data, report it: that is a real finding and this exclusion does not touch it.

**Not open — his choices:** every answer of D731 as worded above (the note at the top only for the shell's windows on
a phone; the calendar staying open; the stale OIL answer staying; "Take me out" still offered to a filer who is one of
the input's people; the window opening at once for several picked days); D487 (no button changes size but (12)'s
days); D726 (no added words beyond those ruled). The phone-on-its-side finds and the other items of `[SEEN-BATCH-2]`
list C stay filed and are not part of this batch.
