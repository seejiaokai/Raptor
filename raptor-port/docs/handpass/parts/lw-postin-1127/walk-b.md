# Walk part b — the PHONE, admin and member — [LW-POSTIN-BALANCE], 27 Nov 26

Walker B (Opus). Build served at http://localhost:4757/ (bundle `index-CO3aF0BP.js`, checked equal to the local `dist`).
Script: `raptor-port/scripts/handpass/lw-postin-build-b.mjs` (v4). Final run: the 4th, unfiltered, one folder —
`raptor-port/docs/img/handpass/2026-11-27-lw-postin-build/b/` (68 pictures + `results-phone.json`, `results-all.json`;
earlier runs' pictures were cleared by the script, none mixed in). Run log: `…\scratchpad\walk-b-run4.txt`.
Phone = Chromium phone emulation (402 x 874, scale 3, touch, iPhone user agent; 375 x 812 for fit), NOT WebKit. Taps are
CDP touches; each tap has a picture ~90 ms after the lift (`*-q.png`) beside the settled one. Today pinned Thu 26 Nov 26.
Fixtures on real storage, added on Admin → Users: Buzzard (post-in Mon 7 Dec, never typed), Lynx (post-in Mon 7 Dec,
his example), Pelican (post-in Fri 27 Nov, 24 typed — the drawing's world). ("Kestrel" could not be used: it is a callsign
the demo already holds — the add was refused; the script's first run's FAIL F0 was that, not the app.)

Totals (final run): **10 scenarios walked; 73 lines: 49 PASS, 9 FAIL, 15 RECORD, 0 NOT WALKED.**
The 9 FAILs are **two faults**, each seen at several places:

## FAULT 1 — "Not typed" on the phone's Balances page spills into the OIL column (FAIL B1e, B7e, B8e, B9ce)
On the phone Balances page, every row whose LVE was never typed reads "Not typed" (14px bold amber) in a WAR BAL column
55px wide (x 314–369); the words run to x 380.3, over the column's divider and into the OIL figure, which starts at x 376.
The picture shows "Not typ**ed**" printed over the "0 ›" of OIL. Same at 402 and 375 (the page's columns are fixed and
slide sideways), for the admin, the member unlocked and the member locked; 7–8 rows each time (Piston, Forge, Ledger,
Ghost, Talisman, Cotter, Buzzard, Lynx before typing). The approved drawing q11-balances.png is the desktop's; the phone
has no drawing of it. Also visible in the drawing check's page picture (10f, the Talisman and Cotter rows).
- Pictures: `01-bal-admin-402-nt-zoom.png` (3x close-up — the plainest), `01-bal-admin-402.png` (Piston row),
  `07-bal-admin-375-nt-zoom.png`, `08-bal-member-unlocked-nt-zoom.png`, `09b-bal-member-locked-nt-zoom.png`, `10f-…`.
- Reproduce: sign in `ad`/`a` on a 402-wide phone → Leave War → Balances tab; look at Piston's row (SXO group, 4th row):
  "Not typed" overlaps the OIL "0 ›". No setup needed (the demo has never-typed men).

## FAULT 2 — the person window's never-typed boxes have no dashed amber edge (FAIL B2c, B2e, B7pc, B7pe; desktop lead B10x)
D2746: a balance never typed shows its boxes empty "with No grade's dashed amber edge". On the Balances page they do
(`05b-…`, `01-…-nt-zoom`). In the person window (opened by a tap on a name) the empty boxes — Official bal, carried fwd
and CCL/FCL/PL/EL/CL — are empty but keep the plain solid grey edge (computed `solid rgb(102,113,127)`), at 402, 375 and
on the desktop at 1536 (a lead outside my part, `10x-desk-1536-pw-pelican.png`). The drawing q11-person-window.png shows
the dashed amber edge on both LVE boxes. (Lead for the host, not a code read: the dashed rule lives in the Balances
page's stylesheet, `.bp-bx.nt`; the window's own `.r17-box` rule sets the solid edge.)
- Pictures: `02c-pw-buzzard-402-crop.png` (3x), `02-pw-buzzard-402.png`, `07b-pw-buzzard-375.png`, `10x-…`.
- Reproduce: admin, phone 402 → Leave War → Balances → tap Piston's name → his window: the Official bal and carried boxes
  are empty with a grey solid edge (no amber dashes); "Not typed" in amber beside them is right.

## Scenarios walked

| # | Scenario | Result | Pictures |
|---|---|---|---|
| B1 | Balances page, admin, 402: heading, "App bal", the one line, empty boxes, "Not typed" fit, nothing through the pinned heading | heading "OFFICIAL / BAL" two lines, inside its column (PASS B1a); no "App bal" shown or in any screen-reader name/hover (PASS B1b); the line once, 13px grey, between the view switch and the column headings, 8px above them (PASS B1c); **FAULT 1 (B1e)**; list scrolled 360px under the headings — no row shows through the headings or the line (PASS B1g) | 01-bal-admin-402, 01-…-nt-zoom, 01b-…-scrolled |
| B1d | RECORD: rows showing five empty amber boxes | **53 rows; 36 show all five of CCL·FCL·PL·EL·CL as empty dashed boxes**; 17 have some typed (Anvil, Cinch, Ranger, Drifter, Ridge, Basher, Comet, Ace, Torch, Diesel, Relay, Static, Cinder, Rune, Fable, Vector, Wisp). LVE never typed: Piston, Forge, Ledger, Ghost, Talisman, Cotter (+ the walk's Buzzard, Lynx) | 01-bal-admin-402 |
| B2 | Never-typed man's window, 402 | "Not typed" 16px bold amber inside the LVE tile, clear of OIL, not cut (PASS); label "Official bal" (PASS); the line once under the carried box, inside the tile (PASS); window inside the screen (PASS); **FAULT 2** (B2c, B2e) | 02-pw-buzzard-402(-q), 02c-…-crop |
| B3 | Carried fwd typed first (3, Enter) | "Type the Official bal first" shown, inside the window and the screen, on top, not cut (PASS B3a); nothing saved — War bal still "Not typed" (PASS B3b); box emptied and tapped away — still never typed (PASS B3c). RECORD B3d: the red tag stands over "till 31 Dec" (hidden) and over the top ~6px of "Only leave after post-in is deducted."; RECORD B3e: after the box is emptied and left, the red refusal tag stays shown | 03-…(-q), 03b-…-crop, 03c-…(-q) |
| B4 | Below zero, never typed, one-day window (LL Tue 8 Dec) | one tap placed it, no question, window closed (PASS B4a); War bal still "Not typed" after the leave (PASS B4b). RECORD (unchanged on purpose): grid figure beside Buzzard "0" before, "−1" (red) after; every leave button "−1" left (LL −1, OL −1, OIL −1, CCL −1 …); after a CCL too, "LL −2 / OL −2"; RECORD B4c: his tile "0 taken" with LL 8 Dec approved (8 Dec is after today — "taken" looks like days already past; Lynx the same, B6f) | 04a…, 04b-…-one-tap(-q), 04c, 04d |
| B5 | 0 typed into an empty box (CCL on Balances, tap away); below zero for that typed 0 | 0 saved, box "0", dashed edge gone (PASS B5a); LVE stays "Not typed" (PASS B5b); CCL on Wed 9 Dec: "That takes Buzzard to −1 CCL. Tap the same leave again to go ahead." fully in sight, above the buttons, on top (PASS B5c); second tap placed it (PASS B5d); CCL reads −1 (PASS B5e) | 05a(-q), 05b, 05d(-q), 05e(-q) |
| B6 | His example on the phone: post-in Mon 7 Dec, LL Wed 2 Dec (Post in sheet's place-leave door), then 24 typed (Enter) | LL drawn on the grid on 2 Dec (PASS); "Not typed" before typing (PASS); after 24: Official 24, Pending –, War 24 (PASS B6c); his list still shows "LL Wed 2 Dec" (PASS); LL on Mon 7 Dec (his post-in day) comes off: 23/23 (PASS B6e). RECORD grid beside Lynx "23" | 06a–06i |
| B7 | 375 wide | heading, no "App bal", the line once (PASS); **FAULT 1** (B7e); window: "Not typed" 14px (shrunk to fit) inside the tile (PASS); the line wraps to two lines inside the tile (PASS); **FAULT 2** (B7pc, B7pe); "Type the Official bal first" in sight (PASS B7q) | 07-…, 07-…-nt-zoom, 07b(-q), 07c(-q) |
| B8 | Member (us/us, Ranger) unlocked | heading, no "App bal", the line once above the rows (PASS); **FAULT 1** (B8e); every read-only never-typed figure is the amber "–" (254 marks on 52 rows, none other) (PASS B8f); only his own row has boxes (PASS B8g); his window: the line under the box (PASS B8h); typed 2 in his own CCL (Enter) — saved, 3 → 2 (PASS B8i); another man's (Buzzard's) window: no line, Official bal amber "–", War bal "Not typed" inside the tile (PASS B8j). RECORD B8k: Buzzard's small tiles show amber "–" (CCL −1), no "Not typed" words and no War bal line on them | 08…, 08b, 08c(-q), 08d(-q), 08e(-q), 08f |
| B9 | Locked | admin's padlock tap locks (PASS); admin still sees the line (PASS); member: no line on the page (PASS B9cc), "Locked by admin" (PASS), read-only never typed amber "–" (PASS); **FAULT 1** (B9ce); his own window: no line, read only, padlock (PASS B9e). Unlocked again after | 09a(-q), 09b, 09b-…-nt-zoom, 09c(-q) |
| B10 | Drawing check vs `q16-final/phone-pw.png`, `phone-bal.png` (the pictures behind q16-final-phone.png) and q11 | RECORD — see below | 10a–10f, 10x |

## The drawing check (B10)
Taken as the drawing script took its pictures: Pelican added (FCP, OCU, post-in 27 Nov), 24 typed, no leave; a desktop
context at scale 1.25 resized to 402 x 874; the window's own picture, the page at scale 1. Compared pixel by pixel
(over 24 colour levels) and by the y of every text line, paired in order; side-by-side pictures with the differing pixels
in pink: `10b-pw-drawing-vs-build-as-built.png`, `10d-pw-drawing-vs-build-zeros.png`, `10f-bal-drawing-vs-build.png`.
- **His window** (`10d`, the five kinds typed 0 to match the drawing, which was drawn before "Not typed"): the whole window
  sits 0.8px higher (under 2px). Differences over 2px: the line "Only leave after post-in is deducted." 2.4px higher than
  drawn; the five small tiles 2.4px higher; LEAVE / the year picker 2.4–3.2px higher; "No leave in 2026 and ahead." 3.2px
  higher — i.e. the LVE tile is ~2.4px shorter, from the line down. Words, colours, size and left edge of the line match.
  My reading, for the host to confirm: the drawing's mock-up line carried an extra 2px top margin on its inner line
  (`lw-postin-bal-q16b-draw.mjs`, `p.style.marginTop = '2px'`), which the build does not. As built (`10b`), the five small
  tiles differ as intended (empty boxes, not "0") — but with a grey solid edge, FAULT 2.
- **Balances page** (`10f`): every line in the right half of the page matches to the pixel; the line, the headings, the
  rows of the typed men match. Four bands differ: Pelican's name wears a cyan focus ring in the build (the window just
  closed by Escape returned the keys to his name — a walk artefact); Talisman's and Cotter's rows read empty dashed boxes
  + "Not typed" where the drawing had 0 / 0 / 0 (intended, D2746) — and there the spill of FAULT 1 is plain; Ratchet's
  "14" differs by a few anti-aliased pixels (no shift).
- **q11-person-window.png / q11-balances.png** (desktop drawings, by eye beside the phone): "Not typed" in amber where War
  bal stands — matches on both phone surfaces; the dashed amber boxes — match on Balances, MISSING in the window (FAULT 2).

## What I did NOT walk, and why
- Pinch on the Balances page (the leak check used a scripted scroll of the list, 0 → 360, not a pinch); the stand-in
  phone keyboard; WebKit (Chromium emulation only — an iPhone's own font may make "Not typed" wider still).
- The drag (several-days / several-people) window's below-zero question — walked only the one-day window (my part).
- My leave and Approvals' LVE BAL on the phone for a never-typed man — not read (only the grid figure and the leave
  buttons' "left" were recorded).
- Undo / Redo of a first figure, the history line, and an empty Enter / Escape on an empty box — not in my part's list.
- The suspected faults (hidden SANS man, man away twice) — desktop parts; not walked here.

## Notes on the script's own reads
- The lib printed "the point of the Balances tab is covered by something else" four times: a passing note ("… added to
  the roster") or the bid window's closing sat over the tab at that moment; each press still opened Balances (every next
  step read the page). Not a finding.
- Each new read was checked on both states: the spill read passes on typed rows (Pelican, 24) and fails on "Not typed"
  rows. The dashed-edge read (computed border) fails in the window and reads solid on a typed box (B5a); on the Balances
  page the dashed amber edge of a never-typed box is shown by the pictures (`01-bal-admin-402-nt-zoom.png`,
  `10f`), not by that same read.
