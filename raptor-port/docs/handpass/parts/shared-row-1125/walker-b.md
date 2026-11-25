# Walker B — Share B, Edit Schedule's week, the published day and the readers (the shared-row walk, 25 Nov 26)

*Saved by the host (chat 178) from the walker's hand-back, its table and FAILs word for word — the helper's file tool
refused the report file. An Opus walker on the frozen build `.tmp/build-6c7f3aac7`, bundle `index-BiU7Aj55.js`, checked
at the start of every world. Counts: 35 PASS, 6 FAIL (three findings, each at desktop and phone), 30 RECORDED, 0 NOT
WALKED. No page or console error in any run. Raw data per run: `.tmp/shr-b/<run>.json`, `results.jsonl`, `*.log`.
Pictures: `docs/img/handpass/2026-11-25-shared-row/b/<run>/`. Scripts: `scripts/handpass/shr-b-lib.mjs`, `shr-b-b1.mjs`
to `shr-b-b12.mjs`, `shr-b-b3ctl.mjs`, `shr-b-probe.mjs`, `shr-b-probe2.mjs`.*

## Results

| id | size / engine | verdict | what the screen said and what was saved | pictures |
|---|---|---|---|---|
| B1 | desk chromium | PASS | After 0900 Tab: Hex 08:00–10:00 on the shared input, Ranger 09:00–10:00 on a new one; caret in his end box. After 1100: Ranger 09:00–11:00. After "own hours": Ranger 09:00–11:00 "own hours", caret in Hex's start. Same after the caret left and after reload. Screen matched store at every step | `b1-desk-chromium-022442/` |
| B1 | desk webkit | PASS | Same values at every step | `b1-desk-webkit-022510/` |
| B1 | phone chromium (taps between boxes) | PASS | Same values; a picture within 100ms of each lift | `b1-phone-chromium-022535/` |
| B1 | phone webkit (taps) | PASS | Same values | `b1-phone-webkit-022559/` |
| B1 row order | all four | RECORDED | While the caret is in the section Ranger is above Hex; once it leaves, and after reload, Hex is above Ranger | `…-4-left.png`, `…-5-reload.png` |
| B2-S1 (O-S1) | desk / phone chromium | PASS ×2 | Shift+Tab back into his end box shows 11:00; Tab and click out save nothing; the day count ("4 changes") and the Undo title unchanged | `b2-desk-chromium-022714/` b2s1-*, `b2-phone-chromium-022824/` |
| B2-S2 (O-S2) | desk / phone chromium | PASS ×2 | 0900 Tab, click back into his start, type 0930, Escape: the row repaints showing 09:00, nothing saved | `b2-desk-chromium-022811/`, `b2-phone-chromium-022824/` b2s2-* |
| B2-S3 (O-S3) | desk / phone chromium | PASS ×2 | Hex's end 1200, then Shift+Tab ×3 into Ranger's end: 10:00 throughout. Saved: Hex 08:00–12:00 on the shared input, Ranger 09:00–10:00 | `b2-desk-chromium-022714/` b2s3-*, `b2-phone-…` |
| B3 clear end | desk / phone chromium | **FAIL ×2** | F1 below | `b3-desk-chromium-023405/b3-clr-end-1-cleared.png`, `b3-phone-chromium-023905/` |
| B3 clear start | desk / phone chromium | PASS ×2 | Both of his boxes empty, saved all day; passing through untouched saves nothing; Hex untouched | same folders, b3-clr-start-* |
| B3 new start after all day | desk / phone | RECORDED ×4 | Start 0930 gives Ranger 09:30–23:59 | `…-3-0930-left.png` |
| B3 end before start, first change | desk / phone chromium | **FAIL ×2** | F2 below | `b3-desk-chromium-023808/` b3-ref-first-0700-*, `b3-phone-…` |
| B3 `2570`, first change | desk / phone chromium | PASS ×2 | Refused; one input, both men, 08:00–10:00; the box heals to 10:00. Tap away, tap again, retype 10:00, Tab: nothing saved, count unchanged | `…/b3-ref-first-2570-*` |
| B3 refusals after a good change | desk / phone chromium | **FAIL ×2** | 0830 is saved (F2). The later `2570` is right: nothing saved, the box heals to HIS current 08:30, retyping saves nothing. Then 1100 saves 09:00–11:00 on his own. Hex 08:00–10:00 throughout | `b3-desk-chromium-023808/` b3-ref-later-*, `b3-phone-…` |
| B3 refusal words | desk / phone | RECORDED ×6 | `2570`: "2570 is not a time. Try 0900 or 09:00." — one note, no second note, first or later. 0700 and 0830: no note at all. Retyping the shown figure: no note | as above |
| B3 0800 over 08:00 (F-S5) | desk / phone chromium | PASS ×2 | One input, both men, unchanged; no note | `…/b3-same0800-*` |
| B3 Undo button | desk / phone | RECORDED ×2 | "Undo — LL for 2 people", enabled, before and after; day count "1 change" before and after | same |
| B3 one-man control | desk | RECORDED ×2 | Ranger alone: end 0700 saved as 08:00–07:00, no note. Start 0900 then end cleared: saved all day, the start box still shows 09:00 | `b3ctl-desk-chromium-023734/` |
| B4 (F-S9) | desk chromium | PASS | Three men, all day Mon–Wed, typed in Tuesday's block: Ranger's own Mon–Wed 09:00–11:00 "A2"; Hex's own Mon–Wed all day "B"; Outlaw alone on the ORIGINAL input, all day "C". Three inputs, no fourth. Monday and Wednesday match Tuesday at once | `b4-desk-chromium-024800/` |
| B4 arrival values | desk | RECORDED | Arriving in Ranger's end after start 0900 shows 23:59; Hex's end after 1300 shows 23:59; Hex's start reached by Tab shows 13:00. Leave War cells for all three Mon–Wed read "LL", no part-day mark in the text | `…-4-leavewar.png` |
| B5 (a) the LL label on his held row: mouse click, press with no blur, not held | desk chromium | PASS ×3 | The window opens "Ranger · 15 Jul", Ranger alone, 09:00–10:00. Delete asks no confirmation; "Input deleted"; Hex keeps 08:00–10:00. The mouse click took the caret out of the box | `b5-desk-chromium-023233/` |
| B5 (b) Reject on a shared overseas duty: click, no blur, not held | desk chromium | PASS ×3 | Ranger's own duty taken out of Unavailable; Hex's stays there at 08:00–10:00. With no blur, the caret stayed in his end box | `b5-desk-chromium-023024/` b5-b-* |
| B5 notes | desk | RECORDED ×3 | "Ranger's OD taken out of Unavailable" (all three) | `…-1-after-reject.png` |
| B6 fixture published and signed | desk chromium | PASS | Signed four times; "Wednesday published and approved"; the day reads "SIGNED ORIG CUR CK Ace SKED CK Anvil PLANNED Anvil APPROVED Anvil" and offers Unpublish | `b6-desk-chromium-024526/…-0-published.png` |
| B6 published day | desk chromium | PASS | On the Board, Ranger's row 0900 / 1100 / "own hours": his own input 09:00–11:00 "own hours"; Hex 08:00–10:00. Ranger signed in as a member sees the issued Original, both men 08:00–10:00; after the amendment Hex 08:00–10:00 and Ranger 09:00–11:00 "own hours" | `…-2-board-*`, `…-8c-member-us.png`, `…-10-member-us.png` |
| B6 sign-offs fall | desk | PASS | "Not yet signed" from the first change; the amendment's publish locked: "Sign off CUR CK, SKED CK, PLANNED BY, APPROVED BY before publishing AL1" | `…-2-board-str.png` |
| B6 counts, marks, sign-offs | desk | RECORDED | "1 pending" after each of the three changes ("6 changes" before them). The waiting mark (dotted underline on LL) on BOTH Ranger's and Hex's rows on the week, on neither row on the Board. Undo ×3 ("Undo — Ranger's LL" ×2, then "Undo — 2 inputs") brings back the one shared leave: "Not yet signed" and the AL1 button go, the signed line ORIG stays — the sign-offs come back. Redo ×3 restores the change, "1 pending" again. The amendment needed signing again; "Published AL1 · 1 item on Wed only · approved by Anvil" | `…-4-week-after`, `…-7-after-undo`, `…-8-after-redo`, `…-9-after-amendment` |
| B6 changes window | desk | RECORDED | "Changes · Wednesday 15/7 Published · 1 change waiting to go out as AL1"; tabs "New to you 0", "All changes 10", "To go out · AL1 1". The one line: "Ranger · LL Saber 25/11 10:45 his own now — 09:00–11:00"; tapping it lights Ranger's own row. All changes: "Input · Ranger · LL · 3" (remarks own hours; times 09:00–10:00 → 09:00–11:00; LL added); "Input · Hex · LL · 2" (Ranger · LL taken out; Hex, Ranger · LL added); "The day · 5" | `…-5-chg-*` |
| B6 member's view | desk | RECORDED | Before the amendment "Original — as issued"; after, "AL1 — as issued" | `…-8c`, `…-10` |
| B7 who counts as away | desk chromium | PASS (script printed FAIL; corrected below) | A ground item 10:30–10:45, its empty place picked. Before: Ranger free, Hex "Hex — already on VL ACM 09:35–12:30" (a demo-world flight). After Ranger extended to 11:00: "Ranger — local leave (LL)"; Hex unchanged | `b7-desk-chromium-025225/` |
| B7 words | desk | RECORDED | ALL AVAIL window "BRIEF Jul 15 · 10:30–10:45": "Who's available 38" with Ranger, then "37" without him; Hex in neither (already busy). Warnings: only Hex's demo-world lines, same before and after. Leave War 15 Jul (after only): cells LL / LL, avail-p 24.5, avail-w 16.5, count-sets 16.5, count-ip 14.5 | `…-1-before-*`, `…-2-after-*`, `…-3-leavewar` |
| B8 OIL | desk chromium | PASS | A shared weekend overseas duty, Sat 18 Jul 08:00–17:00, OIL answered Yes when filed. Ranger's start 0900 and end 1600: no OIL question opened; his own duty carries the same OIL answer; Hex keeps 08:00–17:00 | `b8-desk-chromium-025336/` |
| B8 figures | desk | RECORDED | Leave War row heads the same before and after: Ranger "12.5 7.5", Hex "−2" | same |
| B9 | desk chromium | PASS (script printed FAIL; corrected below) | Hex is told nothing of Ranger's later changes | `b9-desk-chromium-025029/` |
| B9 lines and taps | desk | RECORDED | "Changes · Wednesday 15/7 Not yet published", "All changes 5". Ranger's group: "LL 15 Jul · remarks own hours", "LL 15 Jul · times 09:00–10:00 → 09:00–11:00", "LL added · 15 Jul" — each tap lights Ranger's own row. Hex's group: "Ranger · LL 15 Jul · taken out", "Hex, Ranger · LL added · 15 Jul" — each tap lights Hex's row. Ranger's bell: "Remark changed · Saber", "Now 09:00–11:00 · Saber", "Now 09:00–10:00 · Saber", "You were added · Saber". Hex's bell: "Ranger taken off · Saber", "You were added · Saber". Ranger's view-only week: Hex 08:00–10:00, Ranger 09:00–11:00 "own hours" | same |
| B10 (a) the Personal Inputs line of a shared Meeting | desk chromium | PASS | The Meeting goes straight onto the ground programme; its Personal Inputs line (address `<iid>~rocky`): start 0900 re-times the ONE input to 09:00–10:00 for both men | `b10-desk-chromium-024907/` b10a-* |
| B10 (b) its Ground Programme row | desk | PASS | Ground row start 0900: the one input 09:00–10:00 for both | `b10-desk-chromium-024947/` |
| B10 (c) a one-man Unavailable row | desk | PASS | 0900, 1100 and "own" each saved on the same input | `b10-desk-chromium-024907/` b10c-* |
| B11 (a) shared AM leave | desk chromium | PASS (script printed FAIL; corrected below) | Ranger alone loses the half and gets it back; Hex keeps it throughout | `b11-desk-chromium-025434/` b11a-* |
| B11 (a) half label | desk | RECORDED | The AM half is drawn 00:00–12:00, no "AM" word on the week's row. End 1100 gives his own 00:00–11:00, no half; end back to 1200 makes it a half (AM) again | same |
| B11 (b) Sun–Mon across the week's edge | desk | PASS | Start 0900 on Sunday gives his own input Jul 19–20 at 09:00–23:59; Monday, in the next week, shows the same; the remark "next" typed there reaches his own; Hex all day, no remark | b11b-* |
| B11 (b) next week shows | desk | RECORDED | Monday: Hex all day "till 20 Jul"; Ranger 09:00–23:59 "next till 20 Jul". The next week was loaded with the app's own `loadWeek` (the script found no next-week arrow) | b11b-2/3 |
| B12 every way of closing | desk chromium | PASS | The LL label opens "Ranger · 15 Jul", 09:00 / 11:00 / "own hours". Cancel, ✕, Escape and a press outside each close only that window; nothing saved, the page unchanged | `b12-desk-chromium-025535/` |
| B12 what each shows | desk | RECORDED | Undo "Undo — Ranger's LL", note "Undid: Ranger's LL": the remark removed, the times stay 09:00–11:00. Inputs day: "08:00–10:00 Hex LL", "09:00–11:00 Ranger LL". Board: Hex 08:00–10:00, Ranger 09:00–11:00. The admin's bell: an empty list | same |

