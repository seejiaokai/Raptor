# [CMDL-FINISH] — plan-review log

Append-only transcript of the cross-provider red-team of
`2026-09-17-arch-stack-cmdl-finish-design.md` (Rev 1).

## Setup
- **Task:** ARCH-STACK step 2 completion — finish the command layer for Leave War + Tracker.
  DESIGN review only (no build). Gates `[GLOBAL-UNDO]`.
- **Host / coordinator:** Claude (Opus 4.8, fast mode), this session.
- **Reviewers (both, per owner standing rule "red-team important plans across BOTH Claude and
  Codex"):**
  - Codex / GPT-6 Astra (high) — via the claudex-loop runner (`review`, host=claude,
    `--model gpt-6-astra --effort high`).
  - Fable 5.1 (high) — parallel in-session subagent (a Claude-family model, outside the Codex runner).
- **Scope / focus:** the F1 causal-envelope mechanism (§2 — causalSeq + `commitProjection` routing of
  the LW persist sync/nested branch), the per-record `write()` seam (§3), Tracker gesture grouping
  (§4), and the scope calls (§6 — off-week refusal + `clearHistoryData` routing; GU-005 deferral).
- **Authorization:** design + red-team only (owner, 17 Sep 26). No build, no branch, no merge until
  Rev 2 is red-teamed clean and the owner has been shown the plan. Round limit: 5.
- **Model note:** requested Codex=gpt-6-astra/high, Fable=claude-fable-5-1/high; observed identity
  recorded per round below.

---

## Round 1 — launched
(both reviews launched in parallel; results appended below on completion)

### Round 1 — Codex / GPT-6 Astra — VERDICT: REVISE
- Runner: claudex-loop `review --host claude --model gpt-6-astra --effort high`; CLI codex-cli 0.154.0.
  Plan SHA256 `a023379f0191e00230af7cdf77356dbda8a7ec768a31304c015a4118ab206917`; checkout `b25d654`
  (plan untracked). Static read-only. (The runner's console pretty-print hit the known Windows charmap
  error on a Unicode arrow; the structured `result.json` is intact — findings below, verbatim essence.)
- **Summary:** the plan does not yet establish complete causal closures or safe record restoration.
  Material gaps in LW notification timing, queued lock context, rollback persistence, Tracker
  before-images, and gesture coverage.

| id | sev | the gap (file:line) | disposition |
|---|---|---|---|
| CMDLF-001 | high | **F1 timing hole.** §2.1 assumes LW reconciliation runs during the originating command's phase-8 notify. But `updateWar`/`setCellRange` call `persist()` THEN `notify()` SEPARATELY (`store.ts:1275-76,1876-77`) — the persist command has returned and cleared `causalSeq` before `notify` runs `runOutbound`. So an LW-originated approval still emits an outbound projection with **no `causedBy`**. | ACCEPT — the make-or-break. Rev 2 must carry the causal token from the persist command into the following notify (or bring the notify into the transaction). |
| CMDLF-002 | high | **Queued commit loses suppression context.** `QueuedCommit` stores no context. An inbound phase-8 callback `locked()`→queues `lw.sync`→returns; `locked()` restores `HIST.lock` and `runInbound` clears `SYNCING` BEFORE `drainQueue` runs `rawPersist` → `recordHistory` sees `HIST.lock=false` and pushes an LW undo step / truncates redo for a Raptor-driven projection. | ACCEPT — queued projection commits must capture+reinstall the LW lock/sync context (registerEffectContext alone covers deferred effects, not queued reducers). |
| CMDLF-003 | high | **Durable write before validation.** The joined LW reducer/write adapter call `rawPersist` (immediate backend write + legacy history) BEFORE phase-5 validation; `lwStore.restore` restores only `state`/`LW_BASELINE`. A parent throw / `expectedRevs` fail emits nothing but the whiteboard keeps the deleted bid (`storage/adapters.ts:22`, `whiteboard.ts:39-44`). | ACCEPT — separate mutation+baseline from persistence/history/notify; release those only after validation, discard on rejection. Restructures the LW persist model. |
| CMDLF-004 | high | **Tracker `mem` is not the record source.** `mem` starts empty; `sGet` never populates it; `loadStudent` reads marks/dates into separate live maps (`core.js:1460-78`). Editing existing marks emits a put with no `before`; deleting an untouched stored key emits nothing (`trkDelete` needs `k in mem`, `:3696`). | ACCEPT — hydrate the command record source from durable storage before enabling TRK commands; ensure cross-course delete/import scan keys have before-images. |
| CMDLF-005 | high | **`trkStore.write` writes the wrong place.** UI + saves read live bindings (marks/dates/roster/SYL/byid/plan/layout), not `mem` (`:271-286,1460-89`). Restoring a marks record into `mem` leaves the grade unchanged; next `saveMarks` overwrites the restore; `notify` doesn't rebuild the imperative board. | ACCEPT — collection-specific adapters updating live bindings + derived indexes + repaint, with post-validation ordering + error contract. |
| CMDLF-006 | high | **Gesture inventory incomplete.** §4 omits multi-record actions: `renameStudent` (per-syllabus rosters `:3591-3600`), `addCourse` (courses/plan/rosters `:3846-49`), `addSyl`/`dupSyl` (defs/layout/catalogue/order/plan `:3989-94,4012-17`) — each still multiple user envelopes. | ACCEPT — extend the inventory to ALL durable writer call graphs; group each rename/create/duplicate incl. its plan change. |
| CMDLF-007 | high | **People-side reconcilers omitted from the causal inventory.** `runPoArchive` (both lanes) sets `PEOPLE.archived`+`persistPeople` → separate user command when idle, or raw+baseline advance when committing (`people-settings-commit.ts:151-53`); `restoreArchivedPerson` likewise. Neither joins the LW action's closure. | ACCEPT — add an enlisted People projection path for auto-archive/restore + trace `reprojectRoster`/`setPeople`; group both standalone and callback-during-delivery cases. |
| CMDLF-008 | high | **Off-week routing can't be atomic without a stash view.** Moving `stashDrop` into `writeInputsBatch` doesn't capture it: `schedStore` snapshots `histSnap` = loaded world only, no WEEKSTASH/PRESERVED (`history.ts:60`). A stash-only clear emits no changes and a rejection can't restore the dropped week; `stashDrop` also deletes the preserved recovery blob (`weekstash.ts:51-59`). | ACCEPT — either build a minimal enlisted stash view (records+before-images+restore, incl. preserved blobs + cache invalidation) OR keep `clearHistoryData`'s drop explicitly NON-atomic and documented; do not claim it routed. |
| CMDLF-009 | med | **`write(entry)` has no delete semantics.** Reversing a newly-created input/person/bid/AL requires REMOVING the record, not setting a value; `RecordEntry` has no op (`command/types.ts`). | ACCEPT — define put/delete write ops (or a remove method) + create→delete / delete→restore tests. |
| CMDLF-010 | med | **Guarding order contradiction.** P2 registers `lwStore` guarded before P3 fixes the raw nested path, while §§2.2/9 say keep it UNGUARDED; at the P2 boundary deleting an LW-backed input changes LW via the locked raw fallback without enlisting → `guardCheck` rejects the scheduler txn. | ACCEPT — move guarded registration into the completed-routing phase (P3+), or don't guard lw/trk; pick one policy. |
| CMDLF-011 | med | **Input array position not recoverable.** `inputs/<iid>` carries only the row value; INPUTS order is meaningful (`runInbound` keeps the first value per portion, `sync.ts:539-565`); writers use push AND unshift → restoring an overlapping input at the wrong position changes which leave code wins despite record-map equality. | ACCEPT — represent input ordering explicitly (a stable order field / enlisted order record) and restore it; test delete/restore of overlapping inputs against reconciliation, not just unordered equality. |

**Coverage:** command dispatch/child-join/queue/latch/guard/rollback/revisions/permissions/registry/
MemoryDoor; LW persistence/history/notify/inbound/outbound/OIL/roster/post-out; Tracker
reads/writes/deletes/init/live-load/student/course/syllabus/import/Save; scheduler decompose/publish
ids/People+settings adapters/histSnap/input-delete/clearHistoryData/weekstash/whiteboard; Step-2 +
global-undo design/review + existing LW/Tracker command tests. **Limitations:** static only, no
build/tests/scenarios run.

**Coordinator read (pre-Fable):** the through-line is that Rev 1 under-specified TWO things the shipped
code makes harder than the paper assumed — (i) the F1 causal join must survive the LW
`persist()`-then-`notify()` split and the queued-commit context teardown, and mutation must be
separated from durable persistence so a rejected causal command truly rolls back; (ii) the Tracker
record source (`mem`) is a lazily-populated mirror, not the live bindings, so both change-derivation
(before-images) and `write()` restoration need real per-collection adapters, and the gesture inventory
must cover rename/create/duplicate. Plus: People-side reconcilers join the causal inventory (007),
`write()` needs delete semantics (009) + input ordering (011), off-week atomic routing needs a stash
view or an honest non-atomic deferral (008), and guarded registration moves to the completed-routing
phase (010). Holding arbitration until Fable lands to fold both.

### Round 1 — Fable 5.1 (high, in-session subagent) — VERDICT: REVISE
Deep static read against `b25d654` with exact file:line + step-by-step fix specs. 6 high, 6 med,
3 low. **Strong convergence with Codex** on every load-bearing item; adds a core dispatcher bug and
sharper mechanism detail. It also VERIFIED several Rev-1 claims as correct (Gap-2 child-join works;
`deleteEvents`/`delCourse` single-envelope; `verId` on every AL; `LW_READY` after boot).

| id | sev | finding (evidence) | maps to Codex | fix spec |
|---|---|---|---|---|
| C1 | high | **LW→Raptor ripple never chained.** LW `notify()` has no `deferEffect` (`store.ts:961-64`); every writer runs `persist(); notify()` sequentially (48 sites); `persist()`'s `cmdCommit` completes phases 8/9 + `drainQueue` before returning → the writer's `notify()` fires at phase **idle** → `runOutbound`/`runInbound` commits at idle → orphan, `causedBy` undefined. §2.1(a) causalSeq only helps phase-8/9 commits, never fires here. | CMDLF-001 | Split `notify`→`rawNotify`+wrapper; in `persist()`'s USER branch defer the notify INSIDE the command (`cmdDeferEffect(rawNotify)`) so subscribers run in phase 8 with causalSeq live and enqueue with `causedBy`; replace the 48 `persist();notify()` with `persistNotify()`; bare `notify()` for view-only setters; non-ok result → inline `rawNotify()`; LOCKED branch keeps notify inline (C5). |
| C2 | high | **Tracker `mem` is a session write-log, not persisted state.** `const mem={}` (`core.js:138`); `sGet` never mirrors; only writes touch `mem`. → first `sSet` on a key records a put with **no `before`**; `trkDelete` only fires `if(k in mem)` (`:3696`) → destructive deletes of never-written keys emit nothing. | CMDLF-004 | Seed `mem` from `storage.list()`+`get` at `trkRegisterCommands` (`:4942`); mirror in `sGet` (`if(r) mem[k]=r.value else delete`); drop the `(k in mem)` gate. |
| C3 | high | **Per-record `write()`+persist+notify re-enters reconcile on a half-restored world.** LW splits a cell into `lw.cell`+`lw.bid`; writing the cell then notifying wakes `runOutbound` with `SYNCING` false on a stateless cell → stray projection. Scheduler: `days`+`sched.book` pair → N `histPush`/`persistAll`/`validate` on a half-applied world. | CMDLF-005 | Batch-shape the seam: `write(entries[])` (or begin/write/end) — apply all records, THEN one rebuild + one persist + one `HOOKS.histPush` + one notify; LW batch under `HIST.lock`+C4 flag. |
| C4 | high | **LW legacy undo mislabelled `projection`.** `historyApply` calls `persist()` under `locked()` → the router sends any `HIST.lock` write to `commitProjection` → an LW undo emits a `projection` envelope + wakes reconcilers (orphan projections). `HIST.lock` can't tell restore from reconcile. | CMDLF-002 (related) | Add `LW_RESTORING` set by `historyApply`; `persist()` checks it FIRST → `rawPersist` off-stream (mirrors scheduler `histRestore→resyncSchedBaseline`) until F4 makes `lwUndo` unreachable. Do NOT emit `restore` origin here. |
| C5 | med-high | **Per-cell enqueue: N cells → N queued projections** (first carries all, N−1 empty), each paying `guardSnapshot` over every guarded store; a 30-day leave = 30 whole-world serialisations ×2. Persistence now lags to drain. | (cost of CMDLF-001 fix) | Coalesce: in the locked branch when `phase==='post'`, enqueue at most ONE projection/turn (`LW_PROJ_PENDING`, cleared in apply). Keep notify INLINE in this branch (the `SYNCING` door depends on it firing while `SYNCING` true). |
| C6 | high | **Core bug the design widens: a throw in phase 8/9 leaves the queue populated.** `runPipeline` rethrows (`commit.ts:191`); `dispatch` (`:103-110`) skips `drainQueue()`; stale items drain on the NEXT unrelated commit with their captured `causedBy`; `done` promises hang. Today only `writeInputsBatch` lands there; the design routes every reconciler write through it. | — (new) | `dispatch`: `try{result=runPipeline()}finally{try{drainQueue()}finally{phase='idle';active=null}}` — drain even after a throw (each drained pipeline is isolated), then rethrow. |
| C7 | med | **`schedStore.write` under-specified where it corrupts.** (a) records key by `CURWEEK` → a foreign-`wk` write must REFUSE, not splice into `DAYS[di]`; (b) must be `HOOKS.histPush` not raw (persistence funnel); (c) `inputs/<iid>` carries `acc` (F7); (d) `sched.orig`/`sched.als` put-once. | CMDLF-009/011 (related) | `write()` throws `wrongWeek` for foreign wk; `HOOKS.histPush`; land `acc` verbatim (F7 stripping = undo step's job); gate issued-record writes behind `{allowIssued:true}` only the restore path passes. |
| C8 | med | **`trkStore.write` sets `mem` only; UI reads module lets** (`marks/dates/roster/SYL/layout/plan/pace/lulls` from `loadCourse`, `:283-286`). Restated GU-007 defect. | CMDLF-005 | After `mem[k]=v`+`storage.set`: if key is current course+syllabus, re-apply into the live let (+`loadEdgeMeta`/`refreshSyl`) then `renderBoard/renderSide/notify`; other courses → storage only. |
| C9 | med | **Guarding lw/trk: signature cost + blind spots.** `historySnap()`/full-`mem` JSON would run on every commit; `historySnap` omits `postOuts/groupColors/personEdits` that `lwDecompose` includes → guard blind. | CMDLF-010 | `signature()` = a monotonic durable-version counter bumped in `rawPersist`/`restore` (LW) and `trkWrite`/`trkDelete`/`restore` (trk); the guard needs "changed?" not content. After C4 the only raw post-boot LW path is `LW_RESTORING` (runs at idle, never nested) → guarded registration safe. |
| C10 | med | **Cross-seam roster gestures emit stray `user` envelopes.** `restoreArchivedPerson`: `setPostOut`→`persist()` (idle→`lw.edit` user) + `persistPeople` (`people.edit` user) = TWO user entries for one click. `runPoArchive`→`persistPeople` from a notify: phase-8 enqueues as a **`user`** child (Q2 "too broad" made concrete); idle → orphan user. `persistPeople`'s committing branch does raw+baseline WITHOUT enlisting `peopleStore`. | CMDLF-007 | `persistPeople` always `commitPeople` (never raw); wrap `restoreArchivedPerson` body in ONE `commit`; `runPoArchive`→`commitProjection`; in `enqueue` apply `causedBy` to **non-`user` origins only**; closure = projection-origin descendants, transitive. |
| C11 | med | **§6 "fold stashDrop into `writeInputsBatch`'s `fn`" is unsafe.** `runInputWrite` runs `fn` then the `protectedTouched` check → `histRestore`+return false; a `stashDrop` in `fn` already ran and the stash isn't enlisted → not rolled back (the exact partial-destructive-op P2-QREV-04 fixed). | CMDLF-008 | A minimal `weekstashStore` EnlistableStore (`capture`=Map copy, `restore`, `records`=`weekstash/<wk>`→blob; new `weekstash` LogicalCollection) enlisted in the SAME command via `writeInputsBatchWith(stores, fn)`; `clearHistoryData` drops inside it; `persistAll()` after. |
| C12 | med | **`trkGesture` + today's `sSet` fires async persist from inside the reducer** (`:237`) → a later reducer throw leaves earlier keys persisted (mem/storage diverge); the `!cmdIsCommitting()` raw branch in `'post'` writes with no envelope. | (mechanics of §4) | Inside a gesture, `sSet`=mem write + record pending key; runner flushes `storage.set` for pending keys only if commit ok (keep `setSaveStatus`); drop the raw `cmdIsCommitting` branches (dispatch joins/enqueues; enqueue mem write lands at drain, synchronous before any `await` resumes). Q4: no new staleness — keep reads + gesture in one `onChain` body. `popGrade` confirmed Class A. |
| C13 | low-med | **causalSeq mechanics:** a module-level seq cleared "in the outer finally" leaks across drained pipelines; a no-op commit (seq −1) still releases phase 8; the second `releaseLatch` (`:187`) must be covered. | — | Set `causalSeq` per-`runPipeline` at `finalize`; save/restore the enclosing value at end of phase 9; never set −1 (fall back); closure transitive (N←N+1←N+2); undo step walks it. |
| C14 | low | **§5 re-key: legacy ALs without `id`** → `sched.als/<wk>:undefined` collides. | (edge of CMDLF-011) | `al.id ?? String(n)`, fallback documented; test reconstruction orders by `iso`/`seq`. |
| C15 | low | **Finding A** dropping is correct (forward reconciler bug; no envelope-shape change) but must be WRITTEN DOWN. | — | Add A to OUTSTANDING.md still-open; remove from undo §12-B "dissolved"; note closure-idempotence (not suppression) makes A irrelevant to undo. |
| C16 | low | **LW rollback not durable-atomic:** `rawPersist`'s `backend.write` (synchronous whiteboard, not latched) runs in the reducer; a parent rollback restores memory but the whiteboard keeps the child's write. Pre-existing on the raw path; the design now calls that path atomic. | CMDLF-003 | Latch `backend.write` behind `cmdDeferEffect` in `rawPersist` (baseline advance stays in apply), or state the caveat in §3. Same for `rawPersistPeople`. |

**Fable's §10 answers:** (1) keep `commitProjection` narrow, don't export `commitAs`; legacy LW undo is "raw+off-stream" (C4), not a second origin. (2) causalSeq chaining is by TIME not data → fine for projection origins, wrong for user (restrict `causedBy` to non-user, C10). (3) Finding A out of scope, bookkeep via C15. (4) Class B hoisting safe under the `onChain` guard (C12c). (5) guarded lw/trk safe after C4 with a version-counter signature (C9); NOT safe with `historySnap`. (6) `clearHistoryData` → dedicated enlisted weekstash view, never folded un-enlisted (C11).

### Round-1 disposition (coordinator) — both REVISE, converged
**Accept ALL findings** (every one is code-grounded; none rejected). Convergence is strong: the two
reviewers independently name the same load-bearing holes. The through-line for Rev 2:

- **F1 is the make-or-break and Rev 1 got the timing wrong.** The LW→Raptor direction (war-side
  approve → input mint — the very case F1 named) runs `persist()`-then-`notify()` with the notify at
  phase idle, so causalSeq never reaches it (C1/CMDLF-001). Rev 2 restructures LW notification:
  `persistNotify()` defers `rawNotify` INSIDE the command (phase-8, causalSeq live); the locked
  reconciler branch keeps notify inline and coalesces to one projection/turn (C5); legacy LW undo
  goes off-stream via `LW_RESTORING` (C4); the People-side reconcilers (`runPoArchive`,
  `restoreArchivedPerson`, `persistPeople`) join the causal routing and stop emitting stray `user`
  envelopes (C10/CMDLF-007); `causedBy` is restricted to non-`user` origins (C10, C13).
- **The core dispatcher must drain the queue on a throw** (C6) — a genuine pre-existing bug the
  design would widen by routing every reconciler write through the queue. Lands in P1.
- **The write() seam is batch-shaped, delete-aware, and per-collection** (C3/C7/C8/C9/CMDLF-005/009):
  `write(entries[])` applies all then one rebuild/persist/histPush/notify; put AND delete; scheduler
  refuses foreign-week + uses `HOOKS.histPush` + gates issued records; Tracker re-applies into the
  live lets, not just `mem`; lw/trk get a version-counter `signature()` and are registered guarded
  only after the routing is complete (fixes the C10/CMDLF-010 ordering contradiction).
- **Tracker `mem` must be hydrated from storage before commands are enabled** (C2/CMDLF-004), or every
  before-image and every delete of a never-written key is wrong — this seeds in P2 before any Tracker
  `write()` test is meaningful.
- **The gesture inventory expands** to rename/addCourse/addSyl/dupSyl (CMDLF-006) and `trkGesture`
  records pending keys, flushing storage only on an ok commit (C12).
- **Off-week atomic routing needs a minimal enlisted `weekstashStore`** (C11/CMDLF-008) — folding the
  stash drop into `fn` un-enlisted is unsafe. **Scope decision (coordinator): BUILD the minimal
  weekstash store** (capture=Map copy, records=`weekstash/<wk>`→blob), enlisted with the input batch,
  because a destructive off-stream write is precisely what the command layer exists to prevent; the
  FULL weekstash store (lifting the off-week edit refusal) stays a separate follow-up. Input ordering
  (C11/CMDLF-011) and `acc` (C7) are represented explicitly in the input record / documented.
- **Finding A** stays out of scope but gets written down (C15).

**Next:** write Rev 2 folding all of the above (dispositions recorded here), then **round-2
red-team both providers** — Fable explicitly asks for it because the C1 restructure touches ~48
writer sites and changes when the Leave War grid repaints. No build until Rev 2 is red-teamed clean.

---

## Round 2 — launched (on Rev 2)
Rev 2 written (folds all round-1 findings; change-list at the design head). Both reviewers re-run:
- Codex / GPT-6 Astra (high) — runner `review --resume <round-1 result> --feedback <dispositions>`
  (dispositions = the coordinator feedback mapping each CMDLF-00x → its Rev 2 change).
- Fable 5.1 (high) — fresh in-session subagent given Rev 2 + the round-1 log, asked to mark each
  round-1 finding CLOSED/PARTIAL/REOPENED and flag anything NEW the restructure introduced.
(results appended below on completion)

### Round 2 — Codex / GPT-6 Astra — VERDICT: REVISE
Resume of the round-1 session with the dispositions feedback; plan SHA256
`f9fc54556…`; codex-cli 0.154.0. Coverage confirms **the round-1 defects were NOT repeated** — Rev 2's
remedies (notification timing, queued LW lock context, Tracker hydration, People routing, delete
semantics, guard-order, input-order) are accepted. The 11 new findings are **deeper second-order
correctness issues on the Rev-2 mechanisms**:

| id | sev | gap (file:line) |
|---|---|---|
| R2-001 | high | **Coalescing loses LW changes.** The else-branch advances `LW_BASELINE` before the queued projection enlists `lwStore`; at drain `capture`/`records` read the already-advanced baseline → empty diff, the whole multi-cell reconcile goes off-stream (`store.ts:1086-88`). |
| R2-002 | high | **Durable write before validation still unresolved** (not closed by batching). Reducers call `rawPersist` (immediate backend + legacy history, `store.ts:969-1004`) before phase-5; `lwStore.restore` restores only memory; a throw/stale-`expectedRevs` leaves rejected data persisted. People same; `wirePersist` (`persist.ts:138`) calls `persistAll` immediately even when the history push was deferred. |
| R2-003 | high | **Cross-store half-restored world.** A multi-store inverse (LW leave + its deleted INPUTS) that notifies at the end of EACH `store.write` lets `runOutbound` mint a duplicate iid before the input record is restored; `LW_RESTORING`/`HIST.lock` don't suppress SYNCING-driven reconcile. |
| R2-004 | high | **Weekstash refusal doesn't roll back.** `runInputWrite` on a protected week does `histRestore; return false` — a normal reducer return, NOT a throw; `commit.ts` rolls enlisted stores back only on throw/reject → the stash deletion is retained + emitted while the input mutation reports refused (`store.ts:157-165`). |
| R2-005 | high | **Weekstash capture misses PRESERVED.** The spec copies only `WEEKSTASH`; `stashDrop` also deletes the separate PRESERVED blob (`weekstash.ts:51-59`); a rejected clear on a damaged loaded week can serialize a placeholder over recovery bytes. |
| R2-006 | high | **Tracker adapter omits global records.** The 'current course+syllabus' rule misses `v3:master` defs/layouts, courses, catalogue/order/hidden/tombstones, eventInfo (global live bindings); `refreshSyl` is only an alias for `notify` (`core.js:46`) and does NOT rebuild SYL/byid (`loadCourseNow :1390-91`). |
| R2-007 | high | **Tracker rejection restores `mem` only.** Gestures mutate live objects (`popGrade` marks `:3282-88`; `addStudent` roster/marks/dates `:3514`); a rejected grouped commit leaves them visible and a later save persists the rejected edit. |
| R2-008 | high | **Flush-on-ok conflicts with post-finalize errors.** `commit.ts` finalizes before delivering effects then rethrows a subscriber error (`:191`); a gesture can be committed in memory + on the stream yet never flushed. Queued results return `{queued,done}`, not `ok`. |
| R2-009 | med | **causalSeq no-op descendant.** A queued no-op projection caused by N (per-pipeline restore already ran) has no enclosing `causalSeq`; a changing projection it raises gets no `causedBy` despite belonging to N. |
| R2-010 | med | **`restoreHiddenSyl` (`core.js:3811`, Modals.jsx:259) outside the inventory** — separate hidden/tombstone/catalogue/order saves → multiple user envelopes. |
| R2-011 | med | **`wrongWeek` covers only `days`.** `sched.book/mutes/orig/als/<wk>` are also week-addressed into loaded-week singletons; a foreign-week `sched.mutes` batch (undo of a warn-mute) has no `days` record → could overwrite the loaded week's WARNOFF. |

### Round 2 — Fable 5.1 (high) — VERDICT: REVISE (narrow)
**Rev 2's structure is right; the F1 mechanism was CONFIRMED by code-trace** (LW approve →
`persistNotify`→ deferred `rawNotify` → phase-8 `runOutbound` → `writeInputsBatchProjection` enqueued
with `causedBy`). Round-1: C1,C2,C3,C4,C6,C7,C8,C9,C10,C12,C13,C14,C15,C16 **CLOSED**; C5 & C11
**PARTIAL** (the two defects below). New findings:

| id | sev | gap | maps to Codex |
|---|---|---|---|
| N1 | high | **Coalesced projection empty diff** — else-branch advances `LW_BASELINE`, so a ≥2-cell reconcile emits no envelope, silently off-stream. Also register the `'lw.sync'` permission for the system actor (else `authorize` throws and `LW_PROJ_PENDING` sticks true forever → every later reconciler write goes raw). | R2-001 |
| N5 | high | **Weekstash refusal doesn't roll back** (soft `return false`, not a throw); and the store must snapshot/restore `WEEKSTASH` **and** `PRESERVED`, bumping `GEN` — today only per-key `stashPut/stashDrop` exist. | R2-004/005 |
| N6 | med | **Queued outbound mint not idempotent** vs a second `runOutbound` in the same post-phase window (the `lwSubscribe` pending-OIL tail can raise a second pass pre-drain) → duplicate lw-tagged rows. Add an `OUTBOUND_PENDING` latch + state the idempotence rule for every queued reconciler write. | R2-003 (fwd cousin) |
| N2 | med | **Perf: guarding `trkStore` with hydrated `mem` serialises the whole Tracker on every commit** (`guardSnapshot` calls `capture()`=`JSON.stringify(mem)` per pipeline). Use `capture = Object.assign({}, mem)` (string values are immutable). | — |
| N4 | med | **`trkStore.restore` restores `mem` only** → a rejected gesture leaves the live lets mutated; `restore` must re-derive the current course's lets via the §3 adapter + repaint. | R2-007 |
| N7 | med | **Tracker legacy undo = the C4 gap again** — `applyHist`→`saveMarks/saveLayout`→`trkWrite`→ a **user** commit; needs `TRK_RESTORING` (raw+off-stream) around `step()`. | R2-007/008 area |
| N3 | low-med | **`sGet` mirror re-introduces a stale-read race** (async resolve after a sync write overwrites `mem[k]` with the old value); mirror only when `!(k in mem)`, or not at all. | — |

**Fable §10 answers:** (1) `lw.hist` suffices; do NOT reinstate `SYNCING` at drain — the drained
projection's phase-8 Raptor lane IS the converging pass now (installing `SYNCING` would leave
`!warSupersedes` rows unlanded). (2) coalescing after-image right, before-image wrong (N1). (3) non-ok
inline `rawNotify` safe (add the `toastFail` idiom). (4) `runPoArchive` as projection correct. (5)
**durable rollback: DOCUMENT now, latch `backend.write` in [GLOBAL-UNDO] with the restore path** —
latching now reorders `recordHistory` ahead of the durable write (its contract), whole-state writes
self-heal, and no production rejection exists until `expectedRevs` lands. (6) guarded lw/trk safe
after routing with the version counter bumped only in `rawPersist`/`restore`.
Residual advice: unify `persist`/`persistNotify` naming; export `isInReducer()`/`commitPhase()` (R2-03
rejected it for the scheduler, LW needs it for C5); `write()` must be called from a reducer that
already enlisted the store; prefer a single `inputs.order` record over a per-row field; hoist
`noteLastEdit` out of `popGrade`.

