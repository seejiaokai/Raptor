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
| 10 | The ALL AVAIL window's pucks (`ui/AvailWindow.tsx` → `ui/html.ts withChipWorld`, `personPuckHTML`) | YES — by date. Was MISSING: the window drew a man since made SANS with the purple line on an earlier day he stood in as a regular. FIXED red-first (`withChipWorld` runs inside `withDrawDay`) | YES | the count in its title | `sans-from-date.test.ts` "the ALL AVAIL window draws each man as he was on its day"; walk 1 |
| 11 | The Inputs calendar's opened day — seat lists and pucks (`ui/InputsCal.tsx` 1247–1253, 1420) | MISSING — reads today's tick: on a day before his SANS date he is listed under SANS and his puck wears the purple edge. FILED: `[FABLE-READ-FAULTS]` found-not-fixed (g) — the Inputs pages, nothing saved or counted is wrong | YES | | |
| 12 | The SANS day's pucks (`ui/SansDay.tsx`), the SANS calendar's list of men and Highlight (`ui/sanscal-model.ts sansRoster`) | The day's counts and its "no longer SANS" line: YES — by date (rows 7, 8). Its pucks' purple edge and the Highlight list: MISSING for a man whose SANS has ended (a past SANS day draws him without the edge; Highlight no longer offers him). FILED: (g) | YES | | |
| 13 | The SANS highlight chip on the schedule (`state/view.ts` 1166) | MUST NOT go by date, because a highlight chip picks PEOPLE by what they are now and lights them across the whole week in view, as CAT and QUALS chips do (the agent's reading; named in (g) for his word) | YES | | |
| 14 | Who may FILE SANS availability — `ui/inputedit.tsx sansRefusal`, the people pickers (`ui/PeoplePick.tsx`, `ui/peoplepick-model.ts`, `ui/InputWindow.tsx` 905, `ui/interactions.ts` 1350, `ui/sansadd.ts`) | MUST NOT go by date, because a filing asks who he is NOW: a posting's tick arrives on its date, and a man no longer SANS files no new SANS availability (the agent's reading) | | | |
| 15 | The Quals page's SANS tick itself | MUST NOT, because it is the tick as it stands today — the thing being set | | | |
| 16 | The Leave War's row — its group, its place, the purple line on the name (`leavewar/state/raptorRoster.ts`, `engine/groups.ts`, `ui/NamePuck.tsx`) | MUST NOT, because his rulings keep the row whole (D283, D321, D1692, D1697) | | | |
| 17 | The Leave War's Available rows and manning counts (`leavewar/engine/availrows.ts` NO_SANS) | MISSING — a SANS man is left out of the Available count on every date, so a date before his SANS date counts one fewer after his posting or tick (and one more after an untick). Only dates already past can be touched — a SANS date is never set in the future — and the SANS calendar's need for those past dates follows it. FILED: (g) | n/a | the SANS calendar's "still needed" | |
| 18 | The pending list's words for a SANS change (`ui/pendlist.ts` 299–308, `state/changelines.ts` 569–577) | YES — unchanged: the line "SANS: no → yes" shows only on a published day whose own answer differs (row 2), its who and when from the Quals line or the posting's line, as before | n/a | | the "ON or AFTER his SANS date" test; walk 5 |
| 19 | The publish note's sentence for an unanswered input (`leavewar/sync.ts oilUnansweredLine`) — D2314 | YES | n/a | the blank-desk sentence before it, the bid line after | `publishdoor.test.ts` (four); walk 6 |
() => b

() => b a changed quantity ("N free", the ALL AVAIL
count); one writer of a record (the SANS tick: Quals, the posting's two runs, its three take-backs — all through
`sansStart` / `sansStop` / `sansErase`); every reader of a changed input or setting (this table); a storage writer (the
person row — the people command); a new kind of record field (`sanFrom`, `sanWas`: `engine/schema.ts`, `docs/data-schema.md`).

## 4. The door check

No new gesture or mode (question 5): passed.

## 5. The five sizing lines (the order's §7.0)

Written by the host (Fable, his D2255 — above the Opus the ledger asks for) after the roll-call, before any walker.

