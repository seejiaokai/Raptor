# Astra's work order — the top bar carried off screen by the page's spring (D1873, 8 Nov 26)

**You build this, on his word (D1873: "Call in Astra to fix").** Opus 5.5 (chat 16) reads, tests, walks and commits
what you write (D67, D1770). Paths are from the repo root unless they start `src/`, `e2e/` or `docs/`, which are under
`raptor-port/`.

## The job's terms — read these first

- Work in this checkout, on the branch it is on, `claude/lw-pin-last-frame` (pull request 694 — the pinned dates row,
  D1870). **Do not commit, push, stash, switch branch, merge or rebase; do not touch `HANDOFF.md`, `OUTSTANDING.md`,
  any rulings file, `.claude/`, or the two modified pictures under `docs/img/handpass/2026-10-27-lw-m4/d1444/`.** Leave
  your change uncommitted in the working tree; Opus reads the diff, runs the browser tests and the walk, and commits it.
- Read, before you plan: `AGENTS.md`'s read-first list (the rule files and `raptor-port/CLAUDE.md`),
  `raptor-port/docs/codex-guide.md` §When you build, `.claude/rules/raptor-executor.md`, `.claude/rules/ui-design.md`,
  and the area files `.claude/rules/decisions/design.md` (above all §The top bar, §Saving — the "Not saved" band,
  §The design guide's standing rules — "Nothing pinned leaks", §On a phone) and `.claude/rules/decisions/leave-war.md`
  (D1870, D1789, D1850, D1519). Search `docs/ui-contracts.md` and `docs/design-practices.md` for the top bar; do not
  read them whole.
- Checks you run: the unit tests of every file you touch and of every file that reads the bar
  (`npx vitest run <files>`, from `raptor-port/`), and `npm run lint:changed`. **Do not build, and run no browser test
  or Playwright script:** a build or a browser run needs his PC's checks lock and a free port, and Opus runs those.
- Write your whole report as your final message (shape at the end).

## The fault

- **His words:** "when in scroll all the way to the bottom, the top bar goes out of view", then, with a second
  recording on this branch's preview, "See the top bar when I scroll down", then "Call in Astra to fix". The backlog
  item: `OUTSTANDING.md` `[TOPBAR-BOUNCE-AWAY]` — read it whole; its "What might cure it" is a reading, not a plan.
- **What his recordings show** (his iPhone, Safari on iOS 26, whose toolbar folds away as the page scrolls; frames at
  60 a second tiled in `docs/img/handpass/2026-11-08-lw-pin-last-frame/his-recording-2-bounce.png`, frames 100–123,
  and `…/his-recording-bottom.png`): a flick reaches the page's foot, the page springs past its end (empty page shows
  under the last row), and for about 14 frames (~0.23 s) the top bar is gone — grid rows stand under the phone's
  status bar — then it comes back as the spring settles. It happened twice in the second recording, once with Safari's
  toolbar folded and once with it open. **Mid-scroll, as the toolbar folds, the bar stays** (frames 85–100): only the
  spring carries it off.
- **The decisive detail:** through the same spring the Leave War's pinned dates row — `.mxfixed`, `position: fixed`
  (`src/leavewar/ui/Matrix.tsx`, `src/leavewar/ui/matrix.css`) — **stayed exactly in place**, while the bar —
  `.topbar{position:sticky;top:0;z-index:60}` (`src/ui/scheduler/02-shell.css`, about line 13) — left with the page.
  So on his Safari a box fixed to the screen holds through the spring, and a sticky one moves with the page.
- It is on every page and on the live app too (the bar is the same everywhere). The PC's Chromium and Playwright's
  WebKit neither spring past the page's end nor fold a toolbar, so the fault cannot be seen on the PC: **his iPhone is
  the only proof**, and he tries the fix there before "merge live".

## What done looks like