### Round-2 disposition (coordinator) — converging; Rev 3 = mechanism patches, no restructure
Both REVISE, **tightly converged**: the round-1 structural holes are CLOSED; round 2 found
second-order mechanism defects. Fable confirms the F1 mechanism works by trace and calls the
remainder "small patches, not restructures." **Accept all; Rev 3 folds:**
- **Coalescing (N1/R2-001):** the reconciler else-branch must NOT advance `LW_BASELINE` (drain
  persists the final state; `recordHistory` is lock-suppressed); register the `'lw.sync'` permission;
  keep `LW_PROJ_PENDING=false` the first apply statement.
- **Weekstash (N5/R2-004/005):** convert the protected-week `return false` into a reducer throw
  (sentinel the wrapper catches → `false`) so phase-6 rollback restores every enlisted store; the
  `weekstashStore` snapshots/restores `WEEKSTASH` **and** `PRESERVED`, bumping `GEN`; keep the trailing
  `persistAll()` unconditional.
- **Idempotence (N6/R2-003):** an `OUTBOUND_PENDING` latch in `runOutbound` (mirroring
  `LW_PROJ_PENDING`); §2.5 states: every queued reconciler write must be idempotent or latched. The
  MULTI-STORE restore direction (R2-003) — write()'s contract holds reconciliation notify until ALL
  enlisted stores apply (a transaction-wide effect boundary), consumed by the undo step.
