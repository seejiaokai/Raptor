# Brief — design the test scenarios for "the design vet's changes to the Inputs calendar and list" (one designer; read-only)

**You are designing what a walker will DO in the running app** (owner D6, D353: the other provider designs the
scenarios, Opus executes them). The batch is BUILT on `claude/day-window-compact` (the working tree as you find it).
Change no file; you cannot run anything — read the source, and where you would run something, name the exact case and
the host will run it. You are not reviewing the code for bugs — a blind code read by two readers comes after the walk.
**Ask what is MISSING:** which state, order, surface or role would this build get wrong, or never have been wired for?
**Above all: what could a person do on the Inputs LIST before this change — with its own add form — that he can no
longer do, or can now do only by a route nobody tested?**

## What was built (seven pieces, one batch — the plan `raptor-port/docs/superpowers/plans/2026-10-10-inputs-vet-plan.md`)
1. **D727** — on the DESKTOP Inputs list a shared input's Name names EVERY person, A to Z, wrapping in a 250px column;
   never "Drifter +3". The kind keeps its pill there.
2. **D728 (step 1)** — an input's CARD (the Inputs calendar's opened day; the Inputs list on a phone) leaves the
   automatic "till <date>" out of its remark where the card's corner says the same day. Typed words stay; a remark that
   was nothing else shows none. The record, the desktop list's Remarks column and the input's window keep it whole.
3. **V1 — A DOOR REMOVED.** The Inputs list's own add form is gone (its fields, its own `add()`, its own copies of the
   document question, the upchit's summary, the medical clash and the OIL question). One "+ Input" button, at the left
   of the dates button, opens the window the calendar opens — with NO date picked. The plan's §2 is the inventory of
   what the form did and where each is in the window; three things only the form did were moved: the "?" beside Type
   (`ui/TypeLegend.tsx`), an admin's "Posted out / archived" people for a NEW input, and the just-saved row lit.
4. **V2** — the desktop list's small print is "By Saber", on the remark's own line, only where someone else filed it
   or it is for several people. The full "who, date, time" is in the input's window.
5. **V3** — on the Inputs page the window's paragraph of instructions is gone, a new input's too; a saved SHARED input
   keeps one line, "Date changes apply to all N."
6. **V4** — on the month a shared input's bar reads its count first ("4 · Meeting"); a timed input's bar (a half day
   too) is a lighter tint of its colour with a solid edge at its left; an all-day one stays solid.
7. **V5** — fewer words: the gear's three helper lines; "How this works" (four lines); the empty list ("No inputs
   10–24 Oct. Try All dates."); no words over the phone's three filter boxes; the table's last column "Changed"; the
   colour key "duty".

## Read
- The owner's rulings: `.claude/rules/decisions/scheduler.md` D727, D728, D729 and `.claude/rules/decisions/how-we-work.md`
  D726 — their full rows: `grep -h '^| D729 |' .claude/decisions-full/*.md`. The area's other rulings that still
  bind these screens are in the same file (D654–D660 a group input; D700–D714 ALL AVAIL and Event; D715–D725 the
  title and the card; D620 SANS availability is on no list; D672 Undo and the view).
- The drawings he approved: `raptor-port/docs/mock/inputs-vet.html`, `raptor-port/docs/mock/card-questions.html`
  (pictures `raptor-port/docs/mock/img/inputs-vet/`, `…/card-questions/`).
