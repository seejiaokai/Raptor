# Rules diet step 5a — the account of the OIL rulings, by requirement (8 Nov 26)

**What it is.** The account the plan asks of every conversion (`raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md`
§2 "The account — by requirement", §7 step 5a — OIL is the full trial of the method): every ruling of the old
`.claude/rules/decisions/oil.md`, split into its parts, each part → the page line that states it now, or marked spent,
detail or superseded, or a gap. **Compared:** old = `a6265cae0` (the table of 49 short lines, its "Also read" and "Also
know" paragraphs); new = `a9b873022` (the page, first draft). **How it was made:** for every one of the 49 rulings — not
only those whose short line ends "— changed by" — the full row in `.claude/decisions-full/oil.md` read sentence by
sentence (its meaning cell; where it carries a mark, the rule as it now stands); the "Also read" and "Also know"
paragraphs read item by item, each pointer checked against its ruling's short line and full row in its own area
(`scheduler.md`, `inputs.md`, `leave-war.md`, `people-accounts.md`, `design.md`, `how-we-work.md`), D738 and D744 in
`DECISIONS-ARCHIVE.md`; the backlog (`OUTSTANDING.md`, `OUTSTANDING-ARCHIVE.md`) searched where a part's state decides
whether it is live; `raptor-port/docs/engine-rules.md` read where two rulings meet (D606 and the standby lines, the
AVALON and BB desks). Built by one Opus helper; **not yet read by the blind readers.**
**Fixes applied (the same helper, 8 Nov 26, working tree, not committed):** every gap below carries a **Fixed:** note
saying where it is stated now. **The account table points to the page as fixed**; a part marked A# or B# was missing or
bent at `a9b873022`.

**Codes.** Page sections: **P-head** (the paragraphs before the first heading), **P-What** §What OIL is, **P-Earn**
§What earns, and from what, **P-Not** §What does not earn, **P-Len** §How long a day counts, **P-Ask** §The OIL question
(inputs on non-working days), **P-Award** §Earned and awarded, **P-Show** §How it shows, and OIL Earn, **P-Set**
§Settled — leave as they are, **P-From** §From other areas. A page line is named by its section code and its first
words. Marks: **stated** — the line states the part; **spent** — a one-off part done (the evidence named);
**detail** — an example, figure, reason, history or a design detail kept in its reference document, not a rule;
**superseded** — a later ruling replaced the part (named, with its date; the newer wins); **A#/B#** — a gap below.
"r" before a part is the agent's reading told to him in the row; "his answer" one of his numbered answers.

## Gaps

### A — a rule part missing or stated differently

| # | Ruling | Part | The full row says | The page at `a9b873022` | Fixed |
|---|---|---|---|---|---|
| A1 | D142 | the consequence he confirmed | "a later amendment or EOD that takes a man off a past day takes that day's OIL away from him; to keep it, do not take him off. An EOD, once published, is the final word on the day"; "there is no 'was the day actually worked?' test" | only "latest published version … no lock, no clock" | **Fixed:** P-Earn new bullet "The published record is what happened…" [D142]. |
| A2 | D48 | how an issued day is held; a limit on clearing demo data | "held to the rule it was published under; the credit … stays until somebody corrects the times and re-publishes, and the correction then shows as an ordinary amendment"; the demo-data rule and D22 "do not cover money on a published record silently changing amount" | only "keeps the OIL it went out with when a rule changes under it" | **Fixed:** P-Earn new bullet "An issued day is held to the rule it went out under…" [D48] (money read as OIL, D25). |
| A3 | D31 (with D49) | what "nothing to measure" means | "No times on it, zero length, cancelled, or ⓘ: no switch, and a short line on screen giving the reason … never a silent absence" | "a seat with nothing to measure … says why instead" — the four cases gone | **Fixed:** P-Earn new bullet "A seat has nothing to measure when…" [D31, D49]. **Clash named:** D31's "zero length" and D49 (both 22 Sep 26; D49 the later, it overruled the plan's step and both reviewers) — a flying line whose take-off and landing are the same still earns, so the bullet says it is not such a seat. |
| A4 | D606 (with D1042, D1044) | which time counts; the SPARE | r1 "the EARLIER of the B and the shift's written start is used — a B typed later … does not shorten the shift"; r2 an evening-before B "lengthens the shift's OWN day only"; r3 "it is the MAIN's in-time only — a SPARE reports nowhere, so his B does nothing … one an admin switches on … earns the shift's WRITTEN hours" (all tested as built; `engine-rules.md` carries them) | "run from that in-time to the shift's end" — reads as if a later B shortens the shift; the SPARE absent | **Fixed:** P-Len "An SC shift's typed B…" (earlier of B and start, a later B shortens nothing, the evening before) and new bullet "A SPARE that only stands by…" [D606, D1044]. **Clash named:** r3's "an SC SPARE still earns nothing by default" (7 Oct 26) gives way where its shift flies — D1042, D1044 (19 Oct 26): a shift with B or R typed flies whole, SPARE rows included, each earning by default. |
| A5 | D49 | what is kept from the overruled step | "the day must SAY the times look wrong, so somebody fixes them — a warning, not a refusal" | only "still earns" | **Fixed:** P-Len "A flying line whose written take-off and landing are the same still earns, and the day says the times look wrong…" [D49]. |
| A6 | D804 | which kinds are asked; which never | r4 (he confirmed the ruling the same morning): "Others" are Training, Course, Meeting, Fly with, Appointment, Duty, Event, Overseas duty, Other; "a Personal input (D778), SANS availability and an upchit are still never asked" | "every input kind that can earn" — which kinds is nowhere; Personal only in the D470 line, SANS availability and an upchit nowhere | **Fixed:** P-Ask first bullet names the kinds; P-Not "Leave and medical inputs … nor are a Personal input, a SANS availability or an upchit asked it" [D804]. |
| A7 | D783, D781 | who is told; which moves wait | his answer 4: "nobody else is told when a swap or an add is not made" (D781's reading the same); the reading told at the build: "a MOVE from one input's row to another's that raises the question waits the same way" | swaps and adds only; nothing on who is told | **Fixed:** P-Ask first bullet ("a swap, an add or a move from one input's row to another's"); P-Ask new bullet "Every door that waits…" ("nobody else is told of a swap or an add not made"). |
| A8 | D816 | the ⓘ mark | r1: "taking the information-only mark off is treated the same" (built, its words D865) | only "Taking the cancel off" | **Fixed:** P-Ask "Taking the cancel, or the information-only ⓘ mark, off an input…" [D816]. |
| A9 | D402 | what is never drawn | "A tracker credit dated in no war shows on no cell (there is none), and a correction (a negative entry) is never drawn" | absent | **Fixed:** P-Award "Every OIL award given by hand… a credit dated in no Leave War period shows on no cell, and a correction … is never drawn" [D402]. |
| A10 | D260 | the bid sheet's Clear | r1: "the bid sheet's one-day Clear follows the same rule — it removes the award with the rest, and on a day holding an award it names it and asks once before it goes" (built: one day and a range) | delete of a dragged block only | **Fixed:** P-Award "A dragged block's delete… the bid sheet's Clear does the same, naming an award and asking once; a move or a drag leaves awards where they are" [D260]. |
| A11 | D80 | an open question kept his | "He did NOT rule on whether an award counts him on duty for manning; ask before changing that" | absent | **Fixed:** P-Award new bullet "An OIL award does not flag a leave day — … ask him before changing it" [D80]. |
| A12 | D19 | what the way out is, and its guard | "the day says the leave war period for that year does not exist, and offers to create it … never made silently from a schedule screen — the offer creates it and hands the scheduler to the Leave War to set the window" | "names the reason and offers the way out" | **Fixed:** P-Ask "A weekend or holiday that no Leave War period covers names the reason — that year's period does not exist — and offers to create it, … never silently…" [D19]. |
| A13 | D25 | OIL stays in the money check's scope | "the bug-check order's tier question 1 still fires on OIL, because it asks what a man is OWED as well as paid … so a later reader cannot conclude OIL is out of scope" | absent | **Fixed:** P-What new bullet "OIL is owed all the same: the bug-check order's money question…" [D25]. |
| A14 | D738, D744 (archived; restated by D762, D755) | a man added to a shared input | the old "Also read": he "takes the OIL answer the input carries, with no question there … OIL Earn still switches him"; as restated — D762 r4, D755 (1): "a person added follows the answer, and the scheduler is asked on the spot only where there is none yet" | the D762 pointer has the one answer and the scheduler's switch only; the added person is nowhere | **Fixed:** P-From first bullet "… a person added follows that answer, the scheduler asked on the spot only where there is none yet" [D762, D755]. The archived rows' "where their answers differ he is asked" no longer arises: one input, one answer. |
| A15 | D731 (with D762) | a pointer out of date | D731 (4) "credited for 2 of 3 — Ranger: no" is "AMENDED BY D762": the line states the one answer; built 12 Oct 26 with the one-rule job (`ui-contracts.md` marks the old words gone) | P-From "a shared input's OIL line counts its people where their answers differ — 'credited for 2 of 3 — Ranger: no'" — the old paragraph's stale words, copied | **Fixed:** P-From "a shared input's OIL line states its one answer — its people can no longer differ, so nothing is counted [D762]; an answer for a day the input no longer covers stays on the record… [D731]". |

### B — smaller drops (a wording, a reason or a detail a builder may want back)

- **B1** D79 — the weekend and holiday limit belongs to the automatic pass that reads the published schedule, not to a
  credit the squadron records itself. **Fixed:** P-Earn "… OIL may be credited by hand on any day: the weekend and
  holiday limit belongs to the automatic pass…" [D79].
- **B2** D81 — it says so "on the day and at publish, with the reason". **Fixed:** P-Not "A worked weekend … says so, on
  the day and at publish, with its reason" [D81].
- **B3** D21 — why: time given to a man, not a holiday he was called in on; only a PH turns a day into one that can earn.
  **Fixed:** P-Not "An "Off day" does not earn OIL — settled, do not reopen: it is time given…" [D21].
- **B4** D15 — "AVALON/BB desks" do not earn by default; the page named AVALON desks only, so a BB duty desk was
  nowhere. **Fixed:** P-Earn "On by default…" — "An ⓘ row and a BB duty desk do not earn by default" [D15, D24]
  (whether a BB desk offers the switch is not ruled — see below).
- **B5** D24, D35 — the page attached "until the line actually flies" to the whole off-by-default list, duty desks and
  the AVALON template block included, which never fly. **Fixed:** P-Earn "Off by default…" — the clause moved to the
  end, "a standby line that actually flies earns by default (below)".
- **B6** D592 r8, r9 (as built, put to him on the look card) — a Logic change reads pending where anyone's OIL record —
  his amount or the worked times beside it — would be written differently; the four sign-offs fall when a Logic change
  made after they signed would alter the day's OIL, standing again when the value is put back. **Fixed:** P-Len new
  bullet "As built, and put to him as readings…" [D592].
- **B7** D783 his answer 3, D793 r2–r3, D804 r3, D816 r2–r4 — every door that waits keeps the same bar, naming what was
  not done ("Not added", "Not filed", "Not un-cancelled — OIL not answered"); answered, the answer and the change are one
  step and one Undo; an Undo never asks, the "OIL?" tag, the list and the bell going on saying it needs an answer.
  **Fixed:** P-Ask new bullet "Every door that waits keeps that bar…" [D783, D793, D804, D816, D831].
- **B8** D782 readings, D783 his answer 6 and readings, D818 r4 — in the one list an input of several people is one line
  with its one answer; a yes offers a full or a half day (FO / HO); each answer stays the input's own, stamped with who
  gave it; "Later" leaves what is left for the bells; the bell's line and the Leave War's Event row that makes a holiday
  open the same list. **Fixed:** P-Ask new bullet "In that list…" [D782, D783, D831].
- **B9** D818 r4 — what is answered in the list a load opens notifies nobody. **Fixed:** P-Ask "A published version
  loaded back… what is answered there notifies nobody" [D818, D862].
- **B10** D923 r1 — the many-days tap is a way of its own for this one place; every other calendar still picks one date
  or one run. **Fixed:** P-Ask "The "Only some days…" calendar…" [D923].
- **B11** D1578 (a pointer the first draft added) — it dropped "never creates or offers to create a period", the very
  contrast with D19's offer beside it. **Fixed:** P-Ask D19 bullet "… and never offers to create a period — stated on the
  Inputs file" [D1578].
- **B12** D400 — "the balance itself does not change — only how its parts are named". **Fixed:** P-Award D400 bullet.
- **B13** D260 — one Undo brings the deleted awards back. **Fixed:** P-Award D260 bullet (with A10).
- **B14** D865 — "The OIL job's ⓘ mark keeps its words as built" did not say which words: the OIL question's when an
  input's information-only mark comes off. **Fixed:** P-Show "The OIL question's words when an input's ⓘ (information
  only) mark comes off stay as built" [D865].
