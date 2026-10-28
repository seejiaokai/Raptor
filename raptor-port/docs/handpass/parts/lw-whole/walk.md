# Walk report — [LW-WHOLE-LEAVE-WINDOW] (his D1448, D1461), full bug check, walker's part

Build walked: branch `claude/lw-whole-leave-window` at the Evidence-sheet commit; built under the shared lock, served on port 4183; the served index's bundle (`assets/index-BrWj2PVq.js`) equalled `dist/index.html`'s.
Script: `raptor-port/scripts/handpass/lw-whole-walk.mjs` (one full run, 30 runs; raw record `docs/handpass/parts/lw-whole/walk-results.json`; log of the run is the script's own console output).
Phone = WebKit, iPhone 13 profile 402 x 874 (W13 also 360 x 780); desktop = Chromium 1536 x 864 at 1.25. Each run on a fresh page (`/?fresh=1`; W3 on real storage, because it signs out and in).
Pictures: `raptor-port/docs/img/handpass/2026-10-28-lw-whole-leave/walk/<scenario>-<phone|phone360|desk>-<what>.png` (every picture cited below was opened).
Page / console errors across all 30 runs: none. No source or e2e file changed. The preview server and every browser were stopped.

## Result table

PASS/FAIL against the brief's EXPECTED. "OBS" = observation, see below.

| Scenario | phone | desktop | Pictures |
|---|---|---|---|
| W1 title, chips, cyan, one line | PASS | PASS | W1-phone-all, -day-touch, -day, -closed; W1-desk-all, -day, -closed |
| W2 Approve all, Undo, Redo, approved window, Delete, Undo | PASS | PASS | W2-*-approved, -undo, -redo, -open-approved, -deleted, -undo-delete |
| W3 bell line after approval | not asked | PASS | W3-desk-admin-approved, -bell, -bell-list |
| W4 two entries open the day's list; Delete leaves the OIL | PASS | PASS | W4-*-daylist, -tue-open, -after-delete |
| W5 Auto-approve off then on | PASS | PASS | W5-*-off, -after-lit-press, -approved, -undo |
| W6 posting blocks approve, red note | FAIL (colour only) | FAIL (colour only) | W6-*-before, -refused-note |
| W7 day chip, split leave, Approvals lines, Refuse toggle | PASS | PASS | W7-*-wed-approved, -mon-open, -approvals, -thu-refused, -thu-back |
| W8 Approvals → ring → window → Back | not asked | PASS (see words) | W8-desk-ring-and-bar, -ringed-cyan, -approved-on-grid, -back-approvals |
| W9 Undo / Redo with the window open | OBS (counts as FAIL against the letter) | OBS (Undo not pressable) | W9-phone-open4, -undo-open, -second-undo, -redo-open; W9-desk-open4, -after-ctrl-z, -reopen-after-undo, -reopen-after-redo |
| W9b (added by me) leave changed under an open window | PASS | PASS | W9b-*-removed-under-open, -put-back-under-open |
| W10 member: chips, Move 4, Delete all | PASS | PASS | W10-*-open, -move-banner, -move-confirm (phone), -moved, -deleted |
| W11 run across the period's end | PASS | PASS | W11-*-open, -approved, -approvals-27, -jan |
| W12 morning bids and an afternoon OL | PASS | PASS | W12-*-open, -after-delete |
| W13 longest labels | PASS (402) / **FAIL (360)** | PASS | W13-phone-open, W13-phone360-open, -duration-row, -title-bar (each size) |
| W14 keyboard | not asked | PASS | W14-desk-focus, -escaped |
| W15 single-day leave | PASS | PASS | W15-*-open |

Counts: 30 runs (including the added W9b): 26 PASS, 4 FAIL by the script (W6 phone and desktop on colour, W9 phone, W13 at 360). Reading the FAILs below, the real findings are W6 (colour), W9 (not testable as written), W13 at 360 (two lines).

## FAILs and observations in detail

### FAIL W6 (phone and desktop) — the note is amber, not red
Step: LL on Drifter 9–12 Feb pending; `lwSetPostOut('slipway','2026-02-11')`; tap Mon 9 (window on "All 4 days", title "9–12 Feb"); press Approve.
Saw: the window stayed open, all four days still pending (nothing approved on any day), and a note under the buttons reading exactly:
`Nothing was decided. He posts out on 11 Feb: refuse or delete it.`
Its class is `note warn bp-wide`; its computed colour is rgb(242, 200, 121), amber (picture W6-phone-refused-note, W6-desk-refused-note). The brief said "red note". The words and behaviour are as expected; only the colour differs from the brief. The host decides whether the brief's "red" was wrong or the amber is a defect.

### OBS / FAIL W9 — Undo with the window open
Setup: LL placed on Mon 9, Tue 10, Wed 11, Thu 12 in that order (planted by `lwSetCell`); window opened on Mon 9 ("All 4 days").
- Desktop: the Undo and Redo buttons cannot be pressed while the window is open (the window's scrim stands over the top bar: `elementFromPoint` returns `sheetscrim`; Playwright's click timed out). Ctrl+Z does nothing (window stays, chip stays "All 4 days"). Recorded as an observation per the brief. Route used instead: close with ✕, Undo → Thu 12 gone, reopen on Mon 9 → "All 3 days", 3 cyan (checked, PASS); Redo, reopen → "All 4 days" (PASS).
- Phone: the top-bar Undo is reachable (not covered), and pressing it **closed the window and did not undo**: all four days still pending, Redo still greyed. A second Undo press (window now shut) removed Thu 12 (cells LL, LL, LL, empty); Redo restored it. This looks like the app's standing "a press outside a window closes it" rule swallowing the first tap. The brief's EXPECTED (chip reads "All 3 days" with the window open) cannot be reached by pressing Undo, so it is not a clean PASS; the host decides if the first-tap-closes behaviour is acceptable. No crash, no page error.
- W9b (my addition, planted data, so only supplementary): with the window open on All 4 days, Thu 12 was removed directly from the data → the window stayed open, chip "All 3 days", title "9–11 Feb", 3 cells cyan; putting it back → "All 4 days", 4 cyan. So the window follows a change made under it.

### FAIL W13 at 360 x 780 (WebKit) — Duration row on two lines
LL 17–30 Sep (14 days), tap Wed 30. Labels were right ("All 14 days", "Wed 30"), title "17–30 Sep" sat inside its bar clear of the Auto-approve switch at all three sizes (402: title right edge 180 vs switch left edge 247; 360: 180 vs 205). But at 360 the two chips do not fit beside Whole day · AM · PM: they drop to a second line (button tops 589 and 623, row height 62 against 30 at 402), right-aligned under AM/PM (picture W13-phone360-open, -duration-row). No word is clipped or past an edge. At 402 and on the desktop: one line, inside edges, PASS. Also seen at 360 (not in the brief): the "Grant OIL" button reads "Grant ..." (truncated).

### Observations (no EXPECTED, nothing failed)
- W1 desktop: the floating window opens over the right part of the grid and covers the last one or two days of the leave in the picture (W1-desk-all, W2-desk-open-approved). The DOM has all four cells cyan; the window can be dragged.
- W2: Delete on the approved leave is one press (no "sure?" step in this flow); the first press read: none. Approve reads "Approved" with aria-pressed true. The approved leave draws as one joined bar (first cell jr, middle jl jr, last jl).
- W3 bell (member, after Saber approved bane's four days on All): exactly ONE line. Exact words: title "Your leave", dates "Mon 9 – Thu 12 Feb", then second line "LL approved · Saber", age "now". (innerText joined: `Your leaveMon 9 – Thu 12 Feb LL approved · Saber now`; picture W3-desk-bell-list.)
- W4: the day with two entries (LL pending + HO "OIL award, morning") opens the day's list titled "Drifter  Wed 11 Feb", with two entries each with its own buttons (the LL has Approve · Refuse · Move · Delete, Remarks, Document; the OIL award has Edit… and Delete), not the bid window (pictures W4-phone-daylist, W4-desk-daylist — the question for the owner). Tue 10 then opens "All 4 days" (so the OIL on Wed 11 does not split the leave); Delete removes the LL on all four and leaves the HO on Wed 11.
- W5: Auto-approve was ON at open; after I turned it OFF and pressed the lit LL button the window closed with nothing changed and no "could not be written" text anywhere on the page. On reopening the switch was still OFF (remembered); turned ON, LL approved all four; one Undo put all four back to pending.
- W7: after approving Wed 11 alone, Mon 9 opens "All 2 days", title "9–10 Feb", 2 cells cyan. The Approvals list shows separate lines: phone "Drifter A LL 9–10 Feb … 2 days" and "LL 12 Feb … 1 day"; desktop "LL Mon 9 – Tue 10 Feb … 2 days" and "LL Thu 12 Feb … 1 day" (my first desktop run FAILED only because my own pattern did not expect the desktop's "Mon 9 – Tue 10"; the script now accepts both — script's world, not an app fault). Thu 12 alone: no chips; Refuse → refused (letter r); the lit button read "Refused"; a second tap on it → pending.
- W8 (desktop): Approvals line before: `Drifter A LL Mon 9 – Thu 12 Feb › 4 days 22 P 27 28 Oct 13:54 · by Saber Approve Refuse`. Tapping its dates: the grid with Mon 9 ringed, the slim "Approvals  6 pending  Back ▴  ✕" bar at the foot (picture W8-desk-ring-and-bar). Tapping the ringed day: window on "All 4 days"; `td.lw-ring.selcell` count was 1 (the ringed Mon 9 is also cyan; the ring stays while the window is open; picture W8-desk-ringed-cyan). Approve: the grid shows four approved. Back: the line now reads `Drifter A LL Mon 9 – Thu 12 Feb › Already approved by Saber 4 days …`, class "stale", its Approve and Refuse greyed (picture W8-desk-back-approvals). No page error.
- W10 (member): chips shown, no Approve/Refuse; Move on All → banner `Tap a day to move 4 entries   Cancel`; tapping Mon 16 (phone: a "Move 4 entries here? Confirm / Cancel" bar, then Confirm) → LL on 16–19 Feb, 9–12 empty; open on Tue 17, Delete on All → all four gone.
- W11: "All 2 days", title "30–31 Dec"; Approve approved Dec 30–31 only. Approvals shows the link "+3 in JAN - DEC 27 ›" (desktop "+3 pending in JAN - DEC 27 ›"); in that period the Drifter line is still pending ("LL 1–2 Jan … 1 day", Approve / Refuse), and the January cells (Fri 1, Sat 2) are LL pending. Small oddity: in the 30–31 Dec window the "till" date beside Remarks reads "till 2 Jan 27" (the leave's end across the year), not 31 Dec (picture W11-desk-open).
- W12: *LL (morning) on Mon 9, Tue 10, Wed 11 plus OL* (afternoon) on Tue 10 (planted with `lwSetCell` codes `*LL` and `OL*`): Mon 9 opens "All 3 days" with AM lit, 3 cells cyan; Delete on All → Mon and Wed empty, Tue 10 left with OL only.
- W14: from the open window Tab went: Auto-approve switch › ✕ › Approve › Refuse › Move › Delete › Remarks › till tick › Document › Whole day › AM › PM › All › Tue 10 (14 presses, focus started on the page body). Enter on scope-day: title "Tue 10 Feb", scope-day pressed, focus still on it with `:focus-visible` true; a white ring is drawn round it (W14-desk-focus). Escape closed the window; focus then lands on the page body (not on the cell tapped).
- W15: single-day LL: "Pick a range" present, no chips, title "Mon 16 Feb", that one cell cyan.
- The window's manning line at the top names one date (not always the day tapped): "Mon 9 Feb" with Tue 10 tapped (W1), "Thu 17 Sep" with Wed 30 tapped (W13), "Tue 10 Feb" for the Mon 9 morning leave (W12), "Wed 30 Dec" with Thu 31 tapped. Not in the brief; recorded.
- Not walked: the touched-state picture after every tap on a phone (D1281) — I took it once, after the scope-day tap in W1 (W1-phone-day-touch, shows the tapped chip lit with the pointer left on it, no fault seen); the other taps have only their settled pictures.

## Cost
No token count is available to me; the walk was about 30 browser runs, 100 pictures, 5 of the script's batches plus the final full run.
