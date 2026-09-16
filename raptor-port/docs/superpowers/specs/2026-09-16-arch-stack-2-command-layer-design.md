# [ARCH-STACK] Step 2 — the one write/command layer — DESIGN (Rev 2, 16 Sep 26)

**Status:** Rev 2 — revised after round-1 cross-provider red-team (Codex GPT-6 Astra + Fable
5.1, both REVISE, converged). Back to both reviewers for round 2. Not yet built.
**Depends on:** Step 1 (stable ids everywhere) — DONE + live. *(Caveat: Tracker COURSE keys
still embed the course name — see §3.1/§5.4 F12 handling.)*
**Feeds:** Step 3 [GLOBAL-UNDO], Step 4 (one Absence record), Step 5 [DB-STEP].
**Plan of record:** `2026-09-13-architecture-rootcause-plan.md` (RC4; SEQ-001..004 binding).
**Review log:** `2026-09-16-arch-stack-2-command-layer-review-log.md`.

## Rev 2 change-list (dispositions — all 24 round-1 findings accepted)
- **Atomicity is snapshot/rollback, not staging-swap** (F1/CMD-002/003). §3.2 reordered; §3.6
  rewritten around the repo's existing `runInputWrite` pattern. `changes` moved off `Command`
  onto the derived envelope.
- **No 1:1 logical→storage mapping; Step-2 persistence is a per-module FOLD** (F2/CMD-001).
  Record-level writes arrive only at Step 5's FanOut. §3.1, §4, §5.5, §8 item 6 corrected;
  logical→physical map added.
- **Only `user`/`remote` bump the conflict version; projection/restore/seed don't** (F3/CMD-005).
  Single-tab conflict check is a no-op at Step 2, exercised only by `MemoryDoor`. §3.3, §3.6.
- **Actor is `{id,role,personId?,session}`; an explicit headless/system actor** keeps the parity
  harness (SESSION=null) at 728/0; restore re-authorizes against the *current* effective role
  (F6/CMD-004). §3.3/§3.5 reconciled; client gate is defense-in-depth.
- **Publish boundary = append-only issued artefacts only** (`als[n]`, sign/signBind), NOT the
  day-approve toggle; approve/reopen stay ordinary undoable; recovery republishes under a NEW id
  (F5/CMD-011). §3.4.
- **Derive Change[] from before/after snapshot state, not marks; wrap every `HOOKS.histPush`
  site** (F4/CMD-006). §5.1 checklist + dev guard; persistAll kept per collection until its sites
  are wrapped.
- **`staged` is per-Change/per-collection with a defined state machine + discard** (F8/CMD-008/009).
  §3.8.
- **Retire the snapshot stacks only after Step 4 (one Absence); authoritative cross-module effects
  are kept in the command's inverse data, not treated as recomputable projections** (CMD-010). §4/§5.3.
- **Inventory every durable settings writer** (CMD-007). §5.2.
- **Commit queue; no synchronous nested commit** (F7). §3.2.
- **Weeks persistence carries 4 invariants the subscriber must inherit** (F9). §4.
- **RESET becomes a per-version map** (F10). §4/§5.5.
- **Scope adds inputs/plan + per-student Tracker** (F11). §3.7.
- **Tracker uses text keys at Step 2; `renCourse` is one atomic multi-Change command** (F12). §5.4.
- **Reserve a silent-apply path (`emit:false`) for `remote` now** (F13). §4/§5.5.

---

## 1. Purpose & scope

Give the whole app **one write layer** every change passes through, emitting a
**record-level change stream** — a worded list of exactly WHAT changed, by WHOM, from WHERE,
all-or-nothing. Today: three write funnels (Scheduler, Leave War, Tracker) + two unfunnelled
writers (PEOPLE, VCONF/settings); change is detected by photographing the world to JSON and
diffing strings. That missing "WHAT changed" primitive is RC4.

**The stream already exists at the storage layer** (`Whiteboard.subscribe`, `whiteboard.ts:55`;
`Postman` consumes it, `postman.ts:29`). Step 2 adds the **logical command layer above** — actor
/ origin / atomicity / authorization / publish-boundary / undo-scope, which the storage `Change`
has no room for — and routes the three modules + PEOPLE + VCONF through it. **The versioned,
row-level backend (splitting the mega-blobs, per-record `version`) is Step 5** (`FanOutBackend`,
`data-model.md:773`); Step 2 defines the door *shape* + a fault-injectable test-double, and
persists by **folding** logical changes back into today's blobs.

