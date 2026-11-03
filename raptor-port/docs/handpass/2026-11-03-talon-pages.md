# Bug check — the loading claw while a slow page opens (3 Nov 26)

[TALON-CLAW-PAGES] (D1607, D1610, D1611) on `claude/talon-claw-pages`, cut from `main`. The order: `docs/bug-check-order.md`.
Built in two steps: a test on the Leave War for his phone (D1610), then — on his "2", the claw from the tap (D1611) —
the build for the Leave War and the Tracker, the test switch taken out.

## Tier — WALK

The eight questions (§5): 1 money — no (no OIL, no count); 2 the published record — no; 3 saved data — no (nothing is
stored; the claw is put on the page and taken away); 4 a shared drawer — no (one overlay, raised from one place, the two
pages' placeholders in `ui/Shell.tsx`); 5 a new gesture or mode — no (it takes no taps; the top bar stays usable);
6 a new surface — yes (the claw over the page area); 7 roles — no (the same for an admin and a member); 8 the warning
list — no. **WALK.** No code read is required at WALK; none was run. Its styles are shared with the start-up claw, so the
start-up claw's own walk was run again (below).

## Which pages go blank — measured first (D1607)

`scripts/handpass/talon-page-blank.mjs`, the built app, every page of the menu opened as he does (the ☰ menu on a phone,
the top bar on a desktop), timed from the press, 3 runs each, medians; on a phone's 4G (9 Mbit/s, 40 ms). Results:
`docs/img/handpass/2026-11-03-talon-pages/blank.json`.

| Page | His iPhone's speed: blank / screen held | Phone slowed 4x | Desktop |
|---|---|---|---|
| Leave War (first open) | **blank 434 ms** | **blank 1,454 ms** (longest freeze 752 ms) | blank 409 ms (before the pre-warm) |
| Tracker (first open) | **blank 386 ms** | **blank 741 ms** (longest freeze 400 ms) | blank 406 ms |
| View-only Sched, Edit Schedule, Inputs, Quals, Logic, Help, Admin | never blank — the old screen held 18–58 ms | never blank — held 86–283 ms | never blank — held 23–53 ms |

The first run read every ordinary page as 6–14 ms: its clock started at the click and stamped frames with their start
time, both after a long task that begins at the press. A second instrument (the browser's long-task record) showed the
freeze (Inputs 242 ms at 4x); the script was corrected to time from the press (skill observation 788) and re-run.

## The roll-call (§6) — every way into the two pages, and every place the claw could wrongly show

| Place | Has it / must not | Seen and operated |
|---|---|---|
| Leave War, phone, from the ☰ menu | has it — from the tap, under the top bar, fades as the page is drawn | walk A (Chromium, WebKit), B, U; `walk-build/A-*`, `U-1`, `U-2` |
| Tracker, phone, from the ☰ menu | has it — waits for the chart itself | walk T (Chromium, WebKit), B, U; `walk-build/T-*`, `U-4`, `U-5` |
| Leave War, desktop, the top bar's tab | has it | walk F; `walk-build/F-desktop-leavewar-claw.png` |
| Tracker, desktop, the top bar's tab | has it | walk F; `walk-build/F-desktop-tracker-claw.png` |
| The bell's Leave War line (`sync.ts openWarAt`) | has it — the same page switch | walk G, a member's approved leave on a new visit; `walk-build/G-bell-claw.png` |
| The Holidays list's new period (`openNewPeriod`), the schedule's "create a leave period" (`interactions.ts`) | has it — the same page switch, `setPage('leavewar')` | carried by the code (both call `setPage`; the claw is raised by the page's placeholder, not by the caller); not walked — each needs a year with no leave period, and their route on screen to the claw is the menu's |
| A member | has it, the same | walk H; `walk-build/H-member-claw.png` |
| The desktop's hidden pre-warm of the Leave War | must not — the page is not on screen | walk F (3.5 s idle, no claw) |
| A second open in the same visit | must not — the page is kept, nothing to wait for | walk D (both pages), U step 7 |
| Leaving for another page before it arrives | must not stay — goes at once, never comes back over the other page | walk C; `walk-build/C-inputs-after.png` |
| Every other page | must not — never blank (measured above) | nothing raises it there; the placeholders are the only callers (`ui/Shell.tsx`) |
| The start-up claw (shares the rules) | must stay as it was | its own walk again, 25 of 25: `docs/img/handpass/2026-11-03-talon-pages/startup-claw-recheck/` |
| Less motion | still and whole, removed at once | walk E; `walk-build/E-still.png` |

## Sizing the walk (§7.0, `docs/walk-ledger.md`)

1. **Type:** B (a new surface — the claw over the page area) and E (its look and where it sits), on two pages.
2. **What only a walk could find:** whether it shows at the tap and goes in the frame the page is drawn, in the
   iPhone's engine too; whether the top bar stays pressable over it; whether it keeps moving while the page builds
   itself; whether anything leaves it on screen (a page that draws late, leaving early, the hidden pre-warm, a second
   visit). The unit checks cover its markup, its shared rules and how it is taken away.
3. **The ledger:** B walks found a fault 4 times in 5; the start-up claw's walk (B, D, E, the row of 3 Nov 26) found one,
   a masked claw that froze on a busy page — so the busy page and the iPhone's engine are where to look.
4. **The walk chosen:** the host alone, one script (`scripts/handpass/talon-page-claw-walk.mjs`, 61 checks) on the
   built app, Chromium and WebKit at his iPhone's 402 × 874, Chromium at 1536 × 864; each page's download held back
   where the claw must stand; the busy page proved by the screen's own frames (Chromium — WebKit's Windows build draws
   everything on the page's thread, as an iPhone does not); the plain user's round (D1557). Carried by tests: its
   markup and shared rules (`ui/pageclaw.test.tsx`), the fade, the quick and leaving cases, the wait for the Tracker's
   chart and its cap (the same file; they call the code directly — the walk drives each through the real controls too).
5. **After the walk:** the ledger's row of 3 Nov 26 for this job.

## What the walk found, and each disposition

| Found | Disposition |
|---|---|
| With the start-up claw's 0.3 s wait, at his iPhone's speed the claw was on screen one to three frames (the screen's own frames, 3 runs) — a flicker, not a loading claw | put to him with two preview links; his "2": from the tap (D1611); built |
| In WebKit the Tracker's chart is drawn about 0.2 s after its page appears: the claw faded over an empty chart | fixed: the Tracker's claw waits for its chart (or "no course yet"), at most 3 s (`dismissWhenDrawn`); red in walk T-webkit first, green after; unit checks added |
| The wait then started its fade 51 ms after the chart in WebKit (a 16 ms timer delayed by the busy page) | fixed: the chart is noticed the moment it is added; the fade now starts in the frame the page arrives in all four slow opens |
| Three checks of the first test were wrong, not the app (two looks inside the claw's hold; a busy stretch timed over the hold; a "quick open" that is never quicker than 0.3 s) | the checks corrected; the claw's movement while busy confirmed from the screen's frames (a strip of 25 frames, looked at) |

## Break test (§9)

The claw taken out of both placeholders, rebuilt, the two slow opens walked (`ONLY_AT=1`): **red**, both
("0.12 s after the tap the claw already shows" — none). Put back, rebuilt, walked: green.

## Checks

- Unit: `ui/pageclaw.test.tsx` and `ui/bootclaw.test.ts`, 17 of 17; the Shell, Leave War and Tracker page suites
  (9 files), 208 of 208; the browser test of the Leave War's separate download, 1 of 1.
- Code check (`npm run lint:changed`): no new finding.
- The app's first load (`scripts/handpass/talon-load-time.mjs`, 9 runs, a phone slowed 4x on 4G): 1,659 ms to the
  sign-in, first paint 548 ms — the claw's own build measured 1,691 ms and 552 ms; `index.html` 9,985 bytes (7,701
  before).
- GitHub's run of pull request 627 is the full gate set (D1086): 24 of 25 jobs green on its first run; the Leave War
  desktop group's Ctrl+scroll zoom test ran out of its 30 s twice (main's runs of it take 12–23 s; it passed here in
  16 s with this change) — one re-run of the failed group by his rule (D84): green, the test in 12.1 s.

## Not walked, and why

- The Holidays list's and the schedule's ways in — above (the same page switch; each needs a year with no period).
- His own iPhone: WebKit on Windows stands in for its drawing, not for its speed or its touch (the order's §7.11, 6 and
  21) — his look on the preview is the proof there.
- A real slow network: the downloads were held back by the script, not slowed; the 4G figures above are the measure.

## His find — a dark page before the claw (3 Nov 26, 20:46, after the merge)

His iPhone recording of the live app (`docs/img/handpass/2026-11-03-talon-pages/his-recording/`, frames every 0.05 s;
`strip-after-each-tap.png`): after the tap on the Leave War, two frames of the old page dimmed (the page switching), then
0.1 s of dark page with only a speck of claw, then the claw; on the Tracker the same 0.1 s of speck. The claw's scratch
starts from nothing and eases in: its left claw is 2% drawn at 0.05 s and 12% at 0.1 s. The walk's check ("0.12 s after
the tap the claw already shows") read the element's presence and opacity, never its pixels — the order's §7.11, lesson 22.

- **Red first:** walk case V (`talon-page-claw-walk.mjs`, `ONLY_V=1`), the screen's own frames read for the claw's drawn
  pixels in its first 0.1 s, against the whole claw's: on the live build 0% in all six frames, both pages — FAIL
  (`visible-before/`).
- **Fixed** on `claude/talon-claw-visible`: the page claw starts its round 0.2 s in (`index.html`,
  `.pgclaw … {animation-delay:-.2s}`) — two-thirds of the left claw in the first frame, the scratch running on from there;
  the start-up claw untouched. Case V green: 20%, 23%, 24%, 26%, 27%, 30% of the whole claw over the first six frames
  (`walk-visible/`; `first-frame-before-after.png`).
- **Re-walk:** the whole walk again on the fixed build — 63 of 63 (`walk-visible/`); unit checks 17 of 17.
- **Not changed:** the two frames of the old page at the switch on the Leave War (the page switching, before the claw can
  be drawn — measured for every page in §Which pages go blank); the start-up claw before the sign-in shows only on a load
  slower than 0.3 s (D1605) — put to him.
