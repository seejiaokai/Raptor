# Fresh, blind Opus read — the [PO-CHANGE-RETRACT] second fix round (c38a3d271, 5 Nov 26)

Reader: a fresh Opus 5.5 that did not write the fix (D790, D1594). Read and ran tests only; no repo file changed. Read: the
commit's source diff and `read-pcr-fixes.md` 1 and 2; in sync.ts `postingLinesOf`, `retractPostingLines`, `runPoOutcomes`
(its `noticePosting` call), `undoPostOut`, `restoreBody`, `restoreProblem`, `takeBack`, `postOut`, `postedLines`; in
notices.ts `noticePosting`, `mint`; in store.ts `setPostIn`, `postingProblem`, `dated`, `withStored`, `windowFor`,
`windowRecord`, `setPostOut`, `setPeople`, `openStint`, `closeStintOnArchive`, `markPostingDone`; `reprojectRoster`,
`projectPeople`, and every Matrix door that calls `setPostIn` or `postingProblem`.
Ran (in a scratch copy outside the repo): the new test file 29/29; each fix reverted on its own; a six-case probe of
`setPostIn` / `postingProblem`, old against new; eight posting test files, `stints.test.ts` among them, 431/431. D56 applied.

(Saved by the host as the reader returned it, lightly condensed — nothing of its meaning changed.)

## Summary: 0 findings
Both fixes are right and complete for every case reachable today, and neither breaks anything beside it.

## 1. `postingLinesOf` keeps only the lines with the newest moment
- One run, one moment: `runPoOutcomes` takes `now` once a pass; each posting that ran gets exactly one `noticePosting(…, now - i)` call, every admin's line from it stamped alike; the `- i` steps apart different postings of one pass, never the admins of one posting.
- One run per man per pass: `due` is built from the keys of `postOuts`, one per man; `poDueNow` is asked again inside the command, and `PO_INFLIGHT` blocks a second pass.
- No other writer: the "off the manpower" line is worked out, never stored, and its outcome `none` never runs.
- A line of this run missed only if a newer line exists for the same man, date and outcome — a later run of this same posting; `poDone` is cleared on every path that takes lines back (a change through `setPostOut`'s `same`, Undo, `openStint`).
- Two postings of one man sharing the newest moment: only if the clock went backwards; a Restore and a new posting are two commands, seconds apart.
- Two leftovers, neither reachable today: a second run that tells no admin (needs the man himself the only admin who can sign in — an Overseas posting is then held; a SANS one cannot be reposted for the same outcome after a Restore, Archive making the record Overseas Sqn); and clocks on two devices disagreeing, which matters only with a shared database — one line in the database-step notes (filed under [DB-STEP]).

## 2. `setPostIn` and `postingProblem` now read the saved posting (`dated`)
The probe compared the grid's row and the saved record, old code against new:

| Case | Grid row | Saved record |
|---|---|---|
| A: no saved record, set and clear | same | same |
| B: SANS ran, "+ SANS" off (earlier date, later date refused, cleared) | same | same; the refusal and its sentence the same |
| C: SANS ran, "+ SANS" on | same (`to` empty, as drawn) | old: `to` lost, the whole record deleted on clear, and after "+ SANS" off the man gone from the war; new: `to 19 Jul`, `poDone 20 Jul` kept |
| D: SANS not yet run, "+ SANS" on | same | same; the refusal matches |
| E: back from a posting (an earlier stint) | same | same: moving onto the earlier stint refused with the same sentence, the move accepted, the join accepted |
| F: earlier stint plus a ran SANS posting, "+ SANS" on | same | old: `to` lost on the move and the join, a post-in after the posting date accepted; new: kept, refused, the sentence matching |

Every difference is the intended correction; the row stays what it was in every case and matches what the next rebuild of the
roster draws from the same record. `postingProblem` against `setPostIn`: "in" — both test `date > to` against the saved `to`;
"out" never reads `to`; "restore" and `identity` — `dated(row)` differs from the row only for a ran SANS posting with "+ SANS"
on, which cannot reach Restore (Archive makes the record Overseas Sqn); with no row, `identity` as before. Older mismatches
left as they were are unreachable or kept out by the doors.

## 3. The two new tests are real
Test 1 fails on the old `postingLinesOf`. Test 2 fails on the old store, and also with only the `postingProblem` change put
back (the sheet's sentence) and with only the `setPostIn` change put back ("after his posting: refused") — both halves pinned.
