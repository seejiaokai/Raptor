# `[LW-ROWS-SPLIT]` — the fresh Opus read (blind), 13 Oct 26

Brief: `raptor-port/docs/superpowers/briefs/2026-10-13-lw-rows-split-read.md`. Read blind: nothing under
`raptor-port/docs/handpass/` was opened but this file. No file changed but this one.

**Which commit.** I was given `990ba7344`. While I read, the branch moved to `241d5cf01` (two commits: `4a6561fff`,
`241d5cf01`). Between the two, `raptor-port/src` differs by ONE line (`Matrix.tsx` line 37, three `type` words). Every
check below was made at `990ba7344` and made again at `241d5cf01`; where the answer differs it says so.

**What I ran.** Scripts of my own in my temp folder, reading `git show origin/main:…/Matrix.tsx` and the two files at
the head. One type check of `Matrix.tsx` + `MatrixRows.tsx` and everything they import, from a scratch configuration
outside the repository that extends `tsconfig.app.json` and writes nothing (2.5 s). **Not run:** the build, any test,
any server, the app.

## Findings, by severity

### F1 — HIGH at `990ba7344`; ALREADY FIXED at `4a6561fff` — confirmed independently, nothing left to do
`raptor-port/src/leavewar/ui/Matrix.tsx` line 37, as first committed, imported `QualPill`, `RowApi` and `RowDragCfg`
from `./MatrixRows` as VALUES. All three are `export type` there and `tsconfig.app.json` sets
`verbatimModuleSyntax: true`, so the build's type check refuses each (TS1484) — reproduced with the repository's own
compiler on a two-file copy. The pinning test still passed, because the unit runner does not type-check.
At `241d5cf01` the line reads `type QualPill, type RowApi, type RowDragCfg`; my type check of the two files and their
404-file import graph reports no error. Worth keeping as a lesson only: **the pinning test going green says nothing
about whether the build accepts the move.**

