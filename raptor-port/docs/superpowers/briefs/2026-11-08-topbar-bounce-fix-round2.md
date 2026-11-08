# Astra's work order, round 2 — what the walk of the fixed top bar found (D1873, 8 Nov 26)

Same terms as round 1 (`docs/superpowers/briefs/2026-11-08-topbar-bounce-fix.md` §The job's terms): your round-1 change is
committed as e7f20fef5 on `claude/lw-pin-last-frame`; leave this round's change uncommitted; never commit, push, stash,
switch branch, merge or rebase. **One difference:** you may build and run browser scripts this time, but only under the
checks lock — `node scripts/gatelock.mjs exec "claude/lw-pin-last-frame — astra round 2 <what>" -- <command>` from
`raptor-port/` (it waits while another run holds it) — on a free port (check first), stopping any server you start by its
port. The walk's report and pictures: `docs/img/handpass/2026-11-08-lw-pin-last-frame/walk/topbar/` (A/ the pixel check,
B/ the scenarios); its scripts: `scripts/handpass/topbar1108-*.mjs` (`topbar1108-a.mjs` is the before/after pixel check —
the before build was commit b0968d50d, made by `git archive` into a short Temp path with `node_modules` by junction).

## The findings — for each: reproduce, find the cause, fix it if this change causes it (red first where the PC can show it), or show it is not from this change

1. **The Leave War grid at rest is not as before** (both sizes; the before build was identical to itself): its day columns
   are about 1 px wider each in the after build — at 1536 (Chromium, scale 1.25) TUE 14 to WED 24 spans about 325 px
   against 315, and SAT 25 is cut at the right edge where before it was whole; at 402 WebKit the columns are shifted sideways
   likewise. Pictures `A/SIDE-desk-lw-grid.png`, `A/CROP-desk-lw-grid.png`, `A/SIDE-phone-lw-grid.png`,
   `A/CROP-phone-lw-grid.png`. Suspects to rule in or out: the grid measuring a width or height in a layout effect before
   `Shell`'s layout effect writes `--topbar-h` (React runs a child's layout effects before its parent's); a scrollbar
   present at one moment and not the other; the variable now fractional where it was rounded. **Nothing he sees at rest may
   change** — the grid must land exactly as before.
2. **Two small differences on the Leave War's other tabs, desktop:** the OIL tab, 438 px along its "SHOW / From first entry
   / RANGE" row (`A/SIDE-desk-lw-oil.png`, `A/CROP-desk-lw-oil.png`) — a sub-pixel move?; the Balances page, 17 px inside the
   bar's right-hand buttons (`A/SIDE-desk-lw-balances.png`). Explain each; fix it if it comes from this change (for example a
   reader that sat at a rounded `--topbar-h` and now takes a fraction).
3. **A page error once, on the after build only:** "ResizeObserver loop completed with undelivered notifications", in
   WebKit at 874×402 (a phone on its side, the bar wrapped to two rows, 103–104 tall), during a resize sweep. Find whether
   the bar's observer writing `--topbar-h` can feed back (the spacer → the page's height → a scrollbar or width → the bar's
   wrap → its height) or chain with another observer (the page names' fold, `ui/navfold.ts`; the Leave War's `moved`
   observer in `Matrix.tsx`, which watches the bar), and make a loop impossible; the browser tests count a page error as
   a failure.
4. **The bell's list starts 7 px inside the bar's lower edge** (`B/CROP-s6-bell.png`): the walk did not compare it with the
   before build. Say whether it is as before (and how you know), and fix it only if this change moved it.

## Report (final message)
Each finding: reproduced or not (how), its cause, what you changed and why, the red test (how you saw red), the unit tests
you ran with counts, and what the host must re-walk.
