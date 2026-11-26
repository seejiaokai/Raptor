# Group lights on the Leave War: the drawing on the real app (26 Nov 26)

**Script:** `raptor-port/docs/mock/2026-11-26-combined-row/draw-group-lights.mjs`, version 1.0. It prints a version line and takes the build, the size and the picture folder from its arguments.

**Runs:** three, all green, with no page errors:
- desktop 1536×864 Chromium at 1x;
- the same desktop at 3x (`--detail`), as close-ups of the days only;
- iPhone 402×874 WebKit (touch, 3x).

All three ran against http://127.0.0.1:4173/ (bundle `index-B9okpSpf.js`, checked). The logs are in the scratchpad: `gl-d.log`, `gl-dd.log` and `gl-p.log`.

**Pictures:** 24, in `raptor-port/docs/mock/2026-11-26-combined-row/img/`, named `g1-*`, `g2-*` and `g3-*`. Nothing is committed or pushed. Every browser was closed.

## Staging
Everything was staged through the Inputs page's own window: List, "+ Input", "Several people", the calendar and Save. Each record was read back by its type, its people and its half, then checked on the grid:
- **LL** for Cutter, Ghost and Dash, Wed 15 – Fri 17 Jul, whole day.
- **LL** for Cutter, Ghost and Dash, **Wed 22 Jul, PM** (the window's own PM button).
- **OIL** for Ghost, **Wed 22 Jul, AM**. "No document" was answered.

## The frames (real, unless marked as drawn)

**1. The grid at rest** (`g1-grid-rest-today-and-proposed-{desktop,phone,desktop-closeup}.png`)
- This is real. Today and proposed are the same picture: the proposal adds nothing at rest.
- Each man's 15–17 Jul leave is one joined bar reading "LL". Tag "1" marks each one.

**2. A tap on Cutter's 15 Jul box** (`g2-tap-cutter-today-*`, `g2-tap-cutter-proposed-*`)
- **Today, real:** the war's window opens, titled "Cutter 15–17 Jul".
  - Its line reads "[LL] Whole day · change it on the Inputs page".
  - Cutter's three days wear the selection look, so his bar splits into three boxes, each reading "LL".
  - Ghost's and Dash's boxes are unchanged.
- **Proposed, drawn:**
  - Tag 2a: Ghost's and Dash's 15–17 Jul days wear the war's own "day brought into view" ring. That is the plain 2px cyan ring the war already puts on a day it jumps to (from the Approvals tab or the bell). It is applied with the app's own class.
  - Tag 2b: the line's "Whole day" words are replaced by "Cutter, Ghost, Dash", so the line reads [LL] Cutter, Ghost, Dash. The "· change it on the Inputs page" part is hidden.
  - Tag New: a clone of the window's own Document button, with its picture hidden, reads "Change for all 3 people". It is 28px tall against Document's 30px, and it fits on the same line at both sizes.
- Measured: the ring changes no box's size. On the phone the three rows stand clear above the window.

**3. The half-day case** (`g3-half-*`)
- **At rest, real** (`g3-half-rest-today-*`): Ghost's 22 Jul day shows OIL in the top half and LL in the bottom half. Cutter and Dash show LL in the bottom half only.
- **The count attempt, drawn for contrast** (`g3-half-count-attempt-*`): "3·LL" is written into each afternoon box at the war's own size step for four letters (6.5px).
- **The tap, today, real** (`g3-half-tap-today-*`): the window is titled "Cutter Wed 22 Jul". It offers the free morning (AM) and shows the note "The afternoon is LL, filed on the Inputs page — change that there."
- **Proposed, drawn** (`g3-half-tap-proposed-*`):
  - 3a: the same cell ring on Ghost's and Dash's 22 Jul days.
  - 3b: the note now reads "The afternoon is LL · Cutter, Ghost, Dash", and the cloned "Change for all 3 people" button follows it.
- **Variant, drawn** (`g3-half-tap-proposed-boxring-*`), tag 3c: the same cyan, but as a 2px ring round the afternoon box only. This is a new place for the ring, so it needs his ruling.

## Where the app differed from the brief (each matters for the plan)
1. **A half day is not a narrow box.** On this build a morning and an afternoon are stacked top and bottom, each the full width of the day.
   - Desktop: 21 × 8.5px. Phone: 17 × 6.8px on screen (the phone grid is drawn at 0.8 size).
   - **"3·LL" at the war's 6.5px four-letter size does fit across the half box at both sizes.** It is tiny, about 6px tall on a 1x desktop and legible only in the close-up.
   - So the case against writing the count rests on how small it is, not on it being cut off. A whole-day box is 21–26px wide in a 26px cell, as the brief said.
   - The "HO quarter" (a whole day beside a half, the half in its own corner) was not staged or drawn.
2. **The window's line for a half day is a different line.** It is the note "The afternoon is LL, filed on the Inputs page — change that there.", not the "[LL] Whole day · change it…" line.
   - The proposal has to change both.
   - With the button added, the note's line grows from 17px to 28px on desktop. **On the phone the button drops to a second row** (17px to 45px).
   - On the whole-day line the button fits on the line at both sizes.
3. **The war's existing ring rings the whole day cell, not one half.**
   - On Ghost's split day (3a) it frames his morning OIL too.
   - The box-only variant (3c) avoids that, but its ring touches the OIL box's edge above it. That is a choice for him.
4. **The ring on a joined bar.** With the ring on each of the three days, a man's 15–17 bar reads as three framed days, with the word "LL" once at the start. This is the app's own drawing of that class, not restyled.
   - Cutter's own tapped days use a different look, today's selection (a fill, each day reading "LL").
   - So the proposal shows two cyan looks side by side: the tapped man's selection and the ring on the others.
5. **Today the ring fades.** The war's ring is a six-second mark that fades, except for a reader who asked for less motion.
   - It is drawn held steady here, the way the app draws it for that reader, because the proposal keeps it while the window is open.
   - Holding it for as long as the window is open is a new behaviour for that mark.
6. **The "LL ·" in the brief's line is the line's own LL box.** On the whole-day line, "Whole day" leaves the line in the drawing (the window's Whole day / AM / PM buttons below are for new leave, not this one).
   - Say whether the half or the whole day should stay on the line.
7. **Date and place:** the half-day case is staged on **Wed 22 Jul, not 15 Jul**, so that the whole-day group leave of 15–17 Jul (frames 1 and 2) stays as briefed. A group input's half applies to all its days, so one input could not be whole on some days and PM on others.
8. **Crops:** the grid's date heading is a fixed copy of the table's own (a third copy stands off to the right). The pictures use the one on screen.
   - The page could not scroll the three rows up under the heading (the page was at its foot), so the 1x desktop pictures include the rows above for context.
   - The close-ups show only the days, with the rows named by tags. The tag names are labels on the picture, not app words.

## Frame 4 — "Change for Cutter only" (chat 191, 26 Nov 26; script v1.1)
His ask, a second button beside "Change for all 3 people". Run with `--only 4`, desktop (Chromium 1x) and phone (WebKit 3x), against http://127.0.0.1:4173/ (bundle `index-B9okpSpf.js`, the same app code as this branch).
- **4a, drawn** (`g4-two-buttons-proposed-*`): frame 2's proposal, plus a clone of the "Change for all 3 people" button reading "Change for Cutter only". Desktop: both on one row (156px beside 158px, the line 28px tall). Phone: the second button takes a line of its own (the line 28 → 64px).
- **4b, real staging, the window cloned** (`g4-after-press-proposed-*`): after the press, staged as Cutter on an LL of his own, 29–31 Jul, beside Ghost's and Dash's group LL of the same days (both filed through the Inputs page's window). Cutter's own leave's window, opened for real on the Inputs page ("Cutter · 29 Jul → 31 Jul"), is cloned over the war; its lists' picked values are put back on the clone (a copy of the markup had lost them: PERSON read "Ace"). No tap on Cutter's box, so the war's own window, which still has today's words, is not behind it.
- Words: "Change for Cutter only", kept by a fresh Fable as the pair of "Change for all 3 people" (his "Change Cutter's only" left "Cutter's what?" open). Fable's catch, put to him as question 9: a split at the press leaves Cutter split when nothing is changed.

## Frame 5 — today's window from Edit Schedule (chat 191, for D2782's page; real, nothing drawn in)
`g5-schedule-window-today-desktop.png`: Cutter's Unavailable row on Wed 15 Jul (the group LL) tapped on Edit Schedule; the window has no dates and reads "The dates are changed on the Inputs page." (tag 5, the line scrolled into view). Desktop only.

## New words (for Fable's adjustment)
- "Cutter, Ghost, Dash" on the whole-day held line, after its LL box.
- "The afternoon is LL · Cutter, Ghost, Dash" (replacing ", filed on the Inputs page — change that there.").
- "Change for all 3 people" (the button).
- "3·LL" was drawn only as the rejected contrast.
- Tags on pictures only: 1, 2, 2a, 2b, 3, 3a, 3b, 3c, New, and the row names in the close-ups.
