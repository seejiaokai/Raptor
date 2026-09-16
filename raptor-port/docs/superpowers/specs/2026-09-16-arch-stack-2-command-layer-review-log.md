# [ARCH-STACK] Step 2 — command-layer design — review log

Append-only transcript of the cross-provider red-team of
`2026-09-16-arch-stack-2-command-layer-design.md`.

- **Host / coordinator:** Claude Code (Opus 4.8)
- **Reviewers:** Codex (GPT-6 Astra, high) + Fable 5.1 (high), independent, read-only
- **Mode:** review (no build). Round limit 5.
- Plan SHA256 (round 1): `e9b2ba30c2d048c6d7fd6c7451fee25cb28740a82030f1e7bb220e212cbf3283`
- Repo HEAD at review: `a1cb663`

---

## Round 1 — Codex (GPT-6 Astra, high) — VERDICT: REVISE

Result: `scratchpad/rev-codex/claudex-37od0mps/result.json` (elapsed ~291s).
Summary: "unresolved correctness defects in transaction boundaries, persistence mapping,
authorization, staged edits, and undo sequencing." Plan SHA matched.

Coverage: read the full design + parent plan (SEQ-001..004) + data-model storage/concurrency;
traced Whiteboard/Postman/Backend/adapters/boot/hydrate/persist/reset/docstore; scheduler
history + input txns + UI callers + amendment/publication writers + section reorder + role
handling + PEOPLE identity; Leave War persist/history/permissions/withdrawal/sync; Tracker
storage/role/identity/undo/staged saves/layout/autosave/course-switch; plus a search for
durable settings writers beyond the adoption list.

### Findings (11: 9 high, 2 medium)

- **CMD-001 (HIGH) — logical→physical storage mapping is not 1:1.** Putting an input under its
  `iid` won't update `inputs/all`, which `hydrate` reads exclusively (`persist.ts:49`); same for
  `people/all` and the single `leavewar/wars` array; `days`/`rules`/`lw.bids` aren't even in
  `Backend.Collection`. The "map each Change to wb.set/delete" plan loses adopted edits on reload
  vs the promise of unchanged storage shapes. → Define an explicit logical-record→physical-blob
  adapter now (aggregate into existing blobs, preserve hydration), one persistence owner per key.
- **CMD-002 (HIGH) — `wb.batch` can't give persistence atomicity.** Postman coalesces/retries per
  record; `BrowserBackend.put` is one localStorage write each (`postman.ts:49-89`). A leave approval
  can persist `leavewar/wars` while `inputs/all` fails → durable bid without its absence. Suppressing
  notifications ≠ transactional. → Carry txn identity through persistence; provide an atomic backend
  op or a recoverable journal; distinguish in-memory acceptance from durable completion; don't claim
  SEQ-003 durability from whiteboard batching alone.
- **CMD-003 (HIGH) — existing writers escape the staging buffer.** `commitInputEdit` calls
  `retractLwRow`→`withdrawLeaveCell` which persists+notifies immediately (`inputedit.tsx:907`,
  `sync.ts:403`, `store.ts:2873,1140`) BEFORE the input mutation completes; a later failure can't be
  undone by a scheduler-only staging swap. Scheduler writers also run history+render during mutation.
  → Establish the transaction BEFORE any mutator; nested writers operate on txn-owned state; defer
  persist/history/notify until validation succeeds; include cross-module causal writes even during
  partial adoption.
- **CMD-004 (HIGH) — `restore` exempt from authorization is wrong.** Contradicts §3.5 + the parent
  plan (recheck reversal permission). Reachable: admin decides a bid → switches to member → undoes;
  `toggleRole` retains history (`store.ts:280-295`), LW `historyApply` restores without writer checks
  (`store.ts:1091-1114`), `whoami` returns the account label not the effective role. → Authorize every
  user-requested reversal against the current trusted session + effective role + target ownership +
  restored effects. Separate actor identity from display label. Restrict privileged origins to internal
  entry points so caller-supplied origin/actor can't bypass auth.
