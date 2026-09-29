# Verdict: BLOCK

The v2 plan is not ready to execute. Three defects can still cause IT to settle the wrong tables or make the migration irreversibly skip data:

1. **R2-01:** the matrix is relationally inconsistent, especially `QualMark` without `Qualification`, and treats variable child sets as fixed.
2. **R2-05:** the proposed `ChangeBatch` cannot contain store-assigned row IDs and versions when it is created before the backend write.
3. **R2-08:** “no plug-in for now” does not settle q9’s reporting requirement; the resulting table shape remains unconfirmed.

## Findings

### R2-01 — BLOCKER — §2.5 matrix; phases 2–4

**Issue**

A-02, F8e and F9 are not completely fixed. The relaxed “parent plus fixed children” rule is applied to children that are not fixed:

- `Person + QualMark`: a person may hold zero to many marks, and `QualMark.qualificationId` must reference a `Qualification` row (`docs/data-model.md:114-149`). But the matrix creates `QualMark` children from `people/<pid>` while keeping `qualcols` as a single `Setting`, so the required `Qualification` rows do not exist (`...group-a-plan.md:93-106`).
- `Input + InputAttachment`: `docIds` is a variable many-to-many relationship, not a fixed child set (`docs/data-model.md:508-518`).
- `LeavePersonProfile + past`: previous posting stints are a variable child list (`docs/data-model.md:900-902`).
- `AccessRequest.seenBy` grows once per admin. The live type is `seenBy: string[]`, and one action updates every outstanding request (`src/state/accounts.ts:71,144-162,536-558`).
- `EditLog.inputIds`, `days` and `wasDays` are variable multi-valued relationships (`docs/data-model.md:561-594`).

There is also a direct field-placement error: the matrix sends the Leave War seat override into `LeavePersonProfile` (`...group-a-plan.md:101`), while the design says that override is dropped because `Person.seat` is authoritative; only `band` belongs in the profile and `sxo` belongs on `Person` (`docs/data-model.md:900-902`).

The matrix also fails to account for reference/stage-1 tables including `InputType`, `LeaveCounter`, `SchemaVersion`, and `TakeOverRequest` (`docs/data-model.md:508-513,678-688,735-745,1178-1184,920-925`).

**Concrete failure**

IT can create `QualMark.qualificationId` as a required lookup but receive no `Qualification` rows to reference. Removing one mark, attachment, past stint, or `seenBy` association would also require inferring a child deletion from a parent payload—the exact inference §2.2 forbids.

**Exact fix**

1. Restrict the fixed-child exception to the genuinely fixed four `IssuedSignoff` roles.
2. Give variable children their own logical records and explicit command changes:
   - `qualmark/<pid>:<qualificationId>`
   - `inputattachment/<iid>:<attachmentId>`
   - `leavewar/stint:<pid>:<stintId>` with a stable minted `stintId`
   - `accessseen:<requestId>:<accountId>`
3. Alternatively, explicitly keep any of those collections as JSON at stage 1 and change `data-model.md` accordingly; do not describe JSON as relational child rows.
4. Create `Qualification` rows at stage 1 from `qualcols`, retaining `key` as an alternate key. If qualification rows are truly deferred, keep marks inside `Person` and defer `QualMark` too.
5. Route both `seat` and `sxo` through the Shell’s `Person` writer. Persist only profile-owned fields in `LeavePersonProfile`.
6. Add every target table to the matrix as app-written, reference-seeded, adapter-owned, or explicitly deferred: at minimum `InputType`, `LeaveCounter`, `Qualification`, `SchemaVersion`, and `TakeOverRequest`.
7. Add create/remove/round-trip tests for each variable child type, including two concurrent admins marking different requests seen.

---

### R2-02 — HIGH — Phase 0; §2.6

**Issue**

F13’s atomic fold is not complete. Phase 0 raises `SCHEMA_VERSION` to 6 and runs “the fold framework with no record types yet” (`...group-a-plan.md:131-136`). Yet §2.6 says a store stamped 6 never examines the old blobs again (`...group-a-plan.md:112-116`).

