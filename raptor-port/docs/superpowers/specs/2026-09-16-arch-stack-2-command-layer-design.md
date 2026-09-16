# [ARCH-STACK] Step 2 — the one write/command layer — DESIGN (Rev 3, 16 Sep 26)

**Status:** Rev 3 — after two cross-provider red-team rounds (Codex GPT-6 Astra + Fable 5.1,
both rounds converged). Round 2 confirmed Rev 2 resolved most of round 1; Rev 3 folds the
round-2 residual (one coherent transaction/undo/version cluster + precise record granularity +
boundary precision + async Tracker + fact fixes). Back to both reviewers for round 3. Not built.
**Depends on:** Step 1 (stable ids everywhere) — DONE + live (courses, syllabuses, students,
inputs, people, rows all carry stable ids).
**Feeds:** Step 3 [GLOBAL-UNDO], Step 4 (one Absence record), Step 5 [DB-STEP].
**Plan of record:** `2026-09-13-architecture-rootcause-plan.md` (RC4; SEQ-001..004 binding).
**Review log:** `2026-09-16-arch-stack-2-command-layer-review-log.md`.

## Rev 3 change-list (round-2 dispositions)
- **One transaction model** (Codex R2-002/003/007 + Fable R2-1/R2-4): a command opens a
  transaction that (a) **latches** legacy notify/persist/history for its duration, (b) runs the
  reducer — **causal cross-module children join the SAME transaction synchronously** (shared
  snapshot, rollback, auth, envelope, single revision bump), (c) derives changes, checks, folds,
  (d) releases the latch and drains **only independent** reactions afterward, each carrying the
  spawning envelope's origin so `histPush`/`recordHistory` skip `projection`/`restore` by
  **origin, not the lock flag**. §3.2.
- **Every authoritative persisted write advances the store revision; undo pins the causal
  RESULT** (Codex R2-007). Pure derived recomputes use a separate derived token; because a causal
  projection is *inside* its user command (one revision), the user's later undo is not refused
  (the Rev-2 F3 problem is dissolved by in-transaction composition, not by skipping bumps). §3.3.
- **Change granularity = per-logical-record deep-equal, not "by rid"** (Fable R2-2 / Codex
  CMD-006): `days/<wk>:<date>` (whole day incl `secOrder`), `sched.book/<wk>` (the `schedFields`
  members), `sched.mutes/<wk>` (WARNOFF), `inputs/all`, `plan/all`, plus rows within a day. §3.1.
- **Publish boundary precise** (Codex R2-001 / Fable R2-3): freeze `als[n]` + its embedded sign
  copy + `orig[di]` (the Original); keep live `SCHED.sign[di]`/`signBind[di]` ordinary mutable
  records; reopen does not exist. The one owner-facing call: may you undo your *own,
  not-yet-witnessed* first-publish (SEQ-002 permits identity reuse)? §3.4.
- **Undo permission** = permission(originating type) for every inverse change vs the CURRENT
  effective actor + ownership; system actor never for user-triggered restore (Fable R2-5). §3.5.
- **Public API is `commit(cmd)` only**; internal `commitAs(cmd,{actor,origin})` for sync/seed/
  restore; role mapping `main→member` (Fable R2-6). §3.2/§3.5.
- **Async Tracker**: a reducer is synchronous mutation only; saves live in the subscriber;
  async prompts/reads happen outside `commit`; await-interleaved chains become command sequences
  (Codex R2-004 / Fable R2-7). §3.2/§5.4.
- **Staging by purpose** (Codex R2-006): only the interactive unsaved chart editor stages;
  Save/duplicate/add/import/revert/delete commit their definition changes immediately. §3.8.
- **Perf**: snapshot/diff only the blob(s) the command type can touch; reuse the phase-2 string
  as the interim `histPush` snapshot (serialize once) (Fable R2-9). §3.2/§5.1.
- **Reverted the Rev-2 over-correction**: Tracker courses/syllabuses ARE stable ids; rename is
  label-only; no re-keying command (Codex R2-005, verified in code). §5.4. Fact fixes to §2.4.

---

## 1. Purpose & scope

