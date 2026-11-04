# The Tracker tidy — the walker's brief (5 Nov 26, `claude/tracker-standalone-tidy`, pull request 637)

You are the ONE walker (Sonnet 5.5) of a FULL-tier bug check. You drive the RUNNING app through its own controls, take
pictures, and report PASS / FAIL per step. You do not read code for bugs and you do not fix anything.

## Read first
- `raptor-port/docs/walk-scripts.md` §3–§7 (fixtures, steps, pictures, re-walk, reading a FAIL). Required.
- The scenarios you walk: `raptor-port/docs/handpass/parts/trk1105/scenarios-opus.md` (S1–S19, by a fresh Opus designer).
  Walk every one, at the sizes and roles it names, unless this brief says otherwise below.
- The host's passing route script — your recipe for signing in, opening the Tracker, opening a ball's marking pop-up,
  marking DCO and pressing the top bar's ↶: `raptor-port/scripts/handpass/trk1105-route.mjs` (8/8 PASS on this build,
  desktop and phone). Its helpers come from `raptor-port/scripts/handpass/trk-lib.mjs` (`open`, `login`, `logout`,
  `toTracker`, `toPage`, `shot`, `core` — read-only look into the Tracker's store, `log`, `save`). Older patterns you may
  copy: `scripts/handpass/trk-batch-walk.mjs` (scenario S there is the forced failed save; `openBall`, `addMember`,
  `addTyped`, the `words()` reader of the save corner and the top bar's band).

## What changed (nothing a person sees is meant to change)
1. The Tracker's storage doorway lost a path that wrote the browser's storage under keys beginning `ocu:`. Every Tracker
   record must land under `raptor:tracker/…` and NO key whose name begins exactly `ocu:` may ever be created or changed.
   Keys beginning `ocuLocal:` are EXPECTED (per-browser view choices) — never count them as a failure.
2. The Tracker's save corner (`#saveStat`, "● saved" at the Tracker bar's right) must never say saved while the app's
   top bar shows "Not saved — keep this page open" with Retry.
3. The Tracker's own Undo / Redo pair on its bar is removed; the ONE pair is `#trUndoBtn` / `#trRedoBtn` inside the app's
   top bar (`.topbar`). On any Tracker screen, at any size, in any mode: exactly one of each, inside `.topbar`, none
   inside `#page-tracker`.

## The build and how to reach it
- A frozen build is ALREADY served at **http://127.0.0.1:4180** (bundle `assets/index-DTX1F34K.js`). Use exactly that
  address (`HP_URL=http://127.0.0.1:4180`) — never `localhost:4180` (another origin: its storage is separate), never
  start, stop or rebuild any server, never run `npm run build`, the smoke suite or the test suites.
- Sign in: `ad` / `a` (admin), `us` / `us` (member).
- Sizes: **D** desktop 1536 × 864 Chromium (trk-lib's `open({ size })`); **P** iPhone 402 × 874, touch, **WebKit**
  (`webkit` from `@playwright/test`, `hasTouch: true, isMobile: true, deviceScaleFactor: 3`; trk-lib's `open` launches
  Chromium only — write your own small opener for WebKit, copying its sign-in and listeners; WebKit is installed);
  **L** the phone on its side, 874 × 402, WebKit touch. Where a WebKit step cannot be driven after 3 honest attempts, run
  it in Chromium touch at the same size and say so.
- On a phone, every tap gets TWO pictures: one within about 100 ms of the lift (pointer left where it pressed) and the
  settled one (D1281).
- Every step listens for console errors, page errors and HTTP 4xx/5xx. Any one is a finding unless the step forced it
  (the quota fixture, a blocked download) — name those.

## Fixtures you may use (the only outside acts allowed — everything else through the app's own controls)
- **A failed save:** an init script (`context.addInitScript`) wraps `Storage.prototype.setItem` so that while
  `window.__failSaves === true` a write of a key starting `raptor:` throws `new DOMException('walk: forced',
  'QuotaExceededError')`; flip the flag with `page.evaluate`. (S6, S7, S8, S18.)
- **Storage that cannot be touched (S4):** an init script that makes reading `window.localStorage` throw a SecurityError.
- **A planted old key (S5):** after S1's world exists, set ONE `ocu:` key by `page.evaluate` (data, not a state).
- **A blocked page download (S18):** `page.route` aborting the Tracker page's own files (find their names in
  `http://127.0.0.1:4180/page-files.json` or the network log), then un-route.
- **A slow network (S15):** a CDP session `Network.emulateNetworkConditions` in Chromium.
- Reading storage (`localStorage` keys and values) and the read-only `core()` look are allowed to CHECK a screen, never to
  set anything up. Never use the probe bridge or `core()` to change data.
- Downloads: `acceptDownloads: true`; save the export file under your scratch folder, open it with Node and check it is
  JSON naming charts and students.

## Traps on this machine
- Write every script to a file with the file tool, then run it with `node <file>`; never pass a script inline to the
  shell. Never edit and run a script in the same step. Print a version line at the top of each run.
- Your scripts: `raptor-port/scripts/handpass/trk1105-walk-*.mjs` (new names only — list the folder first; never
  overwrite `trk1105-route.mjs`). Pictures: `raptor-port/docs/img/handpass/2026-11-05-tracker-tidy/walk/` (sub-folders per
  scenario are fine). Results JSON (`HP_OUT`): `raptor-port/docs/handpass/parts/trk1105/walk/`. Scratch (downloads):
  your own folder under `%TEMP%\trk1105-walk\`.
- `trk-lib.mjs`'s `open()` signs in and opens the Tracker; a sign-in reloads the page — never sign in again mid-fixture
  on a fresh world before one write has been made (bug-check order §7.7).
- The marking pop-up is `#pop`; grade buttons `#pop .opts button[data-g="dco"]` (also `fail`, `na`…, read them off the
  pop-up); the + Add button `#addStu`, its picker `#dlgList .dlg-item`, OK `#dlgOk`, the box `#dlgInput`; the Tracker's
  tabs on a phone `#page-tracker button[data-view="…"]`; the top bar's band `.topbar .savestat` (its Retry a button in it).
  If a selector here does not match the screen, find the right one from the screen and say so in the report.
- A FAIL is first read against the script's own world (walk-scripts §7): is the premise really on screen? Re-run once
  before reporting.
- Do NOT commit, push, or edit any file outside your scripts, pictures, results and report. Do not stop the server.

## What is NOT a finding (owner, D56)
A problem that lives ONLY in data already stored, where the code is already correct going forward, is not a finding —
the demo data is cleared before the database step. Report anything else you see, even outside the change, under "seen in
passing" (do not chase it).

## Scope and stopping
- All 19 scenarios; one picture per assertion that matters; stop after 3 failed attempts at one gesture and say so.
- Write scripts as ASSERTIONS of the right behaviour (a PASS means correct), so a re-run on a fixed build is the re-walk.
- Your report: `raptor-port/docs/handpass/parts/trk1105/walk-report.md` — a table: scenario · step · size · role ·
  PASS/FAIL · what the screen showed (one line) · picture file(s); then FAILs each with your reading; errors seen; what you
  could not walk and why; seen in passing; the scripts you wrote and how to re-run each. Write it as you go.
- Close every browser your scripts opened before you finish. Your hand-back message: a short summary (counts, each FAIL in
  one line) and the report's path.
