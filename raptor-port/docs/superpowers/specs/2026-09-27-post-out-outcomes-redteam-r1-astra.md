# Astra red-team review — round 1

Reviewed `claude/post-out-outcomes` at `0cf804896d1b` against the brief, D229/D280–D302, the approved mock, current code, and PR #444’s branch. This was a read-only review; no files were changed. The shared worktree acquired unrelated/untracked review artifacts during the read, but the findings below are based on the named commit plus the supplied brief.

## Ranked findings

### 1. Critical — the delete design can leave or resurrect future references

The promise in §4 is not implementable with the proposed seams:

- `stashEditDays` exposes only `p.d` (`engine/weekstash.ts:142-151`). It cannot edit stored signs `p.sg`, sign bindings `p.sb`, or drafts `p.dr`. It also silently returns `false` for preserved, missing, or unreadable weeks.
- Drafts carry their own `d`, `sign`, and `signBind`; clearing only the day array leaves parked references and stale signature bindings.
- An authored seed week that has never been stashed bypasses the sweep. `applyWeekModel` falls back to `weekBundle(v)` (`state/store.ts:474+`), and the no-stash boot path directly lands the seed (`state/store.ts:834-846`). Either can bring the deleted person back after the delete.
- `rowsLeftOut` only protects version/draft switching; it does not guard week-seed loading, boot, or undo/redo.
- The delete only conflicts with earlier undo entries for records it actually changed. If an earlier action removed the person from a future record before deletion, the delete does not touch that record. `applyRestore` then writes the old value without checking deleted-person invariants (`undo/timeline.ts:471+`). Undo or redo can therefore put the person back.

Exact fix:

1. Add a whole-snapshot `stashEditWeek(v, edit)` API whose callback receives the parsed stash object, not only `p.d`.
2. Before opening the delete command, enumerate and parse every relevant stash. If a relevant today/future stash is unreadable or byte-preserved, refuse the entire delete with a visible reason. Do not silently skip it.
3. In one enlisted transaction, sweep:
   - `p.d`;
   - `p.sg` and the corresponding `p.sb`;
   - every `p.dr[di][].d`, `.sign`, and `.signBind`;
   - live days, inputs, parked plans, `PLANPUCKS`, Leave War records, and OIL state.
4. Add `stripDeletedForDate(value, iso)` at every materialization boundary:
   - the stashed branch of `applyWeekModel`;
   - the `weekBundle(v)` seed branch;
   - the no-stash `initStore` path;
   - version/draft restoration;
   - input relanding;
   - plan restoration.
5. Add a proposed-state guard before both undo and redo. Refuse any restore that would introduce a deleted person into a day, input, plan, or parked draft on/after `deletedFrom`. Do not repair silently after restoring.
6. Add adversarial tests for:
   - first visit to an unstashed authored week after deletion;
   - reload with no current-week stash;
   - sign plus `signBind`;
   - parked drafts;
   - remove-before-delete then Undo;
   - add → Undo → delete → Redo;
   - input and plan equivalents;
   - unreadable/preserved future stash causing total refusal with no mutation.

### 2. Critical — three owner decisions are contradicted or decided by the planner

#### Tracker

D299 explicitly says the person’s place on any course still running goes. Section 4.7 instead leaves every Tracker course untouched and files a later question. The missing definition of “running” is a product question, but omitting the ruled behavior is not an acceptable implementation choice.

Fix:

1. Ask the owner now what makes a course “still running”: explicit state, date, incomplete marks, or another rule.
2. Record the ruling before the build.
3. Add the Tracker store to `person.delete`, its permission map, atomic preflight/rollback, and roll-call.
4. Remove the person only from running-course enrolment; preserve finished-course identity, marks, and history.
5. If the owner deliberately defers this, amend D299 explicitly rather than claiming the current plan implements it.

#### Restore/Enable prompt

