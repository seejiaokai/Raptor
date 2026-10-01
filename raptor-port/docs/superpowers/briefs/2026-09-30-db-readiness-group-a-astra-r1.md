# Findings

## A-01 — BLOCKER — Phase 4: one saved group per command

The proposed Postman change cannot create one durable group per command because the command layer has already combined several command pipelines before Postman sees anything.

The outer dispatch opens one whiteboard transaction, runs the root command, drains every queued projection, and only then commits (`raptor-port/src/command/commit.ts:88-97`, `raptor-port/src/command/commit.ts:169-179`). Each queued projection nevertheless creates its own command envelope (`raptor-port/src/command/commit.ts:201-224`). The whiteboard emits only the net change from the outermost transaction (`raptor-port/src/storage/whiteboard.ts:108-145`).

Consequently:

- A root command and its queued Leave War or scheduler projections arrive at Postman as one group.
- Multiple `ChangeBatch` rows can describe separate commands inside that one group.
- Writes by later queued commands can overwrite or cancel earlier writes before emission.
- Replacing Postman’s merging queue (`raptor-port/src/storage/postman.ts:76-127`) cannot recover the lost command boundaries.
- The batch-to-write invariant promised by plan lines 134-146 and required by `data-model.md:1192-1205` is therefore false.

Required fix:

1. Define one durable command as one emitted `CommitEnvelope`; joined `txn.child()` work remains part of its parent command.
2. Give every `runPipeline` invocation its own whiteboard transaction.
3. Let the root pipeline finish all of its deferred effects and subscribers, then commit its whiteboard transaction before `drainQueue()` starts.
4. Open and close a new whiteboard transaction around each drained queued pipeline.
5. Before closing each transaction, obtain its exact non-`ChangeBatch` row diff, create one `ChangeBatch` from that diff, add it to the same transaction, and commit.
6. State explicitly that the batch does not list itself in `items`; otherwise its contents are recursively self-referential.
7. Then make Postman a strict FIFO of immutable groups, retrying a failed head unchanged before sending the next.
8. Add a test where one user command raises two projections. It must produce three separate envelopes, three `putMany` calls, and three matching batches. Also test cancellation/overwrite of the same row across two queued commands and failure of the first send.

## A-02 — BLOCKER — Sections 2 and 3, Phases 1–3: the proposed records do not map one-to-one to target rows

The plan says every stored key maps to one target table row (`db-readiness-group-a-plan.md:61-67`, `db-readiness-group-a-plan.md:80-85`), but several proposed records still require backend fan-out or merging:

- `people/<pid>` still contains data that becomes one `Person` plus several `QualMark` rows; qualification definitions also become `Qualification` rows (`data-model.md:883`, `data-model.md:893`).
- `inputs/<iid>` carries document IDs that become `InputAttachment` rows, while the document drawer becomes `Attachment` metadata plus file-store bytes (`data-model.md:884`, `data-model.md:894`). Current document writes remain a separate fire-and-forget durable path (`raptor-port/src/state/docs.ts:90-107`).
- One issued schedule version becomes one `Amendment` plus four `IssuedSignoff` rows; an unpublish additionally creates `AmendmentRetraction` (`data-model.md:522-547`, `data-model.md:553-560`). A single `weeks/...:al:` or `...:rt:` record cannot be one target row.
- `leavewar/opening:<pid>` contains several counters, while the target has one `LeaveOpening` per person/counter pair (`data-model.md:678-688`, `data-model.md:897`).
- `postout:<pid>`, `personedit:<pid>`, and `perslabels` are three current sources for one `LeavePersonProfile`; `personedit.sxo` instead belongs to the shell-owned `Person` row (`data-model.md:694-715`, `data-model.md:900-902`).
- `ELOG.rows` still needs one `EditLog` row per line, but no phase splits it (`data-model.md:891`).
- The accounts and access-request arrays named in `state/accounts.ts:13-27` are not assigned row-shaped replacements.
- The plan never gives the `Attachment`/file-store writer a command, batch, retry, or failure contract, despite claiming every application write is represented by a command batch.

Required fix:

1. Add a complete matrix covering every stage-1 table: target table, whiteboard collection/key, value fields, owning module, creator, updater, deleter/tombstoner, reader, ordering column, and associated command.
2. Replace the remaining fan-outs with actual logical records:
   - `people/<personRowId>` and `qualmarks/<qualMarkRowId>`.
   - `qualifications/<qualificationRowId>`.
   - `inputs/<inputRowId>`, `inputattachments/<linkRowId>`, and `attachments/<attachmentRowId>`.
   - `amendments/<amendmentRowId>`, four `issued-signoffs/<rowId>`, and `amendment-retractions/<rowId>`.
   - `leave-openings/<rowId>` per person/counter.
   - One consolidated `leave-person-profiles/<rowId>` per person.
   - `editlog/<rowId>` and the required seen-state rows.
   - Explicit User/AccessRequest handling or an explicit, approved exclusion tied to the authentication phase.
3. Route `Person.sxo` through the shell’s one Person writer; do not let Leave War write a separate override record.
4. Specify the attachment transaction: upload provisional bytes first, then atomically write `Attachment`, `InputAttachment`, and `Input`; on transaction failure retain an identifiable orphan for cleanup, and never persist an input that points to missing bytes.
5. Update every decomposer and hydrate/join path to consume these records directly. Do not defer the split to the Dataverse adapter.
6. Add a bijection test that enumerates every stage-1 record type and proves exactly one logical record maps to exactly one table row, with no unexplained fan-out or merge.

## A-03 — HIGH — Section 2.2 and Phases 2–3: “known keys” still infers deletion from snapshots

The plan correctly states that no saver may delete a record it did not itself remove, but then authorizes deletion whenever a key was previously loaded/saved and is absent from the current reconstructed collection (`db-readiness-group-a-plan.md:68-71`, `db-readiness-group-a-plan.md:111-126`). That is still inferred intent.

Absence can result from a rejected or unknown row shape, partial hydration, a failed join, a read-only damaged record, module reinitialization, or a future reader lagging a writer. The plan specially protects unreadable schedule-day bytes (`db-readiness-group-a-plan.md:101-104`) but supplies no equivalent rule for Input, Person, planning, Leave War, account, or attachment rows. It also proposes hard `remove`, while the target model represents deletes as tombstone writes (`data-model.md:54-56`).

Required fix:

1. Remove collection reconciliation as the authority for deletion.
2. Persist a deletion only from an explicit logical `Change { op: 'delete' }` produced by a committed command.
3. Convert that operation to the target tombstone shape, including history fields where required.
4. Keep known-key sets only for unchanged-write suppression and lookup caching; they must never originate a delete.
5. Give boot-time legacy folding explicit old-blob deletion operations after all replacement rows have been durably written.
6. Preserve unreadable or unknown rows opaquely across every collection, not only schedule days.
7. Test malformed current-shape Input, Person, Leave War, and planning rows; an ordinary edit elsewhere must not delete them.
8. Test explicit delete, undo restore, failed delete retry, and a stale client adding another row after a remote deletion.

## A-04 — HIGH — Section 2.5: stored identities are not target row identities

The target model requires every table row to have a stable opaque GUID, never a name, position, date, or composite key (`data-model.md:51-57`). The plan instead uses `people/<pid>`, `plan/dm:<iso>`, `weeks/<wk>#<di>`, `opening:<pid>`, and several multi-part Leave War addresses as record identities (`db-readiness-group-a-plan.md:80-85`).

Those can be useful alternate keys, but they cannot also be the target row IDs. This matters immediately because `ChangeBatch.items` must name the actual target row ID. Leaving GUID assignment to Group B would require a durable identity map and make the adapter stateful rather than the thin mapping promised by the plan.

Required fix:

1. Mint and persist a GUID row ID when each record is first folded or created.
2. Key whiteboard row records by that stable row ID.
3. Store week/date/day-index/person/counter/version addresses as ordinary fields or alternate keys.
4. Preserve current IDs such as `pid`, `iid`, and `versionId` as `legacyKey` or domain-key columns where required.
5. Maintain in-memory indexes from current application addresses to row IDs for existing readers.
6. Put the same row IDs in `ChangeBatch.items`.
7. Test renames, date/display changes, reordering, and same-label amendment reissue; none may change the row ID.

## A-05 — BLOCKER — Phase 1 versus Phase 6: q9-dependent table shape is being implemented before q9

Holding the large reader rewrite until IT answers q9 is correct, but the plan does not actually hold the shape decision.