1. **The type of change:** D — a mark and a listing DRAWN in several places, each by its own code (the SANS line on a puck,
   the crew list's sections, the Available crew panel, the ALL AVAIL window, the preview); A — a rule inside one shared
   calculation (`sansOn`, read by the crowd, the published day's compare and the SANS checks); G — saved data and the
   publish path (two new person fields; what a published day keeps; pending and the sign-offs).
2. **What only a walk could find here:** a surface that draws a man on a day outside the three builders that were wrapped
   (`dayHTML`, `boardHTML`, `paletteHTML`, `withChipWorld`) — a partial repaint, the phone board, the member's View-only
   Sched, the issued face, a look at an older version; whether the crew list, the puck on the row and the ALL AVAIL
   window on ONE screen now agree for the same man; whether the dates survive what else makes them appear or vanish
   (the order's "a change that reads stored state"): a reload, a sign-out and in, a week change and back, Undo and Redo
   of the tick, a posting's date moved, the posting's "Undo post out". The tests already cover the calculation, the
   writers and the compare, each through the app's own writers (`postOut`, `updatePersonField`, the publish commands) —
   never through a control on screen.
3. **What the ledger says:** type D — 10 walks, all 10 found a real fault, 57 in the change itself; type G — 7 walks,
   4 found faults (20 in the change); type A — 9 walks, 5 found faults but only 2 in the change. So the walk goes where
   D and G point: every place he is DRAWN, and the saved dates across a reload, Undo and a week change.
4. **The walk chosen:** two Opus walkers side by side, each in its own world (own port, own browser profile), on a fresh
   production build of the last pushed commit, at 1536 desktop and 402 iPhone (WebKit), real controls only — the Quals
   tick pressed, the posting set on the Leave War's sheet, the day signed and published by its boxes:
   **w1 (the drawn man):** scenarios 1, 3, 4 and 7 below, plus 8 — after scenario 1, reload, sign out and in, step to next
   week and back: the Saturday still shows him a regular; Undo the tick / "Undo post out": he is a regular on every day;
   Redo. **w2 (the published record and the words):** scenarios 2, 5 and 6, plus 9 — a look at the published version
   (👁) and View-only Sched as a member on the earlier day: his puck as published; the pending list's line on a day
   after the date. Sizes beyond the two required: none (no layout change). **Carried by a test, not walked:** the
   repeated date cases of the calculation — the same-day tick and untick, the merge of touching stretches, a posting
   re-dated (`sans-from-date.test.ts`, through the app's writers; their route on screen is the Quals tick walked in
   scenarios 2–4); the three-people and placeholder-beside-names wordings of the publish note (`publishdoor.test.ts` —
   the same sentence builder as the one- and two-person notes walked in scenario 6).
5. **After the walk:** its row in `docs/walk-ledger.md` —

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
() => b
| Case | Test | What it proves |
|---|---|---|
() => b
| the hand tick, the three earlier "as before" pins | `src/leavewar/fableoil-sans-crowd-kept.test.ts` | rewritten to D2313 — an intended change of expected behaviour, traced to the ruling |
| the publish note's names | `src/leavewar/publishdoor.test.ts` (four new; three failed first, the three-people one held what stays) | |
| a posted-out SANS man's OIL, SANS off the war | `src/leavewar/sans-postout-oil.test.ts` (3) | green on its first run — the tracker, Balances and the grid show it |

## 8. The pictures

927 pictures in `docs/img/handpass/2026-11-22-sans-from-date/`: `host/` and `host-retick/` (the host's own short walks),
`w1/` (the drawn man; its phone "right after the tap" pictures in `w1/taps/`), `w2/final/` (the published record and the
words), `r1/run2` and `r1/run3` (the re-walk). The host opened the deciding ones: `w1/s1pp-sat-crew-closeup-phone.png`
(Sat 18 Jul: Hex in the WSO column, no purple line), `w1/s1pp-mon20-crew-closeup-phone.png` (Mon 20 Jul: under SANS Avail,
struck, the purple line), `w2/final/s5-08-tue-board-pending-desktop.png` (Tue 21 Jul's working copy: his puck with the
line), `r1/run3/crop-r3-04-view-peek-admin.png` and `crop-r3-05-edit-peek-admin.png` (the published next Monday on
View-only without the line; Edit Schedule's working copy with it), `host/host-crew-day3.png`.

**§2's results, ruling by ruling:** D2313 — PASS on every surface walked (S1, S3, S4, S5, S7, S8, R1–R3) and in its tests;
D2314 — PASS, the four notes word for word with the curly apostrophe, nothing cut on the phone (S6); D283 — PASS (a
posting dated tomorrow made nobody SANS until the day turned, S4); D327, D297 — their suites pass, code left as it was;
D44, D45, D103 — PASS (Tue 21 Jul and Wed 22 Jul read "1 pending", "Not yet signed"; AL1 clears it; S2, S5, R3); D142,
D48 — PASS (his 18 Jul FO* and OIL 2 there after AL1, S2); D321, D1692, D1697 — the row left whole, recorded in S4;
D1215, D1221 — as built (a hand tick takes him off the war while SANS is off it; "+ SANS" shows his FO* again, S2);
D186 — PASS on View-only Sched, the 👁 look and, after its fix, the next-week preview (S9, R3); D149 — PASS (the member
Ranger ticked SANS on his own row, from that day, S7).

## 9. The break tests

Driven as scenarios rather than a separate list: the same control again inside its effect (tick and untick the same day —
test), the opposite after publishing (S2, S5), Undo and Redo of each (S3, R2, the two Undo tests), "Undo post out" (S5,
S8), a reload, a sign-out and in, a week change (S8), the day turning with the page open (S4), a window closed three ways
with nothing saved (S7), a member's own tick (S7), a posting's date moved earlier and later (test).

## 10. Errors seen

None in any cited run of w1, w2 or the host's. r1: two "request failed" lines for a temporary file address each time the
Medical document viewer was closed — the viewer letting go of the picture it had made; the puck and the card unchanged.

## 11. What was NOT walked, and why

- R1's "Today" step as written: the Medical page's Today is the demo week's own today (13 Jul, D1383), not the browser
  clock's, so the card was not there to read; the two dated readings (18 and 20 Jul) carry the rule.
- The next-week preview on a phone: a phone draws none.
- The four later fixes after the reads: the re-tick was looked at by the host on the rebuilt app (`host-retick`: Wed 15
  Jul still SANS, Thu 16 a regular, Fri 17 SANS again); the people-walk guard's allowance draws nothing.
- Lesson 10 of §7.11 (a page hidden and shown again): no walker covered it — nothing in this change listens for it.
- An unanswered input could not be filed through the input window (it offers Yes, No OIL or Back), so S6's inputs were
  filed by the bridge's filing command, as chat 138's walk did; the sign-off boxes and Publish were pressed for real.
- Real-device lines for his look: none new — no gesture, layout or keyboard changed.

## 12. The gate counts

- Locally (22 Nov 26): the SANS, preview, Medical and Quals suites (5 files, 96 tests) pass on the last code; `npx tsc -b`
  clean; the code check — no new finding; `npm run rulecheck`, `npm run docsize` as in the closing report.
- GitHub's run: green on `0c6e49e6b`, `eb5c08b38`, `51039962b`, `8069d13cc`; RED once on `6f4dbb20f` (the people-walk
  guard, `engine/roster-readers.test.ts`: the preview's new signature walks the people list — allowed with its reason);
  green on `1a1be5a7e`. The run on the last pushed commit: in the closing report.

## 13. What the walk and the reads found, and each disposition

- Chat 139's check (b), the leave-charging rule's pilot check: **not a fault** — `leavewar/engine/charge.ts isPilot` reads
  the people the war shows; a man posted out as SANS keeps his row and seat; an ordinary SANS pilot hidden from the war has
  no figure on any screen while hidden, and a charge is worked out on every read, never saved.
- **The roll-call:** the ALL AVAIL window's pucks — FIXED (row 10).
- **The host, re-reading after the compaction:** a posting taken back wiped the SANS days he had held by hand — FIXED (row 20).
- **Astra's scenario design:** the Medical "as of" cards, the published next-week day in View-only's preview, a preview
  already drawn — all three FIXED, each with a test that failed first, and re-walked (R1–R3). Filed: (g) restated, (h).
- **The walk (w1, w2):** no fault. Two expectations of the brief were wrong, not the app: a SANS man with no availability
  filed raises no amber advisory when seated (the engine is silent there by design), and "Today" on the Medical page.
- **The fresh, blind Opus reader** (`docs/superpowers/briefs/2026-11-22-sans-from-date-read-opus.md`): #1 a hand re-tick
  reached back over the days he was a regular — FIXED with its test (the re-tick counts from its own day; the builder's
  own test corrected; the reading told to him); #2 → filed (j), a question for him; #3 → filed (k), words drawn for him
  first; #4 → filed (l), the security review.
- **Astra's blind read** (`…-read-astra.md`): #1 ALL AVAIL leaves out a posted SANS man planned with us while "+ SANS" is
  off — reproduced by its test, OLDER than this job (the same lines on `main`), filed (i) with its fix, OIL; #2 the
  re-tick's posting lookup read only the loaded war — the lookup is gone with Opus #1's fix (the two readers read "keeps
  the posting's date" differently: Astra — SANS again from the posting's date with no gap; Opus and the host — the
  posting's days kept, the gap a regular's, which is what leaves a day published in the gap alone; told to him); #3 the
  "Several people" picker groups by today's tick — filed with (g).
- **GitHub's run:** the people-walk guard — fixed (the allowance, with its reason).
- **The sizing looked at again (§7.0):** the faults found were all of the kind the sizing named (a surface outside the
  wrapped builders: the ALL AVAIL window, the Medical cards, the preview) or an order of the writers (the take-back, the
  re-tick) — the first by the roll-call and the designer, the second by the reads; the walk found none. The walk was
  widened once, by R1–R3, for the surfaces the designer added.
- **Lessons (§7.11):** none added — he found no fault here.

## 14. The Walk line

`Walk: docs/handpass/2026-11-22-sans-from-date.md · 927 pictures · 14 surfaces · 16 orders · MISSING: 5 fixed (the ALL AVAIL window, the Medical cards, the published preview, a drawn preview, the take-back), 0 ruled, the rest filed ([FABLE-READ-FAULTS] (g)–(l))`
