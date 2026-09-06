# Leave War figures drawer — design (6 Sep 26, owner-approved shape)

## Context

The Leave War grid has ONE frozen counter column beside the names, showing one of thirteen figures at a time (default LVE BAL); its header opens a picker, a cell opens that person's breakdown, a callsign opens that person's all-figures sheet. The owner wants everyone's figures visible at a glance in the grid itself — for the admin deciding bids, a periodic squadron check, members comparing openly, and members reading their own row — without losing the single "smart" column when the extra columns are closed, and without moving the manning rows above.

Settled with the owner over four rounds of mockups drawn on the real bundle (throwaway, scratchpad only — nothing in the repo yet): his own idea of **a drawer that pops out to the right of the names, over the days, with sideways +/− column titles that carry the colour key, and two-line boxes (balance over used)**, rows growing a little while it is open. Variant "B" — no minus on the used numbers — is the one to build. He also asked that tapping a total's title explain what it consists of, and that the build be planned and orchestrated by me with agents doing the coding.

## The design

### 1. Closed — the smart column (today's column, two changes)

- One frozen column beside the names, showing ONE of the eight figures below; opens on LVE. **The cell is the same two-line box as the drawer** (owner's pick "b", 6 Sep 26): the balance on top in white (red with its minus when below zero), the used numbers under it without a minus (LL amber and OL red sharing the line for LVE; one red number for the others); a total is one red number. It fits today's row height. Its header chip reads the figure's title ("+LVE") with the dots and the tap hint as today; opening the drawer turns this column into the drawer's first column in place, the others unfolding to its right.
- **Follows the leave just entered by switching to the balance it comes off:** LL or OL → LVE; OIL → OIL; CCL → CCL; FCL → FCL; CL → CL; PL → PL; ATT C / HL / OML → MED TOT. (Today it switches to the per-type USED figure; those fold into the drawer's amber/red lines.) EL has no figure and does not switch.
- **Flashes once when that person's shown figure changes** — a single ~700 ms fade of the accent tint on the changed cell (and on the drawer box when open). One authored motion; honours reduced-motion.
- Header tap → the picker; swipe across the column cycles it; tapping a cell opens that person's breakdown — all as today.

### 2. Open — the drawer

- **Toggle:** the "▸ FIGURES" bar in the empty corner above CS/Name (frozen with the pair, mirrored in the stuck header; reads "▾ FIGURES" in accent while open). Both roles; a view preference, session-only. A phone opens with it closed, a desktop with it open.
- The drawer pops out to the right of the names from the roster header row down, over the day columns; the top controls, the manning rows and the month strip do not move; the days keep working beside it (about six show on a phone at its opening size).
- One column per shown figure, in the picker's order. **Titles sideways, one line each, "+" for the balance and "−" for used, every word in the colour of the number under it:** "+OIL −OIL", "+CCL −CCL", "+FCL −FCL", "+CL −CL", "+PL −PL" (white, red); "−LVE TOT", "−MED TOT" (red); LVE alone takes two lines, "+LVE" over "−LL −OL" (white; amber, red).
- **Boxes are two lines, top-aligned:** the balance (white; red with its minus if below zero), then the used numbers WITHOUT a minus — LL amber and OL red sharing the line for LVE, a single red number for the others; a total is one red number. A zero used shows nothing.
- **Rows do NOT grow** — a two-line box (two 11px lines) fits today's 22px cell exactly (measured on the mock); only the header grows to 62px CSS while open, for the sideways titles. Closing restores the header and leaves the sideways scroll where it was. Widths: the first column keeps the closed column's width (44px phone / 72px desktop) so the box does not move when the drawer opens; the others 28px on a phone / 36px on a desktop (CSS px; the grid's zoom applies) — about five days stay in view beside the drawer on a phone at its opening size. Numbers are tabular; a column never widens and a number never wraps — the rare over-wide value (a three-digit balance) drops one type size inside its box.
- **Tap a column title → a small pop-up saying what that column counts** (the app's click-open popup rule: closes on an outside tap, Escape, or a tap on its title): LVE "balance of local + overseas leave: opening + granted − LL − OL"; OIL "the OIL tracker's balance: earned + granted − taken − expired"; CCL/FCL/CL/PL "opening + granted − taken"; LVE TOT "LL + OL + OIL + CCL + FCL + CL + PL taken"; MED TOT "ATT C + HL + OML". Same words as the picker's legend — one source.
- Tap a box → that person's breakdown for that figure (the existing sheet; LVE's parts are opening, granted, LL taken, OL taken, Total).
- Count rows and event rows show a blank box across the block; group headings span it.

### 3. Legend — four places, one source of words

The title colours; the title pop-up; a "Figures" section in the page's Legend pop-out (white = balance left · amber = LL taken · red = OL taken, days used, a total, or a balance below zero; plus each column in one line); the breakdown sheet naming every line.

### 4. The eight figures (replace the thirteen)

LVE (annual pool — LL and OL deduct) · OIL (the tracker's balance) · CCL · FCL · CL · PL · LVE TOT (LL + OL + OIL + CCL + FCL + CL + PL taken) · MED TOT (ATT C + HL + OML).

- A balance = opening + granted (+ earned, OIL) − drawn, never clamped. Admin **Set** of the opening extends from LVE/CL to CCL, FCL and PL (OIL stays with its tracker). The weekend/PH charging rule and multi-war counting are unchanged.
- The picker lists the eight with the viewer's own numbers and the colour key; the order persists (`figorder`, admin-gated, as today); a new admin **show/hide** per figure (`fighidden`, same footing): a hidden figure leaves the drawer and the cycle; at least one always shows; nothing hidden by default. The person sheet (callsign tap) lists the same eight.

### 5. Untouched

Bidding, decisions, the bid/decision/person/breakdown sheets' behaviour, the OIL tracker, the manning rows and ARCHIVE bar, the month strip, the window engine, the frozen names column and its phone overlay mechanics, the top control row.

## For the build

**Reuse.** `engine/counters.ts` — `FIGURES`, `Figure`, `balanceOf`, `takenOf`, `figureParts`, `orderedFigures`, `LVE_CON_TYPES`/`MED_CON_TYPES`; `state/store.ts` — `figureOrder`/`moveFigure`/`resetFigureOrder`, `manningHidden` + `toggleManningRow` as the pattern for `fighidden`, `setBalance` (already any counter); `ui/CounterSheet.tsx` — the three sheets; `ui/Matrix.tsx` — the band overlay (`bandActive`, `syncBandHeights`, `bandTop`) as the drawer's mechanism, the `onWrote` snap, `headerRow`/`bracketRow` (the corner `th.brakhd`), the stuck mirror (`.mxfixed`, `s.cols` width sum); `ui/Chrome.tsx` — the Legend pop-out; `SettingsSheet.tsx` — the click-open popup pattern (capturing document pointerdown); the `.march` archive-bar CSS for the corner bar's scale; `OilTracker.tsx` — the "+in −out" digit alignment.

**Files.** `src/leavewar/engine/counters.ts` (eight figures with `lines` metadata — balance counter + used types with colours, or a summed type list — plus `desc` words for the title pop-up, `DEFAULT_FIGURE_ID`, `DEFAULT_FIGURE_ORDER`, a `figureForLeave(type)` map for the snap); `state/store.ts` (`figureHidden` + `toggleFigure`, persist key `fighidden`, undo snapshot, `readIdList`, at-least-one guard); `ui/Matrix.tsx` (drawer overlay at both widths — drawn once, absolute, outside `.mx-wrap`, heights measured; corner toggle; row-growth class on `.mx-outer`; snap-to-balance; flash class from a per-person previous-value ref; mirror frozen width = pair or drawer; title pop-up); `ui/CounterSheet.tsx` (picker rows for eight, colour key, admin eye; person sheet rows); `ui/matrix.css` + `chrome.css` (drawer, sideways titles, two-line boxes, row growth, flash keyframes at top level, corner bar, title pop-up); `ui/Chrome.tsx` (Legend "Figures" section); tests — `engine/counters.test.ts`, `ui/counters.test.tsx`, `ui/frozencols.test.tsx`, `e2e/leavewar.spec.ts`; docs — `docs/ui-contracts.md`, `docs/leavewar/known-gaps.md`, `docs/feature-impact.md` (new counters entry), `HANDOFF.md`, `BUG-TESTING.md`, `probes/perf-port.cjs` ceilings.

**Mechanics to respect.** Placeholder widths stay inline (never a custom property on `.mx-outer`) — the row-growth class is one restyle on open/close, acceptable; every row keeps identical cells (the drawer is an overlay; the real table changes only its row height); DOM ceilings (`e2e` 9600/9700, `probes/perf-port.cjs`) re-measured with the drawer open and raised deliberately in the PR; `.mxfixed-frozen` width generalises from two columns to the drawer's width while open; the bid box re-measures on open/close; the phone e2e "does not eat the grid" rule holds for the CLOSED state; the corner bar is a real tap target (≥ the archive bar's) and the stuck mirror's copy of it works.

**Orchestration (owner's ask: plan and orchestrate, delegate the coding).** After approval: write the implementation plan (writing-plans), then run it subagent-driven — one general-purpose agent (sonnet) per slice with a precise spec (files, expected shape, tests to run), me integrating, one reviewer pass, the gates and the live drive first-hand. Slices, in order: (1) engine + store — the eight figures, snap map, `fighidden`, tests; (2) the drawer — overlay, corner toggle, row growth, mirror width, CSS, unit + e2e; (3) picker, person sheet, title pop-up, Legend section, flash, admin Set for the new pools, tests; (4) docs, ceilings, tracker row, observer log. Impeccable's mechanical detector runs once over the changed UI at the end.

**Verification.** `npm test` (both vitest projects), `npm run build`, `node reference/tfin.js` 728/0, `npm run test:e2e` lw-phone + lw-desktop with new tests (drawer opens/closes and restores rows + scroll; titles coloured and one-line; eight columns in order; ~6 days beside the drawer on a phone at the opening zoom; snap-to-balance on LL/OL/OIL/CCL/medical; flash class applied once; title pop-up opens and closes by the popup rule; legend section; admin hide removes a column and a member cannot); `probes:adapted` + `perf` against the preview; a live drive screenshotting phone and desktop, open and closed; then the owner's iPhone against the Vercel preview (WebKit: the overlay heights and the stuck mirror width while open).

**Process.** Medium (build, one reviewer, report). Ship once on the session branch; the PR stays open until "merge live".
