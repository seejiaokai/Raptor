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
| Edit Schedule, panel folded — right edge, desktop | | | |
| Edit Schedule, panel open — right edge, desktop | | | |
| Edit Schedule — the fold and unfold themselves (the foot bar follows) | | | |
| View-only Sched — right edge, desktop (must not change: it never had the lane) | | | |
| A phone — both pages (must not change: no lane, a day rests flush) | | | |
| The Scheduler Board (must not change: its own layout, no week strip lane) | | | |
| Front day after a day arrow, both pages | | | |
| Front day after a page switch, both directions | | | |
| Front day after a date picked in the calendar | | | |
| Front day after an Undo whose day is off the side | | | |
| Front day after a warning pressed / "take me to this change" | | | |
| Front day after a week crossing by arrow (Monday / Sunday landing — must not change) | | | |
| The next-week preview pressed (lands where it was pressed — must not change) | | | |

## The five sizing lines (§7.0)

## The orders walked

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

## The break tests

## Errors seen

## What was NOT walked, and why

## The gate counts

## What the walk found, and each disposition