## The FAILs, written out

**F1 — after his end is cleared, his start box still shows 09:00 while the leave is saved all day (B3, Astra S04).**
Presses: file the fixture; on Edit Schedule, Wednesday's Unavailable list, click Ranger's start, select all, type
`0900`, Tab; in his end box select all, Backspace, Tab. Seen: the store holds Ranger's own leave as all day, Hex
08:00–10:00; with the caret in his remark box Ranger's row shows **09:00 | (empty)**; Shift+Tab back into his start
makes it show empty. Expected: both boxes empty (clearing the START empties both at once — PASS). Control: a one-man
leave behaves the same (`b3ctl-desk-chromium-023734/`) — how the week already behaves, not the shared row's.

**F2 — on the week an end before the start is not refused: it is saved (B3, F-S10 (a) and (c), A5).** First case: the
fixture; Ranger's end `0700`, Tab, as the first change — no note; saved: Hex 08:00–10:00 on the shared input and a new
input for Ranger 08:00–07:00 (he is cut out). The box shows 07:00; tap away, tap again, retype `07:00`, Tab: nothing
more saved. Second case: start `0900` Tab, end `0830` Tab — saved 09:00–08:30 on his own, no note. Control: a one-man
leave's end `0700` is also saved (08:00–07:00), no note: the week never refuses end-before-start for anyone (it may be
read as an overnight span). Hex never touched; every `2570` refusal right.

