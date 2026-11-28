# Walker's brief — one man's row of a shared absence (pull request 845), the walk of 25 Nov 26

You are one of three walkers of a FULL bug check. Each walker has its own share (named in the message that started you)
and its own world: a fresh browser context for every scenario, its own files, its own pictures. You drive the REAL app —
a frozen production build — by a scripted browser, as a person would, and report what the screen said and what was
saved. You do not read code to find bugs, you do not fix anything, and you do not decide whether a finding is real: the
host reproduces every finding before it counts.

## Where you work, and what you may touch

- The project: `C:/Users/User/projects/Raptor-row` (branch `claude/shared-leave-row-177`). Run everything from
  `C:/Users/User/projects/Raptor-row/raptor-port`. Do not open or write into any other copy of the project.
- **The build under test is frozen: `.tmp/build-6c7f3aac7`** (bundle `index-BiU7Aj55.js` — print `bundleOf(page)` in
  every run and stop if it differs). Your share is in `docs/superpowers/briefs/2026-11-25-shared-row-walk-shares.md`.
  Never build, never run `npm run build`, `vite build`, a Playwright test (`npx playwright test` builds) or any unit
  test; never edit anything under `src/`, `e2e/` or `docs/` other than your own files below; never commit, push,
  switch branch or run any git command that changes anything. The host holds the checks lock for the three of you.
- Your own files, and nothing else: scripts `scripts/handpass/shr-<your letter>-*.mjs`; pictures
  `docs/img/handpass/2026-11-25-shared-row/<your letter>/` (a sub-folder per run — never reuse a number, never mix a
  failed attempt's pictures into the run you cite); scratch and your report under `.tmp/shr-<your letter>/`.
- Read `docs/walk-scripts.md` §3 to §7 before you write a script. Its rules are part of this brief.

## The machine's traps (you load none of the host's memory)

- Write every script to a FILE with the file-writing tool and run the file; never pass a script inline to the shell
  (backslashes are lost, an apostrophe fails to parse, often silently). Never write a file through a shell heredoc.
  Never send a script's rewrite and its run in one step. Print a version line at the top of every run.
- Files are UTF-8. Shell is Git Bash; there is no `jq`.
- A script under `scripts/handpass/` imports the shared library as `./wr4-lib.mjs`.
- Stop every browser and script you started before you report. Report ONCE.

## The route, proved by the host today on this build

`scripts/handpass/shr-w3.mjs` — the fault's own reproduction — PASSES on this build at desktop and phone size in
Chromium and WebKit (`WR4_OUT=<picture folder> WR4_NEW=<build folder> SZ=desk|phone ENG=chromium|webkit node
scripts/handpass/shr-w3.mjs`). Copy its ways, do not invent others:

- `wr4-lib.mjs` serves the frozen build INSIDE the test browser (no port, no server; `WR4_NEW` = the build folder,
  `WR4_OUT` = your picture folder): `newPage(size, undefined, NEW_DIR, engine)` (sizes: `desk` 1440×900 at 2×, `phone`
  402×874 at 3× with touch), `signIn(w, 'ad')` (the admin; a member signs in with his own sign-in name, the same word
  as password — read `wr4-lib.mjs` and the people list on screen for names), `fileInput(w, tag, L.WED, { type: 'LL',
  people: [L.RANGER, L.HEX], from: '08:00', to: '10:00' })` files a shared leave through the Inputs page's own window,
  `go(page, 'editsched')`, `bundleOf(page)` (print it: it proves which build you are on), `boxOf`, `press`, `handOver`.
- The Scheduler Board: `window.openScheduler(2)` after `go(page, 'editsched')`; the Unavailable list's boxes are
  `#schedBoard [data-ifld="<iid>~<person>.str|end|rmks"]` — find a man's row the way `shr-w3.mjs` `rows()` does.
- Edit Schedule's week: the Unavailable cells are `[data-inp="<iid>~<person>.str|end|rmks"]` (typed in place);
  `scripts/handpass/wr4-d-d34.mjs` and `wr4-d-probe.mjs` drive them — read those first.
- The Leave War: `scripts/handpass/lw-r3-lib.mjs` and `lw-r3-walk.mjs` open the grid, a cell's window and its Remarks
  box; `scripts/handpass/lw-nb-docclose.mjs` opens and closes the document viewer. Read them first. A member's own
  day is a bid window only while his dates are open; closed, it opens his leave's Remarks window.
- What is SAVED is read from the page: `window.INPUTS` (each record: `iid`, `type`, `date`, `endDate`, `people[].p`,
  `s`, `e` in minutes, `allday`, `half`, `remarks`) — as `shr-w3.mjs` `leaves()` does. Ranger's person id is `bane`,
  Hex's `rocky` (the library's `RANGER`, `HEX`); find others on screen.
