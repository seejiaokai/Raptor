# ARCH-STACK step 4 — build log (one absence record)

Branch `claude/db-step4-one-absence`. The design is FINAL (10 rounds + the owner's clash answers):
`docs/superpowers/specs/2026-09-19-arch-stack-4-one-absence-design.md` (later sections override
earlier) and `…-clash-catalogue.md` (owner answers + the agreed main-code order override the design).
This file is the running record of what is BUILT, so a new session can resume from the repo alone.

## Phase status (design §14 order)

| Phase | What | Status |
|---|---|---|
| 0 | All-or-nothing group saves (whiteboard transaction + savepoints, postman groups, `putMany` + journal + boot replay, reset filter, phase-8 drain loop, deferred persists) | **BUILT, tests green** (19 Sep 26) |
| 1 | Tests + `cellFor` + invariant checker | next |
| 2 | Record variants, `lw` provenance + `lwMoved`, reset + re-seed | — |
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
