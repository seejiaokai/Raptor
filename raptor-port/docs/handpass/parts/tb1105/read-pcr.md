# Fresh, blind Opus read — [PO-CHANGE-RETRACT] fix (5 Nov 26)

Reader: a fresh Opus 5.5 that did not write the fix (D790, D1594). Read only; no repo file changed. Read: `git show 67ff2e2d3 -- raptor-port/src`, the original read's Finding 1 (`read-code.md`), D1710's full row, `postOut` / `takeBack` / `postingLinesOf` / `retractPostingLines` / `runPoOutcomes` / `postedLines` (sync.ts), `setPostOut` / `windowFor` / `openStint` / `closeStintOnArchive` (store.ts), and `applyEnd` (sched-commit.ts).
Run: `npx vitest run src/leavewar/postout-takeback.test.ts` passes 21/21. Eight probe cases were run from a scratch test file outside the repo, built on the same setup as the test file; each finding below was reproduced there.
D56 applied: none of the findings lives only in stored demo data.

(Saved by the host as the reader returned it; the dispositions are in the evidence sheet `docs/handpass/2026-11-05-taken-back-sans.md` §16.)

## Summary — 3 findings: 1 Medium (new with this fix), 2 Low (older, one made worse by this fix)

| # | Severity | New or older | One line |
|---|---|---|---|
| 1 | Medium | **new** | Moving a posting that has **not run** now takes back an **earlier** posting's line when he was restored on that posting's own date. `changed` dropped the "has it run" half of the test. |
| 2 | Low | older (Undo has it), **made worse by this fix** | After a Restore whose post-in is the day right after his stint closed, an Undo **or now any change** of his next posting also takes back the first posting's line, which Restore keeps as the record. |
| 3 | Low | older | With "+ SANS" on, saving a ran SANS posting again unchanged (bid sheet / drag-selection Post out) adds a second identical "Posted out · now SANS" line. The store's "has run" test reads the posting as he is shown on the grid, not the saved posting, so it disagrees with the fix's `changed`. |

