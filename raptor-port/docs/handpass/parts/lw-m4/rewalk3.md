# M4 fixes' rounds 2 and 3 re-walk (28 Oct 26) — walker report (Sonnet walker)

Build on port 4173: commit 9fdf8e5ee (frozen). Scripts: `raptor-port/scripts/handpass/lw-m4-rw3-*.mjs` (probe, g1, g1x, g2, g3a, g3b, g3c, g3d, g4x/g4y explore, g4, g5).
Pictures: `raptor-port/docs/img/handpass/2026-10-27-lw-m4/rewalk3/`. Phone 402 x 874 (touch, scale 3, CDP finger; 440 wide for G1c), desktop 1536 x 860 at 1.25.
No console, page or 4xx errors from any run. Every picture cited below was opened. The war's today is 5 Jan 26 (pinned by the lib).

## Result per step

| Step | Size | Verdict | Pictures | What was seen |
|---|---|---|---|---|
| G1a held press 1 s on line 1's Approve, lifted | phone 402 | PASS | g1-402-a-1-open, a-2-just-lifted, a-3-settled | Calendar open above the list; finger held 1000 ms on Static's Approve (281,783), lifted. Calendar closed; header "6 pending", "Approve all 6", tab 8, every line unlit before and after. |
| G1b tap on the empty band under the calendar, at line 1 Approve's x | phone 402 | PASS (3 points) | g1-402-b-1-open, b-2-q, b-3-settled; g1x-714-*, g1x-722-* | Tap at x 281: y 732 (on the column-heading row), y 714 (just under the card, on the outer card) and y 722 (heading row); each closed the calendar, nothing decided, count and lines unchanged. |
| G1c 440 wide, tap on the strip right of the calendar where line 1's buttons stand | phone 440 | PASS | g1-440-c-1-open, c-2-closed, c-4-q, c-5-settled | With the calendar closed line 1's buttons stand at y 392; with it open the point (416, 392) is empty card right of the calendar. Tap: calendar closed, nothing decided (6 pending, lines unlit). |
| G1d tap on the Grid tab, calendar open | phone 402 | PASS | g1-402-d-1-open, d-2-q, d-3-settled | One tap: calendar gone and the Grid open (Grid tab lit, grid cells showing) in that tap. |
| G1e first tap on a line's Approve, then the next | phone 402 | PASS | g1-402-e-1-open, e-3-after-first-tap, e-4-q, e-5-after-second-tap | First tap: calendar closed, "6 pending", nothing lit. Next tap on Static's Approve: only that line lit "Approved", "5 pending", "Approve all 5", tab 7. |
| G2d click on the Grid tab, calendar open | desk | PASS | g2-d-1-open, g2-d-2-after | One click: calendar closed and Grid opened. |
| G2e click on a line's Approve, calendar open; the next click | desk | PASS | g2-e-1-open, g2-e-2-after-first-click, g2-e-3-after-second-click | First click: calendar closed, nothing decided (6 pending). Second: only Static lit "Approved" (5 pending). |
| G2 click on the top bar's Undo, calendar open | desk | PASS | g2-u-1-open, g2-u-2-after-undo | With Static approved and the calendar open, one click on Undo: calendar closed AND the approval undone (5 -> 6 pending, the line unlit, "Undid: a decision on a bid" note). |
| G3 run posting (Blade posted out from 4 Jan, today 5 Jan; the app allowed it, tag "posted out 4 Jan"), bid BEFORE it | desk | PASS (Approvals and window) | g3a-2-appr-before-2jan (it is the 3 Jan line), g3a-4-window-1jan, g3a-5-window-1jan-after-approve | Admin placed pending bids on 1 and 3 Jan (past days, the admin may). Approvals: 3 Jan Approve lit "Approved". Window on 1 Jan: its Approve closed the window and the 1 Jan cell turned filled LL (picture g3a-5). |
| G3 run posting, bid AFTER it (2 Feb) | desk | PASS (Approvals and window) | g3a-3-appr-after-2feb, g3a-6-window-2feb, g3a-7-window-2feb-after-approve | Both give "He posted out on 4 Jan: refuse or delete it"; Approve not lit; the window stays on "Pending". |
| G3 posting out LATER (Static from 7 Jan; the 6th held a medical) and a bid after (8 Jan) | desk | PASS (Approvals and window) | g3b-2-appr-static, g3b-3-window-static, g3b-4-window-static-after-approve | Both read "He posts out on 7 Jan: refuse or delete it", Approve not lit. |
| G3 "Approve what I enter" on, leave placed after a man's date — the drag window | desk | PASS | g3d-3-drag-open, g3d-4-drag-after-LL | Dragged Static 20-21 Jan, tick on, LL: "2 days kept pending — He posts out on 7 Jan: refuse or delete it." in the window; the two cells show dashed (pending) LL. |
| G3 drag over two men's days after their dates, then Approve | desk | PASS | g3b-7-drag-window, g3b-8-drag-after-approve | Reaper and Anvil (posting from 7 and 8 Jan), their pending bids 13-14 Jan: "2 not approved: Reaper: He posts out on 7 Jan: refuse or delete it. Anvil: He posts out on 8 Jan: refuse or delete it. 2 skipped (no bid, or Raptor-owned)." Each man before his reason, the reasons apart. |
| **G3 "Approve what I enter" on, leave placed after a man's date — the ONE-DAY window** | desk | **FAIL** | g3b-5-window-ape-on-before, g3b-6-window-ape-on-after, g3c-1-after-LL-30/150/400, g3d-1-blade-before, g3d-2-blade-after | See Faults. |
| G4 a deleted man (Admin -> Users -> Delete, "Tap again to delete Static"; no date is asked) with a pending bid (8 Jan) | desk | PASS (2 rows) | g4-1-delete-asked, g4-2-deleted, g4-3-approvals-after, g4-4-approve-pressed, g4-5-refuse-pressed | The delete leaves his pending bid in Approvals (name and puck kept). Approve: "Posted out — refuse or delete it", not lit. Refuse: lit "Refused", the kind box grey and struck through. |
| G5 three changes of mind | desk | PASS (6 checks) | g5-0-pending to g5-9-approve-after, g5-4-undo1-page, g5-5-undo2-page, g5-6-redo1-page, g5-7-redo2-page | Approve, Refuse, Approve: lit Approved / Refused / Approved. Undo: lit "Refused" (record r). Undo: lit "Approved", both buttons enabled (record a). Redo: lit "Refused" (r). Redo: lit "Approved" (a). Afterwards Refuse then Approve both still work. Record read from the grid cell's state (the hidden grid under Approvals) and the line's kind box (filled / grey struck / dashed). |

