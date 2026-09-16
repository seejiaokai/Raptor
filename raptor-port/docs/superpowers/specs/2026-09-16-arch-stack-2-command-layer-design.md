# [ARCH-STACK] Step 2 — the one write/command layer — DESIGN (16 Sep 26)

**Status:** DRAFT for cross-provider red-team (Codex + Fable). Not yet built.
**Depends on:** Step 1 (stable ids everywhere) — DONE + live.
**Feeds:** Step 3 [GLOBAL-UNDO], Step 4 (one Absence record), Step 5 [DB-STEP].
**Plan of record:** `2026-09-13-architecture-rootcause-plan.md` (RC4 = this step; SEQ-002/003/004 binding here).
**Current-state maps (this session, first-hand):** scheduler write/undo/persist; Leave War + Tracker write/undo/storage; storage door. Line refs inline below.

---

## 1. Purpose & scope

Give the whole app **one write layer** every change passes through, emitting a
**record-level change stream** — a worded list of exactly WHAT changed, by WHOM, from
WHERE, all-or-nothing. Today the app has *three* write funnels (Scheduler, Leave War,
Tracker) plus *two* unfunnelled writers (PEOPLE, VCONF/settings), and detects change by
photographing the whole world to JSON and diffing strings. That missing "WHAT changed"
primitive is the shared root cause (RC4).

**Key discovery from the current-state map (reframes the build):** the record-level change
stream *already exists at the storage layer*. `Whiteboard.subscribe` (`src/storage/whiteboard.ts:55`)
emits a per-record `Change {collection, id, value|null}` on every mutation, and `Postman`
(`src/storage/postman.ts:29`) already consumes it for write-behind persistence. So Step 2
does **not** invent a stream or a persistence engine. It adds the **logical command layer
above** the whiteboard — the part that carries actor / origin / atomicity / authorization /
publish-boundary / undo-scope, which the storage `Change` has no room for — and routes the
three modules + PEOPLE + VCONF through it. The versioned record *backend* (splitting the
mega-blobs, per-record `version`) is Step 5's `FanOutBackend` (`data-model.md:773`, §9);
Step 2 defines the door contract and a test-double but does not build the Dataverse adapter.

**In scope (Step 2):**
- `commit(cmd, {actor, origin})` — the one logical write gate — and the `Change[]`/envelope
  it emits into the existing whiteboard stream.
- **Atomicity + conflict contract** (SEQ-003) + a **storage test-double** (`MemoryDoor`).
- **Origin taxonomy** — causal vs remote vs projection vs restore vs seed (SEQ-004); this
  formalizes what Leave War already does ad hoc with `locked()` + `source:'raptor'`.
- **Undo-scope key** on every envelope (per-war, per-course+syllabus, per-week) so Step 3's
  undo stays bounded exactly as each module already requires.
- **Publish-boundary contract** on commands (SEQ-002) for Step 3.
- **Authorization at the one gate** (ARCH-01), not at ~12 writers.
- Routing all three modules + PEOPLE + VCONF through it **incrementally** (strangler wrapper).
- First increment of the **invariant harness** + stateful property tests at the command layer.

**Explicitly OUT of scope (own later steps):**
- Building global undo itself (Step 3) — only carry the contract + scope it needs.
- The one-Absence-record model change (Step 4) — only make the LW↔inputs sync an `onCommit`
  handler rather than change the record model.
- The Dataverse adapter + per-record `version`/fan-out backend (Step 5) — define the door +
  test-double now.
- UI/rendering (string builders, perf contracts) — untouched.
- Removing quarantine/legacy machinery (Step 6).

**Non-negotiables:**
- `reference/tfin.js` stays **728/0** — the layer sits *above* today's mutators and changes
  not one rendered byte.
- `npm test` / build / e2e / smoke green each phase.
- **Reset, not migrate** (demo data) — reuse the `SCHEMA_VERSION`/`resetPreSchema` gate
  (`src/storage/reset.ts:18,53`); no back-compat apparatus.
- Incremental: every module adopts and ships on its own; a half-migrated app fully works.

---

## 2. The problem today (current state, grounded, first-hand)