**What holds.** Checked and found nothing wrong:
- **Every door.** All three doors reach `postOut` (bid sheet PO, Post out sheet date and chips, drag-selection Post out — Matrix.tsx 66/4208/4287/4527). Nothing in `src/state/` writes a posting directly. `setPostOut` is called only by `postOut`, `undoPostOut` and `restoreBody`. Admin → Users Restore and Archive by hand are different acts, not D1710's.
- **A change due today, run in the same command (probe P2: ran 20 Jul, today 23, moved to 22 Jul).** The pass joins the `lw.postout` as a child. One envelope: the 2 old lines deleted, 3 lines put (Hex's "taken back" line and the two new lines). The child runs inside `write()`, after `postingLinesOf` has already read the old lines, so the new line is never taken back by mistake; the child's `resyncSchedBaseline` runs before the parent has touched the scheduler store; `applyEnd` running twice is harmless by design. Hex ends with 2 unread lines; the new line is unread for him.
- **Overseas Sqn → SANS, and SANS → Overseas Sqn, on a date already past (P3).** Correct: the archive is set and the account suspended.
- **Moved EARLIER (P6, 20 → 18 Jul).** The old line is taken back and an unread "Sat 18 Jul" line comes. The reader agrees with treating an earlier date as a change too: the store already clears the "has run" mark on any date change, so without the take-back the bell would hold two "now SANS" lines for two dates.
- **The presser's read record (P5).** Saber read the stored SANS line, then changed it to "none"; his worked-out "off the manpower" line comes back unread.
- **A refused commit, and the gate.** A refused commit still puts everything back (`landed`). The gate on `lw.postout` is unchanged.
- **Old boolean-form records.** `outcomeOf` reads them, and in any case D56 covers them.

## Finding 1 — Medium — moving a posting that has not run takes back an earlier posting's line

**Setup.** Ranger posted out to Overseas Sqn for Mon 20 Jul; the pass runs: archived, both admins get "Ranger · Mon 20 Jul / Posted out · archived, account suspended". Hex reads it. Saber restores Ranger on Admin → Users with post-in Mon 20 Jul (the date box opens on today). Restore keeps the line as the record. Saber then posts him out as SANS for 3 Aug — a date still to come.
**Action.** Saber moves that new posting to 10 Aug on its Post out sheet.
**Expected.** A posting that has not run made no line, so nothing in any bell changes.
**What happens (probe P7).** Hex's 20 Jul line is deleted and he gets "~~Posted out · archived, account suspended~~ · taken back · Saber", unread — told the first posting was taken back. It was not. Before this commit a date change never touched a bell.
**Cause.** `postOut`'s `changed` never asks whether the posting has run; with `retract` true, `postingLinesOf` takes every stored `po` line of "the current stint" (`n.day > floor`); a Restore on the day after the stint closed reopens it (`openStint`: `{ ...person, to: null, ...clear }`, no `past` entry) — so `floor` is `''` and the first posting's line counts as this posting's. Control (P8 — restored a day later, a new stint) is correct.
**Fix proposed.** Gate `changed` on the posting having run (`poDone` its date; "off the manpower" once its date has come). Red first: restore on PO, post for 3 Aug, move to 10 Aug; expect no "taken back" line and the 20 Jul line kept.

## Finding 2 — Low — a reopened stint: Undo or a change of the next posting takes back the first posting's line

**Setup.** As Finding 1 through the Restore on 20 Jul; then SANS for Thu 23 Jul, the clock reaches the 23rd, the pass runs; Hex reads both lines.
**Action.** Saber moves the 23 Jul posting to 28 Jul (or presses Undo post out).
**Expected.** Only the 23 Jul line is taken back; the 20 Jul line stays as the record (the same promise as the pinned test "an older posting from an earlier stint keeps its line").
**What happens (probe P4).** Both lines are taken back.
**New or older.** Older — the Undo door had it; this fix opens a second door. Finding 1's fix does not cure it, the posting here having run.
**Cause.** `postingLinesOf` finds "this posting's" lines by a stint floor from `rec.past`; a reopened stint has no boundary.
**Fix proposed.** Tie stored lines to the posting: a `poRan` list of dates on the posting record (appended by `markPostingDone`, kept by `setPostOut` while dated, dropped by `openStint`), `postingLinesOf` taking stored lines whose day is in it. Red first: P4, for the move and for Undo.

## Finding 3 — Low — "+ SANS" on: saving a ran SANS posting again unchanged makes a duplicate line

**Setup.** SANS for Mon 20 Jul; the pass has run; Hex reads his line; "+ SANS" switched on — the grid draws Ranger with no window (`to: null`) while the stored record keeps `to: 19 Jul`, `poDone: 20 Jul`.
**Action.** An admin posts him out again from his cell's bid sheet (or the drag-selection's Post out) with the same date and SANS.
**Expected.** Saved unchanged: nothing runs, nothing is told.
**What happens (probe P1).** `setPostOut`'s `same` compares the displayed person (`to === null`) with `to` → false → `poDone` cleared; the posting is due, the pass runs again inside the command and writes a second "Mon 20 Jul / Posted out · now SANS"; nothing taken back (`changed` false). Hex's bell holds two identical lines.
**New or older.** Older — reported because the commit relies on `changed` matching the store's mark.
**Fix proposed (store.ts `setPostOut`).** Judge `same` from the stored record (`state.postOuts[id]`), as `dated()` / `closeStintOnArchive` already do. Red first: the P1 steps; one line after the re-save and a pass.

## On the new tests

Real: tests 1–4 each fail without the fix; test 5 guards against taking back too much. Missing: (a) Finding 1's case; (b) a change on a date already past, run in the same command (P2); (c) the presser who had read the line (P5); (d) Finding 2, for Undo and a change; (e) Finding 3. (a) and (d) fail today; (b) and (c) pass and would pin the behaviour.

Probe file (scratch, outside the repo, not kept): `scratchpad/probe/a.probe.ts` with its own config.
