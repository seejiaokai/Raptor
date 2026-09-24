# [CMDL-FINISH] Finish the command layer for Leave War + Tracker — ARCH-STACK step 2 completion — DESIGN (Rev 4 — LOCKED 17 Sep 26, round-4 APPROVED)

> **DONE + LIVE (18 Sep 26):** built and merged as PR #412 (build) and PR #415 (finish), with the undo front door
> PR #413 (`docs/undo-contract.md`). Still open, and carried elsewhere: the Leave War posting-window rebuild on a
> restore (CMDLF-002) and whole-Import undo granularity, in `OUTSTANDING.md` `[GLOBAL-UNDO]`; P6/P7, in
> `[SYNC-INTEG]`. The backlog item `[CMDL-FINISH]` moved to `OUTSTANDING-ARCHIVE.md` 24 Sep 26.

> **STATUS: LOCKED / BUILD-READY (17 Sep 26).** Round-4 confirm: **Fable 5.1 APPROVED/SHIP-READY**
> ("Rev 4 is build-ready; patch F4-1 in the LOCK commit, then start P1; no round 5"); **Codex/GPT-6
> Astra** confirmed all round-3 folds CLOSED, its 4 new items = the same three LOCK patches below —
> converged. The three patches (§"LOCK patches" below) fold into the code as each is built; the review
> log carries 9 non-blocking build-advice notes. **Build: Opus 4.8 high, test-first, per phase P1–P6;
> full gates per phase; cross-provider CODE inspection after build; hold for "merge live".**

Owner-gated step. Design-first → cross-provider red-team (Codex + Fable) → Opus 4.8 build →
cross-provider code inspection → gates → hold for "merge live". **Gates [GLOBAL-UNDO].**

- **Task of record:** OUTSTANDING.md `[CMDL-FINISH]`. **Partition:**
  `2026-09-17-arch-stack-3-global-undo-design.md` §12. **Prior layer being completed:**
  `2026-09-16-arch-stack-2-command-layer-design.md`.