### 2.1 Scheduler
- Write primitives `slotVal/setSlotVal/fillSlot/txtGet/txtSet` (`src/engine/slots.ts`) raise
  an imperative rid-anchored mark via `noteChange(key)` → `SCHED.pending[rk]=1`; the caller
  then runs `afterSchedMutate()` (`src/state/view.ts:939`): reconcile marks → `markEdit()` →
  `HOOKS.histPush()` → `validate()` → render.
- **Change detection is whole-world JSON.** `histSnap()` (`src/state/history.ts:44`)
  stringifies `{DAYS, INPUTS, 14 SCHED fields, WARNOFF, PLANPUCKS, DAYRMK}`, dedups by full
  string equality. The amendment marks (`SCHED.pending`) are the only record-level "what
  changed" signal, raised *separately* from the snapshot.
- **Persistence is welded to `HOOKS.histPush`** (+ `histApplied`/`weekSwapped`/`persistPeople`);
  `wirePersist` (`src/state/persist.ts:134`) monkey-patches those to append `persistAll()`.
  A write not terminating there is silently unsaved. → the single choke-point to hang
  `{actor, origin}` on.
- **`actor` has one seam: `HOOKS.whoami()`** (`'Unknown'` headless), feeding only the edit log.
  **`origin` has no seam** — nothing distinguishes UI/sync/undo/seed except which fn was called.
- **Deletes are structurally distinct**: renumber the live key-space, mark an inert
  `del:di.seq.kind` tombstone gated by `deletionWasIssued` (add→delete-before-publish is a net
  no-op), sweep stale marks via `dropRowMarks`. create/edit/delete/reorder are not a uniform
  field-write.
- **Publish boundary** is enforced by the preserved/unsupported-week read-only quarantine
  (`protectedWeek()`), not the undo stack; within a supported week undo freely crosses
  approve/AL because publish state rides the snapshot (`schedFields`).

### 2.2 PEOPLE and VCONF bypass the funnel (by design, today)
- **PEOPLE** persists via its own `persistPeople()` doorway (Quals page + `leavewar/sync.ts`),
  absent from `histSnap` (roster edits not undoable, not amendments). `renameCallsign`
  (`slots.ts:563`) marks nothing pending by design.
- **VCONF/settings** persist via `rulesSave()` → the `storeBackend` settings KV
  (`src/engine/hooks.ts:85` → `settingsAdapter` → whiteboard `settings` collection) — global,
  unsnapshotted, unmarked.

### 2.3 Leave War (own funnel, own undo, already distinguishes causal vs projection)
- **Strict funnel:** every causal write → `updateCurrent`/`updateWar` (`store.ts:1133/1140`)
  → one `persist()` (`store.ts:954`, writes ~22 keys atomically + `recordHistory()`) →
  `notify()`. A `quiet` flag batches a range into one persist/notify.
- `setCell` (`store.ts:1636`) is the *only* cell writer (grid + bid-state together), gated by
  `raptorOwns`/`canEditCell`/`canEditRow`/`isMedical`+role. Admin writers: `setBidState`,
  `shiftBid`, roster/config/ledger writers — all through the funnel.
- **Own snapshot undo** (`HIST`, cap 60) embedded in `persist()` via `recordHistory()`
  (`store.ts:1048`); baselined **per-war** by `lwHistInit()` on boot + `selectWar`. Snapshots
  the durable field set **minus** `current/focus/role/viewer` (navigation) and
  `people/qualCatalog/personEdits` (projection).
- **Causal vs projection is already encoded:** the four `sync.ts` reconcilers
  (`runOutbound/runInbound/runOilPass/reprojectRoster`) are diff-and-copy, run under
  `locked(...)` so they never become undo steps, and synced cells are tagged
  `{source:'raptor'}` (`raptorOwns` reads it). View-only writes (`setRole/setViewer/focusDay/
  setPeople`) notify **without** persist — deliberately no undo step, no storage write.
- Storage seam: its **own** `state/storage.ts` (`read/write(key,string)`, `leavewar:` prefix,
  session-only via `memoryBackend`, routed to the whiteboard `leavewar` collection by
  `adapters.ts`). One `leavewar/wars` blob holds ALL wars — the biggest clobber surface.

### 2.4 Tracker (NO funnel, async self-persist, undo exists but scoped, product save-split)
- **No funnel.** Each writer mutates its slice and calls its own `save*` → `sSet(k,v)`
  (`core.js:148`, async `storage.set`, falls back to in-memory `mem` on failure) → `notify()`.