**In scope (Step 2):** `commit(cmd, ctx)` gate + the derived `Change[]`/envelope; **snapshot/
rollback atomicity** + a conflict *contract* (not a production revision store) + `MemoryDoor`;
the **origin taxonomy** with its version-bump + undo-entry + silent-apply rules; an **undo-scope**
key; the **publish-boundary** contract; **authorization at the one gate** with a defined headless
actor; incremental routing of all three modules + PEOPLE + VCONF (strangler wrapper); the first
invariant-harness increment + command-layer property tests.

**Out of scope (own steps):** global undo itself (Step 3); the one-Absence model change (Step 4);
the Dataverse adapter + real per-record `version`/fan-out (Step 5); UI/rendering; removing the
quarantine (Step 6).

**Non-negotiables:** `tfin.js` **728/0** (the layer adds no rendered byte, and the headless actor
keeps the login-less harness writable); `npm test`/build/e2e/smoke green each phase; **reset, not
migrate** (reuse + extend the `SCHEMA_VERSION`/`resetPreSchema` gate); every module adopts and
ships on its own; a half-migrated app fully works.

---

## 2. The problem today (current state, first-hand; line refs)

### 2.1 Scheduler
- Primitives `slotVal/setSlotVal/fillSlot/txtGet/txtSet` (`engine/slots.ts`) raise a rid-anchored
  mark via `noteChange` → `SCHED.pending[rk]=1`; caller runs `afterSchedMutate()`
  (`state/view.ts:939`): reconcile → `markEdit()` → `HOOKS.histPush()` → `validate()` → render.
- **Change detection is whole-world JSON** (`histSnap`, `history.ts:44`), dedup by string
  equality. Marks are the only record-level "what changed" signal, raised separately.
- **`runInputWrite` (`store.ts:131-155`) already does snapshot → apply → post-check
  (`protectedTouched`) → rollback (`histRestore`)** — the pattern Step 2 generalizes for atomicity.
- **Persistence is welded to `HOOKS.histPush`** (+ `histApplied`/`weekSwapped`/`persistPeople`);
  `wirePersist` (`persist.ts:134`) appends `persistAll()`. **But ≥11 writers reach `HOOKS.histPush`
  WITHOUT `afterSchedMutate`**: day approve/publish/AL/clear-pending (`publish.ts:201,526,594,627`),
  sign-clear + warning-mute (`interactions.ts:927,1003`), drafts (`DraftsModal.tsx:58,113`),
  `Shell.tsx:170`, the inputs funnel `runInputWrite` (`store.ts:153`), section move/reorder
  (`store.ts:171-195`). Any emit-point narrower than "every histPush site" misses these.
- **`actor`: `HOOKS.whoami()`** returns the *display label* ('Admin'/'Squadron member',
  `store.ts:664`), not a role/personId; `SESSION.role` is an effective role switchable by
  `setEffectiveRole` (`auth.ts:26`); `canEditSched()` is false when `SESSION=null` (`auth.ts:31`) —
  the state the parity harness + engine tests run in. **`origin` has no seam.**
- **Deletes** renumber the live key-space, mark an inert `del:di.seq.kind` tombstone gated by
  `deletionWasIssued` (add→delete-before-publish = net no-op), sweep via `dropRowMarks`.
- **Amendment/undo**: `history.ts:26-28` — "publishing or reopening a single day is an ordinary
  undo step"; within a supported week undo freely crosses approve/AL (publish state rides
  `schedFields`). The hard boundary today is the preserved/unsupported-week quarantine
  (`protectedWeek()`), not approve.

### 2.2 PEOPLE + VCONF bypass the funnel
- **PEOPLE** via `persistPeople()` (Quals + `leavewar/sync.ts`), absent from `histSnap`.
  `renameCallsign` (`slots.ts:563`) marks nothing.
- **VCONF/settings** via `rulesSave()` → settings KV (`hooks.ts:85` → `settingsAdapter` →
  whiteboard `settings`). **But many durable settings have their OWN `store.set` writers**: stores,
  day/duty/wave templates (`DayTplModal.tsx:49`), cancellation reasons, qual columns, lookahead,
  section/wave defaults (`AdminPage.tsx:130-133`) — all reaching the whiteboard via `settingsAdapter`.

