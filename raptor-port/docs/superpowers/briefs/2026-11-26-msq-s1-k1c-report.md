# Section 1 (the guard rail) — K1c, the Tracker's list and bridge: the builder's report (26 Nov 26)

Builder: Opus 5.5, one helper of chat 204, in `lw-balances-hover-275293` on `claude/msq-s1-guard-6ae5e1`. Brief:
`2026-11-26-msq-s1-k1c-brief.md`, followed with the orchestrator's eight additions (they win over the brief). Nothing
committed or pushed; `HANDOFF.md` and the plan untouched. No door asks the guard yet: what a person sees is unchanged.

## One difference to settle first — `infoId` is not "an event's details"

The brief (and the plan's §3.2 (g)) map his D2597 "a Tracker event's details" to `infoId`. **In today's code `infoId` is
"✎ Edit details" — the event info editor** (`components/Modals.jsx InfoModal`, opened from the marking window's
"Edit details" button, `core.js openInfo`): five boxes to type in (Name, Type / format, Hours, Crew, Prerequisites),
"Reset to doc", Cancel and Save. Closing it at a pick would throw typed words away without a word — against D2403 ("a
window with a box to type in stays refused") and against D2597's own row, whose words are *"a Tracker event's details
(the ⓘ bubble, which already goes at a pick)"*. The ⓘ bubble is a different thing: one element on the page body,
`#detailBubble`, raised by Details mode and by the Info panel's event chips (`core.js showDetailBubble`).

**What I built:** `infoId` counts `window` (it refuses, under the `trk` row), and `trkinfo` — the row R8 cites D2597 for —
reads a new table id, `bubble` (`open` = the bubble's element shown; its closer `hideDetailBubble()`, the bubble's own).
**To flip it** if the orchestrator reads D2597 otherwise: in `core.js TRK_WINDOWS` set `infoId`'s count to `'closes'`,
add `closeInfo()` to the closer for it, point `TRACKER_SHOWS`/`trkinfo` at it, and move `infoId` into the roll-call's
`TRK_CLOSE_ROW`. I recommend it stays as built; it is the orchestrator's call, and if it needs his word, his.

## Files changed, and why

| File | What changed |
|---|---|
| `src/tracker/app/core.js` | Beside `onBeforeTrackerSwitch`: the read-only table `TRK_WINDOWS` (below); the variable the phone's tab is handed into (`setTabShown`) and the stylesheet's own width test (`(max-width:1050px)`); three registrations on the bridge — what is open (none unless drawn: `ready && !bootError`, and with no course only `dlg`; `behind: 'info'` on a panel window while the phone layout shows the Flow chart), whether the unsaved-edits question is up (`switchAsking && dlg`), and one closer of the four that only show things, each by its own way of closing (`hideDetailBubble`, `closePop`, `closeDownLog`, `closeFailLog`), by id or all. A small reader `detailBubbleShown()` beside `hideDetailBubble`. **`endSession()` untouched.** Nothing in the gesture code. |
| `src/tracker/role.js` | The bridge, no imports: `onTrackerWindows(f)` / `trackerWindowsOpen()` (`{ id, counts, behind }[]`), `onTrackerAsking(f)` / `trackerAsking()`, `onTrackerCloseShown(f)` / `trackerCloseShown(id?)`. Never loaded: nothing open, nothing to close, no question. |
| `src/tracker/App.jsx` | One effect beside `setTabSink`: `core.setTabShown(tab)` whenever the Flow chart / Info tab changes (N12). `clickAway` untouched. |
| `src/ui/guard.ts` | Six rows (below), `GUARD_ORDER` extended (`trkask` first, as a question; `trk` beside `lwsheet`; the four closing rows after `lwshow`); `trackerWindowUp` and `TRACKER_SHOWS` exported for the roll-call. Reads the bridge only — never imports `core.js`. |
| `src/ui/msq-guard-rollcall.test.ts` | R4, its planted cases in R7, R1's and R8's Tracker additions, the last test on `TO_COME`. |
| `src/ui/msq-guard-open.test.tsx` | A7's Tracker half, A8, A11, A13, A14's and A15's Tracker halves (pins), the Tracker rows in A2, A3 and A10 (by their loops), the last test on `TO_COME`; the Tracker wired as `src/boot.ts` wires it (below). |

`src/probe-bridge.ts`: no engine API added — untouched.

## `TRK_WINDOWS`, whole

| id | What | counts | panel | Ruling |
|---|---|---|---|---|
| `dlg` | its questions and boxes (`DlgModal`) | window | — | D2403 |
| `pop` | the marking window | **closes** | — | D2654 E2 |
| `bubble` | an event's details — the ⓘ bubble | **closes** | — | D2597 (see the difference above) |
| `infoId` | "✎ Edit details" — boxes to type in | window | — | D2403 |
| `editId` | the ball editor | window | — | D2403 |
| `sylModalOpen` | Edit events / flow | window | — | D2403 |
| `ordMode` | Reorder (courses, syllabi, crew) | window | — | D2403 |
| `copyOpen` | Export ("Save a copy") | window | — | D2403 |
| `flexWinOpen` | Flex settings | window | — | D2403 |
| `showAllOpen` | Show All | window | — | the reading: never put to him singly |
| `downLog` | Down days | **closes** | info | D2654 E4 |
| `failLog` | Failures | **closes** | info | D2654 E4 |
| `lullPick` | Set / Change lull period | window | info | D2654 E4 (holds a choice) |
| `lullCopy` | Copy … lull periods to | window | info | D2654 E4 (holds a choice) |
| `arrangeMode` | Edit chart layout | no (a mode) | — | — |
| `showDetails` | Details mode | no (a mode) | — | — |
| `toolsOpen` | the tools set | no (a mode) | — | — |

## The rows in `ui/guard.ts`

| Row | counts | where | open() | close | R8 cites |
|---|---|---|---|---|---|
| `trk` | window | tracker | cover not up, and a `window` of the table open — `dlg` left out while `trkask` stands | — | — |
| `trkask` | window | any | `trackerAsking()` | — | — |
| `trkinfo` | closes | tracker | `bubble` open | `trackerCloseShown('bubble')` | D2597 |
| `trkpop` | closes | tracker | `pop` open | `trackerCloseShown('pop')` | D2654 E2 |
| `trkdown` | closes | tracker | `downLog` open | `trackerCloseShown('downLog')` | D2654 E4 |
| `trkfail` | closes | tracker | `failLog` open | `trackerCloseShown('failLog')` | D2654 E4 |

One closing row per state, so R8's list names each with its ruling.

## The four pop-ups of the Info panel — how a press outside closes each today, and what each holds

All four are drawn in `components/SidePanel.jsx`, each over its own shade (`.lullback`, `role="presentation"`), and **a
press outside is a press on that shade, whose `onClick` is the window's own closer** — `closeLullPicker`,
`closeLullCopy`, `closeFailLog`, `closeDownLog`. Escape closes each too (`core.js handleEscapeKey`). Not `clickAway`,
which spares only the marking window. (The presser found the shade covers the whole screen, top bar included.)

| Pop-up | Holds anything to edit? |
|---|---|
| Set lull period (`lullPick`) | Yes — a first day picked is held, not saved, until the last day is picked; its close throws it away. |
| Copy lull periods (`lullCopy`) | Yes — the students ticked, saved only by Copy. |
| Failures (`failLog`) | No — each failure's date box saves at the pick ("a pick is the save"). |
| Down days (`downLog`) | No — it only shows; inputs change on the Inputs page. |

## R3 for `src/tracker/` — held in R4's own census

R3's census still leaves `src/tracker/` out; **R4 counts every non-test source file under `src/tracker/`** (not only
`components/*.jsx`) with R3's marks plus the Tracker's own `className="pop"`, `className="lullcal` and
`id="showAllPanel"`, per file, each mapped to a `TRK_WINDOWS` id or a reason (the Legend: "no — a list"). A test proves
R3's files and R4's files between them are every source file. R7's planted cases: a second `.modal` in `Modals.jsx`; a
panel window stripped of `panel: 'info'`; a table id no frame draws; a new state reset in `endSession`; a window
re-counted `closes` with no row. The bubble is the one window no component draws (core draws it), named so.

## Tests — seen failing first, then green

Failing first was shown with a patch file (`git diff` → `git checkout --` the four code files → run → `git apply`;
never `git stash`), twice:

1. **All four code files set aside:** the roll-call file cannot load (it reads `TRACKER_SHOWS`, which is gone). The open
   file's K1c tests (`-t "trk|Tracker|A8|A13|A11|TO_COME"`) — **31 failed, 2 passed** (307 collected; the A2 and A10 loops
   have no Tracker rows to make tests from). The two passing are the pins: `TO_COME`'s test and A14's chart-editor pin.
