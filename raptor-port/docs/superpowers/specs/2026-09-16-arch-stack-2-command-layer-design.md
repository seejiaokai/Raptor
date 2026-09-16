# [ARCH-STACK] Step 2 — the one write/command layer — DESIGN (Rev 4, 16 Sep 26)

**Status:** Rev 4 — after three cross-provider red-team rounds (Codex GPT-6 Astra + Fable 5.1,
all converged, findings narrowing 11→7→7 / 13→9→7). Owner-facing decisions RESOLVED (§3.4).
This revision reorganizes around the **additive** framing (below) that dissolves the round-3
residual, and folds the remaining mechanism fixes. Going to both reviewers for a confirming
round 4, then build.
**Depends on:** Step 1 (stable ids everywhere) — DONE + live (rows, inputs, people, courses,
syllabuses, students all carry stable ids).
**Feeds:** Step 3 [GLOBAL-UNDO], Step 4 (one Absence record), Step 5 [DB-STEP].
**Plan of record:** `2026-09-13-architecture-rootcause-plan.md` (RC4; SEQ-001..004 binding).
**Review log:** `2026-09-16-arch-stack-2-command-layer-review-log.md`.

## 0. THE FRAMING — Step 2 is ADDITIVE (this is the key decision)

Step 2 **adds** the command gate + record-level change stream and runs them **alongside** the
existing machinery. It does **NOT** cut anything over:
- `persistAll` / `HOOKS.histPush` / the three per-module **snapshot undo stacks** all stay and keep
  working exactly as today.
- Every write is routed through `commit()`, which calls **today's** in-place writers and then
  **emits an envelope** onto the stream. On success, today's `histPush`/`persistAll`/`notify` run
  as they always did; the envelope is recorded **additionally**.
- The stream is the foundation the LATER steps consume: **Step 3** builds global undo from it,
  **Step 5** builds record-level persistence + the Dataverse adapter + conflict from it. Those
  cutovers (retiring `persistAll`, retiring the snapshot stacks, real per-record versioning) are
  **explicitly out of Step 2.**

**What Step 2 delivers on its own (real, shippable value):** (1) one authorization gate every
write passes (closes the "member undoes an admin decision" hole at the gate); (2) in-memory
**transactional atomicity** — a multi-step write either fully applies or fully rolls back
(today it can half-apply); (3) a **complete, correct record-level change stream** proven to
capture every durable write, ready for Steps 3/5. Nothing it does changes a rendered byte
(`tfin.js` 728/0) or how persistence/undo currently behave.

This framing is why the round-3 "once persistAll is retired…" findings no longer apply: **persistAll
is not retired at Step 2.** The stream is validated against the still-authoritative legacy path.

## Rev 4 change-list (round-3 dispositions)
- **Additive framing** (§0) — dissolves R3-001/R3-3 (interim histPush keeps its own post-apply
  snapshot; the command's phase-2 snapshot is a *separate* rollback copy) and R3-2 (the snapshot
  stacks are untouched at Step 2; their scope+origin keying is a Step-3 contract the stream carries).
- **"Join the open transaction" primitive** (§3.2): a `commit`/`commitAs` called while a
  transaction is open and the caller is on the reducer stack **joins** it (`txn.child(cmd)`);
  only commits raised from notify/subscribers enqueue (R3-1 / Codex R3-002/007).
- **Dynamic enlistment** — snapshot every store on first write, so rollback covers the full
  transitive write set incl. causal children (R3-002 / Codex; `commitInputEdit` also touches DAYS +
  amendment bookkeeping). §3.2.
- **Complete record registry** — LW `ledger`/`balances`/`oilpolicy`/`postouts`/config + Tracker
  `pace`/`lulls`/event-info/catalogue added; every durable writer + hydration key yields a Change
  (R3-003 / Codex). §3.1.
- **Causally-related mutations = ONE reducer**, not a command sequence (async moved out of the
  reducer, not the mutations) (R3-004 / Codex). §3.2/§5.4.
- **Split `als[n]`/`orig[di]` into own append-only records**, put-once at phase 5; keep live
  `sign[di]` mutable; rows nested in the day record (R3-6 / Fable). §3.1/§3.4.
- **`personId` from the ME/viewer binding, not SESSION** (R3-006 / Codex). §3.5.
- **Queue extends through phase-9 notify delivery; queued commands return a handle**, not a
  synchronous final result (R3-007 / Codex). §3.2.