### F2 — MEDIUM — a guard the move disarmed: `isodates.test.tsx` now reads the wrong file
`raptor-port/src/leavewar/ui/isodates.test.tsx` lines 72–77 ("the move banner's refusal and the PO tag's hover print
the day day-first") reads the SOURCE of `./Matrix.tsx` and asserts it does not contain `posts out ${addDays(` nor
`was posted out ${addDays(`. Those two sentences are the PO corner tag's hover, and they moved: they are now
`MatrixRows.tsx` lines 512–514. `Matrix.tsx` no longer holds either sentence in any form, so the two assertions pass
whatever the rows file says.
- **Setup:** someone edits the hover in `MatrixRows.tsx` to print the stored date — `posts out ${addDays(p.to!, 1)}`.
- **Action:** run `isodates.test.tsx`.
- **What happens:** green. **What should:** red, as it was before the move (`[LW-ISO-DATES]`, 28 Sep 26).
- **Correction** (lines 72–77):
  ```ts
  const s = src('./Matrix.tsx')
  expect(s).not.toMatch(/That lands on \$\{r\.at\}/)
  const rows = src('./MatrixRows.tsx')
  expect(rows).toMatch(/posts out \$\{shortDate\(addDays\(/)        // the sentence is HERE — so this cannot go empty again
  expect(rows).not.toMatch(/posts out \$\{addDays\(/)
  expect(rows).not.toMatch(/was posted out \$\{addDays\(/)
  ```
  (The move banner's sentence stayed in `Matrix.tsx`, line 57.) Partly covered meanwhile: the new record holds the
  current-stint hover as text ("SWITCHER posts out 13 Jan 26 — …"); the earlier-stint hover ("was posted out …") is in
  no record and no other test.

### F3 — MEDIUM — the People & accounts rulings no longer load with the lines that draw a posting
`.claude/rules/decisions/people-accounts.md`, its `paths:` list, line 33: `- raptor-port/src/leavewar/ui/Matrix.tsx`.
It names the grid file alone; there is no line for `MatrixRows.tsx` and no wider pattern that matches it (the list has
`leavewar/state/**`, `sync.ts`, `engine/people.ts`, `engine/stages.ts`, `ui/BidPicker.tsx`, `ui/Matrix.tsx`,
`ui/OutcomeChips.tsx`). The lines that were the reason the grid file is on that list moved: the SANS tag on a row
(D283, `MatrixRows.tsx` 285–286), the days outside a man's time in the squadron and every stint's last day (D320,
363–365 and 470–472), the PO tags, the admin's tap that manages a posting (455–462), a member's own row (`canEditRow`).
- **Setup:** a new chat is asked to change how a posted-out man's days are drawn.
- **Action:** it opens `MatrixRows.tsx`, where those lines now are.
- **What happens:** the Leave War and OIL rulings load (their lists use `src/leavewar/**`); People & accounts does not.
  Seen first-hand in this read: opening `MatrixRows.tsx` brought the builder's rule file and nothing of People & accounts.
- **What should:** it loads, as it did when these lines were in `Matrix.tsx`.
- **Correction:** add one line under line 33: `  - raptor-port/src/leavewar/ui/MatrixRows.tsx`.

### F4 — MEDIUM (the check, not the code) — nothing pins the memo, and the planned break test cannot fail
The handoff's step (c) says "the `memo` taken off `PersonRow` → `repaint.test.tsx` fails". It will not.
`raptor-port/src/leavewar/ui/repaint.test.tsx` is one test (44 lines): a leave filed, changed and deleted on the Inputs
page shows on the grid each time — it proves the grid DOES redraw. Taking a `memo` off makes rows redraw MORE, so that
test stays green. No other unit test counts a row's redraws (searched `src/leavewar` tests for a profiler, a render
count, "repaint", "memo"). And `matrix-rows.test.tsx` quotes Astra's "should also assert that opening an unrelated
sheet does not repaint PersonRow" in its heading (lines 3–4) but contains no such assertion.
The memo boundary itself is intact — proven by reading, hunt 3 below — so this is a gap in what would catch a LATER
break, not a defect in the move.
- **Correction:** a small test of its own (not in the recording file — a stand-in would change the recorded markup),
  e.g. `matrix-rows-memo.test.tsx`:
  - the month block: `vi.mock('../engine', async orig => …)` wrapping `lastDayIn` in a counter — after the move
    `PersonMonth` is its ONLY caller in the app (`MatrixRows.tsx` 471). Render `<Matrix />`, zero the counter, open an
    unrelated sheet (tap `person-ramp`), expect the counter still 0. With `memo` off `PersonMonth` it is ~5,800.
  - the row: `vi.mock('./FigureCell', …)` wrapping `FigureCell` in a counter that counts only `testid` beginning
    `bal-` (the row's own box; `PersonRow` hands it a fresh `onClick` each time it runs, so it is called again whenever
    the row is). Same steps, expect 0. With `memo` off `PersonRow` it is 16.
  Then the break test is real: take each `memo` off, see its own counter go red.

### L1 — LOW — two of the "thirteen names the grid file still uses" it does not use
`Matrix.tsx` line 37 imports `PersonMonth` and `cellOpenable`; neither is used anywhere in `Matrix.tsx` outside
comments (lines 977 and 3072), and neither was used there outside the moved block before. Nothing breaks.
**Correction:** drop the two from line 37 (their `export` in `MatrixRows.tsx` 135 and 353 may then go too — nothing
else imports them). The brief's and the handoff's "thirteen" is eleven.

### L2 — LOW — the grid file's imports were not pruned to what it uses
`Matrix.tsx` still imports ten names that only the moved lines used: line 1 `memo`; line 3 `beforeFirstStint`,
`lastDayIn`, `isDuty`, `type Period`, `type Grid`, `type States`, `type Role`, `type Figure`, `type FigureCtx`.
The type check does not flag them (`noUnusedLocals: false`). Nothing on screen changes; the four value names are
real exports of modules the file imports anyway. **Correction:** delete the ten.
For the record, not this job's: five more were unused BEFORE the move and still are (`balanceOf`, `groupOf`,
`oilLedgerOf`, `type Group`, `popAt`). And three that were also unused before the move were REMOVED in this change
(`recordsAt`, `type CreditRec`, `parseHM`) — more than a move, harmless: see hunt 2.

