# Bug check — an input filed for ALL AVAIL / ALL, and the new input kind "Event"

**Branch `claude/day-window-compact`** (not merged — his word: "No merge"). Built and checked 9 Oct 26 as ONE batch with
ONE check (D485). Host and builder: Opus 5.5. The plan (`docs/superpowers/plans/2026-10-09-input-all-avail-plan.md`,
version 2) was read by Astra and by Sol 6.1, each blind, before the build: both "CLEAN WITH THESE EXACT CHANGES". Scenario
design: Astra. Code reads: Astra and Sol 6.1, each blind (D590).

**STATE OF THIS SHEET: IN PROGRESS.** Sections 1–4 are written before the walk (the order's §7.0: the walk is sized in
writing first); 5–8 are filled as each step is done. A section that says "to do" has not been done.

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
| D700 | an input can be filed for ALL or ALL AVAIL — duties and other commitments only | to do | to do |
| D702 | it stands for whoever is free, live; members may choose it; on the day and the schedule only; the filer answers OIL once | to do | to do |
| D711 (1) | the filer's one answer; the scheduler switches any one man; no answer of a man's own | to do | to do |
| D711 (2), D712 | not for an overseas duty, a course, "Fly with" or "Personal" | to do | to do |
| D711 (3) | one day at a time | to do | to do |
| D711 (4) | an unanswered OIL question goes to the filer's bell, and only his | to do | to do |
| D713 | Event: asks OIL, clashes, shows on the Inputs calendar and lands on the schedule; for ALL AVAIL, ALL or several | to do | to do |
| D714 | Event clashes red, not Meeting's amber; no "count me in / out" | to do | to do |
| D18, D470 | a man the scheduler types onto a request's row earns from it | to do | to do |
| D28, D43 | every seat can earn; the admin can always override; a placeholder is on by default wherever it lands | to do | to do |
| D46 | a placeholder dropped on a NAMED man's request row credits by default — unchanged | to do | to do |
| D44, D45, D142 | the crowd and the OIL are frozen at publication; a later change reads pending; OIL from the latest published version | to do | to do |
| D103, D178 | any pending change takes the sign-offs down; an input change after publication is pending | to do | to do |
| D27, D33, D36, D37, D52, D327 | where placeholders land, who counts as free, the count shown wherever the puck lands | to do | to do |
| D38–D41, D65, D66 | the ALL AVAIL window | to do | to do |
| D654–D660, D682 | one input for several people; who files for others; the filer answers for all | to do | to do |
| D200 | who may do what is decided in ONE place, tested against the permissions table | `perms.test.ts`, `perms-scan.test.ts` | to do |
| D56 | a problem only in stored demo data is not a finding | every reviewer's brief says so | HELD |

## 3. The roll-call — every place an input's person or kind is drawn, written or read

*Each row gets YES / NO-because / MISSING in each column once it has been SEEN and OPERATED in the running build. "to
walk" = not yet.*