- **B15** D26 — "If a real user ever complains about mis-taps, that is new evidence and a new question, not this one
  re-asked". **Fixed:** P-Set D26 bullet.

### Not settled — each with the reading taken

- **D1783 is not built.** `[OIL-INERT-TAP-SILENT]` is open in `OUTSTANDING.md` (the pictures-round build); the page
  states the rule as ruled, like the old short line, with no "to be built". Reading: left as it is; a reader who wants
  the build state follows the item.
- **D606 r3–r4 against D1042–D1044.** Newest wins (19 Oct over 7 Oct): a typed B or R flies the whole standby shift,
  SPARE rows included, each earning by default, so r4 ("AVALON and BB untouched — their B never an in-time") is
  superseded. Whether a typed B then starts a SPARE row's own span is stated only in `engine-rules.md` (it does); D1044
  says "using the line's planned START and END". The page claims neither.
- **D31's "zero length" against D49** — read as D49 governing the flying line (above, A3); his to correct.
- **D592 r6–r9** were "not his words until he answers"; no answer is recorded. The page states r8–r9 "as built, and
  put to him as readings".
- **A BB duty desk and the OIL switch.** D24 names "BB flying lines" only; D15's "AVALON/BB desks" stays for the default;
  D28's principle would offer the switch wherever the desk has times, and a BB desk is minted without them (D31). The page
  says only "does not earn by default".
