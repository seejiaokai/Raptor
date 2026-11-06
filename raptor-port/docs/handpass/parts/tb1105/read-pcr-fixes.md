# Fresh, blind Opus read — the [PO-CHANGE-RETRACT] fix round (35bc38195, 5 Nov 26)

Reader: a fresh Opus 5.5 that did not write the fix (D790, D1594). Read only; no repo file changed. Read: the commit's source
diff; `read-pcr.md` (Findings 1–3); in sync.ts `postOut`, `takeBack`, `postingLinesOf`, `retractPostingLines`, `undoPostOut`,
`restoreArchivedPerson`/`restoreBody`, `runPoOutcomes`/`poDueNow`, `postedLines`; in store.ts `setPostOut`, `setPostIn`,
`windowFor`, `markPostingDone`, `openStint`, `closeStintOnArchive`, `setPeople`, `readPostOuts`; `noticePosting`
(state/notices.ts) and the Matrix posting doors.
Ran: `postout-takeback.test.ts` on the fixed code 27/27; the Leave War's posting-related files (11 files, 263/263); the new
test file against the parent commit 67ff2e2d3's source in a scratch copy — exactly 4 fail (read-pcr's 1, 2-move, 2-undo, 3),
the two pinning tests pass there too; eight probe cases (A–H) on the fixed code, each finding reproduced there.
D56 applied: neither finding lives only in stored demo data.

(Saved by the host as the reader returned it; dispositions in the evidence sheet `docs/handpass/2026-11-05-taken-back-sans.md` §16.)

## Summary: 2 findings, both Low. Neither is caused by this commit.

| # | Severity | New or older | One line |
|---|---|---|---|
| 1 | Low | older; what is left of read-pcr's 2 | Restored on the posting's own date (stint reopened), then posted out again with the same date and outcome: the pass runs and tells again; an Undo or a change of that second posting then takes back both postings' lines. |
| 2 | Low | older, next to read-pcr's 3 | With "+ SANS" on, a post-in set on a man whose SANS posting has run (the bid sheet's PI on his cell) wipes the saved posting's date: Admin → Users loses "posted out 20 Jul · SANS", and the posting and its bell line can never be taken back. The same displayed-row cause the fix cured in `setPostOut`, still in `setPostIn`. |

## What holds, by question
1. **Lines this posting wrote, now missed?** None through the doors that write a posting. The account-suspended flag is not in the filter; the old true/false outcome is read by `outcomeOf` the same way when written and filtered (D56 anyway); an Overseas posting archived by its own run (probe F) keeps `to: 19 Jul, poDone: 20 Jul` after a fresh reprojection, and `undoPostOut` → `restoreArchivedPerson` → `restoreBody` reads `postingLinesOf` before `setPostOut(id, null)` — taken back correctly; `takeBack` also reads before its write. "+ SANS" on: Undo (probe C) takes the line back; moved (probe D) takes it back, clears `poDone`, runs and tells again on the 28th, and a later Undo takes back the 28th's line. Ran, moved away, moved back to its own date (probe G): runs again, Undo takes back the right line.
2. **Another posting's line still taken?** Closed for every case except Finding 1: a different date (the pinned tests 1 and 2); the same date with a different outcome (probe B).
3. **The store's `same`.** No record yet → false, as before; the undo (`fromDate` null) → false; a Restore rewrites the record through `openStint`, which clears `poDone`; a past stint → `rec.to` is the current stint's end; "+ SANS" now correct. Nothing in the interface reads `poDone`; `archivePerson`'s `pendingDate` reads the displayed row (with "+ SANS" on it gets null — right, the posting ran); `postingPendingTag` reads the record; `closeStintOnArchive` uses `dated()`; the gate reads the envelope. The same mistake elsewhere: `setPostIn` (Finding 2).
4. **The tests are real.** 1, 2 (move), 2 (undo) and 3 fail on 67ff2e2d3 and pass on 35bc38195; the other two pass on both, as pins. Not covered: Findings 1 and 2.

## Finding 1 (Low): same date and outcome after a reopening Restore, then Undo or a change takes back both lines
**Setup.** Overseas Sqn for Mon 20 Jul; on the 21st the pass runs (archived, suspended); both admins get the line; Hex reads it. Saber restores Ranger with post-in Mon 20 Jul (the same stint reopened; the line stays as the record). Saber posts him out again, Overseas Sqn, Mon 20 Jul; the pass runs again; each bell holds two identical lines; Hex reads.
**Action.** Undo post out (a move or another outcome goes through the same `postingLinesOf`).
**Expected.** Only the second posting's line taken back; the first stays as the record.
**What happens (probe A).** Both deleted; Hex gets two "taken back" lines.
**Cause.** `postingLinesOf` picks "this posting's" lines by man, date and outcome only.
**Fix (no new saved field).** One run writes every admin's line for one posting with the same `at`, and a man's posting cannot run twice in one pass — keep only the newest run's lines (`last = max(at)`, `stored = mine.filter(n => n.at === last)`). Not "newest line per admin": an admin at the first run and not the second would lose the first posting's line. Red first: probe A, the faked clock moved between the two runs.

## Finding 2 (Low): "+ SANS" on, a post-in on a man whose SANS posting has run wipes the posting's date
**Setup.** SANS for Mon 20 Jul, run; Admin → Users "posted out 20 Jul · SANS"; "+ SANS" switched on (the war draws him with no end date); an admin sets a post-in from his cell's bid sheet (PI) — offered when `!gone && !postingLocked`; the Post in sheet uses the same `setPostIn`.
**Expected.** His post-in moves; his ran posting (to 19 Jul, `poDone` 20 Jul) is kept.
**What happens (probe H).** The saved record becomes `from: 5 Jan, to: null` (`poDone` stays); Admin → Users' tag goes; he stays SANS-ticked (`sanBy: 'po'`) with no posting left to take it back; his bell line can never be taken back (`postingLinesOf` returns `[]` once `!rec.to`); the "post-in after the posting date" check is skipped too.
**Cause.** store.ts `setPostIn` reads the displayed row (`to: null` from `windowFor`) and writes `windowRecord` from it.
**Fix.** Judge and write from the saved record (`dated(shown)`), building the new row from it, so `windowRecord` keeps the posting's `to` and `poDone`. Red first: SANS for 20 Jul, run, `setShowSans(true)`, `setPostIn('bane', '2026-01-05')`; expect `postOuts.bane.to === '2026-07-19'` and the tag kept.
