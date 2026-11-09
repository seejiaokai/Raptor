---
paths:
  - raptor-port/src/**/*Oil*
  - raptor-port/src/leavewar/**
  - raptor-port/src/**/*Avail*
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

Loads with any OIL, Leave War, placeholder-puck or publishing file (the `paths:` above). Each line is a rule as it stands, its rulings after it; his words, the agent's readings told to him, dates and history are in the full rows, `.claude/decisions-full/oil.md` — open the row before acting on a rule's detail or asking him about it. Other areas' rulings are pointed to last, each stated on its own page; the map: `DECISIONS.md`.

## What OIL is
- OIL is earned leave — time off banked, never pay or money; say so in every report and on every screen. It is owed all the same: the bug-check order's money question (what a man is owed or paid) fires on any change touching it [D25].

## What earns, and from what
- Only the issued (published) schedule earns OIL, both ways: a holiday declared after publication waits for republication, the day saying so; revoking one never removes OIL silently [D2].
- A day's OIL comes from its latest published version — the latest amendment, or the EOD if later — however old the day; no lock, no clock. The published record is what happened, with no test of whether the day was worked: a later amendment or EOD taking a man off a past day takes that day's OIL from him (to keep it, leave him on); a published EOD is the day's final word [D142].
- An issued day keeps the rule and the OIL it went out with when a rule changes under it: the credit stays until someone corrects the times and publishes again, an ordinary amendment; clearing wrong demo data covers stored data merely wrong, never OIL on a published record silently changing amount [D48]; a later time or Logic change reads as pending until the day is published again [D592].
- One principle, no allow-list: every seat can earn, its default decides whether it does, the admin can always override in OIL Earn, and a placeholder takes the seat's default as a named man does; the one boundary is a seat with nothing to measure — no times, zero length, cancelled, or an ⓘ row — no switch, a short line saying why, never a silent absence; a flying line with the same written take-off and landing is not such a seat, and earns (below) [D28, D31, D43, D755, D776, D49].
- On by default: flying lines, SC MAIN, Common Programme, Standard and SC-shift duty desks, ground rows, sims, sim passengers, the extra-people line, a standby line that actually flies [D15, D24, D43, D755, D776, D1042, D1043, D1044, D1060, D1064, D1066, D1061]; an ⓘ row and a BB duty desk do not earn by default [D15, D24].
- Off by default, the switch offered in the mode: SC SPARE, AVALON flying lines and duty desks, BB flying lines, a duty block minted from an AVALON template — the same seat, one answer; an activated one can be credited, on a published day through an ordinary amendment [D24, D35, D1042, D1043, D1044, D1060, D1064, D1066, D1061].
- A standby line that actually flies is a real flight and earns by default; it flies with B or R typed — every row, SPARE included, for OIL as for the rest, the day ending at END with no debrief, a row not coming in cancelled by its own CX — or with a row ticked "Flies" by hand, lighting that row only (the scheduler's file) [D24, D1042, D1043, D1060, D1064, D1066, D1044, D1045, D1046, D1061].
- The placeholder pucks (ALL / ALL AVAIL) behave exactly like named people: on by default wherever a named man is, off on the off-by-default seats until the line actually flies, and wherever one may land it offers the switch — landing and earning one list, one decision; on a row from an input a placeholder is one of its people and follows its one OIL answer [D32, D43, D24, D755, D776, D1042, D1043, D1044, D1060, D1064, D1066, D1061].
- A man the scheduler puts in the name box of another man's request row replaces him in the input or joins him, and follows its OIL answer; either can be tapped off in OIL Earn; a request that never asks (Personal) earns nobody anything, whoever is on its row [D470, D755, D776].
- Correct as built, no conflict: a ground crewman named on a weekend duty earns; a placeholder on it earns for the men it stands for unless switched off; ALL / ALL AVAIL never include ground crew [D52].
- An award and a worked day add up [D82]. OIL may be credited by hand on any day; the weekend and holiday limit belongs to the automatic pass, which reads the published schedule [D79].

## What does not earn
- An "Off day" does not earn — settled, do not reopen: time given to a man, not a holiday he was called in on; only a PH turns a day into one that can earn; the Leave War's own Off day stays inert for OIL, and leave charging is untouched [D21].
- Leave and medical inputs never earn and are never asked the OIL question; nor are a Personal input, a SANS availability or an upchit [D804].
- A cancelled input is never asked — not at a save, a put-back or a filing — wears no "OIL?" tag and stands in neither the one list nor the bell, since it can earn nothing; an information-only input the same [D814].
- A worked weekend that earns nobody any OIL says so, on the day and at publish, with its reason [D81]; an ALL AVAIL / ALL row with a start and no end counts over the one-hour default and earns nobody, the admin told "no OIL worked out — this row has no end time" (the scheduler's file) [D360].

## How long a day counts
- A flying line's OIL runs from the earliest applicable entered in-time / rally for the formation, the nominal report time where none is entered; an evening-before report lengthens that line's own day only; the day counts first event to last end, breaks included [D591, D592].
- An SC shift's typed B (its in-time) counts as work: its OIL and work hours run from it to the shift's end; a blank B leaves the written start to end [D606]; a rally typed on an SC MAIN line starts that crew's day as the B does (the scheduler's file) [D1041].
- A flying line with the same written take-off and landing still earns, the day saying the times look wrong so someone fixes them — a warning, not a refusal [D49]. An overnight line earns on the day it sits on; the hours past midnight earn the next day nothing [D42].

## The OIL question (inputs on non-working days)
- Every kind that can earn — Training, Course, Meeting, Fly with, Appointment, Duty, Event, Overseas duty and Other — is asked the OIL question and its answer decides, wherever filed, under Unavailable included [D804]. "→ Unavail", "Accept", a put-back after the day became a holiday, and a swap, add or move from one input's row to another's that raises it put the question first — nothing moves or is put back until answered [D783, D793, D804, D831, D840].
- A swap waits: its buttons "Don't swap" and "Swap", Swap greyed until Yes or No is picked; unanswered, both pucks flash and a bar stays until tapped — "Not swapped — OIL not answered · Answer OIL · OK", one line in the band under the top bar; "Answer OIL" reopens the question, "OK" only closes the bar. Every waiting door keeps that bar, naming what was not done ("Not added", "Not filed", "Not un-cancelled"); nobody else is told of a swap or add not made [D783, D831, D840].
- Answered, the answer and the change are one step and one Undo; an Undo never asks the question — the input's "OIL?" tag, the list and the bell go on saying it needs an answer [D783, D793, D804, D816, D831, D840].
- Taking the cancel, or the information-only ⓘ mark, off an input with no OIL answer for a non-working day puts the question first, as "Accept" does — nothing is un-cancelled until it is answered; already answered, or nothing to ask, it comes off at once and the answer counts again [D816]; with the bar up, "Answer OIL" un-cancels at once where nothing is left to ask [D865].
- A day made a holiday afterwards: the admin declaring it is told at once, what he answers there notifies nobody, and only what is left goes to the schedulers and to whoever answers for each input; the one list opens by itself when the holiday is saved, and the schedulers' bell carries one line a holiday, counting what is left [D781, D783, D831, D840].
- The admin answers a day's open questions from one list — every input of that day needing an answer, each with its yes and no, and "Yes to all" and "No to all" [D782]; a load opens the day's whole open list [D865]. A several-people input is one line with its one answer, a yes offering a full or half day (FO or HO) as the single question does, each answer the input's own, stamped with who gave it; "Later" leaves the rest for the bells; the bell's line and the Leave War's Event row that makes a holiday open the same list [D782, D783, D831, D840].
- Saved as a holiday, the list opens under "<its name> is now a public holiday."; each yes reads "Yes · FO" or "Yes · HO", a chosen No in quiet grey; it ends in "Later" and "Save", and no "OIL?" tag shows inside it; its design of record: `raptor-port/docs/mock/oil-notify.html` [D782, D783, D831, D840].
- A published version loaded back onto the working copy is not held: its note, short plain sentences, says what the day is back to, what viewers still see, what else came back or stayed out, and how many inputs need an OIL answer — never the edits thrown away, which the confirming button just said [D818, D863]; the OIL list opens for the day needing the answer — another day of a several-day input included, counted in the note; what is answered there notifies nobody [D818, D862]; "Switch to this plan" bringing back an unanswered input gets the same note and list [D865].
- The "Only some days…" calendar is the app's one date calendar in its look, a tap turning each separate day on or off, only the input's non-working days tappable, which days earn decided as before — a way of its own for this one place, every other calendar still picking one date or one run [D923]; on a phone up to 400 wide it has no box of its own and its count line reads "No days selected — tap a day to credit it" [D978].
- A weekend or holiday no Leave War period covers names the reason — that year's period does not exist — and offers to create it — never a bare refusal, never made silently: the offer hands the scheduler to the Leave War to set its window [D19]; an input filed for such a weekend asks and saves its OIL answer as on any other day and never offers to create a period (the Inputs file) [D1578].

## Earned and awarded
- "Earned" counts only what the app credited itself — the published schedule or an input's yes to the OIL question; OIL an admin gives by hand, typed on the war grid or credited from the OIL Tracker, shows apart as "awarded"; the balance does not change, only how its parts are named [D400, D804].
- Every award given by hand shows on the Leave War grid on its date, wherever given, as an FO or HO box; a tap says who gave it and why; a credit dated in no Leave War period shows on no cell; a correction (a negative entry) is never drawn [D402]. A member opens his own award, read only, at every stage — one tap shows its reason, who gave it and how many days, bidding open or not [D261].
- Every member may see every man's OIL tracker entries, figures and grants, with their reasons, as the app shows today; the database's access table says so [D1008]. A member cannot type his own OIL figure in his person window — a tap on OIL opens the tracker (the Leave War's file) [D1209].
- An award does not flag a leave day — it says he is owed a day, not where he was; whether it counts him on duty for manning is not ruled: ask him before changing it [D80].
- A dragged block's delete removes everything in it, awards included — its confirm names each award first, one Undo brings them back; the bid sheet's Clear does the same, naming an award and asking once; a move or a drag leaves awards where they are [D260].
- At the database step earned OIL is a table of its own, one row a person and a date, not tied to a Leave War period, which the Leave War, the OIL tracker and every other screen read; until then the Inputs file's D1578 stands [D1579].

## How it shows, and OIL Earn
- The green OIL bar shows only on the events that counted towards a man's day, not on every puck he wears; the ALL AVAIL count chip agrees with it [D1].
- In OIL Earn a tap on a puck that cannot earn on its row picks nothing and says why in the app's plain passing note — "Nothing changed for <callsign>." then the reason — not the grey "Blocked:" note; every such reason takes that shape ("This row gives him no working hours to count OIL from."); the tap targets stay [D1783, D26].
- Words that stand as built: the OIL batch's — the Unpublish warning, its done note and the armed button's title when an amendment is withdrawn, and the same-time line's "earns nobody any OIL" [D1094]; the OIL question's when an input's ⓘ mark comes off [D865].

## Settled
- The OIL mode's phone tap targets stay: he settles OIL on his phone easily — not re-opened, not re-filed, nothing to build; a real user's mis-tap complaint would be new evidence, a new question [D26].
- No stored award is converted: demo data, wiped before the database — only the demo seed is rewritten in the new one kind of award, and an old-shape record must still not break a load [D401, D54, D56]. The demo award dates and a demo man still flying after his posting out stay — demo data, the two items that raised them closed [D163, D54, D56].
- The OIL Earn mode (`[OIL-AUTO-REMOVE]` in `OUTSTANDING-ARCHIVE.md`) went live 22 Sep 26 on a spent one-off permission, his five-minute look waived: its evidence is the walk `raptor-port/docs/handpass/2026-09-22-oil-walk.md` (defects fixed red-first, not to re-do) and the gates, never his sighting — never assume he saw the walked Saturday; its design of record, §8–§9 not to relitigate: `raptor-port/docs/superpowers/specs/2026-09-21-oil-auto-remove-decisions.md`.

## From other areas
- The scheduler's, on OIL (shared inputs, ALL AVAIL, OIL Earn on the board, placeholders, availability, the crowd at publication): D762, D660, D682, D753, D272, D277, D65, D1782, D27, D33, D47, D36, D37, D38, D39, D40, D41, D51, D44, D45.
- Two parts stated here: a person added to a shared input follows its answer, the scheduler asked on the spot only where there is none yet, a No's note saying they are not counted [D755, D776]; an answer for a day the input no longer covers stays on the record, credited for nothing, and counts again if the input moves back [D731, D762].
- The design file's D1793; the Leave War's D265 with D260; People & accounts' D327; How we work's D54 (leave it — the pending mark once `[OIL-SEATS-CAN-EARN]` ships) and D56.
