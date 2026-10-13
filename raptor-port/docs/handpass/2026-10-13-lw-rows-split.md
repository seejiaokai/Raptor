# `[LW-ROWS-SPLIT]` — the Leave War's row drawing in a file of its own — the bug check (FULL)

**Where it stands (13 Oct 26):** a MOVE, and proved one three ways — line for line against `main`, by a record of every
row's markup made before the move, and by recording the built app before and after (8 views, identical byte for byte).
Read by Fable and by a fresh Opus reader, blind to each other: the move is clean; what they found around it is fixed or
filed. **Nothing on screen changes — there is nothing for him to look at; his "merge live" is all that is left.**

`Walk: docs/handpass/2026-10-13-lw-rows-split.md · 8 pictures · 1 surface (the Leave War's grid) at 2 sizes as 2 roles · 8 views recorded on the build before and the build after, compared byte for byte · MISSING: none open — no helper walked: a change that must change nothing is proved by recording, not by looking`

Branch `claude/lw-rows-split`, cut from `main`. Rulings D493, D775 (and D799, his word to start it).

## 1. The eight questions — tier FULL

Who may open or change a cell on a row (roles) and how OIL and awards are shown (earned leave) are drawn in the moved
lines — questions 1 and 7 are YES by what the lines DO, though no rule changes. 4 (a shared drawer): YES. The rest: NO.

## 2. What was done

507 lines — the row-drag configurations, `QualPill`, `RowApi`, `freeHalfBeside`, `ownAwardPresent`, `ownAwardAlone`,
`cellOpenable`, the two props types, `PersonRow`, `PersonMonth` — moved by a script (no line retyped) from
`src/leavewar/ui/Matrix.tsx` to the new `src/leavewar/ui/MatrixRows.tsx`; `export` added to the names the grid file
still uses; each file's imports pruned to what it uses. `Matrix.tsx` keeps the controller.

## 3. The proofs that it is only a move

| Proof | Result |
|---|---|
| Line for line against `main` (a script; each reader wrote his own too) | the 507 moved lines identical but for a leading `export` on thirteen; the rest of `Matrix.tsx` unchanged but for its imports |
| The test written FIRST — `matrix-rows.test.tsx`: every row's whole markup, as an admin and a member, bidding open, closed and published, recorded on the code BEFORE the move (`src/leavewar/ui/__rows__/`, six records of about 375,000 characters) | unchanged after the move |
| **Recording the built app** (`scripts/handpass/lw-rows-record.mjs`): built once with `main`'s grid file and once with the branch's; the Leave War opened as an admin and as a member, at 1440 × 900 and 390 × 844, the clock held; the grid's whole markup written out | **8 of 8 views identical, byte for byte** (50 rows each; up to 1.4 million characters a view). Pictures: `docs/img/handpass/2026-10-13-lw-rows-split/`. (The second view of each pair, "scrolled", came out the same as the first — the scripted scroll moved nothing that is drawn; so it is four distinct views, each recorded twice.) |

## 4. The two reads (D790 — blind to each other and to this sheet)

Brief `docs/superpowers/briefs/2026-10-13-lw-rows-split-read.md`; reports `docs/handpass/parts/lwrows/read-fable.md`
(245,800 tokens) and `read-opus.md` (308,339). **Both: the move itself is clean** — identical lines, every imported name
means what it meant, one instance of each shared constant, the same `memo` components, no circular import.

| The claim | Who | What was done |
|---|---|---|
| Three type names imported as values: the BUILD's type check refuses them | both (high) | already found by the first gate run and fixed — the quick type check the builder used is not the build's |
| `isodates.test.tsx` read the SOURCE of `Matrix.tsx` for the PO tag's hover, which moved — two assertions passed whatever the rows file said | Opus (medium) | FIXED: it reads both files, with a premise; break 4 proves it |
| The rule file for people and accounts loaded with the grid file only | Opus (medium) | FIXED: its paths name the rows file too |
| Nothing pinned the rows' memo; the planned break could not fail | Opus (medium) | a new test pins `PersonRow`'s memo (`matrix-rows-memo.test.tsx`; break 2). **`PersonMonth`'s own memo is NOT pinned** — the reader's recipe for it does not work (a month is reached only through its row, and a change to the war's cells redraws every month of every row as the grid stands today, with the memo on): FILED, `[LW-MONTH-MEMO-UNPINNED]` |
| Unused imports left in both files | both (low) | FIXED |
| Notes and comments that still name the grid file for the rows' code | both (low) | five corrected; the readers' full tables are in their reports — the rest FILED, `[LW-ROWS-STALE-NOTES]` |

## 5. The break tests

`scripts/handpass/breaks/2026-10-13-lw-rows-split.json`: a class on a row changed → the pinning record fails (run by
hand: its output is too large for the break runner, which reported an error, not a pass); `PersonRow`'s memo taken off →
caught; the PO tag's hover printing a raw date → caught. `PersonMonth`'s memo taken off → NOT caught by any test (filed).

## 6. The gates

The whole set in one run under the PC's lock, three times: (1) on the move as first committed — unit 10900 / 10900, then the BUILD failed on three type names imported as values (fixed); (2) on `241d5cf01`, the move with that fix — unit 10900 / 10900 · build clean · tfin 728 / 0 · e2e 775 passed, 0 failed, 57 skipped · smoke 445 / 0 · rulecheck OK · docsize OK; (3) on `9a09585aa`, after the reads' edits — unit 10902 / 10902 (626 files) · build clean · tfin 728 / 0 · e2e 775 passed, 0 failed, 57 skipped · smoke 445 / 0 · rulecheck OK · docsize OK.

## 7. For him

Nothing to look at. Told: the move was proved by recording, not by eye; one older thing was learnt on the way and filed
— a change to any one cell of the war redraws every month of every row (older behaviour, not this job's).