Counts (20 rows): **PASS 19, FAIL 1, NOT WALKED 0.**

## Faults

1. **G3 — the one-day window drops the posting reason when "Approve what I enter" is on.** Steps: sign in as admin; post a man out (Static from 7 Jan, still to come — or Blade from 4 Jan, run); on a day after his date open the cell (the grid draws it as posted out; the window offers "Place leave or OIL here instead…", pressed), turn "Approve what I enter" on, press LL. Seen: the bid is placed and kept pending (dashed LL on the grid, "Pending", "Placed Saber"), but the window straight away turns into the pending bid's own window (Approve · Refuse · Move · Delete) with no line saying why it was not approved — checked at 30, 150 and 400 ms and in the settled picture; no "kept pending" text anywhere on screen. Expected: the window says his posting reason ("He posts out on 7 Jan: refuse or delete it" / "He posted out on 4 Jan: …"), per round 2's R2-4 and D1436. The drag window does say it (PASS above), so only the one-day window loses it. Pictures: g3b-6-window-ape-on-after, g3c-1-after-LL-30, g3d-2-blade-after (against g3d-4-drag-after-LL, where it shows). Likely the placed bid makes the window re-open on the bid, wiping the note set just before; the host should check that against the unit test, which passes.

## Observations (not counted)

- G3 "a bid before a run posting date in the bid window": my script's check returned a null read because the window closes after Approve; the evidence is the cell turning filled LL (g3a-5). The JSON in `g3a.json` therefore shows that row as FAIL; it is a PASS.
- The Admin -> Users Delete asks no date (two taps, "Tap again to delete Static"); G4's "date after the bid" is the day of deleting. The man's bid stays in Approvals as the build intends.
- An approved or refused line's figures (DAYS, LVE BAL, LOWEST AVAIL) go blank while its kind box and buttons stay (g2-u-1-open, g5-5-undo2-page) — as built since D1421, not a fault.
- Grid cells for days from a posted man's date are drawn "PO" even when his posting is still to come (Static from 7 Jan, today 5 Jan), and a tap on one opens the day's list with "Place leave or OIL here instead…" (g3b-5a-window-posted-day).

## Not reached

Nothing in G1-G5 was unreachable. G1(b)'s "empty band" at 402 holds the column-heading row; the stricter points just under the card were also tapped (g1x). The record in G5 was read from the hidden grid's cell state, not from a window, as in the earlier re-walk.
