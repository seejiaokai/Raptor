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