- **Auto-persist vs Save-changes is a PRODUCT decision:** marks/dates/pace/roster/courses/
  layout **save themselves on edit**; event/prerequisite/line/font **structure** edits stay
  dirty (`sylDirty`, `core.js:3796`) until an explicit **✓ Save changes** →
  `persistSyl()` (`core.js:3803`). Must be preserved.
- **Undo EXISTS** (not none): a combined chart+mark stack (cap 60, `core.js:2179`), scoped
  per course/student/syllabus, **wiped on syllabus switch/save** (`clearDirty`), independent
  of its saves. Keystrokes coalesce within 2s.
- Storage door: **async** `get/set/delete/list` returning `{key,value}` (`storage.js:37`),
  `ocu:` prefix, fine-grained `v3:<course>:<sylId>:…` keys. Only door with delete+list.
- Bridges (no-import): `role.js` (file lock), `people.js` + `peoplewire.ts` (PEOPLE projection
  + `whoami` for the `by/at` stamp).

### 2.5 Storage door (the stream + write-behind already exist)
- Chain (boot-wired `main.tsx:26`): **module doors → Whiteboard (sync KV + change stream) →
  Postman (write-behind) → Backend (Memory | Browser)**.
- `Whiteboard` (`whiteboard.ts:12`): `get/has/keys/set/delete/subscribe/snapshot`; `set`
  returns true only on real change (idle-write suppression); `delete` emits `value:null`;
  **`subscribe(fn)` is the per-record change stream.**
- `Postman` (`postman.ts`): `attach(wb)` subscribes to that stream and write-behinds
  (coalesce 300ms, backoff cap 30s, **never rolls the whiteboard back**). `SaveStatus` is
  **queue-depth only** — "saved" ≠ confirmed durable (the `[TRK-DISK]` gap).
- `Backend` (`backend.ts:11`): `loadAll()` + `put(collection,id,json)` + `remove(...)`, opaque
  JSON strings, **7 fixed collections, no `get`, no `list`, no version, no subscribe.** Four
  mega-blobs (`inputs/all`, `people/all`, `plan/all`, `leavewar/wars`) each cover thousands
  of logical rows.
- **Four module doors, three shapes, one sink:** `storeBackend.getItem/setItem` (settings),
  `persist.ts` direct `wb.set` (scheduler live state), LW `read/write`, Tracker async
  `get/set/delete/list` — all land on the whiteboard via `adapters.ts`.
- Durability: trust-in-memory, no ack, no cross-tab safety, last-writer-wins. The one
  component that proves a durable commit is the **docstore** (`docstore.ts:58`, resolves on
  `tx.oncomplete`) — the model to copy. Medical blobs live in a separate append-only
  IndexedDB drawer, off the text seam — stays separate.
- **Schema reset:** `SCHEMA_VERSION` (`reset.ts:18`), stamp at `settings/schema`,
  `resetPreSchema` runs pre-fill on the real backend, awaits durable deletes, verifies,
  stamps last, else boot rejects → Retry panel. This is the "reset, not migrate" gate to reuse.
- **Target door (already specified, aligns with Step 5):** `data-model.md:875` —
  `put(collection,id,json,version)` → returns version; **version mismatch rejected (412), the
  seam re-reads, replaces on the whiteboard, tells the app, and clears that record's undo
  stack**; `subscribe`/`since(changeSeq)` change feed (§6/§8); `FanOutBackend` (`:773`) splits
  the mega-blobs into rows beneath the same postman.

---

## 3. The command model

### 3.1 A command, the change record, and the envelope

A **command** is a named, authorized intent that applies atomically and produces
**record-level changes** emitted onto the (existing) stream.

