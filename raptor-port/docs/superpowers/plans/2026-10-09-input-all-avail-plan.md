# Plan — an input filed for "ALL AVAIL" or "ALL", and the new input kind "Event" (`[INPUT-ALL-AVAIL]`, `[INPUT-EVENT-KIND]`)

**Status: VERSION 2, 9 Oct 26 — REWRITTEN FROM VERSION 1's §3 AND §9 WITH EVERY CHOICE OF HIS MADE (D711–D714); READ AGAIN
BY ASTRA AND BY SOL, EACH BLIND: BOTH "CLEAN WITH THESE EXACT CHANGES" — three, all folded in below and listed in §11.
THIS IS THE PLAN BEING BUILT** (their reports: `docs/superpowers/briefs/2026-10-09-reads/all-avail-plan2-astra.md`,
`…-plan2-sol.md`; the brief: `docs/superpowers/briefs/2026-10-09-input-all-avail-plan-read-2.md`). Version 1 (the night of 9 Oct 26) was read by both and
found NOT CLEAN; its text is in this file's history (`git log -- <this file>`), its two reports are
`docs/superpowers/briefs/2026-10-09-reads/all-avail-plan-astra.md` and `…-sol.md`, and §10 below says where each of their
points is answered here. Written by Opus 5.5 from a fresh read of the code on `claude/day-window-compact` (9 Oct 26); a
line number is a hint, a function name is the claim. Both features are ONE batch, ONE branch, ONE bug check (D485).

## 1. What he asked for, and what he has ruled

- **D700:** "Can the inputs have an all avail and all selection too? Only allowed for duty and other commitments".
- **D702:** it stands for WHOEVER IS FREE, worked out live — starting with whoever is free at filing, changing by itself
  as availability changes; members may choose it too; it shows on the day and the schedule only; on a weekend or holiday
  the filer answers the OIL question once for everyone.
- **D711:** (1) the filer answers OIL once and the scheduler may switch any one man — a man behind it does NOT change
  his own answer (narrows D660 / D682 for this one kind of input); (2) not for an overseas duty or a course; (3) one day
  at a time; (4) an OIL question nobody answered goes to the FILER's bell, and only his — if he may no longer answer, the
  scheduler sees "no OIL answer" on the day.
- **D712:** not offered for "Fly with" or "Personal" either.
- **D713, D714 — the new kind "Event":** a commitment like the others — it asks the OIL question, it clashes as
  Training / Appointment / Duty do (red across a standby shift, not Meeting's amber), it shows on the Inputs calendar and
  lands on the schedule unless an admin takes it off; for ALL AVAIL, ALL or several people. No "count me in / out".

**So the kinds an ALL / ALL AVAIL input may be: Training, Meeting, Appointment, Duty, Event, Other. Nothing else.**

## 2. What exists already (verified 9 Oct 26)

1. **The placeholders are people-shaped records:** `PEOPLE.allavail` ("ALL AVAIL") and `PEOPLE.all` ("ALL"),
   `special:true, archived:true` (`src/engine/people.ts`); `isSpecial(id)` is the one test.
2. **A request lands its row on read** (`engine/overlay.ts viewOfWeek` → `requestRowFields`, `who: inp.person`; the
   holder pass `state/holderbase.ts`), on the input's START day. Nothing there refuses a placeholder; only flying seats
   do (`slots.ts sentinelSeatOK`). A scheduler may already drop a placeholder on a request's row (D46).
3. **The crowd** behind a placeholder on a request's row is `leavewar/sync.ts availableFor(iso, win, day)` (installed as
   `HOOKS.oilSentinel`), written per item into the day's evidence `ev.sent['i:<iid>']` by `engine/oilev.ts oilEvidence`
   when `landedHasSentinel(day, iid)` — for a kind that asks OIL through `projectOilInputs`, and for one that never asks
   through the membership-only loop under it. Shown by the count chip and the ALL AVAIL window; frozen at publication
   (`publish.ts daySnap` → `d.oilev`); a later change reads pending.