- **Per-record in-memory revision map** so a coarse blob (`lw.war`) doesn't refuse a later undo;
  real conflict is Step 5 (R3-4 / Fable). §3.3.
- **Latch `HOOKS.toast` + the edit-log append** with the rest; discard on rollback (R3-7 / Fable). §3.2.
- **Owner decisions folded** (§3.4): undo silent-before-sent / on-the-record-after; roster/settings
  undoable.

---

## 1. Purpose & scope
One **write gate** every change passes through, emitting a **record-level change stream** — WHAT
changed, by WHOM, from WHERE, all-or-nothing — recorded **alongside** today's machinery (§0).

**In scope:** `commit()` gate; the transaction (dynamic-enlistment snapshot + latch + rollback +
in-transaction causal children via the join primitive + post-commit queue for independent
reactions); the complete record registry + derived `Change[]`/envelope; the origin taxonomy; an
undo-scope key + a `crossable` boundary flag (contracts Step 3 consumes); authorization at the gate
with a defined headless actor; incremental routing of all three modules + PEOPLE + VCONF; a
`MemoryDoor` test-double + the first invariant-harness increment + command-layer property tests.

**Out of scope (later steps):** retiring `persistAll` / the snapshot stacks (Step 3/5); global undo
(3); one-Absence model change (4); the Dataverse adapter + real per-record `version`/conflict (5);
UI/rendering; removing the quarantine (6).

**Non-negotiables:** `tfin.js` **728/0**; `npm test`/build/e2e/smoke green each phase; **reset, not
migrate**; every module adopts and ships on its own; the perf ceilings hold; **the app's
persistence and undo behave identically to today** (additive — no behaviour change to prove beyond
"nothing regressed").

---

## 2. Current state (first-hand; abbreviated — full map in the review log / earlier revs)
- **2.1 Scheduler**: funnel → marks → `afterSchedMutate`; `runInputWrite` (`store.ts:131-155`)
  already snapshots→applies→post-checks→rolls back — the pattern to generalize. ≥11 writers reach
  `HOOKS.histPush` without `afterSchedMutate`. `markEdit` fires `renderStatus`(=`notify`) + `toast`
  + `logEdit` **inside** the reducer. `actor`=display label; `SESSION.role`∈`admin|main`;
  person-identity is the separate **ME** binding, not `SESSION`.
- **2.1a Publish is irreversible in code** (`setDayApproved`, `publish.ts:180-201`; reopen removed);
  first approval writes the frozen Original `orig[di]`; live `sign[di]`/`signBind[di]` are mutable
  (only the copy in `als[n]` is append-only).
- **2.2** PEOPLE + VCONF + many settings writers bypass the funnel.
- **2.3 Leave War**: funnel → `persist()` (~22 keys) → notify; per-war snapshot undo; sync
  reconcilers under `locked()` tag `{source:'raptor'}`; **`retractLwRow` runs inside the
  `writeInputsBatch` reducer** (verified — the in-transaction-child claim matches the code); LW
  ledger/balances/oilpolicy/postouts/config are **separate durable keys** outside `wars`.
- **2.4 Tracker**: no funnel; async `sSet`; courses+syllabuses+students carry stable ids; `renCourse`
  label-only; `setFont` auto-persists; `switchCourse` confirms; undo exists (per course/syl, mark
  entries per student) and its `applyHist`/`applyMarkHist` DO save; writers chain awaits.
- **2.5 Storage**: whiteboard (7-blob union, `subscribe` stream) → postman (per-record write-behind,
  queue-depth status, never rolls back) → backend (no version). Four mega-blobs. `persist.ts` carries
  four week invariants. Reset clears `['inputs','weeks']`. Target door (Step 5): `put(…,version)` →
  412 + re-read + clear-that-record's-undo; FanOut splits blobs.

---

## 3. The command model

### 3.1 Command, derived Change, envelope, and the COMPLETE record registry