Phase 1 already decides that `un` is not stored and is reconstructed at load (`db-readiness-group-a-plan.md:94-100`). Phase 6 then lists deriving `un` again and acknowledges that q9 changes the shape of the pending-mark, landing, and person-deletion work (`db-readiness-group-a-plan.md:165-174`). The plan nevertheless says Phases 1–5 can land before that answer (`db-readiness-group-a-plan.md:176-180`).

Current `un` is not an incidental cache: it records an explicit removal and prevents that input from being automatically landed again on reload (`raptor-port/src/state/store.ts:429-461`, `raptor-port/src/state/store.ts:589-598`). The proposed test is also internally inconsistent: it requires split/join to be byte-identical while intentionally dropping `al` and `un`.

Required fix:

1. Obtain and record the q9 answer before finalizing the ScheduleDay/Input decision-record shape.
2. Decide which persisted row owns an explicit input-removal decision and which actor—client or server—computes landing effects.
3. Update the target field map and ownership rules from that answer.
4. Only then implement Phase 1 splitting.
5. If `un` is proven derivable, replace the impossible byte-identical assertion with two tests:
   - all retained fields round-trip byte-identically;
   - derived removal decisions reproduce behavior for reload, week navigation, undo, spanning inputs, and published/reopened days.
6. If it is not derivable, store the decision at day grain keyed by input ID; do not keep a week-wide hidden exception.
7. Remove the duplicate Phase 6(a) work item and state exactly which later reader changes remain blocked by q9.

## A-06 — HIGH — Phase 5: seed suppression misses live seed paths and will reseed row-shaped Leave War data

`seedsDemo` is modeled as a backend capability and implemented by mutating module-level seed values in place (`db-readiness-group-a-plan.md:148-157`). Seed behavior is an application boot policy, not a property of storage transport, and in-place mutation makes later boots and tests process-order dependent.

Several forward seed paths are not safely covered:

- `accountsLoad()` restores the seed accounts on a missing key and repairs a stored list by inserting the seed admin (`raptor-port/src/state/accounts.ts:115-142`).
- Tracker creates and writes the default course when none exists (`raptor-port/src/tracker/app/core.js:1024-1031`).
- Tracker’s reset migration explicitly recreates `STUDENT A` and `STUDENT B` (`raptor-port/src/tracker/app/core.js:1613-1657`).
- Main decides whether the Leave War is fresh solely from the legacy `leavewar/wars` blob (`raptor-port/src/main.tsx:56-61`). Phase 3 removes that blob, so the next boot of a valid row-shaped store reports “fresh” and `installDemoWorld` overlays demo data (`raptor-port/src/demoworld.ts:168-234`).
- The plan contradicts itself by saying the default course stays at line 156 and requiring no course to appear at line 162. That is a product choice, not a technical assumption Astra should make.

Required fix:

1. Introduce an immutable `BootProfile`/`SeedPolicy` chosen by the composition root, independent of backend type.
2. Pass it explicitly to scheduler, Leave War, accounts, Tracker, and demo-world initialization.
3. Never empty or rewrite module-level fixtures. Construct fresh blank state for a no-demo boot.
4. Add a durable initialization/schema marker. Determine freshness from that marker, not the presence of one legacy data key.
5. During Phase 3 folding, write the marker with the new rows before deleting the old blobs.
6. Gate `accountsLoad` fallback repair, Tracker `loadCourses`, reset/migration demo students, all Leave War fallbacks, scheduler examples, and `installDemoWorld` on the same policy.
7. Ask the owner/IT explicitly whether an empty shared store should contain the shipped default Course. Make lines 156 and 162 agree with that answer.
8. Test:
   - no-demo boot followed by demo boot in the same process;
   - demo boot followed by no-demo boot;
   - two consecutive no-demo boots;
   - a store containing only new Leave War row keys;
   - an initialized but deliberately empty Leave War;
   - Tracker migration/reset under no-demo policy;
   - account recovery under no-demo policy.

# Verdict

**BLOCK**

The plan should not be executed until the following three issues are corrected:

1. Move the whiteboard transaction boundary so each command envelope produces exactly one independently durable group and one matching `ChangeBatch`.
2. Produce a complete one-logical-record-to-one-target-row map, including qualification marks, issued sign-offs, retractions, attachments, Leave War profiles/openings, edit log, and account/access records.
3. Resolve q9 before freezing the ScheduleDay/Input storage shape; Phase 1 cannot safely precede that decision as currently written.