```ts
interface Command {
  type: string            // 'sched.slot.set' | 'sched.row.delete' | 'people.qual.set'
                          //   | 'lw.bid.set' | 'trk.mark.set' | 'trk.struct.save' | 'settings.rule.set' …
  scope: Scope            // §3.7 — bounds undo (module + sub-scope)
  changes: Change[]       // record-level effects, all-or-nothing
  meta?: Record<string, any>  // reducer payload (di, key, …)
  staged?: boolean        // §3.8 — held until an explicit flush command (Tracker structure edits)
}

interface Change {        // one record-level effect = the stream's unit; maps 1:1 to whiteboard set/delete
  op: 'put' | 'delete'    // create/edit/reorder all reduce to put; delete → delete
  collection: string      // logical collection ('days','inputs','people','rules','lw.bids','trk.marks' …)
  id: string              // the record's STABLE id (Step 1) — never a positional/text key
  before?: unknown        // prior value (Step 3 inverse-patch)
  after?: unknown         // new value (absent for delete)
}

interface CommitEnvelope {
  seq: number             // monotonic per-session commit number
  at: string              // FROZEN ISO timestamp (never 'now' — cf. mod:'now' fix)
  actor: string           // HOOKS.whoami() generalized
  origin: Origin          // §3.3
  scope: Scope            // §3.7
  command: Command
  boundary?: PublishRef   // §3.4 — set when the command creates/crosses a signed publish
}
```

Choices to defend:
- **`Change` is record-level put/delete by stable id**, matching the whiteboard `Change`
  and the Dataverse door — so persistence is "map each logical Change to `wb.set/delete`",
  which the postman already streams to the backend. Field-level patches were rejected (don't
  map to the row door; complicate atomic multi-record).
- **create/edit/delete/reorder are distinct `type`s but all reduce to put/delete Changes** —
  a reorder is N puts with new order fields, never a bespoke op.
- **The command wraps, does not replace, today's in-place mutators or the render path.** The
  reducer calls the existing writer, then derives `Change[]` (see §9 Q1). This is what holds
  parity 728/0.

### 3.2 The API

```ts
function commit(cmd: Command, ctx?: { actor?: string; origin?: Origin }): CommitResult
// CommitResult = { ok:true, envelope } | { ok:false, reason:'unauthorized'|'conflict'|'invalid', detail }
function onCommit(fn: (env: CommitEnvelope) => void): () => void   // the logical stream
```

`commit` is the ONE gate: (1) authorize `type`+`actor` (§3.5); (2) conflict-check the
versions the command depends on (§3.6); (3) apply all `changes` atomically to the in-memory
model *and* the persistence batch (§3.6); (4) append the envelope; (5) fan out notify. Any
failure applies nothing. Persistence, the LW↔inputs sync (Step 4), Step 3 undo, and the DB
adapter (Step 5) are all `onCommit` subscribers — built once, not four times.

### 3.3 Origin taxonomy (SEQ-004) — formalizes what LW already does with `locked()`

`type Origin = 'user' | 'remote' | 'projection' | 'restore' | 'seed'`

| origin | meaning | persisted? | undo entry? | re-auth? | today's ad-hoc equivalent |
|---|---|---|---|---|---|
| `user` | causal edit the actor initiated | yes | **yes** | yes | a normal funnel write |
| `remote` | change from another client / the DB (future) | already durable | no | no (authed at source) | — (new) |
| `projection` | deterministic recompute of derived state (LW sync diff-copy, OIL pass, validate marks, roster reprojection) | only if target persisted; recomputable | **no** | no | LW `locked()` + `source:'raptor'` |
| `restore` | applying undo/redo inverse-patch, or `loadWeek` restore | yes | **no** (it IS the undo) | original command already authed | LW `historyApply` under `locked`; `histApply` |
| `seed` | boot/demo seeding, migration | boot-only, no churn | no | no | `autoAccept*`, `histInit` |

Answers SEQ-004 (causal reverses together; projections recompute, never separate undo
entries) and fixes RC1 ("an LW undo silently creates a scheduler undo step"): a `projection`
write is not an undo entry, so undoing a bid can't rewind a scheduler edit. The design's job
is to make `origin` a first-class field so the loop-breakers LW hand-codes today
(`row.lw` tag, `raptorOwns`, FO/HO-vs-leave vocabulary partition) are expressed once.

### 3.4 Publish-boundary contract (SEQ-002)

Issued amendments / sign-offs are irreversible history. A command creating/crossing a signed
publish carries `boundary:{kind:'publish', versionId:'iso#1', …}`. Step 3's undo, replaying
backwards, **stops at a boundary**; recovery stays "load old version → republish as next AL"
(a forward command reusing the immutable `iso#N` identity). Restored signature bindings are
revalidated on replay. Step 2 only *records* the boundary and freezes issued records as
immutable at the gate; Step 3 consumes it.