- **Red-team:** `2026-09-17-arch-stack-cmdl-finish-review-log.md`.
  - **R1** (Rev 1): Codex 11 + Fable 16, both REVISE → structural holes → Rev 2.
  - **R2** (Rev 2): Codex 11 + Fable 7, both REVISE → second-order mechanism defects → Rev 3.
  - **R3** (Rev 3): **Fable SHIP-READY** (every R2 finding CLOSED by code-trace; "no structural hole;
    nothing needs a round 4") + 4 refinements (M1–M4); **Codex REVISE** with 5 spec-refinements
    (R3-001..005). **Rev 4 folds all of them; one final confirm round then LOCK + build.**

Grounded in the shipped code at `b25d654` (file:line verified across three review rounds by both
providers). The design DIRECTION and core mechanism are validated; Rev 4 is spec-precision.

---

## Rev 4 change-list (round-3 red-team → folded)

1. **Settings restore is RESET-then-overlay (R3-001, HIGH).** The loaders (`rulesLoad` etc.) only
   OVERLAY overrides; restoring an older/smaller `settings` record left an overridden threshold live.
   `write()`/rollback for `settings` uses a side-effect-free reset-then-apply rehydrator (never the
   storage-writing `rulesReset`). §3.
2. **Tracker gesture inventory + `applyLullCopy` (R3-002)**; the Tracker flush is raised as
   `cmdDeferEffect(flush)` inside the reducer, NOT by reading the CommitResult (M4). §4.
3. **§6 refusal signalled by a `CmdRefused` result, not an escaping exception (R3-003/M2)** — the throw
   still triggers phase-6 rollback (N5), but the wrapper reads `{ok:false}` and maps it to `false`;
   `clearHistoryData` returns 0 + skips its success log on refusal (no bug-shaped console error). §6.
4. **sGet mirror uses per-key mutation generations incl. deletions (R3-004).** §3.
5. **`trkStore.capture/restore` also snapshot `undoStack`/`redoStack`/`active` (R3-005).** §3.
6. **Explicit Tracker key-grammar → adapter-scope table + pointer-change whole-layer re-derive +
   precise draft-rebuild rule (M1).** §3.
7. **Idle-path coalescing `lwSyncTurn` + a rejected-drain `rawNotify` re-read (M3, Q1); every `write()`
   releases notify/persist via `cmdDeferEffect`, never inline in the reducer (Q2); `TRK_RESTORING`
   scoped to the synchronous write (Fable residual).** §2/§3/§4.
8. **Corrections:** the `'lw.sync'` permission is unnecessary (system actor short-circuits
   `authorize`) — harmless, not relied on; `commitProjection`/`writeInputsBatchProjection` need no
   `definePermission`.

---

## LOCK patches — round-4 → fold as each is built (design APPROVED; both reviewers converged)

- **F4-1 / R4-001 / R4-002 — idle-path coalescing (§2.3).** The `if (!cmdIsCommitting()) LW_PROJ_PENDING
  = false` defensive reset DEFEATS `lwSyncTurn` (it clears the flag the wrapper just armed → K
  projections; the §8 "idle = ONE projection" test can't pass). Fix: a distinct `let LW_SYNC_TURN = 0`;
  `lwSyncTurn(fn)` = if `cmdIsCommitting()` just run `fn`; else `LW_SYNC_TURN++; LW_PROJ_PENDING = true;
  try { fn() } finally { LW_SYNC_TURN--; <ONE trailing commitProjection: clear flag, enlist, rawPersist,
  advance baseline>; LW_PROJ_PENDING = false }`. The defensive line becomes
  `if (!cmdIsCommitting() && !LW_SYNC_TURN) LW_PROJ_PENDING = false`. **The trailing projection MUST run
  under `HIST.lock`** (else `recordHistory` pushes an LW undo step for an idle reconcile). Not data-loss
  (per-cell diffs stay correct) — it is the one-envelope/perf goal.
- **R4-003 — Tracker def rebuild (Codex HIGH) (§3).** All custom defs share ONE `v3:master:syls` blob
  (`core.js:416`), so "def for `curSylId()` among the CHANGED storage keys" trips for ANY syllabus edit.
  Fix: rebuild `SYL/byid` only when **`customDefs[curSylId()]` before ≠ after** (a parsed sub-key
  compare), never on the shared key changing — else restoring another chart's def clobbers the current
  one's dirty draft. Always refresh `customDefs`; legacy `<c>:syl` has no callers → storage-only.
- **R4-004 — Tracker course-change rebuild (Codex HIGH) (§3).** On a course-pointer change (a restored
  `courses` record removing the current course), rebuild the **COMPLETE** course-dependent state — plan,
  **pace, lulls**, roster/marks/dates/layout, and a valid `active`-student selection — regardless of
  which records were touched (else `setEpw/setTarget` spread `paceOf` over stale/default and persist it →
  data loss). On a syllabus change, hydrate marks/dates for the newly loaded roster as `loadStudent`
  does (`:1459-79`).

Also fold (review-log round-4 build-advice): `'refused'` added to `CommitResult.reason` +
`CmdRefused extends CmdError` (silent); snapshot `sylDirty` in `trkStore.capture/restore`; bump the sGet
generation map on `restore`; a `rules` rehydrate re-runs `validate` at the boundary; scope
`TRK_RESTORING` to each save's synchronous head; the re-derive reads `mem`, never `sGet`.

## 0. Framing
No change alters a painted byte (**tfin.js 728/0 every phase**); what changes is what the stream
RECORDS and how a record is written back. Surgical (heaviest test + a mandatory owner live-scenario
pass): **F1** (LW reconciler writes → `projection` + the notify restructure) and the **Tracker `mem`
hydration + save-path change**. **In-memory rollback (state/`mem`/live-lets/Tracker history+selection)
is correct and complete; DURABLE (`backend.write`) rollback of a REJECTED commit is DEFERRED to
[GLOBAL-UNDO]** — at this step no production path rejects a commit (the conflict checker is test-only
via `MemoryDoor`; `expectedRevs` is the undo step's consumer; the only rejects are guard/hard-invariant
failures = pre-existing programming bugs), so the gap is latent and self-healing.

## 1. Current state (condensed — full detail in the review log)
- **Command core** (`commit.ts`,`types.ts`,`latch.ts`): `commit`→`user`; reducer-raised commit JOINs
  (`:85`); post-phase commit ENQUEUEs with `causedBy=deliveringSeq` (`:93,113`), set only in phase-9
  `deliver` (`:214`), NOT phase-8 `releaseLatch` (`:185`). A throw in phase 8/9 leaves `queue`
  un-drained (C6). No `projection` origin used. `EnlistableStore` has no `write()`.
  `captureContexts`/`installContexts` exist (`latch.ts`). Drained pipelines are SEQUENTIAL (`:104-129`).
  `authorize` short-circuits for `role:'system'` (`permissions.ts:49-50`, `actor.ts:16-18`).
- **Scheduler** (`sched-commit.ts`): guarded `schedStore` (histSnap/histRestore); finished except
  `sched.als/<wk>:<n>` (F5). `days`/`sched.book`/`sched.mutes`/`sched.orig`/`sched.als` all key by
  `CURWEEK` (`:78-100`). `SCHED_BASELINE===histSnap()` between commands (`:55`).
- **Leave War** (`leavewar/state/store.ts`): `lwStore` (`:1084`) ad hoc, NOT guarded, no `signature`;
  `persist()` router (`:1100`); `notify()` (`:961`) has NO `deferEffect`; ~48 `persist(); notify()`
  pairs → the LW-originated outbound reconciler runs at phase idle (C1). Reconcilers + `historyApply`
  run under `locked()` (LW `HIST.lock`, a DIFFERENT object than the scheduler's `'HIST.lock'`).
- **Tracker** (`tracker/app/core.js`): `trkStore` (`:201`) ad hoc, NOT guarded, no `signature`;
  `mem={}` starts EMPTY; `sGet` (`:139`) never mirrors; `trkWrite`/`trkDelete` fire their own commit;
  live UI bindings (`marks/dates/roster/SYL/byid/layout/plan`) are separate from `mem`; `notify` is
  PLAIN (not deferred, `:42`); `refreshSyl` is an alias for `notify` (`:46`); storage synchronous
  (`storage.js:38-48`); `storage.list()`→`{keys}` (`:50-55`). Key grammar: `kLayout`=`v3:master:lay:<syl>`
  (global-per-syllabus, `:393`); `kPace`/`kLulls`=course+student (`:367,371`); `kMarks`/`kDates`/
  `kRosterFor`=course+syllabus (`:389,391,361`); `kPlan`=course (`:363`); `kSyls`/catalogue/order/
  hidden/tomb/courses/eventinfo=global.
- **Sync** (`leavewar/sync.ts`): reconcilers from `raptorSubscribe`/`lwSubscribe`; `SYNCING` (`:69`)
  loop-breaker; Raptor `notify()` IS deferred (`state/store.ts:56`) so the inbound direction lands in
  phase 8; the LW-originated direction doesn't (C1). `lwSubscribe` pending-OIL tail (`:1180-88`) can
  raise a 2nd `runOutbound` in the same post-phase window (N6).

## 2. F1/GU-001 — the causal both-side envelope (validated by trace across R2/R3)

**Goal:** one user action's full ripple = ONE causal closure (`user` envelope + `causedBy`-chained
`projection` children), BOTH directions, no stray `user` envelope, no spurious LW/People/Tracker undo
step, no painted byte.

### 2.1 Command-core enabling changes (P1; additive; unit-tested)
1. **`causalSeq` per-pipeline (C13/R2-009).** Set at `finalize`; live across phase 8 AND 9;
   save/restore the enclosing value around each `runPipeline` in a `finally`; never −1. A queued
   projection **inherits its captured `causedBy` as its causal context**, replacing it with its own seq
   only on `finalize` — so `N → no-op projection → changing projection` chains to N (drained pipelines
   are sequential). `enqueue` reads `causalSeq` (fallback `deliveringSeq`).
2. **`causedBy` on non-`user` origins only (C10).** A `user` commit raised in phase 8/9 is independent.
3. **Drain the queue on a throw (C6).** `dispatch`:
   `try{result=runPipeline()}finally{ try{drainQueue()}finally{phase='idle';active=null} }` then rethrow.
4. **Queued commits carry the suppression context (CMDLF-002).** `enqueue` captures `captureContexts()`;
   `drainQueue` installs them. **Register an `lw.hist` effect context** (LW `HIST.lock` is a different
   object than `'HIST.lock'`). Do NOT reinstate `SYNCING` at drain (the drained projection's phase-8
   Raptor lane is the required converging pass).
5. **Export `commitProjection(cmd)`** (= `commitAs` with the system actor; `commitAs` stays
   unexported), **`commitPhase()`/`isInReducer()`**, **`cmdDeferEffect`** (already exists as
   `deferEffect`). No `definePermission` for projection types (system actor short-circuits `authorize`).

### 2.2 Leave War notification restructure (C1 — confirmed by trace)
- Split `notify` → `rawNotify()` + a `persistNotify()` router. Replace the ~48 `persist(); notify()`
  with `persistNotify()`; bare `notify()` for view-only setters. The user branch defers `rawNotify`
  INSIDE the command so subscribers fire in phase 8 with `causalSeq` live; on a non-ok result run
  `rawNotify()` inline + the `toastFail` idiom.
- **Confirmed trace (Fable R3):** LW approve → `updateWar` → `persistNotify` → phase-8 `rawNotify` →
  `runOutbound` → `writeInputsBatchProjection` (projection sibling, sync path only) → enqueued with
  `causedBy` = the approve's seq. Standalone approve = `user` N + input mint `projection` `causedBy===N`.

### 2.3 The router (Rev 4 — coalescing correct on BOTH the committing and idle paths)
```
function persistNotify() {
  if (!LW_READY)     { rawPersist(); LW_BASELINE = state; rawNotify(); return }   // boot/seed
  if (LW_RESTORING)  { rawPersist(); LW_BASELINE = state; rawNotify(); return }   // legacy undo — off-stream (C4)
  if (!cmdIsCommitting()) LW_PROJ_PENDING = false                                 // defensive: nothing pending at idle (M3)
  if (HIST.lock || cmdIsCommitting()) {                                           // reconciler OR nested causal
    if (cmdIsCommitting() && isInReducer())                                       // nested causal child (Gap 2, verified)
      commitProjection({ type:'lw.sync', scope, apply: t => { t.enlist(lwStore); rawPersist(); LW_BASELINE=state } })
    else if (!LW_PROJ_PENDING) {                                                  // first cell of a turn — one projection
      LW_PROJ_PENDING = true
      const r = commitProjection({ type:'lw.sync', scope, apply: t => { LW_PROJ_PENDING=false; t.enlist(lwStore); rawPersist(); LW_BASELINE=state } })
      if (isQueued(r)) r.done.then(x => { if (!isOk(x)) rawNotify() })            // rejected drained projection → re-read grid (Q1)
    } else { rawPersist() }                                                       // COALESCED: raw only — do NOT advance LW_BASELINE (N1)
    rawNotify()                                                                   // inline (the SYNCING door needs it)
    return
  }
  cmdCommit({ type:'lw.edit', scope, apply: t => { t.enlist(lwStore); rawPersist(); LW_BASELINE=state; cmdDeferEffect(rawNotify) } })
  if (!ok) rawNotify()
}
```
- **N1:** the coalesced else-branch runs `rawPersist()` ONLY (no `LW_BASELINE` advance), so the drained
  `lw.sync` still captures the PRE-reconcile baseline and diffs every cell.
- **M3 (idle path):** the four reconciler passes run through an **`lwSyncTurn(fn)`** wrapper — when
  `!cmdIsCommitting()`, arm `LW_PROJ_PENDING`, run `fn` (its cells take the raw else-branch), then ONE
  `commitProjection` clears the flag + enlists + persists + advances the baseline. So an idle multi-cell
  reconcile (week-nav `loadWeek`→`runOilPass`) emits ONE projection, not K synchronous pipelines.
- **`LW_RESTORING`** keeps legacy undo off-stream (C4). `LW_PROJ_PENDING=false` is the first apply
  statement (a mid-apply throw still clears it).

### 2.4 People-side reconcilers (C10) — unchanged from Rev 3
`persistPeople` always `commitPeople` (never raw); `restoreArchivedPerson` one `commit`;
`runPoArchive`'s people write → `commitProjection`.

### 2.5 Idempotence + the live pass — unchanged from Rev 3
`OUTBOUND_PENDING` latch in `runOutbound` (cleared first-in-apply) — the `lwSubscribe` tail can raise a
2nd `runOutbound` pre-drain (N6). Every queued reconciler write is idempotent or latched. The
multi-store RESTORE boundary is specified in write()'s contract (§3). **Mandatory owner live-scenario
pass** including the multi-day-leave N1 case (ONE `lw.sync` listing every cell) and the idle-path M3
case. Finding A stays out of scope (bookkept in OUTSTANDING.md / undo §12-B).

## 3. The per-record write seam (F8/GU-007) — batch, delete-aware, per-collection, transaction-bounded

**`write(entries: RecordEntry[])` per `EnlistableStore`** — apply ALL records to live state first, THEN
one derived-index rebuild; **persist + `HOOKS.histPush` + notify release at the TRANSACTION boundary
(phase 8) via `cmdDeferEffect`, never inline in the reducer** (Q2) — so a multi-store restore never
reconciles on a half-applied world (an inline LW `rawNotify` in a reducer would child-join a
`runOutbound` mid-restore). `RecordEntry` gains `op:'put'|'delete'`. `write()` is called only from a
reducer that already enlisted the store and never opens its own command.

Per store (verified):
- **settings** (`people-settings-commit.ts:89`): put/delete each `settings/<k>` then a **side-effect-free
  RESET-then-overlay rehydrator** for that key — reset the module CFG (VCONF/SHIFT_HARD/templates/…) to
  DEFAULTS, then apply the stored record's overrides (R3-001). NOT `rulesReset`/the plain loader (a
  loader only overlays, so restoring an older/smaller record would leave a dropped override live). One
  rehydrator shared by write() and rollback.
- **people** (`:123`): apply each `people/<id>` into `PEOPLE`; rebuild `ID_BY_CS` for touched ids;
  advance `PEOPLE_BASELINE`; `persistPeople` at the boundary.
- **scheduler** (`sched-commit.ts:111`): apply each record; **refuse a FOREIGN-week write for EVERY
  week-scoped collection** (`days`/`sched.book`/`sched.mutes`/`sched.orig`/`sched.als`) with a typed
  `wrongWeek` error (R2-011); `ensureRowIds`/`mintInpIds`/`validate` once; advance `SCHED_BASELINE`;
  **`HOOKS.histPush`**. `inputs/<iid>` lands `acc` verbatim; a single **`inputs.order` record** carries
  array position. Issued records writable only behind `{allowIssued:true}`.
- **leave war** (`store.ts:1084`): apply each record into a fresh `state`; one reconcile; `LW_BASELINE=state`;
  persist+notify at the boundary under `LW_RESTORING`/`HIST.lock`. `capture`=the immutable `state` ref;
  `restore`=reassign.
- **tracker** (`core.js:201`): the write-back is driven by an **explicit key-grammar → scope table**
  (M1):
  - **GLOBAL:** `courses`, `sylcat`/`sylorder`/`sylhidden`/`syltomb`, `eventinfo`, `v3:master:syls`,
    `v3:master:lay:<syl>` (a layout record re-applies only when `syl===curSylId()`).
  - **COURSE:** `plan`, `pace:<s>`, `lulls:<s>`, legacy `<c>:syl`.
  - **COURSE+SYLLABUS:** `<c>:<syl>:m:<s>`, `<c>:<syl>:d:<s>`, `<c>:<syl>:roster`.
  Apply all records to `mem`, then: **if `plan.sylId` or the current-course pointer changed, re-derive
  the WHOLE per-syllabus layer synchronously** (`roster/marks/dates/layout`+`loadEdgeMeta`/`SYL`+`byid`
  via `sylSource`, the `loadCourseNow` order `:1390-1432`; if the current course is gone, fall back as
  `init` does `:4935-36`) — else a repointed key writes the OLD chart's layer under new keys (data
  loss). **Rebuild `SYL`/`byid` only when the def record for `curSylId()` is among the CHANGED keys**
  (diff snapshot vs live `mem`), never when `sylDirty` and the def is untouched (preserves dirty
  drafts). Then repaint. Matching course/course-syllabus records that are NOT the loaded one → storage
  only.
  - **`capture` = `Object.assign({}, mem)`** (shallow; string values — O(keys) not `JSON.stringify`;
    a guarded store's `capture()` runs every pipeline — N2) **PLUS a snapshot of `undoStack`,
    `redoStack` and `active`** (gestures mutate these and they are not derivable from `mem` — R3-005).
  - **`restore`** reassigns `mem`, `undoStack`, `redoStack`, `active`, then re-derives the current
    course's live lets via the adapters + repaints (N4/R3-005). (`notify` is plain, so a repaint raised
    inside `rollback` is not discarded.)
