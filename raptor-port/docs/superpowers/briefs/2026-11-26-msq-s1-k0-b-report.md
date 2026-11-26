# Section 1 (the guard rail), step K0-B — the builder's report (26 Nov 26)

Brief: `2026-11-26-msq-s1-k0-brief.md` §"For every helper" and §K0-B. Test code only; no behaviour changed; nothing
committed. Branch `claude/msq-s1-guard-6ae5e1`, worktree `chat-156-handoff-a6d8d7`.

## Files written

| File | What |
|---|---|
| `raptor-port/src/test-support/msq-world.ts` (changed) | `withThird()`, `third.u150`; `SIGN.mako`; `PID.mako` and `ACCT.mako` (filled by the set-up). `useMsqWorld()` unchanged |
| `raptor-port/src/ui/msq-guard-asis.test.tsx` (new) | §7's pins that need a new test: 29 tests, 4 `it.todo` |
| `raptor-port/src/ui/msq-guard-input-sqn.test.tsx` (new) | §5.6's pins F14, F18, F19: 4 tests, 1 `it.todo` |
| `raptor-port/src/ui/msq-guard-rollcall.test.ts` (new) | R9: 3 tests |

No other file was touched. The scratch file used to show R9 failing (`src/ui/msq-guard-scratch-r9.test.ts`) was made
and deleted. `git status` shows only the four files above. **`docs/file-map.md` was not updated** — it is outside my
list; the three new test files need lines there (the orchestrator's).

## `withThird()` — how the third squadron is made, every step through a real door

Called instead of `useMsqWorld()` at the top of a file (it calls `useMsqWorld()` and adds a `beforeEach`). Each test:

1. **Mon 13 Jul:** Saber signs in; `accounts.ts addPersonAndAccount('mako', {Mako, MK, FCP, C}, 'admin')` — Mako's home
   is the adder's, 142, as every add's is; `units.ts addUnit('150', 'p1', Mako's account)` — "+ New squadron", Mako its
   first admin (his Plan of 150 marked `first`); `setHome(Mako, 150)` through `moveMan` — counts from Tue 14 Jul.
2. **Tue 14 Jul**, through `accounts.ts saveAccess` (Admin → Users' one Save), each by one who may give it: Saber gives
   Hunter **Plan of 149** (a master admin's alone); Kestrel gives Ranger **View of 149**; Mako, now 150's own admin,
   gives Hunter **View of 150** and Ranger **View of 150**.
3. Clock back to Wed 15 Jul 09:00, nobody signed in, the Undo list reset, baselines settled, `notify()`.

No door refused a step. Checked at the first run (the world's checks are inside the P-pins' premises and F-pins): 150's
number is 150, Mako is 150's on the 15th and signs in as an admin, the four rights read as given.

**What a test using it must know:**
- **Mako reads as 142's on 13 Jul and before** (his first home row reaches back). A test that moves the clock before
  the 14th sees him as 142's admin with Plan of 150.
- **The set-up leaves account lines on two bells**: Hunter's "View of 150" and "Plan of 149", Ranger's "View of 150" and
  "View of 149" — unread. P4's bell premise and P16's account-line pin use them. A test that counts a bell counts them.
- 150's id is made by the door (`third.u150`, like `umr…`), not `u150`. Its Leave War world is put behind the world door
  under that id.
- `PID.mako` / `ACCT.mako` are `''` in a two-squadron file; `SIGN.mako` there signs in as a stranger.

## The pins in `msq-guard-asis.test.tsx` (all seen green on today's code)

Each pressed through the whole app (`ui/App.tsx` drawn, the top bar's and the ☰ menu's real buttons pressed —
pointer down then click), except where named.

| Pin | Test name (short) | What it holds |
|---|---|---|
| P1 | the top bar's list — Hunter picks 149 | in view at once, no toast, list closed |
| P1 | the ☰ menu's list — Hunter picks 150 (View only) | in view at once, no toast, list closed, **the ☰ menu stays open** |
| P2 | the top bar's list / the ☰ menu's list | picking 142 while on 142: squadron and page unchanged, no toast, list closed (☰ stays open) |
| P4 | the bell's list open | Hunter's bell list open (premise checked), a pick goes through, the list is gone |
| P6 | "Not kept" band up | band drawn (`setStorageKept(false)`); the pick, the badge both ways, and a bell line of a 149 input (enters 149, opens the input) all go through |
| P7 | an Input window open / words typed and not saved | `logOut()` answers true, signed out, the page reloads once (reload seam) |
| P8 | bell line of his own squadron over typed words | "This input has unsaved changes. Open Hunter’s input and lose them?" up; 142 still in view; the window keeps the first input and his words |
| P10 | Day details / Jump to a date — × the pick, the badge, the bell (6 tests) | the window closes at the press **and** the press does its own work: the list opens (then the pick goes), the member view, the bell's list |
| P12 | an armed slot | the pick goes through, the arming dropped |
| P12 | Logic's edit mode (replaced by G1) | the pick goes through, still on Logic, "Done" still shown |
| P12 | Edit quals (replaced by G1) | the pick goes through, Quals follows a Plan holder to 149, "Done" (`#qSave`) still shown |
| P12 | an armed "Discard N edits & load" | **recorded: the pick drops it** (see below). Armed by its own setter — the demo has no issued day |
| P13 | the board alone, a bell line to 149 | 149 in view, the board closed, Inputs page, the input open (beside `ui/msq-board-sqn.test.tsx`) |
| P14 | a save just before a pick | Hunter files his own LL on 142, picks 149: the record is stored, carries no squadron stamp, its man is 142's on its day |
| P16 | an input since deleted | read, "That input is gone", squadron and page unchanged — with the Input window open over typed words |
| P16 | a posting of a man with no row left | read, nothing opens |
| P16 | his own account's line (Plan of 149, from the set-up) | read, nothing opens |
| P16 | a holiday's line on his own squadron | the OIL list opens for its dates |
| P18 | ALL AVAIL, Changes, Insights across his own move at midnight | **recorded** (below) |
| P18 | the same on 149 when his Plan of 149 is ended | **recorded** (below) |
| P19 | at a pick / at the view switch | ALL AVAIL and Changes both closed, no toast |

The bell lines in P6, P8, P13 and P16 are made by the test and handed to `openNotice` (the bell's tap), the way
`ui/msq-bell-tap.test.ts` does — the tap is pinned, not how the line was written. ALL AVAIL is opened by its own setter
(`setAvailWin`), Changes by `openChanges`, Insights by `setInsights`.

**Named instead of re-written (§7's "existing file" pins), all run and green unchanged:** P3
`tracker/msq-trk-pick-ask.test.tsx`, `tracker/msq-trk-ask-keys.test.tsx`; P5 `ui/msq-fix-sched-windows-midnight.test.tsx`,
`state/typing-hold.test.tsx`, `state/typing-hold-grid.test.tsx`, `state/reshape-r6-reenter.test.tsx`,
`leavewar/ui/msq-fix2-r2-held-figure.test.tsx`, `state/msq-fix2-tracker-moved-master.test.tsx`; P9
`ui/msq-bell-tap.test.ts`; P11 `ui/memberview.test.tsx`; P13 `ui/msq-board-sqn.test.tsx`; P15
`ui/msq-pick-windows.test.tsx`; P17 `tracker/tracker.test.tsx` (the Tracker smoke not run — a browser run).

### What today does, where §7 said "whatever it finds" — recorded, for the plan

- **P12, "Discard N edits & load":** §7 expected `view.setPage` to clear it on a page change "and a pick changes none".
  **Today the pick clears it even though the page does not change** — the squadron entered steps the week/board state,
  which drops the one-shot confirms. Pinned as `null`.
- **P18, his own move at midnight** (Hunter moved 142 → 150, on Edit Schedule): **ALL AVAIL and Changes close; Insights
  stays open.**
- **P18, his Plan of 149 ended while on 149:** **all three close, and he is taken home to 142.**

## The part F pins in `msq-guard-input-sqn.test.tsx` (seen green)

| Pin | What it holds |
|---|---|
| F14 | Ranger files his own weekend duty (Sat 18 Jul) on 142, its OIL question unanswered; Saber moves him to 149; past midnight by the app's own wake. On his 149 page: `enterForLine('u142')` answers `'no'` and moves nothing; his old 142 duty and his seeded 142 appointment are listed (`inputsPageRows`); his OIL question is still his (`oilPendingFor`); the Input window opens on the duty with no band and a live Save. Then Hunter gives him View of 142: both still listed |
| F18 (Hunter) | 30 Nov: Hunter's move to 149 saved by Saber (counts 1 Dec); he files LL for 5 Dec on 142's page: listed on 142; he picks 149: his pages follow, the LL listed there too |
| F18 (Saber) | the same for Saber — see the set-up note below |
| F19 | Hunter (Plan of 149) files a Training for Osprey and a second 149 man; Kestrel changes it, so Hunter (its filer) gets a line, unread and on his bell; Saber ends the Plan: the line is in no list of his bell, `noticeLive` false for it (the one body behind the list, the count and the light), his unread count is only what his list holds; Plan given again on 16 Jul: the line stays out |

**Where the set-up had to differ from §5.6's words:**
- **F18's Saber half:** nobody moves himself (D2249) and a master admin's squadron is a master admin's to change (D2205);
  the world has one master admin. So the test first has Saber make Kestrel a master admin (Admin → Users' one Save),
  then Kestrel moves Saber. Real doors only, but Kestrel is a master admin in that one test.
- **F19's second man** is written into the same record through the inputs' one write (`writeInputsBatch`), as the
  window's Person list adds a man — not by pressing the window. Kestrel's change is the same kind of write.
- **F14's "its OIL answer saves" and the drawn "OIL?" button** are not pressed: `it.todo` with the reason. The pin holds
  the question's source instead.

**No contradiction with today's code found in F14, F18 or F19** — each passed as §5.6 describes.

## R9 in `msq-guard-rollcall.test.ts`

Reads every `*.test.ts(x)` under `src/` whose own file name starts `msq-guard-`, `msq-s2-` or `msq-s3-` (exactly those),
and fails any whose source has no `withThird()` call on a line of its own (a comment mention does not count). Its own
checks: the eight existing `msq-users-*` / `msq-bell-*` files are found (8) and none is caught; look-alike names
(`msq-guardian`, `msq-s20-`, `msq-s4-`, a name only containing a prefix) are not caught. It calls `withThird()` itself.

**Seen failing once:** a scratch file `src/ui/msq-guard-scratch-r9.test.ts` (mentions `withThird()` in a comment, calls
`useMsqWorld()`) → R9 failed naming `ui/msq-guard-scratch-r9.test.ts`; file deleted; R9 green again.

## Left undone (each an `it.todo` in the file, with its reason)

- **P4:** the Schedule Insights menu, a board's small menu, a date box's calendar, the Medical page's "as of" calendar, the
  Leave War's Legend — only the bell's list is pinned.
- **P10:** the Traffic window and the document viewer — only Day details and Jump to a date (same machinery).
- **P12:** OIL Earn on the board; the Logic and Quals half's "the change already typed saved in 142's record".
- **P18:** a SANS day, the Leave War's day panel, a Tracker event's details.
- **F14:** the OIL answer pressed and the "OIL?" button drawn.
- **P7** covers a window open and words typed; not a failed save waiting (the "Not saved" band).

## Commands run (all from `raptor-port/`)

| Command | Result |
|---|---|
| `npx vitest run src/ui/msq-guard-asis.test.tsx` | 29 passed, 4 todo |
| `npx vitest run src/ui/msq-guard-input-sqn.test.tsx` | 4 passed, 1 todo |
| `npx vitest run src/ui/msq-guard-rollcall.test.ts` | 3 passed (and 1 failed / 2 passed with the scratch file in place) |
| the 173 existing test files that import `test-support/msq-world` | 173 files passed — 1124 passed, 1 expected fail |
| the 13 existing-file pin files above | 13 files, 179 passed |
| `npx vitest run src/test-support/no-app-import.test.ts` (+ my three) | passed |
| `node raptor-port/scripts/gatelock.mjs status` (repo root) | free |
| `npm run build` | exit 0 |

Not run: the full suite, `npm run lint:changed`, any browser test, the Tracker smoke.