4. **OIL today, for a request (`oilev.ts oilEarnedWork`, the input half):** the input's HOLDER earns on his own answer
   (`inp.ans > 0`); every other man on the row — typed in the name box or under it (D18, D470) or in the crowd (D46) —
   earns by default YES (`landedExtras`), each with the scheduler's own switch over the top (`earnsFrom`).
   The per-man switch's default is `oilev.ts spanDefault` (read by `ui/oilmode.ts effectiveDefault`, `oilPersonOn`,
   `toggleOilPerson`, `oilOffReason`); for a man who is not the holder it answers YES. A request's row offers NO
   whole-row switch ("A request is answered for each person on it — tap a puck on this row", `oilItemCellHTML`): only
   the day blanket and each man's own switch sit over a request.
5. **The OIL question** is asked at the save by `ui/inputedit.tsx oilGate` (the plan from `sync.ts oilAskPlan`, which
   reads the dates and hours, never the person); the answers are `row.oil = { <iso>: 0 | 0.5 | 1 }`. The bell reads
   `sync.ts oilPendingFor(person)` — rows whose `person` is him.
6. **Who may:** `state/perms.ts mayFileInputFor(pid, type)` — an admin anyone; a member another "person" only while the
   members' switch is on and the kind is a duty or commitment (`memberFilesForOthers`); `mayEditInput` / `mayDeleteInput`
   — an admin, the man, or its filer under `filedForOther` (the switch on, the same person before and after, he its
   filer, a kind he may file for others). What a member's command really changed is checked at the save boundary by the
   hard check `ownershipViolation` → `inputBreach`, which SKIPS admins.
7. **Every input write** runs through one body, `state/store.ts runInputWrite` (inside `writeInputs` /
   `writeInputsBatch`), and every Undo / Redo of inputs through `state/sched-commit.ts`; both sit inside one command,
   whose real changes (`env.changes`, each with `before` / `after`) are judged by the HARD checks of
   `command/harness.ts` before the command is kept — a breach rolls the whole command back.
8. **The save doors:** the editor (`commitNewInput`, `commitInputEdit`, `commitGroup`) — all through
   `normalizeInputDraft`; **the Inputs List's own Add form (`ui/InputsPage.tsx add()`), which validates by hand and
   writes its own record; the List's pencil editor (`InputsPage.tsx saveEdit`), which has a Person list of its own and
   asks the document question before it reaches `commitInputEdit`;** the board's Add / edit dialog (the editor with a
   plain Person list); the calendar's drag (`caldrag.ts` → `commitInputEdit`); the in-place time cells
   (`setInpField` → `commitInputEdit`); the schedule's reassign (`reassignInput`); the board's `→ Unavail`
   (`engine/slots.ts acceptInput(di, inp, 'u')`); the Leave War's door (leave only); the test bridge.
9. **The picker** (`ui/PeoplePick.tsx`): one person from an A-to-Z list (`pickRoster` drops every special), or "Several
   people" in groups; `pickProblem` is the one sentence-and-fix for a pick he may not save.
10. **The person filter's "Everyone"** is the string `'all'` — the same string as the ALL placeholder's id — in the
    List (`InputsPage.tsx`), the month (`inputscal-model.ts`) and the opened day (`InputsCal.tsx dayEntries`).

## 3. The design — ALL / ALL AVAIL

### 3.1 The record — no new shape, and no copy of names
An ordinary single input: `person: 'allavail' | 'all'`, `by` = who filed it, no `grp`. Nobody's name is stored in it.
**No man behind it has a record of his own, so none has an answer of his own to change — that is D711 (1), said here on
purpose.** `docs/data-schema.md` and `docs/data-model.md` say so; §11's `Input` row gains the placeholder note (§3.4).

### 3.2 The three structural rules, and where they are held
A placeholder input (one whose `person` is a placeholder) is (a) of an allowed kind — Training, Meeting, Appointment,
Duty, Event, Other; (b) ONE day — no end date after its start; (c) alone — no group mark, never mixed with named people
or with the other placeholder.