- The plan (whole): `raptor-port/docs/superpowers/plans/2026-10-10-inputs-vet-plan.md`.
- The contract as written: `raptor-port/docs/ui-contracts.md` (search "AFTER THE DESIGN VET", "THE CARD'S REMARK LEAVES
  OUT", "A SHARED INPUT NAMES EVERYONE").
- The code, to learn what a control does (not to review it): `raptor-port/src/ui/InputsPage.tsx` (search "THE LIST HAS
  NO FORM", `openNew`, "…AND IT IS LIT", `rangeWords`, `cardOf(team || [r])`), `raptor-port/src/ui/inputedit.tsx`
  (`newInputSeed`, `archivedHere`, the window's `save` — its first lines — and the `hint` near the end of the form),
  `raptor-port/src/ui/TypeLegend.tsx`, `raptor-port/src/ui/inputcard-model.ts` (`remarkOnce`),
  `raptor-port/src/ui/inputscal-model.ts` (`barText`), `raptor-port/src/ui/InputsCal.tsx` (the bar's `timed`, the fold),
  `raptor-port/src/ui/InputsSettings.tsx`, `raptor-port/src/ui/scheduler/25-inputs-calendar.css` (`.ib-bar.timed`,
  `.in-placed`), `…/14-input-editors.css` (`.inped-k-help`), `…/06-inputs.css`.
  **What the form did before:** `git show 5927fa70:raptor-port/src/ui/InputsPage.tsx` — search `const add = (skipDoc`,
  `filedFor`, `finishAdd`, `<div className="inbar"`.
- How a walker signs in and moves: `raptor-port/CLAUDE.md` §Build & verify; the roles are an admin (Saber) and a member
  (Ranger). The loaded week is 13–19 Jul 2026; the demo carries a shared Meeting of four on Thu 23 Jul 2026, an Event
  for ALL ("Sports afternoon") on Wed 22 Jul and a Duty for ALL AVAIL on Sat 25 Jul; several inputs of several days
  ("Medically down till 17 Jul"). The Inputs list opens on today onward: "All dates" shows everything.

## NOT a finding (owner D56)
The app's stored world is DEMO DATA, cleared before the database step. Do not design a scenario whose only possible
finding is harm to data already stored when the code is correct going forward. **Not open — his choices:** D727 (every
name; the pill kept on the desktop list alone), D728 (only on the card; the app still WRITES "till" into remarks —
`[TILL-FROM-DATES]` is a later job), D729's five (as drawn), and what D729 left OUT on purpose: LATE's tooltip, "Default
window", the window's "Add" button word, month-first dates in the window's title and under its calendar, the schedule's
and the board's dialogs and their hints, the SANS calendar's window, hours shown as am / pm by the browser, a saved
shared input's window opening on the whole people picker, the desktop month re-laying when a day opens. **Known, to be
told to him, not a finding:** the form kept its dates and its kind for the next add — the window opens fresh each
time, on the calendar's first kind (a duty), where the form opened on LL; the window's title still reads "Drifter +3".

## What to produce
A numbered list of scenarios a walker can execute through the app's OWN controls, grouped so two or three walkers can
split them without sharing a world. Each scenario: the role, the size (phone 390 wide / desktop 1440 wide), the exact
steps, and **what must be SEEN on screen** at the end (the words, where they stand, what must NOT be there). Cover at
least:
1. **Every thing the list's form did, through "+ Input"** — by an admin and by a member, at a desktop and on a phone:
   one person; a member for himself and for another man (a duty; then turned into leave); several people; ALL AVAIL
   and ALL (one day; several days refused; a kind that may not carry one); a posted-out man (admin); a date range by
   two taps and a backwards second tap; All day / AM / PM / Custom and typed hours (an end before the start; equal
   times); every group of kinds; the "?" card (opened, read to its last line, closed three ways); a title; remarks and
   the automatic "till"; a weekend duty (the OIL question — answered, cancelled); a medical entry with no document
   (asked — "No document", "Upload"), with one, an upchit over a downchit (its summary), a downchit over another kind
   of downchit (the clash); a locked week if one can be reached. And the refusals: no date picked (before ANY
   question); a member's leave for another man.
2. **After the save** — the new input is in the list, lit, and kept in view when the search, the person, the kind or
   the dates would hide it; on a phone it stands under its day's heading; Undo takes it away and Redo brings it back;
   the next "+ Input" starts clean. What if "+ Input" is pressed while a new input's window, or a saved input's
   window, already holds unsaved typing?
3. **The desktop list** — a shared input of 2, 4, 9 and 14 people (names wrapping, the row's height, sorting by Name,
   the Person filter set to its LAST name); "By" on: his own input; one filed by another; a shared one filed by one of
   its people and by an outsider; ALL AVAIL; a record with no filer; a row with no remark, with LATE alone, with a
   long remark; the pill on every kind (a titled one too); "Changed"; the empty list under a range in one month,
   across two months, across a year, with only a start picked; "No inputs match."
4. **"till" once** — on both cards, for: a leave of several days with no typed remark; a typed remark before, after
   and round the automatic words; a remark carrying a "till" for ANOTHER day; an input running into next year; the
   card shown on the input's first day, a middle day, and its LAST day; a one-day input whose remark says "till <that
   day>"; a shared input of several days; and after the dates are changed in the window (the remark follows) —
   against the desktop table's Remarks column and the window's Remarks box for the same input.
5. **The month** — a shared bar of 2, 9; with a title; cut short on a narrow phone; continued over a week's end; an
   all-day beside a timed and a half-day input, an absence and a commitment of each (four fills to tell apart); a
   timed input of several days; a bar being dragged; the day it opens; the tooltip. The key and the fold on a phone.
6. **The window's words** — a new input (Inputs calendar; the List); a saved one-person input; a saved shared input
   (the count, after a man is added or taken off); a reader who may not change it; the SANS calendar's new commitment
   and a saved one (must be AS BEFORE); the same input opened from Edit Schedule or the board (must be AS BEFORE —
   and must carry no "?" card and no posted-out group it did not have).
7. **The settings and the smaller words** — the gear at a desktop and on a phone; every line read; a save; a member
   (no gear); the Logic page's rows that open the same window (their own words are NOT changed).
8. **Roles** — a member: what "+ Input" offers him, his own input, another man's (read only), a shared one he is in; a
   guest or view-only account if the app has one that reaches the Inputs page.

Rank the five scenarios you think most likely to find a real defect, and say why. Say plainly what you could not
determine from the source, and every place where the build seems to have left one of the form's behaviours with no
door at all.
