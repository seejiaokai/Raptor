# The year build — evidence (2 Nov 26)

**The job:** [LW-YEAR-CLEAR] (his D1561), [CAL-MONTH-YEAR-JUMP] (his D1562) and [LW-MONTHSTRIP-TWO-YEARS], built from the
approved drawings (`docs/img/mock/2026-11-02-year/`, the note `docs/superpowers/specs/2026-11-02-year-designs.md`) on
`claude/year-clear-1102`, pull request 611.

## The tier — WALK

The eight questions (`docs/bug-check-order.md` §5): money NO (nothing counted changes; display only); the published record
NO; saved data NO (the month on view is view state); a shared drawer **YES** (the app's one date calendar and its floating
card, used by every date box; the grid's header drawn in three copies); a new gesture **YES** (the title's tap, the wheels);
a new surface NO (the card exists); roles NO (admin and member alike); the warning list NO. → **WALK.**

## Sizing the walk (§7.0)

1. **Type of change:** C (a new control: the title's tap and its wheels), D (the year drawn in every copy of the corner),
   E (the corner's words, the strip's layout).
2. **What only a walk could find here:** the year read from where the dates ARE — zoom, a pinned header, a period changed,
   a page hidden and shown (lessons 10, 11); the title's fit in the fixed phone room with the ▾ in real letters; a tapped
   title left cyan on an iPhone (§7.10); the strip's fit at real widths.
3. **What the ledger says:** C and E walks find layout and state faults at the edges of a screen, not in the middle.
4. **The walk chosen:** the host alone, two scripts (`scripts/handpass/year-build-check.mjs`, measures; `year-walk.mjs`,
   the walk), WebKit at his iPhone's 402 and Chromium at 1536 and 2560, an admin and a member; the 7.11 lessons that
   apply — 10 (the View picker and Approvals and back, past the idle time), 11 (zoomed out by Ctrl + scroll, 2560, the
   period's two ends) — and the plain-user round (7.0a). Lessons 1–9, 12, 13 do not apply: no window that leaves the page
   working (the card's veil takes the page), no drag, no list of figures, no pinch path changed, no keyboard motion model.
5. **Its row:** added to `docs/walk-ledger.md`.

## The roll-call — every place the change draws

| Place | Has it / must not, because… |
|---|---|
| The grid's header corner (`th.who`) | has it — the year |
| The pinned bar's sliding row (`.mxfixed-scroll`) | has it |
| The pinned bar's frozen corner (`.mxfixed-frozen`) — the one seen while scrolled down | has it — **MISSING in the first build, found by the code read, fixed red first** |
| The month strip, one year | unchanged (labels without a year) |
| The month strip, two years | the year under its month up to 820; one line at every width |
| The Inputs calendar's title | has the ▾ and the jump |
| The SANS calendar's title | has the ▾ and the jump |
| The List's invisible copy of the title | has it — its room includes the ▾, so the switch keeps its place (measured 974 / 974 at 1536) |
| The Medical tab's own month head (`.med-cal-head`) | must not — not named by D1562 |
| Every date box's floating calendar | must not change — measured: Escape with the lists open still shuts only the lists, focus still on the picked date (`datebox.test.tsx` 48/48) |

## What was walked, and what it showed

**The measures** (`year-build-check.mjs`, 36 checks, all pass after the fixes below): the corner reads 2027 on 17 Jul 27
at the top and scrolled down; its row as tall as a date's heading (44 phone, 45 desktop) — no height added; the year inside
the corner (70 ≤ 72 phone, 136 ≤ 139 desktop); a two-year period (made by "+ New period", JUL 28 – JUN 29): twelve buttons
in view (last right 391 of 402 on the phone), no words cut; 31 Dec half under the names reads 2028, 1 Jan at the edge 2029,
back to 30 Dec 2028; the Inputs title wears the ▾, every month of a year fits its room with it, › and Today stand still
across twelve months; the card opens on its wheels, a year turned turns the page, Escape closes it; the SANS title fits.

**The walk** (`year-walk.mjs`, 47 checks, all pass): at 402, 1536 and 2560 the corner agrees with the first date in view
after opening, JAN and DEC pressed (the year's end), the View picker to 2026 with no scroll, Approvals and back after the
period changed while away, zoomed out (desktop, Ctrl + scroll) with DEC pressed, and in Rearrange (the widened corner);
**the plain-user round, his own case:** LL filed on Thu 22 Jul 2027 on the war → the Inputs calendar, its title tapped, the
wheels turned to July 2027 (a finger's flick on the phone, the keys on a desktop), a tap outside → the leave on 22 Jul
2027 ("Reaper · LL"); the closed title not left cyan by the tap on the phone (§7.10); the Calendar | List switch still; a
member's corner and title alike.

**The drawings beside the build** (D1495): the phone corner matches lw-2 (A); the desktop matches lw-4 (A); the card on the
phone matches cal-1 (A); the desktop card sits under the title as cal-2 (A) draws it. One difference found and put back
while building: on a desktop the ▾ stood at the far end of the title's room, away from the words; now the two are centred
together as drawn. **Not run: the formal drawing-check tool** (`scripts/drawcheck/`) — the year drawings have no part list
or recorded drawing yet; the comparison was by the measures above and by eye, side by side. Filed for him to rule.

Pictures: `docs/img/handpass/2026-11-02-year-build/` (the measures) and `…/walk/` (the walk).

## Faults found, and what was done

| # | Found by | Fault | Done |
|---|---|---|---|
| 1 | the measures | on a phone, 1 Jan exactly at the edge read 2028 (a rounding sliver of December) | more than 2px of a month must show; re-measured |
| 2 | a picture (desktop) | a two-year period's MAY 29, JUN 29 wrapped onto a second line on a desktop (640 room) | the strip takes the room its twelve need, up to the screen's width (a fixed 760 still wrapped in GitHub's Linux letters) |
| 3 | the drawing beside the build | the ▾ away from the words on a desktop | put back to the drawing |
| 4 | §7.10, before the walk | an iPhone keeps a tapped title "hovered": it would stay cyan, reading as open | the hover tint only where there is a mouse; walked |
| 5 | the fresh code read (finding 1, high) | scrolled down, the pinned bar's frozen corner kept the old year across 1 Jan | red first in `e2e/year-leavewar.spec.ts`, fixed: every copy painted |
| 6 | the fresh code read (finding 2) | the old title-fit tests measured the button, not the words inside it | retargeted to `.mjt-w` |
| 7 | the fresh code read (finding 3, low) | two lists settling together could undo each other (every date box) | read from the month as it stands |
| 8 | the fresh code read (finding 4, low) | a changed period could show the last one's year until a measure | the year kept with its period |
| 9 | GitHub's run | two older tests' premises: one pressed the month's title as a plain spot (it is a control now); one found "the heading with a 20" (the corner holds 2026) | each retargeted to what it meant |

A narrow fresh Opus read of the fix commit (D790, §5 "a fix is new code"): **no findings** — the pinned bar's every copy reached, a freshly mounted bar showing the painted year, no order in which a list reads a stale month, the strip's new width moving nothing for a single-year period, the retargeted tests still testing their claims. The code check (`npm run lint:changed`): no new finding.

**Walk:** host, scripted, 402 WebKit + 1536 + 2560 Chromium, admin and member, 36 measures + 47 walk checks + the plain-user
round, all PASS after the fixes; the re-walk of the fixes all PASS; the pinned 1 Jan crossing carried by
`e2e/year-leavewar.spec.ts` (phone and desktop), red before the fix.
