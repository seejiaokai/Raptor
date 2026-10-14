# A fresh, blind read of the finished code: `[OIL-PLAN-SWITCH-UNASKED]` (D865), Opus

Read: `git diff 62b649e29..HEAD -- raptor-port/src`, with the code around it: `ui/board.ts` `switchDraft` and `planMenu`,
`ui/interactions.ts` (the preview's "Switch to this plan" and "Load onto working copy" handlers), `ui/DraftsModal.tsx`,
`ui/oilputback.ts`, `engine/drafts.ts` (`draftSelect`, `leaveOut`, `draftDelete`, `rowsLeftSentences`), `engine/slots.ts`
`reconcileDayFiling`, `engine/daytpl.ts` `applyDayTpl` / `pickDayTpl`, `leavewar/sync.ts` `oilOpenOn` / `oilAskPlan`,
`engine/inputs.ts` `oilSilent`, `ui/OilDayList.tsx`, `ui/pops.ts` (`OILLIST`), the stacking order of the windows
(`scheduler/08-windows-tools.css`, `10-board-history.css`, `22-float-windows.css`), the new tests (ON12 in
`ui/oilwait.test.tsx`) and the five re-pointed test files. The old load code compared from
`git show 62b649e29:raptor-port/src/ui/interactions.ts`. Full rows read: D865, D863, D862, D818, D793.

**Verdict: CLEAN WITH THESE CHANGES** — two low findings; nothing wrong in the counting, the order or the doors.

## Findings

### F1 — low — the plan editor's "Select" closes the editor when an OIL list was ALREADY open, though the switch opened none
- **The failure.** A day is made a holiday; its OIL list opens by itself (or he opens it from the bell). The list is a
  window that does not block the page (D641), so he leaves it up, opens the plans menu, taps "✎ Manage plans", picks a
  plan and taps "Select". That plan brings back nothing that needs an answer. The editor closes anyway. The change's own
  contract — and its own test's words — say "where it opens none, the editor stays"; before this change it stayed.
- **The cause.** `ui/DraftsModal.tsx`, the "Select" button: `if (OILLIST) close(); else notify()` asks whether a list
  is open, not whether THIS switch opened it.
- **The fix.** Remember the list before the switch and close only when the switch set a new one (`setOilList` always
  makes a fresh object, so identity tells them apart):
  ```tsx
  onClick={() => {
    const before = OILLIST
    if (!t || !switchDraft(di, t.id)) return
    if (OILLIST && OILLIST !== before) close(); else notify()
  }}
  ```
  (`OILLIST` is a live ESM binding, so reading it after the call sees the new value.)
- **The red test.** In ON12's last case, before the second "Select" (back to Plan A), open a list for another day
  instead of clearing it — `pops.setOilList({ from: SUN_ISO, to: SUN_ISO, name: '', fresh: false })` — and expect
  `editorOpen()` to be `true`; it is `false` today. Not run; plain from the line above.

### F2 — low — the IT flow guide still quotes the switch's old words
- **The failure.** `raptor-port/scripts/itflow/content.mjs` (the plans slide's checks) tells the IT reader: *The toast
  says how the plan compares with what was issued ("matches Original — nothing pending").* The app now says
  "Nothing is pending: it matches the Original." The guide quotes a sentence nobody will see.
- **The cause.** The switch's note was reworded in `ui/board.ts switchDraft` (D865); the one live text outside `src` that
  quotes it was not searched for (D201 — fix what the old wording left behind, in the same change).
- **The fix.** Change that line's quote to `("Nothing is pending: it matches the Original.")`. (The walk scripts under
  `scripts/handpass/am/` that match the old toast are records of past walks, not live checks — not counted.)
- **The red test.** None in the gates; `grep -rn "nothing pending" raptor-port/scripts/itflow` finds it.

## What was checked and found right
- **The reading moved whole.** `oilPutBackWatch` is the old load body line for line: the same `stands` (on the programme
  or under Unavailable, covering the day), the same widened date range over every day the day's inputs cover (D862), the
  same "stood before AND already open" exclusion, the same `back` filter and the same list (days sorted, the holiday's own
  name only when every day is one, `plain` otherwise). The only order change in the load — the list is set before the log
  line and the toast instead of after — changes nothing either reads. Every symbol the load lost (`dayIso`, `oilOpenOn`,
  `dayFacts`, `holidayOwnName`, `setOilList`, `rowsLeftSaid`) has no other use left in `interactions.ts` or `board.ts`.
- **The count.** Cancelled and information-only inputs drop out through `oilOpenOn` → `oilSilent` (D814); a taken-off
  ('r') input is neither re-filed by `reconcileDayFiling` nor "standing", so a switch never counts it (the settled
  design of 28 Sep 26 — Accept asks, D793); under Unavailable counts (D804); a partly answered input counts while any day
  is unanswered; a shared or ALL AVAIL input is one record, one count. The day's date does not change with its content,
  so the range read before the swap is the right one after it. The reading runs after `afterSchedMutate`, so any filing
  the after-command pass changes is already in. A several-day input reaching past the week's end opens the list for a
  date in the next week — shared with the load, as built under D862; not new.
- **Order and state.** Refused switches (already live, frozen week, unknown plan, no edit rights) either return before
  the reading or after a reading that writes nothing; no list is opened. The list is opened after the first redraw and
  drawn by the `if (need) notify()` after the toast — the plans menu's own caller draws nothing more, so this redraw is
  what puts it on screen; the preview banner's extra `notify()` only draws it twice, harmlessly. An Undo of the switch
  leaves an open list up, still listing the input — true, since it still has no answer; it asks nothing (D793 reading 3).
- **The words.** "Saturday is now "Plan B"." · the row-left-out sentences · "1 difference from the Original is pending." /
  "2 differences from AL1 are pending." / "Nothing is pending: it matches AL1." · "1 input needs an OIL answer." /
  "2 inputs need an OIL answer." — singular and plural right; every fact of the old note is still said (the plan, the
  day, each row left out and why, the count against the issued version or the match).
- **The re-pointed tests** change only the expected words; none is loosened beyond the new sentence.

## The doors (question 1)

| Door | Says the OIL tail and opens the list | List drawn and reachable |
|---|---|---|
| Plans menu on the week's day head (tap a plan) | YES — `planMenu` → `switchDraft` | YES — the menu closes first; `switchDraft` redraws |
| Plans menu on the Scheduler Board's sign strip | YES — the same `planMenu` | YES — the list's window sits above the board |
| The preview's "Switch to this plan" (week and board) | YES — `data-draftgo` → `switchDraft` | YES |
| The plan editor's "Select" (✎ Manage plans) | YES — `switchDraft` | YES — the editor closes so the list is in front (but see F1: it also closes when the list was already up) |
| A day template applied | NO, because a template is refused on a published day (D96), and only a published day can be brought to put an input back | — |
| Deleting a plan | NO, because the live plan cannot be deleted (`draftDelete` refuses it), so the day's content never changes | — |
| "+ Alt Plan" | NO, because it copies the live day as it stands — nothing comes back | — |
| Undo / Redo of a switch | NO, because an Undo never asks a question (D793 reading 3); the input's "OIL?" sign and the bell still carry it | — |
| Loading a week | NO, because nothing on a week's load puts back an input a plan had taken off the programme; no ruling asks it to speak | — |
| "Load onto working copy" | YES — unchanged, through the same shared reading | YES |

## What I did not read
The walk's pictures and logs, the evidence sheet, `e2e/`, the walk scripts, `ui/oilday.ts` (the list's Save), the
after-command pass (`engine/overlay.ts`, `state/store.ts reconcileLandedAcc`) beyond what `reconcileDayFiling` says of
it, and `topbits.tsx`'s bell. No test was run.