**ONE function** says what is wrong, in a sentence: `engine/inputs.ts placeholderProblem({ person, type, date, endDate,
yr, grp, grpBy })` → `''` or the sentence ("ALL AVAIL is filed one day at a time", "ALL AVAIL can be filed only for
Training, Meeting, Appointment, Duty, Event or Other", "ALL AVAIL is filed on its own — not with named people"). The
allowed kinds are ONE list beside it (`PLACEHOLDER_KINDS`), read by the picker too.

**Held in two layers, both asking that one function:**
1. **At the save boundary, whoever saves and by whatever door — a new HARD check** `placeholder-input-shape`, registered
   beside `member-writes-own` (`state/store.ts wireStore`): for every input record the command created or changed
   (`env.changes`, collection `inputs`, a `put` whose `after.person` is a placeholder), `placeholderProblem(after)` must
   be empty. It reads no role, so an admin, a member, a restore and the test bridge are all held; it reads only what the
   command changed, so an untouched stored record is never judged (D56). A breach rolls the whole command back: no
   record, no history line, no Undo step, no half-filed group.
2. **At every door, first, with the sentence** — so the refusal is said where he pressed, and the window stays open:
   - `normalizeInputDraft` (every editor save, the group save per man, the calendar drag, the time cells, `oilGate`);
   - the List's Add form `add()` and the List's pencil editor `saveEdit()` — the same call, FIRST: before the document
     question, the medical sheets and the OIL question (so a placeholder input retyped into a medical kind is refused
     before any of them is asked);
   - `commitGroup` — the WHOLE selection is checked before any man is written: any placeholder among `want` when more
     than one is wanted, or an entry that is a group, is refused;
   - `pickProblem` — a placeholder with a kind not allowed, or with "Several people" on, shows its sentence in the
     picker with one press that corrects it (below).

### 3.3 Choosing it
In `PeoplePick`'s one-person list, under a heading **"Whoever is free that day"**: **ALL AVAIL** and **ALL** (D702: both
stand for whoever is free; neither takes ground crew — D52). Offered when he may pick someone other than himself for
this kind (`mayFileInputFor` for another), the kind is an allowed one, and it is not the SANS calendar. A placeholder
already picked is always shown, whatever the kind becomes — nothing is ever substituted for what he picked:
- the kind changed to one not allowed → the picker's line says why, with "File it for me only" (a member) or no button
  (an admin picks a name);
- "Several people" switched on with a placeholder picked → the line says "ALL AVAIL is filed on its own — it already
  stands for whoever is free", with one press, "File it for ALL AVAIL only", back to one person.
**Every Person list that can hold one offers them the same way** — the picker, the List's pencil editor and the board's
dialog all draw the one group (`PeoplePick.tsx PlaceholderGroup`): both placeholders for the six kinds, and a placeholder
already chosen ALWAYS listed, so a filed ALL AVAIL input never opens showing a real man's name over it.
In an input already filed, an admin may change the person to or from a placeholder in any of those editors (a member
never moves an input to another person, as today); the OIL question is then asked again, as on any change of
person. **The schedule's reassign refuses BOTH directions** (`reassignInput`: a placeholder as the source as well as
the destination), and **`→ Unavail` is not offered for, and refuses, a placeholder input** (`acceptInput(…, 'u')`, and
the button in `html.ts` / `board-html.ts`): "Unavailable" describes a real person's day. Replacing the name box of the
landed row stays a scheduler's ordinary act (D470).

### 3.4 Who may
- **File:** an admin; a member while the members' switch is on (`mayFileInputFor(placeholder, type)` already answers
  exactly this; the kinds are §3.2's). A guest never.
- **Change or delete:** an admin, or the member who filed it — **only while the members' switch stays on** (that is
  `filedForOther` today, and the plan keeps it: switching members' filing off takes a member filer's rights over what he
  filed for others, a placeholder input included, until it is switched back on).
- **Answer its OIL question:** whoever may change it (the filer; an admin). A member filer's answers are held by
  `inputBreach`'s third test as for any input he filed for another (a day the record covers that asks, 0 or the amount
  its hours give).
- `data-model.md` §11 `Input` row and `perms.ts INPUT_FILER_NOTE` gain the words (pinned by `perms.test.ts`): an input
  for ALL / ALL AVAIL counts as filed for another person; one of the six kinds, one day, never in a group (D700, D711,
  D712, D713).

### 3.5 Where it shows (D702: "only on the day and the schedule")
- **The Inputs calendar:** its bar, its tip and its opened-day card read "ALL AVAIL · Meeting", the card wearing the
  placeholder's own puck and the small print "Saber · 12 Jul, 14:42" (D701). It is nobody's "mine".
- **The Inputs List:** one row, the same words. **The person filter's "Everyone" gets a value of its own**
  (`EVERYONE`, a string no person id can be) in all three places of §2.10 together — the default, the reset, the
  "reveal" helpers and the summary chip included — and the filter offers ALL AVAIL and ALL as two choices of their own.
- **The schedule:** the landed request row with the placeholder puck in its name box, its count chip and the ALL AVAIL
  window — as built for D46; nothing new is drawn.