### 3.5 Authorization at the one gate (ARCH-01)

Every command type declares its permission (`lw.bid.decide`=admin; `lw.bid.set`=own-row-or-
admin; `sched.*`=`canEditSched`; `settings.rule.set`=admin; `trk.file.*`=admin, everything
else on Tracker = anyone). `commit` checks it against `actor` **before** applying — including
undo/redo/import/restore, which are themselves commands. Closes RC1's "member can undo an
admin's decision". History resets at real login/logout.

### 3.6 Atomicity + conflict + storage test-double (SEQ-003)

- **Atomic multi-record commit.** A command's `changes[]` all apply or none — in memory and
  in the persistence batch. Worked case: approving leave writes a bid change *and* an Absence
  record; if the Absence write fails the bid change must not persist. Implemented by applying
  to a **staging buffer** swapped in only if every change succeeds; the whiteboard receives
  the batch as one unit (add a `wb.batch(changes)` that suppresses per-change stream emits
  until all land, then emits once — preserving the idle-write guard).
- **Conflict detection.** Each logical record carries a `version`/rev; a command pins the
  versions it read; `commit` refuses (`reason:'conflict'`) if a dependent record advanced.
  Worked case (A:X→Y, B:→Z, then A-undo): A's inverse-patch command is pinned to the version
  A last saw; B advanced it, so A-undo is refused/rebased, never clobbers B. (Undo is Step 3;
  Step 2 supplies the version check. Aligns with the door's designed 412-reject +
  clear-that-record's-undo, `data-model.md:875`.)
- **Storage test-double `MemoryDoor`** implementing the record door (§5.5) with injectable
  faults (reject a put, drop an ack, reorder commits, a second tab advancing a version) — the
  substrate for the persistence-fault property tests (whose full form is Step 5).

### 3.7 Undo-scope (new — forced by the maps)

Undo is **already bounded per module**: Leave War per-war (`lwHistInit` on `selectWar`),
Tracker per course+syllabus (stacks wiped on switch), Scheduler per-week (`histInit` on
`loadWeek`). A single global undo timeline (Step 3) must not let one module undo across
another's boundary. So every envelope carries:

```ts
type Scope = { module: 'sched'|'lw'|'trk'|'people'|'settings'; key?: string }
// key: weekId (sched) | warId (lw) | `${courseId}:${sylId}` (trk); people/settings are app-global
```

Step 3 filters the replay by `{actor, session}` **and** honours scope so undo stays bounded
exactly as each module needs. Step 2 only records it.

### 3.8 Staged commands (new — preserves Tracker's product save-split)

Tracker's structure edits (`sylDirty`) must NOT auto-persist; they wait for **✓ Save
changes**. Modelled as `staged:true` commands: they apply to the in-memory model and the
undo log immediately (so the editor and undo work), but their `Change[]` are **held** and
flushed only by an explicit `trk.struct.save` command (which emits them as one batch). A
`trk.struct.discard` drops them. Auto-save edits (marks/dates/…) commit normally. This keeps
the auto-save-vs-Save-changes distinction the owner set, expressed in the command model
rather than in bespoke `sylDirty` plumbing.

---

## 4. How the stream is consumed (built once, four readers)

1. **Persistence** — an `onCommit` subscriber maps each logical `Change` to `wb.set/delete`
   (batched, §3.6). The whiteboard→postman→backend chain already write-behinds this. Whole-
   world `persistAll` stays for **not-yet-adopted** collections and shrinks per phase.
   Durable-ack + conflict handling arrive fully at Step 5 (the versioned door); Step 2 keeps
   today's write-behind but routes through the new batch so the ack model can drop in later.
2. **Undo (Step 3)** — inverse-patch log from `user`-origin envelopes; replay backwards,
   honouring `boundary` and `scope`; scoped to actor+session. Retires the three snapshot
   stacks.
3. **Sync (Step 4)** — the LW↔inputs reconciliation becomes an `onCommit` handler reacting to
   Absence/bid changes *by id*, instead of the four periodic diff-and-copy passes.
4. **DB adapter (Step 5)** — the same record door, backed by Dataverse; `remote` commits flow
   in through the same stream.

---

## 5. Adoption per module (incremental — strangler wrapper)

**Principle:** wrap, don't rewrite. Each module keeps its in-place mutators + render path; we
add `commit()` as the *entry* that calls them and derives `Change[]`. Parity gate (tfin 728/0
+ golden snapshots) after each module before the next.

### 5.1 Scheduler (first adopter)
- `commit()`'s scheduler reducers call today's `setSlotVal/txtSet/markDeletion/…`, then derive
  `Change[]` from the rid-anchored `SCHED.pending` deltas + before/after record snapshots by
  rid. `afterSchedMutate`'s tail (`markEdit`→`HOOKS.histPush`) becomes "emit envelope"; the
  persistence subscriber replaces what `wirePersist` monkey-patched.
- Marks (`SCHED.pending`) stay the amendment signal (output unchanged); the envelope is the
  *new, additional* record truth.
- `origin`: board/drag/palette = `user`; `validate()`-driven mark reconciliation =
  `projection`; `loadWeek`/undo = `restore`; seed/autoAccept = `seed`. `scope={module:'sched',
  key:weekId}`. `boundary` set on approve/AL/publish commands.

### 5.2 PEOPLE + VCONF join
- `people.qual.set/add/remove/rename` become commands (origin `user`, scope
  `{module:'people'}`), persisted through the people collection subscriber (`persistPeople`
  becomes that subscriber). **Open (Q2):** are roster edits undoable now? Proposal: yes as
  `user` commands (global undo covers them) but NOT amendments (no `SCHED.pending`).
- `settings.rule.set` becomes a command (origin `user`, auth admin, scope
  `{module:'settings'}`); `rulesSave` becomes the rules subscriber. VCONF stays global.

### 5.3 Leave War (lowest-friction — already funnelled + already tags projection)
- Wrap the causal writers (`setCell/setBidState/setBidStates/shiftBid/moveCells/roster+config/
  ledger`) as commands; their existing single `persist()` becomes "emit envelope + let the
  persistence subscriber write". The **four sync reconcilers become `origin:'projection'`
  commands** — replacing the hand-rolled `locked()` suppression with the taxonomy (the
  `locked` re-entrancy guard stays as a mechanical safety, but "not an undo step" now derives
  from `origin`, not from the wrapper). `setRole/setViewer/focusDay/setPeople` stay
  notify-without-persist (no command — they are view state, not records).
- `scope={module:'lw', key:warId}` preserves per-war undo bounding. LW's own snapshot undo
  retires when Step 3 lands; until then it runs in parallel (its snapshots are harmless).
- Storage: LW keeps its `leavewar` whiteboard collection for now; **Open (Q3)** whether to
  split `leavewar/wars` into per-war records here or at Step 5's FanOut.

### 5.4 Tracker (highest-friction — no funnel, async, product save-split, own undo)
- Impose the single funnel: each `save*` writer becomes a command whose reducer does today's
  slice mutation, deriving one `Change` for the touched `v3:…` record. Auto-save writers
  commit immediately; **structure edits become `staged:true`** flushed by `trk.struct.save`
  (§3.8) — preserving the product split.
- Its async `sSet` becomes the Tracker collection's persistence subscriber (the door already
  abstracts async — §5.5). Tracker's own chart+mark undo retires at Step 3; until then it runs
  in parallel. `scope={module:'trk', key:`${courseId}:${sylId}`}`.
