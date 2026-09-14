# [ARCH-STACK] Step 2 command-layer — red-team review log (14 Sep 26)

Three-engine red-team of `2026-09-14-arch-stack-2-command-layer-spec.md` Rev 1.
- **Claude (Opus 4.8)** — author self-critique (C1..C10).
- **Fable 5.1 (high)** — independent adversarial review (F-01..F-18). Verdict **REVISE**, backbone sound.
- **Codex / GPT-6 Astra (high)** — independent plan review via claudex-loop runner (CMD-001..CMD-012).
  Verdict **REVISE**, backbone sound. (Runner flagged result.json `Invalid limitations list` — a
  trailing "" in the limitations array; review content valid, recovered from reply.txt. See
  observation #35.) Plan SHA256 at review: `e3ccd0a1…897e00e3`; codex-cli 0.154.0; repo @ af3190d.

Both reviewers independently converged on the same core defects — strong signal. Rev 2 folds all
warranted findings. Dispositions below (✓ = folded into Rev 2; ↦ = deferred with a home).

## Verified factual corrections to Rev 1 (both reviewers)
- **[AMEND] Phase 6 (durable txn + `raptor:writer` lease) does NOT exist** on the amend branch or
  main. Rev 1's DECISION 1 premise was false. → Rev 2 DECISION 1 corrected to option (d): build the
  durable-write guarantee once, HERE (increment 1). (F-12; CMD-005/CMD-012 implied.)
- **`HOOKS.whoami()` returns an account label** ("Admin"/"Squadron member"), not a person id. →
  `principal` from session identity; whoami is a display bridge. (CMD-003; F-05.)
- **`gman` is amendment-visible** (feeds `canonicalDiff` ORDER axis); only `secOrder` is workspace-only.
- **Tracker migration read-back verifies the whiteboard, not the backend** — not a durability proof.
- **Leave War persists in production** (whiteboard adapter) — CLAUDE.md line stale ([SYNC-INTEG] P7).

## Convergence + dispositions (top findings)
| Theme | Fable | Codex | Disposition in Rev 2 |
|---|---|---|---|
| Freeze issued SNAPSHOT only, not the published day (blocker) | F-01 | CMD-004 | ✓ §2.4 step 4 frozen = record class; live day mutable; §3(c) |
| Record identity / shared rids / ORDER axis unrepresentable | F-02,F-03 | CMD-006 | ✓ §2.1 record catalogue: `(week,container,rid)`, parents carry `children:rid[]`, issued/drafts are blobs |
| Authorization too coarse; per-collection policy needed | F-05 | CMD-001 | ✓ §2.4 step 1 policy over (principal, role, before/after, ctx) |
| origin must not grant authority; privileged producers bound | F-04 | CMD-002 | ✓ §2.3 origin = provenance; separate bound entry points |
| Derived writes must run INSIDE the causal transaction | F-04 | CMD-008 | ✓ §2.4 step 2 derivation hooks; atomic |
| Durability: eventual vs confirmed; announce only after on-disk | F-07 | CMD-005 | ✓ §2.3 durability; §2.4 step 8 |
| Multi-key durable atomicity → write-ahead journal | F-08 | CMD-005 | ✓ §2.4 step 8, §4 |
| Delete → versioned tombstone (absence≠v0) | F-09 | CMD-010 | ✓ §2.2 logical delete; §3(a) |
| Inverse table explicit; reversal uses result version | F-06 | CMD-009 | ✓ §2.2, §5 |
| Undo publish barrier (per-day) | F-06 | CMD-007 | ✓ §5 |
| Existing undo button must route through commit in migration | F-13 | CMD-007 | ✓ §5 interim history bridge; §7 inc.2 |
| Not all LW sync writers are recomputable; withdrawal is causal | F-15 | CMD-008 | ✓ §6 defer LW undo conversion to step 4; withdrawal in causal txn |
| Remote apply is a separate pipeline; projections react to remote | F-10 | CMD-011 | ✓ §6 |
| whoami is a label, not a person id | (whoami) | CMD-003 | ✓ §2.3 principal |
| "no orphaned ref" HARD would block deletes → on-create only | F-09 | CMD-010 | ✓ §3(a) |
| Publication-transition validators on CREATING an issued record | F-01 | CMD-012 | ✓ §2.4 step 5 |
| Perf: no whole-world diff on hot path; stamps off domain objects | F-13 | — | ✓ §2.4 step 7, §7, §10 |
| Batch/quiet/coalesce/no-op semantics | F-16, C1 | — | ✓ §2.3 batch()/coalesce/no-op |
| View-only state not commands; durability a collection property | F-10, C4 | — | ✓ §2.6 |
| LW LeaveBid = whole tuple, one record | F-14 | — | ✓ §2.1 |
| Tracker SYL deferred-save shape | F-17, C3 | — | ↦ §9 DECISION 4 (increment 2c, owner sub-decision) |
| [AMEND] Phase 5 migrates reset-not-migrate demo data | F-12 | — | ↦ §9 HEADS-UP (not step-2 scope) |
| Lease handoff needs re-read; data-model §9 conflict policy | F-18 | — | ✓ §4/§7 (lease re-hydrate); data-model §9 to update to block-with-message |

## Round 1 outcome
Rev 1 → Rev 2 (near-rewrite of §§2–9). Both verdicts REVISE; backbone confirmed sound.

## Round 2 — confirmatory (Fable 5.1 high, on Rev 2) → REVISE, backbone sound
Verified most Rev 1 findings genuinely closed; found 5 must-fix items (2 were dispositions Rev 2 marked ✓
that the text didn't actually deliver, + a false claim in §6). All fixable section rewrites, no redesign.
Folded into Rev 3.

| # | Finding | Sev | Disposition in Rev 3 |
|---|---|---|---|
| B1 | Record catalogue incomplete (marks/sign/un/orig/curDraft/docs/backup) | HIGH | ✓ §2.1 rows added; marks are DERIVED-from-diff (no stored pending/changes/added); completeness-walk test in inc.2 |
| B2 | Derivation hooks lack order/view/termination contract | HIGH | ✓ §2.4 step 2: fixed order, provisional view, dry-run fixed-point proof + property test |
| B3 | Publish barrier: cross-day/redo/input-covering-day | MED | ✓ §5: drop-whole, clear redo, input-date-range included |
| B4 | Journal+lease recovery: double-apply/lost-write via postman | HIGH | ✓ §2.4 step 8 + §4: confirmed/journal BYPASS postman; {pre,post} replay; lease-acquisition re-hydrate; data-model §9 edit required |
| B5 | Interim sync coherence; false `locked` claim; RC1 bug | HIGH | ✓ new `system` origin (§2.3); §6 rewritten (notify-driven step 2/3, hooks at 2b); 2 pinned RC1 tests; false claim deleted |
| B6 | Interim history bridge vs no-whole-world-diff rule | MED | ✓ §5: bridge diff is a cold-path exemption OR retire snapshot undo same increment |
| DEC1 | [AMEND] plan still lists Phase 6 Durability | — | ✓ §9 DECISION 1: required edit to the [AMEND] plan on owner confirm |

Verified pre-existing bug surfaced (not new, not ID-caused): **RC1** — an outbound-minted input pushes a
scheduler undo step (`sync.ts:279`→`writeInputsBatch`→`runInputWrite`→`histPush`), so an LW undo creates a
scheduler undo step today. Fixed in the design by routing sync's Raptor-side writes through the `system`
origin (§6).

## Round 3 — INDEPENDENT (Codex/GPT-6 Astra high, on Rev 3) → REVISE, 6 HIGH + 2 medium
A fresh independent engine (not the one iterating the fixes) on Rev 3, prompted by the owner's
independence question (rounds 2 was Fable checking its own prior feedback). Plan SHA256
`b00dcca6…e254dac`; codex-cli 0.154.0. Found 8 material defects, several NEW.

| # | Finding | Sev | Nature |
|---|---|---|---|
| RC4-301 | Postman-bypass doesn't serialize vs the postman's own in-flight writes; an `eventual` write can overwrite a `confirmed` one after "published" is announced | HIGH | **Cluster A — durable-txn-on-whole-blob** |
| RC4-302 | Per-key journal replay isn't transaction-atomic; a partial durable write leaves a state no command committed; replay can complete a "failed" publish | HIGH | **Cluster A** |
| RC4-304 | Lease-acquisition re-hydrate does NOT reload DAYS/SCHED (`hydrate()` never replaces them); stale-week overwrite persists; deleted stash weeks resurrectable | HIGH | **Cluster A** |
| RC4-305 | Deferring LW writers leaves `retractLwRow`→`withdrawLeaveCell` (a causal cross-module write) outside scheduler transaction rollback | HIGH | Cluster C — cross-module atomicity |
| RC4-303 | `(drafts,draftId)`/`(sign,di)`/`(pointers,di)` collide across days/weeks (drafts mint dr1/dr2 per day; sign/pointers per week) | HIGH | Cluster B — precise fix (qualify keys) |
| RC4-306 | Inverse delete→restore(prior version) violates monotonic versions + defeats conflict detection | HIGH | Cluster B — precise fix (restore value, fresh version) |
| RC4-307 | Snapshot bridge isn't causal-only (`histSnap` captures all INPUTS); a system write between two user edits gets reversed | MED | Cluster B — inc.2 only |
| RC4-308 | Non-reentrant `commit` vs synchronous notify-driven sync that calls the command-backed writer | MED | Cluster B — need a post-commit follow-up queue |

**Key pattern (the reason to stop and rescope):** the HARDEST, recurring HIGH findings (round-2 B4;
round-3 RC4-301/302/304) all cluster on ONE decision — DECISION 3, forcing crash-safe/two-tab-safe/
atomic multi-key durability onto the CURRENT whole-blob localStorage + postman + hydrate pipeline, which
was not built for it. This is the owner's "many bugs trace to one decision → step back" guardrail case
(`prefer-guardrail-over-bug-cascade`), not a cascade against the command-model backbone (still sound).
Cluster B/C are precise, fixable spec errors.

## Round 3b — Fable confirmatory (on Rev 3, parallel to Codex) → REVISE-light → build
Agreed the backbone is sound and **increment 1 is safe to build now** with three clauses folded: (Fable-1)
an async write mutex + flush-before-journal + post-ack whiteboard set (a durability concern — moot under
narrowing); (Fable-2) notify AFTER the transaction releases + a follow-up queue (folded, §2.4 step 8);
(Fable-3) derivation hooks are pure functions of the view (no access to the command's change list) and the
sign record is DIGEST-BOUND not event-cleared — resolves a real contradiction with §3(c)/[AMEND] Phase 3
(folded, §2.1 sign row + §2.4 step 2). Also: Fable-4 (`system` commands must persist — folded, §2.4 step
7 persists every origin), Fable-5/6 (lease/journal — moot under narrowing), Fable-7 (walk-test trips on
dead `al`/format stamps + settings bypasses → make `store.set` the settings adapter — folded, §2.1/§11),
Fable-8 (`un` direction — folded, §2.1). Verified RC1 in code (the LW-undo-creates-scheduler-undo-step bug).

## Round 3 outcome — owner decision: NARROW (14 Sep 26)
Owner chose "shrink scope, then build". Narrowing REMOVES Cluster A (RC4-301/302/304 + Fable-1/5/6) from
step 2 — durable multi-key/two-tab-safe saving moves to step 5 (the record-oriented door, built for it);
production persistence stays as today; [AMEND] keeps its narrow single-week safe-publish. SEQ-003 remains
satisfied (contract + test-double in step 2; concrete durable adapter at step 5). Precise fixes folded
into Rev 4: RC4-303 (week/day-qualified keys + identity-injectivity test), RC4-306 (undo restores VALUE +
FRESH version), RC4-308/Fable-2 (notify after release + follow-up queue), Fable-3 (pure hooks + digest-bound
sign), Fable-4/7/8. RC4-305/307 → increment 2 (unchanged-from-today under narrowing). **Plan → Rev 4,
build-ready. Increment 1 (pure in-memory core) safe to build now. HOLD for "merge live".**