- **D682's pointer** keeps "a man's own earlier No is replaced" — D682's own words, moot since D762 (no man in an input
  has his own answer). Faithful, left.
- **D43's full row is cut off** mid-sentence in `.claude/decisions-full/oil.md` ("… it inherits the seat's"), the
  where-it-lives cell following at once. A search of the history found it cut short there from its first appearance. Outside this job.
- **The page is over its tripwire:** 18,643 bytes against 15,500 (`npm run docsize` fails on that alone). No rule part
  was cut to fit; the host asks him to raise it.

## The account — every ruling of the old file, newest first

| Ruling | Part | Where on the page | Mark |
|---|---|---|---|
| D1783 | (a) in OIL Earn a tap on a puck that cannot earn on its row picks nothing | P-Show "In OIL Earn a tap on a man's puck…" | stated |
| | (b) says why in the app's plain passing note — "Nothing changed for <callsign>." then the reason | P-Show "In OIL Earn a tap…" | stated |
| | (c) not in the grey "Blocked:" note | P-Show "In OIL Earn a tap…" | stated |
| | (d) every reason takes that shape; "nothing measurable to earn from here" becomes "This row gives him no working hours to count OIL from." | P-Show "Every reason that tap gives…" | stated |
| | (e) the tap targets stay (D26) | P-Show "Every reason that tap gives…" | stated |
| | (f) changes none: carries D31 and D65 to the board | — | detail |
| | (g) what B would have cost | — | detail |
| | (h) state: filed as `[OIL-INERT-TAP-SILENT]`, open | — | not settled (above) |
| D1579 | (a) at the database step earned OIL is stored in a table of its own | P-Award "At the database step…" | stated |
| | (b) one row a person and a date, not tied to a Leave War period | P-Award "At the database step…" | stated |
| | (c) the Leave War, the OIL tracker and every other screen read it from there | P-Award "At the database step…" | stated |
| | (d) until then D1578 stands | P-Award "At the database step…" | stated |
| | (e) how a credit is stored today, the cause of D19's advisory | — | detail |
| | (f) filed, not built — the database comes at the end (D473) | P-Award "At the database step…" | stated |
| D1094 | (a) the new words stand as built: the Unpublish warning, its done note and the armed button's title when an amendment is withdrawn | P-Show "The OIL batch's new words…" | stated |
| | (b) the same-time line's "earns nobody any OIL" sentence | P-Show "The OIL batch's new words…" | stated |
| | (c) the batch goes live on this "merge live" | — | spent (his "merge live" of 20 Oct 26, in the row) |
| | (d) r: the Original keeps N2 and N4 whole; the amendment's done note names the version as N3 does | — | detail (`ui-contracts.md`) |
| D1008 | (a) every member may see every man's OIL tracker entries, figures and grants, with their reasons | P-Award "Every member may see…" | stated |
| | (b) as the app shows today | P-Award "Every member may see…" | stated |
| | (c) the database's access table widened to say so | P-Award "… the database's access table says so" | stated (the build spent: `[LEDGER-READ-ASK]` archived) |
| D978 | (a) on a phone up to 400 wide the "Only some days…" calendar has no box of its own | P-Ask "The "Only some days…" calendar…" | stated |
| | (b) its count line reads "No days selected — tap a day to credit it" | P-Ask "The "Only some days…" calendar…" | stated |
| | (c) both as built | P-Ask "The "Only some days…" calendar…" | stated |
| | (d) `[OIL-CONFIRM-DAYGRID]` goes live on this "merge live" | — | spent (item archived) |
| | (e) r: a desktop keeps the calendar's box; no button changes size | — | detail (implied by "on a phone") |
| D923 | (a) the calendar becomes the app's one date calendar in its look | P-Ask "The "Only some days…" calendar…" | stated |
| | (b) a tap turns each separate day on or off | P-Ask "The "Only some days…" calendar…" | stated |
| | (c) only the input's non-working days can be tapped | P-Ask "The "Only some days…" calendar…" | stated |
| | (d) which days earn OIL is decided as before | P-Ask "The "Only some days…" calendar…" | stated |
| | (e) r1: the many-days tap is this one place's own; every other calendar picks one date or one run | P-Ask "The "Only some days…" calendar…" | B10 |
| | (f) r2–r4: a picture first, a full check, its own job | — | spent (built; `[OIL-CONFIRM-DAYGRID]` archived) |
| D865 | (a) the ⓘ mark's words stay as built | P-Show "The OIL question's words when an input's ⓘ…" | B14 |
| | (b) the list a load opens shows the day's whole open list | P-Ask "The admin answers…" | stated |
| | (c) "Switch to this plan" that brings back an unanswered input gets the load's short note and list | P-Ask ""Switch to this plan"…" | stated |
| | (d) as a small follow-up | — | spent (`[OIL-PLAN-SWITCH-UNASKED]` archived) |
| | (e) with the bar up, "Answer OIL" un-cancels at once where nothing is left to ask | P-Ask "Taking the cancel, or the information-only ⓘ mark…" | stated |
| | (f) the ⓘ words themselves | — | detail (`ui-contracts.md`) |
| D863 | (a) the note after "Load onto working copy" is short plain sentences | P-Ask "A published version loaded back…" | stated |
| | (b) what the day is back to, what viewers still see, what else came back or stayed out, how many inputs need an OIL answer | P-Ask "A published version loaded back…" | stated |
| | (c) it no longer repeats the edits thrown away, which the confirming button has just said | P-Ask "A published version loaded back…" | stated |
| | (d) r1: every other fact of the long note stays | P-Ask "A published version loaded back…" (its four facts) | stated |
| | (e) r2: the note's other versions shortened the same way, one sentence each | P-Ask "… in short plain sentences" | stated |
| | (f) r3: "<day> is already at <version>" keeps its meaning | — | detail |
| D862 | (a) an input of several days whose missing answer is for another of its days is counted in the note | P-Ask "A published version loaded back…" | stated |
| | (b) the OIL list opens for the day that needs the answer, not the day loaded | P-Ask "A published version loaded back…" | stated |
| D818 | (a) after a load the app says how many inputs put back still need an OIL answer | P-Ask "A published version loaded back…" | stated |
| | (b) it opens that day's one list — narrowed by D862: the day that needs the answer | P-Ask "A published version loaded back…" | stated, as narrowed |
| | (c) the load itself is not held | P-Ask "A published version loaded back… is not held" | stated |
| | (d) r1: the load happens at once | P-Ask "… is not held" | stated |
| | (e) r2: the list holds only inputs with no answer | P-Ask "The admin answers…" (the whole open list) | superseded (D865, 15 Oct 26) |
| | (f) r3: the note's words | — | superseded (D863, 15 Oct 26) |
| | (g) r4: what he answers there notifies nobody | P-Ask "A published version loaded back… notifies nobody" | B9 |
| | (h) r4: "Later" leaves the "OIL?" signs and the bell's line as they are | P-Ask "In that list…" | B8 |
| | (i) r5: inputs put back under Unavailable count; a cancelled one does not | P-Ask "Every input kind that can earn…"; P-Not "A cancelled input…" | stated |
| | (j) r6: built with the un-cancel job | — | spent (`[OIL-LOAD-VERSION-UNASKED]` archived) |
| | (k) as built: two readings put to him | — | spent (settled by D862, D863) |
| D816 | (a) taking the cancel off an input with no OIL answer for a non-working day puts the question first, as "Accept" does | P-Ask "Taking the cancel, or the information-only ⓘ mark…" | stated |
| | (b) nothing is un-cancelled until it is answered | P-Ask "Taking the cancel…" | stated |
| | (c) answered, or nothing to ask: un-cancelled at once, the answer counting again | P-Ask "Taking the cancel…" | stated |
| | (d) r1: taking the information-only mark off is treated the same | P-Ask "Taking the cancel, or the information-only ⓘ mark…" | A8 |
| | (e) r2: not answered, it stays cancelled; the bar says so, "Not un-cancelled — OIL not answered", with "Answer OIL" and "OK" | P-Ask "Every door that waits…" | B7 |
| | (f) r3: the answer and the un-cancel are one step and one Undo | P-Ask "Every door that waits…" | B7 |
| | (g) r4: an Undo of a cancel asks nothing | P-Ask "Every door that waits…" | B7 |
| | (h) r5: a small job of its own | — | spent (`[OIL-UNCANCEL-UNASKED]` archived) |
| | (i) r6: the load question not taken as answered | — | spent (answered by D818) |
| | (j) as built: the question's headings and "That input has changed" words; an input with both marks asked when the last comes off | — | detail (`ui-contracts.md`; follows from D814) |
| D814 | (a) a cancelled input is never asked — not at a save, a put-back or a filing | P-Not "A cancelled input is never asked…" | stated |
| | (b) it wears no "OIL?" tag | P-Not "A cancelled input…" | stated |
| | (c) it stands in neither the one list nor the bell | P-Not "A cancelled input…" | stated |
| | (d) because it can earn nothing | P-Not "A cancelled input…" | stated |
| | (e) an information-only input the same | P-Not "A cancelled input…" | stated |
| | (f) r2: an answer already given stays on the record, credited for nothing while the mark stands | P-Ask "Taking the cancel…" ("the answer counts again") | stated |
| | (g) r3: the door that takes the mark off asks nothing | — | superseded (D816, 13 Oct 26) |
| | (h) r4: nothing here changes what a published day is credited | P-Earn "A day's OIL comes from…" | stated |
| | (i) how it was before | — | detail |
| D804 | (a) leave and medical inputs never earn OIL and are never asked | P-Not "Leave and medical inputs…" | stated |
| | (b) every other kind that can earn is asked and its answer decides | P-Ask "Every input kind that can earn…" | stated |
| | (c) wherever it is filed, under Unavailable included | P-Ask "Every input kind that can earn…" | stated |
| | (d) "→ Unavail" puts the question first, as "Accept" does | P-Ask "Every input kind that can earn…" | stated |
| | (e) his D803 sentence withdrawn; the recommendation refused | — | detail (history) |
| | (f) r2: an Other filed under Unavailable keeps its question, earns on its Yes only, keeps its tag, list place and bell | P-Ask "Every input kind that can earn…" | stated |
| | (g) r3: answered, the answer and the filing one step, one Undo; not answered, not filed — "Not filed — OIL not answered" | P-Ask "Every door that waits…" | B7 |
| | (h) r3 confirmed by him the same morning | — | detail |
| | (i) r4: the kinds asked — Training, Course, Meeting, Fly with, Appointment, Duty, Event, Overseas duty, Other | P-Ask "Every input kind that can earn — Training…" | A6 |
| | (j) r4: a Personal input, SANS availability and an upchit never asked | P-Not "Leave and medical inputs… nor are a Personal input…" | A6 |
| | (k) r4: an overseas duty stays as it is | P-Ask "Every input kind…" (in the list) | stated |
| D793 | (a) an input put back after its day became a holiday waits on its OIL question as a swap does | P-Ask "Every input kind… a put-back after the day became a holiday" | stated |
| | (b) the question first; put back only on an answer | P-Ask "Every input kind…" | stated |
| | (c) r1: the door is the scheduler's "Accept" | P-Ask "Every input kind… "Accept"" | stated |
| | (d) r2: not answered, not put back — the same bar | P-Ask "Every door that waits…" | B7 |
| | (e) r3: an Undo of the take-off asks nothing; the "OIL?" tag, the list and the bell go on saying it needs an answer | P-Ask "Every door that waits…" | B7 |
| | (f) r4: built with the next batch, a failing test first | — | spent (built 13 Oct 26; `[OIL-ACCEPT-BACK-UNASKED]` archived) |
| D783 | (a) a swap or an add that raises a question is not made until it is answered — nothing moves | P-Ask "Every input kind…" | stated |
| | (b) not answered: both pucks flash and a bar stays until tapped, "Not swapped — OIL not answered", Answer OIL, OK | P-Ask "Not answered: …" | stated |
| | (c) the one list opens by itself when a holiday is saved | P-Ask "A day made a holiday afterwards…" | stated |
| | (d) the schedulers' bell carries one line a holiday, counting what is left | P-Ask "A day made a holiday afterwards…" | stated |
| | (e) D831: the bar sits in the band under the top bar, a picture first | P-Ask "Not answered: … in the band under the top bar" | stated, as narrowed (picture spent) |
| | (f) his answer 1: the question's buttons "Don't swap" and "Swap", Swap greyed until Yes or No | — | detail (the pictures are the design of record) |
| | (g) his answer 3: an add the same — "Not added — OIL not answered" | P-Ask "Every input kind…"; "Every door that waits…" | stated; the words B7 |
| | (h) his answer 4: nobody else is told when a swap or an add is not made | P-Ask "Every door that waits…" | A7 |
| | (i) his answer 5: "<its name> is now a public holiday." above the list | — | detail |
| | (j) his answer 6: a tap on the bell's line opens the list | P-Ask "In that list…" | B8 |
| | (k) the list as drawn: one line an input, "Yes · FO" / "Yes · HO" and "No", "Later" and "Save" | P-Ask "In that list…" (FO / HO, "Later") | B8; the rest detail |
| | (l) r: the same list opens from the Leave War's Event row that makes the holiday | P-Ask "In that list…" | B8 |
| | (m) r: "Later" with nothing answered sends every input to the bells | P-Ask "In that list…" | B8 |
| | (n) r: the bar's "OK" only closes it | — | detail |
| | (o) r: a move from one input's row to another's that raises the question waits the same way | P-Ask "Every input kind… a move from one input's row to another's" | A7 |
| D782 | (a) the admin answers a day's open questions from one list | P-Ask "The admin answers…" | stated |
| | (b) every input of that day needing an answer, its yes and no, "Yes to all", "No to all" | P-Ask "The admin answers…" | stated |
| | (c) r: it is what the holiday and the scheduler's bell line open | P-Ask "A day made a holiday…"; "In that list…" | B8 |
| | (d) r: an input of several is one line with its one answer | P-Ask "In that list…" | B8 |
| | (e) r: a full day and a half day offered as the single question offers them | P-Ask "In that list…" | B8 |
| | (f) r: each answer is the input's own, stamped with who gave it | P-Ask "In that list…" | B8 |
| | (g) drawn before it is built | — | spent (built; `[OIL-ASK-NOTIFY]` archived) |
| D781 | (a) a day made a holiday afterwards: the admin declaring it is told at once | P-Ask "A day made a holiday afterwards…" | stated |
| | (b) what he answers there notifies nobody | P-Ask "A day made a holiday…" | stated |
| | (c) only what is left unanswered goes to the schedulers and to whoever answers for each input | P-Ask "A day made a holiday…" | stated |
| | (d) a swap's or an add's question cannot be left open — narrowed by D783: never made, said plainly | P-Ask "Every input kind…"; "Not answered: …" | stated, as narrowed |
| | (e) a picture first | — | spent |
| | (f) it changes D755 (1)'s reading R18 | — | detail |
| | (g) r: the admin is offered the answer as he declares the holiday | P-Ask "A day made a holiday… told at once" | stated |
| | (h) r: the note goes to the one who made the swap; nobody else is told | P-Ask "Every door that waits…" | A7 |
| | (i) r: one bell line a holiday, not one an input | P-Ask "A day made a holiday…" | stated |
| D606 | (a) an SC shift's typed B, where filled, counts as work | P-Len "An SC shift's typed B…" | stated |
| | (b) its OIL runs from that in-time to the shift's end | P-Len "An SC shift's typed B…" | stated |
| | (c) its work hours count from it too | P-Len "An SC shift's typed B…" | stated |
| | (d) a blank B leaves the written start to end | P-Len "An SC shift's typed B…" | stated |
| | (e) it overrules D592's reading 10 | — | detail (D592's row carries the mark) |
| | (f) r1: the earlier of the B and the written start — a B typed later shortens nothing | P-Len "An SC shift's typed B…" | A4 |
| | (g) r2: an evening-before B lengthens the shift's own day only | P-Len "An SC shift's typed B…" | A4 |
| | (h) r3: the MAIN's in-time only — a SPARE's B does nothing; a SPARE switched on earns the shift's written hours | P-Len "A SPARE that only stands by…" | A4 |
| | (i) r3: an SC SPARE earns nothing by default | P-Len "A SPARE that only stands by… a shift with its B or R typed flies whole" | A4; superseded where its shift flies (D1042, D1044, 19 Oct 26) |
| | (j) r4: AVALON and BB untouched, their B never an in-time | P-Earn "A standby line that actually flies…" | superseded (D1043, D1044, 19 Oct 26) |
| | (k) r5: work hours have counted an SC MAIN's B since 24 Aug 26 | — | detail |
| | (l) r6: a B typed on a published day is pending until published again | P-Earn "A day's OIL… a later time or Logic change reads as pending" | stated |
| D592 | (a) (1) the earliest in-time or rally that applies to the formation | P-Len "A flying line's OIL…" | stated |
| | (b) (2) no in-time or rally typed: the nominal report time | P-Len "A flying line's OIL…" | stated |
| | (c) (3) an evening-before report lengthens the line's own day, nothing to the day before | P-Len "A flying line's OIL…" | stated |
| | (d) (4) a published day keeps its OIL until published again; a later time or Logic change reads pending | P-Earn "A day's OIL comes from…" | stated |
| | (e) (5) first event to last end, breaks included | P-Len "A flying line's OIL…" | stated |
| | (f) r6: a time entered later than the nominal one shortens the day | P-Len "A flying line's OIL… earliest applicable entered" | stated |
| | (g) r7: a clock the app cannot read counts as nothing typed | — | detail (`engine-rules.md`) |
| | (h) r8: pending where his amount or the worked times would be written differently | P-Len "As built, and put to him as readings…" | B6 |
| | (i) r9: the four sign-offs fall on a Logic change that would alter the day's OIL, standing again when put back | P-Len "As built, and put to him as readings…" | B6 |
| | (j) r10: an SC B moves nothing | — | superseded (D606, 7 Oct 26) |
| | (k) built 6 Oct 26 | — | spent |
| D591 | (a) a flying line's OIL from its actual in-time / rally, not the nominal report time | P-Len "A flying line's OIL…" | stated |
| | (b) confirmed with its four readings by D592 | P-Len "A flying line's OIL…" [D591, D592] | stated |
| | (c) it narrows D498 | — | detail |
| | (d) its own job, a full check | — | spent (built 6 Oct 26) |
| D470 | (a) as amended by D755: a man in the name box of another man's request row replaces him, or joins beside him, and follows the input's answer | P-Earn "A man the scheduler puts in the name box…" | stated |
| | (b) either can be tapped off in OIL Earn | P-Earn "A man the scheduler puts in the name box…" | stated |
| | (c) the member who filed it still earns on his own answer | — | superseded (D755, D762, 11 Oct 26 — one answer an input) |
| | (d) the request stays the member's | — | superseded (D755 (2): a swap makes the input the new man's) |
| | (e) a request that never asks (Personal) earns nobody anything, whoever is on its row | P-Earn "A man the scheduler puts in the name box…" | stated |
| | (f) a placeholder in the name box counted the men behind it (D46) | P-Earn "The placeholder pucks… On a row that came from an input…" | stated (as D755; D46 archived) |
| | (g) built in phase 7 | — | spent |
| D402 | (a) every hand award shows on the Leave War grid on its date, wherever it was given | P-Award "Every OIL award given by hand…" | stated |
| | (b) as an FO or HO box | P-Award "Every OIL award given by hand…" | stated |
| | (c) a tap says who gave it and why | P-Award "Every OIL award given by hand…" | stated |
| | (d) a credit dated in no war shows on no cell | P-Award "Every OIL award given by hand…" | A9 |
| | (e) a correction (a negative entry) is never drawn | P-Award "Every OIL award given by hand…" | A9 |
| | (f) built by `[OIL-AWARD-IS-A-GRANT]` | — | spent |
| D401 | (a) the award fix converts no stored award | P-Set "Stored awards in the old shape…" | stated |
| | (b) what is saved is demo data, wiped before the database | P-Set "Stored awards in the old shape…" | stated |
| | (c) only the demo seed is rewritten in the one kind of award | P-Set "Stored awards in the old shape…" | stated |
| | (d) a record in the old shape must not break a load | P-Set "Stored awards in the old shape…" | stated |
| | (e) how it is read is the build's technical call | — | detail |
| D400 | (a) "earned" counts only what the app credited — the published schedule or an accepted duty input | P-Award ""Earned" counts only…" | stated |
| | (b) every hand award, typed on the war grid or credited from the Tracker, shown apart as "awarded" | P-Award ""Earned" counts only…" | stated |
| | (c) in the tracker's summary and the OIL figure's breakdown | — | detail |
| | (d) the balance does not change, only how its parts are named | P-Award ""Earned" counts only…" | B12 |
| D261 | (a) a member opens his own OIL award, read only, at every stage | P-Award "Every OIL award given by hand… A member opens…" | stated |
| | (b) one tap on his FO / HO shows its reason, who gave it and how many days, bidding open or not | P-Award "… at every stage" | stated |
| | (c) nothing new is shown | — | detail |
| | (d) r: his own award only, no Edit or Clear; another man's as today | P-Award "A member opens his own OIL award, read only…" | stated |
| D260 | (a) a dragged block's delete removes everything in it, awards included | P-Award "A dragged block's delete…" | stated |
| | (b) its confirm names each award first | P-Award "A dragged block's delete…" | stated |
| | (c) one Undo brings them back | P-Award "A dragged block's delete…" | B13 |
| | (d) r1: the bid sheet's Clear follows the same rule, naming an award and asking once | P-Award "A dragged block's delete…" | A10 |
| | (e) r2: Move and drag leave awards where they are | P-Award "A dragged block's delete…"; P-From "The Leave War's: a bid that shares its day…" | stated |
| D163 | (a) leave both — demo data only, wiped before the database | P-Set "The award dates and post-out losses…" | stated |
| | (b) `[DEMO-AWARD-DATES-ASK]` and `[POSTOUT-LOST]` closed | P-Set "… the two items that raised them are closed" | stated (spent) |
| D142 | (a) a day's OIL from its latest published version — the latest amendment, or the EOD if that is the latest | P-Earn "A day's OIL comes from…" | stated |
| | (b) however long ago the day was | P-Earn "A day's OIL comes from…" | stated |
| | (c) no lock, no clock | P-Earn "A day's OIL comes from…" | stated |
| | (d) the published record is what happened — no "was the day worked?" test | P-Earn "The published record is what happened…" | A1 |
| | (e) an amendment or EOD that takes a man off a past day takes its OIL; to keep it, do not take him off | P-Earn "The published record is what happened…" | A1 |
| | (f) a published EOD is the final word on the day | P-Earn "The published record is what happened…" | A1 |
| | (g) supersedes the 11 Sep 26 lean; D2 is its freeze half | — | detail |
| D82 | (a) an OIL award and a worked day add up | P-Earn "An OIL award and a worked day add up…" | stated |
| | (b) a 3-day award and a worked Saturday make 4 | — | detail |
| | (c) the schedule's credit and a typed award never change each other | P-Earn "… add up" | stated |
| | (d) built | — | spent |
| D81 | (a) a worked weekend that earns nobody any OIL says so | P-Not "A worked weekend…" | stated |
| | (b) on the day and at publish, with the reason | P-Not "A worked weekend…" | B2 |
| D80 | (a) an OIL award does not flag a leave day | P-Award "An OIL award does not flag a leave day…" | stated |
| | (b) it says a man is owed a day, not where he was | P-Award "An OIL award does not flag a leave day…" | stated |
| | (c) whether an award counts him on duty for manning is not ruled — ask before changing | P-Award "An OIL award does not flag a leave day…" | A11 |
| D79 | (a) OIL may be credited by hand on any day | P-Earn "… OIL may be credited by hand on any day" | stated |
| | (b) the weekend and holiday limit belongs to the automatic pass | P-Earn "… OIL may be credited by hand…" | B1 |
| D52 | (a) a ground crewman named on a weekend duty earns | P-Earn "Three behaviours are correct…" | stated |
| | (b) a placeholder on it earns for the men it stands for unless switched off | P-Earn "Three behaviours…" | stated |
| | (c) ALL / ALL AVAIL do not include ground crew | P-Earn "Three behaviours…" | stated |
| | (d) correct as built, not in conflict, nothing to build | P-Earn "Three behaviours are correct as built…" | stated |
| | (e) why: naming a man is deliberate, the placeholder a sweep of the available aircrew | — | detail |
| | (f) option 1 dropped: a crowd holds only aircrew | P-Earn "… never include ground crew" | stated |
| D49 | (a) a flying line whose written take-off and landing are the same still earns | P-Len "A flying line whose written take-off…" | stated |
| | (b) the day says the times look wrong — a warning, not a refusal | P-Len "A flying line whose written take-off…" | A5 |
| | (c) it overrules the plan's step 8 and both reviewers | — | detail |
| | (d) it makes D48 moot for this case | — | detail |
| | (e) a disagreement between two bodies of code is a question, not a verdict | — | detail (a lesson) |
| | (f) against D31's "zero length": the flying line is not a seat with nothing to measure | P-Earn "A seat has nothing to measure…" | A3 (clash named) |
| D48 | (a) an issued day keeps the OIL it went out with when a rule changes under it | P-Earn "A day's OIL comes from… An issued day keeps…" | stated |
| | (b) held to the rule it was published under; the credit stays until corrected and republished, the correction an ordinary amendment | P-Earn "An issued day is held to the rule…" | A2 |
| | (c) D45 applied to a rule change | — | detail (D45 pointed to in P-From) |
| | (d) moot the same hour by D49; stands for the next rule change; nothing built for it then | — | detail (D592 (4) since built it for a Logic change) |
| | (e) clearing demo data (the dev-phase rule, D22) does not cover OIL on a published record silently changing amount | P-Earn "An issued day is held to the rule…" | A2 |
| | (f) the "no rule versioning" invariant untouched — one marker on a day as published | — | detail |
| D43 | (a) the placeholder pucks behave like named people: on by default wherever they can land | P-Earn "The placeholder pucks (ALL / ALL AVAIL)…" | stated |
| | (b) D755: on a row that came from an input a placeholder follows the input's answer; on the scheduler's own rows on by default | P-Earn "One principle…"; "The placeholder pucks… On a row that came from an input…" | stated, as amended |
| | (c) duty desks, sims, sim passengers, the extra-people line, ground and Common Programme rows all on | P-Earn "On by default…" | stated |
| | (d) switch one off deliberately | P-Earn "One principle… the admin can always override in OIL Earn" | stated |
| | (e) supersedes D27's default-off reading and the plan's | — | detail |
| | (f) D24 stands: the exempt kinds off by default with the switch | P-Earn "Off by default…" | stated |
| | (g) the flying line does not arise: D33 refuses the puck there | P-From "The scheduler's, the placeholders…" [D33] | stated |
| | (h) the engine's belt for data copied before the refusal | — | detail |
| | (i) nothing switched off, no data reset needed | — | detail (the row is cut off mid-sentence here — above) |
| D42 | (a) an overnight line earns on the day it sits on | P-Len "… An overnight line earns on the day it sits on" | stated |
| | (b) the hours past midnight earn the next day nothing | P-Len "… An overnight line…" | stated |
| | (c) the example; recorded in his framing | — | detail |
| D35 | (a) re-confirms D24 | P-Earn "Off by default…" | stated |
| | (b) the switch reaches a duty block minted from an AVALON template — the same seat, one answer | P-Earn "Off by default…" | stated |
| D32 | (a) wherever a placeholder may land it offers the OIL switch — one list, not two | P-Earn "The placeholder pucks (ALL / ALL AVAIL)…" | stated |
| | (b) landing and earning are one decision | P-Earn "The placeholder pucks…" | stated |
| | (c) a later request to allow the puck somewhere new carries the switch | P-Earn "The placeholder pucks… wherever one is allowed to land" | stated |
| | (d) ALL and ALL AVAIL alike | P-Earn "The placeholder pucks (ALL / ALL AVAIL)…" | stated |
| | (e) default off — amended by D43: on | P-Earn "The placeholder pucks… on by default" | stated, as amended |
| D31 | (a) a seat with nothing to measure offers no OIL switch | P-Earn "One principle…"; "A seat has nothing to measure…" | stated |
| | (b) it says why instead — never a silent absence | P-Earn "A seat has nothing to measure…" | stated |
| | (c) what counts: no times, zero length, cancelled, ⓘ | P-Earn "A seat has nothing to measure…" | A3 |
| | (d) the one boundary on D28 | P-Earn "One principle… the one boundary" | stated |
| | (e) every seat that can be measured still offers the switch | P-Earn "One principle… every seat can earn" | stated |
| | (f) the two rejected alternatives | — | detail |
| D28 | (a) one principle instead of an allow-list | P-Earn "One principle…" | stated |
| | (b) every seat can earn; its default decides | P-Earn "One principle…" | stated |
| | (c) the admin can always override | P-Earn "One principle…" | stated |
| | (d) the placeholders on the same footing — D43: on by default | P-Earn "One principle…" | stated, as amended |
| | (e) nothing earns by default that did not before | — | superseded for the placeholders (D43, 22 Sep 26) |
| | (f) merges D24 and `[OIL-SEATS-CAN-EARN]` into one change | — | spent (built; item archived) |
| | (g) the open question — answered by D31 | P-Earn "One principle… the one boundary" | stated, as narrowed |
| D26 | (a) leave the OIL mode's phone tap targets | P-Set "The OIL mode's phone tap targets…"; P-Show "… the tap targets stay as they are" | stated |
| | (b) settled — not re-opened, not re-filed as a defect | P-Set "The OIL mode's phone tap targets…" | stated |
| | (c) he settles OIL on his phone easily | P-Set "The OIL mode's phone tap targets…" | stated |
| | (d) nothing to build | P-Set "The OIL mode's phone tap targets…" | stated |
| | (e) the measurement (71 tappable things, median 15px) | — | detail |
| | (f) `[OIL-PHONE-TARGETS]` closed as ruled | — | spent |
| | (g) a real user's complaint of mis-taps is new evidence and a new question | P-Set "The OIL mode's phone tap targets…" | B15 |
| D25 | (a) OIL is earned leave, not pay — say it that way | P-What "OIL is earned leave…" | stated |
| | (b) a credit is a day or a half day banked, landing on the Leave War as FO or HO | P-What "… time off banked"; P-Award "… as an FO or HO box" | stated |
| | (c) the screens already right, the reports wrong | P-What "… in every report and on every screen" | stated |
| | (d) the bug-check order's money question still fires on OIL | P-What "OIL is owed all the same…" | A13 |
| | (e) the comment sweep filed as `[OIL-WORDS]` | — | spent (item archived) |
| D24 | (a) SC SPARE, AVALON flying lines and duty desks, BB flying lines offer the switch, off by default | P-Earn "Off by default but offering the OIL switch…" | stated |
| | (b) an activated one can be credited, on a published day through an ordinary amendment | P-Earn "Off by default…" | stated |
| | (c) supersedes D15 and D20 in part — the door only | P-Earn "On by default…" [D15, D24] | stated |
| | (d) the engine must let them in, defaulting off | — | detail |
| | (e) sequencing: its own branch, a full check | — | spent (built) |
| | (f) D1042: a standby line that actually flies earns by default | P-Earn "A standby line that actually flies…"; "Off by default… (below)" | stated; the placing of the clause B5 |
| D21 | (a) an "Off day" does not earn OIL | P-Not "An "Off day"…" | stated |
| | (b) settled, do not reopen | P-Not "An "Off day"…" | stated |
| | (c) why: time given to him, not a holiday he was called in on; only a PH turns a day into one that can earn | P-Not "An "Off day"…" | B3 |
| | (d) the contract's wording corrected, no code | — | spent |
| | (e) the Leave War's off-day type stays inert for OIL; leave charging untouched | P-Not "An "Off day" does not earn OIL" | stated |
| | (f) re-confirmed the same night | — | detail |
| D19 | (a) a weekend or holiday no Leave War period covers names the reason and offers the way out, not a bare refusal | P-Ask "A weekend or holiday that no Leave War period covers…" | stated |
| | (b) the day says that year's period does not exist and offers to create it | P-Ask "A weekend or holiday…" | A12 |
| | (c) never made silently: the offer hands the scheduler to the Leave War to set the window | P-Ask "A weekend or holiday…" | A12 |
| | (d) what the day wrongly promised before | — | detail |
| | (e) it widens fix 6 to the Leave War, his call | — | detail |
| D15 | (a) earn: flying lines, SC MAIN, Common Programme, Standard and SC-shift duty desks, ground rows | P-Earn "On by default…" | stated |
| | (b) not by default: SC SPARE, AVALON / BB lines | P-Earn "Off by default…" | stated |
| | (c) not by default: AVALON / BB desks | P-Earn "Off by default…" (AVALON); "On by default… a BB duty desk" | B4 |
| | (d) not by default: ⓘ rows | P-Earn "On by default… An ⓘ row" | stated |
| | (e) superseded in part by D24: the switch offered | P-Earn "Off by default…" | stated |
| | (f) pinned by tests | — | detail |
| D2 | (a) only the issued schedule earns OIL, both directions | P-Earn "Only the issued (published) schedule…" | stated |
| | (b) a holiday declared after publication waits for a republication, and the day says so | P-Earn "Only the issued…" | stated |
| | (c) revoking one no longer removes OIL silently | P-Earn "Only the issued…" | stated |
| D1 | (a) the green OIL bar shows only on the events that counted towards a man's day | P-Show "The green OIL bar…" | stated |
| | (b) not on every puck he wears | P-Show "The green OIL bar…" | stated |
| | (c) supersedes §2.10 / OIL21 | — | detail |
| | (d) the ALL AVAIL count chip agrees | P-Show "The green OIL bar…" | stated |

