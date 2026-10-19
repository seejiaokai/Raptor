# [STANDBY-FLIES] — Walker B's report (phone, by finger; 19 Oct 26)

**Build walked:** `http://localhost:4322/`, bundle `index-BTbomYbk.js` (proved by every script before it ran). **Device:** Chromium touch
emulation, 402 x 874, `isMobile`, `hasTouch`, deviceScaleFactor 3 — NOT WebKit, not his iPhone. Taps are `page.touchscreen.tap` at the
element's centre after proving it on screen and not covered (`tapEl` in `scripts/handpass/sf-B-lib.mjs`); the week's day pages are
turned with a real touch swipe (the finger rests before it lifts). **Day 5 (Saturday)** of the boot week. "Pub Sat" = published through
the app (four sign-off selects set with `selectOption`, then a finger tap on "Publish day").
**Set-up not under test** (declared): `addWave` for the standby waves and `fillSlot` for seating, except where a step says it was
done by finger; the "+ Wave → BB" route in scenario 8 was done by finger.
**The typing trap:** every box was typed by a finger tap into the box and `keyboard.type`; after EVERY typing step I read
`visualViewport.scale` — it was 1 and offset 0 every time (no zoom happened in this emulation), and the pictures I opened show an
unzoomed page. A real iPhone zooms on a focused small box; this emulation does not, so that part stays for his phone.
**Browser error list:** empty in every run (console errors, page errors, HTTP 4xx).
Pictures: `docs/img/handpass/2026-10-19-standby-flies/walk/B/`. Scripts: `scripts/handpass/sf-B-*.mjs` (`sf-B-s2`, `-s5`, `-s8`, `-s9`,
`-s16`, `-s16b`, `-s21`, `-bt`; helpers `-lib`, `-lib2`; `-probe*` are exploration only).

**Totals: PASS 41, FAIL 2 (+1 low stale-words fault), RECORD 9, NOT WALKED 2 (see the end).**

## Faults found

**F1 — FAIL (phone): the new "✓ FLIES" chip squeezes the MAIN / SPARE badge and itself into a stack of 2-3-letter lines on Edit Schedule's week and View-only Sched.**
Where: Edit Schedule's week and View-only Sched, a row that flies (SC AM with R typed, AVALON with R typed, a hand-ticked SPARE), in the narrow
remarks cell. Seen: the badge reads "M / AI / N" and "SP / AR / E", the chip "✓ / FLI / ES" (a 33 x 36 box, three lines each). A row of the
same shift that does NOT fly (SC PM MAIN, no chip) keeps its badge on one line, so the chip is what breaks it. Same on the member's
View-only Sched (B-21-3). On the board (stacked) the badge and chip sit on one line and read fine (B-9-2).
Steps: phone, add an SC wave on Saturday, seat a row, type R 06:30 on the board, close the board, Edit Schedule, swipe to Saturday.
Pictures: `B-5-6-week-empty-shift.png`, `B-9-4-week-sc.png`, `B-2-6-week-sat-lit.png`, `B-21-3-member-board.png` (the member's View-only page).
A scheduler on a phone cannot read MAIN / SPARE or FLIES on a flying row in the week.

**F2 — FAIL (phone): a finger tap on the amber "BB SHIFT flies but has no START or END" line does not land on the START box (SF9).**
Steps: Pub Sat, + Wave → BB (by finger), seat two rows, type R 08:00 on the board, open the warning fold, tap the amber line.
Seen: the page does not scroll (START box top at 953 px on an 874 px screen before AND after), nothing takes focus (active element stays the
page body), the START box's class is unchanged; the only effect is that 47 pucks turn dim (the ordinary "light the crew" dimming, with no crew
to light). A mouse click on the same line at 1440 wide does the same (a diagnostic, `sf-B-probe13`): dims pucks, no landing. Pictures:
`B-8-4-bb-amber-tap-lands.png` (page unchanged after the tap). A tap on another warning line ("long work day") also moved nothing on the phone
(`sf-B-probe12`), so the line's jump may simply not scroll on the board at all — the host should compare with how the jump behaves on an
old line before blaming only the new one. The expected result in the brief ("lands on the START box") is not met.

**F3 — low, stale words (RECORD-grade, counted separately):** the + Wave picker still says "SC · AVALON · BB sit outside the day's flying
count — two waves of four plus an SC reads 4 X 4 / 2" (picture `B-9-7-wave-menu-note.png`), and every AVALON / BB wave head on the week and
View-only Sched (also when the shift flies) still reads "STANDALONE · AVAILABILITY, CURRENCY AND SEAT CHECKS ONLY" (`B-2-6-week-sat-lit.png`,
`B-21-3-member-board.png`). With D1044-D1046 a flying standby shift IS in the count and gets the full checks, so both sentences are now wrong.