- **CMD-005 (HIGH) — conflict guarantee has no production implementation.** `Command` has no read-set/
  expected revisions, `Change` has no revision, production Whiteboard has no revision tracking; §5.5
  gives versions only in `MemoryDoor`. → Define revision-bearing reads, explicit dependency revisions,
  missing/deleted semantics, returned revisions; implement revision tracking in the production model
  and advance it for every adopted/legacy/projection/restore write; distinguish local conflict
  detection from cross-client checks deferred to Step 5.
- **CMD-006 (HIGH) — deriving changes from pending-mark deltas misses writes.** `moveSection`/
  `moveSectionTo` change `secOrder`, create NO marks, call `HOOKS.histPush` directly (`store.ts:171-195`);
  publication changes SCHED + pushes history directly; editing an already-pending row needn't change its
  flag. Mark-delta derivation omits real changes → lost persistence once `persistAll` retires. → Select
  commands at ALL mutation entry points; derive changes from txn before/after state, independent of
  amendment marks; explicitly cover inputs, section order, publication/signatures, drafts, planning
  state, week loading, restores before removing legacy persistence.
- **CMD-007 (MEDIUM) — not all durable settings adopt via `rulesSave`.** Stores, day/duty/wave
  templates, cancellation reasons, qual columns, lookahead, section/wave defaults have separate
  `store.set` writers (`DayTplModal.tsx:49`, `AdminPage.tsx:130-133`) reaching the whiteboard via
  `settingsAdapter` without command auth/revisions/envelopes. → Inventory + route every durable settings
  mutation through named commands; document intentional exclusions; prevent adopted settings from using
  the raw adapter as a back door.
- **CMD-008 (HIGH) — Tracker staged structure + autosaved positions share one layout record.** `setFont`
  changes `layout.__font`+`saveLayout`; a ball drag changes `layout[id]` via the same whole-object
  serializer (`core.js:304-325,2831-2834,4074-4078`). `staged:true` either persists the unsaved font or
  leaves a held full-record snapshot that later overwrites the newer position. → Separate staged vs
  committed representations for fields sharing a physical record (or split logical records); autosave
  excludes staged fields; Save composes committed + staged without replaying stale whole-record snapshots.
- **CMD-009 (HIGH) — staged queue vs undo undefined.** From S0, stage S1,S2 then undo S2: `restore`
  persists → may save unsaved S1; flushing held originals may reapply S2. `applyHist` restores current
  editor state, `persistSyl` serializes current state not queued edits (`core.js:2217,3803-3810`). →
  Specify a staging state machine before build: staged undo/redo moves only the working overlay + history
  cursor; Save serializes the overlay against its baseline; discard restores baseline + invalidates
  staged history; define syllabus/course-switch + conflict-refusal behaviour.
- **CMD-010 (HIGH) — retiring snapshot stacks at Step 3 violates SEQ-004** (one-Absence before retiring;
  `rootcause-plan.md:106-109`). Sync isn't pure projection: deleting a synced input ALSO deletes its
  authoritative bid state via `withdrawLeaveCell`; restoring only the input can't rebuild the deleted
  approval, and outbound reconciliation may remove the restored `lw`-tagged input again. → Retire stacks
  only after one-Absence; until then distinguish authoritative cross-module effects from projections and
  retain the former in the originating command's inverse data — an origin label alone is insufficient.
- **CMD-011 (MEDIUM) — recovery "reuse immutable iso#N" contradicts SEQ-002 + `alIssue`.** `alIssue`
  mints a new id from `nextSeq` (> every existing seq; `publish.ts:578-591,705-716`); republishing under
  the old id would overwrite/duplicate the immutable issued record. → Recovery copies old content into
  working state and publishes under a NEW monotonically-increasing id; the source issued record +
  signatures stay unchanged.

Limitations: static design/source review only; command layer not implemented; parity/perf/browser-fault/
import/Dataverse not verified.

