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

### His second recording (21:52) and D1612

On the fixed preview the Tracker showed the claw in the frame after the tap; the Leave War, from View-only Sched, one
frame of plain dark tiles first (Safari repainting the whole screen; the claw is part of that repaint). His "Do it" (D1612):
the claw goes up at the tap and the page switches one frame later, under it. Walk case W (both pages, the menu on a phone and
the top bar on a desktop): the claw up one frame before the page, one claw, gone once the page arrives — 12 of 12; the whole
walk 75 of 75 (`walk-tap/`); unit checks 21 of 21; the Shell, Leave War and Tracker suites 218 of 218. What his phone draws
in that frame only his phone can show: his look is the proof. His follow-up idea — that frame in the claw's own background —
is the next step if a frame remains (the page's base is the dark with its faint wash, D887; the claw's is the plain dark).

## [TALON-CLAW-BG] — the page's plain dark, the one-frame raise out, the start-up claw from its first frame (D1614, D1615)

Built on `claude/talon-claw-visible` (pull request 628), 3 Nov 26, in a fresh chat from the handoff. **What changed:** the
body's two faint radial washes went — every page's background is the claw's plain `#0B0D10` (`00-foundation-login.css`;
the sign-in's own light round its logo stays, D887); D1612's one-frame-early raise taken out whole (`pageclaw.ts openPage`,
`setPageReady`, `Shell.tsx`, `Drawer.tsx`, its tests and walk case W) — the pages switch at the tap again, the placeholder
raising the claw; the start-up claw's 0.3 s wait gone (`bc-wait`), and both claws start every animation 0.2 s into the
round from one shared rule (`linear -.2s infinite`), the page claw's separate delay rule folded into it.

