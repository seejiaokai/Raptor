# Walker A — the windows-and-Escape batch, 24 Oct 26

Walker: Sonnet 5.5 (D588). Build served at `http://localhost:4296` (page names `index-BfCwF2UF.js`, checked). Driver: `scripts/handpass/lib.mjs`
plus the walker's own helper. Desktop 1440×900 and phone 402×874 with touch, admin `ad`. Pictures:
`docs/img/handpass/2026-10-24-windows-escape/A/` (names below are the picture's file name without `.png`). Scripts and logs are in the walker's scratch
folder (`scratchpad/walk/A/`: `d1.mjs`, `d4.mjs`, `d6.mjs`, `d10.mjs`, `d13.mjs`, `d13b.mjs`, `d14w.mjs`, `b2.mjs`, `p1.mjs`, `p5.mjs`).
Every run opened its own fresh browser context; all browsers were closed.

**Totals: PASS 21 · FAIL 1 · RECORDED 1 · NOT WALKED 0.** (D5's RECORD item is inside its PASS row; B1 is the RECORDED one.)

## Setup facts that changed how the brief's selectors were used

- The board's element stays in the page, hidden, after it closes; "board open" was read from `window.SBDAY` plus the element being visible, never from the element's presence.
- The board closes with `#sbDone` (✓ Done); there is no "Close" button now.
- A "held" window's Tab stops, read in order (Duty templates): the first stop is the first tab (STANDARD), the ✕ (`#tplClose`) is the LAST stop, and Tab from the ✕ wraps to the first stop.
- On the Inputs page the window `#inpEditPop` is itself the box (class `inpedbox`); on the week it is `#inpEditPop .inpedbox`. D11 and D12 used `#inpEditPop` as the window.
- The Inputs calendar opens on October 2026 (empty); the demo data is July 2026 (‹ three times). A bar click opens the input's window.
- "Press its first control" for the hold checks means: with the keyboard on the window's box, Tab once (first stop), then Shift+Tab, expecting the ✕.

## Desktop 1440×900

For every held window, the hold test was: Tab 25 times then Shift+Tab 5 times, checking after each press that `document.activeElement` is inside the window box. "Held" below means no press left the window (`leaveTab: null`, `leaveShift: null`).

| id | size | what I did | what the screen showed (observed) | verdict | pictures |
|---|---|---|---|---|---|
| D1 | 1440 | Monday's board → focus "+ Block", Enter → click pencil. Hold test. Shift+Tab from first stop. Escape. | Open; keyboard on the window box (`DIV modal-box tabindex=-1`), inside. First stop `BUTTON tpl-tab on`; Shift+Tab from it → `BUTTON x#tplClose`. 25 Tab + 5 Shift+Tab: never left. Escape: window hidden, board open (SBDAY 0), keyboard on `BUTTON data-dwadd=0 "Add a duty block"`. | PASS | D1-open-1440, D1-held-1440, D1-afteresc-1440 |
| D2 | 1440 | Focus `#sbTpl`, Enter → click Manage templates. Hold test. Escape. | Open, inside. First stop `BUTTON abtn primary` (Done); Shift+Tab → `BUTTON x#daytplClose`. Held. Escape: closed, board open, keyboard on `BUTTON#sbTpl`. | PASS | D2-menu-1440, D2-open-1440, D2-afteresc-1440 |
| D3 | 1440 | `#sbTpl` → "+ Save this day as a template". Escape. Reopen Templates menu. | Menu before: "No saved templates yet". Window opens on the new template ("TEMPLATE 1 — 2 waves · 2 duty blocks · 9 ground rows · 8 sims"), keyboard inside (box). Toast "Saved as 'Template 1'". Escape: closed, keyboard on `#sbTpl`, board open. Menu again lists "Template 1 — 2 waves · 2 duty blocks · 9 ground rows · 8 sims". | PASS | D3-open-1440, D3-afteresc-1440, D3-menuagain-1440 |
| D4 | 1440 | Week → Monday's plans selector → "+ Alt Plan" (menu now lists Plan A, Plan B "live now") → focus selector, Enter → Manage plans. Hold test. Escape. | Open, inside. First stop `BUTTON tpl-tab on`; Shift+Tab → `BUTTON x#draftsClose`. Held. Escape: closed; keyboard on `BUTTON planselbtn data-planmenu=0` (title "Plan B — tap to switch plan…"). | PASS | D4-menu2-1440, D4-open-1440, D4-afteresc-1440 |
| D5 | 1440 | Plans selector → Plan A's pencil → name box (value "Plan A"), End, typed " X" (box read "Plan A X"), no Enter → Escape. Reopened the plans menu. | Window closed; keyboard on the plans selector. **RECORD:** the plans menu before and after reads identically: "PLANS — MONDAY \| Plan A tap to make it the live day \| Plan B ●live now — this is what publishes \| + Alt Plan \| Manage plans". Plan A unchanged. | PASS | D5-open-1440, D5-typed-1440, D5-menuafter-1440 |
| D6 | 1440 | Board → focus "+ Wave" (`data-wvadd=0`), Enter → click ⚙. Hold test. Escape. | Open ("Flying waves" window, box width 480), inside. First stop `BUTTON wvmng-eye`; Shift+Tab → `BUTTON x#waveTplClose`. Held. Escape: closed, board open, keyboard on `BUTTON mbtn add data-wvadd=0 "Add a flying wave"`. | PASS | D6-menu-1440, D6-open-1440, D6-afteresc-1440 |
| D7 | 1440 | Board open → focus `#sbInsights`, Enter. Hold test. Escape. | Open, inside. First stop `BUTTON insights-show-all`; Shift+Tab → `BUTTON x#insightClose`. Held. Escape: Insights closed, board still open, keyboard on `BUTTON#sbInsights`. | PASS | D7-open-1440, D7-afteresc-1440 |
| D8a | 1440 | Board closed (✓ Done; SBDAY null), Edit Schedule → focus `#insightBtn`, Enter. Hold test. Escape. | Open, inside; Shift+Tab from first stop → `#insightClose`; held. Escape: closed, keyboard on `BUTTON#insightBtn`. | PASS | D8-edit-open-1440, D8-edit-afteresc-1440 |
| D8b | 1440 | Same on View-only Sched (CURPAGE `viewsched`). | Identical: held, Escape closes, keyboard on `BUTTON#insightBtn`. | PASS | D8-view-open-1440, D8-view-afteresc-1440 |
| D9 | 1440 | Admin → Squadron config tab → focus `#admDutyTpl`, `#admDayTpl`, `#admWaveTpl` each, Enter. Hold test. Escape. | Each opens, inside, held (Duty: `#tplClose`, Day: `#daytplClose`, Wave: `#waveTplClose` reached by Shift+Tab from the first stop). Escape closes each and the keyboard is back on the same Admin button (`BUTTON#admDutyTpl`, `#admDayTpl`, `#admWaveTpl`). | PASS | D9-admDutyTpl-open-1440, D9-admDayTpl-open-1440, D9-admWaveTpl-open-1440, and `…-afteresc-1440` for each |
| D10 | 1440 | Edit Schedule week: focus an input's label, Enter, two labels tried: a SANS card ("CP Tally O F PM") and a Personal-input tag ("OML"). Hold test. Escape. | Both: opens, keyboard inside (`DIV airpop-box inpedbox`); first stop `SELECT#inpEditPerson`; Shift+Tab → `BUTTON x#inpEditClose`; held. Escape closes it. **RECORD:** the keyboard went back to the SAME label (`data-inpedit` equal to the one opened from; the week was not redrawn): `BUTTON sanscard data-inpedit=…` and `BUTTON ntx inpedit data-inpedit=… txt=OML`. | PASS | D10-sanscard-open-1440, D10-sanscard-afteresc-1440, D10-ntx-open-1440, D10-ntx-afteresc-1440 |
| D11 | 1440 | Inputs page (July 2026) → clicked Gambit's "Fly with" bar → focused the window's first box (`SELECT#inpEditPerson`, inside) → Tab up to 40 times. | The keyboard LEFT the window at Tab press 16, onto `BODY class=in-cal`; the window stayed open (page behind works with it). The window did not hold the keyboard. | PASS | D11-afterTabs-1440 |
| D12 | 1440 | Inputs page → Grit's ATT C (medical) window → Document row's hidden file box `setInputFiles` a generated 160×100 PNG → chip "doc.png" appeared → Save (window closed) → reopened it → pressed its paperclip "View the document" (`data-testid=inped-docview`) with Enter. Hold test. Escape. | Viewer opens ("Grit · ATT C · Jul 13 → Jul 17", "1 of 2"), keyboard inside (`DIV airpop-box docviewbox`). First stop `BUTTON#docViewNext`; Shift+Tab → `BUTTON x#docViewClose`. Held. Escape: viewer closed. (Note: the paperclip used is the one inside the request's own window; I did not find a separate paperclip on a list row, the list being empty for July.) | PASS | D12-attached-1440, D12-viewer-1440, D12-afteresc-1440 |
| D13a | 1440 | Board → focus `[data-lcx="0.0.0.0"]` (a flying line's CX), Enter → the dialog (`#cxPop`) → click its ✕ (`#cxClose`). | Before: keyboard on `BUTTON mbtn data-lcx=0.0.0.0`. Dialog opens with the keyboard on `INPUT#cxReason` (inside). After ✕: dialog closed, the keyboard is on `BODY class=sb-lock sb-board-up`, NOT back on the CX button. The same CX button is still the same page element (tagged before, found tagged after, so not redrawn). Repeated 4 ways in `d13b.mjs`: Enter + ✕ click, Enter + Escape, mouse click + ✕, and the line below's CX: all end on `BODY`. | **FAIL** (observed `BODY class=sb-lock sb-board-up`, expected the CX button) | D13-cx-open-1440, D13-cx-closed-1440 |
| D13b | 1440 | Board → focus `#sbSortAll`, Enter → Sort all dialog (`#sortAllPop`) → click `#sortAllClose`. | Before `BUTTON#sbSortAll`; dialog opens with the keyboard on its box (inside); after ✕ closed and the keyboard is on `BUTTON#sbSortAll` again. | PASS | D13-sortall-open-1440, D13-sortall-closed-1440 |
| D14a | 1440 | Board, line 0.0.0.0: dragged the front-seat man (Saber) off to the crew list, pressed the empty front seat (ARM `0.0.0.0.p`). Typed `ZZTOP` into the line's callsign box, Tab. | Strip before: "Planning FCP · VL BFM". After: "Planning FCP · ZZTOP BFM"; the seat is still picked (ARM still `0.0.0.0.p`). | PASS | D14-board-armed-1440, D14-board-typed-1440 |
| D14b | 1440 | Edit Schedule week (fresh world), same line: dragged the man off, pressed the empty front seat, clicked the callsign (`ff:0.0.0.cs`), Ctrl+A, typed `ZZTOP`, Tab. | Strip before: "Planning FCP · VL BFM". After: "Planning FCP · ZZTOP BFM"; ARM still `0.0.0.0.p`. | PASS | D14-week-armed-1440, D14-week-typed-1440 |

## Break tests (desktop)

| id | size | what I did | observed | verdict | pictures |
|---|---|---|---|---|---|
| B1 | 1440 | Duty templates open, pressed Escape twice quickly. | **RECORD:** both presses: the window closed on the first; after the second the board is still open (SBDAY 0), keyboard on `BUTTON data-dwadd=0`. The second Escape did nothing visible. A separate check (`b1b.mjs`): a bare Escape on the open board with no window open does not close the board either (board still open, keyboard on `BODY`). | RECORDED | B1-after2esc-1440, B1-bareEscape-1440 |
| B2 | 1440 | Duty templates open, clicked an empty spot of the window (its title strip; the point was checked to be inside the box and not on a control), then Escape. | After the click the window stays open, keyboard on the window box (inside). Escape: window closed, board open, keyboard on `BUTTON data-dwadd=0`. (A first attempt that clicked 4px inside the box's corner landed on the backdrop and closed the window; it was discarded and redone.) | PASS | B2-clickbody-1440, B2-afteresc-1440 |
| B3 | 1440 | Duty templates → closed by clicking its ✕ → then `#sbTpl`, Enter, Manage templates → Escape. | After the ✕ click the keyboard is on `BUTTON data-dwadd=0` (the opener's button). The Day templates window opened inside; after Escape it is closed, board open, keyboard on `BUTTON#sbTpl`, never on "+ Block". | PASS | B3-afteresc-1440 |
| B4 | 1440 | Board open: Insights (`#sbInsights`) Escape, then Duty templates (via "+ Block" menu) Escape, without closing the board. | After the first Escape only Insights closed (board open, keyboard `#sbInsights`); after the second only Duty templates closed (board open, keyboard on `BUTTON data-dwadd=0`). | PASS | B4-end-1440 |

## Phone 402×874, touch

Taps were `page.touchscreen.tap` at the centre of the control's box, after the box was checked to be on screen (brought on screen with a real wheel scroll). A held-touch picture was taken about 90 ms after each tap (`…-tap-phone`) and a settled one after (`…-phone`). "Scrolled" below means every scrolling element's offset, read right before and after the tap that opened the window.

| id | size | what I did | observed | verdict | pictures |
|---|---|---|---|---|---|
| P1 | 402×874 | Week → tapped Monday's "Jul 13 · Today" (board opened) → tapped "+ Block" → tapped the pencil → looked → tapped ✕ (`#tplClose`). | Window box x12 y224 w378 h427: centre y 437 = the middle of the 874 screen (offset 0), wholly on screen. Scroll before and after the pencil tap: window 0 and the board's scroller 2400, both unchanged. Active element `DIV modal-box` (not a text box). ✕ closes it; board still open. | PASS | P1-block-menu-tap-phone, P1-block-menu-phone, P1-open-phone, P1-close-tap-phone, P1-close-phone |
| P2 | 402×874 | Board closed (✓ Done by tap) → tapped Monday's plans selector → "+ Alt Plan" → selector again → "Manage plans" → looked → tapped ✕ (`#draftsClose`). | Window x12 y306 w378 h263: centre y 437 (offset 0), wholly on screen. Scroll 0 before and after. Active element the box, not a text box. ✕ closes it. | PASS | P2-menu-tap-phone, P2-open-phone, P2-close-phone |
| P3 | 402×874 | Edit Schedule → ⋯ (`#editSchedMore`) → "Insights" → looked → tapped ✕ (`#insightClose`). | Opens: box x12 y12 w378 h850 (centre y 437), wholly on screen. Scroll 0 before and after. Active element `BUTTON x#insightClose` (a button, no text box focused). ✕ closes it. | PASS | P3-more-tap-phone, P3-open-phone, P3-close-phone |
| P4 | 402×874 | Week → tapped the "OML" tag of an input (a Personal input of Vector, 13 Jul, found at scroll 3000) → looked → ✕ (`#inpEditClose`). | Window ("Vector · 13 Jul") x12 y192 w378 h491: centre y 437 (offset 0), wholly on screen. Page scroll before and after the tap: both 3000 (the page did not scroll). Active element `DIV airpop-box inpedbox` (not a text box). ✕ closes it. | PASS | P4-tap-tap-phone, P4-open-phone, P4-close-phone |
| P5 | 402×874 | Board → tapped "+ Line" on wave 1 (a blank line 0.0.2.0 with empty seats appeared; no seat was empty on Monday before) → tapped its empty front seat (ARM `0.0.2.0.p`; the crew list slid in) → tapped the line's callsign box, typed `ZZTOP`, tapped elsewhere (neutral spot at left). | **RECORD:** strip before: "Planning FCP" (the blank line names the seat alone). After: "Planning FCP · ZZTOP"; seat still picked (ARM `0.0.2.0.p`); the box reads `ZZTOP`. | PASS | P5-seat-tap-phone, P5-armed-phone, P5-typed-phone |

## Errors seen

None. Every run watched console errors, page errors and 4xx/5xx responses (the empty list printed at the end of each run).

## Surprises (one line each)

- **D13 CX dialog does not give the keyboard back:** after the CX question closes by ✕ or Escape the keyboard sits on the page body, not on the CX button; the Sort all dialog does return it.
- **D12:** with the request's window open on the Inputs page and the document viewer on top, one Escape closed the viewer AND the request window behind it (afterwards `editStillOpen` false, keyboard on `BODY`); Escape on a lone request window on the Inputs page was not walked, so I cannot say whether that pairing is old behaviour.
- **D11:** the keyboard leaves a request's window on the Inputs page onto `BODY` (not a next control of the page) at press 16, and nothing closes the window.
- The board never closes on Escape (with or without a window); the brief's "if the board itself closes on Escape" does not apply.
- On the week, Escape on a request's window returned the keyboard to the very label that opened it (D10), including for a SANS card.
- The first run of the phone exploration tapped Monday's date once right after login and the board did not open; the same tap after scrolling to the top worked (not investigated, it may be the script's first touch landing as a scroll).
