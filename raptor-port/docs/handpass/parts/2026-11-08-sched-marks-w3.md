# W3 report — the drawn marks and the plain-user round on the schedule (8 Nov 26, origin 4394)

Frozen build `dist-sm1`. Scripts: `scripts/handpass/sm-w3-s26.mjs`, `-s27.mjs`, `-s28.mjs`, `-s28b.mjs`, `-s29.mjs`, `-s32.mjs` (exploration: `-x1`, `-x2`, `-x3`). Pictures: `docs/img/handpass/2026-11-08-sched-marks/w3/` (names below are in that folder). Every picture cited was opened. Results as data: `s26-*-results.json`, `s27-*-results.json`, `s29-*-results.json`, `s32-pc-results.json` in the same folder.

Totals: PASS 11 · FAIL 0 · RECORDED 9 · NOT DRIVEN 6.

## 1. Steps

| Step | Size | EXPECTED | What the screen showed | Result | Picture |
|---|---|---|---|---|---|
| S26.1 hide each line with the typed ✕, Edit Schedule day list (Tue, 4 issues) | PC, phone | line stays in place, struck and greyed, drawn arrow, count falls | after each hide the line stays at its place (index 0–3), struck, grey; ✕ stays a typed ✕ (16×16); arrow is a drawn svg 13×13 in a 19×18 button, colour = button colour (182,192,203); bar 4 → 3 → 2 → 1 issues | PASS | s26-pc-e-hide1.png, s26-phone-e-hide1.png |
| S26.1 same on the board's list | PC, phone | same | same on the board (`.wln-mute`): drawn arrow 13×13, line struck in place; heading 4 → 3 → 2 → 1 issues | PASS | s26-pc-b-hide2.png, s26-phone-b-hide1.png |
| S26.2 all hidden, summaries | PC, phone | RECORD | Edit Schedule day bar: `✓ No issues`. Board heading: `No conflicts flagged for Tuesday ✓` (green). All four lines stay, struck, each with the arrow | RECORDED | s26-pc-e-allhidden.png, s26-pc-b-allhidden.png |
| S26.3 press the arrow, both lists | PC, phone | line flags again, count back | each arrow press restored its line (✕ back, not struck); bars 1 → 2 → 3 → 4 issues, on both lists, in both sizes; hide state on one list showed on the other (board opened after Edit Schedule hid line 3: arrow shown) | PASS | s26-pc-e-restored.png, s26-pc-b-restored.png |
| S26.4 hover words | PC | exact: "Flag this again" / "Hide this warning — it flags no puck and is not counted; it comes back if the situation changes" | button `title` on a hidden line = `Flag this again`; on a live line = the Hide words, exactly, on both lists (read from the element; the browser's own tooltip bubble does not show in the scripted browser, so the picture shows the hovered state only) | PASS | s26-pc-e-hover-reset.png, s26-pc-b-hover-reset.png |
| S26 puck flags | PC | flags come back | 7 pucks on Tue wear the warn flag after restoring all four lines (the count before hiding was not taken; the bar shows 4 issues again) | RECORDED | — |
| S26 Undo/redo of a hide | PC | RECORD | not driven: a hide is not an Undo step here (the top-bar Undo said "Undid: publishing a day"/the last edit, never a hide) — not forced | NOT DRIVEN | — |
| S27.1 hide a warning in the working copy, then publish Tue | PC, phone | RECORD | Edit Schedule list before and after publishing the original: same (3 issues, line 3 struck with arrow); day chip right after publishing the original reads `6 changes` | RECORDED | s27-pc-e-after-orig.png |
| S27.2 a look at Original, before an amendment | PC, phone | historical look offers no hide/restore | the look shows the frozen list: 3 issues, "Long work day" struck (hidden when it went out) with NO ✕ and NO arrow (0 buttons, 0 arrows counted) | PASS | s27-pc-e-look-orig.png |
| S27.3 hide a second line after publishing | PC, phone | RECORD pending | day chip `1 pending`; changes window: "Published · 1 change waiting to go out as AL1 … Warning · Saint — No time for the VL SAT flight brief … " | RECORDED | s27-pc-chgwin.png, s27-pc-e-hide-after-orig.png |
| S27.3 publish the amendment, reload, revisit | PC, phone | hides go out, stay hidden | after Publish AL1 and after a reload (new browser, same storage): same 2 issues, lines 2 and 3 hidden with arrows; day chip then reads `12 changes` (no "pending") | PASS | s27-pc-e-after-al1.png |
| S27.3 member's list after | PC, phone | count without hidden, struck line, no buttons | member View-only: bar `⚠ 2 issues · 2 warning`, lines 2 and 3 hidden (struck), 0 buttons, 0 arrows | PASS | s27-pc-member-list.png, s27-phone-member-list.png |
| S27.4 change the situation behind a hidden warning | — | re-flags | not driven: no on-screen route to alter the cause of a warning cheaply (it needs a schedule edit that changes crew rest or a brief; not attempted by calling app code) | NOT DRIVEN | — |
| S28.1 eye in the week's selector and banner, Original and AL1 | PC, phone | drawn line eye 11 px in selector, 12 px in banner, text colour | Original and AL1, week: selector eye 11×11, banner eye 12×12; colours = their own text (selector 241,244,247; banner 182,192,203); no typed 👁 anywhere (0 found) | PASS | s28-pc-w-look0.png, s28-phone-w-look0.png |
| S28.2 same on the board | PC, phone | same | board selector eye 11×11 (amber 242,214,153, same as its text), banner 12×12; 0 typed 👁 | PASS | s28-pc-b-look0.png, s28-phone-b-look0.png |
| S28 the word "Original" on one line on the phone | phone | one line | selector box 85×20 on the phone, one line; the week banner reads on one line; on the BOARD banner on the phone "Viewing the issued" and "Original" break onto two lines (see 4) | PASS (selector) | s28-phone-w-look0.png |
| S28 saved-plan look | PC, phone | drawn eye on a saved plan's look | no look exists for a saved plan: on a published day Plan A offers only "tap to make it the live day"; "Manage plans" window has no eye. Only Original and the AL are looks | NOT DRIVEN | s28-pc-w-menu2.png, x2-pc-manage.png |
| S28.3 wave templates window's eye (row 24) | PC | unchanged | no eye in the Day templates window (empty, and with one saved template "Template 1"); not found elsewhere in 3 tries | NOT DRIVEN | x3-pc-save.png |
| S28.4 Reset arrow beside History's clock | PC, phone | History's clock same on the bar, both pressed | History clock is the bar's drawn glyph (16 px, button 34×30) on both bars; the Reset arrow is in the warning list, not on the bar, so they do not stand side by side. Both were pressed (History opens the changes window; arrow flags again) and neither changed | RECORDED | s28-pc-b-rest.png |
| S29.1 file a leave on a published day, see its mark | PC, phone | mark | LL for Bolt on Wed: name underlined dotted, cyan (59,198,232); day chip `1 pending`; board name box outlined dotted 1px, same colour | PASS | s29-pc-1-week-marked.png, s29-phone-1-week-marked.png, s29-phone-6-board-marked.png |
| S29.2 open it from week and from board | PC, phone | right window | tapping the name opens "Bolt · 15 Jul" window from both (also with the keyboard, Tab then Enter) | PASS | s29-pc-7-board-window.png, s32-pc-a-enter-window.png |
| S29.3 close by each way | PC, phone | RECORD; FAIL only if the window underneath closes or a saved change is lost | Cancel: closes. ✕: closes. Escape: closes. Tap outside the window: closes. In every case the page behind stayed Edit Schedule (or the board stayed open on the board), the input count did not change (53) | RECORDED | s29-pc-3-after-Closebutton.png, s29-phone-3-after-Closebutton.png |
| S29.4 dirty close | PC, phone | RECORD | typed "Dentist 14:00" in Remarks then Escape: the window closed with no question and the typed words were gone (no "Close it and lose them?" shown) | RECORDED | s29-pc-4-dirty-close.png |
| S29.5 edit and save, mark and pending | PC, phone | mark stays | saved the remark: window closes, "Input updated", mark stays, chip `1 pending` | PASS | s29-phone-6-board-marked.png |
| S29.6 Undo, Undo, Redo | PC, phone | follow the actual save | Undo 1 took the remark back (mark stays); Undo 2 "Undid: Bolt’s LL" (input removed, mark gone); Redo "Redid: Bolt’s LL" (mark back, 1 pending). No stale mark | PASS | s29-pc-9-redo.png |
| S29 View-only Sched while pending | PC | follows the Ground name | View-only shows the issued face, which has no Bolt row (0 rows); nothing to mark | RECORDED | s29-pc-11-viewonly.png |
| S29 publish the amendment | PC, phone | mark gone | "Publish AL1": underline gone (name colour plain), chip then reads `15 changes` | PASS | s29-pc-12-after-al1.png |
| S29 bell | PC, phone | RECORD | no count badge found on the bell after filing (my read looked for a badge element; the bell's own page was not opened) | NOT DRIVEN | — |
| S29 phone keyboard over a text box (lesson 6) | phone | — | the scripted WebKit has no on-screen keyboard, so what it covers cannot be shown | NOT DRIVEN | — |
| S32.2 Tab to the marked name; Enter | PC | focus visible beside the dotted line | first Tab stop on the name: cyan 2px focus outline round the name AND the dotted underline still drawn (both visible, no double line); Enter opens the window; Escape closes it and focus returns to the name | PASS | s32-pc-a-focus-name.png |
| S32.2 Tab to the warning ✕; Enter; Space on the arrow | PC | focus visible; works | the ✕ focus ring is the browser's default dark ring (16,16,16), thin and hard to see on the dark panel; Enter hides (arrow appears); AFTER Enter focus goes to the page body (the keyboard user must Tab again from the top); Space on the arrow flags it again (4 issues back) | RECORDED | s32-pc-b-focus-hide.png, s32-pc-b-after-enter.png |
| S32.5 eye at 2560 wide | PC | 11 / 12 px | selector eye 11×11, banner eye 12×12; same on the board | PASS | s32-pc-c-2560-eye.png, s32-pc-c-2560-board.png |
| S32 pinch part-way down the board on the phone (lesson 13) | phone | — | a pinch cannot be made in the scripted WebKit (walk-scripts §4) | NOT DRIVEN | — |

## 2. Roll-call rows

| Row | Shows | Gesture works | Else drawn on those pixels |
|---|---|---|---|
| 22 eye in the plans selector, week and board, PC/phone | drawn line eye 11×11 on Original and AL1; no typed eye | selector opens, look opens, Back to live copy returns | the "▾"; on the board the selector is amber with the eye the same amber (s28-phone-b-look0.png) |
| 23 eye in the look banner | drawn eye 12×12, quiet grey, before "Viewing the issued" | Back to live copy and Load onto working copy both present | on the board's phone banner the words break across two lines (item 4) |
| 24 wave templates window's eye | NOT FOUND — no eye in the Day templates window, even with a saved template | Save as template, Done, ✕ present | — |
| 25 Reset arrow, Edit Schedule | drawn 13×13 arrow in a 19×18 button, struck line beside it, PC and phone | mouse/tap and Space flag it again | dashed outline round the hidden line |
| 26 Reset arrow, board | same, PC and phone | same | strike-through; phone list sits under the fold toggle |
| 27 a member and a look | member: no ✕ and no arrow (0 buttons) with lines struck; a look at Original: no ✕, no arrow | — | — |

## 3. Page and console errors

None in any run (S26 PC and phone, S27 PC and phone, S28 and S28b, S29 PC and phone, S32).

## 4. Odd things not asked about

- The day chip after a publish reads `6 changes` (after the original) and `12` / `15 changes` (after an amendment), not zero or "no pending". It is probably the day's change count, but a person may read it as unsent changes. Pictures: s27-pc-e-after-al1.png, s29-pc-12-after-al1.png (the chip is the top-right of each day header).
- Board banner on the phone (look at Original): "Viewing the issued" and "Original" sit on two lines and the whole banner is pushed right under the Aircrew tab. Picture s28-phone-b-look0.png.
- A day's bar reads "2 issues · 2 warning" (singular "warning" with a plural count) in the Edit Schedule list while the board says "2 warnings": s26-pc-e-hide1.png.
- Dirty close of the input window closes silently on Escape with a typed remark; no question seen (see S29.4). Possibly by design on an edit; the host should check against D1626.
- Phone S29 picture shows a large empty black area under the last section: s29-phone-3-after-Closebutton.png (probably the end of the page).