### 3a. An input whose person is a placeholder
| # | Place | Shows it right | Usable there | Painted over / beside | Proof |
|---|---|---|---|---|---|
| 1 | The editor window — a new input: the Person list | to walk | to walk | to walk | |
| 2 | The editor window — "Several people" | to walk | to walk | to walk | |
| 3 | The editor window — an input already filed (admin; its member filer; another member, read only) | to walk | to walk | to walk | |
| 4 | The board's Add / edit dialog (plain Person list) | to walk | to walk | to walk | |
| 5 | The SANS calendar's "+ Commitment" picker | to walk | to walk | to walk | |
| 6 | The Inputs List — its Add form | to walk | to walk | to walk | |
| 7 | The Inputs List — the row, its sort and search | to walk | to walk | to walk | |
| 8 | The Inputs List — its pencil editor | to walk | to walk | to walk | |
| 9 | The Inputs List — the person filter (Everyone / ALL / ALL AVAIL) and the summary chip | to walk | to walk | to walk | |
| 10 | The Inputs List — the "OIL?" chip | to walk | to walk | to walk | |
| 11 | The Inputs month — the bar and its tip | to walk | to walk | to walk | |
| 12 | The Inputs month — a drag of the bar to another day / over a second day | to walk | to walk | to walk | |
| 13 | The opened day — the card, its small print, its filter | to walk | to walk | to walk | |
| 14 | The bell (the filer's; nobody else's) | to walk | to walk | to walk | |
| 15 | The schedule's request row — Edit Schedule's week | to walk | to walk | to walk | |
| 16 | The schedule's request row — the Scheduler Board | to walk | to walk | to walk | |
| 17 | The schedule's request row — View-only Sched (a member, a guest) | to walk | to walk | to walk | |
| 18 | The count chip and the ALL AVAIL window — "Who's available" | to walk | to walk | to walk | |
| 19 | The ALL AVAIL window — "Who earns OIL" (after Yes / No / no answer) | to walk | to walk | to walk | |
| 20 | OIL Earn — the row's name (no whole-row switch) and a typed man's puck | to walk | to walk | to walk | |
| 21 | Personal Inputs on the week and the board (the echo; Accept / Undo; no "→ Unavail") | to walk | to walk | to walk | |
| 22 | Unavailable (never there) | to walk | to walk | to walk | |
| 23 | A published day — the issued face, "N pending", the sign-offs | to walk | to walk | to walk | |
| 24 | The changes window, the pending list, the Undo / Redo label | to walk | to walk | to walk | |
| 25 | The day panel's "Leave / downchit" total; the warning list (no warning) | to walk | to walk | to walk | |
| 26 | The OIL tracker / the Leave War's credit (who was credited) | to walk | to walk | to walk | |
| 27 | Print / export | to walk | to walk | to walk | |
| 28 | The Leave War grid (nothing shown) | to walk | to walk | to walk | |

### 3b. The kind "Event"
| # | Place | Shows it right | Usable there | Proof |
|---|---|---|---|---|
| E1 | The type list — the editor, the board dialog, the List's form, the List's pencil editor | to walk | to walk | |
| E2 | The type filter; the "?" legend; the Logic page's type table | to walk | to walk | |
| E3 | The month's bar, the opened day's card, the List row | to walk | to walk | |
| E4 | The Ground Programme row (week, board, View-only Sched), Accept / Undo | to walk | to walk | |
| E5 | The warning list — red across an SC MAIN shift; crew rest | to walk | to walk | |
| E6 | The OIL question on a weekend; the credit | to walk | to walk | |
| E7 | A man on an Event is not in an ALL AVAIL crowd for its hours | to walk | to walk | |
| E8 | A hand-typed ground row named EVENT | to walk | to walk | |
| E9 | An Event for several people; an Event for ALL / ALL AVAIL | to walk | to walk | |

### 3c. The doors — every action the data allows, and the control that does it
| Action | Control | Result |
|---|---|---|
| File for ALL AVAIL / ALL | the Person list's two entries (editor, board dialog, List form) | to walk |
| Answer its OIL question | the question at the save; the bell (filer); the List's "OIL?" chip (admin); the editor's "Change…" | to walk |
| Switch one man | OIL Earn → the row's count → the window → his puck | to walk |
| Change its day / hours / kind / remark | its window; the List's pencil; a drag of its bar; the time cells | to walk |
| Change who it is for (admin) | its window / the pencil — never a drag onto it on the schedule | to walk |
| Take it off the programme / put it back | Personal Inputs: Undo / Accept — never "→ Unavail" | to walk |
| Delete it | its window; the opened day's card; the List | to walk |
| Refuse a wrong kind / two days / a group | the picker's line and one press; the Save's sentence; the save boundary | to walk |

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

To do.

## 6. The two reads of the code

To do.

## 7. The gates

To do.

## 8. His look

To do.
