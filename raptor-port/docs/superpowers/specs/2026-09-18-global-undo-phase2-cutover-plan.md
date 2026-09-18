# [GLOBAL-UNDO] Phase 2 — scheduler + Leave War cutover — BUILD PLAN (for red-team, 18 Sep 26)

Design of record: `2026-09-17-arch-stack-3-global-undo-design.md` Rev 6 §6/§7/§11/§13.
Front-door contract: `docs/undo-contract.md`. Phase-1 handoff: `docs/session-state.md`.

This is the concrete, ordered, test-first build plan for design §13 **phase 2**, grounded in the
current code (file:line verified 18 Sep 26). **It is a plan for review, not yet built.** Each
sub-step is its own commit with its own focused test; the full five gates run once before the PR;
the standing dual cross-provider CODE inspection runs on the finished diff. Nothing merges without
the owner's explicit "merge live".

## What phase 1 already gives us (do not rebuild)
- The timeline engine (`src/undo/timeline.ts`): `installUndo`, `registerUndoStore`,
  `setCutoverModules`, `setUndoHooks`, `globalUndo`/`globalRedo`, `undoState`, `mayReverse`,
  the expectation map + barriers, the DERIVED publication barrier (`computePubBar`), the
  describer/bubble. Empty `cutover` in production ⇒ no-op live.
- `integration.test.ts` — the cutover **in miniature**: register `schedStore`+`weekstashStore`,
  `setCutoverModules(['sched'])`, real text edits round-trip, a real publish is undone. Phase 2 is
  this pattern, made production and widened to LW + inputs + plan.
- Both stores are already `EnlistableStore`s with `write()` and are `registerGuardedStore`'d:
  `schedStore` (`sched-commit.ts:266`) owns `days, sched.book, sched.mutes, sched.orig, sched.als,
  sched.retired, inputs, plan`; `lwStore` (`leavewar/state/store.ts:1176`) owns
  `lw.war, lw.cell, lw.bid, lw.postouts, lw.current, lw.config`.
- The `sched.unpublish` command + `retireIssued` helper + `sched.retired` collection + `Boundary.kind`
  `'unpublish'` (phase 1). `commitUnpublish`/`commitSetDayApproved` exist.
- `relandInputs()` + `reconcileLandedAcc()` extracted into `engine/slots.ts` (commit `3dcecd3`,
  phase 2 step 0), the ONE shared landing mechanic for §11.

## The decisive eligibility fact (verified, must be in the plan)
`moduleOfColl` (`timeline.ts:210-218`) maps `inputs→inputs`, `plan→plan`, everything sched-ish→`sched`,
`lw.*→lw`. `isEligible` requires **every** module in a closure to be cut over. Ordinary phase-2
gestures span extra modules:
- **Scheduler accepts/files an input** → closure = `days`(sched) + `inputs`(inputs) [+ `sched.book`].
- **Plan-puck move / day remark** → closure = `plan/all`(plan) under an `inputs`-scoped command.
- **LW approves leave** → `lw.cell`/`lw.bid`/`lw.config`(lw) + a causally-chained `inputs` projection
  (`runOutbound`/`retractLwRow`).

**⇒ the phase-2 cutover set MUST be `['sched','lw','inputs','plan']`.** `['sched','lw']` alone would
make input-filing, plan moves and LW leave approvals silently non-undoable. `people/settings/trk`
stay OUT (no phase-2 gesture writes those collections). **OPEN Q for red-team:** confirm no LW or
scheduler phase-2 gesture ever lands a `people`/`settings` change in its closure (roster reproject is
a non-persisted projection, not a record — believed safe; verify).

---

## Sub-step order

