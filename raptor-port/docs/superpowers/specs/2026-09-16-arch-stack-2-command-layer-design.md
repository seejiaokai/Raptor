# [ARCH-STACK] Step 2 — the one write/command layer — DESIGN (Rev 5, 16 Sep 26 — BUILT; Rev 5.1 corrections 17 Sep 26)

> ## Rev 5.1 — CORRECTNESS SWEEP (17 Sep 26), checked against the CODE, not against other docs
>
> Rev 5 was written on 16 Sep, BEFORE the 17 Sep discovery that several always-loaded documents
> were wrong about this very machinery, and before Step 2 was actually built. Every factual claim
> below was re-checked by opening the file it describes. **The design decisions are unchanged** —
> what changed is a set of wrong facts and four places where the BUILD deliberately diverged from
> the design. Method (learned 17 Sep): a document agreeing with another document is evidence of
> nothing; only the code counts.
>
> **Facts that were WRONG in Rev 5 and are fixed in place below:**
> 1. §2.1 said `markEdit` fires a **toast**. It does not. `engine/publish.ts:markEdit` runs
>    `logEdit` → `renderStatus()` → `histPush()` and nothing else; every toast at a board site is
>    the CALLER's. This matters: §5.1's "latch the mid-reducer notify/toast/logEdit" was latching
>    an effect that is not there.
> 2. §2.1 cited `store.ts:131-155` for `runInputWrite`. The file is `state/store.ts` and the body
>    is `runInputWrite` (line numbers rot — the function name is the durable reference).
> 3. §2.1a cited `publish.ts:180-201` for `setDayApproved`. It is `engine/publish.ts:setDayApproved`.
> 4. §2.1's "≥11 writers reach `HOOKS.histPush` without `afterSchedMutate`" is now stated exactly:
>    **12 production sites**, listed in §2.1.
> 5. §2.3's "~22 keys" for the Leave War `persist()` is **21**, listed in §2.3.
> 6. §3.1 named the day record `days/<wk>:<date>`. The built id is `<wk>#<di>` — week key, day
>    INDEX. Likewise `sched.als` is keyed `<wk>:<n>` (the array index), not `<wk>:<verId>`.
> 7. §3.1's Leave War row omitted the **`lw.war`** record (the per-war period: id/name/stage/
>    bidFrom/bidTo/days). Without it a stage advance, a rename, a bidding-window change or a
>    brand-new cell-less war produces an empty diff — found during the build (Fable-2) and added.
> 8. §3.1's `lw.config` field list omitted `figureHidden`, `requirements` and `eventRows`.
> 9. §3.1's Tracker row omitted **`trk.courses`** (11 registered collections, not 10).
>
> **Where the BUILD knowingly diverges from this design — believe the code, not the prose:**
> - **Toast and edit-log latching were NOT wired** (`state/sched-commit.ts` header states why:
>   they are engine-layer, append-only and order-insensitive, and no scheduler write rolls back in
>   live flow at Step 2). The MODEL and the repaint/history effects ARE latched. Full effect
>   latching lands with Step 3. §3.2 phase 1 and §5.1 describe the INTENT; the build is narrower.
> - **Permissions are permissive (`anyone`) everywhere at Step 2**, deliberately — the real edit
>   gate (`canEditSched`) is untouched and still authoritative. §3.5 describes the mechanism, which
>   is in place and tested; it is not yet tightened. Unchanged intent, narrower build.
> - **Leave War's store is deliberately NOT a guarded store** (a causal Raptor→LW write is locked
>   and legitimately changes it outside any LW command, which the whole-world guard would wrongly
>   flag). §3.2 phase 2's guard covers the scheduler and people/settings, not LW.
> - **Undo/redo, the sync reconcilers and boot/seed writes all run RAW**, as §0 says, and the LW
>   join for a causal Raptor→LW write is **deferred**, not built (`store.ts` LW header).
>
> **Persistence — the 17 Sep ledger applies here too.** Nothing in this spec claimed session-only
> behaviour, but the neighbouring code did and was wrong: `SCHED.orig` and the AL list DO survive a
> reload on a built site (they ride `schedFields()` → `weekStashSnap()` → the `weeks/<wk>` record),
> as do `SCHED.drafts`/`curDraft`, `WARNOFF`, INPUTS and the planning layer. The authority is
> CLAUDE.md §Architecture rules "WHAT ACTUALLY PERSISTS". §3.1's treatment of `sched.orig`/
> `sched.als` as durable records is therefore correct as written.
>
> **Still open, unchanged:** §9's three questions. **Not swept:** §4/§6/§7/§8 are forward-looking
> (Steps 3/5) and describe nothing that exists yet, so there was nothing to check them against.