### 2.3 Leave War
- Strict funnel: causal write → `updateCurrent`/`updateWar` (`store.ts:1133/1140`) → one `persist()`
  (`store.ts:954`, ~22 keys atomically + `recordHistory()`) → `notify()`; `quiet` batches a range.
- `setCell` (`store.ts:1636`) is the only cell writer; own snapshot undo (cap 60) embedded in
  `persist()`, baselined **per-war**.
- **Causal vs projection already encoded**: the four `sync.ts` reconcilers run under `locked(...)`
  (never undo steps) and synced cells are tagged `{source:'raptor'}` (`raptorOwns`). **But sync is
  NOT pure projection**: deleting a synced input calls `withdrawLeaveCell` which deletes the
  authoritative bid state — restoring only the input can't rebuild the deleted approval (CMD-010).
- View-only writes (`setRole/setViewer/focusDay/setPeople`) notify without persist.

### 2.4 Tracker
- **No funnel**; each writer self-persists via async `sSet` (`core.js:148`) then `notify()`.
- **Auto-persist vs Save-changes is a PRODUCT split** but they **share physical records**: a
  line/arrow gesture does `pushUndo(); markDirty(); saveLayout()` (`core.js:2524,4060`) — auto-saves
  `layout` AND stages the syllabus; `setFont` stages `layout.__font` via the same whole-object
  `saveLayout` serializer. So "staged vs not" is **per field of one record**, not per command.
- **Undo EXISTS** and is NOT independent of saves: `applyHist` (`core.js:2217`) calls
  `markDirty()+saveLayout()`; `applyMarkHist` (`:2226`) saves marks/dates. Per course/student/
  syllabus; wiped on switch (`switchCourse` `:1272` no confirm; `leaveFlowEdits` `:3629` confirms).
- Keys embed the **course NAME** string (`kMarks/kDates/kPace/kPlan`, `core.js:271-304`) — Step 1
  did not re-key courses.

### 2.5 Storage door
- Chain: **module doors → Whiteboard (sync KV + change stream) → Postman (write-behind) → Backend**.
- `Whiteboard` (`whiteboard.ts:12`): `get/has/keys/set/delete/subscribe/snapshot`; `set` returns
  true only on real change; `delete` emits `value:null`; **typed on a fixed 7-member `Collection`
  union — `snapshot()` silently drops any other collection** (`whiteboard.ts:65`).
- `Postman`: subscribes, write-behinds per record (coalesce 300ms, backoff cap 30s, **never rolls
  the whiteboard back**); `SaveStatus` is **queue-depth only** (not confirmed durable — `[TRK-DISK]`).
- `Backend` (`backend.ts:11`): `loadAll()` + `put(collection,id,json)` + `remove(...)`; **7 fixed
  collections, no version, no `get`, no `list`, no subscribe.** Four mega-blobs (`inputs/all`,
  `people/all`, `plan/all`, `leavewar/wars`) each cover thousands of logical rows.
- `persist.ts` carries **week invariants**: a preserved pre-Phase-2 week is written from its retained
  blob, never re-serialized (`:99-111`); the loaded week is stored only once dirty (pristine seed
  never stored, `:112-115`); orphan `weeks/*` are deleted (`:121`); the loadWeek swap window
  suppresses filing live days under the new id (`:33,104`).
- Durability: trust-in-memory, no ack, no cross-tab safety, last-writer-wins. The docstore
  (`docstore.ts:58`, resolves on `tx.oncomplete`) is the only durable-ack model — copy it at Step 5.
- **Reset**: `SCHEMA_VERSION` (`reset.ts:18`), stamp `settings/schema`, `resetPreSchema` clears
  **only `['inputs','weeks']`** (`reset.ts:28`) pre-fill, awaits durable deletes, verifies, stamps
  last, else boot → Retry.
- **Target door (Step 5, `data-model.md:875`):** `put(collection,id,json,version)` → returns
  version; **mismatch rejected (412), re-read, replace on whiteboard, tell app, clear that record's
  undo stack**; `subscribe`/`since(changeSeq)`; `FanOutBackend` (`:773`) splits the mega-blobs.

---

## 3. The command model

### 3.1 A command, the derived change, and the envelope

