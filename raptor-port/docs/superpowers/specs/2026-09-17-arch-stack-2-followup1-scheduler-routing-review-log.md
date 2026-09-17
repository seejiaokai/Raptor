# Review log — [ARCH-STACK] Step 2 follow-up #1 (scheduler routing) plan

Cross-provider red-team of `2026-09-17-arch-stack-2-followup1-scheduler-routing-plan.md`.
- Host: Claude Opus 4.8 (this session) — plan author + arbiter.
- Reviewer 1: Codex / GPT-6 Astra, high effort (read-only).
- Reviewer 2: Fable 5.1 (Anthropic-side, different model than the author).
- Round cap: 5. Review only — no build authorized by the loop.

## Round 1 — BOTH reviewers: REVISE (converged on the same core defects)

Plan SHA reviewed: `82f1a3f…`. Codex GPT-6 Astra (240s) + Fable 5.1 (433s). Both affirm the
APPROACH (lagging baseline + hybrid: explicit `schedWrite` for D/E/F, `afterSchedMutate` backstop
for A–C) is sound; Fable calls the hybrid "the right fork" and gives the decisive argument that a
per-call-site approach (Option A) would MISS ≥5 `afterSchedMutate` callers the §1 table omitted.
Full reviewer JSON: scratchpad `reviews-r1.txt` + the two `result.json` artifacts.

### Findings + host dispositions (all ACCEPTED — no rejections; the reviews were high-signal)

