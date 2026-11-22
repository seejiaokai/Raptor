# Evidence sheet — SANS from its date on every screen (D2313) and the publish note's names (D2314)

22 Nov 26 · chat 140 (Fable built it) · branch `claude/sans-from-date-139` · pull request 824 · pictures in
`docs/img/handpass/2026-11-22-sans-from-date/`. Laid down before the walk (the order's §9); a blank cell below is a thing
nobody has done yet.

## 1. The eight answers and the tier

| # | Question | Answer | Why |
|---|---|---|---|
| 1 | Money (OIL, who counts as present) | **YES** | who stands in the ALL AVAIL crowd of a day decides who earns that day's OIL; the crew list's "N free" counts |
| 2 | The published record | **YES** | what a published day keeps about each man (`snap.pa`) and what makes it read pending; the publish note's words |
| 3 | Saved data | **YES** | two new saved fields on a person, `sanFrom` and `sanWas`; older people have neither and must read as before |
| 4 | A shared drawer | **YES** | the puck (`ui/html.ts puck` through `personShown`) is drawn on every surface |
| 5 | A new gesture or mode | NO | no new control, tap target or mode — the Quals SANS tick and the posting sheet are pressed as before |
| 6 | A new surface | NO | no new screen, panel, sheet or kind of row |
| 7 | Roles | NO | who may tick SANS, post out or publish is unchanged; `state/perms.ts PASS_FIELDS.sans` gains the two fields the posting's own run may write, no new right (so no security read — nothing about sign-in, who may do or see what, or what one person sees of another) |
| 8 | The warning list | **YES** | the "planned outside SANS availability" advisory is now raised only on a day he is SANS |

**Tier: FULL** (1, 2, 3 and 8). Nothing new he will see (D1625): no box, message, mark or button is added — an existing puck,
list and note read differently on some days; the publish note's new words are his own (D2314).

## 2. The rulings that apply — each checked against the running build

| Ruling | What it says here | Checked how | Result |
|---|---|---|---|
| D2313 | SANS only from its date, on every screen; a hand tick from the day it is made; a re-tick keeps the posting's date; a named man on an earlier published day leaves it unchanged | `leavewar/sans-from-date.test.ts`; walk scenarios 1–5 | |
| D2314 | the publish note: "Ranger's Training", "Ranger and Hex's Training", "Training for 3 people", "Training for ALL AVAIL" | `leavewar/publishdoor.test.ts`; walk scenario 6 | |
| D283 | posted out as SANS he becomes SANS on the date | `fableoil-sans-crowd-kept.test.ts` (from the date: out of the crowd, a later published day pending) | |
| D327, D297 | the crowd of a day already published stays as it went out (archived, deleted) — left as it is | `fableoil-sans-crowd.test.ts`, the archive and delete suites in the 96-file run | |
| D44, D45, D103 | nothing on a published day changes without the scheduler acknowledging it; a pending change takes the four sign-offs | the "ON or AFTER his SANS date … still reads pending" test; walk scenario 5 | |
| D142, D48 | a day's OIL is its latest published version's | the "AL1 changed a remark only" tests; walk scenario 2 | |
| D321, D1692, D1697 | the Leave War's ROW moves whole and wears the purple line from when the posting is set — NOT by date (D2313 "narrows nothing") | left as built; the roll-call's Leave War rows | |
| D1215, D1221 | SANS men are off the Leave War unless "+ SANS" is on | `leavewar/sans-postout-oil.test.ts` | |
| D186 | a man's CAT, seat or posting on his puck stays as published until the next amendment | the issued face keeps `snap.pa`'s own `san` (`personShown`) | |
| D149 | a member edits his own Quals row, the SANS tick included | the Quals and permissions suites in the 96-file run (the two new fields are his row's own) | |

No clash found between D2313 and an earlier ruling: where the Leave War's row rulings (D283, D321, D1692) keep the row whole,
D2313's own row says it narrows nothing.

## 3. The roll-call — every place that reads whether a man is SANS

SHOWS = does it show him as he was ON THE DAY · USABLE = can the scheduler act on him there as a man of that kind ·
PAINTED = what else is drawn there that must agree. *by date* = asks `engine/people.ts sansOn(id, iso)`.

| # | Surface (file) | SHOWS | USABLE | PAINTED | Proved by |
|---|---|---|---|---|---|
| 1 | The ALL AVAIL crowd behind a placeholder (`leavewar/sync.ts availableFor`) | YES — by date | YES | the count chip, the OIL credit | `sans-from-date.test.ts` (a), `fableoil-sans-crowd*.test.ts` |
| 2 | What a published day keeps and compares (`engine/publish.ts attrsOf`, `dayPeopleAttrs`, `peopleAttrsNow`; callers `publish.ts warnDelta`, `validate.ts untouchedKept`, `weekctx.ts keepUntouchedRules`, `ui/pendlist.ts`) | YES — by date | n/a | the "N pending" count, the four sign-offs | `sans-from-date.test.ts` (c) |
| 3 | The crew list — pilots, WSOs, SANS Avail, the "no availability filed" strike (`ui/palette-html.ts`) on the board and Edit Schedule | YES — by date | YES (a regular's puck drags as a regular) | "N free" in each heading | `sans-from-date.test.ts` (e); walk 1, 3 |
| 4 | The Available crew panel and its "N SANS offering" count (`ui/html.ts availHTML`) | YES — by date | YES | | walk 1 |
| 5 | A puck on a day — the week's rows, the board's rows, the crew list (`ui/html.ts puck` → `engine/faceattrs.ts personShown` inside `withDrawDay`) | YES — by date; an issued face keeps the version's own | YES | the purple line and "· SANS" in its title | `sans-from-date.test.ts` (e, the puck); walk 1 |
| 6 | The SANS availability checks — the picker's strike on an armed seat, the amber advisory (`engine/avail.ts sansGate`, `slotBar`; `engine/validate.ts`) | YES — by date | YES — no SANS reason bars him on a day before his date | the warning list | `sans-from-date.test.ts` (c, flying) |
| 7 | The SANS committed to fly, the SANS calendar's need (`state/flyplan.ts sansCommittedOn`) | YES — by date | n/a | | the SANS calendar suites in the run; walk 3 |
| 8 | The SANS day's "no longer SANS" line (`ui/sanscal-model.ts sansDayGroups`) | YES — by date | n/a | | |
| 9 | The next-week preview's puck (`ui/peek.ts peekPuck`) | YES — by date | n/a (read only) | | |
| 10 | The ALL AVAIL window's pucks (`ui/AvailWindow.tsx`) | | | | |
| 11 | The Inputs calendar's opened day — seat lists and pucks (`ui/InputsCal.tsx` 1247–1253, 1420) | | | | |
| 12 | The SANS day's pucks (`ui/SansDay.tsx`), the SANS calendar's list of men and Highlight (`ui/sanscal-model.ts sansRoster`) | | | | |
| 13 | The SANS highlight chip on the schedule (`state/view.ts` 1166) | | | | |
| 14 | Who may FILE SANS availability — `ui/inputedit.tsx sansRefusal`, the people pickers (`ui/PeoplePick.tsx`, `ui/peoplepick-model.ts`, `ui/InputWindow.tsx` 905, `ui/interactions.ts` 1350, `ui/sansadd.ts`) | MUST NOT go by date, because a filing asks who he is NOW: a posting's tick arrives on its date, and a man no longer SANS files no new SANS availability (the agent's reading) | | | |
| 15 | The Quals page's SANS tick itself | MUST NOT, because it is the tick as it stands today — the thing being set | | | |
| 16 | The Leave War's row — its group, its place, the purple line on the name (`leavewar/state/raptorRoster.ts`, `engine/groups.ts`, `ui/NamePuck.tsx`) | MUST NOT, because his rulings keep the row whole (D283, D321, D1692, D1697) | | | |
| 17 | The Leave War's Available rows and manning counts (`leavewar/engine/availrows.ts` NO_SANS) | | | | |
| 18 | The pending list's words for a SANS change (`ui/pendlist.ts` 299–308, `state/changelines.ts` 569–577) | | | | |
| 19 | The publish note's sentence for an unanswered input (`leavewar/sync.ts oilUnansweredLine`) — D2314 | YES | n/a | the blank-desk sentence before it, the bid line after | `publishdoor.test.ts` (four); walk 6 |
| 20 | Undo of a hand tick, of a posting (the people command's own before/after) | | | | |

**Rows by kind of change (the order's §6 list — to run when it is opened):** a changed quantity ("N free", the ALL AVAIL
count); one writer of a record (the SANS tick: Quals, the posting's two runs, its three take-backs — all through
`sansStart` / `sansStop` / `sansErase`); every reader of a changed input or setting (this table); a storage writer (the
person row — the people command); a new kind of record field (`sanFrom`, `sanWas`: `engine/schema.ts`, `docs/data-schema.md`).

## 4. The door check

No new gesture or mode (question 5): passed.

## 5. The five sizing lines (the order's §7.0)

## 6. The orders walked — what the screen said and what the OIL said

Scenarios to walk, desktop 1536 and iPhone 402, a picture each (Astra's scenario design to be added before the walk):
1. Hex posted out as SANS from a Monday; the board and Edit Schedule on the Saturday before — among the WSOs, no purple
   line, the ALL AVAIL window counts him; on the Monday — under SANS Avail, the purple line.
2. A published holiday, then a SANS tick BY HAND on Quals two days later — nothing pending, its sign-offs stand, the next
   amendment keeps his OIL.
3. A SANS man unticked by hand — the earlier days still list him under SANS Avail and keep him out of their crowd; from
   today he is among the regulars.
4. A posting, then untick and re-tick by hand on later days — the day before the posting unchanged, no gap after it.
5. A man named on a published day, then posted out as SANS from a later date — nothing pending; a published day on or
   after the date that names him — one change waiting.
6. The publish note on a Saturday: one person, two people, three people, ALL AVAIL.
7. The plain-user round (the order's §7.0a): Quals' everyday edits, the posting sheet opened and closed, a puck dragged
   from the crew list onto a seat on a day before and a day after the date.

## 7. The cases carried by a test

| Case | Test | What it proves |
|---|---|---|
| each part of D2313, (e) (a) (b) (c) | `src/leavewar/sans-from-date.test.ts` (12) | 11 failed on `main`'s code; all pass on the build |
| the hand tick, the three earlier "as before" pins | `src/leavewar/fableoil-sans-crowd-kept.test.ts` | rewritten to D2313 — an intended change of expected behaviour, traced to the ruling |
| the publish note's names | `src/leavewar/publishdoor.test.ts` (four new; three failed first, the three-people one held what stays) | |
| a posted-out SANS man's OIL, SANS off the war | `src/leavewar/sans-postout-oil.test.ts` (3) | green on its first run — the tracker, Balances and the grid show it |

## 8. The pictures

## 9. The break tests

## 10. Errors seen

## 11. What was NOT walked, and why

## 12. The gate counts

- Locally (22 Nov 26): 96 related test files, 1,933 tests, passed; `npm run build` clean; the code check — no new finding
  (22 changed files); `npm run rulecheck` OK; `npm run docsize` OK (the backlog file over its tripwire by 36, deferred, D29).
- GitHub's run on `0c6e49e6b` (the first push): all green. The run on the last pushed commit:

## 13. What the walk and the reads found, and each disposition

- Chat 139's check (b), the leave-charging rule's pilot check: **not a fault** — `leavewar/engine/charge.ts isPilot` reads
  the people the war shows; a man posted out as SANS keeps his row and seat; an ordinary SANS pilot hidden from the war has
  no figure on any screen while hidden, and a charge is worked out on every read, never saved.

## 14. The Walk line