The current reset gate likewise skips migration once the stored version meets the current version (`src/storage/reset.ts:57-64,83-85`).

**Concrete failure**

A full v5 browser opened against the phase-0 build can be stamped v6 while still containing v5 blobs. When phases 1–4 later add converters, that browser is already v6, so the converters never run. This is not an old-data-only concern: phase 0 itself creates the bad state.

**Exact fix**

1. Phase 0 may build the registry and atomic `putMany` machinery, but must leave the production schema version at 5.
2. Activate version 6 only after all week, people, input, planning, Leave War, edit-log, and account converters are registered.
3. Give the fold an explicit required-converter manifest. Refuse boot without writing the v6 stamp if any converter is missing.
4. Add one full v5 fixture containing every old blob. Verify that the final build produces all new rows, removes every converted blob, and writes the v6 stamp in one group.
5. Add an incomplete-manifest test proving no v6 stamp is written.

---

### R2-03 — HIGH — §2.2; phases 1–3

**Issue**

A-03 states the right delete rule, but the work plan does not specify the mechanism that enforces it.

The current durable paths are snapshot serializers: `persistAll()` rewrites the complete input, people, plan and week worlds and reconciles missing weeks (`src/state/persist.ts:85-119`); Leave War’s `rawPersist()` similarly writes complete coarse values (`src/leavewar/state/store.ts:998-1037`). The revised phases still assign row writing to `persistAll` and `rawPersist` (`...group-a-plan.md:146-150,171-176`).

The command envelope’s precise `before → after` changes become available before phase-9 delivery, while the whiteboard transaction remains open until the causal queue is drained (`src/command/commit.ts:169-180,252-294`). The plan does not use that seam.

**Concrete failure**

If a stale client still has row X after another client deletes X, a split snapshot serializer can put X back while saving unrelated row Y. If it instead enumerates storage to find absences, it can delete unreadable or unknown rows.

**Exact fix**

1. Add a command-stream persistence consumer that runs during phase 9, before the outer whiteboard transaction seals.
2. Translate each `CommitEnvelope.changes[]` entry through a pure logical-record-to-storage-row mapper.
3. Emit a put only for `add`/`update`, and a delete only for an explicit command `delete`.
4. Disable full per-row collection serialization from `persistAll`/`rawPersist` while a command is active. Retain those functions only for boot/fold work and named legacy APIs.
5. Make legacy non-command deletion an explicit method taking the exact row key.
6. Test:
   - client A deletes X; stale client B adds Y; X stays deleted;
   - an unreadable row survives an unrelated command;
   - removing a child mark/attachment produces its exact delete;
   - boot and fold writes remain deliberately unbatched migration groups.

---

### R2-04 — HIGH — §2.9; phase 1.4

**Issue**

F8a/F8c are correct in the storage matrix but incomplete in the command layer.

The “command records follow storage grain” list omits issuance and retraction records (`...group-a-plan.md:124-127`). Today the command layer still exposes `sched.orig`, `sched.als`, and `sched.retired` (`src/state/sched-commit.ts:102-123,638-644`), and its restore writer can delete/update/move those records (`src/state/sched-commit.ts:212-246`).

A generic instruction to update `decompose` and `schedWriteRecords` (`...group-a-plan.md:156-159`) does not say that the move semantics must disappear.

**Concrete failure**

Unpublish can still appear as deleting an active `sched.orig`/`sched.als` record and adding a `sched.retired` record, rather than preserving the immutable issuance and adding one retraction. Undo and conflict checks would use different identities from storage.

**Exact fix**

1. Add logical collections:
   - `sched.issuance/<wk>:<verId>~<reissue>`
   - `sched.retraction/<wk>:<verId>~<reissue>`