## Scenario 2 — AVALON overnight that flies, and Sunday's crew rest (phone part)
Set-up: Saturday AVALON NIGHT 19:00-07:00, rows 1-2 MAIN, 3-4 SPARE seated (Drifter row 3, **Ace row 4**); Sunday flying line, take-off 09:00 typed by finger, Ace on it; Pub Sat.

| Step | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| 2-1 Pub Sat, AVALON standing by, no R | 4 dashed FLIES buttons | 4 chips "FLIES", all buttons; each 42 x 13 css px (a thin tap target on a phone, tap worked); chip row of "14 changes" | PASS | B-2-1-board-dashed.png |
| 2-2 type R 18:30 (finger) | all 4 rows lit, not buttons; a pending change | 4 lit "✓ FLIES" non-button spans, title says "Flies: this shift has its B or R typed. A row that does not come in is cancelled with CX."; chip "1 pending"; page not zoomed (scale 1) | PASS | B-2-2-board-lit.png |
| 2-3 Saturday warning list | long-day note per man | 8 lines "X has a long work day: 12h30, 18:30 → 07:00" (all 8 seated people) | RECORD | B-2-3-board-sat-warnings.png |
| 2-4 Sunday board (› by finger) | Ace's seat red for crew rest, sentence naming the AVALON shift and 07:00 end | Ace's puck red ("puck sm warn hard boxred", title "Crew rest breach (<12h)"); sentence "Ace — Crew rest breach — Saturday ended 07:00 → crew rest clear at 19:00, but told to report 06:40 — 0h20 before his Sunday duty ends." It names the 07:00 end but says "Saturday", not AVALON | PASS (the ring and the 07:00 end); the sentence never says AVALON | B-2-4-board-sun-warnings.png, B-2-5-board-sun-ace.png |
| 2-5 week (swiped to Saturday) | 4 lit chips, not buttons | 4 lit non-button chips; badge "4" (was "0 / 4"-style standby before R) | PASS for presence; **legibility FAIL = F1** | B-2-6-week-sat-lit.png |
| 2-6 week, Sunday | Ace's puck ringed red | Ace's puck red ("Crew rest breach (<12h)") in the week; his Saturday AVALON puck wears a note ring "Crew rest — Sunday is broken by this day: he had to leave by 18:40 · earns a full day of OIL" | PASS | B-2-7-week-sun-ace.png |
| 2-7 clear R (finger) | 4 dashed again, back to normal | R "" stored, 4 FLIES buttons, "16 changes" | PASS | B-2-8-board-cleared.png |
| 2-8 Sunday after clearing | Ace clean | Ace pucks "puck sm" only (no red) | PASS | B-2-9-board-sun-clean.png |
Not walked in 2 (desktop part, or no phone route): OIL Earn's 18:30-07:00 window, the next-week Monday case, the weekday repeat.

## Scenario 5 — the empty-row count rule (read on the week's day heading; Insights is not on the phone)
Set-up: SC wave, two MAIN seated on SC AM, SPARE empty; R 06:30 typed on the board by finger. The board draws **no** day figure on a phone; the figure is the day heading on the week and View-only. The standby figure after the slash stayed "2" throughout (never changed by R or by seats).

| Step | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| 5-1 R typed, 2 MAIN seated, both SPARE empty | 2 jets | before R "0 / 2" → after R "2 / 2" | PASS | B-5-1-week-heading-2jets.png |
| 5-2 only the FCP of one SPARE seated | 3 | "3 / 2" | PASS | B-5-2-week-heading-3jets.png |
| 5-3 the other SPARE | 4 | I seated its RCP only (fillSlot): "4 / 2". **A placeholder (ALL AVAIL / ALL) cannot be put in a jet seat at all** — the crew palette says "cannot crew a jet; name the people flying it" and `fillSlot` left the seat empty, so D1062's "a placeholder counts as seated" reading is not reachable on a flying row; RECORD | PASS (RCP-only) + RECORD (placeholder) | B-5-3-week-heading-4jets.png |
| 5-4 View-only Sched's figure | same | "4 / 2" on both | PASS | B-5-4-viewonly-4jets.png |
| 5-5 clear every seat, R still typed | term drops | "0 / 2"; **all 4 chips stay lit on the empty rows** (RECORD: lit chips on rows with nobody) | PASS + RECORD | B-5-6-week-empty-shift.png |
| 5-6 ordinary flying wave, one empty line, same day | still counted (D1009) | "1 / 2" (was "0 / 2") | RECORD (consistent with D1009) | B-5-7-week-heading-plain-line.png |
Not on the phone: Insights (its entry is hidden below desktop width), the peek (see below).

