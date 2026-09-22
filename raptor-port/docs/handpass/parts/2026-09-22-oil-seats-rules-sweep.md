# [OIL-SEATS-CAN-EARN] — the RULES SWEEP

The behaviour register walked ruling by ruling **in the running production
bundle** at `http://localhost:4173`, byte-identical to branch HEAD, on the
everything-Saturday (day 5, Sat 18 Jul) with a Wednesday (day 2) and a Sunday
(day 6) beside it. Standing order's step 5; `docs/bug-check-order.md` §7.3.

Every mark below comes from something the app DID on screen. A ruling about
something SHOWN or TAPPED carries one mark per SURFACE; a ruling about MONEY
carries one mark per ORDER. Nothing is ticked once and called done.

**Scripts:** `raptor-port/scripts/handpass/seat-rule-*.mjs` (14 of them).
**Pictures:** `docs/img/handpass/2026-09-22-oil-seats/RULE-*.png` — 70.
**Browser error list:** empty on every run. No console error, no page error, no
4xx, on any surface walked.

---

## Tally

| | |
|---|---|
| Rulings on the register | 24 |
| PASS, in full | 15 |
| PASS on the substance, FAIL on what the screen SAYS | 2 (D24, D49) |
| Walked in part — the rest could not be produced through the app's own controls | 5 (D44 4th clause, D44-the-mark, D45 1st half, D46 name box, "no amendment nobody made") |
| Nothing to walk, by ruling | 1 (D48) |
| Built but unreachable on screen, by design | 1 (D31 in plain words) |

**Three FAILs, all of them about what the screen SAYS rather than what the money
does.** No wrong payment was found anywhere in this sweep.

---

## The sweep, ruling by ruling

### D24 — an SC SPARE, an AVALON line, an AVALON duty desk and a BB line all OFFER the earn switch, and all start OFF; the admin can switch any of them on

| What was walked | Surface | Mark | What the screen did |
|---|---|---|---|
| Offers the switch | SC SPARE (jet 4 of the 06:00 formation) | **PASS** | A switch with its own id is drawn on the SC row; the SPARE crew appear as their own pucks under it |
| Offers the switch | AVALON flying line (AV 09:00–12:00) | **PASS** | Switch drawn, tappable |
| Offers the switch | AVALON duty desk (block "AVALON", SXO row) | **PASS** | Switch drawn, tappable |
| Offers the switch | BB line — **built for this walk** through `+ Wave → BB`, given 08:00–16:00 and crewed by hand | **PASS** | Switch drawn, tappable. `RULE-01c-bb-with-times.png` |
| Starts OFF | SC SPARE | **PASS** | Cobra, Ledger, Ace all drawn grey with a dash — off — beside Piston and Basher on |
| Starts OFF | AVALON line | **PASS** | Hunter, Quill both off |
| Starts OFF | AVALON duty desk | **PASS** | Saint off; a placeholder dropped on the desk's OPS O row came up as 45 men, **all 45 off** |
| Starts OFF | BB line | **PASS** | Ace, Anvil both off |
| Admin can switch it on | AVALON line | **PASS** | Tapped it: *"AV earns OIL again"*, Hunter and Quill both went on, the sentence changed to *"Set to earn — tap to stop this item earning"*. `RULE-02-avalon-switched-on.png` |
| Admin can switch it on | AVALON duty desk | **PASS** | Tapped it: *"SXO earns OIL again"*, Saint went on |
| Admin can switch it on | BB line, SC SPARE | **NOT TAPPED** — the SC row's own switch flips the whole row at once, and the BB switch was read but not pressed. Both were proven to be live switches with an id; only the press is missing |
| **What the switch SAYS vs how it is PAINTED** | AVALON line · AVALON desk SXO · AVALON desk OPS O · AVALON desk minted from a template · BB line · an SC row whose only crew is a SPARE | **FAIL — 6 surfaces** | See below |