- **Bells:** no man behind it is ever asked or told. **The ONE exception (D711 (4)):** an OIL question nobody has
  answered lights the FILER's bell — and only while he may still answer (`mayEditInput`); a task is never shown to
  someone who cannot do it. Where he no longer may (a member filer, the switch since turned off), the scheduler sees it:
  the Inputs List's existing "OIL?" chip on the row (an admin may answer any input), and on the day, in OIL Earn, the
  window's "Who earns OIL" half says the question has no answer yet (§3.7).
- **Never** on the Leave War; never in a man's own inputs.
- **A limit, told to him:** the Inputs calendar's card does not show how many are free; the schedule's puck and its
  window do.

### 3.6 Live, then frozen — no new mechanism
The crowd is worked out on read for a working day and written into the day's evidence at publication (§2.3). Filing,
changing or deleting it on a PUBLISHED day is a pending change like any input (D178); a change of the filer's answer, or
of who is free, after publication reads pending and keeps the issued credit until it goes out (D44, D45, D142); the
sign-offs fall (D103).

### 3.7 OIL — ONE default, read by the credit, each man's switch and the words
**The rule (D711 (1)), for a request whose holder is a PLACEHOLDER:**
- the placeholder itself is never credited and never offered a switch;
- **a man the scheduler typed** onto the row (the name box or under it) defaults YES — D18, D470, unchanged;
- **a man who is there only as one of the crowd** follows the FILER's answer for that day: more than 0 → he earns by
  default; 0, or no answer yet → he does not;
- a man who is both counts once, as typed;
- the day blanket and the scheduler's own switch for one man stay over the top (D28, D43) — so after a No, a tap on a
  man GRANTS him (writes `allow`) and a second tap takes the grant away; after a Yes, a tap refuses him (`deny`) and a
  second tap clears it;
- **the amount** is not capped by the answer: a positive answer admits the work, and the man's own day — first start to
  last end — decides half or full, as for everyone (`oilAmount`).
A request held by a NAMED man is untouched in every respect: his own answer for him, YES for everyone else on his row,
a placeholder dropped there by the scheduler included (D46).

**ONE body:** `engine/oilev.ts claimDefault(day, ev, claim, person)` — `claim` the evidence's own record of the request
(`ev.inputs`), the typed men read from the day's row (`landedExtras` with no crowd), the crowd from the day's saved
evidence (`ev.sent`) — both are inside an issued snapshot, so a published day answers from what it went out with.
Read by: `oilEarnedWork` (the credit — and it no longer puts the placeholder into the work at all), `spanDefault` (each
man's switch: `oilPersonOn`, `toggleOilPerson`, `effectiveDefault`), and `oilOffReason`, which gains the two true
sentences for a crowd man who is off by the filer's word — "whoever filed this Duty answered No — tap to credit him
anyway" and "the OIL question for this Duty has not been answered yet — tap to credit him" — where today he would be
told "this kind of event earns nothing by default". The window's "Who earns OIL" half says the same above its list.

**Asked:** at the save, of whoever saves (`oilGate`), on a non-working day, for a kind that asks (all six do).
**The existing answer rules are kept, for a placeholder input exactly as for a named man's (`voidedOil`, `oilGate` — not
changed):** changing the person, or leaving the kinds that ask, voids the answers; changing the hours drops only a
positive answer whose suggested amount changed — a No stays, and a Yes stays when the new hours give the same amount;
changing the dates keeps the existing answers, which apply only to their own covered dates, and asks for newly
applicable days that have none.
**Unanswered** (a holiday declared after it was filed; the question cancelled at the save): `oilPendingFor(pid)` also
returns a placeholder input whose filer (`by`) is `pid` — where `mayEditInput(row)`; the bell's tap opens it on the
question, as it does for his own.

### 3.8 What must NOT change
A named man's input in every respect (a test pins his credit, his switch and his row byte for byte, with ALL AVAIL in
his row's extras — D46). A placeholder dropped on a row by the scheduler (D27, D33, D43, D47). Who counts as free (D36,
D52, D327). What a published day keeps (D44, D45, D48). `validate()` — a placeholder input raises no warning and makes
nobody busy or away (`dayAway` and `availableFor` read real people only; `dayAway` gains the explicit guard so a
placeholder can never be counted as one absent man, whatever kind reaches it). The Leave War. `reference/` parity
(tfin 728 / 0).

