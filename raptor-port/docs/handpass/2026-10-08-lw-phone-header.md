# The top of the Leave War on a phone is two lines — the bug check (8 Oct 26)

`[LW-PHONE-HEADER-SPACE]` — owner, D678 ("A looks good": idea A of the page he was shown) and D679 ("keep the same for
desktop"). Built on `claude/inputs-sans-calendar` by Opus 5.5, the same day. Pictures:
`docs/img/handpass/2026-10-08-lw-phone-header/` (28). The walk's script: `scripts/handpass/lw-phone-head-walk.mjs` — its
checks are written as the right behaviour, so running it again is the re-walk.

## 1. The eight questions, and the tier

| # | Question | Answer |
|---|---|---|
| 1 | OIL, pay, how many count as present | NO — the under-manned count is the same number from the same calculation; only the word beside it changed. |
| 2 | The published record | NO — the stage moves call the same two commands as before; only where their buttons sit changed. |
| 3 | Saved data | NO — nothing new is stored and nothing is read differently. |
| 4 | A shared drawer | NO — the top area is drawn in one place (`LeaveWarPage` → `Topbar`, `StageBar`); no other screen draws it. |
| 5 | A new gesture or mode | **YES** — on a phone an admin's stage is a button that opens a menu holding his two stage moves. |
| 6 | A new surface | **YES** — that menu. |
| 7 | Roles | NO — who may move the stage is decided where it was (the admin only; the store refuses a member regardless). The build moves the admin's two buttons; it changes no rule. Checked on screen all the same (§4, the member's face). |
| 8 | The warning list | NO. |

**Tier: WALK.** No model read is required at this tier, and none was run; the branch's one FULL check (D485, the
calendar job) reads this code with the rest.

## 2. The rulings that apply, each checked in the running build

| Ruling | What it says | Result |
|---|---|---|
| D678 (8 Oct 26) | On a phone: the period, "+" and "Viewing as" on line 1; the stage (its two moves behind it), the bidding dates, under-manned, Legend on line 2 | PASS at 390, 360 and 430 wide, admin and member |
| D679 (8 Oct 26) | A desktop and a tablet stay exactly as they are | PASS — measured before and after, byte for byte the same (§5) |
| D365 (29 Sep 26), narrowed by D678 | "Viewing as" keeps its words; on a phone it is back on the Period line | PASS — words whole, a long callsign ends in "…" |
| D352 (28 Sep 26) | The one Undo takes back a stage move | PASS — moved from the menu, Undo and Redo from the top bar |
| D347 (28 Sep 26) | Undo / Redo live in the app's top bar, not on this row | PASS — untouched |
| 27 Aug 26 | A member is offered no stage move | PASS — a member's stage is a label; a tap opens nothing |
| 4 Sep 26 | A click-open popup closes on a click outside it | PASS — a tap outside, Escape, and a second tap each close the menu and move nothing |
| 10 Aug 26 | The top area scrolls away with the page (it is not pinned) | PASS |
| D487 (2 Oct 26) | No look pass changes a button's size without his word | Held: the chips on line 2 are 23px tall (22px before); "+" is the 30px square he was shown. The menu's two rows are NEW controls, drawn 40px tall (told to him — §8). |
| D166 (4) | "Viewing as" names the person signed in | PASS — Saber as the admin, Ranger as the member |

## 3. The roll-call — where the app draws this, and what lies on the same pixels

| Place | Has the two lines | The stage menu usable | What else is painted there |
|---|---|---|---|
| The Leave War page, 430px and under, an admin | YES | YES — opens under the stage button | It opens OVER the Manning block and the grid: a browser test proves it is the top thing at its own middle and at each move's middle (430 and under). It sits UNDER the war's sheets and the movable windows, as the under-manned list and Legend do — by design. |
| The Leave War page, 430px and under, a member | YES (no "+") | MUST NOT — a member has no stage moves; his stage is a label | — |
| The Leave War page, 431px to a desktop | MUST NOT, because D679 | MUST NOT — the two moves stay in sight on the strip | Proved: the wider sizes' browser test, and the before/after measurement. |
| The Leave War page with no leave period yet ("No leave period yet") | MUST NOT — that page draws no top area at all | — | Read in the code (`LeaveWarPage.tsx`): the empty page replaces the whole of it. Not walked — nothing of this change is on it. |
| Any other page, any window, the print | MUST NOT — none draws this area or offers a stage move (searched: the two stage commands are called from this one component) | — | — |

