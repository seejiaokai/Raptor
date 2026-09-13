# Whole-app architectural root-cause plan (13 Sep 26)

A read-only architectural review by BOTH providers (Astra/GPT-6 high; Fable 5.1),
each scanning the whole app for ROOT CAUSES (not individual bugs) and recommending an
order. They **converged** — same causes, same order. Raw outputs were in a scratch dir
that does not persist; this is the synthesis and the plan of record.

## The headline (Fable's framing, Astra agrees)
The app is **one good idea built three times, differently**: a store + write-funnel +
snapshot-undo + storage-door, once each for the **Scheduler, Leave War, and Tracker**.
Nearly every recurring bug family (delete/undo resurrection, phantom amendments, wrong-row
filing, stale-pointer crashes, quarantine leaks, cross-year mislocks, balance refunds) traces
to a handful of structural causes that share **one missing primitive: the app knows only
THAT something changed, never WHAT changed.** Every write mutates a global array in place;
undo, persistence, sync and "is this dirty?" all work by re-serialising the whole world to
JSON and diffing strings.

**The unifying fix:** give the app a **record-level change stream over stable ids** (one
write/command layer). Then global undo, per-row persistence, the Leave War↔inputs sync, and
the future database adapter all become *consumers of one stream* instead of four separate
machines. The owner's already-taken directions (one global undo; ids for inputs/courses; the
shared DB) are correct — this is about the SHAPE and ORDER so nothing is built twice.

## Root causes (merged; Fable RCn / Astra ARCH-n)

| Cause | What (plain) | Fix (architectural) | Fable/Astra |
|---|---|---|---|
| **Identity is partial** | Some records have a permanent hidden id; many are still keyed by their text/position/name, so look-alikes cross and renames move the wrong thing | One `newId()`; every record carries an id; every cross-reference stores the id only (`ground.src→inputId`, `who→personId`, note ids, Course/Syllabus ids, `iid`→UUID). Content keys become display/dedup hints. | RC3 / ARCH-03 |
| **No command boundary; 3 funnels + 2 unfunnelled** | Data lives in big shared piles edited in place; change is detected by photographing the whole pile. PEOPLE and settings bypass the funnel entirely | ONE `commit(txn, {actor, origin})` write layer for all three modules; emits record-level changes; PEOPLE/settings join it; retire the hook-swap/lock idioms | RC4 / (ARCH-02) |
| **Undo = restore a whole-world snapshot, ×3 over shared data** | Three separate Undo buttons each rewind their own photo; the photos overlap, so rewinding one silently changes the others (an LW undo *creates* a scheduler undo step) | Global undo as an **inverse-patch log** over the command stream, scoped to your session + your actions; sync-origin changes are never undo steps; the 3 stacks retire. (NOT a bigger snapshot — that would be thrown away at the DB step) | RC1 / ARCH-02 |
| **Authorization not on every command** | A member can undo an admin's decisions (undo bypasses the guarded writers) | Make authorization a property of every command incl. undo/redo/import/restore; record initiating actor; reset history at real login/logout; recheck permission before reversal | (RC1) / ARCH-01 |
| **One fact stored twice, joined by diff-reconciliation** | "X on leave 15 Jul" lives as an Input AND a war cell; a robot re-compares and copies differences, so every delete/undo/edit is a guess about which copy wins | ONE record of truth per fact: an approved absence is ONE Input; the war shows its own bids + reads approved absences *by id*, never copies. Approve/retract become commands; the sync becomes an event handler on the change stream, not a diff engine | RC2 / (ARCH-02) |
| **Storage stores whole-file blobs, 3 door styles** | The save-to-DB doorway is in place, but whole-file dumps walk through it, not rows — can't write row-by-row; two tabs overwrite each other; "saved in memory" is treated as durable (rename deletes originals before the copy is truly saved) | One record-oriented door (`get/put/delete(collection,id,{version})` + `subscribe`); persistence consumes the change stream; **transactional save** (queued/committed/failed), don't delete sources until durably committed; revision checks + changed-entities-only for two-tab / shared safety | RC5+RC4 / ARCH-04+ARCH-05 |
| **Session/per-week/model entangled; 3 date conventions** | Can't cleanly separate "saved" vs "this week knows" vs "this screen points at"; hand-maintained clear-lists cause stale-pointer crashes; a leave dated "Jul 13" can attach to the wrong year | Landing lives on the ground row (derived, not stored per week); one SessionState registry with a declared reset policy per field; **ISO dates** on the record, labels derived | RC6 / ARCH-06 |
| **Quarantine/legacy machinery is a migration system on unversioned snapshots** | A large safety apparatus protects old-version saved weeks; it keeps growing and it protects demo data the owner said to reset | Under the reset-not-migrate rule: remove it once demo data is reset; the DB step owns migration once, server-side; make "read-only/locked" a record property checked at the ONE commit gate, not at ~12 writers | RC7 / (implied) |

## Recommended ORDER (both providers agree)

1. **Stable identity everywhere** (RC3/ARCH-03). Cheap, independent, start now — everything
   else addresses records by these ids, and it's what Manfred maps his Dataverse keys onto.
   Effort S–M ×~5. *(Already partly on the backlog: [INP-CSID], [TRK-CSID]; add `who→personId`,
   note ids, `iid`→UUID.)*
1b. **Quick independent wins** (RC6 a/b/c, ARCH-06): landing-on-the-row, a SessionState reset
   registry (kills the stale-pointer class), and **ISO dates** (kills the cross-year class),
   and the **`mod:'now'` timestamp fix** (an old input silently becomes "late" after a reload).
   Cheap, no dependencies. Effort S–M.
2. **The one write/command layer** (RC4). The single primitive undo, persistence, sync and the
   DB adapter all consume — build ONCE. PEOPLE/settings join the funnel. Effort M. Depends on 1.
3. **Global per-session undo** as inverse-patch replay, actor+session scoped (RC1/ARCH-02).
   The owner's decision, in the shape that survives the DB and multi-user. Effort L. Depends on 2.
4. **One Absence record** — approve/retract as commands, `bid.inputId`, one roster projection
   (RC2). Dissolves the delete/undo/ownership family at the root. **Design NOW** (it changes the
   Dataverse tables before they're frozen with Manfred); build after 2. Effort M–L.
5. **Record-oriented storage door → Dataverse adapter** (RC5) — the in-app half of the DB step.
   Effort M. Depends on 2, 4.
6. **Remove the quarantine/legacy machinery** (RC7) — with the reset + DB step; migration is
   server-side, once. Effort S–M. **Stop EXTENDING it now.**

## What to STOP doing now (both providers, explicit)
- **No more interim two-system undo patches** — replaced by steps 2–3.
- **No more quarantine rounds** — replaced by step 6 (sunk cost).
- Both act on data the owner has ruled "reset, not migrate."
- The only pre-stack work still worth doing is the small NON-undo guardrails already in
  `2026-09-13-sync-delete-undo-integrity-spec.md` (P2 medical member-filed, P4 clutter-only
  clear-data, P6 Quals ✕ confirm, P7 doc) — and even those are low urgency (pre-live).

## Notes
- Effort sizes are relative: S ≈ a session, M ≈ several, L ≈ a multi-session build with its own review.
- The UI/rendering layer (string builders, perf contracts) is deliberately OUT of scope.
- This plan supersedes the piecemeal ordering; `[GLOBAL-UNDO]`, `[INP-CSID]`, `[TRK-CSID]`,
  `[DB-STEP]` are parts of it. See OUTSTANDING `[ARCH-STACK]`.