### L3 — LOW — the rows file imports one name it does not use
`MatrixRows.tsx` line 15: `import { leaveInputAt } from '../sync'`. The name occurs once more, inside the comment at
line 150 ("never leaveInputAt") — which is probably how the script picked it up. With `verbatimModuleSyntax` the import
stays in the built file, so the row drawing depends on the war's link to the schedule for nothing. No effect on screen
or on load order (`Matrix.tsx` imports `../sync` before `./MatrixRows`). **Correction:** delete line 15.

### L4 — LOW — the new file's heading misnames the rule it points at
`MatrixRows.tsx` lines 5–6: "The memo firewall is these two components' own (`docs/performance.md` §E)". In §E the
**Memo firewall** is `LeaveWarPage.tsx LwBody` (line 252); the rows' rule there is "Day cells stay one memoised
`PersonMonth` per month" (line 273), and the row's contract is ledger entry 12 (lines 467–473).
**Correction:** "The row memo and the per-month memo are these two components' own (`docs/performance.md` §E — "Day
cells stay one memoised `PersonMonth` per month"; ledger 12 and 17) — a prop added here is a repaint to argue for."

### L5 — LOW — lines made untrue by the move (hunt 4), each with its correction
| Where | Says | Correction |
|---|---|---|
| `src/leavewar/ui/Matrix.tsx` 3072–3073 | "lives in `cellOpenable` (module level, the row's own body)" | "lives in `MatrixRows.tsx cellOpenable` (the row's own body)" |
| `src/leavewar/ui/CountRows.tsx` 145 | "(Matrix: MANNING_DRAG)" | "(MatrixRows: MANNING_DRAG; the machine is Matrix `startRowDrag`)" |
| `src/leavewar/ui/FigureCell.tsx` 21 | "Matrix's own title-tooltip text (PersonRow)" | "the row's own title-tooltip text (`MatrixRows.tsx PersonRow`)" |
| `src/leavewar/ui/matrix.css` 805 | "Matrix.tsx derives `.am`/`.pm` from its result cell-by-cell" | "MatrixRows.tsx (`PersonMonth`) derives …" |
| `src/leavewar/ui/matrix.css` 958 | "the per-month row memo in Matrix.tsx" | "… in MatrixRows.tsx" |
| `src/leavewar/ui/matrix.test.tsx` 366 | "the branch ORDER in Matrix.tsx" | "… in MatrixRows.tsx (`chipState`)" |
| `OUTSTANDING.md` 1491 | "`Matrix.tsx freeHalfBeside`" | "`MatrixRows.tsx freeHalfBeside`" |
| `raptor-port/docs/ui-contracts.md` 6769 | "(`Matrix.tsx startRowDrag`, `MANNING_DRAG`)" | "(`Matrix.tsx startRowDrag`, `MatrixRows.tsx MANNING_DRAG`)" |
| `raptor-port/docs/ui-contracts.md` 7231–7233 | `startRowDrag` "driven by a `RowDragCfg`… `ROSTER_DRAG`… `MANNING_DRAG`" (true, but reads as one file) | add "(the configurations are in `MatrixRows.tsx`)" |
| `raptor-port/docs/ui-contracts.md` 6312 and `raptor-port/docs/feature-impact.md` 776 | "`Matrix.tsx` `openable`" | "`MatrixRows.tsx cellOpenable`" (the name was already stale) |
| `raptor-port/docs/file-map.md` 497 | "Wired in `Matrix.tsx` (`canRemark` + a cheap `openable` branch…)" | "Wired in `Matrix.tsx` (`canRemark`) and `MatrixRows.tsx` (the cheap last branch of `cellOpenable`)" |
| `.claude/decisions-full/oil.md` row D261, its home cell | "`…/ui/Matrix.tsx` (`ownAwardOnly` in `cellOpenable`; the `AwardSheet` mount)" | "`…/ui/MatrixRows.tsx` (`ownAwardPresent` in `cellOpenable`) and `…/ui/Matrix.tsx` (the `AwardSheet` mount)" |
| `HANDOFF.md` 27 | "the thirteen names the grid file still uses, each file's imports pruned to what it uses" | eleven; see L1–L3 |

