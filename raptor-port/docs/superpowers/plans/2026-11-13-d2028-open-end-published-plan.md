# D2028 — a published day's row with no end keeps its assumed length: what the code does today, and the build (chat 68, 13 Nov 26)

Branch `claude/rules-check-small-batch`. Backlog item [RULES-CHECK-FIXES]. Tier FULL (what a published day shows; the
pending mark; the crowd behind a placeholder). **Nothing is built yet** — this is the reading of the code, written down
before the chat's compaction so the build starts from it. Every "today" below was READ in the code on 13 Nov 26, not
yet shown by a failing test; the first step of the build is to make each one a red test.

## The ruling (full row: `grep -h '^| D2028 |' .claude/decisions-full/*.md`)
A published day's row with no end time keeps the assumed length it was published under; a change to that Logic setting
("Any other row" = `openEnd`; the agent's reading: "A sim" = `simLen` too) reaches the day only from its next amendment
and raises no pending mark. Once anything waits on the day, its working copy previews the next amendment under today's
settings (D2013). D2029 and D2027: nothing to build.

## What the code does today — three places, found by reading
1. **The window's title** — `src/ui/oilmode.ts oilItemLabel` hands `VCONF.openEnd` / `VCONF.simLen` straight to `out()`
   (four lines near its end). So the ALL AVAIL window of a published day reads today's length on View-only Sched, on a
   look at an older version, and on Edit Schedule / the board — the builder's walk saw "09:00–11:00 · 2 hours assumed".
   The window's flags are measured over the same `lbl.s`–`lbl.e`, so they follow the title.
2. **The crowd behind a placeholder on that row, on the working copy** — `src/engine/oil.ts openEndRows` reads
   `ruleNow('openEnd')` / `ruleNow('simLen')`; `src/engine/oilev.ts oilEvidenceNow` counts the crowd over
   `[r.st, r.st + r.len]`. The issued face reads the frozen block (`d.oilev`), so it is right; the working copy counts
   over today's length. Where the two crowds differ (a man with something at 10:15 on a 09:00 row, 1h → 2h), the
   membership tail of `oilEvidenceKey` differs, `publish.ts oilDelta` returns an entry, and the day reads "1 pending"
   with its sign-offs down — a pending mark from that Logic setting alone, which D2028 forbids. Last night's walk did
   not see it because its crowd was 45 either way.
3. **Every other placeholder's crowd on the day** — the crowd is resolved by `HOOKS.oilSentinel` →
   `src/leavewar/sync.ts availableFor` → `dayEngaged(day)`, which reads the windows of the day's other rows with plain
   `VCONF` (`step`, `dekit`, `simLen`, `openEnd` — `src/engine/avail.ts`, `time.ts win`). `publish.ts dayDeltaCore` and
   `validate.ts untouchedKept` ask outside any overlay, so today's settings decide who is free. A named man on an
   open-ended row is busy for the assumed length, so changing "Any other row" can move ANOTHER row's ALL AVAIL crowd
   and read pending too. The same holds for `step` and `dekit` (D2005's ground, not D2028's — to be shown red before it
   is believed; told to him either way).

Already right (D2005's build): the day's own checks (`events.ts collectEvents` and `validate.ts`'s day loop run under
`faceattrs.ts withDayRules`), the frozen crowd on the issued face, the words of its warnings (`validate.ts wlbl` →
`withShownRules`).

## The design
One rule: **a published day's working copy is compared with what went out under the settings it went out with; a
Logic change alone can therefore never make the crowd read as changed.** Three edits.
- **`oilev.ts oilEvidence(di, day?, crowdRv?)`** — the settings its crowds are counted under. Given: those. Not given:
  the ones laid on the day object (`faceattrs.ts` — the validator lays a version's kept settings on an untouched
  published day between passes, `validate.ts` line ~1911), else today's. The body runs inside
  `withLiveRules(() => withRuleVals(rv, …))` so the caller's own overlay never decides it. OIL's own three values are
  untouched: they are read through `ruleNow` / `oilRuleValsNow`, which the overlay does not reach (check
  `dayOilWork`'s default `rv` before relying on it).
- **`oil.ts openEndRows`** reads `VCONF.openEnd` / `VCONF.simLen` (the settings in force where it is asked) in place
  of `ruleNow(…)`; its other callers (`ui/oilmode.ts`, three) only ask WHICH rows are open-ended.
- **`publish.ts`** — every place that compares the working copy's OIL block with the issued one passes the issued
  version's kept settings (`snap.rv`): `oilDelta` (line ~672), the pending list's two reads (~358, ~375). Read each of
  the others first (`daySnap` ~565, the sign binding ~1587, `oilRvBoundOk` ~1647, `oilBoundOk` ~1669) and decide by
  what it is for; **`daySnap` at publication must count under today's settings, explicitly** — the new version keeps
  today's `rv`, so its frozen crowd must be today's.
- **`ui/oilmode.ts oilItemLabel`** — the two lengths read through `faceattrs.ts withShownRules(d, …)`: a face's own
  `rv` inside an issued face or a look at a version, the laid settings on an untouched published day, else today's.

Why not "kept length whenever the day is published": a day with a change waiting previews its next amendment under
today's settings (D2013), and the amendment freezes today's. Why not "follow the laid settings" for the comparison
too: at the moment a setting changes nothing is laid yet (`untouchedKept` lays only where kept differs from today's),
so the comparison would read today's, call the day touched, and never lay them — and a reload forgets the laid state.

**To check before building:** `validate.ts` line ~1543 lifts the overlay for OIL's earning test (`withLiveRules`,
Astra's finding 3 of 12 Nov 26, pinned by `src/published-day-logic-reads.test.ts`). With this design an untouched
published day's working-copy crowd is counted under its kept settings there too. Read that test and the finding
(`docs/handpass/2026-11-12-published-day-logic-settings.md` rows 51, 99, 162) and say in the sheet whether D2014 (a
published day's OIL follows what it was published under) makes that the right answer now, or whether the earning test
keeps today's by passing them explicitly.

## Tests first (each red on the branch as it stands)
New file `src/published-day-open-end.test.ts`, built the way `src/published-day-logic-reads.test.ts` builds its
published day. On a published day with a Common Programme row "Briefing" 09:00, no end, ALL AVAIL on it, and a man
with a ground row 10:15–10:45:
1. `openEnd` 60 → 120: `dayDelta(di)` stays empty; the day stays signed; `oilItemLabel(di, item).when` still ends
   "09:00–10:00 · no end time, an hour assumed" on the working copy and inside `withChipWorld(di, ver, true, …)`.
2. The working copy's crowd for the row (`oilEvidenceOf(di).sent[item]`) still holds the man.
3. With one other change waiting (a remark typed): the title reads "09:00–11:00 · 2 hours assumed", the crowd is the
   2-hour one; the change put back → back to the 1-hour reading, nothing pending (D98).
4. Publish AL1 with that change: the new version's frozen crowd is the 2-hour one and its title 2 hours; ORIG, looked
   at, still reads 1 hour.
5. An unpublished day reads the new length at once.
6. The same five for a sim row and `simLen`.
7. A second ALL AVAIL row at 10:15–11:00 and a NAMED man on the open-ended row: `openEnd` 60 → 120 leaves the second
   row's crowd and `dayDelta` alone.
8. `step` / `dekit` changed with a flying man beside a placeholder row: `dayDelta` stays empty (D2005) — if this is
   NOT red today, drop it and say so.
9. Kept halves, pinned before the change (§8 point 7): a changed crowd from a real cause (a leave filed for a man
   behind the puck) still reads "1 pending"; a Logic change to "Full day of OIL" still reads pending (D592).

## The roll-call (draft — every place the assumed length is drawn or used on a published day)
| Place | Has it? |
|---|---|
| ALL AVAIL window title — View-only Sched | MISSING → edit 4 |
| the same — a look at an older version (Edit Schedule, the board) | MISSING → edit 4 |
| the same — Edit Schedule and the board, nothing waiting | MISSING → edit 4 |
| the same — Edit Schedule and the board, a change waiting | must not, because the working copy previews the next amendment (D2013) |
| the window's flags ("in his brief…") | follows the title |
| the count chip and the list — issued face | has it (frozen) |
| the count chip and the list — working copy, nothing waiting | MISSING → edits 1–3 |
| the day's pending count, "Not yet signed", the four sign-offs | MISSING → edit 3 |
| another placeholder's crowd on the day | MISSING → edits 1, 3 |
| the day's clash warnings and crew-rest end (`validate.ts` ~521) | has it (D2005) |
| the crew list / seat picker (`avail.ts`) | must not, because seating a man is the next amendment — to confirm in the walk and say in the sheet |
| OIL Earn's "No OIL worked out — this row has no end time" | must not, because it does not depend on the length |
| Insights work hours | must not, because D482 (settled) |
| the Leave War, the OIL tracker | must not, because such a row earns nobody (D360) |
| print and export | check whether the title is ever printed; the chip count is the frozen one |
| the neighbouring week's Monday / Sunday | has it (`weekctx.ts` builds under `withDayRules`) |
| the IT flow deck, the Logic page's lines | words only — check "A sim" / "Any other row" lines still true |

## The walk (to size by `docs/walk-ledger.md` §Before any walk; `docs/walk-scripts.md` first)
One Sonnet walker, phone and desktop: his case (a published Saturday, "Briefing" 09:00 no end, ALL AVAIL) with one
man made busy at 10:15 so the two crowds differ; the setting changed both ways; View-only, Edit Schedule, the board, a
look at ORIG after AL1; the sim twin; an unpublished day beside it; a member's view. Last night's walk scripts for
this branch: `docs/img/handpass/2026-11-13-rules-check-small-batch/` and the sheet
`docs/handpass/2026-11-13-rules-check-small-batch.md` — a new section of that sheet, not a new sheet.

## The reads
Astra and a fresh, blind Opus reader, blind to each other (OIL, the published record); Sol 6.1 not called — goes on
[NO-ASTRA-LIST] as owed. Scenario design by Astra before the build (one reader).

## Records owed with the build
The scheduler page's D2028 line ("not built yet…") reworded to built; `docs/engine-rules.md` §Publishing and the
open-ended row's section; `docs/ui-contracts.md` §[ALL-AVAIL-WINDOW]; the D2024 guide draft's "Known limits" names
this question as waiting — now answered; `docs/file-map.md` for the new test file; the walk ledger's row.
