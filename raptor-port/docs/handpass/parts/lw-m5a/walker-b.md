# M5a walk — walker B, the phone (admin and member; Chromium and WebKit) — 29 Oct 26

Walker: Sonnet 5.5 (D787, D588). Build: the frozen `dist` of commit 92b43acf9 on port 4173. Sizes: phone 402 × 874 (touch, scale 3);
the tab row also at 390 and 375. Browsers: Chromium (CDP touch for slides and pinches) and WebKit (Playwright's iPhone 13 mobile
context at 402 wide; no CDP there, so taps are clicks and the slide is a scroll of the sliding block). The war's today 25 Jan 2026.
Scripts: `raptor-port/scripts/handpass/lw-m5a-walk-b-lib.mjs` (helpers copied from the host's probe) and `lw-m5a-walk-b1` … `b10.mjs`
(b0 was a look at the page's structure). Pictures: `raptor-port/docs/img/handpass/2026-10-28-lw-m5a/b/` (every phone press also has its
`-q` picture ~100 ms after the lift; its settled picture beside it). Raw results `b1.json`, `b3.json`, `b4.json`, `b5.json`, `b6.json`,
`b7.json`, `b9.json`, `b10.json` in the same folder (a re-run overwrites its file; `b3`, `b5` and `b9` hold the last run — `b9` only its window step).

**Counts: 76 PASS · 5 FAIL · 8 NOT WALKED** (89 checks). No console error, page error or 4xx in any context (Chromium or WebKit).

## FAILs (each one line; the host reproduces and decides)

1. **The tab row at 390 drops its icons** — the brief and the drawing set say kept at 390, dropped at 375. Measured by a width sweep: the icons
   go between 400 and 396 wide. (Icons kept at 390 would not fit: at 402 the four tabs end at 334 and ⚙ stands 346–390, so 390 would
   overflow by about 12 px.) `t1-tabs-390`, `t1-tabs-390-balances`; 402 and 375 are right.
2. **A refused figure's words are cut off at the screen's left edge, and cover the next row** — Ranger's App bal box, 17.3 + Enter: "Type a whole
   number or a half, like 17 or 17.5" is drawn from x −49 to 191, so "Type a" and "17.5" are off the screen, and it stands over Saber's row.
   Chromium `p4-refused-17.3`; same in WebKit `w-b3-refused`. (The carried-fwd refusal "Carried forward is from 0 to 16" stays in view — `p4-cf-40`.)
3. (the same fault in WebKit, counted once more as its own check.)
4. **Tapping the PL box cuts the amber pending figure beside it** — Ranger's PL "2 −0.5": the page slides only far enough for the box, so "−0.5"
   is cut at the right edge ("−0."). The figure the typed number changes is half out of sight (lesson 3). `p2-tap-bal-PL-bane`.
5. **On the Balances page the window itself scrolls, 120 points more than the screen** — the page is 994 high on an 874 screen (the Grid tab,
   Approvals and OIL are taller anyway). A swipe that starts on the tab row or My leave scrolls the whole page 75: the tab row goes under the
   top bar and an empty dark strip is left at the foot of the sliding block. Opening a person window from a low row scrolled it the same way
   (`k-glass`, the strip below the rows). `y-window-scroll`, `k-glass`. The member's page is the same height.

## Table

Size 402 unless said. "(W)" = WebKit.

| Scenario | Size | Verdict | What the screen said | Pictures |
|---|---|---|---|---|
| 36 tab row, admin | 402 | PASS | Grid · Approvals 13 · Balances · OIL, icons kept, ⚙ at x 346–390, one line, page 402 wide | t1-tabs-402 |
| 36 tab row, admin | 390 | **FAIL** | same words, icons dropped; ⚙ 334–378 (finding 1) | t1-tabs-390, t1-tabs-390-balances |
| 36 tab row, admin | 375 | PASS | icons dropped, Balances boxed, ⚙ 319–363, one line — as `m5b-b5-tabs-375-noicons` | t1-tabs-375, t1-tabs-375-balances |
| 36 member's three tabs | 375 | PASS (reading) | Grid · Balances · OIL, no icons, no ⚙, stretched over the row; by the admin's drawing only (no member drawing at 375) | t1-tabs-375-member |
| 36 tab row (W) | 402 / 375 | PASS / PASS | icons kept / dropped, one line, no sideways page | w-t1-tabs-402, w-t1-tabs-375 |
| 2 Balances page at rest, Ranger | 402 / (W) | PASS / PASS | App bal 15, carried 2, Pending −2.5 (amber), War bal 12.5, OIL 0 ›, Senior pilot +36; CCL 3 −1, FCL 5, PL 2 −0.5, EL 4, CL 1 −1; 7 boxes | x-rest, t2-rest, w-b1-rest |
| 32 a quick flick sideways | 402 | PASS | scrollLeft 0→225 of 416, vertical 0→0, names column left 0, heading row top 193 held | t3a-flick-left |
| 32 a slow drag back | 402 | PASS | 225→0, names left 0 | t3b-slow-back |
| 32 a diagonal swipe | 402 | PASS (measured; the feel is his phone's) | left 0→199 and top 0→170 together, window 0; names and headings held | t3c-diagonal |
| 32 vertical scroll holds the heading row | 402 | PASS | top 170→555, heading top 193 unchanged | t3d-down |
| 32 slid, and slid then down: names stay, headings follow (W) | 402 | PASS / PASS | names left 0, heading row left −225, top 194 held, window 0 | w-b2-slid, w-b2-slid-down |
| 2/4 pinch together, quick (fingers 260→90) | 402 | PASS | zoom 0.491, scroll width 402 = screen: every column on screen; window not scrolled, page zoom 1 | t4a-pinch-together |
| 2/4 pinch apart, quick | 402 | PASS | zoom 1.4, scroll 372; names and heading held | t4b-pinch-apart |
| 2 a SLOW pinch together / apart (40 steps over 1.2 s) | 402 | PASS / PASS | same zooms (0.491, 1.4); names left 0, heading top 193 | v1-slow-pinch-together, v1-slow-pinch-apart |
| 5 a tap on a box at the pinched-out resting place | 402 | PASS | box 27 × 15 at x 67, y 324, ring on it, zoom held; computed letters 14 px, drawn at 0.49 (his iPhone: see the list below) | v1-tap-pinched-q, v1-tap-pinched |
| 3 typed 16 + Enter at the pinched-out size | 402 | PASS | App bal 16, War bal 13.5 | v1-typed-pinched |
| F padlock on, then off (admin) | 402 / (W) | PASS ×3 | aria "Lock for members: off" → "Locked for members" → off; open padlock unlit → closed padlock lit cyan; admin keeps his 7 boxes | p1-lock-on-q, p1-lock-on, p1-lock-on-bar, p1-lock-off-q, p1-lock-off-again, w-b5-lock-on |
| 29 a tap on each of Ranger's 7 boxes (App bal, carried, CCL, FCL, PL, EL, CL) | 402 | PASS ×7 (box in sight; the PL case is finding 4) | each focused, top element is the box, clear of the names column (ends x 132) and the heading row (ends y 221); the page slides to 222 or 416 for the far ones | p2-tap-bal-*-bane(-q) |
| 29 Tab through the row | 402 | PASS | App bal → carried → OIL › → CCL → FCL → PL → EL, each in sight | p2-tab-3, p2-tab-6 |
| 29 a tap on CL (W) | 402 | PASS | box x 311–351 beside names ending 132, scroll 416 | w-b4-CL-tapped |
| 5 box against the keys — a Chromium STAND-IN only (the screen shortened to 574, keys 300 high): App bal, CL, and the LAST row of the page | 402 | PASS ×3 | the low row rose from y 834–864 to 536–566, above the keys, below the heading row (ends 221); his iPhone pans instead (list below) | p3-keys-bal-LVE-bane, p3-keys-bal-CL-bane, p3-low-row-before, p3-low-row-keys |
| 3 typed 16 + Enter / (W) | 402 | PASS / PASS | App bal 16, War bal 13.5, carried 2, pending −2.5; focus stays in the box | p4-typed-16, w-b3-typed |
| 19 a refused 17.3 | 402 / (W) | **FAIL** / **FAIL** | red outline, old figure 16 back, words cut at the left edge (finding 2) | p4-refused-17.3, w-b3-refused |
| 19 Escape after the refusal | 402 | PASS | words gone, box 16 | p4-after-escape |
| 5d carried fwd 40 over App bal 16 | 402 | PASS | refused, "Carried forward is from 0 to 16", the box keeps 2 (the designer's reading 5d said clamped; the brief says refused — words as built) | p4-cf-40 |
| 3 a figure off screen to the right: CL typed 2 | 402 | PASS | CL "2 −1", War bal and App bal unchanged (another kind); Undo puts "1 −1" back | p5-CL-q, p5-CL-typed-noenter, p5-CL-entered |
| 17 a typed figure (19, no Enter) then the view switch pressed | 402 | PASS | saved to Ranger on leaving the box: App bal 19, War bal 16.5; Undo back | p5-tapaway |
| D Days taken on a phone | 402 | PASS | LL OL OIL CCL FCL PL EL CL MED CSE OD; no period heading; Ranger LL 3; the kinds slide sideways, names stay | p6-taken, p6-taken-slid |
| 28 Find a person "rec" | 402 | PASS (reading) | the page shows only Recon's row (filtered, not scrolled to and marked), below the heading row | p7-search-open, p7-search-rec, p7-search-esc |
| 41 Grades window (admin) | 402 | PASS | five grades, "AUTO + LVE ON 1 JAN" on two lines inside the window, "JAN" not cut — the candidate the host saw is fixed in this build | p8-grades |
| 30 every heading against its figures on every line, 50 rows (pilot, WSO, ground, OCU "O") | 402 / 375 | PASS | boxes: the offset from the heading's centre is the same on all 50 rows (spread 0); read-only figures (Pending, War bal, OIL) end where their heading ends (right edge 0 on every row). Headings sit 8–15 px left/right of the box centres (the amber pending figure is part of each column) — as the drawing | a-admin-402-bal, a-admin-375-bal |
| 30 Days taken columns | 402 / 375 | PASS | cell centres within 0.3 px of each other down every column | a-admin-402-taken, a-admin-375-taken |
| 14/24 My leave opens his own window, first visit (Ranger) | 402 | PASS | in the middle (x 10–392, y 45–829), tiles 3 taken · App bal 15 · Pending −2.5 · War bal 12.5 · incl. 2 carried fwd · till 31 Dec; OIL 0 ›, MED 0; 8 lines, no dots; 7 boxes | q1-myleave-q, q1-own-first |
| 50 Saber approves one and refuses one, then Ranger's window | 402 | PASS | two dots: "Thu 29 Jan, AM … approved by Saber · 29 Oct 01:57" and "Thu 12 – Fri 13 Feb … refused by Saber · 29 Oct 01:57"; the other six lines not dotted; tile App bal 14.5, Pending 0, War bal 14.5 | q2-approved, q2-refused, q3-name-q, q3-own-dots, q3-own-dots-scrolled |
| 50 close and reopen / reload | 402 | PASS / PASS | no dots either time (the reload signs him out; signed in again) | q3-own-reopen, q3-own-after-reload |
| 24 another man's window (Recon, member signed in) | 402 | PASS | read only (0 boxes), tiles 31 · incl. 3 · OIL 0 › · MED 0, "No leave in 2026 and ahead.", in the middle (y 220–654) | q4-other-q, q4-other |
| 24 OIL › in another man's window | 402 | PASS | opens the OIL tab; the window closes | q4-oil-q, q4-oil-tracker |
| 42/24 his own window, locked (Chromium / WebKit) | 402 | PASS / PASS | 0 boxes, "Locked by admin" beside "BALANCES" | q5-locked-q, q5-locked-own-window, w-m3-locked-window |
| 14 the admin's window from a name on Balances (W) | 402 | PASS | Ranger, x 10–392, y 45–829, 7 boxes, 8 lines | w-c1-own-window |
| 25 the window for a pilot, a WSO (Basher), an OCU man (Recon), ground (Cotter, Widget) | 402 | PASS ×5 | the same tile places for every kind (LVE x 31, OIL 237, MED 306; the five small tiles at 31 · 100 · 169 · 237 · 306); the heading name is plain text, no puck | k-bane, k-glass, k-prism, k-spanner, k-gizmo |
| 1/42 member, unlocked (Chromium / WebKit) | 402 | PASS / PASS | tabs Grid · Balances · OIL (icons, no ⚙); his row 7 boxes; Saber's row 0 boxes (17.5 1 0 0 0 0 0); no Grades, no padlock; his grade as words "Senior pilot · +36" | r1-member-unlocked, w-m1-member |
| 42 a tap on his grade words | 402 | PASS | no list, no window | r1-grade-tap-q, r1-grade-tap |
| 45 member types LVE 21, carried 3, CL 2; reload; Saber reads | 402 | PASS / PASS | row reads 21 · 3 · CL "2 −1", War bal 18.5, before and after the reload | r2-member-wrote, r2-admin-reads |
| 46 type 22, Undo, Redo (unlocked) | 402 | PASS | 22 → 21 → 22 | — |
| 1/5 member, locked (the lock through the localhost bridge, see below) | 402 / (W) | PASS / PASS | "Locked by admin" on a slim line (y 195–225) between the page bar and the heading row; every figure read only; boxes 0 | r4-member-locked, w-m2-locked |
| 44 the unlock arrives live | 402 | PASS | his 7 boxes back without reopening the page, the line gone | — |
| 44 the lock lands under a typed figure (16, no Enter) | 402 | PASS | the box goes, App bal stays 22, an amber note at the foot "Ranger LVE App bal not saved: Locked by admin" he can read; no box is left for a real Enter | r4-lock-under-box |
| 14 a tap on a leave line | 402 | PASS | the window closes, the Grid tab opens with the just-added ring on a day | r5-line-tap-q, r5-line-tap |
| 31/D1281 pinned cells under a press (pictures opened) | 402 | PASS | the padlock, a box and the view switch pressed: no tint, no see-through cell, no shifted box in the −q pictures (the "Saving…" note stands over ⚙ for a moment after the padlock press, as the probe saw) | p1-lock-on-q, p2-tap-bal-CCL-bane-q, p2-tap-bal-PL-bane-q |
| 6 classic scroll bars (Chromium started without `--hide-scrollbars`, non-mobile 402 context) | 402 | PASS (reading) | the sliding block hides its own bars by its own rule (`scrollbar-width: none`); the only bar drawn is the window's (finding 5's 120 points). The person window has no scroller | z-bars-balances, z-bars-slid, z-bars-window |
| errors, every context | 402 | PASS / PASS | none (Chromium) / none (WebKit) | — |
| 46 his Undo while locked is refused, then accepted when unlocked | 402 | **NOT WALKED** ×2 | **Set-up limit:** the bridge writes the lock as a step in HIS OWN undo list, so his Undo meets the lock step first ("Switch back to the admin view to undo that.") and his earlier figure cannot be reached; the real case needs the lock in the admin's list. Seen: that note, and that Undo/Redo work unlocked | r3-undo-while-locked, r3-undo-after-unlock |
| 36 the admin switched to member view (D292) with Balances up | — | NOT WALKED | not reached in the time | — |
| 23 the paperclip opens the document over the window | — | NOT WALKED | Ranger's seeded leaves carry no document in this world; filing one on the phone was not built into the walk | — |
| 15 a leave line for a man with no row (SANS off the war) | — | NOT WALKED | walker C's ways in | — |
| 22 every kind of leave line (OL, OIL taken, FCL, PL, EL, a deleted line struck) | — | NOT WALKED | only LL, CCL, PL, CL in all three states (Approved, Pending, Refused, half day "Thu 29 Jan, AM") were on screen; the others need a set-up not made | — |
| 43 an approval lands while his box is open, then Enter | — | NOT WALKED | not reached | — |
| 49 no bell line for a balance change | — | NOT WALKED | not reached | — |

## The lock stand-in

The admin's lock flipped while the member is signed in is **`lockViaBridge` of the host's probe (copied into `lw-m5a-walk-b-lib.mjs`): the stand-in for the
other person** — the localhost bridge has no function for the lock; the helper reaches the store's own lock writer through the bridge's role switches in one
synchronous call. Its limits met here: the change lands in the member's own Undo list (see the two NOT WALKED rows), and a lock under an open box takes the box away. The padlock
presses themselves (admin on / off, with its −q pictures) are real taps.

## Differences from each drawing (the host decides which are faults; none has a person's name in it)

- **`m5b-b5-tabs-402`**: none seen beyond the render — tabs 198–282 for Balances against the drawing's 198–282, ⚙ 346–390. 
- **`m5b-b5-tabs-375-noicons`**: none — no icons, Balances boxed, ⚙ at the right.
- **`m5b-b2-rest`**: none of size, place, words or colour (the drawing's pink caption is an annotation). The drawing's Ranger row and the build's read alike.
- **`m5b-b2-slid`**: the build shows the OIL column beside the names where the drawing has slid on to CCL (a scroll amount, not a design difference); the build's heading row holds its place and the names stay as drawn.
- **`m5b-b2-pinch`**: none seen; the build's zoom is 0.491 and every column fits.
- **`m5b-b3-phone`** (Days taken): none; columns LL OL OIL CCL FCL PL … as drawn.
- **`m5c-c2-phones`** (member unlocked / locked): none; the "Locked by admin" slim line sits where drawn.
- **`m5c-c3-lock-phone`**: none; open padlock unlit, closed padlock lit cyan.
- **`m5a-p4-phone-own`, `m5a-p5-phone-locked`** (his own window): (1) the leave lines are rounded cards, each with a 3 px cyan bar at its left on **every** line (every line is a link that takes the grid there), where the drawing has plain rows divided by thin lines and no bar; (2) the window's top stands at y 33–45, over the lower edge of the top bar (the bar ends at 49), where the drawing's stands at about y 70, under the bar with the tab row's top showing; (3) no paperclip on the first line (the fixture has no document); (4) a dotted line's words read "approved by Saber · 29 Oct 01:57" where the drawing reads "yesterday 08:40" — the change was made on the real clock (29 Oct) while the war's day was pinned at 25 Jan 2026, so the ages did not read as "yesterday"; (5) the drawing's struck-through "Deleted" line was not exercised.
- **`m5a-p6-phone-other`**: none seen of size, place or words — read only, tiles in the same places; the build's window stands lower because Recon has no leave lines.

## What only his iPhone can show (for the host to ask him)

1. **The keys over a box.** The Chromium stand-in (screen shortened) lifted the low row's box above the keys; his iPhone keeps the page tall and pans the visible screen, so only his phone says whether the box he taps rests above the keys with nothing over it (lesson 5, D1412).
2. **A page zoom on a tap.** Every box on the Balances page and in the person window draws its figure at 14 px, and the page's viewport allows zooming; Safari zooms the whole page when a box under 16 px is focused. At the pinched-out size the boxes are 27 × 15 px and drawn at 0.49. Ask whether a tap on a box zooms his screen, at rest and pinched out.
3. **The minus sign.** A figure below zero may be typed (−2); his decimal keypad has no minus key. Ask whether the App bal box offers one.
4. **The feel of the slide and the pinch:** a flick, a slow drag, a diagonal swipe (which slid both ways at once here), a slow and a quick pinch; and whether a swipe that starts on the tab row or My leave scrolls the whole page (finding 5).
5. **His fonts.** WebKit's fonts here are not Apple's: "My leave" read "0 pendi…" cut at the right in WebKit. Ask whether "LVE 12.5 · OIL 0 · 5 pending" fits on his phone with a three-figure balance.
6. **The overlay scroll bars** his iPhone draws while he scrolls — the app hides its own, so nothing more is expected, but only his phone draws them.
7. The "Saving…" note over ⚙ for a moment after the padlock (the probe's observation) — how it looks there.

## Other notes

- A refused figure writes no Undo step (Undo took back only the earlier 16); the lock **is** an Undo step (an Undo after a lock press turned the padlock back on).
- Find a person filters the page to the matching rows; it does not scroll to the row and mark it as the scenario's reading ("brought into sight, marked") has it.
- Ground personnel's pucks on the Balances page carry no chip at all (D1470 says "G" on the Leave War grid); not compared with the grid.
- Scenarios 9, 10, 11, 12, 21, 26, 27, 33–35, 37–40, 47, 48, 52–56 are desktop or walker A, C and D's, and not walked here (Undo's scroll position was only seen at 0 / 0 on the phone).
- The page behind a person window opened from a low row on the phone had slid under the bar (finding 5).

## Errors seen

None — no console error, page error or 4xx in the Chromium and WebKit contexts.