- `actor` via the existing `whoami()` bridge (the `by/at` stamp) — now the command's `actor`.
- Import/Export stay admin-gated commands (`trk.file.import` a large multi-change batch;
  Export reads only).

### 5.5 The record-oriented door (contract + test-double now; real backend at Step 5)
- Formalize the door the whiteboard already half-is:
  `get(collection,id) / put(collection,id,json,{version}) / delete(collection,id,{version}) /
  subscribe(fn)` — i.e. today's `Whiteboard` API + a `version` parameter that `put/delete`
  honour and return (aligned with `data-model.md:875`).
- Ship `MemoryDoor` (the fault-injectable test-double, §3.6) now; keep the real
  whiteboard→postman→Browser/Memory chain as the production door unchanged. The **mega-blob
  split** (`FanOutBackend`) and the real Dataverse `version`/412 handling are Step 5 — Step 2
  only needs the door *shape* so persistence subscribers and the conflict check compile
  against it.
- Reset stays the `SCHEMA_VERSION` gate; bump it once if any adopted collection's on-disk
  shape changes (it should not — we persist the same JSON, just routed through commands).

---

## 6. Parity & proof
- `tfin.js` 728/0 after every phase (issued content byte-frozen; the layer adds no output).
- Golden-snapshot week/board/LW grid/Tracker before & after each module's adoption — identical.
- Existing per-module suites stay green; command tests are additive.

