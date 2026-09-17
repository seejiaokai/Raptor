# Session handoff — [CMDL-FINISH] BUILT (P1–P6), held for cross-provider inspection + "merge live"

## Where it is
The **build is done** on branch `claude/cmdl-finish` (off `main`). Five of six phases are
COMPLETE with full gates green and committed+pushed; the sixth (P4, Tracker gestures) is the
mechanism + the high-value gestures, with the delicate remainder deliberately deferred (below).
**Nothing merged.** Waiting on: (1) the cross-provider CODE inspection (Codex + Fable) of the built
code, (2) the owner's mandatory live-scenario pass for P3, (3) the owner's "merge live".

## Commits (on `claude/cmdl-finish`, after `8235c19` the design lock)
- `aef0ff2` P1 — command-core enabling changes (§2.1): causalSeq per-pipeline, causedBy non-user,
  drain-on-throw, queued-commit context capture, commitProjection/isInReducer/commitPhase/CmdRefused,
  scoped expectedRevs.
- `684cd59` P2 — batch delete-aware write() seam for all 5 stores + Tracker mem hydration + settings
  reset-rehydrator (R3-001) + lw/trk signatures.
- `1202504` P3 — the F1 Leave War causal both-side envelope: notify restructure, coalescing router
  (+ F4-1 idle lwSyncTurn), LW_RESTORING, OUTBOUND_PENDING, writeInputsBatchProjection, People-side,
  lwStore registered guarded.
- `dd39593` P5 — key sched.als by stable verId not array index (C14).
- `2e142f4` P6 — off-week weekstash store + CmdRefused routing (§6): atomic protected-week clear.
- `86fa196` P4 (PARTIAL) — trkGesture mechanism + Class A marks + addStudent + applyLullCopy + addCourse.

## Gates (each run ALONE — see the lesson below)
Every phase: build/typecheck clean, `node reference/tfin.js` 728/0. Full unit 4905/4905 (the only
intermittent miss is the PRE-EXISTING `inputscal.test.tsx` pointer-event flake — 39/39 in isolation).
`test:e2e` 425 passed / 33 skipped / 0 (the year-wide-scrubber leavewar geometry test flakes under
load but passes alone). `smoke:tracker` 425/0.
- **LESSON:** do NOT run the full unit suite and `test:e2e` concurrently — it over-subscribes the CPU
  and times out slow LW-UI / geometry test files (a harness artifact, not a regression). Run them
  one at a time.

## P4 — what is DONE vs what remains
DONE: the `trkGesture` mechanism (one gesture = one envelope; sSet is now sync + defers storage via a
boundary flush), `trk.gesture` permission, and these gestures grouped: popGrade, popFail, setDoneDate,
setFailDate, addStudent (interleaved reads hoisted), applyLullCopy, addCourse.

REMAINING (a focused follow-up; the mechanism is proven, the app behaves identically with per-write
envelopes so this is safe to leave — envelope grouping is latent foundation for [GLOBAL-UNDO], not
live behaviour):
- **addSyl / dupSyl** — have a try/catch storage-error rollback + (dupSyl) an interleaved
  `await snapshotLayout` read; converting changes their error-rollback semantics, do it carefully.
- **renameStudent / removeStudentNow / delSyl** — reads AND writes interleaved across MULTIPLE syllabi
  in a loop (storeSylIds → sGet kRosterFor → sSet); needs an all-reads-first restructure + a sync
  delKey variant.
- **restoreHiddenSyl** — async `reconcileBuiltins` mid-sequence.
- **importClick** — multi-part (design §4 Class C: one trkGesture per resolved chart + one for the
  student block).
- **TRK_RESTORING (N7)** — the legacy Tracker undo (applyHist/applyMarkHist → saveMarks/saveLayout)
  still emits forward envelopes; scope a raw/off-stream flag to the SYNCHRONOUS trkWrite (not across
  the awaited step()).
- **Register trkStore GUARDED** — only once EVERY gesture routes (P4-END).

