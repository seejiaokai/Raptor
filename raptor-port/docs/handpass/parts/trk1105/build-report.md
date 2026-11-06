# The Tracker tidy — the builder's report (the night of 5 Nov 26, job 2, phase A)

Saved as it arrived (the overnight guide). Builder: a fresh Opus helper. Branch `claude/tracker-standalone-tidy`, cut from
`origin/main` `c7ddf441b`; last pushed commit `8b94fb1e5` (`35c2aedea` React Doctor, `8b94fb1e5` the leftovers). Status:
READY FOR WALK.

## [TRK-STANDALONE-LEFTOVERS], one by one
1. **The bare `ocu:` localStorage path in `src/tracker/storage.js` — removed.** The running app never takes it:
   `src/boot.ts bootBody` calls `setStorageImpl(trackerTarget(wb))` with no condition, on every backend (browser; memory for
   dev, tests and `?fresh=1` — all through `chooseBackend` → `bootApp`); `main.tsx` awaits `bootApp` before rendering, and a
   failed boot draws nothing; `core.js`, the doorway's only user, loads in the lazy TrackerPage chunk, after the boot. No
   saved data depends on it: a browser's old `ocu:*` keys are brought in once by `storage/browser.ts` (its LEGACY list),
   unchanged. With no target plugged in (only a unit test that never boots), the doorway keeps records in a private
   in-memory store (`setStorageImpl(null)` starts a fresh one), never touching localStorage — chosen over throwing so the
   ~20 test files that mount the Tracker without a boot keep working unedited; vitest's per-file modules keep them apart.
   Only `eventDetails.test.tsx` read the bare path directly — it now seeds and reads a Whiteboard through the real
   `trackerTarget`, the same assertions. The smoke suite's one negative check (`ocu:barHidden` stays null) still holds.
2. **+ Add's "Student callsign:" prompt with no roster (`core.js addStudent`) — kept.** Reachable inside Raptor:
   `projectForTracker` hands over aircrew only (no `pers`, ground crew, archived or special), so a new shared store whose
   one person is a ground-crew first admin, or a roster of archived aircrew, hands over an empty list. Its pin in
   `tracker.test.tsx` now feeds that empty list through the real projection, with a premise assertion; comments re-grounded.
3. **The no-import shape of `role.js` and `people.js` — kept.** `role.js` is imported by Raptor's store and logout; importing
   `core.js` there would pull ~280 KB into every visit (pinned by `tracker.test.tsx`). `people.js`: the Tracker reads nothing
   of Raptor's store (the three seams); `peoplewire.ts` is the one file that knows both sides. Their answers with nothing
   wired (`trackerIsAdmin` yes, `whoami` '') reached only by tests — comments re-grounded, two test titles renamed
   (`trk-flex-setting`, `leftovers`), assertions unchanged.
4. **Beyond the list, removed: the Tracker bar's own Undo/Redo pair (`OwnUndoRedo`, `Header.jsx`) and the `hosted` flag
   (`setTrackerHosted`/`trackerHosted`, `undo-bridge.js`, set by `TrackerPage.tsx`).** Never drawn in the app — the flag was
   set at chunk load, before any render. `tracker.test.tsx`: EVERYONE no longer expects `#trUndoBtn`/`#trRedoBtn` in the bar;
   a new test says the bar draws no pair; the source pin checks `Shell.tsx`'s UndoPair ids. The top bar's pair still pinned
   (`topbar-pair.test.tsx`, the smoke's "↶ ↷ sit in the app's top bar, not … the Tracker's header").
5. **Documents** — `docs/tracker/known-gaps.md` (what went, what stayed, why; the standalone-export notes marked history),
   `docs/data-schema.md` (the legacy import is the browser backend's; no browser-storage path in the doorway; nothing stored
   changes), `docs/file-map.md`, `docs/feature-impact.md`, the Tracker row of `raptor-port/CLAUDE.md` (keys
   `raptor:tracker/*`); `data-model.md` unchanged (no table changes).

## React Doctor (0.9.18): the Tracker's 11 findings all gone (583 → 572 overall, 0 in the Tracker)
Seven test-file JSON deep clones → `structuredClone` (copies only: courseIds.test:61, ids.test:46 and 142, sylIds.test:95,
leftovers:858 and 879, trk-rows:48). Three kept with a reason on the line above (fileFormat.test:77,
trk-flex-setting:261, trk-restore:219 — the round trip is the point, standing for a file written and read back). One
outside the folder, caused by the Tracker: the doorway's setter `useSaveHealth` is not a hook and `main.tsx` aliased it —
renamed `setSaveHealth` (`storage.js`, `main.tsx`, `trk-batch-store.test.ts`). `doctor.config.json` untouched.

## Tests and checks
Red before the change: the two new no-target storage tests and the two undo-pair tests; the new boot-plug tests pass both
sides (they prove the existing wiring). No assertion weakened (the ones removed were about the pair the code no longer has).
Unit `src/tracker` under the lock 28 files / 552 PASS; `src/tracker` + `src/storage` + boot, topbar-pair, shell-keepalive,
changebatch-rollcall, pageload, pageclaw, login-reopen 47 files / 824 PASS; `npm run build` PASS; `npm run smoke:tracker`
(port 4350) 453 / 0; `lint:changed` no new finding (27 files); docsize PASS. NOT RUN: the full unit suite, e2e,
`reference/tfin.js` — GitHub's run (D1086); `src/engine` untouched.

## What a person sees
Nothing changes (every route the running app takes draws the same screen and saves the same records; the removed pair was
never drawn; the kept prompt unchanged; the doorway change only touches a state the app cannot reach) — not yet confirmed
by a walk with pictures (phase B).

## For the coordinator
1. `.claude/rules/decisions/tracker.md` §Architecture stale ("the bare `ocu:` path is the standalone/no-target fallback";
   the pair and flag gone) — corrected by the night's chat in the same branch.
2. Two standalone-only copies remain, a job of their own (a merge could change pixels if a copy has drifted): the
   Tracker's own drawings of the app's glyphs and pencil (`components/Glyphs.jsx`, `SrchGlyph.jsx`, kept equal by
   `tracker.test.tsx`), and its own palette for a page with no `:root` (`trk-palette.test.ts`).
3. A stray preview server holds port 4179: `vite preview` from `C:\Users\User\projects\Tracker` (the old standalone
   repository), running since 27 Oct; the lock moved the smoke to 4350; not stopped.
No older fault met.