1. On his iPhone, on every page, the top bar never leaves the screen when the page springs at its foot (or its top),
   with Safari's toolbar folded or open, held upright or on its side.
2. Nothing else he sees changes: same bar, same height, same place at rest, every page's content starting where it
   does today, at a desktop's and a phone's size.
3. **Prefer the cure that keeps the page's spring and Safari's pull-down-to-reload**, as today — the evidence above
   points at the bar held to the screen the way the pinned dates row is. If you judge that cannot be done safely and
   choose instead to stop the page springing (`overscroll-behavior`), say so plainly at the top of your report, with
   what it takes away (the spring at both ends, pull-down-to-reload) — he is told before he tries it (D1873's reading).
   Either way say why your cure should hold on iOS Safari, with a source you opened, and what it rests on that the
   PC cannot check.

## What must keep working — the roll-call (give each a line in your report: has it / must not, because… / MISSING)

- **Everything that reads the bar's size or place** — at least: `src/leavewar/ui/Matrix.tsx` (`barFoot`, and its read
  near line 2114), `src/ui/QualsPage.tsx` (`barFoot`, near line 901), `src/leavewar/ui/Sheet.tsx` (lines ~264, ~367),
  `src/ui/onscreen.ts`, `src/ui/floatwin.ts` (`BARS`), `src/ui/barfree.ts`, `src/ui/LogicPage.tsx` (~175),
  `src/ui/OilWaitSheet.tsx`, the `--topbar-h` readers (`src/leavewar/ui/personwindow.css`, the page claw's overlay —
  `src/ui/pageclaw*`), and whatever writes `--topbar-h`. Search for more (`.topbar`, `#burger`, `--topbar-h`).
- **The pinned rows under the bar** — the Leave War's dates row and Quals' heading (D1870: shown by a CSS step on the
  page's own scroll, `animation-timeline: scroll(root block)`, its range at `--lwy-s` written by `placeY` / `placeQ`),
  the Balances page's bar (D1519): each stays flush under the bar, nothing showing between or through (D1518 "Nothing
  pinned leaks"). If the page's scroller changes, the scroll timeline must still be the page's.
- **The bands that hang under the bar and move the page down**: "Not saved" with its Retry (D587, D841, D1655), the
  "OIL not answered" bar (`.oil-waiting`, D831, D840), the access screens' and guest bar's bands.
- **Windows opened below the bar** (D1523, D1106) and the bar staying pressable over "Jump to a date", the day window
  and the document viewer (D1645).
- **The page names beside TALON or folded into ☰** (D1641–D1643, `src/ui/navfold.ts`): the bar is two rows where the
  names wrap on a narrow desktop — its height changes with the screen, the role and the band.
- **On a phone**: the bar's own sideways scroll with its sticky burger-and-mark lead (02-shell.css's phone block); the
  keyboard opening or closing moves nothing on screen (D1081, D1412); a phone on its side; the page never zooms by a
  pinch on a touch screen, only the grids that zoom by their own pinch (D1567); the Scheduler Board, which covers the
  bar with its own (`.sb-top`), unchanged.
- **Print and the sign-in screen** — no bar there, or as today.

## Tests

- Red-first where the PC can show anything: at least one test that fails on today's code and passes on yours, pinning
  the structural cure (for example: the bar's computed position, or the page's computed `overscroll-behavior-y`, or the
  space kept under a bar fixed to the screen matching its height as it changes). Say plainly that the spring itself
  cannot be reproduced on the PC.
- Every existing unit test you touch, and those of the readers above, green. Never weaken a test to pass.

## Your report (final message)

1. What you changed, file by file, in plain words, and **why this cure**, with the source you opened.
2. Whether it takes away the page's spring or pull-down-to-reload (yes / no).
3. The roll-call above, every line answered.
4. The tests you added (red on today's code? — say how you saw red) and the unit runs, with counts.
5. What Opus must check in the running app at a desktop and a phone — the places most likely to break — and what only
   his iPhone can show.