D284 says the prompt appears when the admin “restores him / enables his account.” Section 8 narrows this to Restore, automatically enables an `offBy:'po'` account, and emits no prompt for Enable.

Fix:

1. Ask whether both Restore and a standalone Enable are “he is back” events.
2. If both are: route them through one back-from-overseas handler, prompt once, and retain the no-change Quals shortcut.
3. If Restore alone is intended: record that narrowing of D284.
4. Do not bake the present interpretation into code before that decision.

#### Which “today” deletes from

The scheduler deliberately uses notional `TODAY = 13/07/2026` (`ui/weeknav.ts:56-62`), while the plan chooses real `localToday()` and consequently treats all July demonstration weeks as past. That is a destructive product decision: the app can visually call 20 July “future” while deletion preserves it as past.

Fix:

1. Put the concrete 13 July/20 July example to the owner.
2. Record whether delete semantics use scheduler-today or wall-clock today.
3. Introduce one named deletion-cutoff helper used by hand deletion, posting deletion, stash sweeping, OIL, and tests.
4. If real time wins, document the intentional mismatch and add a rendered demonstration test. If scheduler time wins, keep the posting outcome’s due check separate from the deletion cutoff.

### 3. High — `callsignHolder` directly violates D286

The plan says a typed callsign resolves to an active roster person, otherwise an archived person (§9.1, lines 296-297). D286 says it resolves to the roster person, never the archived one.

Putting archived people in the one-value `ID_BY_CS` index is also ambiguous once several archived people have reused the same callsign. Legacy string slots could bind an arbitrary archived identity.

Exact fix:

1. Keep `ID_BY_CS` and `indexCallsigns` limited to active roster people and placeholders.
2. Make `callsignProblem` treat active/placeholder callsigns and bare person IDs as occupied, while archived-only callsigns remain available.
3. Add a separate multi-result `archivedCallsignHolders(cs)` for Approve notes and Restore/rename UI.
4. Ensure `nameToId` and `whoId` never resolve an archived-only string.
5. Preserve existing ID-valued schedule rows as the old person.
6. Define legacy strings precisely: unresolved while nobody active holds the callsign; if a new active person later takes it, the string resolves to that active person.
7. Test two archived people plus one new active person sharing the historical callsign across add, approve, rename, restore, search, ground rows, and programme rows.

### 4. High — the SANS design is defeated by PR #444’s double overlay

PR #444’s `reprojectRoster` copies `ex.from`, `ex.to`, and `ex.poArchive` onto each projected person (`leavewar/sync.ts:1275-1294`). It then calls `setPeople`, which lays `postOuts` on again (`leavewar/state/store.ts:1562-1585`).

The plan says `setPeople` will be the one place that suppresses the posting window when Show SANS is on. Unless the first overlay is removed, the person arrives at `setPeople` already carrying `to`, so the old-group posted-out representation survives.

There is also no date-effective SANS field. Ticking global `person.san` moves the entire row into the SANS group, including historical months, whereas D283 says he moves there “that day.”

Exact fix:

1. Remove the `from`/`to`/`poArchive` carry-over from `reprojectRoster`.
2. Make `setPeople` the sole projection of persisted posting windows.
3. For a SANS outcome:
   - Show SANS off: lay `to`, retain the old group, display PO, and do not track leave;
   - Show SANS on: suppress `to` and track him as SANS.
4. Ask the owner whether “moves on that day” requires historically date-effective grouping. If yes, add `sanFrom` and a row/cell representation that can preserve the old grouping before that date. A single global `san` flag cannot meet that contract.
5. Test the actual posting path—not a manually seeded SANS person—before date, on date, and after date, with off → on → off toggles and reloads.
6. Assert `inSquadron`, `availableFor`, `rowInWindow`, manning totals, and OIL behavior in every state.

### 5. High — `sanBy:'po'` can erase a later hand change