2. Represent the Original as issuance sequence 0.
3. Make issuance records append-only. Unpublish adds a retraction and never deletes or rewrites the issuance.
4. Make the join derive `orig`, `als`, and `retired` from those two collections.
5. Update the command registry, types, `schedWriteRecords`, undo derivation, timeline, `LOGICAL_TO_BLOB`, and `sharesKeys`.
6. Test the command envelope—not only stored output—for first publish, amendment, unpublish, same-label reissue, undo, and redo.

---

### R2-05 — BLOCKER — Phase 4.1; A-04

**Issue**

The proposed sealer cannot implement the design’s `ChangeBatch`.

The plan creates the batch before storage and gives each item only its key and operation (`...group-a-plan.md:181-190`). The design requires each item’s table, Dataverse row ID, operation, and **new store-assigned version**, so the writer can refresh its versions without rereading (`docs/data-model.md:1192-1201`). The common rules also make the GUID, platform time and `versionnumber` store-owned (`docs/data-model.md:48-54`).

The current backend entry contains only `{collection,id,value}` and returns no row ID or version (`src/storage/backend.ts:9-30`). A whiteboard sealer therefore cannot know the post-write version—or a newly created row’s Dataverse GUID—when it constructs the batch.

A-04’s alternate-key rationale is sound for stateless CRUD, but not for the `ChangeBatch` contract as presently written.

**Concrete failure**

After a successful write, the client still holds the old version. Its next `If-Match` update conflicts with its own previous save. A batch naming only app keys also does not satisfy a reader expecting the design’s Dataverse IDs.

**Exact fix**

Choose and document one contract before IT settles the table:

1. **Recommended:** make `ChangeBatch` a pure invalidation log whose items are `{table, alternateKey, operation}`. Obtain writer versions from the changeset response or an explicit readback. Use Dataverse `createdon` as `committedAt`.
2. If GUID plus new version must stay in every item, require a server-side operation that performs the row writes, collects their versions, and creates the batch atomically. That is incompatible with the current “no plug-in” assumption until IT confirms another supported server mechanism.
3. Extend the future backend response type to return row acknowledgements/versions; do not fabricate them in the stand-in.
4. Record that Group B must preserve command-group boundaries. The current postman flattens groups into a latest-value map (`src/storage/postman.ts:76-82,100-117`), so it cannot later reconstruct separate per-command changesets after two commands touch the same row.
5. Test two rapid commands touching the same row: both batch records survive, the reader fetches the final row once, and the local version becomes the backend-returned version.

---

### R2-06 — HIGH — Phase 4.3 edit log

**Issue**

F6/F7 are not complete because the current edit-log write occurs after the command transaction seals.

`push()` schedules persistence on a microtask (`src/engine/editlog.ts:113-125,328-337`). The outer command and whiteboard transaction close synchronously (`src/command/commit.ts:169-180`). `elog` is also absent from the guarded settings inventory (`src/state/people-settings-commit.ts:61-70`), so its eventual write takes the raw unknown-key branch (`src/state/people-settings-commit.ts:274-280`).

The plan explicitly says groups sealed outside a command receive no batch (`...group-a-plan.md:181-188`).

**Concrete failure**

A schedule edit can produce:

1. a sealed domain group with its `ChangeBatch`; then
2. a later `settings/elog:<lineId>` group with no batch.

The remote reader never learns about that edit-log row through the change log. The plan’s assertion that every post-boot group has exactly one batch also fails.

**Exact fix**

1. Replace the debounced whole-log save with a synchronous per-line row write when the latched log effect is released, while the outer whiteboard transaction is still open.
2. Mint `lineId` before that write and write `settings/elog:<lineId>` directly; no microtask is needed for independent rows.
3. Load the newest 2,000 rows by `(at,lineId)` at boot.
4. Turn the admin history sweep into a named command that explicitly deletes the selected line IDs, producing one batch.
5. Keep `EditLogSeen` as its own per-person command row.
6. Test that one user edit yields one group containing the domain rows, all edit-log rows, and one batch, with no later group after microtasks drain.

---

### R2-07 — HIGH — Phase 1.3 confinement

**Issue**