## Scenario 8 — BB with no times (Pub Sat)
| Step | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| 8-0 + Wave → BB by finger; 2 rows seated; Pub Sat | START / END blank; 4 dashed chips | BB minted CS "BB", MSN "SHIFT", to/ld blank; 4 dashed buttons | PASS | B-8-1-bb-standing.png |
| 8-1 R 08:00 typed | rows lit; pending | 4 lit non-button chips; "1 pending"; no zoom | PASS | B-8-2-bb-r-typed.png |
| 8-2 warning list | amber line naming BB | "BB SHIFT flies but has no START or END — type them so its crew rest and OIL can be worked out" (amber), beside the red "the BB shift has no usable times — nobody on it earns OIL for this day" | PASS | B-8-3-bb-warning-list.png |
| 8-3 finger tap on the amber line | lands on START box | nothing lands; pucks dim | **FAIL = F2** | B-8-4-bb-amber-tap-lands.png |
| 8-4 type START 08:30, END 14:00 (finger) | amber goes; crew rest from 14:00 | list reads "No conflicts flagged for Saturday ✓"; a BB man on a Sunday 01:00 line: "Crew rest breach — Saturday ended 14:00 → crew rest clear at 02:00, but told to report 22:40 (previous day) — only 8h40 rest" (with R only, no crew-rest line) | PASS | B-8-5-bb-times-typed.png, B-8-6-bb-warning-after-times.png |
| 8-5 OIL Earn (phone button) | on by default | 7 items visible: the BB line "on", four seat switches "on" (each "HO"), the SDO desk "on"; the window itself is not drawn as times on the phone | RECORD | B-8-7-bb-oil-earn.png |
| 8-6 clear END only | amber returns | returns, reworded: "BB SHIFT flies but has no END — type it so its crew rest and OIL can be worked out" | PASS | B-8-8-bb-end-cleared.png |
| 8-7 hand-tick a BB row, no times at all | amber fires | one row "✓ FLIES" (a button), three dashed; the amber "…no START or END…" line is shown | PASS | B-8-9-bb-hand-tick.png, B-8-10-bb-hand-tick-warnings.png |

## Scenario 9 — every surface that draws a standby row (phone)
Set-up: SC AM R 06:30 typed by finger (4 lit); SC PM SPARE row 3 hand-ticked by finger; AVALON, BB standing by.
| Step | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| 9-1 board, stacked | lit on flying rows, dashed on the rest | 5 lit (4 non-button + 1 hand-ticked BUTTON whose title says "Tap to take the tick off"), 11 dashed buttons (3 SC PM + 4 AVALON + 4 BB); lit 53 x 13, dashed 42 x 13 css px | PASS | B-9-1-board-sc-am.png, B-9-2-board-sc-pm-tick.png, B-9-3-board-bb.png |
| 9-2 duty desks | never a chip | all 16 chips sit inside flying waves; 0 on the Duties block (a duty desk made from an AVALON template was not built) | PASS (partial) | — |
| 9-3 Edit Schedule week | lit only, none dashed, none pressable | 5 chips, all lit, all non-button spans, 0 dashed | PASS (legibility = F1) | B-9-4-week-sc.png |
| 9-4 / 9-5 finger tap on a lit chip, and on the hand-ticked one, in the week | nothing happens | the stored day identical before and after both taps | PASS | — |
| 9-6 View-only Sched | lit only | 5 chips, all lit non-buttons | PASS (legibility = F1) | B-9-5-viewonly-sc.png |
| next-week peek | "✓ FLIES ·" text | **not drawn on a phone** (no peek element at 402 wide; the week pager has only the 7 days) — NOT WALKED here | NOT WALKED | — |
Not walked: an earlier published version's look; Excel export and PDF (downloads).

