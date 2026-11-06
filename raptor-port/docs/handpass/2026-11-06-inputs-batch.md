# The Inputs batch of 6 Nov 26 — the cards' three columns, and React Doctor's findings on the Inputs pages

The night of 5–6 Nov 26, job 2, on `claude/inputs-batch-1106` (cut from `main` at cc3ba8d84). Built by Opus 5.5; walked
by one Sonnet 5.5 walker; read by one fresh, blind Opus reader. Pictures: `docs/img/handpass/2026-11-06-inputs-batch/`.

## What the job was, and what happened

1. **[INP-CARD-COLUMNS] (his D1305, D1310 — "q5 A").** Built exactly as drawn (commit ce0855cf7): the card's corner a
   grid of three tracks, LATE (or OIL?) · the document · the hours, each mark at its track's right end, an empty track
   keeping its room; the drawing check green (25 / 25 parts, both states); a browser test pinning the columns at 390 and
   402, red on the old corner. **Then measured against D1310's own last clause, "no card grows taller": it does not
   hold.** On his iPhone's 402 in WebKit, 6 of the demo's 46 list cards gain a line (on a 390 phone up to 9; with wider
   letters up to 14): every commitment with a long kind name (APPOINTMENT, MEETING, ATTACH) beside the empty document
   column, and a shared input of four names. Two standing browser tests that pin that clause fail on the build
   (`e2e/geometry.spec.ts` "the kind stands on the name's own line"; `e2e/inputs-calendar.spec.ts` "two rows, not
   three"). They are not changed (D1310 is what they pin). No variant keeps both "an empty column keeping its room" and
   "no card grows taller" for every card, so **the build is taken back (commit b70208562) and the choice is his** —
   Q1 below. The build comes back with `git checkout ce0855cf7 -- raptor-port/src/ui/scheduler/25-inputs-calendar.css
   raptor-port/e2e/inputs-calendar.spec.ts`, plus the track change of the answer he picks.
2. **React Doctor's findings on the Inputs pages (D1534, D490).** The four files named (`InputsCal.tsx`, `DateBox.tsx`,
   `InputsPage.tsx`, `InputCard.tsx`) and their models carried **22** findings (the whole app 584); after: **0** in those
   files (the whole app 562). **4 fixed, 18 kept** with their reasons on the line above. Nothing a person sees changed
   (14 / 14 screens pixel for pixel), but for one new keyboard way: the desktop List's headings sort by the keys.

## Q1 — for him: the cards' three columns make some cards a line taller

Pictures, his iPhone's size, the same stretch of the list three ways, every card a line taller than today outlined in
pink: `question/today-appointments.png`, `question/a-as-drawn-appointments.png`, `question/r-recommended-appointments.png`
(and the `-four-names` set, further down the list).

- **The case:** an appointment, a meeting or an attach on the Inputs list on his phone — "Bolt APPOINTMENT · LATE ·
  10:00–11:00". Today the marks stand where the words end, and the card is one line at the top.
- **A, as drawn:** the three columns, every empty one keeping its room. A commitment never has a document mark, so its
  middle column is always empty, and the 104px it keeps pushes "APPOINTMENT" onto a second line. 6 of 46 cards taller.
- **R, recommended:** the columns sized to the letters (each a little narrower than drawn: LATE 3.6em, the document
  6.4em, the hours 6.2em), and a card that carries no document mark at all (a commitment, a course, an overseas duty)
  closes the document column — its hours stay in the hours column, its LATE stands nearer the hours than a leave's does.
  1 of 46 cards taller (a meeting of four people, whose names no longer fit beside LATE and the hours). Leave and
  medical cards — the ones that carry LATE, a document and the hours together — keep all three columns.
- **What waits on it:** the build (one stylesheet rule and its test, ready); the drawing check's part list then records
  R as his kept difference.
- **Recommendation: R.** It keeps the neat columns where the three marks meet (leave and medical) and keeps his "no card
  grows taller" for all but a shared input of several names, which already wraps by his D721.

## Q2 — for him (small): the List's headings now sort from the keyboard