**The door check** (the new control): the menu is reached by a tap on the stage button; it is left by a move, a tap
outside, Escape, a second tap, his switching to the member view, and the phone being turned on its side — each proved
(unit tests; the first four also on screen).

## 4. The sizing step (D607, D608) — written before the walk

1. **The type of change:** E (layout — one screen's top area) and C (one new control: the stage button and its menu).
2. **What only a walk could find:** whether the two lines hold on a real screen with the real demo squadron's words;
   the menu over the real grid; each stage's own words on line 2 (a stage with no dates, the end of the cycle); the
   pop-outs that hang from line 2's chips, now that the chips have moved; a member's face; the phone turned on its
   side. The tests already cover: the words, who is offered what, overlap and off-screen at three widths, the menu's
   place and size, the wider sizes' paint.
3. **What the ledger says** (its figures of 7 Oct 26): of ten walks whose leading type was layout (E), four found a
   real fault — six faults, four of them in the change — and none needed helpers; of fifteen led by a new control
   (C), eight did. So a walk is worth having here, and a small one by the host is what such walks have been.
4. **The walk chosen:** the host (Opus), one scripted real browser, the production build. Phone 390 and 360 as an
   admin (twenty steps each) and as a member (six each); a desktop and a tablet (four each). Signed in through the
   sign-in card as each person. Beyond phone and desktop width: 360 (the narrowest phone), a tablet, and the phone on
   its side. No short-screen pass — the top area is not a screen-tall column. Nothing repeated is left to a test
   instead of being driven; what the tests carry is listed in §6.
5. **Its row** is in `docs/walk-ledger.md`.

## 5. What was walked, and what the screen said

86 checks, 86 passed (the final run; three earlier runs each stopped on a mistake in the walk's own script — §7).

| Step | Phone 390 | Phone 360 |
|---|---|---|
| The two lines as the page opens (admin): nothing over anything, nothing off the screen, no label word | PASS — 76px tall; the grid starts 182px down (279 before) | PASS — 76px; 182px (282 before) |
| The stage menu opens whole on the screen, on top of the grid, holding "→ BIDDING CLOSED" and "← DRAFT" | PASS | PASS |
| A tap outside closes it, moves nothing, opens nothing under it; a second tap on the button closes it | PASS | PASS |
| ORDER 1 — forward (BIDDING CLOSED: the dates go, still two lines), Undo, Redo, then back from the menu | PASS | PASS |
| ORDER 2 — back first (DRAFT; the menu then offers only the way forward), then forward | PASS | PASS |
| To PUBLISHED: the menu's forward reads END OF CYCLE and cannot be pressed; back can | PASS | PASS |
| A reload keeps the stage the menu left it at | PASS | PASS |
| "+" opens the New-period sheet; the dates open "Open bidding on"; Legend opens its key whole on the screen | PASS | PASS |
| The other period picked in the picker (a draft one): still two lines | PASS | PASS |
| The two lines scroll away with the page | PASS | PASS |
| Turned on its side: the wide strip (labels, the two moves in sight); turned back: the two lines | PASS | PASS |
| The longest count there is, "Under 365 days" | PASS — still one line | PASS — Legend drops to a line of its own (§8) |
| A member (Ranger): two lines, no "+", a stage that is a label and opens nothing, the dates not a control, Legend opens | PASS | PASS |
| The browser's own error list | empty | empty |

A desktop (1440) and a tablet (768), an admin: the four label words, "+ New", the stage a label with its two moves in
sight, the dates with their year; a click on the stage opens nothing; the two moves work from the strip — PASS, and no
errors.

**D679 measured.** `scripts/handpass/lw-phone-head-measure.mjs` wrote every control's words, box, padding, type size
and colours at 431, 768 and 1440 wide, for an admin (open and closed) and a member, on the build BEFORE the change and
on the build after: **nine files of nine are byte for byte the same.** On a phone the grid starts at 182px at every
width (360: 282 before; 390: 279; 430: 243) — eleven names on screen where six fitted, counted the way the drawing's
own script counts them (`scripts/handpass/lw-phone-head-mock.mjs`, its "today" picture run on the built page).

**Pictures opened by the host:** 14 of the 28 (the two lines at 390 and 360; the stage menu at open and at the end of
the cycle; DRAFT; the 365-day line at 360 and its list at 390; the New-period sheet; Legend; the other period; the
phone on its side; the member; the desktop), and the before and after of 390 and 1440 from the measurement.

## 6. What the tests carry

| Test | What it proves | Through the real controls? |
|---|---|---|
| `src/leavewar/ui/phonehead.test.tsx` (28) | On a phone: which words go, "+", the dates without a year, "Under N days", an admin's stage a button whose menu holds both moves, each move in both orders, the end of the cycle, every way the menu closes, a member's label. On a desktop and a tablet (reached two ways): everything as it was. The width is followed live. | The component's own buttons, pressed; no layout (jsdom has none) |
| `src/leavewar/ui/dates.test.ts` (4 added) | The year is dropped only where both dates are in one year; a single day is said once; every timezone | The calculation, called directly |
| `e2e/leavewar.spec.ts`, phone, four tests | Two lines at 390, 360 and 430: no overlap, nothing off the screen, 84px at most, the chips one height, the arrow painted; the menu inside the screen, on top, its rows 38px or more; a tap outside, Escape; each move from the menu; a member; a 14-letter callsign ends in "…" and the picker does not give way | A real browser, the page's own controls (the long callsign is written into the roster directly — the test is about the chip, not the rename) |
| `e2e/leavewar.spec.ts`, desktop, one test | At 1440, 768 and 431: the four label words, "+ New", the stage a label, both moves in sight, the dates with their year, each control's own padding and type size, no menu; the moves work from the strip. **It passes on the build from before the change too** — it describes the desktop as it was. | A real browser |
| Eleven older browser tests that move the stage | Unchanged in what they assert; they now reach the move the way a person does at that size (`e2e/app.ts stageMove`) | A real browser |

## 7. The break tests, and errors seen

- **31 rules broken one at a time** (`scripts/handpass/breaks/2026-10-08-lw-phone-header.json`): 31 caught by a named
  unit test.
- **12 layout rules broken one at a time, the app rebuilt each time**
  (`scripts/handpass/breaks/2026-10-08-lw-phone-header.browser.json`, by the new `scripts/handpass/breaks-browser.mjs`):
  12 caught by a browser test — among them "no phone rule reaches a tablet or a desktop" and "the words and the layout
  change at the same width", each way.
- **Red first:** on the build from before the change the four phone tests and the two adapted ones failed (6) and the
  desktop's passed.
- **Errors in the browser during the walk:** none.
- **Three runs of the walk stopped on the walk's own script, not on the app** — read against the picture before being
  called anything: it asked the driver to tap a button that lies under the menu's scrim (the driver waits; a finger
  does not — it now taps by position); it used the wrong name for the top bar's Undo; and it reloaded a page opened
  "memory only", which by design forgets everything (it now opens the page with real storage).

## 8. What the walk found, and each disposition

| # | Found | Disposition |
|---|---|---|
| 1 | With the drawing's 7px side padding, line 2 was one pixel too long at 390 on this PC and Legend fell to a third line (seen in the first measurement, before the walk). | FIXED before the walk: 5px, which leaves 15px to spare at 390 — room for his iPhone's own font, which cannot be measured here. Pinned by the browser test; break 9 of the layout list. |
| 2 | The "▾" letter made the stage button 3px taller than its neighbours (it comes from a fall-back font). | FIXED: a drawn triangle. Pinned ("the four chips of line 2 are one height"). |
| 3 | On a 360px phone, with 100 or more under-manned days, Legend drops to a line of its own (three lines). | BY DESIGN — the safety net: nothing is lost or pushed off the screen. Told to him. |
| 4 | NOT this change, seen while measuring: between 431 and about 700 wide — the largest iPhones are 440 wide — the top area is at its TALLEST (the grid starts 354px down). D679 keeps everything wider than a phone as it is. | FILED — `OUTSTANDING.md` `[LW-HEAD-BIG-PHONE]`, a question for him. |

## 9. What was NOT walked, and why

- **His iPhone.** Every phone picture is this PC's browser at a phone's size, in this PC's font. Whether line 2 holds
  one line in Apple's font is his look (the first item of the look card).
- **The "No leave period yet" page** — nothing of this change is drawn on it (§3).
- **The stage menu with a war's sheet or a movable window open over it** — it sits under them by the same rule as the
  two pop-outs beside it; not driven.
- **A period whose bidding dates fall in two different years** — the rule is carried by `dates.test.ts`; no such
  period is in the demo squadron, and none was made for the walk.

## 10. The gates

One run under the PC lock on the finished code — the counts are in `HANDOFF.md` §Gate baseline.

## 11. His look — a minute, on his phone

1. Leave War, as an admin: are the top two lines two lines on YOUR phone — "Legend" on the same line as the stage?
2. Tap the stage ("OPEN FOR BIDDING ▾"): the two moves. Tap outside: it goes.
3. The same page on the desktop: nothing has moved.