- **`mem` hydration (C2):** at `trkRegisterCommands` (`:4942`) seed `mem` from `storage.list().keys`+`get`
  for every known-collection key; **mirror in `sGet` via per-key mutation generations incl. deletions**
  (R3-004) — capture the key's generation before the async read, mirror the result only if the
  generation is unchanged, and distinguish a known-deleted key (tombstone in the gen map) from a
  never-hydrated one (so a delete that lands during the read is not resurrected). Drop the `(k in mem)`
  gate in `trkDelete`.
- **`signature()` for lw + trk (C9):** a monotonic durable-version counter bumped ONLY in
  `rawPersist`/`restore` (LW) and `trkWrite`/`trkDelete`/`restore` (trk). Register lw + trk **guarded**
  only at the END of P3/P4.
- **Scoped conflict checker (F8):** optional `expectedRevs?` + a per-commit phase-5 checker; unit-proven
  vs `MemoryDoor`.
- **Durable rollback:** in-memory rollback (above) correct+complete now; durable (`backend.write`)
  rollback of a rejected commit DEFERRED to [GLOBAL-UNDO] (no production rejection path). Not claimed
  atomic; the deferral is stated.

## 4. Tracker: one gesture = one envelope (GU-004)
**`trkGesture(fn)`** — one top-level `cmdCommit`; its reducer enlists `trkStore` once and runs the
gesture's SYNCHRONOUS `mem` + live-let mutations; async reads hoisted BEFORE it. Inside a gesture `sSet`
records the pending key; **the flush is raised as `cmdDeferEffect(flush)` inside the reducer (M4)** —
so it runs at `releaseLatch` (after `finalize`), is discarded by `rollback` on a phase-5 rejection, is
isolated from a throwing sibling effect/subscriber, and a queued gesture flushes at drain (no `{done}`
await; reading the CommitResult instead would let a child-joined `{ok:true,seq:-1}` flush before its
parent rolls back). Drop the raw `!cmdIsCommitting()` branches.

