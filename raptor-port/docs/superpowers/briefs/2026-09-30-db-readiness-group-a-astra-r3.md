### R3-01 — BLOCKER — Phase 1.3, `sched.load`

**What is wrong**

The round-2 fix still turns week navigation into destructive row changes.

`schedStore.decompose()` assigns every decomposed record to the current global `CURWEEK` (`src/state/sched-commit.ts:84-90`). `loadWeek` changes `CURWEEK` before installing the arriving model (`src/state/store.ts:632-640`). If the store is enlisted before that transition, `deriveChanges()` compares week A’s keys with week B’s keys and emits deletes for every A record plus puts for every B record (`src/command/commit.ts:376-390`).

The proposed phase-9 consumer would therefore physically delete the week just left whenever `loadWeek` is wrapped as the planned `sched.load` projection (`docs/superpowers/plans/2026-09-30-db-readiness-group-a-plan.md:184-186`).

**Exact fix**

1. Do not enlist `schedStore` across a `CURWEEK` change.
2. Make ordinary week navigation read-only: finish any already-recorded writes for week A, change `CURWEEK`, and hydrate week B without emitting row changes.
3. After week B is installed but before re-landing, establish a fresh scheduler baseline whose before- and after-images both use week B’s identity.
4. Run only the actual landing delta as `sched.load`; persist only B rows changed by that delta.
5. Keep format conversion as its own explicit migration command.
6. Remove the full-snapshot persistence currently reached through `weekSwapEnd` once row persistence is active.
7. Add tests proving:
   - A→B navigation emits no deletes for A.
   - Navigating to an unchanged B writes nothing.
   - Re-landing changes only its exact B rows.
   - An unsupported/preserved B remains byte-identical.
   - Phase 6 produces no durable `sched.load` rows.

**Disposition: PLAN-FIRST.** The current instruction directly causes deletion of valid data and must be corrected before implementation.

---

### R3-02 — HIGH — Sections 2.2/2.3 and Phase 3, `lw.cell` projection

**What is wrong**

The round-2 fixes remain incomplete in two connected ways.

First, `lw.cell` is still an aggregate logical record containing the entire `WarRec[]` for one address (`src/leavewar/state/store.ts:1095-1115`). Removing one bid from a cell that still contains another bid changes that logical record with `op: put`; it does not produce a logical delete. The plan nevertheless allows physical removes only for an explicit logical `delete` (`plan.md:71-79`). The removed `LeaveBid` row would survive indefinitely.

A move is worse: it changes two `lw.cell` aggregates, so mapping changes independently can produce a delete and a put for the same physical `leavewar/rec:<warId>:<recId>` row instead of the promised single-row update.

Second, the matrix requires `LeaveBid.sortIndex`, but no Leave War apply-end allocates it. Existing `WarRec` variants have no ordering field (`src/leavewar/engine/warrecs.ts:91-107`), while the Phase 3 checklist only says that `lw.cell` maps to records (`plan.md:207-214`). New rows therefore cannot satisfy the declared `(sortIndex, key)` ordering.

**Exact fix**

1. Map all `lw.cell` changes at envelope level, not independently.
2. Expand every changed cell’s before- and after-list into maps keyed by physical `(warId, recId)`.
3. Diff those maps:
   - after-only or changed → one put;
   - before-only → one delete;
   - unchanged → nothing.
4. Coalesce across source and destination cells before emitting operations, so moving one `recId` becomes exactly one put with its new person/date.
5. Add `ord` to every durable `WarRec`.
6. In a Leave War command apply-end, allocate a missing `ord` between the target cell’s neighbours; retain it for ordinary edits and choose a new target position for a move.
7. During the v5 fold, assign sparse `ord` values from the existing array order.
8. Hydrate and render using `(ord, recId)`.
9. Test removing one of two records, removing the last record, moving a record, updating one record, concurrent insertion into one cell, reload order, and the exact `ChangeBatch.items`.

**Disposition: PLAN-FIRST.** The mapper’s stated delete rule is technically false for this aggregate-to-row conversion; the plan must define the envelope-level diff before coding.

---

### R3-03 — BLOCKER — Sections 2.6/2.8 and Phase 5, boot metadata

**What is wrong**

V3 conflates three different concepts and cannot create a valid empty shared store.

The current reset stamp is an integer application-format version (`SCHEMA_VERSION`, presently 5; `src/storage/reset.ts:39-40,60-68`). The plan advances that format to 6 and maps `settings/schema` directly to `SchemaVersion` (`plan.md:121`). But the target `SchemaVersion.stage` accepts migration stages 1–4, not application format numbers (`docs/data-model.md:735-744`). Writing 6 into `stage` creates an invalid target row.

The independent initialization marker `settings/booted` is then declared to have no target table (`plan.md:122,143-145`). Once the adapter replaces the stand-in, there is nowhere durable to record “initialized but intentionally empty.”

