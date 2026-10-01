# Fable — final code read, phase 6 (c) v3 (the holder base), 1 Oct 26

*(Saved from Fable's final message — Fable 5.1, read-only, blind to Astra's report; brief
`2026-10-01-db-readiness-phase6c-check-final-read-brief.md`; the code at `37cb47d1` plus the working tree's first round of
Astra's final-read fixes. Dispositions: the evidence sheet `docs/handpass/2026-10-01-dbr-phase6c-check.md` §The code reads.)*

**Verdict: REVISE — two medium findings, both new in (c), each a small fix; one low (cost); no money defect found; no
missing door found.**

## F1 — MEDIUM — a landing can take the id a stored dead row still holds; the holder's next save of the new day then silently re-mints the live row and its marks vanish

**Where:** `engine/overlay.ts landedRid` (from `landRequests`) and `state/holderbase.ts rederive` (its
`ensureRowIds(base.map(b => b.d))`). `landedRid` avoids only the ids in the VIEW copy — after `reconcileRequestRows` has
removed every dead non-`kept` row. The holder base (and the stored day) still holds that dead row with its id;
`ensureRowIds` de-duplicates week-wide, first seen wins, so once the new day is absorbed beside the old one the pass
re-mints the live row's id — outside any command, and without rebuilding that day's marks (keyed by the OLD id).

**Scenario:** Ranger files a Meeting for Tuesday (row id `r<request>`); Saber saves Tuesday (any edit); Ranger re-dates it
to Thursday — Thursday shows the row with the SAME id; Saber edits anything on Thursday — the pass re-mints Thursday's row.
On a published Thursday the day still reads "1 pending" but the row wears no hollow AL tag, and Saber's own just-typed
change shows no mark, until the request itself changes. New in (c).

**Fix:** in `viewOfWeek`, before reconcile, collect every row id the days carry as handed in (every section, `rowsOf`);
pass it to `landRequests` → `landedRid(id, days, taken)`, starting `held` from it. Test red first: file on Tuesday, save
Tuesday, re-date to a published Thursday, save Thursday — the Thursday row's id and its `gr:3.<rid>.prog` mark unchanged.

## F2 — MEDIUM — after a delete, the pass can change the day's book (sign-offs, parked plans) without moving the command layer's baseline; the next scheduler command absorbs that change as its own, and its Undo is then refused

**Where:** `state/sched-commit.ts afterCommandPass` — `if (changed) { resyncSchedBaseline(); … }` — and `rederive`, whose
`changed` covers the days, the marks and the filings only; `viewOfWeek` hands the LIVE book to `overlayDeletedWeek`, which
strips a deleted man's sign-off and his seat in parked plans in place. Before (c) the delete's own effect resynced
unconditionally — (c) made it conditional: the regression.

**Scenario:** a day signed, one of the four Hex, Hex on no seat of the loaded week from his cutoff; delete Hex — his
sign-off goes (right), the baseline keeps him; Saber's next edit carries "Hex's sign-off removed" as his change, and his
Undo is refused ("Hex has been deleted — that change can't be undone"); a member's Undo would carry a `sched.book` change
and §11 would refuse it.

**Fix:** make the resync unconditional (`resyncSchedBaseline(); if (changed) HOOKS.reflow()`); belt: `rederive` sets
`changed` when `[SCHED.sign, SCHED.signBind, SCHED.drafts]` changed across the view. Test red first: a day signed by a man
with no seat, `deletePerson` him, `schedBaselineClean()` true.

## F3 — LOW — the checks now work a week out on every read; measure before it reaches a phone

`weekctx.ts bundle()` runs `viewOfWeek` on every call (four to five per validation), its seed branch now deep-clones and
works out the seed week whenever an activity request starts in it; `rederive` adds ~4 whole-week serialisations per
scheduler command. Recommendation: `npm run perf` against `9191910b` before "merge live"; if validate timing moved,
memoise `bundle()`'s seed branch per key on `requestsSig() + deletedSig() + …`.

## Explicit negatives (summary of Fable's list)

When the base moves and must not (load, boot, absorb by named days, out-of-band, never for a request's or person's command
or a refused one; the week left and returned; the row writer reads the view); the marks on a published day (target state;
`requestAddMarks` keys match `dayKeys`); every acting lookup of "the request's row" reads `standsOn` / `standingRow`, the
raw readers are issued-document readers or read one day; money (live evidence via `standsOn`, saved weeks via
`standingRowIn`, issued evidence frozen; D18 extras); the landing on a published day; reload agreeing with right after
(F1 the one exception); §11; the doors (no missing door); `kept`; the requests' `acc`; two people at once.

## Questions only the owner can answer (Fable's)

1. A member deletes his request on a published day; the scheduler saves that day; the member then Undoes — the request
   comes back but its row waits for Accept (the plan's stated limit, D98). **Recommendation:** keep as built; say it on the
   look card in one line.
2. A member's remarks-only edit resets the scheduler's hand-set time on the row (rule 6 re-makes all six request fields;
   the old re-link did the same — pre-existing, pinned by a test). **Recommendation:** leave it; raise only if he asks.
