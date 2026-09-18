# Session handoff — [GLOBAL-UNDO] phase 1 BUILT (engine + foundation); phase 2 next

## Where it is
[ARCH-STACK] step 3, **[GLOBAL-UNDO]** — one global per-session undo. **Phase 1 (design §13) is
BUILT, test-first, all five gates green**, on branch `claude/global-undo` (NOT merged — awaiting the
owner's "merge live"). Design of record: `docs/superpowers/specs/2026-09-17-arch-stack-3-global-undo-design.md`
Rev 6. Front-door contract: `docs/undo-contract.md`.

**Phase 1 is invisible by design:** the undo engine is built and tested but no module is cut over
(`setCutoverModules` is empty in production) and nothing imports the `src/undo/` module in a
production path, so it tree-shakes out of the shipped bundle — **zero rendered bytes change.** The
Vercel preview looks identical to before. The first VISIBLE change (the Unpublish button on the day
header, and undo/redo actually driving the buttons) is **phase 2**.

## What phase 1 delivered (all with tests)
- **`src/undo/`** — the engine:
  - `derive.ts` — pure record→context, record→owner (§5), invert() (§3.2), the §4.3/§8.1 weekstash
    key-family test. (derive.test.ts, 13)
  - `timeline.ts` — the stream-driven timeline: transitive causal-closure fold (R2-13), expectation
    map + sticky out-of-band barriers (§4.1), non-linear + redo-LIFO (§4.3/R3-06), mayReverse (§5),
    snap hooks + contexts (§8.1), the DERIVED publication barrier (§6.3), single globalUndo/globalRedo
    dispatcher (§9). (timeline.test.ts, 14)
  - `describe.ts` — the ONE central describer + bubble (§8.2), generic fallback.
  - `integration.test.ts` (3) — the timeline driving the REAL schedStore.write(): real text edits
    round-trip N→N→N and a real publish is reversed. **This is the phase-2 cutover in miniature.**
- **§6 unpublish subsystem** (the Unpublish button's engine; the BUTTON UI itself is phase 2):
  - `SCHED.retired` (append-only issuance log, keyed `<verId>~<n>`) + `SCHED.correcting` threaded
    through the FULL scheduler-state codec (SCHED init/resetSched, schedFields/histRestore,
    applyWeekModel, decompose/applyBook/schedWriteRecords/registry).
  - `retireIssued` + `unpublishDay` (publish.ts §6.5); `alIssue` stores the AL's `added` slice;
    `commitUnpublish` (sched-commit.ts) declares `Boundary.kind:'unpublish'`; the correcting-flag
    empty-delta reissue (§6.1 GU5-001). (unpublish-commit.test.ts, 8)
- **Foundation adds:** clone-on-write at the 6 scheduler+people write() sites (GU2-009);
  `weekstashStore.write()` (finding I); `commitAs` `causedBy`; `undo.restore` permission;
  `Boundary.kind` `'unpublish'`; `sched.retired` LogicalCollection + registry.

## Deliberately deferred (flagged, not forgotten)
- **`layRoster` (§10.1, needed phase 5) + `relandInputs` (§11, needed phase 2) extraction** — the
  design lists them in the phase-1 foundation, but they have NO phase-1 consumer or test, so
  extracting them now is untested dead code. Deferred to the phase where each is consumed and can be
  tested against its real caller. Do them at the START of phases 2 (reland) and 5 (layRoster).
- **MemoryDoor "harness increment":** MemoryDoor already exists; the disseminated-vs-silent path is
  modelled via `issuedDisclosed` in unpublish-commit.test.ts. No new hard invariant was added (a
  hard gate on issued-record deletion would reject the legitimate unpublish/restore); the engine
  property tests ARE the Step-3 increment.

## Gates (from raptor-port/) — all green after phase 1
`npm test` · `npm run build` · `node reference/tfin.js` (728/0) · `npm run test:e2e` ·
`npm run smoke:tracker`. Test-file changes that were EXTENSIONS not weakenings: publish-commit
completeness reconstruction (covers rt/cr), schema.test.ts (RETIRED spec + rt/cr/AL-added).

## Phase 2 — the scheduler + Leave War cutover (design §13 phase 2)
1. **FIRST extract `relandInputs`** (§11) with a test, then the `acc` strip+reland in the restore.
2. Cut the scheduler + Leave War over together (forced by `retractLwRow`; LW legacy restore is
   unreachable at the scheduler cutover): `installUndo()` at boot, `registerUndoStore` for schedStore
   + the LW store, `setCutoverModules(['sched','lw', ...])`, retarget the legacy Undo/Redo entry
   points (Shell/board/LW buttons + the keyboard shortcut) at globalUndo/globalRedo (§9), set the
   snap/bubble/reinstallLocks hooks.
3. The **undo-of-a-publish** special restore (§6.2): sign-offs CLEAR (not restore), retired entry
   only if disclosed — wire it where the scheduler is cut over.
4. The **Unpublish button** UI on the day header (§6.1), + the OIL-credit warn (§6.6 R4-05).
5. off-week/weekstash (finding I) via the now-wired weekstashStore.write().
Then phase 3 (people+settings), phase 4 (Tracker + whole-import), phase 5 (LW postouts + layRoster +
finding-A splice), phase 6 (delete the three dormant stacks, after step 4).

## How to work it
Opus, high, test-first. NO merge without the owner's explicit "merge live". Push to
`claude/global-undo`. Owner is non-technical — plain-language reports only
(`.claude/rules/plain-language.md`). After the whole build: the standing dual cross-provider CODE
inspection of the diff.

## Pick up here (fresh chat)
Select branch **`claude/global-undo`**. Read design Rev 6 §6/§7/§13 + this file, then start phase 2
at step 1 above (extract `relandInputs` first).