**FAIL 1 — the switch on an exempt row is painted as if it earns.**
On every one of those six rows the switch carries the earning style — green fill
`rgba(47,166,92,.18)`, green border, the `on` class — while its own words say
*"This kind of event earns nothing — tap to make it earn"*. In the picture
(`RULE-01c-bb-with-times.png`) the AV and BB row headers are the same green as
the SDO row below them, which genuinely pays; the only thing that tells them
apart is the tooltip, which the scheduler has to hover to read. The men
underneath are correctly grey. **The paint follows the men, the words follow the
row's kind, and on an exempt row the two disagree.** No money moves — nobody is
paid who should not be — but a scheduler reading the row at a glance is told the
opposite of the truth. (This is the parent's known finding 2; it is reported here
because it is on **six** surfaces, not one, including two the parent had not
named: an AVALON duty desk, and a desk minted from an AVALON template.)

**FAIL 2 — the same fault's other face: an EMPTY row on an exempt desk claims it earns.**
On the AVALON duty desk, the two rows with nobody on them (RUNNER, LOG CELL —
and OPS O before it was crewed) read *"Earns OIL — tap to stop this item
earning"*, the exact opposite of the SXO row beside them on the same exempt
block. Watched directly: OPS O said "Earns OIL" while empty, and changed to
"earns nothing" the moment a body was put on it. Same root cause.

---

### D35 — a duty block minted from an AVALON template is the same seat, so it gets the same answer

| Surface | Mark | Evidence |
|---|---|---|
| A block added through `+ Block → "AVALON desk"` | **PASS on the substance** | The minted block behaved exactly like the hand-built AVALON desk: switch offered on every row, and a placeholder dropped on it opened into 45 men, **all off**. Same answer, same seat. `RULE-01-day-with-bb-and-avalon-desk.png` |
| The same block's paint | **FAIL** | Carries FAIL 1 above — green switch, "earns nothing" words |

---

### D28 — nothing that earns today stops earning

Money ruling, so **one mark per order**. Each figure read off the count chip's
own tap, which is the app telling you what it will pay each man.

| Order | Mark | What it paid |
|---|---|---|
| Ordinary flying line (VIPER) | **PASS** | Crew on, switch "Earns OIL" |
| Common Programme name box (FAMILY DAY, ALL AVAIL) | **PASS** | 27 men, every one a full day |
| Common Programme extras (MASS BRIEF) | **PASS** | 39 men, every one earning |
| Duty desk extras (SDO) | **PASS** | 26 men, every one a full day |
| Sim passenger line (AMT BOX) | **PASS** | 30 men, every one a full day |
| Sim seat extras (OFT EP-6) | **PASS** | 39 men, every one earning |
| Ground row extras (OCU REVIEW) | **PASS** | 30 men, every one a full day |

`RULE-08-money-per-kind.png`.

---

### D33 — ALL and ALL AVAIL are refused on a flying line's cockpit seats, and nowhere else; the reason shows at every door

**Both placeholders walked at every door**, as the brief requires.

| Door | Placeholder | Mark | What the app said |
|---|---|---|---|
| Board, desktop — SC MAIN cockpit | ALL AVAIL | **PASS** | *"ALL AVAIL — cannot crew a jet; name the people flying it"*; seat stayed empty |
| Board, desktop — SC SPARE cockpit | ALL AVAIL | **PASS** | Same sentence, seat stayed empty |
| Board, **phone width (390px)** — cockpit | ALL AVAIL | **PASS** | Same sentence, seat stayed empty |
| **Edit week** — cockpit | ALL AVAIL | **PASS** | Same sentence, seat stayed empty |
| Board, desktop — cockpit P and W | ALL | **PASS** | *"ALL — cannot crew a jet; name the people flying it"* |
| Board — duty desk | ALL AVAIL / ALL | **PASS** | Took it: *"ALL AVAIL planned"* / *"ALL planned"* |
| Board — ground row extras | ALL | **PASS** | Took it |
| Edit week — duty desk | ALL AVAIL | **PASS** | Took it |
| Board, phone — duty desk | ALL AVAIL | **NOT PROVEN** — my press landed on an existing puck rather than the zone, so the seat never armed. Not a refusal; a driving miss. The same seat took the placeholder on the desktop board and on the week |

`RULE-09-board-doors.png`, `RULE-09-phone-board.png`, `RULE-09-week-doors.png`,
`RULE-13-all-placeholder.png`.

---

### D47 — that refusal stands rather than becoming a warning; the 13 Aug shortcut still works everywhere a placeholder is legal

| Surface | Mark | Evidence |
|---|---|---|
| Cockpit, all three surfaces | **PASS** | It is a hard refusal, not a warning: the seat is still empty afterwards on every one |
| Duty desk, ground row, sim seat, sim passenger line, Common Programme, all their extras | **PASS** | The arm-and-drop shortcut works: every one armed and took the puck |