- **Class A:** `popGrade` (hoist `await noteLastEdit`, then mark + `flownOn` in one reducer),
  `setDoneDate`/`popDoneChanged`; `deleteEvents`/`delCourse` already single (pin).
- **Class B (group, hoist reads):** `addStudent`, `removeStudentNow`, `renameStudent`, `addCourse`,
  `addSyl`, `dupSyl`, `restoreHiddenSyl` (R2-010), **`applyLullCopy`** (R3-002 — capture source periods
  + selected students, mutate + save every destination in ONE reducer) — each incl. its plan change;
  preserve the `onChain` serialisation.
- **Class C (multi-part):** `delSyl` (hoist reads → one `trkGesture`); `importClick` (ONE `trkGesture`
  per resolved chart + ONE for the student block; the whole-import undo granularity is a [GLOBAL-UNDO]
  product question).
- **`TRK_RESTORING` (N7):** Tracker legacy undo (`applyHist`/`applyMarkHist`→`saveMarks`/`saveLayout`→
  `trkWrite`) runs raw + off-stream — **scoped to the synchronous `trkWrite` calls, not across the
  awaited `step()`** (storage is sync today; a future async backend must not let a click land inside the
  await and go raw+off-stream).

## 5. sched.als re-key by stable id (F5) — unchanged from Rev 3
Key `sched.als` by **`al.id ?? String(n)`** (verId `iso#seq`; the fallback keeps a pre-verId legacy book
from `:undefined` — C14). Update the registry pattern + the test reconstruction (order by `iso`/`seq`).

