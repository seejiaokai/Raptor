# M5a walker C — the person window, every way in (29 Oct 26)

Sonnet walker (D787). The frozen build of commit 92b43acf9 on 4173. The war's today 25 Jan 2026. Desktop 1536 × 860 at 1.25,
phone 402 × 874 touch. Scripts `raptor-port/scripts/handpass/lw-m5a-walk-c*.mjs` (lib `lw-m5a-walk-c-lib.mjs`; c0* are
recons that give no verdict); pictures `raptor-port/docs/img/handpass/2026-10-28-lw-m5a/c/<c1…c8>/`. Every run on real
storage in a fresh context; role switches by the lib's `switchTo`. Where a script's own verdict was wrong, this report says so
and gives the right one with the reason (c1's P2b and c3's N5 were script misreadings; c2's X2 expected the wrong figure).

**Totals: 75 PASS · 3 FAIL · 8 NOT WALKED** (no console error, page error or 4xx in any run). Three of the PASS rows are
"readings" — the screen did what the build spec names, but the scenario list leaves open what a tap should do; they are flagged
**(reading)** for the host. Pictures I opened and looked at: c1 01-ranger-docked, 01-ranger-window-crop, 02-dragged,
02c-cell-pressed, 05b-from-approvals-puck; c2 22e-sans-off-his-dates, 22f-line-tap-no-row, 23c-viewer, 23d-after-first-escape,
24-line-2026-03-02; c3 33b-ranger-sees-changes, 33b2-scrolled-to-foot, 34b-oil-opened; c4 44a-own-with-dots; c5
54b-postout-sheet; c6 61d-approvals; recon 01 and 12. The other rows rest on the values read from the window and the picture
named, which I did not open one by one.

## The FAILs

1. **P6 — a day cell pressed with the person window up: the bid window opens OVER part of the person window** (c1
   `02c-cell-pressed`). Docked Saber's window (948,200 – 1508,634) and pressed Ranger's 26 Jan cell: the bid window stands at
   488,543 – 1048,846, so its right end covers the person window's lower-left corner (about 100 × 90 px, where the leave
   list's dates begin), and the element at the person window's centre is `sheet-scrim` — the person window cannot be pressed
   while the bid window is open. Expected (D641, the brief): both visible, neither under the other. Both stay on screen, the
   grid behind keeps working; the overlap is the finding.
2. **C3 — Escape while the document viewer stands over the person window closes both at once** (c2 `23c-viewer` then
   `23d-after-first-escape`). Scenario 23 expects the viewer first, then the window on a second Escape. One Escape left the
   plain grid: viewer and window both gone.
3. **C3b — after the window closes the keyboard does not return to the name that opened it** (c2 `23d-after-first-escape`):
   `document.activeElement` is `BODY` after the second Escape (and after the first). The name was opened by a pointer press,
   which focuses the button in Chromium, so a return was expected (design guide §3).

## Table — scenario · size · verdict · what the screen said · pictures

| Scenario | Size | Verdict | What the screen said | Pictures |
|---|---|---|---|---|
| P1 (14) a pilot's name on the grid opens his window, docked at the grid's right edge | desk | PASS | Ranger: box 948–1508, top 200, bottom 850 of 860; grid card right 1515, page right 1536 | c1/01-ranger-docked |
| P2 tiles, figures (c-approved / p2) | desk | PASS | "3 taken"; App bal 15; Pending −2.5; War bal 12.5; carried fwd 2; OIL "0 ›"; MED 0; CCL 3 (Pending −1, War bal 2); FCL 5; PL 2 (−0.5, 1.5); EL 4; CL 1 (−1, 0); 7 boxes | c1/01-ranger-window-crop |
| P2b "incl. [2] carried fwd · till 31 Dec" | desk | PASS | box 2, words "incl. carried fwd · till 31 Dec" (c1's first verdict FAIL was the script reading `innerText`, which leaves a box's value out; redone in c2) | c1/01-ranger-window-crop |
| P2c small tiles show Pending / War bal only while pending | desk | PASS | CCL, PL, CL yes; FCL, EL none | same |
| P2d the five small tiles line up | desk | PASS | box tops 443 ×5; Pending lines 476 ×3; War bal lines 494 ×3 | same |
| P2e heading is his name as words, no puck | desk | PASS | no `.puck` inside the window | same |
| P3 leave list, one line each | desk | PASS | LL Mon 19 – Wed 21 Jan 3 Approved · LL Mon 26 – Tue 27 Jan 2 Approved · LL Thu 29 Jan, AM 0.5 Pending · LL Mon 2 Feb 1 Refused · LL Thu 12 – Fri 13 Feb 2 Pending · CCL Mon 2 Mar 1 Pending · PL Mon 16 Mar, AM 0.5 Pending · CL Tue 17 Mar 1 Pending | c1/01-ranger-docked |
| P3c window's height | desk | PASS (note) | 650 high from top 200; the list scrolls inside the window, the last lines are below the fold; the drawing shows all 8 lines in view | c1/01-ranger-docked |
| P4 drag by the grip | desk | PASS | 480 left, 96 down; moved to 468,296 – 1028,946 (its foot is 86 px below the 860 screen: the drag is not held on screen) | c1/02-dragged |
| P5 (16, lesson 4) another name pressed with the window up | desk | PASS | the window switches to Saber, one window; it goes back to the docked place (948,200) — the dragged place is not kept; Saber 17.5 incl. 1, 7 boxes | c1/02b-other-name-while-dragged |
| P6 (16) a day cell pressed with the window up | desk | **FAIL** | see FAIL 1 | c1/02c-cell-pressed |
| W1 (14, reading 15) the LVE figure beside a name | desk | PASS | opens Ranger's person window; the old breakdown sheet is not drawn | c1/03-lve-figure |
| W2 (14) My leave, admin's own | desk | PASS | Saber's window: App bal 17.5, 7 boxes, no lines | c1/03b-myleave-admin |
| P7 (25) WSO / ground / OCU "O" / grade-A pilot / A | desk | PASS ×5 | Basher (IW) 16.5 incl. 3; Cotter (G) 0; Recon (O) 31 incl. 3; Drifter 24 incl. 2, OIL 4 ›, 5 lines; Ace 30 incl. 2, 2 lines — each window on the screen, 7 boxes | c1/04-glass, 04-spanner, 04-prism, 04-slipway, 04-dj |
| W3 (14) a name on the Balances page | desk | PASS | Ranger's window at 968,121 – 1528,850 over the page; the page stays drawn | c1/05-from-balances |
| W3b another name on the page behind | desk | PASS | the one window switches to Saber | same |
| W4 (14, **reading**) Approvals: a tap on a man's puck | desk | PASS (reading) | opens nothing (the puck is not a control); the spec names Approvals' line only for a man with no row (S4) | c1/05b-from-approvals-puck |
| W5 a leave line tapped in a window opened from Approvals | desk | NOT WALKED | a window from Approvals exists only for a man with no row, whose lines are not links (S5); there is no window-from-Approvals for a man with a row to tap in | — |
| S1 Show SANS puts the SANS men on the war | desk | PASS | rows 50 → 61 (Jester, Romeo, Yeti, Vinci, Krait, Cards, Wrangler, Badger, Waldo, Nick, Bullet) | c2/22a-settings-sans-on |
| P7 a SANS man (SANS on) | desk | PASS | Jester: window on screen, App 0 incl. 0, 7 boxes | c2/22b-sans-window |
| S2 a pending LL placed for him | desk | PASS | "LL Tue 10 Feb 1 Pending"; Pending −1 | c2/22c-sans-with-bid |
| S3 SANS off the war: his request stays on Approvals | desk | PASS | his row gone; line "Jester B LL Tue 10 Feb › 1 day −1 SANS · not in Avail" | c2/22d-approvals-sans-off |
| S4 (14, B12) a man with no row: his puck / his dates on Approvals | desk | PASS (reading) | puck: nothing opens; dates "Tue 10 Feb ›": the window opens (App 0, Pending −1, 1 line) and the page goes to the Grid tab with the slim "Approvals … Back" bar | c2/22e-sans-off-his-puck, 22e-sans-off-his-dates |
| S5 (★15) a leave line of a man with no row | desk | PASS | the line is not a link (no dates button); nothing jumps, no ring | c2/22f-line-tap-no-row |
| C1 a leave placed with a document wears a paperclip | desk | PASS | clip on "LL Tue 7 Apr" (the seed holds no document) | c2/23b-window-with-clip |
| C2 (23) the paperclip opens the document over the window | desk | PASS | the element at the window's centre is the viewer (`airpop`, outside the window); picture shows the viewer over the window | c2/23c-viewer |
| C3 (23) Escape: viewer first | desk | **FAIL** | see FAIL 2 | c2/23d-after-first-escape |
| C3b keyboard returns to the name | desk | **FAIL** | see FAIL 3 | same |
| L1 a tap on a line takes the grid there with the ring; the window does not cover the day (16) | desk | PASS ×3 | 2 Mar, 26 Jan, 7 Apr: cell ringed (cyan inset), cell right edge 238 vs window left 948, the cell is the element on top; the window stays open | c2/24-line-2026-03-02, 24-line-2026-01-26, 24-line-2026-04-07 |
| Y1 (21) the year picker with the clock at 5 Jan 2027 | desk | PASS | options "2027 and ahead", "2026"; App 49 incl. 13 before Ranger's April leave; 0 lines ahead | c2/25a-2027 |
| Y2 a past year picked | desk | PASS | "2026": 9 lines | c2/25b-past-year |
| X1 (★17) a figure typed, no Enter, then another name | desk | PASS | Ranger's 16 saved to Ranger (Balances 16 incl. 1, War bal 13.5); Anvil's window opens with Anvil's 19 | c2/26-typed-then-other-name, 26b-balances-after |
| X2 one Undo takes it back | desk | PASS | the note "Undid: LVE balance 14 → 16"; Ranger back to 14 (his figure before the typing — the script's 15 forgot the 7 Apr leave placed earlier; c2's own FAIL was that mistake) | c2/26b-balances-after |
| N0 (50) Ranger's first visit | desk | PASS | 8 lines, no dots | c3/31a-first-visit |
| N1 (51) his own bid on 24 Feb | desk | PASS | placed | — |
| N2a–g (50) Saber approves 29 Jan AM, refuses 12–13 Feb, puts 26–27 Jan back to a bid, moves CCL 2 Mar to 4 Mar, deletes CL 17 Mar, re-types PL 16 Mar AM as FCL, places LL 7 Apr approved | desk | PASS ×7 | each pressed through the app's own controls | c3/32c-put-back, 32d-moved, 32e-deleted |
| N6 (51) the admin opens Ranger's window | desk | PASS | no dots on the admin's view; Ranger's last visit not written (his dots survive, N3) | c3/32g-admin-opens-ranger |
| N3 (50) Ranger opens his window | desk | PASS | dotted with who, when: "put back to a bid by Saber · 29 Oct 01:58" (26–27 Jan, one line, one dot), "approved by Saber · …" (29 Jan), "refused by Saber · …" (12–13 Feb), "moved by Saber · …" (Wed 4 Mar), "added and approved by Saber · …" (16 Mar FCL; 7 Apr), "deleted by Saber · …" (17 Mar) | c3/33b-ranger-sees-changes, 33b2-scrolled-to-foot |
| N4 his own change never dotted | desk | PASS | "LL Tue 24 Feb 1 Pending", no dot | same |
| N5 the deleted line struck through | desk | PASS | "Tue 17 Mar" struck, state "Deleted" (c3's first verdict FAIL was the script looking for the strike on the row, not the dates) | c3/33b2-scrolled-to-foot |
| N7 his bell | desk | PASS | 7 lines, each naming Saber ("Your leave · Thu 29 Jan LL approved · Saber now" …) | c3/33a-bell |
| N8 close and reopen | desk | PASS | no dots; the deleted line gone (9 lines) | c3/33c-reopened |
| N9 reload, sign in, open | desk | PASS | still no dots | c3/33d-after-reload |
| O1 (24) Ranger opens Recon's window | desk | PASS | 0 boxes, 7 read-only figures, no dots, no lines | c3/34a-other-readonly |
| O2 OIL "›" in Recon's window | desk | PASS | the OIL tracker opens on Recon's row; the window closes (the tracker covers the page) | c3/34b-oil-opened |
| O3 a member's own window | desk | PASS | 7 boxes while unlocked | c3/35a-own-member |
| PH1–PH4 (14) a name, the LVE figure, My leave (admin), a Balances name | phone | PASS ×4 | window in the middle, 10 px each side; Ranger: top 45, height 785; Saber (My leave): top 220, height 434 | c4/40a-name, 40b-lve-figure, 40c-myleave, 40d-balances-name (+ -q, the ~100 ms picture) |
| PH1b ✕ closes it | phone | PASS | gone | — |
| PH5 Ranger's own, first visit | phone | PASS | 7 boxes, 8 lines, no dots | c4/42a-first-visit |
| PH6 Saber approves 29 Jan AM, refuses 12–13 Feb | phone | PASS | pressed on the phone's Approvals lines | — |
| PH7 his own window with dots | phone | PASS | 2 dotted lines: "approved by Saber · 29 Oct 02:02", "refused by Saber · 29 Oct 02:02"; the window top 33, height 808 | c4/44a-own-with-dots, 44a-own-crop |
| PH8 another man's, read only (p6) | phone | PASS | Recon: 0 boxes, no dots; top 220, height 434 | c4/44b-other, 44b-other-crop |
| PH9 a leave line tapped | phone | PASS | the grid goes to 2 Mar, the cell ringed and the top element; the window closes | c4/44c-line-tapped |
| PH10 locked, the admin's window | phone | PASS | "Locked for members", 7 boxes kept | c4/45b-admin-locked-window |
| PH11 locked, his own (p5) | phone | PASS | "Locked by admin", 0 boxes, 7 read-only figures | c4/45c-member-locked-window, 45c-member-locked-crop |
| D1 (14) a name in the day panel's "who is away" | desk | PASS (reading) | the day panel (a tap on a date heading) lists names; tapping one opens no window | c6/62a-daypanel, 62b-daypanel-name-tapped |
| D2 (14) a name on the OIL tab | desk | PASS (reading) | opens no window | c5/52a-oil-name |
| A1 (25, lesson 9) tiles in the same place for a pilot, WSO, ground, O and grade-A man | desk | PASS (note) | every tile and box identical relative to the window except the App bal box: 53 wide for "16.5" against 42 for "15", "0", "31", "24", "30", so Pending / War bal start at 1055 instead of 1044 for Basher (c8) | c8 (values only) |
| PO1–PO4 (26) a posted-out man (Cinder, posting out 12 Feb) | desk | PASS ×4 | window opens before his date and after (clock 1 Mar): App 19.5 incl. 2, Pending −0.5, War bal 19, 7 boxes, "LL Wed 5 May, AM 0.5 Pending" kept; his row stays on the grid with "PO" marks; no Approvals line (his pending leave was never on the list) | c6/61b, c7/71a-grid-after-date, c7/71b-window-after-date |
| errors | both | PASS | none | — |

## Differences from the drawings (the host decides which are faults)

**`m5a-p2-desk-drawn` (desktop):**
- The window stands lower: built top 200 against about 65 in the drawing (just under the top bar, level with the grid's first row); built height 650 against about 675, so the list scrolls inside it and the last lines are below the window's foot; the drawing shows all eight lines in view with the window ending above the screen's foot.
- The leave lines: built, each is a rounded card with a cyan left edge on every line (also the undotted ones); the drawing's lines are flat rows between hairlines inside one frame, no card, no cyan edge.
- The drawing shows a paperclip on "Mon 19 – Wed 21 Jan"; the seed holds no document, so none is drawn (it draws once a document is added, C1).
- The drawing was made locked ("Locked for members" under BALANCES); mine unlocked, so no padlock line (it shows locked on the phone, PH10).
- The drawing shows the person's pending with its deleted line "Mon 9 Feb"; the walked world has none (the real deleted line draws struck, N5).

**`m5a-c-approved` / `m5a-c-vs-20d` (tiles):** same tiles, boxes, labels and order; figures differ only by the world (15 / incl. 2 / −2.5 / 12.5 against 17 / incl. 4 / 0 / 12.5). The drawing has an extra row under LVE, "Approved since 5 Jan −4.5"; the build has none (the later p2 drawing has none either).

**`m5a-p4-phone-own` (phone):**
- The window stands higher and taller: built top 33, height 808 (it covers the lower half of the top bar's row); the drawing's window starts under the top bar (about 70) and is about 736 high.
- Same card-with-cyan-edge lines against the drawing's flat rows.
- "who, when" reads "approved by Saber · 29 Oct 02:02" (a date, because the war's today is 25 Jan); the drawing reads "approved by Saber · yesterday 08:40". The cyan dot is drawn beside the line in the build; the drawing shows none beside its lines.
- No paperclip, no "Deleted" line in the walked world.

**`m5a-p6-phone-other`:** the window in the middle, read only, no dots — as drawn; Recon's list is empty (no leave), where the drawing shows his lines; its height 434 is the content's.

## Other things seen (not judged)

- A window dragged to a place keeps it only until the next name pressed; then it goes back to the dock (P5).
- A drag can carry the window 86 px below the screen's foot (P4).
- An admin's re-type of a pending bid (PL to FCL) with Auto-approve on reads "added and approved by Saber" (a new approved leave), and a move reads "moved by Saber" without where from.
- The dot's "when" is an absolute date and time here; the drawing's "yesterday 08:40" cannot be reached on this walk's clock (the war's today is 25 Jan, the time stamps are the PC's 29 Oct) — the host may want a walk with the clock near the stamps.
- The recon (c0) found the Settings still show a "Show SANS" button (M5b's "+ SANS" is not in M5a).

## NOT WALKED

1. The bell's line for a man with no row (D1219: an admin gets no bell line for requests; reaching a SANS man's own bell needs his own sign-in, not available).
2. Scenario 50's "Approve all" and an Inputs-page change by a scheduler, and a clash replacing a bid, as new-since lines (Approve all and Inputs-page filing were not run; the other six changes were).
3. Scenario 24's admin's own window with a change another admin made (a second admin through the bridge was not built; the admin's own window opened with boxes, W2).
4. An archived and a deleted man's window (26) — not reached from the app's controls in this world.
5. W5 (above).
6. Scenario 16's drag-the-window-over-the-ringed-day case and the window at 2560 wide / the grid zoomed out; the ring beside the dock was walked (L1).
7. Lesson 6 (scroll bars with `--hide-scrollbars` off) and anything only his iPhone draws (the keypad's minus, page zoom on a small box): the walk is Chromium; for his look.
8. The window over the manning bubble, the slim Approvals bar and the OIL tab as floating surfaces (hit tests): only the bid window and the document viewer were hit-tested.

## Errors seen

None — no console error, page error or 4xx at either size in any of the eight scripts.