F10 is not complete. Phase 1.3 lists the problematic writers but leaves their treatment as “if incidental” versus “if real” (`...group-a-plan.md:151-155`). That is analysis still to be done, not an executable plan.

The current behaviours differ materially:

- `reconcileIssuedMarks()` scans every published day and may remove pending marks there (`src/engine/drafts.ts:645-680`).
- `ensureRowIds(DAYS)` scans and can mutate the whole week (`src/engine/rowids.ts:45-59`).
- `discardPending()` deliberately removes marks from every unpublished day (`src/engine/publish.ts:1116-1129`).
- Loading a week clears and re-lands global inputs, then runs migrations across the restored week (`src/state/store.ts:561-599,659-689`).

One Monday-edit test will not exercise all of these classifications.

**Exact fix**

1. Pass the command’s touched-day set into `reconcileIssuedMarks`; only reconcile those days during an ordinary edit.
2. Let row-ID allocation inspect all IDs for collisions but mutate only newly created/touched rows. Run legacy backfill as an explicit boot migration.
3. Classify `discardPending` as an intentional multi-day command. It must emit/write every affected day and, at the later lock stage, hold every affected day.
4. Remove load-time landing writes from durable day rows when phase 6 introduces the read overlay. Before that cutover, navigation must not silently persist them.
5. Treat format migration as an explicit migration group, never as a side effect of a user edit.
6. Name `person-delete` and `clearOilPersonDecisions` as deliberate multi-week system commands and enumerate all changed days in their envelopes.
7. Add one test per writer, asserting exact changed logical IDs and exact stored keys—not only final day strings.

---

### R2-08 — BLOCKER — Phase 6; §5 question 1

**Issue**

The plan overstates the unconfirmed “no plug-in for now” report. It says that fact settles q9 and makes worked-out-on-read the only route (`...group-a-plan.md:8-11,216-223`), while simultaneously acknowledging that IT still must confirm reporting suitability and that nothing waits for the answer (`...group-a-plan.md:243-246`).

The source note says the information is unconfirmed and still asks whether Custom APIs and Power Automate flows are available (`OUTSTANDING.md:972-978`). More importantly, q9 asks IT to confirm that reports can treat a day as `ScheduleDay + Input + Person`; that confirmation is required before the tables settle (`docs/data-model.md:1352-1360`).

**Concrete failure**

A report querying `ScheduleDay` alone will omit:

- a member’s newly filed input;
- a deleted person’s effect;
- pending landing marks derived from inputs;
- handed-on decisions ignored only at read time.

If IT requires a reportable materialized day picture, Group A has settled the wrong schema. “No plug-in” removes one implementation mechanism; it does not answer the reporting requirement.

**Exact fix**

1. Separate two questions:
   - how the app calculates the live picture;
   - how Dataverse/Power BI reporting obtains that same picture.
2. Phase 6 may prototype the client-side read overlay, but Group A must not be declared table-ready until IT confirms the report can join/recompute it.
3. Obtain written answers on Custom APIs, Power Automate, Dataverse views, and reporting joins/performance.
4. If reports cannot reproduce the overlay, add a materialized projection/view/table with a named owner and writer before the tables settle.
5. Change “nothing waits on it” to: “client implementation may proceed; final schema handoff waits on reporting confirmation.”

---

### R2-09 — HIGH — Phase 5 boot policy

**Issue**

A-06’s decision to retain live singleton identity is sound, but the accepted policy is not completely specified.

The disposition says policy belongs at the composition root, not on the backend. The plan immediately gives `new MemoryBackend({seedDemo:false})` as the interface (`...group-a-plan.md:198-202`), although `MemoryBackend` currently has no such responsibility or option (`src/storage/memory.ts:13-27`).

The reverse-order test also requires restoration, not only emptying. Tracker’s `init()` is one-shot and calls its seed bundle before loading (`src/tracker/app/core.js:5507-5520,6281-6286`); accounts can re-add the seed admin during load (`src/state/accounts.ts:130-141`). Emptying imported arrays in place does not by itself reconstruct the demo world for a later demo boot in the same process.