The proposed provenance works only if every manual SANS edit clears it. The existing Quals writer changes `p.san` but has no provenance handling (`state/quals-write.ts:64-68`).

Scenario:

1. The outcome pass sets `san=true`, `sanBy='po'`.
2. An admin manually unticks and later reticks SANS.
3. `sanBy` remains.
4. Changing the outcome or undoing Post out clears the administrator’s later manual tick.

Exact fix:

1. In the user-originated SANS write path, delete `sanBy` whenever the user changes SANS.
2. Only the posting reconciler may set `sanBy:'po'`.
3. Outcome change/Undo may clear SANS only while `sanBy==='po'`.
4. Test automatic SANS → manual off → manual on → outcome change/Undo; the final manual value must remain.
5. Test automatic SANS with no manual change; Undo must clear it.

`offBy` and #444’s `archivedBy` otherwise provide the intended hand-change protection, provided every manual Enable/Restore path clears its marker.

### 6. High — the permission map and member-view authority are incomplete

`person.delete` writes the Leave War person/posting profile, but the proposed command row lists `LeaveBid D` and omits `LeavePersonProfile U/D` (§12, line 349). Regular Post out is currently routed through generic `lw.edit`, mapped to `LeaveBid U`; that is not an honest map for a `postOuts`/profile write.

The member-view plan also promotes `setEffectiveRole(role:any)`, currently an unguarded localhost probe hook (`state/auth.ts:21-23`), into a production control. A direct call can change a member session to admin, contradicting the “hand-made call refused” requirement.

Exact fix:

1. Add explicit command types for `lw.postout`, `lw.postin`, outcome selection, outcome undo, and restore.
2. Map each to the actual `LeavePersonProfile` operations it performs.
3. Add `LeavePersonProfile U/D` to `person.delete`, matching the final implementation.
4. Keep the outcome pass a system/reconciler action, but document its exact stores.
5. Replace the production role setter with `switchEffectiveRole(next)` that:
   - requires the authenticated account role to be admin;
   - accepts only `admin` and `main`;
   - never changes `pid` or account identity.
6. Keep any unrestricted probe setter localhost/test-only and out of the production UI export.
7. Test member, guest, pending, suspended, and hand-made calls; all must be unable to acquire admin authority.
8. Test member-view actor stamps, own-row permissions, Leave War role, hidden admin controls, direct commands, and undo.

### 7. Medium — past published days will still show pending

The plan says `attrsOf` will ignore deletion for a past day, but `attrsOf(p)` has no date (`engine/publish.ts:565`). Both comparison paths call `peopleAttrsNow` without a day:

- `warnDelta` at `engine/publish.ts:617-628`;
- the detailed pending list at `ui/pendlist.ts:191-203`.

Changing only one path can leave the banner or detailed explanation saying the old day changed.

Exact fix:

1. Change the comparison API to `peopleAttrsNow(pa, iso)`.
2. For `p.deleted && iso < p.deletedFrom`, return the frozen `pa[id]` value exactly.
3. Otherwise return current `attrsOf(p)`.
4. Pass the exact day ISO from both `warnDelta` and the detailed pending-list builder.
5. Do not remove the person’s key: `null` still compares as a roster change.
6. Test past published, past unpublished, today published, and future published days, including warning banner, detailed rows, signatures, and version preview.

### 8. Medium — Part A is not free of PR #444’s files

Section 13 says Part A touches none of #444’s files. That is false. The delete/undo/input work reaches at least `undo/timeline.ts` and `ui/inputedit.tsx`; both are changed on the #444 branch. The branches also share `scheduler.css`, `HANDOFF.md`, `OUTSTANDING.md`, `rulecheck.mjs`, and several contract documents.

D302 itself has not been forgotten: `HANDOFF.md:24-33` records direct coordination and reciprocal promises. The inaccurate disjointness claim is still unsafe because it can make the implementer ignore merge-time behavioral reconciliation.

Exact fix:

1. Replace “touching none” with an explicit shared-file/function table.
2. Reconfirm with the #444 chat before editing `timeline.ts`, input relanding, shared docs, or CSS.
3. Settle ownership of each overlap immediately and repeat the updated promises in `HANDOFF.md`.
4. After taking #444, reconcile `postOut`, `undoPostOut`, `restoreArchivedPerson`, `runPoArchive`, `reprojectRoster`, and `setPeople` as one behavioral unit.
5. Run the complete posting, absence, undo, input, permission, and rendered Leave War checks after integration.
6. Keep this branch merging last as already planned.

## Answers to the brief’s ten questions

1. **Rulings:** No. D286 is contradicted; D299’s running-course removal is deferred; D284 is narrowed without approval; and the destructive clock choice belongs to the owner. D302 coordination is recorded in `HANDOFF.md`.

2. **Delete completeness:** No. Whole-stash drafts/signatures, unstashed seed weeks, boot, and undo/redo can retain or resurrect the person.  
   **Negative checks:** day templates do not themselves retain crew identities; issued snapshots and their `snap.ros` should remain frozen; copying an already-clean current day introduces no separate path. Those are not findings.

3. **Atomicity:** The command/whiteboard foundation is sufficient if every store is enlisted, all stash parsing/refusals are preflighted, and callback failure throws. Reducer throws roll back; a storage failure leaves the complete journal group queued rather than half-persisting it. Deferred notification prevents projection, Tracker, or callsign readers from observing the middle of the reducer.  
   **Negative:** I found no inherent half-commit defect in the transaction foundation itself. The risk is the plan’s silent `stashEditDays(false)` path and any mutation performed outside the enlisted command.

4. **Past record:** No. Both pending-comparison call sites need the day-aware rule.  
   **Negative checks:** frozen issued bodies, signatures, old schedule IDs, historical Leave War records, and past OIL ledger grants can remain as planned. With date-aware credit eligibility and future-record removal, `rowInWindow` and the OIL reverse sweep do not independently require deletion of past history.

5. **Outcome pass:** Mostly sound for `poDone`, `offBy`, and `archivedBy`, but not sound for manual SANS edits, and Restore/Enable remains an owner decision.  
   **Negative:** hand Enable after auto-suspension is preserved because clearing `offBy` prevents later reversal; changing an outcome/date can safely take back only marked effects; final Delete need not be reversible.

6. **Permissions/member view:** No. The command-to-table map is incomplete and the proposed production use of `setEffectiveRole` is unguarded.  
   **Negative:** after adding the guarded role switch, the existing actor, own-row gates, Leave War role projection, page visibility, and `mayReverse` model are suitable for a real member view.

7. **Callsigns:** No. Archived people must not enter the typed-callsign index.  
   **Negative:** ID-valued historical rows already preserve the old person correctly; one shared `callsignProblem` can cover add, approve, and rename once active indexing and archived lookup are separated.

8. **Leave War/SANS:** No. #444’s first window overlay defeats the proposed single conditional overlay, and historical date-effective grouping is unspecified.  
   **Negative:** `availableFor`, `rowInWindow`, and OIL tracking do not show a separate defect once the correct projected person/window is supplied and future records are removed.

9. **Missing roll-call:** Add untouched seed-week loading, no-stash boot, unreadable/preserved stash refusal, `signBind`, undo/redo resurrection, two archived holders of one callsign, manual SANS override, actual posting-driven Show SANS toggles, direct role-escalation calls, Enable-versus-Restore prompting, running-course deletion, and #444 integration/reload. The mock’s SANS-on frame is not proof of the outcome route because it depicts a fresh/manual SANS world.

10. **Build order:** Part A is not disjoint from #444. Building Part B on #444 is sound only after the overlap table is corrected, the coordinated promises are reconfirmed, and the merged behavior is re-audited as one unit.

**VERDICT: REVISE**

