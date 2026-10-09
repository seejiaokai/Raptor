# Bug check — an input filed for ALL AVAIL / ALL, and the new input kind "Event"

**Branch `claude/day-window-compact`** (not merged — his word: "No merge"). Built and checked 9 Oct 26 as ONE batch with
ONE check (D485). Host and builder: Opus 5.5. The plan (`docs/superpowers/plans/2026-10-09-input-all-avail-plan.md`,
version 2) was read by Astra and by Sol 6.1, each blind, before the build: both "CLEAN WITH THESE EXACT CHANGES". Scenario
design: Astra. Code reads: Astra and Sol 6.1, each blind (D590).

**STATE OF THIS SHEET: the walk is done and recorded (§5); the gates, the two code reads and his look card (§6–§8) are
filled as each is done. A section that says "to do" has not been done.**

## 0. Questions waiting for him

None. Every product choice is his and made (D700, D702, D711–D714). **Five readings to tell him with the build** — each
follows from his rulings; none changes what he chose:
1. An Event filed for ALL AVAIL clashes with nobody — it stands only for those who are free. A NAMED man's Event clashes
   red across a standby shift, as he ruled (D714).
2. The word EVENT typed as the name of a ground row now clashes red across a standby shift too, as TRAINING, DUTY,
   PERSONAL, APPOINTMENT and OTHER already do — the typed word follows the kind.
3. A member who filed an ALL AVAIL input loses his right to change it, and his bell for it, while "members filing for
   other people" is switched off — as for anything he files for others.
4. An admin may turn a filed input for one man into an ALL AVAIL input, and back, in its own window; the OIL question is
   then asked again.
5. The Inputs calendar's card does not show how many people are free; the schedule's puck and its window do.

## 1. The tier, and what it meant

**Tier: FULL.** The eight questions of the checking order's §5:
| # | Question | Answer | Why |
|---|---|---|---|
| 1 | Money / earned leave | YES | who earns OIL from an ALL AVAIL input, and the default each man's switch starts from |
| 2 | The published record | YES | the filer's answer and the crowd are frozen at publication; a later change reads pending |
| 3 | Saved data | YES | an input's person may now be a placeholder; a new kind is stored |
| 4 | A shared drawer | YES | an input's person is drawn by about twenty places |
| 5 | A new gesture or mode | YES | two new entries in every Person list; a new one-press correction in the picker |
| 6 | A new surface | NO | no new screen, window or kind of row — the request row and the ALL AVAIL window exist (D46, D38) |
| 7 | Roles | YES | who may file, change, delete and answer; the members' switch |
| 8 | The warning list | YES | Event clashes red across a standby shift; a typed EVENT row does too |

**So:** the rules sweep (§2); Astra designs the scenarios; the roll-call (§3); the door check; a walk sized in §4; the
gates; Astra's and Sol's blind reads of the code with this sheet; fixes, each a failing test first; a re-walk of what the
fixes touched; his look.

## 2. The rulings that apply, each checked against the running build

*"Checked how" and "Result" are filled by the walk and the tests; a row not yet checked says so.*

