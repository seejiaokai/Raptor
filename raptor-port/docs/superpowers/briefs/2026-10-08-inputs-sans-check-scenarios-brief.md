# Scenario-design brief — the Inputs calendar and the SANS availability calendar: the job's ONE check (D485), tier FULL — 8 Oct 26

You are designing TEST SCENARIOS for a walk of the running app. You are not reviewing code for style and you are not
asked whether the code is "clean". Work READ-ONLY: change nothing, build nothing, run no test and start no server.
Report as your final message, in the format at the foot.

**Who built this, and why that matters to you.** Opus 5.5 built this job in Claude Code between 7 and 8 Oct 26, in five
steps, on top of an earlier Codex build of 5 Oct 26 that it read and partly kept. Every plan note headed "AS BUILT",
every "caught" in a strictness list and every "green" in the handoff is a CLAIM made by the side that built the thing —
use them to learn what was promised and what was never walked, never as proof that anything works. **No part of this
job has been walked in the running app by anyone but its builder.** The owner's rulings are the promise; the running app
is the only proof.

**The build** is branch `claude/inputs-sans-calendar` (app code at commit `9b5d085b`), against `main` at `126c6074`:
`git diff 126c6074 9b5d085b -- raptor-port/src` (206 files). **The owner's rulings**, from the live files — one line each
in `.claude/rules/decisions/scheduler.md` (D614–D675 are this job's), `leave-war.md` (D665–D677), `oil.md`,
`people-accounts.md`, `how-we-work.md` — and each ruling's full row by `grep -h '^| D655 |' .claude/decisions-full/*.md`
(the shell's grep). Also read `raptor-port/docs/bug-check-order.md` §2b, §6, §7 and `raptor-port/CLAUDE.md`
§Architecture rules.

**The promise in full, as written down:** the design note
`raptor-port/docs/superpowers/specs/2026-10-07-inputs-sans-redesign.md`; the plan
`raptor-port/docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md` (§1 what he ruled, §3 the design, every
"AS BUILT" note — each lists the choices the builder made that he has only been TOLD, §6 the roll-call seed, §7 the
risks, §8 the readings); the contracts in `raptor-port/docs/ui-contracts.md` — "The Event rows print a short form",
"The four rows at the foot of the Manning block", "Days — the month", "The SANS calendar", "The Inputs calendar", "One
input filed for several people"; the late rule in `raptor-port/docs/engine-rules.md` §The late-input mark.

## What the app should now do — six pieces

**1. One day's facts, from two places joined once (D617, D627, D631, D637, D638, D642).** A date is day flying, night
flying or no fly (NF); it has a required number of pilots and of WSOs. Weekdays are day flying unless set otherwise;
Saturday and Sunday start with nothing set. A class can be set for one date, or for "every <weekday>" from a date with
or without an end. A required figure can be typed for one day or run "from a date on", skipping weekends, public
holidays, Off days and no-fly days. Whether a date is a public holiday or an Off day, and how many pilots and WSOs are
available, come from the Leave War. "Still needed" = required, less those the Leave War shows available, less the SANS
committed to fly — worked out in ONE place and shown the same everywhere (the Leave War's rows and working box, the SANS
date and its opened day, the calendar window called "Calendar").

**2. The Leave War (D636, D637, D640, D642–D645, D652, D665, D668–D677).** At the foot of the Manning block: Required P,
Required W (typed by an admin straight into the cell — one cell, or several picked by a drag, a Shift-drag or a
hold-then-drag, given one number as "These days" or "From <date> on"), Available P and Available W (worked out; red
where under Required; a tap shows the working, read only, to everyone; an admin may rename them and change who they
count — never a SANS man). The Required rows keep their names (D668). The Manning block starts with NO counters of its
own (D669); in Rearrange a counter's eye is a red delete cross that asks nothing (Undo brings it back), while "Delete
counter" in the counter's own window still asks (D676, D677), and a counter can be dropped above, between or below the
four fixed rows (D674). The panel for a picked block of people's days stays up and the grid behind it works (D642). The
Event sheet is Presets (the picked one lit), an optional Name, "On grid" for the short form, a Kind row only under
"Other…"; the grid prints the short form and a tap opens the full name and kind (D643–D645). Undo and Redo leave the
grid where it is when the changed day is on screen (D670, D672). The settings gear carries a "Calendar…" line (D675).

**3. Windows that drag, and the window called "Calendar" (D631, D633, D638, D641, D652, D664, D671, D675).** Every
window of this job can be dragged, does not close on a click outside, and leaves the page behind it working; Escape
closes the front one. "Calendar" (once "Days") has the Month — on a phone one button on each date stepping day, night,
no fly; on a desktop three buttons — a weekday's heading opening "Every <weekday>", and the year's Holidays list:
add one day or a run, change, remove; the form carries the short form ("On grid") and picks its dates on the Leave
War's own one-calendar picker (D671); a public holiday and an Off day are ONE record with the Leave War's Event row
(two doors); a holiday on dates no leave period covers waits for one. Admins only.

**4. The SANS calendar (D617–D619, D626, D627, D630, D635, D647–D651, D658, D664).** Three tabs — Inputs · SANS ·
Medical. The SANS tab is a month: each date shows pilots left and WSOs right — how many more are still needed (yellow,
amber, red by the squadron's three thresholds) and how many SANS have committed to F, O and A; PH green, Off day grey,
NF tagged, sun / moon for day / night flying (here only). A date opened is a window listing everyone, scrolling, no
"+ more"; each person the schedule's own puck with his CAT chip and the SANS purple edge; "Placed by <who> · <date,
time>"; on a phone it pulls up by its bar and back down; on a desktop it sits beside the month. "+ Commitment": a SANS
member files his own only; an admin files for one SANS man or several (D658); a no-fly day still takes OFT and AMT
(D642). Highlight picks one SANS person — his days ringed in cyan, his letters underlined. The gear (admins): the three
colours, the late cut-off (a number of days, or a weekday of a number of weeks before — the end of that day), and
"Calendar…". "How this works" states the cut-off as it is set (D628, D646). SANS availability is on NO list and on no
form of the Inputs tab (D620). On a phone the month takes the full screen and is never a box scrolled inside the page
(D664).

**5. The Inputs calendar (D620, D621, D626, D629, D632, D639, D641, D653, D664, D672).** The Inputs tab opens on a month
of BARS (one bar across the days an input covers; red an absence, amber a duty or commitment; "+N more"), with a
Calendar | List switch, the filters and the List as before. Days are picked by a tap, a slide, a mouse drag or a
hold-then-drag; a bar is moved by dragging it (by the days between grab and drop, its length kept, one Undo step, a
member refused on another man's). A date opened is a window on the page: the planning sections first, then one line an
input with who placed it and when, LATE where late, Delete asking first. The keyboard: arrows, Shift+arrows, Enter,
Delete / Backspace, Escape. The gear (admins): "Calendar…", the Inputs late cut-off, and the switch "Members may file
duties and commitments for other people". The Logic page lists both cut-offs and the switch, each row's button opening
the same settings window. The input editor is a WINDOW on the Inputs page (a blocking dialog everywhere else) and never
saves a field its user did not change: a record changed behind it is followed; the same field changed both ways is
listed and Save refused until he chooses; a record deleted behind it closes the window and says so. Who placed an input
and when is shown in small print on the opened day (both calendars), the List, the editor's foot, a Medical card and
the document viewer — and must NOT appear on month cells, the board, the week or exports (D629). A saved or brought-back
input is shown where it is: its bar flashes, the screen does not move unless the bar is out of view (D672).

**6. One input filed for several people, and the late rule (D628, D639, D654–D660, D663).** The person picker is one
person from an A-to-Z list or, behind a "Several people" switch, the schedule's pucks in groups — Pilots, WSOs, SANS,
and Personnel where the roster holds ground crew — with an "All" per group. A group filing is ONE shared input: one bar,
one line on the opened day, one row on the List, one editor, one item in the changes window with its people listed
(D663); the filer answers the OIL question once for everyone at the save (D660); the man himself, whoever filed it and
an admin may change or delete it; a man in it who did not file it gets "Take me out"; anyone else reads it. A member may
file for other people only duties and commitments — never leave, medical or SANS availability — and only while the
switch is on (D655, D658). Everywhere ELSE each man's record is read alone and must be unchanged: the board's and the
week's rows, the warnings, the Leave War's cells, the bell, the late mark, a published day's pending list, the change
history, print and export. The late cut-off has two modes and two settings (Inputs, SANS): mode 0 (days) must behave
exactly as before; the new mode is "the <weekday> of N weeks before" the week of the input's first day, end of that day;
a SANS commitment is judged by the SANS setting, everything else by the Inputs one; downchits stay exempt.

## What to do

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

Give **12 to 16 scenarios for each of the six pieces**, then **14 to 20 CROSSING scenarios** — the ones nobody who built
a single piece would have written, where two pieces or two apps meet. For instance: a required figure typed on the Leave
War while the SANS month is open in another visit; a holiday added in "Calendar" re-tagging the Inputs month, the SANS
month AND the Leave War's Event row and column tint, and what a weekend's earned leave (OIL) then does; an Available
row redefined to leave out OCU and the SANS date's need; a shared input filed on a PUBLISHED day (the day's pending
count, the four sign-offs, the changes window's one item, then the amendment); a shared duty on a published weekend and
each man's OIL; a bar dragged onto a published day; Undo of each by the person who did it, and refused for anyone else
(D148); the editor window open while its record is changed from the List, the opened day, a drag, the Leave War or an
Undo; two windows of this job up at once and Escape; a window dragged low on a short phone; the failed-save band with a
window up; a member with the switch OFF undoing what he filed for others; a SANS man posted out, archived or made
non-SANS with commitments standing; a leave filed on the Leave War and its bar on the Inputs month.

Cover across the list: every PLACE each thing is drawn (the plan's §6 roll-call seed names them — check it for a place
it MISSES); both WIDTHS and a SHORT screen (390 × 568, a phone on its side, a 1280 × 700 window) and his PC's 1536-wide
screen; every ROLE (admin, the admin's member view, a member who is SANS, a member who is not, a guest, a person signed
in with no access); every ORDER across the publish line (before publishing; published with nothing waiting; published
with changes waiting; after an amendment); Undo and Redo, incl. after another person's change; a reload and a second
sign-in at each stage; a month's edges (a bar across a week's end and a month's end, a year's end, a five-week and a
six-week month, a leap day); and what must NOT have changed — the Medical view, the board's Unavailable rows and
Personal Inputs, the Leave War's cells, the List's behaviour for one-person inputs, mode 0 of the late mark on the
board and the week, button sizes (D487), the sign-in card.

**The downstream numbers.** Include scenarios that READ them, not only the screen that typed them: the SANS date's
"still needed" against the Leave War's working box for the same date; a man's OIL (the Leave War's cell and the OIL
tracker's row) after a shared duty on a weekend or public holiday, for the filer and for each other man; a published
day's "N pending" after an input is filed, moved or deleted on it.

**And this, in the same breath — WHAT IS NOT A FINDING (owner, D56):**

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

Not part of this job, and not yours to report: one row for a group input on the SCHEDULE (D661, D662 — its own job,
straight after); the Leave War's other windows still blocking the grid (`[LW-WINDOWS-NONBLOCKING]`, filed); the top of
the Leave War on a phone (D678, D679 — checked by itself). A physical iPhone and a phone's own number pad cannot be
walked here — leave them out, and say in one line which of your scenarios only a real device can settle.

## How to report

- Number the scenarios by piece: `P1-01 …` to `P6-…`, and `X-01 …` for the crossings. Within each piece, most likely
  to fail FIRST. Each: a one-line title; the surface and the ruling it tests (D number); SETUP (in the app's own words —
  which page, tab, date, button; the demo week is Mon 13 – Sun 19 Jul 26, the demo's shared input is on Thu 23 Jul 26,
  admin `ad` is Saber, member `us` is Ranger); ACTION; EXPECTED (what the screen says, and the downstream number where
  there is one); and THE OBSERVATION THAT WOULD DISPROVE IT.
- Then: any place you believe the build is MISSING a call site, with the file and function, and how a person would see
  it — each with exact, step-by-step fix instructions.
- Then: explicit negatives — surfaces you checked and believe are wired, one line each.