- **Tracker (N2/N4/N7/R2-006/007/008):** `capture`=shallow `mem` copy; `restore` re-derives the live
  lets; separate GLOBAL/course/course-syllabus adapters with an explicit SYL/byid rebuild (`refreshSyl`
  is just `notify`); `TRK_RESTORING` for legacy undo; flush attaches to successful FINALIZATION (not
  "no downstream throw"), awaiting queued completion; add `restoreHiddenSyl` to the inventory; mirror
  `sGet` only when `!(k in mem)`.
- **causalSeq (R2-009/C13):** a queued projection inherits its captured `causedBy` as its causal
  context, replacing it with its own seq only if it emits; restore the enclosing value in a `finally`.
- **wrongWeek (R2-011):** every week-scoped collection (`book/mutes/orig/als`), not only `days`.
- **Naming/exports (Fable residual):** unify `persistNotify`; export `commitPhase()`/`isInReducer()`;
  single `inputs.order` record; hoist `noteLastEdit`.
- **ARBITRATION — durable rollback (Codex R2-002 vs Fable Q5): side with Fable, honestly.** The
  in-memory rollback (state/`mem`/live-lets) IS correct and complete at this step; the DURABLE
  (`backend.write`) rollback of a REJECTED commit is DEFERRED to [GLOBAL-UNDO], which builds the
  restore/reject path that needs it. At CMDL-FINISH there is NO production path that rejects a commit
  (the conflict checker is test-only via `MemoryDoor`; `expectedRevs` is the undo step's consumer), so
  the gap is latent and self-healing. Rev 3 will NOT claim durable atomicity — it states the deferral
  explicitly (addresses Codex's "don't call it atomic" without the reorder-risk Fable flags).

**Next:** write Rev 3, then round-3 red-team both providers (Fable expects it clean; a few Codex items
warrant the confirm). No build until a round returns clean (or the owner accepts the residuals).

---

## Round 3 — launched (on Rev 3)
Rev 3 written (folds all round-2 findings; change-list at the design head; durable-rollback arbitration
recorded). Both reviewers re-run:
- Codex / GPT-6 Astra (high) — `review --resume <round-2 result> --feedback <round-3 dispositions>`.
- Fable 5.1 (high) — fresh subagent given Rev 3 + the round-2 log, asked to mark N1–N7 + the Codex R2
  items CLOSED/PARTIAL/REOPENED and flag anything NEW.
(results appended below on completion)

### Round 3 — Codex / GPT-6 Astra — VERDICT: REVISE (5 findings)
A FRESH session (the round-2 resume hit "model at capacity" on the pre-sampling compact; a fresh
review sidesteps it; same model gpt-6-astra/high). Plan SHA256 `9f701f568…`. Independent look — it
probed deeper into corners the resumed reviews had settled:

| id | sev | gap (file:line) |
|---|---|---|
| R3-001 | high | **Settings restore is overlay-only.** §3 says "write the record + rerun its loader"; `rulesLoad` (`engine/rules.ts:152`) only OVERLAYS overrides and returns for null. Restoring an OLDER rules record (or deleting `settings/rules`) leaves a currently-overridden threshold active in VCONF/SHIFT_HARD → stored settings and behaviour disagree. `restoreSettings` (people-settings-commit) same. Fix: a side-effect-free rehydrator that RESETS all rule values to defaults THEN applies stored overrides (don't call `rulesReset` — it writes storage). |
| R3-002 | med | **`applyLullCopy` (`core.js:3121`, SidePanel.jsx:88) missing from §4 inventory** — loops selected students, `saveLulls` per student → N envelopes. Group it. |
| R3-003 | med | **§6 sentinel doesn't reach the wrapper.** `commit.ts` CATCHES the reducer throw → returns `{ok:false}`; `sched-commit.ts:170` discards it and returns the reducer value (undefined). `clearHistoryData` ignores the result and unconditionally logs+returns the original count → a rolled-back clear reported as success. Fix: signal refusal via the CommitResult, not an escaping exception; `clearHistoryData` returns 0 + skips the success log on refusal. |
| R3-004 | med | **sGet mirror delete race.** `!(k in mem)` handles an intervening put but not a delete: `sGet` captures the old value, `trkDelete` removes `mem[k]`, the continuation sees `!(k in mem)` → resurrects the deleted record (outside a command, no version bump). Fix: per-key mutation generations incl. deletions; mirror only if unchanged; distinguish known-deleted from never-hydrated. |
| R3-005 | med | **Tracker rollback can't restore from a mem-only snapshot.** `removeStudentNow` (`core.js:3535`) mutates `undoStack`/`redoStack`/`active` — not derivable from `mem`; a rejected grouped command restores roster/marks/dates but loses legacy history; `pushMarkUndo` clears redo before a grade succeeds. Fix: capture/restore the transaction-mutated history + selection, OR defer them until successful completion. |

### Round 3 — Fable 5.1 (high) — VERDICT: **SHIP-READY** (fold M1–M4; no round 4 needed)
Confirmed EVERY round-2 finding CLOSED with code-traces (incl. the N1 coalescing trace end-to-end,
the N5 weekstash throw→phase-6 rollback, N6 idempotence). "No structural hole found." New items to
fold before build:

| id | sev | gap / fix |
|---|---|---|
| M1 | med | **Tracker adapter scope table wrong for `layout` + silent on pointer changes.** `kLayout` is GLOBAL-per-syllabus (`core.js:393`, no course segment); `kPace`/`kLulls` are course+student (no syllabus); a restored `trk.plan` changing `plan.sylId` or a restored `courses` removing the current course repoints every per-syllabus key while live lets hold the OLD chart → next save writes it under new keys (data loss). Fix: an explicit key-grammar→scope table (global/course/course+syllabus); after applying all records, if `plan.sylId`/course pointer changed re-derive the WHOLE per-syllabus layer synchronously (`loadCourseNow` order, `:1390-1432`; fall back as `init` if the course is gone); rebuild `SYL/byid` only when the def for `curSylId()` is among the changed keys (never when `sylDirty` and the def is untouched). |
| M2 | low | **§6 wording** — the refusal is caught by commit.ts phase 6, not "the wrapper"; and `errResult` logs a bug-shaped console error for any non-`CmdError` throw (`commit.ts:355`). Fix: throw a recognisable `CmdRefused` (or an `errResult` branch returning `{ok:false, reason:'refused'}` silently); `writeInputsBatchWith` maps `ok:false`→`false`. (Same mechanism as Codex R3-003.) |
| M3 | med-low | **Coalescing only exists while committing; at IDLE a multi-cell reconcile opens one synchronous projection per cell** (week-nav `loadWeek`→`runOilPass` crediting K new cells = K pipelines each paying `guardSnapshot`×2). Fix: an idle-time `lwSyncTurn(fn)` wrapper — arm `LW_PROJ_PENDING`, run `fn` (cells take the raw else-branch), then ONE `commitProjection`; plus `if(!cmdIsCommitting()) LW_PROJ_PENDING=false` defensive reset before the check. |
| M4 | low | **Pin the Tracker flush to `cmdDeferEffect(flush)` inside the reducer, NOT to reading the CommitResult** — it then runs at `releaseLatch` (after `finalize`), is discarded by `rollback` on a phase-5 reject, is isolated from a throwing sibling, and a queued gesture flushes at drain with no `{done}` await. Reading the result has a hole: a child-joined gesture returns `{ok:true,seq:-1}` and would flush before its parent rolls back. |

**Fable §10 answers (conditions to honour in Rev 4):** (1) coalescing correct; ADD `done.then(r=>!isOk(r)&&rawNotify())` on the projection branch so a rejected drained `lw.sync` re-reads the grid; the `'lw.sync'` permission is unnecessary (system actor short-circuits `authorize`, `permissions.ts:49-50`) — harmless but don't rely on it. (2) multi-store boundary is the right scope for THIS step IF every `write()` releases notify/persist via `cmdDeferEffect` (never inline in the reducer) AND §8 adds a two-store round-trip test asserting no reconciler ran between the writes. (3) three-scope adapter = M1. (4) flush = M4. (5) durable-rollback deferral acceptable (no production rejection path). Residual: scope `TRK_RESTORING` to the synchronous write, not across `await step()`; `commitProjection`/`writeInputsBatchProjection` need no `definePermission`.

### Round-3 disposition (coordinator) — DESIGN CONVERGED → Rev 4 folds, then a final confirm
Fable **SHIP-READY**; Codex REVISE but only spec-refinements (its structural/mechanism concerns from
rounds 1–2 are all folded). The two sets are complementary — Codex's R3-001 (settings reset-loader),
R3-002 (applyLullCopy), R3-005 (Tracker history/selection capture) are NEW and real; R3-003 = Fable M2;
R3-004 (sGet delete race) refines Fable's N3. **Accept all; Rev 4 folds:**
- **Settings (R3-001, HIGH):** the write()/rollback for `settings` uses a side-effect-free RESET-then-
  overlay rehydrator per loader (reset to defaults, apply the record's overrides), never the
  storage-writing `rulesReset`. §3.
- **Gestures (R3-002/R2-010 done):** add `applyLullCopy` to the §4 inventory.
- **§6 refusal signalling (R3-003/M2):** a `CmdRefused` result (silent, no bug-shaped console log);
  `writeInputsBatchWith` maps `ok:false`→`false`; `clearHistoryData` returns 0 + skips the success log
  on refusal. The throw still triggers phase-6 rollback (N5 intact).
- **sGet (R3-004):** per-key mutation generations incl. deletions; mirror only if the generation is
  unchanged; distinguish known-deleted from never-hydrated.
- **Tracker rollback (R3-005):** `trkStore.capture/restore` also snapshot the transaction-mutated
  `undoStack`/`redoStack`/`active` (or the gesture defers those until success). §3.
- **Adapter table (M1):** explicit key-grammar→scope table + the pointer-change whole-layer re-derive +
  the precise draft-rebuild rule. §3.
- **Coalescing idle path (M3) + flush mechanism (M4) + rejected-drain rawNotify (Q1) + write()-releases-
  via-cmdDeferEffect + the two-store round-trip test (Q2) + TRK_RESTORING scoping.** §2/§3/§4/§8.
- The `'lw.sync'` permission note and the `commitProjection` no-permission note corrected.

**Process call:** the design red-team has done its job — structure + mechanism validated across 3 rounds
(both providers), Fable SHIP-READY. Rev 4 folds the refinements; **ONE final confirm round (round 4)**
on Rev 4 to verify the HIGH (R3-001) + M1 are correctly specified, then LOCK and build. The remaining
fine detail is also enforced by the build's test-first implementation + the mandatory post-build
cross-provider CODE inspection (a second independent check on the actual code).

---

## Round 4 — launched (FINAL confirm, on Rev 4)
Rev 4 written (folds all round-3 findings; change-list at the design head). Both reviewers re-run to
CONFIRM build-readiness (esp. R3-001 settings-HIGH + M1 Tracker scope table):
- Fable 5.1 (high) — fresh subagent given Rev 4 + the round-3 log; mark M1–M4 + R3-001..005
  CLOSED/PARTIAL/REOPENED + a build-ready verdict.
- Codex / GPT-6 Astra (high) — resume from the round-3 fresh result + a round-4 dispositions feedback
  (a "model at capacity" failure is NOT approval; fall back to a fresh review or Fable-only, recorded).
(results appended below on completion)

### Round 4 — Codex / GPT-6 Astra — VERDICT: REVISE (4 findings; all round-3 folds CONFIRMED closed)
Resume succeeded (fresh session; the round-2/3 resume capacity error did not recur). SHA256 `39af7abd…`.
Summary: "The five round-3 findings are addressed at the specification level." 4 NEW items, all on the
Rev-4 ADDITIONS (the idle `lwSyncTurn` wrapper + the Tracker rebuild rules):
- **R4-001/R4-002 (med×2):** the §2.3 `if(!cmdIsCommitting()) LW_PROJ_PENDING=false` reset defeats
  `lwSyncTurn` → K idle projections; and the trailing projection runs after the cells' `locked()`
  unwound → an LW undo step for an idle reconcile. (= Fable F4-1.)
- **R4-003 (HIGH):** all defs share one `v3:master:syls` record → the "changed-key" SYL/byid rebuild
  rule can't isolate one syllabus → restoring chart B's def rebuilds A and drops A's dirty draft.
- **R4-004 (HIGH):** the course-pointer fallback omits course-scoped `pace`/`lulls` → a fallback course
  shows stale/default and a later edit overwrites saved targets.

### Round 4 — Fable 5.1 (high) — VERDICT: **APPROVED / SHIP-READY** (build-ready; one line to patch in LOCK)
Verified EVERY fold CLOSED against `b25d654` with evidence: **R3-001** (only `rulesLoad` overlays; the
other nine loaders already reset-then-overlay from a module constant — so "the loader IS the rehydrator"
for them; none needs a storage read for defaults; the `rules` rehydrator = `VCONF/SHIFT_HARD ← RULE_STD`
then `rulesLoad`), **M1** (scope table complete for all 11 collections; re-derive order matches
`loadCourseNow`), **R3-005/N4** (undoStack/redoStack/active are module lets, snapshot alongside mem),
**R3-003/M2** (`errResult` already silent for `CmdError`; `HOOKS.toast` not latched so the refusal toast
survives rollback), **R3-004** (sGet generations), **R3-002** (applyLullCopy), **M4** (flush via
`cmdDeferEffect` — the `{ok:true,seq:-1}` hole closed). **Only F4-1** (= R4-001/R4-002) is PARTIAL — the
idle `lwSyncTurn` bug — with the exact two-line fix (a `LW_SYNC_TURN` counter + hold `HIST.lock` through
the trailing projection). **"Rev 4 is build-ready. Patch F4-1 in the LOCK commit, then start P1; no round
5."** Plus 9 non-blocking build-advice notes (below).

**Fable build-advice for P1–P6 (non-blocking):** (1) add `'refused'` to `CommitResult.reason` +
`CmdRefused extends CmdError`. (2) fire one plain `notify()` at idle after a refused batch (React chrome
insurance; the imperative `renderInputs/reflow` still runs). (3) `v3:master:syls` is one blob → judge
"def changed" at the SUB-KEY level (`customDefs[curSylId()]` before≠after); legacy `<c>:syl` storage-only.
(4) a roster-only change still re-runs the `active` membership guard + seeds per-student defaults for new
ids. (5) the synchronous re-derive reads `mem`, NOT `sGet` (nothing on the `onChain` may call
`loadCourse`). (6) snapshot `sylDirty` in `trkStore.capture/restore`. (7) bump the sGet generation map on
`restore` too. (8) `TRK_RESTORING` wraps each save call's synchronous head, not the whole `await`. (9)
don't register the `lw.sync` permission (system actor short-circuits `authorize`).

### Round-4 disposition (coordinator) — DESIGN LOCKED / BUILD-READY
Both reviewers converged on build-ready. Codex's 4 items = Fable's F4-1 (R4-001/002) + two Tracker-restore
precisions (R4-003/004) that Fable classed as build-advice #3/#4 — Codex rates them HIGH, so they are
**folded into the design's "LOCK patches" section** (resolved in-spec, not left as advice). Fable's other
7 notes stay build-advice (P1–P6). **No round 5** — both reviewers agree; the three patches are precise,
both-agreed one-liners; the remaining fine detail (Tracker restore rebuild) is foundation CONSUMED BY THE
UNDO STEP (not production behaviour at CMDL-FINISH) and is definitively pinned by the build's test-first
implementation + the mandatory post-build cross-provider CODE inspection.

**DESIGN LOCKED (Rev 4 + the three LOCK patches). Next: build P1–P6 on Opus 4.8 high, test-first; full
gates per phase; cross-provider code inspection after build; hold for "merge live". Recommended handoff:
a FRESH chat for the build (big new task), pulling this locked design + this review log from the repo.**
