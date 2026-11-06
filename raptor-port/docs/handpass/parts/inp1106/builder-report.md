# Job 2's builder report to the night's coordinator (6 Nov 26), saved as it arrived

Branch `claude/inputs-batch-1106` at bdf763d0f.

1. [INP-CARD-COLUMNS] built to the drawing (ce0855cf7; the drawing check green 25/25 in both states, the drawing now recorded under `scripts/drawcheck/specs/inp-card-columns.mjs` and `docs/mock/2026-10-24-inp-card-columns/drawcheck/`), then taken back (b70208562): as drawn it breaks D1310's own "no card grows taller" — on his iPhone's 402 in WebKit 6 of 46 list cards gain a line, at 390 up to 9 (commitments with long kind names, a four-name meeting); two standing browser tests that pin card height fail and were not weakened. To restore: `git checkout ce0855cf7 -- raptor-port/src/ui/scheduler/25-inputs-calendar.css raptor-port/e2e/inputs-calendar.spec.ts`. Q1 to him: A as drawn (6 of 46 taller) or R — columns sized to the letters (3.6em / 6.4em / 6.2em) and a card with no document mark closing that column (1 of 46 taller); recommended R.
2. React Doctor on the Inputs pages: 22 findings in the four files (not about 35), now 0; the whole app 584 → 562. Fixed 4: the just-saved ring looks inputs up in a Set; `monthCells` moved to `inputscal-model.ts`; the date box shuts its calendar in the same render when switched off; the desktop List's column headings sort from the keyboard with the app's cyan focus ring (test `audit-e-window-sort.test.tsx`, red first). Kept 18, each with its reason on the line. 14 Inputs screens pixel-identical before and after at 1536 Chromium and 402 WebKit. Q2 to him: the keyboard sort and its ring are new for keyboard users (D1625) — recommended keep.

Walk: `docs/handpass/2026-11-06-inputs-batch.md` · 157 pictures · 6 surfaces · 9 orders · MISSING: none (Q1 to him; two read findings for filing). One Sonnet walker, 5 scenarios with the plain-user round, 8 PASS 0 FAIL; the headings' ring found white, fixed cyan, re-walked.

Code read (fresh blind Opus): R1, R2 untrue comments fixed; R3 a screen reader is not told a heading can be pressed — the proper fix is a button inside each heading, a picture first; to file.

Checks: touched unit tests 482/482; build clean; lint:changed no new finding; docsize OK.

To file: R3; the Quals table's headings sort by click only; an older observation (a new input's window open from 14 Jul, a click on 28 Jul behind it turns the hidden day window but the window in front still says Jul 14 — D1298 holds); a walk script saved partly as Latin-1 made lint:changed fail (fixed) — walkers' scripts must be saved as UTF-8. Temporary build folders `C:\dw1106`, `C:\db1106` (with node_modules junctions) and `C:\da1106` left outside the repo.
