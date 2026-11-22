# Scenario design — the OIL question at the sign-off (OIL F2, `[FABLE-READ-FAULTS]`), 22 Nov 26, chat 138

You are the independent scenario designer (the bug-check order §4): you did not build this. **Do not review the code for
style and do not fix anything. Change no file.** Your job is to say what a walk of the RUNNING APP must drive that the
builder has probably not thought of — what is MISSING, not whether the code is wrong — and to name any place the app
draws or reaches this thing that the change did not wire.

## What was built (commit `ac3e22f77`; the diff is `FIX-DIFF.patch` at the export's root)

The fault (Fable's OIL read, 22 Nov 26): a weekend or holiday whose work is an input (a Training, a Meeting…) that nobody
answered the OIL question for could be published in silence — the man on it earned no OIL and no screen said so.

The owner's rulings, as built:
- **D2294** — a day with an input whose OIL question is unanswered asks it when a scheduler presses ANY of the day's four
  sign-off boxes (CUR CK, SKED CK, PLANNED BY, APPROVED BY — on the Scheduler Board and on Edit Schedule's week): the
  day's open OIL list opens BEFORE the name is recorded (an OIL answer given after signing changes the day and clears the
  sign-offs already given). "Later" signs with no answer and asks no more that day. The publish note then names the
  unanswered input: "Saturday 18 Jul published and approved. Ranger's Training has no OIL answer, so nobody on it earns
  OIL."
- **D2312** — the list's added lines in the fewest words.
- **D2297, D2299** — at the list's top, the pressed sign-off box itself, the name held in it, its edge dotted, "waiting for
  your answer" beside it; the foot reads "Later: Ace signs, but nobody on it earns OIL."; the list's close button (✕) or
  Escape cancels the sign-off — nothing is signed, and the next press on any of the four boxes asks again. The drawing
  of record: `raptor-port/docs/mock/2026-11-22-oil-unanswered-publish/draw-f3.mjs` (round 6).
- Standing rules it must not break: OIL is earned leave (time off), earned only from the PUBLISHED schedule; a published
  day's changes read pending and drop the four sign-offs; an OIL answer is the input's one answer for everyone in it;
  only a scheduler (always an admin — D785: never design a scenario for a scheduler who is not an admin) answers from the
  list; a cancelled, information-only or taken-off input is never asked; leave, medical, Personal, SANS availability and
  upchits never ask; the list reads live and its Save writes the picks as one step; windows of this kind leave the page
  behind them working (D641).

The builder's own readings (challenge them): an input filed AFTER Later was pressed asks once more; Save then Undo takes
back the name first and the answers second (two steps); with several inputs listed the foot says "them"; more than three
unanswered inputs are counted, not named, in the publish note; with nothing left to answer (answered elsewhere while the
list was up) the held box is not shown and Close signs nothing.

Where it lives: `raptor-port/src/ui/oilsign.ts` (new), `src/ui/OilDayList.tsx`, `src/ui/pops.ts`, `src/ui/Shell.tsx` (the
`select[data-sign]` handler), `src/leavewar/sync.ts` (`oilUnansweredLine`, `publishFlagsBids`, `oilOpenOn`),
`src/ui/oilday.ts`, `src/engine/publish.ts` (`setSign`, `signOf`, the binding of signatures to content),
`src/ui/html.ts` (the sign-off boxes' markup; `data-signclear` — the Clear button), `src/ui/scheduler/25-inputs-calendar.css`.

## What is NOT a finding (the owner's D56)
A problem that lives only in data already stored is not a finding — the whole store is demo data, cleared before the
database step. It is a finding only if NEW data would be hurt too.

## What to return (plain text, at most about 120 lines)
1. **Scenarios** — each one line of steps a person does on screen, then `EXPECTED:` what the rulings above say the screen
   must show (cite the ruling). Cover at least: every door to a sign-off (both pages, each of the four boxes, the Clear
   button, re-picking a name in a signed box, a keyboard pick), every way the list closes, every order of Save / Later /
   ✕ across the four boxes, two or more unanswered inputs (some answered, some not), a several-day input, a several-people
   input, ALL AVAIL in an input, a holiday as well as a plain weekend, a published day with changes waiting (signing for
   an amendment), a week change / a squadron change / a sign-out with the list up, Undo and Redo around each step, a
   member, the list opened by its OTHER doors (the bell, a holiday just saved, a published version loaded back) while a
   sign-off is or is not held, and a phone.
2. **The roll-call** — every other place the app writes a sign-off or publishes a day that does NOT go through the new
   door (name the file and function), with what should happen there.
3. **Concrete failures** — only where you can name the exact steps, the cause in the code and the fix (owner D489); each
   as a failing test idea in one line. Do not list style points.
