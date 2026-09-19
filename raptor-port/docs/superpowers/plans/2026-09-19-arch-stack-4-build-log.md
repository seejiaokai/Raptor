# ARCH-STACK step 4 — build log (one absence record)

Branch `claude/db-step4-one-absence`. The design is FINAL (10 rounds + the owner's clash answers):
`docs/superpowers/specs/2026-09-19-arch-stack-4-one-absence-design.md` (later sections override
earlier) and `…-clash-catalogue.md` (owner answers + the agreed main-code order override the design).
This file is the running record of what is BUILT, so a new session can resume from the repo alone.

## Phase status (design §14 order)

| Phase | What | Status |
|---|---|---|
| 0 | All-or-nothing group saves (whiteboard transaction + savepoints, postman groups, `putMany` + journal + boot replay, reset filter, phase-8 drain loop, deferred persists) | **BUILT, tests green** (19 Sep 26) |
| 1 | Tests + `cellFor` (= `engine/dayview.ts` + `absences.ts`) | **BUILT, tests green** (20 Sep 26) |
| 2–5 | Stored records as a LIST per day (`engine/warrecs.ts`), merged read (`state/merge.ts`), figures read day views, runInbound/runOutbound/retract deleted, absence door in sync.ts | **IN PROGRESS** (20 Sep 26, overnight) |
| 3 | Absence index + merged `getState()` + structural sharing + perf gate | — |
| 4 | Delete `runInbound`/`retractLwRow`/ingest/withdraw; inputs door consumes/replaces bids | — |
| 5 | War commands + one-envelope bulk entry points + delete `runOutbound` | — |
| 6 | Landing `srcType` + OIL marker | — |
| 7 | Docs → cross-provider CODE inspection → hold for "merge live" | — |

## Owner checkpoints still ahead
- Before building the Leave War multi-record box (the `+n` / amber `!` cell and its tap list): show the
  owner the REAL thing in the app's colours at phone and desktop width.
- A focused one-round check of the clash rules (Codex + Fable) was run 19 Sep 26 at the owner's request;
  its findings are folded in below.

## Phase 0 — what was built (where)
- `src/storage/whiteboard.ts` — listeners get GROUPS; `transaction()` (net change at commit, `abort`,
  nested join), `savepoint` / `rollbackTo` / `release`.
- `src/storage/postman.ts` — one group in flight + one merged pending group; a failed group merges
  UNDER pending (retry = superset); backoff not skipped by fresh writes; `initialFailed` from boot.
- `src/storage/backend.ts` — `Entry`, required `putMany` / `unfinished` / `writeJournal`, `parseGroup`.
- `src/storage/memory.ts`, `browser.ts` — journal (`raptor:__txn`), replay before read, overlay +
  `unfinished` when replay cannot finish, malformed journal dropped; Memory knobs `crashNextAfter`,
  `failReplay`, `peekJournal`.
- `src/storage/boot.ts` + `reset.ts` — §22.2 order: replay → filter the unfinished group when a reset
  is due (rewrite journal first; a failed rewrite rejects the boot) → reset → postman seeded FAILED.
- `src/command/commit.ts` — `setTxnWrapper`; outermost dispatch opens ONE transaction, closes after
  the queue drains (abort on a RETURNED outermost refusal); a savepoint per pipeline rolled back on a
  returned refusal, kept on a throw; `releaseLatch` drains re-deferred effects (8 rounds + final).
- `src/state/persist.ts` — `wirePersist` installs the wrapper; `histPush` defers `persistAll`.
- `src/leavewar/state/store.ts` — both in-command `rawPersist` calls deferred to phase 8.
- Tests: `storage/whiteboard.test.ts`, `postman.test.ts`, `contract.test.ts` (group contract on
  Memory, Browser, Browser-with-faults), `boot.test.ts` (recovery + reset filter + failed rewrite),
  `command/command-txn.test.ts`, `state/txn-wiring.test.ts` (real boot wiring; the refused-write test
  is red without the change — verified).
- Known limitation carried (design §20.3/§21.4): two tabs still clobber each other; an asynchronous
  future backend's unload gap is step 5's.

## Owner rulings during the build (20 Sep 26) — also in `specs/2026-09-20-arch-stack-4-clash-check.md`
- A/B recommended; C: leave may be dated before posting-in and after posting-out (filed or bid).
- H3 overruled: two leaves in one half at non-overlapping times are allowed; the half is charged ONCE.
- D: a shared half on different balances — the leave covering more time pays (tie → earlier).
- Owner OK'd (20 Sep 26, going to sleep): build the multi-record box to the approved comp without a
  pre-build picture; show real phone + desktop screenshots in the morning. Stay in this chat.

## Architecture as built (phases 2–5) — read this to resume
- `engine/warrecs.ts`: `LeaveWar = { period, recs }`; `recs[pid][date]` = list of Request /
  Credit(auto|manual, spans?) / Notice records. `readRecs` rejects old shapes (reset, don't migrate).
- `engine/dayview.ts`: `dayView(contribs)` → main code, `+n` / `!`, charges (a half charged once),
  away, duty, earnsOil, annualFull. `Views` type.
- `absences.ts`: Inputs → contributions; `inputRowFor` (war leave → Input row); `leaveKey`.
- `state/merge.ts`: `mergeWar(war)` = recs + absence index → `grid`/`states` projections (main code;
  `source:'raptor'` = locked on the war, the blue edge) + `views`. Cached per war/person.
- `state/store.ts`: `getState()` = MERGED (`MergedState`); `rawState()` = stored. Writers work on
  recs; `gesture(type, fn)` = one command per war gesture; the ABSENCE DOOR (`setAbsenceDoor`) is
  installed by `sync.ts` (approve / decideApproved / removeApproved / moveApproved, all writing the
  Input through `writeInputsBatch` inside the gesture). `lwEditLists` = the door's record edit.
- `engine/charge.ts` etc.: every figure reads `viewsOf(source)` (a bare grid/states fixture is
  converted by `legacyViews`, so there is one reading path).
- `sync.ts`: `refreshAbsences()` (per-person signature over war-visible Inputs → `setAbsenceRows`),
  clash strip derived from `views[..].conflicts`, OIL pass writes `auto` credits with work `spans`.
- Still TO BUILD: the Inputs-door rules (bid replacement + notices, sick cuts leave, refusals, redo
  invariant), publish replacing weekend/PH bids (B5), notices UI + "OK, seen", the box `+n`/`!` +
  tap list UI, posting-out filing (H5), SCHEMA_VERSION 3→4, seed/test re-baseline, docs, gates,
  cross-provider code inspection.

## Resume point (20 Sep 26, ~65% context — checkpoint commit)
- Leave War suite: 1446 pass / 39 fail. Remaining failing files: quarantine-pile1, undoaudit,
  ui/remarks, oilsync, ui/scrim, state/write-seam, state/raptorRoster, causal-envelope,
  ui/undermanned, storage-seam, state/lw-commit — mostly tests of deleted ingest/runInbound/
  runOutbound/source; rewrite each to the new model (see sync.test.ts for the pattern:
  `fileAbsence` from `testkit.ts`, `syncAbsences()` after a Raptor-side INPUTS change).
- Test setup: `src/leavewar/test-setup.ts` (vite.config leavewar `setupFiles`) resets INPUTS per test
  to pristine + SEED_ABSENCES; `initStore` runs the test hook (door + syncAbsences).
- Engine suite fully green; store.test and sync.test green.
- Then: Raptor-side suite (`npx vitest run --project raptor`), typecheck incl. tests, then the
  still-TO-BUILD list above.