**Status:** Rev 5 — after FOUR cross-provider red-team rounds (Codex GPT-6 Astra + Fable 5.1, all
converged; findings 11→7→7→5 / 13→9→7→7; both affirm the **additive** strategy is sound). Owner
decisions RESOLVED (§3.4). Round-4 confirming review folded (final precision + explicit Step-3
deferrals). **Judged BUILD-READY** — the remaining validation is the test-first build's per-phase
parity gates + its post-build cross-provider CODE inspection (a standard step here). Build off
branch `claude/arch-stack-2-command-core-design`.

## Rev 5 change-list (round-4 dispositions — all accepted)
- **Step 2 authorizes FORWARD writes only; undo-auth is Step 3** (Fable R4-1): dropped the "closes
  the member-undoes-admin hole" claim from §0 — the bare-JSON snapshot stacks carry no actor/type to
  evaluate, and gating them would be a behaviour change the additive framing forbids.
- **Undo/redo is NOT routed through `commit()` at Step 2** (Fable R4-2 / Codex R4-001): it runs
  exactly as today. Any latched/queued effect carries a **suppression-context token** (HIST.lock /
  LW-lock / SYNCING captured at raise, re-applied at release) so lock-wrapped forward batches stay
  byte-identical. §0/§3.2.
- **Put-once ENFORCEMENT on orig/als deferred to Step 3** (Codex R4-002): record *shape* stays
  (own append-only-intended records); a hard gate now would reject the permitted silent-undo-before-
  sent (today's `histRestore` replaces orig/als). §3.4.
- **Explicit disclosure transition for `crossable`** (Codex R4-003): the PDF export discloses an
  issued day with no remote envelope, so define a monotonic per-issued-id disclosure signal that
  send/export/print all report; `crossable=false` once disclosed by ANY path. §3.4.
- **Registry: add `SCHED.changes`; derive from code; completeness = reconstruct-and-compare**
  (Codex R4-004 / Fable R4-4). §3.1/§7.
- **Finer LW logical records — per-cell / per-bid**, not whole-war, so the revision map works
  (Codex R4-005 / Fable R3-4). §3.1/§3.3.
- **Explicit `txn.enlist(store)`** before mutating (no write seam for auto-enlist) + a whole-world
  debug guard (Fable R4-3). §3.2.
- **Synchronous drain** inside the outermost `commit()` (Fable R4-5). §3.2.
- **ME = defense-in-depth parity, headless `personId` undefined** (Fable R4-6); **child permission =
  the parent's declared permission, never caller-selected** (Fable R4-7). §3.5.
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
**forward** write passes (undo/redo stay ungated as today — undo-authorization lands with Step 3
when undo becomes stream-driven; §3.5); (2) in-memory **transactional atomicity** — a multi-step
write either fully applies or fully rolls back (today it can half-apply); (3) a **complete,
correct record-level change stream** proven to capture every durable write, ready for Steps 3/5.
Nothing it does changes a rendered byte (`tfin.js` 728/0) or how persistence/undo currently behave.

**Undo/redo are NOT routed through `commit()` at Step 2** — the Undo buttons keep calling today's
`undo()`/`redo()`/`lwUndo()`/`lwRedo()` exactly as now. Routing them would change *when* their
sync reactions run relative to `HIST.lock` and revive the redo-tail-splice bug (Codex R4-001 /
Fable R4-2). Only forward writes go through `commit()`; Step 3 rebuilds undo from the stream.

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

## 2. Current state (as of 16 Sep, pre-build; re-verified against the code 17 Sep — see Rev 5.1)
- **2.1 Scheduler**: funnel → marks → `afterSchedMutate`; `state/store.ts:runInputWrite` already
  snapshots→applies→post-checks→rolls back — the pattern to generalize. **12 `HOOKS.histPush`
  call sites** (17 Sep count): `state/store.ts` ×3 (the `runInputWrite` epilogue, `moveSection`,
  `moveSectionTo`), `engine/publish.ts` ×4 (`markEdit`, `setDayApproved`, **`alIssue`** — reached
  via `publishALDay`, which has no `histPush` of its own — and `discardPending`),
  `ui/interactions.ts` ×2 (`signClear`, the warning-mute toggle), `ui/DraftsModal.tsx` ×2 (draft
  rename, draft delete), `ui/Shell.tsx` ×1 (`setSign`).
  **Rev 5.1 fix 11 — do not read all 12 as "bypasses `afterSchedMutate`".** `markEdit`'s site is
  `afterSchedMutate`'s OWN epilogue (`state/view.ts:afterSchedMutate` calls `markEdit()`), so it is
  a bypass only when `markEdit` is called directly — `markStructuralAdd`, `markDeletion`,
  `markMove`, `markInputFiling`. The true bypass set for the §5.1 wrap checklist is therefore
  **11 sites plus those four direct `markEdit` callers**. `markEdit` fires `logEdit` + `renderStatus`(=`notify`) +
  `histPush` **inside** the reducer — **it does NOT toast** (Rev 5.1 fix 1); the toast at a board
  site belongs to the caller. `actor`=display label (`HOOKS.whoami` → the ACCOUNTS label, a
  placeholder until real accounts); `SESSION.role`∈`admin|main`; person-identity is the separate
  **ME** binding, not `SESSION`.
- **2.1a Publish is irreversible in code** (`engine/publish.ts:setDayApproved`; reopen removed);
  first approval writes the frozen Original `orig[di]`; live `sign[di]`/`signBind[di]` are mutable
  (only the copy in `als[n]` is append-only).
  **NB (17 Sep):** eligibility, the panel counts and the stored diff all derive from the canonical
  `dayDelta`, **never** from the accumulated `SCHED.pending` marks (`dayHasChanges` reads straight
  through `dayDelta`). A funnel-bypassing write therefore still reaches the next AL — unmarked and
  unexplained — which is worse than being absent, not better.
- **2.2** PEOPLE + VCONF + many settings writers bypass the funnel. *(Routed in the build, phase 3
  — `state/people-settings-commit.ts`.)*
- **2.3 Leave War**: funnel → `persist()` (**21 keys**, `leavewar/state/store.ts:rawPersist`) → notify;
  per-war snapshot undo; sync reconcilers under `locked()` tag `{source:'raptor'}`;
  **`retractLwRow` runs inside the `writeInputsBatch` reducer** (re-verified 17 Sep —
  `ui/inputedit.tsx:commitInputEdit` opens `writeInputsBatch` and calls `retractLwRow` inside it);
  LW ledger/balances/oilpolicy/postouts/config are **separate durable keys** outside `wars`.
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
are **nested in the day record** — the `days/<wk>#<di>` Change carries the day incl. row order +
`secOrder`; a slot edit yields ONE day Change (the day owns the inverse), not a day + a row Change
(R3-6).

**The registry is DERIVED FROM CODE, not hand-listed** (Codex R4-004 / Fable R4-4): build it by
enumerating every `sSet`/`persist()`/`store.set` key builder and classifying each as **record** /
**boot-migration** (seed origin, exempt) / **view-preference** (exempt but listed, e.g. Tracker
`kLast`/`kLastStudent`, LW `current`). Completeness is proven by **reconstructing the persisted
state from the envelope and comparing it to the legacy serializer** — NOT "≥1 Change", which misses
an omitted field (e.g. `SCHED.changes`). The table is illustrative; the enumeration is authoritative:

| module | logical records | owning blob |
|---|---|---|
| scheduler | `days/<wk>#<di>` (day incl. rows+secOrder; keyed by week key + day INDEX — Rev 5.1 fix 6); `sched.book/<wk>` (mutable book: **`changes`**/pending/added/al/dayOK/cur/drafts/curDraft/ridV/amV **and** live `sign`/`signBind`); `sched.mutes/<wk>` (WARNOFF) | `weeks/<wk>` |
| scheduler-issued (append-only-INTENDED; enforcement Step 3, §3.4) | `sched.orig/<wk>:<di>`; `sched.als/<wk>:<n>` (the AL array INDEX, not the verId — Rev 5.1 fix 6; incl. its frozen sign copy) | `weeks/<wk>` |
| inputs | `inputs/<iid>` | `inputs/all` |
| plan | `plan/all` (PLANPUCKS+DAYRMK) | `plan/all` |
| people | `people/<personId>` | `people/all` |
| settings | `settings/<key>` — **every** durable settings writer (rules, day/duty/wave templates, stores, cxreasons, qualcols, lookahead, defaults) | `settings/<key>` |
| leave war | **`lw.cell/<warId>:<personId>:<date>`** + **`lw.bid/<warId>:<personId>:<date>`** (per-cell / per-bid, so the revision map is cell-granular — Codex R4-005); **`lw.war/<warId>`** (the war’s own period record — id/name/stage/bidFrom/bidTo/days; without it a stage advance, rename, bidding-window change or a brand-new cell-less war diffs to nothing — Rev 5.1 fix 7); plus `lw.ledger`/`lw.balances`/`lw.oilpolicy`/`lw.postouts`/`lw.current`/`lw.config` (config = eventDefs, figureOrder, rosterOrder, persLabels, manningOrder, manningHidden, **figureHidden**, groupDefs, groupPriority, groupPriorityCustom, groupColors, **requirements**, **eventRows**, showSans, personEdits — Rev 5.1 fix 8) | `leavewar/wars` (+ its own keys) |
| tracker | `trk.marks`/`dates`/`roster`/`layout`/`syls`/`plan`/`pace`/`lulls`/`eventinfo`/`catalogue`/**`courses`** (11 registered collections — Rev 5.1 fix 9) + the `kSyl`/`kSylOrder`/`kSylHidden`/`kSylTomb` def+catalogue keys (the `v3:` keys); migration flags + `seedstamp` are seed-exempt | `tracker/<key>` |

### 3.2 The transaction (additive; latch + dynamic-enlistment rollback + join + post-commit queue)

`commit(cmd)` opens a transaction; **legacy `notify`/`HOOKS.histPush`/module `persist()`/
`recordHistory`/`HOOKS.toast`/`logEdit`/`logAction` are LATCHED** for phases 2–8 and released on
success in phase 9 (discarded on rollback — R3-7):
1. **Derive actor+origin internally** (§3.5); authorize `cmd.type`. Reject → nothing applied.
2. **Snapshot by EXPLICIT enlistment** (Fable R4-3 — in-place singleton mutation has no write seam
   to auto-hook): each wrapped writer calls `txn.enlist(store)` before mutating (LW enlists by
   capturing the immutable `state` ref); the snapshot covers the full transitive write set incl.
   causal children. A **debug/test guard** compares whole-world before/after (`histSnap` + LW
   `historySnap` + the touched Tracker slices) and fails the commit when a change appears in an
   un-enlisted store, so an omitted enlistment can't silently escape rollback.
3. **Apply the reducer** (synchronous). **A `commit`/`commitAs` called from inside the reducer JOINS
   this transaction** (`txn.child(cmd)` / an open-txn flag checked before enqueueing) — shared
   snapshot set (its blobs enlisted too), shared rollback, ONE envelope, its changes appended.
   `commitInputEdit`'s `retractLwRow`→`withdrawLeaveCell` is such a child (verified in-reducer).
   **Causally-related mutations stay in ONE reducer** (R3-004): async prompts/reads (`uiPrompt`,
   confirms, `await sSet`) are moved OUTSIDE `commit`; the synchronous mutations they used to
   interleave (e.g. `popGrade`'s grade + Last-Flown date) run together in one reducer/envelope.
4. **Derive `Change[]`** by per-record deep-equal over every enlisted record.
5. **Conflict + invariant checks** (`protectedTouched`; structural integrity). NB: **put-once
   immutability on `sched.orig`/`sched.als` is NOT hard-enforced at Step 2** — deferred to Step 3
   (Codex R4-002): today's `histRestore` legitimately replaces them on a silent-undo-before-sent, so
   a hard gate here would reject a permitted undo. Their record *shape* is recorded now; enforcement
   lands with the Step-3 boundary cutover.
6. **On any failure: restore the enlisted snapshots, discard the latched effects, emit nothing**,
   return `conflict`/`invalid`. Rollback is real even with legacy `persistAll` installed, because
   the side-effects were latched, not executed.
7. **Emit the envelope** on the stream; assign `seq`; advance the in-memory revision (§3.3).
8. **Release the latch** → today's `histPush`/`persistAll`/`notify`/`toast` run **as they always
   did** (additive: the interim `histPush` keeps its **own** post-apply whole-world snapshot; the
   phase-2 snapshot was only the rollback copy — R3-001/R3-3).
9. **Drain the post-commit queue synchronously, inside the outermost `commit()`** (Fable R4-5 —
   reducers are synchronous, so today's synchronous convergence that tests assert is preserved): the
   dispatcher stays busy while phase-8 notify runs; any `commit` a subscriber raises during delivery
   is enqueued (not nested) and drained after, `seq` at drain, subscribers seeing envelopes strictly
   in order. A queued command returns **`{queued:true, done: Promise<CommitResult>}`** (Rev 5.1
   fix 10 — the earlier `{queued:true, result}` here contradicted both the API paragraph below and
   `command/types.ts`; the promise is already resolved by the time the outer `commit()` returns).
   NB for follow-up #1: `commitSchedValue`/`commitInputs` read `.value` SYNCHRONOUSLY, so they
   assume a non-queued commit — one raised on the reducer stack or as the outermost call. Independent reactions (a sync recompute) run here as
   `commitAs(...,{origin:'projection', causedBy:seq})`. **Every latched/queued effect carries a
   suppression-context token** — `HIST.lock` / LW-lock / `SYNCING` captured at raise time, re-applied
   for the duration of the released call — so a lock-wrapped forward batch (board `sortDay`) or any
   deferred `histPush`/`recordHistory` records exactly as today (Codex R4-001 / Fable R4-2).

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
Frozen issued artefacts are their **own append-only-INTENDED records** (`sched.orig/<wk>:<di>`,
`sched.als/<wk>:<n>` — the AL array index, incl. its sign copy) — separate from the mutable `sched.book`. **Their
put-once immutability is ENFORCED at Step 3** (with the undo/boundary cutover), not hard-gated at
Step 2, because today's silent-undo-before-sent legitimately reverses a just-issued Original via
`histRestore` (Codex R4-002). Live `sign[di]`/`signBind[di]` stay ordinary mutable records.
**Owner decision (16 Sep 26):** Undo always works from the Undo button; **silent reverse BEFORE the
publish is sent/witnessed** (nothing has left the machine — none of the DB bugs can arise);
**an on-the-record forward withdrawal (a correcting amendment) AFTER** — append-only, unique
never-reused ids, derived credits recompute, with a one-line heads-up. The snapshot-undo never
crosses a sent publish. Recorded as `boundary.crossable`, which flips to false on an **explicit,
monotonic disclosure signal keyed by the issued id** — reported by EVERY path that lets an issued
day leave the machine: a shared-DB send, a change-feed reference from another client, a **PDF
export/print** (`printpdf.ts`), a CSV export, or the issuing session ending (Codex R4-003; do not
infer disclosure only from an incoming remote change). Step 3 reads `crossable` to choose
silent-reverse vs forward-withdrawal.
Recovery publishes under a NEW id; issued records + signatures never overwritten. **Roster/settings
edits ARE undoable** (`user` commands, never amendments).

### 3.5 Authorization (actor from SESSION + ME; headless actor)
`Actor = { id; role:'admin'|'member'|'system'; personId?; session }` — account id + effective role
from `SESSION` (`SESSION.role` `main`→`member`), **ownership `personId` from the ME/viewer binding**
(`state/auth.ts` — `ME`/`setMe`), not `SESSION` (R3-006) — ownership-from-ME is **defense-in-depth parity only**
(ME is the user-selectable View-as binding; real identity arrives with Step 5 sign-in), and the
**system/headless actor's `personId` is undefined** (Fable R4-6). Snapshot the actor at command creation. The
**system actor** (`session:null`) is used only for `seed`/`projection`/`loadWeek` and — under a test
flag — the `SESSION=null` parity harness (keeps 728/0); never for a user restore. **Undo/redo
permission** = for every change in the inverse, `permission(originating type)` vs the CURRENT
effective actor + ownership (admin→member→undo-own-admin-decision is REFUSED) — **this rule applies
once undo is stream-driven at Step 3; at Step 2 undo stays ungated as today** (§0). `commitAs` is
not exported. **A joined child's permission is the PARENT command's declared permission** —
composition is part of the command's definition; child types are never caller-selected (Fable
R4-7), so a member-permitted root can't smuggle an admin-only child. Client gate = defense-in-depth;
real auth at Step 5.

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
  every `HOOKS.histPush` site** (checklist); latch the mid-reducer `notify`. *(Rev 5.1: `markEdit`
  raises no toast — the toast is the caller's — and the BUILD deliberately did not latch toast or
  the edit log at all; see the Rev 5.1 divergence list.)* The
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
4. **NEW (17 Sep 26, correctness sweep round 2 / Fable F8) — the disclosure registry does not
   survive a reload, and Step 3 reads it.** `state/disclosure.ts` keeps the set of issued versions
   that have LEFT the machine (a send, a PDF/CSV export, the session ending) in memory. Its stated
   reason was that this matched "the app's session-only INPUTS/stash persistence" — which is FALSE:
   the issued records themselves persist (`schedFields` → `weekStashSnap` → `weeks/<wk>`), and
   nothing re-reports persisted issued ids at boot. So an amendment exported as a PDF reads as
   NEVER DISCLOSED after a reload. Inert at Step 2 (nothing reads it), but §3.4 has Step 3 choose
   silent-reverse vs on-the-record withdrawal from exactly this signal — so Step 3 would silently
   erase something that had already left the machine, the one thing the owner's 16 Sep ruling
   forbids. **Two options: (a) persist the disclosure set with the week record; (b) fail safe —
   treat every issued id hydrated from storage as already disclosed. Recommendation: (b) now,
   folding (a) into Step 5 when disclosure crosses machines anyway. OWNER DECISION — it is about
   what the squadron is told, not about code.** Must be answered BEFORE Step 3 reads `crossable`.