## 4. The design — the kind "Event" (D713, D714)

**One more row of the ONE table** (`engine/inputs.ts INPUT_META`), after `Duty`:
`'Event': { name:'event', grp:'act', work:false, local:true, ground:true, half:false, shiftHard:true }` — the same
flags as Training, Appointment and Duty. Everything else follows from the table, and each is checked rather than assumed:
- it sits under "Duty & other commitments" in the type list, the legend and the Logic page's type table
  (`inputRuleText` — one sentence, both screens);
- it asks the OIL question and bears crew rest (`restsInput` / `oilAsks`: every "Duty & other commitments" kind but
  Personal and SANS Availability);
- it lands on the Ground Programme unless an admin takes it off (`isPersonal`), opens timed, not all day
  (`defaultAllday`), takes no AM / PM;
- across an SC MAIN shift it is a red Warning (`shiftHardInput`), like Training, Appointment and Duty — not Meeting's
  amber; a man on it is not in an ALL AVAIL crowd for those hours (`availableFor` reads `isPersonal`);
- a member may file it for other people while the switch is on; it may be filed for several people, and for ALL / ALL
  AVAIL (§3.2).
**The places that restate the list by hand, changed in the same commit:** `engine/schema.ts` (the declared types);
`testing/refwin.ts` — `reshift`'s hand-typed-label list and the crew-rest set `reirest` (the drift seam `inputs.ts`
names: "change one, walk all three"), so the original's suite still agrees (tfin 728 / 0, `parity.test.ts`);
the documents (`data-schema.md`, `engine-rules.md`, `ui-contracts.md`, `remarks-vocabulary.md`, the Logic text).
**One ripple, to tell him:** the word typed on a ground row counts too — a hand-typed ground row whose name contains the
word EVENT becomes a red clash across an SC MAIN shift, as TRAINING, DUTY, PERSONAL, APPOINTMENT and OTHER already do
(the list is derived from the same flags; he chose that behaviour for those words on 26 Aug 26).
**The everything-day** (the demo seed, `state/demoseed.ts`) gains an Event for a named man and a weekend Duty for ALL
AVAIL, so a fresh boot shows both and the walk starts on them (the checking order's §7.1).

## 5. The roll-call the build must fill — every place an input's person or kind is read
Each gets YES / NO-because / MISSING in the evidence sheet, and a named test where it is YES.
**The person:** the picker (one-person list; "Several people"; the SANS calendar's picker — not offered) · the editor's
window (new; an input already filed; read only) · the board's Add / edit dialog · the List's Add form · the List's
pencil editor (its own Person list) · the List (the row, its sort, its search, the
person filter with Everyone / ALL / ALL AVAIL, the "OIL?" chip, the summary chip) · the month's bar and tip · the
opened day's card and its filter · `isMe` / "mine" · the bell (the filer's; nobody else's) · the schedule's request row
on the week and on the board (the puck, the count chip, the ALL AVAIL window, its two halves) · Personal Inputs on the
week and the board (the echo; `→ Ground`, `→ Unavail` not offered) · Unavailable (never there) · OIL Earn (the row's
name: no switch; each crowd man's switch in the window; a typed man's on the row) · the published face and its pending
count · the changes window, the pending list and the Undo label (`changelines.ts`, `pendlist.ts`, `undo/describe.ts`) ·
the placed line · `dayAway` / the day panel's "Leave / downchit" total · `availableFor` · `events.ts` / `validate.ts` /
`weekctx.ts` (no warning, no crew rest, no work hours for a placeholder) · Insights · the Leave War's readers
(`sync.ts`, `inputgate.ts`: nothing shown) · person delete / archive / post-out (specials are refused there already; a
FILER archived or deleted leaves the input standing, an admin's to answer) · export and print (`ui/export.ts`,
`printpdf.ts`) · the guest view · the SANS calendar (never there).
**The kind "Event":** the type list in every editor and the List's form · the type filter · the legend and the Logic
table · the month's bar colour and the card · the Ground Programme row, on the week, the board and print · the warning
list (the SC MAIN clash; crew rest) · the OIL question · the ALL AVAIL crowd · a hand-typed ground row named EVENT ·
`schema.ts` and its test · the original's suite.

## 6. Tests first — each written to fail before its change
1. **The three structural rules, at every door** (both placeholder ids): the editor's new and edit saves; the List's
   Add form with a several-day range; "Several people" switched on after ALL AVAIL was picked, and a mixed group through
   `commitGroup`; the calendar's range pick and a bar stretched over a second day; each refused kind (OD, CSE, Fly with,
   Personal, a leave, a medical, SANS availability); the test bridge and a hand-made write straight into the list (the
   hard check alone). **Every refused save leaves the inputs, the answers, the schedule, the change history and the Undo
   list exactly as they were.** Undo and Redo of a good filing.
   **The List's pencil editor, both placeholders:** opened and saved unchanged (the name shown is the placeholder's);
   its kind changed to a refused one, a medical one included (refused before the document question); an admin turning a
   named man's input into a placeholder's and back.
   **The save boundary itself, without a door in front of it** (both placeholder ids): the real restore command handed
   each refused after-image — a wrong kind, two dates, a group mark — rolls back whole, with no new history line and no
   new Undo step; a command that changes only a valid placeholder record's place on the programme (`acc`), its order
   (`ord`) or its OIL answer is kept; a loaded version and a plan switch with a placeholder input on the day.