Finally, the proposed bootstrap admin is underspecified (`plan.md:239-251`). A `User` requires a valid, unique `personId` (`data-model.md:748-756`), but a genuinely blank shared store has no `Person`. Creating only the configured admin either violates the foreign key or quietly borrows demo data that `seedDemo:false` is meant to exclude.

**Exact fix**

1. Make `SchemaVersion` the single durable metadata row with separate fields:
   - `stage` — target migration stage, initially 1;
   - `dataFormatVersion` — stand-in/fold format, initially 6;
   - `initialized` — whether first-boot policy has completed;
   - `appliedAt`;
   - `minClient`.
2. Store the same object under `settings/schema` in the stand-in; stop storing a bare number.
3. Remove `settings/booted` as a separate durable record. Use `initialized` everywhere currently reading or writing it.
4. Make reset/fold decisions compare `dataFormatVersion`, never `stage`.
5. Define the bootstrap configuration as either:
   - a principal plus a complete `Person` definition; or
   - a principal plus an explicitly pre-provisioned `personId`.
6. On a truly empty shared store, atomically create the bootstrap `Person`, its `User`, and initialized metadata. Mark `initialized` only if all three land.
7. Make the operation idempotent and fail closed on incomplete configuration.
8. Test stage 1 with format 6, initialized-but-domain-empty boot, interrupted bootstrap, repeat bootstrap, wipe/reseed, a store ahead in stage, and a store ahead in format.

**Disposition: PLAN-FIRST.** This changes the target metadata columns and the root configuration contract.

---

### R3-04 — HIGH — Sections 2.4/4 and Phase 4.4, access-request seen state

**What is wrong**

The round-2 “one row per admin” fix still has no target table.

The matrix moves `AccessRequest.seenBy` to `settings/reqseen:<accountId>` (`plan.md:118,233-236`), but gives that key no table of its own. It cannot correctly fall through to `Setting`: that table is configuration with a required scope limited to `scheduler|leavewar|tracker` and has no relationships (`data-model.md:717-730`). Meanwhile, the target model still retains `AccessRequest.seenBy` as a many-reference field (`data-model.md:767-785`).

This leaves the stand-in and target shapes irreconcilable.

**Exact fix**

1. Add `AccessRequestSeen`, owned by Shell.
2. Give it:
   - `userId` — required reference to `User`, unique;
   - `seenRequestIds` — JSON array of request IDs.
3. Map `settings/reqseen:<accountId>` explicitly to that row.
4. Remove `AccessRequest.seenBy` from the target entity and field map.
5. Add own-row permissions for an enabled admin to create/read/update their row.
6. Cascade or explicitly remove the seen row when its `User` is deleted.
7. Test two admins marking different sets concurrently, one admin revisiting, request deletion, account deletion, and stand-in-to-target round-trip.

**Disposition: PLAN-FIRST.** IT needs the missing table, relationship, ownership, and security definition before the schema can settle.

---

### R3-05 — HIGH — Phase 4.1, Tracker undo/redo

**What is wrong**

The claimed exhaustive post-boot writer inventory omits a known raw user-action path.

The plan says every post-boot group carries one `ChangeBatch`, exempting only Tracker first-mount seed and migrations (`plan.md:216-224`). But Tracker deliberately disables command routing during legacy undo/redo: `TRK_RESTORING` selects the raw branch (`src/tracker/app/core.js:260-266,560-568`), and the code identifies it as the only post-boot raw path (`core.js:420-428`). `applyHist` and `restoreSnap` then persist layout, marks, dates, pace, and lulls through that raw path (`core.js:2811-2824`).

A real user Undo therefore creates a saved group without a `ChangeBatch`; another client will not be invalidated.

**Exact fix**

1. Add named `tracker.undo` and `tracker.redo` restore commands.
2. Enlist `trkStore` before applying a history snapshot.
3. Apply all affected in-memory Tracker records synchronously inside one command.
4. Mark the command `origin: restore` so it does not create another user undo step.
5. Let the phase-9 consumer perform persistence; do not call the raw asynchronous save helpers from the reducer.
6. Retain loop-suppression if necessary, but it must no longer disable command routing or the persistence consumer.
7. Test layout undo, single-student undo, group undo, redo, and deletion restoration; each must produce exactly one domain group and one matching `ChangeBatch`.

**Disposition: BUILD-CHECKLIST.** This can be fixed safely during construction as named checklist item `P4.1-TRACKER-RESTORE`; it does not require a table-shape decision.

## Verdict: BLOCK

The plan must be revised before building. The top three blockers are:

1. `sched.load` can delete the week being left.
2. Format version, migration stage, initialization, and bootstrap identity do not form a valid target boot contract.
3. `lw.cell` cannot be mapped per logical change without leaving stale or contradictory `LeaveBid` rows.