## Script verdicts corrected (the judge was wrong; the values are the app's)

B9: FAIL printed because Hex's bell has "Ranger taken off · Saber" — the first split's line, to be recorded only; Hex
is told nothing of the end or the remark: PASS. B7: FAIL printed because Hex is struck out for a demo-world flight
both before and after; Ranger went from free to "local leave (LL)": PASS (the check on Hex is weak for that reason).
B11 (a): FAIL printed because it expected the AM half to start at 08:00; the app's AM half is 00:00–12:00: PASS. First
runs not to cite: `b2-desk-chromium-022714` for S2 and the a-* files in `b5-desk-chromium-023024` (script errors,
re-run); the probe-* runs, `b1-desk-chromium-022419`, `b6-desk-chromium-024330`, `b6-desk-chromium-024357`.

## Not walked, and why

B5 on a phone (outside the share: desktop only) — so whether a phone tap on the week's buttons leaves the caret in the
box is not answered here; on the desktop a mouse click on the label moved the caret out of the box, Reject pressed
with no blur left it in. B4–B12 at phone size (the share asks the desktop). B7's Leave War figures read only after.

## Final runs to cite, with picture counts

B1 `b1-desk-chromium-022442` (6), `b1-desk-webkit-022510` (6), `b1-phone-chromium-022535` (8), `b1-phone-webkit-022559`
(8); B2 `b2-desk-chromium-022714` (S1, S3; 6), `b2-desk-chromium-022811` (S2; 2), `b2-phone-chromium-022824` (6); B3
`b3-desk-chromium-023405` (11), `b3-desk-chromium-023808` (7), `b3-phone-chromium-023905` (16),
`b3ctl-desk-chromium-023734` (2); B4 `b4-desk-chromium-024800` (6); B5 `b5-desk-chromium-023233` (a; 6),
`b5-desk-chromium-023024` (b only; 9); B6 `b6-desk-chromium-024526` (18); B7 `b7-desk-chromium-025225` (7); B8
`b8-desk-chromium-025336` (4); B9 `b9-desk-chromium-025029` (9); B10 `b10-desk-chromium-024907` (a, c; 3),
`b10-desk-chromium-024947` (b; 2); B11 `b11-desk-chromium-025434` (7); B12 `b12-desk-chromium-025535` (13).