**Not untrue — checked and left:** `.claude/rules/decisions/leave-war.md` 160 and 233, `performance.md` 273, 470–473,
516–520 and `known-gaps.md` 712–716 name `PersonRow` / `PersonMonth` / `GROUP_DRAG` without saying which file holds
them (the two ledger entries name `Matrix.tsx` as the file changed THEN — history). `file-map.md` has its new line for
`MatrixRows.tsx` (1153). `src/engine/inputs-readers.test.ts` line 57 lists `leavewar/ui/Matrix.tsx` as "a comment
only": still right (its one mention, line 3028, stayed), and `MatrixRows.tsx` names none of that test's words, so it
needs no entry. No script, probe, browser test or configuration names either file by path.

## The five hunts — what I checked, and the answer

**1. A line changed in the move — NOTHING FOUND.** By script: the block is old lines 200–706 (507 lines);
`MatrixRows.tsx` lines 18–524 are those lines, in order, identical — 494 byte for byte, 13 with a leading `export `
and nothing else (old lines 201, 217, 225, 231, 259, 260, 262, 290, 310, 317, 405, 410, 535). With the block taken
out, the old file's last 4,229 lines equal the new file's last 4,229 lines exactly — so outside its imports
`Matrix.tsx` did not change at all. Line endings unchanged (LF, final newline). Two things that are not line-for-line,
both in the import header: the 51-line `'../engine'` import and the others were re-flowed onto single lines — I
compared name by name: same names, same order, same `type` marks, minus those listed in hunt 2; and a second blank
line is left where the block was (lines 147–148).

**2. An import that changed what a name means — F1 (fixed), L1–L3; otherwise nothing.**
- Every one of the 46 names `MatrixRows.tsx` imports comes from the SAME module, under the same name, with the same
  value-or-type mark as in `Matrix.tsx` on `origin/main`. Every imported name the block uses is imported (none
  missing); one is imported and unused (L3).
- The block names no module-level declaration of `Matrix.tsx` from outside itself (9 exist; none referenced), and
  `Matrix.tsx` has no module-level `let` / `var` at all. The four names kept private in the block (`ROSTER_DRAG`,
  `ownAwardPresent`, the two props types) are not named in `Matrix.tsx`.
- `Matrix.tsx` dropped 15 imported names; none is used in what is left of it. It no longer imports two modules at
  all: `../engine/dayview` (still reached first through `../engine`, which re-exports it) and `../../engine/time`
  (declarations only, no effect on load; and `./OilTracker`, imported earlier in the same list, already loads it). So
  no module loads earlier, later or not at all.
- Side-effect imports: `Matrix.tsx` had one, `./matrix.css`, and still has it, still last.
- **The stylesheet question:** right that the rows file does not import it. `./matrix.css` is imported by
  `Matrix.tsx` alone; the rows file is imported by `Matrix.tsx` alone, so the stylesheet is always there when a row is
  drawn. `./MatrixRows` sits just before `./matrix.css` in the list and brings no stylesheet of its own (neither it nor
  `FigureCell` imports one; everything else it imports was already imported higher up), so the order of the
  stylesheets is unchanged.

**3. The memo boundary and identity — NOTHING FOUND (see F4 for what would catch a later break).**
`PersonRow` and `PersonMonth` are the same two `memo(function …)` lines with the same props types and no custom
comparison, before and after; the place `Matrix` renders `<PersonRow …>` is in the 4,229 unchanged lines, so the same
props are passed. `NO_QUALS`, `MANNING_DRAG`, `GROUP_DRAG`, `GROUP_PRIO_DRAG`, `setPhWidth` are each declared once, in
`MatrixRows.tsx`, at module level, and imported by `Matrix.tsx` — one instance (`cfg === MANNING_DRAG` at `Matrix.tsx`
452 compares against the same object the count rows are handed at 3295). `ROSTER_DRAG` is used only inside the rows
file. Nothing is declared twice, nothing is created inside a render. One importer, one spelling (`'./MatrixRows'`),
file name in the same case. No circular import: only `Matrix.tsx` imports the rows file, only `LeaveWarPage.tsx` (and
tests) import `Matrix.tsx`, and nothing the rows file imports is either of them. No mutable binding crosses the two
files; the three moved functions that used to be hoisted are now imports, available before any `Matrix.tsx` code runs.