## Scenario 16 — the faint dash (phone board)
| Step | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| 16-1 every empty R / B box of SC, AVALON, BB | faint grey "—" | 32 empty standby R/B boxes (class `tm sadash`), placeholder "—", colour rgb(138,150,163) — the same colour as the "Remarks" placeholder | PASS | B-16-1-avalon-dash.png, B-16-2-sc-dash.png |
| 16-2 flying line, nothing typed | no dash | placeholder empty, no `sadash` | PASS | B-16-3-flying-line-no-dash.png |
| 16-3 tap an empty box (Pub Sat) | stays empty, nothing pending | value "", focused with the browser's default outline; "15 changes" before and after | PASS | B-16-4-avalon-r-focused.png |
| 16-4 type 0630 (finger) | "06:30" in ordinary colour, box unchanged | "06:30", colour rgb(241,244,247) (ordinary), box 46 x 25 before and after; scale 1 | PASS | B-16-5-avalon-r-typed.png |
| 16-5 clear | dash returns | placeholder "—" back | PASS | — |
| 16-6 flying line with take-off 09:00 | keeps faint suggested times | placeholders "06:00" and "06:40" in the teal suggestion colour, class `sugbox` | PASS | B-16-6-flying-line-suggested.png |
| 16-7 focus outline | RECORD | the dash box shows the default outline ("auto 1px", white ring in the picture); an ordinary flying R box shows "solid 2px" — a small look difference between the two kinds of box | RECORD | B-16-4, B-16-6 |
| 16-8 the week (phone) | the brief says the board only | week R boxes are empty spans (no dash text/placeholder in the DOM); the picture shows a small "–" drawn in the week's R cell for standby lines | RECORD | B-16-7-week-dash.png |
| 16-9 View-only | RECORD | wave heads and R START END columns drawn; no dash text read | RECORD | — |
Export / PDF printing nothing for an empty box: NOT WALKED (downloads need his word).

## Scenario 21 — the member (us / us), phone
Signed in as admin, built the Saturday, published it through the app, signed out by the menu's Logout, signed in as `us` (Ranger, Member), same storage.
| Step | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| 21-1 View-only Sched, Saturday | lit chip read-only, no pressable chip | 5 chips, all lit, 0 buttons, 0 dashed, no tabindex | PASS (legibility = F1) | B-21-3-member-board.png (this is View-only Sched, the member's only schedule page) |
| 21-2 finger tap on a lit chip (typed shift) and on the hand-ticked one | nothing, no message | stored day unchanged; the passing-note area unchanged (it still holds the earlier "published and approved" text) | PASS | — |
| 21-3 Enter and Space on a lit chip | nothing | the chip cannot take focus (focus() fails); stored day unchanged | PASS | — |
| 21-4 Edit Schedule | RECORD | the member's menu has no Edit Schedule (View-only Sched, Inputs, Quals, Logic, Leave War, Tracker, Help) | RECORD | B-21-0-member-menu.png |
| 21-6 the board as the member | RECORD | **NOT WALKED**: no route to the board; `openScheduler(5)` draws the board hidden (chips present in the DOM, zero width). A zero-chip "pass" was refused as vacuous | NOT WALKED | — |

## Break tests (phone, finger)
Set-up: AVALON NIGHT, four rows seated, Saturday unpublished; week figure "0 / 2" before.
| Test | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| BT1 "abc", " ", "7", "25:90" typed into AVALON R | chip, badge, OIL, advisory agree | the box rejects every one: stored R undefined, box shows "", 0 lit chips, week figure unchanged "0 / 2", no long-day line, no advisory — all four agree (nothing flies). Control "0830": stored "08:30", 4 lit chips, week figure "4", long-day lines appear (22h30 — R is before START 19:00, so the day reaches 07:00 next morning; break test 8's territory, not walked) | PASS x5 | B-BT1-1-r-abc.png … B-BT1-5-r-0830.png |
| BT2 literal "–" (U+2013), "—" (U+2014), "-" in an empty standby R | must not make the shift fly | all three: stored "", box shows "", 0 lit chips, figure unchanged | PASS x3 | B-BT2-8211.png, B-BT2-8212.png, B-BT2-45.png |
Export printing of an empty box (BT2's second half): NOT WALKED.

## Not walked, and why
- The next-week peek and Insights: neither is drawn on a phone (the peek needs a wide window; Insights' button is hidden below desktop width).
- The member's Scheduler Board (no route) and Edit Schedule (not in the member's menu).
- Excel export / PDF (a download; needs his word).
- A duty desk made from an AVALON / BB / SC template with a wave; an earlier published version's look.
- Desktop-only parts of scenarios 2, 5, 8, 9 (OIL Earn windows, Insights, the peek) belong to the desktop walker.
- Everything that needs a real iPhone (zoom on a focused box, Apple font width).
