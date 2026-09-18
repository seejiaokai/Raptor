# Session handoff — [GLOBAL-UNDO] phase 2 BUILT (live cutover done; holding for "merge live")

## Where it is
[ARCH-STACK] step 3, **[GLOBAL-UNDO]**, **phase 2** — the LIVE cutover (2.3–2.6) is BUILT,
tested, driven in the real app, dual-reviewed and green. Branch `claude/global-undo` (NOT merged —
awaiting the owner's explicit "merge live"). Opus, high, test-first.

- Design of record: `docs/superpowers/specs/2026-09-17-arch-stack-3-global-undo-design.md`.
- Build spec: `docs/superpowers/specs/2026-09-18-global-undo-phase2-cutover-plan.md` (Rev 3 / C1–C8).
- Front-door contract: `docs/undo-contract.md`.

## What phase 2 delivered (all committed on `claude/global-undo`)
The one global undo timeline is now LIVE. Every Undo/Redo — scheduler, board, Leave War — drives
`globalUndo`/`globalRedo` over the ONE timeline, disabled/labelled from `undoState()`, refreshed on
the timeline's own version (`subscribeUndo`/`useUndoVersion`, C4). Plus the Unpublish button and
off-week undo.

- **2.3** — `src/state/undo-wire.ts` (`installGlobalUndo`, called from `main.tsx`): registers
  schedStore (8 colls) + lwStore (`LW_COLLS`, the 9) + weekstashStore; `setCutoverModules(['sched',
  'lw','inputs','plan'])`; hooks — `loadContext` (skips a weekstash-only week, C7), `snapView`,
  `showBubble`=toast, `reinstallLocks` (scheduler HIST.lock), `resolvePublishDay`, `postRestore`
  (schedPostRestore + armDrop/prunePreviews/bumpLwHistEpoch epilogue). timeline.ts: `loadContext(ctx,
  entry)`, post-snap conflict re-check + `missingStores` pre-check + `plainRestoreReason`.
- **2.4** — buttons retargeted (Shell/SchedBoard/Chrome → global; `useUndoVersion`); probe bridge
  `w.undo/redo`→global; audit-async probe drives the production path.
- **2.5** — the Unpublish button (`html.ts` day header, `interactions.ts` handler, `view.ts`
  UNPUBARM two-tap) + the §6.6 OIL-credit-bid-against warn (`sync.ts oilCreditBidAgainst`).
- **2.6** — off-week undo through the weekstash seam (C7); `missingStores` pre-check.

## Gates (all green, run after the review fixes)
`npm test` 4978/0 · `npm run build` clean · `node reference/tfin.js` **728/0** (no rendered byte
changed) · `npm run test:e2e` 425/0 · `npm run smoke:tracker` 425/0. Driven in the built bundle:
scheduler undo/redo revert + reapply, the Unpublish button appears on a published day and takes it
back to draft — no page errors.

## Dual cross-provider review — FOLDED IN
Fable 5.1 + Codex both inspected the finished diff (`git diff e8aa7ae..HEAD`). Fixes applied
(commit "fold in the dual cross-provider review"):
- **HIGH, both found it** — undo-of-publish left `SCHED_BASELINE` stale; a later unrelated edit could
  absorb the sign-clear and undoing it silently re-sign the day. Fixed: `schedPostRestore` resyncs the
  baseline after `signClear`. Regression test added.
- **HIGH (Codex)** — `w.raptorRole` (the e2e's admin-actor setter) would let a member escalate to
  admin on the public site. Now GATED TO LOCALHOST (dev + the e2e's vite preview), so it is never on
  the deployed site; the 4 LW undo e2e tests use it (no fragile mid-test re-login — that failed CI).
  Also removed the E3 footguns `w.histApply/histPush` + the `w.legacyUndo/legacyRedo` I'd added.
- **MEDIUM (Codex C8)** — a restore-caused projection now advances `expected` without a barrier, so an
  immediate redo after undoing an LW edit that wakes the reconciler isn't wrongly refused.
- **LOW** — Unpublish surfaces a refusal (Fable#4); `oilCreditBidAgainst` counts only a LANDED
  Raptor-owned credit (Fable#5/GU-P2-009, clash test); off-week-vs-loaded-week gets an honest message
  (Fable#2).
- **REJECTED** — Codex GU-P2-003 (retireIssued on undo-of-publish): deliberate Step-5 deferral (C6 —
  nothing disseminated at Step 3, so an undo of an undisseminated publish is silent and erasing it is
  correct; the forward Unpublish button keeps the retired record).

## Deferred by the review (in OUTSTANDING.md — not blocking phase 2)
- **C3 reland coverage (Codex GU-P2-005)** — the restore's `reconcileDayFiling` re-derives `acc` for
  inputs beyond the entry's closure without expanding the conflict/auth/expectedRevs set. Inert in the
  current synchronous single-user prototype (re-derive-only, never lands a row, `acc` self-heals on
  loadWeek); matters for the multi-user / shared-DB step. Fix then, with the mayReverse-per-session work.
- **mayReverse button state (Fable#3)** — `undoState()` enables the button on the newest ELIGIBLE
  entry regardless of the actor, and the timeline isn't cleared on logout, so a member behind an
  admin's edit sees an enabled-but-refused Undo. PRODUCT QUESTION for the owner (grey it, or skip past
  non-reversible?). Low impact now (single admin user); tie to the future per-session undo.
- **E5 inputs-weekId scope (Codex GU-P2-006)** — deliberately dropped in phase 2 (subsumed by the
  reland); an input-only undo doesn't snap to its own week. Minor UX.
- **LW lock through notify (Codex GU-P2-008)** — a restore-caused LW projection can push a vestigial
  legacy-LW history step. No user-facing effect (buttons drive global). Cosmetic.
- **resolvePublishDay/AL barrier (Fable#6)**, **postRestore view-effect rollback (Fable#7)** — LOW cosmetic.

## Pick up here (fresh chat)
Phase 2 is DONE and holding for "merge live". If the owner says merge: gates are already green →
open the PR from `claude/global-undo` → merge on green → wait for Pages → load the live page and
check undo/redo + the Unpublish button → one notification. Next feature phase is Step 5 (the shared
database: the disclosure/`id~n` issuance identity, per-session undo, and the deferred C3/mayReverse
items land there).
