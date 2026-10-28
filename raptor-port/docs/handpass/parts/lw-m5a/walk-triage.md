# M5a — the walk's findings, triaged by the host (29 Oct 26, ~02:20) — walkers A, B, C (D to follow)

Reports: `walker-a.md` (60 PASS · 5 FAIL · 10 NOT WALKED), `walker-b.md` (76 · 5 · 8), `walker-c.md` (75 · 3 · 8); no console
error, page error or 4xx in any run. Build 92b43acf9.

## To fix, red-first (outright faults — D1426: fixed without asking)
1. **A-F3 — a box cuts a decimal figure:** 10.5 in PL and −12.5 in App bal show their last digit cut (`a5/50b-oil-crop`,
   `a5/54-wide-2560`). Every box must show its longest figure (−999.5) whole, desktop and phone, without moving the
   tile's or row's other columns (C saw the App bal box widen 42 → 53 for "16.5" and shift its tile's Pending / War bal by
   11px — the box keeps one width that fits).
2. **A-F4 — the pinned headings see-through on a desktop scroll:** scrolled down, a strip of the rows shows between the
   LVE / OTHER LEAVE band and the NAME heading line, box edges peek round the headings (`a8/80-scrolled-heading`,
   `a3/35-lock-on`) — the second sticky row pins 30px down while the first is shorter; the two must meet with no gap.
3. **A-F2 — the OIL column off its heading:** "0 ›" figures are left-set, 10–23px short of the OIL heading's right edge,
   varying 12.8px line to line (`a5/50b-oil-crop`); the drawing `m5b-b1-desk` sets them right — right-set, 0px against
   the heading, as every other column (measured 0px on all 50 lines).
4. **B-F2/F3 — a refusal's words run off a phone's screen and over the next row:** App bal 17.3 + Enter — "Type a whole
   number or a half, like 17 or 17.5" drawn from x −49 to 191 (Chromium `p4-refused-17.3`, WebKit `w-b3-refused`). The
   words stay inside the screen (and the sliding area), wherever the box is.
5. **B-F5 — the whole page scrolls on the phone's Balances page:** the document is 994 high on an 874 screen; a swipe from
   the tab row or My leave scrolls the page 75 points, the tab row going under the top bar (`y-window-scroll`, `k-glass`).
   The page must fit the screen as its inner scroll is meant to (no page scroll) — compare how Approvals and the OIL
   tracker's pages hold it.
6. **B-F4 — a tapped box's pending figure cut at the right edge:** tapping PL brings the box into sight but its amber
   "−0.5" after it is cut (`p2-tap-bal-PL-bane`) — bring the box AND its pending figure into sight.
7. **The phone's person window over the top bar:** top 33–45 where the drawing `m5a-p4-phone-own` has it under the bar (~70)
   — it covers the bar's lower half (B, C). It stands under the top bar.
8. **C-F2 — one Escape closes the document viewer AND the person window** (`c2/23c-viewer`, `c2/23d-after-first-escape`):
   Escape closes what opened last — the viewer first (design guide §3).
9. **C-F3 — focus goes to the page's body when the window closes,** not back to the name (or My leave, or the figure) that
   opened it (`c2/23d-after-first-escape`) — design guide §3.
10. **A-F1 — an emptied box + Enter (or left) puts the old figure back with nothing said** (`a1b/blank-enter`): an empty box
    shows the box's words — "Type a figure" in `balanceProblem`'s voice — and keeps the old figure; Escape still puts it back
    silently.

## Not a fault (as built, each with its reason)
- **B-F1 — the tab row drops its icons at 390:** reading 13 (D1492) says the tabs keep their icons from 400 wide and drop them
  under that; the brief's "390 kept" copied the spec's §7 step 9, which reading 13 (approved) overrides. As built.
- **C-F1 — a day cell pressed with the person window up opens the bid window, with its scrim, over the window's corner:** the
  bid window has always been the war's one window with a scrim (`scrim.test.tsx` pins it); the person window itself blocks
  nothing (D641). As built; named to him as a reading.
- The "who, when" ages read the PC's clock ("29 Oct 02:02") while the walk pinned the war's day to 25 Jan — the walk's
  stand-in, not the app.
- Scenario 46 (his Undo refused after the lock) — the bridge's lock lands on the member's own Undo list, so it cannot be
  separated; carried by `m5a-gate.test.ts` "his Undo after the admin locks is refused (B6)" (calls the writer and the gate
  directly — proves the refusal, not the screen's route). NOT WALKED.

## Differences from the drawings — to show him side by side, each with a recommendation (D1426), not changed tonight
**His picks, 29 Oct 26 (D1493 — "All as recommended"):** back to the drawing — the desktop person window's place, its flat leave rows, the Balances page's names set left, a member's locked amber figures on their row's line; as built — the switch, the hyphen, the phone's search line, readings R1–R11. The Grades window already matched by then.
- The desktop person window docked lower than drawn (top 200 against ~65), its last lines below the fold (`m5a-p2-desk-drawn`)
  — recommend the drawing's place.
- The person window's leave lines are rounded cards with a cyan left bar on every line, where the drawings have flat rows
  between hairlines (`m5a-p2`, `m5a-p4`) — recommend the drawing's rows (the dot alone marking what is new).
- The Balances | Days taken switch narrower than drawn and its lit half a cyan-edged chip, not the drawing's pale tint; puck
  callsigns centred where the drawing sets them left (`m5b-b1-desk`).
- The Grades window docks at the right of the bar over its own "Grades…" button (the drawing: under it); "+ days" boxes wider
  and right-set (`m5c-c1-grades`).
- Days taken's heading "JAN - DEC 26" with a hyphen (the drawing: en dash) — the period's own name, as typed.
- The phone's search opens a slim line under the bar (a state not drawn) — the Balances builder's departure.
- In the locked read-only row the amber pending figures sit ~2px low.

## For his iPhone (lesson 6 — only his phone shows them)
A tapped box above the real keys; whether Safari zooms the page on a tap of a 14px box; the decimal keypad's minus (★20); the
slide and pinch's feel; "My leave" with a three-figure balance in his letters; iOS's own scroll bars; the "Saving…" note.
