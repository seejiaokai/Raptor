# Approvals scrolling inside itself on a PC — the bug check (the night of 12–13 Nov 26, job 1)

Branch `claude/approvals-scroll-pc`, pull request 763. Backlog item `[APPROVALS-SCROLL-INSIDE]`; his rulings **D2006** (on a PC
the Approvals page fits the screen and only its list scrolls, the title, chips, Approve all and column headings staying, as
Balances does; on a phone the page stays as it is today, the whole page scrolling) and **D2008** (on a PC a short list still
has its card reach the foot of the screen, empty below the last request, as Balances does). The approved drawings:
`docs/superpowers/specs/2026-11-12-approvals-scroll-drawings.md`, pictures 1–4 the PC; picture 5's choice B the phone; picture 6
not chosen. Run unattended; nothing put to him during the night — what needs his eye is in §12.

Commits: `029440c03` (the build and its tests), `d8201fcbd` (the builder's report at built — the coordinator's),
`0a1802567` (the walk's W3 fixed), then one commit with the reads' fixes, this sheet and the reads (§12).

**What was built.** On a window wider than the Leave War's phone width (700 — `ui/phone.ts`, the width every Leave War page
already switches at) the Approvals page is fitted to the screen by the Balances page's own rule, moved whole into one file
(`ui/screenfit.ts`), and only a scroller inside the card (`.appr-scroll`) scrolls: the column headings pinned at its top, the
lines, "Also since you last looked" and "Nothing here for these dates." inside it. The list keeps its own place across
"Back to Approvals". 700 or narrower — a phone — the page is exactly as before. A tablet either way up, and a narrow desktop
window wider than 700, get the PC layout.

## 1. The eight answers and the tier

1 OIL or what a man is owed, or how many count as present: NO — nothing counted or decided changes; Approve, Refuse and
Approve all reach the same one writer as before. 2 The published record: NO. 3 Saved data: NO — nothing is written; the
list's place is held in the page only, for the visit. 4 A shared drawer: YES — the fit rule (`screenfit.ts`) is now called from
two pages, Balances and Approvals. 5 A new gesture or mode: YES — a new scroller on a PC, with a wheel kept to itself at its
ends. 6 A new surface: NO — the same page. 7 Roles: NO — Approvals is an admin's, as before. 8 The warning list: NO.
**Tier: WALK** (4 and 5). Told in this sheet, not at the start — he was asleep.

**The rulings that apply** (each checked on the running build — results in §5):

