# Re-walk of the fixes, walker W4, chat 13, 8 Nov 26

Build under test: dist-sm2 (origin 4398). `main`'s build (origin 4399) used for scenario 6 and the leftovers in 7.
Pictures: `docs/img/handpass/2026-11-08-sched-marks/w4/`. Scripts: `scripts/handpass/sm-w4-*.mjs`.

| Scenario | Device | Surface | Result | Picture | What the screen showed |
|---|---|---|---|---|---|
| 1 LL after publishing | PC | week | PASS | s1-pc-week-3-land | "Bolt · LL" is a button; foot "Tap a change to go to it."; tap scrolled to Bolt's row under Unavailable, ringed |
| 1 | PC | board | PASS | s1-pc-board-3-land | same; board row under Unavailable ringed |
| 1 | phone | week | PASS | s1-phone-week-2-land-early | scrolled to Bolt's LL row under Unavailable, cyan ring at ~300 ms (gone by 1.2 s) |
| 1 | phone | board | PASS | s1-phone-board-2-land-early | board row ringed, tooltip card "Bolt · LL" over it |
| 2 CSE after publishing | PC | week | PASS | s2-pc-week-3-land | line is a button, lands on Bolt's CSE row under Unavailable, ringed |
| 2 | PC | board | PASS | s2-pc-board-3-land | same |
| 2 | phone | week | PASS | s2-phone-week-2-land-early | scrolled and ringed (data: button, y moved) |
| 2 | phone | board | PASS | s2-phone-board-2-land-early | button; ring at early shot (opened only by data for this one, see note 1) |
| 3 Reject then → Unavail after publishing | PC | week | PASS | s3-pc-week-3-land | line "Saint · Meeting … on the programme → under Unavailable" is a button; tap lands on Saint's row under Unavailable, ringed; toast "Saint's Meeting filed under Unavailable" was from the press |
| 3 | PC | board | PASS | s3-pc-board-3-land | same on the board |
| 3 | phone | week | PASS | s3-phone-week-2-land-early | ring on Saint's Meeting row under Unavailable |
| 3 | phone | board | PASS | s3-phone-board-2-land-early | button; tap moved to board's Unavailable row (data) |
| 4 SANS availability after publishing | PC | week | PASS | s4-pc-week-1-list | line is a still line (a div, not a button), no foot hint, tap does nothing, no error |
| 4 | PC | board | PASS | s4-pc-board-1-list | same |
| 4 | phone | week | PASS | s4-phone-week-1-list | same |
| 4 | phone | board | PASS | s4-phone-board-1-list | same |
| 5 two-day meeting, folded Personal Inputs | PC | week | PASS | s5-3-land (before: s5-1-folded) | Personal Inputs was folded; tap on the meeting line opened it and flashed the meeting row ("Meeting 06:00 18:00 Saint LATE Safety brief") |
| 5 View-only Sched, Tuesday | PC | view-only | RECORDED | s5-4-viewonly-day | View-only Sched draws no pending button on Tuesday (it shows ORIG, no count), so there is no list or line to tap |
| 6 damaged neighbouring week, → Unavail | PC | week | PASS | s6-job-Unavail | grey note, "Blocked:" bold, exactly: "Blocked: this week's saved copy could not be read, so it can't be edited. Nothing was saved. Report it with "Report a problem" on the Help page." Shown once for one press; Sunday's rows unchanged; Undo stayed off |
| 6 Accept / Reject | PC | week | NOT RUN | s6-job-sunday | the meeting stood under Personal Inputs on Sunday with only "→ Unavail" offered (no Accept or Reject), so only → Unavail could be pressed |
| 6 same press on main | PC | week | RECORDED | s6-main-Unavail | amber outlined note: "Can't tell whether Saint's Meeting already has a row on another week — load that week first"; nothing changed, Undo off |
| 7a Escape in input window | PC | list | RECORDED | s7a-job | window stays open, remark kept; a card hangs from the ✕: "This input has unsaved changes. Close it and lose them?" with "Discard and close" and "Keep editing" (cyan on Keep editing). Second Escape: window still open. Same on main (not older/newer) |
| 7b wave templates window eye | PC | board | RECORDED | s7b-job-2-window | drawn line eye with "Shown", no typed 👁. Same on main (s7b-main-2-window) |
| 7c Escape in changes window | PC | week | RECORDED | s7c-job-2-afterEsc | Escape does not close it (stays open); same on main |
| Plain-user round | PC | week | see below | s8-* | |

## FAILs
None.

## Notes and odd things
1. On phone the ring is short (gone before ~1.2 s), so I read the picture taken at ~300 ms. For s2 phone board and s3 phone board I confirmed by the scroll/data and the early pictures exist but I opened only s1-phone-week, s1-phone-board and s3-phone-week myself. The SANS-card picture (s4-pc-week-3-sanscard) was taken but not opened by me.
2. Scenario 6: the meeting filed through the window was a timed one (06:00-18:00), not all-day (the window's default); Sunday shows it only under Personal Inputs (folded at first), nothing on its Ground Programme, because the next week's saved copy is unreadable.
3. Plain-user round (publish Wed, file LL for Bolt and a Meeting for Saint, open list, tap each, close with ✕, look): count stayed "2 pending" (right, still waiting); list shows "Saint · Meeting … not on the programme" and "Bolt · LL … filed"; each tap scrolled to its row and ringed it; the list window stays open after a tap, on phone the window is not visible after the tap (page scrolled behind it); ✕ closed it; Unavailable shows Bolt's LL. Two rings were on screen together when the second tap came within a second of the first. Nothing read wrongly. Pictures s8-1 to s8-5.
4. Scenario 3's first attempt pressed the wrong Reject (Nomad's, seeded OD); fixed in the script, only the corrected run counts.

## Page errors
sm-w4-a (all runs): none. sm-w4-s4: none. sm-w4-s5: none. sm-w4-s6: none (job and main). sm-w4-s7 / p7: none. sm-w4-s8: none.