2. **`ui/guard.ts`'s rows kept, the Tracker's three files set aside:** the roll-call — **5 failed, 24 passed**: R4's four
   and R7's R4 case.

With the code put back (the patch re-applied, the working copy byte-for-byte as before): green, below.

**Pins (seen passing):** A14's Tracker half (the chart editor open, his move at midnight, a right ended — the guard never
asked) passes in run 1. A15's Tracker half (the bubble up, the same two changes — `closeShown` never called) is a pin
whose premise reads the `trkinfo` row, so it failed in run 1 for want of the row and passes with it. `TO_COME`'s two
tests prove a list, not code.

**Green** (each `npx vitest run <files>` in `raptor-port/`, no lock):
- `src/ui/msq-guard-rollcall.test.ts` — **29 passed (29)** (21 before K1c).
- `src/ui/msq-guard-open.test.tsx`, whole — **322 passed (322)** (274 before K1c), about 11.6 minutes, no stray error.
- The must-stay-green set: see Checks.

**Existing tests changed (named):**
- Roll-call R7's R8 case planted "a ruled id with no row" as `trkinfo`, which K1c builds; a made-up id `trknew` stands in.
- Open file: `afterEach` became async and also ends the Tracker's session, answers a question left up, saves an unsaved
  chart edit and puts `matchMedia` back; and the file now wires the Tracker's door as `src/boot.ts` does (a whiteboard,
  `setStorageMaker`, `setTrkUnitProbe(() => storageUnit())`), because without it no pick ever asks the Tracker's
  question (`state/pick.ts movesTrackerAway` needs a bound Tracker) and the cover can never come up. No assertion of K1a
  or K1b changed; the whole file is green with it.