---

### D46 — a placeholder is allowed on an accepted request row and credits by default there, in the name box and the extras alike; taking the puck off takes the crediting with it

| Surface | Mark | Evidence |
|---|---|---|
| The extras of an accepted request row (TRAINING, Talisman's) | **PASS** | Took it — *"ALL AVAIL planned"*; chip came up reading 30 earning, crowd of 32 including the man who filed it. `RULE-10-request-extras.png` |
| Taking it off again | **PASS** | Right-clicked the puck off: the puck went and **the chip went with it**; the row holds only its filer again. `RULE-10-after-removal.png` |
| The NAME BOX of a request row | **NOT WALKED** — on the everything-Saturday every request row's name box already holds the man who filed it, and a box that holds a man does not arm. To walk it, empty a request row's name box first, or seed a request row whose name box is free |

---

### D18, extended — the man who filed a request still answers for himself; the crowd beside him never buries it or pays him twice

| Surface | Mark | Evidence |
|---|---|---|
| Gambit's MEETING request | **PASS** | His own No stands: both his pucks read off while the rest of the day is untouched |
| Talisman's TRAINING request, with a crowd of 32 dropped beside him | **PASS** | He is still his own puck inside the crowd, and still answerable |
| **Paid twice?** | **PASS — checked and cleared** | Each request man is drawn **twice** on the board — once on the promoted ground row, once on the Personal Inputs row. I chased it: tapping either puck moved BOTH (`RULE-11-double-puck.png`), so it is one decision shown on two surfaces, not two decisions. Nobody is paid twice |

---

### D44, on a request — an issued day keeps paying the men it went out with even after someone files leave

**Walked in part.** The frozen record itself is proven (see D44 below): the
issued page keeps its own list and its own figures. The "**after someone files
leave**" half is **NOT WALKED** — the door for filing an absence is the Inputs
page behind its month calendar, and the board's own `+ INPUTS` door offers only
ground request types. Route to walk it: Inputs page → 18 Jul → file leave for a
man in the issued crowd → reopen the issued page and confirm his figure is still
there.

---

### D43 — the placeholder pucks are ON by default everywhere they can land; the crowd inherits the seat's answer rather than having one of its own

| Surface | Mark | Evidence |
|---|---|---|
| Duty desk extras, ground extras, Common Programme name box and extras, sim seat extras, sim passenger line | **PASS — 6 surfaces** | Every placeholder dropped came up earning: chips read "All 26 earn a full day", "All 30 earn a full day", "All 27 earn…", etc. |
| **On an exempt seat** — the AVALON duty desk | **PASS, and this is the ruling's point** | The crowd of 45 came up **all off**. It inherited the seat's answer, not the placeholder's own default |

---

### D43 / D32, in practice — a placeholder on a duty desk, a sim seat, a sim passenger line, or the extras under a ground row, duty desk, sim or Common Programme now counts the people it stands for

| Surface | Mark | Count it gathered |
|---|---|---|
| Duty desk own position (AVALON OPS O) | **PASS** | 45 |
| Duty desk extras (SDO) | **PASS** | 26 |
| Sim seat extras (OFT EP-6) | **PASS** | 39 |
| Sim passenger line (AMT BOX) | **PASS** | 30 |
| Ground row extras (OCU REVIEW) | **PASS** | 30 |
| Common Programme name box (FAMILY DAY) | **PASS** | 27 |
| Common Programme extras (MASS BRIEF) | **PASS** | 39 |

None of them counted nobody. `RULE-02d-extras-placeholders.png`,
`RULE-08-money-per-kind.png`.

---

### The freeze has something to hold — a row with no id yet gathers nobody; every real row is given an id, so this never shows on screen

**PASS.** A ground row added through `+ Row` carried an id the instant it
existed, and a placeholder dropped on it immediately gathered a crowd. The "no
id yet" state could not be produced through the app's own controls — which is
exactly what the register promises. `RULE-09-new-row-switch.png`.

---

### D42 — an overnight line earns the day it sits on; the day the hours spill into earns nothing from it

Money ruling, two orders.

| Order | Mark | Evidence |
|---|---|---|
| The day it sits on (Saturday) | **PASS** | A plain duty row NIGHT SDO **19:00–07:00** built on the Saturday through `+ Row`, with a placeholder on it, pays **45 men a full day**, on the Saturday. `RULE-12b-d42-saturday.png` |
| The day the hours spill into (Sunday) | **PASS** | Sunday shows no count chip at all and no trace of that row; its only duty row is its own SDO 08:00–18:00. `RULE-12b-d42-sunday.png` |

---

### D31 — a seat the rules cannot measure offers no switch, and says why

**PASS — 6 kinds of unmeasurable seat**, each drawn inert (grey, no id) with the
written reason *"Nothing on this row can earn OIL, so there is nothing to switch
off"*:

a duty desk row with **blank** times (SXO) · a duty desk row that is
**zero-length** (OPS DESK 07:00–07:00) · a sim **BRIEF** with no times · a sim
**DEBRIEF** with no times · an **info-only** ground row (ⓘ ADMIN) · a **BB line
with no times** (which is how `+ Wave` mints one).

`RULE-01-switches-mode-on.png`.

---

### D49 — a flying line typed with the SAME take-off and landing still earns; the day says the times cannot be right, on the line, on any day; it never refuses the line

**This is the ruling the owner overruled mid-build (`DECISIONS.md` D49). The line
still earning is the RULING, not a bug, and is not reported as one.**

| What was walked | Where | Mark | Evidence |
|---|---|---|---|
| **It still earns** | Saturday, VIPER typed 10:00–10:00 | **PASS** | Crew Ranger and Echo still on, switch reads "Earns OIL". `RULE-03-d49-mode-day5.png` |
| **It is never refused** | Saturday | **PASS** | The app kept the typed 10:00–10:00 |
| **It is never refused** | Wednesday | **PASS** | Same — kept |
| **The day says so** | Saturday | **PASS** | *"VIPER takes off and lands at the same time (10:00) — one of the two is wrong; the day still earns from the report and debrief"*, as an advisory |
| **The day says so — on ANY day** | Wednesday | **PASS** | The same sentence, naming VL, on a weekday. `RULE-03-d49-same-time-day2.png` |
| **ON THE LINE** | Board (Sat + Wed), edit week | **FAIL — 3 surfaces** | See below |

**FAIL 3 — the day says it in the list on the right, but nothing says it on the line.**
The line's own boxes are unchanged: the take-off box, the landing box, the
callsign box and the whole row keep the same class, the same border colour and
the same background before and after the times are made identical. Nothing is
added, nothing is tinted, no tooltip appears.

And the gesture the app uses everywhere else for "show me what this warning is
about" does nothing here. Measured side by side on the same board
(`RULE-03d-crew-tapped.png` vs `RULE-03d-line-tapped.png`): tapping the warning
that names a man lit both of his pucks and scrolled the board to him; tapping the
nought-minute warning lit nothing and moved the board not at all. It is the same
on the week — no cell on that line is marked (`RULE-04-week-day-card.png`).

The sentence does name the line by callsign, so a scheduler can find it by
reading. What is missing is the mark on the line the ruling asks for, and the
tap that would take him to it.

---

### D49, the other half — a flying line with crew and NO readable times earns nothing, and is now named beside the duty desks

**PASS.** Blanking VIPER's two times turned the day's sentence into *"**VIPER**,
SXO and OPS DESK have no times — nobody on them earns OIL for this day"* — the
line named beside the desks, exactly as promised — and the line's switch went
inert with *"Nothing on this row can earn OIL"*, so its crew earn nothing.
`RULE-13-no-times.png`, `RULE-13-no-times-mode.png`.

---

### D48 — when a rule changes under an already-published day, the day keeps the money it went out with until somebody corrects it and re-publishes

**NOTHING TO WALK, and that is the ruling's own record.** `DECISIONS.md` D48
says it was superseded in practice the same hour by D49, which dropped the rule
change it was given about — so no issued day's money moves and there is nothing
to guard. The register carries it as *"nothing built — D49 removed the rule
change it was given about"*. It stands as the answer for the next rule change,
not as work to check now. This row is deliberately not blank and is not "n/a".

---

### D36 — the availability window stays narrow (step to dekit); the flying rules' wider report→debrief window is never handed to the placeholder's crowd

Money ruling, two orders, both on the Saturday against VIPER flying 10:00–11:00
with Ranger and Echo aboard.

| Order | Mark | Evidence |
|---|---|---|
| A row at **07:30–08:00** — inside VIPER's report padding, outside its step-to-dekit window | **PASS** | Ranger **is** in the crowd ("Ranger half day"). The narrow window is the one being used; the wide report→debrief window would have excluded him. `RULE-12-d36-early.png` |
| A row at **10:15–10:30** — inside the flight itself | **PASS** | Ranger is **not** in the crowd. `RULE-12-d36-mid.png` |

---

### D32 — one list: wherever a puck may land, the switch must also be offered

**PASS.** Every drop zone the board draws was enumerated straight off the screen
(28 flying seats, 16 duty, 6 sim, 10 ground, 5 Common Programme) and every one
of them either carries a live switch or carries an inert switch with a written
reason. Nothing lands somewhere the mode cannot reach. The flying cockpit is the
one place a placeholder may not land, and it refuses it, so the question does
not arise there.

---

### D27 — the count shows on every seat, on every day, with the earn mode off

| Day | Mark | Evidence |
|---|---|---|
| Saturday (earns OIL) | **PASS — 7 surfaces** | Chips on the Common Programme name box and extras, duty desk own position and extras, sim seat extras, sim passenger line, ground row extras |
| **Wednesday (earns nothing)** | **PASS — 4 surfaces** | Chips reading 48, 31, 36, 37 on the ground extras, Common Programme extras, duty desk extras and sim extras. `RULE-04-weekday-placeholders.png` |
| The mode itself on a weekday | **PASS, and correct** | There is no OIL Earn door on a weekday at all |

---

### D37 — it reads as what it is (the men with nothing else on at that time), and on a day that earns nothing it does not mention OIL at all

**PASS.** On the Wednesday every chip reads *"48 with nothing else on at that
time — tap to see them"*. **Not one chip or tap on that day contains the word
OIL** (checked across all four). The tap says the same thing the chip does:
*"48 with nothing else on at that time — who is free as things stand now:
Ranger, Saber, …"*. `RULE-04-weekday-chip-tap.png`.

---

### D37, which answer — the count says WHICH list it is, and the chip and its tap use the same words for it

| Surface | Mark | What the chip said | What the tap said |
|---|---|---|---|
| Working copy | **PASS** | "(who is free as things stand now)" | "who is free as things stand now" |
| **Issued page** | **PASS** | "(who was free when this day was issued)" | "who was free when this day was issued" |

Same phrase in both places, on both surfaces. `RULE-05-issued-page.png`,
`RULE-05-issued-tap.png`.

---

### D31, in plain words — a row the app has not saved yet says so in the squadron's words

**BUILT BUT UNREACHABLE, by design.** The sentence exists in the app (*"This row
has not been saved yet — once the day is saved it can be switched on its own"*),
but every row is given an id the instant it is created, so the state cannot be
produced through the app's own controls. Confirmed by adding a row and watching
it come up with an id already on it. This is the same fact the register records
one row above under "the freeze has something to hold", so the two agree.

---

### [OIL-UNDO-WORDS] — undo names an OIL decision as an OIL decision

**PASS.** After taking one man off a crowd, the Undo button reads
**"Undo — an OIL decision"**, and pressing it said **"Undid: an OIL decision"**
and put the man back where he was (45 men off → 44 → 45 again).
`RULE-02c-after-undo.png`.

---

### D44 — who was behind a puck is written down when the day is published, on every day; the issued page keeps that list, the working copy shows today's; a schedule issued before the app kept the record says so

| Clause | Mark | Evidence |
|---|---|---|
| Written down on publish | **PASS** | After publishing, the issued page's chips carry the version they were drawn in |
| The issued page keeps that list | **PASS** | Its chips read 27 and 26 with the frozen wording |
| The working copy shows today's | **PASS** | Back on the working copy the same chips read the live count, and it moved (27 → 25) when three of the crowd were given something else to do |
| A schedule issued before the app kept the record says so | **NOT WALKED** | No day in the saved world was published before this change, and a day published now always gets the record. Route: restore a world with a pre-change published day, or seed one |

---

### D44, the tap — the chip carries the version it was drawn in, so tapping an issued page lists the men that page went out with

**PASS.** On the issued page the tap read: *"27 behind this puck — who was free
when this day was issued — Ace full day, Warden full day, … Reaper half day,
…"* — the frozen list, each man with his own figure, not a live count.
`RULE-05-issued-tap.png`.

---

### D44, the mark — when the crowd behind a puck on a published day is no longer what it went out with, the day reads as having something pending, on every day

**WALKED IN PART.** Published the Saturday, then changed availability: the counts
moved (27 → 25, 26 → 24) and the day gained **"Publish AL1"** — it does read as
having something pending. But the only way I could change availability through
the board was to add an event, which raises an amendment on its own, so the
pending mark **cannot be attributed to the membership change**. To isolate it:
file an absence on the Inputs page for a man in the crowd and watch the day light
up with no schedule edit on it. `RULE-07-after-availability.png`.

---

### D45 — a change in availability NEVER invalidates a signature; a changed OIL decision still does

| Half | Mark | Evidence |
|---|---|---|
| A changed OIL decision **does** invalidate it | **PASS** | Published the day, raised an amendment, signed all four boxes (cur / sked / plan / appr all filled), then changed one OIL decision — *"SDO earns nobody any OIL"* — and **all four signatures cleared**. `RULE-07b-al-signed.png`, `RULE-07b-after-oil-decision.png` |
| A change in availability **never** invalidates it | **NOT WALKED** | Every availability change the board offers is also an edit to the day, and an ordinary edit clears a signed amendment by design — so the test cannot tell the two apart. Route: sign the amendment, then file an absence on the Inputs page for a man in the crowd, and confirm the four signatures are still there |

Worth recording separately, because it surprised me: **publishing consumes the
signatures.** After the day went out, all four sign boxes read "—" again. So the
signature D45 protects is the *amendment's*, not the published day's — which is
why the test had to be built that way round.

---

### No amendment nobody made — a day published before the app kept this record does not light up the moment the change ships

**NOT WALKED**, same reason as D44's fourth clause: nothing in the saved world
was published before this change, and I cannot make the app produce a day that
was. Route is the same — a pre-change world, or a seeded pre-change published day.

---

### OIL7 — tapping an item's name stops the whole item earning, so a man added later does not earn silently

**PASS, both halves, in both orders.** Tapped the OCU REVIEW ground row's name:
*"OCU REVIEW earns nobody any OIL"*, the switch went to *"Earns nothing — tap to
let it earn again"*, and every puck on that row stopped being drawn as earning.
Then came out of the mode, **added a body to the same row**, and went back in:
the row is still off and the new body earns nothing. `RULE-02c-ground-row-off.png`,
`RULE-02c-oil7-late-add.png`.

---

### OIL28 — nothing overrides ineligibility; an "allow" is permission to count real work, never to invent it

**PASS.** There is no "allow" to give on a row the rules cannot measure: the
blank-time desk, the zero-length desk, the two no-time sim rows and the info-only
ground row all draw an **inert** switch with a written reason, so the mode
offers no door to invent work from nothing. (Same evidence as D31.)

---

### OIL8 — a placeholder opens into real pucks inside the mode, so one man can be taken off a crowd — on a duty desk, a sim row and every extras line, not just a ground row

| Surface | Mark | Evidence |
|---|---|---|
| Common Programme name box (FAMILY DAY) | **PASS** | Opened into 27 pucks; took one off: *"Ace earns nothing from FAMILY DAY"* |
| Common Programme extras (MASS BRIEF) | **PASS** | Opened into 41 pucks; took one off |
| **Duty desk** (SDO extras, AVALON OPS O) | **PASS** | 27 and 45 pucks; took one off: *"Ranger earns OIL from OPS O again"* |
| **Sim passenger line** (AMT BOX) | **PASS** | 32 pucks |
| **Sim seat extras** (OFT EP-6) | **PASS** | 41 pucks |
| Ground row extras (OCU REVIEW) | **PASS** | 31 pucks |
| SC row (MAIN + SPARE under one switch) | **PASS** | 4 pucks; took one off: *"Piston earns nothing from SC"* |

`RULE-02c-oil8-crowds.png`, `RULE-02c-oil8-one-off-each.png`.

---

## The register's own "what the walk must check that no test can"

| Question | Answer from the walk |
|---|---|
| An SC shift showing MAIN and SPARE under **one** switch — does "part of this row earns" read sensibly beside two pucks, one glowing and one not? | **Yes, and it is the best-worded state in the mode.** The switch reads *"Part of this row earns — tap to make all of it earn"*, with Piston and Basher glowing and Cobra and Ledger grey beside them. It is the one exempt case whose paint is honest, because "mixed" has its own style. The others fail (FAIL 1) precisely because they have no style of their own |
| The five switch sentences, read side by side on one screen | All five drawn together on one board: *"Earns OIL — tap to stop this item earning"* · *"Part of this row earns — tap to make all of it earn"* · *"This kind of event earns nothing — tap to make it earn"* · *"Nothing on this row can earn OIL, so there is nothing to switch off"* · *"A request is answered for each person on it — tap a puck on this row, not the row itself"*. They read consistently and none is jargon. A sixth appears once a switch is turned on: *"Set to earn — tap to stop this item earning"*. `RULE-01-switches-mode-on.png` |
| Is crediting a spare by tapping the man discoverable at all? | **Only by trying it.** The spare's puck is grey and carries no hint that it is a switch; the row's own switch is the visible control and it flips the whole row. Tapping the man does work and says so afterwards — *"Piston earns nothing from SC"* — but nothing on screen invites the tap. The mode's opening message (*"tap a puck to take a man off that event, or an item to stop the whole item earning"*) is the only instruction, and it fades |
| Both widths | Walked. Phone (390×844) draws all 31 switches and refuses the cockpit placeholder with the same sentence; the phone's own OIL door works. `RULE-09-phone-mode-on.png` |
| The version preview — the only place "as issued" is visible | Walked, and it is the strongest surface in the build: the issued page's chips and taps both say "who was free when this day was issued" and list the frozen men with their figures |
| The Leave War side (tracker figure, FO/HO cell, clash strip, reverse sweep) | **NOT WALKED in this block** — it is a different surface from the behaviour register and belongs with whoever holds the money/orders block |

---

## What was NOT walked, and why — no blank cells

1. **D45's first half** (availability never invalidates a signature) — every
   availability change the board offers is also a schedule edit, and an edit
   clears a signed amendment by design, so the two cannot be told apart. Needs
   an absence filed on the Inputs page.
2. **D44's fourth clause and "no amendment nobody made"** — both need a day
   published *before* this change shipped. Nothing in the saved world is, and the
   app cannot make one.
3. **D44 on a request, second half** (after someone files leave) — same Inputs
   page door.
4. **D46's name-box half** — every request row's name box on this day already
   holds its filer, and an occupied box does not arm.
5. **D24's "the admin can switch it on"** on the BB line and the SC SPARE
   individually — both switches were read and proven live; only the press is
   missing.
6. **D33 on the phone, legal seat** — one press landed on a puck instead of the
   zone. Not a refusal.
7. **The Leave War side** — out of this block.

## Things seen that belong to someone else's findings

- The parent's **finding 1** (a chip reading "N of N earn" captioned "Some of
  these men earn OIL and some do not") was seen on **four more surfaces** than
  reported: the Common Programme extras, the OFT sim seat extras, the ground row
  extras, **and the issued page**. The issued-page tap shows exactly why it is
  wrong — all 27 earn, but Reaper earns a half day where the rest earn a full
  one, so the chip falls back to the "some do not" wording.
- The parent's **finding 2** (an AVALON line's switch painted green while its
  words say it earns nothing) is on **six** surfaces, including an AVALON duty
  desk and a desk minted from an AVALON template — see FAIL 1 and FAIL 2.
- The parent's **finding 3** (a full sim row offers no door for another body) was
  hit from the other direction: a sim row's extras zone that is already full has
  no empty pixels to press. Not re-reported.

## Errors seen

None. Across fourteen runs the browser reported no console error, no page error
and no 4xx, at either width, on the board, the week, the issued page, a weekday
and a Sunday.

## Which build this describes

Every mark above was taken against the bundle served at `http://localhost:4173`,
built at 19:08 and never rebuilt during the sweep — so all fourteen runs describe
one unchanging build, the one that was branch HEAD when the walk began.

Since that build, three interface source files and one new test file have changed
in the working tree (someone is fixing findings in parallel). **Nothing in this
sheet reflects those edits.** Anything fixed there needs the bundle rebuilt and
the affected rows re-walked.
