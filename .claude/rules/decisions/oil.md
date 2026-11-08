---
paths:
  - raptor-port/src/**/*Oil*
  - raptor-port/src/**/*Oil*
  - raptor-port/src/leavewar/**
  - raptor-port/src/**/*Avail*
  - raptor-port/src/**/*Avail*
  - raptor-port/src/**/*Publish*
  - raptor-port/src/**/*Publish*
  - raptor-port/e2e/*leavewar*
  - raptor-port/src/ui/board-html.ts
  - raptor-port/src/ui/interactions.ts
  - raptor-port/docs/engine-rules.md
  - raptor-port/docs/ui-contracts.md
  - raptor-port/docs/leavewar/**
  - raptor-port/docs/**/*leavewar*
  - raptor-port/docs/**/*lw-*
  - raptor-port/docs/**/*lw-*/**
  - raptor-port/docs/**/*oil*
  - raptor-port/docs/**/*oil*/**
  - raptor-port/docs/handpass/parts/blocks-*
  - raptor-port/docs/**/*allavail*
  - raptor-port/docs/**/*one-absence*
  - raptor-port/scripts/handpass/**
  - raptor-port/docs/archive/HANDOFF-OIL-WALK.md
---

# OIL (off in lieu) — how it works now

<!-- shape: page -->

Loads by itself whenever a chat reads an OIL, Leave War, placeholder-puck or publishing file (the `paths:` above). Each
line is a rule as it stands today; the numbers after it are the rulings that set it. His words, the readings he was told,
each ruling's date and the history are in the full rows, `.claude/decisions-full/oil.md` — open the row before acting on
a rule's detail or asking him about it (`grep -h '^| D142 |' .claude/decisions-full/*.md`, the shell; the Grep tool hides
a long row).

A ruling of another area that bears on OIL is pointed to at the end, stated on its own area's file. The general rulings
are in `.claude/rules/decisions/how-we-work.md`, loaded in every chat; the map of every ruling, and how to record or
retire one: `DECISIONS.md`.

## What OIL is
- OIL is earned leave — time off banked, never pay or money; say it that way, in every report and on every screen [D25].
- OIL is owed all the same: the bug-check order's money question — what a man is owed or paid — fires on any change
  that touches it [D25].

## What earns, and from what
- Only the issued (published) schedule earns OIL, in both directions: a holiday declared after publication waits for a
  republication and the day says so; revoking one no longer removes OIL silently [D2].
- A day's OIL comes from its latest published version — the latest amendment, or the EOD if that is the latest — however
  long ago the day was; no lock, no clock [D142]. An issued day keeps the OIL it went out with when a rule changes under
  it [D48]; a published day keeps its OIL until it is published again — a later time or Logic change reads as pending
  [D592].
- The published record is what happened, with no test of whether the day was really worked: a later amendment or EOD
  that takes a man off a past day takes that day's OIL from him — to keep it, he is not taken off — and a published EOD
  is the final word on the day [D142].
- An issued day is held to the rule it went out under: its credit stays until someone corrects the times and publishes
  again, the correction an ordinary amendment; clearing the demo data never covers OIL on a published record silently
  changing amount [D48].
- One principle instead of an allow-list: every seat can earn, its default decides whether it does, and the admin can
  always override in OIL Earn; the placeholder pucks default on wherever they land, except on a row that came from an
  input, where they follow its one OIL answer; the one boundary is a seat with nothing to measure, which offers no OIL
  switch and says why instead [D28, D31, D43, D755].
- A seat has nothing to measure when it has no times, a zero length, is cancelled or is an ⓘ row: no switch, and a
  short line gives the reason — never a silent absence; a flying line whose written take-off and landing are the same
  is not such a seat, and earns (below) [D31, D49].
- On by default: flying lines, SC MAIN, Common Programme, Standard and SC-shift duty desks, ground rows, sims, sim
  passengers, the extra-people line, and a standby line that actually flies (below) [D15, D24, D43, D755, D1042]. An ⓘ
  row and a BB duty desk do not earn by default [D15, D24].
- Off by default but offering the OIL switch in the mode: SC SPARE, AVALON flying lines and duty desks, BB flying lines,
  and a duty block minted from an AVALON template — the same seat, one answer; an activated one can be credited, on a
  published day through an ordinary amendment, and a standby line that actually flies earns by default (below)
  [D24, D35, D1042].
- A standby line that actually flies counts as a real flight and earns OIL by default; when it counts as flying — its B or
  R typed, or its row ticked "Flies" — is stated on the scheduler's file [D24, D1042, D1043, D1044].
- The placeholder pucks (ALL / ALL AVAIL) behave exactly like named people: on by default wherever they can land, and
  wherever one is allowed to land it also offers the OIL switch — one list, not two; landing and earning are one decision
  [D32, D43, D755]. On a row that came from an input, a placeholder is one of the input's people and follows its one OIL
  answer [D43, D755].
- A man the scheduler puts in the name box of another man's request row replaces him in the input, or joins it beside
  him, and follows the input's OIL answer; either can be tapped off in OIL Earn; a request that never asks the OIL
  question (Personal) earns nobody anything, whoever is on its row [D470, D755].
- Three behaviours are correct as built and not in conflict: a ground crewman named on a weekend duty earns; a
  placeholder on it earns for the men it stands for unless switched off; ALL / ALL AVAIL never include ground crew [D52].
- An OIL award and a worked day add up [D82]. OIL may be credited by hand on any day: the weekend and holiday limit
  belongs to the automatic pass, which reads the published schedule [D79].

## What does not earn
- An "Off day" does not earn OIL — settled, do not reopen: it is time given to a man, not a holiday he was called in
  on, and only a PH turns a day into one that can earn [D21].
- Leave and medical inputs never earn OIL and are never asked the OIL question; nor are a Personal input, a SANS
  availability or an upchit asked it [D804].
- A cancelled input is never asked the OIL question — not at a save, a put-back or a filing — wears no "OIL?" tag and
  stands in neither the one list nor the bell, because it can earn nothing; an information-only input the same [D814].
- An ALL AVAIL / ALL row with a start and no end counts over the one-hour default, earns nobody OIL, and tells the admin
  "no OIL worked out — this row has no end time" — stated on the scheduler's file [D360].
- A worked weekend that earns nobody any OIL says so, on the day and at publish, with its reason [D81].

## How long a day counts
- A flying line's OIL is worked out from its earliest applicable entered in-time / rally for the formation — the nominal
  report time only where none is entered [D591, D592]; an evening-before report lengthens that line's own day only; the
  day counts first event to last end, breaks included [D592].
- As built, and put to him as readings: a Logic change reads pending on a published day where anyone's OIL record for
  it — his amount or the worked times stored beside it — would be written differently; and the four sign-offs fall when
  a Logic change made after they signed would alter the day's OIL, standing again when the value is put back [D592].
- An SC shift's typed B (its in-time), where filled, counts as work: the shift's OIL and its work hours run from the
  earlier of that B and its written start to its end — a B typed later shortens nothing, and a B on the evening before
  lengthens the shift's own day only; a blank B leaves the shift its written start to end [D606].
- A SPARE that only stands by reports nowhere, so his B does nothing, and switched on in OIL Earn he earns the shift's
  written hours; a shift with its B or R typed flies whole, SPARE rows included, and each row earns by default (above)
  [D606, D1044].
- A flying line whose written take-off and landing are the same still earns, and the day says the times look wrong so
  someone fixes them — a warning, not a refusal [D49]. An overnight line earns on the day it sits on, and the hours
  spilling past midnight earn the next day nothing [D42].

## The OIL question (inputs on non-working days)
- Every input kind that can earn — Training, Course, Meeting, Fly with, Appointment, Duty, Event, Overseas duty and
  Other — is asked the OIL question and its answer decides, wherever it is filed, under Unavailable included [D804].
  "→ Unavail", "Accept", a put-back after the day became a holiday, and a swap, an add or a move from one input's row
  to another's that raises the question all put the question first — nothing moves, and nothing is put back, until it
  is answered [D783, D793, D804, D831].
- Not answered: both pucks flash and a bar stays until tapped — "Not swapped — OIL not answered · Answer OIL · OK" —
  always one line, in the band under the top bar [D783, D831, D840].
- Every door that waits keeps that bar, naming what was not done ("Not added", "Not filed", "Not un-cancelled"), and
  nobody else is told of a swap or an add not made. Answered, the answer and the change are one step and one Undo; an
  Undo never asks the question, the input's "OIL?" tag, the list and the bell going on saying it needs an answer
  [D783, D793, D804, D816, D831].
- Taking the cancel, or the information-only ⓘ mark, off an input that has no OIL answer for a non-working day puts the
  question first, as "Accept" does — nothing is un-cancelled until it is answered; already answered, or nothing to ask,
  it comes off at once and the answer counts again [D816]. With the bar up, "Answer OIL" un-cancels at once where
  nothing is left to ask [D865].
- A day made a holiday afterwards: the admin declaring it is told at once, and what he answers there notifies nobody;
  only what is left unanswered goes to the schedulers and to whoever answers for each input [D781, D783]. The one list
  opens by itself when a holiday is saved, and the schedulers' bell carries one line a holiday, counting what is left
  [D783, D831].
- The admin answers a day's open OIL questions from one list — every input of that day that needs an answer, each with
  its yes and no, and a "Yes to all" and a "No to all" [D782]; the list a load opens shows the day's whole open list
  [D865].
- In that list an input of several people is one line with its one answer, a yes offering a full or a half day (FO or
  HO) as the single question does, and each answer stays the input's own, stamped with who gave it; "Later" leaves what
  is left for the bells; the bell's line, and the Leave War's Event row that makes a holiday, open the same list
  [D782, D783, D831].
- A published version loaded back onto the working copy is not held: its note, in short plain sentences, says what the
  day is back to, what viewers still see, what else came back or stayed out, and how many inputs need an OIL answer —
  never the edits thrown away, which the confirming button has just said [D818, D863]; and the OIL list opens for the
  day that needs the answer — another day of an input of several days included, which the note counts; what is
  answered there notifies nobody [D818, D862].
- "Switch to this plan" that brings back an unanswered input gets the load's short note and list [D865].
- The "Only some days…" calendar is the app's one date calendar in its look: a tap turns each separate day on or off,
  only the input's non-working days tappable, and which days earn OIL is decided as before — a way of its own for this
  one place, every other calendar still picking one date or one run [D923]; on a phone up to 400 wide it has no box of
  its own, and its count line reads "No days selected — tap a day to credit it" [D978].
- A weekend or holiday that no Leave War period covers names the reason — that year's period does not exist — and
  offers to create it, never a bare refusal and never silently: the offer hands the scheduler to the Leave War to set
  the period's window [D19]; an input filed for such a weekend asks and saves its OIL answer as on any other day and
  never offers to create a period — stated on the Inputs file [D1578].

## Earned and awarded
- "Earned" counts only what the app credited itself — the published schedule or an accepted duty input; every OIL an
  admin gives by hand, typed on the war grid or credited from the OIL Tracker, is shown apart as "awarded"; the balance
  itself does not change, only how its parts are named [D400].
- Every OIL award given by hand shows on the Leave War grid on its date, wherever it was given, as an FO or HO box; a
  tap says who gave it and why; a credit dated in no Leave War period shows on no cell, and a correction (a negative
  entry) is never drawn [D402]. A member opens his own OIL award, read only, at every stage [D261].
- Every member may see every man's OIL tracker entries, figures and grants, with their reasons, as the app shows today;
  the database's access table says so [D1008].
- An OIL award does not flag a leave day — it says he is owed a day, not where he was; whether an award counts him on
  duty for manning is not ruled, so ask him before changing it [D80].
- A dragged block's delete removes everything in it, OIL awards included — its confirm names each award first, and one
  Undo brings them back; the bid sheet's Clear does the same, naming an award and asking once; a move or a drag leaves
  awards where they are [D260].
- At the database step earned OIL is stored in a table of its own, one row a person and a date, not tied to a Leave War
  period; the Leave War, the OIL tracker and every other screen read it from there; until then the Inputs file's D1578
  stands [D1579].

## How it shows, and OIL Earn
- The green OIL bar shows only on the events that counted towards a man's day, not on every puck he wears; the ALL AVAIL
  count chip agrees with it [D1].
- In OIL Earn a tap on a man's puck that cannot earn on its row picks nothing and says why in the app's plain passing
  note — "Nothing changed for <callsign>." and then the reason, such as "No OIL worked out — this row has no end time."
  — not in the grey "Blocked:" note [D1783].
- Every reason that tap gives takes that shape: "nothing measurable to earn from here" becomes "This row gives him no
  working hours to count OIL from."; the tap targets stay as they are [D1783, D26].
- The OIL batch's new words stand as built: when an amendment is withdrawn, the Unpublish warning, its done note and the
  armed button's title; and the same-time line's "earns nobody any OIL" sentence [D1094].
- The OIL question's words when an input's ⓘ (information only) mark comes off stay as built [D865].

## Settled — leave as they are
- The OIL mode's phone tap targets: he settles OIL on his phone easily — do not re-open them or re-file them as a
  defect; nothing to build; a real user's complaint of mis-taps would be new evidence and a new question [D26].
- Stored awards in the old shape: demo data, wiped before the database, so only the demo seed is rewritten in the new
  one kind of award — and a record in the old shape must still not break a load [D401, D54, D56].
- The award dates and post-out losses seen in the demo data are left as they are — demo data only, wiped before the
  database; the two items that raised them are closed [D163, D54, D56].
- The OIL Earn mode went live (22 Sep 26, on a one-off permission since spent and archived) with his five-minute look
  waived: its evidence is the walk, `raptor-port/docs/handpass/2026-09-22-oil-walk.md`, and the gates — the defects the
  walk found are fixed red-first, do not re-do them — never an owner sighting, so never assume he saw the walked Saturday.
- The OIL Earn mode's design of record, with the rulings not to relitigate (its §8 and §9):
  `raptor-port/docs/superpowers/specs/2026-09-21-oil-auto-remove-decisions.md`; the finished item is in
  `OUTSTANDING-ARCHIVE.md`, under `[OIL-AUTO-REMOVE]`.

## From other areas (each stated on its own area's file)
- The scheduler's, an input with several people: one OIL answer for everyone in it, given by whoever filed it or an
  admin — no man in it gives his own, and the filer picks nobody out; only the scheduler leaves one person out, in OIL
  Earn on the day; a person added follows that answer, the scheduler asked on the spot only where there is none yet
  [D762, D755]. Whoever files an input for other people answers its OIL question for all of them at the save [D660].
- The scheduler's: when the filer answers a shared input's OIL question again, the answer is written for everyone in
  it — a man's own earlier No is replaced; the latest answer counts, and the scheduler's refusal still wins [D682].
- The scheduler's: a shared input's OIL line states its one answer — its people can no longer differ, so nothing is
  counted [D762]; an answer for a day the input no longer covers stays on the record, credited for nothing and shown nowhere, and stands again if the input moves back [D731].
- The scheduler's: where ALL AVAIL / ALL is one of a shared input's own people, the men behind it follow the input's
  OIL answer, and the scheduler may still switch any one man [D753]; whoever stands on a row that came from an input is
  in the input, however they got there [D755].
- The scheduler's, OIL Earn on the board: his own puck shows the green OIL ring, not the purple one [D272]; a tap on a
  man in the ALL AVAIL window only switches his earning and selects nothing [D65]; the day button is the app's own
  slider switch, "No OIL earned", its refusal keeping his words [D1782].
- The scheduler's, the placeholders: where the ALL / ALL AVAIL pucks may land and where they are refused [D27, D33,
  D47]; who counts as available, and the window that lists them [D36, D37, D38, D39, D40, D41, D51]; the crowd frozen
  at publication, and the pending mark [D44, D45].
- The design file's: on a phone the board's day bar shows the desktop's marks before Templates and OIL Earn, on one
  row [D1793].
- The Leave War's: a bid that shares its day with an OIL award moves alone; the award stays where it is [D265, D260].
  People and accounts: an archived man stays in the ALL AVAIL crowd on every day before his archive [D327].
- How we work: an issued weekend carrying a placeholder on a duty desk, sim seat or extras line raises the pending mark
  once `[OIL-SEATS-CAN-EARN]` ships — leave it, he republishes it once [D54]; a problem living only in data already
  stored is not a finding [D56].
