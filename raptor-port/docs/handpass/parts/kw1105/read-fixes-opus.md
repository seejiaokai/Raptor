# The keys and windows batch — a fresh, blind Opus read of the fix commit (5 Nov 26)

Read: `git show 8569e8a7b -- raptor-port/src raptor-port/e2e` against the earlier read's F1–F5 (`read-opus.md`), and the code
around each fix: `sheetfocus.ts` whole, `board.ts` (`popMenu` and its five callers' picks, `rolePickMenu`, `switchDraft`,
`wireDayDots`, `boardTab`, `boardWeekStep`), `SchedBoard.tsx` (the strip, the paint effect's `chipKeys`, the way back to the
date), `barfree.ts` whole, `boardescape.ts keepTabOnBoard`, `interactions.ts openStoresMenu`, `DocViewer.tsx` whole,
`MedicalView.tsx open`, `InputWindow.tsx` (which focus rule it uses), `FloatWindow.tsx` (its opener), `oilputback.ts`,
`outside.ts`, `EditWeek.tsx` (both weeks mounted at once), every `locate(` caller and every producer of `.day[data-day]`.
Ran the three touched unit files at HEAD: `oilkeysback` 3/3, `barfree` 11/11, `boardmenukeys` 26/26.
Brief to myself: a problem that lives only in stored data while the code is right going forward is not a finding (D56).

## Findings

### G1 — LOW — F5: after an Undo takes away an EARLIER entry of an episode, the viewer jumps to a different entry