One **write layer** every change passes through, emitting a **record-level change stream** — a
worded list of WHAT changed, by WHOM, from WHERE, all-or-nothing. Today: three write funnels +
two unfunnelled writers; change detected by whole-world JSON diff (RC4). The stream already
exists at the storage layer (`Whiteboard.subscribe`, `whiteboard.ts:55`; `Postman` consumes it).
Step 2 adds the **logical command layer above** (actor / origin / atomicity / authorization /
publish-boundary / undo-scope) and routes the three modules + PEOPLE + VCONF through it. The
versioned row-level backend is Step 5; Step 2 persists by **folding** logical changes into
today's blobs and defines the door shape + a fault-injectable test-double.

**In scope:** `commit(cmd)` gate; the transaction model (latch + snapshot/rollback + in-txn
causal children + post-commit drain of independent reactions); derived `Change[]`/envelope; the
origin taxonomy with its revision-bump + undo-entry + silent-apply rules; an undo-scope key; the
publish-boundary contract; authorization with a defined headless actor; incremental routing
(strangler wrapper); first invariant-harness increment + command-layer property tests.

**Out of scope (own steps):** global undo itself (3); one-Absence model change (4); Dataverse
adapter + real per-record `version` (5); UI/rendering; removing the quarantine (6).

**Non-negotiables:** `tfin.js` **728/0** (no rendered byte changes; the headless/system actor
keeps the login-less harness writable); `npm test`/build/e2e/smoke green each phase; **reset, not
migrate** (extend the `SCHEMA_VERSION`/`resetPreSchema` gate); every module adopts and ships on
its own; a half-migrated app fully works; the perf ceilings hold (one serialization per commit).

---

## 2. Current state (first-hand; line refs) — unchanged from Rev 2 except the two fact fixes noted

*(§2.1–2.3, 2.5 as Rev 2; abbreviated here — see review log / Rev 2 for the full map.)*
- **2.1 Scheduler**: mutation funnel → `noteChange` marks → `afterSchedMutate` (reconcile →
  `markEdit` → `HOOKS.histPush` → `validate` → render). `runInputWrite` (`store.ts:131-155`)
  already snapshots → applies → post-checks `protectedTouched` → rolls back (`histRestore`).
  **≥11 writers reach `HOOKS.histPush` without `afterSchedMutate`** (approve/publish/AL/
  clear-pending `publish.ts:191-200`; sign-clear/mute `interactions.ts`; drafts; `Shell.tsx:170`;
  `runInputWrite`; `moveSection`/reorder `store.ts:171-197`). `markEdit` calls `renderStatus()`
  (=`notify`) **before** `histPush` (`publish.ts:525`) → a notify fires INSIDE the reducer.
  `actor` seam is the display label; `origin` has none; `SESSION=null` in the parity harness.
- **2.1a Publish is irreversible (verified):** `setDayApproved` — "a published day can NEVER be
  un-approved … `on=false` is a no-op" (`publish.ts:180-201`); `reissueReopened` removed; first
  approval writes the frozen Original `SCHED.orig[di]={id:verId(iso,0),…daySnap}` and spends the
  signature via `signClear`. Live `SCHED.sign[di]`/`signBind[di]` are **mutable** working sigs;
  only the copy inside `als[n]` is append-only. Undo (snapshot restore) still reverses a publish
  because `dayOK`/`orig`/`cur` ride `schedFields` — so *undo-of-own-publish* exists even though a
  *forward un-approve* is refused (the boundary question, §3.4).
- **2.2 PEOPLE + VCONF bypass the funnel**; many durable settings have their own `store.set`
  writers (templates, stores, cxreasons, qualcols, defaults).
- **2.3 Leave War**: strict funnel → `persist()` (atomic ~22 keys + `recordHistory`) → notify;
  per-war undo; the four `sync.ts` reconcilers run under `locked()` and tag `{source:'raptor'}`.
  **Sync is not pure projection** — input-delete → `withdrawLeaveCell` deletes the authoritative bid.
- **2.4 Tracker** *(facts corrected):* no funnel; async `sSet` self-persist. Courses **and**
  syllabuses carry **stable ids** (`COURSES={id,name}`, `course` is the id, `renCourse` is
  label-only, `courseIds.js`/`sylIds.js`); keys are `v3:<courseId>:<sylId>:…:<studentId>`. `setFont`
  **auto-persists** `layout.__font` via `saveLayout` (nothing in `layout` is staged today);
  `switchCourse` **does** confirm via `leaveFlowEdits` (`:3716`; `:1272` is a belt-and-braces
  clear). Undo exists (chart+mark stack, per course/syllabus, mark entries per **student**), and
  `applyHist`/`applyMarkHist` **do** save — Tracker undo is not save-independent. Writers chain
  awaits (`switchSylNow`, `applyMarkHist`).