## 6. Off-week (GU-003/F6) — minimal enlisted weekstash store, refusal via `CmdRefused`
- **`weekstashStore`:** `capture`/`restore` snapshot BOTH `WEEKSTASH` and `PRESERVED` (bump `GEN` on
  restore for the peek cache); `records`=`weekstash/<wk>`→blob; new `weekstash` LogicalCollection mapped
  to the `weeks` blob (`LOGICAL_TO_BLOB` typecheck forces the entry). Two new `weekstash.ts` exports
  (snapshot/restore of both maps).
- **`writeInputsBatchWith(stores, fn)`** enlists the extra store(s) before `fn`; `clearHistoryData`
  drops the stash inside it. **The protected-week refusal throws a recognisable `CmdRefused`** (a new
  class, or an `errResult` branch returning `{ok:false, reason:'refused'}` SILENTLY — no bug-shaped
  console log, unlike a bare throw which `errResult` logs `:355`). The throw reaches commit.ts phase 6 →
  `rollback` restores every enlisted store (the enlisted stash drop is undone; the double `histRestore`
  is idempotent). `writeInputsBatchWith` maps `ok:false`→`false`; **`clearHistoryData` returns 0 and
  skips its success log on refusal** (R3-003 — else AdminPage reports a rolled-back clear as success).
  Keep the trailing `persistAll()` unconditional. Test: a protected-week refusal leaves every stashed
  week + its preserved blob in place, `clearHistoryData` reports 0, no `weekstash` deletes on the stream.