**Host disposition:** pending Fable round 1, then arbitrate all findings together and revise once.

---

## Round 1 — Fable 5.1 (high) — VERDICT: REVISE

Result: `scratchpad/rev-fable/claudex-xn33kv82/result.json` (elapsed ~386s; observed model
`claude-fable-5-1`). Summary: current-state map accurate almost everywhere checked; **defects
are in the command model itself.** 3 material + further gaps. 13 findings.

- **F1 (HIGH) — atomicity mechanism can't be built over in-place mutators.** Staging-buffer +
  conflict-check-before-apply contradicts "call the existing writer then derive Change[]". Repo
  already shows the real pattern: `runInputWrite` (`store.ts:131-155`) snapshots (histSnap),
  applies `fn()`, checks `protectedTouched` AFTER, rolls back with `histRestore`. Also
  `Command.changes` is typed as input though it's an output. → **atomicity = snapshot/rollback**
  (histSnap for sched, immutable `state` ref for LW, JSON copies of touched slices for Tracker):
  authorize → snapshot → run reducer → derive Change[] → conflict + post-apply invariant checks →
  on failure restore snapshot, emit nothing → `wb.batch` → envelope → notify. Move `changes` to
  the envelope. Add a "reducer throws mid-way ⇒ model+whiteboard byte-identical" property test.
- **F2 (HIGH) — logical Change collections don't exist on the whiteboard** (`Collection` is a
  fixed 7-member union; `days`/`lw.bids`/`trk.marks`/`rules` have no record; a bid is inside
  `leavewar/wars`, an input inside `inputs/all`). "Map each Change to wb.set/delete" ⇒ re-serialize
  the whole blob = today's persistAll; rollout item 6 can't deliver record-level writes before
  Step 5's FanOut. → State that at Step 2 the persistence subscriber does a per-module **FOLD**
  (logical Change[] → owning blob re-serialization → one `wb.set`); record-level only at Step 5;
  add a logical→physical collection map; remove the 1:1 claim until it holds.
- **F3 (HIGH) — projection commits would make every user undo a conflict.** Sync passes fire on
  every notify and write INPUTS/wars; under collection-granular versions a user's undo (pinned at
  the pre-sync version) is refused. → Only `user`/`remote` bump the pinned version;
  `projection`/`restore`/`seed` write without bumping (or bump a separate derived-version). If
  collection-granular at Step 2, say the conflict check is a single-tab no-op, exercised only by
  MemoryDoor's second-tab fault. Add: user cmd → projection on same collection → undo succeeds.
- **F4 (MED) — 11+ scheduler writers reach `HOOKS.histPush` without `afterSchedMutate`** (day
  approve/publish/AL/clear-pending, sign-clear, warning-mute, drafts, Shell:170, inputs funnel,
  section move). Making afterSchedMutate's tail the emit point misses them → silently unpersisted
  once persistAll retires. → Enumerate every histPush call site as a wrapping checklist; keep
  persistAll per collection until its list is empty; dev-guard that histPush outside `commit()`
  warns for an adopted collection.