| Ruling | What it says | Checked how | Result |
|---|---|---|---|
| D700 | an input can be filed for ALL or ALL AVAIL — duties and other commitments only | host H1–H3; walker A S28–S30; `placeholderinput.test.ts` | PASS |
| D702 | it stands for whoever is free, live; members may choose it; on the day and the schedule only; the filer answers OIL once | host H7–H8, M1; walkers B S39, C S11; `oilplaceholderclaim.test.ts` | PASS |
| D711 (1) | the filer's one answer; the scheduler switches any one man; no answer of a man's own | host H10, H11; walker B S7–S9, S24; `ui/oilplaceholderclaim.test.tsx` | PASS (W2, W3 fixed) |
| D711 (2), D712 | not for an overseas duty, a course, "Fly with" or "Personal" | walker A S29 (17 kinds, four doors); `placeholderdoors.test.tsx` | PASS |
| D711 (3) | one day at a time | walker A S30; e2e; `placeholderdoors.test.tsx`, `placeholderlist.test.tsx` | PASS |
| D711 (4) | an unanswered OIL question goes to the filer's bell, and only his | walkers A S17, S18, C S15; `placeholderdoors.test.tsx` | PASS |
| D713 | Event: asks OIL, clashes, shows on the Inputs calendar and lands on the schedule; for ALL AVAIL, ALL or several | host H15; walkers A S45, S49, B S43, S47; `eventkind.test.ts` | PASS |
| D714 | Event clashes red, not Meeting's amber; no "count me in / out" | walker B S46, S48; `eventkind.test.ts` | PASS |
| D18, D470 | a man the scheduler types onto a request's row earns from it | walker B S8, S22; `oilplaceholderclaim.test.ts` | PASS |
| D28, D43 | every seat can earn; the admin can always override; a placeholder is on by default wherever it lands | host H10, H11; walker B S7, S9 | PASS |
| D46 | a placeholder dropped on a NAMED man's request row credits by default — unchanged | walker B S24; `oilclaimcrowd.test.ts` (untouched) | PASS |
| D44, D45, D142 | the crowd and the OIL are frozen at publication; a later change reads pending; OIL from the latest published version | walker C S4, S10, S11, S56 | PASS |
| D103, D178 | any pending change takes the sign-offs down; an input change after publication is pending | walker C S10–S14 | PASS after W7 (a taken-off request on a weekend) |
| D27, D33, D36, D37, D52, D327 | where placeholders land, who counts as free, the count shown wherever the puck lands | walkers B S42, S54, C S20 | PASS after W8 (an archived crowd man) |
| D38–D41, D65, D66 | the ALL AVAIL window | walker B S40, S41; host H8, P3 | PASS |
| D654–D660, D682 | one input for several people; who files for others; the filer answers for all | walker A S49, S50 | PASS |
| D200 | who may do what is decided in ONE place, tested against the permissions table | `perms.test.ts`, `perms-scan.test.ts` (in the gate run, §7); §11's `Input` row gained the placeholder note | PASS |
| D56 | a problem only in stored demo data is not a finding | every reviewer's brief says so | HELD |

## 3. The roll-call — every place an input's person or kind is drawn, written or read

*Each row gets YES / NO-because / MISSING in each column once it has been SEEN and OPERATED in the running build. "to
walk" = not yet.*

