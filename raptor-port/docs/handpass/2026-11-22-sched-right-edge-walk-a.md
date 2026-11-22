# Walker A's report — Edit Schedule's right edge and the front day's one place (22 Nov 26)

[SCHED-RIGHT-EDGE] (D2293), [SCHED-OPEN-20-OFF] (D2295); branch `claude/sched-right-edge-135`, the build served at
`http://localhost:4391`. Script `scripts/handpass/sre-a-walk.mjs` (v7), follow-up `scripts/handpass/sre-a-under1920.mjs`;
look scripts `sre-a-look*.mjs` (finding controls only). Desktop: Chromium STARTED at 125% (`--force-device-scale-factor`),
1536 x 864, `viewport: null`, ad/a, a fresh page per scenario; phone: WebKit iPhone 15 Pro at 402 x 874, and Chromium
touch emulation for the swipe. Pictures: `docs/img/handpass/2026-11-22-sched-right-edge/a/` (folders as in the evidence
sheet's "The pictures"). "20" means the front day's left edge 20±1px from the window's left. Errors seen: none, in any run.

## Every scenario

| Id | Result | Measured | Pictures |
|---|---|---|---|
| S1 | PASS | from View-only by the tab: first frame (in-page, 2 frames after the press) Monday at 20.0; settled Monday at 20.0; the strip drawn at one position throughout; left arrow 0–14 (14 wide), clear of Monday | s1-1, s1-2, s1-3 |
| S2 | PASS ×6 | folded ×3: strip right 1536.0 / 1536, lane 0, tab 1510,150 unmoved, next arrow 1522,414.3 unmoved, foot bar 0–1536, page scrollWidth 1536, strip end padding 34; open ×3: strip right 1259.2, panel 1263.2–1510, tab 1510–1536, lane 26, foot bar 0–1259 | s2-1…s2-4 |
| S3 solid | PASS* | tab crop 33 x 108 device px, before and after an arrow press: differ only in 3 pixels by 1 colour level, all inside the tab's 11px rounded corner squares (the edge's anti-aliasing); the same read 60px left of the tab differs in 245 pixels (read calibrated) | s3-1, s3-2, s3-3 |
| S3 beside | PASS [host] | a remark line of Thursday at 1480,444 (30px left of the tab) takes the press and the focus; the week did not move | s3-4 |
| S4 | PASS ×2 | 6 on, 6 back: each day first at 20.0; three quick presses from Monday: Thursday at 20.0 | s4-1, s4-2 |
| S5 | RECORDED ×2 | Sunday first → next: week of 20 Jul, Monday at 20.0 (matches the host); Monday → previous: week of 13 Jul, Sunday at 20.0 (matches) | s5-1, s5-2 |
| S6 | PASS; RECORDED | wheel on the foot bar's track: scrollLeft 6768 of 6768, same week; right-most column (next week's preview Sunday) ends at 1136, tab at 1510 — 374px clear; under the tab at the start and at the far end: nothing. (The bar's › steps one day and crosses the week at Sunday, as the arrows do — seen on the first try, so the wheel was used to reach the end.) | s6-1, s6-2 |
| S7 | PASS ×3 | slim 14 wide at 1522 → pointer near: 38 wide at 1498, background rgba(20,24,29,0.82), opacity 0.75; press: one day (564px), Tuesday at 20.0; pointer away: back to 14 | s7-1, s7-2, s7-3 |
| S8 | PASS all; RECORDED | 822, 1140, 1707, 1920 at 125%, 1536 at 1 and 1.5: S1, S2 (×3 rounds), S4, S6 measures all PASS (strip right = window ±0.4, foot bar with it, page never wider). At 822 the tabs sit in the top bar's Menu — opened through it. Under the tab: nothing at every size but 1920 — there "Templates" (20 x 15 of 71 x 21) and "Live working copy" (1 x 15) at the start (F3) | only-s16-s19-s8/s8-*-folded ×6; only-under1920/u1, u2 |
| S9 | PASS ×2 [host] | (a context WITH a viewport, scale 1, so the window could be resized) at 800: the AIRCREW tab shown, lane 0, page 800/800, the desktop CREW tab hidden; back at 1536: still folded, strip and foot bar to 1536, Monday at 20 | s9-1, s9-2 |
| S10 | PASS ×2 | page 0 → 3113 → 0 by the wheel, open and folded: no sideways page scroll, the strip's sideways scroll unchanged, tab 1510,150 and arrows unmoved throughout; open: AIRCREW heading in sight under the top bar at every sample | s10-open-1/2, s10-folded-1/2 |
| S11 | PASS ×2; RECORDED ×2 | a man (Monday's first seat) held 6px left of the tab: the week rested at 0 → 564 → 1128; then held ON the tab: → 1692; always the week of 13 Jul; each rest one day (564); held at the left edge: back 1692 → 1128 → 564 → 0, dropped on his own seat, Monday unchanged | s11-1, s11-2, s11-3 |
| S12 to View | FAIL | Edit had Wednesday at 20 (scroll 1128); View's first frame: Monday at 20 (scroll 0); the View strip then drawn at 32 positions, 0 → 1128 over about 0.6s; settled Wednesday at 20 | s12-1, s12-2 |
| S12 to Edit | PASS | first frame Wednesday at 20; one position throughout | s12-3, s12-4 |
| S12 heading | RECORDED | panel open: "Aircrew · ‹Wednesday›" | s12-5 |
| S13 | PASS ×2; RECORDED | this week's Friday picked: the week moved, Friday at 20, calendar closed; then next → Saturday at 20, previous → Friday at 20; next week's Wednesday picked: week of 20 Jul, Wednesday at 20 | s13-1, s13-2, s13-3 |
| S14 undo | PASS | 4 on (Friday) → Undo: Monday at 20 | s14-1 |
| S14 arrow after undo | FAIL | next presses after the Undo: Saturday → Sunday → next week's Monday → Tuesday (all at 20) | s14-1b |
| S14 redo | RECORDED | 4 on again (Friday) → Redo: Monday at 20 (matches the host); arrows then Tuesday, Wednesday | s14-2 |
| S15 in view | PASS | Monday's warning "Conflict Saber…" pressed: week did not move sideways (0 → 0), page scrolled down to the lit man | s15-1 |
| S15 off side | RECORDED | the half-hidden day (Wednesday): its five warnings pressed, none moved the week; a warning whose man is off the side: none reachable | — |
| S16 | PASS | Comet dragged from the open AIRCREW panel onto SODB's "+ add" on Monday (drawn there 2 → 3); 4 on; changes window → All changes → "Mon · Programme · SODB … Comet put on" pressed: Monday at 20 | only-s16-s19-s8/s16-1, s16-2 |
| S16 arrows after | FAIL | after the jump: the changes window still open; next → Saturday, then Sunday | — |
| S17 | RECORDED | Wednesday's date pressed: board for Wednesday, full width, page not wider; Done: Wednesday at 20 (matches the host); arrows then Thursday, Friday | s17-1, s17-2 |
| S18 | PASS | View-only strip 0–1536; opened Monday at 20; 3 on, 3 back, each at 20 | s18-1 |
| S19 | PASS ×6; RECORDED ×2 | panel open: Comet dragged onto "+ add"; "WALK A NOTE" typed in a remark, kept after a press elsewhere; folded; Monday's warning list opened and closed by its bar; calendar closed by ✕, Escape and a press outside; Undo ×2 / Redo ×2 took back and restored both in order; View-only Sched: Monday at 20, Comet drawn on Monday there once (the reads on the two pages are not comparable counts); the week's sideways scroll stayed 0 at every step; no errors | only-s19/s19-1…s19-9 |
| P1 | PASS ×3 | WebKit 402: Edit → View → Edit by the phone menu: Monday at 0.0, strip 0–402, AIRCREW tab 373–403, lane 0, page 402; pictures right after each tap and settled | p1-1a…p1-3c |
| P2 | RECORDED ×2 [main] | a finger swipe: one day (390px), Tuesday flush at 0; AIRCREW tab tapped: drawer opens, tapped again: closes, week unmoved | p2-1…p2-3b |

## Findings

**F1 — Edit Schedule → View-only Sched: the View week glides from Monday to the carried day (S12).**
What I did: on Edit Schedule pressed the next-day arrow twice (Wednesday first, at 20), then pressed the top bar's
"View-only Sched". What I saw: two frames after the press View shows Monday first at 20; the strip is then drawn at 32
positions over about 0.6s and settles with Wednesday at 20. The picture taken about 0.15s after the press shows Monday
half gone off the left, mid-glide. The other direction (View → Edit) is drawn on Wednesday from its first frame.
Expected: Wednesday first, 20 in, at the first frame [D2295; the brief's S12]. Picture `a/s12-1-view-first-frame.png`
(and `a/s12-2-view-settled.png`). Not known whether `main` glides the same way — the change only moved the target 20px.

**F2 — after an Undo, or "take me to this change", brings Monday back, the next-day arrow jumps to Saturday (S14, S16).**
What I did: changed Monday (a jet's stores, or Comet dragged onto a row), pressed the next-day arrow four times (Friday
first), then Undo (or the changes window's line). Monday came back at 20 — then one press of the next-day arrow showed
Saturday, not Tuesday; further presses Sunday, then the next week. Expected: each press moves one day [D2293; the
arrows "still step one day at a time"]. The arrows remember where the last presses were heading (pan.ts), and the jump
back does not clear it. A date picked in the calendar (S13) and the board's Done (S17) are followed by one-day steps.
Picture `a/s14-1b-one-press-after-undo.png`. Likely older, met in passing (`main`'s Undo would land inside the same
remembered range) — to check on `main`.

**F3 — at 1920 wide (125%), folded, the CREW tab lies over the right of Thursday's "Templates" button (S8).**
What I did: opened Edit Schedule in a window 1920 wide, folded the panel. What I saw: the tab covers 20 x 15px of the
71 x 21 button; the word reads "Templat". The visible part takes a press and opens "Day templates — Thursday".
At every other size walked, nothing pressable lies under the tab. Expected: D2293 lets the tab lie over the days and
keeps only the far end clear, so this is a question for the host, not a fail. Pictures
`a/only-under1920/u1-templates-under-tab.png`, `u2-after-press.png`.

Not findings, noted: S3's three corner pixels (anti-aliasing at the tab's rounded corner); S6's 374px of empty strip at
the far end (the next week's preview days end there, as on `main`); the changes window stays open after its jump (S16).