**What he does.** Inputs → Medical: a man has three overlapping medical entries A, B, C (in the episode's order), each with
one document. He taps B's card — the viewer opens on "2 of 3", B's paper. The entry he added last is A (an earlier date, filed
late). He presses Undo on the bar (D1645 allows it with the viewer up).
**What he sees.** The pager reads "2 of 2" and shows **C's** paper, title and "Edit input" — he never stepped the pager. Before
this fix A's stale page stayed and he stayed on B; the fix drops A's page (right) but leaves the page NUMBER where it was, so
every page after the removed one slides under him. A Redo that brings A back slides it the other way. The title does change,
so it is visible, but "Edit input" pressed without re-reading the title opens C, not the entry he was reading.
**Cause.** `DocViewer.tsx`: the page is held as an index (`i`), re-seated only when `DOCVIEW` itself changes
(`if (v !== seenV) …setI(seatAt(v))`); `idx = Math.min(i, els.length - 1)`. The new `.filter((e) => !!e.row)` (line 45)
shortens `els` in front of `i` without moving `i`.
**Fix.** Keep the page by WHAT it shows, not by its number: hold the shown page's key (`row.iid` + `docId`) beside `i`; on a
render where `els` no longer has that key at `i`, re-seat `i` to its new index (`els.findIndex(e => key(e) === shownKey)`),
and only when it is gone altogether fall back to the clamp. Test in `barfree.test.tsx` beside the new F5 case: three entries,
open on the second, splice the first out, expect the page's title still the second's and the count "1 of 2".

### G2 — LOW — F4: an input moved to other days in its window — the keys now go to nothing, where before they found it

**What he does.** Edit Schedule, desktop. Monday shows a one-day input's name button. He Tabs to it, presses Enter (the input
window opens — on the schedule it is the blocking dialog, `useSheetFocus`), changes its date to Wednesday, Save.
**What happens.** The window closes and the keys go nowhere (the page's body): the next Tab starts from wherever the browser
puts its starting point, not from the input. Before this fix `locate` found `button[data-inpedit="<id>"]` on Wednesday and put
the keys there. Nothing is saved wrongly; it is the "keys given back to nothing" the batch's [WINDOWS-KEEP-KEYS] leftover set
out to end, come back for this one path (the same for any control whose only twin after the redraw is on another day).
**Cause.** `sheetfocus.ts locate`, lines 113–115: with `day` known, the search is ONLY inside that day's box; Monday no longer
draws the button, so `all` is empty and the finder returns null (`useSheetFocus` then has no `opener` to fall back to).
**Fix.** Keep the day as the FIRST place looked, not the only one:
`let all = dayBox ? [...dayBox.querySelectorAll(sel)] : []; if (!all.length && day == null || !all.length && weekBox) all = [...(weekBox || within).querySelectorAll(sel)]`
— i.e. the day first; failing that, the same week (never the other page's week); failing that, null. F4's own case (a twin on
the day pressed) is unchanged, since the day is searched first. Test in `oilkeysback.test.tsx`: the button drawn on day 0,
focused, the sheet opened, the button redrawn on day 3 only, the sheet closed — keys on day 3's button.

No other finding. What I checked and found right, per fix:

- **F1** (`popMenu`, deferred keys back). Every pick that opens a window calls `noteOpener(anchor)` before it (blockMenu's
  pencil, dayTplMenu's pencil and "Save this day", the plans pencil and Manage, waveMenu's gear), so a sheet's way back no longer
  depends on the keys standing on the anchor when it opens; the deferred `keysBack` stands aside once a sheet holds them. The one
  pick that can raise a window without a note — a plan switch whose put-back inputs open the OIL list (`switchDraft` →
  `oilPutBackWatch` → `setOilList`) — opens a movable window (`FloatWin`), whose own way back reads the raw focused node, not
  `locate`; the switch redraws the day, so its opener was already gone before this change too. No loss. The stores menu does
  not use `popMenu`'s close; unaffected.
- **F2** (chip pressed by its click). `t.click()` runs, in order: `useBarFree`'s document capture listener (the chip is inside
  `#schedBoard .sb-top`, so Traffic, day details, Jump to a date and the viewer close FIRST), React's `onClick` on the strip
  (`boardTab` / `boardWeekStep`), then the document bubble listeners (`popMenu`'s `off`, the stores menu's `_offClick`) — so a
  board menu goes in the same dispatch, a moment after the day steps; nothing on screen sees the gap. No listener on the path
  tells a key's click from the mouse's in a way that matters: `wireDayDots` eats a click only within 350 ms after a real scrub;
  `outside.ts` treats a click with no press as honest (and the target is the chip, not a surround); nothing in the app reads
  `isTrusted`, and the one `e.detail` check is the Leave War grid's. The keys end on the chip: the strip is redrawn in the
  paint effect and `chipKeys` refocuses the new chip; the closing window's `keysBack(back, el)` sees the chip (old or new) as
  "somewhere" and leaves it — the browser test confirms (`focusAt(page)` on `data-sbtab="4"`).
- **F3** (Tab past a menu's end). `keepTabOnBoard` runs first (document capture) and stands aside for `.wavemenu`; the sheets'
  `keepKeys` only acts with a sheet up. Disabled items are skipped (`.st-up` on the first store row, `.st-dn` on the last, a
  published day's template picks), so the stores pencil editor's last stop is "Add" and its first the pencil — a rename in a
  name box is committed by its own `change` on the Tab that leaves it, before the close. The + Wave day buttons only toggle a
  class; Tab walks them. `menuEscape`'s list entry is pruned at the next Escape (box gone); `popMenu`'s one-shot `off` stays
  hooked until the next click, as after an Escape — harmless (it removes a detached box).
- **F4** (twin on its day), apart from G2. Both weeks are mounted at once (`EditWeek` warms while View is open), and every
  `.day[data-day]` is a direct child of `#eWeek` / `#vWeek`, so `weekId` is always set and the search can no longer cross from
  one page's week to the other's — an improvement. Board controls have no `.day` ancestor (unchanged); the next-week peek's days
  carry `data-peek-day`, not `data-day` (unchanged). The board's way back to the date that opened it: the date is in its own
  day, found again there after a day or week step (the same day index of the new week, as before). Menus, `noteOpener`,
  `useEscWindow`, `useBarFree`: day-scoped where the opener stood in a day, else as before. Where the week is gone (a page change),
  null — where the old search could focus a hidden copy on the other page's week; better.
- **F5**, apart from G1. A read-only viewer is unchanged (`live` returns its row; `gone` false). A single-row viewer whose input
  is gone closes, as before. `up` is per row, so the Upchit button follows the page. `seatOf`/`seatAt` at OPEN are unchanged
  (every episode row is an input at open — `medEpisode` reads `INPUTS`).

## Questions (no concrete failure found)

1. **F1, a mouse pick in Chromium now leaves a caret in the duty role box** (the comment says so on purpose). With the caret
   there the board withholds that panel's redraw until it leaves (`SchedBoard.tsx put`); I found no path where that hides a
   change he makes by the mouse — any press elsewhere moves the caret first — but it is the batch's choice, not this fix's.
2. **F4's fallback when a `.day`'s parent has no id** searches the first `.day[data-day]` in the whole document — with both
   weeks mounted that could be the other page's day. Today no `.day[data-day]` stands in a parent without an id, so it cannot
   happen; a future day drawn elsewhere (a version preview pane) would meet it.

## Not read

The walk scripts and their pictures; the test bodies beyond this commit's diff; `src/leavewar/` beyond its two viewer openers;
the CSS. I ran no browser — G1 and G2 are read from the code, not reproduced.