## 7. Testing harness (first increment now)
- A **small deterministic invariant harness** seeded now, grown one increment per later step.
  **Classify invariants first (SEQ-001):**
  - **hard** (enforce unconditionally): every cross-ref resolves to a live id (no orphan);
    authorization on every command; atomic all-or-nothing.
  - **advisory** (test detection/severity/exemptions, never hard-refuse): scheduling rules —
    double-booking is *intentionally warn-not-block* (`engine/avail.ts:519`), crew rest, etc.
    Assert the WARNING and cross-consumer agreement, not a refusal.
  - **frozen** (immutability + signature-binding): issued snapshots never mutate; a boundary
    is never crossed by undo.
- **Stateful property tests at the command layer**: generate valid AND deliberately-conflicting
  command sequences; assert (a) atomicity, (b) conflict refusal, (c) undo/redo round-trips a
  `user` sequence to byte-identical state (Step 3 consumes), (d) projections recompute
  deterministically and never add undo entries. Persistence-fault tests (interrupted/partial/
  lost-ack saves) come at Step 5 against `MemoryDoor`.

## 8. Rollout order (within Step 2)
1. Core: `commit`/`Change`/envelope/`onCommit` + `wb.batch` + `MemoryDoor` + auth table +
   origin/scope/boundary + harness scaffold. No module wired yet.
2. Scheduler adoption behind the existing funnel; parity gate.
3. PEOPLE + VCONF join; parity gate.
4. Leave War adoption (sync passes → `projection` commands); parity gate.
5. Tracker adoption (staged structure edits); parity gate.
6. Persistence subscriber replaces whole-world `persistAll` for adopted collections.
Each item independently shippable and reversible; nothing merges without "merge live".

## 9. Open questions for the red team
1. **Derive `Change[]` from marks, or from before/after record snapshots?** Scheduler already
   raises rid-anchored marks; is mark-derivation robust for reorder + delete tombstones, or
   should reducers snapshot affected records and diff by id (uniform across modules, costs a
   copy)? Leaning: snapshot-diff by id for uniformity; marks stay as the amendment signal.
2. **Roster/settings undoability** (§5.2) — in the global undo timeline, or excluded as today?
   Owner-facing behaviour call.
3. **Split the LW `wars` mega-blob (and the scheduler/people/inputs blobs) at Step 2 or
   Step 5?** Per-record `version` is meaningless while the write unit is a whole collection;
   but the `FanOutBackend` is scoped to Step 5. Do we need a *minimal* split now for the
   conflict check to be real, or is collection-granular versioning enough for Step 2?
4. **Version/rev placement** — per-record field vs per-collection vector; what Dataverse gives
   cheaply (`versionnumber`/`If-Match`, `handover-dataverse.md`).
5. **`projection` re-entrancy** — `validate()` runs inside `afterSchedMutate`; if a projection
   write triggers `validate`, guard against a commit storm. Proposal: projections write the
   model directly + emit ONE envelope, never recursively re-enter `commit`.
6. **Atomicity across two backends** — a command touching a whiteboard collection *and* the
   IndexedDB docstore: forbid cross-backend commands until Step 5, or a real two-phase now?
7. **Parallel-undo interim** — while LW's and Tracker's own snapshot undos run alongside the
   new command stream (before Step 3 retires them), can the two disagree in a way a user sees,
   or is the command stream purely additive until Step 3? Need to prove additive.
8. **Staged commands + undo interaction** (§3.8) — a staged structure edit is in the undo log
   but its `Change[]` aren't persisted; if the user undoes past the stage boundary then
   Saves, what flushes? Define the staged/undo ordering precisely.
```