- **2.5 Storage door**: whiteboard (7-blob `Collection` union, `subscribe` stream) → postman
  (per-record write-behind, queue-depth `SaveStatus`, never rolls back) → backend (`loadAll` +
  `put`/`remove`, no version). Four mega-blobs. `persist.ts` carries four week invariants
  (preserved-week from retained blob, pristine seed unstored, orphan delete, swap-window). Reset
  gate clears only `['inputs','weeks']`. Target door (Step 5): `put(…,version)` → 412-reject +
  re-read + clear-that-record's-undo; `FanOutBackend` splits the blobs.

---

## 3. The command model

### 3.1 Command, derived Change, envelope, and record granularity

```ts
interface Command {
  type: string
  scope: Scope                    // §3.7
  meta?: Record<string, any>
  apply: (txn: Txn) => void       // SYNCHRONOUS mutation only; no async, no I/O, no prompts (§3.2)
}
interface Change {                // DERIVED after apply by per-record deep-equal; not a Command input
  op: 'put' | 'delete'
  collection: LogicalCollection
  id: string                      // a stable id (Step 1 gave rows, inputs, people, courses, syls, students ids)
  staged?: boolean                // §3.8, set per-Change by the command's purpose+collection policy
  before?: unknown; after?: unknown
}
interface CommitEnvelope {
  seq: number; at: string /* frozen ISO */; actor: Actor; origin: Origin; scope: Scope; type: string
  changes: Change[]               // derived OUTPUT
  boundary?: PublishRef           // §3.4
  causedBy?: number               // seq of the parent, when this is a queued independent reaction (§3.2)
}
```

**Logical records (the granularity — Fable R2-2).** Deriving "by rid" misses every write with no
per-row content change (section reorder, publish state, mutes, drafts, planning layer). So the
logical record set is explicit, and derivation is **deep-equal per record**:

| logical collection | record id | owning physical blob (Step 2 fold) |
|---|---|---|
| `days` | `<weekId>:<date>` — the whole day (rows **in order** + `secOrder`) | `weeks/<weekId>` |
| `sched.book` | `<weekId>` — every `schedFields()` member (pending/added/als/al/dayOK/sign/signBind/orig/cur/drafts/curDraft/ridV/amV) | `weeks/<weekId>` |
| `sched.mutes` | `<weekId>` — WARNOFF | `weeks/<weekId>` |
| `inputs` | `<iid>` | `inputs/all` |
| `plan` | `all` — PLANPUCKS + DAYRMK | `plan/all` |
| `people` | `<personId>` | `people/all` |
| `settings.*` | the setting key | `settings/<key>` |
| `lw.war` | `<warId>` (whole war grid+states — split is Step 5) | `leavewar/wars` |
| `trk.marks`/`trk.dates`/`trk.roster`/`trk.layout`/`trk.syls`/`trk.plan` | the `v3:` key | `tracker/<key>` |

`LOGICAL_TO_BLOB` names the owning blob; the fold subscriber re-serializes each touched blob once
(§4). **Each adopted writer must yield ≥1 Change** (gated with the F9 weeks-invariant test)
before its `persistAll` is retired.

### 3.2 The transaction — one model (Codex R2-002/003/004/007 · Fable R2-1/R2-4/R2-7)

`commit(cmd)` opens a **transaction** and runs these phases; **legacy `notify` / `HOOKS.histPush`
/ module `persist()` / `recordHistory` are LATCHED (queued, not executed) for the whole of
phases 2–8** and released in phase 9:

1. **Derive the actor + origin internally** (from `SESSION` + a module-private origin channel —
   never from the caller). Authorize `cmd.type` (§3.5). Reject → nothing applied.
2. **Snapshot only the blob(s) `LOGICAL_TO_BLOB` says this `type` can touch** (Fable R2-9): the
   `weeks/<cur>` slice for a slot edit, `inputs/all` for an input edit, the LW `state` reference,
   the touched `v3:` slices for Tracker. Keep the phase-2 string to reuse as the interim snapshot.
