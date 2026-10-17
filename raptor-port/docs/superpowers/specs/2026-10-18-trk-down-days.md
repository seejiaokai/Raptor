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

## His answers, 18 Oct 26 — D1003
*"1. His course start so I guess u need a way to input course start date when he's being added into the tracker. 2 yes 3
typed where 4 remove the typed way for a man on the roaster entirely."* — (1) count from his COURSE START: a course start
date entered when a student is added to the Tracker (no such field today — the Tracker keeps lull ranges, not a start);
(2) a half-day medical counts as half a day; (3) his question "typed where" — the Info panel's "No. of Down Days" number
box, typed by the instructor; (4) a man on the roster: the typed box goes entirely. **Still open:** a student not on the
roster (typed box kept?); and the currency bar — counted from the course start, medical days before his last currency
flight would make him read current when he is not (Ranger: last currency 10 days ago, 30 days down earlier in the course
→ 10 − 30 → current); recommended: the bar uses only the medical days since his last currency flight, the number and
its pop-up the whole course.

## His correction, 18 Oct 26 — D1004
*"The currency bar has got nothing to do with medical down days as calculation. It's based on how many days has elapsed
since the currency flight or non syllabus flight"* — the landing-currency bar counts only the days since his last currency
or non-syllabus flight. The build REMOVES today's subtraction (`SidePanel.jsx`: `effCurr = dCurr − downDays`, the
"(−N down = Xd)" after "Days since currency", and "(minus down days)" in the note under the bars). The currency question
above is therefore closed; the down days feed no bar. Still open: a student not on the roster (typed box kept?), and
whether a non-syllabus flight graded on the chart moves "Last currency" by itself today (check in the build).

## His answers and two new features, 18 Oct 26 — D1005, D1006, D1007
- **D1005:** every Tracker student is a man on the roster — the typed down-days box goes for EVERY student. "Last flown
  currency" (typed by the member for a non-syllabus flight) moves only the IP requirement; a syllabus flight moves the IP
  requirement and the flex — as built (`core.js`: a syllabus date sets `lastSyll` and `lastCurr`; a currency date `lastCurr`).
- **D1006 — [TRK-FLEX-SETTING]:** the flex figures editable, and one Tracker-wide switch that turns flex off and takes every
  flex detail off the app (the bar, its windows and words, its legend part). Today's fixed limits (`core.js flexFor`):
  <7 current · 7–13 one optional · 14–20 one mandatory (convertible) · 21–30 two (one mandatory) · 31–59 two mandatory ·
  60–119 short refresher · 120+ re-course. Open: which figures are "the flex number", who may change them, where the switch sits.
- **D1007 — [TRK-LEGEND]:** a legend — what each ball means, what currency a flight needs and when an IP is required, when a
  flex happens; its flex part goes with the switch. Open: where it sits, its words — a picture first.

**D1014 (the same day):** the flex settings open from a settings icon in the Tracker's top bar; only an admin changes them
(narrows D121). Open: what a member sees there; which figures.

## Questions to put to him first (as first drafted) (rounds of four, each with a picture and a recommendation — D853)
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

## His approval of the pictures, 18 Oct 26 — D1018
The pictures (`raptor-port/docs/img/handpass/2026-10-18-trk-down-days/`, `…/2026-10-18-trk-flex-legend/`; the reports in
`raptor-port/docs/superpowers/briefs/2026-10-18-night-pictures.md` §2 and §3) approved "as recommended": the course start is
set in "+ Add" (today by default) and changed in the Info panel; the down-days window only shows; "—" and a one-line prompt
before a course start; a running input counts to today; only the six "From" flex days are typed; a member sees the flex
settings read-only; "Legend" sits beside Show All, taking in the desktop's colour strip; with flex off "Days since
syllabus" goes too. The questions above are answered by D1003–D1007, D1014 and D1018.
