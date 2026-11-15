# Evidence sheet — [WARN-WORDS-STANDALONE], the night of 16 Nov 26 (chat 83's builder)

Every warning reads on its own (owner D2045, D2048, D2058, D2068–D2071), the assumed landing (D2046, D2047, D2053) and a
standby shift with no END left out of crew rest (D2055). Branch `claude/warn-words-standalone`. Laid down before the
build (the checklist's step 4); the walk, the reads and the fixes fill it in the second stage.
Pictures: `docs/img/handpass/2026-11-16-warn-words-standalone/`.

## The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money — what a man is owed (OIL), or who counts as present | YES — the assumed landing moves OIL's worked times for a flight with no landing typed (D2046, D2053) |
| 2 | The published record | YES — a published day's frozen warnings carry the old words; the new Logic setting is one a published day keeps (D2005) |
| 3 | Saved data | YES — a new saved Logic setting (the flight length); a conflict's hide key |
| 4 | A shared drawer | YES — the warning sentences are drawn by the issues list, the board, the ALL AVAIL window, the crew-rest trace, the peek |
| 5 | A new gesture or mode | NO — no new control; the Logic page gains one setting row of an existing kind |
| 6 | A new surface | NO — the pending list gains a line inside an existing row |
| 7 | Roles | NO — no permission changes; the Logic row is an admin's as its neighbours are |
| 8 | The warning list | YES — every warning's words, and how the landing is read |

**Tier: FULL** (YES to 1, 2, 3 and 8).

## The rulings that apply

Swept from `.claude/rules/decisions/scheduler.md`, `oil.md` and the full rows; each to be checked against the running
build in the walk, pass or fail.

| Ruling | What it says, in short | Pinned by | Walk |
|---|---|---|---|
| D2045, D2048 | Every warning reads on its own: who, which items, their times, why; an assumed time called "assumed" | warnwords.test.ts (every family) | |
| D2050 | The double-turn line keeps its one-line count — left as it is | warnwords.test.ts "D2050" (pinned before the change, passed before and after) | |
| D2058 | A conflict between a flight and an item shows the step or dekit end that causes it | warnwords.test.ts "Ranger's Friday" | |
| D2059, D2060 | Step to dekit is a man's busy time; two flights back to back stay the amber tight turn | warnwords.test.ts "D2060" (pinned before) | |
| D2061–D2065 | A standby line has no step or dekit added | warnwords.test.ts "D2061–D2065" (pinned before) | |
| D2068 | "Tight turning" keeps its name | warnwords.test.ts short names | |
| D2069 | The crew-rest line keeps his order with "needs 12h" | warnwords.test.ts crew rest | |
| D2070 | "Conflict:", not "Clash:"; the check keeps "Conflict" as its short name | warnwords.test.ts | |
| D2067, D2071 | The Logic note is one sentence | logic.test.tsx | |
| D2054 | The pending list says what moved and whether OIL changed, inside the man's row | oilworkstart.test.tsx "D2054" (OWS13; seen red: the empty line list with the note taken out) | |
| D2001, D2018 | A conflict's hide follows its two items; a request against flying still told apart by its words | warnwords.test.ts "hide" | |
| D2005, D2044, D2013 | A published day keeps the settings it went out under — the flight length among them, its OIL too | leavewar/assumedlanding-published.test.ts; assumedlanding.test.ts "the setting" | |
| D2046, D2047, D1990, D2010, D2022 | A flight with no landing typed is assumed to land the Logic flight length after take-off | assumedlanding.test.ts (seen red: 14 of 17); rulescheck-batch2.test.ts part 2 / 2b and logic.test.tsx D1990 (changed on purpose) | |
| D1936, D2053 | Insights' hours and the long day count to the assumed landing | assumedlanding.test.ts "the long day"; rulesfirst-3-crew-rest.test.ts W35 and daystart-default-rally.test.ts (changed on purpose) | |
| D2055 | A standby shift with START and no END is left out of crew rest until END is typed | assumedlanding.test.ts "D2055" (seen red: 2 of 3, the control passing) | |
| D56 | Demo data is not a finding | — | |

## The roll-call — every place a warning's words show

Columns: does it SHOW the new words · is the gesture USABLE (tap, hide, jump) · what else is PAINTED there. Each cell
YES / NO-because / MISSING, filled in the walk.

| Surface | SHOW | USABLE | PAINTED | Proved by |
|---|---|---|---|---|
| The warning list (Edit Schedule's issues list, desktop and phone) | | | | |
| The Scheduler Board's issues list | | | | |
| The ALL AVAIL window's reason under a puck | | | | |
| The previous day's crew-rest mark ("Breaks Tuesday" row) | | | | |
| The next-week preview (peek) — the same-time line's box title and its hide | | | | |
| The foot-of-screen note (a tapped warning) | | | | |
| The pucks' own notes (the flag's hover / tap words) | | | | |
| Insights' "Conflicts by type" (the short names) | | | | |
| View-only Sched's list (and a published day's frozen face) | | | | |
| The Logic page — the checks' names, the note under the changed-settings strip, the new setting's row | | | | |
| Print and export | | | | |
| The pending list (a Logic change on a published day's OIL) | | | | |
| The new Logic row "A flight" (Rows with no end time, before "A sim") — its value, Reset, its out-of-bounds note | | | | |
| The crew list and ALL AVAIL's busy windows for a flight with no landing (the picker agrees with the conflict list) | | | | |
| OIL Earn and the Leave War's credited FO / HO for a weekend flight with no landing | | | | |
| *Added from Astra's scenario design (16 Nov 26, `superpowers/briefs/2026-11-16-warn-words-scenarios-astra.md`):* | | | | |
| The day-details window (the day's `?`) — its warning rows, its "free all day" figure, a tap on a row | | | | |
| The 👁 look at a published version (current and an older one made in the walk), from the week and the board; a saved plan's preview flag-free | | | | |
| The pending list's warning lines (added, changed, cleared, hidden — "new once signed", "goes away once signed") | | | | |
| The passing note right after a drop that raises a warning (`state/dropflag.ts`), the next day's included | | | | |
| Publication's OIL notices (an earning day published: no "unusable times" for a take-off with a blank landing) | | | | |
| The Leave War's day sheet, day list and the OIL tracker's worked times and balance (beyond the cell) | | | | |
| Insights' work hours (today's settings, D482) beside "Conflicts by type" | | | | |
| The crew list with a seat picked and with none; the availability strips; ALL against ALL AVAIL | | | | |
| The short names: issues heading, flag title, a puck's hover / tap words, the Logic check name and its search, Insights' category | | | | |
| The next-week peek's ordinary warnings and crew-rest trace; Monday opened before Sunday's week | | | | |
| A row's own title warnings (the same take-off and landing; the reporting order) on the week, board and peek | | | | |
| Print / PDF and the CSV export (they carry no warning list; a blank landing never printed as a typed one) | | | | |
| Each read route as the member Ranger (`us`/`us`), and at a phone's width | | | | |
| The change history's "warning hidden" line (`state/changelines.ts`) — the host's addition | | | | |

## For the walk — piece B and C scenarios, from the build

- A weekday flight with its take-off typed and no landing (blank, then "TBD"): the tight turn, the debrief, a briefing
  inside its dekit, the next day's crew rest and the long day each name the assumed landing; type a landing and each
  goes back to "landing HH:MM".
- The Logic page: the "A flight" row; change it to 90 and watch the same lines move; Reset.
- A published weekend day with such a flight: change "A flight" — one pending OIL line, "Logic · A flight with no
  landing typed", the sign-offs down; publish AL1 and the Leave War's FO / HO follows.
- The crew list and ALL AVAIL on a seat clashing with that flight's assumed window.
- An SC (and a flying SC) with START typed and END blank on Monday: no crew rest on Tuesday, "flies but has no END"
  still shown; type END and the rest comes back.

## The scenarios and who designed them

Astra (`codex exec -m gpt-6-astra`, reasoning high, read-only), one round, 16 Nov 26 02:15, blind to the build's own
reasoning beyond the builder's report — brief `superpowers/briefs/2026-11-16-warn-words-scenarios-brief.md`, his report
whole `superpowers/briefs/2026-11-16-warn-words-scenarios-astra.md`: 15 roll-call gaps (added above), 13 ranked scenarios
(about two hours), a state × reading table, eight order reversals, a ledger of the qualifying branches.

## The five sizing lines (§7.0)

1. **Type of change:** A (the assumed landing — one shared time, `events.ts` `ldM` — read by the checks, OIL, the
   availability windows) · D (the warning words drawn by eleven separate drawers: the issues lists, the board, day
   details, ALL AVAIL, the pending list, the peek, the drop note, Insights, the Logic page, the flag titles, the Leave War) ·
   G (a new saved Logic setting kept by a published day and its OIL; hides keyed on words) · F (the words themselves).
2. **What only a walk could find here:** a drawer that prints its own copy of a sentence or short name and was never
   rewired; a reader of availability or OIL computing the landing by itself (the crew list, ALL AVAIL, the Leave War's
   cell and tracker); the published / amended / 👁 / plan copies each choosing the right document; the phone fit of the
   longest lines with real letters; the Logic row's Reset and bounds; the cross-week Monday read cold. The words are
   pinned family by family in `warnwords.test.ts`, the arithmetic reader by reader in `assumedlanding.test.ts`, the
   published keep in `leavewar/assumedlanding-published.test.ts`.
3. **What the ledger says:** the rules check's small batch (15 Nov 26, A/D/F, two Sonnet walkers then a re-walk) found 0
   faults in the change; its blind reads found four; `[WARN-HIDE-KEPT]` (D/G, three walkers, 44 scenarios) found 3 faults
   by walking. Walks of a shared calculation (A) find little; walks of a drawer family (D) find the unwired copy.
4. **The walk chosen:** two Sonnet 5.5 walkers, ONE AFTER THE OTHER (LOW), each its own world, on the frozen build of
   `43af4f51e` (bundle `index-CCJFVavM.js`, served inside the test browser — no port), desktop 1536 Chromium and iPhone
   402 × 874 WebKit by touch; the host's own route first (`www-host-probe.mjs`, 2 runs, 0 errors) and his Ranger's Friday
   (`www-host-friday.mjs`, 12/12 both sizes). **W1** — Astra's 1, 2, 8, 11, 3, 6, 13 (the published day, OIL, Logic,
   the week's edge, the SC with no END, print and CSV) and the plain-user round's Logic, pending list and print. **W2** —
   Astra's 4, 5, 9, 7, 10, 12 (availability against conflicts, landing blank / TBD / typed, conflict shapes, hides, the
   phone fit in each drawer, the specialised writers) and the plain-user round's warning list: a warning tapped lights
   its crew, hidden and shown again, the ALL AVAIL window, Insights, View-only Sched. Carried by a test, not driven: the
   ledger's every family permutation of words (`warnwords.test.ts`, the engine called directly — the same words reach
   every drawer through one message, so the walk drives each DRAWER once, not each family); the reader-by-reader
   arithmetic (`assumedlanding.test.ts`, direct); the fit of every demo "Conflict:" line at 390 with pinned letters
   (`e2e/warnhide.spec.ts`, the real page). No drawing check: no screen here has an approved drawing (the words page is
   a words page; his Friday is pictured beside it).
