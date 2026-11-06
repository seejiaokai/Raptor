# Bug check — every combination of entries on one Leave War day ([LW-CELL-COMBOS]), branch `claude/lw-cell-combos`

His D1723 and D1725, built from his picks D1726–D1731 (6 Nov 26): two whole days side by side and turned, a whole day beside a
half keeping the cell, a stack of cards for three or more, the "!" an outlined amber tag, his last day a yellow line, a gone
day's entry striped with no PO mark, one letter scale zoomed out, the Legend's "Marks on a day". Pull request 650.
Pictures: `docs/img/handpass/2026-11-06-lw-cell-combos/walk/` (the walk), `walk-break-main/` (the break test on today's live
app), `measure/` (every combination measured). The walk's own rows: `docs/img/handpass/2026-11-06-lw-cell-combos/w-rows-combos-desk-build.json`,
`…-phone-build.json` (and every run, tagged by build, in `w-rows-combos.jsonl`).

## 1. The eight answers and the tier
1 money — no: classes on a day's cell and stylesheet rules; no count, no OIL, nothing earned changes (the walk's Inputs-page
and reload steps read the same records). 2 published record — no. 3 saved data — no (nothing stored is added or read
differently). 4 shared drawer — YES: a day's boxes are drawn on the grid (and its pinned copies) and in the Legend from the
same classes. 5 gesture — no (the taps' handlers are unchanged; what each opens is walked anyway, D1725). 6 new surface — no
(a Legend section reworded and redrawn). 7 roles — no. 8 warnings — no. **Tier: WALK.** No security read (nothing of sign-in or
who may see what). The fresh Opus code read is not owed at WALK (the order's §5).

## 2. Roll-call — every place a day's boxes and marks are drawn
| Place | Has it / must not, because… |
|---|---|
| The grid's day cell (`MatrixRows.tsx PersonMonth`) — every combination | HAS IT — walk L-* (13 kinds of day on two men, both sizes); every combination measured (§5) |
| The grid zoomed out on a phone (0.8 opening, 0.4 at the pinch's end) and in (1.4) | HAS IT — the one letter scale (`table.mx.lw-small`, D1726); walk Z-scale at 0.8; 0.4 and 1.4 carried by the measure (§5) |
| The phone's pinned name column (`frozen-cols`) and the pinned date row | MUST NOT draw boxes — names and dates only; the class is set on them too so their letters match; walk rows pictured |
| The Legend's "Marks on a day" (`Chrome.tsx`) | HAS IT — the grid's own classes in a cell-sized frame (D1731); walk G-legend (read, measured, closed two ways) |
| The bid window, the day's list, a member's windows (`BidBits.tsx`, `LeaveLine.tsx`) | MUST NOT change — the new rules are scoped to `.mx td` and `.leg-box`; the windows' boxes pictured unchanged (walk T-*) |
| The Approvals list's kind box (`ApprovalsPage.tsx`) | MUST NOT change — same scope; not opened by this walk (no rule reaches it — scoped selectors, `boxcorners-css.test.ts`) |
| The Inputs calendar's bars | MUST NOT change — another stylesheet; walk U-inputs pictured the page |
| A gone day with nothing filed | HAS its bare "PO", unboxed and unstriped (D1728) — walk L-bare-weekend |
| His last day in | HAS the yellow line (`.polast` drawn as a line, `bx-last`) — walk L-last-or-half on Diesel |

## 3. The walk's size (D607)
1. **Type:** E (the look of a day's cell) and D (a mark drawn on the grid and in the Legend).
2. **What only a walk finds:** whether real entries made through the app's own doors land in the combinations the measure
   assumed; the boxes beside what a tap opens on a man here and a man posted out (lesson 23); the Legend open and closed;
   the plain-user round (Undo, Redo, a reload, the Inputs page).
3. **The ledger:** type D walks found a fault in 10 of 10; type E in 4 of 10; the two latest Leave War walks (D1720, D1722)
   were the host alone with one script at 1536 and 402 — and lesson 23 came from the first of them.
4. **Chosen:** the host alone, one script (`scripts/handpass/lw-cell-combos-walk.mjs`), desktop Chromium 1536 and phone
   WebKit 402, 13 kinds of day on Vapor (here) and Diesel (posted out from Thu 17 Dec), every made day measured on screen and
   tapped on both men, a picture right after each phone tap. Carried by the measure (named in §5): all 23,940 combinations at
   phone zooms 0.4 / 0.8 / 1.4 and desktop 1, with his iPhone's letters and wider ones — the same classes, laid into a real
   cell of the build; it sets the table's zoom as the pinch does, so the pinch itself (unchanged here) is not driven.
5. **Row added** to `docs/walk-ledger.md` after the walk.

**The §7.11 lessons, for this change:** 1 (a reading in one state) — each day read on a here man and a gone man, before and after
Undo / Redo and a reload. 2, 20, 21 (gestures) — no gesture changed; the drag window was driven to make every entry. 3
(feedback) — the tapped day's window pictured. 4 (the page behind a window) — not applicable: no window changed. 5 (a box
brought into sight) — not applicable. 6, 7, 21 (only his phone) — his iPhone's letters are what the measure's "system" set plays;
the look on his phone is on his look card. 8 (built to the drawing) — the build's figures matched the drawn design's on all
23,940 (the plan's step 3, 6 Nov 26); the walk's pictures beside `draw/sheet-*.png`. 9 (measured, not looked at) — every
combination measured. 10, 12 (pages hidden and shown) — not applicable. 11 (how much fits) — zooms 0.4 and 1.4 measured. 13, 15
(pinned parts) — the pinned column pictured at rest. 14 (boxes to type in) — none. 16 (a warning cleared) — none. 17 (a control
that resizes) — none. 18 (print) — none. 19 (a window over a window) — the Legend closed by Escape and by a tap outside. 22
(drawn, not present) — the boxes judged by their letters' place and by the pictures. 23 (a tap's window against the rulings) —
every made day tapped on a here man and a gone man; a bare gone day opens the posted-out sheet, as D1722 / D1725 rule.

## 4. The orders walked (both sizes)
| Step | What was done | Desk | Phone |
|---|---|---|---|
| S-made | Diesel posted out (Post out, Overseas Sqn, 17 Dec); on each man by the drag window: OD 7–9 Dec, LL 8–9, FO 9–10, OD 14–15, HO 15–16, LL AM 17–18, OL PM 17–18, a pending LL 21–22, OD 23–24, a pending LL 23–24; then on the Inputs page an LL on 21 Dec and on 24 Dec over the pending bids ("This replaces …'s LL bid") | PASS | PASS |
| L-* (13) | Each made day measured on screen (letters along each box's length inside it, none under the "!") and its marks read | 13 PASS | 13 PASS |
| T-* (13) | Each made day tapped on Vapor, then Diesel: the same window on both (bid window, or the day's list on a day of two or more) | 12 PASS, bare gone day RECORD (posted-out sheet, as ruled) | the same |
| G-legend | The Legend opened; "Marks on a day" read and measured; closed by Escape; reopened, closed by a tap outside | PASS | PASS |
| Z-scale | The grid at the zoom it opens at: the zoomed-out letters class only below 1 | PASS (1, none) | PASS (0.8, set) |
| U-undo-redo | Undo the last filing (Diesel, 24 Dec): the "!" goes, the pending bid back beside the OD; Redo brings it back | PASS | PASS |
| U-reload | A reload: all 13 of Diesel's days drawn the same | PASS | PASS |
| U-inputs | The Inputs page holds Diesel's filings (8) | PASS | PASS |
| errs | Console errors, page errors, failed requests | 0 | 0 |

## 5. Carried by a measure, not walked
`scripts/handpass/lw-cell-combos-measure.mjs OPT=build` (the cell as the built app draws it, laid into a real cell of the built
grid; each box's letters by their own pixels against the box, the corner tags and the Inputs edge). After the "!" fix
(commit "the "!" beside two turned codes…", 6 Nov 26): **his iPhone's letters ("system"): 0 failures of 23,940 on the phone at
0.4, 0.8 and 1.4, and 0 on the desktop** (96 and 97 before the fix — the red). Wider letters ("wide", Verdana — a stress set
wider than his phone's): 769 on the phone and 1,034 on the desktop (2,497 and 1,516 before; today's live app 55,731 and 21,612),
what is left the four-letter codes ATCH, APPT, PERS already at their smallest size. **The stricter rim pass** (`CLEAR=1`: a
letter touching its box's own edge line counts too) against today's live app built the same way: phone 62,776 → 41,837, desktop
21,231 → 15,230; worse only for "a whole beside a half" (today 98% touch, the build 100%): the half's box drawn over its own half
of the whole (his D1727) is about as tall as its capitals — a property of the drawn design, not a cut letter. Recorded, not
changed: shrinking it is a design change, his to rule.

## 6. The pictures
The walk's folder: the three weeks of each man at both sizes (`S-*`), each made day close (`C-*`; the phone's at three times
the pixels — the desktop's at its own, the browser kept its 1.25), every tap's window on both men (`T-*`, on the phone a
picture right after the tap, `*-0tap`), the Legend (`G-*`), Undo / Redo / reload and the Inputs page (`U-*`). The host opened
the deciding ones: `S-phone-Diesel-week2`, `-week3`, `C-alarm-two-phone-Vapor`, `C-am-pm-phone-Diesel`,
`C-whole-half-phone-Vapor`, `G-phone-1-legend-marks`, `T-alarm-two-phone-Diesel-0tap`.

## 7. The break test
The same walk run on a build of today's live app (`main` at the branch's base), desktop: red where the change is — the
combinations draw the old way (no turned boxes, no stack, the PO tag, the corner tiles): **10 of the 13 kinds of day FAIL**
(among them the "!" over the letters of a whole day and of a turned code), the Legend has no "Marks on a day" to read (the step
stops), and Undo / Redo then fails — the walk's own: the stopped Legend step left the Legend open, so the Undo press landed on it.
The three that pass there are the days this change leaves alone (one OD, one FO, a bare gone day). Rows: `w-rows-combos.jsonl`
(tagged `dist-main`), pictures `walk-break-main/`.
And the measure itself: red on the build before the "!" fix (96 / 97), green after.

## 8. What was NOT walked, and why
- The pinch itself on a phone (unchanged by this branch): its end zooms are carried by the measure, which sets the zoom the
  pinch writes; the class that follows it is walked at the opening zoom (Z-scale).
- A leave running across the posting date: the walk's entries on Diesel sit either side of 17 Dec, none across it; each
  side's drawing is walked, and the joined bar's rule is unchanged.
- His own iPhone: on his look card — the "!" corner and the turned codes on his device.

## 9. What the walk found, and each disposition
- **The "!" beside two turned codes cut the right code's letters** (the measure, before the walk: OML at zoom 1.4 and on the
  desktop) — FIXED: under a "!" a starred or three-letter turned code on the right is a size smaller; re-measured 0. Red first:
  the measure's 96 / 97.
- **A whole day's letters missing under a half on 15 Dec** (seen in the pictures) — NOT A FAULT: that OD runs 14–15 Dec as one
  joined bar, its code written once, on its first day (his D1359, `matrix.css .c.jl`); the letters stand where they should
  (`scripts/handpass/lw-cell-combos-probe-floor.mjs`).
- **Two of the walk's own checks were wrong on the first run** (a line box taller than a half's box read as a cut; a bare "PO"
  read as a box) — the script corrected (v2), its pictures and the measure agreeing; no app change.
- **The rim pass** — recorded in §5, his to rule only if he wants the halves' letters smaller.
- **The words that still described the corner tiles and the PO tag** (his D201 for D1727, D1728) — corrected: `docs/ui-contracts.md`
  (the box, the corner tiles), `MatrixRows.tsx` (three comments), `chrome.css` (one comment).

## 10. The gates
GitHub's run of pull request 650 on the "!" fix: 25 pass, 2 skipped (his PC's runner, the live deploy). A later push of this
sheet and the comments re-runs it.