**GU-005:** deferred to [GLOBAL-UNDO]; this step covers the SAVED path.

## 7. Build phasing (parity gate after each; full gates before PR)
1. **P1 — command core:** causalSeq per-pipeline + queued-descendant chaining + `causedBy` non-user +
   queue drain-on-throw + queued-commit context capture + `commitProjection`/`commitPhase` exports +
   scoped `expectedRevs` checker + `CmdRefused`. Unit tests.
2. **P2 — Tracker `mem` hydration + the batch/delete/scope-table write() seam for all 5 stores +
   settings reset-rehydrator + `signature()` for lw/trk.** Unit tests per store (incl. settings
   reset-then-overlay, Tracker capture of history/selection).
3. **P3 — F1 LW causal envelope** (§2.2–2.5): notify restructure, router with N1/M3, `LW_RESTORING`,
   `OUTBOUND_PENDING`, People-side; register lw guarded at the END. Heavy unit tests + the **mandatory
   live-scenario pass** (N1 + M3 cases). LW project green under the hostile TZ.
4. **P4 — Tracker gesture grouping** (§4): Class A → B (incl. applyLullCopy/restoreHiddenSyl) → C;
   `TRK_RESTORING`; flush-via-cmdDeferEffect; register trk guarded at the END. `smoke:tracker` green.