5. **After the walk:** its row in `docs/walk-ledger.md` (below, at the close).

## The orders walked

## The cases carried by a test

| Case | Test | What it proves |
|---|---|---|
| Every family of line, on a small made-up week | `engine/warnwords.test.ts` | each line asserted whole; red against the old words before the change |
| The demo week's 33 lines | `engine/warnwords.test.ts` "the seed week, every line" | the parity test's positive half — the old dump differed on every line but the double-turn count |
| The left-as-it-is pins (D2050, D2060, D2061–D2065, D2068) | `engine/warnwords.test.ts` | passed before and after the change |
| A time range is one span | `engine/warnwords.test.ts` "escMsg" | the no-wrap span, escaping first |
| Every "Conflict:" line on a phone | `e2e/warnhide.spec.ts` (its last block) | 8 conflict lines and 24 time ranges measured at 390 wide on Edit Schedule: each conflict two rows at most, each range one line |
| The pending list's OIL line (D2054) | `ui/oilworkstart.test.tsx` "D2054" ×2 | the line inside the man's row, each case's words |
| The Logic note (D2067) | `ui/logic.test.tsx` | the pending sentence is gone |
| The assumed landing, reader by reader (D2046, D2047, D2053) | `engine/assumedlanding.test.ts` | the tight turn, the debrief, a conflict's dekit, crew rest, the long day and its span, OIL, the crew list's busy window and the seat's own window, each with a typed landing as the control; seen red 14 of 17 before the build |
| A published day keeps the flight length; its OIL reads pending on a change (D2005, D2044) | `leavewar/assumedlanding-published.test.ts` | through the real publish path to the Leave War's cell; written after the engine change, so not seen red on its own |
| A standby shift with START and no END (D2055) | `engine/assumedlanding.test.ts` "D2055" | no crew rest, flying or not, its own warning kept, END typed as the control; seen red 2 of 3 |
| Every Logic number follows its setting, the flight length included (D932) | `ui/logic.test.tsx` D932 | caught the new crew-rest sentence's "1h" until the key was added |