```ts
interface Command {
  type: string            // 'sched.slot.set' | 'sched.row.delete' | 'people.qual.set'
                          //   | 'lw.bid.set' | 'trk.mark.set' | 'trk.struct.save' | 'settings.rule.set' …
  scope: Scope            // §3.7
  meta?: Record<string, any>  // reducer payload (di, key, personId, …)
  apply: (txn: Txn) => void   // the reducer: calls today's in-place writers on txn-owned state
}

interface Change {        // DERIVED after apply, by diffing the snapshot; NOT a Command input
  op: 'put' | 'delete'
  collection: LogicalCollection  // 'days'|'inputs'|'people'|'rules'|'settings.*'|'lw.bids'|'lw.grid'|'trk.marks'|'trk.syls'|'trk.layout'|…
  id: string              // stable id where one exists; a well-formed text key where Step 1 didn't re-key (Tracker course, §5.4)
  staged?: boolean        // §3.8 — set per-Change by the module's collection policy
  before?: unknown; after?: unknown   // for Step 3 inverse-patch
}

interface CommitEnvelope {
  seq: number; at: string /* frozen ISO */;
  actor: Actor            // §3.5 — {id, role, personId?, session}
  origin: Origin          // §3.3
  scope: Scope            // §3.7
  type: string
  changes: Change[]       // DERIVED output — lives here, not on Command
  boundary?: PublishRef   // §3.4
}
```

Design choices (revised):
- **`changes` is a derived OUTPUT on the envelope**, produced by diffing the pre-apply snapshot
  against post-apply state by id — *not* a caller-supplied input (F1). This is uniform across
  modules and independent of the scheduler's amendment marks (which stay the amendment signal but
  do NOT drive change-derivation — F4).
- **No 1:1 logical→storage mapping.** A logical `Change` names a *logical* record (a bid, an input,
  a scheduler row); at Step 2 it does not correspond to a whiteboard record (those are 7 blobs).
  Persistence therefore **folds** (§4): group the commit's changes by owning physical blob,
  re-serialize each touched blob once, one `wb.set` per blob. Record-level `wb` writes arrive only
  with Step 5's FanOut. A **logical→physical map** (`LOGICAL_TO_BLOB`) is part of the door contract.
- create/edit/delete/reorder are distinct `type`s; all reduce to put/delete `Change`s.
- **The command wraps, never replaces, today's mutators or the render path** — parity 728/0.

### 3.2 The API + ordering + the commit queue

```ts
function commit(cmd: Command, ctx?: { actor?: Actor; origin?: Origin }): CommitResult
// CommitResult = { ok:true, envelope } | { ok:false, reason:'unauthorized'|'conflict'|'invalid', detail }
function onCommit(fn: (env: CommitEnvelope) => void): () => void
```

**Phases, in order (F1 — snapshot/rollback, not staging-swap):**
1. **Authorize** `type` + `ctx.actor` (§3.5). Reject → `unauthorized`, nothing applied.
2. **Snapshot** the affected records: `histSnap()` for sched, the immutable `state` reference for
   LW, JSON copies of the touched `v3:…` slices for Tracker.
3. **Apply** the reducer (`cmd.apply`) — today's in-place writers run against txn-owned state.
4. **Derive `Change[]`** by diffing snapshot vs post-apply, by id.
5. **Conflict + post-apply invariant checks** (`protectedTouched`, structural integrity, §3.6).
6. **On any failure in 3–5: restore the snapshot, emit nothing, return** `conflict`/`invalid`.
7. **Persist**: `wb.batch(changes)` — the fold (§4), one blob re-serialization each.
8. **Append the envelope**, assign `seq`.
9. **Notify** (fan out to module notifiers + `onCommit` subscribers).

**The commit queue (F7).** `commit` is **non-reentrant**: a `commit` requested while another is in
phases 2–9 (e.g. a sync `projection` commit fired by a `notify` subscriber) is **enqueued and
drained after the outer completes**; `seq` is assigned at drain; subscribers see envelopes strictly
in order. Synchronous nested commit is forbidden (asserted in dev). This defines the ordering the
sync lane needs, which today's `SYNCING` flag only half-covers.

### 3.3 Origin taxonomy (SEQ-004) — with version-bump + undo + silent-apply rules

`type Origin = 'user' | 'remote' | 'projection' | 'restore' | 'seed'`