| Ruling | What it says, in short | Result |
|---|---|---|
| D2006 | PC: fits the screen, only the list scrolls; title, chips, Approve all, headings stay. Phone: as today | PASS — PC: 73 checks in real 125% windows (§5 H1); phone: identical to `main` in WebKit and Chromium, 75 measures each (H3) |
| D2008 | PC: a short list keeps the card at the screen's foot | PASS — W2: 2, 3 and 4 lines and an empty range, the card's foot 8px off the screen's in every state |
| D1986 | Approvals to scroll as Balances does (the reading D2006 settled) | PASS — the same fit rule, the same 8px foot, the wheel kept at the ends (H1, W13) |
| D1421, D1428, D1506 | a decided line stays lit where it is until he leaves Approvals or changes the dates; the OIL tracker over it does not end the visit; closing back returns its lit lines, dots, dates and place in the list | PASS — W1, W5, W6, W8 (the place 300 → 300 across the tracker both ways in); a new list from its top after new dates (F7, the read's F2) |
| D1231 | a request's dates open the grid at that day, ringed, with the slim "Back to Approvals" bar | PASS — W5, W12 |
| D1432, D1440, D1445 | the slim bar's look | PASS — untouched; seen in W5's pictures |
| D1542 | the clash note's "Decide it in Approvals ›" rings the line and brings it into view | PASS — W7 at both sizes; on a PC the ringed line 1px clear of the foot's fade (§12, W7) |
| D1429, D1437, D1438 | each column heading exactly over its figures, phone and desktop | PASS — W10: 260 cells, 0.00px from `main` everywhere |
| D1430, D1420 | the desktop header and the M4 page as drawn | PASS — the drawing check (§7) and W2 |
| D1431 | Approve all armed stays amber | PASS — W4 |
| D1518, D1519, D1522 | nothing pinned leaks: a bar that stays put shows none of what scrolls under it | PASS after a fix — W11 at 1536; on a narrow PC (700–1210) the lines leaked past the headings' right end (the fresh read's F1), fixed red first (H4, e2e) |
| D487 | button sizes unchanged | PASS — W10's boxes and the drawing check |
| 2 Sep 26 | a control tapped repeatedly never moves under the finger | PASS — W2 (every chip, Pick dates…, the card unmoved within 1px; Approve all's left edge moves with its count, the same on `main`, §12); the range's first day keeps the list still (F1, F7) |
| D1424, D1494, D1495 | built to the drawing; the drawing check | §7 |
| D1557 | the plain-user round | §5 |

## 2. The roll-call (§6, rows by kind of change)

Each cell: **has it** / **must not, because…** / **MISSING**, and how it was seen.


### 2a. The thing: the Approvals page's scroll and fit — every state the app draws it in

| Where / state | Fits the screen (PC) or as before (phone) | Only the list scrolls; the wheel kept at its ends | What else is painted there |
|---|---|---|---|
| PC, All, a long list | has it — H1, 73 checks at 7 neighbouring heights, fractions included, window room 0 | has it — H1: the wheel to the foot then at once up moves the list, the window 0 | has it — W11: the headings strip identical at 11 places, a lit line crossing it |
| PC, a month chip with a short list (D2008) | has it — W2: Jan, Mar, New, a 2-line range, the card's foot 8px off the screen's | has it — nothing to scroll; window room 0 | has it — the empty card below the last line, as drawn (§7 desk-short) |
| PC, New with "Also since you last looked" | has it — W2 | has it — the "Also since" lines inside the box, under the headings (unit test, §6) | has it — the headings pinned over them too |
| PC, Pick dates… open (the range picker) | has it after a fix — W3 FAILED (the calendar cut off, days 19–31 out of reach at 560), fixed: the calendar the box's first part; F1–F5 PASS at 917, 680, 560 | has it — F1: the wheel reaches its last day and its foot, then the list; F2: the box's scroll bar dragged with it open | has it — F3: a press on Approve beside it only closes it, decides nothing (D1421) |
| PC, "Nothing here for these dates." | has it — W2's empty range: the card keeps its height | has it — inside the same box | must not show the headings, because there is no line to head — the same on `main` (W2) |
| PC, "Nothing waiting for a decision." (empty war) | has it — the same element, in the same box, as "Nothing here" (`ApprovalsPage.tsx` body); not walked by itself (§10) | has it — as above | as above |
| PC, a line ringed by the clash note's link | has it — W7 R2-6 PASS at desk and phone | has it — the ringed line inside the box, under the headings, above the fade by 1px (§12, W7) | has it |
| PC, hidden behind the grid (the slim bar), shown again | has it — W5, W6: the place 400 → 400 and 200 → 200, the decided line still lit, window room 0 | has it — after a 6 s wait the wheel moves the list at once (W6, lesson 10) | has it |
| PC, the OIL tracker over it, closed back | has it — W8 (a) the OIL tab, (b) a person window's OIL line: place 300 → 300, lit, dates kept | has it | has it |
| PC, the window resized live, across 700 and back | has it — H1 (narrowed to the phone and back, the place 200 → 200); the calendar's month kept across it after a fix (Astra's finding, F7c) | has it | has it |
| PC, narrow (700–1210 wide, the box scrolling sideways) | has it after a fix — the fresh read's F1: lines leaked past the headings' right end; fixed (H4: 15 places clear at 1000, 820, 1280); a calendar or a new list from the box's left after a fix (the fix read's 1, F8) | has it — the sideways scroll bar at the card's foot, under the fade but seen (H5) | has it |
| Phone 402 (WebKit and Chromium), every state above that the phone has | has it — H3: 75 measures each engine, identical to `main`, the calendar shut and open; W12, F6 the plain-user round | must not, because D2006's phone half: the whole page scrolls (W12: room 1241 / 1281, the last line reachable) | has it — as `main` |
| Balances (the shared fit rule's other user), PC and phone | has it — W13: 7 heights, fractions included, window room 0 | has it — W13: the wheel at the foot and back up at once | has it — the drawing check of Balances not re-run (§10) |

### 2b. Rows by kind of change

| Kind (§6) | Row | Answer |
|---|---|---|
| A moved selector — the element that scrolls | on a PC the window no longer scrolls on Approvals; `.appr-cols` moved out of `.appr-list` into `.appr-scroll`. Readers of each, searched uncapped across `src`, `e2e`, `probes`, `scripts` | has it — both readers searched: nothing live reads the headings inside the list; the older walk scripts that scroll the window to reach low lines (`lw-m4-rw-*`) would fall short on a PC if re-run — walk tools, not gates (the fresh read) |
| A navigating action, one row per opener | the Approvals tab; the clash note's "Decide it in Approvals ›"; the OIL tracker closing back; a person window's OIL line opened from Approvals; Back on the slim bar; ✕ on the slim bar; another tab while the slim bar is up | has it — the tab (W5, W8 c), the clash link (W7), the tracker both ways (W8 a, b), Back and ✕ (W5); another tab while the slim bar is up: each read follows it to the one clean-up (both reads), not walked by itself (§10); "+N pending in <period> ›" and a period in View: a new list from its top (F7b, unit test) |
| A listener above its own component | the window's resize listener and `body.lw-appr-on`, alive only while the page is shown on a PC | has it — unit test ("the window keeps no pad… gets it back when hidden or closed"); both reads traced every way out to the one clean-up |
| A part's second user | Balances fitted through `screenfit.ts` | has it — W13; moved word for word (both reads) |
| What a change moves up or down the page (lesson 28) | the card's foot now at the screen's foot; nothing below it | has it — nothing stands below the card on a PC; on a phone nothing moved (H3) |
| A wrapper added round the list (the reads' fix) | one box at both widths: `.appr-flow` (draws nothing) on a phone, `.appr-scroll` on a PC | must not change the phone, because D2006 — H3 re-run on the fixed build: identical to `main`; the fix read checked the phone's styles across it |

No MISSING cell is left: the two that were (the short window's calendar, the narrow PC's headings) are fixed, red first.

## 3. The sizing step (§7.0, the walk ledger)

1. **The type of change:** E (layout — a page fitted to the screen, a box that scrolls inside it), with C (a new mode of
   scrolling: the wheel kept to the box at its ends).
2. **What only a walk could find here:** the page at a fractional height in a real 125% window (lesson 31 — no test
   browser makes one); the real wheel at the list's ends; what the pinned headings let through at every place; every
   other thing on the page that now sits inside a box of fixed height (the calendar — what W3 found); the phone unchanged.
3. **What the ledger says:** E — ten walks, four found a real fault, six faults; on layout his own look has found what
   walks did not, so the walk measures, and the looks his PC alone can give are named for him (§14).
4. **The walk chosen:** ONE Sonnet 5.5 walker, scripted, 13 scenarios (W1–W13: every control on the page, the plain-user
   round on the phone, lessons 9, 10, 15, 17, 24, 27, 31 by name) in real headed windows at 125%, plus the host's own
   measured runs: H1 the fit at neighbouring heights, H3 the phone against `main`, and the drawing check. A second walker
   was not worth starting for one page.
5. **After the walk:** the walker found 1 fault in the change (W3) and 1 older difference (Approve all's left edge);
   the two reads found 3 more (Astra: the calendar's month lost across 700; the fresh read: the narrow PC's leak, a new
   list kept the old place); the fix read 1 (the calendar and a new list off to the side on a narrow PC). Re-walks:
   F1–F6 (the walker, on W3's fix), F7, F8 and H4 (the host, on the reads' fixes). The type held — E with C; the sizing
   was right that the walk was needed, and it missed the narrow PC because every PC scenario ran at 1536 or wider
   (lesson 11 named it; §4).

## 4. The lessons of §7.11, each answered

| Lesson | Covered by, or why it cannot apply |
|---|---|
| 1 a reading in one state only | the page in every state (§2a): long, short, empty, New with "Also since", calendar open, hidden, ringed |
| 2 a gesture at one speed | the wheel tick by tick and in a burst (H1, F1); no drag in this change |
| 3 feedback never looked for | no new feedback; the decided line's lit look checked unmoved (W1) |
| 4 a press behind an open window | the calendar open: a press on Approve beside or under it only closes it (F3) |
| 5 a box brought into sight, never checked against what stands over it | the ringed line against the headings and the fade (W7); every Tab stop against both (W9, F5) |
| 6 something only the real phone draws | the phone is unchanged, measured identical to `main` (H3); nothing new drawn there |
| 7 a mechanism tuned to a model | the fit is measured in real windows, not a model (H1) |
| 8 a fix that reshaped an approved drawing | every fix re-checked against the drawing: the drawing check re-run on the fixed build, 0 differences (§7) |
| 9 alignment judged by eye | W10: 260 cells measured against `main`, every kind of line |
| 10 a way back walked only straight | W6: a change made while hidden, then a wait, then the wheel |
| 11 a reading worked out from what fits, walked only at the usual sizes | **missed at first**: every PC scenario ran at 1536 or wider, so the narrow PC's leak was the fresh read's; then measured at 1000, 820, 1280 (H4) and pinned by a browser test at 1000 |
| 12 a window opened from one page only | the OIL tracker from the OIL tab and from a person window's OIL line (W8 a, b) |
| 13 a pinch at the top of a list only | must not apply: nothing on Approvals pinches |
| 14 boxes left off the keyboard walk | W9 and F5: every Tab stop of the page, chips, calendar and list, both ways |
| 15 a pinned bar checked by where it sits | W11 by its pixels at 11 places; H4 at narrow widths, scrolled sideways |
| 16 a warning cleared only by a change of value | must not apply: no warning here |
| 17 a control that changes a page's width or height, at rest only | W3 (the calendar in a fixed card — the fault), then F1 at 680 and 560 |
| 18 a real browser's print | must not apply: Approvals has no print |
| 19 a window over a window, never closed | W8 (b): the person window gave way to the tracker; none left over |
| 20 a gesture once, slowly | the wheel at both speeds (row 2) |
| 21 a test browser's touch taken for his phone's | the phone is unchanged (H3); the phone's moves in W12 and F6 were by script, said so (§10) |
| 22 shown by being there | every finding judged by measured boxes and the host's opened pictures (§5) |
| 23 a tap's window from the build's own reading | must not apply: no window opens from a tap in this change |
| 23 (the second) a fault in the picture looked past | the host opened every deciding picture whole; W2's empty range and Approve all's edge were noted, not passed over (§12) |
| 24 a walk that never flicked to the foot on a phone | W12: the phone's page to its very foot and back; the bounce is a look for his iPhone (§14) |
| 25 walked only where the demo had it | the staged world puts the member's own bids and the admin's six through the app's own doors (`appr-pc-lib.mjs`); the empty war not walked (§10) |
| 26 a gesture checked by the number it moved | the place checked by what is on screen: the first request's dates (F7), the ringed line's box (W7) |
| 27 a control's place across the change beside it | W2: every chip and month pressed, each neighbour measured before and after |
| 28 a press made by a script that scrolls first | W3's real-input rerun and F1: the days pressed by the mouse at a point after the real wheel, each hit-tested |
| 29 a page open while the day turns | must not apply: nothing in this change reads today |
| 30 a tint left by a press | must not apply: no new press tint; the phone is unchanged |
| 31 a page fitted to the screen at 125% | H1: real headed windows at 125%, 7 neighbouring heights, fractions included, window room 0, the wheel at the ends; his PC's own look named (§14) |

## 5. The orders and scenarios walked

Nothing here is money: no figure, count or OIL changes (§1). The orders are the page's own.

**The walker (W1–W13, on `029440c03`; F1–F6 on `0a1802567`)** — real headed Chrome at 125% unless named; its report kept in
its own words, `2026-11-13-approvals-scroll-pc-walker.md`; pictures `img/handpass/2026-11-13-approvals-scroll-pc/walker/` and
`walker-fix1/`; its scripts `scripts/handpass/appr-walk/`:

| | Scenario | Result |
|---|---|---|
| W1 | Approve and Refuse mid-list, then a lit Approve pressed again | PASS — the line, the list's place (300) and the card's foot unmoved; counts right |
| W2 | every chip, month and Pick dates…, each neighbour measured (lesson 27) | PASS but Approve all's left edge (moves with its count — the same on `main`, §12) |
| W3 | Pick dates… on a short window (lesson 17) | **FAIL** — the calendar cut by the card at 680 and 560; at 560 days 19–31 out of reach. Fixed in `0a1802567` |
| W4 | Approve all armed and pressed | PASS — amber, its right edge fixed; the list's foot reached |
| W5 | a request's dates, Back, ✕, the tab again | PASS — place 400 → 400, lit; a new visit from the top |
| W6 | a change made while hidden, then a wait | PASS — "Already approved by Saber", place 200 → 200, the wheel at once |
| W7 | the clash note's "Decide it in Approvals ›" | PASS at desk and phone — 1px clear of the fade |
| W8 | the OIL tracker over Approvals, two ways in; Balances and back | PASS |
| W9 | the keyboard, 100 Tab stops | PASS — every stop wholly in sight, the ring seen |
| W10 | column alignment, every kind of line | PASS — 0.00px from `main` |
| W11 | nothing pinned leaks, 11 places | PASS — byte for byte |
| W12 | the phone, the plain-user round, WebKit and Chromium | PASS — as `main` |
| W13 | Balances at 7 heights | PASS |
| F1 | W3 again on the fix: at 680 and 560 the calendar in the box, its last day and foot by the wheel, the headings pinning after it, Tab, two real clicks for a range | PASS |
| F2 | the box's scroll bar dragged, its track and arrow pressed, calendar open | PASS — it stays open; a press outside the card closes it |
| F3 | Approve beside and under the open calendar | PASS — the first press only closes it |
| F4 | a range by two presses; neighbours unmoved | PASS |
| F5 | the keyboard with the calendar open, 45 stops each way | PASS |
| F6 | the phone on the fix, calendar open and a range | PASS — identical to `main` to the decimal |

**The host's own runs** (scripts in `scripts/handpass/`, pictures under `img/handpass/2026-11-13-approvals-scroll-pc/`):

| | Run | Result |
|---|---|---|
| H1 | `appr-pc-fit.mjs` — real 125% windows at 7 neighbouring heights, a short 560 and 680, a wide 2560, narrowed to the phone and back | 73 of 73 PASS on `029440c03` (`host-fit/`) and again on the reads' fixes (`host-fit-fix2/`) |
| H2 | the drawing check, `scripts/drawcheck/specs/appr-scroll.mjs` | §7 |
| H3 | `appr-phone-same.mjs` — 402 × 874, WebKit and Chromium, `main` against the branch, the calendar shut and open | IDENTICAL, 75 lines each, on `0a1802567` (`host-phone/`) and on the reads' fixes (`host-phone-fix2/`) |
| H4 | `appr-narrow-pc.mjs` — 1000 × 733, 820 × 1180, 1280 × 733, the list at 0/60/120/200 and sideways 200 | `main` clear (the window scrolled sideways, nothing pinned); `0a1802567` LEAKS at 5 places (`host-narrow/`); fixed: clear at all 15 (`host-narrow-fix2/`) |
| H5 | the sideways scroll bar on a narrow PC, a real headed window at 1000 | a 15px bar along the card's foot, under the fade but plainly seen (`host-narrow-fix2/sidebar-1000-real.png`; §12) |
| F7 | (`appr-walk/appr-a-f7.mjs`, the walker's script shape, the host running it) new dates from the list's top: Feb, New, All each pressed with the list wheeled down; another period in View and back; crossing 700 with the calendar browsed to March | 6 of 6 PASS on the reads' fixes (`walker-fix2/`, again `walker-fix3/`); the same script on `0a1802567`: 3 FAIL (Feb at 98, All at 618, the calendar back to January) |
| F1 again | the walker's F1 on the reads' fixes (the range's first day keeps the place) | 13 of 13 PASS (`walker-fix2/`) |
| F8 | (`appr-walk/appr-a-f8.mjs`) the fix read's finding: at 820 and 1000, the box scrolled sideways by the real wheel, Pick dates… and Feb | 5 of 5 PASS on the last build (`walker-fix3/`); the same on the build before: 4 FAIL (the calendar wholly out of sight, −64 of 350px) |

## 6. Cases carried by a test

| Case | Test | What it proves |
|---|---|---|
| the phone keeps its page: no fitted height, the pad kept; the list, "Also since" and the calendar in the card as today | `src/leavewar/ui/apprscroll.test.tsx`, its phone block (4 tests) | the parts' places on a phone, the wrapper drawing nothing |
| the fit: the true height (733.6 → 733), never taller than the rounded figure, the page's top read in its own measure | apprscroll, 3 tests | lesson 31's arithmetic (the real windows: H1) |
| a short list keeps the card's height (D2008) | apprscroll | the page's height fixed whatever the list |
| the body pad dropped while up, back when hidden or closed | apprscroll | the listener above the page torn down |
| title, chips, Approve all and headings outside the box; lines, "Also since", the empty words inside | apprscroll, 3 tests | what scrolls and what stays |
| Pick dates… opens at the box's top and left (W3, the fix read's 1) | apprscroll, 2 tests | red before each fix |
| the place across Back, even when the browser forgot it while hidden | apprscroll | D1506's place |
| crossing 700 and back, the page's shape; with the calendar open, its month and the lines kept (Astra's finding) | apprscroll, 2 tests | red before the fix |
| new dates and another period from the list's top; the range's first day keeps it (the fresh read's F2) | apprscroll, 2 tests | red before the fix (the period test pins what was already right) |
| a PC fits the screen, only the list scrolls, by the wheel; a short list's card; the place across Back | `e2e/leavewar.spec.ts`, 4 tests (D2006, D2008) | in Chromium at 1440 |
| a narrow PC: nothing shows past the headings, down or sideways | `e2e/leavewar.spec.ts` "on a narrow PC no line shows past the pinned headings' end…" | red with the fix taken out, green with it |
| the phone's own page | `e2e/leavewar.spec.ts` "on a phone the Approvals page stays as today…" | in the phone project |

## 7. The drawing check (D1494, D1495)

Spec `scripts/drawcheck/specs/appr-scroll.mjs`, five states against the approved pictures 1–4 (desk-top, desk-scrolled,
desk-slim, desk-back, desk-short), records in `docs/mock/2026-11-12-approvals-scroll/drawcheck/`.
- On `main`: RED, 5 differences, 4 states not reachable (no box to scroll) — the check can fail.
- On `0a1802567`: GREEN, 0 differences (`img/handpass/2026-11-13-approvals-scroll-pc/drawcheck/report.md`).
- On the reads' fixes: GREEN, 0 differences (`drawcheck-fix2/report.md`). The last fix (the box back to its left) changes
  nothing at rest at 1536, where the box does not scroll sideways.
- The check warns that its records were replayed from the drawing's own script, not read off the approved pictures: the
  replay differs from the approved pictures only in the clock words (the title line's "since you last looked" time and
  the PLACED times), checked by eye side by side. No difference kept; nothing put to him.

## 8. Break tests

- The narrow-PC browser test, with the headings' width rule taken out: red ("Approve 959–1059, the headings to 961").
- The unit tests of each read fix, run before the fix: red (§6).
- The drawing check on `main`: red (§7).
- The walker's F7 and F8 on the build before each fix: red (§5).

## 9. Errors seen

None on any run: every walker and host script watched page errors, console errors and failed requests.

## 10. What was not walked, and why

- "Nothing waiting for a decision." (a war with no request): the same element in the same box as "Nothing here for these
  dates.", which was walked; the demo world always has requests.
- Another tab pressed while the slim bar is up: both reads traced it to the same clean-up as ✕; not driven.
- The phone by a real finger: WebKit takes no wheel or scripted touch here, so the phone's page was moved by script
  (W12, F6), and the phone is measured identical to `main` (H3) — nothing of it changed.
- A real iPhone's bounce at the page's foot (lesson 24) and his PC's own wheel (lesson 31): named as his looks (§14).
- The Balances page's drawing check: its fit was moved word for word and walked (W13); its drawing is not touched.
- A right-to-left page: the app has none.

## 11. The code reads

Brief: one for both, `§2b` exclusions in it (demo data, a scheduler who is not an admin, style):
`2026-11-13-approvals-scroll-pc-read-brief.md`. Both blind to each other and to the walk's report.
- **Astra** (Codex, read only; its browser could not start, so it read and ran nothing in a browser):
  `2026-11-13-approvals-scroll-pc-astra-read.md` — 1 finding.
- **A fresh Opus reader**: `2026-11-13-approvals-scroll-pc-opus-read.md` — 2 findings, both measured in a browser.
- **The fix read** — the reads' fixes rewrote how the list's place is kept, so a narrow fresh Opus read of them:
  `2026-11-13-approvals-scroll-pc-fix-read.md` — 1 finding, 2 minor points, 1 test gap.
Every claim was made a failing test or a failing walk before it was believed (§6, §8).

## 12. Findings, dispositions, and questions for him

| # | Found by | What | Disposition |
|---|---|---|---|
| 1 | walker W3 | on a short PC window the calendar was cut off by the card and days 19–31 could not be reached (on `main` the window scrolled to them) | FIXED red first (`0a1802567`): the calendar is the box's first part and the box goes to its top as it opens; F1–F6 PASS |
| 2 | Astra | crossing the phone's width with the calendar open put it back on January (two different parents, one per width) | FIXED red first: one wrapper at both widths, drawing nothing on a phone; F7c PASS; the phone identical to `main` (H3) |
| 3 | fresh read F1 | on a PC 700–1210 wide the lines leaked past the pinned headings' right end (D1518) | FIXED red first: the headings and lines as wide as the columns; H4 clear at 15 places; e2e test at 1000 |
| 4 | fresh read F2 | a chip or another period kept the old place, cut to the new list — its first requests hidden above the headings | FIXED red first: new dates and another period show the new list from its top; a range's first day keeps it (the calendar under his finger); F7 PASS |
| 5 | fix read 1 | on a narrow PC scrolled sideways, Pick dates… opened the calendar out of sight and a new list stayed shifted | FIXED red first: the box back to its left too; F8 PASS |
| 6 | fix read 3 | the new period could draw one frame at the old place | FIXED: the box set back before the frame is drawn (no test can show one frame) |
| 7 | fix read 4 | no test held the period's reset | a test added (it pins what was already right) |
| 8 | fix read 2 | pressing the chip already lit takes the list back to its top | NOT CHANGED: pressing it already started the list afresh before this change (its lit lines go, on `main` too); the list's top follows that. Whether a re-press should keep the lit lines is older than this job — for the coordinator to file |
| 9 | walker W2 | Approve all's left edge moves up to 6.8px as its count's digits change (its right edge fixed) | NOT A FAULT OF THIS CHANGE: the same numbers on `main`; it is the right edge that stands, and the button is not pressed again and again from its left |
| 10 | walker W7 | the ringed line from the clash link sat 1px clear of the card's fade at 1536 × 730 | NOT A FAULT: in view as D1542 asks; the box keeps 28px at its foot for the fade |
| 11 | walker, seen besides | at 560 tall the arrow keys move inside the calendar to days below the box without scrolling it | OLDER: the same on `main` (the window did not follow either); Tab is fine. For the coordinator to file |
| 12 | walker, seen besides | a name's puck pressed on Approvals opens nothing on a PC; an empty range hides the headings | OLDER, the same on `main` — not findings of this change |
| 13 | fresh read, not proven | if something above the page grew with no resize, the page could stand taller than the screen | NOT A FINDING: no case found; Balances has the same limit |
| 14 | H5 | the narrow PC's sideways scroll bar lies under the card's 28px fade | NOT A FAULT: seen plainly in a real window; pressable through the fade |
| 15 | fresh read, tidiness | the fit-plus-body-class pair in both pages; `screenHeight` exported but used inside its file only | FILED, not fixed (D489) |

**Questions for him:** none — nothing in this job needs his choice. His looks are in §14.

## 13. The gates

On his PC: the six Approvals unit files 193 of 193; this job's browser tests (D2006, D2008, the narrow PC, the older
phone test of the grid shown again after Approvals) 6 passed, 6 skipped by project; the type check clean; the code check
no new finding. GitHub's run of the pull request is the full check (shipping.md).

## 14. His look

On his PC's Chrome at his 125%: open Leave War → Approvals, turn the wheel to the list's foot and at once back up — the
list moves at once and the page never shifts (lesson 31); press Pick dates… with the window made short. On his iPhone:
the page as before, flicked hard to its foot and back (lesson 24).

Walk: docs/handpass/2026-11-13-approvals-scroll-pc.md · 334 pictures · 13 surfaces · 27 orders · MISSING: 2 fixed (the short window's calendar, the narrow PC's headings), 0 ruled, 0 filed