## The pictures

## The break tests

## Errors seen

## What was NOT walked, and why

## The gate counts

## What the walk found, and each disposition

- **G1 (GitHub's run on `0e0a5f105`, before the walk) — the phone-fit browser test was red on Linux.** "Saber — Conflict:
  OPS SHARING + NAV SYS BRIEF 17:55–18:55 & VL BFM (step 18:45, T/O 19:45)" took three rows at 390: the test measured
  whatever letters the machine had (his PC's passed; Linux's are wider), against the order §7.2's rule that a new fit
  test pins its letters. Reproduced by the host (`www-host-fit.mjs`, record `docs/img/handpass/2026-11-16-warn-words-standalone/host/fit/log.txt`):
  in Verdana (the Linux stand-in) 3 of the demo week's 8 lines run to three rows at 390 Chromium, 2 at 402 WebKit; in
  Arial (Helvetica's width, as his iPhone's letters) only the Nomad line does, and only by its typed reason ("Reason:
  Overseas duty — exercise, off island"); at the page's own letters all 8 fit. **Disposition:** the test corrected — the
  letters pinned to Arial from the first paint, a typed reason not counted (free text no wording can bound) — passes
  locally (1/1); the red was GitHub's own run. **For his look:** on his iPhone a conflict line with a long typed item name
  or a request's reason can take a third row; the approved words are unchanged.
- **W1-1 (W1, scenario 8, `w1/s8-d/8-c-pendinglist-d.png`, opened by the host) — the pending list's OIL note named one
  end when both had moved.** The default rally and "A flight" changed together: the times line read "full day ·
  09:00–15:30 → full day · 09:15–16:00", the note "Still a full day of OIL. It counts from 09:15, not 09:00." — the end's
  move said nowhere in words. The proposal drew only one end moving (§3b). **Fixed red first** (`ui/oilworkstart.test.tsx`
  "D2054: both ends moved", red on the old words): "Still a full day of OIL. It counts 09:15–16:00, not 09:00–15:30." A
  new shape of his approved line — for his look card.
- **W1 leads judged not faults:** "4 to sign" reads the same before and after the change — it counts the NEXT
  amendment's empty boxes, as built; the amber "Not yet signed" chip is the sign (D97). The equal take-off and landing
  keep their own "Times look wrong…" warning, no "assumed" (D49); the CSV leaves a blank landing empty — as it should.
- **W1 lead, put to him as a words question (not changed):** the Logic page's prose says "clash" in about nine places —
  the new "A flight" row ("Clashes, the tight turn, …") among them, and the setting "SC MAIN clashes"; his D2070 named
  the warnings' label "Conflict". Changing the page's own word is a words pass he has not seen.

## Notes for the walk, from the build

- Hides stored before this change: a hide of a conflict between two schedule items keyed on its two items (D2001) since
  12 Nov 26, so those stay hidden. Every other hidden warning is keyed on its words, so a hide stored before the
  rewording comes back once, the line shown again with its new words. Demo data only (D56) — not a finding; new hides
  work going forward.
- A published day's frozen warnings carry the words they went out with; once the new words are live a published day
  whose frozen list differs reads its warnings as changed until its next amendment. Demo data only (D56).