| origin | meaning | bumps conflict version? | undo entry? | re-auth? | applied silently? |
|---|---|---|---|---|---|
| `user` | causal edit the actor initiated | **yes** | **yes** | yes | no (emits) |
| `remote` | change from another client/the DB (future) | **yes** (already advanced at source) | no | no | **yes (`emit:false`)** so it doesn't echo back (F13) |
| `projection` | deterministic recompute (LW sync diff-copy, OIL, validate marks, roster reprojection) | **no** (F3) | **no** | no | emits (local) |
| `restore` | undo/redo inverse-patch, or `loadWeek` | **no** | no (it IS the undo) | **YES — against the CURRENT effective actor** (F6/CMD-004) | emits (local) |
| `seed` | boot/demo seeding, migration | **no** | no | no (headless/system actor) | emits (local) |

- **Only `user`/`remote` advance the version a later undo pins against** (F3) — otherwise the sync
  `projection` that follows almost every user edit would make every undo a `conflict`.
- **`projection` is not automatically "recomputable/no inverse".** Where a projection performs an
  authoritative cross-module effect (deleting a synced input → deleting its bid via
  `withdrawLeaveCell`, §2.3), that effect is **kept in the originating `user` command's inverse
  data**, not discarded as recomputable (CMD-010). An origin label alone is insufficient; the
  authoritative effect travels with the causal command.

### 3.4 Publish-boundary contract (SEQ-002) — append-only artefacts only (F5)

The boundary is the **append-only issued artefacts**: the AL snapshot `SCHED.als[n]` and its
`sign`/`signBind` entries (matching `data-model.md:899` "Amendment, Signoff append-only"). These
are frozen at the gate — immutable, never mutated by any command, never crossed by Step 3's undo.
**`dayOK` / `al` / `curDraft` / the day-approve toggle stay ORDINARY user records** — approving or
reopening a day (`setDayApproved`, `publish.ts:201`) remains a normal undoable step, exactly as
today (`history.ts:26-28`); making it un-undoable would be a silent behaviour change the parity gate
can't catch. **Recovery** (load an old version → republish) copies the old *content* into working
state and publishes under a **NEW** monotonically-increasing id via `alIssue`/`nextSeq`
(`publish.ts:578`); the source issued record + its signatures are never overwritten (F5/CMD-011).
§3.4 only records `boundary` on the envelope and freezes the listed artefact ids; Step 3 consumes it.

### 3.5 Authorization at the one gate (ARCH-01) — with a real actor + headless actor (F6)

```ts
type Actor = { id: string; role: 'admin'|'member'|'system'; personId?: string; session: string|null }
```
- `Actor` is sourced from `SESSION` (the **effective** role via `setEffectiveRole`, `auth.ts:26`) +
  the person id — **not** the display label `whoami()` returns. `whoami()` stays for the edit-log
  by/at stamp.
- **The headless/system actor** (`{id:'system', role:'system', session:null}`) is used for `seed`,
  `projection`, `restore`-internals, and — under an explicit test flag — the **parity harness +
  engine tests**, which run with `SESSION=null`. Without this, `sched.*=canEditSched` would refuse
  every command in the login-less harness and **break 728/0** (F6). `system` is permitted for
  seed/projection/restore and headless writes; it is never reachable from a UI entry point.
- **Every command type declares its permission**; `commit` checks it against the actor **before
  apply**, including undo/redo/import/restore. **`restore` re-authorizes against the CURRENT
  effective actor + target ownership** (an admin who dropped to member cannot undo their own admin
  bid decision — `toggleRole` retains history, `store.ts:280`; LW `historyApply` restores without
  writer checks today, `store.ts:1091`). This reconciles the §3.3 note ("original command authed")
  with §3.5: the *original* authorization does not license a *later* reversal by a now-lesser actor.
- **`origin`/`actor` are set only at internal entry points**, never accepted from a UI caller, so a
  caller can't self-elevate by claiming `origin:'remote'` or a different actor.
- **Framing:** the client-side gate is **defense-in-depth**; real authorization lands with Step 5
  sign-in. Documented as such.

### 3.6 Atomicity (snapshot/rollback) + conflict contract + test-double (F1, F3, SEQ-003)

- **Atomicity = snapshot/rollback** (the existing `runInputWrite` pattern, `store.ts:131`), NOT a
  staging swap: phases 2→6 of §3.2. Worked case (approve leave = bid change + Absence write): both
  run inside the reducer against snapshotted state; if the Absence step throws, phase 6 restores the
  snapshot so the bid change is un-applied too. **A reducer that throws mid-way leaves model AND
  whiteboard byte-identical** — a required property test.