- A change is taken back with the app's own Undo button — on the Board `#sbUndo` / `#sbRedo`, elsewhere `#undoBtn` —
  never the keyboard's undo keys.

Known traps in the drivers: on the Board the page's own `#undoBtn` is covered — press `#sbUndo`; the test browser's
WebKit on Windows cannot keep a document file, so a phone walk there shows "Couldn't save that document…" — a fact
about the test browser, ignore it and do document steps in Chromium; two taps on one box closer than about 600ms are a
double tap; a member's sign-in on a fresh world: make one write as the admin first, then sign out and in in the SAME
tab (or use `handOver`) — never two live tabs for two people.

## How every scenario is walked and judged

- A fresh browser context per scenario; the fixture made through the app's own controls (the Inputs page's window, the
  Board's own doors), each fixture step asserted to have landed before the next relies on it. If a state cannot be
  reached through the app's controls, say so — that is a finding of its own; never plant it into the data.
- **After EVERY save (each Tab, Enter, tap away) read and print three things:** (1) the STORE — every input of the men
  in the scenario on that day; (2) the SCREEN before the caret leaves the section — the value of each box of each
  man's row, and the address each box carries; (3) which box holds the caret. Then again after the caret has left the
  section, and after a reload where the scenario says so. Screen and store must agree at every step.
- Each scenario has an EXPECTED line. Judge it PASS or FAIL against that line. "RECORD" appears only where the
  scenario says RECORD: there, write exactly what the screen says, word for word, and do not judge it.
- A step whose right result is that nothing changes also proves the press happened (the box held the caret, the
  refusal's own words showed).
- A check that could not act (its own set-up failed) is NOT WALKED, never FAIL — say why.
- One picture per assertion that matters, cut to the Unavailable list or the window it is about; on a phone, every tap
  gets a picture within about 100ms of the lift (pointer left where it pressed) beside the settled one; on a phone,
  what a press opens is proved on screen (its box inside the screen) before anything in it is pressed, and the page
  is not scrolled by the script first where a finger would not.
- After every refusal at a box: tap away, tap the box afresh, type the figure it shows — and say what happened.
- Watch the browser's error list throughout; any page error is reported.
- Stop and report after three failed attempts at one gesture. Before calling any FAIL a fault, ask the questions of
  `docs/walk-scripts.md` §7 (what does the world really hold, what did the script really press).

## What you hand back

Write your whole report to `.tmp/shr-<your letter>/report.md`: the bundle name you ran on; a table — scenario id |
size and engine | PASS / FAIL / RECORDED / NOT WALKED | what the screen said and what was saved (the printed values) |
the picture file(s); then each FAIL written out with its exact presses so the host can reproduce it; the errors seen;
what you did not walk and why; the final run's picture folder(s) and count. Your reply to the host is a short summary:
the counts, each FAIL in one line, the report's path. The host opens the pictures behind every FAIL and behind every
PASS that concerns saved data, a published day or a member — make those pictures easy to find.