On a desktop the Inputs list's column headings (Name, Start, End, Type, Remarks, Changed) are now reached with Tab and
sorted with Enter or Space, as a click sorts; the heading the keys are on wears the app's cyan ring, inside its cell
(`rewalk/w1-desk-ring-type-crop.png`); a mouse click draws no ring (`walk/w1-desk-mouse-click-start-crop.png`). New to
the screen for a keyboard user only (D1625). **Recommendation: keep.** If he would rather not have it, one commit takes
it back.

## The eight questions and the tier (§5)

1. Money — no (no OIL, no counts; the card's marks are display). 2. Published record — no. 3. Saved data — no (nothing
stored changes; a Set is built per render). 4. **A shared drawer — yes**: the date box is the app's one date picker
(Inputs, Leave War, Tracker, Admin); `monthCells` draws three calendars' months. 5. **A new gesture — yes**: the
headings by keyboard. 6. A new surface — no. 7. Roles — no. 8. The warning list — no.
**Tier: WALK.**

## Roll-call (§6)

**The card (job 1 — measured on the as-drawn build, then taken back):**

| Place the card is drawn | Shows the three columns | Notes |
|---|---|---|
| Inputs list, phone (390, 402; Chromium and WebKit) | has it (as built) — every LATE, document and hours at one right edge each, 46 cards | the taller cards: Q1 |
| A day opened on the Inputs calendar, phone | has it (as built) — the browser test held its marks at the list's own edges | the same card |
| A day opened on the Inputs calendar, desktop | has it (as built) — the same card, the day window's own width | "two rows, not three" failed here too (an appointment with a short remark) |
| The OIL list (the one list of a holiday's open OIL questions) | has it (as built) — the same card; never LATE, never OIL? there | its first column always empty: Q1's R closes no column there for a leave, as for any card |
| The desktop Inputs list | must not, because it is a table with its own columns (D727) | — |
| The SANS calendar's opened day | must not, because its rows are `.sd-row`, not this card (D723, D647) | — |

**React Doctor's changes (job 2):**

| Place | What it draws / does | Walked |
|---|---|---|
| The Inputs month, its bars' just-added ring | `litOn` | W2 desktop and phone |
| A day opened on the Inputs calendar, its cards' ring | `litOn` | W2, W5 |
| The Inputs, SANS and Medical months | `monthCells` | W4 (the Medical tab draws no month — a list of three sections) |
| Every date box — upchit date on the Inputs page | `useShutWhenOff` | W3 desktop and phone; the switched-off case carried by `datebox.test.tsx` "F7" (rerender disabled) |
| Every date box — the Leave War's post out and post in (the only callers passing `disabled`, the reader found) | `useShutWhenOff` | carried by the same unit test; the read found nothing that changes for them |
| The desktop List's headings | the keys sort | W1, re-walked after the ring fix |

## The five sizing lines (§7.0, `walk-ledger.md`)

1. **Type:** C (a new keyboard way), D (a shared drawer — the date box), E-none (a code-health pass that must change
   nothing on screen); for job 1, E (layout) — measured, then taken back.
2. **What only a walk could find:** the keyboard reaching the headings and the ring it shows; the just-added ring still
   lit on the list, month and opened day; the date calendar opening, picking and closing over its window by every way;
   the three months drawn. Whether anything on screen moved: a pixel comparison of every Inputs screen, before and after.
3. **The ledger:** walks of E and C changes on the Inputs pages found their faults by measuring (round 4's two, 5 Nov
   26); code-health passes with a before/after comparison found none (31 Oct 26, 30 / 30 the same).
4. **The walk chosen:** SMALL — one Sonnet 5.5 walker, 5 scenarios (W1–W5) at 1536 (Chromium) and 402 (WebKit, a
   picture straight after every tap — D1281), including the plain-user round (D1557: file, open, change, Cancel / ✕ /
   Escape, delete, Undo, the List, the month, an opened day, View-only Sched); the host's pixel comparison of 14 screens;
   the host's measurement of the card's columns over 8 conditions (2 engines × 390 / 402 × wider letters).
   Carried by tests: the switched-off date box (`datebox.test.tsx`, through the component — no screen route switches
   the Inputs page's box off while open); the headings' keys (`audit-e-window-sort.test.tsx`, red first).
5. **After:** its row is in `walk-ledger.md`.

**§7.11's lessons for this change:** 1 (state × reading) — the ring's states walked (added, changed, gone after 7 s);
3 (feedback) — the ring and the sort arrow pictured; 4 (the page behind a window) — W4, the observation below; 19 (a
window over a window closed by each way) — W3, the date calendar closed by its scrim and Escape, the input window still
there; W2 and W5, the input window over the opened day closed by Cancel, ✕ and Escape; 2, 5–18, 20–22 — no gesture,
keyboard lift, scroll, print or motion changed.

## Orders walked

| # | Size | Result | Pictures |
|---|---|---|---|
| W1 the headings by keys | desk | PASS (re-walked after the ring fix: the cyan ring) | `walk/w1-*`, `rewalk/w1-*` |
| W2 the plain-user round | desk | PASS | `walk/w2-desk-*` |
| W2 the plain-user round | phone | PASS — View-only Sched on the phone not walked (its week tabs are behind the menu) | `walk/w2-phone-*` |
| W3 a date box's calendar over the input window | desk, phone | PASS (reached from Medical → Pending upchit → "Upchit") | `walk/w3-*` |
| W4 the months, and a date pressed behind a window | desk, phone | PASS, one observation | `walk/w4-*` |
| W5 an opened day's cards | phone | PASS | `walk/w5-*` |

The walker's report, whole: `docs/handpass/parts/inp1106/walker.md`. The host opened the deciding pictures: W1's two
rings (and found the browser's white one — fixed, re-walked), W3's phone calendar, W4's click behind the window.

**Nothing changed on screen:** `same/run.txt` — 14 screens (the month, an opened day, the List and the List sorted, a
new input's window, SANS, Medical; 1536 Chromium and 402 WebKit), the before build twice the same, then before and after
14 / 14 pixel for pixel the same (`scripts/handpass/inp1106-same.mjs`; the after pictures in `same/`).

## The drawing check (§7.10, walk-scripts §10)

Recorded: `docs/mock/2026-10-24-inp-card-columns/drawcheck/` (the drawing replayed on 7a661b29c's build, identical to
`a.png` and `a-wide.png`). On the as-drawn build: **GREEN, 25 / 25 parts in both states** (`drawcheck/report.md`). On the
branch as it stands (taken back): the check is red by design — the columns are not built. With R built, the LATE and
document columns move right (a departure from the drawing, put to him in Q1 with its picture).

## What the walk and the read found, and each disposition

| # | Found by | What | Disposition |
|---|---|---|---|
| 1 | the host's measuring | As drawn, 6 of 46 cards a line taller on his iPhone; two standing tests red | built, taken back; Q1 |
| 2 | walk W1 | the headings' keyboard ring was the browser's white one | fixed (6ac6a92bc): the app's cyan ring, inside the cell; re-walked |
| 3 | the read, R1 (low) | the date box's new comment gave a false reason (the calendar was already held off; the open look was what the effect let through) | fixed (8ea5ca4e8) |
| 4 | the read, R2 (low) | a kept finding's reason said Escape was taken "on the layer above" — it is taken at the window | fixed (8ea5ca4e8) |
| 5 | the read, R3 (low) | a screen reader meets the heading as a column header, not told it can be pressed | for the coordinator to file with the keyboard sweep (D807): the standard fix is a `<button>` inside each `th`, which changes how the heading is drawn — a picture first |
| 6 | walk W4, observation (older, met in passing) | with a new input's window open from 14 Jul, a click on 28 Jul behind it lights 28 and the hidden day window turns to 28 Jul; the window in front still says Jul 14 | D1298 holds (the click changes something he can see); the code is not touched by this change; for the coordinator to judge |
| 7 | the read (outside the change) | the Quals table's headings still sort by click only | for the coordinator to file beside 5 |

## Errors seen

None — no page error and no console error in any walk run, the comparison, the probe or the drawing check.

## Gates

On his PC (D1086 — GitHub's run of the pull request is the full check): the touched unit tests 482 / 482 (11 files);
`audit-e-window-sort.test.tsx` red first; `datebox.test.tsx` green after the comment fix; the build (typecheck) clean;
the card's browser tests on the as-drawn build 277 / 279 (the two in row 1 above); `npm run lint:changed`: no new
finding.

Walk: docs/handpass/2026-11-06-inputs-batch.md · 157 pictures · 6 surfaces · 9 orders · MISSING: none (one question to
him, Q1; two read findings for the coordinator to file)
