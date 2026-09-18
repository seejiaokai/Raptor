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

---

# Rev 2 — red-team dispositions (18 Sep 26, Fable 5.1 + Codex/Astra, both REVISE)

Two independent reviewers (a different Claude-family model than the author, and the Codex CLI) red-teamed Rev 1. Both returned **REVISE**; the shape (four-module cutover set, reland inside the scheduler adapter, `reinstallLocks` kept, retarget all entry points) was judged right, but Rev 1 rested on three assumptions the code contradicts. Author verified the blocker (E1) and the barrier gap (E3) against the code directly. Dispositions below; the **revised sub-step order supersedes Rev 1's** where they differ.

## New engine prerequisites — step 2.0e (must land BEFORE the cutover, 2.3)
- **E1 — restore-caused projections must NOT fold into the original entry (Fable BLOCKER; verified).** `applyRestore` commits with `causedBy: entry.seq` (`timeline.ts:358`); a reconciler projection raised during the restore's drain carries `causedBy = causalSeq` = the restore seq (`commit.ts:163`), and `resolveRoot` walks restoreSeq -> `findEnv(restoreSeq).causedBy = entry.seq` -> **folds into the original entry** (`timeline.ts:126-139,172-186`), corrupting redo, growing the closure each cycle, and able to flip eligibility retroactively. Invisible in phase 1 (restores wake no reconciler); fires the moment LW is cut over. **Fix:** `resolveRoot` stops at any envelope whose `origin==='restore'|'seed'` and treats the projection as out-of-band (`trackExpectation` + `console.warn`), per design 3.4. Test: a restore that wakes a reconciler folds nothing; redo replays only the original forward.
- **E2 — record-set (collection-level) eligibility that EXCLUDES the deferred surfaces (Codex, Fable).** Rev 1 dropped design 7's rule that closures touching `lw.postouts`/`lw.config` are excluded until phase 5, and wrongly claimed no phase-2 gesture writes `people`. They do: a past-dated `setPostOut` folds `people/<id>` via `runPoArchive`->`persistPeopleProjection` (`sync.ts:1078-1100`), and Quals "Restore" is one `people`+`lw.postouts` entry (`sync.ts:1124-1128`). Module-level `isEligible` (`timeline.ts:219-222`) cannot express this. **Fix:** extend eligibility so an entry is ineligible if its closure touches ANY collection in a deferred set `{lw.postouts, lw.config, people, settings, trk.*}`, AND `undoConflict`/`redoConflict` must SKIP ineligible entries in the non-linear share check, or an ineligible newer entry permanently deadlocks the week's eligible undo (Fable). Decide: ineligible entries are invisible to the active surface; the affected gesture is simply non-undoable in phase 2 (design 7's intent). Test: a past-dated post-out is non-undoable but does NOT block undoing an earlier scheduler edit.
- **E3 — the barrier is blind to raw legacy restores, so `w.histApply`/`w.histPush` must be retargeted, not merely kept (Codex, Fable; verified).** `histRestore` (`history.ts:90-118`) swaps DAYS/SCHED/INPUTS with NO envelope and NO revision bump; `trackExpectation` never fires, so no barrier is set and a later `globalUndo` applies a stale inverse silently. The only caller after cutover is the adapted probe (`probes/adapted/audit-async.cjs:208,290,294`). **Fix:** retarget/remove `w.histApply`/`w.histPush` for cut-over collections (or make `histRestore` emit a system `restore` envelope + bump revisions), and update that probe. Corrects Rev 1's 2.4 "keep them" line.
- **E4 — the timeline needs a version + cross-store notify (Fable).** The retargeted buttons read `undoState()`, but the timeline has no version; a pure-LW entry notifies only LW, leaving the scheduler's Undo label/disabled stale (and vice-versa). **Fix:** bump a timeline version and notify both stores on every record/undo/redo.
- **E5 — an input-only entry must snap to its week (Codex, Fable).** Adding `weekId` to `inputsScope()` alone does nothing: `Scope` only allows `{module:'inputs'}` (`types.ts:55-62`) and `recordEntry` derives contexts from `Change[]`, ignoring scope (`timeline.ts:148-160`). **Fix:** extend the `inputs` scope type with a week id and merge scope-derived context into `UndoEntry.contexts`, so restore-time relanding runs on the right week.

## 2.1 revised — reland in the restore (Codex, Fable)
- **Placement:** INSIDE `schedWriteRecords`, BEFORE `applyEnd()` (`sched-commit.ts` ~259) — the only point that covers the envelope, the rollback snapshot AND `expectedRevs` derivation. Placing it after `write()` returns emits a stale envelope and the NEXT forward edit absorbs the reland diff (Fable, verified path).
- **Restore signal:** key it on an explicit restore/reland `opt` (only the restore calls `write()`, and only with `{allowIssued:true}`), NOT on "inputs entries present" — a board-X closure is `days`-only yet still leaves a dangling `acc` to re-derive.
- **NO auto-land in a restore (the big correction).** `relandInputs` as extracted calls `autoAcceptInput` which PUSHES rows and scans/mutates EVERY input across days — outside the entry's pinned revisions and the member's ownership (`mayReverse` authorizes only the entry's owners). A member undoing their own input could land another person's unlanded input unauthorized. So the RESTORE does **strip `acc==='g'` (on a CLONED value — never the recorded inverse, the GU2-009 aliasing hazard, Fable) + `reconcileLandedAcc()` + re-park `'r'` ONLY**: re-derive `acc` from rows that already exist in the restored `days` image (which IS the truth); never push a new row. The full `relandInputs` (with auto-land) stays the WEEK-LOAD path only. Build this as a restore-scoped variant, not the shared full pass.
- Note: the standalone Unpublish button runs no reland, so undo-of-publish and button-unpublish must be made to converge on this same re-derive.

## 2.2 revised — undo-of-a-publish (Codex, Fable)
- Needs a per-entry restore hook (`hooks.adjustRestore(entry,dir,entries)` run INSIDE the reducer so the envelope records the adjustment) — `applyRestore` has no per-entry seam today (Fable).
- `signClear(di)` on `boundary.kind==='publish'` (not restore pre-publish `sg/sb`), per GU5-005.
- **Run `retireIssued` BEFORE the inverse deletes the issued record (Fable):** `retireIssued` reads `SCHED.orig[di]`/`als.find` live; after the delete it is `undefined` -> a retired line with `snap:null` (erases the snapshot — breaks never-ERASE for the disclosed case). Snapshot from the live/forward image first.
- **A `logged` (disclosed) retired record is append-only — undo-of-unpublish must NOT delete it (Codex).** The generic `invertClosure` would delete the `sched.retired` record; guard so an inverse skips deletion of a `logged:true` retired record (compensating transition, design 6.2/GU4-003).
- **Disclosure keyed per-issuance `id~n`, NOT the reused label (Codex / design 6.1 GU5-004):** after a disclosed AL1 is unpublished and reissued as AL1, `issuedDisclosed(label)` would wrongly inherit the old status. Key audit/disclosure on the per-issuance identity.
- **Redo of an undone publish lands published+signed (Fable):** redo replays `entry.forward`, whose `sched.book` after-image carries the sign-offs as at publish — correct; fix Rev 1's "re-clears" wording and the test expectation.
- **AL publishes only bar if `resolvePublishDay` is wired (Fable):** `publishALDay` touches `sched.als`+book, no `sched.orig`/`days` key, so `resolveBoundaryDay` needs the hook. Test an AL publish barrier, not just the Original.
- Publication barrier clears correctly after undo-of-publish (`computePubBar` skips `undone`, verified Fable).

## 2.3 revised — cutover wiring + hooks
- **CURWEEK guard on `weekstashStore.write` moves HERE (Fable / Codex), not 2.6** — registering `weekstashStore` makes it live now. `writeStashRecords` (`weekstash.ts:99-105`) must refuse `id===CURWEEK` whole (`CmdRefused`): an off-week inverse that targets the LOADED week writes the stash blob while live DAYS/SCHED are unchanged, then `persistAll` re-persists the live week and discards it (`persist.ts:98`). Whole-refuse, or translate to a live write.
- **Restore epilogue in the deferred effects (Fable):** the legacy `histApply` runs `armDrop()`+`prunePreviews()` (`history.ts:127-130`) and LW `historyApply` bumps `historyEpoch` (`store.ts:1419`); the write seam does neither, so an undo mid-arm crashes on the next tap and an undo mid-LW-move strands the grid. Add these to the restore's deferred effects (or `snapView`).
- **`reinstallLocks` confirmed NEEDED, not redundant (Fable):** without it `HIST.lock` is false when `schedWriteRecords` raises its deferred `histPush`, pushing a legacy step that feeds E3; the effect-context replay only re-installs the captured value, it does not suppress on its own. LW half is redundant (already `locked()`) but harmless. Wrap the whole restore write loop.
- **`LW_COLLS` = the authoritative full list (Codex):** `lwStore` owns nine collections incl. `lw.ledger`, `lw.balances`, `lw.oilpolicy` (register list `store.ts:1213`), not the six Rev 1 listed; an omitted one fails `applyRestore` with "no restore target". Define ONE exported list, used for both command registration and undo-store registration.
- **Re-run the conflict pre-check AFTER the snap and map refusals to plain words (Fable):** `loadWeek` inside `snap` can emit orphan projections that bump revisions after the pre-check, so `applyRestore` fails phase-5 with a technical "stale revision" string shown to the owner. Re-check post-snap; translate reasons.

## 2.4 revised — retarget entry points
- Also retarget `w.histApply`/`w.histPush` (E3) and update `probes/adapted/audit-async.cjs`.
- Button disabled/label via the timeline version (E4). e2e enumeration (Fable): no e2e drives scheduler undo; the LW undo specs (`e2e/leavewar.spec.ts:138,1697-1740,1986-2027`) run one `lw.config`/ledger entry each and are expected green under `globalUndo`; `:138` (pair disabled at rest) becomes a whole-app "no eligible entry at boot" assertion — fine now, watch for brittleness.

## 2.5 revised — Unpublish button
- Add `!protectedWeek()` to the visibility conjunction (Codex; design 6.5 gate includes it) so the button never shows only to refuse.

## 2.6 revised — off-week/weekstash
- The `CURWEEK`-guard part moved to 2.3. 2.6 is the remaining off-week apply-through-stash (load the target week / write the stash / or whole-refuse) + the key-family test.

## Confirmed SAFE by the red-team (do not re-investigate)
- The LW leave-approval double-sided fold is correct — one `globalUndo` reverses both the lw cells and the minted/withdrawn Raptor input (Fable, full causedBy trace). One rare edge: an `OUTBOUND_PENDING`-deferred mint can land as an orphan on a later idle notify — worth a test, not a blocker.
- `reinstallLocks` does not double-apply / leak (Fable). Settings/Tracker never appear in a phase-2 closure (Fable). `computePubBar` clears the day after undo-of-publish (Fable).

## Verdict + the open decision
Both reviewers: revise before build. The revisions add an engine-prerequisite step (2.0e: five fixes) and re-scope the LW cutover with collection-level eligibility — material enough that a SECOND red-team round on this Rev 2 is the prudent default before building. Alternative: build Rev 2 now and rely on the standing post-build dual code inspection to catch regressions. Owner's call.
