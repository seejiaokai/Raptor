Found **one incomplete reset in this change**, plus **one pre-existing day-reader fault** within the requested scope. No files changed.

**1. Closing the board still leaves the arrows counting from the old day.**

- **Failure:** On desktop Edit Schedule, press next four times to reach Friday. Open Friday’s board, select Monday, then close the board. Monday returns correctly, 20px in. Press next once: **Saturday appears instead of Tuesday**.
- **Cause:** The carried-day branches in [EditWeek.tsx](/D:/Raptor-edge/raptor-port/src/ui/EditWeek.tsx:234) and [ViewWeek.tsx](/D:/Raptor-edge/raptor-port/src/ui/ViewWeek.tsx:122) call `scrollWeekToDay` without `panForget`. `panBase` still accepts Monday’s position inside the remembered Monday–Friday interval and counts from Friday.
- **Exact fix:** Import `panForget` into both week components. When consuming `CARRYDAY`, reset the arrow state before restoring or writing the landing position. Keep ordinary repaint restoration unchanged.
- **Failing test:** Perform the board sequence above through the controls; assert Monday’s 20px landing, then Tuesday after one next press. Repeat closing the board by switching to View-only Sched. The committed tests cover neither route.
- **Evidence:** Running the actual navigation functions in memory produced day index **5**, where **1** was required; resetting the arrow state produced **1**. This does not depend on an unfinished glide.

**2. Edit Schedule’s date picker reads the hidden View-only week.**

This predates the change, but is a concrete fault in the requested front-day readers.

- **Failure:** Bring Thursday to the front on Edit Schedule, then open “Jump to a date”. **Monday is marked as the current day**, rather than Thursday.
- **Cause:** [WeekCal.tsx — `currentDayIso`](/D:/Raptor-edge/raptor-port/src/ui/WeekCal.tsx:38) selects `vWeek || eWeek`. Both remain mounted; the hidden `vWeek` wins. Its day rectangles are all zero, so `weekLeftDay` returns the first day.
- **Exact fix:** Import `CURPAGE`; select `eWeek` for Edit Schedule and `vWeek` for View-only Sched. Preserve the existing board-day priority and Monday fallback.
- **Failing test:** Reach Thursday using three arrow presses, open the calendar, and assert Thursday’s date has `aria-pressed="true"`. Repeat on both schedule pages. Before the fix, Edit Schedule selects Monday.
- **Evidence:** Executing the actual reader with the mounted-hidden-week geometry returned Monday while the visible week reader returned Thursday.

**Test review**

The seven committed new tests have meaningful day and geometry assertions; I found no empty-loop or empty-collection pass. However:

- The phone test never checks the AIRCREW tab’s presence or position, despite its name.
- The new tests do not cover calendar landings, board-close landings, week crossings, preview activation, crew-day follow, the foot-bar day label, resize across 820, or interrupted glides.
- In committed `HEAD`, the existing warning-jump test still expects a **0px** desktop offset, conflicting with the new **20px** landing. An uncommitted correction is present, alongside additions to the new test file; those are outside the requested committed diff.

**Checked without another concrete finding:** desktop-only CSS placement, folded/open specificity, the absolute hidden panel and clipping, tail arithmetic, preview landing/reset, week crossings, track reset, drag stepping, and the inset helper’s guards. The extra 26px of width and right padding cancel in the tail calculation.

**Questions requiring browser verification:** fractional zoom near the breakpoint, resize while folded, and jumps interrupting a glide—particularly when `hsSet` decides the requested movement is too small to write.

This was source review plus in-memory reproductions, **not a browser walkthrough or test-suite pass**. The excluded paths remained unopened.

Rulings: none this session.