## The "Also read" and "Also know" paragraphs, item by item

| Old item | Where on the page | Mark |
|---|---|---|
| D762: one OIL answer for everyone in an input, given by the filer or an admin; no man his own; the filer picks nobody out; only the scheduler leaves one out, in OIL Earn | P-From "The scheduler's, an input with several people…" | stated |
| D762's "to be built with `[ALL-AVAIL-AS-MEMBER]` … built with the one-rule job, pull request 491" | — | spent (live on his "merge live" of 12 Oct 26, D779) |
| D738, D744 (archived 17 Oct 26, restated by D762, D755): a man the scheduler adds takes the input's answer with no question while everyone carries the same answer; where they differ he is asked at once; OIL Earn still switches him | P-From first bullet: "a person added follows that answer, the scheduler asked on the spot only where there is none yet"; "only the scheduler leaves one person out, in OIL Earn" | A14; "where they differ" superseded (D762: one answer, nothing differs) |
| D660: whoever files for other people answers for all at the save | P-From first bullet "Whoever files an input for other people…" | stated |
| D660: "each man may still change his own" | — | superseded (D762, built 12 Oct 26) — rightly dropped |
| D682: the filer's answer again is written for everyone; a man's own earlier No replaced; the latest counts; the scheduler's refusal still wins | P-From "The scheduler's: when the filer answers…" | stated (the "own No" clause moot since D762 — above) |
| D753 (D750): the men behind an ALL AVAIL that is one of a shared input's people follow its answer; the scheduler may switch any one man | P-From "The scheduler's: where ALL AVAIL / ALL is one of a shared input's own people…" | stated |
| D731: the OIL line counts differing answers — "credited for 2 of 3 — Ranger: no" | P-From "a shared input's OIL line states its one answer" | A15 (the old paragraph was out of date too) |
| D731: an answer for a day the input no longer covers stays on the record, credited for nothing | P-From "… stays on the record, credited for nothing" | stated |
| D360: an ALL AVAIL on a row with a start and no end counts over the one-hour default, earns nobody OIL, tells the admin | P-Not "An ALL AVAIL / ALL row with a start and no end…" | stated |
| D265 (D260): a bid sharing its day with an award moves alone; the award stays | P-From "The Leave War's: a bid that shares its day…" | stated |
| D272: in OIL Earn his own puck shows the green ring, not the purple | P-From "The scheduler's, OIL Earn on the board…" | stated |
| D27, D33, D47: where the placeholders may land and are refused | P-From "The scheduler's, the placeholders…" | stated |
| D36–D41, D51: who counts as available, the window that lists them | P-From "The scheduler's, the placeholders…" | stated |
| D44, D45: the crowd frozen at publication; the pending mark | P-From "The scheduler's, the placeholders…" | stated |
| D54: an issued weekend carrying a placeholder raises the mark — leave it | P-From "How we work: an issued weekend…" | stated |
| D56 | P-From "How we work: … a problem living only in data already stored is not a finding" | stated |
| D327: an archived man stays in the ALL AVAIL crowd on every day before his archive | P-From "People and accounts: an archived man…" | stated |
| New pointers on the page (not in the old paragraph): D755, D1042–D1044, D65, D1782, D1793, D1578 — each checked against its own short line and full row | P-Earn, P-From, P-Ask | stated; D1578's dropped "never offers to create a period" B11 |
| Also know: `[OIL-AUTO-REMOVE]`, the OIL Earn mode, merged 22 Sep 26 on D34 (spent, archived) | P-Set "The OIL Earn mode went live (22 Sep 26, on a one-off permission since spent and archived)…" | stated (D34's number dropped; the archive keeps it — detail) |
| Also know: his five-minute look waived | P-Set "The OIL Earn mode went live…" | stated |
| Also know: its evidence the walk (its sheet), the defects fixed red-first, not re-done | P-Set "The OIL Earn mode went live…" | stated |
| Also know: and the gates — never an owner sighting; never assume he saw the walked Saturday | P-Set "The OIL Earn mode went live…" | stated |
| Also know: the design of record, the rulings not to relitigate (§8, §9) | P-Set "The OIL Earn mode's design of record…" | stated |
| Also know: the item in `OUTSTANDING-ARCHIVE.md` (moved 27 Sep 26, `[BACKLOG-TIDY]`) | P-Set "The OIL Earn mode's design of record… the finished item…" | stated (the move's date dropped — detail) |

## Text with no number — the old file's head

| Old text | → now |
|---|---|
| Title "Rulings — OIL (off in lieu: earned leave)" | the page's title "OIL (off in lieu) — how it works now"; "earned leave" in P-What |
| "Loads by itself whenever a session reads an OIL, Leave War, placeholder-puck or publishing file (the `paths:`…)" | P-head first paragraph, the `paths:` unchanged |
| The general rulings in `how-we-work.md`; the map and how to add or retire a ruling: `DECISIONS.md` | P-head second paragraph |
| "One line per ruling — its number, its date, the rule as it stands (D390)" | no longer true: one statement per rule, its rulings cited (P-head first paragraph, D1735); the dates live in the full rows |
| The full row, never loaded, opened before acting or asking; the shell `grep` | P-head first paragraph |
| "A '— changed by' tail names the later rulings that changed it. Newest first." | no longer needed: a ruling that changes another is cited beside it (the gate's change-mark check); the page is ordered by topic |
| The table header | gone with the table |

## Count

- **Rulings accounted: 49** — all live; none proposed for the archive (each holds at least one part still stated).
- **Parts accounted: 294** across the 49 rulings (counted from the table): 169 stated on a line, 52 that were in a
  gap (25 under an A, 27 under a B), 21 spent, 43 detail, 8 superseded by a later ruling (each named with its date) and
  1 not settled (D1783's build) — plus 26 items of the "Also read" and "Also know" paragraphs and 7 pieces of the old head.
- **Gaps: 30** — 15 that drop or change a rule part (A1–A15), 15 smaller drops (B1–B15); all fixed on the page.
- **After the fixes:** `backlog-archive.mjs --rulings` says "done; the inventory is clean"; `npm run docsize` fails on
  one thing only — the page is 18,643 bytes against its 15,500 tripwire (3,143 over). No part was cut to fit.