### 3a. An input whose person is a placeholder
| # | Place | Shows it right | Usable there | Painted over / beside | Proof |
|---|---|---|---|---|---|
| 1 | The editor window — a new input: the Person list | YES | YES | a group heading of its own, above the names | host H1, P1; e2e |
| 2 | The editor window — "Several people" | NO-because: a placeholder is filed on its own — the picker says so, with the one press back | YES (the refusal) | — | walker A S28; `placeholderdoors` |
| 3 | The editor window — an input already filed (admin; its member filer; another member, read only) | YES (after W5: the read-only line names the filer) | YES | — | host M2; walker A S18, S50 |
| 4 | The board's Add / edit dialog (plain Person list) | YES by the one shared group | NOT WALKED (carried by reading — §5.3) | — | — |
| 5 | The SANS calendar's "+ Commitment" picker | NO-because: SANS availability is a man's own offer | — | — | `peoplepick.test.tsx`; walker A S53 |
| 6 | The Inputs List — its Add form | YES | YES | — | walker A S29, S30; `placeholderlist` |
| 7 | The Inputs List — the row, its sort and search | YES | YES | the LATE mark beside it, as for any input | host H5; walker A S36 |
| 8 | The Inputs List — its pencil editor | YES (the box opens on the placeholder) | YES | — | host H6; walker A S1, S2 |
| 9 | The Inputs List — the person filter (Everyone / ALL / ALL AVAIL) and the summary chip | YES | YES | — | host H5; walker A S35 |
| 10 | The Inputs List — the "OIL?" chip | YES | YES | — | walker A S18 |
| 11 | The Inputs month — the bar and its tip | YES ("ALL AVAIL · Duty"; a phone's narrow bar shows the name, the kind in its tip) | YES | — | host H3, P2; walker A S37 |
| 12 | The Inputs month — a drag of the bar to another day / over a second day | YES | YES (a move; no stretch gesture exists) | — | walker A S30 |
| 13 | The opened day — the card, its small print, its filter | YES — the name as words, as for a man (not a puck: §5.3) | YES | — | host H4; walker A S37 |
| 14 | The bell (the filer's; nobody else's) | YES | YES | — | walkers A S17, C S15 |
| 15 | The schedule's request row — Edit Schedule's week | YES | YES | the count beside the puck | host H7, H8 |
| 16 | The schedule's request row — the Scheduler Board | YES | YES | the count; the OIL Earn bar | host H9–H11; walker B S39 |
| 17 | The schedule's request row — View-only Sched (a member, a guest) | YES | read only, as it must be | — | walker C S51 |
| 18 | The count chip and the ALL AVAIL window — "Who's available" | YES | YES | — | host H8, P3; walker B S40, S41 |
| 19 | The ALL AVAIL window — "Who earns OIL" (after Yes / No / no answer) | YES | YES | the hint at its foot | host H10, H11; walker B S7–S9 |
| 20 | OIL Earn — the row's name (no whole-row switch) and a typed man's puck | YES (after W2, W3) | YES | — | host H9; walker B S8 |
| 21 | Personal Inputs on the week and the board (the echo; Accept / Undo; no "→ Unavail") | YES | YES | — | host H13; walker B S32 |
| 22 | Unavailable (never there) | NO-because: Unavailable names a real person's day — refused, and the button is not drawn | — | — | host H13; walker B S32; `placeholderdoors` |
| 23 | A published day — the issued face, "N pending", the sign-offs | YES (after W7, W8) | YES | — | walker C S4, S10–S14, S20 |
| 24 | The changes window, the pending list, the Undo / Redo label | YES — "ALL AVAIL · Duty" in the history; the Undo label is the app's general one (filed) | YES | — | host H14; walkers A S3, C S10 |
| 25 | The day panel's "Leave / downchit" total; the warning list (no warning) | YES — never counted, no warning | — | — | host H12; walker B S43; `placeholderdoors` |
| 26 | The OIL tracker / the Leave War's credit (who was credited) | YES — the men behind it, never the placeholder | read on the Leave War grid after a publish | — | walkers B S7–S27, C S10 |
| 27 | Print / export | NO-because: the printed page and the CSV draw flying lines only (older; §5.3) — the Inputs List's own export keeps the placeholder's name | — | — | walkers A S36, C S52 |
| 28 | The Leave War grid (nothing shown) | NO-because: the Leave War shows leave, medical, courses and overseas duty only | — | — | walker A S53 |

### 3b. The kind "Event"
| # | Place | Shows it right | Usable there | Proof |
|---|---|---|---|---|
| E1 | The type list — the editor, the board dialog, the List's form, the List's pencil editor | YES | YES | host H15; walker A S45 |
| E2 | The type filter; the "?" legend; the Logic page's type table | YES | YES | host H15; walker A S45 |
| E3 | The month's bar, the opened day's card, the List row | YES | YES | walker A S45; e2e |
| E4 | The Ground Programme row (week, board, View-only Sched), Accept / Undo | YES on the week, the board and View-only Sched; NO on print (flying lines only — older) | YES | host H15; walker B S43 |
| E5 | The warning list — red across an SC MAIN shift; crew rest | YES | — | walker B S46, S47; `eventkind.test.ts` |
| E6 | The OIL question on a weekend; the credit | YES | YES | walker A S49 |
| E7 | A man on an Event is not in an ALL AVAIL crowd for its hours | YES | — | walker B S43 |
| E8 | A hand-typed ground row named EVENT | YES | — | walker B S48 |
| E9 | An Event for several people; an Event for ALL / ALL AVAIL | YES | YES | walker A S49, S50; e2e |

### 3c. The doors — every action the data allows, and the control that does it
| Action | Control | Result |
|---|---|---|
| File for ALL AVAIL / ALL | the Person list's two entries (editor, board dialog, List form) | walked — a working control in every case (§5.1, §5.2) |
| Answer its OIL question | the question at the save; the bell (filer); the List's "OIL?" chip (admin); the editor's "Change…" | walked — a working control in every case (§5.1, §5.2) |
| Switch one man | OIL Earn → the row's count → the window → his puck | walked — a working control in every case (§5.1, §5.2) |
| Change its day / hours / kind / remark | its window; the List's pencil; a drag of its bar; the time cells | walked — a working control in every case (§5.1, §5.2) |
| Change who it is for (admin) | its window / the pencil — never a drag onto it on the schedule | walked — a working control in every case (§5.1, §5.2) |
| Take it off the programme / put it back | Personal Inputs: Undo / Accept — never "→ Unavail" | walked — a working control in every case (§5.1, §5.2) |
| Delete it | its window; the opened day's card; the List | walked — a working control in every case (§5.1, §5.2) |
| Refuse a wrong kind / two days / a group | the picker's line and one press; the Save's sentence; the save boundary | walked — a working control in every case (§5.1, §5.2) |

## 4. Sizing the walk (D607 — the order's §7.0)

1. **The type of change.** D (an input's person is drawn in about twenty places, each by its own code — the leading
   type), C (two new entries in a list, a one-press correction), A (one shared OIL calculation), G (publication, undo, a
   reload), H (admin, member filer, another member, guest), and a new row of a shared table (Event — A and D).
2. **What only a walk could find here.** A Person list that still draws a real man's name over a placeholder input (one
   was found by reading — the List's pencil editor); a screen that prints the raw id, nothing, or a puck where a name
   belongs; the count chip or the window missing on one of the three schedule faces; the OIL question or the bell not
   reaching the placeholder input; a phone layout broken by the longer option list; the pending count after
   publication; each role's own face. What the tests and reads already carry: the three structural rules at every door
   and at the save boundary (`placeholderdoors.test.tsx`, `placeholderlist.test.tsx` — through the app's real controls
   for the editor, the List's form and its pencil; by direct command for the boundary); the OIL arithmetic and the
   switches' direction (`oilplaceholderclaim.test.ts` — the calculation directly; `oilplaceholderclaim.test.tsx` — real
   taps in the window); Event's derived rules (`eventkind.test.ts` — the calculation directly).
3. **What the ledger says.** Leading type D: ten walks, ten found a real fault (57 in the change). C: 8 of 15. G: 4 of
   7. H: 2 of 2. A: 5 of 9, but only 2 faults in the change. The last two checks on this branch family were the host's
   own scripted walks; each time the blind code reads then found faults in ORDERS OF ACTION the walk had not taken, and
   in the calendar check a walker had SEEN a fault the host set aside.
4. **The walk chosen.** MEDIUM: the HOST drives every roll-call row of §3 by script on the built bundle, through the
   app's own controls, at phone 390×844 and desktop 1440×900, as admin, member filer, another member and guest — and
   opens the pictures; TWO Sonnet 5.5 walkers each take half of Astra's scenario list (one the Inputs page side, one
   the schedule / OIL / published side), each in its own world, returning pictures and a filled table; the host
   reproduces every finding before it counts. Carried by a test, not walked: the repeated refused kinds (twelve kinds ×
   two placeholders — `placeholderinput.test.ts` proves the one body; the walk drives ONE refused kind per door); the
   restore refused at the boundary (`placeholderlist.test.tsx`, by direct command — no screen offers that route).
