# M5a re-walk — only what the fixes touched (29 Oct 26, ~04:30)

Sonnet re-walker, the frozen build of commit ea53c8fcb on 4173 (never rebuilt). Chromium; WebKit where a row says so. Desktop 1536 x 860 at
scale 1.25, phone 402 x 874 (touch, scale 3). Scripts `raptor-port/scripts/handpass/lw-m5a-rewalk-lib.mjs`, `-1.mjs` … `-8.mjs` (+ `-1b … -1e`,
`-7b`, `-7c`, `-2b`, `-3b`); pictures `raptor-port/docs/img/handpass/2026-10-28-lw-m5a/rewalk/<r1 … r8>/` (raw results `r*.json` beside
them). Every world fresh on real storage; the war's today 25 Jan 2026 (20 Dec 2026 for `-3b`; a Playwright fake clock for the midnight run).
Stand-ins: none needed (no lock step). Nothing built, no test run, nothing under `src` touched.

**Result: 54 rows — 49 PASS · 4 FAIL (3 faults) · 1 NOT WALKED.** No console error, page error or 4xx in any run.

## The FAILs, one line each
1. **B-F5 NOT FIXED — the phone's page still scrolls as a whole on Balances:** the document is 994 high on an 874 screen on both engines (the
   Balances page itself ends at 874; 120 more hang below it); a swipe up from the tab row moved the page 75 (tab row under the top bar, 53 → −22);
   Balances after a scrolled grid: same 994/874 (`r7-chromium/p1-balances-rest`, `p2-swipe-from-tab-row`, `p3-balances-after-grid-scroll`;
   `r7b/01-balances`, `02-after-swipe`; `r7-webkit/p1-balances-rest`). Rows 14–15.
2. **Focus does not return to the LVE figure that opened the window:** the figure beside a name is a plain table cell that cannot hold focus
   (`td.figbox`, no tab stop), so after Escape the focus is on the page (BODY); the name, its ✕, a Balances name and My leave all return correctly.
   (`r2b` console output; row 23.)
3. **NEW — after an Escape in a Balances box, the next leaving of that box by anything but Enter drops what was typed, silently:** Saber's box typed
   22, Escape (21 back), typed 23, pressed another box → 21 stays, nothing said (`r1d/70-after-escape-then-leave`); an emptied box left that way
   shows no "Type a figure" either (`r1c/60-second-refusal-other-box`). Without an Escape before, the same leaving saves 23 / says "Type a figure"
   (rows 9). Desktop, Chromium; not tried on a phone. Row 11. Whether the build before the fixes did the same is not known (no old build to run).

## The table — step · size · PASS/FAIL · what the screen said · pictures (folders under `…/rewalk/`)

