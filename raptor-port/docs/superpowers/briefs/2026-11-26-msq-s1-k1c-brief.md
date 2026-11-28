# Section 1 (the guard rail) — step K1, third of three passes: K1c, the Tracker's list and bridge (chat 198, 26 Nov 26)

**K1 is part A of the plan — one answer to "what is open".** K1a landed the seam, the drawn predicates and the
guard's table; K1b the windows a component holds. **K1c (this brief)** gives the guard its view of the Tracker's
windows — a third app with its own store, which Raptor must never import (`tracker/role.js`'s head says why). No
door asks the guard yet: after K1c the app behaves exactly as today.

## Read first

- K1a's and K1b's briefs and reports (`raptor-port/docs/superpowers/briefs/2026-11-26-msq-s1-k1a-*.md`,
  `…-k1b-*.md`), and their code: `src/state/guard.ts`, `src/ui/guard.ts`, the two test files
  `src/ui/msq-guard-rollcall.test.ts`, `src/ui/msq-guard-open.test.tsx` with their `TO_COME` lists.
- `.claude/rules/seams/tracker.md` and `.claude/rules/decisions/tracker.md` (with the Read tool) — the Tracker's
  architecture and rulings; `.claude/rules/raptor-executor.md`.
- The plan `raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md`, by section, never whole (find
  each by its heading): **§21.1 whole** — its three blocks win over any older line; §3.1's last bullet ("The
  Tracker's windows"), §3.2 (g), §3.3, §3.4 (R4, R7), §3.5 (A7, A8, A11, A13); §9's lines on `tracker/app/core.js`
  ("five places"); §10's "Every step" rule.
- The presser's report, `…-msq-s1-k0p-report.md`, Part 2 A — what the keys reach with a lull pop-up open.

## What his answers decided — build these, not the plan's older "default / other answer" wording

- **An event's details (`infoId`) close by themselves** (D2597) — the `trkinfo` row.
- **The marking window (`pop`) closes, as today** (D2654 E2).
- **Down days and Failures (`downLog`, `failLog`) close by themselves**, in sight or hidden behind the Flow chart tab
  (D2654 E4).
- **Both lull pop-ups (`lullPick`, `lullCopy`) refuse** — `window`. The presser found the keys leave each pop-up and
  reach the squadron button, the name badge and the bell behind its shade, and a pick threw a half-picked lull away
  without a word (D2654 E4: "one that can hold a choice not yet saved is `window`"). Behind the Flow chart tab on a
  narrow screen the bridge marks them `behind: 'info'`, so the note (step K3) can name the Info tab.
- **Show All refuses** (`window`) — it was never put to him singly, and nothing closes by itself on a reading.
- Edit chart layout, Details mode and the tools set are modes: `'no'`.

## What is built

1. **`src/tracker/app/core.js`: one read-only table, `TRK_WINDOWS`** — `{ id, open, counts, panel? }` for each window
   state of §3.2 (g) (`panel: 'info'` for the four the Info panel draws). **`endSession()` is left exactly as it
   is.** Beside `onBeforeTrackerSwitch`, core registers with the bridge a function that answers **none unless the
   Tracker is drawn** (`ready && !bootError`, and with no course only `dlg` — the three gates of `App.jsx`), marks
   `behind: 'info'` on a panel window while the phone layout shows the Flow chart (`App.jsx` hands its `tab` to core
   beside `setTabSink`; the width is the stylesheet's own `(max-width:1050px)`), and one closer that clears the
   states that close by themselves — `infoId`, `pop` (with `popMsg`), `downLog`, `failLog` — and redraws.
2. **`src/tracker/role.js`: the bridge** — `onTrackerWindows(f)` / `trackerWindowsOpen(): { id, behind }[]`;
   `onTrackerCloseShown(f)` / `trackerCloseShown()`; and what the `trkask` row reads (`trackerAsking()` — the
   unsaved-edits question while `core.switchAsking && dlg`; if it exists already, use it). Never loaded: nothing
   open, nothing to close.
3. **`src/ui/guard.ts`: the rows** — `trk` (`where: 'tracker'`, `open() = !trackerCover() &&` any window that
   counts `window` is open; it leaves `dlg` out while `trkask` stands); `trkask` (`where: 'any'`); and the Tracker's
   closing row(s) (`counts: 'closes'`, `close: trackerCloseShown`) covering exactly the four states above — one row
   or one per state, whichever keeps R8's list honest: **each id cites its ruling in the test** (D2597 for
   `infoId`; D2654 E2 for `pop`; D2654 E4 for `downLog` and `failLog`).
4. Keep `src/probe-bridge.ts` in step if you add engine API (you should not need to).

**Not in K1c:** any door (`core.js ask`'s change at the view switch is step K5's), the note and every word a person
reads, the checker, `clickAway`, anything under `src/engine/`, any Raptor component.

## Tests first, each seen failing (a pin seen passing, and named a pin)

- **`src/ui/msq-guard-rollcall.test.ts`:** **R4** (every module-level name `endSession()`'s body resets is a
  `TRK_WINDOWS` id or is in the test's own list of what is not a window, with its reason; each dialog, `.modal` and
  `.pop` drawn in `tracker/components/*.jsx` counted per file and mapped to an id; each id drawn inside
  `SidePanel.jsx` carries `panel: 'info'`); R7's planted case for R4; R3's census extended to `src/tracker/` if K1b
  left it out; R8's Tracker additions.
- **`src/ui/msq-guard-open.test.tsx`:** **A7** (the Tracker's half), **A8**, **A11**, **A13** (on his answers: Down
  days behind the Flow chart tab → `whatIsOpen()` null and `closeShown()` closes it; a lull pop-up → its row, with
  `behind` set); A2 / A3 / A10 extended to the Tracker's rows.
- **The last test of each file proves its `TO_COME` list holds nothing K1 owes** — only what a later step owes by
  name (the "Add a person" report: K2b).
- **Must stay green, untouched:** `src/tracker/tracker.test.tsx` and every Tracker test that drives a session, the
  `msq-trk-*` tests, `src/ui/pops.test.ts`, `src/state/view-reset.test.ts`, every `msq-guard-*` file.

A test that will not fail first and is not a pin is reported, never bent. No existing test changes in this step.

## Then

As K1a's brief: the touched and named test files green (`npx vitest run <files>`, in `raptor-port/` by its full
path); `npm run build` only with the checks lock free and taken, and nothing serving on port 4741; no full suite and
no browser test. **The Tracker smoke** (`npm run smoke:tracker`, a browser suite that builds and serves itself) must
stay green with this step: run it **only** under the checks lock, taken by you, after your build — and if the lock is
held for more than about 30 minutes, report it NOT RUN with the reason. Do not commit, do not push, do not edit
`HANDOFF.md`, the plan, or any file outside `raptor-port/src` and your report.

## Report → `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s1-k1c-report.md`

Every file changed and why; `TRK_WINDOWS` whole, each id with its `counts`, its `panel` and its ruling; how each of
the four pop-ups of the Info panel is closed by a press outside today (the plan could not trace it) and whether each
holds anything to edit; each test seen failing first then green, or "pin — seen passing", with counts; `TO_COME` as
it now stands; every place today's code differs from the plan's account of it; what only a browser can show (the
panel hidden by a style rule). End your reply with the report's path and the four-line footer of
`.claude/rules/raptor-executor.md` (Status / Changes / Checks / Open items).
