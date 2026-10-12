# One-rule build, step 8 second pass — a PROPOSED behaviour register (12 Oct 26)

**A proposal. Nothing was changed: `scripts/rulecheck.mjs` is as it was, and no test was touched.** It covers the
rulings of `[ALL-AVAIL-AS-MEMBER]` — D755 with its four parts, D756, D753, D760, D762, D763, D767–D771 — and the
readings R1–R37 of the plan (`../../superpowers/plans/2026-10-11-one-rule-plan.md` §8, §10) that are behaviours.

## How to read it

- **The ids are new: OR1–OR55** ("one rule"). No test contains `OR` followed by a number today, and no other
  register uses the prefix, so none of them can be "named" by accident.
- **`rulecheck` only looks for the id as a word in a test file** (`src/**/*.test.ts(x)`, `e2e/**/*.spec.ts`). So
  every id below is un-named until someone writes it into a test's title — "… (OR7)" — as the group-input register
  did with GI1–GI21; or it goes into `BASELINE` with a reason. The "pinned by" column says WHERE that title already
  is: the test that holds the behaviour today, found by its D-number and by what it asserts.
- **Behaviours an existing id already covers are not given a second one.** GI1–GI21 were rewritten for this build
  (`../../superpowers/specs/2026-10-11-group-input-one-row-behaviour-register.md`, "As each line reads now"): a person
  put on an input's row joins it (GI6), a person added follows the input's one OIL answer (GI7), never late from the
  schedule (GI8), taken off he leaves and the last is refused (GI9), dragged elsewhere or to another input in one step
  (GI10), a typed box (GI12), one row (GI13), the window from the schedule (GI14), the belt (GI15), the published
  counts and their line (GI16–GI18, GI20). GI11 and GI19 stay set aside.
- **"NO TEST FOUND"** means searched for and not found — by the D-number, by the words of the behaviour in every
  test title, and by the function or the on-screen words in the test bodies. What was searched is said beside it.

## The gaps — the short list

| # | The behaviour no test holds | What was found instead |
|---|---|---|
| 1 | **D770 (OR29)** — the only named person beside ALL AVAIL / ALL reads the input and may take himself out, but does NOT change it for everyone | **No test names D770.** The cases that touch it — `src/ui/placeholderdoors.test.tsx` "Ranger and ALL AVAIL, opened by Ranger…" and the three under "STEP 3 — product fault C, reported and left red" — were written before he ruled, to **pass whichever way the window answers** (`if (!$('#inpEditSave')) { readsItRight(); return }`). Give him Save again, with a save that works, and all four still pass. Their comments still call it an open fault. Nothing asserts `mayEditInput` is false for a record of [a member, ALL AVAIL]. |
| 2 | **R24, part of OR33** — the people of a cancelled or information-only input are free again for an ALL AVAIL crowd ELSEWHERE that day | NO TEST FOUND (searched the marks tests, the OIL crowd tests and the Leave War tests for a cancelled input beside another crowd; `inputSilent` is named by no test). The same reading's other halves ARE held: no clash, no crew rest, not a day worked, nobody earns. |
| 3 | **D769, part of OR46** — an ACCESS REQUEST or a BUG REPORT waiting comes before the list, as an OIL question does | NO TEST FOUND for those two. The OIL question first, and the view's own alert first, are held (`src/ui/bellnotices.test.tsx`, `src/ui/bellnotices-scenarios.test.tsx`). |
| 4 | **T21, part of OR9** — one man's Unavailable row of an input of several, `iu:<iid>~<person>`, worked from the SCREEN: his cell typed in, his row armed, a puck dropped on it | The data is held (`setInpField(…, who)` in `src/leavewar/groupwrite.test.ts`; `reassignInput('<iid>~<person>', …)` in the bell's scenarios; the changes window's tap in `src/ui/histjump.test.tsx`). **No test presses the control**: none types into a `data-inp` / `data-ifld` cell whose address carries `~`, none arms or drops on a `data-inpseat` that does; and the one parser, `engine/keys.ts iuParts`, has no test of its own. |
| 5 | **The cancelled look in a real browser (OR37–OR42)** — the tag on one line, the strike stopping before "· accepted", the phone board's short tag, the window's tag beside its title | Held in jsdom only (`src/ui/inputcx.test.tsx`, `inputcx-scenarios.test.tsx`), which has no layout. **No `e2e` file names D767, D768 or D771, or the classes that draw them.** The plan says the same (§10, step 5). |
| 6 | **The bell's list in a real browser (OR46, OR47, OR53)** — 348px under the bell on a desktop, a panel as wide as the screen on a phone, over the Scheduler Board | Held in jsdom only. **No `e2e` file names D769 or the list.** The plan says the same (§10, step 7). |
| 7 | **R22** — the next-week peek draws no counter on ALL AVAIL | NO TEST FOUND for "no counter"; the peek's ORDER is held (`src/ui/grouprow-draw.test.tsx`). Not a behaviour this build made — "it never has, on any row" — so it needs no id; listed so nobody looks for one. |

