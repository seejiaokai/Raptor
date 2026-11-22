# Walker r1 — the re-walk of SANS from its date (D2313), 22 Nov 26

Build `dist` at 1a1be5a7e served on port 4323 (stopped at the end; the "failed" notice is the server being stopped). Script
`scripts/handpass/sfd-r1.mjs` (+ `sfd-r1-env.mjs`; `sfd-r1-probe.mjs` was a read-only look at how the preview draws pucks).
Pictures `docs/img/handpass/2026-11-22-sans-from-date/r1/`: **run2** is the cited run for R1, **run3** for R2 and R3.
run2's R2/R3 lines are a SCRIPT mistake, not the app: the preview's pucks carry no `data-person`, so the read found none
(fixed by reading the puck by its callsign in run3). A first attempt (run1) was deleted before run2; it showed the same
R1 results up to "Today". `crop-*` / `strip-*` files are enlarged cuts of the pictures named in them.
Every state was made through the app's controls: "+ Medical" with the window's calendar and document field, Quals ✎ Edit
and the SANS cell, + Item / tap row / tap puck on the board, the four sign-off boxes, Publish, Undo / Redo in the top bar.
The bridge was used only to read and to change page. Scrolling the week to the preview used a scroll-into-view.

## R1 — Medical "as of" cards (clock Mon 20 Jul 09:00) — desktop and phone
- Filing: ATT C for Hex 16–24 Jul landed, one input (r1-01-window, r1-01b-saved). Quals tick: SANS from 20 Jul (r1-02-quals).
- As of 18 Jul — NO purple line: **PASS** desktop and phone (crop-r1-03-18jul-card-desktop, crop-r1-03-18jul-card-phone).
  Puck title "Hex · C · ops wingman".
- As of 20 Jul — HAS the purple line: **PASS** desktop and phone (crop-r1-04-20jul-card-desktop, r1-04-20jul-card-phone).
  Title "Hex · C · ops wingman · SANS".
- Document viewer opened and closed at each date, puck unchanged after: **PASS** 4 of 4 (r1-0x-viewer, crop-…-after-viewer;
  phone tap pictures taps/r1-12, r1-16 card-now and r1-13, r1-17 viewer-close-now).
- "Today": **NOT WALKED as written.** Pressing Today set the button to "as of 13 Jul", not 20 Jul: the app's own today is
  the demo week's date (D1383 lets sign-in open on the demo date), while the browser clock said 20 Jul. As of 13 Jul the
  ATT C (16–24 Jul) has not started, so Hex has no card at all (r1-05-today-page-desktop / -phone). Note: because the
  app's today is 13 Jul, the "Today" button also stays on show at "as of 20 Jul". Not a D2313 fault; the host may want
  to re-pose this step with a date the app treats as today.

## R2 — the preview follows a tick at once (clock Wed 15 Jul) — desktop
- Hex put on a new Ground Programme row (W1 GROUND) on Mon 20 Jul: PASS (r2-01). His seed seat on the RU line that day is a second copy.
- Before the tick, preview Monday: no line on both copies — **PASS** (strip-r2.png row 1; r2-02).
- After the tick, back on Edit Schedule with no reload and no visit to next week: line on both copies — **PASS** (row 2; r2-04).
- Untick: line gone at once — **PASS** (row 3; r2-06).
- RECORD Undo (takes back the untick): SANS back from 15 Jul, line back in the preview (row 4; r2-07).
  RECORD Redo: SANS off, line gone (row 5; r2-08).
- RECORD: the preview's pucks have the title "Hex" only — no "· SANS" even with the line — like every preview puck.

## R3 — a published next-week day keeps each man as published (clock Wed 15 Jul) — desktop
- Mon 20 Jul: Hex on W1 GROUND, four boxes, "Publish day" → "Monday published and approved", 0 pending (r3-01, r3-02).
  Back on the demo week, Quals tick: SANS from 15 Jul (r3-03).
- View-only Sched (admin), preview Monday: no line — **PASS** (strip-r3.png row 1; r3-04).
- Edit Schedule (admin), preview Monday: has the line (working copy) — **PASS** (row 2; r3-05).
- View-only Sched as Ranger after signing out and in: no line — **PASS** (row 3; r3-06).
- Next week loaded: Edit Schedule Mon 20 Jul reads "1 pending" — **PASS**. The board shows "Not yet signed", "1 pending",
  "Publish AL1", the Signed ORIG line still there (r3-07b). Hex wears the line on both his copies on Edit Schedule (r3-07).
- View-only Sched's own Mon 20 Jul: Hex with no line on both copies, the day "ORIG" — **PASS** (r3-08).

## Findings
None against D2313 or D186.

## Errors seen
R2 and R3: none. R1, both sizes: two "request failed" lines for `blob:` addresses per run, one each time the document
viewer closed (it lets go of the document it was showing). No page or console errors. This is a lead, not a finding:
it was not looked into further.

## Not walked
R1's "Today" step as written (above). R2 and R3 on a phone (the brief says desktop only; a phone has no preview).