```ts
interface Command { type: string; scope: Scope; meta?: any; apply: (txn: Txn) => void }  // apply = SYNCHRONOUS mutation only
interface Change { op:'put'|'delete'; collection: LogicalCollection; id: string; staged?: boolean; before?: unknown; after?: unknown }
interface CommitEnvelope {
  seq: number; at: string; actor: Actor; origin: Origin; scope: Scope; type: string
  changes: Change[]; boundary?: { kind:'publish'; ids:string[]; crossable:boolean }; causedBy?: number
}
```
`Change` is a **derived output** (per-record deep-equal after apply), never a Command input. Rows
are **nested in the day record** — the `days/<wk>:<date>` Change carries the day incl. row order +
`secOrder`; a slot edit yields ONE day Change (the day owns the inverse), not a day + a row Change
(R3-6).

**The registry is COMPLETE** — every durable writer + hydration key has a logical record + a
`LOGICAL_TO_BLOB` entry; a writer that changes durable state MUST yield ≥1 Change (R3-003):

| module | logical records | owning blob |
|---|---|---|
| scheduler | `days/<wk>:<date>` (day incl. rows+secOrder); `sched.book/<wk>` (mutable book: pending/added/al/dayOK/cur/drafts/curDraft/ridV/amV **and** live `sign`/`signBind`); `sched.mutes/<wk>` (WARNOFF) | `weeks/<wk>` |
| scheduler-issued (append-only, put-once) | `sched.orig/<wk>:<di>`; `sched.als/<wk>:<verId>` (incl. its frozen sign copy) | `weeks/<wk>` |
| inputs | `inputs/<iid>` | `inputs/all` |
| plan | `plan/all` (PLANPUCKS+DAYRMK) | `plan/all` |
| people | `people/<personId>` | `people/all` |
| settings | `settings/<key>` — **every** durable settings writer (rules, day/duty/wave templates, stores, cxreasons, qualcols, lookahead, defaults) | `settings/<key>` |
| leave war | `lw.war/<warId>` (grid+states); **`lw.ledger`, `lw.balances`, `lw.oilpolicy`, `lw.postouts`, `lw.config`** (each its own record) | `leavewar/<key>` |
| tracker | `trk.marks`/`dates`/`roster`/`layout`/`syls`/`plan`/**`pace`/`lulls`/`eventinfo`/`catalogue`** (the `v3:` keys) | `tracker/<key>` |

### 3.2 The transaction (additive; latch + dynamic-enlistment rollback + join + post-commit queue)

`commit(cmd)` opens a transaction; **legacy `notify`/`HOOKS.histPush`/module `persist()`/
`recordHistory`/`HOOKS.toast`/`logEdit`/`logAction` are LATCHED** for phases 2–8 and released on
success in phase 9 (discarded on rollback — R3-7):
1. **Derive actor+origin internally** (§3.5); authorize `cmd.type`. Reject → nothing applied.
2. **Snapshot by dynamic enlistment** (R3-002): the transaction copies each store's affected slice
   **on its first write**, so the snapshot covers the *full transitive* write set — including causal
   children in other modules — without predeclaring it. (This is the generalized `runInputWrite`.)
3. **Apply the reducer** (synchronous). **A `commit`/`commitAs` called from inside the reducer JOINS
   this transaction** (`txn.child(cmd)` / an open-txn flag checked before enqueueing) — shared
   snapshot set (its blobs enlisted too), shared rollback, ONE envelope, its changes appended.
   `commitInputEdit`'s `retractLwRow`→`withdrawLeaveCell` is such a child (verified in-reducer).
   **Causally-related mutations stay in ONE reducer** (R3-004): async prompts/reads (`uiPrompt`,
   confirms, `await sSet`) are moved OUTSIDE `commit`; the synchronous mutations they used to
   interleave (e.g. `popGrade`'s grade + Last-Flown date) run together in one reducer/envelope.
4. **Derive `Change[]`** by per-record deep-equal over every enlisted record.
5. **Conflict + invariant checks** (`protectedTouched`; structural integrity; **put-once** on the
   append-only `sched.orig`/`sched.als` records so immutability is gate-enforceable — R3-6).
6. **On any failure: restore the enlisted snapshots, discard the latched effects, emit nothing**,
   return `conflict`/`invalid`. Rollback is real even with legacy `persistAll` installed, because
   the side-effects were latched, not executed.
7. **Emit the envelope** on the stream; assign `seq`; advance the in-memory revision (§3.3).
8. **Release the latch** → today's `histPush`/`persistAll`/`notify`/`toast` run **as they always
   did** (additive: the interim `histPush` keeps its **own** post-apply whole-world snapshot; the
   phase-2 snapshot was only the rollback copy — R3-001/R3-3).
9. **Drain the post-commit queue THROUGH notify delivery** (R3-007): the dispatcher stays busy while
   phase-8 notify runs; any `commit` a subscriber raises during delivery is enqueued (not nested)
   and drained after, `seq` at drain, subscribers seeing envelopes strictly in order. **A queued
   command returns a handle/promise, not a synchronous final result** (its `seq`/outcome aren't
   known until drain). Independent reactions (a sync recompute) run here as
   `commitAs(...,{origin:'projection', causedBy:seq})`.

**API:** `export function commit(cmd): CommitResult` (public; actor+origin internal) ·
`commitAs(cmd,{actor,origin})` (internal: sync/seed/restore) · `onCommit(fn)` · `txn.child(cmd)`
(in-reducer join). A queued (subscriber-raised) commit returns `{ queued:true, done: Promise<CommitResult> }`.

### 3.3 Origin taxonomy + revision (per-record map)
`Origin = 'user'|'remote'|'projection'|'restore'|'seed'`; only `user` is an undo entry; `remote`
applies silently (`emit:false`, no echo); `projection`/`restore`/`seed` emit locally, no undo entry.
**Revision:** the command layer keeps an **in-memory per-logical-record revision map** (even while
several logical records share one physical blob). Every authoritative write advances the touched
record's revision; undo pins the causal RESULT's per-record revisions. So a drained projection that
writes a *different* record (or a different cell of a coarse blob) does **not** refuse a later undo
of the user command (fixes R3-4's coarse-`lw.war` case). At Step 2 this map is single-tab and the
conflict check is exercised only by `MemoryDoor`; real cross-client conflict is Step 5.

### 3.4 Publish boundary + owner decision (RESOLVED — as Rev 3 §3.4, unchanged)
Frozen issued artefacts are their **own append-only, put-once records** (`sched.orig/<wk>:<di>`,
`sched.als/<wk>:<verId>` incl. its sign copy) — separate from the mutable `sched.book`, so the gate
enforces immutability at phase 5. Live `sign[di]`/`signBind[di]` stay ordinary.
**Owner decision (16 Sep 26):** Undo always works from the Undo button; **silent reverse BEFORE the
publish is sent/witnessed** (nothing has left the machine — none of the DB bugs can arise);
**an on-the-record forward withdrawal (a correcting amendment) AFTER** — append-only, unique
never-reused ids, derived credits recompute, with a one-line heads-up. The snapshot-undo never
crosses a sent publish. Recorded as `boundary.crossable` — crossable (silent-undoable) only for the
issuing session until a `remote` envelope references the id or the session ends; Step 3 reads it.
Recovery publishes under a NEW id; issued records + signatures never overwritten. **Roster/settings
edits ARE undoable** (`user` commands, never amendments).

### 3.5 Authorization (actor from SESSION + ME; headless actor)
`Actor = { id; role:'admin'|'member'|'system'; personId?; session }` — account id + effective role
from `SESSION` (`SESSION.role` `main`→`member`), **ownership `personId` from the ME/viewer binding**
(`auth.ts:28-29`), not `SESSION` (R3-006). Snapshot the actor when the command is created. The
**system actor** (`session:null`) is used only for `seed`/`projection`/`loadWeek` and — under a test
flag — the `SESSION=null` parity harness (keeps 728/0); never for a user restore. **Undo/redo
permission** = for every change in the inverse, `permission(originating type)` vs the CURRENT
effective actor + ownership (admin→member→undo-own-admin-decision is REFUSED). `commitAs` is not
exported. Client gate = defense-in-depth; real auth at Step 5.

### 3.6 Atomicity/conflict/test-double — as Rev 3 (in-memory rollback real; durable cross-blob
atomicity + real conflict deferred to Step 5; `MemoryDoor` models the faults now).

### 3.7 Undo-scope — as Rev 3: `{sched,weekId}|{inputs}|{plan}|{lw,warId}|{trk,courseId:sylId,student?}|{people}|{settings}`.

### 3.8 Staging by purpose — as Rev 3: only the interactive unsaved chart editor stages (`trk.syls`
held for Save); Save/duplicate/add/import/revert/delete commit their definition changes immediately;
`trk.layout`/marks/dates always immediate. State machine unchanged.

---

## 4. Stream consumers (Step 2 records; later steps consume)
1. **Persistence stays as today** (additive) — `persistAll` via `histPush` remains authoritative at
   Step 2. The `onCommit` **fold** subscriber (group changes by blob via `LOGICAL_TO_BLOB`,
   re-serialize each once, `emit:false` for `remote`) is DEFINED and unit-proven against the four
   week invariants, but **activated at Step 5**, not now.
2. **Undo (Step 3)** consumes the `user` envelopes' inverse data (incl. causal children's changes)
   + `boundary.crossable` + `scope`; the three snapshot stacks retire at Step 3 (**after Step 4**),
   keyed then on `scope.module`+`origin` so a foreign module's command never pushes another's stack.
3. **Sync (Step 4)** becomes an `onCommit` handler by id. **DB adapter (Step 5)** = same door,
   `RESET` per-version map, real `version`/412.

---

## 5. Adoption per module (strangler; parity gate after each)
- **5.1 Scheduler (first):** route writes through `commit`; derive by per-record deep-equal; **wrap
  every `HOOKS.histPush` site** (checklist); latch the mid-reducer `notify`/`toast`/`logEdit`. The
  interim `histPush`/`persistAll`/snapshot stack are **left running** (additive). `origin`
  board/drag=`user`, validate marks=`projection`, loadWeek/undo=`restore`, seed=`seed`.
- **5.2 PEOPLE + VCONF + full settings inventory:** `people.*` commands; route **every** durable
  settings writer (the registry §3.1) through named commands with explicit permissions; forbid the
  raw `settingsAdapter` back door.
- **5.3 Leave War:** wrap causal writers; the sync reconcilers become `projection` via `commitAs`;
  the causal input-delete→bid-delete runs **in the originating command's transaction** (join, §3.2).
  Register `lw.ledger`/`balances`/`oilpolicy`/`postouts`/`config`. LW's snapshot undo left running.
- **5.4 Tracker:** synchronous reducers (async prompts/reads outside `commit`; causally-related
  mutations in one reducer); stable-id keys; `renCourse`/`renSyl` label-only commands; staging by
  purpose. Register `pace`/`lulls`/`eventinfo`/`catalogue`.
- **5.5 Door contract + `MemoryDoor`** now; real backend Step 5.

## 6. Parity & proof — tfin 728/0 each phase; golden snapshots; suites green; **plus** a regression
proof that persistence + undo behave identically to pre-Step-2 (additive).

## 7. Testing harness — classify invariants (hard/advisory/frozen). Property tests: (a) reducer
throws mid-way ⇒ model + latched-effects fully rolled back, no partial persist/notify/toast/log;
(b) a command's causal child (input-delete+lw row) = ONE envelope with both changes, and a phase-5
failure leaves the bid untouched; (c) every durable writer in the registry yields ≥1 Change;
(d) a subscriber-raised commit is enqueued+drained (never nested), envelopes in order; (e)
admin-decides→toggle-member→undo REFUSED; (f) user cmd → projection on a different record → undo of
the user cmd succeeds (per-record revision); (g) `commit` leaves `histPush`/`persistAll` output
byte-identical to today (additive regression).

## 8. Rollout (within Step 2 — all additive)
1. Core: `commit`/`commitAs`/`txn.child`/derive/envelope/`onCommit` + latch + dynamic enlistment +
   post-commit queue + per-record revision map + `LOGICAL_TO_BLOB` + `MemoryDoor` + auth + actor +
   origin/scope/boundary + harness. 2. Scheduler routed (histPush sites wrapped; legacy path left
   running). 3. PEOPLE + VCONF + settings inventory. 4. Leave War (join causal effect; sync→projection;
   register all keys). 5. Tracker (sync reducers; register all keys). **No cutover of persistence or
   undo** — the fold subscriber and stack retirement are Steps 5/3. Each item shippable; nothing
   merges without "merge live".

## 9. Open questions
1. **RESOLVED** (owner): undo-of-publish semantics (§3.4); roster/settings undoable.
2. **Split a mega-blob at Step 2 vs Step 5?** Rev 4 keeps the per-record revision map in memory over
   the coarse blob (no split), conflict a Step-2 no-op. Confirm this is enough pre-Dataverse.
3. **Cross-backend atomicity** with the append-only docstore — Rev 4 leans forbid-until-Step-5.