- **In-memory atomicity is real at Step 2; durable atomicity is not** (F1/CMD-002). The postman
  coalesces/retries per blob and never rolls back, so a two-blob commit can persist one blob and
  fail the other across a reload. Step 2 states this honestly: **the persistence fold reduces the
  window** (fewer, blob-level writes) but a true durable transaction/journal is **Step 5** (the
  versioned door + ack). The `MemoryDoor` models the fault so the Step-3/5 work has a test surface.
- **Conflict**: the `Command`/`Change` carry the versions read; `commit` refuses (`conflict`) if a
  pinned record advanced. **At Step 2, versions are collection-granular and the check is a single-tab
  no-op** — there is no production per-record revision store yet (that's Step 5). It is **exercised
  only by `MemoryDoor`'s injected second-tab fault**, so the contract + tests exist before the real
  store. Only `user`/`remote` bump (§3.3), so a user edit followed by a projection does not refuse
  the user's later undo (F3 test: user → projection(same collection) → undo(user) succeeds).
- **`MemoryDoor`** implements the door (§5.5) with faults: reject a put, drop an ack, reorder
  commits, a second tab advancing a version.

### 3.7 Undo-scope (F11)

```ts
type Scope =
  | { module:'sched'; key: string /* weekId */ }
  | { module:'inputs' }                         // INPUTS span weeks — app-global, not week-scoped
  | { module:'plan' }                           // PLANPUCKS/DAYRMK — app-global
  | { module:'lw'; key: string /* warId */ }
  | { module:'trk'; key: string /* `${courseId}:${sylId}` */; student?: string /* mark entries */ }
  | { module:'people' } | { module:'settings' }
```
Undo is already bounded per module (sched per-week, LW per-war, Tracker per course+syllabus, and
Tracker mark entries additionally per **student**, `core.js:2235,3450`). INPUTS and the planning
layer are **not** week-scoped (persisted whole as `inputs/all`/`plan/all`; an input spans weeks) —
they get their own app-global scope rather than riding the scheduler's per-week key. Step 3 filters
replay by `{actor, session}` and honours scope (incl. the per-student Tracker filter, or explicitly
drops it — decided in Step 3). Step 2 only records it.

### 3.8 Staged commands — per-Change, with a state machine (F8)

`staged` is a **per-Change (per-collection) attribute, not a whole-command mode** (F8): within one
Tracker gesture, `trk.syls` changes are **held**, while `trk.layout`/`trk.marks`/`trk.dates` changes
**commit immediately** — matching today's `saveLayout` auto-save + `sylDirty` structure-staging on
one gesture. A `restore`-origin Tracker command follows the same per-collection rule.

**Staging state machine** (resolves F8/CMD-009):
- A staged change writes the **working overlay** + advances the **staged history cursor** (so the
  editor + undo work); its `Change` is **withheld from persistence**.
- **Save** (`trk.struct.save`) serializes the **current overlay against its baseline** (not a replay
  of queued snapshots) into `trk.syls` changes, emitted as one batch.
- **Discard** (`trk.struct.discard`, what `leaveFlowEdits`/`switchCourse` emit) restores the baseline
  and **invalidates the staged history entries** (so undo can't resurrect a discarded structure edit
  or persist a half-staged one).
- Undo across the stage boundary moves only the overlay + cursor; it never persists a staged change
  (F8's S0→stage S1,S2→undo S2 case: undo moves the overlay, persists nothing; a later Save
  serializes the *current* overlay, not a replayed S2).

---

## 4. How the stream is consumed (built once)

1. **Persistence — a per-module FOLD** (F2). An `onCommit` subscriber groups the envelope's changes
   by owning physical blob via `LOGICAL_TO_BLOB`, re-serializes each touched blob once, and issues
   one `wb.set` per blob (a `wb.batch` that emits the underlying whiteboard changes together). This
   **is** today's `persist()`/`persistAll` logic, now driven by the command rather than a hook
   monkey-patch. Record-level `wb` writes are **Step 5** (FanOut). The subscriber must inherit the
   **four weeks invariants** (F9): preserved-week written from its retained blob (never
   re-serialized), pristine seed never stored, orphan `weeks/*` deleted, loadWeek swap-window
   suppression — gated by `persist.test.ts`. `remote`-origin changes apply with **`emit:false`** so
   they don't echo back to the backend (F13). Whole-world `persistAll` stays for **un-adopted**
   collections and for any collection whose `HOOKS.histPush` sites aren't all wrapped yet (§5.1),
   shrinking per phase.
2. **Undo (Step 3)** — inverse-patch log from `user` envelopes; replay backwards honouring
   `boundary` + `scope`; scoped to actor+session; authoritative cross-module effects reverse with
   their causal command (§3.3). Retires the three snapshot stacks — **but only after Step 4** (F/CMD-010).
3. **Sync (Step 4)** — the LW↔inputs reconciliation becomes an `onCommit` handler reacting to
   Absence/bid changes by id.
4. **DB adapter (Step 5)** — the same door, Dataverse-backed; `remote` commits flow in via the stream;
   `RESET` becomes a **per-version map** (F10) so adopting a shape-changing collection clears it +
   bumps `SCHEMA_VERSION` together.

---

## 5. Adoption per module (incremental strangler wrapper)

Wrap, don't rewrite. Parity gate (tfin 728/0 + golden snapshots) after each module.

### 5.1 Scheduler (first adopter)
- `commit()` scheduler reducers call today's `setSlotVal/txtSet/markDeletion/…` on snapshotted
  state; **`Change[]` is derived by before/after diff by rid**, NOT from `SCHED.pending` (F4). Marks
  stay the amendment signal only.
- **Wrap every `HOOKS.histPush` call site** — a checklist, not just `afterSchedMutate`'s tail (F4):
  the funnel epilogue, day approve/publish/AL/clear-pending, sign-clear, warning-mute, drafts,
  `Shell.tsx:170`, `runInputWrite`, section move/reorder. **Keep `persistAll` for a collection until
  its checklist is empty**; add a dev-mode guard that `HOOKS.histPush` reached outside `commit()`
  for an adopted collection warns, with a test.
- `origin`: board/drag/palette = `user`; `validate()` marks = `projection`; `loadWeek`/undo =
  `restore`; seed/autoAccept = `seed` (system actor). `scope={sched, weekId}` (inputs → `{inputs}`,
  plan → `{plan}`). `boundary` set only when an AL snapshot / sign entry is appended (§3.4).

### 5.2 PEOPLE + VCONF + all durable settings (CMD-007)
- `people.qual.set/add/remove/rename` → commands (`user`, `{people}`); `persistPeople` becomes the
  people subscriber. **Owner call (Q2):** are roster/settings edits in the global undo timeline?
  Proposal: yes as `user` commands, but never amendments.
- **Inventory every durable settings writer** and route each through a named command with an explicit
  permission + undo policy: `rules`, stores, day/duty/wave templates, cancellation reasons, qual
  columns, lookahead, section/wave defaults (`DayTplModal`/`AdminPage`/…). Document any intentional
  exclusion; forbid an adopted setting from also using the raw `settingsAdapter` back door.

### 5.3 Leave War (already funnelled + already tags projection)
- Wrap the causal writers; the existing single `persist()` becomes "emit envelope; the fold
  subscriber writes `leavewar/wars`". The four sync reconcilers become `origin:'projection'`
  commands (the `locked()` guard stays as mechanical re-entrancy safety; "not an undo step" now
  derives from `origin`). **Authoritative cross-module effects** the sync performs (input-delete →
  bid-delete via `withdrawLeaveCell`) are carried in the **causal command's inverse data**, not
  treated as recomputable (CMD-010). `scope={lw, warId}`. **LW's own snapshot undo retires only at
  Step 3, and only after Step 4's one-Absence model** — until then it runs in parallel (additive;
  a required proof: the parallel stacks can't disagree in a user-visible way before Step 3 — F7/§9).

### 5.4 Tracker (no funnel, async, product save-split, text course keys)
- Impose the funnel: each `save*` becomes a command whose reducer does today's slice mutation; the
  async `sSet` becomes the tracker collection's fold subscriber. **`staged` is per-collection** (§3.8):
  `trk.syls` held, `trk.layout`/marks/dates immediate — so one gesture that drags a ball (auto-save)
  and edits structure (staged) is one command with mixed-staged changes.
- **Change.id uses the existing text key at Step 2** (Step 1 didn't re-key courses — F12);
  `renCourse` becomes **one atomic multi-Change command** (delete-old-keys + put-new-keys) so a
  rename stays all-or-nothing. Course re-keying to a stable id is a later [TRK-CSID] follow-on, not a
  Step-2 prerequisite.
- Tracker's chart+mark undo retires at Step 3 (parallel until then). `scope={trk,
  `${courseId}:${sylId}`, student?}`.

### 5.5 The record-oriented door (contract + `MemoryDoor` now; real backend Step 5)
- Door shape (today's `Whiteboard` API + version): `get(collection,id) /
  put(collection,id,json,{version}) / delete(collection,id,{version}) / subscribe(fn) /
  batch(changes,{emit?})`. `emit:false` is the silent-apply path for `remote` (F13).
- **`LOGICAL_TO_BLOB`** maps each logical collection to its owning physical blob (Step 2) and, later,
  to its own row (Step 5). `MemoryDoor` implements the shape + faults now; the production
  whiteboard→postman→Backend chain is unchanged. The **mega-blob split + real `version`/412** is
  Step 5. **`RESET` becomes a per-version map** (F10): splitting `leavewar/wars` (or any blob) means
  adding it to that version's clear-set + bumping `SCHEMA_VERSION`, with a boot test.

---

## 6. Parity & proof
- `tfin.js` 728/0 each phase (issued content byte-frozen; layer adds no output; headless actor keeps
  the login-less harness writable — F6).
- Golden-snapshot week/board/LW grid/Tracker before & after each module's adoption — identical.
- Existing per-module suites green; command tests additive.

## 7. Testing harness (first increment now)
- Small deterministic invariant harness, grown per step. **Classify first (SEQ-001):** **hard**
  (cross-refs resolve to a live id; authorization on every command; atomic all-or-nothing), **advisory**
  (double-booking is *warn-not-block* `avail.ts:519`, crew rest — assert the WARNING + cross-consumer
  agreement, never a refusal), **frozen** (issued snapshots immutable; a boundary never crossed by undo).
- **Command-layer property tests:** (a) a reducer that throws mid-way ⇒ model + whiteboard
  byte-identical (F1); (b) conflict refusal under `MemoryDoor`'s second-tab fault; (c) user → projection
  (same collection) → undo(user) **succeeds** (F3); (d) an `onCommit` subscriber that itself commits is
  enqueued, not nested (F7); (e) staged: stage S1,S2 → undo S2 → Save persists the current overlay, not
  a replayed S2 (F8). Persistence-fault tests are Step 5 against `MemoryDoor`.

## 8. Rollout order (within Step 2)
1. Core: `commit`/derive/envelope/`onCommit` + commit queue + `wb.batch(fold, {emit?})` +
   `LOGICAL_TO_BLOB` + `MemoryDoor` + auth table + actor/headless-actor + origin/scope/boundary +
   harness scaffold. No module wired.
2. Scheduler adoption behind the funnel — **all histPush sites wrapped**, persistAll kept until the
   checklist is empty; parity gate.
3. PEOPLE + VCONF + the full settings inventory; parity gate.
4. Leave War adoption (sync → `projection`; authoritative effects in causal inverse); parity gate.
5. Tracker adoption (per-collection staged; renCourse atomic); parity gate.
6. Persistence fold replaces `persistAll` **per collection, only once that collection's histPush
   sites are wrapped and the weeks invariants (F9) pass against the subscriber alone.**
Each item independently shippable/reversible; nothing merges without "merge live". **Snapshot stacks
are NOT retired here — that is Step 3, after Step 4** (CMD-010).

## 9. Open questions for round 2
1. **Split a mega-blob at Step 2, or stay collection-granular until Step 5?** Rev 2 keeps the fold
   (no split) and makes the conflict check a single-tab no-op exercised only by `MemoryDoor`. Is a
   *minimal* `leavewar/wars`/`inputs/all` split worth pulling into Step 2 so per-record conflict is
   real pre-Dataverse, or is collection-granular genuinely enough until Step 5? (Codex CMD-005/Q3.)
2. **Roster/settings undoability** (§5.2) — owner-facing behaviour call: in the global undo timeline
   or excluded as today?
3. **Cross-backend atomicity** — a command touching a whiteboard collection *and* the IndexedDB
   docstore: forbid cross-backend commands until Step 5, or define a two-phase now? (Rev 2 leans:
   forbid; the docstore is append-only and already separate.)
4. **Parallel-undo interim proof** (§5.3) — while LW's/Tracker's own snapshot undos run alongside the
   command stream (before Step 3 retires them), prove the two can't disagree visibly. Is "additive
   until Step 3" demonstrable, or does the interim need the old stacks read-only?
5. **Version placement at Step 5** — per-record field vs per-collection vector; what Dataverse gives
   cheaply (`versionnumber`/`If-Match`). (Informational for Step 2; confirm the door shape doesn't
   preclude it.)
```
