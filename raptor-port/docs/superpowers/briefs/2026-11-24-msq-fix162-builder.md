# The fix helper's hand-back, chat 162 (a Fable helper, 24 Nov 26) — saved from its report, shortened only in its lists of commands

Status: READY FOR INDEPENDENT REVIEW for fixes 4, 6, 7 (three local commits); fix 8 is report only; fixes 1, 2, 3, 5 were
STOPPED when he raised the guard rail (D1613; since ruled, D2403 — [MSQ-PICK-GUARD]) with nothing built.

## Stopped: 1, 2, 3, 5 — what the reading found, for the guard rail's build
- **Where the fault sits.** `ui/InputWindow.tsx` notes the PAGE's squadron when a window opens (`openedOn.unit = pageSqn`) and holds only when that differs from the page's now. An input of another squadron opened by someone with rights in both is never held, and a later pick of its true squadron holds it with an untrue band.
- **"The input's own squadron" for an input naming two squadrons' people (decided, not built):** the page's squadron wherever the input touches it (`inputSquadrons(r)` includes it), else `inputUnitOf(r)`. Reason: the Inputs list shows an input on every squadron it touches, so it must never be held there.
- **Catch A, needs his word under either design.** The Inputs list and calendar also show "every input naming him wherever it sits" (`engine/inputs.ts inputsListed`). So Saber or a Plan holder with 149 picked sees his own 142 inputs on 149's Inputs page; under the reader's step 3 a tap on his own input there would open greyed with "This is 142's. You picked 149".
- **Catch B, a hole in the security reader's step 3.** It tests `ownPageMayBe(u)` only when the window opens. Opened in the member view (read only by role), then switched back to admin, the window is live under the wrong bar. If holding is kept, judge it live.
- **Catch C.** Where the squadron in view was not reached by a pick, `heldWords` gives the generic "This change could not be saved."
- **Every `setInpEdit` door (from a grep; none tested):** `ui/InputsPage.tsx` 425, 418; `ui/InputsCal.tsx` 511, 950, 502; `ui/SansDay.tsx` 82; `ui/sansadd.ts` 36; `ui/MedicalView.tsx` 221; `ui/DocViewer.tsx` 130, 139; `ui/interactions.ts` 1389, 1359; `ui/inputedit.tsx` 1625, 1863 (`askOilIfPending`); `leavewar/sync.ts` 883, 4636 (the clash note's `openInputWindow` is one; not read); `ui/OilDayList.tsx` 125; `ui/topstate.ts openInputOnPage` (a bell line, the bell's OIL); inside the window 347, 363, 429, 570, 1454. Undo and Redo reopen no closed window; they re-find the open one by id.
- **Fix 2.** `OilDayList` Body `openInput` sets the window before the page and never compares the list's squadron with the page's. **Fix 3.** `bellTap`'s OIL branch has no `enterForLine`; `oilPendingFor` reads every squadron's inputs. **Fix 5.** Neither lead examined (`goClash`, InputsCal's `revealed`).
- **Overlap:** fix 4 added a third argument to `openInputOnPage` and uses it in the OIL branch, the lines fix 3 would edit.

## Fix 4: a bell tap re-checked after the Tracker question (`fa79b2b50`)
- Test `src/tracker/msq-bell-recheck-after-ask.test.tsx`: three failed before (a Plan taken while the question is up, Discard opened Osprey's input; an OIL question answered by someone else meanwhile still opened; a different person signed in when the answer comes), two controls passed.
- Change, `ui/topstate.ts`: `openNotice`'s re-run goes on only if the line is still his (`stillHis`: addressed to `me()` and `noticeLive`); `openInputOnPage(iid, first, still)` returns after a wait if `me()` changed or `still()` is false; `bellTap`'s OIL branch passes "still pending for him". Nothing new said or drawn.
- For the reader: the check is `noticeLive` on the line object, not membership of `noticesFor`, so B1's existing test stays green unchanged; the test swaps the session under the open question (a real sign-out cancels the question, so the third test pins a belt no road reaches today); today's real road is his own move at midnight, not tested.

## Fix 6: C2, Escape with the squadron list over an Input window (`2ead793cd`)
- Test `src/ui/msq-sqnlist-escape-over-input.test.tsx`: three failed before (nothing typed: the window closed instead of the list; words typed: the close question came up; the close question already up: Escape answered it), one control passed.
- Change: `ui/sheetfocus.ts` new `escListTop()` (what the one Escape list would answer now, no side effect); `ui/InputWindow.tsx` `esc`, `win` branch, leaves the key to that list when its top is not inside the window, never under the window's own sheets. The ☰ menu's squadron list and the Schedule Insights menu are covered by the same list.

## Fix 7: A1, the Tracker question's keys (`d3b3f6224`)
- Test `src/tracker/msq-trk-ask-keys.test.tsx`: failed `expected 'sqnMenuBtn' to be 'dlgCancel'`; the control passed.
- Cause: only `TrkAskOnly`'s off-tab step moved the keys. Change, `tracker/TrackerPage.tsx TrkAskOnly`: a second layout step for the Tracker's own tab focuses Stay; when the question goes the keys return to where they were. Nothing in `core.js` touched.
- Side effects: the Logout question on the Tracker tab takes the keys the same way; a mouse pick on the Tracker tab also lands focus on Stay. Not done: the refusal box after a refused "Save them" gets no focus.

## Fix 8: the store-write lead (report only)
- No real browser failure reaches it: the Tracker's store is a memory write that cannot fail for a browser reason; a full or blocked browser store fails later in the background saver, which is caught ("Not saved — keep this page open", the Tracker's corner stops saying saved).
- A store that does throw (a test double; probed, not committed): "✓ Save changes" returns saved and clears the unsaved mark, nothing is stored, the corner reads "● local only" (words left from the standalone app), one promise rejection unhandled. Three write sites and a wording choice: left alone. Probe: `raptor-port/.tmp/fix162-lead8-store-throws-probe.test.tsx.txt`.

## Checks
Each new test file red before, green after; the 14 files that call `openNotice` or `bellTap` (267 tests), 17 files pressing Escape around the Input window and menus (495), 15 Tracker and night files (304): pass. `npx tsc -b` before each commit: pass. NOT run: the build, any browser test, the full unit suite, the Tracker smoke, `npm run lint:changed`. No role rule changed. `docs/file-map.md` still needs the three new test files and `escListTop`.

## To press on the running app (1536 and 402)
- Fix 4: Hunter with Plan of 149 and an unsaved chart edit presses a 149 line that opens an input, then Discard (the normal path); the bell's OIL line over a held draft, Stay and Discard (a holiday made over his input leaves one). The right-ended case cannot be pressed short of his own move at midnight.
- Fix 6: Saber, Inputs, a window open, the squadron list opened by mouse and by keys, Escape once then again, in three cases (nothing typed, words typed, the close question up); the same with the Schedule Insights menu and with the Calendar window open. At 402 the form covers the top bar: expect not reached.
- Fix 7: on the Tracker tab, a pick by keys: Stay focused, Enter answers Stay, the keys return to the squadron button, Tab reaches Discard and Save; the same from the ☰ list; Logout by keys; a mouse pick then Enter; at 402 a finger pick still shows the question.

## For a reader to attack first
1. Fix 6's premise that anything in the one Escape list over the Inputs page's window was opened after the window's last press (the ALL AVAIL and changes windows, the ☰ drawer).
2. Fix 4: whether `noticeLive` on a line object is the right "still his" for every kind of input line.
3. Fix 7: `keysBack` when the question is replaced by the refusal box; an Enter still held from the pick.
