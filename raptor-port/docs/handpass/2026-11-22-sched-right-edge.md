# Evidence sheet — Edit Schedule's right edge under the folded CREW tab, and the front day's one place

[SCHED-RIGHT-EDGE] (his D2293) and [SCHED-OPEN-20-OFF] (his D2295), 22 Nov 26, chat 135, branch
`claude/sched-right-edge-135`. Laid down when the build began; the walk fills it. Pictures: `docs/img/handpass/2026-11-22-sched-right-edge/`.
The drawing he approved, with its measures: `docs/mock/2026-11-22-sched-right-edge/`.

## The eight answers and the tier

| # | Question | Answer | Reason |
|---|---|---|---|
| 1 | Money (OIL included) | NO | a strip's width and a scroll position; no figure is read or written |
| 2 | The published record | NO | nothing in publishing, signing or amendments is touched |
| 3 | Saved data | NO | where the week stands is view state, never stored |
| 4 | A shared drawer | YES | one routine places the front day for both schedule pages, a date pick, an Undo and two jumps, on a desktop and a phone |
| 5 | A new gesture or mode | NO | no new control; the same tab, arrows and scroll bar |
| 6 | A new surface | NO | no new screen, panel or row |
| 7 | Roles | NO | nothing about who may do or see anything |
| 8 | The warning list | NO | no warning's words or rule; only where the week rests after a warning is pressed |

**Tier: WALK.**

## The rulings that apply

| Ruling | In the app's words | Checked on the build |
|---|---|---|
| D2293 | folded, the days run to the window's edge under the CREW tab; the far end keeps a gap; open, the tab keeps its lane; the arrows step one day | |
| D2295, D275 | a day brought to the front rests the strip's 20px margin in, however it got there; no room added beside the left arrow | |
| D1522, D1526, D1527 | the week's arrows are slim see-through tabs that slide out near the pointer | |
| D1518 | nothing pinned leaks — the CREW tab is solid over the days | |
| D1528 | no grey browser scroll bar on Edit Schedule; the foot bar fits the week each time the panel is hidden or shown | |
| D1116, D1122 | the AIRCREW heading and its day picker stay in sight; its › stays put | |
| D1529, D1573 | a man held at the week's side steps one day and never crosses the week | |

## The roll-call — every place the app brings a day to the front, or draws the right edge

