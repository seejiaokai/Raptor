# Session handoff — [CMDL-FINISH] FINISH work BUILT (P4 remainder + punch-list), held for "merge live"

## Where it is
The main [CMDL-FINISH] build (P1–P6, P4 partial) is **already merged and live** (PR #412 on
`main`), and the undo front-door doc is live too (PR #413, `docs/undo-contract.md`).

This session finished the rest, on branch **`claude/cmdl-finish-p4`** (cut fresh off `main` after
#413): the remaining P4 Tracker gestures, `TRK_RESTORING`, registering the Tracker store guarded,
and the deferred cross-provider inspection punch-list. **All five gates are green. Nothing merged —
held for the owner's "merge live".**

## Commits (on `claude/cmdl-finish-p4`, after `2099eb7` = #413 doc)
- `69faa1a` P4 — remaining Tracker gestures + TRK_RESTORING.
- `b0aa88a` P4-END — register trkStore guarded.
- `fd3413f` punch-list — CMDLF-012 (child expectedRevs) + CMDLF-010 (inputs order).
- `571ec53` punch-list — LW write() Fable#7 + Fable#8; CMDLF-002 deferred.
- `baa6c11` punch-list — Tracker CMDLF-004 + CMDLF-005/006/Fable#9.
- (docs) undo-contract capture note + HANDOFF + this file + OUTSTANDING.

## P4 — DONE
Every remaining Tracker action is now ONE gesture = ONE envelope (§4), via the all-reads-first
pattern (hoist every async read/prompt before the synchronous `trkGesture` body):
- **removeStudentNow, renameStudent** (Class C): hoist the cross-syllabus roster reads + last-marked
  pointer; the removal/relabel + all its deletes are one envelope. A gesture-aware `delKey` records
  a delete (TRK_DEL sentinel) so its storage flush rides the gesture's one boundary effect.
- **addSyl, dupSyl, restoreHiddenSyl** (Class B): the catalogue + def + layout writes are one
  envelope; the switch/reload after is a separate async step. `reconcileBuiltinsSync` was split out
  of the async `reconcileBuiltins` so restoreHiddenSyl can run it inside the gesture. The old
  storage-error rollback is gone (writes are atomic to memory; flush is best-effort at the boundary,
  status "local only" on failure).
- **delSyl** (Class C): `planSylSweep` gathers every delete + plan repoint across all course
  namespaces first (replaced `sweepSylRecords`/`repairPlanSyl`), then the whole sweep applies in one
  envelope.
- **TRK_RESTORING** (N7): the legacy undo (applyHist/applyMarkHist) runs its saves off the command
  stream via `trkRestoring(fn)`, scoped to the synchronous `trkWrite`, never across the awaited
  `step()`.
- **trkStore registered GUARDED** (P4-END), mirroring lwStore: its cheap `signature()` is checked on
  every commit app-wide; the only post-boot raw path (TRK_RESTORING) runs standalone from a keypress,
  never nested, so it is baked into the next pre-snapshot, not flagged.
- **importClick** deliberately left per-write (NOT one gesture per chart): under the guard every write
  is still on the stream; grouping the whole import is the [GLOBAL-UNDO] import-undo-granularity
  question the design (§4) defers. `applyCharts`/`applyStudents` are large async guardrail paths with
  `loadCourse` reloads inside — making them one synchronous gesture is a deep restructure best done
  with the undo consumer.

## Punch-list — 6 FIXED, 2 DEFERRED (all latent — write/restore seams have no production caller yet;
verified by round-trip UNIT tests, not a live scenario, exactly as agreed with the owner)
- **CMDLF-012** (command core) — a joined child's `expectedRevs` was discarded; now merged into the
  phase-5 conflict check. Pinned.
- **CMDLF-010** (scheduler) — `records()` now emits `inputs/__order`, so a reorder is a recorded
  change and a delete→restore round-trips input position. Pinned.
- **Fable#8** (LW) — `write()` applies `lw.war` before cells, so a cell listed first isn't dropped.
- **Fable#7** (LW) — clone-on-write of object record values (no aliasing of the source/undo snapshot).
- **CMDLF-004** (Tracker) — `trkWriteRecords` re-derives the global catalogue + event-info lets
  (SYLS/SYL_ORDER/SYL_HIDDEN/SYL_TOMB/eventInfo) from mem, so a restored syllabus-delete no longer
  leaves a blank board until reload.
- **CMDLF-005/006/Fable#9** (Tracker) — `capture` also snapshots the course pointer + the unsaved
  flow draft (SYL); `restore` puts them back and re-derives the rest from mem with `rebuildSyl=false`,
  so a rejected gesture no longer discards an unsaved draft. Pinned.
- **CMDLF-002** (LW) — DEFERRED to [GLOBAL-UNDO]. Restoring `lw.postouts` needs the people posting
  WINDOWS re-laid over the CLEAN Raptor projection (`setPeople(projectPeople)`), which crosses the
  LW↔Raptor boundary sync.ts owns and re-enters the reconcilers at the write boundary — the undo
  consumer's orchestration, not a bare record apply. Marker at the apply site. Latent (no caller).
- **CMDLF-011** (scheduler) — NO fix. A pre-verId legacy `sched.als` key exists only in pre-promulgation
  demo data and is prevented going forward (all ALs get verIds); per reset-demo-data, clear not migrate.

## Gates (each run alone)
build/typecheck clean · `node reference/tfin.js` **728/0** · full unit **4912/4912** ·
`smoke:tracker` **425/0** · `test:e2e` **425 passed / 33 skipped / 0**.

## Pick up here (next session)
1. On the owner's **"merge live"**: full gate set once, open PR from `claude/cmdl-finish-p4`, merge on
   green, Pages rollover, live-verify (open the Tracker tab — it should behave identically; this work is
   invisible plumbing), one notification. **Coordinate merge order with the parallel [AMEND] chat**
   (`claude/amendment-engine-core`, PR #405): merge one fully, then the other rebases onto `main` and
   re-runs its gates — never both at once. Recommend CMDL-FINISH first (it's the foundation).
2. Next ARCH-STACK step is **[GLOBAL-UNDO]** (design Rev 2, then build). It is the CONSUMER of the
   write()/capture/restore seams finished here — the two deferred items (CMDLF-002, importClick
   grouping) are its to complete, with real undo scenarios to verify against.

Design of record: `docs/superpowers/specs/2026-09-17-arch-stack-cmdl-finish-design.md`; front-door doc
`docs/undo-contract.md`.