| # | Step | Size | Verdict | What the screen said | Pictures |
|---|---|---|---|---|---|
| 1 | Triage 1 (A-F3): −998.5, −12.5, 10.5, 123.5 (cf 100), 12.5 typed; every box shows its figure whole | desk | PASS | each text fits its box: −998.5 39.3px of 40, −12.5 36.5/40, 10.5 27/30, 123.5 34.7/40, 12.5 27/30; none cut; opened: "−998.5", "−12.5", "10.5", "123.5", "100" all whole | r1/01-longest-figures, 02-longest-crop |
| 2 | … no column moves (heading and cell lefts/widths of Ranger and Dice, his five boxes, before vs after) | desk | PASS | identical to 0.1px | r1/01-longest-figures |
| 3 | … the same on a phone | 402 | NOT WALKED | no long figure typed on the phone this pass | — |
| 4 | Triage 2 (A-F4): pinned headings, page scrolled 0 / 300 / 1150 / 2400 | desk | PASS | the two heading rows are 193–216 and 216–242: gap 0px, no point inside the block that is not a heading cell (0 of ~1,500 sampled); pixel rows between and round them are only background, the separator lines and the words (opened close-up: no puck, box or figure shows) | r1b/40-scrolled-0/300/1150/2400, r1e/01-heading-close, 03-zoom-lve-top |
| 5 | Triage 3 (A-F2): OIL "0 ›" right-set under its heading | desk | PASS | OIL heading right-set, figures' right edge 0px from it, spread 0px over all 50 lines (opened: the arrows stand under the right of "OIL") | r1/10-hard-cases, 11-oil-crop |
| 6 | Walker A's alignment measure, 50 lines (−998.5, 123.5, 10.5, No grade rows) | desk | PASS | every heading over its figures, 0px, spread 0 on every column; NAME 0; GRADE · AUTO + LVE ON 1 JAN's figures (the grade boxes) start 11px in from the heading's left edge, 0 spread (as before) | r1/10-hard-cases |
| 7 | … Days taken | desk | PASS | all columns 0px | r1/12-taken |
| 8 | … SANS shown (61 lines) | desk | PASS | all columns 0px | r1/13-with-sans |
| 9 | Triage 10 (A-F1): emptied box + Enter / Tab / click on the page / press another box / the view switch / Escape | desk | PASS | "Type a figure" under the box each time, old figure (17.5) kept, no Undo step (Undo stays as it was); Escape: old figure back, no words; the view switch: old figure kept | r1/30-blank-enter, r1b/50-blank-tab, 51-blank-click-away, 52-blank-other-box |
| 10 | … emptied App bal + Enter on a phone, Chromium and WebKit | 402 | PASS ×2 | "Type a figure", x 103–191 (Chromium) / 106–191 (WebKit) of 402, old figure 16 kept | r7-chromium/p6-emptied, r7-webkit/p6-emptied |
| 11 | **After an Escape in a box, leaving it by another box / Tab drops the typed figure** | desk | **FAIL** | see FAIL 3 | r1d/70-after-escape-then-leave, r1c/60-second-refusal-other-box |
| 12 | Triage 4 (B-F2/F3): App bal 17.3 + Enter, Chromium and WebKit | 402 | PASS ×2 | words "Type a whole number or a half, like 17 or 17.5" wrapped on two lines at x 4–244 of 402 and inside the sliding area 0–402; old figure 16 back; picture opened: the words stand under Ranger's row, wholly on the screen | r7-chromium/p4-refused-17.3, r7-webkit/p4-refused-17.3 |
| 13 | … a refusal on CL (the far-right box), both engines | 402 | PASS ×2 | words at x 111–351 of 402 | r7-chromium/p5-refused-CL |
| 14 | **Triage 5 (B-F5): the Balances page does not scroll as a whole; a swipe up from the tab row; Balances after a scrolled grid** | 402 | **FAIL** (Chromium) | document 994 on an 874 screen (Grid tab 1520, Approvals 1425); a swipe up from the tab row: scrollY 75, tab row top 53 → −22; after a grid scrolled 300 and Balances opened: 994/874 | r7-chromium/p1-balances-rest, p2-swipe-from-tab-row, p3-balances-after-grid-scroll; r7b/01-balances, 02-after-swipe |
| 15 | … the same in WebKit | 402 | **FAIL** | document 994 on 874 (Grid 1519), also after the scrolled grid | r7-webkit/p1-balances-rest, p3-balances-after-grid-scroll |
| 16 | Triage 6 (B-F4): a tap on Ranger's PL, CCL, CL box — the box and its amber pending figure in sight | 402 | PASS ×2 engines | PL box x 181–221 with "−0.5" at 224–254; CCL 181–221 / 224–254; CL 311–351 / 354–384; all clear of the names (end 132) and inside 402; picture opened: ring on PL, "−0.5" amber to its right | r7-chromium/p7-tap-PL, p7-tap-CCL, p7-tap-CL (+ -q); r7-webkit/same |
| 17 | Triage 7: the phone's person window under the top bar — My leave (Saber's, 10–392 x 220–654) and a name on Balances (Ranger's, 57–817); both engines | 402 | PASS ×2 | the top bar's lowest edge is 49; the window's top 220 / 57: under it, nothing covered (the drawing has it at about 70: 13px lower than built) | r7-chromium/p8-window, p9-window-from-balances; r7-webkit/same |
| 18 | Triage 8: Escape with the document viewer over the window | desk | PASS | the first Escape closes the viewer (window still open, focus on the paperclip); picture opened: window with its list, no viewer | r2/11-viewer-over-window, 12-after-first-escape |
| 19 | … a second Escape closes the window; focus returns to the name that opened it | desk | PASS | window closed, focus on the opener | r2/13-after-second-escape |
| 20 | Triage 9: a name on the grid, the window's ✕ → focus on the name | desk | PASS | focus on the opener | — |
| 21 | … a name on the Balances page, Escape → focus on the name | desk | PASS | focus on the opener | r2/20-focus-balances |
| 22 | … My leave (Ranger signed in), Escape → focus on My leave | desk | PASS | Ranger's window 948,200–1508,850; focus on My leave | r2/21-my-leave-window |
| 23 | **… the LVE figure beside a name, Escape → focus back on the figure** | desk | **FAIL** | window opened; focus on BODY (the figure is a plain cell, `td`, not focusable) — FAIL 2 | — (`r2b` console) |
| 24 | Walker D 1: Ranger (War bal 12.5), bid window on Wed 4 Feb: LL left 11.5, CCL left 1 | desk | PASS | LL 11.5 · OL 11.5 · CCL 1 · PL 0.5 | r3/01-left-wed-4-feb |
| 25 | … the afternoon only | desk | PASS | LL 12 (−0.5), CCL 1.5 | r3/02-left-wed-4-feb-pm |
| 26 | … a Saturday (7 Feb) | desk | PASS | LL 12.5 (unchanged), CCL 2 | r3/03-left-sat-7-feb |
| 27 | … the drag window over Tue 24 – Wed 25 Feb | desk | PASS | window "Ranger 24–25 Feb · 2 days": LL 10.5 (−2), CCL 0 (the script's own "window open" test was wrong; picture opened: the window is up with LL 10.5, OIL "−2", PL "−0.5", CL "−2" all with the true minus) | r3/04-drag-window |
| 28 | … really placing LL on Wed 4 Feb (approved), then the next weekday | desk | PASS | War bal 12.5 → 11.5; Thu 5 Feb LL left 10.5 | r3/05-left-after |
| 29 | Walker D 1, row 10 (20 Dec 26): Nomad 30; LL 1–12 Feb 27 approved, LL 13–21 pending; Mon 22 Feb LL left | desk | PASS | App 20, Pending −11, War 9; LL left 8 | r3b/06-row10-left-22-feb |
| 30 | Walker D 2: Vapor typed −2 — the Balances box and War bal, the window's box and War bal, the grid's figure | desk | PASS | all "−2" with U+2212; the grid's figure code points U+2212 U+0032 | r3b/03-grid-negative |
| 31 | … the below-zero ask (Saint: War bal 10; LL Sat 13 – Sun 21 Feb 27) | desk | PASS | "That takes Saint to −1 LVE. Tap the same leave again to go ahead." (picture opened: the real minus; the buttons read "−1", "−5") | r3b/04-below-zero-ask |
| 32 | … after the second press, the grid's figure beside Saint | desk | PASS | "−1 21" with the true minus | r3b/05-grid-after-second-press |
| 33 | Walker D 3: the person window left open across midnight on 31 Dec (fake clock, no touch) — figures | desk | PASS | 37 incl. 4 → 69 incl. 33; "5 taken" → "0 taken" | r6/01-before-midnight, 02-after-midnight |
| 34 | … the year picker and the lines | desk | PASS | picker "2027 and ahead" (options "2027 and ahead", "2026"); the eight 2026 lines gone from the list (0 lines) | r6/02-after-midnight |
| 35 | … "2026" one pick away; reopened window the same | desk | PASS | 2026 picked: the 8 lines are back; closed and reopened: picker and 0 lines as the open one | r6/03-picked-2026 |
| 36 | Walker D 4: carried fwd 25 beside App bal 20 | desk | PASS | clamped: incl. 20, App 20, saved (Undo tip "LVE carried fwd 0 → 20"), no refusal words | r3b/01-cf-25 |
| 37 | … carried fwd 20 typed over a 20 already shown | desk | PASS | nothing saved: the Undo tip is unchanged | — |
| 38 | … carried fwd −3 | desk | PASS | saved 0 | r3b/02-cf-minus3 |
| 39 | Code read 1: rename Ops A → Ops B, Undo | desk | PASS | the sheet reads "Ops A · 3 people" again | — |
| 40 | … reload (signed out, signed in again) | desk | PASS | "Ops A" on the sheet and "Ops A +14" in the three holders' grade boxes | r4/01-after-reload-grades |
| 41 | … delete Junior WSO (11 people hold it), Undo, reload | desk | PASS | gone with 12 "No grade" boxes (11 holders + one man who had none before); after Undo and after the reload: the grade "Junior WSO · 11 people" and 1 "No grade" box (the man who never had one) | r4/02-delete-undo-reload |
| 42 | Code read 2: Ranger opens his window (visit), Saber deletes his approved LL 19–21 Jan on the Inputs page | desk | PASS | the row was found and deleted (no "all people" ask) | r4/10-ranger-before, 11-inputs-list, 12-input-window, 13-after-delete |
| 43 | … Ranger opens his window | desk | PASS | the 19–21 Jan line is struck through, wears a cyan dot, kind box "LL", "3 Deleted", under it "deleted by Saber · 29 Oct 03:49" (picture opened); the other lines have no dot | r4/14-ranger-after, 15-ranger-after-crop |
| 44 | … close and reopen | desk | PASS | the struck line and every dot gone | — |
| 45 | Code read 3: AM LL (approved) + PM CL (pending) on Tue 21 Apr; Ranger opens his window; Saber re-types the CL half to FCL (the day's list has no re-type, so through the drag window over 21–22 Apr with PM lit); Ranger reopens | desk | PASS | picture opened: only the FCL line "Tue 21 – Wed 22 Apr · 1 Pending · changed from CL by Saber · 29 Oct 03:54" wears the dot; the "LL Tue 21 Apr, AM · 0.5 Approved" line above it has none. (The script's own DOM readout said the LL line was dotted: both lines share the test id `pw-line-2026-04-21`, so its dot lookup found the FCL line's.) | r5/06b-ranger-scrolled-to-21-apr, 03b-drag-window-pm |
| 46 | E2E fixer: the person window from a name on the grid stands wholly on screen; after a Tab | desk | PASS ×2 | 948,200–1508,850 of 1536 x 860, both times (focus on its ✕) | r2/01-window-from-grid, 02-window-after-tab |
| 47 | … from a name on the Balances page; after a Tab | desk | PASS ×2 | 968,121–1528,850 both times | r2/03-window-from-balances, 04-window-balances-tab |
| 48 | … the Grades window from Balances, after a Tab, and through Grid → Balances → Grades… | desk | PASS ×3 | 828,191–1298,541 each time (focus on the first grade name after the Tab) | r2/05-grades-window, 06-grades-after-tab |
| 49 | … the person window above Approvals' slim bar (Grid reached from a request's dates, then a name) | desk | PASS ×2 | slim bar 595–941 x 794–838; window 948,65–1508,786: its foot 8px above the bar's top; nothing over the bar | r2/07-window-above-slim-bar |
| 50 | E2E fixer: the four-tab row at 320 — admin (OIL pressable, ⚙ not over it) and member | 320 | PASS ×2 | admin: tabs 12–258, ⚙ 268–312, page 320/320, "13" inside its tab; member: Grid · Balances · OIL, 12–308, no ⚙ (opened: one line, ⚙ clear of OIL) | r8/admin-tabs-320, member-tabs-320 |
| 51 | … a press on OIL at 320 (admin and member) | 320 | PASS ×2 | the OIL tracker opens (OIL tab selected), Settings does not | r8/admin-oil-pressed-320, member-oil-pressed-320 |
| 52 | … the tab row at 701 / 720 / 760 / 820 | 701–820 | PASS ×4 | one line; icons dropped at 701, 720, 760 and back at 820; "13" inside its tab; ⚙ whole and inside the page (e.g. 720: ⚙ 656–700) (opened 720: one line, nothing cut) | r8/admin-tabs-701, -720, -760, -820 |
| 53 | … a press on OIL at 720 | 720 | PASS | the OIL tracker opens, not Settings | r8/admin-oil-pressed-720 |
| 54 | Walker B's tab row again: 402 (icons kept), 390 and 375 (icons dropped), Chromium and WebKit; one line, ⚙ clear, page not wider | 402/390/375 | PASS ×6 | 402: tabs 16–334, ⚙ 346–390; 390: ⚙ 334–378; 375: ⚙ 319–363 (opened 375: Grid · Approvals 13 · Balances · OIL, no icons, one line); the 390 icons follow reading 13 (as built) | r7-chromium/t1-tabs-402, -390, -375; r7-webkit/same |

## Seen, not judged (the host decides)
- At 720 wide the "My leave" box beside the tabs is squeezed to "MY…  LVE 17.5 · …" (`r8/admin-tabs-720`) — the wider four-tab row (701–760) takes its room.
- Two lines of one person that begin on the same date (the AM LL and the FCL that starts 21 Apr) share the test id `pw-line-<first date>` (and its `-dot` / `-who`),
  so a script reading the dot by test id finds the wrong line; the screen itself is right.
- On Ranger's very first visit, lines Saber had placed before it already read "added and approved by Saber · 29 Oct 03:50" (the walkers' first-visit
  runs had only seed lines): not judged against "since his last visit" for a man with no earlier visit.
- On the phone the person window from Balances stands 57–817 where the drawing `m5a-p4-phone-own` has its top at about 70 and 8px side margins (built 10px).

Rulings: none this session.