| Place | Shows it | Usable | What else is painted there |
|---|---|---|---|
| Edit Schedule, panel folded — right edge, desktop | YES — strip to the window's edge at 822, 1140, 1536, 1707, 1920 (125%) and 1536 at 1 and 1.5 (S2, S8; `s2-2`) | YES — the tab and slim arrow press; a control 30px left of the tab takes the press (S3, S7); far end clear of the tab (S6) | the CREW tab, solid (S3, three anti-aliased corner pixels aside); the slim next-day arrow; at 1920 the tab lies over part of Thursday's "Templates" button (finding F3) |
| Edit Schedule, panel open — right edge, desktop | YES — strip ends at the panel, tab in its lane right of the panel at every size (S2, S8; `s2-4`) | YES — fold/unfold pressed three times each (S2) | the panel; the tab in its 26px lane; the next-day arrow in the lane |
| Edit Schedule — the fold and unfold themselves (the foot bar follows) | YES — the foot bar to the window's edge folded, to the strip's end open, every round (S2, S8, S9) | YES — three rounds; a resize to 800 and back keeps it (S9) | nothing; page never scrolls sideways (S2, S10) |
| View-only Sched — right edge, desktop (must not change: it never had the lane) | YES — strip 0–1536, arrows step one day at 20 (S18; `s18-1`) | YES — arrows 3 on, 3 back | the slim next-day arrow, as before |
| A phone — both pages (must not change: no lane, a day rests flush) | YES — Monday at 0, strip to 402, no lane, AIRCREW tab over the day's right edge, both pages, switched by the phone menu (P1) | YES — menu taps, a finger swipe moves one day and rests flush, the AIRCREW drawer opens and closes by its tab (P2) | the AIRCREW tab |
| The Scheduler Board (must not change: its own layout, no week strip lane) | YES — board full width, its own right column, no change seen (S17; `s17-1`) | YES — opened from Wednesday's date, closed by Done | its issues list and crew panel |
| Front day after a day arrow, both pages | YES — every press one day, landing at 20 (S4, S8, S18) | YES — 6 on, 6 back, 3 quick | — |
| Front day after a page switch, both directions | YES settled — Wednesday at 20 both ways (S12); View→Edit first frame already right (S1, S12) | YES — by the top bar's tabs, and the Menu at 822 | Edit→View: the week GLIDES from Monday to Wednesday in its first 0.6s (finding F1) |
| Front day after a date picked in the calendar | YES — Friday at 20; another week's Wednesday at 20 (S13) | YES — the arrows then step one day from Friday | — |
| Front day after an Undo whose day is off the side | YES — Monday at 20 after Undo and after Redo (S14) | PARTLY — the next-day arrow after the Undo lands on Saturday, not Tuesday (finding F2) | — |
| Front day after a warning pressed / "take me to this change" | YES — "take me to this change" brings Monday to 20 (S16); a warning whose man is in view does not move the week (S15) | PARTLY — after "take me to this change" the next-day arrow lands on Saturday (F2); a warning whose man is off the side: none could be reached (S15) | the changes window stays open over the week after the jump (recorded) |
| Front day after a week crossing by arrow (Monday / Sunday landing — must not change) | YES — next week's Monday at 20, last week's Sunday at 20 (S5) | YES | — |
| The next-week preview pressed (lands where it was pressed — must not change) | NO — not walked by walker A: no scenario of the brief pressed it | NO — not walked | not walked |
| (added) Edit Schedule, page scrolled to its foot | YES — tab, arrows fixed; AIRCREW heading in sight under the top bar at every step (S10) | YES — wheel down and back | nothing |
| (added) A man held at the week's right side, folded | YES — the week steps one day at a time while held, both 6px left of the tab and ON it; never crosses the week (S11) | YES — dropped back on his own seat, nothing changed | the drag's ghost lies over the tab (`s11-2`) |

## The five sizing lines (§7.0)

