# One rule for every input's row, one record for every input — the plan (`[ALL-AVAIL-AS-MEMBER]`; D750, D753–D762 — 11 Oct 26)

**Status: VERSION 2 — written by Opus 5.5 on `claude/all-avail-as-member` (= `main` at `7c1fcdc0` plus records). **STEP 1
OF EIGHT IS BUILT (12 Oct 26 — §10: what was built and where it left this plan's letter); steps 2 to 8 are not.** Version 1 was read by Fable on his word (D758): "CLEAN WITH THESE EXACT CHANGES" — sixteen, each checked by the
host at the source and all taken (§9); version 2 is version 1 with them in. The ChatGPT reader D758 names is out until
about 1 Nov 26 (D761 — `OUTSTANDING.md` `[NO-ASTRA-LIST]`). **THE BUILD MAY START — D764 (*"Start now, decide at the
merge"*): on Fable's read alone, in steps on this branch; Fable also reads the finished code; at the merge he decides
whether to wait for a ChatGPT read of it. Q1 is answered — D763.** Written from the design note (`../specs/2026-10-11-all-avail-as-member-design-note.md` — §7 is the
walk-through he agreed, D757) and the survey (`../specs/2026-10-11-all-avail-as-member-survey.md` — the app as it
stands; this plan does not repeat it). Tier: HEAVY; its check is FULL (OIL, the published record, saved data,
permissions, a new gesture).

## 1. What he ruled

| Ruling | The rule |
|---|---|
| **D755** | A row that came from an input IS the input: whoever stands on it — a named person or ALL AVAIL / ALL, whoever put them there, whether the input began with one person or several — is in the input; the schedule and the Inputs calendar always show the same people, time and remark. With it: (1) OIL is one answer per input, the scheduler may switch any one person; adding someone where it is unanswered asks the scheduler on the spot, and where it is No the note says they are not counted; (2) a man dropped on the ONLY man's puck replaces him, and the input becomes the new man's; (3) the member is told by his bell when the scheduler adds people to his request, swaps him out or changes it; he may always withdraw himself, and changing it for everyone, once the scheduler has added others, is the scheduler's; (4) where it cannot apply the drop is refused with its reason — ALL AVAIL on an input longer than a day or of another kind, other people on a Personal input. |
| **D756, D759** | An input is stored as ONE record with the list of its people, changed in this job, built in steps — the first step changes nothing on screen. Nothing stored is converted (D56); an old-shaped record must not break a load; the table list says the same in the same change (D473). |
| **D753** | Where ALL AVAIL / ALL is one of an input's people: the men behind it follow the input's OIL answer; it is offered only where the input is a single day; an input takes ALL or ALL AVAIL, never both; the six kinds an ALL AVAIL input takes today (D712, D713). |
| **D757** | The walk-through in words (the note's §7) is the behaviour the plan is written to. |
| **D760** | A CX on a row that came from an input cancels the INPUT: the Inputs calendar shows it cancelled with its reason, the member's bell tells him, it goes with the input if it moves; the red box and "information only" go with the input too, shown on the schedule only. |
| **D762** | One OIL answer for everyone in an input, given by whoever filed it or an admin; no man gives an answer of his own, the filer does not pick people out; only the scheduler leaves one person out, in OIL Earn on the day. |
| **D759's readings** | The ten things that follow by themselves, told to him (its full row): one man off the programme is out of the input; a moved request takes its people; a load never changes who is in an input; an absence for several stays one row a man on the Unavailable list and a change to one man's part alone gives him an input of his own; a person added to a several-day input is on every day of it; a deleted or posted-out man leaves the input; "by Ranger" passes to the scheduler who takes him out; the bell's notice is new, with a picture first; Undo is per input; old shared demo inputs come back as one-person inputs. |

**Rulings that change when this is built (each already marked "as built until then" in its full row):** D18, D43, D46, D470
(a man or a placeholder the scheduler puts on a request's row joins the input and follows its answer — on a row that
came from an INPUT only; the scheduler's own rows are untouched), D734 (widened to every input's row), D745 (set aside),
D468 (nothing stays behind on the old day), D660 reading 3, D655 reading 2, D682 reading 2, D744, D731 (4) (no answer of
a man's own). **Unchanged and leaned on:** D737, D735, D736, D739–D742, D711, D712, D713, D702, D271, D278 (on the
scheduler's own rows), D363, D175, D98, D103, D109, D113, D114, D174–D178, D44, D45, D48, D142, D148, D450, D56, D22.

## 2. The bet — attack it

**ONE record AND ONE ground row, and nothing in between.** Yesterday's plan bet the opposite ("one record a man AND
one ground row a man; the ONE row is made where a person meets it") and paid for it with a layer of read-time glue
(the survey's §1 lists it). This plan deletes that layer:

- the input is one stored record carrying its people, its one OIL answer, its one filing and its marks;
- its row on the schedule is ONE ground row, a COPY of the input written by one body and re-made whenever the input
  differs — nothing on a row that came from an input is "the row's own" any more;
- the rules about ONE MAN'S DAY (clashes, crew rest, who is away, the ALL AVAIL crowd, the Leave War's absences, SANS
  availability, the medical tracker) go on reading one line per person — but as a DERIVED view of the one record
  (`inputLines()`), never as stored copies.

Why the reason given yesterday against one real row no longer holds: it was "a row would hold several REQUESTS, so
the OIL key would move whenever the first man left". With one record there is ONE request: `row.src` is the input's
one id, the OIL item is `i:<iid>` whoever leaves, and a person's switch is `<person>|i:<iid>` — the grammar the app
already has (the survey's §4).

**What the bet costs, and where each cost is paid:** every reader of an input changes how it reads (§4.2 — one
accessor and one view, so the change is mechanical and a miss is LOUD: a frozen line throws on a write, an old-shaped
record still reads); the published count loses its "one each" unit and gets a new one (§4.8); the writers that today
change one man's copy must split him out (§4.6); Undo's conflict test is per input (§4.11).

**Where it could fail silently — the readers are asked to attack these first:** (1) a class-A reader left on the raw
list, which would see an input and not its people (§4.2's guard); (2) OIL on an issued day frozen in the old shape
(§4.7's legacy reader); (3) a hand that writes a row that came from an input directly, to be overwritten by the next
re-make (§4.4's belt); (4) the count on a published day a several-day input covers but whose row stands elsewhere (§4.8).

## 3. The app today

The survey, whole. Its §2 table is the list of differences between a one-person request's row and a shared input's
row that this plan removes; its §3 sorts every reader into A (one man's day), B (the input) and C (writers of one
man's part); its §8 is what the design note's first pass missed.

## 4. The design

### 4.1 The record

```
Input {
  iid, ord                                   // identity and place — unchanged
  type, title, date, endDate, yr, allday, s, e, half, remarks, sans     // what the input says — unchanged
  people: Array<{ p, by?, at?, mod?, h? }>   // NEW — in the order they joined
  oil?:   { [iso]: 0 | 0.5 | 1 }             // the ONE answer (D762) — was each man's own
  acc?:   'g' | 'u' | 'r'                    // the ONE filing — was each man's own
  cx?, cxr?, flag?, info?                    // NEW on the input (D760) — were the row's
  by, at, modBy, modAt                       // who filed it, who last changed it — `by` IS the filer; `grpBy` goes
  mod                                        // the late date of the input's own window (unchanged meaning)
  hand                                       // a counter, bumped each time a person is put in (see `h`)
  lw?, lwMoved?, docId?, docIds?             // unchanged — only ever on an input of one person
}
```

- `p` is a PEOPLE id, or `allavail` / `all`. `by` / `at` — who put THIS person in and when (today's per-record `by` /
  `at`). `mod` — this person's own late date, kept only where it is later than the input's (today: "only the man
  added can be late" — `commitGroup`'s G6); a person added from the schedule gets the earlier of today and his due
  date, so he never reads late (D741). `h` — the value of `hand` when he was put in: the stamp a scheduler's OIL
  switch about him is made under (`oild.pa`), so a switch made about a man who left and came back does not revive.
- `person`, `grp`, `grpBy`, `leftAt` leave the record. Nothing else is renamed: the field names every engine body
  reads (`type`, `date`, `s`, `e`, `acc`, `oil`…) stay, so the engine's verbatim bodies change only where they read
  WHO.
- **Invariants, held at the write (the inputs door and the Undo / Redo restore, where `groupBreach` and
  `placeholderShapeViolation` stand today):** at least one entry; no person twice; at most ONE placeholder entry, and
  only on a single-day input of the six kinds, never filed under Unavailable (D753; `placeholderProblem` loses its
  rule (c) "never in a group" and keeps the rest); a medical kind or an upchit has exactly one person (D655 reading
  4); a Personal input has exactly one person and no placeholder (D755 (4)); SANS availability holds SANS people only
  (`sansRefusal`, per person).
- **One input has one time and one filing.** To give one man another time, or to take him off the programme alone, he
  is taken out of the input (D735, D759 reading 1).

### 4.2 Reading it — one accessor, one view

- `peopleOf(r)` — the list; for a record with no `people` (an OLD-shaped record, wherever it is met) it answers
  `[{ p: r.person, by: r.by, at: r.at, mod: r.mod }]`. Every reader of who is in an input goes through it, so an old
  record reads as a one-person input everywhere and can never break a load (D756). `namedOf(r)` — its real people;
  `placeholderOf(r)` — its `allavail` / `all` entry or null.
- `inputLines(list = INPUTS)` — the view for class A: one FLAT, FROZEN object per NAMED person — every field of the
  record copied, plus `person` (his id) and `mod` (his late date) — in the record's order, people in joined order. A
  placeholder entry makes no line (today a placeholder's record "never matches" a person in those readers — the same
  answer). FROZEN so that a body that still writes to "the record" it was handed throws in every test instead of
  losing the write. `JSON.stringify` of a line is today's record shape, which is what the parity tests push into the
  reference page (`testing/refwin.ts syncInputs` — it changes to `inputLines().filter(inputFlags)`; that file is test
  infrastructure, the one thing step 1 changes that is not app code).
- **TWO FUNNELS BY DATE, BOTH HONOURING THE FROZEN FRAME (Fable F2).** The class-A readers do not read the live list:
  `events.ts` (`mapInp` and its three other calls), `avail.ts` (its five blocks) and `weekctx.ts` call
  `inputs.ts inputsOn(dt)`, which on a PUBLISHED FACE answers from the issued version's own copies (`FZ`, installed by
  `withFrozenInputs`). So: `inputsOn(dt)` goes on returning RECORDS (its class-B callers — the face's Personal Inputs
  and Unavailable lists, `inpById` / `inputOn`, OIL Earn's claim lookup, `events.ts`'s row lookup), and a new
  `inputLinesOn(dt) = inputLines(inputsOn(dt))` is what those three files read. Without it a shared input on an
  issued face would flag nobody.
- **Built once per pass, never cached across writes (Fable F10).** `validate()` asks for a day's inputs several times
  and the crew list asks four times per man per paint (`avail.ts slotBar`), so a fresh copy at every call is a cost on
  a phone. `inputLines` / `inputLinesOn` are memoised INSIDE a pass and nowhere else — the shape `publish.ts passMemo`
  and `oilev.ts oilReadPass` already have: `validate()`, the crew list's paint, `oilEvidence` and the after-command
  pass open one; inside it a (frozen frame, date) is worked out once; outside a pass every call is fresh. Never a
  long-lived cache keyed on the list: `holderbase.ts` writes `acc` and `loadWeek` clears it outside the inputs door.
  Measured on the built bundle at throttle before and after step 1 (`docs/performance.md` Part 1), the numbers
  written in §9; `leavewar/sync.ts availableFor`, `state/flyplan.ts sansCommittedOn` and `ui/sanscal-model.ts` hoist
  their one call out of their per-person loops.
- **THREE classes, not two (Fable F1).** Class A (one man's day) reads LINES; class B (the input) reads the RECORD;
  **class C — anything that WRITES — finds the RECORD by id and never touches a line.** The rule the build follows and
  the readers check: a body that asks "is THIS MAN busy / away / owed / late" reads lines; a body that draws, files,
  counts, freezes, saves or permits the INPUT reads the record; **a body that calls `INPUTS.indexOf`, `INPUTS.splice`,
  compares what it found by identity, or assigns to it, reads records** — on a line `indexOf` is -1 and `splice(-1, 1)`
  would delete the LAST input in the list. The survey's §3 A wrongly listed a delete's and a posting's trims
  (`state/person-delete.ts applyDelete`) among the readers; they are writers (corrected there).
- **The guard against a missed reader (Fable F1, F15):** a source test, `inputs-readers.test.ts` — every non-test file
  that names `INPUTS`, `inputsOn(`, `inputLinesOn(`, `inpById(` or `inputOn(` is on exactly ONE of three lists in the
  test (lines / records / writers, with the functions named); the test fails a file on none, a file on the "lines"
  list whose source contains `INPUTS.indexOf(`, `INPUTS.splice(`, `inputsOn(`, `inpById(` or `inputOn(`, and a new
  file until a person puts it on a list in review.
- `inpDetailKey` (what "the same input" means to a published day) carries the people's ids SORTED, the placeholder,
  and the marks NORMALISED — `cx: !!inp.cx`, `cxr: inp.cx ? String(inp.cxr || '') : ''`, `info: !!inp.info` (Fable
  F14: a CX put on and taken off leaves `cx: false` where a record never cancelled has none; compared raw, the day
  would read pending for ever) — not `flag` (a scheduler-to-scheduler mark was never part of what a member's input
  says; it still rides the row's content, §4.3). `requestRowFields` writes the marks on the row the same normalised
  way. `frozenInputMatch`'s "pair by man" step pairs by the first named person, else the placeholder.

### 4.3 The row — one body writes it, whole

`requestRowFields(inp)` writes EVERYTHING a row that came from an input shows:

```
prog, str, end, rmks, srcType      // as today
who  = people[0].p                 // the first to join still in it
more = people[1..].p               // the rest, joined order (a placeholder is one of them)
cx, cxr, flag, info                // from the input (D760)
```

- `srcv` hashes all of it; `srcg` goes. The re-make (reconcile rule 6) writes all of it over the stored row and keeps
  only the row's id and its place in the list. So: a person the holder's stored day still carries in `more` after he
  was moved into the input cannot show twice (the survey's §8.10) — the re-make owns the whole row.
- **Drawn** in one order on every surface (the week, the board, the peek, print): named people A-to-Z by callsign
  (D727, as the one row draws today), then the placeholder; each puck keeps its positional key (`g:di.ri`,
  `g:di.ri.xN`) for its flag, its mark, its OIL bar and switch. ONE helper (`rowPeopleDrawn`, replacing
  `grouprows.ts drawnPeople`) so no two surfaces differ. `groundGroups` goes: a row is a row.
- **It stands on the input's START day only**, as today (`landRequests`); the people are in the input for every day
  it covers (D759 reading 5).
- **Rows this does not own — left exactly as they are, and a hand on them writes the row as on any ground row (as
  built, `requestOfBox` answers null):** a dead `kept` row (D363), a row whose request is gone, a read-only request's
  row. *A request taken off the programme (`acc: 'r'`) whose row stands again (a version loaded, a plan switched in —
  rule 4):* as built too — and the day reads pending for it, as today.
- **A request moved to another day** lands there from the input alone — which now holds its people and its marks, so
  they arrive with it (D760, D759 reading 2). No code of its own: it falls out of the one body.
- **A man deleted** (`overlay.ts hisLanded` / `stripPersonFromDay`): from his cutoff on he leaves the input's list
  where others remain (the request's own trim, §4.6) and the row is re-made without him; the row goes whole only
  where he was its only person. The strip no longer special-cases a `src` row's name box.

### 4.4 The hands — one door, one writer

**The door** (`ui/reqdoor.ts`, replacing `ui/grouprow.ts`): asked by every place that writes a person to a ground row
BEFORE it writes — the same callers the survey's §2 lists for today's door (`drag.ts applyDrop`, `state/view.ts
placeArmed`, `Shell.tsx`'s right-click remove, `state/store.ts writeSlot` / `writeFill`, the probe bridge), through
the one `HOOKS` entry. It answers for ANY row `overlay.ts requestOfBox` answers for (one predicate, shared with the
belt); `sharedRowOf` goes. Its three answers stay: `none` / `done` / `refused`.

| The hand | What happens | The words |
|---|---|---|
| A named person put anywhere on the row — on "+ add", on a puck where the row holds several, by an armed tap | he JOINS the input (appended) — D755 | "Tally added to Training" |
| A named person dropped ON THE ONLY PERSON'S puck, from the crew list | he REPLACES him: the list becomes [him], `by` passes to whoever did it, **the OIL answer is VOIDED and `hand` bumped** (the answer was the first man's own — D762 reading 1; his switch-offs die with the old holding), and the question opens at once for whoever did it where the input asks one (Fable F7 — as the Unavailable list's swap does today, `reassignInput`) — D755 (2) | "Tally is on Training instead of Ranger" |
| …the same, dragged FROM A SEAT elsewhere on the schedule | a SWAP in ONE command: he replaces, and the man replaced takes the seat he came from; a seat that refuses him refuses the whole swap (Fable F8 — else the gesture, which reads as a swap, would leave one man in two places and the other nowhere) | "Tally and Ranger swapped" |
| ALL AVAIL / ALL put anywhere on the row | it JOINS (never replaces anyone) | "ALL AVAIL added to Training" |
| A puck taken off — dragged to nowhere, right-click, written blank | that person or placeholder LEAVES the input | "Ranger taken out of Training" |
| The LAST entry taken off with nobody put in his place | REFUSED — D757 | "Ranger is the last on this input — use ✕ to take it off the programme, or delete it in its own window" |
| A person dragged from the row to another place on the schedule | he leaves the input and is put there, ONE command (as built — `groupLeaveTo`); refused whole if he is the last | as built |
| A person dragged from one input's row to another's | he MOVES: leaves the first, joins the second, ONE command (as built — `groupMove`) | as built |
| A person dragged from a seat that is NOT an input's row onto the row | he joins; the seat he came from keeps him (as built — reading R4 of yesterday's plan) | as built |
| Already in it; a second placeholder; ALL with ALL AVAIL | REFUSED (D271; D753) | "Tally is already on this input" / "This input already has ALL AVAIL" |
| ALL AVAIL / ALL onto an input longer than a day, or not one of the six kinds | REFUSED — D753, D755 (4) | "ALL AVAIL is for one day." / "ALL AVAIL is for Training, Meeting, Appointment, Duty, Event and Other." |
| Anyone onto a Personal input; a second person onto a medical kind or an upchit | REFUSED — D755 (4); D655 reading 4 | "A Personal input is one person's own." / "A medical entry is one person's — each needs its own document." |
| A time, a remark or the title typed on the row | changes the input (as built — `ui/reqrow.ts`, D739, D740, D742) | as built |
| CX, the red box, information only | changes the INPUT (D760); CX asks its reason as today | as today |
| The row's ✕ | takes the input off the programme (`acc: 'r'`), as built (D114); its people and marks stay IN the input, so Accept or Undo brings the row back as it was | as built |

**The words of this build are held to D726 and D765 (reading 5):** every note, refusal and bell line above is the
shortest that is still understood — the wording in the table is the upper limit, never a floor — and no screen this
job does not otherwise touch is redesigned by it; the look-and-feel pass is its own job afterwards
(`OUTSTANDING.md` `[UI-SLEEK-PASS]`).

Every person refusal a save in the input's own window can meet (leave over leave, a SANS-only kind, the absence
rules) is asked for the one person being added, and said with his callsign — the per-person half of today's
`normalizeInputDraft`, run for him alone.

**The belt** (`slots.ts`, replacing `sharedSeatBar`): `setSlotVal` / `fillSlot` REFUSE a raw write of a person to
`who` or `more` of a row `requestOfBox` answers for; `txtSet`'s refusal for the four typed boxes stays; the CX / red
box / info handlers (`board.ts`) go through the door too. So a door forgotten today, or added later, cannot leave a
row saying what its input does not. It refuses no legitimate writer: the re-make, Accept, the loads, a template,
Undo's restore, the delete's strip and a rename do not pass through those two functions (Fable, traced).

**Two things the door's widening changes in its callers (Fable F8, and its negatives):** `isRowMan(key)` — today "the
name box of a member row" — answers true for EVERY place of an input's row, an extras place and a placeholder
included, so `drag.ts applyDrop`'s seat-to-seat branch never runs its raw pair of writes from such a place (the belt
would refuse the second with the first already done); and `state/view.ts placeArmed`'s placeholder branch asks the
door's `write`, not `retarget` (which goes — a placeholder is no longer re-aimed at anybody's extras).

**The writer** (`commitInput`, replacing the trio `commitNewInput` / `commitInputEdit` / `commitGroup` for everything
but the medical plans, which keep their own bodies and call it): ONE function that takes the record (or null), the
draft of what it should say, who it should hold, and options (`sched` — the save comes from the schedule: the late
date is not moved, a Yes is re-priced not voided, as built). It runs every refusal first — for every person, before
anything is written — then ONE command: one record put. One Undo step, one line of the change history per thing that
changed. `removeEntry` / `removeInput` become "delete the input" and "take one person out" of the same writer.

**OIL at the add (D755 (1), D762):** the person added follows the input's answer — nothing is written for him. Where
the input asks the OIL question, covers a weekend or holiday and has NO answer for it, the question opens at once,
for the INPUT, for whoever added him (the sheet as it is today, `OilConfirm`; closing it unanswered leaves the input
unanswered and the question on the filer's bell). Where the answer is No, the add's note ends "— not counted for OIL".

### 4.5 The Inputs pages

- `entriesOf` / `entryRowsOf` / `entryLines` go; a list of inputs IS the list of entries. The month's bar, the opened
  day's card, the List's row, the window, the picker, the changes window's item and a bar's drag read the one record
  (`people`), and write through `commitInput`.
- **The picker ("Several people")** offers ALL AVAIL and ALL — one of them — where the input is a single day of the
  six kinds; where it is not, the two are shown greyed with the reason under them ("ALL AVAIL is for one day." /
  the kinds), as an ALL AVAIL input says "filed one day at a time" today (D753 reading 2). `pickProblem` loses its
  "placeholder + several → refused".
- **Names and counts:** a card names every named person A-to-Z, then "ALL AVAIL" (D721, D727); a bar's count ("4 ·
  Meeting") counts named people and says "+ ALL AVAIL" (`inputscal-model.ts barText`); the CSV export writes one line
  per named person and one for the placeholder. The person filter passes an input when any of its people passes, or
  its placeholder does (`ph:`).
- **"By Saber"** (D724, D729): the input's `by`. It passes to the scheduler who replaces the only person (the swap) or
  takes the filer out of an input he filed for himself (D759 reading 7) — so the bell's OIL question and "who may
  change it" go to someone still involved. **And when the filer takes HIMSELF out of an input a scheduler has put
  someone in (Fable F13):** `by` passes to whoever put in the newest entry that is not the filer's own — otherwise it
  would stay with a man who may no longer change it, and an unanswered OIL question would light nobody's bell. Where
  every remaining entry is the filer's own (he filed for others and steps out himself) `by` stays his: he is still
  its filer and may still change it.
- **The OIL line in the window (D762):** the input's one answer and its Change… button, for whoever may change the
  input. "Your OIL", its Change… / Answer… buttons, `saveOwnOil`, `entryOilAnswer`'s "differ" and `oilSummaryOf`'s "2
  of 3" go. A man in it who may not change it reads the line and has "Take me out".
- **A cancelled input (D760)** — on the card, the bar and the List's row: its title struck through and "CANCELLED —
  <reason>" in the remark's place; still listed (it is not deleted). **Its exact look is shown to him as a picture
  before step 5 is built (D541).**
- **The late mark:** an input is late when its `mod` is; a person in it is late when HIS line's `mod` is later still
  (`lateNoteOf` names them, as today).

### 4.6 One man's part — the split, and the Unavailable list

An input that lands under Unavailable (a kind that is an absence, or `acc: 'u'`) is drawn ONE ROW A MAN there (D737)
— from the record's people. Its address is `iu:<iid>` for an input of one person and `iu:<iid>~<person>` where it
holds several (the slot grammar gains that one form; `leadKeyOf` goes). **ONE parser, `keys.ts iuParts(key) → { iid,
person }`, and every site through it (Fable F16)** — the grammar is read in eleven places today, each slicing the id
off by hand: `slots.ts` (the key's existence test), `interactions.ts` (the jump, the arm's reassign, the arm's key),
`histbubble.ts` (four), `highlights.ts`, `drag.ts`, `ChangesWindow.tsx`. A stored change-history line that says
`iu:<iid>` with its man in `sub` is resolved to `iu:<iid>~<sub>` on read where the input holds several, so History's
dot and the changes window's tap land on his row.

- **A puck moved onto a man's Unavailable row** (`reassignInput`): he is REPLACED in the list by the person dropped —
  the swap, as built for one record; refused for a placeholder either way, as built.
- **Any change to ONE man's part of an input that holds several** first gives him an input of his own, in the same
  command — `ownInputOf(input, person)`: the input itself where he is alone; else a NEW record (a new id; every field
  of the input copied; `people: [his entry]`; `by` and `at` the input's) with him taken out of the original. This is
  what happens today by a record "no longer matching its group" — said in the data instead of worked out on read. The
  callers (the survey's §3 C): a time or remark typed on his own Unavailable row (`saveFromRow` under Unavailable);
  the Leave War's sick-cuts-leave, approve-extend and `cutDates`; the war's remark on his own leave cell
  (`setLeaveRemarks`, the published war's remarks sheet — Fable); a delete's and a posting's trims of HIS dates
  (where the trim would end his part earlier than the others'). An OIL answer never splits (it is the input's).
  Each of those bodies finds the RECORD by id (class C, §4.2), asks `ownInputOf`, and changes what it is handed.
- **A split on a published day is ONE change, not two (Fable F6 (c)).** Sick cuts Z's leave out of a leave filed for X,
  Y and Z: the live input now holds [X, Y] and a new input holds [Z]. `frozenInputMatch` pairs that new record — no
  frozen twin, its person in a frozen record's list and out of that record's live twin, the same kind — with THAT
  input's change, and its filing entry is dropped; the day reads what it reads today for the same act (the medical,
  and the leave).
- The Leave War keeps reading and writing one man's absence: its index is built from `inputLines()`; where it must
  WRITE, it asks `ownInputOf` first. A leave it approves itself is an input of one person, as today.

### 4.7 OIL

- **One claim per input** (`projectOilInputs`): `{ iid, type, acc, win, ans, stand, people: [named ids], ph }` — `ans`
  the input's answer for the day; `stand` from the input itself (`acc`, `cx`, `info`) with no row lookup, for every
  day it covers (today the one row's state is already what decides every day — `oilInputEligible`).
- **Who earns** (`oilEarnedWork`, `claimDefault`, `spanDefault` — ONE default for everybody): every named person of the
  claim, and every man of the crowd behind its placeholder who is not named in it, earns through item `i:<iid>` when
  the input's answer for the day is more than 0 — unless the scheduler's switch says otherwise (`earnsFrom`,
  `<person>|i:<iid>`, unchanged). `landedExtras`, `landedHasSentinel`, the holder / extras split and the "typed man
  on a placeholder's row defaults yes" branch go. On a row that is NOT from an input nothing changes (D43).
- **The crowd** is resolved as today, over the input's window, written into `sent['i:<iid>']` and frozen at
  publication (D44). A man named in the input is never in its crowd: `availableFor` reads lines, and his own line is
  a commitment over the window (`sync.ts:905`) — the survey's §4. The placeholder makes no line, so it blocks nobody.
- **An ISSUED day frozen in the OLD shape** (a claim with `person` and no `people`): read by a small legacy reader —
  the holder, plus the extras and crowd of that day's frozen row, on yesterday's defaults — so a day that has gone out
  keeps the OIL it went out with (D48, D142) and nothing is swept from the Leave War at the first boot. It is the
  only old-shape code kept beside `peopleOf`.
- **Pending on a published day:** the evidence key (`oilEvidenceKey`, `insSeg`) carries each claim's people sorted and
  its placeholder; a person added to an input therefore reads pending on every published day it earns on, as any
  change to what a day earns does (D45).
- **The switch-offs of a person who leaves** are dropped by the existing prune (`pruneHandedOverDecisions`, by his
  `h`); ALL AVAIL's stay when any MAN leaves, because they are keyed by the input (D750's second question; D757 step 4).
  **When the PLACEHOLDER itself is taken off, its crowd's switches end with it (Fable F11):** a crowd man's decision
  is stamped as a named man's is (`pa` = `hand` at the toggle) and read against the placeholder entry's `h` — so ALL
  AVAIL taken off and dropped back is a new holding, and switch-offs made under the old one do not silently come
  back. (The stored keys are pruned on the evidence's copy, as today; the stamp is what stops a revival.)
- **`landedStanding`'s `'gone'` and `'elsewhere'` go, and why they cannot be reached:** the board's row delete routes a
  row that came from an input to `unacceptInput` (it is taken off, `acc: 'r'`), and a load or a template un-files it
  and it lands again — there is no state left in which an input "landed" but its row is missing.
- **OIL Earn's screens** (`oilmode.ts`): one reason for "off" where there were four (`declined` / `unasked` /
  `filerNo` / `filerUnasked` → the input said No / the input is unanswered / switched off here).

### 4.8 A published day

- **The snapshot** (`daySnap`): the day's rows (with the row's people — a copy of the input's at issue), `inp` (the
  input records, new shape), `fil`, the evidence block. An issued face reads its own rows and its own `inp`, never the
  live input (as today).
- **The comparison** (`dayDelta`, what goes out and what the sign-offs are bound to): unchanged in kind — content,
  filing, details, OIL. Details now see the people (§4.2).
- **The count — the unit D736 rules, with no fold left to make:**
  - an input filed, taken off the programme, cancelled or un-cancelled, or re-timed / re-worded is ONE (its item,
    with its row's units riding on it — as a one-person request counts today, D114);
  - each person or placeholder added to it or taken out of it is ONE EACH — worked out from the PEOPLE THEMSELVES
    (the issued copy's list against the live one), on every published day the input covers, whether or not its row
    stands on that day; the row's own person units for that input's row ride on them and are never counted twice;
  - a swap of the only person (one out, one in, nobody else) is ONE (D113's "a replacement in one seat");
  - to make the row's units line up with that, `canonical.ts placeOf` treats `who` and `more` of a row that came
    from an input as ONE list place — so the first person leaving, and the next taking the name box, is one man off
    and nothing more;
  - **the people step OWNS those units (Fable F6 (b)):** `publish.ts unitRequestSrc` today recognises only a row's
    four boxes and its name-box address, so the list place's `people` / `reseat` units (addressed `g:di.ri.xN`) would
    stand beside the input's item — a swap of the only person would read THREE. It resolves a person unit by its row
    (`place` or `addr` → the row → `src`), the people step consumes every such unit of an input's row, and emits the
    units above from the two lists;
  - **the OIL line still folds into the input that moved it (Fable F6 (a)):** `dayPendingItemsIn` works out "whose
    change is this" from `x.was.person` / `x.now.person`; with lists that set must be the named ids of both sides'
    people, or a man added to an input that carries ALL AVAIL — who thereby leaves its crowd — reads TWO on a day that
    earns ("what this day earns" beside his own add).
  `engine/entryfold.ts` goes; `dayPendingItemsIn` gains the people step in its place. "Never zero while the delta is
  not" (`pendunits.test.ts`) stays the invariant. **New, and right under D760:** a CX on a several-day input reads
  pending on EVERY published day it covers, where today only the row's day does (told to him — R10).
- **Loads** (D363, D175, D98): a version or a plan installs its rows as today; the next pass re-makes each row that
  came from an input from the LIVE input — all of it now, people and marks included. So a load never changes an
  input, and a day whose inputs are as they were at issue comes back to "nothing pending" exactly (D98). `kept` rows
  keep what they had.
- **A day template** is unchanged (its rows are nobody's request).

### 4.9 Who may — `state/perms.ts` and `docs/data-model.md` §11, changed together (D200)

- **Change the input for everyone** (its fields, its people, its OIL answer, delete it): an admin; **the ONLY named
  person of the input, in full, whoever filed it (Fable F4 — D655 "the man himself", D762 reading 1: it is a man's
  own request; `mayChangeInput`'s test "the man himself" becomes "he is its only named person")**; or its filer (`by`)
  while every entry of its list was put in by him — and, where it holds anyone but himself, only for the kinds a
  member may file for others and while "members file for others" is on (as today). Once a scheduler has put someone
  in beside others, the filer's change-for-everyone ends (D755 (3)) and the window says so in today's sentence ("Only
  Saber — who filed it — or an admin can change this for everyone", `by` now being Saber where Saber took it over;
  else "A scheduler has changed who is in this — ask an admin to change it for everyone"). So a Training the
  scheduler files for Ranger alone, and a Training Tally was swapped onto, are Ranger's and Tally's to re-time,
  re-word, delete and answer OIL for — and the last-person refusal of §4.4 names a door he really has.
- **Take himself out:** anyone in it, always (D755 (3)). Nothing else is his: no OIL answer of his own (D762).
- **From the schedule:** every hand of §4.4 needs `canEditSched()`.
- **ONE predicate for "this change is his own part" — `perms.ts ownPart(pid, before, after)` (Fable F5):** true when
  (i) both images, where present, are an input whose only named person is he, or (ii) the two images differ ONLY in
  his own entry being in one list and not the other. Three bodies decide ownership by `.person` today and would
  refuse a member's Undo of his own "take me out": the commit gate (`inputBreach`'s own-test — moved BEFORE the
  filer branch, in the forward and the replayed path alike), Undo's "may he reverse it" (`undo/timeline.ts`
  `othersInputs`), and the owner of the change (`undo/derive.ts ownerOfChange` — for an input, the command's actor).
- **The member commit gate** (`inputBreach`), rewritten on the one record: a member's command may put or change an
  input only as the first rule allows, or by `ownPart`; a forged `by`, another person's entry stamped as put in by
  someone else, and an OIL answer on an input he may not change are refused.
- **A man who is IN a shared input he did not file does NOT add another person to it — D763 (Fable F12 put it to
  him; *"No - the filer or a scheduler"*).** The app allows it today (`commitGroup`'s people-only save; `groupStood`
  in the gate); both go in step 2 (f). Who is in an input is changed by whoever filed it or a scheduler.

### 4.10 The bell tells him — `[INPUT-CHANGED-TELL]` (D755 (3), D760)

A NEW saved record, one per person told (`notices/<id>`: `to`, `by`, `at`, `iid`, `what`, the words' parts), written
INSIDE the command that made the change (so Undo takes it back with the change) through the command layer — a
registered record with its own mapper, never a store of its own (`docs/undo-contract.md` §5).

- **Who is told:** every NAMED person in the input before or after the change, and its filer — never whoever made the
  change, never the crowd behind a placeholder.
- **What tells:** someone else added him, took him out or swapped him out; added or took out anyone else, or ALL
  AVAIL; changed its dates, times, title or remark; cancelled it or brought it back (D760); took it off the
  programme or put it back; deleted it.
- **The bell** lights while he has one unread; a tap opens a short list, newest first — "Saber added Tally to your
  Training, Sat 17 Oct" — a tap on a line opens the input (or says it is gone) and marks it read; "Mark all read".
  The four triggers the bell has today keep their own behaviour and come first, as now.
- **READ IS ITS OWN RECORD, NEVER A WRITE TO THE NOTICE (Fable F9).** A notice is part of the step that made it; if
  reading it rewrote it, the maker's Undo of his change would be refused ("Ranger changed this after your action") —
  the fault the undo contract's §5 names for every seen-mark. So: one record per person, `noticeseen/<person>` (the
  ids he has read), its command type in `undo/timeline.ts NOT_STEPS`; the notice itself is never rewritten once made.
- **The whole wiring of a new record kind, named so none is forgotten:** `storage/backend.ts` (`Collection`,
  `COLLECTIONS`), `command/types.ts LogicalCollection`, the registry's `LOGICAL_TO_BLOB`, `state/rowmap.ts`,
  `storage/reset.ts`'s wipe list, `perms.ts ownershipViolation` (a member's command may write a notice only as part of
  his own change, never one addressed to himself; his seen-record only his own), `docs/data-schema.md` and
  `docs/data-model.md` (D473).
- **Two consequences, told to him (R11, R12):** the maker's Undo takes the notice away with the change — nobody is told
  "it was undone"; and when the APP takes a man out (a posting on its date, a delete) the others in the input are
  told in plain words with no name ("Ranger is no longer on Training, Sat 17 Oct").
- **Its look — the list, a line, the empty state — is a picture shown to him before step 7 is built (D541).**

### 4.11 Storage, undo, old data, the seeds

- **Stored:** one row `inputs/<iid>` per input, the record of §4.1 — the mapper is unchanged (it writes the record
  whole). A shared input is one row where it was N.
- **Old data:** nothing is converted and nothing is wiped. An old-shaped row loads and reads as a one-person input
  (`peopleOf`); it is written in the new shape the first time a command changes it. So shared inputs saved before
  this build come back as separate one-person inputs, and a published demo day that held one reads pending until
  republished — demo data, D56 (told to him: D759 reading 10). Old `srcg` on stored rows is ignored and dropped at
  the row's next re-make; old `grp` on stored change-history lines still groups those old lines in the changes
  window (read-only). **Every row made before this build is re-made ONCE at its first read** (its hash no longer
  matches) — and with it any man or placeholder a scheduler had put on an OLD request's row, a one-person row
  included, comes off: he was never in that input. Stored demo rows only (D56), told to him in those words (R6).
- **Undo:** a record is `inputs/<iid>`, before and after whole — unchanged. Its OWNER for "whose step is this"
  (`undo/derive.ts`) is the command's actor, as for every record; the conflict test stays per record (D148), which
  is now per input (D759 reading 9).
- **The seeds** are left in the old shape where they are verbatim literals (`inputs.ts`, `weeks-data.ts`, `week2.ts`,
  the Leave War's demo world) — `peopleOf` reads them — and `state/demoseed.ts`'s shared demo input and its two
  placeholder inputs are rewritten in the new shape (one record of four people; D401's precedent) — and its "already
  seeded?" test, which looks for the old group id today, learns the new shape so an old store is not seeded twice.
  `schema.ts Input` and `schema.test.ts` declare the new shape with `person` allowed as the old form.
- **The probe bridge's `fileInput`** keeps taking a raw row in either shape (the browser tests and walk scripts file
  old-shaped rows by the hundred); a group of N raw rows with one `grp` is NOT merged — a test that wants a shared
  input files one record with `people`.

### 4.12 What is deliberately NOT changed

The scheduler's own rows (not from an input) — a placeholder there earns by default (D43), may stand twice (D278),
and CX / red box / info are the row's. The Unavailable list's one row a man (D737). What a typed box does (D739–D742).
The LATE mark's rules. How the crowd is worked out and frozen (D36, D44, D702). The Leave War's rules of record. A
day template. The medical plans. No stored record is converted; no store is wiped.

## 5. The build order — a failing test first at every step; rulings named in the tests (`npm run rulecheck`)

Each step ends with the affected test files green, then `npx tsc -b`; the whole gate set runs through the lock
(`scripts/gatelock.mjs run`) at the end of steps 1, 2 and 8.

1. **The reader, with nothing changed on screen.** `peopleOf`, `namedOf`, `placeholderOf`, `inputLines()`,
   `inputLinesOn(dt)` and the pass memo; every class-A READER of the survey's §3 moved to lines — never a writer
   (§4.2's three classes); `inputs-readers.test.ts` (the guard); `refwin.ts` (test infrastructure — the one file of
   this step that is not app code). The store still holds old-shaped records, of which a line is a copy — so every
   existing test, the parity gates and the browser suite must pass UNCHANGED. That is this step's proof. The timings
   of §4.2 are taken before and after.
2. **One record, one row, one rule** — the heart, in this order, each with its red tests. **(a) cannot be the record
   alone (Fable F3):** the moment a record carries `people` and no `person`, OIL projects no claim for it, every
   member's write is refused as "another person's input", no bell lights and no owner is found. So **(a)** is the
   record and its invariants at the write, `commitInput`, `ownInputOf` — AND, in the same commit, every body that
   would otherwise read nobody: `projectOilInputs` (one claim, `people`, `ph`), `inputBreach`'s own-test and
   `ownPart`, `oilPendingFor`, `overlay.ts hisLanded`, `ownerOfChange`, `requestRowFields`' `who` / `more`, and
   `inpDetailKey`. Its red list is said honestly — `oilev`, `perms`, `oilsync`, `demostamps` and their neighbours go
   red inside (a) and are green again at its end. Then **(b)** the whole row, the re-make, `canonical.ts`'s one list
   place, `grouprows.ts` / `srcg` / `entryPeopleOnce` / `carryOilRefusal` / `placeRequestRow`'s sibling placing out;
   **(c)** the door and the belt for NAMED people on every input's row — join, leave, both swaps, the last one, the
   moves; **(d)** the rest of OIL — the one default, the legacy reader, the swap's void, the ask-on-the-spot and the
   "not counted" note, OIL Earn's reasons; **(e)** the published count's people step, `entryfold.ts` out, the split's
   pairing; loads; **(f)** permissions and §11 (Q1's answer decides one row of it); **(g)** the Inputs pages on one
   record, "Your OIL" out; the Unavailable list's addresses, `iuParts` and its swap; **(h)** the Leave War's writers, a
   delete's and a posting's trims, through `ownInputOf`; **(i)** the demo seed, `schema.ts`.
3. **ALL AVAIL / ALL as one of the people:** the invariant relaxed; the picker; the door's placeholder rows of §4.4;
   the crowd minus the named; the two-routes test (§6, T1).
4. **The marks on the input** (D760) — the data and the schedule's buttons through the door; nothing new on the
   Inputs pages yet.
5. **A cancelled input on the Inputs pages** — after his look at its picture.
6. **Dead code and words out:** `ui/grouprow.ts`, `engine/grouprows.ts`, `engine/inputentry.ts`, `state/inputgroup.ts`,
   `engine/entryfold.ts`, `leavingNote`; `docs/file-map.md` in the same change.
7. **The bell's notices** — after his look at its picture.
8. **The records:** `docs/engine-rules.md`, `ui-contracts.md`, `feature-impact.md`, `data-schema.md`, `data-model.md`
   (§Input, the row tables, §9 rule 9, §11), `undo-contract.md`, the behaviour registers, `raptor-port/CLAUDE.md`'s
   slot grammar (`iu:<iid>~<person>`); every passage the survey's §7 names; D201's sweep for each ruling of §1's
   "change" list. Then the FULL check.

## 6. Tests the plan carries (named so the readers can ask for the missing one)

- **T1 — his two routes (the note's §5).** Route 1: an input filed for ALL AVAIL. Route 2: an input filed for Ranger,
  ALL AVAIL dropped on its row, Ranger dragged off. Then: the same row, the same card, the same bar, the same OIL
  claim and crowd, the same pending count on a published day; the two records equal but for `iid`, `ord`, the stamps
  and the history.
- **T2 — the walk-through, step by step (D757):** each of its five steps, the two OIL variants, the three refusals
  and the swap, asserted on the schedule, the Inputs calendar and the OIL work.
- **T3 — nobody earns twice:** a man named in an input that also holds ALL AVAIL is not in its crowd, earns once, and
  switching him off switches him off.
- **T4 — an issued day keeps what it went out with:** publish; add a person; the issued face, its OIL and the Leave
  War's credit unchanged, the day reads 1 pending; republish; Undo each. And the same for an old-shaped issued block.
- **T5 — the counts:** the twelve of yesterday's plan (§4.8 there) re-run on one record, plus: the first person
  leaves (1); the swap (1); two people added (2); a re-time and a person added (2); a several-day input's second
  published day when a person is added (1 there too); a cancel (1).
- **T6 — old data:** a store holding old-shaped records — a one-person request, a group of three, a placeholder input,
  a published day with a shared row — loads, draws, validates and earns without a throw; the first edit of one writes
  the new shape.
- **T7 — one man's part:** sick cuts ONE man's leave out of a leave filed for three; the other two are untouched; one
  Undo puts it back.
- **T8 — the belt:** a raw `setSlotVal` / `fillSlot` on a row that came from an input is refused; every door of §4.4
  reaches the input.
- **T9 — permissions:** the table of §4.9 against `perms.ts`, row by row (the existing `perms.test.ts` pattern).
- **T10 — the readers' guard** (§4.2), and a frozen line throwing on a write.
- **T11 — the published face reads lines (Fable F2):** a Training for three and ALL AVAIL on a PUBLISHED day — the
  face's clash and crew-rest warnings, the "away" reasons and the official pass name each of the three, as the
  working copy does.
- **T12 — a delete on lines can never happen (F1):** delete a man who is not the last input's person — the LAST input
  in the list is untouched, his own are trimmed, the command completes.
- **T13 — the man himself (F4):** an input an admin filed for Ranger alone, and one Tally was swapped onto: each may
  re-time, re-word, delete and answer OIL for it; the last-person refusal names a door he has.
- **T14 — his own Undo (F5):** Hex, one of three and not the filer, takes himself out, then presses Undo — he is back;
  the same through a reload-and-replay.
- **T15 — the swap and OIL (F7, F8):** from the crew list onto the only person's puck on a Saturday answered Yes — the
  answer is void, the question opens for the scheduler, the first man's switch-offs do not come back; from a flying
  seat — the two men change places in one Undo step, and a seat that refuses him refuses both.
- **T16 — the count's three (F6):** a man added to an input that carries ALL AVAIL on a day that earns — 1; the swap
  of the only person — 1; sick cuts one man of a shared leave on a published day — 2 (the medical, the leave).
- **T17 — the placeholder's switches (F11):** switch a crowd man off, take ALL AVAIL off, drop it back — he is on.
- **T18 — the notice and Undo (F9):** Saber adds Tally; Ranger reads the notice; Saber's Undo goes through and the
  notice is gone; "Mark all read" survives a reload and is never an Undo step.
- **T19 — the filer steps out (F13):** Ranger files, Saber adds Tally, Ranger takes himself out of an unanswered
  Saturday — "by Saber", and Saber's bell carries the question.
- **T20 — a CX on and off (F14):** on a published day, cancel an input and bring it back — nothing pending.
- **T21 — the Unavailable address (F16):** a leave for three — each man's row arms, drops, jumps and shows its history
  by `iu:<iid>~<person>`; an old line saying `iu:<iid>` lands on its man's row.

## 7. The roll-call for the bug check — FULL tier

Every place the app draws, counts or writes the thing; none may be blank on the evidence sheet: Edit Schedule's week
and the Scheduler Board (the Ground Programme row, Personal Inputs, the Unavailable list, the crew list's reasons),
View-only Sched and a published face, the next-week peek, print and the PDF, the CSV export; the Inputs calendar (the
bar, the opened day, its card), the List (phone card, desktop row), the input's window (as filer, as a man in it, as
an admin), the picker; the SANS calendar and its day; the changes window (To go out, History), the day's "N pending",
the Amendments panel, "Discard N edits"; OIL Earn (the row's switches, the ALL AVAIL window's OIL tab), the Leave War
grid (an FO / HO cell, a shared leave's cells for each man) and its OIL tracker; the bell; Undo / Redo; a reload; a
second sign-in (the member's view); Admin → Users' delete and a posting out; a load of an older version, a saved
plan, a day template. Sizes: a phone and a desktop for every screen that has both.

**The walk's scenarios start from Fable's twenty-one** (its report's "Missing scenarios", each written as a person
would do it with what must be seen — `../briefs/2026-10-11-reads/one-rule-plan-fable.md`), beside the walk-through of
D757 and his two routes (T1). The walk is sized before it starts (`docs/walk-ledger.md`, D607).

## 8. For him

**Q1 — ANSWERED, D763 (*"No - the filer or a scheduler (Recommended)"*).** As it was put (Fable F12): may a man who is
IN a shared input he did not file ADD another person to it? Today he may (for the kinds a member may file for others, with the switch on). Recommended: no — who is
in an input is changed by whoever filed it or a scheduler; he may always take himself out. It is the one place this
plan would take something from a member that no ruling of his has yet taken, so it is not built without his word.
(D655's reading 2 already says a man in a shared input "cannot change it for the others"; adding a person was let
through by the build, not ruled.)

**Readings he has not been told, to put to him with the report (none changes a ruling):**
- R1. A named person dropped on a puck where the row holds SEVERAL joins the input; only on the ONLY person's puck
  does he replace him (D755 (2), D757 — and how the one row works today).
- R2. A swap of the only person counts as ONE change waiting on a published day (D113); a person out and another in
  on a row of several is two (D736).
- R3. With D762, the window's OIL line for a shared input reads the one answer; "credited for 2 of 3" goes. Who the
  scheduler switched off on a day shows in OIL Earn.
- R5. On the Unavailable list, a time or remark typed on ONE man's row of an absence filed for several gives him an
  input of his own (as it effectively does today).
- R6. Old data: nothing is wiped; old shared demo inputs come back as separate one-person inputs (D759 reading 10) —
  and anyone a scheduler had put on an OLD request's row comes off that row the first time it is read.
- R7. The filer's "change it for everyone" ends when a scheduler puts someone in beside others (D755 (3)); he can
  still take himself out. A man who is the ONLY person in an input may always change it, whoever filed it.
- R8. A cancelled input stays listed on the Inputs calendar, struck through with its reason — not removed.
- R9. A swap of the only person asks the OIL question again: the first man's answer was his own, so it does not pass
  to the man who replaces him.
- R10. A CX on an input that runs several days reads as a change waiting on every published day it covers.
- R11. If the scheduler undoes a change, the notice it sent disappears with it; nobody is told "it was undone".
- R12. When the app itself takes a man out of an input (a posting on its date, a delete), the others in it are told.
- R13. Taking ALL AVAIL off an input ends the switch-offs made for the people behind it; dropping it back starts
  fresh. A named person leaving does not touch them.
- R14. A man dragged from a flying seat onto the only person's puck SWAPS with him — the man replaced takes that seat.
- R15 (step 2, 12 Oct 26). A member who adds people to HIS OWN input that a scheduler filed for him becomes the one
  who filed it — as before the build, where the group he made named him its filer — so he can go on changing who is in
  it; that the scheduler put HIM in does not take it away (`state/perms.ts takesOn`, `allPutBy`).
- R16 (step 2). A member never hands an input a scheduler filed for him to another person (himself out, another in, in
  one save): "Only a scheduler can move an input to another person" — he may add people, or take himself out.
- R17 (step 2). A person the input's own window adds to an input whose late date has passed reads LATE at once — only
  he does (the plan's "only the person added can be late"); a person added from the schedule never does (D741).
- R18 (step 2). The OIL question raised by putting a person on an input's row on the schedule closes its dialog with
  the sheet, answered or not — unanswered, it waits on the filer's bell.

*(R4 of version 1 is now Q1.)*

**Pictures owed to him before their step — DRAWN 12 Oct 26, waiting for his look (D541, D766):** the cancelled input's
card, bar and List row (step 5); the bell's list (step 7). Throwaway comps on the real screens of the running build, a
phone and a desktop, sharp: `docs/mock/2026-10-12-one-rule/` (37 pictures), drawn by
`scripts/handpass/onerule-mock-cancelled.mjs` and `onerule-mock-bell.mjs` — the cancelled input in them is real (filed
and cancelled by real presses, step 4's build); only its look on the Inputs pages, and the whole bell list, are drawn.
Neither screen is built until he answers.

**Q2 — ANSWERED 12 Oct 26, D767** (*"as recommended but change something … strike through the title"*; the reason in red): **on the card and the List's row a small red CX tag before the title, the title struck through, the reason after it in red; on the month's bar the words struck through and the bar faded, no tag; the same tag and struck-through name on the schedule's Personal Inputs line.** As it was put — a cancelled input on the Inputs calendar: which look? Two were drawn, each on the month's bar, the opened
day's card and the List's row. **A** (the plan's words): the title struck through, "CANCELLED — WX" in red where the
remark sits, the bar struck through and faded. **B** (quieter): a small red "CX" tag before the title — the schedule's
own tag — and the reason after it; nothing struck through. What the drawing showed: on a phone's narrow bar B loses the
title ("CX · 2 ·…") where A still reads "2 · Ran…"; on a phone's card A costs a third line ("By Saber" drops down)
where B stays at two; the schedule itself says "CX", not "CANCELLED". *Recommended:* **B on the card and the List's
row, A on the bar** — the same red CX the schedule shows wherever there is room for it, and the struck-through title
where there is not. Waits on it: step 5.

**Q3 — ANSWERED 12 Oct 26, D768: it keeps its place in the day's order — not sorted last.** As it was put — where does a cancelled input sit in a crowded day on a phone? A phone's month shows three bars a day; in the
drawing the cancelled one fell behind "+2 more". *Recommended:* leave the order alone (a cancelled input is still
somebody's day — he opens the day to see it); the other answer is "cancelled sorts last", which hides it sooner. Waits
on it: step 5.

**Q4 — ANSWERED 12 Oct 26, D769: the shorter wording (the input first, in bold, with its date; then what happened and who); and a tap still goes straight to an OIL question, an access request or a bug report where one waits, opening the list otherwise.** As it was put — the bell's list: which wording, and what when an OIL question waits too? Drawn: the plan's sentences ("Saber
changed the time of your Meeting to 10:00–11:00" — wraps to two lines at both sizes), and a shorter form that leads
with the input in bold and its date, then what happened and who ("**Range brief** Wed 15 Jul — Cancelled — WX · Saber"),
the age at the right — every notice fits two lines, and it leads with the item as the changes window does (D340).
*Recommended:* the shorter form. And today the bell opens no list at all — a tap goes straight to the one thing
waiting (an access request, a bug report, an OIL question, in that order): the plan keeps those "first, as now".
*Recommended:* as the plan has it — a tap still goes straight to one of those where one waits, and opens the list
otherwise; the other answer (drawn as `bell-desk-list-oil-first.png`) makes the OIL question the first line of the one
list, so the bell behaves one way. Waits on it: step 7, whole — its record and wiring are NOT built ahead of the look (D766 reading 1, corrected 12 Oct 26: the record sits in the command layer, is proved only with its list on screen, and this answer can change what a notice holds).

**Waiting on him:** nothing before the build. **D764:** the build starts on Fable's read alone; at the merge he is
asked, beside the gates and the check, whether to wait for a ChatGPT read of the finished code.

## 9. The reads of this plan

### Fable, on his word (D758) — version 1, 11 Oct 26

The report, whole: `../briefs/2026-10-11-reads/one-rule-plan-fable.md`. **Verdict: CLEAN WITH THESE EXACT CHANGES.**
"The bet itself is sound … none of them needs the bet redesigned." Every finding was opened at the source by the host
before it was taken (the file and function each names were read and found as described); all sixteen are in.

| # | What it found | Checked at | What was done |
|---|---|---|---|
| F1 | The survey listed a delete's and a posting's trims among the READERS; on frozen lines `indexOf` is -1 and `splice(-1, 1)` deletes the last input in the list | `state/person-delete.ts` 196–235 | §4.2: three classes — a writer reads records; the guard's third list; the survey corrected |
| F2 | The class-A readers read through `inputsOn(dt)`, which on a published face returns the issued copies — records, not lines: a shared input on an issued face would flag nobody | `inputs.ts` 62–75; `events.ts` 502–546; `avail.ts` 79, 484–611; `weekctx.ts` 144 | §4.2: `inputLinesOn(dt)`; T11 |
| F3 | Step 2 (a) alone breaks OIL, every member's write, the bell and the owner | `oilev.ts` 419; `perms.ts` 550 | §5 step 2 re-lettered; (a) carries those bodies |
| F4 | The plan took from a man his own one-person input when someone else filed it | `perms.ts` 247–254 | §4.9 first rule; T13 |
| F5 | A member's Undo of his own "take me out" would be refused | `undo/timeline.ts` 476–490; `perms.ts` 548–553 | §4.9 `ownPart`; T14 |
| F6 | Three counts wrong: a man added beside ALL AVAIL (2), the swap (3), a split (3) | `publish.ts` 250–262, 300–304; `canonical.ts placeOf` | §4.8, §4.6; T16 |
| F7 | The swap handed the new man the old man's OIL answer | `inputedit.tsx` 1439–1450 (today's swap voids and asks) | §4.4 row 2; T15; R9 |
| F8 | A swap from a seat was unspecified and contradictory; `isRowMan` covers the name box only | `drag.ts` 355–384 | §4.4 row 3 and the callers' paragraph; T15; R14 |
| F9 | Reading a notice would block the maker's Undo; the new record's wiring was not named | `undo/timeline.ts` 193, 598–608; `docs/undo-contract.md` 340–395 | §4.10; T18; R11, R12 |
| F10 | "Built fresh at each call" behind `inputsOn` is an unmeasured cost on a phone | `avail.ts` 484–524 (four calls a man) | §4.2 the pass memo and the measurement |
| F11 | ALL AVAIL's crowd switch-offs would come back when it is taken off and dropped again | `oilev.ts` 506–512 (the prune works on a copy) | §4.7; T17; R13 |
| F12 | Ending a non-filer's right to add a person is his choice, not a reading | `perms.ts` 561, 585–594 (`groupStood`) | Put to him: **D763** — no, the filer or a scheduler; §4.9, §8 Q1 |
| F13 | When the filer takes himself out, `by` stayed his and the OIL question went to nobody | `leavewar/sync.ts` 804–818 | §4.5 "By Saber"; T19 |
| F14 | A CX put on and taken off would read pending for ever | `board.ts` 1120–1126 (`cx = false; delete cxr`) | §4.2 `inpDetailKey` normalised; T20 |
| F15 | The guard missed a reader that never names `INPUTS` | the funnels of F2 | §4.2 the guard greps five names |
| F16 | `iu:<iid>~<person>`: eleven parse sites, and old history lines | `slots.ts` 433; `interactions.ts` 159, 954, 1252; `histbubble.ts` 268–449; `highlights.ts` 165; `drag.ts` 229; `ChangesWindow.tsx` 71 | §4.6 `iuParts`; T21 |

**Also taken from its negatives and its "wrong about the code":** `setLeaveRemarks` named as a caller of `ownInputOf`
(§4.6); `placeArmed`'s placeholder branch (§4.4); the demo seed's "already seeded?" test (§4.11); the old rows' one
re-make said to him in plain words (§4.11, R6); why `'gone'` and `'elsewhere'` cannot be reached (§4.7); `refwin.ts`
named as test infrastructure in step 1 (§5); the survey's line `sync.ts:1673` is `pastOnWar`, a read (corrected
there). **Its twenty-one missing scenarios** are the walk's starting list (§7).

**Not read by a ChatGPT reader** — out until about 1 Nov 26 (D761); on `OUTSTANDING.md` `[NO-ASTRA-LIST]`.

## 10. The build, step by step — what was built, and where it left the plan's letter

### Step 1 — the reader, with nothing changed on screen (12 Oct 26; its check: `../../handpass/2026-10-12-one-rule-step1.md`)

**Built as §5 step 1 says:** `peopleOf`, `namedOf`, `placeholderOf`, `inputLines()`, `inputLinesOn(dt)` and the pass
memo (`inputReadPass`) in `engine/inputs.ts`; the readers of one man's day moved onto lines; the guard
(`engine/inputs-readers.test.ts`); `testing/refwin.ts` feeds the reference page from lines. No stored record changed
shape, no writer was touched, and NO existing test file was changed.

**The proof it changes nothing:** every existing test passes unchanged; and the built app was recorded before and
after — the week's events, the warning list, why each person may or may not take each place of the week, each day's
OIL evidence, and every drawn screen, on the demo week, the week after it, a published Monday with inputs filed after
it went out, a phone, the member view — and the two records are identical byte for byte, but for the one thing §4.2
drops on purpose (below). Two runs of the build before were compared first and are identical, so the comparison sees
only the code.

**Where the build left the plan's letter, each for a reason found at the source:**

1. **Four readers §4.2 inherits from the survey as "class A" read the RECORD, and were left reading it** — the medical
   tracker (it hands its records to the applier that trims them and tells them apart by identity: F1's fault in a
   second place), the bell's OIL question (`oilPendingFor` — it also answers for an input filed for ALL AVAIL, which
   has no line; step 2 (a) rewrites it), one man's SANS offer and the SANS day's list (`sansAvailOn`,
   `sansDayGroups` — each hands the record on, to a test that holds it as the record and to the window that changes
   it; they find the record by who is IN it, through `namedOf`), and the CSV export (the Inputs pages' step). The
   survey is corrected where it listed them (§3 A). One reader the survey missed was moved: the Inputs List's
   "Deleted" group.
2. **A line is never written to — and one reader wrote.** `events.ts inpShow` asked `slots.ts acceptedDay`, which
   mints an id on a request that has none; on a frozen line that throws (one existing test caught it — the frozen line
   doing its job). `inpShow` now asks only where the request has an id; one with none stands on no row, so the answer
   is the same and nothing is written — as the official branch of the same function has always read it.
3. **More passes than §4.2 names, each for a measured cost** (`docs/performance.md` ledger 27): the plan names the
   rules pass, the crew list's paint, a day's OIL evidence and the after-command pass. The after-command pass WRITES
   (`state/view.ts rawSchedEpilogue` — the marks, the history), so it is not a pass; the rules pass inside it is. Added:
   the day and board builders (already read-only passes for OIL and the published comparison), one "may he take it?"
   (`avail.ts slotBar`), the week read into events (`collectEvents`), and the green rings on every place a picked man
   may take (`highlights.ts paintSelRings`).
4. **Two readers pick the RECORDS first and make lines of those**, not of the whole list: the ALL AVAIL crowd
   (`availableFor` — the inputs that could keep anyone out of the window are picked once for the whole walk; §4.2 asked
   only that its one call be hoisted, and hoisting alone measured 2.8 times slower on a Saturday's OIL) and the Leave
   War's re-read on every repaint (only the kinds the war shows are copied). The crew list's two reasons read the DAY's
   lines (`inputLinesOn`), as `dayOff` does, not the whole live list.
5. **The guard is stricter than §4.2 asks:** a file on the "lines" list may not name the stored list at all (the plan
   named four calls); a file that changes the list must be on "writers"; the three funnel files of F2 may not read a
   day's records; and the list of names it searches for includes `inputLines(`, so a file that reaches the inputs only
   through the view is listed too.

**The one thing dropped on purpose (§4.2: "a placeholder entry makes no line"):** before step 1, an input filed for
ALL AVAIL / ALL that kept its own voice — an all-day one, whose row has no times, or a timed one read across the week's
edge — stood in the rules' list of a day's inputs under the placeholder's own id. No rule ever matched that id to a
man, and no screen drew it. It is no longer in that list. The record shows it: five such entries, from two inputs, in
the build before, none after, and every warning, reason, OIL figure and screen identical around them.

**The timings (§4.2, F10):** `docs/performance.md` ledger 27 — on a phone's width at four times' slowdown, 8 runs
before against 5 after: the rules pass 16.6 → 15.3 ms on the demo and 45.8 → 39.5 ms with 303 inputs; the crew list
with a seat armed 17.1 → 10.0 and 68.7 → 42.9; a puck dropped on a seat, to the screen, 251 → 247 and 385 → 375; the
whole week redrawn level. One cost left: a single "may he take it?" asked on its own is about a tenth of a millisecond
slower with 303 inputs.

**For step 2 to know:** (a) the lists of `inputs-readers.test.ts` are the map of what reads what — each letter of step 2
moves files between them; (b) the four readers of point 1 read `.person` on the record and must go through
`namedOf` when the record's shape changes (three already do); (c) a line of a new-shaped record still carries the
record's `people` array, by reference — decide in step 2 (a) whether the view drops it; (d) two readers had no test
before this step and have one now (`state/roster-restore-inputs.test.ts`, `ui/inputsdeleted.test.tsx`), each with a
case for a man who is one of several people in an input.

### Step 2 — one record, one row, one rule (begun 12 Oct 26; built letter by letter, a failing test first)

**(a) — the record, its one writer, and every body that would otherwise read nobody. BUILT 12 Oct 26.** Tests:
`src/engine/onerecord.test.ts` (19), `src/leavewar/onerecord-write.test.ts` (14). The whole unit suite after it:
10159 of 10159 (one Tracker focus test failed once under the full run's load and passes by itself, three times).

*What it built:* the accessors every body about the INPUT asks through (`idsOf`, `leadOf`, `onlyNamed`, `holds`,
`entryOf` — `engine/inputs.ts`); what one record may hold (`shapeProblem`), held at the save boundary for every
command, an Undo included (`state/store.ts`, where the placeholder's check stood); the writes to the list
(`engine/inputown.ts` — `toPeople`, `putPerson`, `takePerson`, `swapPerson`, `ownInputOf`); the one writer
(`ui/inputedit.tsx commitInput`); and, in the same commit (F3): one OIL claim an input with its people and
placeholder, everyone in it earning on its one answer (`oilev.ts`), a member's command judged by `ownPart`
(`perms.ts`), Undo's "may he reverse it" and the owner of a change, the bell's OIL question, a deleted man's row
(`hisLanded`), the row's name box and the people under it (`requestRowFields`), and `inpDetailKey`.

*Where (a) left the plan's letter, and why — for the letters that follow:*

1. **THE STORE HOLDS BOTH SHAPES UNTIL THE LAST LETTER.** A record carries `people` only once a body of
   `inputown.ts` has changed who is in it, or it was filed for several by `commitInput`. A filing for ONE person is
   still written with `person` by `commitNewInput` — it reads the same everywhere (`peopleOf`) — so the app works at
   every commit while the readers move, letter by letter. **The flip — `commitNewInput` writing `people`, and the
   three old save bodies' callers moved to `commitInput` — is the LAST thing step 2 does, with (i).** Until then
   `commitGroup`, `entriesOf` and the screens that call them are untouched and still file the old grouped shape.
2. **`commitInputEdit` and `commitNewInput` STAY, as the one body an input's FIELDS are saved by** (the remark's date
   word, the late date, the OIL voiding, the stamps, the medical plans): `commitInput` calls them for what the input
   SAYS and changes the LIST itself. §4.4's "replacing the trio" is true of the callers; the two bodies are the
   "medical plans keep their own bodies" of that paragraph, kept whole rather than copied.
3. **A new claim still carries `person`** (the first named person, else the placeholder) beside `people` and `ph`, so
   every reader of a claim not yet moved — OIL Earn's screens above all — answers as before for an input of one.
   `claimPeople(c)` / `claimPh(c)` read a claim in either shape; (d) moves the rest onto them, adds the legacy reader
   and drops `person` from new claims. The key segment of a claim of one is byte for byte what it was, so no
   published day reads pending for the build.
4. **The row's hash is unchanged for an input of one** (`srcvOf` adds the people only where there are several), so no
   existing row is re-made by (a). The re-make of every old row once, and the row's people written whole for EVERY
   input, are (b)'s — with the door (c), since between them a scheduler's man on a one-person request's row would be
   swept at the input's next change.
5. **`shapeProblem` judges "nobody in it" only of a record that carries `people`** — an old-shaped record naming
   nobody (two test fixtures; no door of the app makes one) is not this build's to judge (D56).
6. **A person in an input who did not file it adds nobody — already so in `commitInput`** (D763): every change but
   "take me out" asks `mayEditInput`. The old door (`commitGroup`) still lets him until its callers move.
7. **`ownPart` ignores what a save stamps beside the list** (`modBy`, `modAt`, `hand`) and compares everything the
   input says.
8. **The late date of a person added** rides his entry (`mod`), written only where the save is the input's own window
   and falls after the input's own date; from the schedule nobody is ever late (D741).

*Not in (a), by its own lettering:* permissions in full and §11 (f) — the entries' `by` tests, `by` passing when
the filer leaves (F13); the swap's void and ask (d, c); the legacy claim reader (d); `iuParts` (g).

**(b) to (i) — BUILT 12 Oct 26, in the order (b)+(c), (e), (d), (f), then (g)+(h)+(i) with the flip.** What each built,
and where it left this plan's letter:

- **(b) the whole row.** `requestRowFields` writes the name box and everyone under it from the input's list; `srcvOf`
  carries a build mark (`2|`), so EVERY row made before the build is re-made once at its first read and whoever
  stood on it without being in the input comes off (R6); the re-make owns the row's people (`reqChanged` only where
  something a reader sees moved); `placeRequestRow` puts a row at the end; `sharedRowOf`, `entryPeopleOnce`,
  `carryOilRefusal` and `srcg` are gone. `canonical.ts placeOf`: the people of an input's row are ONE list place.
  `engine/grouprows.ts`: `groundGroups` answers every row as its own (its callers go in step 6); **`rowPeopleDrawn`**
  is the one answer to "whose pucks, in what order" — A to Z, then the placeholder — and `inputRowSeveral` says which
  rows the week, the board and the peek draw through it. *Found by the re-expressed tests, fixed:* the builders had
  been left drawing in joined order.
- **(c) the door and the belt.** `ui/reqdoor.ts` (`rowPut`, `rowTake`, `rowLeaveTo`, `rowMove`, `onInputRow`,
  `isRowMan`, `placeOnRow`; `HOOKS.inputRow`) answers for EVERY input's row; `slots.ts inputSeatBar` refuses a raw
  write to any place of it. `ui/grouprow.ts` keeps `leadKeyOf` / `lineOf` only (step 6). **A placeholder on an input's
  row is REFUSED until step 3** — with the input's own sentence — because (b) and the belt take away "the row's own
  placeholder" (D46) and step 3 is what makes it one of the people: told to him at the stop before step 3.
  *Found by the re-expressed tests, fixed:* an armed "+ add" left pointing at another row when an Accept put a row
  back above it — the armed row is now remembered by its id (`state/view.ts armStale`) and every schedule change's
  epilogue puts a stale arm down.
- **(d) OIL.** New claims carry `people` and `ph` and NO `person`; `claimPeople` / `claimPh` read either shape;
  `legacyClaim` / `legacyDefault` / `legacyEarned` are the reader for a block frozen before the build (yesterday's
  rule, off that day's own frozen row) — the only place `landedExtras` is still read. ONE default (`claimDefault`):
  everyone the input reaches follows its one answer. The crowd is written for a claim that HAS a placeholder, never
  containing a named person; a crowd man's switch is read against the placeholder's own holding (F11). OIL Earn's
  reasons: a man's own one-person input keeps his words; an input of several and the men behind ALL AVAIL say
  whoever filed it. The membership-only pass for a placeholder on a "Personal" request's row is gone (a Personal
  input holds none — all six placeholder kinds ask). The swap's void and the ask-on-the-spot are in the door (c).
- **(e) the count.** The people step in `publish.ts dayPendingItemsIn` (and `personUnitSrc`); `entryfold.ts` is not
  called any more (step 6 removes it); the OIL fold's who-set is the named people of both copies; `frozenInputMatch`
  pairs a man split out of an input with that input's change (`pieces`); a person's own line in the pending list
  (`pp`), an input of several named with its people.
- **(f) who may.** `perms.ts`: `ownPart` (and Undo's use of it), `filedWhole`, `byAfterLeaving` (F13 — one body for
  the writer and the gate), the list's own tests in `inputBreach` (nobody's entry forged or re-stamped; taking
  yourself out is yours, putting yourself in is not), `groupStood` gone (D763). §11 of `docs/data-model.md` and
  `INPUT_FILER_NOTE` changed together (D200). The window's sentence for a list a scheduler has changed is
  `sharedRefusal`'s.
- **(g) the pages, with THE FLIP.** `commitNewInput` writes `people`; `commitGroup` is the old name of `commitInput`
  and `removeEntry` of the one delete; `state/inputgroup.ts` answers every record as its own entry and the group's
  write check is gone (step 6 removes the three names). The window (`InputEditor`) holds the one record: "Your OIL",
  a man's own answer and `saveOwnOil` are out; "Take me out" is `commitInput` without him. The schedule's lists draw
  from **faces** (`inputs.ts facesOf` / `facesDrawn` — one frozen per-person view for DRAWING; a placeholder has a
  face, unlike a line). The Unavailable row's address: `iu:<iid>~<person>` for one man's row of an input that holds
  several — `inputs.ts iuTail` writes it, `keys.ts iuParts` is the one parser; a box typed on such a row, and a
  puck dropped on it (`reassignInput`), change HIS part (`ownInputOf`) or replace HIM in the list. The change
  history writes one line a person put in or taken out (`one`, filed under him).
- **(h) one man's part.** `leavewar/inputgate.ts` reads lines and splits a man out of a shared leave before sick
  leave cuts it; a delete's and a posting's trims (`state/person-delete.ts`) take him out of a list, or split him
  out where the input spans his cutoff; the war's own leaves are written with their list. `cutDates` and the war's
  remark sheet act on war-approved leaves, which hold one person — no split is needed there.
- **(i) the seed and the declared shape.** `state/demoseed.ts`: the shared demo input is one record of four, the two
  placeholder inputs carry their list, and "already seeded?" knows both shapes. `schema.ts`: `people` / `InputPerson`,
  `person` optional (the old shape).

**Tests.** New: `engine/onerecord.test.ts`, `leavewar/onerecord-write.test.ts`, `leavewar/onerecord-perms.test.ts`,
`ui/reqdoor.test.tsx` (replaces `grouprow-hands.test.tsx`), `state/inputcount.test.ts` (replaces
`grouprow-count.test.ts`). **Every test that pinned one-record-a-man was re-expressed on the one record, not deleted:**
where the rule survived, the fixture was rebuilt; where a ruling changed the rule (D18, D46, D470 → D755, D762; D744,
D731 (4) → D762; D745 set aside), the case says so by name; where the old rule still holds for a day issued before
the build, it is kept as a case on a hand-built frozen block; where the subject cannot exist any more (a placeholder
on a Personal request's row; rows of one input drawn as one), the file pins what is true now and names what it
retired. The helpers that did this work were given that brief; the host read their reports and fixed the four
product faults they turned up.

**Waiting for step 3 (a placeholder beside named people on a row, on the screens):** the requester's own puck beside
ALL AVAIL and its counter; a tap in the ALL AVAIL window leaving the requester untouched; a named person beside ALL
AVAIL following the input's one answer as his own switch; ALL AVAIL under a named person's request, its crowd off on
the input's No; a crowd change on a row holding both. Each is pinned today as "refused in this step", and those pins
flip in step 3. The ENGINE rule for it is already built and tested (`engine/oilclaimcrowd.test.ts` and its
neighbours put such a record straight into the list).

**Found re-expressing the old tests on the one record, after the letters were built (12 Oct 26) — each fixed, each
pinned by the case that found it.** The remaining tests that pinned one-record-a-man — the Inputs pages', the Leave
War's, the browser tests' — were re-expressed by five helpers under the four-choice brief (rule survives / ruling
changed it, named / old data, kept as a legacy case / subject gone, what is true now pinned), with "stop and report a
product fault, never pin it". They reported, and the host fixed:
- **The only person of an input someone else filed could not add a person** — the door let him, the check on what a
  member's command changed refused him with "Not saved — that change is not yours to make" (§4.9 says its people are
  his to change). `state/perms.ts takesOn`: his own one-person input made an input of several, the filing passing to
  him in the same change (`ui/inputedit.tsx commitInput`); `allPutBy` no longer asks who put HIM in (R15). A hand-over
  to another person by a member is refused in words (R16). `docs/data-model.md` §11 and `INPUT_FILER_NOTE` say it.
- **The change history lost the Leave War's lines** for an approved leave (approved / moved / taken back / deleted, one
  line a decision): `state/changelines.ts warInputLines` and `crossLines` read the record's one `person`; they read
  its people now (`leavewar/changelines-lw.test.ts`, ten cases).
- **A man on a published day only through a newly filed input was left out of the day's freeze** — his CAT changed
  after publishing read 0 pending (D186, D179): `engine/publish.ts dayPeopleAttrs` read `.person` (`ui/latepub.test.tsx`).
- **The window's title led with whoever joined first**, its OIL question and the cards with the first A to Z:
  `ui/inputedit.tsx inputWho` — one body for the title and for the "open the other input and lose them?" question,
  which had said "the other's input" of every input filed since the build.
- **An OIL question closed without an answer left a dialog standing on the schedule** that nobody had opened:
  `askOilIfPending(r, shut)`, passed by the row's door (`ui/reqdoor.ts`) — R18.
- **A shared input could be turned into an ALL AVAIL input** by un-picking its people and picking the placeholder in one
  save (refused before the build): refused again in `commitInput`, with the other "filed on its own" refusals, until
  step 3.
**Left for step 6 (the dead code):** `ui/inputedit.tsx oilSummaryOf`, `entryOilAnswer` (no door reaches them; five
passing cases of `ui/batch2.test.tsx` still pin the first on old-shaped records and go with it). **For step 3's
wording:** the picker says "ALL AVAIL is filed on its own…" where the save says "This input already has ALL AVAIL" of
ALL AVAIL beside ALL — one sentence for both.

**The whole gate set, watched once after all of it (12 Oct 26):** unit 10208 / 10208 (597 files) · build clean · tfin 728 / 0 · e2e 768 passed, 0 failed, 57 skipped · smoke 445 / 0 · rulecheck OK · docsize OK. The look at this stop, and what was
not checked: `../../handpass/2026-10-12-one-rule-step2.md`. **Step 2 is built; he is shown it before step 3.**

### Step 3 — ALL AVAIL / ALL as one of an input's people (12 Oct 26)

**His word for the run (D766, 12 Oct 26):** shown step 2, he asked for step 3 with a stop before step 4; going to sleep
while it was being built he lifted that stop — the job runs on unattended through step 8, and what needs his answer
waits for him (the pictures of steps 5 and 7 among it).

**Built as §5 step 3 says — the invariant relaxed, the picker, the door's placeholder rows, the crowd less the named,
the two-routes test.** Tests: `src/engine/phmember.test.ts`, `src/ui/phmember.test.tsx` (T1, T3, T16, T17 and the
placeholder rows of §4.4's table, through the doors), `src/ui/phpick.test.tsx`. The check at this stop:
`../../handpass/2026-10-12-one-rule-step3.md`.

- **The invariant** (`engine/inputs.ts placeholderProblem`): "filed on its own" is gone; the six kinds, one day and
  never under Unavailable stay. `shapeProblem`: two placeholders, or the same one twice, are one sentence.
- **The writer** (`ui/inputedit.tsx commitInput`): a placeholder may be put in beside people, be left alone when they
  go, or take an input over in one save. An input under Unavailable that takes one goes back onto the programme at
  the save, as the one-person save always did.
- **The door** (`ui/reqdoor.ts`): a placeholder put anywhere on the row joins — it never replaces anyone, and a named
  person put on ITS puck joins beside it; taken off it leaves; it stays when anyone else leaves; alone it is the last.
- **The picker** (`ui/PeoplePick.tsx`): the two as pucks of their own in "Several people" (`data-ppgroup="ph"`), one
  of them; greyed with the reason under them where the input is longer than a day or not one of the six kinds
  (`phWhy` — the window's answer, `inputedit.tsx placeholderWhy`); one already picked stays lit, with the sentence and
  "Take ALL AVAIL out". A reader is told nothing.
- **OIL** was built in step 2 (d); step 3 proved it through the doors and found the two faults below.

**The words, as short as can be understood (D726, D765 reading 5) — one body says them at every door:** "ALL AVAIL is
for one day" (was "… is filed one day at a time"); "ALL AVAIL is for Training, Meeting, Appointment, Duty, Event and
Other" (was "… can be filed only for … or Other"); "This input already has ALL AVAIL" (a second one, or ALL beside it —
the one sentence §10 asked for); "ALL AVAIL added to Training" / "ALL AVAIL taken out of Training"; "2 picked + ALL
AVAIL" in the picker; "for 2 people and ALL AVAIL" wherever a sentence counts who is in it.

**Where step 3 left the plan's letter, and why:**

1. **"The man himself" is an input's ONE person, with nobody and nothing beside him** (`inputs.ts onlyNamed`). §4.9
   says "the ONLY named person … in full". An input that holds a man AND ALL AVAIL reaches everyone behind the puck;
   D755 (3) leaves changing it for everyone to whoever filed it or a scheduler, and the commit gate already refused
   him — so the window offered a Save the save then refused. He reads it and may take himself out. Told to him (R19).
2. **Leaving an input is a holding of its own** (`engine/inputown.ts`): `hand` moves on and `leftAt[him]` — the stamp
   the one-person hand-over has written since phase 6 (a) — says where; put back in, his entry's `h` says it and the
   stamp is dropped. §4.7 has "the switch-offs of a person who leaves are dropped by the existing prune (by his `h`)":
   a man taken OUT has no entry left to carry an `h`, and beside ALL AVAIL his old switch was read against the
   placeholder's holding — it lived on, or came back after the app had voided it, and the same people reached in two
   orders earned differently. `perms.ts ownPart` ignores `leftAt` as it ignores `hand`.
3. **The crowd that ARRIVES with an input is that input's change** (`engine/publish.ts`, beside the crowd that leaves
   with one): ALL AVAIL put on a row, or an input filed holding it, read two changes waiting — the placeholder, and
   "what this day earns" — on a weekday too. §4.8 names the fold only for a man who leaves a crowd.
4. **A placeholder on a Personal input is told its own rule** ("ALL AVAIL is for Training, …"), a named person the
   Personal one ("A Personal input is one person's own") — the placeholder's rule is said first at every door.
5. **Named beside ALL AVAIL is "several"** for the door: a person dropped on the puck of the one named man of such an
   input JOINS; only on the puck of an input's ONLY entry does he replace him (R1, as built).

**Found after the build, by the look and by the older tests re-expressed (three helpers who did not write the build,
the four-choice brief of step 2, a second scenario pass each; about 190 cases added) — each fixed, each pinned by the
case that found it:** the window's sentences counted ALL AVAIL as a person ("Input added for 3 people" —
`inputedit.tsx howMany`, the look); the member offered a Save the save refused (1 above); the two OIL switch-offs
(2 above); an input under Unavailable turned into ALL AVAIL's refused in its window; the OIL question headed "ALL AVAIL
+1"; "Placed by Saber for 2 people" (`ui/placedline.ts`); the picker's reason shown to a reader; the To go out list
still saying "ALL AVAIL came off with him" and "the puck on Ranger place … came off with Ranger" (D745, set aside by
D755 — `ui/pendlist.ts`; `wentWith` stays for a row issued before the build only). Brought up to date beside them: OIL
Earn's hint on an input's row said "answered for each person on it" (one answer for everyone since D762).

**Readings to tell him, beside R1–R18 (none changes a ruling):**
- R19. A man who is the only named person beside ALL AVAIL does not change the input for everyone — he reads it and
  may take himself out; whoever filed it, or a scheduler, changes it. **Put to him and ruled so: D770, 12 Oct 26.**
- R20. A scheduler's OIL switch-off about a person ends when he leaves the input — also where he then stands behind its
  ALL AVAIL; switched off again after that, it stands.
- R21. *(WITHDRAWN 12 Oct 26 — it was wrong.)* It said a person or ALL AVAIL dragged from one input's row onto another's
  is TWO changes waiting on a published day. He asked whether that was consistent with the rest of the app; D109 already
  rules a move on the same day is ONE, a placeholder puck included. Fixed: the two units pair into one line, "Ranger:
  Training → Meeting" (`engine/publish.ts` after the people step; `ui/pendlist.ts`; `ui/phmember.test.tsx`). Out of one
  input and a DIFFERENT person into another stays two; inputs on different days are one on each day.
- R22. The next-week peek draws no counter on ALL AVAIL (it never has, on any row).

**Left for step 8 (the records):** `docs/ui-contracts.md` still describes the picker refusing a placeholder under
"Several people" (its lines on "filed on its own" and "one day at a time"); `docs/data-schema.md` / `data-model.md`
say `leftAt` is "written by the hand-over" — it is written when any person leaves, too.

**The whole gate set after all of it (12 Oct 26):** unit 10468 / 10468 (600 files) · build clean · tfin 728 / 0 · e2e 769 passed, 0 failed, 57 skipped · smoke 445 / 0 · rulecheck OK · docsize OK. **Step 3 is built; the run goes on to step 4 (D766).**

### Step 4 — the scheduler's marks on an input's row are the input's (12 Oct 26; D760)

**Built as §5 step 4 says — the data, and the schedule's buttons through the door; nothing new on the Inputs pages.**
Tests: `src/ui/inputmarks.test.tsx` (the builder's, 21 — T20 among them), `src/ui/inputmarks-scenarios.test.tsx` (the
helper's second pass, 34).

- **The record** carries `cx` (true; `false` once un-cancelled), `cxr` (the reason, only while cancelled), `flag`
  (the red box), `info`. `engine/schema.ts`, `docs/data-schema.md`, `docs/data-model.md` (the fields and §11) in the
  same change (D473, D200).
- **The row** (`engine/overlay.ts requestRowFields`) carries a copy, written only where set; the re-make takes each
  away where the input has none; `srcvOf` hashes them under build mark `3` — **every row made before this step is
  re-made once, and a CX, red box or "information only" that stood on the ROW of an old request comes off** (the input
  never carried it; stored demo rows only — D56; R23).
- **The door** (`ui/reqdoor.ts rowMark`): one command, one Undo step, a schedule-side save; `ui/board.ts`'s three
  buttons ask it on an input's row (`askCx`'s `via` hands the reason over) and write a scheduler's own row exactly as
  before. Only a scheduler: `state/perms.ts inputBreach` refuses a member's command that changes a mark, on his own
  input too (D760 reading 2); what his cancelled input SAYS is still his to change.
- **What it says to a published day** (`inputs.ts inpDetailKey`): `cx` with its reason and `info`, only where set
  (F14: a CX put on and taken off reads nothing pending), never the red box — that rides the row's content as before.
- **Silent while cancelled or information only** — ONE answer, `inputs.ts inputSilent`: the rules' gate
  (`inputFlags`), the cross-week reads that pass it by (`events.ts inpShow`), the seven-day run (`weekctx.ts`), who
  is kept out of an ALL AVAIL crowd (`leavewar/sync.ts availableFor`); OIL's standing (`oilev.ts landedStanding`)
  reads the input's own marks first, for every day it covers.
- **The change history** (`state/changelines.ts`): the input's own line a mark — "… · CX: not cancelled → cancelled —
  WX", "· red box", "· information only" — where the board logged a sentence against the day.

**Where step 4 left the plan's letter:** (1) §4.7 says `stand` comes from the input "with no row lookup":
`landedStanding` asks the input FIRST and still falls back to the row for everything else (`'gone'`, `'elsewhere'`,
a row issued before the build) — those go with step 6 or stay as the legacy reader's. (2) The marks are named in the
detail key only where set, not as `cx: false` on every input — the same comparison, and an unmarked input's key is
byte for byte what it was. (3) §4.4's "the CX / red box / info handlers go through the door" is the board's three
buttons; nothing else writes those marks, and the engine has no belt for them (a raw mark on the row is taken away at
the row's next re-make, not refused).

**Found by the older tests, re-expressed by a helper who did not write the build (the four-choice brief; twelve files),
each fixed and pinned by its case:** a cancelled input filed under Unavailable earned OIL again (it read "never
landed" before its own CX was asked); a cancelled Sunday input still counted as a day worked in next week's seven-day
run; and still raised crew rest on the Monday — both asked only "is it off the programme". Also: OIL Earn said "his
Training's row is cancelled" (the input is). The helper's count change, by ruling: "Discard" for a CX on a published
day is 0, not 1 — a load never changes an input (§4.8).

**Readings to tell him:**
- R23. A CX, red box or "information only" a scheduler had put on the row of a request BEFORE this build comes off
  that row the first time it is read (the input never carried it) — stored demo rows only.
- R24. A cancelled or information-only input's people are free again: they are counted behind ALL AVAIL elsewhere, the
  day does not count as worked for the seven-day run, and it raises no crew-rest or clash warning — on the day and
  across the week's edge alike.
- R25. A cancelled input filed under Unavailable earns nobody OIL either.
- R26. "Discard N edits" on a published day does not take a CX off an input — the mark is the input's, and the
  scheduler takes it off where he put it on.

**Not settled, his or step 5's:** the schedule's own Personal Inputs line of a cancelled input shows nothing of the CX
(its Ground Programme row does) — put to him with Q2. **Not covered by a test:** a member split out of a cancelled
shared absence (a leave cannot be cancelled this way — only a request's row carries the button).

**The look at this stop:** the mock-up script filed an input and cancelled it by real presses on the board, a desktop
and a phone, on step 4's build — `docs/mock/2026-10-12-one-rule/cancelled-real-{desk,phone}-schedule-row.png` (no
injection): the row reads "CX DUE WX", struck through and faded, its people and LATE mark in place. Opened by the
builder. Un-cancel, the red box and information only were NOT looked at on screen at this stop (tests press the
board's own buttons in jsdom); the job's walk does.

**The gates:** the affected test files green and `npx tsc -b` clean at this step, as §5 asks; the whole gate set is run
after step 6, for steps 4 and 6 together.

### Step 6 — the dead code out (12 Oct 26) — built BEFORE step 5, whose screen waits for his look (D766)

**Removed, as §5 step 6 lists:** `src/ui/grouprow.ts` (`leadKeyOf`, `lineOf` — each had become "return what you were
given"), `src/engine/entryfold.ts`, `src/state/inputgroup.ts` (`entriesOf`, `entryRowsOf`, `entryLines`),
`src/engine/inputentry.ts` (`SHARED_FIELDS`, `sharedKey`, `entryIdOf` — the old entry mark); `engine/grouprows.ts`
`groundGroups`, `RowGroup`, `drawnPeople` — the file stays for `rowPeopleDrawn` and `inputRowSeveral`, which the plan's
list had going with it; `ui/inputedit.tsx` `commitGroup`, `removeEntry`, `oilSummaryOf`, `entryOilAnswer`.
`leavingNote` was already gone. The callers simplified: `ui/interactions.ts` (the jump, the Personal Inputs line's
press), `ui/board.ts` (the ✕, CX, red box and information only no longer act on "the rows of one row"),
`ui/InputsCal.tsx`, `engine/daytpl.ts`, `engine/reorder.ts`. `docs/file-map.md` in the same change.

**One thing folded rather than dropped:** `removeEntry` said the shared sentence when a person who may not delete an
input of several tried to; `removeInput` says it now for an input of several or of ALL AVAIL ("Only Saber — who filed
it — or an admin can delete this for everyone"), and "You can only delete your own inputs" for an input of one.

**Not removed, and why:** `engine/oilev.ts`'s `'gone'` / `'elsewhere'` standings and `landedExtras` /
`landedHasSentinel` — §4.7 has them going, but they are what the legacy reader of a block issued before the build
still reads (D48, D142: an issued day keeps the OIL it went out with); `ui/pendlist.ts wentWith` likewise, for a row
issued before the build.

**Tests.** Six files leaned on the removed code; a helper who did not write the build re-expressed them (the
four-choice brief): where a case pinned behaviour that still exists it is on the live function now (`rowPeopleDrawn`,
`removeInput`, `oilSummary`, the real jump); five cases that pinned only a removed function's internals are retired
BY NAME at the head of `engine/grouprows.test.ts` (the three `entryIdOf` cases, "`drawnPeople` … old name",
"groundGroups — no ground rows"); `state/inputgroup.test.ts` keeps its name though its module is gone — it pins the
one record's shape at the write and its per-person views. Eighteen cases added in a second pass (a day template, a
reorder drag, the row's ✕, the marks on a scheduler's own row, the Personal Inputs line, the changes window's jump).

**Found by that pass — two faults left by STEP 2, fixed here, each pinned by its case:** (1) the ✕ on the row of an
input of several said "…, Nomad +2" where it had said "3 people" — it names how many again, a placeholder said beside
them (`ui/board.ts`); (2) a tap in the changes window on a change of an input of several waiting under Personal
Inputs answered "That input is not shown on this day", its line in plain sight, wherever its first to join was not
its first A to Z — the line is addressed by the first DRAWN, the tap named the first to JOIN
(`ui/histbubble.ts findInputCell`: the line of that input, whoever of its people it is addressed by).

**Also here:** `state/perms.ts INPUT_FILER_NOTE` carries D760's clause, word for word what `docs/data-model.md` §11
says (D200) — the test that pairs the two was red from step 4's document change until this commit.

**The whole gate set after steps 4 and 6 (12 Oct 26):** unit 10545 / 10545 (602 files) · build clean · tfin 728 / 0 · e2e 768 passed, 1 failed, 57 skipped · smoke 445 / 0 · rulecheck OK · docsize OK. The one failure is the Leave War desktop timing test ("the grid draws a window of months…", D84), which this work does not touch: by itself, three times over, 3 of 3. **Steps 1 to 4 and 6 are built and gated; steps 5 and 7 wait for his look at their pictures (§8, Q2–Q4); the job's FULL check and Fable's read wait for those two screens.**

### Step 5 — a cancelled input's look on the Inputs pages and on the schedule's own line (12 Oct 26; D767, D768)

**Built after his look at the pictures, as he answered (D767 — look B on the card and the List's row with his two
changes, look A on the bar; D768 — its place kept).** A failing test first: `src/ui/inputcx.test.tsx` (24 cases), and
three in `src/ui/inputmarks-scenarios.test.tsx` — the schedule's lines by the board's real CX button, and the one he
asked for: a cancelled input is not a day worked for the seven-day run INSIDE the week (it passed as written — step 4's
one answer, `inputSilent`, already covered it; it is pinned now).

- **The card** (the opened day, and the List on a phone — `ui/InputCard.tsx`, told by `ui/inputcard-model.ts cardOf`'s
  `cx` / `why`): a small red CX tag before the title, the title struck through, the reason after it in red, then the
  remark in its ordinary grey. The names, the kind, LATE, the hours and "By Saber" are untouched (reading 1). No reason
  typed: the tag alone (reading 4). The card's button says "cancelled — WX" to a screen reader.
- **The desktop List's row** (`ui/InputsPage.tsx`): the same three on the title's own line, the kind's pill whole
  under it (D727).
- **The month's bar** (`ui/InputsCal.tsx`, `inputscal-model.ts BarItem.cx`): its words struck through and the bar
  faded; no tag, no reason (D767: "for those areas that have no space to show reason it's ok"). Hovered, its tooltip
  says "Cancelled — WX". Nothing sorts by the mark, so it keeps its place (D768 — pinned for each of four inputs of a day).
- **The schedule's own line** (D767 reading 3 — `ui/html.ts inpCxHTML` / `inpCxCls`; the week's `inGrp`, the board's
  `sbInpRow`): the schedule's red tag, its reason riding in it ("CX DUE WX") as on the input's Ground Programme row,
  before the name; the name struck through.

**Where step 5 left the plan's letter, and the readings to tell him (none changes a ruling):**
- R27. **An input with no title of its own** (reading 2): on the card its kind's name — the small grey capitals of the
  top line — is struck, and the tag and reason lead the row under it; on the desktop list the kind's pill is struck,
  the tag before it and the reason after it on the pill's own line, so the row is no taller than any other.
- R28. **On the schedule's line the tag is the schedule's own** — "CX DUE WX", the reason inside the tag, as the same
  input's row reads two sections up — not the Inputs pages' "CX" with the reason beside it. On the Scheduler Board on a
  phone there is no room for the reason, and the tag reads "CX" (reading 5).
- R29. **The line under Personal Inputs is not faded or struck whole** — only its name: it is the input's own line,
  still to be read and acted on; its cancelled ROW is on the programme above.
- R30. **The Unavailable list's row of a cancelled input filed there wears the same tag and struck name** — the same
  two builders draw it (step 4 found such an input can exist; it earns nobody OIL — R25).
- R31. **The input's own window says nothing of the CX** — not drawn, not ruled; a question for him (below).
- §4.5 has "CANCELLED — <reason> in the remark's place"; D767 replaced that wording with the tag and the red reason.

**Found by the look (real presses on the built app, a desktop and a phone — `scripts/handpass/onerule-step5-look.mjs`,
pictures `../../handpass/2026-10-12-one-rule-step5/`), fixed before the commit:** on the Scheduler Board the tag
"CX DUE WX" was squeezed into a block three lines tall on a desktop and four on a phone, cutting the name to "Range
b…" — the tag is one line now, and a phone's board drops the reason; on the week the strike ran on through the small
"· accepted" after the name; on the desktop list an untitled cancelled row was a line taller than its neighbours.
The script also un-cancels the input by the same button: its card, row and bar read as any other again.

**Not built, his to answer (parked — nothing waits on it):** should the input's own WINDOW say it is cancelled?
*Recommended:* yes — the same red CX tag and reason beside its title, read-only; a member who taps his cancelled card
otherwise opens a window that looks live. And the CSV export writes a cancelled input's line like any other (no
column says it) — *recommended:* leave it until he wants a column.

### Step 8, first pass — the records for what is built (12 Oct 26); a second pass is owed after steps 5 and 7

**The reference documents were swept by a helper** (documents only; every change a dated correction beside the old
text, with its D-numbers — nothing trimmed, nothing reworded; `npm run docsize` OK) **and its list of changes read by
the host**, who sampled the new passages against the source:
`docs/engine-rules.md` (the landing paragraph — D468 as D760 changed it; the shared-row and entry paragraphs headed
"no longer exists" with what replaced them; a new bullet stating the one rule as built; OIL — "One answer for everyone
in an input", D762; the people step of the published count; who may; ALL AVAIL as one of the people; information only
on an input's row), `docs/ui-contracts.md` (the one row; the Unavailable row's `iu:<iid>~<person>`; the input's
window on `commitInput`, one OIL answer, "Take me out"; the picker's two placeholder pucks and their words),
`docs/feature-impact.md` (a surface row for the one rule, the flows, nine new drift seams — the row is a copy of the
input, the marks on the input, `leftAt` at a leaving, `inputSilent` among them), `docs/data-schema.md` and
`docs/data-model.md` (the `people` list and each superseded field; an `InputPerson` child list PROPOSED for the IT
side — theirs to settle; §9 rule 9; §11's `Input` row is the builder's own change, paired with `perms.ts`),
`docs/undo-contract.md` (one record an input: the conflict test is per input now), the group-input and OIL-seats
behaviour registers, and `raptor-port/CLAUDE.md`'s slot grammar (one sentence for `iu:<iid>~<person>`).

**One correction the sweep made to this plan's letter:** §4.11 says the owner of an input's change "is the command's
actor". As built (`undo/derive.ts`), a change to an input is owned by the input's one person where it has exactly one,
and has no single owner otherwise — the step's actor decides whose Undo step it is. The documents say what the source
does.

**Left for the second pass** (with steps 5 and 7): source comments that still name the removed code (`commitGroup` and
`oilSummaryOf` in `ui/inputedit.tsx`'s comments; about fifteen comments pointing at the four deleted files) — a tidy
of words, no behaviour; `docs/ui-contracts.md` §A member edits only their own personal inputs and §Editing an input
from the schedule, not read in depth by the sweep; the new behaviours have no behaviour-register ids of their own yet
(an id needs its line in `scripts/rulecheck.mjs`); the cancelled input's look and the bell, once built. **And then the
FULL check** (§7) and Fable's read of the finished code (D764).