**4. Everything else that names the moved things — F2, F3, L5.** Searched `src`, `e2e`, `probes`, `scripts`, the
root configuration, the workflows, every live document and every rulings file (short lines, full rows and `paths:`)
for the 15 moved names, for `MatrixRows`, and for `Matrix.tsx` by path. Archives and old plans / briefs left out —
they describe the file as it was.

**5. The pinning test — it holds what it holds; here is what it does not.** The six records are real: 16 people's
rows and 5 headings each, all twelve months drawn (5,840 day cells), and between them they show who may tap what
(admin: every day; a member with bidding open: his own row inside the window; closed or published: only his own OIL
award, his approved leave at published, the Inputs-filed days and the marked day), approved / acknowledged / refused /
pending, both half-days, awards, Inputs-filed marks, the "+1" mark, a posting out with its last-day tag, the viewer's
own row, weekends, an event column, the locked columns. It would pass with a row drawn differently in any of these:

| Not in the record | What stands for it instead |
|---|---|
| What a tap DOES (the record is markup; handlers are not in it) | `bidding`, `deciding`, `ownaward`, `freehalf`, `remarks`, `daylist`, `pi`, `po` tests |
| The memo (a row not redrawn by an unrelated sheet) | **nothing** — F4 |
| The window's placeholder cells (`lwph`) — the unit run draws the whole year, so none exist | the browser test only (`e2e/leavewar.spec.ts` ~6079–6098) |
| Leave or an award dated outside a man's time in the squadron (`outlv`, the small PO tag) | `daylist.test.tsx`, `e2e/step4-leavewar.spec.ts` (the tag); the `outlv` class itself: **nothing** |
| The SANS tag on a row (D283) | **nothing** — no unit test, no browser test |
| An earlier stint's last-day tag and its hover; the blank days before a man arrives | the rule: `engine/people.test.ts`; the drawing: **nothing** |
| The amber "!" mark and its two hovers | `daylist.test.tsx`, `memberclash.test.tsx`, three browser tests |
| The "moved" stripe | `deciding`, `moveone`, `movestandard` tests, `e2e/leavewar.spec.ts` |
| The star on an OIL credit the app worked out | the browser test only (`e2e/step4-leavewar.spec.ts`); the mapping: `engine/codes.test.ts` |
| Rearrange: the grip, the row's drag classes | `settingssheet.test.tsx` (the grips), `e2e/leavewar.spec.ts` ~5099–5141 (the drag) |
| The figure box selected by a drag | `figselect.test.tsx` |
| A ground-crew row, an OCU row, the SANS group | `counters.test.tsx` (GND); others by the engine tests |
| Folded groups, the header, the counters, the sheets, the phone layout, the frozen columns, hover | their own suites (`matrix`, `counts`, `counters`, `events`, `frozencols`, `phonehead`) and the browser geometry tests |
| The draft stage; a no-leave (orange) event column | not recorded; stage rules in `stages.test.ts` |

Two smaller notes on the test itself. Its world types `FO` and `HO` for SWITCHER on 13 and 14 Jan (line 32), but he
posts out on the 13th, so neither is drawn — those two lines add nothing to the record (the awards that ARE recorded
come from the seed). And a file-record test passes by WRITING the record when the file is missing on a developer's
machine; the six files are committed, so this only bites if one is ever deleted or renamed.

Because hunt 1 proves the moved lines identical and hunt 2 proves every name means what it meant, the gaps above are
about what would catch a FUTURE change, not about this one.