5. **After the walk:** its row is added to `docs/walk-ledger.md`.

## 5. The walk

**Sizing looked at again before it started (the order's §7.0):** Astra's list came back with 56 scenarios, thirteen of
them whole publication orders — more than two walkers' halves. THREE Sonnet 5.5 walkers, not two, each on a frozen copy
of the build (`dist-fix`, made from commit `0ed09ea5`; ports 4231–4233): A — the Inputs page side (22 scenarios);
B — the OIL switches and the schedule's own screens (21); C — everything around publishing a day (13). The lock on his
PC was held for the walk.

### 5.1 The host's own walk — `scripts/handpass/aa-host-walk.mjs`, the built bundle, the app's own controls
Twenty steps: a desktop 1440×900 as the admin (15), a desktop as a member (2), a phone 390×844 by touch (3).
**Final run: 20 of 20 PASS; no console or page error.** Pictures: `docs/img/handpass/2026-10-09-all-avail-event-check/host/`
(22; opened by the host: `h3-month-bar`, `h11-availwin-oil-no`, `p1-phone-editor`, and those behind each first-run FAIL).
The first run was 11 of 20: all nine misses were the SCRIPT's (it pressed a date whose day window was already open; it
read the List inside its default two-month window; it looked for the board under the wrong id; Personal Inputs is
folded until opened) — each was looked at on its picture before being called the script's, and none was the app's.