1. **Type of change: E (layout) with A.** E — two style rules under the folded crew panel take the 26px lane away so the
   days run under the CREW tab and the next-day arrow, the strip's far end keeping 34px; A — one shared reading
   (`weekFrontInset`) now places the front day for every way the app brings a named day forward (a page switch, a date
   picked, an Undo, a warning, "take me to this change", the board's Done), on both schedule pages, desktop and phone.
2. **What only a walk can find here:** what now lies UNDER the tab and the slim arrow (is it pressable, does the tab stay
   solid over a day), the foot scroll bar and the page's own sideways scroll at each fold and unfold, the arrows' slide-out
   at the new edge, the hold-at-the-side drag now that the strip runs to the window's edge, the moment just after each
   page switch (the first frame, not only the settled one), and each door that brings a day forward pressed through the
   app's own control — the tests write the change behind three of them. Also the sizes where a whole day ends near the
   window's edge (1140, 1707) and the scalings his screens use. The browser tests carry the settled measures at 1536 x 864
   (the table below); the readers carry the code.
3. **What the ledger says:** layout (E) walks found a real fault in four of ten, six faults, and the owner's own look has
   found more on layout than the walks; shared-calculation (A) walks found mostly OLDER faults met in passing (12 of 14) —
   so the walk presses every door of the calculation and the moment after each, and records what it meets.
4. **The walk chosen:** one walker (walker A), one script (`scripts/handpass/sre-a-walk.mjs`), 21 scenarios
   (S1–S19, P1, P2): S1–S7 and S12–S16 the change's own surfaces; S8 the sizes beyond the required two — 822, 1140, 1707,
   1920 wide at 125%, and 1536 wide at scale 1 and 1.5; S9–S11, S17, S18, P1, P2 what must not change and the neighbours;
   S19 the plain-user round (§7.0a). Desktop is Chromium STARTED at 125% (a real scaling), 1536 x 864; the phone is WebKit
   at 402 x 874 and Chromium touch emulation for the finger swipe. The repeated cases a test carries are in "The cases
   carried by a test" below, each walked once here at 125% as well. No short screen: the change is to the strip's sides,
   not to a column that fits the screen's height.
5. **After the walk:** row added — left for the host.

## The orders walked

Walker A, `scripts/handpass/sre-a-walk.mjs` (v7) on the build served at `http://localhost:4391`, Chromium started at
125%, 1536 x 864, signed in ad/a, a fresh browser page per scenario. Full report: `2026-11-22-sched-right-edge-walk-a.md`.
Runs cited: the full run (`a/`) for S1–S7, S9–S15, S17, S18, P1, P2; `ONLY=s16,s19,s8` (`a/only-s16-s19-s8/`) for S16 and
S8; `ONLY=s19` (`a/only-s19/`) for S19; `scripts/handpass/sre-a-under1920.mjs` (`a/only-under1920/`) for the 1920 follow-up.

| Order | Result |
|---|---|
| View → Edit by the tab (and by the Menu at 822) — Monday first | PASS, first frame and settled, 20 (S1, S8) |
| fold → unfold, three times; at six sizes and scalings | PASS every measure (S2, S8) |
| fold → arrow on a day | tab crop identical but for 3 anti-aliased corner pixels at 1 colour level (S3) |
| folded: 6 on, 6 back, 3 quick | PASS (S4, S8) |
| Sunday → next; Monday → previous (week crossing) | next week's Monday at 20; last week's Sunday at 20 (S5) |
| folded → far end by the foot bar's track | PASS — last column 374px clear of the tab (S6, S8) |
| pointer near the arrow → press → away | PASS (S7) |
| fold → resize 800 → back to 1536 | PASS (S9) |
| page to its foot and back, open and folded | PASS (S10) |
| a man held at the right side (left of the tab, on the tab) → left side → dropped back | PASS (S11) |
| arrow ×2 → View → Edit | settled PASS both ways; Edit→View glides from Monday (F1) (S12) |
| calendar: this week's Friday → arrows; another week's Wednesday | PASS; next week, Wednesday at 20 (S13) |
| change Monday → 4 on → Undo → arrows → back → 4 on → Redo → arrows | Undo/Redo land Monday at 20; the arrow after Undo lands Saturday (F2) (S14) |
| warning pressed: man in view; a part-hidden day's five warnings | week did not move, as ruled; none moved it (S15) |
| drag from AIRCREW → 4 on → changes window → line pressed → arrows | Monday at 20; the arrow after lands Saturday (F2) (S16) |
| Wednesday's date → board → Done → arrows | Wednesday at 20; arrows step one day (S17) |
| View-only: 3 on, 3 back | PASS (S18) |
| plain-user round: drag, remark, fold, warning list open/close, calendar ✕ / Escape / outside, Undo ×2, Redo ×2, View | PASS — nothing errored, the week never moved unasked (S19) |
| phone: Edit → View → Edit by the menu; swipe; drawer open/close | PASS / recorded as on main (P1, P2) |

## The cases carried by a test

| Case | Test | What it proves |
|---|---|---|
| the arrows step one day, each landing in one place, panel folded | `e2e/sched-right-edge.spec.ts` "each press of an arrow moves one day…" | passed before the change and after |
| the open panel keeps the tab's lane | same file, "the crew panel open…" | passed before and after |
| folded, the strip ends at the window's edge; bar with it; far end clear of the tab; fold and unfold | same file, "the days run to the window's edge…" | failed before (lane 26), passes after |
| the front day after a page switch, both ways | same file, "opened from the other schedule page…" | failed before (20 off), passes after |
| the front day after an Undo | same file, "an Undo that brings its day back…" | failed with its fix taken out (20 off), passes with it |
| the front day after "take me to this change" | same file, "take me to this change…" | failed with its fix taken out (20 off), passes with it |
| a phone unchanged | same file, "a phone: the day still rests…" | passed before and after |

## The pictures

All under `docs/img/handpass/2026-11-22-sched-right-edge/a/` (walker A). Full run: 65 pictures in `a/` — of which
`s19-x-undo2-could-not-press.png`, `s19-*` and the missing S16/S8 belong to a superseded attempt (the script's drag
picked no man; S8's menu at 822 not handled) and are NOT cited; S19 is cited from `only-s19/` (9), S16 and S8 from
`only-s16-s19-s8/` (17, its s19 pictures superseded by `only-s19/`), the 1920 follow-up from `only-under1920/` (2).
Opened and cited:
- S1 `s1-1-first-frame`, `s1-2-settled`, `s1-3-left-edge`; S2 `s2-1-folded`, `s2-2-folded-right-edge`, `s2-3-open`,
  `s2-4-open-right-edge`; S3 `s3-1`…`s3-4`; S4 `s4-1-sunday-first`, `s4-2-after-three-quick`; S5 `s5-1`, `s5-2`;
  S6 `s6-1-far-end`, `s6-2-far-end-right`; S7 `s7-1-arrow-slid-out`, `s7-2-after-press`, `s7-3-pointer-away`;
  S9 `s9-1-at-800`, `s9-2-back-at-1536`; S10 `s10-open-*`, `s10-folded-*`; S11 `s11-1`…`s11-3`;
  S12 `s12-1-view-first-frame` (F1), `s12-2`…`s12-5`; S13 `s13-1`…`s13-3`; S14 `s14-1-after-undo`,
  `s14-1b-one-press-after-undo` (F2), `s14-2-after-redo`; S15 `s15-1`; S17 `s17-1-board-right-edge`, `s17-2-after-done`;
  S18 `s18-1-view-right-edge`; P1 `p1-1a`…`p1-3c` (tap moments and settled); P2 `p2-1`…`p2-3b`.
- `only-s16-s19-s8/`: S16 `s16-1-changes-window`, `s16-2-after-take-me`; S8 `s8-w<width>-x<scale>-folded` × 6.
- `only-s19/`: `s19-1`…`s19-9`.
- `only-under1920/`: `u1-templates-under-tab` (F3), `u2-after-press`.

## The break tests

## Errors seen

None. Every page of every run was watched for page errors, console errors and HTTP 4xx/5xx: 0 in the full run, 0 in
`only-s16-s19-s8`, 0 in `only-s19`, 0 in the 1920 follow-up (WebKit phone included).

## What was NOT walked, and why

- The next-week preview pressed (a roll-call row): no scenario in walker A's brief pressed it.
- S15, a warning whose man is OFF the side: none was reachable — Monday's warnings name men on Monday (in view), and
  the five warnings of the day standing half off the right edge (Wednesday) did not move the week either; no list of
  warnings exists in the changes window or the crew panel to press one from elsewhere.
- S11, a drop on another legal seat: the man was dropped back on his own seat instead (Monday's seats unchanged).
- A short screen: not in the brief (the change is to the strip's sides).
- The page switch on a phone was made through the phone's menu (☰), not a top-bar tab — the phone has none.

## The gate counts

## What the walk found, and each disposition

Findings only; dispositions are the host's. Detail and pictures: `2026-11-22-sched-right-edge-walk-a.md`.

- **F1 (S12) — switching Edit Schedule → View-only Sched, the View week visibly glides from Monday to Wednesday.** The
  first frame (about 0.1s after the press) shows Monday at 20; the strip then passes through 32 positions in about 0.6s
  and settles with Wednesday at 20. The other way (View → Edit) opens straight on the day. Expected [D2295]: Wednesday
  first, 20 in, at the first frame. Picture `a/s12-1-view-first-frame.png`. Whether `main` does the same is not known to
  the walker (the change only moved the target 20px) — to check.
- **F2 (S14, S16) — after an Undo or "take me to this change" brings Monday back, one press of the next-day arrow lands on
  Saturday, not Tuesday** (Saturday, Sunday, then next week). The arrows count from where the four earlier presses were
  heading. Expected [D2293]: each press one day. A date picked in the calendar and the board's Done do not show it.
  Picture `a/s14-1b-one-press-after-undo.png`. Likely older (the arrows' memory, met in passing) — to check on `main`.
- **F3 (S8, 1920 wide at 125%) — folded, the CREW tab lies over the right of Thursday's "Templates" button** (20 x 15px of
  its 71 x 21; the word reads "Templat"). The rest of the button presses and opens Day templates. A question, not a
  fail: D2293 lets the tab lie over the days. Picture `a/only-under1920/u1-templates-under-tab.png`.