Smaller, said by the plan itself and still true: a search for a cancel's reason does not find the input (read, not
ruled, not pinned); two notices made in the same instant are ordered by the text of their ids.

## The register

One plain line a behaviour. "Pinned by" = the test file(s) that already hold it, where its id would be written.

### The record, and what reads it

| ID | The behaviour | Ruling | Pinned by |
|---|---|---|---|
| OR1 | An input is ONE stored record with the list of its people, in the order they joined — filed in one step, one Undo; a filing for one person is written the same way | D756, D759 | `src/leavewar/onerecord-write.test.ts`, `src/engine/onerecord.test.ts` |
| OR2 | A record stored in the old shape reads as a one-person input everywhere and never breaks a load; old shared records are each their own input; it is written in the new shape the first time who is in it changes | D756 (2), D759 (10); T6 | `src/engine/onerecord.test.ts`, `src/engine/inputlines.test.ts`, `src/state/inputgroup.test.ts`, `src/ui/barmove.test.tsx` |
| OR3 | What one input may hold is held at the save: at least one person, nobody twice, one placeholder at most, and a medical entry, an upchit or a Personal input is one person's | D755 (4), D753, D655 (4) | `src/engine/onerecord.test.ts`, `src/leavewar/onerecord-write.test.ts` |
| OR4 | The rules about ONE MAN'S day read one line a named person — a frozen view, none for a placeholder — and on a published day the lines of the copies it went out with; every file that reaches the inputs is on one of three lists | D756; T10, T11 | `src/engine/inputlines.test.ts`, `src/engine/inputs-readers.test.ts` |
| OR5 | Two routes to the same people end the same: the same input, row, card, bar, OIL claim and crowd, and the same count on a published day | D755 reading (a); T1 | `src/ui/phmember.test.tsx` |
| OR6 | A row made before the build is re-made once, whole, at its first read: whoever — and whatever mark — a scheduler had put on the ROW alone comes off it | R6, R23 | `src/ui/reqdoor.test.tsx`, `src/ui/inputmarks.test.tsx` |

### The hands on an input's row (beside GI6, GI9, GI10, GI12, GI15)

| ID | The behaviour | Ruling | Pinned by |
|---|---|---|---|
| OR7 | A person put on the puck of the input's ONLY person replaces him: the input is the new person's, whoever did it is now who filed it, and the OIL answer is void and asked again; dragged from a seat the two swap in one step, and a seat that refuses the man replaced refuses both; where the row holds several he joins | D755 (2); R1, R9, R14; T15 | `src/ui/reqdoor.test.tsx`, `src/ui/inputmarks-scenarios.test.tsx` |
| OR8 | A drop or a save that cannot apply is refused with its reason and nothing changes: already in it; a second ALL AVAIL, or ALL beside it; ALL AVAIL on an input longer than a day or not one of the six kinds; anyone beside the person of a Personal input; a second person on a medical entry or an upchit | D755 (4), D753, D271 | `src/ui/phmember.test.tsx`, `src/engine/phmember.test.ts`, `src/ui/reqdoor.test.tsx`, `src/leavewar/onerecord-write.test.ts` |
| OR9 | On the Unavailable list one man's row of an input of several has an address of its own; a tap in the changes window lands on it, and a puck dropped on it replaces THAT man in the input — the input, its time and its filing staying everyone's | D737, D759 (4); T21 | `src/ui/histjump.test.tsx`, `src/ui/bellnotices-scenarios.test.tsx`, `src/leavewar/groupwrite.test.ts` — **in part: gap 4** |

### ALL AVAIL / ALL as one of the people