2. **Who may** (`perms.test.ts`, with §11): an admin; a member with the switch on and off; a guest; a member filer's
   change, delete and OIL answer; the switch turned off after he filed (no right, no bell); the switch turned off while
   his confirmation is open (refused at the save, nothing written).
3. **OIL, the engine** (`oilev`): a weekend Duty for ALL AVAIL — the filer's No → nobody in the crowd earns by default,
   Yes → each earns, no answer → nobody; a man typed onto the row earns in all three; a man both typed and in the crowd
   counts once, as typed; the placeholder is in nobody's work; an answer of 0.5 with a long day still gives a full day;
   the name box replaced by a named man (no crowd left); the last placeholder taken off; the row cancelled, made
   information only, taken off the programme; **a named man's request with ALL AVAIL under his row — his credit, his
   switch and everyone's on his row exactly as before** (pinned first, against today's behaviour — the checking order's
   §8.7). **The answer rules, both placeholder ids and a named man's beside them:** a No survives a change of hours; a
   Yes survives a change that leaves its amount as it was; a Yes is dropped, and asked again, when the amount changes;
   a change of person voids them.
4. **OIL, the switches — real taps** (`ui/oilmode`): after a No — a tap grants, a second tap clears, the credit follows
   each; after no answer — the same; after a Yes — a tap refuses, a second clears; under the day blanket nothing is
   written; the request's row offers no whole-row switch; the off reason reads the filer's No / "not answered yet",
   never "this kind of event"; a fresh filer answer after a scheduler's switch leaves the switch standing.
5. **The freeze:** published, then a man files leave — the issued day's crowd and credit are as they went out and the
   working copy reads pending; the filer changes his answer after publication — pending, the issued credit kept, the
   sign-offs fallen, gone on reversal or on republication; reload; an issued version reloaded.
6. **The bell and the late holiday:** a holiday declared after filing lights the filer's bell and nobody else's; its tap
   opens the question; answered → off; the filer without the right → no bell, and the List's "OIL?" chip for the admin.
7. **The screens:** the picker (the heading and two entries only for an allowed kind and a man who may; the two
   sentences and their one press); the bar, the tip, the card, the List row; the three filters — Everyone, ALL, ALL
   AVAIL — each in the List, the month and the opened day; the schedule row with its count on the week and the board;
   `→ Unavail` absent and refused; both reassign directions refused; the day panel's "Leave / downchit" total beside a
   real man's absence; no warning raised; the changes window's line and the Undo label.
8. **The kind "Event":** the table's flags and every derived predicate; the type lists; the SC MAIN clash red (and
   Meeting still amber); crew rest; the OIL question; the crowd leaves out a man on an Event; a hand-typed EVENT row;
   `schema.test.ts`; the original's suite and `parity.test.ts` green.
9. **In a real browser (e2e):** file a weekend Duty for ALL AVAIL on a phone and on a desktop, answer the OIL question,
   see it on the schedule with its count, open the window, reload; file an Event for several people.

## 7. The check — FULL
Earned leave, the published record, roles, saved data, a new control, the warning list: every question of the checking
order's §5 but "a new surface". The rules sweep (D27–D52's placeholders, D43, D44–D46, D18, D470, D178, D103, D142,
D654–D660, D682, D700, D702, D711–D714); Astra designs the scenarios; the roll-call of §5; the door check; a walk sized
in writing from `docs/walk-ledger.md` before it starts, on the everything-day at phone and desktop width; the gates;
Astra's and Sol's reads of the code with the evidence sheet in hand; fixes, each a failing test first; the re-walk of
what the fixes touched; his look.

