# Walker report — the Leave War's older faults (6 Nov 26), Sonnet 5.5 walker

Builds: `dist` (fixed) and, where named "before", `dist-before` (`main` without the double-tap fix). Machine proof: the host recipe ran clean on my machine first (phone, `dist`: second tap landed on the names column, nothing opened, LL placed once, no errors).
Scripts (all new): `scripts/handpass/lw-f1106-w0.mjs` (shared), `-w1` (S1), `-w2` (S2), `-w3` (S3, S4), `-w3dbg` (S4e control), `-w4` (S5, S6), `-w5` (S7, S8); `-w1dbg` is a one-off probe.
Pictures: `docs/img/handpass/2026-11-06-lw-faults/walk/` (fixed build) and `…/walk-before/` (before build). Machine-readable rows: `…/2026-11-06-lw-faults/w-rows-*.json(l)`.
All runs: no console error, page error or failed request (`errs []`) except what is listed under S8.

Size/engine key: desk = Chromium 1536x730 @1.25; phone = WebKit 402x874 touch; phone-c = Chromium phone with real CDP touch. "real gap" is the measured time between the end of tap 1 and the start of tap 2.

## Table

| Scenario | Size / build | What was done | What the screen showed | Verdict | Pictures |
|---|---|---|---|---|---|
| S1 (a) first step | desk, phone / dist | Drifter Fri 20 Nov, Auto-approve OFF, AM, typed "Am", LL; tapped the day again (low half of the cell) | The window did NOT open on the free afternoon as the brief says: it opened on the placed AM bid (AM lit, LL lit, Remarks value "Am") — correct for that bid, but the brief's premise (opens on PM with an empty box) is not what the screen does | RECORD | s1-{desk,phone}-1-am-typed, -2-reopen |
| S1 (a) | desk, phone / dist | In that window pressed PM, read the Remarks box value | value `""` (empty) on both sizes | PASS | s1-*-3b-pm-pressed |
| S1 (a) both halves | desk, phone / dist | typed "Pm", OL; reopened the day (two entries, so the day's list), read the boxes' `value` | AM entry "Am", PM entry "Pm" (read as `Am|Pm`); cells LL + OL | PASS | s1-*-5-open-top / -low, -6-approvals |
| S1 lesson 23 | desk, phone / dist | measured Remarks box, till tick, till date, Document in one open bid window | middles at the same y (desk 544/544/544/544; phone 696/696/696/696), spread 0 px; Remarks and Document both 30 tall | PASS | s1-*-3-geometry |
| S2 gaps, WebKit | phone / dist | LL tap, second tap at the same point after 120 / 170 / 400 / 700 ms (real 99 / 148 / 387 / 678) | each: one LL placed, nothing open for 120, 170, 400; at 700 the second tap opened `person-window` (it landed on a man's name, `frozen-cols TD.who`) | PASS x4 | s2-phone-g{120,170,400,700}-t2q / -settled |
| S2 gaps, WebKit | phone / dist-before | same | 120, 170, 400: `person-window` opened (the fault); 700: opened too | FAIL on before = fault reproduced | s2-phoneB-* (walk-before) |
| S2 Chromium touch | phone-c / dist | same, 120 / 170 / 400 / 700 (real 100 / 158 / 378 / 686) | 120, 170: nothing open, second tap landed on a CAT chip (`SPAN.role lw-chip q-c`); 700: opened person-window. At 400 ms (real 378 + the 60 ms finger hold, so the click arrives about 440 ms after the close, right on the 450 ms edge) the person window opened | PASS x3, 400 = RECORD (edge case, not one the brief asked for in Chromium) | s2-phonec-* |
| S2 double click | desk / dist | `mouse.dblclick` on LL | one LL placed, nothing open | PASS | s2-desk-dbl-settled |
| S2 double click | desk / dist-before | same | `bid-picker` opened behind (the fault) | FAIL on before = fault reproduced | s2-deskB-dbl-settled |
| S2 next click | desk / dist, before | click LL, 200 ms later one single click on another day's cell | that day's window opened (Mon 16 Nov) on both builds | PASS | s2-desk-click-next |
| S2 targets | phone / dist | second tap aimed at: a man's name (WebKit: the names column), a CAT chip (Chromium phone), a day cell (tap 2 aimed at Reaper's cell, real gap 375 ms; a different point from LL — the window cannot be moved) | name: nothing open; chip: nothing open; cell: nothing open, LL placed. Before build, same cell case: `bid-picker` opened | PASS x3 (before FAIL = fault) | s2-phone-cell-*, s2-phoneB-cell-* |
| S3 drag window | desk, phone / dist | drag Drifter 24-26 Nov, tap LL, second tap/dblclick at its point (phone real gap 133 ms; second tap on the names column) | three LL bids, once each; nothing open | PASS x2 | s3-*-1-drag-window, -3-after |
| S3 drag window | desk, phone / dist-before | same | desk: `bid-picker` opened; phone: `person-window` opened (fault) | FAIL on before = fault reproduced | walk-before/s3-* |
| S3 skipped note | desk, phone / dist, before | OL approved on 28 Nov, drag 27-28 Nov, tap LL once | window STAYS; note "1 written. 1 skipped: already holding leave or a medical." Same on before | PASS x2 | s3-*-4-skipped-note |
| S3 second tap in open window | desk, phone / dist | tap LL again inside the still-open window | window stays, cells LL(27 Nov) and OL approved(28 Nov) unchanged — the button behaves as the window's own (nothing eaten) | RECORD | s3-*-5-second-q, -6-second-settled |
| S4 (a) | desk, phone / dist | bid window's X tapped twice (phone real gap 118 ms) / double-clicked | closed; nothing opened (phone second tap landed on a day cell, `cell-harpoon-2026-12-09`) | PASS x2 | s4-*-a-settled |
| S4 (a) | desk, phone / dist-before | same | `bid-picker` opened behind both times (fault) | FAIL on before = fault reproduced | walk-before/s4-* |
| S4 (b) | desk, phone / dist AND before | bid window open, tap another man's day (Reaper) | nothing opens: on a desktop a `sheetscrim` stands over the grid, so the tap only closes the window; on the phone the tap closes the window and opens nothing. IDENTICAL on `dist-before`, so not caused by the change; the brief's D641 reading (this window leaves the page working) does not hold for the one-day bid window — see "Other things" | FAIL against the brief's EXPECTED (same on both builds); host to rule | s4-*-b-settled |
| S4 (c) | desk, phone / dist | day panel (`win-lwday`, opened by the date header) ✕ tapped twice (phone gap 122 ms) / double-clicked | RECORD: closes; nothing opened; the second phone tap landed on the SXO group-heading row (`group-SXO TD.grpfill`), which opens nothing | RECORD | s4-*-c-panel, -c-settled |
| S4 (d) | desk / dist, before | Escape closes the bid window, ~207 ms later one mouse click on a day | that day's window opened | PASS | s4-desk-d-settled |
| S4 (e) | phone / dist | place LL (window closes), ~100-120 ms later tap a month button on the strip (OCT, MAR; control AUG at ~1 s) | **the month tap is eaten**: lit month stays DEC, grid does not move, for OCT and MAR at ~100 ms; the same tap at ~1000 ms works. On `dist-before` the quick tap works (OCT, MAR). The tapped button shows only a pressed ring | **FAIL (a real fault in the fix)** | s4e-phone-quick120-q/-settled, s4e-phone-quick120b-*, s4e-phone-slow1000-* (walk); s4e-phone-*-* in walk-before |
| S4 (e) extra | phone / dist, before | same quick tap on the top bar's Undo and on the Approvals tab | both worked on both builds | PASS x2 | s4e-phone-undo-*, -approvalstab-* |
| S5 (f) | desk, phone / dist, before | Saber's own row 12 Nov: OL (Auto-approve off) → Refuse → badge/drawer switch to member view → tap the day | closed-day window opens with NO Remarks box (a refused bid is not a pending one), so no words could be typed; role stayed MEMBER (no Approvals tab, no gear, badge "Saber · Member") | NOT REACHED (the war's refusal could not be made from here) | s5-*-1..5 |
| S5 other routes tried | desk, phone / dist, before | (B) approve OL on 13 Nov as admin, switch to member, top bar Undo; (C) pending OL on 14 Nov, member types "Wx" in the closed-day note's Remarks; (D) approved OL on 15 Nov, member types "Wx" in its Remarks | (B) the app refuses before the war: note "Switch back to the admin view to undo that.", cell unchanged, role stays MEMBER; (C), (D) the war keeps the words ("Wx" on reopen) and role stays MEMBER every time. So no route produced a refusal inside the war in the member view, on either build; the fault of (f) was therefore never seen or cleared by this walk | NOT REACHED (routes: A refused bid, B Undo, C pending words, D approved words); B/C/D themselves PASS (role held) | s5-*-6..8, -C1..C3, -D1..D3 |
| S6 (g) | phone / dist | day panel up on 16-18 Dec (panel top at y 285), grid scrolled so Manning is out of view (its top went from 162 to -145), Drifter's LL placed on 17, 18, 16 Dec | the bid window opened and LL placed each time, but no manning bubble was raised (those days' rows were not near their line: Available P 28), so nothing to measure | NOT WALKED (3 tries; to reach it, many men would have to bid the same December day) | s6-phone-1-panel-4x, -2-bid-open-4x, -3-bubble-4x |
| S7 (c) post-out | desk, phone / dist | Diesel posted out as Overseas from 29 Dec | sheet line "On 29 Dec: archived." | RECORD | s7-*-1-postout-sheet |
| S7 (i) | desk, phone / dist | drag Diesel 28-30 Dec, pressed OD in the drag window (the first press left the row empty, the second wrote it) | row: OD (approved) on 28 Dec, PO on 29 and 30 Dec — matches "today" in the brief | RECORD | s7-*-2-drag-window-before-OD, -3a-after-first-OD-press (desk), -3-after-OD, -4-diesel-row |
| S7 (ii) | desk, phone / dist | Inputs page, December 2026 | one bar "Diesel · OD" across 28-30 Dec (my script's bar count read `[]` on the desktop only because its selector matched the phone's bars; the picture shows the bar) | RECORD | s7-*-5-inputs-december |
| S7 (iii) | desk, phone / dist | Echo posted out the same way, LL dragged over 28-30 Dec (Auto-approve off) | row shows pending LL on all three days, including the PO days 29-30; no refusal note | RECORD | s7-*-6-echo-drag-window, -7-echo-after-LL, -8-echo-row |
| S8 round | desk, phone / dist | LL on a free day with Auto-approve ON | LL approved on the grid; landing picture taken | PASS x2 | s8-*-1, -2, -3-landed |
| S8 close ways | desk / dist | reopen the leave; close by ✕, by Escape, by a tap outside | each closed the window; nothing opened | PASS (recorded) | s8-desk-4-reopen, -5-after-ways |
| S8 close ways | phone / dist | ✕ closed it; my "tap outside" point hit the My-leave bar and opened the person window | script's own mistake in the aimed point, not a finding | NOT WALKED (tap-outside on the phone) | s8-phone-4, -5 |
| S8 drag fill | desk, phone / dist | drag Cinch 28-30 Nov, Auto-approve OFF, OL, close drag window | three pending OL; window closed after the fill | PASS x2 | s8-*-6-drag-window, -7-after-fill |
| S8 Undo / Redo | desk, phone / dist | top bar Undo once, Redo once | Undo emptied the three days (Warden's LL kept); Redo brought them back | PASS x2 | s8-*-8-undo, -9-redo |
| S8 Approvals | desk, phone / dist | Approvals tab | one joined line for Cinch's OL "28-30 Nov", tab count 14/15 (my script wrongly expected 3 lines; the picture and text are right) | PASS x2 | s8-*-10-approvals |
| S8 bell | desk, phone / dist | pressed the bell | my selector did not find the panel text; picture only | RECORD, read the picture | s8-*-11-bell |
| S8 My leave | desk, phone / dist | pressed My leave | person window opened | RECORD | s8-*-12-my-leave |
| S8 Inputs | desk, phone / dist | Inputs page, November | "Warden · LL" entry present | PASS x2 | s8-*-13-inputs |
| S8 errors | desk, phone | all collected console errors / failed requests | none | PASS x2 | — |

Counts (fixed build, my reading): about 43 PASS, 3 FAIL, 8 RECORD, 5 NOT REACHED / NOT WALKED (S5 x3 sizes/builds counted once per run).

## The FAILs, in one line each

1. **S4 (e), phone:** a month-strip tap made about 100-120 ms after a leave is placed (window closed) does nothing on `dist` (grid stays, lit month stays); works on `dist-before` and works on `dist` at ~1 s. The brief says the strip is never eaten. Reproduced 3 times, on the same world as the passing controls.
2. **S4 (b), desk and phone:** with the one-day bid window open, a tap on another man's day closes it and opens nothing (a scrim covers the grid on the desktop). Identical on `dist-before`, so not the change's doing; the brief's expectation (D641) does not appear to cover this window.
3. (S2 Chromium-phone at 400 ms is recorded as an edge case, not a FAIL: the person window opened when the second click arrived about 440 ms after the close.)

## Other things I saw

- S5: no route found that makes the war refuse a change from the member view; (f) is unproven either way by this walk (before and after look the same on every route tried). The only refusal reachable, the top bar's Undo in the member view, is stopped by the app ahead of the war ("Switch back to the admin view to undo that.").
- S1: the day reopens on the placed AM bid, not the free half; a person wanting the afternoon presses PM (box then empty). Fine, but the brief's wording should be checked against the ruling.
- S2 targets: the LL button on a phone sits over the names column, so the second tap lands on a name or CAT chip, never a day cell; the cell case was done by aiming tap 2 at a cell, not at LL's point.
- Phone WebKit shows "Couldn't save that document…" notes in Undo walks: the test browser's known storage limit (walk-scripts §7a), not the app.
- Housekeeping: for about 20 minutes the w4 script's pictures went into `docs/img/handpass/2026-10-30-lw-small-fixes/host/` and its rows file beside it (a static import ran before the output folder was set). They were all new untracked files of this walk; I moved every one into this walk's folders and fixed the script; nothing tracked was touched (`git status` shows no modified tracked file).
- `raptor-port/docs/img/handpass/2026-11-06-lw-faults/walk-dbg/` holds two throwaway debug pictures and may be deleted.

Every script and browser I started has ended.