5. **P5 — sched.als re-key** (§5). 6. **P6 — off-week weekstash store + `CmdRefused` routing** (§6) +
   Finding-A / §12-B bookkeeping.

## 8. Testing / invariants
- **Frozen:** tfin 728/0 each phase; no painted byte; LW hostile-TZ green; issued put-once deferred.
- **Hard-enforce (new):** one gesture = one causal closure (BOTH directions; the multi-day reconcile =
  ONE `lw.sync` listing every cell; the idle-path reconcile = ONE projection); `write(entries[])`
  round-trips incl. create→delete/delete→restore, ordering, foreign-week refusal for EVERY week-scoped
  collection, settings reset-then-overlay, Tracker history/selection restore; **a two-store round-trip
  test (scheduler + LW in one reducer) asserting NO reconciler ran between the two writes** (Q2); an
  N-record write = one notify + one persist at the boundary; a throwing subscriber leaves the dispatcher
  idle + queue drained (C6); a protected-week refusal rolls back the enlisted weekstash + `clearHistoryData`
  reports 0 (N5/R3-003).
- **Advisory:** double-booking warn-not-block; reconcile fixed-point.
- **Property tests:** reducer purity/rollback; LW closure completeness both directions; queued-write
  idempotence; Tracker one-envelope-per-Class-A/B; `mem`-hydration + sGet-generation before-images.