| ID | Sev | Issue (short) | Disposition |
|----|-----|---------------|-------------|
| SR-005 / F1 | HIGH | Setting BOTH `capture()` and `signature()` to the baseline DISABLES the whole-world guard's ability to catch a raw scheduler write from an un-enlisted store; §6's "guard catches baseline/live mismatch" claim is FALSE. | **ACCEPT.** Keep `signature()` = live `histSnap()`. Fix `commit.ts guardSnapshot` so `sig` derives from `storeSignature(s)` (=signature()) independent of the `capture()` string — the string shortcut is only valid when capture==signature. Add tests: a stale-baseline people cmd neither fails nor mutates DAYS; a raw un-enlisted DAYS mutation still fails+restores. **NB: this edits committed Step-2 engine code (`commit.ts`).** |
| SR-001 | HIGH | `commitPublish` builds its own command and never advances the baseline → after conversion, publish compares baseline-to-itself, emits nothing, leaves baseline stale. | **ACCEPT.** Advance the baseline via a shared apply-end wrapper used by EVERY scheduler reducer (commitSched AND commitPublish). Verify Original/AL envelopes + boundary + a following edit. |
| SR-002 | HIGH | New types (`sched.mutate`/`sched.sign`/…) aren't permission-registered → `authorize` rejects a signed-in admin's command. The SYSTEM actor bypasses this, so a system-actor test would hide it. | **ACCEPT.** Register every introduced type with `anyone`; test with a real signed-in admin actor. |
| SR-006 / F2 / F6 | HIGH/MED | `histPush` mints row ids (`ensureRowIds`) but is DEFERRED to phase 8 — AFTER the seam advances the baseline. A board add emits id-less rows AND the next command's diff carries the id mint → baseline≠live between commands. Same for `inpId` minting on read in the decomposition. | **ACCEPT.** In the seam, call `ensureRowIds(DAYS)` + `mintInpIds()` (idempotent) immediately before advancing the baseline; decomposition reads `r.iid` directly, never the minting `inpId`. Test: after a board add, every emitted row has a rid and `SCHED_BASELINE===histSnap()`. |
| SR-007 / F3 | MED | `resetSession`→`resetViewState('session')` clears WARNOFF (in the baseline) with NO re-sync; §3.2 omits it. Mute→logout→login→edit emits a bogus mute-clear. | **ACCEPT.** Re-sync at end of `resetSession`; structurally, register a re-sync CALLBACK invoked from `history.ts histInit/histRestore` (history can't import sched-commit — cycle), covering undo/redo/quarantine/loadWeek/initStore by construction. Test each re-sync point. |
| SR-004 / F4 | MED | The `isCommitting()` guard is true in BOTH reducer and post-delivery phases; a `schedWrite` from an onCommit subscriber / phase-8 effect runs raw + advances baseline → change applied but never streamed (silent). | **ACCEPT.** Expose `isInReducer()` (`phase==='reducer' && active`) from commit.ts; use THAT for the raw+advance branch; idle/post go through `commitSchedVoid` (runs pipeline or enqueues+drains). Test: an onCommit subscriber's schedWrite emits a 2nd envelope. |
| SR-008 | MED | Rendering MUTATES: `signOf` lazily inserts `SCHED.sign[di]`; opening an unsigned day's sign strip changes live state outside a command → a later no-op/edit emits spurious sign records. | **ACCEPT.** Materialize the sign objects before establishing each baseline (or make the readers non-mutating). Test: render, then a no-op command emits nothing. |
| F7 | LOW | Option B needs `view.ts`→`sched-commit.ts`, adding a `view↔sched-commit` import cycle (TDZ risk at module-eval). | **ACCEPT.** Inject via `HOOKS.schedEpilogue(rawEpilogue)` (the `setSettingsWriteHook` pattern) — no new import edge into view.ts. |
| F5 | LOW | Error path: if the backstop command fails (throw/conflict), rollback reverts the just-made structural edit while `notify()`/`toast('added')` still fire → a silent user-visible revert. Today the edit sticks. | **ACCEPT as a DOCUMENTED behaviour change** (atomicity wins over "the edit sticks") + toast "couldn't save" on `ok:false`. Note: no conflict checker exists in prod at Step 2, so this only triggers under a test checker or a thrown invariant. |
| SR-003 | HIGH(codex) | Durable effects (markEdit→histPush, persistAll) run BEFORE `afterSchedMutate` at board sites, i.e. OUTSIDE the backstop txn. A rejected backstop command can't cleanly undo them; undo could resurrect a rejected edit. | **ACCEPT AS A STEP-2 LIMITATION, documented.** At Step 2 the command layer is ADDITIVE (legacy histPush/persist are authoritative; the command only RECORDS), and prod has no rollback path, so this is inert now. Full atomicity = open the txn before the first mark at ~40 sites = a large invasive rework that belongs with follow-up #2 / Step 3. **← owner scope call (see report).** |
| F8 | LOW | §1 factual errors: F is `engine/drafts.ts`+`DraftsModal.tsx` (not plan.ts); no "park" verb; plan.ts writers ALREADY routed via `writeInputs`; `writeText` has a test caller; A–C omits `Shell.tsx:204`, `view.ts:899` (placeArmed), `Modals.tsx:111`, `drag.ts:283`, `interactions.ts:498/567/605/820/873/1168`. | **ACCEPT.** Correct the table; expand the P2 live-drive list to include a palette-tap plant, right-click clear, airspace edit, drag-drop, input accept (backstop-only paths). |
| F9 | LOW | P1 isn't "behaviour-neutral": while D/E/F stay out-of-band, a sign/mute/draft between two routed writes leaves baseline≠live and the next write absorbs it. | **ACCEPT.** Land P1–P4 as ONE gated change (removes the mis-attribution window) rather than gating P1 alone as stream-neutral. |

### Round-1 outcome
Approach affirmed; 12 concrete defects, all accepted (2 as documented Step-2 limitations). Plan needs a
Rev-2 addressing every ACCEPT, then a round-2 re-review of the changed SHA. Two items need the owner's
nod: (a) Rev-2 now edits committed Step-2 engine code (`commit.ts` guard) — small + scoped; (b) accept
SR-003/F5 as a Step-2 limitation vs expand scope to full rollback atomicity now.
