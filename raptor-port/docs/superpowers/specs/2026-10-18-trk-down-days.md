# The Tracker's down days, worked out from the Inputs (D1002, 18 Oct 26) — design note, NOT designed yet

**His words (18 Oct 26):** *"I want to remove upchit date in the info tracker. No of down days for tracker to include all
medical days down. Including ATT b. It's auto calculated total from the inputs and when the user clicks on the number a pop
up will show the breakdown and the dates duration that was taken history. So as per the number of inputs that was placed
and how it was reflected in the inputs for the dates"* — recorded as D1002 (tracker), filed as [TRK-DOWN-DAYS-AUTO].

## What he asked for
1. The Tracker's Info panel loses its "Upchit Date" box.
2. "No. of Down Days" is not typed any more: it is the total of every medical day the man was down, from the Inputs —
   ATT B included (HL, OML, ATT C, ATT B — the downchit family).
3. A tap on the number opens a pop-up: each medical input it counts, its dates, and how many days each gave — the man's
   medical history as it stands in the Inputs (an upchit's cut counted as cut).

## Today (read 18 Oct 26)
- `raptor-port/src/tracker/components/SidePanel.jsx` draws "No. of Down Days" (a number box) and "Upchit Date" (the app's
  date box); `app/core.js setDownDays`, `setUpchit` save them per student in the Tracker's own store. The down days shorten
  "Days since currency" (landing currency = days since last currency minus down days). The upchit date is stored and shown,
  and read nowhere else (not checked beyond the Tracker's own files).
- The Tracker is a third app with its own store (`.claude/rules/decisions/tracker.md` §Architecture — its three seams); it
  does not read the Inputs today. Reading them is a new seam, or a rider on an existing one — the build's first design point.

## Questions to put to him first (rounds of four, each with a picture and a recommendation — D853)
1. Which days count: every medical day ever filed, or only those since the student's course start (or since his last
   currency, which is what the landing-currency sum needs)? — to be recommended after reading how the currency sum uses it.
2. A half-day medical (AM / PM): half a day or a whole one?
3. A number typed by hand today: dropped, or kept as an addition the instructor can still type?
4. Which students: a Tracker student linked to a man on Raptor's roster reads his inputs; one not linked (or a man posted
   out) shows what?
5. Does the pop-up let him open an input from it, or only read?

## Files likely to change
`tracker/components/SidePanel.jsx`, `tracker/app/core.js` (the down days' reader; the upchit field retired), a new reader of
the medical inputs through the seam, the Tracker's file format (`tracker/app/fileTransfer.js` — down days and upchit in an
export), its browser suite (`scripts/tracker/smoke.mjs`).