### 2.1 — The restore's `acc` strip + `relandInputs` wiring (§11) — the reland consumer
**Why:** an undo that restores `inputs` before-images carries the derived per-week `acc='g'` landing,
which is week-relative, not authored. §11: strip `acc` from the inverse ONLY when `==='g'` (mirror
`store.ts`'s clear incl `inputProtected`; keep authored `'r'`/`'u'`), then recompute the landing via
`relandInputs()`.
**Where (to decide with red-team):** inside the scheduler adapter's apply, so it runs **before** the
final baseline snapshot (`applyEnd`/`SCHED_BASELINE`, `sched-commit.ts` ~228/251) OR resync the
baseline after it and before change-derivation (`commit.ts` ~328-341), so the emitted envelope +
rollback snapshot match live state. Candidate: a restore-only post-apply step in `schedWriteRecords`
keyed on the presence of `inputs` entries + `restore` origin. **Must NOT run on ordinary forward
writes** (would re-park/re-land live edits).
**Also:** add `weekId:CURWEEK` to `inputsScope()`; include any reland-changed records in the
restore's auth + conflict coverage.
**Test (test-first):** file an input on the loaded week → undo → the ground row AND `acc` are back
exactly (round-trip); a multi-day input starting in a prior week that landed on this Monday survives
the strip+reland (P2-REREVIEW-07); the restored book's `pending/changes/added` are preserved.

### 2.2 — Undo-of-a-publish special restore (§6.2 / GU5-005)
**Why:** undo of a publish IS an unpublish. The plain inverse would restore the pre-publish `sg/sb`;
the owner's rule (round-5 GU5-005) is that a pulled-back published day **re-signs on republish**, so
sign-offs are **CLEARED, not restored**.
**Build:** when the entry being undone carries `boundary.kind==='publish'`, the restore
`signClear(di)`s the day (not restore pre-publish `sg/sb`); the inverse still deletes the
`sched.orig`/`sched.als` issued record (via `write({allowIssued:true})`) + restores the book.
Append a `retired` audit entry **only if `issuedDisclosed(id)`** (undisclosed undo = never happened).
Redo re-publishes + re-clears per the normal publish path. Use `retireIssued(di,id,{clearSigns,logIf})`.
**Test:** publish Original → undo → day is a draft, sign-offs cleared, `SCHED.orig[di]` gone; a
*disclosed* publish → undo leaves a `logged` retired line; *undisclosed* → no line; redo re-publishes
and re-clears. (Extends `integration.test.ts`'s existing publish-undo test.)

### 2.3 — The cutover wiring + the app hooks (main.tsx)
**Where:** `src/main.tsx`, after `histInit()`/`lwHistInit()` (~:70) and before `installProbeBridge()`
(~:78).
```
installUndo(HOOKS)                       // subscribes onCommit; idempotent
registerUndoStore(schedStore, SCHED_COLLS)   // the 8 sched-owned collections
registerUndoStore(lwStore, LW_COLLS)         // the lw.* collections
registerUndoStore(weekstashStore, ['weekstash'])
setCutoverModules(['sched','lw','inputs','plan'])
setUndoHooks(HOOKS)
```
**Hooks (`UndoHooks`, `timeline.ts:33-50`):**
- `currentActor` — OMIT; the timeline already defaults to `deriveActor()` (`actor.ts:24`).
- `reinstallLocks` — reinstall the scheduler `HIST.lock` (effect-context `'HIST.lock'`,
  `sched-commit.ts:515`) AND the LW `HIST.lock` (effect-context `'lw.hist'`,
  `store.ts:1226`) for the restore's duration, so no legacy `histPush`/`recordHistory` is pushed
  by the restore. **OPEN Q for red-team:** does the existing latch / `registerEffectContext` replay
  already suppress these during a `restore`-origin `commitAs`, making an explicit `reinstallLocks`
  redundant or double-applied? Confirm before wiring.
- `loadContext(ctx)` — `weeks/<wk>` → `loadWeek(wk)`; `lw.war` context → `selectWar(id)`. Multi-context
  = load all before any write (§8.1), transactional-or-refuse.
- `snapView(entry,dir)` — scheduler → `jumpToChange(key,di)` (`interactions.ts:74`); LW → `focusDay`.
- `showBubble(text)` — reuse `toast()` (`ui/toast.ts:6`) with `bubbleText(entry,dir)` (`describe.ts`).
- `resolvePublishDay(id)` — verid→day via `dayIso` (`verid.ts`) for a boundary whose closure carries
  no `sched.orig`/`days` key.
**Test:** production-shaped extension of `integration.test.ts` — real edits/publish/LW leave
round-trip through `globalUndo`/`globalRedo` with the four-module cutover set.

### 2.4 — Retarget the legacy entry points (§9) + unreachability
Route every Undo/Redo entry point at the single dispatcher; disabled/label from `undoState()`:
- **Scheduler** `Shell.tsx:318-323` + `SchedBoard.tsx:347-350` → `globalUndo()`/`globalRedo()` (+`notify`);
  `disabled` ← `!undoState().canUndo`/`!canRedo`; tooltip ← `undoState().undoLabel`/`redoLabel`.
- **Leave War** `leavewar/ui/Chrome.tsx:104-121` → `globalUndo`/`globalRedo`; `disabled`/labels ←
  `undoState()`.
- **Probe bridge** `probe-bridge.ts:90` `w.undo`/`w.redo` → `globalUndo`/`globalRedo`. Keep
  `w.histApply`/`w.histPush` (`:220`) for tests, but ensure NOTHING drives a cut-over module through
  both systems. **OPEN Q for red-team:** which e2e/probe tests call `w.undo` expecting the *scheduler
  HIST* behaviour, and do they still pass under `globalUndo`? Enumerate and update if needed.
- **Tracker** (`Header.jsx:238-239`, keyboard `App.jsx:94/99`→`core.js:2612`) — **UNTOUCHED** (phase 4).
**Test:** a per-phase unreachability assertion — after cutover, the scheduler legacy `undo` and the LW
`historyApply` are not reached via the UI/bridge paths; no cut-over module is driven by two systems.

### 2.5 — The Unpublish button UI (§6.1/§6.4) + the OIL-credit warn (§6.6)
Day-header button beside sign-off/publish, shown **only when applicable**: `dayApproved(di)` ∧
`canEditSched()` ∧ target id `=== dayCurVer(di)` ∧ it is the latest version ∧ `!DPREV.has(di)` (the
`sched.unpublish` gate, §6.5). Runs the forward `sched.unpublish` command
(`retireIssued(di,id,{clearSigns:true})`); afterwards editing + republishing reissues the **same
label** (existing `data-beak`/`data-alpub` paths — no new republish code). §6.6: **warn** if the day
has OIL/leave credits already bid against before withdrawing.
**Test:** button visibility gate (each conjunct); unpublish AL n → working copy, sign-offs cleared,
`nextSeq` returns n, same-label reissue works incl. an empty-delta round-trip correction
(`SCHED.correcting[di]`); the warn fires when credits were bid against.

### 2.6 — Off-week / weekstash (finding I) via `weekstashStore.write()`
An undo whose closure touches a **non-loaded** week applies through the stash seam (or refuses whole).
`weekstash/<wk>` shares the key-family with every `<wk>`-prefixed key (§8.1 R3-05); a stash rewrite at
`loadWeek` is not a timeline event.
**Test:** an off-week edit undone via `weekstash.write()`, or a clean whole-refuse; weekstash
key-family sharing (R3-05).

---

## Sequencing / risk notes for the red-team
- **Slice check:** 2.1–2.4 are the load-bearing cutover (must land together to keep the buttons
  working). 2.5 (button UI) and 2.6 (off-week) are additive and could be separate commits/PRs. Is that
  the right cut, or do 2.2/2.5 need to land together (both touch unpublish)?
- **The reland hook point (2.1)** is the highest-risk decision — wrong placement re-lands/re-parks on
  forward writes or emits a stale envelope. Scrutinise the restore-only guard and the baseline timing.
- **reinstallLocks redundancy (2.3)** — verify against the latch/effect-context replay, don't double-lock.
- **probe-bridge retarget (2.4)** — enumerate the e2e/probe callers of `w.undo` before changing it.
- **Cutover-set completeness (§eligibility)** — confirm `people`/`settings` never appear in a phase-2
  closure; if they can, either add them or scope them out deliberately.
- **Publication barrier vs undo-of-publish (2.2)** — after an undo-of-publish (unpublish), the derived
  `pubBar` must clear for that day so an earlier edit becomes undoable again (design §6.3 says the
  DERIVED barrier handles this with no extra bookkeeping — verify with a test).
- **LW leave approval closure (2.1/2.3)** — the `inputs` projection folds into the LW entry; undoing it
  must reverse BOTH the lw cells and the minted/withdrawn Raptor input in one restore. Verify the fold
  + inverse cover both sides (design §3.4 "let the reconciler run, prove it converges").

## Gate plan
Per sub-step: the focused test(s) named above (test-first) + `npx vitest run <file>` while iterating.
Once before the PR, from `raptor-port/`: `npm test` · `npm run build` · `node reference/tfin.js`
(728/0 — the cutover must not change a rendered byte) · `npm run test:e2e` · `npm run smoke:tracker`.
Then the standing dual cross-provider CODE inspection of the whole phase-2 diff (Fable + Codex).