- **F5 (MED) — publish boundary contradicts today's undoable approve/reopen.** `history.ts:26-28`:
  "publishing or reopening a single day is an ordinary undo step". Freezing approve/AL as a
  boundary makes an accidental approve un-undoable (parity gate won't catch it). → Boundary = the
  **append-only issued artefacts only** (`SCHED.als[n]`, sign/signBind), not the day-approve
  toggle; `dayOK`/`al`/`curDraft` stay ordinary user records; list exactly which ids are frozen.
- **F6 (MED) — actor is a display label; SESSION=null breaks the harness.** `whoami()` returns
  'Admin'/'Squadron member', not role/personId; `canEditSched()` is false with SESSION=null, so
  `sched.*=canEditSched` refuses every command in the parity run + engine tests → **breaks 728/0**.
  restore-no-reauth (§3.3) contradicts §3.5. → `Actor={id,role,personId?,session}` from SESSION
  (not the label); define an explicit headless/system actor (seed/projection/restore + harness
  under a test flag); reconcile restore auth; state the client gate is defense-in-depth, real auth
  at Step 5 sign-in.
- **F7 (MED) — commit re-entrancy via sync subscribers undefined.** `commit()` step-5 notify fires
  the sync passes, which are themselves `projection` commits → synchronous nested commit inside the
  outer's fan-out; seq/at ordering + subscriber-order + rollback-window interaction undefined. →
  Specify a **commit queue**: a commit issued while another is in phases 3-5 is enqueued and drained
  after; seq assigned at drain; forbid synchronous nested commit; test an onCommit subscriber that
  commits.
- **F8 (MED) — Tracker gesture is auto-saved AND staged; undo persists on restore.** A line/arrow
  gesture does `pushUndo(); markDirty(); saveLayout()` (auto-persist layout AND stage syllabus);
  `applyHist` calls `markDirty()+saveLayout()`. A command can't be wholly staged-or-not. → Make
  `staged` a **per-Change/per-collection** attribute (`trk.syls` held; `trk.layout`/marks/dates
  commit immediately) within one command; restore-origin follows the same per-collection rule;
  define `trk.struct.discard` (what `leaveFlowEdits`/`switchCourse` emit) + staged-undo drop.
- **F9 (MED) — persistAll carries 4 week-invariants the subscriber must inherit**: preserved
  pre-Phase-2 week written from its retained blob (never re-serialized); pristine seed never
  stored; orphan `weeks/*` deleted; loadWeek swap-window suppression. → List these as hard
  invariants of the weeks subscriber; gate rollout item 6 on `persist.test.ts`; keep persistAll for
  `weeks` until they pass against the subscriber alone.
- **F10 (MED) — reset gate clears only `inputs`,`weeks`.** Splitting `leavewar/wars` at Step 2
  leaves a returning browser on the old blob (main.tsx:55 `hadStoredWars`). → RESET becomes a
  per-version map (version → collections to clear); adopting a shape-changing collection means
  adding it to RESET + bumping together; boot test for the leavewar case.
- **F11 (LOW) — scope doesn't fit INPUTS/PLANPUCKS** (not week-scoped) or per-student Tracker undo.
  → Add scope values for inputs + planning layer; include student in the Tracker mark-entry scope
  (or state Step 3 drops the per-student filter).
- **F12 (LOW) — Tracker keys embed the course NAME** (Step 1 didn't re-key courses), so
  `Change.id` "stable id" is false for `trk.*`. → State `trk.*` uses the text key at Step 2 and
  `renCourse` is one multi-Change (delete-old + put-new) command (atomic), OR make course
  re-keying a §1 prerequisite.
- **F13 (LOW) — `remote` origin echo loop**: mapping every Change to `wb.set` (which always emits)
  would write a remote value straight back at Step 5. → Reserve a silent-apply path now
  (`wb.batch(changes,{emit:false})` or an origin check in the subscriber).

Limitations: static reading; didn't read full LW store / full sync.ts bodies / bulk of tracker
core.js; didn't verify some cited lines or the docstore/Dataverse change-feed.

---

## Host arbitration (round 1) — ALL findings accepted

The two reviews **converge** on the core defects (atomicity mechanism, logical→physical mapping,
restore auth, version-bump vs projections, publish boundary) — strong signal. On arbitration I
accept **all 24 findings** (11 Codex + 13 Fable); none is unsupported, and Fable/Codex agree the
backbone (identity → commands → undo → persistence → cleanup) is sound. Merge map (Codex↔Fable):
CMD-002/003↔F1 (atomicity), CMD-001↔F2 (fold/mapping), CMD-005↔F3 (version bump), CMD-004↔F6
(auth/actor), CMD-011↔F5 (boundary/recovery), CMD-006↔F4 (derive-from-state + histPush sites),
CMD-008/009↔F8 (staged), CMD-010 (retire-after-one-Absence, unique to Codex), CMD-007 (settings
inventory, unique to Codex); F7/F9/F10/F11/F12/F13 unique to Fable. All folded into **Rev 2** of
the design (dispositions embodied in the Rev 2 change-list at the top of the design doc). Revised
plan goes back to BOTH reviewers for round 2.

---

## Round 2 — Codex (Astra, high) REVISE (7) + Fable 5.1 (high) REVISE (9) — CONVERGED

Both: Rev 2 resolves most of round 1; residual is one coherent cluster (transaction/undo/
version interaction) + precise record-granularity + boundary precision + async Tracker + a
few fact corrections. Results: `scratchpad/rev-codex-r2/claudex-xocfc4co/` (~227s),
`scratchpad/rev-fable-r2/…/` (~322s). Plan SHA `48999480…`.

Host verification (read the code, not the reviewers): confirmed **Codex R2-005 right / Fable
F12 wrong** — Tracker COURSES are `{id,name}`, `course` is the stable id, `renCourse` is
label-only (`core.js:3743`, `courseIds.js` exists); Rev 2's delete-old/put-new claim is
reverted. Confirmed **first-publish is irreversible** (`publish.ts:180-201` "a published day
can NEVER be un-approved"; reissueReopened removed) and `SCHED.orig[di]` is the frozen
Original; live `SCHED.sign/signBind` are MUTABLE working sigs (only the copy in `als[n]` is
append-only) — so the boundary/freeze list is corrected.

### Combined round-2 findings → all accepted (with the F12 reversal), folded into Rev 3:
- **Transaction must suppress legacy side-effects + enclose causal children synchronously; only
  independent reactions queue after; revision advances on every authoritative write; undo pins
  the causal RESULT** (Codex R2-002/003/007 + Fable R2-1/R2-4). The Rev-2 commit-queue drained
  projections outside `HIST.lock` → killed redo (Fable R2-1); mid-apply `notify` let sync write
  the whiteboard before rollback (Fable R2-4); Rev-2 "don't bump on projection" caused lost
  updates (Codex R2-007). Fix in §3.2/§3.3.
- **Change granularity is per-logical-record deep-equal, NOT "by rid"** — `days/<wk>:<date>`
  (whole day incl secOrder), `sched.book/<wk>` (schedFields), `sched.mutes/<wk>` (WARNOFF),
  `plan/all`; each listed writer must yield ≥1 Change before its persistAll retires
  (Fable R2-2 / Codex CMD-006). §3.1/§5.1.
- **Publish boundary precise**: freeze `als[n]` + its sign copy + `orig[di]`; keep live
  `SCHED.sign[di]` ordinary; reopen doesn't exist; undo-of-own-unwitnessed-first-publish is the
  case to decide (SEQ-002 permits identity reuse) (Codex R2-001 / Fable R2-3). §3.4.
- **Undo permission** = permission(originating type) for every inverse change vs the CURRENT
  actor + ownership; system actor never for user restore (Fable R2-5). §3.5.
- **Async Tracker**: reducer is synchronous mutation only, saves in the subscriber, async
  prompts/reads outside commit, await-interleaved chains become command sequences (Codex R2-004
  / Fable R2-7). §3.2/§5.4.
- **Staging by purpose** not just collection: only interactive unsaved chart edits stage;
  Save/dup/add/import/revert/delete commit immediately (Codex R2-006). §3.8.
- **Public API** exports only `commit(cmd)`; internal `commitAs` for sync/seed/restore; document
  `main`→`member` role mapping (Fable R2-6). §3.2/§3.5.
- **Perf**: snapshot/diff only the touched blob; reuse the phase-2 string as the interim
  histPush snapshot (serialize once) (Fable R2-9). §3.2/§5.1.
- **Fact fixes**: setFont auto-persists; switchCourse has a confirm (Fable R2-8). §2.4.

Back to both reviewers for round 3 on Rev 3.
