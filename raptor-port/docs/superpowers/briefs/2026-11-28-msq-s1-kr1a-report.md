# KR-1a — every closer, no door calling it: the builder's report (chat A211, 28 Nov 26)

Built by a fresh Opus builder from `2026-11-28-msq-s1-kr1a-brief.md`, branch `a211-s1`, worktree `a211-s1-kr-dd0560`.
Nothing committed, nothing pushed. Nothing a person sees changes: no door calls a closer yet, no word on screen was added
or changed, and every refusal is exactly as before (the 58 red door tests stay red, the same 58).

## What was built

**Every `window` / `row` row of `ui/guard.ts GUARD_ROWS` carries its `close`** (the plan §3's column "Its close") — but
Admin → Users' four (`userrow`, `archrow`, `giveaccess`, `addperson`), KR-1b's. Each close is the row's own way out as it
can be pressed today:

| Row(s) | Close |
|---|---|
| `inputedit`, `inputdlg` | `setInpEdit(null)` + paint — the window's Cancel (its re-seed drops the "Close it and lose them?" question with the record) |
| `inputsday` | handed by `InputsCal` through `useGuardOpen` — `closePop` (✕ / Escape: a picker settled as its Cancel settles it) |
| `everywd`, `holiday`, `holimport` | the Calendar's ✕, `setDaysWin(null)` + paint — the forms unmount with it; a holiday kept waiting for a leave period is dropped (D2837) |
| `oilday` | `setOilList(null)` + paint (✕ / Close, never "Later") |
| `dutytpl`, `wavetpl`, `daytpl` | their flags off + paint |
| `drafts` | handed by `DraftsModal` (its Escape: `setNm(null)`, `setDraftsEdit(null)`), the module setter when nothing is mounted |
| `cxdlg` / `sortall` | `setCxt(null)` + paint / `cancelSortAll()` |
| `medmove` / `oilwait` | `setMedMove(null)` / `setOilWait(null)` + paint (the silent drop, never `leaveOilWait()`) |
| `oilrevise` | handed by `InputsPage` — `setOilConf(null)` |
| `qualsnew` | handed by `QualsPage` — `setNewQual('')` |
| `newsqn`, `sqnmove`, `placeedit` | handed by each `SquadronsPanel` editor — its Cancel (`setOpen(null)`) |
| `lwsheet` | `closeWarAll(flushSync)` — the loop (below) |
| `trk` | `trackerCloseOpen()` — the bridge (below) |

A new row field, `handed: true`, marks the closes a component hands over; R1 now reads that the frame makes that very
`useGuardOpen('<id>', …)` call.

**`useGuardOpen(id, open, close, counts = open)`** (`ui/guard.ts`) — the two old hooks in one call: the latest close held
while `open`, the row counted while `counts`. Used by `InputsCal`, `InputsPage`, `QualsPage`, `DraftsModal` and the three
`SquadronsPanel` editors. `useGuardWork` / `useGuardCloses` stay as they were for every other caller (UsersPanel's among
them); `useGuardSection('squadrons')` stays.

**`closingForDoor()` / `whileClosingForDoor(fn)`** (`state/guard.ts`) — a module flag, true only inside `fn`, put back
after whatever `fn` does. Read by the two boxes: Plans' name (`DraftsModal commitName` — a refused name says no "A plan
needs a name" / "…already has that name") and the event presets (`EventSheet boxDone` / `typesBack` — the refusal is not
said and the sheet is not held open for it).

**The Leave War loop, `closeWarAll(commit)`** (`state/guard.ts`): the top sheet closed by its own close, committed at once
(`ui/guard.ts` hands in React's `flushSync`), the list read again, until it is empty. A sheet leaves the list only as it
unmounts (`Sheet.tsx`, unchanged in that); the probe now hands each sheet's panel as its `key`, so the loop can tell
whether the sheet it closed is gone. A close that leaves its sheet on the list stops the loop with `false` — never a
wait.

**The Tracker bridge** (`tracker/role.js trackerCloseOpen(id?)` / `onTrackerCloseOpen`; one registration in
`tracker/app/core.js`): every window of `TRK_WINDOWS` that counts `'window'`, each by its own exported closer (`closeInfo`,
`closeEdit`, `closeModal`, `closeOrd`, `closeCopy`, `closeFlexWin`, `closeShowAll`, `closeLullPicker`, `closeLullCopy`);
a job's question (`dlg`) and every one queued behind it: the job ENDED first — `sessionSerial` bumped, nothing else of
`endSession()` — then each answered cancelled. Never while `switchAsking` (the question a door asks — D2825 keeps it).

**The roll-call** (`ui/msq-guard-rollcall.test.ts`): R8 widened — "no other row carries a closer" became "neither the
change not saved nor a 'no' row carries one"; R7's planted case moved accordingly (on `unsaved` and `belllist`, and a
window with a close reported as nothing). R10 green: the only rows without a close are the four Users rows, named in the
test's own title ("owed by KR-1b: userrow (row), archrow (row), giveaccess (row), addperson (row)") — it fails if a fifth
row lacks one, or if one of the four gains one (then KR-1b has landed and the list goes). R1 reads `useGuardOpen` as a
report and as a closer handed over.

