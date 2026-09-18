# Step 3 (global undo) — plan-review log

Append-only transcript of the cross-provider red-team of
`2026-09-17-arch-stack-3-global-undo-design.md`.

## Setup
- **Task:** ARCH-STACK Step 3 — one global undo. DESIGN review only (no build).
- **Host / coordinator:** Claude (Opus 4.8), this session.
- **Reviewers (both, per owner standing rule "red-team important plans across BOTH
  Claude and Codex"):**
  - Codex / GPT-6 Astra (high) — via the claudex-loop runner (`review`, host=claude).
  - Fable 5.1 (high) — parallel in-session reviewer (a Claude-family model, so outside
    the Codex runner).
- **Scope:** the design doc above. Focus: CRUX-1 (§3.4 reconciler suppression on
  restore-origin undo), CRUX-2 (§6 publish-boundary id-reuse), conflict detection
  (§4, SEQ-003), authorization (§5, finding C), the dormant-stack hazard (§9 Q6),
  and whether the design actually dissolves bug family A/C/D/E/F/I at the root.
- **Authorization:** design + red-team only (owner, 17 Sep 26). No build, no branch,
  no merge. Round limit: 5.
- **Model note:** requested Astra=gpt-6-astra/high and Fable=claude-fable-5-1/high;
  observed model identity recorded per round below.

---

## Round 1 — launched
(both reviews launched in parallel; results appended below on completion)

### Round 1 — Codex / GPT-6 Astra — VERDICT: REVISE
- Runner artifact: `C:\Users\User\AppData\Local\Temp\claudex-8_dg8rdy` (result.json).
  CLI codex-cli 0.154.0; plan SHA256 e336262afe6f23a608d08bf91d06b49f64d1f0a7deacfca2f12dcabd1b449ab3;
  checkout 477afd3. Static review, no build. (Console pretty-print hit a Windows charmap
  error on a Unicode arrow; the structured result.json is intact — findings below.)
- **Summary:** the plan depends on stream completeness, authorization and navigation
  guarantees the SHIPPED code does not provide → partial reversals, unauthorized undo,
  lost redo, unrecoverable Tracker edits.

| id | sev | the gap (my §) | disposition |
|---|---|---|---|
| GU-001 | high | CRUX-1 false for LW: the causal both-side envelope does NOT exist — `store.ts:1100-1109` bypasses commit/enlist for locked+nested writes; the LW causal join was DEFERRED at Step 2. `retractLwRow` inside the input command is absent from that envelope, so suppressing reconciliation on the inverse restores the input WITHOUT the bid. And sync checks `SYNCING`, not `HIST.lock` — my §3.4a suppression seam is wrong. | ACCEPT — the make-or-break. Complete causal enlistment + correct projection origins + a real suppression seam become PREREQUISITES to LW cutover (this is Step-2 completion work, not assumable). |
| GU-002 | high | §5 authz insufficient: every LW op emits one permissive `lw.edit` type (`anyone`); the admin-decision check lives in `setBidState`, which a direct inverse bypasses. Scheduler/people/settings also `anyone`. | ACCEPT — reversal needs operation-specific policies + retained auth context, not `permission(originating type)` over today's placeholder types. |
| GU-003 | high | §2/finding-I over-claim: the stream captures only the loaded CURWEEK (`sched-commit.ts:75-113`); unloaded weeks are in weekstash; `clearHistoryData` drops them outside the txn. DU-004 is NOT "already solved by Step 2"; off-week delete is currently REFUSED. | ACCEPT — correct the claim; either enlist unloaded-week records (incl. stash deletion) in the txn/revision system, or keep the refusal until that exists. |
| GU-004 | high | §Tracker atomicity: one gesture ≠ one envelope. `popGrade` saves the mark then separately advances Last-Flown (`flownOn`) → TWO entries; one Undo reverses only Last-Flown. | ACCEPT — group each Tracker gesture's synchronous model changes into one transaction; audit add/delete/import. (Step-2 completion for Tracker.) |
| GU-005 | high | §Tracker structural history: unsaved structural edits (deleteEvents changes SYL+prereqs, saves only layout) are undoable TODAY but never hit the stream. Making the structural history dormant LOSES undo coverage. | ACCEPT — define an undoable draft representation for Tracker structure routed to the timeline; do NOT retire structural history until covered. |
| GU-007 | high | §3.3 effect contract too glib: `commit()` releases reducer-requested effects, not automatic persist/repaint of arbitrary writes. Tracker's store restores only `mem` while the UI reads marks/dates/SYL and `sGet` reads storage first → restoring the recorded value alone can leave the display stale and reload the old persisted value. | ACCEPT — specify per-store inverse ADAPTERS that rebuild live state + derived indexes + baselines, then persist+notify after validation; handle async Tracker ordering/failure. |
| GU-006 | med | §8 snap not record-free: `selectWar`/`switchSyllabus`/`loadWeek` all write emitted records / mutate acceptance → a snap creates a new user envelope → truncates redo. | ACCEPT — provide navigation paths that create no user entry / no redo-truncation; order nav after auth+conflict so a refused undo can't mutate via its snap. |
| GU-008 | med | §6 boundary stale: `crossable` is a creation-time snapshot; `discloseIssued` updates only a Set. Undo after acknowledgement still sees `crossable=true` → would delete a registered artefact + permit id reuse. | ACCEPT — resolve registration LIVE by `boundary.ids` at reversal time (or via a registration event on the timeline), not off the saved envelope. |
| GU-009 | med | §9-Q6 confirmed: route every undo/redo entry point (shortcuts, exported handlers) through ONE dispatcher; gate legacy execution for adopted modules; treat fallback activation as an explicit rebaseline. | ACCEPT — the dormant-stack hazard is real; single dispatcher + explicit per-phase gating. |

**Coordinator read:** the strong through-line is that Step 3's clean form has **Step-2-completion prerequisites** the design wrongly assumed done (LW causal join + suppression seam, one-envelope-per-Tracker-gesture, off-week capture, per-store effect adapters). The design must (a) drop every "already delivered by Step 2" over-claim, (b) add an explicit **prerequisites / finish-Step-2-per-module** phase gating each module's cutover, (c) rebuild authorization on operation-specific reversal policies, (d) resolve the boundary live, (e) add the single dispatcher + real gating. Holding revision until Fable lands to fold both.

### Round 1 — Fable 5.1 (high, in-session subagent) — VERDICT: REVISE
Full report preserved in the session task transcript (Fable subagent `a5b0766b…`). Deep
static read with exact file:line evidence and step-by-step fix specs. 4 high, 4 medium, 2 low.
**Strong convergence with Codex** — same core story, more mechanism detail.

| id | sev | finding | maps to Codex |
|---|---|---|---|
| F1 | high | **CRUX-1 premise is FALSE.** The forward envelope does NOT carry both sides. LW sync writers run `locked()` → `HIST.lock` → `rawPersist()` and advance `LW_BASELINE` → the LW change is **absorbed, never in any envelope** (`leavewar/state/store.ts:1015-31,1100-04`); the causal join + projection-origin were **explicitly deferred** at Step 2. The Raptor-side reconciler write is raised from a phase-8 notify callback → a **separate `user` envelope with `causedBy` undefined** (`deliveringSeq` only set at phase 9). **No `projection`-origin commit exists anywhere** (grep). So a restore-inverse restores one side; the other is re-derived exactly as today (finding D verbatim, fresh iid). Fix: `causalSeq` set after finalize so phase-8 subscriber commits chain `causedBy`; `commitInputsAs`/`commitSchedAs` with `{system, projection}` for the reconcilers; route LW `persist()`'s locked/committing branch through `cmdCommitAs(projection)`; timeline entry = **causal closure** (projection children never separate entries, never truncate redo). | GU-001 |
| F2 | high | Mechanism (a) "suppress via SYNCING token" is **not a guarantee** — `SYNCING` is a private module flag, not registered with the latch; reconcilers are state-driven off legacy notify, so suppressing one pass only defers re-derivation one turn. AND **finding A is a FORWARD bug** (war-side delete → demote → re-land raptor-owned) that involves no undo — a record-level inverse can't dissolve it. Fix: idempotence of the restored **closure** is the guarantee, (a) is an optimisation only; carry the forward fix (war-delete of an empty-cell lw-tagged row **splices**, not demotes) or explicitly DROP A from the "dissolved" table. | GU-001 |
| F3 | high | §5 authz can't work with shipped code: **every** permission is `anyone`; LW has **one** command type `lw.edit` for approve/bid/move/stage; envelope carries no `meta`; `Actor.personId=ME` is view-as, not owner. So `permission(E.type)` permits a member undoing an admin decision. Fix: a Step-3 `mayReverse(E,cur)` predicate with ownership derived **from the record** per collection (lw.cell/bid→pid, inputs→value.person, days/sched/people/settings→admin-only); store `E.actor`+derived owners on the entry; identical for redo; split `lw.edit` into typed commands is a later layer. | GU-002 |
| F4 | high | **Q6 is real & live, not theoretical.** The "dormant" stacks are reachable undo systems over the same records during phases 1–4: LW `lwUndo`→`historyApply`→raw (no envelope/rev, baseline absorbed); Tracker legacy `doUndo`→`saveLayout`→`cmdCommit` **emits a `user` envelope** → becomes a timeline entry; scheduler `undo()`→`histRestore`→`SCHED_RESYNC` out-of-band. Global-undo-over-a-legacy-undo → conflict check passes on stale revs → corruption. Fix: "dormant"=**unreachable** — rewire every entry point (buttons, Ctrl+Z handlers, probe bridge) at each module's cutover; `eligibleModules` grown per phase so two systems never drive one module's records; any surviving legacy path must go through `commitAs(restore, system)`. | GU-009 |
| F5 | med | CRUX-2: boundary read from the **frozen** envelope (`crossable` sealed at publish time) → after registration, undo reads stale `true` → silent reverse of a registered publish. Also `sched.als/<wk>:<n>` keyed by **array index**, not the AL's stable `id` (violates Step 1) → delete-by-inverse of a non-last AL shifts later ALs onto its id. Registered-side partial inverse unspecified. Fix: evaluate `E.boundary.ids.some(issuedDisclosed)` **live at undo time**; re-key `sched.als/<id>`; registered-side undo = inverse minus `sched.als`/`sched.orig` changes + a history line; AL1-under-AL2 = conflict via `sched.book` (sound, state it). | GU-008 |
| F6 | med | §2 row I false: `decompose()` reads only loaded `CURWEEK`; stashed weeks (`engine/weekstash.ts`) never enter an envelope. Fix: register the stash as an `EnlistableStore` and enlist it in stash writers, or move row I to Step 4/5 — don't leave the claim. | GU-003 |
| F7 | med | `inputs.acc` is per-loaded-week state on a global record; snap-loads the target week then restores a stale `acc` → false landing; also trips the "exact before" invariant on every cross-week undo. Fix: strip `acc` as a projection field from the inverse; re-run landing reconcile inside the restore; long-term move `acc` onto the day. | GU-006 |
| F8 | med | Missing machinery the design assumes: `EnlistableStore` has **no per-record `write()`** seam (only capture/restore/records); the global conflict checker is stateless with no access to expected revs. Fix: add `write(entry)` per store; put `expectedRevs` on the restore command + a scoped per-commit checker (phase 5) so the conflict check is inside the transaction. | GU-007 |
| F9 | low | `sched.book/<wk>` is a week-wide hot record (holds `pending` marks) → under refuse-whole, non-linear scheduler undo is almost always refused. Not corruption; state it so Q1 is decided on true info. | — |
| F10 | low | Legacy `HIST` receives a restore commit as a forward step (phase-8 releases `histPush`) → its redo tail diverges the moment the timeline is used. Harmless IF F4's unreachable rule holds; don't call it behaviour-identical. | GU-007 |

**Both verdicts REVISE, converged.** The reshaped truth: **the command layer (Step 2) is only genuinely finished for the scheduler.** For Leave War and Tracker the causal join, projection origins, one-envelope-per-gesture and a per-record write seam were deferred or never built — these are **Step-2-completion prerequisites** that must land before undo can cut those modules over. Global-undo design is otherwise directionally right (inverse-patch over the stream, causal-closure entries, live boundary, record-derived reversal auth, dormant=unreachable).

### Round-1 disposition (coordinator)
Accept essentially all findings (F1–F8 / GU-001–009). Two arbitration notes: (1) finding A —
take Fable F2's forward-fix-or-drop; recommend **carry the forward splice fix** since it's the
root of the most-reported bug. (2) The prerequisites are large enough to be their **own gated
step** ("finish the command layer for LW + Tracker") rather than a Phase 0 buried in the undo
build — surfacing to the owner as a sequencing choice before writing Rev 2.

---

## Round 2 — Rev 2 reviewed (18 Sep 26) — BOTH REVISE, converged again

Rev 2 (rebuilt on the now-live `[CMDL-FINISH]` foundation) sent to both providers. Plan SHA256
`d8fda1391935e27423f2a528c1aaa180f4b01e1d2dc4892bdcf1581953eb80ca`; repo HEAD `8c3e91d`.

### Round 2 — Codex / GPT-6 Astra (high) — VERDICT: REVISE
Runner result `C:\Users\User\AppData\Local\Temp\claudex-ogt9skmr`; codex-cli 0.154.0; session
`01a0b21b-…`; 268 s. 7 high, 3 medium. Static, read-only against HEAD.

| id | sev | gap | fix |
|---|---|---|---|
| GU2-001 | high | §3.4 suppression doesn't stop reconciliation: the registered contexts restore only sched/LW `HIST.lock`; `runOutbound`/`runInbound` gate on the private `SYNCING` flag (`sync.ts:248,526`); locked persistNotify keeps notifying/projecting. | Explicit restore-suppression context the sync subscribers consult, held through apply+deferred notify+drain; keep the fixpoint check. |
| GU2-002 | high | §5 table permits the promised-refused admin-decision reversal: `setBidState` changes only the person's `lw.bid` (`store.ts:2147-2166`), classified owned-by-person → admin→view-as-member→undo passes. | Capture reversal authority separately from subject ownership; admin decision transitions admin-only; enforce for undo AND redo. |
| GU2-003 | high | §4 pinned forward revs + exact-equality can't do sequential undo: `finalize` bumps revs for restore too; undo B then undo A expects the stale pre-B rev → fails; redo fails. No rebasing algorithm. | Separate current expectations for undo/redo, updated from successful restore envelopes; rebase predecessor expectations; keep rejecting independent intervening writes. |
| GU2-004 | high | §11 `acc` is not fully derived: `acceptInput` writes `acc='u'`, `unacceptInput` `acc='r'` as authored decisions (`slots.ts:367,533`); stripping loses dormancy/filing. | Preserve authored `r`/`u` in inverse+forward; recompute only derived landing. |
| GU2-005 | high | §6 skipping issued records while restoring `sched.book` breaks recovery: inverse sets dayOK false but keeps `sched.orig`; `dayApproved` reads only dayOK (`publish.ts:120`) → next publish overwrites `orig[di]` with same `iso#0` (`:184-200`); `commitPublish` sees no new id. | Withdrawn-publication state distinct from never-published; update eligibility + id allocation for new-id recovery; specify redo; enforce registered-record immutability at the gate. |
| GU2-006 | high | Module-by-module cutover doesn't isolate shared records: scheduler/input commands retract LW cells via `retractLwRow` (`inputedit.tsx:1225`), so their inverse restores LW records, yet LW snapshot undo stays reachable until phase 5 and `historyApply` overwrites off-stream w/o rev bump. `eligibleModules` can't prevent the overlap. | Cut over all modules sharing a causal write set together, OR forbid global reversal of cross-boundary closures until every participating legacy restore path is disabled; define authority over records/closures, not just initiating module. |
| GU2-007 | med | Root scope doesn't identify every replay context: inputs commands carry `{module:'inputs'}` only (`sched-commit.ts:285`) though deleting an accepted input changes days in week A; after nav to week B the snap has no week and `schedWriteRecords` refuses foreign `days/A`. | Record/derive all affected storage contexts from the closure; transactional multi-week load/restore or explicit whole-operation refusal. |
| GU2-008 | med | `weekstashStore` has no `write()` (`store.ts:199-208`); `clearHistoryData` enlists it and deletes stashed weeks in a real user command (`inputedit.tsx:1330`) → a captured closure can't be applied by the write-only restore. | Add a batch weekstash write adapter (routing, auth, deferred persist, preserved-week metadata); until then explicitly refuse such closures before any mutation. |
| GU2-009 | high | Direct replay aliases timeline images into live state: scheduler/`peopleStore.write` assign `e.value` directly into DAYS/INPUTS/SCHED/PEOPLE (`sched-commit.ts:135-205`, `people-settings-commit.ts:170-175`); LW clones, they don't → redo installs `E.forward`'s object, a later in-place edit mutates the recorded image. | Deep-clone between immutable timeline data and every mutable store write (centrally in replay or per adapter); test interleaved undo/redo + in-place edits. |
| GU2-010 | med | `inputs/__order` (iid array, `sched-commit.ts:111-123`) has no `value.person` → the per-change ownership rule denies a member undo of their own input create/delete. | Separate policy for structural metadata (`inputs/__order`) tied to the authorized affected input records; keep ordering-conflict checks. |

### Round 2 — Fable 5.1 (high, in-session subagent) — VERDICT: REVISE
Full report preserved in the session transcript. **Confirmed every `[CMDL-FINISH]` foundation
claim TRUE in code** (causal join, `write()` on all five stores, phase-5 `expectedRevs` checker,
stable `sched.als`, live `issuedDisclosed`). 3 high + 11 med/low, with exact fix specs. Strong
convergence with Codex.

| id | sev | finding | maps to Codex |
|---|---|---|---|
| R2-01 | high | §4 conflict model refuses **every redo** and **every second consecutive undo**: `finalize` bumps revs for all origins incl `restore` (`commit.ts:269-275`), `checkExpectedRevs` demands exact equality. Fix: timeline keeps its OWN `expected: Map<recordKey,rev>` updated on each recorded entry + each issued restore/nav; undo/redo use it (catches only out-of-band advances); non-linearity is a SEPARATE timeline rule (key-sharing), not a rev rule; property test N edits→N undos→N redos. | GU2-003 |
| R2-02 | high | §3.4(a) names a seam that does not gate the reconcilers: `runOutbound/runInbound/...` gate on module-private `SYNCING` (`sync.ts:70,248,526`), never registered; re-installing `HIST.lock`/`lw.hist` suppresses only legacy step-push (that's F10). **Fixpoint (b) HOLDS** (hand-traced 4 scenarios, both lane orders). Fix: rewrite §3.4 — (a) is "re-install locks so no legacy step is pushed", NOT reconciler suppression; do NOT add a SYNCING context (would hide a non-fixpoint and chain drift to the wrong later cause); make the guarantee OBSERVABLE — after every restore assert no `projection` envelope has `causedBy===restore.seq`. | GU2-001 |
| R2-03 | high | §5 table lets the bidder reverse the admin's decision: approve writes `lw.bid` owned by pid + mints `inputs/<iid>` `value.person=pid` (`store.ts:2147`, `sync.ts:338`) → member may undo the approval. Fix: `mayReverse(E,cur)=cur.role==='admin' || (E.actor.role!=='admin' && cur.personId!=null && every change owner===cur.personId)` — the forward ACTOR's role makes an admin action admin-only whatever record it lands on; `people/<id>` owner=id; redo identical. | GU2-002 |
| R2-04 | med | §6 registered-side under-specified on `sched.book` + the "history line" has no durable home (edit log is session-only). Fix: skip `als`/`orig` AND leave `cv/ok/al` in `sched.book` (issued face frozen); reverse `days`+marks+signatures (canonical `dayDelta` becomes the next AL's pending diff); add a DURABLE `wd:{[verId]:{at,by,restoreSeq}}` book field wired into `schedFields`/`weekStashSnap`/decompose/applyBook + AL panel; `cur[di]` stays at AL1, next publish = AL2. | GU2-005 |
| R2-05 | med | §10.1 as written re-enters reconcilers INLINE (`setPeople`→bare `notify`→`reprojectRoster`+`lwSyncTurn`, nothing suppresses). Fix: do it inside `lwStore.write()` as a pure `layRoster(people,postOuts,personEdits)` when an entry is `lw.postouts`/`lw.config`; the deferred boundary notify finds the signature unchanged; remove the CMDLF-002 marker; test incl the legit poArchive re-archive edge. | — (folds CMDLF-002) |
| R2-06 | med | §11 "strip acc" erases authored `r`/`u`; inputs closures have no `weekId`. Fix: strip acc only when `==='g'` (mirror `store.ts:567` incl `inputProtected`); run `relandInputs()` inside the restore; add `weekId:CURWEEK` to `inputsScope`. | GU2-004, GU2-007 |
| R2-07 | med | §10.2 staging hand-wavy (causedBy can't cross an await; loadCourse writes). Fix: 3 phases — A async zero-writes returns the full `{key→value\|delete}` set; B one `trkGesture` applies via `sSet`/`delKey`; C write-free `trkReloadGlobalsFromMem`+`trkReloadCurrentFromMem`. One `user` envelope per import. | (folds importClick) |
| R2-08 | med | §7 contradicts §9/§13 on LW in phase 3a; LW legacy undo persists off-stream + wakes an orphan `inputs.batch` projection. Fix: LW `user` envelopes recorded but NOT eligible until phase 5; dispatcher skips; key-sharing rule protects shared records; state the orphan-projection = safe refusal. | GU2-006 |
| R2-09 | med | §8 order can't hold (loadWeek must precede the reducer; phase-5 runs after). Fix: stateless pre-check (`revisionOf` vs `expected`) BEFORE the snap, in-txn `expectedRevs` as the atomic net; on in-txn refusal view moved but data untouched (optionally loadWeek back). | GU2-007 |
| R2-10 | med | Navigation becomes an entry: `lw.current/all` emitted as a record → `selectWar` makes a `lw.edit` user envelope; same for Tracker `plan.sylId`. Fix: entry filter excludes changes all-in `{lw.current}` / trk.plan-sylId-only (+ no redo truncation); better, stop emitting `lw.current` as a record (view-pref). | — |
| R2-11 | low | `commitAs` has no `causedBy` param; a user-actor restore needs its type registered. Fix: add `causedBy?` to `commitAs` opts; `definePermission('undo.restore',anyone)`, `mayReverse` is the real gate. | — |
| R2-12 | low | §9 entry-point set incomplete: add probe-bridge `w.histApply`/`w.histPush` and the Tracker keyboard handler (`App.jsx:99`); scheduler has no Ctrl+Z. | GU-009 |
| R2-13 | low | Closure derivation must be transitive (`causalSeq`=each pipeline's own seq): entry = user envelope ∪ all reachable by `causedBy` upward; orphans never folded; fold lazily (children drained inside the same outer commit). | — |
| R2-14 | low | A closure can change one record twice; never coalesce per record — apply the inverse list as-is. | — |

### Round-2 disposition (coordinator) → Rev 3
Accept ALL. Convergence is total on the three highs (GU2-001/R2-02 suppression; GU2-002/R2-03
auth; GU2-003/R2-01 revision model). Arbitration where the two differ:
- **Suppression (GU2-001 vs R2-02):** take **Fable's** answer over Codex's. Codex would add a
  real SYNCING suppression context; Fable shows that suppressing would HIDE a non-fixpoint and
  chain drift to a later wrong cause, and hand-verified the reconcilers already reach a fixpoint.
  Rev 3 keeps the locks for legacy-step-push only, lets the reconcilers run, and makes the
  fixpoint OBSERVABLE (assert no `projection` caused by the restore seq). Keep the (b) property test.
- **Cutover (GU2-006 vs R2-08):** take the union — LW `user` envelopes recorded-but-not-eligible
  until phase 5 (Fable), AND eligibility computed from the closure's full record-set not the
  initiating module (Codex), AND LW legacy restore paths made UNREACHABLE at/before scheduler
  cutover because scheduler input-deletes already carry LW records (Codex). §7/§13 reworked.
- Everything else folds directly with the reviewers' fix specs. A few are small FOUNDATION
  additions (weekstash `write()` GU2-008; scheduler/people clone-on-write GU2-009; `commitAs`
  `causedBy` R2-11; `lw.current` demoted to a raw view-pref R2-10; the durable `wd` book field
  R2-04) — folded into build phase 1, not a new CMDL-FINISH-sized step.
Rev 3 written next; re-review both providers (Codex `--resume`, Fable fresh).

---

## Round 3 — Rev 3 reviewed (18 Sep 26) — BOTH REVISE, converged; engine hand-validated

Rev 3 sent to both. Plan SHA256 `d8fda…`→Rev3 HEAD `f1b6606`. **Fable independently hand-executed
the core engine and it PASSES:** the N=3 edits→3 undos→3 redos walk on one week (all 9 steps pass
the conflict check) and the reconciler-fixpoint traces for the 4 load-bearing sync scenarios on both
lane orders. So the engine is sound; the findings are contained rule-statements + the publish path.

### Round 3 — Codex / GPT-6 Astra (high) — REVISE (7 high, 3 med). Runner `claudex-b7191vuk`
(exit-1 was the known Windows charmap print glitch; `result.json` intact, status completed).
GU3-001 expectation-map forgets out-of-band barriers · GU3-002 publish inverse has no content delta
so AL2 recovery can't fire · GU3-003 undoing a preceding edit rewinds the issued face · GU3-004
zero-projection invariant vs permitted derived writes (OIL) + the §10.1 contradiction · GU3-005
reland after the scheduler baseline finalizes → stale envelope · GU3-006 member can't undo own input
(auto-lands admin-only `days`/`sched.book`) · GU3-007 LW eligibility gap phases 2–4 · GU3-008 import
migration flags excluded from the reversible set · GU3-009 import doesn't reload the course
catalogue. Explicitly ACCEPTED as closed: actor-role gating, authored r/u, clone-on-write, context
capture, weekstash adapter.

### Round 3 — Fable 5.1 (high, in-session) — REVISE (2 high build-blockers as rule-statements, rest med/low)
R3-01 (=GU3-003) frozen-face keyed on the entry not the record → GU2-005 returns one undo later ·
R3-03 (=GU3-006) `days`/`sched.*`/`trk.*` admin-only breaks a member's own-input/own-mark undo ·
R3-02 (=GU3-004) the "no projection ever" invariant is over-strong and self-contradicts §10.1 ·
R3-04 (=GU3-007) §7/§13 disagree on LW eligibility · R3-05 weekstash key-family / out-of-band ·
R3-06 redo pick order undefined · R3-07 `layRoster` drops non-`postOuts` windows · R3-08 inputs
delete owner from `before` · R3-09 `lw.current` live registration is `cls:'record'`. Closed all
R2-01..14 with code evidence. **"Fix R3-01/R3-03 as rule statements, reconcile §3.4(b)/§10.1 and
§7/§13, add the weekstash key-family + redo pick rule — then Rev 4 is build-ready without a further
design round."**

### Round-3 disposition (coordinator) → Rev 4
Accept all. Arbitration: take Codex's GU3-001 barrier model (sticky per-record barrier when a
pre-entry rev ≠ the timeline expectation) — Fable's walk didn't exercise the orphan-then-tracked-edit
sequence. Take Fable's R3-03 predicate (`E.actor.personId===cur.personId` + no-owner coarse classes).
**MAJOR:** owner reframed the publish path (18 Sep) — undo-of-publish = explicit **UNPUBLISH**;
quiet-correct republishes as the **same version LABEL** (id-reuse rule set aside; snapshots immutable
+ history line); a real amendment is the separate working-copy→AL act; **Unpublish button** on the
day header; **undo bubble** added. This DISSOLVES GU3-002 (no AL2 recovery) and GU3-003/R3-01 (undo
never reaches behind a publish; you unpublish). Rev 4 folds everything + the reframe; **final dual
re-review of Rev 4 next** (owner asked for both providers given the size of the change).

---

## Round 4 — Rev 4 reviewed (18 Sep 26) — BOTH REVISE, CONVERGED; engine ACCEPTED, all findings on §6

Both accepted the engine (§3–§5, §8–§11) outright — every new finding is on the just-introduced
UNPUBLISH reframe (§6). Fable: "once these rule-statements are made, Rev 5 is build-ready without a
further design round."

### Round 4 — Codex / GPT-6 Astra (high) — REVISE (4 high, 3 med). Runner `claudex-fe21sgne`
GU4-001 undo-dispatches-the-forward-unpublish never marks the publish undone (button ping-pongs) ·
GU4-002 reused-label model has no issuance identity — `als`/`orig` resolvers key by verId and
pick/collapse the wrong record · GU4-003 correction history in the reversible book is erased by
undoing the unpublish · GU4-004 `layRoster` preserves the window that undoing a first posting-out must
remove · GU4-005 barriers only on tracked entries; nav/restore overwrite expected without a barrier ·
GU4-006 "undo can't reach behind a publish" relies on write-key overlap a second same-area edit need
not have · GU4-007 correction-log wiring omits hydration/rollback.

### Round 4 — Fable 5.1 (high, in-session) — REVISE (2 high + full specs). Code-verified every claim.
R4-01(=GU4-002) append-only `sched.retired` collection as the immutable issuance identity + log; drop
`wd`. R4-02(=GU4-001) undo of a publish = its ORDINARY INVERSE (marked undone) via `retireIssued`; a
`logged` retired entry is append-only. R4-03 quiet-vs-amendment choice is by ACTION at the start.
R4-04 full `sched.unpublish` reducer spec. R4-05 unpublish withdraws that day's OIL credits
(squadron-visible). R4-06 explicit publication refusal, not write-key-based. R4-07 stale text. R4-08
`Boundary.kind` `'unpublish'`. R4-09 member-vs-member identity weak at Step 3.

### Round-4 disposition (coordinator) → Rev 5
Accept all; the providers converge (GU4-002=R4-01, GU4-001=R4-02, GU4-006=R4-06). Rev 5 folds Fable's
specs (the `sched.retired` collection, `retireIssued`, the §6.5 reducer, the day-keyed publication
barrier, barrier-on-nav) + Codex's GU4-007 full-codec wiring + the OIL side effect flagged to the
owner (default: warn if the day has credits bid against). Engine untouched, twice hand-verified.
**Final dual re-review of Rev 5 next** (Codex `--resume`, Fable fresh).

---

## Round 5 — Rev 5 reviewed (18 Sep 26) — Fable APPROVE, Codex REVISE (contained); DESIGN CLOSED at Rev 6

**Fable 5.1 (high): APPROVE — build-ready for phases 1–4, no further design round.** Every code fact
Rev 5 leans on re-confirmed; clean fold-check of all R4-01..09. Two must-state rule-statements
(R5-01 the postout seam, before phase 5; R5-02 the derived barrier, phase 1) + during-build wiring
(R5-03 codec: `resetSched`/`LogicalCollection`/`LOGICAL_TO_BLOB`/`registerRecord`/`SchedFields`
type/`SCHEMA` test; R5-08 di-derivation; R5-09 `armDrop`+`prunePreviews` on the restore reducer;
R5-10 retired-append wording) + doc cleanup (R5-04 stale text; R5-06/07 wording; R5-05 Step-5
disclosure note). Verdict wording: "proceed to build; no re-review of the design is needed; the
post-build cross-provider code inspection stands."

**Codex / GPT-6 Astra (high): REVISE** (runner `claudex-kuwwqgac`, exit 0). GU5-001 a correction that
nets to an empty delta can't reissue (`publishALDay` refuses) · GU5-002 `pubBar[di]` not week-unique
(di is a loaded-week index) · GU5-003 unpublishing an AL clears the barrier though the Original stays
published · GU5-004 disclosure keyed by the reused label id → a corrected reissue is auto-disclosed ·
GU5-005 §6.2 restoring sign-offs contradicts the clear-on-unpublish guardrail · GU5-006 the postout
fix names a non-existent LW people record (= Fable R5-01).

**Round-5 disposition (coordinator) → Rev 6 (DESIGN CLOSED).** Codex's 6 findings map cleanly:
GU5-006 = Fable R5-01 (postout provenance marker); GU5-002/003 subsumed by Fable R5-02 (DERIVE the
barrier keyed `weekId#di` from boundary entries — a surviving Original keeps the barrier, undo/redo
need no bookkeeping); GU5-004 = Fable R5-05 (disclosure keyed by `id~n`, no live effect at Step 3);
GU5-001 (a `SCHED.correcting[di]` flag permits an empty-delta reissue; ordinary amendments stay
delta-gated); GU5-005 (resolve toward the guardrail — undo-of-publish CLEARS sign-offs like the
button; owner already ruled unpublish clears sign-offs, and undo-of-publish IS an unpublish). All
folded into Rev 6 §6.1/6.2/6.3/10.1. **No engine finding in round 5.** Fable's APPROVE + coordinator
arbitration of Codex's contained items = design CLOSED; remaining during-build doc items tracked in
design §15. **Next: BUILD (Opus, high, test-first), phase by phase; standing post-build dual CODE
inspection; no merge without "merge live".** Handoff to a fresh build chat prepared (owner's rule:
big new task → fresh chat).
