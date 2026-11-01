# The narrow read of the fixes — the Leave War's next batch (1 Nov 26)

A fresh Opus helper that wrote none of it, read-only, handed only the two fix commits (`b88727483` — the scenario designer's
F1; `fcae6c072` — the code read's finding 1 and note B) and the findings they answer. Saved whole as it arrived; the
dispositions are in `../../2026-11-01-lw-next-batch.md` §The code read.

---

**Narrow read: b88727483 and fcae6c072, reading `replaysApproval` and its two callers at fcae6c072**

**Verdict:** both fixes are right and complete for the doors that exist today. I found no defect. Both test files pass: deleteposting-restore has 17 tests and deletednorow has 43.

**(a) Undos the old per-record test refused: what each does now**

The new test changes only one case: a request taken off a cell but present in another cell's "after" image within the same step. The war's request ids settle which cases those are.
- **Send-back:** `doorDecideApproved` (sync.ts ~857) mints a new id with `newRecId()`. The Undo's inverse takes that new id off the day, and the restored side never held it, so it is still "taken". The Undo is refused as before. Tested in both files.
- **Approve → Refuse (D1428):** this goes through the same `doorDecideApproved` path with `to='refused'`, so it also mints a new id. Still refused. Tested only in deletednorow (line 264).
- **Approve:** `doorApprove` drops the request and adds no request anywhere. The Undo puts back the same id, writes no `lw` put, and passes, as before.
- **Move:** `moveRecords` (store.ts ~6015) keeps `r.rec.id`. A carried bid is the only way an id reaches another cell, so the only Undos that change verdict are those of `lw.move`.
  - A move adds no war-approved leave, and the live Move refuses no posting day (D1545 names only the approval doors). Passing is right.
  - This includes a bid carried back to a day before `from`: the request leaves the refused days, and nothing is approved.
- **Combined steps:** no door combines a move with a send-back or an approval. Move lands bids as pending and never auto-approves; decide never moves. So there is no step where a carried id hides a real taken-away request.
- **Undo touching two days:**
  - A send-back of C (before `from`) and D (from `from` on) is still refused whole. D's new id is taken, and the `lw` put covers D.
  - A send-back of C alone, where the restored row runs on past `from`, passes. C is under `from` and never enters the `before` map. The old test behaved the same, and passing is correct.
- **Undo of the same-day mixed step** (morning approved, afternoon sent back): the afternoon's new request is taken and the approved afternoon is put back, so it is refused. That is right, but no test covers it.

**(b) The time-of-day test (b88727483)**
- The keys match: lw.cell day ids and `inputDates` are both ISO.
- Halves: AM is [0,720], PM [721,1439], FULL [0,1439]. `covered` joins two halves into a whole day. An afternoon held before plus a morning written after gives an uncovered [0,720], so the step is refused (F1).
- Real hours: an approved [540,900] against a morning [0,720] held before leaves 721–900 uncovered, so it is refused correctly. A window inside one already held passes. The war only approves halves; hours reach a row only through an Inputs-page edit, and that step's Redo is module `inputs`, which this branch excludes.
- Midnight tail: the tail is spill only. `inputDates` excludes it on both sides, so it can neither cause a refusal nor mask one.
- Rows over several days: each date carries the row's window. An approval that extends or joins a neighbour (`doorApprove`'s before/after merge) shows the day as uncovered before, so it is refused.
- `winsOn` reads only the rows the step touched. A row of his on that day that the step did not touch is in neither side, and every case I traced still comes out right: an approved afternoon beside a pending morning: approving the morning writes a new or extended morning row, so it is refused; a full-day bid cannot sit beside approved halves.
- No new false refusal: the only legitimate step that takes a request off a day and leaves approved leave there is a move, and a move's bid is carried, so nothing counts as taken.

**Explicit negatives**
- A projection child folded into an entry can record one cell twice (timeline.ts ~370, "never coalesce"). If an intermediate image held a request the final image lacks, the whole-step `after` set would hide a real taken-away request. I found no war door that does this: decide and move are each one `gesture`, diffed per cell. I could not confirm it by a run without writing a file. This is a residual risk only, not a finding.
- The pinned e2e clock is now noon UTC, which is 20:00 on his PC (UTC+8). No pinned test reads the hour. The comment's UTC−11 to +11 range is correct, if conservative: it holds from −12 to +11.
- The Matrix.tsx change moves a doc comment only; no code changed.
- Nothing here touches D148.

**Tidiness (not findings)**
- `replaysApproval`'s header says "writes war-approved leave for him **there**", but the Undo clause is whole-step: any `lw` put of his from `from`, not tied to the taken day. The old code was the same, so this is wording only.
- `deletedRestoreProblem`'s long comment still says "no Redo falls to the request test; an Undo keeps it". Since the per-day rule, the Redo uses `takenDays` too. Stale text from before these commits.

**(c) Twin paths and their tests** (line numbers at fcae6c072)

| Path | Posting file | Deleted file |
|---|---|---|
| Redo of an approval | 95 | 152 |
| Redo of a place-and-approve | 190 | 219–254, 393 |
| Redo of two days across the date | 199 | **missing** |
| Redo of a cross-day net sum (approve one day, send back another) | **missing** | 570 |
| Redo of the same-day halves | 225 | 483 |
| Undo of the same-day halves | **missing** | **missing** |
| Undo of a send-back | 277 | 165, 365 |
| Undo of Approve → Refuse | **missing** | 264 |
| Undo of a deleted approved leave | 291 | 274 |
| Redo of a move | 211 | 441, 465 |
| Redo of a block move | 255 | 514 |
| Undo of a block move | 255, 265 | **missing** |
| Undo of a block move whose bid is carried to a day before the date | **missing** | **missing** |
| An hours window in the coverage test | **missing** | **missing** |

On screen, DP10 (lw-nb-post.mjs) covers the Undo of a block move.

**Recommended additions:** the Undo of the same-day mixed step (expect refused), the Undo of Approve → Refuse in the posting file, and the Undo of a block move whose bid crosses the date (expect it goes). Each pins a branch of the new whole-step reading that nothing exercises today.