**Tier — WALK.** The eight questions: 1 money — no; 2 the published record — no; 3 saved data — no; 4 a shared drawer —
**yes** (the page background is drawn behind every page, and the claw's rules serve both claws); 5 a new gesture — no
(D1612's raise came out; nothing new is pressed); 6 a new surface — no; 7 roles — no; 8 the warning list — no.

**Roll-call (§6).**

| Place | Has it / must not | Seen and operated |
|---|---|---|
| Every page in the menu (nine), phone and desktop | the plain dark, no wash | walk Z: computed background on each of the nine, 9 of 9, Chromium and WebKit phone, Chromium desktop |
| The moment before a slow page's claw (the page area, claw hidden) | the claw's exact dark | walk Z: 0 of 1,323,384 pixels off (phone, both engines), 0 of 1,236,480 (desktop); `walk-bg-pages/Z-*-before-claw.png` |
| The sign-in and the access screens | must not change — keep the logo's light (D887, D1614) | the `.login` rule untouched; pictured `walk-bg-boot/A-chromium-phone-app.png` |
| The start-up claw on a slow start | from the first frame, 0.2 s into its round | walk A (Chromium), B (WebKit): first frame visible; left / middle / right drawn 66 / 1 / 0% (Chromium), 75 / 3 / 0% (WebKit); the right claw starts 0.20 s and 0.18 s later |
| The start-up claw on a quick start (D1615) | shown from the first frame, gone with the sign-in | walk D: shown at the first frame (66 ms), app up 234 ms, gone 478 ms |
| What the first frame DRAWS (lesson 22) | a clear part of the claw | walk Q (new): 18, 20, 22, 23% of the whole claw's pixels in the first four frames showing the page; `walk-bg-boot/Q-first-frame.png` |
| The page claw, every way in (menu, top bar, bell, a member) | switches at the tap, the placeholder's claw | walk A, T, F, G, H — all pass with the raise removed |
| The page claw's first frames (lesson 22) | a clear part of the claw | walk V: 20–30% over the first 0.1 s, both pages |
| Less motion, a failure at start, a reload, the desktop | as before | walks C, E, F, G, I, K (start-up) and E, K, U (pages) |

**Sizing (§7.0).** 1 Type: E (a look on every page) with C (a timing change of the start-up claw). 2 What only a walk could
find: whether the moment before the claw is really the claw's dark on screen (a pixel count, not a style read), whether the
start-up claw's first frame draws something (lesson 22), and whether the pages still raise the claw with the raise gone.
3 The ledger: the claw's three walks today found faults only by frames and pixels (the frozen mask, the late fade, his dark
first frame). 4 The walk: the host alone, the two existing scripts re-run whole on the built app, the start-up one rewritten
to the new rule (A, D) with a new pixel case Q, the page one with a new case Z (the background, pixel by pixel) and case W
removed; Chromium and WebKit at a phone's size, Chromium at 1536. Carried by tests: the shared rules' timing, the absence
of the wait and of any separate delay rule (`bootclaw.test.ts`, `pageclaw.test.tsx` — they read the page's styles; red on
the old page first). 5 The ledger's row, added below.

**Lessons (§7.11) against this change:** 22 — cases Q and V count drawn pixels, first frames included; 10 — every page
switch walked from its first frame (V, Z); 6 and 7 — the one frame Safari may draw before the claw only his iPhone can show:
his look is the proof; 3 — the feedback is the claw itself; 1, 2, 4, 5, 8, 9, 11–21 — no state table, gesture, window, box,
drawing, list, zoom-dependent reading, pinned bar, typed box, width control, print or swipe is touched.

**Red first.** The unit checks failed on the old page (2 of 17) before the change. Case Z, run with the old wash put back
(`Z_OLDWASH=1`): 9 of 9 fail — 1,319,984 of 1,323,384 pixels of the empty phone page tinted (the stripes), 612,335 on the
desktop. On the new build: all pass.

**Checks.** The start-up walk 27 of 27 (`walk-bg-boot/`); the page walk 75 of 75 (`walk-bg-pages/`); the claw unit checks
17 of 17; the app, menu, Leave War and Tracker suites 264 files, 4,704 passed; the build. Load time
(`talon-load-time.mjs`, 9 runs, CPU 4x, a phone's 4G): first paint 556 ms, the app up 1,646 ms — 1.70 s before; nothing
added. GitHub's run: the pull request's.

**Walk:** start-up claw 27/27 + page claw 75/75 on the built app, Chromium and WebKit 402/390 phone and 1536 desktop,
pictures in `docs/img/handpass/2026-11-03-talon-pages/walk-bg-boot/` and `walk-bg-pages/`; his iPhone look owed.

### The design look of the claw (/impeccable critique, his ask, 3 Nov 26)

Two fresh readers, blind to each other: a design review (Opus) and the design checker with the browser (the skill's
detector on the page, measurements). The skill's own snapshot is not kept here (observation log, the critique's
"Persist" step); its scores are recorded below. **Verdict: good — the app's own mark, drawn with the gesture the mark
suggests; specific to TALON, not a spinner.** Scores (Nielsen, 0–4; four do not apply to a loading state): status 3, the
real world 4, control 4 (the page claw; the start-up n/a), consistency 3, minimalism 3, recovery 2 — 19 of 24. The
checker: nothing on the claw (the page-wide findings it lists are the app's older ones, none on the claw's parts; two on
the page body were its own banner's); the cyan on the dark 9.66 : 1; less motion stops all seven animations, the claw
whole; the start-up and page claws centred exactly; the page claw starts at the top bar's foot.

| # | Finding | Disposition |
|---|---|---|
| 1 | The hand-over to the sign-in shows both logos at once, in two places and sizes (72px mid-screen against the sign-in's 32px at the top on a phone) — a quick start reads as a flicker | put to him — [TALON-CLAW-HANDOVER]; picture `look/1-handover-mid-fade.png` |
| 2 | About 0.3 s of plain dark at the end of every round (the fade done by 1.57 s, the next draw easing in from nothing) | put to him — [TALON-CLAW-ROUND-GAP]; pictures `look/2a…2d` (2c and 2d draw nothing) |
| 3 | The page claw says nothing to a screen reader | filed — [TALON-CLAW-SPOKEN], a small fix with the next claw change |
| 4 | A failed download of either slow page is caught by nothing (from the code, not seen) | filed — [LAZY-PAGE-LOAD-FAIL], reproduced in the walk first |
| 5 | Small on a desktop (72px in a 1536-wide page) | leave — calm for a working tool (the reader's own view) |
| 6 | The design guide named the claw's light only "while the app starts" | fixed — the page claw added (`design-practices.md` §no glow) |
| — | The light, the 0.2 s fade, the 1.77 s rhythm, contrast, less motion | right as built — leave |

**His question (3 Nov 26): do the loaded pages look different without the wash?** Only their bare background: cards,
buttons, pucks, words and colours are as they were; busy pages barely change, sparse ones (Admin, Help) lose the faint
tint at the top and the hard line where it repeated. Pictures, before and after: `loaded-pages/` (phone and desktop, four
pages; `scripts/handpass/talon-bg-loaded-pages.mjs`).