3. **Apply the reducer** (synchronous). **Causal cross-module children run INSIDE this same
   transaction** (Codex R2-003): e.g. `commitInputEdit`'s `retractLwRow`→`withdrawLeaveCell` is
   invoked as part of the reducer, on latched state, sharing this transaction's snapshot,
   rollback, authorization and **one** envelope — not queued. Its effects are part of
   `changes[]` and of the inverse data (dissolving CMD-010 at the source).
4. **Derive `Change[]`** by per-record deep-equal (§3.1) across every touched logical record.
5. **Conflict + invariant checks** (`protectedTouched`, structural integrity; §3.6).
6. **On any failure in 3–5**: restore the phase-2 snapshot, **discard the latched effects**,
   emit nothing, return `conflict`/`invalid`. Because side-effects were latched (not executed),
   rollback is real even while legacy `persistAll` is still installed (fixes Codex R2-002 / Fable R2-4).
7. **Fold-persist** the changes (§4), advancing the store revision **once** for all the
   transaction's authoritative changes (§3.3).
8. **Append the envelope**, assign `seq`.
9. **Release the latch**: run the coalesced module `notify` once; then **drain the post-commit
   queue** — the *independent* reactions (a sync pass that recomputes derived state in response to
   the committed change) run now, each as its own `commitAs(..., {origin:'projection'})` carrying
   `causedBy = seq`. Because they carry the envelope origin, `histPush`/`recordHistory` skip them
   **by origin, not by the `HIST.lock` flag** (Fable R2-1) — so a `restore` followed by its drained
   projection does not push a new snapshot or splice the redo tail.

**Composition vs scheduling (Codex R2-003):** causal children = *in* the transaction (phase 3);
independent reactions = *queued after* (phase 9). `commit` is **non-reentrant**: a `commit`
requested during phases 2–8 is enqueued and drained in phase 9 (never nested), seq at drain,
subscribers see envelopes in order. **Async rule (Codex R2-004 / Fable R2-7):** the reducer is
synchronous mutation only. Async prompts/reads (`uiPrompt`, confirms, `await sSet`) live OUTSIDE
`commit` — the fold subscriber owns the async save; an await-interleaved chain (`switchSylNow`,
`applyMarkHist`) is expressed as a **sequence of commands** (or a read taken before the command),
never one async reducer.

**API:**
```ts
export function commit(cmd: Command): CommitResult          // the ONLY public entry; actor+origin derived inside
function commitAs(cmd: Command, ctx: { actor: Actor; origin: Origin }): CommitResult  // internal: sync/seed/restore
function onCommit(fn: (env: CommitEnvelope) => void): () => void
// CommitResult = { ok:true, envelope } | { ok:false, reason:'unauthorized'|'conflict'|'invalid', detail }
```

### 3.3 Origin taxonomy + the revision rule (Codex R2-007 · Fable R2-1/R2-3)

`type Origin = 'user' | 'remote' | 'projection' | 'restore' | 'seed'`

| origin | undo entry? | applied silently? | who sets it |
|---|---|---|---|
| `user` | **yes** | no | `commit` (public) |
| `remote` | no | **yes (`emit:false`)** — no echo back (F13) | DB adapter (Step 5) |
| `projection` | **no** (skipped by origin, not lock — Fable R2-1) | emits locally | `commitAs`, sync passes |
| `restore` | no (it IS the undo) | emits locally | `commitAs`, undo/redo/loadWeek |
| `seed` | no | emits locally | `commitAs`, boot/migration |