| Step | What was pressed | What the screen said |
|---|---|---|
| H1 | "+ Input" on Sat 18 Jul, kind Duty | the Person list opens with a group "Whoever is free that day": ALL AVAIL, ALL — above the names |
| H2 | ALL AVAIL, Save | the OIL question, titled "OIL — ALL AVAIL, Duty", asked once; Yes → ONE record, no group, filed by Saber |
| H3 | — | ONE bar on Sat 18 "ALL AVAIL · Duty"; its tip "ALL AVAIL · Duty · 18 Jul · 06:00–18:00 / Placed by Saber for ALL AVAIL · 9 Oct 26" |
| H4 | the opened day | the card: "ALL AVAIL  Duty … hangar clean … Saber for ALL AVAIL · 9 Oct, 16:09" (the name as words; no puck on a card, as for a man) |
| H5 | the List, all dates, the person filter | Everyone / ALL AVAIL / ALL are the first three choices; "ALL AVAIL" lists the two ALL AVAIL inputs and nothing else; the chip reads "ALL AVAIL" |
| H6 | the List's pencil | its Person box shows "ALL AVAIL"; saved unchanged it is still ALL AVAIL's |
| H7 | Edit Schedule's week | Saturday's Ground Programme: "DUTY 06:00 18:00 [ALL AVAIL] 45 … hangar clean"; the count says "All 45 earn a full day — tap to see each one (who is free as things stand now)" |
| H8 | the count | the window: 45 pucks, pilots and WSOs |
| H9 | the Scheduler Board, OIL Earn on | the same row; its name offers no switch and says "This request follows the answer of whoever filed it — tap the count to switch one person"; no man's switch on the row |
| H10 | "Who earns OIL" after the Yes | 45 of 45 on; a tap on one → a refusal stored, he is off; a second tap → nothing stored, he is on |
| H11 | the input's own window → "Change…" → No; back to the board | 45 of 45 OFF; each puck "… whoever filed this Duty answered No to OIL; tap to credit him anyway"; the window's foot says the same; a tap → a GRANT stored, he is on |
| H12 | — | no warning names a placeholder; the day's absence set does not hold one |
| H13 | an "Other" for ALL on Tue 14; Personal Inputs unfolded | landed: "Undo"; taken off: "Accept" only — no "→ Unavail" |
| H14 | — | the Undo button reads "Undo — a personal input" (the app's words for any one input — as built, see §5.4); the history lines read "ALL AVAIL · Duty …" |
| H15 | kind Event, for Ranger, Wed 15 | Event is in the kinds; its row lands on the Ground Programme as "EVENT"; the Logic page names it |
| M1 | a member (Ranger): "+ Input", Meeting, ALL AVAIL | offered (the members' switch is on); filed by him; not under his own filter; ONE bar under Everyone |
| M2 | the demo's ALL AVAIL Duty (Saber's), opened by the member | read only — no Save |
| P1 | a phone, by a finger: Sun 19 Jul, Duty, ALL AVAIL | the window 358 wide in a 390 screen; the OIL question fits; nothing runs off sideways |
| P2 | — | the bar "ALL AVAIL"; the day's card names it |
| P3 | Edit Schedule on the phone; a finger on the count | the count is the thing the finger lands on; the window opens as a panel with 45 pucks |

### 5.2 The three walkers (Sonnet 5.5, each in its own world, the frozen build)
Their reports, with every row's pictures named: `docs/handpass/parts/aa-A.md`, `aa-B.md`, `aa-C.md` (data beside them);
pictures under `docs/img/handpass/2026-10-09-all-avail-event-check/A/`, `B/`, `C/`. No console or page error in any run.

| Walker | Share | Result as the walker judged it |
|---|---|---|
| A — the Inputs page side | 22 scenarios (S1–S3, S6, S16–S19, S28–S30, S33–S38, S45, S49, S50, S53, S55) | 17 PASS · 4 FAIL (S1, S6, S37, S38) · 1 PARTIAL (S55) |
| B — the OIL switches, the schedule's screens | 21 (S7–S9, S21–S25, S27, S31, S32, S39–S44, S46–S48, S54) | 21 PASS (S7's "no answer" start not reachable by a control — below) |
| C — everything around publishing | 13 (S4, S5, S10–S15, S20, S26, S51, S52, S56) | 9 PASS · 2 FAIL (S14, S20) · 2 PARTIAL (S5, S56) |

