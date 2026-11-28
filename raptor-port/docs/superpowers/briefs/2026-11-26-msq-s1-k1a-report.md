# Section 1, step K1a — the builder's report (chat 198, 26 Nov 26)

Brief: `2026-11-26-msq-s1-k1a-brief.md`. Branch `claude/msq-s1-guard-6ae5e1`, nothing committed or pushed.

**One blocker: an existing test must change, and I have not changed it** (the brief's rule). `src/state/edit-rights-readers.test.ts`
counts, file by file, every call of `canEditSched()`. Moving the four template / Plans predicates into `ui/windrawn.ts` moves
four calls out of `DutyTplModal.tsx`, `WaveTplModal.tsx`, `DayTplModal.tsx` and `DraftsModal.tsx` into the new file. The
test is red: *"a caller of an edit question outside the inventory"*. The change it needs (and the matching line of
`docs/data-schema.md` §Edit rights by squadron, also outside my files):
- add `'ui/windrawn.ts': { n: { canEditSched: 4 }, kind: ['schedule'], why: 'the four template / Plans dialogs are drawn only while he may edit the schedule in view (D2317) — the predicate each dialog and the guard read' }`;
- remove the entries for `ui/DutyTplModal.tsx`, `ui/DayTplModal.tsx` and `ui/DraftsModal.tsx` (each now 0);
- `ui/WaveTplModal.tsx` goes from 2 to 1.
Same questions, same squadron. Only the file that asks them moves. Nothing else in the 30 component test files I ran broke.

## The blocker, settled — the inventory updated on the orchestrator's word (26 Nov 26)

The orchestrator approved the change. The reason: `edit-rights-readers.test.ts` is an inventory that says of itself
that a new caller turns it red until it is listed, and that an entry no longer used turns it red as well. Updating it
for a call that **moved files** (same question, same squadron) is its intended use, not a weakened test. I made exactly
the change proposed above:
- `'ui/windrawn.ts': { n: { canEditSched: 4 }, kind: ['schedule'] }` added, its reason naming Duty templates, Flying
  waves, Day templates and Plans, which each dialog asks there (D2317), moved from the four dialog files by K1a;
- the DayTplModal, DutyTplModal and DraftsModal entries removed;
- WaveTplModal 2 → 1;
- no regex and no other entry changed.

`docs/data-schema.md` §Edit rights by squadron: the schedule row's "Asked by" cell now says that whether each of the
four dialogs is drawn is asked in `ui/windrawn.ts`. The text was moved, not dropped, and each dialog is still named.

Checks: `npx vitest run src/state/edit-rights-readers.test.ts` gives **4 passed**. With the five sibling
reader-inventory files (`inputsfor-readers`, `roster-readers`, `unit-setting-guard`, `vconf-readers`,
`inputs-readers`) the six files give **22 passed**. None of the siblings names the four dialog files. No build was
run for this change and no lock was taken.

## Files changed, and why

New:
- `src/state/guard.ts`: the seam, built as §3.1 describes it. `setGuardAsk`, `setGuardSay`, `refusalAt`, `refuse`, `setGuardClose` / `closeShown`, `setEntryChecker` (a setter only, which stores the checker and is never called). It has no imports. With nothing installed, nothing is open and nothing is refused.
- `src/ui/windrawn.ts`: twelve drawn predicates built from module state alone (list below).
- `src/ui/guard.ts`: `GUARD_ROWS`, `GUARD_ORDER`, `FLOAT_WHERE`, `whatIsOpen(skip?)`, `rowReachable`, `closeShown`, `useGuardWork`, `useGuardCloses`, `workOn`. Also `guardAsk` and `guardCloseShown`, which are the two functions it installs into the seam as it loads. Exported so the A14 and A15 spies can wrap them.
- `src/ui/msq-guard-open.test.tsx`: A1–A5, A9, A10, A14, A15.

Changed:
- `src/ui/msq-guard-rollcall.test.ts`: R1, R2, R7 (the planted cases for R1's and R2's scans, plus R8's check), R8 and `TO_COME`. R9 is untouched.
- `src/ui/winorder.ts`: `winUp(id)`, read only.
- `src/ui/SansCal.tsx`: `useGuardCloses('sansday', !!dayIso, () => showDay(null))`. This is the one component report in this pass. The closer it hands over is the SANS day's own ✕.
- `src/test-support/msq-world.ts`: `import '../ui/guard'`. The two global test set-ups are not touched.
- The components whose predicate moved, each now calling its `windrawn` function:

| Component | Was | Now calls | Its tests run |
|---|---|---|---|
| `ui/AvailWindow.tsx` | `isOpen = !!open`, `if (!open)` | `availDrawn()` (and `if (!isOpen \|\| !open)`) | `availwin`, `toastplace` |
| `ui/ChangesWindow.tsx` | `chgUp = !!w && isMember()`, `if (!w \|\| !isMember())` | `chgDrawn()` (`if (!chgUp \|\| !w)`); the `isMember` import dropped | `toastplace`, `escwindows` |
| `ui/InputWindow.tsx` | the second return's `hidden={!open}` | `hidden={!inputDlgDrawn()}` (the same value, because `win` is false there) | `editorwindow`, `windowdoors`, `msq-guard-input-sqn` |
| `ui/Modals.tsx` InsightsModal | `if (!INSIGHTS)` | `insightsDrawn()` | `outside` |
| `ui/DutyTplModal.tsx` | `TPLEDIT && !(SESSION && !canEditSched())` | `dutyTplDrawn()`; the unused imports dropped | `DutyTplModal`, `outside` |
| `ui/WaveTplModal.tsx` | `WAVEEDIT && !(…)` | `waveTplDrawn()` | `WaveTplModal`, `planselector` |
| `ui/DayTplModal.tsx` | `!!DAYTPLEDIT && !(…)` | `dayTplDrawn()` | `daytplui` |
| `ui/DraftsModal.tsx` | `!!open && !(…) && CURPAGE === 'editsched'` | `draftsDrawn()` | `draftsui`, `amendretest` |
| `ui/SchedBoard.tsx` CxDialog, SortAllDialog | `CXT != null`, `di != null` | `cxDrawn()`, `sortAllDrawn()` (Sort all's `d` keeps `di != null` beside it, for the type check) | `board`, `windowkeys`, `boardescape`, `interact` |
| `ui/MedMoveConfirm.tsx` | `if (!m)` | `medMoveDrawn()` | `medmove`, `upchitcuts`, `upchitdelete` |
| `ui/OilWaitSheet.tsx` OilWait | `if (!w)` | `oilWaitDrawn()` | `oilwait`, `caldrag`, `oilaskhead` |

No component file gained an export. Each change keeps the old expression in a comment beside the call, so a reader can see that nothing in what the component draws changed. `src/engine/` is untouched.

## The table — row, counts, where, ruling

| id | counts | where | ruling / note |
|---|---|---|---|
| inputedit | window | inputs | D2403. `winUp` |
| inputsday | window | inputs | plain window until K1b (E1, D2654). `winUp` |
| sansday | closes | inputs | D2597. `winUp`; closer from `useGuardCloses` |
| inputsset, sansset | window | any | plain window until K1b (E1, D2654) |
| days, everywd, holiday | window | any | plain window until K1b (E1, D2654) |
| oilday | window | any | D2403 names it |
| lwday | closes | leavewar | D2597. `closeDayPanel` |
| avail, chg | closes | any | D2596. `closeAvailWin`, `closeChanges` |
| inputdlg | window | any | `inputDlgDrawn` |
| insights | closes | any | D2597. `setInsights(false)` + notify |
| dutytpl, wavetpl, daytpl | window | any | windrawn |
| drafts | window | editsched | windrawn |
| cxdlg, sortall | window | any | the board's two (his A3) |
| airpop, daypop, weekcal, docview | no | any | D2627 A1, they close at the press (barfree) |
| medmove, oilwait | window | any | §3.2 (e) |
| lwsheet | window | leavewar | `warWindowOpen()`. Every sheet refuses. `lwshow` is K1b's |
| belllist, sqnlist, drawer, insmenu, boardmenus, datecal, medcal, icpick | no | any | lists, menus and pickers |
| board, oilearn, arm, restarm, unpubarm, lgedit, qedit, secdef, oilbar, welcome | no | any | modes and bars. `lgedit` and `qedit` have no `end()` yet (K1b) |
| unsaved | unsaved | any | `saveRefused()`. "Not kept" is not a row (D2594) |
| daynote, helpbug, calnote, balfig, logicsearch, qualsfilter | no | any | `why: 'H13 …'` (D2636) |

`GUARD_ORDER` puts the question sheets first, then the Input window, then the Calendar's forms ahead of the Calendar and the settings windows (§17 reading 6). The other windows follow, and `unsaved` comes last, so a window open beside a failed save outranks it (A4). No K1b or K1c row is declared, because the table's typing did not need any.

## The tests

Seen failing first. Both new files failed whole, before their modules existed:
- the roll-call file: `Cannot find module './guard'`;
- the open test file: `Failed to resolve import "./guard"`.

Then green:
- the roll-call file: **17 passed** (R9's 3, R1's 7, R2's 2, R8's 1, R7's 4);
- the open test file: **174 passed**. A1: 4. A2: 47 (the map check, then every way out of 19 rows). A3: 17. A4: 2. A5: 1. A9: 2. A10: 96 (19 rows × 5 changes, plus the worked case). A14: 1. A15: 1. It takes about 6 minutes.

**Pins: A14 and A15.** Both are green, and both are named pins in their titles. They could not be seen running on the old code, because the seam they spy on is new in this step. They pass because no door calls the seam yet.

**One test was repaired after the code existed.** Six A2 cases failed on the first run: Every Monday and a holiday, each by ✕, Cancel and Escape. Both windows open from the Calendar, so when either closes, the Calendar is what counts, not nothing. The guard was right; the test's expectation was wrong. The opener now names `under: 'days'` and A2 expects that row after the way out. Re-run: green.

Also run, all green: `pops.test`, `view-reset.test`, `msq-guard-asis`, `msq-guard-input-sqn`, `msq-guard-g`, and the 30 component and window files in the table above (782 passed, 5 to-do). The reader inventories `inputsfor-readers`, `roster-readers`, `unit-setting-guard`, `vconf-readers`, `inputs-readers` and `noteswords` are green. `edit-rights-readers` is the one red: the blocker at the top.

## TO_COME, whole

In the roll-call file:
- R3 (K1b);
- R4 (K1c);
- the rows `oilrevise`, `holimport`, `qualsnew` and `lwshow` (K1b);
- Admin's six typed-work reports, `PersonEditor`, `ArchivedEditor`, `Waiting`, `NewSquadron`, `MoveEditor`, `PlaceEditor` (K1b);
- the E1 shape of `days`, `inputsset`, `sansset`, `everywd`, `holiday` and `inputsday` (K1b);
- the `end()` of `lgedit` and `qedit` (K1b);
- `trk`, `trkask` and `trkinfo`, with `trkinfo` joining R8's ruled list (K1c).

In the open test file:
- A6, A7, A12, A16, A17 (K1b);
- A8, A11, A13 (K1c);
- the chart-editor and Tracker-details halves of A14 and A15 (K1c).

## Where today's code differs from the plan, and what I did

1. **`edit-rights-readers.test.ts` must change.** This is the blocker above. It is not edited.
2. **The one-shot hand-offs are not rows.** These are `INSIGHTS_ALL`, `AIRRID`, `INPEDIT_REFOUND`, `OILASK`, `OILOWN` and `BELLAT`. The plan's §3.2 (i) lists them as 'no' rows. I put them, with every view-state flag of `state/view.ts`, in R1's own census instead. Each has its reason, which is the "not a window" route that R1 allows.
3. **Logic's edit mode flag, `LGEDIT`, is in `state/auth.ts`**, not in pops or view. Its row reads it, and R1's existence check reads `state/auth.ts` for that one flag.
4. **`where` for the movable windows mounted at the app's top level is `'any'`.** These are `inputsset`, `sansset`, `days`, `everywd`, `holiday` and `oilday`. `inputedit`, `inputsday` and `sansday` are `'inputs'`, and `lwday` is `'leavewar'`. The plan named only the frame's mount point.
5. **The board's dialogs** are at `SchedBoard.tsx` around l.909 and l.1003, as K0 found. Only their two predicates changed in that file (§9's promise).
6. **The guard now loads with the app.** `SansCal.tsx` imports `ui/guard`, so the guard loads in the app bundle from this step, ahead of K3's `guardnote`. It answers only when it is asked, and nothing asks it yet.
7. **Openers.** Some windows are opened by the function their own button calls (`setTplEdit`, `setDaysWin`, `setInpSet`, `setOilList`, `setOilWait`, `setDraftsEdit`, `setAvailWin`, `openChanges`, `openDayPanel`), as K0's pins do. Others are opened by a real press or tap: CX, Sort all, the calendar days, Every Monday, Add a holiday, the Leave War gear, the bell, Logic's and Quals' ✎ Edit. The medical question comes up through the calendar drag's own door, `commitChipMove`. A failed save is given to the guard the way `main.tsx` gives it the saver: `watchSaves` with a saver whose state is 'failed'.

## What I could not check without a browser, and what is left

- **The page itself was never looked at.** No browser or walk was run, as the brief says. jsdom has no layout, so a box hidden by a style rule cannot be seen by A10 (N12, which is the browser tests').
- **A3's 'no' rows.** I opened the module-flag ones: daypop, weekcal, docview, belllist, drawer, board, lgedit, qedit. The rows held in a component's own state were not opened.
- **Owed outside my files:**
  - `docs/file-map.md` gets the four new files at step K12 (the records step);
  - `docs/data-schema.md` §Edit rights: done, on the orchestrator's word (the section above);
  - `docs/feature-impact.md` needs the guard's known limit (§10 step 9, a later step).
- **`npm run lint:changed`** ran once and exited 2: *"could not compare against origin/main"*, as chat 194 found. React Doctor's count for this change is **NOT RUN**.
- **Left for K1b or K1c that the plan's step 1 row placed in step 1:** the six Admin reports and `oilrevise`, `core.js TRK_WINDOWS`, the `role.js` bridge and its closer, and B18.

```
Status: READY FOR INDEPENDENT REVIEW
Changes: new state/guard.ts, ui/windrawn.ts, ui/guard.ts, ui/msq-guard-open.test.tsx; winorder.ts winUp; SansCal.tsx useGuardCloses; msq-world.ts imports ui/guard; 11 components call their windrawn predicate; msq-guard-rollcall.test.ts gains R1, R2, R7, R8, TO_COME; state/edit-rights-readers.test.ts inventory and docs/data-schema.md §Edit rights updated for the moved calls (orchestrator's word)
Checks: in raptor-port/ — npx vitest run: the two new files 17 + 174 PASS; 30 component files 782 PASS; pops, view-reset, asis, input-sqn, guard-g PASS; edit-rights-readers 4 PASS, with its five sibling inventories 22 PASS; npm run build PASS (run before the inventory change, under the checks lock); npm run lint:changed NOT RUN (could not read origin/main)
Open items: docs/file-map.md gets the four new files at step K12 (the records step), not edited here; React Doctor count unchecked
```