**Revision rule (Codex R2-007, replacing Rev-2's "don't bump"):** **every authoritative persisted
write advances the store revision — including undo/redo and authoritative projection effects** —
so a concurrent client cannot lose an update by writing over a reversal it never saw. The Rev-2
concern (a projection after a user edit refusing that user's undo) does **not** arise, because the
causal projection is *inside* the user command's transaction (§3.2 phase 3) → one revision for the
whole command; the user's undo pins the **causal RESULT** (the post-command record versions), not
a pre-projection version. Truly-independent derived recomputes (a pure re-projection that changes
no authoritative fact) carry a separate **derived token**, not the causal revision, so they never
gate a user undo. At Step 2 the revision is collection-granular and the conflict check is a
single-tab no-op exercised only by `MemoryDoor`; the real per-record version is Step 5.

### 3.4 Publish-boundary contract (Codex R2-001 · Fable R2-3)

**Frozen issued artefacts** (immutable; never mutated by any command; the ids Step 3's undo will
not cross when they are *committed history*): the AL snapshot `SCHED.als[n]`, its embedded sign
copy `als[n].sign`/bindings, and the **Original** `SCHED.orig[di]` (`{id:verId(iso,0),…}`, "frozen
forever once issued"). **Live `SCHED.sign[di]`/`signBind[di]` stay ordinary mutable records** —
signing/`signClear` change them; freezing them would refuse those commands. **Reopen does not
exist** (correct §2.1's stale history.ts comment); a *forward* un-approve is already a no-op.

**Owner decision (16 Sep 26 — RESOLVED, do not relitigate).** Undo always works from the
Undo button; its *mechanism* switches at the send-to-shared-record boundary:
- **Before the publish has been sent** (session-local, not yet drained/witnessed): Undo
  **silently reverses** it via the snapshot mechanism — no issued record has left the machine, so
  there is nothing to withdraw and none of the DB integrity bugs can arise.
- **Once it has been sent**: the snapshot-undo does **NOT** cross the boundary (SEQ-002 / Codex
  R3-005 upheld — never erase or overwrite an issued record). Instead the Undo affordance issues a
  **forward withdrawal command** — an append-only, on-the-record reversal (a correcting amendment)
  that flows to everyone like any change, after a one-line heads-up that it will be visible. This
  is bug-free by construction: **never erase**; issued versions carry **unique, never-reused** ids;
  derived leave credits **recompute** from the current published set. It is the same mechanism as
  "supersede with an amendment". Recovery likewise publishes under a **NEW** `nextSeq` id
  (`publish.ts:578`); issued records + their signatures are never overwritten.

Step 2 records `boundary` on the envelope with a **`crossable`** flag — crossable (silent-undoable)
only for the issuing session until a `remote` envelope references the id or the session ends;
Step 3 reads it to choose silent-reverse vs forward-withdrawal. Frozen artefacts (`sched.als/…`,
`sched.orig/…`, own append-only records — Fable R3-6) are put-once at phase 5. **Also resolved:
roster/settings edits ARE undoable** (in the global undo timeline as `user` commands; never
amendments).

### 3.5 Authorization (ARCH-01 · Codex R2 · Fable R2-5/R2-6)

```ts
type Actor = { id: string; role: 'admin'|'member'|'system'; personId?: string; session: string|null }
```
- `Actor` is derived inside `commit` from `SESSION` (effective role via `setEffectiveRole`), not
  the display label `whoami()` returns. **Role mapping: `SESSION.role` values are `'admin'|'main'`
  → `main` maps to `member`** (Fable R2-6). `personId` from the session.
- **Headless/system actor** `{id:'system', role:'system', session:null}` — used **only for
  `seed`, `projection`, and `loadWeek`** (via `commitAs`), and — under an explicit test flag — the
  `SESSION=null` parity harness + engine tests, so `sched.*` commands don't refuse and 728/0 holds.
  **Never used for a user-triggered `restore`.**
- **Undo/redo permission (Fable R2-5):** `permission(undo|redo) =` for **every** change in the
  inverse patch, `permission(originating command type)` evaluated against the **current effective
  actor + target ownership**. So an admin who decided a bid, then `toggleRole`'d to member (history
  retained), is **refused** when undoing that `lw.bid.decide` — closing RC1. The inverse changes
  do **not** apply under the system actor.
- `commitAs` (actor/origin) is **not exported**; only `commit(cmd)` is (Fable R2-6), so a UI caller
  cannot self-elevate by passing `origin:'projection'` or a system actor. Client gate is
  defense-in-depth; real authorization is Step 5 sign-in.

### 3.6 Atomicity + conflict + `MemoryDoor` (as Rev 2, with the latch)
- **In-memory atomicity is real** via §3.2 phases 2/6 (latch + snapshot/rollback); a reducer that
  throws mid-way leaves model **and** the (latched, so un-emitted) whiteboard byte-identical — for
  **adopted collections**; the property is asserted per rollout item, and holds fully once the
  causal children of a command are all adopted (Fable R2-4 scoping).
- **Durable cross-blob atomicity is NOT guaranteed at Step 2** (the postman retries per blob); the
  fold narrows the window (blob-level, latched) but a true journal/ack is Step 5. Stated honestly.
- **Conflict**: collection-granular version, single-tab no-op at Step 2, exercised only by
  `MemoryDoor`'s injected second-tab fault. Undo pins the causal result (§3.3).
- **`MemoryDoor`** implements the door shape (§5.5) + faults (reject put, drop ack, reorder,
  second-tab advance).

### 3.7 Undo-scope (Fable R2 / F11) — unchanged from Rev 2
`Scope = {sched, weekId} | {inputs} | {plan} | {lw, warId} | {trk, `${courseId}:${sylId}`, student?}
| {people} | {settings}`. INPUTS/plan are app-global (not week-scoped); Tracker mark entries carry
the student. Step 3 filters replay by `{actor, session}` + scope.

### 3.8 Staging — by purpose, per-collection (Codex R2-006 · Fable R2-8)
Only the **interactive unsaved chart editor** stages (`trk.syls` changes made while the structure
editor is open, held for **✓ Save changes**). **Save / duplicate / add / import / revert / delete
commit their definition changes immediately** (with their dependent catalogue/layout changes in
the same command) — `dupSyl`/`addSyl` must not lose content to a held definition on reload.
`trk.layout` / `trk.marks` / `trk.dates` always commit immediately. So `staged` is decided by
**command purpose + collection**, not by collection alone. State machine (unchanged from Rev 2):
staged writes touch the working overlay + staged history cursor; Save serializes the overlay vs
baseline; discard (`leaveFlowEdits`/`switchCourse`/`switchSylNow`) restores the baseline and
invalidates staged history.

---

## 4. Stream consumers (built once)
1. **Persistence — a per-module FOLD** (F2). `onCommit` groups the envelope's changes by owning
   blob via `LOGICAL_TO_BLOB`, re-serializes each touched blob **once**, one `wb.set` per blob
   (this IS today's `persist()` logic, now command-driven). Inherits the **four weeks invariants**
   (preserved-week from retained blob; pristine seed unstored; orphan `weeks/*` deleted;
   swap-window), gated by `persist.test.ts`. `remote` applies `emit:false`. `persistAll` stays for
   un-adopted collections and any collection whose `histPush` sites aren't all wrapped, shrinking
   per phase. Record-level `wb` writes = Step 5 FanOut.
2. **Undo (Step 3)** — inverse-patch log from `user` envelopes; replay honours `boundary`+`scope`;
   authoritative cross-module effects reverse with their causal command (they're already in its
   `changes`/inverse). Retires the three snapshot stacks **only after Step 4** (CMD-010).
3. **Sync (Step 4)** — LW↔inputs reconciliation becomes an `onCommit` handler by id.
4. **DB adapter (Step 5)** — same door, Dataverse-backed; `remote` commits via the stream; `RESET`
   becomes a per-version map (F10).

---

## 5. Adoption per module (strangler wrapper; parity gate after each)
### 5.1 Scheduler (first)
- Reducers call today's writers on latched state; **`Change[]` derived by per-record deep-equal**
  over the logical records (§3.1), NOT marks. **Wrap every `HOOKS.histPush` site** (checklist:
  funnel epilogue, approve/publish/AL/clear-pending, sign-clear, mute, drafts, `Shell:170`,
  `runInputWrite`, `moveSection`/reorder); **keep `persistAll` per collection until its checklist
  is empty**; dev-guard `histPush` outside `commit` for an adopted collection. Latch the mid-apply
  `notify` (`markEdit`→`renderStatus`) so the reducer can't half-emit (Fable R2-4). `origin`:
  board/drag = `user`; validate marks = `projection`; `loadWeek`/undo = `restore`; seed = `seed`.
- Snapshot only `weeks/<cur>` (or `inputs/all`) per §3.2 phase 2; reuse the string for the interim
  histPush (one serialization — Fable R2-9).
### 5.2 PEOPLE + VCONF + the full settings inventory (CMD-007)
- `people.*` commands (`user`, `{people}`); inventory + route every durable settings writer
  (`rules`, templates, stores, cxreasons, qualcols, lookahead, defaults) through named commands
  with explicit permissions; forbid the raw `settingsAdapter` back door. **Owner call (Q2):**
  roster/settings in the undo timeline? (proposal: yes as `user`, never amendments).
### 5.3 Leave War
- Wrap causal writers; `persist()` becomes the fold. The four sync reconcilers become
  `projection` via `commitAs`; **the causal cross-module effect** (input-delete → `withdrawLeaveCell`
  bid-delete) runs **inside the originating scheduler command's transaction** (§3.2 phase 3), not
  as a queued reaction, so it shares rollback + inverse data. `locked()` stays as mechanical
  re-entrancy safety. LW's snapshot undo retires at Step 3, **after Step 4** (parallel until then;
  §9 proof).
### 5.4 Tracker
- Reducers are synchronous mutation; the async `sSet` is the fold subscriber; async prompts/reads
  outside `commit`; await-interleaved chains → command sequences. **Courses & syllabuses already
  carry stable ids** — `Change.id` is that id; `renCourse`/`renSyl` are **label-only** commands
  (no re-keying — Codex R2-005). Staging by purpose (§3.8). `scope={trk, courseId:sylId, student?}`.
### 5.5 Record-oriented door (contract + `MemoryDoor` now; real backend Step 5)
- `get / put(…,{version}) / delete(…,{version}) / subscribe / batch(changes,{emit?})`;
  `LOGICAL_TO_BLOB` map; `emit:false` silent path for `remote`; `RESET` per-version map. Real
  mega-blob split + `version`/412 = Step 5.

## 6. Parity & proof — tfin 728/0 each phase; golden snapshots before/after each module; suites green.

## 7. Testing harness (first increment)
Classify invariants (hard / advisory-warn-not-block / frozen). **Command-layer property tests:**
(a) reducer throws mid-way ⇒ model + whiteboard byte-identical **for adopted collections**;
(b) conflict refusal under `MemoryDoor`'s second-tab fault; (c) **`restore` → drained projection
⇒ `canRedo()` still true and the LW stack length unchanged** (Fable R2-1); (d) an `onCommit`
subscriber that commits is enqueued+drained, never nested (F7); (e) **admin decides → `toggleRole`
to member → undo REFUSED** (Fable R2-5); (f) each listed non-row writer yields ≥1 Change before
its persistAll retires (Fable R2-2); (g) a slot edit serializes the world **once** (Fable R2-9);
(h) staged: stage S1,S2 → undo S2 → Save persists the current overlay, not a replayed S2.

## 8. Rollout (within Step 2)
1. Core: `commit`/`commitAs`/derive/envelope/`onCommit` + latch + post-commit queue +
   `wb.batch(fold,{emit?})` + `LOGICAL_TO_BLOB` + `MemoryDoor` + auth table + actor/system-actor +
   origin/scope/boundary + harness. 2. Scheduler (all histPush sites wrapped; persistAll kept until
   empty; notify latched). 3. PEOPLE + VCONF + settings inventory. 4. Leave War (causal effects
   in-txn; sync → projection). 5. Tracker (sync reducers; staging by purpose). 6. Fold replaces
   persistAll **per collection**, only once its histPush sites are wrapped and the weeks invariants
   pass against the subscriber alone. Snapshot stacks retire at Step 3 (after Step 4), not here.

## 9. Open questions
1. **RESOLVED (owner, 16 Sep 26):** undo-of-publish semantics — silent before sent, forward
   on-the-record withdrawal after sent (§3.4). **RESOLVED:** roster/settings ARE undoable (§5.2).
2. **Split a mega-blob at Step 2 vs Step 5?** Rev 3 keeps the fold (collection-granular version,
   single-tab no-op). Is a minimal `leavewar/wars`/`inputs/all` split worth pulling forward so
   per-record conflict is real pre-Dataverse? (Codex Q3.)
4. **Parallel-undo interim proof** (§5.3) — prove the old per-module snapshot stacks + the new
   command stream can't disagree visibly before Step 3 retires the stacks, given the latch/origin
   rules (Fable R2-1). Is "additive until Step 3" demonstrable, or do the old stacks go read-only?
5. **Cross-backend atomicity** with the append-only docstore — Rev 3 leans forbid-until-Step-5.