## 8. Nothing is parked
Every product choice is his and made (D700, D702, D711–D714). The technical choices above are the builder's.
**Readings to tell him with the build** (each follows from his rulings; none changes what he chose): (1) an Event filed
for ALL AVAIL clashes with nobody — it stands only for those who are free; a NAMED man's Event clashes as he ruled;
(2) the word EVENT typed on a ground row counts as the kind does (§4); (3) a member who filed an ALL AVAIL input loses
his right to change it, and his bell for it, while members' filing is switched off (§3.4); (4) an admin may turn a filed
input for one man into an ALL AVAIL input, and back, in its own window — the OIL question is then asked again (§3.3);
(5) the Inputs calendar's card does not show how many are free (§3.5).

## 9. What the two readers are asked (see the brief)
Is anything in §3 or §4 wrong against the code or against a ruling; does §3.2 leave any door through which a
placeholder input of a refused kind, of two days, or in a group can be written or restored; is §3.7 safe — can any man
be credited, or lose credit, silently, on a working day or an issued one; does the one default body really reach the
credit, every switch and every sentence; what does §5's roll-call miss; what would you test that §6 does not.

## 10. Where version 1's findings are answered (its §9, both readers')
| Version 1's finding | Here |
|---|---|
| 1. The OIL switches must share the credit's default (both) | §3.7 — one body, `claimDefault`, read by the credit, the switch and the words; §6.3, §6.4 |
| 2. An answer of 0.5 is not a cap (both) | §3.7 "the amount"; §6.3 |
| 3. Each man's right to change his own answer is removed without saying so (both) | his ruling D711 (1); said in §3.1 and §3.7 |
| 4. The save checks miss doors — the List's Add form, the shared save, admins, replays (both) | §3.2 — the hard check on what a command changed, and the sentence at every door, the List's form and the whole group included; §6.1 |
| 5. Reassign refuses one direction only (both) | §3.3; §6.7 |
| 6. An all-day "Fly with" counts the placeholder as one absent man (both) | D712 removes the kind; `dayAway` guarded all the same (§3.8); §6.7 |
| 7. "ALL — everyone" is false; "Everyone" collides with ALL in three places (both) | §3.3 (the heading "Whoever is free that day"); §3.5; §6.7 |
| 8. The bell contradicts itself; a member filer loses the right when the switch goes off (both) | his ruling D711 (4); §3.4, §3.5, §3.7 "Unanswered"; §6.2, §6.6 |
| 9. Parked recommendations were written as approved (Astra) | §8 — nothing is parked; every choice is ruled |
| 10. More tests (Sol) | §6, items 1–7 |

## 11. The second read (9 Oct 26) — both "CLEAN WITH THESE EXACT CHANGES"; each change, and where it went
| The reader's change | Here |
|---|---|
| Astra 1 — the List's pencil editor has a Person list of its own that left both placeholders out (a filed ALL AVAIL input opened showing a real man's name), and its document question came before the refusal | §2.8, §3.2 (asked first, before any sheet), §3.3 (one group for every Person list), §5, §6.1 |
| Astra 2 and Sol 1 — §3.7 overstated today's re-ask rule ("voided … when the day, the hours or the person change") against §3.8's promise to leave named inputs alone | §3.7 "Asked" — the existing `voidedOil` / `oilGate` rules, stated exactly and not changed; §6.3 |
| Sol 2 — a good filing's Undo and Redo do not prove the save boundary refuses during a restore | §6.1 — the restore command with each refused after-image, both ids; `acc` / `ord` / OIL-only changes; a version load and a plan switch |

Both found sound, by tracing the code: the one OIL default (typed men yes, crowd-only men the filer's answer, a man in
both once, the placeholder never credited, 0.5 no cap) and that it reaches the credit and every switch; that an issued
day answers from its own record; that the hard check judges an admin and a restore and leaves a valid record's later
`acc` / order / answer changes alone; Event's flags, the two hand-written twins in `refwin.ts` and the hand-typed-word
ripple; the three-way Everyone / ALL / ALL AVAIL filter repair; and that none of §8's five readings needs a choice of his.