| ID | The behaviour | Ruling | Pinned by |
|---|---|---|---|
| OR10 | ALL AVAIL / ALL is one of an input's own people: put anywhere on the row it joins and never replaces anyone; a named person put on its puck joins beside it; taken off it leaves; it stays when anyone else leaves; alone it is the last | D750, D753, D755, D757 | `src/ui/phmember.test.tsx`, `src/ui/reqdoor.test.tsx`, `src/ui/placeholderdoors.test.tsx` |
| OR11 | "Several people" offers the two as pucks of their own — one of them, never both — greyed with the reason where the input runs longer than a day or is not one of the six kinds; never for an input under Unavailable | D753 (2), D750 | `src/ui/phpick.test.tsx`, `src/engine/phmember.test.ts`, `src/engine/placeholderinput.test.ts`, `e2e/input-allavail.spec.ts` |
| OR12 | The men behind it follow the input's one OIL answer; a man NAMED in the input is not in its crowd and earns once; the scheduler may still switch any one man | D753, D762; T3 | `src/ui/phmember.test.tsx`, `src/engine/oilclaimcrowd.test.ts`, `src/engine/oilplaceholderclaim.test.ts` |
| OR13 | Taking ALL AVAIL off ends the switch-offs made for the men behind it — dropped back, it starts fresh; a named person leaving does not touch them; a switch-off about a person ends when he leaves the input, also where he then stands behind its ALL AVAIL | R13, R20; T17 | `src/ui/phmember.test.tsx`, `src/engine/oilclaimcrowd.test.ts`, `src/engine/onerecord.test.ts` |
| OR14 | How many an input holds, in words: the people are counted and ALL AVAIL is said beside them — "2 people and ALL AVAIL" — on every sentence that counts | D702 (step 3's look) | `src/ui/phmember.test.tsx`, `src/ui/reqdoor.test.tsx` |

### OIL — one answer an input (beside GI7)

| ID | The behaviour | Ruling | Pinned by |
|---|---|---|---|
| OR15 | An input has ONE OIL answer, for everyone in it: a Yes earns for every person, a No or no answer for none — one claim an input | D762, D755 (1) | `src/engine/onerecord.test.ts`, `src/leavewar/onerecord-write.test.ts`, `src/engine/oilev.test.ts`, `src/engine/oilnamebox.test.ts` |
| OR16 | Whoever filed it, or an admin, gives the answer; nobody in it gives one of his own: the window's OIL line states the one answer, its buttons only for whoever may change the input; no "Your OIL" line; no OIL chip on the List's row of an input of several | D762 (2), (5); R3 | `src/ui/groupeditor.test.tsx`, `src/ui/batch2.test.tsx`, `src/ui/windowreads.test.tsx`, `src/ui/sharedline.test.tsx` |
| OR17 | Only the scheduler leaves one person out, in OIL Earn on the day: the row has one OIL address, and each puck is its own switch under it | D762 | `src/ui/oilclaimrow.test.tsx`, `src/engine/onerecord.test.ts` |
| OR18 | An unanswered question goes to the filer's bell and only his; when the filer leaves, "who filed it" passes on — to the scheduler who took him out, or to whoever put in the newest person not his own — so the question still reaches someone who can answer | D762 (3), D759 (7); T19 | `src/leavewar/onerecord-write.test.ts`, `src/leavewar/onerecord-perms.test.ts` |
| OR19 | The OIL question opened by putting a person on an input's row on the schedule closes its dialog with the sheet, answered or not — unanswered, it waits on the filer's bell | R18 | `src/ui/groupeditor.test.tsx` |
| OR20 | A day that went out before the build keeps the OIL it went out with — its old one-person claims are still read as they were | D48, D142; T4 | `src/engine/oilev.test.ts`, `src/engine/oilplaceholderclaim.test.ts`, `src/engine/onerecord.test.ts` |

### Who may

| ID | The behaviour | Ruling | Pinned by |
|---|---|---|---|
| OR21 | The input's ONLY person — nobody and nothing beside him — changes it in full, whoever filed it: re-time, re-word, answer OIL, delete | D655, D763 (2); T13 | `src/leavewar/onerecord-perms.test.ts`, `src/leavewar/onerecord-write.test.ts` |
| OR22 | Its filer changes it for everyone while everyone else in it was put in by him; once a scheduler has put someone in, changing it for everyone is the scheduler's — and the refusal says so | D755 (3); R7 | `src/leavewar/onerecord-perms.test.ts`, `src/leavewar/groupwrite.test.ts` |
| OR23 | Anyone in an input may always take himself out — and his own Undo puts him back, wherever the input's row stands | D755 (3), D763; T14 | `src/leavewar/onerecord-write.test.ts`, `src/ui/groupeditor.test.tsx`, `src/ui/bellnotices-scenarios.test.tsx`, `src/ui/placeholderdoors.test.tsx` |
| OR24 | A person in an input he did not file adds nobody — a placeholder neither — by the window, by any hand on the schedule, or past them at the save | D763 | `src/leavewar/onerecord-perms.test.ts`, `src/leavewar/groupinput.test.ts`, `src/ui/groupeditor.test.tsx`, `src/ui/phmember.test.tsx`, `src/ui/reqdoor.test.tsx` |
| OR25 | The one person of an input who adds people to it is who filed it from then on, whoever filed it for him | R15; D763 (2) | `src/leavewar/groupinput.test.ts` |
| OR26 | A member never hands an input someone filed for him to another person — "Only a scheduler can move an input to another person" | R16 | `src/leavewar/groupinput.test.ts` |
| OR27 | A person the input's own window adds after the cut-off reads late — he alone; the input's own late date and everyone else's are untouched; a person taken off marks nobody late | R17 | `src/leavewar/groupwrite.test.ts` |
| OR28 | Nobody's place in an input is forged: a member's save names HIM as who put a person in, and leaves every other person's entry exactly as it was | the plan §4.9 | `src/leavewar/onerecord-perms.test.ts`, `src/leavewar/groupinput.test.ts` |
| OR29 | The only named person beside ALL AVAIL / ALL reads the input and may take himself out, but does not change it for everyone — whoever filed it, or a scheduler, does | D770; R19 | **NO TEST FOUND that holds it — gap 1** |

### The scheduler's marks are the input's

| ID | The behaviour | Ruling | Pinned by |
|---|---|---|---|
| OR30 | A CX on a row that came from an input cancels the INPUT, with its reason; the red box and "information only" are the input's too — each press one step, one Undo; a row the scheduler made himself keeps its marks as before | D760, D760 (5) | `src/ui/inputmarks.test.tsx`, `src/ui/inputmarks-scenarios.test.tsx`, `src/ui/reqdoor.test.tsx` |
| OR31 | The marks go where the input goes — to another day, to another week, off the programme and back — and nothing stays behind | D760 (changes D468) | `src/ui/inputmarks.test.tsx`, `src/ui/inputmarks-scenarios.test.tsx` |
| OR32 | Only a scheduler sets or clears a mark: a member's press does nothing and his save is refused, on his own input too; what his cancelled input SAYS is still his to change; his Undo never takes a scheduler's CX off | D760 (2) | `src/ui/inputmarks.test.tsx`, `src/ui/inputmarks-scenarios.test.tsx` |
| OR33 | A cancelled or information-only input is silent: nobody in it or behind it earns OIL — on every day it covers, wherever it is filed; it raises no clash and no crew-rest warning, on the day, on a published face and across the week's edge; it is not a day worked for the seven-day run; its people are free for another ALL AVAIL crowd | D760 (1); R24, R25 | `src/ui/inputmarks.test.tsx`, `src/ui/inputmarks-scenarios.test.tsx`, `src/engine/oilev.test.ts` — **the last clause: gap 2** |
| OR34 | On a published day a CX put on or taken off is ONE change waiting; put on and taken off again — or cancelled again with the same reason — is nothing; a several-day input reads it on every published day it covers; "Discard" does not take it off | D760 (3); R10, R26; T20 | `src/ui/inputmarks.test.tsx`, `src/ui/inputmarks-scenarios.test.tsx` |
| OR35 | What waits to go out says the mark in a row's own words — "not cancelled → CX (WX)", "flagged", "info only" | D760 (3), D99 | `src/ui/inputcx-scenarios.test.tsx` |
| OR36 | The change history carries the input's own line for each mark; a CX with no reason reads "cancelled", never a dangling dash | the plan §4.4 | `src/ui/inputmarks-scenarios.test.tsx` |

### A cancelled input's look

| ID | The behaviour | Ruling | Pinned by |
|---|---|---|---|
| OR37 | On the card and the List's row: a small red CX tag before the title, the title struck through, the reason after it in red; the names, the kind, LATE, the hours and "By" unchanged; no reason typed — the tag alone; no title of its own — its kind's name struck | D767 (1), (2), (4); R27 | `src/ui/inputcx.test.tsx`, `src/ui/inputcx-scenarios.test.tsx`, `src/ui/inputcard-model.test.ts` — jsdom only: gap 5 |
| OR38 | On the month's bar: its words struck through and the bar faded — no tag, no reason | D767 | `src/ui/inputcx.test.tsx`, `src/ui/inputcx-scenarios.test.tsx` — jsdom only: gap 5 |
| OR39 | It keeps its place in the day's order — never sorted last, on a phone or a desktop | D768 | `src/ui/inputcx.test.tsx`, `src/ui/inputcx-scenarios.test.tsx` |
| OR40 | On the schedule's own line — under Personal Inputs, and on the Unavailable list — the schedule's red tag with its reason in it, before the name, and the name struck; the line itself is not struck or faded | D767 (3); R28, R29, R30 | `src/ui/inputcx.test.tsx`, `src/ui/inputmarks-scenarios.test.tsx`, `src/ui/inputcx-scenarios.test.tsx` — jsdom only: gap 5 |
| OR41 | A cancelled input stays listed and counted — it is not removed | D760; R8 | `src/ui/inputcx.test.tsx` |
| OR42 | Its own window says it is cancelled — the same tag and red reason beside the title, for every reader — and nothing in the window cancels it or brings it back | D771 | `src/ui/inputcx.test.tsx` — jsdom only: gap 5 |

### The bell tells him

| ID | The behaviour | Ruling | Pinned by |
|---|---|---|---|
| OR43 | Who is told: every named person in the input before or after the change, and whoever filed it; never whoever made the change, never the men behind ALL AVAIL, never a man archived or deleted | D755 (3), D757; R35 | `src/ui/bellnotices.test.tsx`, `src/ui/bellnotices-scenarios.test.tsx` |
| OR44 | What tells, in its words: You were added · You were taken off · Tally added · ALL AVAIL taken off · Deleted · Cancelled — WX · Un-cancelled · Taken off the programme · Back on the programme · Now 10:00–11:00 · Renamed · Remark changed. The red box, "information only", an OIL answer and a save that changes nothing tell nobody | D755 (3), D760; R33, R37 | `src/ui/bellnotices.test.tsx`, `src/ui/bellnotices-scenarios.test.tsx` |
| OR45 | He is told ONCE for one save, however much it changed — what touches him first | R32 | `src/ui/bellnotices.test.tsx` |
| OR46 | An unread notice lights the bell; a tap still goes straight to an OIL question, an access request or a bug report where one waits, and opens the list otherwise; a line leads with the input in bold and its date, then what happened and who, its age at the right | D769 | `src/ui/bellnotices.test.tsx`, `src/ui/bellnotices-scenarios.test.tsx` — **the access request and the bug report: gap 3; the look: gap 6** |
| OR47 | A tap on a line opens the input and marks that line read — "That input is gone" where it was deleted; "Mark all read" while any is unread; a read line stays in the list, quiet; the list is his newest thirty; "Nothing new" only when he has none | D769; R34 | `src/ui/bellnotices.test.tsx`, `src/ui/bellnotices-scenarios.test.tsx` |
| OR48 | What he has read is his own record — never an Undo step, kept across a reload, never another person's; the maker's Undo takes the notices his change made away with it, his Redo puts them back unread, and nobody is told "it was undone" | R11; T18 | `src/ui/bellnotices.test.tsx`, `src/ui/bellnotices-scenarios.test.tsx` |
| OR49 | When the app itself takes a man out — a delete, a posting on its date or dated today — the others in his inputs are told he was taken off, with no name after it; he is told nothing | R12 | `src/ui/bellnotices-scenarios.test.tsx` |
| OR50 | A member's save may make a notice only beside its own change to that input, naming himself, addressed to someone else; only his own Undo removes one; nobody rewrites one | the plan §4.10; D200 | `src/ui/bellnotices.test.tsx`, `src/ui/bellnotices-scenarios.test.tsx`, `src/state/perms.test.ts`, `src/leavewar/onerecord-perms.test.ts` |
| OR51 | What is nobody's act tells nobody: another week loaded, a day published or amended, a version loaded back, a day template applied; a leave the Leave War approves lights no bell — a later change to it by someone else does | R36 | `src/ui/bellnotices-scenarios.test.tsx` |
| OR52 | A man given an input of his own out of a shared one — a time typed on his Unavailable row, sick leave cutting his part — is told what changed for HIM, once; the others are told he was taken off | the plan §10 step 7 (5) | `src/ui/bellnotices-scenarios.test.tsx` |
| OR53 | The list closes on a press outside it, on Escape, on a second tap of the bell and at a sign-out; the Scheduler Board's bell and the top bar's are one list | D769 | `src/ui/bellnotices.test.tsx`, `src/ui/bellnotices-scenarios.test.tsx` — the look: gap 6 |

### A published day (beside GI16–GI18, GI20)

| ID | The behaviour | Ruling | Pinned by |
|---|---|---|---|
| OR54 | A person or ALL AVAIL dragged from one input's row to another's on the same day is ONE change waiting, said as a move; one person out of one input and ANOTHER into a second is two | D109 (R21, withdrawn and corrected) | `src/ui/phmember.test.tsx` |
| OR55 | The men behind ALL AVAIL ride on the input's own change: ALL AVAIL put in or taken out is one, a man added to an input that carries it is one — never a second "what this day earns" line, on a weekday or a day that earns | D736; T16 | `src/ui/phmember.test.tsx`, `src/state/inputcount.test.ts`, `src/ui/pendcrowd-request.test.ts` |

## Each ruling and each reading, and where it went

| Ruling / reading | Its line(s) |
|---|---|
| D755 — a row that came from an input is the input | GI6, GI9, GI10, GI12, GI13, GI15 (as rewritten); OR5, OR6 |
| D755 (1) — one OIL answer; a person added follows it | GI7; OR15 |
| D755 (2) — the swap | OR7 |
| D755 (3) — the bell; take himself out; the scheduler's once he has added others | OR22, OR23, OR43–OR53 |
| D755 (4) — a drop that cannot apply is refused with its reason | OR3, OR8 |
| D756 (with D759) — one record | OR1, OR2, OR4 |
| D753 — ALL AVAIL / ALL as one of the people | OR10, OR11, OR12 |
| D760 — the scheduler's marks | OR30–OR36, OR41 |
| D762 — one OIL answer | OR15–OR19 |
| D763 — who is in it is changed by the filer or a scheduler | OR23, OR24, OR25 |
| D767 | OR37, OR38, OR40 |
| D768 | OR39 |
| D769 | OR46, OR47, OR53 |
| D770 | OR29 — **no test** |
| D771 | OR42 |
| R1, R9, R14 | OR7 |
| R2 | GI16 (a swap of the only person is one) |
| R3 | OR16 |
| R5 | GI12; OR9, OR52 |
| R6, R23 | OR6 |
| R7 | OR22 |
| R8 | OR41 (its wording — "struck through with its reason" — was replaced by D767: OR37) |
| R10, R26 | OR34 |
| R11 | OR48 |
| R12 | OR49 |
| R13, R20 | OR13 |
| R15 | OR25 |
| R16 | OR26 |
| R17 | OR27 |
| R18 | OR19 |
| R19 | OR29 (ruled: D770) |
| R21 | withdrawn; what replaced it is OR54 |
| R22 | not a behaviour of this build — gap 7 |
| R24, R25 | OR33 |
| R27 | OR37 |
| R28, R29, R30 | OR40 |
| R31 | overtaken by D771 — OR42 |
| R32 | OR45 |
| R33, R37 | OR44 |
| R34 | OR47 |
| R35 | OR43 |
| R36 | OR51 |
| (R4 became Q1 → D763) | OR24 |

Not in this list by the brief: D772 and D773 (the Inputs export). D773 — the button and its file removed — is named
by `src/ui/export.test.ts`, `src/ui/inputs.test.tsx` and four more.

## What it would take to make this the register of record

1. Move this file to `docs/superpowers/specs/2026-10-12-one-rule-behaviour-register.md`, linked from the backlog item
   and from the plan's §10 (step 8).
2. Add OR1–OR55 to `RULES` in `scripts/rulecheck.mjs`, each with its short reminder.
3. Write each id into the title of the test that holds it (the "pinned by" column) — a comment-only change to a
   test's name, no assertion touched.
4. For gap 1 (D770): one strict case — a member who is the only named person beside ALL AVAIL has no Save and no
   Delete, is told who can change it, has "Take me out", and a hand-made save is refused — and the "fault C" cases
   and their comments brought up to date. For gaps 2 and 3: one case each. Gaps 4 to 6 are the walk's or a browser
   test's. Until they exist, OR29 would be the one id that belongs in `BASELINE`, with this reason.
