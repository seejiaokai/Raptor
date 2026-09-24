# The command layer & undo contract — the one front door for change

**What this is.** The single, durable explanation of how RAPTOR records change, and the
contract any new module or any new undo feature must satisfy to plug in. It exists so future
undo work — per-person undo, whole-import undo, one global undo, the eventual shared database —
extends the ONE shared structure instead of inventing a fourth store-pattern (the mistake
`docs/architecture-direction.md` §Standing rule exists to prevent).

Read this before touching undo, persistence, sync, or before adding a new tab/module that writes
data. It is the map; the full designs behind it are:

- `docs/superpowers/specs/2026-09-16-arch-stack-2-command-layer-design.md` — step 2, the command
  layer itself (built + live, PR #409/#410). **Its Rev 5.1 sweep is the rule: a doc agreeing with
  a doc is evidence of nothing — only the code counts.** The code is `src/command/`.
- `docs/superpowers/specs/2026-09-17-arch-stack-cmdl-finish-design.md` — step-2 completion for
  Leave War + Tracker: the per-store `write()` seam, one-gesture-one-envelope, the causal
  both-side envelope, off-week capture. (Built; this is what added `write()`.)
- `docs/superpowers/specs/2026-09-17-arch-stack-3-global-undo-design.md` — step 3, the one global
  undo that will CONSUME everything below. Designed, not yet built; gated behind CMDL-FINISH. *(Stale:
  BUILT and merged live 18 Sep 26 — `OUTSTANDING.md` `[GLOBAL-UNDO]`; marked 24 Sep 26.)*

The command core is `src/command/`: `commit.ts` (the engine), `types.ts` (the contracts),
`latch.ts` (suppression contexts), `registry.ts` (the logical-record map), plus `actor.ts`,
`permissions.ts`, `harness.ts`, `door.ts`. The public surface is `src/command/index.ts`.

---

## 0. The one idea

Every durable change in the app goes through ONE gate, `commit()`, which (a) calls today's
in-place writers, then (b) emits a **record-level envelope** onto a stream that says WHAT changed,
by WHOM, from WHERE, all-or-nothing. Undo, persistence, sync and the database are all built ONCE
as consumers of that stream, not four times per module.

This is **additive** as of step 2: `persistAll` / `HOOKS.histPush` / the three legacy snapshot
undo stacks (scheduler `HIST`, Leave War per-war snapshot, Tracker mark history) all still run
exactly as before. The stream is recorded alongside them. Later steps cut over: **step 3** builds
one global undo from the stream and retires the snapshot stacks; **step 5** builds record-level
persistence + the Dataverse adapter from it. Nothing in step 2 changes a rendered byte
(`tfin.js` 728/0) or how persistence/undo currently behave.

---

## 1. The change stream

### 1.1 Envelopes

Each `commit()` that changes something emits one `CommitEnvelope` (`src/command/types.ts`):

```ts
interface CommitEnvelope {
  seq: number            // monotonic order on the stream (identity)
  at: string             // ISO timestamp
  actor: Actor           // WHO — account id + effective role + ownership personId (§4)
  origin: Origin         // WHERE FROM — user | remote | projection | restore | seed
  scope: Scope           // WHICH module + which record-family (drives snap-to-context)
  type: string           // the command type (authorization lookup)
  changes: Change[]      // the per-record diffs this commit produced
  boundary?: Boundary    // the publish boundary flag (§5)
  causedBy?: number      // the seq of the user action this is a downstream effect of
  revs?: Record<string,number>  // per-record revisions AFTER this commit (§1.4)
  emit?: boolean         // remote changes apply silently (fold subscriber doesn't echo)
}
```

Subscribe with `onCommit(fn)`; read the log with `commandStream`.

### 1.2 Changes are DERIVED, never authored

```ts
interface Change { op:'put'|'delete'; collection: LogicalCollection; id: string
                   staged?: boolean; before?: unknown; after?: unknown }
```

A `Change` is computed by the layer — a per-record deep-equal of every enlisted record before vs
after the reducer ran. **You never build a `Change` as input to a command**; you mutate live state
inside the reducer and the layer derives the diff. Rows are **nested in the day record**: a slot
edit yields ONE `days/<wk>#<di>` Change (the day owns the inverse), never a day + a row Change.

`before`/`after` are the whole record's value. This is the key property undo relies on: the
envelope already CONTAINS the exact before-image of everything the command touched, so reversing it
is pure recorded data — never a re-derivation, never asking a reconciler to guess (that guessing is
the root of the whole delete/undo bug family — step-3 design §2).

The set of logical records is the `LogicalCollection` union in `types.ts`, mapped to physical
storage blobs by `LOGICAL_TO_BLOB` in `registry.ts`. The registry is **derived from code** (every
`sSet`/`persist()`/`store.set` key builder classified as record / boot-migration / view-preference),
and completeness is proven by reconstructing persisted state from the stream and comparing it to the
legacy serializer — not by "≥1 Change", which would miss an omitted field.

### 1.3 Origins and causal closures — one user action = one closure

```ts
type Origin = 'user' | 'remote' | 'projection' | 'restore' | 'seed'
```

- **`user`** — a person's forward action. **Only `user` envelopes become undo entries.**
- **`projection`** — a downstream, derived effect of a user action (a sync reconciler pass, a
  recompute). Emits on the stream, is NOT its own undo entry.
- **`restore`** — an undo/redo applying recorded inverse data. Emits, is not undoable itself.
- **`seed`** — boot/demo data. Emits locally, no undo entry.
- **`remote`** — a change arriving from the shared DB (step 5). Applies silently, `emit:false`.

A single user action often ripples: approving leave writes the war cell (a `user` command) and the
reconciler mirrors it to a Raptor input. The contract is that **the full ripple is ONE causal
closure** — the `user` envelope plus `causedBy`-chained `projection` children — both sync
directions, no stray second `user` envelope, no spurious undo step. Two mechanisms carry this:

- **Join in-reducer.** A `commit`/`commitAs` (or `commitProjection`) raised from *inside* the
  running reducer JOINS the open transaction via `txn.child(cmd)`: shared snapshot set, shared
  rollback, ONE envelope, its changes appended. (Example since [ARCH-STACK] step 4: a war
  approval's Inputs write, and an Inputs-page filing's bid replacement on the war.)
- **Enqueue-with-causedBy from a subscriber.** A `commit` raised from a notify/subscriber during
  phase-8 delivery is enqueued (not nested) and drained after, carrying `causedBy` = the user
  action's `seq`. `causalSeq` is live across phases 8 AND 9 and is saved/restored around each
  pipeline; a queued projection inherits its captured `causedBy` until it finalizes its own.

The rule for authors: **causally-related mutations stay in ONE reducer.** Move async work (prompts,
confirms, `await`ed reads) OUTSIDE `commit`; the synchronous mutations they used to interleave run
together in one reducer / one envelope (this is what "one Tracker gesture = one envelope" and
`trkGesture` deliver — CMDL-FINISH §4).

### 1.4 Revisions

The layer keeps an **in-memory per-logical-record revision map** (even while several logical
records share one physical blob). Every authoritative write bumps the touched record's revision;
read one with `revisionOf(...)`. An envelope records `revs` — the per-record revisions *after* it
committed.

Undo (step 3) pins the causal result's `revs`, so a later, independent `projection` that writes a
*different* record (or a different cell of a coarse blob) does **not** block a later undo of the
user command. Conflict detection (step 3 §4) compares a record's current revision to what the
timeline expects; if a later edit advanced it, that record is conflicted and the undo is refused
whole. A command may also declare `expectedRevs` for optimistic-concurrency; it's checked at phase 5
and rejects as `conflict`. At step 2 this is single-tab and exercised only by the `MemoryDoor` test
double; real cross-client conflict arrives with the DB at step 5.

---

## 2. The transaction — how one commit runs

`commit(cmd)` opens a transaction and runs these phases (`commit.ts`; design §3.2). Legacy
side-effects — `notify` / `HOOKS.histPush` / module `persist()` / `recordHistory` / toast /
`logEdit` / `logAction` — are **latched** for the middle phases and released on success (discarded
on rollback), so a mid-reducer failure leaves NO partial persist/notify/history:

1. Derive actor + origin internally; authorize `cmd.type`. Reject → nothing applied.
2. **Snapshot by explicit enlistment.** Each wrapped writer calls `txn.enlist(store)` *before*
   mutating (in-place singleton mutation has no seam to auto-hook). The snapshot covers the full
   transitive write set including causal children. A debug/test guard compares whole-world
   signatures and fails the commit if a change appears in an un-enlisted store.
3. **Apply the reducer** — SYNCHRONOUS mutation only. A `commit`/`commitAs` raised here JOINS
   (`txn.child`); one raised from a subscriber later enqueues.
4. Derive `Change[]` by per-record deep-equal over every enlisted record.
5. Conflict + invariant checks (`expectedRevs`, structural integrity, `protectedTouched`).
   NB: put-once immutability of issued records (`sched.orig`/`sched.als`) is NOT hard-enforced here
   — deferred to step 3, because today's silent-undo-before-sent legitimately replaces them.
6. On any failure: restore the enlisted snapshots, discard the latched effects, emit nothing;
   return `conflict` / `invalid` / `unauthorized` / `refused`.
7. Emit the envelope; assign `seq`; advance the touched records' revisions.
8. **Release the latch** → today's `histPush` / `persistAll` / `notify` / toast run as they always
   did (additive).
9. **Drain the post-commit queue synchronously, inside the outermost `commit()`** — subscribers see
   envelopes strictly in order. Every latched/queued effect carries a **suppression-context token**
   (`HIST.lock` / the LW lock / `SYNCING`, captured at raise time and re-applied for the released
   call) so a lock-wrapped forward batch records exactly as today (`latch.ts`).

`CommitResult` is `{ok:true,seq,envelope}` | `{ok:false,reason,message?}` | `{queued:true,done}`.
A subscriber-raised commit returns the `queued` handle (its `done` is already resolved by the time
the outer `commit()` returns, because the drain is synchronous). `commitAs` is **not** exported —
only internal wiring (sync/seed/restore) uses it; the public forward-write entry point is `commit`
(aliased `cmdCommit`). A silent, non-error refusal uses `CmdRefused` and the `'refused'` reason
(e.g. a protected-week clear) so a rolled-back operation reports honestly without a bug-shaped
console error.

---

## 3. The per-store `write()` seam — what undo consumes

This is the load-bearing seam for every future undo feature. `EnlistableStore` (`types.ts`) is the
contract each store implements so the layer can snapshot it, diff it, and — the new part from
CMDL-FINISH — apply a batch of records to it:

```ts
interface EnlistableStore {
  key: string                                   // identity in the enlisted-set map
  capture(): unknown                            // deep snapshot for rollback (opaque)
  restore(snap: unknown): void                  // roll back to a capture()
  records(): Map<string, RecordEntry>           // current logical records, to derive Change[]
  signature?(): string                          // OPTIONAL cheap whole-store version (debug guard)
  write?(entries: RecordEntry[], opts?: { allowIssued?: boolean }): void   // OPTIONAL batch apply
}
```

### 3.1 The `write()` contract (CMDL-FINISH §3, F8/GU-007)

`write(entries)` is how an inverse record-set (an undo) is applied back into a store. Its contract,
which every store's implementation must honour and every caller must respect:

- **Batch and delete-aware.** `entries` is a list of `RecordEntry { collection, id, value?, op? }`;
  `op:'delete'` removes the record, `op:'put'` (the default) creates or overwrites it.
- **Apply-all-then-rebuild.** Apply ALL entries to live state FIRST, THEN do one derived-index
  rebuild (indexes, baselines). Never rebuild per-entry — a multi-store restore must never observe
  a half-applied world.
- **Persist / history / notify release at the TRANSACTION boundary (phase 8), via
  `cmdDeferEffect` — never inline in the reducer.** An inline `notify`/`rawPersist` inside the
  reducer would let a reconciler fire on a half-applied world (e.g. a sync pass reading a
  half-restored Inputs list). Defer them so an N-record write is one persist + one notify at the end.
- **Called only from a reducer that has already enlisted this store, and never opens its own
  command.** `write()` is an apply primitive, not a command.
- **Issued records are refused unless `opts.allowIssued`.** The append-only-intended issued records
  (`sched.orig`/`sched.als`) reject a normal `write()`; only the restore path may pass
  `allowIssued:true` (C7). A scheduler `write()` also refuses a foreign-week write for every
  week-scoped collection.

The consumer is the step-3 undo step. At CMDL-FINISH `write()` is built and unit-tested for all five
stores (scheduler, LW, Tracker, plus people/settings via their commit module) but has **no
production caller yet** — there is no stream-driven undo until step 3. That is deliberate and
self-healing: at this step no production path rejects a commit, so the durable-rollback gap is
latent.

### 3.2 `capture`/`restore` and `signature`

`capture()`/`restore()` are the rollback pair the transaction uses in phases 2 and 6; they must
snapshot **everything a command can mutate**, not just the record map. Tracker's `capture` is
`Object.assign({}, mem)` PLUS a snapshot of `undoStack`/`redoStack`/`active`/`sylDirty`, the course
pointer (`course`/`COURSES`) and the unsaved in-editor flow draft (`SYL`) — all state not derivable
from `mem`, so a rejected gesture restores the exact draft rather than rebuilding it from the
persisted def; Leave War's `capture` is the immutable `state` ref. `signature()`
is an optional cheap monotonic durable-version counter (bumped only in the real persist/restore
paths) so the whole-world debug guard compares a string instead of deep-cloning every store's
`records()` on every commit — which keeps the perf ceilings. Register a store as guarded with
`registerGuardedStore`; register its ambient suppression state (its lock) with
`registerEffectContext` so latched effects replay correctly.

---

## 4. Who and where — actor, origin, boundary

**Actor** (`actor.ts`, `types.ts`) = `{ id; role:'admin'|'member'|'system'; personId?; session }`
— account id + effective role from `SESSION` (`SESSION.role` `main`→`member`), **ownership
`personId` from the `ME`/viewer binding, not `SESSION`** (defense-in-depth parity; real identity
arrives with step-5 sign-in). The system/headless actor has `personId` undefined and is used only
for `seed`/`projection`/`loadWeek` — never for a user restore. Snapshot the actor at command
creation.

**Authorization** is at the gate (`permissions.ts`): `definePermission` per type, `authorize`
checks it; the system actor short-circuits. At step 2 forward writes are permissive (`anyone`) — the
real edit gate (`canEditSched`) is untouched and still authoritative; the mechanism is in place, not
yet tightened. Undo/redo are ungated at step 2; **reversal authorization is step 3**: for every
change in an inverse, `permission(originating type)` is evaluated against the CURRENT actor +
ownership, so admin-decides → view-as-member → undo-own-admin-decision is REFUSED. A joined child's
permission is the PARENT command's declared permission — never caller-selected.

**Publish boundary — the UNPUBLISH model** (`Boundary`; step-3 design §6, owner 18 Sep 26 —
SUPERSEDES the earlier "recovery re-publishes under a NEW id" wording). **Undo of a published day =
UNPUBLISH it** back to an editable working copy (a first-class `sched.unpublish` command + a day-
header button, not just an undo). **The choice is by ACTION, not at republish** (round-4 R4-03):
**unpublish = correct quietly** — edit silently and republish as the **SAME version label**
(Original→Original, AL1→AL1), not shown as an amendment; **a real amendment = do NOT unpublish** —
edit the live working copy and publish the next AL. The single checkable fact — **has the shared
database registered/disseminated this version?** — chooses SILENT vs LOGGED:
not disseminated → fully silent, label freely reusable; disseminated → the quiet correction is still
allowed (owner, 18 Sep) but writes a **line in the history** (traceability). **The old "never reuse
an issued version id" rule is SET ASIDE** — the version LABEL is reused, but **every issuance is kept
as its own immutable snapshot** and the correction is logged, so the "never ERASE" half stands and
nothing is lost. At steps 2/3 there is no shared DB, so nothing is ever disseminated and only the
silent path runs live; the logged path is unit-modelled via `MemoryDoor`. An export/print/CSV is
**not** a boundary event (owner, 17 Sep 26 — `src/state/disclosure.ts`). See memory
`undo-of-publish-semantics`.

---

**Whose changes Undo reverses (owner, D148, 24 Sep 26 — "5 agree").** Undo only ever reverses the signed-in
person's OWN changes, and their list clears when they sign out. It never greys out because someone else changed
something since, and never undoes another person's change: in the database era, an admin can still undo his own
change after a second admin has made one. If someone else has since changed the very same thing, Undo refuses and
says who — it never overwrites their newer work. Settles `[GU-MAYREV]` in `[GLOBAL-UNDO]`; extends the 13 Sep 26
direction (undo per login session, never affecting another user).

## 5. The checklist — plugging a NEW module or a NEW undo feature in

Any new app/tab/module, and any new undo capability, MUST satisfy this. Raise it in the design step,
not after (owner standing rule; `docs/architecture-direction.md`; memory `new-modules-follow-the-command-layer`).

**A new module that writes data:**

1. **Route every durable write through the command layer.** `commit()` / `cmdCommit` is the one
   forward-write door. No write ends outside a command + `HOOKS.histPush` — anything else is lost on
   reload (CLAUDE.md §Architecture rules, "The persistence funnel").
2. **Stable ids on everything (rids).** Records are keyed by opaque stable ids, never by a human
   string or an array position. Renaming/reordering must move nothing.
3. **No bespoke undo stack.** Do not add a fourth snapshot-undo + own store + own storage seam.
   Emit `user` envelopes; global undo (step 3) drives your undo from the stream.
4. **Implement `EnlistableStore` fully:** `key`, `capture`/`restore` (snapshot *all* mutable state,
   not just records), `records()`, `write()` (§3.1 contract), and `signature()`. Register it
   (`registerGuardedStore`) and register its suppression context (`registerEffectContext`).
5. **Add your logical records to the registry** (`types.ts` `LogicalCollection` + `registry.ts`
   `LOGICAL_TO_BLOB`), classified record / boot-migration / view-preference.
6. **One gesture = one causal closure.** Async out of the reducer; causally-related synchronous
   mutations in ONE reducer; downstream effects join (`txn.child`) or emit as `projection` with
   `causedBy`. Never a stray second `user` envelope for one action.
7. **Defer persist/notify to the boundary** via `cmdDeferEffect`; apply-all-then-rebuild inside
   `write()`; refuse issued/append-only records unless `allowIssued`.

**A new undo feature (per-person, whole-import, global, …):** it is a CONSUMER of the stream, built
on the same seam — never a new stack.

- **The inverse is recorded data, not a re-derivation.** Derive it from the envelope's per-record
  `before`/`after` (reverse order; a `put` with no `before` inverts to `delete`, a `delete` to a
  `put` of its `before`). Apply it as ONE `restore`-origin commit whose reducer enlists exactly
  those records and calls each store's `write()`. Never re-run a reconciler as a guessing pass.
- **A `restore` commit LETS the sync reconcilers run and proves they converge** (step-3 design §3.4,
  Rev 3+): the inverse carries both sides' before-images, so a reconciler pass over the fully-restored
  world derives nothing. Do NOT add a reconciler-suppression token (it would hide a non-fixpoint and
  chain drift to a later wrong cause); the property tests assert zero restore-caused projections for
  isolated scenarios, production logs a diagnostic (never throws). Re-install `HIST.lock`/`lw.hist`
  only to stop a legacy step being pushed.
- **Authorize at reversal time** against the CURRENT actor + the FORWARD actor's role + per-record
  ownership (`mayReverse`, step-3 §5); redo carries the same gate.
- **Honour the publish boundary — the UNPUBLISH model** (step-3 §6): undo of a publish is an explicit
  unpublish back to a working copy; a quiet correction republishes as the SAME version LABEL, keeping
  each issuance as an immutable snapshot (never ERASE) and, once disseminated, writing a history line
  (the reuse-the-id half of the old rule is deliberately set aside — see memory
  `undo-of-publish-semantics`).
- **Conflict = refuse-whole** at first (step 3): if any target record's revision advanced past what
  the timeline expects, roll back the whole inverse and report plainly.
- **Scope drives snap-to-context**: `scope` on every entry lets an off-screen undo navigate to where
  the change was before repainting. *(This is the owner's 13 Sep 26 "snap-to-page" undo — backlog item
  `[XWEEK-UNDO]`, built in global undo phase 2 and archived 24 Sep 26; the one gap left, an input-only undo that
  does not jump to its week, is `[GLOBAL-UNDO]` GU-E5.)*

If a proposed feature can't be expressed as "emit/consume envelopes over this seam", that's the
signal to stop and revisit the design — not to add a parallel mechanism.

## 6. Worked example — the one absence record ([ARCH-STACK] step 4, 20 Sep 26)

Approved leave is the Raptor Input; the Leave War keeps only requests, OIL credits and notices. So
every absence gesture is ONE `user` envelope carrying real records on BOTH stores, and undo is plain
replay — no reconciler re-derives anything:

- Approve on the war: the requests' `lw.cell` lists + the Input put (`lw` = war id).
- Un-approve / remove / move approved leave: the Input put/delete (a split mints a second Input) +
  the request re-created where it applies.
- File on the Inputs page over a bid: the Input put + the bid's `lw.cell` list (the clashing half
  gone, a notice added when someone else filed it); sick over leave: the medical put + the leave
  trimmed, in the same envelope.
- Publish a weekend/PH day: the book records + the replaced bids' `lw.cell` lists.

**Every door re-checks the rules, including redo.** `schedWriteRecords` (the restore body) calls the
absence gate's `vetRestore` after replaying Inputs: a restore that would put two leaves on the same
time, or leave over a medical, is refused whole with the blocker named (clash check B7). The war
re-reads the Inputs after a restore through its ordinary Raptor-notify subscription.