**Exact fix**

1. Define a `BootPolicy` value at `main.tsx` and pass it separately to Shell, Scheduler, Leave War, Tracker, and account initialization. Keep `Backend` persistence-only.
2. Create immutable seed factories/snapshots. Every boot reset must mutate live exported arrays/objects in place from either:
   - a fresh demo clone; or
   - a fresh blank model.
3. Apply the policy before `accountsLoad`, Tracker `applyBundle`, Scheduler merges, and Leave War initialization.
4. Keep the bootstrap administrator separate from demo accounts and inject it through root configuration.
5. Add an explicit test reset hook for Tracker’s one-shot initialization rather than relying on test-module isolation.
6. Test demo→blank and blank→demo with the same module instances, plus stamped-store boots under both policies.

---

### R2-10 — MEDIUM — §2.3 sparse ordering

**Issue**

F5 is only partly fixed. Sparse stable `ord` avoids dense rewrites, but it does not define a total order when two clients concurrently compute the same `max + 1024` or midpoint (`...group-a-plan.md:73-76`).

**Concrete failure**

Both rows survive, but reload order can differ between clients or backend query plans when their `ord` values tie. That can change first-match input behaviour, roster order, or Leave War record precedence.

**Exact fix**

1. Define display order as `(ord, stableRowId)`, never `ord` alone.
2. Require every hydrate/query to use both columns.
3. Specify lower-bound insertion as well as append and midpoint rules.
4. Make gap renumbering an explicit command containing every row it changes.
5. Test concurrent append and concurrent insertion into the same gap, with deterministic order after repeated reloads.

## Round-1 disposition audit

| Finding | Round-2 assessment |
|---|---|
| A-01 | The refusal to split one causal closure is sound. The accepted exact-batch half remains incomplete because of R2-05/R2-06. |
| A-02 | Incomplete: R2-01. |
| A-03 | Incomplete: R2-03. |
| A-04 | Alternate-key CRUD is defensible; the reason fails for the current GUID/version-bearing `ChangeBatch`: R2-05. |
| A-05 | The `un` placement and set-based comparison are complete. The separate q9 conclusion is not: R2-08. |
| A-06 | Preserving singleton identity is sound. Root policy and deterministic reset remain incomplete: R2-09. |
| F1 | Complete: explicit `settings/booted`. |
| F2 | Complete as planned: known loaded rows force the pristine undo write. |
| F3 | Acceptable as an explicit Group-B deferral, but Group B must replace the lossy group merge before promising one changeset per command: R2-05. |
| F4 | Complete: missing week/day defaults are stated and tested. |
| F5 | Incomplete: R2-10. |
| F6 | Incomplete: R2-06. |
| F7 | Incomplete: R2-05/R2-06. |
| F8a | Incomplete at command grain: R2-04. |
| F8b | The reason is sound for exactly four issuance sign-offs. It is not a valid precedent for variable children: R2-01. |
| F8c | Incomplete at command grain: R2-04. |
| F8d | Complete: opening is per person/counter. |
| F8e | Incomplete and contains wrong profile field placement: R2-01. |
| F8f | Complete: placeholders remain code-only. |
| F9 | Incomplete: R2-01. |
| F10 | Incomplete: R2-07. |
| F11 | Complete at plan level: memoization/reference checks plus performance gates are named. |
| F12 | Complete: unreadable-day protection deliberately remains per week. |
| F13 | Incomplete: R2-02. |
| F14 | Complete: Leave War `remove`/`keys` are now explicit. |
| F15 | Incomplete: R2-09. |
| F16 | Moot disposition remains sound. |
| F17 | Complete: right-side parsing is explicit. |
| F18 | Complete once R2-04’s new issuance/retraction collections are added. |
| F19 | Complete: `null` explicitly removes a settings row. |

Historical focused green results were not treated as clearance; this report is based on direct reads of the current plan, governing documents, and named code.