## `TO_COME` as it now stands

- Roll-call: `addperson` (K2b); the short row's report — `ForeignEditor` ("after S2's U1 fix merges").
- Open file: A6's "Add a person" half (K2b).

The last test of each file proves exactly that.

## A7's Tracker half — the "page no longer offered" branch, really reached

Show All left up on the Tracker, then the Inputs tab: the `trk` row answers, `rowReachable` true. Then 150 picked by
today's door (Hunter holds View of 150): **150 is in view, the Tracker is not offered (`pageOffered('tracker')` false),
Show All is still set, the `trk` row's `open()` is true, `rowReachable` is false, and `whatIsOpen()` is null.** The pick
goes through (no door asks yet) and the Tracker stays on his own squadron's records — it follows his own pages, which a
squadron he only views does not move — so its window is left set while nothing on 150 can show it. A real case, not a
pin. (K4 will refuse this pick while the window is open; the state then stays reachable only by a change he did not make.)

## Where today's code differs from the plan's account

1. **`infoId`** — above.
2. **A11's cover case:** the plan says the bridge itself reports none under the page's cover. The cover is Raptor's
   (`state/typing-hold.ts`), which `core.js` cannot read, so — as §3.1 itself places it — the cover is gated in the
   `trk` row, not in the bridge: under the cover the bridge still lists the window, the `trk` row does not count it and
   `whatIsOpen()` is null (A8's cover test). The closing rows are not gated by the cover: `closeShown()` would still
   close the marking window under it, as today.
3. **A11's boot-error card and "no course":** not reached in this test world (the boot error needs a stored record the
   migration refuses; no course needs every course removed from the shared Tracker of the file). The gate is one line;
   A11 proves "Loading…" (`resetInitForTests`, then booted again).
4. **The cover's road (A8):** reached as he would — Plan of 149, the Tracker followed the pick, an unsaved chart edit, the
   member view. With the cover up 149 stays in view; the pick that asks is 142's (it moves the held Tracker).
5. **The bridge's entries carry `counts`** beside the brief's `{ id, behind }`: the guard needs it to tell a window that
   refuses from one that only shows things or a mode, and may not import the table.

## What only a browser can show

- The Info panel hidden by its style rule on the phone layout (`.tr-root.tab-flow .sidecol{display:none}` under 1050
  wide): jsdom loads no stylesheet, so A13 reads the bridge's `behind` mark (the width answered by a stubbed
  `matchMedia`), never that the panel is out of sight.
- Whether a press from the keys reaches a door with a lull pop-up up (the presser's Part 2 A said yes; nothing here
  changes it — no door asks yet).
- The bubble's place on the page body and its hide on screen.

## Checks

- `npx vitest run src/ui/msq-guard-rollcall.test.ts` — PASS, 29/29.
- `npx vitest run src/ui/msq-guard-open.test.tsx` — PASS, 322/322.
- The must-stay-green set, untouched — `src/tracker/` whole (`tracker.test.tsx` and every Tracker test that drives a
  session, the `msq-trk-*`, `msq-night-*`, `msq-bell-*` there), `state/msq-trk-cover`, `ui/pops`, `state/view-reset`,
  and the guard files `msq-guard-rollcall`, `-asis`, `-g`, `-input-sqn`: **49 files, 788 passed, 5 to do (793)** — PASS.
- `npm run build` — **PASS**, under the checks lock (free; taken as "claude/msq-s1-guard-6ae5e1 — K1c build and Tracker
  smoke"; nothing on port 4741). A first attempt never ran npm (a mistyped log path in my command) — not a build result.
- `npm run smoke:tracker` — **PASS, 472 passed, 0 failed**, under the same lock, released the moment it ended.
- No full suite, no other browser test, no dev server. `npm run docsize` not run (only this report changed outside
  `src`; the orchestrator runs it with the commit). `npm run lint:changed` not run.
