# M3 re-walk (the fixes' walk) — build c9b80c00c, served on :4301

Walker: Sonnet. Sizes: phone 402×874 (touch, iPhone 13 user agent) and desktop 1440×900. Engines: Chromium for everything, WebKit (iPhone-shaped touch / mouse) where marked ⓦ.
Pictures: `raptor-port/docs/img/handpass/2026-10-24-lw-m3/R/` (call it `R/`; the first round's pictures in `A/ B/ C/` are untouched). Phone taps have a `-q` picture (about 100 ms after the lift, pointer left where it pressed) and a settled one.
Scripts: `raptor-port/scripts/handpass/lw-m3-rewalk-lib.mjs`, `lw-m3-rewalk-r1.mjs` … `r8.mjs` (+ `r3b`). Console errors, page errors, failed requests: **none** in any run. Server on :4301 stopped by its port at the end.
Every picture named below was opened unless marked "not opened"; for each phone tap I opened the one that decides.

## Table

| Item | Size | Engine | Result | Pictures (in `R/`) | What they show |
|---|---|---|---|---|---|
| 1 untick/tick by the box and by the words | desktop | Chromium | PASS | `r1-dk-cr-01-box-untick`, `-02-box-tick`, `-03-words-untick`, `-04-words-tick` | Each mouse click flips the tick; unticked: the eight leave buttons have no fill and a dashed outline; ticked again: filled (not opened one by one: read from styles; `-01` opened) |
| 1 | desktop | WebKit | PASS | `r1-dk-wk-01…04` | Same four presses, same result (read from the page; pictures not opened) |
| 1 | phone | Chromium | PASS | `r1-ph-cr-01…04` with `-q` | Same by finger; styles read each time; `-q` of 03 opened earlier in the walk: unticked, buttons hollow/dashed, no tint |
| 1 | phone | WebKit | PASS | `r1-ph-wk-01-box-untick-q`, `-01-box-untick`, `-03-words-untick`, `-02/-04` | A tap on the box and a tap on the words both untick and tick again in WebKit; quick and settled pictures both show the empty box and eight dashed hollow buttons |
| 2 one-day window beside the drawing | phone | Chromium | PASS with differences (below) | `r2-ph-member-02-window`, `r2-ph-member-03-window-only` (calm day), `r2-ph-member-red-03-window-only` (day where Available P turns red) | Day line is a rounded box across the window; "Which leave" stands to the LEFT of two rows of four buttons; Date, Duration, Document, Remarks rows each 30–31 px |
| 3 tap the 2 Jan heading at 2/5/8/12/16 px and centre; 1 Jan and 3 Jan centres | phone | Chromium | **FAIL** (2, 5, 8 px open 1 Jan; 12, 16, centre open 2 Jan; 1 Jan and 3 Jan centres PASS) | `r3-ph-cr-01…08-*-q/-settled`; sweep text in this report | At 2, 5, 8 px in, the panel reads "Thu 1 Jan"; at 12, 16 px and the centre it reads "Fri 2 Jan" (`r3-ph-cr-05-01-02-16px-q` opened: "Fri 2 Jan") |
| 3 | phone | WebKit | **FAIL** (2, 5, 8, 12 px and the centre open 1 Jan; 16 px opens 2 Jan; 1 Jan and 3 Jan centres PASS) | `r3-ph-wk-01…08-*-q/-settled` | `r3-ph-wk-06-01-02-centre-settled` opened: finger on the middle of the 2 Jan heading, panel reads "Thu 1 Jan" (PH, Drifter OL) |
| 4 panel opens low, grid above | phone | Chromium and WebKit | PASS | `r4-ph-cr-01-heading-tap-q`, `r4-ph-cr-02-panel-open`, `r4-ph-wk-…` | Tap on 10 Jul heading: panel top at y 285 of 874 (height 577; 12 px of screen below it); the top bar, month buttons, date row and the Event 1 row stay in view above it, so the grid is not a 12 px strip |
| 4 ‹ › the app's buttons, finger-sized | phone | Chromium and WebKit | PASS (with a size remark) | `r4-ph-cr-02-panel-open` | ‹ and › are the app's `abtn` buttons, 36×32 px, same dark fill and 1 px edge as other app buttons; ✕ is 44×44. 32 px high is under a 44 px finger target |
| 4 31 Dec 26 → 1 Jan 27 shows the year | phone | Chromium and WebKit | PASS | `r4-ph-cr-05-dec31-q`, `-06-dec31`, `-07-step-q`, `-08-jan1-27`; `r4-ph-wk-…` | Title "Thu 31 Dec" then after › "Fri 1 Jan 27" ("Not open for bidding", Away · 0); `r4-ph-wk-08-jan1-27` and `r4-ph-cr-07-step-q` opened |
| 5 list: leave with a file has a paperclip | phone | Chromium | PASS | `r5-ph-01-list-ranger` | Card "Ranger LL" 20 Jan: paperclip beside the till date; Ranger LL 27 Jan: "No document" in the same place |
| 5 list: tap on the paperclip opens the document | phone | Chromium | PASS | `r5-ph-03-clip-tap-q`, `r5-ph-04-after-clip` | A window "Ranger · LL · Jan 20 → Jan 22" opens with the file in a white frame (my test PDF has no page content, so the frame is blank white) |
| 5 list: every bare leave card says "No document" (24 of 24), every bare medical card (3 of 3), no duty/other card (12) says it, a card with a file never says it | phone | Chromium | PASS | `r5-ph-01-list-ranger`, `r5-ph-02-list-medical`, `r5-ph-02-list-duty` (last two not opened; counts read from the page) | counts as written |
| 5 Inputs calendar opened day (Jan 2026, 16 days opened): leave with a file | phone | Chromium | PASS | `r5-ph-07-day-leave-clip-01-20` (and `r5-ph-06-day-20` first pass) | Day panel "Tue 20 Jan", card Ranger LL with paperclip and "till 22 Jan" (3 of 3 cards of the file leave show the clip) |
| 5 calendar day: bare leave / bare medical / duty | phone | Chromium | PASS | `r5-ph-07-day-leave-nodoc-01-01`, `-medical-nodoc-01-05`, `-duty-none-01-12`, `r5-ph-06-day-27` | Bare leave (8 of 8) and bare ATT C (3 of 3) read "No document" in the card's top line; a CSE duty shows neither |
| 5 list and calendar day, all four kinds | desktop | Chromium | PASS | `r5-dk-01-list-ranger`, `r5-dk-04-after-clip`, `r5-dk-07-day-leave-clip-01-20`, `-leave-nodoc-01-01`, `-medical-nodoc-01-05`, `-duty-none-01-12` | Table row 20 Jan has the paperclip at the right, 27 Jan reads "No document"; the paperclip opens the same document window; the day panel's card carries the clip; counts: bare leave 24/24, bare medical 3/3, duty 0 of 12 |
| 6 remark kept after ✕ pressed with the cursor still in the box | phone | Chromium | PASS | `r6-ph-cr-a-cross-1-typed`, `-2-cross-q`, `-3-closed`, `-4-reopened` | Typed "cross remark", pressed ✕, window closed; reopened window (NOW LL) shows "cross remark" in the Remarks box; the `-q` picture shows only the grid and a "Saving…" pill over the OIL tab |
| 6 same with Escape | phone | Chromium | PASS | `r6-ph-cr-b-escape-1-typed`, `-3-closed`, `-4-reopened` | "escape remark" kept (read from the box; pictures not opened) |
| 6 both | desktop | Chromium | PASS | `r6-dk-cr-a-cross-*`, `r6-dk-cr-b-escape-*` | Same two results (read from the box; pictures not opened) |
| 7 the ask's sentence in ordinary letters | desktop, phone | Chromium | PASS | `r7-dk-cr-04-the-ask`, `r7-ph-cr-04-the-ask` | "No document — Ranger, LL" / "Attach the approval from the leave app now, or file it and attach it later." in sentence case (computed text-transform none); [No document] and [Upload] buttons (phone picture opened) |
| 7 "No document" files it, focus returns to + Input | desktop, phone | Chromium | PASS | `r7-dk-cr-06-after-nodoc`, `r7-ph-cr-05-nodoc-q`, `r7-ph-cr-06-after-nodoc` | Ask gone; the list row reads "No document"; `document.activeElement` is the button with id `inNew` ("+ Input") on both sizes. No focus ring is drawn on it in the picture (see Observations) |
| 8 top row one line, Calendar view and List view | desktop 1440 (also 1536) | Chromium | PASS | `r8-dk1440-calendar-top`, `r8-dk1440-list-top`, `r8-dk1440-list-filtered-top`, `r8-dk1536-…` | Calendar view: tabs, ‹ OCTOBER 2026 ›, Today, Calendar/List, Everyone, All types, Search, gear all on one line (centres within 0.5 px; all 36 high). List view and a filtered list the same |
| 8 type list offers the three families | desktop 1440, 1536 | Chromium | PASS | `r8-dk1440-type-select` (shows the closed box only) | Options read from the box: All types · [Leave] All leave, LL, OL, OIL, CCL, PL, FCL, EL, CL · [Medical] All medical, HL, OML, ATT C, ATT B, Upchit · [Duty & other commitments] All duty & commitments, Training, CSE, Meeting, Fly with, Personal, Appointment, Duty, Event, OD, Other |

## Item 2 in numbers (phone 402 wide, Chromium)

Built, member opening an empty open day (`r2-ph-member-02-window`): window 378 wide. Title bar 37; day line 50 (two lines: "Available P 28 → 27" and "No manning row turns amber or red"); Date 30; Duration 30; Document 30; Remarks 31; Which leave 66 (two button rows of 30 with a 6 gap; label "Which leave" stands at x 13–93, buttons begin at x 99). Window height 338.
Built on a day where Available P turns red (`r2-ph-member-red-03-window-only`): day line 32 (one line, "Available P 28 → 27 · red"); window height 320; other rows the same.
The drawing (`docs/mock/lw-overhaul/full/r9-remarks-bid-phone.png`, 1170 px wide, read at 3× so ±1 px): Date, Duration, Document, Remarks rows 30 each; day line about 27; leave buttons about 27.5 each with a 6 gap (block about 61).
What now matches: the day line is a rounded bordered box across the window (border 1 px, radius 10); "Which leave" is at the left of two rows of four; rows Date/Duration/Document/Remarks match the drawing's 30.
What still differs: (a) day line 32 high in the red state (drawing about 27) and 50 when the calm second line shows; (b) leave buttons 30 high, block 66 (drawing about 27.5 and 61); (c) the day line's words: built is all red on a red day (`Available P  28 → 27 · red`), the drawing has "Available P" white, the "before" figure amber and "→ after · red" red; (d) the drawing's Remarks row has no "till 24 Feb" tick (built has the tick, as ruled since); (e) the drawing's leave buttons show a bold balance in brighter colour ("LL 14.5"); built shows "LL 0" in dimmer colour because this member's balance is 0.

## Faults

**F1 — Phone: a tap on the left part of the 2 Jan heading opens 1 Jan (still there after the fix; Chromium and WebKit).**
Steps: phone 402 wide, admin, press JAN so the grid starts at 1 Jan; a finger at the stated distance in from the left edge of the 2 Jan heading (heading box x 127.8–147.0, 19 px wide; y centre).
Seen (Chromium): 2, 5 and 8 px in open "Thu 1 Jan"; 12 px, 16 px and the centre open "Fri 2 Jan". (WebKit): 2, 5, 8, 12 px and the centre (x 137.4) open "Thu 1 Jan"; only 16 px opens "Fri 2 Jan". 1 Jan's centre opens 1 Jan and 3 Jan's centre opens 3 Jan in both engines.
A sweep with a finger every 2 px along the date row (`r3b`), the element under the finger by `elementFromPoint` against what opened: Chromium — x 128 to 134, under the 2 Jan heading, opens 1 Jan; 136 to 144 opens 2 Jan; x 146, under the 3 Jan heading, opens 2 Jan; 148 onward opens 3 Jan; 168 onward (4 Jan heading) opens 4 Jan. WebKit — x 128 to 138 (under 2 Jan) opens 1 Jan; 140 to 144 opens 2 Jan; 146 onward opens 3 Jan. So the day that opens is the one about 7 px (Chromium) or 11 px (WebKit) to the left of the heading under the finger at the 1 Jan / 2 Jan boundary; the 2 Jan / 3 Jan boundary is right in WebKit and about 1–2 px early in Chromium.
Expected: any tap inside the 2 Jan heading opens 2 Jan.
Pictures: `r3-ph-cr-01-01-02-2px-q`, `r3-ph-cr-01-01-02-2px-settled`, `r3-ph-wk-06-01-02-centre-q`, `r3-ph-wk-06-01-02-centre-settled` (opened: finger over the 2 Jan heading, panel "Thu 1 Jan"), `r3-ph-cr-05-01-02-16px-q` (opened: panel "Fri 2 Jan").
Engine: both. The same first-round fault; not fixed (it moved: Chromium used to fail at 2–5 px and pass from 8, now fails 2–8 px; WebKit used to fail 2–10 px and pass 12–16, now fails 2–12 px and the centre, passes 16).

**Not a fault of the fixes, seen on the sweep (for the host):** in both engines a tap at x 104 (on the "+LVE" corner cell of the date row, `elementFromPoint` = counter-head) opened the day panel on "Thu 1 Jan"; at x 106 nothing opened (Chromium). I did not take a picture of it.

## Observations (not faults)

1. Item 4: ‹ › are 36×32 px; the ✕ beside them is 44×44. If "finger-sized" means 44, they are under it (`r4-ph-cr-02-panel-open`).
2. Item 7: after "No document" the keyboard focus is on "+ Input" (`document.activeElement` id `inNew`), but no focus ring is drawn on it in either picture (`r7-dk-cr-06-after-nodoc`: the new row wears the blue just-added ring; "+ Input" looks as at rest). The browser draws a ring only for keyboard-started focus, so this may be as intended.
3. Item 5: the document window opened by the paperclip shows a blank white frame; my test PDF has no page content (`%PDF-1.4` stub), so I cannot say whether a real PDF renders.
4. Item 5: the desktop list row for 27 Jan reads "till 27 Jan", the phone card for the same input reads "All day". (Different layouts for a one-day input; not checked against a ruling.)
5. Item 6: the quick picture after the ✕ tap shows a "Saving…" pill over the OIL tab (as first-round observation 4); gone in the settled picture.
6. Item 8: with the list's default date range ("24 Oct → 7 Nov", today being 24 Oct) the three families list no rows ("No inputs 24 Oct – 7 Nov. Try All dates."); the first round used "All dates".
7. Item 3's pictures for 12 other taps (`r3-ph-*-q` and `-settled`) and many of the item 1 desktop pictures were read from the page's state rather than opened one by one.

## Limits

Phone WebKit was run for items 1, 3 and 4 (marked ⓦ); items 2, 5, 6, 7, 8 in Chromium only. Item 2 was walked as a member on the phone only, as asked (the admin's window at 402 wide also opened in item 1: `r1-ph-wk-01-box-untick-q`, title bar with the tick and ✕, day line in its rounded box, "Which leave" to the left). Item 5's leave-with-file was made through the app (admin, Pick a range 20–22 Jan, Document, LL ticked); the bare leave on 27 Jan the same way without a file.

Rulings: none recorded (a walker; no ruling made).
