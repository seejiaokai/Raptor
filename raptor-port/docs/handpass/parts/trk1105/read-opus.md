# The Tracker tidy — the fresh, blind Opus code read (5 Nov 26, `claude/tracker-standalone-tidy`, pull request 637)

Reader: a fresh Opus helper that did not write the change. Read-only; the one file written is this one. Diff read:
`git diff c7ddf441b..HEAD -- raptor-port/src raptor-port/scripts raptor-port/e2e` (the `scripts/handpass/trk1105-*` walk
tools only skimmed for selectors).

## Verdict

**PASS — no HIGH, no MEDIUM; two LOW (records), and a tidiness note.** The one claim that carries risk — that the running
app never reaches the Tracker's storage doorway with nothing plugged in — holds on every route I could find. There is one
entry (`index.html` → `src/main.tsx`); `main.tsx` awaits `bootApp(chooseBackend(), …)` before `createRoot(...).render`,
and a failed boot draws only the error card. `bootBody` plugs `setStorageImpl(trackerTarget(wb))` unconditionally as
its second statement, on every backend (browser; memory for dev, tests and `?fresh=1`). Nothing reaches the doorway
earlier: the boot's fold registers `tracker/fold.ts`, which imports only `app/rows.js` (no doorway); `core.js`, the
doorway's only user, is loaded only by the lazy `TrackerPage` chunk, which only `Shell.tsx` (rendered after the boot)
imports, and the desktop pre-warm is a Shell effect. There is one whiteboard (`storage/boot.ts`) and one plug; nothing
outside the tests calls `setStorageImpl` again, and nothing in the app unplugs it (logout, `resetSession`, the reset
path and Retry do not; Retry reloads the whole app, D1633/D1638). `storage.js` is imported statically by `boot.ts`, so
the lazy chunk shares that module instance. The rename `useSaveHealth` → `setSaveHealth` is the same function, called
with the same postman at the same point in `main.tsx`; no reader of the old name is left in `src`, `scripts`, `e2e` or
`probes`. The bar's own Undo / Redo pair was never drawn inside the app (the page seam set `hosted` at chunk load, before
any render), and the top bar's pair (`Shell.tsx` `pairOn` includes `tracker` for everyone; `UndoPair` with ids
`trUndoBtn`/`trRedoBtn`, `trackerUndoEngine` → the same `core` undo functions through `undo-bridge.js`) is unchanged.
The tests: no assertion was loosened while its behaviour stayed — the ones removed were about the pair that no longer
exists; the memory fallback matches the whiteboard's in-session behaviour (both keep the raw value, `null` for missing,
insertion-order keys) more closely than jsdom's localStorage did, and vitest's default per-file isolation keeps files
apart. The one test that read the old `ocu:` path directly (`eventDetails.test.tsx`) now goes through the real
`trackerTarget` with the same assertions. I ran `src/tracker/storage.test.ts`: 6 / 6 pass.

## Findings

### LOW 1 — a reference document still names the old setter
- **The failure:** `raptor-port/docs/feature-impact.md` line 145 (the Tracker tab row, the "Since 17 Oct 26" sentence)
  still says the doorway hears Raptor's saver through "`main.tsx` → `storage.js useSaveHealth`". The next chat that walks
  the ripples of a save-health change (this file is what the standing order reads) searches for a name that no longer
  exists and finds nothing in the code; the builder's report says `feature-impact.md` was updated, but only another part
  of that row changed.
- **The cause:** the rename in `src/tracker/storage.js` (line 58) and `src/main.tsx` (line 13) did not reach this line.
- **The fix:** in that sentence, write `storage.js setSaveHealth`. A notes-only edit; nothing else in the repo outside the
  archives and the walk's own files still names `useSaveHealth`, `trackerHosted`, `setTrackerHosted` or `OwnUndoRedo`
  (searched).

### LOW 2 — the work left over by this job is not in the backlog
- **The failure:** the builder found, and left on purpose, more code kept only for a standalone Tracker: the Tracker's
  own copies of the app's glyphs and pencil (`components/Glyphs.jsx` — its comment still says "so a standalone export
  carries them" — and `SrchGlyph.jsx`), and its own palette for a page with no `:root` (`tracker.css` lines ~31, 69, 452,
  476, "the standalone rule"; pinned by `trk-palette.test.ts`). It is recorded only in `docs/tracker/known-gaps.md` and
  the builder's report. `OUTSTANDING.md` has no item for it, and `[TRK-STANDALONE-LEFTOVERS]` will leave for the archive
  when this branch closes; then the open job has no line in the one backlog, against the rule that open work is filed
  there (D29, `doc-structure.md`).
- **The cause:** the residue named by the build was not filed (`OUTSTANDING.md` is not changed by the branch).
- **The fix:** before `[TRK-STANDALONE-LEFTOVERS]` is archived, file a new backlog item (and a line in its priority
  list) for the Tracker's copied glyphs, pencil and palette — taken back to the app's own, each change shown to him
  first, since a copy that has drifted would change what he sees (D1625) — and point `known-gaps.md` at it.

