# Section 1 (the guard rail) — K1b, what a component holds: the builder's report (26 Nov 26)

Builder: Opus 5.5, one helper of chat 204, in `lw-balances-hover-275293` on `claude/msq-s1-guard-6ae5e1`. Brief:
`2026-11-26-msq-s1-k1b-brief.md`, followed with the orchestrator's seven additions (they win over the brief). Nothing
committed or pushed; `HANDOFF.md` and the plan untouched. The chat compacted once mid-build; the files in hand were
re-read before the next change.

No door asks the guard yet: what a person sees is unchanged, except item 6 (Quals' hidden words, below).

## Files changed, and why

| File | What changed |
|---|---|
| `src/state/guard.ts` (the seam) | The Leave War's sheets probe: `setWarSheetsProbe`, `warSheetOpen()` (a sheet open without the show-only mark), `warShowOpen()` (a marked one), `closeWarShown()` (each marked sheet by its own closer). No imports, as K1a's seam. |
| `src/leavewar/ui/Sheet.tsx` | A `showOnly` prop (default off). `OPEN` keeps, beside each open sheet, its mark and its own closer (a `MARK` map, set on mount, deleted on unmount, re-set if the mark changes); the probe reads the list. `setWarWindowsProbe` (every sheet) is untouched, so the war's swap still holds as before. |
| `src/leavewar/ui/BidPicker.tsx` | One word, ` showOnly`, on two calls — nothing else (below). |
| `src/ui/guard.ts` (the table) | New fields `report`, `dirty`, `holds`, `end`; new rows; three float rows re-counted; `rowRefuses()`; `whatIsOpen` and `closeShown` taught the new fields; `GUARD_ORDER` extended (below). |
| `src/ui/UsersPanel.tsx` | Three reports — PersonEditor (`userrow`), ArchivedEditor (`archrow`), Waiting's Give access (`giveaccess`) — each "anything differs from how it opened", one call a line. The Add a person form is K2b's and untouched. |
| `src/ui/SquadronsPanel.tsx` | Three reports — NewSquadron (`newsqn`), MoveEditor (`sqnmove`), PlaceEditor (`placeedit`). |
| `src/ui/InputsPage.tsx` | `useGuardWork('oilrevise', !!oilConf)` — the OIL question opened from a row's own OIL chip. |
| `src/ui/HolidaysPanel.tsx` | `holimport` (a sheet read in, preview waiting) and `holiday` (the form once touched — a `touched` flag set by every edit, cleared by "Save and add another"). |
| `src/ui/EveryWeekday.tsx` | `everywd` — counted once a choice is pressed (`pressed` set by `edit()`). |
| `src/ui/InputsSettings.tsx`, `src/ui/SansSettings.tsx` | `inputsset` / `sansset` — anything differing from how the window opened. |
| `src/ui/QualsPage.tsx` | `qualsnew` (edit rights and words in the box); `useGuardCloses('qedit', …)` (clears editing, Edit quals and the armed ✕, never the box's words); item 6 (below). |
| `src/ui/LogicPage.tsx` | `useGuardCloses('lgedit', …)`: `flushRuleApply()` first, then `setLgEdit(false)` and a notify. |
| `src/ui/msq-guard-rollcall.test.ts`, `src/ui/msq-guard-open.test.tsx` | The tests (below). |

## Each row and report added, with its ruling

| Row | Counts | Where | Read from | Ruling |
|---|---|---|---|---|
| `userrow` | row (report) | admin | PersonEditor's report | D2595 |
| `archrow` | row (report) | admin | ArchivedEditor's report | D2595 |
| `giveaccess` | row (report) | admin | Waiting's report | D2598 |
| `newsqn` | row (report) | admin | NewSquadron's report | D2598 |
| `sqnmove`, `placeedit` | row (report) | admin | their editors' reports | §3.2 (h), a reading of D2595 |
| `oilrevise` | window (report) | inputs | InputsPage's report | D2627 A12 |
| `holimport` | window (report) | any | HolidaysPanel's report | D2654 E1 |
| `qualsnew` | row (report) | quals | QualsPage's report | D2729 Q2 |
| `days` | **closes**, `holds` | any | (K1a's) + held while `holiday`, `everywd` or `holimport` reports work | D2654 E1 |
| `everywd`, `holiday` | window, `dirty` | any | (K1a's) + counted only once their report is on | D2654 E1 |
| `inputsset`, `sansset` | **closes**, `dirty` | any | (K1a's) + refuse while changed, close by themselves while unchanged | D2654 E1 |
| `inputsday` | window | — | unchanged, a plain window row (orchestrator's addition 2) — **taken off `TO_COME`** | — |
| `lwsheet` | window | leavewar | `warSheetOpen()` — a sheet open without the mark | D2740 |
| `lwshow` | **closes** | leavewar | `warShowOpen()`, closed by `closeWarShown()` | D2740 |
| `lgedit`, `qedit` | no, + `end()` | logic / quals | the pages' handed-over closers | §18.1, D2627 |

R8's ruled list gains `days`, `inputsset`, `sansset` (D2654 E1) and `lwshow` (D2740).

**Where each new row sits in `GUARD_ORDER`, and why.** `oilrevise` with the question sheets, after `medmove` and
`oilwait` (orchestrator's addition 4: a question answers first). The Calendar family in the plan's table order, forms
before what holds them: `holiday`, `everywd`, `holimport` (with the Calendar's forms, ahead of days and the settings —
addition 4), then `days`, `inputsset`, `sansset`, `inputsday`, `oilday`. `lwshow` beside `lwday` with the other
show-only rows. The six Admin rows and `qualsnew` after the windows and before the `'no'` rows and `unsaved`: the plan
names a window before a row (D2627 "one reason at a time, window, row, Retry").

**A choice of mine:** `holimport` counts `'window'` (a sheet's preview is a window's work, not a row's); the Admin rows
and `qualsnew` count `'row'`, as the plan's table names them.

## The two Leave War sheets marked show-only

- `src/leavewar/ui/BidPicker.tsx`, line 1250 — `RaptorSheet`, testid `raptor-sheet`, spoken name "Leave filed on the
  Inputs page" (the same sheet reads "OIL the app credited").
- `src/leavewar/ui/BidPicker.tsx`, line 1356 — `AwardSheet`, testid `award-sheet`, spoken name "Your OIL award".

How no other window shares them: each component draws only its own read-only sheet (its body has no field a person
fills, only a close and doors that open other sheets). The roll-call's R3 now maps every `<Sheet` call in the app,
file by file, and fails unless the show-only mark sits on exactly these two (R3's second test, and R7's planted case
that puts the mark on the posting sheet and is caught). "Open for bidding", a person's window, "OIL TRACKER" and every
other sheet stay unmarked and still refuse (A3's "an unmarked sheet beside a show-only one").

## What the app does today

- **A new holiday no leave period covers:** Save is refused — "No leave period covers <date> yet." (the words `holidayspanel.test.tsx` pins) — the form stays
  with "It is kept here, and saved by itself as soon as a leave period covers it.", offers to create the period (or add
  one), and saves itself once a period covers the date; an edit, Cancel or ✕ ends the wait. With K1b it still counts
  (`holiday`) while it waits (A16's test).
- **Every Monday as it opens:** one choice already lit (NF on a weekday, Day on Saturday or Sunday), From on the first
  such day; nothing saved until Save. It counts only once a choice is pressed (A16's test).

## Tests — seen failing first, then green

Failing first was shown two ways, each by setting K1b's code aside with a patch file and putting it back after
(`git diff` → `git checkout --` the code files → run → `git apply`; never `git stash`):

1. **All K1b code removed (the app as K1a left it):** the roll-call file — 7 failed, 14 passed (21); the new open
   tests cannot load at all (they import `rowRefuses` and the sheets probe, which K1a lacks).
2. **K1b's table kept, every component's report and the Sheet mark removed:** the open file's K1b and extended tests
   — **136 failed**, 125 passed, 11 skipped (272).

The roll-call's seven that failed first: R1's counting-row check and its new frame check (a report, `dirty` or `end`
row's frame makes the call); R3's census and its two-marked-sheets test; R8's ruled list; R7's planted R3 cases and
its R8 case.

**Not seen failing, and not a pin — reported, not bent:** A3 (K1b) "closeShown() ends Logic's edit mode, a value
still waiting its beat written first". It passed in run 2. The reason: the `lgedit` row's own `end()` falls back to
`setLgEdit(false)` when no closer is handed over (it must — the edit mode outlives the Logic page, below), and the
Logic page already writes a waiting value when its edit mode ends, so the value is written either way. The test still
holds the behaviour; it simply cannot tell the page's handed-over closer from the fallback.

Pins (seen passing with K1b): A7's two (see "differences" for the first), A17's "Done with words in the box … come
back on the same squadron (as today)", B18. In run 2 three of them failed too, because their premise needs a report
K1b adds; with K1b in place each passes.

**Green with K1b** (all `npx vitest run <files>` in `raptor-port/`):
- `src/ui/msq-guard-rollcall.test.ts` — 21 passed (21).
- `src/ui/msq-guard-open.test.tsx`, whole — **272 passed (272)**, about 9 minutes. That run also logged 4 stray errors
  from the Leave War grid's press timer (jsdom has no `elementFromPoint`) after the tests that tap the war as Ranger;
  the helper now stubs it as `doubletap-windows.test.tsx` does, and the A3 group re-ran clean (28 passed, no error).
- The other guard files (`msq-guard-asis`, `msq-guard-g`, `msq-guard-input-sqn`) — 46 passed, 5 to do (51).
- The must-stay-green set, 42 files untouched (Admin → Users and its rows, accounts, Squadrons, Quals, Logic, the
  Inputs list and the OIL question, the Calendar, Holidays, Every weekday, both settings windows, settings-nav,
  `pops.test.ts`, `state/view-reset.test.ts`, `state/edit-rights-readers.test.ts`, and the Leave War's sheets:
  raptorsheet, ownaward, creditdoor, heldday, halfwords, the three doubletap files, settingssheet, the five sheet-*
  files, sheetfocus, onedoor-sheets, awardclear, msq-holidays-own-sqn) — 788 passed, **1 failed once**:
  `doubletap-more` "the move banner's Confirm", under the 42-file run's load. Run alone, then twice more with the
  other doubletap files, it passed every time (30/30, 73/73, 73/73) — a timing failure under load, not K1b's; the
  Leave War suite's fixed hostile time zone was not touched.
- `npm run build` — **PASS**, under the checks lock (free at the end; taken as "claude/msq-s1-guard-6ae5e1 — K1b
  build", released the moment the build ended; nothing on port 4741).

Three of my new or changed cases failed in the first whole-file run and were corrected in the tests, not the code:
oilrevise's "Save" exit pressed a greyed Save (it waits for an answer — it now picks one first); A10's archived-row
opener picked 149's last admin, whom the archive rightly refuses (it now takes the first man the archive takes); and
K1a's A4 case (below).

## `TO_COME` as it now stands

- Roll-call: R4 (K1c); the Tracker's rows `trk`, `trkask`, `trkinfo` (K1c); R3 for `src/tracker/` (K1c); `addperson`
  (K2b); **ForeignEditor — S2's short-row editor, not in this branch: "after S2's U1 fix merges"**.
- Open file: A6's "Add a person" half (K2b); A7's Tracker half, A8, A11, A13 and the Tracker halves of A14 and A15
  (K1c).

## Where today's code differs from the plan's account

1. **A7, "his right lowered to View":** the plan expects 149 then to offer View-only Sched and Help alone, the window
   left on 149's Leave War no longer counted. Today a Plan lowered while he is on that squadron takes him home to 142
   (K0's finding, pinned at K0). On 142 the Leave War is offered, so the window left up behind the Inputs tab still
   refuses (D2627: "unless the squadron picked no longer offers it" — 142 does). Pinned as today's behaviour.
2. **The Calendar's Holidays part in the tabbed layout** (under 1510 wide): the Holidays part unmounts when the Month
   tab shows, so a sheet's preview is dropped today. The plan's "a preview left behind the other tab — still the row"
   cannot hold. Not changed. jsdom draws both parts, so the tests cannot see this.
3. **Logic's edit mode outlives the Logic page** (the flag stays on when the page unmounts), so `lgedit`'s `end()`
   falls back to `setLgEdit(false)` and a notify when no closer is handed over.
4. **`flushRuleApply` writes only values whose change has been raised** — a value typed with no change event yet is
   not written by it (noted for G1).
5. **`inputsday`** stays a plain window row and is off `TO_COME` (orchestrator's addition 2).
6. **The R3 census uses the plan's patterns as written**; `className="airpop` also matches `airpop-head` and the
   like, each mapped in the census.

**Existing tests changed** (none of the area tests; only K1a's two guard files):
- R7's planted R8 case used `days` as "a closes row not ruled"; `days` now closes on his ruling, so the case uses
  `everywd`.
- A2's openers for `inputsset`, `sansset`, `everywd` and `holiday` now change something (they count only when changed —
  D2654 E1), `under` was dropped, and `days` left the counting list (it closes now). A2 and A10's "counting" list is
  `GUARD_ROWS.filter(rowRefuses)`, so it covers every new row.
- A4's "the OIL list and a second movable window" used the Calendar as the second window; the Calendar now closes by
  itself (D2654 E1), so the second window is SANS settings with a figure changed, which still refuses.

## Checks

- `npx vitest run <files>` in `raptor-port/` — the results above (no lock needed).
- `npm run build` in `raptor-port/` — PASS. The lock was first held by `claude/msq-s4-posting-3ba6fa` (chat 201);
  not waited for in a loop; it was free when the tests ended, taken, and released at once after the build.
- No full suite, browser test, Tracker smoke or dev server. `npm run docsize` not run (only this report, a brief file,
  changed outside `src`; the orchestrator runs it with the commit).

## What could not be checked without a browser

- The tabbed Calendar layout under 1510 wide (difference 2).
- That the marked sheets close cleanly on screen — their slide-out and the keyboard's return to the opener — when a
  door calls `closeShown()` (no door does yet).
- Where each frame sits on a phone (the selectors the table names are checked in jsdom only).

## The orchestrator's review round

The orchestrator read the whole diff and asked for four things. Everything below is in the same working copy, under
the same rules (no commit or push; only `raptor-port/src` and this report).

1. **The Logic test that could not fail now can.** Inside the same `act` as `closeShown()`, on the next line, the test
   now checks that the value is already written. It checks this at once, before any timer runs, because §18.1 says a
   door changes the squadron straight after `closeShown()`. The later checks are kept. I took the
   `useGuardCloses('lgedit', …)` line out of `LogicPage.tsx`, which left only the fallback: the test **failed**,
   "written at once, before any timer: expected 720 to be 1440". With the line put back it **passes**. The page's own
   write is a `setTimeout(…, 0)`, one beat late; the closer's `flushRuleApply()` writes at once. This is now an
   ordinary red-first test, so the "not seen failing" note above no longer applies.
2. **`leavewar/ui/Sheet.tsx`:** the effect that keeps `OPEN` is back to `[panelRef]`, exactly as before. The show-only
   mark now lives in a small `useLayoutEffect` of its own (`MARK.set` / `MARK.delete`, deps `[panelRef, showOnly]`),
   declared so the mark is set at mount. A change of the mark therefore never runs the cleanup that calls
   `warWindowGone()`. The closer is still `() => closeRef.current()`, and the probe's fallback (unmarked, a closer that
   does nothing) covers a sheet with no mark.
3. **A new A16 case — a pin, passing at once:** Every Monday opened with nothing pressed, and separately "Add a
   holiday" opened with nothing typed. In each, `whatIsOpen()` is null. `closeShown()` then closes the Calendar and the
   form goes with it: no `win-days`, no `win-every` and no `win-holiday` is left, and `row('everywd').open()` and
   `row('holiday').open()` are false.
4. **A7.**
   - (a) The first test is retitled to what it pins: "his Plan of 149 lowered to View: taken home to 142, the window
     still refuses".
   - (b) New pin: Hunter has a person's window open on his own squadron's Leave War, then picks 150 with today's door.
     In `withThird()` he holds View of 150, and no door asks the guard yet, so the pick goes through.
   - **What the app does today differs from what was expected.** The pick goes to 150, but the page stays on the Leave
     War, the window stays drawn and `lwsheet` still answers (`whatIsOpen()` names it). The expected result was "not
     offered on 150, nothing open". The likely reason is that the Leave War stays on his own squadron when a squadron
     he only views is picked (D2197). That clashes with the plan's reading of D2381, which offers View-only Sched and
     Help alone. I pinned it as it is and did not bend it. Its comment says K4 re-points it: the pick will then be
     refused while the window is open.
   - Result: the Leave War half of "unless the squadron picked no longer offers it" still has no case where the page is
     really not offered. **This is for the orchestrator to settle, and for K4 to know about.**

**Results** (each `npx vitest run` in `raptor-port/`, no lock needed):
- `src/ui/msq-guard-rollcall.test.ts` — 21 passed (21).
- `src/ui/msq-guard-open.test.tsx`, the whole file — **274 passed (274)**, with no stray errors, in about 8.5 minutes.
- The Leave War sheet files that touch `Sheet.tsx` (raptorsheet, ownaward, creditdoor, the three doubletap files, the
  four sheet-* files, sheetfocus, onedoor-sheets) — 12 files, 159 passed (159).
- `npm run build` — **PASS**. The checks lock was free, so I took it and released it the moment the build ended.
  Nothing was serving on port 4741.