## The `dlg` callers (the plan §5 3b: "every `dlg` caller … stops after a cancelled answer once the serial moved")

Read every function in `core.js` that asks more than one question (`connectClick`, `addModule`, `addStudent`,
`removeStudent`, `renameStudent`, `addCourse`, `renCourse`, `delCourse`, `dupSyl`, `addSyl`, `renSyl`, `delSyl`,
`saveCopyClick`, `importClick`). Each stops at a cancelled answer by itself (a cancelled prompt is `null` → return; a
cancelled confirm or choice is `false` / `'cancel'` → return) — except **the import's "Skip this one"**, whose cancelled
answer goes on to the next chart: the import reads `ended()` at the head of every chart and after each wait, so the
bumped serial stops it there. The export reads `gone()` after every wait. Pinned: the import test below (ended → the third
chart never comes in) beside its control (the prompt's own "Skip this one" → the third does come in). One thing seen, not
changed: `dupSyl` / `addSyl` say "…failed — reloading" in an alert and then reload; a cancelled alert still reloads — the
same as a sign-out's cancel today, and only on a save that already failed.

## Tests — red first, by the patch method

New: `src/ui/msq-guard-closers.test.tsx` (43 tests, one describe a row family — the Input window and the Inputs day; the
Calendar's forms with D2837's waiting holiday; OIL; the schedule's windows; Quals and Squadrons; the Leave War loop;
`closingForDoor`; the Tracker), its helper `src/test-support/msq-guard-closers-kit.ts` (every store read — the scheduler's,
each squadron's Leave War world, the Tracker's whiteboard — and what a close changed). Each test calls the row's own
`close` and asserts the row shut and the stores unchanged (or, where the row's own way out keeps something, kept exactly
as it keeps it: the Inputs day's note written once with no people; the held bid's words on 142's war).

Seen failing: `git diff` of the eleven source files to a patch, `git checkout --` those files, the closers file and the
roll-call run, the patch applied back. On the old code: **closers 41 failed / 2 passed; roll-call R10 failed**.

**New tests that pass on the old code, by name:**
- closers: "(the control, passes on the old code too) the same waiting holiday with the Calendar left open: the period
  made, it saves itself — so the test above can see a save";
- closers: "(the control, passes on the old code too) the same question answered by its own third button, "Skip this
  one": the import goes on — the third comes in — so "ended" is not the prompt's Cancel";
- roll-call: R8's widened test, and R7's re-planted R8 check (true on both: the old code carried no closer on a window).

**The door tests, `src/ui/msq-guard-drops.test.tsx`:** before 58 failed / 2 passed / 2 todo (3 unhandled errors, the
Leave War grid's `elementFromPoint` in jsdom); after 58 failed / 2 passed / 2 todo (the same 3) — **the same 58 by name**.

## Checks (from `raptor-port/`)

| Check | Result |
|---|---|
| `npx vitest run src/ui/msq-guard-closers.test.tsx` | PASS — 43/43 |
| `npx vitest run src/ui/msq-guard-rollcall.test.ts` | PASS — 52/52 |
| every guard file but `-open` and `-drops`, the Tracker files naming `role.js` (`leftovers`, `msq-trk-follows-pick`, `msq-trk-pick-ask`, `people`, `tracker`, `trk-batch-ui`, `trk-flex-setting`), and the touched reports' own files (`eventsheet-presets`, `eventsheet`, `eventslist`, `events`, `sheet-order`, `holdsheet`, `onedoor-sheets`, `draftsui`, `inputscal`, `msq-squadrons-panel`, `quals`, `msq-pick-windows`) — one run, `--maxWorkers=4` | PASS — 34 files, 1303 passed, 7 todo |
| `npx vitest run src/ui/msq-guard-drops.test.tsx` | 58 failed / 2 passed / 2 todo, as before (red by design) |
| `npx vitest run src/ui/msq-guard-open.test.tsx` (once, at the end) | PASS — 190/190 |
| `npm run lint:changed` | the three known `ui/UsersPanel.tsx` findings only. (A fourth, `react-doctor/no-flush-sync` on `ui/guard.ts`'s import, kept with its reason in a disable comment on the line above: the loop must commit each sheet's close at once — the plan's §5 6c.) |
| `npm run build` (under the checks lock) | PASS |
| `npm run smoke:tracker` (under the checks lock, through `gatelock.mjs exec`; the lock released, status "free") | PASS — 472 passed, 0 failed |
| `npm run docsize` | PASS ("every record accounted for"; its size line "OVER by 357, deferred (D29)" is the branch's, not this change's) |

## The builder's readings (none is his rule)

1. **`useGuardOpen`'s fourth argument, `counts`** — the plan's hook is `useGuardOpen(id, open, close)`, counting while
   open. Counting an Admin → Squadrons row while merely open would make an opened, unchanged row refuse a pick today
   (`msq-guard-open` pins "opened, nothing in it → nothing"), a change he would see in a step meant to change nothing. So
   until each door is converted the row counts what it counted before, and the close is held while open, changed or not
   (205's answer). KR-3/KR-4 (or KR-5) drop `counts`, and the rows' `open()` then reads "open".
2. **The `trk` row's close closes the refusing windows only**; the show-only ones (`trkinfo`, `trkpop`, `trkdown`,
   `trkfail`) keep their own rows and `closeShown`'s closer.
3. **The `lwsheet` row's close discards `closeWarAll`'s answer** (the row's `close` returns nothing). KR-2's closing step
   should call `closeWarAll(flushSync)` itself where it must know "no progress → do not enter".
4. **Left on the old hooks, not named by the brief:** `useGuardCloses` for `lgedit`, `qedit`, `sansday`; `useGuardWork`
   in `EveryWeekday`, `HolidaysPanel`, `InputsSettings`, `SansSettings` (their closes are the module's own; the plan's KR-5
   removes the reports that only fed `dirty`, `holds` or words).
5. **`inputsday`'s row still reads its place in the order of windows up**; the count `useGuardOpen` adds for it is read by
   nothing.

## For the walk's scenario designers — what only a browser can show

- The Leave War loop relies on React running a closed sheet's unmount (its `useEffect` clean-up, which takes it off the
  list, and its savers) inside `flushSync`. jsdom shows it does; a real Chrome and WebKit should be watched too, with two
  sheets stacked (a person's window, ⚙ Settings over it) and with a keeping close (a held bid's Remarks typed, not left).
- A focused box's blur at a door (Plans' name, an event preset's name, a template time) in WebKit, where a button press
  takes no focus — the closing step's blur (KR-2) is what saves or drops it; here only the flag was proved, in jsdom.
- The Tracker's question box closed by the bridge while its shade covers the bar — that the shade goes with it and
  nothing of the chart behind is left inert.
- Nothing on screen should differ from `main` in this step: a plain-user round over the Inputs pages, the Calendar, the
  board's two dialogs, Admin → Squadrons, the Leave War's sheets and the Tracker's windows, each opened and closed by its
  own controls.

```
Status: READY FOR INDEPENDENT REVIEW
Changes: ui/guard.ts (a close on every window/row row but the four Users rows; `handed`; useGuardOpen), state/guard.ts
  (closeWarAll; closingForDoor / whileClosingForDoor), leavewar/ui/Sheet.tsx (each sheet's panel as its key),
  leavewar/ui/EventSheet.tsx and ui/DraftsModal.tsx (read closingForDoor), tracker/role.js + tracker/app/core.js
  (trackerCloseOpen, the job-ending serial), ui/InputsCal.tsx, ui/InputsPage.tsx, ui/QualsPage.tsx, ui/SquadronsPanel.tsx,
  ui/DraftsModal.tsx (closers handed through useGuardOpen), ui/msq-guard-rollcall.test.ts (R8 widened, R10 naming KR-1b's
  four, R1 reading useGuardOpen); new ui/msq-guard-closers.test.tsx and test-support/msq-guard-closers-kit.ts;
  docs/file-map.md (the chat's entry).
Checks: see the table above (working directory raptor-port/).
Open items: KR-1b (the four Users rows' closers, UsersPanel.tsx's three reports to useGuardOpen); the builder's readings
  1–5 above for the orchestrator; the walk owed (nothing to see changed, by design).
```