## Roll-call gaps (§3 of the sheet)

None that changes the result. Each "Plugged before? YES" I checked against the code is true. Notes:
- Table A could name two more routes, both of which I traced and found safe: the boot's own one-time Tracker conversion
  (`tracker/fold.ts`, run inside `bootStorage` BEFORE `bootBody` plugs the doorway — safe because it reads the fetched
  entries through `app/rows.js` and never the doorway), and the desktop's hidden pre-warm of the Tracker's download
  (a `Shell.tsx` effect, so after the boot).
- The "Page-download Retry" row says Retry reloads the app; since D1638 a Retry whose files do not come does not reload
  and draws nothing, so the row holds either way.
- Table B is complete for the Tracker; the Guest app draws no Tracker.

## Tidiness note (changed lines only — filed, not fixed, D489)

1. **Harder to follow:** the new comment wording in `src/tracker/app/core.js` lines ~2020, ~2042, ~2118 and ~2126 repeats
   "with nobody signed in as a person — a guest, a pending account, or a test with nothing wired" four times; twice it
   leaves a dash unclosed and the sentence ungrammatical ("Signed-in people only; with nobody signed in as a person — a
   guest, a pending account, or a test with nothing wired, the shared answer, as before.").
2. **A little untrue:** `src/tracker/storage.js` (the target comment) says the boot plugs the whiteboard in "before
   anything else". The storage fetch, the fold and the documents drawer run first; what is true is that the doorway is
   plugged before anything can reach it.
3. **A fallback whose reason moved (next to the changed lines, not in them):** `core.js`'s "local only" save word (lines
   ~700, 742, 753) and the read-back comments (~1262, ~7332) were for a browser with no storage, when the doorway's `set`
   threw "no storage". That throw is gone; only a target that throws reaches them now.
4. **Duplicated or brittle pins:** `tracker.test.tsx` ("the seam stays light") now pins the top bar's pair by a regular
   expression over `Shell.tsx`'s source, which `topbar-pair.test.tsx` already pins by drawing it. The new `storage.test.ts`
   pins read `main.tsx` and `boot.ts` as text, and the `bootBody` one asks for the plug to be exactly the second statement.
   They do guard the claim, but a harmless reorder or reformat turns them red.
5. **A way to fail loud, not a fault:** with nothing plugged in, the doorway now silently keeps records in memory. Today
   nothing can reach that state, and the tests above guard the order. If a future change ever reached the doorway before
   the boot, the writes would vanish on reload without a sign. A warning when the memory fallback is first written outside
   a test would make that visible. Recorded as a thought only.

## What I read, and what I did not

**Read:** the brief; the whole diff for `src/` (all 22 files, code and tests); `src/boot.ts` (boot and `bootBody`);
`src/main.tsx`; `src/storage/adapters.ts` (`trackerTarget`); `src/storage/whiteboard.ts` (get/keys/set); `src/tracker/storage.js`
in full; `src/tracker/fold.ts` and `app/rows.js` imports; `core.js` around the doorway (`sGet`/`sSet`/`list` callers, the
prefs, `addStudent`, the changed comments); `Shell.tsx` (the pair, the lazy Tracker import, the pre-warm); `ui/topstate.ts`
`trackerUndoEngine`; `ui/pagedownload.ts` (Retry); `peoplewire.ts` (`projectForTracker`, the wire); `boot.ts`
`bootstrapFirstAdmin` and `state/roster-add.ts` `personRecord` (ground crew gets `pers: true`, so the no-roster premise
holds); `vite.config.ts` (test isolation); `index.html` (one entry); the evidence sheet §1–§5; the builder's report;
`OUTSTANDING.md`'s `[TRK-STANDALONE-LEFTOVERS]`; `docs/tracker/known-gaps.md` (head); `docs/data-schema.md` §World 3 key
lines; `docs/feature-impact.md` line 145; `scripts/tracker/smoke.mjs` (head, its storage and undo-pair checks).
Searches across `src`, `scripts`, `e2e` and `probes` for `ocu:`, the removed names, `setStorageImpl`, `new Whiteboard(`,
`storeBackend.impl =`, and every test file that loads `core.js`, for localStorage seeding, clears and module resets.
**Ran:** `npx vitest run src/tracker/storage.test.ts` — 6 / 6 pass.
**Did not:** the other test files (the builder reports 552 / 552 for `src/tracker` and 453 / 0 for the smoke suite; not
re-run here), the build, the app, the walk's pictures; I did not read `core.js` whole (about 7,000 lines; searched it);
I did not check every `sSet` call's value type beyond the list of calls (all strings by their names; and in the running
app the whiteboard, not the fallback, holds them).