The pattern for the remainder: hoist every `await` read/prompt BEFORE `trkGesture(() => …)`, then do
the synchronous mem + live-let writes inside it (call the save helpers WITHOUT await — their mem write
is synchronous, storage is flushed at the boundary). Watch multi-write helpers whose two writes are
sequenced by an await (like the de-asynced `noteLastEdit`). Run `smoke:tracker` after each gesture.

## Cross-provider CODE inspection — DONE (Codex/GPT-6-Astra + Fable 5.1)
Both ran on the built diff `main...claude/cmdl-finish`. Fable's verdict: the core mechanisms
(P1 command core, P3 router logic, P2 seams, P6, P4 conversions) all trace CLEAN; only the items
below. Codex: REVISE with a converging set. The two agree closely.

FIXED this session (commit after the inspection):
- **CMDLF-001 (HIGH, LIVE bug)** — no `lw.hist` effect context was registered (design §2.1(4) missed),
  so a Raptor-driven LW reconcile's queued lw.sync projection pushed a spurious Leave War UNDO step
  (and truncated redo). Registered it in `lwRegisterCommands`. **Pinned** by a new discriminating test
  in `causal-envelope.test.ts` (verified it fails without the fix).
- **CMDLF-003 (MED)** — `trkStore.write()` wrote only `mem`, never storage → a Tracker restore lost on
  reload. Added a boundary storage flush of every applied record.
- **CMDLF-007 (LOW-MED)** — `write()`/`restore()` didn't bump the sGet generation map. Added the bumps.
- Verified (empirically) the P6 `resyncSchedBaseline()` in `commitInputsWith` IS needed — quarantine
  bare-write rollback FAILS without it (Fable's "unnecessary" claim tested the wrong file, weekstash).

DEFERRED to the [GLOBAL-UNDO] / P4-completion follow-up (ALL latent — the write()/expectedRevs seams
have NO production caller at this step; they are the foundation the step-3 undo consumes, best
implemented + verified there with real undo scenarios; both providers pinned them precisely):
- **CMDLF-002** LW `write()` restoring `lw.postouts` doesn't rebuild the people posting windows (needs
  a reproject before the boundary reconcile).
- **CMDLF-004** Tracker `write()` re-derive doesn't hydrate the GLOBAL catalogue lets (SYLS / SYL_ORDER
  / SYL_HIDDEN / SYL_TOMB / eventInfo) from mem — a restored syllabus-delete leaves a blank board until
  reload. (Fable gives the precise side-effect-free re-parse.)
- **CMDLF-005 / CMDLF-006 / Fable#9** Tracker capture/restore don't snapshot the unsaved SYL/byid draft
  + course/COURSES pointer, don't reset undoStack/redoStack/sylDirty on a pointer-change restore, and
  restore() rebuilds the dirty draft from the persisted def (rejected-gesture path only).
- **CMDLF-010** the `inputs/__order` record is accepted by write() but not emitted by records() (a
  front/back reorder on delete→restore isn't recoverable).
- **CMDLF-011 / Fable#6** a pre-verId (legacy) `sched.als` key doesn't round-trip in write() (matches
  the "reset demo data, don't migrate" rule — likely acceptable).
- **CMDLF-012** a joined-CHILD command's `expectedRevs` is discarded (only the root's is checked).
- **Fable#7** write() installs envelope objects by reference (clone-on-write before the undo consumer).
- **Fable#8** `applyLwRecord` drops cells for an absent war (apply lw.war entries first).

## Pick up here (next session)
1. Do the owner's **live-scenario pass** for P3 (a real multi-day leave = ONE envelope; the idle
   week-nav reconcile = ONE projection) in the running app.
2. On the owner's **"merge live"**: full gate set once, PR (#412) merge on green, Pages rollover,
   live-verify, one notification.
3. In a focused follow-up (with [GLOBAL-UNDO] step 3): finish P4's remaining gestures + TRK_RESTORING
   + register trk guarded, and clear the DEFERRED inspection punch-list above (all latent foundation).

Design of record: `docs/superpowers/specs/2026-09-17-arch-stack-cmdl-finish-design.md` (+ its review-log).