## 9. Risks (plain terms)
- **F1 sync loop (highest):** commits inside the reconcile loop + the LW notify restructure (~48 sites);
  a regression is a SILENT sync divergence. Mitigation: three-round two-provider convergence (Fable
  traced it, SHIP-READY), unit + property tests, the mandatory live pass.
- **Tracker save path + mem hydration + history/live-let capture + the scope table (high):** vendored,
  425-check smoke; the M1 pointer-change re-derive is the fiddliest.
- **write() intricacy (medium):** scheduler nested-day splice; settings reset-rehydrator; covered by
  round-trip tests before any consumer exists.
- **Scope (managed, documented):** off-week full store, import-undo granularity, GU-005, Finding A,
  durable-write rollback — all deferred with reasons.

## 10. Open questions for the round-4 (final) confirm
1. **Settings reset-rehydrator (R3-001):** confirm a side-effect-free reset-then-overlay per settings
   loader (rules/templates/stores/qualcols/lookahead/…) fully re-derives the module CFG for a restored
   OLDER/smaller record and a delete, without a storage write — any loader whose defaults are not
   recoverable without reading storage?
2. **Tracker scope table + pointer-change re-derive (M1):** is the key-grammar→scope table complete for
   all registered collections, and does the whole-per-syllabus re-derive on a `plan.sylId`/course
   pointer change (with the changed-def-only SYL/byid rebuild) preserve unrelated dirty drafts and avoid
   the cross-chart data loss?
3. **Any residual** in the folded set (idle-path `lwSyncTurn`, flush-via-cmdDeferEffect, `CmdRefused`
   signalling, sGet generations, Tracker history/selection capture) — or is Rev 4 build-ready?

---

*Rev 4 written 17 Sep 26 (Opus 4.8 fast, this session), folding both round-3 red-teams (Fable
SHIP-READY + Codex 5; dispositions in the review log). Next: one final confirm round on Rev 4, then LOCK
+ build (P1). No build until the confirm returns clean or the owner accepts the residuals.*
