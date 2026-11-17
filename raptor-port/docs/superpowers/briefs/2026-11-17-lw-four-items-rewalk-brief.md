# The re-walk of the four Leave War items — what the fixes touched (17 Nov 26, chat 102)

You are a walker: you drive the real app in a scripted real browser and return pictures and a filled table. You never
read code to find bugs and never decide that something is a fault — the host does, from your pictures. Work in
`C:/Users/User/projects/Raptor-lw4/raptor-port` (branch `claude/lw-four-items`) — NEVER the folder
`C:/Users/User/projects/Raptor` (another chat's unsaved work). Do not edit, commit or push anything in the repo except
your own output folder named below. Do not run `npm run build`, any `npx playwright test`, or anything that writes
`raptor-port/dist`.

**Read first:** `docs/walk-scripts.md` §3 to §7 (how a walk script is written and what each trap has cost); the first
walk's brief `docs/superpowers/briefs/2026-11-17-lw-four-items-walk-brief.md` ("The build and the world" and "Rules of
the walk" hold for you too, with the build below in place of the one named there); Astra's scenarios 7 and 8 in
`docs/superpowers/briefs/2026-11-17-lw-four-items-scenarios-astra.md`; and the first walk's reports
`docs/img/handpass/2026-11-17-lw-four-items/w1/REPORT.md` and `…/w2/REPORT.md` — their scripts are in
`C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/412624af-f93d-4b92-b143-0d2f8a03fb43/scratchpad/w1/` and `…/w2/`
if still there; reuse them.

## What changed since the first walk (each fixed after it, red-first)

1. Balances on a phone: the pinned name column fills its whole width again on every row and on the heading strip.
2. Balances on a phone: CCL's box no longer runs into FCL's (CCL's column is 7px wider).
3. Balances on a phone: a tapped box near the right edge brings its corner pending tag inside the list too.
4. The OIL award editor: when an award is opened, the list slides only as far as the editor needs, so Save, Cancel and
   Delete are in sight and never under the pinned name columns.
5. The OIL award editor: the word "Delete" sits on the same line as "Cancel" (it stood 1.8px higher on a phone).

## The build

Serve the frozen build, never the repo's `dist`: from `raptor-port/`,
`npx vite preview --outDir C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/8632b059-2c58-4dda-b04c-9e3fccabc96a/scratchpad/walk-dist-356e2fc6a --port 4411 --strictPort`
in the background. Check the port is free first; prove it serves this build: the page's index names `index-oTBS-kUO.js`.
Stop it when you finish. Output folder `docs/img/handpass/2026-11-17-lw-four-items/r1/` (pictures `r1-<scenario>-<step>.png`,
report `REPORT.md`); scratch `C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/8632b059-2c58-4dda-b04c-9e3fccabc96a/scratchpad/r1/`.

Sizes: desktop 1536×864 Chromium by mouse; phone 402×874 Chromium with touch (real taps; finger slides over CDP touch);
phone 402×874 WebKit (real taps; it cannot slide by finger in this test browser — a script slide there, said so in the row).

## Scenarios — each with where its EXPECTED line comes from

- **R-Bb** (= the first walk's B-b) phone, both engines, zoom 1: admin; member `us` with balances unlocked; member with
  balances locked (the admin's setting); slides 0, 100, 220; and in Chromium after a pinch out and back. Measure the name
  heading's and each name cell's width against the first column's track; picture each. EXPECTED: every name cell and the
  name heading as wide as the column, and no figure or box seen inside the name column (D1518, "nothing pinned leaks").
- **R-Bc** (= B-c) phone, both engines: a ½-day PL pending request for a man, made through the real request controls;
  slide its PL box to about 4px inside the list's right edge, tap it; picture within ~100ms of the lift and settled.
  EXPECTED: the box and its amber corner tag end inside the list's right edge (the M5a walk's B-F4, 29 Oct 26: a tapped
  box comes into sight with its pending figure).
- **R-S8** (= Astra's 8) desktop 1536, phone Chromium, phone WebKit: press on Ranger's CCL box exactly where its corner
  tag stands, and on FCL's box at its left edge. EXPECTED: the press focuses the box pressed; CCL's box and FCL's box do
  not overlap — measure the gap (the host's reading, after find 9).
- **R-Ba** (= B-a) Balances at 1536 desktop and 402 phone (both engines), admin: each heading's left edge against its
  column's first box or figure — report every pair more than 2px apart. RECORD CCL's column width.
- **R-Ea** (= E-a) phone, both engines, admin, the tracker from the OIL tab, "From first entry": open the 3 Jan award
  (Drifter's "Weekend recovery") and the 14 Mar award (Drifter's "Exercise recovery") each by a real tap on its part in
  sight, the list NOT slid by a script first. Picture within ~100ms of the lift and settled. EXPECTED (the host's reading,
  after find 13): Save, Cancel and Delete each whole on the screen, on top at its middle, and clear of the pinned name
  columns, with no finger slide. Then: type in the reason and given-by boxes — RECORD whether the list slides again;
  change the amount 1 → 0.5 → 1 and arm Delete — EXPECTED nothing in the editor moves (D2155); press Cancel by a real tap.
  Then open the 3 Jan award, Cancel, and at once the 14 Mar one — RECORD where the list lands. In Chromium also pinch the
  tracker out one step first and open the 14 Mar award — RECORD.
- **R-Ed** desktop 1536 and phone, both engines: with an award's editor open, measure Save's, Cancel's and Delete's top,
  height, and the middle of each one's words. EXPECTED: one height and one line, within 0.5px (§7.11's second lesson 23:
  side-by-side boxes one height and one line); Delete as wide when it reads "Really delete?" as when it reads "Delete"
  (D2155). Close-up picture of the three buttons, both states.
- **R-Ed2** desktop 1536: open an award near the right of the tracker's list (scroll the list to its end first if no
  award reaches past the right edge — say so). RECORD whether the list slides and where the editor lands.
- **R-plain** the plain-user round of these two surfaces, phone Chromium and desktop: open Balances, type a figure into
  an admin's box and Tab away, check the figure kept; open the tracker, open an award, Save a changed amount, check the
  award box and the BAL figure; open it again and Delete it twice. RECORD each figure before and after.

Your report: one table row per scenario × size × role (scenario, size, role, what you did, what the screen showed,
PASS / FAIL / RECORDED, pictures), then anything odd outside the scenarios. Send it ONCE, after stopping every server and
browser you started. Your final message: the count of PASS / FAIL / RECORDED and each FAIL in one line.