**High-consequence PASSes the walkers drove on screen (OIL credits read off the Leave War after a real publish):** the
switches in both orders after a Yes and a No, a typed man beside the crowd, the day blanket (S7–S9); a half-day Yes not
capping a long day (S21); the last placeholder taken off, a cancelled / information-only / taken-off row (S22, S23); a
named holder's No not becoming the crowd's (S24); nobody paid twice (S25); a hand-given award surviving (S27); three
publish-and-answer orders with Undo, Redo and a reload (S10); availability and person changes staying working-only
until the next amendment (S11, S12); a holiday declared after filing lighting only the filer's bell (S15, S17); a rule
change staying pending until the amendment (S26); member, guest and unpublished faces (S51); Event red across SC MAIN,
Meeting amber, crew rest, the typed word (S46–S48); the re-ask rules (S16); the members' switch off and on (S18).

### 5.3 What the walk found, and each disposition
*Each was reproduced by the host — as a failing test, on the code — before it counted.*

**Real, in this change — FIXED, each with a test that was red first:**
| # | Found by | What the screen did | The fix | Test |
|---|---|---|---|---|
| W1 | the host's first read of Astra's leads | an ADMIN was offered "File it for me only" for a kind a placeholder cannot carry | the one press is a member's | `placeholderdoors.test.tsx` |
| W2 | walker B | in OIL Earn the request's own Personal Inputs line drew the placeholder as a man's switch: "ALL AVAIL earns nothing yet — tap to take him off this event" | a placeholder's puck is drawn, never as a switch; it says where the people behind it are switched | `ui/oilplaceholderclaim.test.tsx` |
| W3 | walker B | a request for ALL AVAIL taken off the programme still said "tap the count" — it has no row and no count | it says it is off the programme | the same |
| W4 | walker B | a person dropped onto an Unavailable row from the ALL AVAIL puck was refused with no words | it says why | `placeholderdoors.test.tsx` |
| W5 | walker A | a reader of an ALL AVAIL input was told "Only ALL AVAIL or an admin can change this" | it names whoever filed it | the same |
| W6 | walker A | the picker's one press ("File it for me only") was drawn on an input a member only reads, where it does nothing | not drawn there | the same |

