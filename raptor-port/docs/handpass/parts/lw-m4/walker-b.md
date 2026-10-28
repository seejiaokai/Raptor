# M4 walk, walker B (the phone, 402 x 874, admin unless said) — 27 Oct 26

Build: bundle `index-CxJcpwed.js` on port 4173 (frozen, not touched). Engines: Chromium (touch, scale 3) for everything; WebKit (Playwright's) for step 1 at 402 only.
Scripts: `raptor-port/scripts/handpass/lw-m4-walk-b-lib.mjs`, `lw-m4-walk-b1.mjs`, `b1b`, `b2`, `b2b`, `b3`, `b3b`, `b5`, `b7`, `b7x` (exploration), `b8`, `b11`, `b11b`, `b12`, `b13`.
Pictures: `raptor-port/docs/img/handpass/2026-10-27-lw-m4/b/` (every tap has its `-q` / `-100ms` picture ~100 ms after the lift and a settled one).
Counts: scenarios 1-11 of the brief: PASS 8, FAIL 2 (1, 7), NOT WALKED 1 (8). Two extra checks of mine: bell beside the drawing PASS, lit-button box FAIL. Total: PASS 9, FAIL 3, NOT WALKED 1.

## Results

| # | size | engine | verdict | pictures | what the picture shows |
|---|---|---|---|---|---|
| 1a tab row with Approvals + count | 402/390/360 | Chromium, WebKit | PASS | s1-*-grid-tabrow.png | Grid · Approvals (count 8) · OIL, gear at the end; no Balances tab |
| 1b filters in three rows (New · All · Jan–May / Jun–Dec / Pick dates… left, Approve all right) | 402, 390, 360 | Chromium | PASS | s1-chromium-402-page-top.png, s1-chromium-390-page-top.png, s1-chromium-360-page-top.png | 3 rows of chips at each size, every chip's words inside its edge, New on one line (36 px high) |
| 1b again at 402 | 402 | WebKit | PASS | s1-webkit-402-page-top.png | same three rows, Approve all 138 px wide, nothing spilling |
| 1c armed "Approve N — tap again" inside the button | 402/390/360 | Chromium | PASS | s1-chromium-402-armed.png (+ -q), s1-chromium-390-armed.png, s1-chromium-360-armed.png | amber button, words inside, still three rows |
| 1c armed | 402 | WebKit | PASS | s1-webkit-402-armed.png (+ -q) | same, button 210 px wide |
| 1d the lit "Approvals" tab holds its count and icon | 402 | Chromium | PASS | s1-chromium-402-page-top.png | badge inside the lit outline |
| 1d same | 390, 360 | Chromium | FAIL | s1b-chromium-390-tabrow-sharp.png, s1b-chromium-360-tabrow-sharp.png | the "8" badge sticks out past the lit outline's right edge (F1) |
| 1d same | 402 | WebKit | FAIL | s1b-webkit-402-tabrow-sharp.png | badge past the right edge, icon on the left edge (F1) |
| 1e date links on one line | 402 | Chromium | PASS | s1-chromium-402-page-top.png | "23 Jan AM ›", "10 Feb AM ›" each on one line |
| 1e same | 390, 360 | Chromium | FAIL | s1-chromium-390-page-top.png, s1-chromium-360-armed.png | "23 Jan AM" and "10 Feb AM" break, the "›" alone on a second line (F2) |
| 1e same | 402 | WebKit | FAIL | s1b-webkit-402-lines-sharp.png, s1-webkit-402-armed.png | same break at his iPhone's engine (F2) |
| 2 Approve all, two touches 33 ms apart (page clock) | 402 | Chromium | PASS | s2b-back-to-back.png, s2-fast-q.png, s2-fast-settled.png | both counted as taps; all 6 lines lit once, count 8→2; ONE Undo brings all 6 back (S2a, S2b, S2h, S2i) |
| 2 two taps 3 s apart | 402 | Chromium | PASS | s2-slow1.png, s2-slow-3s.png, s2-slow2.png | first tap arms and stays armed at 3 s; second approves exactly the 6 shown; one Undo takes all back |
| 2 arm, then a month chip | 402 | Chromium | PASS | s2-arm2.png, s2-monthchip.png | armed → Feb chip → button back to "Approve all 4", nothing lit; the next tap only arms again |
| 3 flick through the list, then Approve | 402 | Chromium | PASS | s3-after-flick1.png, s3b-A-tap-q.png, s3b-A-tap.png | a finger flick with a rest scrolls the page (0→473→696); tapping a line's Approve lights that line only (lit count 1) |
| 3 fling with no rest, then Approve | 402 | Chromium | NOT WALKED | s3-tap.png, s3b-B-tap1.png, s3b-B-tap2.png | the first tap after a no-rest scripted fling lit nothing, the second lit the right line only: the test browser's known swallowed tap (walk-scripts §4), not judged |
| 4 Undo with Approvals up (line low) | 402 | Chromium | PASS | s4-low-before.png, s4-approved.png, s4-undone.png, s4-redone.png | scrollY 63 → 63 → 63 (approve, Undo, Redo); line top 804 → 804; line back to pending in place, lit again on Redo |
| 5 ring on a far cold month, from Approvals | 402 | Chromium | PASS | s5-dates-100ms.png, s5-dates-1000ms.png, s5-dates-1000ms-zoom.png, s5-dates-3000ms.png | 24 Mar: grid at that day, Ranger's cell ringed in the plain blue ring at 0.1 s, 1 s and 3 s, whole ring in sight, first column beside the names (ring's left edge flush with the frozen column, 0 px gap), ring top 420 against the frozen date row's bottom at 274, ring bottom 441 against the slim bar's top at 808 |
| 5 the same from the member's bell | 402 | Chromium | PASS | s5-bell-open.png, s5-bell-tap-100ms.png, s5-bell-1000ms.png, s5-bell-3000ms.png | bell line "Your leave · Tue 24 Mar · LL approved · Saber" → grid at 24 Mar, ringed at 0.1/1/3 s, bell list closed |
| 6 ring's six seconds | 402 | Chromium | PASS | s6-dates-q.png, s6-after-scroll.png, s6-cell-tap-q.png, s6-cell-tap.png, s6-after-6s.png | within 3 s I scrolled the grid sideways and back; the ring followed its cell; tapping the ringed cell opened Ranger's bid window for 26 Mar, the ring stayed while the window was open and was gone after 6 s |
| 7a bubble + slim bar at the foot | 402 | Chromium | FAIL | s7a-window-with-slim.png, s7a-bubble-with-slim.png | a bid for Quill on 15 Jan (IWSO 3 → 2) raised the bubble, but the slim bar stands over it: only an amber sliver shows under the bar (F3) |
| 7b the bid window with the slim bar up | 402 | Chromium | PASS | s7b-window.png, s7b-am-q.png, s7b-am.png | 23 buttons, each the top element at its middle; AM lit when pressed; the window stands over the slim bar (the bar's Back / ✕ are under it until the window closes; it is back at its place afterwards, s7b-closed.png) |
| 7c the grid behind the bar | 402 | Chromium | PASS | s7c-tap-q.png, s7c-tap.png, s7c-scrolled.png | a cell 14 px above the bar opens its bid window; a finger scroll moves the grid (scrollY 377→622) while the bar stays at 808 |
| 8 bell tap with the OIL tab up | 402 | Chromium | NOT WALKED | s8-oil-up.png, s8-bell-open.png | on a phone the OIL tab opens the full-screen "OIL TRACKER" sheet over the whole top bar, so the bell cannot be pressed with OIL up: the scenario cannot be reached through the app's own controls (see Observation O1) |
| 9 Pick dates… | 402 | Chromium | PASS | s9-pick-open.png, s9-pick-day.png, s9-outside.png, s9-escape.png | one day picked (calendar stays open, chip "13 Jan – 13 Jan"); a tap on the heading closes it; reopened, Escape closes it |
| 10 day's list, two entries | 402 | Chromium | PASS | s10-daylist.png | "Placed Ranger · Tue 27 Oct, 19:35" under the morning entry; "Placed Saber · … · Approved Saber · …" (two lines) under the afternoon one; both inside the window, none clipped |
| 11 member: no Approvals tab, no address to it | 402 | Chromium | PASS | s11-member-grid.png, s11-after-addresses.png | tabs drawn: Grid, OIL only; no approvals page in the page; the five addresses tried (#approvals, #/approvals, ?tab=approvals, ?page=approvals, /approvals) show no Approvals (the app has no address per page, a reload shows the sign-in card) |
| 11 Saber, Approvals with slim bar up, name badge → member view | 402 | Chromium | PASS | s11-saber-slim-up.png, s11b-menu.png, s11b-switch-q.png, s11b-switched.png | menu "Signed in as Saber · Admin → Switch to the member view" → grid, no slim bar, no Approvals tab; back to the admin view: tab back, Approvals not reopened (s11b-back-admin.png); same from the Approvals page (s11c-menu.png, s11c-switched.png) |
| X1 bell beside r22-7 (mine) | 402/390/360 | Chromium | PASS | s12-bell-402-sharp.png, s12-bell-390-sharp.png, s12-bell-360-sharp.png | three unread lines (approved, refused, "LL added and approved"), newest on top, every line inside the list and unclipped |
| X2 the lit Approve keeps its box (mine) | 402 | Chromium, WebKit | FAIL | s13-chromium-before.png, s13-chromium-approved.png, s13-webkit-before.png, s13-webkit-approved.png | the lit "Approved" is 8.7 px wider than "Approve" and its left edge moves left (F4) |

## Faults

**F1. The Approvals tab's count badge stands outside its lit outline at 390, 360 and in WebKit 402.** Steps: sign in as Saber, Leave War, press Approvals. Saw: the lit outline ends about 4 px short of the badge's right edge (360: tab 109–199, badge 185–203; 390: tab 119–219, badge 205–223; WebKit 402: tab 123–227, badge 212–230) and, in WebKit, the icon touches the outline's left edge. Expected: the badge and icon inside the ring, as his drawing r22-5-phone.png shows them (ring round icon, word and count). Ruling: D1254, D1420. Pictures: s1b-chromium-360-tabrow-sharp.png, s1b-chromium-390-tabrow-sharp.png, s1b-webkit-402-tabrow-sharp.png. Fine at 402 in Chromium (s1-chromium-402-page-top.png).

**F2. A request's dates break over two lines, the "›" alone on the second, at 390, 360 and in WebKit 402.** Steps: Approvals on the phone, look at the "23 Jan AM ›" and "10 Feb AM ›" lines. Saw: the date text takes about 67–71 px and wraps (box 54 / 30 px tall against 36 / 18); one-day lines like "8 Jan ›" are fine. At 360 the "LOWEST AVAIL" heading also wraps to two lines ("LOWEST / AVAIL") and the date box is only 37 px wide. Expected: his drawing r22-5-phone.png shows "23 Jan AM ›" and "23 Jan PM ›" on one line each. Ruling: D1423, D1420. Pictures: s1-chromium-390-page-top.png, s1-chromium-360-armed.png, s1b-webkit-402-lines-sharp.png. (WebKit here is Playwright's on Windows: its letters differ from his iPhone's, so his phone may or may not break; Chromium at 402 does not.)

**F3. With the slim bar up, the manning bubble is hidden behind it.** Steps: Ranger bids LL Tue 13 Jan; as Saber (Approve what I enter on) place LL on Thu 15 Jan for Reaper, Basher, Echo, Ledger (no bubble); Approvals → Ranger's dates (the grid at 13 Jan, slim bar "Approvals · 7 pending · 1 new Back ▴ ✕" up); tap Quill's cell on 15 Jan, LL. Saw: the bid window said "IWSO 3 → 2 · amber"; after placing, the bubble "This bid: IWSO 3 → 2 Show ›" (box y 816–862) is under the slim bar (y 808–852): the element at the bubble's middle is the slim bar; only a thin amber strip shows beneath the bar and its text and "Show ›" cannot be read or pressed. Expected: nothing overlaps, both readable (the walk's step 7a; D1358: the bubble at the foot of the screen). Pictures: s7a-bubble-with-slim.png (window before: s7a-window-with-slim.png).

**F4. The lit Approve / Approved button grows 8.7 px and its left edge moves when pressed.** Steps: Approvals, press Approve on the first line, then press it again. Saw: Chromium 402: Approve 226.5–303.9 (77.4 wide) → Approved 217.8–303.9 (86.1) → back; WebKit: 217.9–298.3 → 208.9–298.3. The right edge, Refuse and the dates link do not move. Expected: a control pressed again and again stays put (CLAUDE.md "a control the user taps repeatedly must not move"; D1421 says a second tap sends it back). Low severity: the target's right edge holds. Pictures: s13-chromium-before.png, s13-chromium-approved.png, s13-webkit-before.png, s13-webkit-approved.png.

## Observations (not faults unless the host rules so)

- O1 (scenario 8): the OIL tab on a phone is a full-screen sheet ("OIL TRACKER", ✕ at the top right) that covers the top bar, bell included, so "OIL tab up, then the bell" cannot be done on a phone (s8-oil-up.png). My tap at the bell's place landed on the sheet; the next picture shows the grid with the bell's red dot still on (s8-bell-open.png).
- O2: the tab count (8, 9 after more bids) counts the other period's pending too; the page header says "6 pending" and the "+2 pending in JAN – DEC 27 ›" link carries the other two, and the slim bar says "7 pending" when the tab says 9. His drawing has the tab and header equal (15 and 15), the demo had no second period. Not judged.
- O3: "New 0" still shows its cyan dot (his drawing shows the dot with "New 3").
- O4: one picked day reads "13 Jan – 13 Jan" in the chip (s9-pick-day.png).
- O5: the passing "Saving…" note sits over the ⚙ of the top row for a moment after each decision (s2-fast-q.png, s3b-A-tap-q.png); D587 keeps it as it is.
- O6: with the bid window up the slim bar is under the window (Back ▴ and ✕ not reachable until the window closes).
- O7: at 360 the View row's "My leave" chip is cut to "0 pen…" (s1-chromium-360-armed.png); that row is from before M4.
- O8: a run of days next to each other is ONE line (Ranger's 13, 14, 15 Jan came as one "13–15 Jan" line), so my first bell fixture needed non-adjacent days.
- O9: two lines of one person share the line test id (`appr-line-slash` twice), as the brief says (the id is the person's).

## Differences from his drawings

r22-5-phone.png (Approvals) beside s1-chromium-402-page-top.png / s2-fast-q.png:
- Header: the drawing "15 pending · 3 new"; mine "6 pending" with a separate "+2 pending in JAN – DEC 27 ›" link (the brief's other-period link; a data difference) and, with no new request, no "· N new".
- "New 0" has the cyan dot (O3). The chips are 36 px high; the drawing's look a little lower. Otherwise the three rows, the dimmed Mar–May and Jun–Dec chips, "Pick dates…" left, "Approve all N" right (cyan, solid) match.
- Columns DAYS · LVE BAL · LOWEST AVAIL · PLACED and the two-line request (puck · box · dates › · Approve · Refuse, then the figures) match at 402 in Chromium; PLACED reads "—" on the demo's older requests (data). No line of mine carried documents (walker A's), so no paperclip was compared.
- The lit state (Approved green solid, Refuse dimmed) is not drawn there. Tab row: ring round Approvals with its count, Grid · Approvals · OIL, ⚙ at the end: matches at 402 Chromium; F1 at 360/390/WebKit.

r22-6-phone.png (slim bar) beside s5-dates-100ms.png: dot, "Approvals", "· 7 pending · 1 new", "Back ▴" in cyan, ✕ at the right, a rounded bar a little in from both sides at the foot: matches. The drawing's grid shows today's column in the cyan outline and Saber's row marked; mine shows the ringed 24 Mar cell and its date head. The drawing's "Open 8 Jan – 31 Mar" chip is "Open 5 Jan – 31 Mar" in mine (the war's pinned today, data).

r22-7-bell-phone.png (bell) beside s12-bell-402-sharp.png: same layout: blue dot on unread lines, "Your leave" in bold with the date after it, the second line "LL approved · Saber", the age at the right ("now" against the drawing's "5m", data), "Mark all read" at the lower right, list inset from the screen's edges. I did not produce the bidding or "taken back" lines (walker C's cases).

## Console errors

none (no console error, page error or 4xx answer in any run).

## Lessons 6 and 7

Nothing in M4 was handed to the phone itself here: no new scrolling of its own and no keyboard work. The only key pressed was Escape on a hardware keyboard (step 9). Lesson 2's quick flick was done as a scripted touch scroll with a rest before the lift; a no-rest fling is the test browser's swallowed-tap trap and is marked NOT WALKED.
All browsers I started were closed by their scripts; other chrome-headless-shell processes on the PC are the other walkers'.