**Real, OLDER than this change (the same code is on `main`) — FIXED here because each wrongs a published day, each
with a test that was red first (`engine/oildormantkey.test.ts`):**
| # | Found by | What the screen did | Why | The fix |
|---|---|---|---|---|
| W7 | walker C (S14) | on a published WEEKEND, a request filed since and taken off — or taken off and then deleted — left "1 pending — What this day earns changed" and cleared the four sign-offs; a named man's Duty did the same; a weekday was right | D174 / D176 held on the request comparison, but the day's OIL comparison keyed every request covering the date, a dormant one included | a dormant request is in neither side of that comparison (`oilev.ts keyedInputs`); one that stood and is taken off still is a change (D114) |
| W8 | walker C (S20) | archiving a man who had only been behind an ALL AVAIL puck on a published day made that day read "Ranger · posted out: no → yes" and cleared its sign-offs (against D327: "nothing reads pending for it") | the issued face kept and compared "posted out" for every man it draws, the crowd included | for a crowd-only man it is neither kept nor compared (`publish.ts dayPeopleAttrs`, `peopleAttrsNow`); a man NAMED on the day still reads pending (D321), and a crowd man's CAT or seat still does (D186) |

**Older, or the app's standing behaviour for every input — NOT fixed here; FILED (`OUTSTANDING.md` `[ALLAVAIL-CHECK-SEEN]`):**
- (A, S1) the List's pencil saved UNCHANGED still makes an Undo step, a "changed by" stamp and "Input updated" — for any input.
- (A, S38) Escape with the keyboard still in the editor's remark box, after the day's window was pressed to the front, closes BOTH windows and the unsaved draft — for any input (the window shell's rule; beside the Escape items already in `[CAL-CHECK-SEEN]`).
- (A, S55) a weekend in a year no Leave War period covers: the OIL question is asked and a Yes saved, and nothing on the Inputs page says the period is missing (D19 names the reason on the schedule side only).
- (A) the editor's calendar adds "till <date>" to the remark for a one-day input; a tap on the day already picked, then another, gives one day where one tap gives a range.
- (C, S12 / S4) on a published day, changing an input's person to or from a placeholder — or dragging its puck off the row — reads "2 pending" (the input, and what the day earns) for one act; and "What this day earns changed" names no cause where a Logic change is named exactly.
- (H14, Astra's lead) the Undo button says "Undo — a personal input" for any one input: it names neither the person nor the kind.
- (B) the ALL AVAIL window on a phone shows a 1–2 px corner speck where a desktop has its resize corner (D77: no phone resize corner).

**Not a fault — the scenario's own premise, or as ruled:**
- (A, S6) "the members' switch turned off while his OIL question is open": walked across two browser tabs, which do not hear each other before the database step (each tab is its own copy); in ONE copy the save is refused and nothing is written (`placeholderdoors.test.tsx`, "the switch turned off AFTER he filed it"; the save boundary's own check). At the database step the server holds it (data-model §11).
- (A, S37) "the card wears the placeholder's puck": the plan's own sentence was wrong — an opened day's card prints every person's name as words, a man's too; it reads "ALL AVAIL" in bold. The plan's §3.5 is corrected by this sheet.
- (B S7, A S17) "a saved input whose OIL question was never answered" cannot be made by cancelling the question — cancelling saves nothing, by design. It arises only when a holiday is declared after filing: walked that way (A S17, C S15 — the filer's bell lit, nobody else's), and the switches after "no answer" are pressed for real in `ui/oilplaceholderclaim.test.tsx`.
- (C, S5) "Switch to this plan on a preview": no such control exists; plans are switched from the plan selector, which was walked and passes.
- (C, S56) there is no separate end-of-day control in this build; a second amendment stood in, and the credit followed the latest published version (D142).
- (C, S52; Astra's lead) the printed page and the schedule's CSV carry flying lines only — no Ground Programme row of any kind, so no Event row: older than this change. Row 27 / E4 below say so; the plan's roll-call named print by mistake.
- (C) at 390×568 the editor window's Save is reached by scrolling inside the window: a window taller than the screen scrolls (D706).

**NOT WALKED, and why (so nobody reads a silence as a pass):** S39 on a phone (walker B's script could not set it up — the
host's P3 walked the phone week's count and window instead); the Edit week's own Personal Inputs echo in S32 (the host's
H13 walked it); the sim repeat of S42 and S13's "filed before the Original" variant; S19's post-out route (archive and
delete were walked); a member as the filer in walker C's publication orders (the admin filed in every one — the
member-filer rules are carried by `placeholderdoors.test.tsx`, through the editor's real controls in jsdom, and the
host's M1); the Board's own Add dialog with a placeholder (its Person list is drawn by the same `PlaceholderGroup` —
carried by reading, NOT by a walk: a gap, small); the OIL tracker sheet itself (credits were read off the Leave War grid).

### 5.4 Leads from the scenario designer's reading (Astra), each dispositioned
| Lead | Disposition |
|---|---|
| The picker offered an ADMIN "File it for me only" when the kind could not carry a placeholder | REAL, in this change — FIXED before the walk, a test first (`placeholderdoors.test.tsx`): the one press is a member's; an admin picks the name it is for |
| The Undo label for one input reads "a personal input" — it names neither ALL AVAIL nor the kind | AS BUILT for every input (`undo/describe.ts` — not this change's); seen in H14. Left: a label that named each input would be a change to every input's Undo, its own small job if he wants it |
| The pending list words an answer-only change of the filer's as a general earnings line | the walkers' S3 / S10 — see §5.3 |
| Print draws flying lines only — there is no Ground Programme on the printed page, so an Event row is not printed | TRUE, and older than this change: the print route has never drawn ground rows. The plan's roll-call named print by mistake; row 27 / E4 below say so |

### 5.5 The break tests — `scripts/handpass/aa-breaks.mjs`

Twenty-seven wires, each cut once on purpose (one exact text swap in one source file), its named test file run, the file
put back from git. **First run: 24 went RED, 3 did not** — B8 (the editor's own refusal), B9 (the group save's up-front
refusal) and B26 (the "→ Unavail" button): with each cut, the save boundary behind it still refused, so no door test
noticed — those three wires had no test of their own, by proof. Each now has one (`placeholderdoors.test.tsx`: the
editor's body asked directly; the group save's ONE plain sentence, never the boundary's rollback wording; the button
drawn by `accCtl`), and the three were cut again: **RED. 27 of 27 caught.**

| Break | The wire | Caught by |
|---|---|---|
| B1 | the hard check at the save boundary | `placeholderlist`, `placeholderdoors` |
| B2, B3, B4 | the one OIL default — the credit, each man's switch, the placeholder kept out of the work | `engine/oilplaceholderclaim`, `ui/oilplaceholderclaim` |
| B5, B6, B7 | the switch's reason, the window's hint, the row's name in OIL Earn | `ui/oilplaceholderclaim` |
| B8, B9 | the editor's own refusal; the group save's whole-selection refusal | `placeholderdoors` (after the new tests) |
| B10, B11, B12 | reassign's source; "→ Unavail"; the absence set | `placeholderdoors` |
| B13, B14 | the bell asks the filer — and only while he may answer | `placeholderdoors` |
| B15, B16, B27 | the picker's two entries; its line; no "File it for me only" for an admin | `placeholderdoors` |
| B17, B18, B19 | the List's Add form; the pencil editor's refusal before the document question; its Person list | `placeholderlist` |
| B20, B21, B22 | the person filter in the List, the opened day and the month | `placeholderlist` |
| B23 | Event red across a standby shift | `engine/eventkind` |
| B24 | a seventh kind let through for a placeholder | `engine/placeholderinput` |
| B25 | the demo's two inputs | `state/demostamps` |
| B26 | the "→ Unavail" button | `placeholderdoors` (after the new test) |

## 6. The two reads of the code

To do.

## 7. The gates

To do.

## 8. His look

To do.
