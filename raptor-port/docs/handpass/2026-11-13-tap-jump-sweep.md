# The below-zero line's fix and the tap-jump look-over — evidence (chat 69, 13 Nov 26; D2030)

Pictures: `docs/img/handpass/2026-11-13-lw-below-zero-jump/` (his two, and `after/`) and
`docs/img/handpass/2026-11-13-tap-jump-sweep/` (the look-over's, the tap marked before and after).

## The eight answers and the tier
Money NO (nothing saved or counted changes) · published record NO · saved data NO · shared drawer NO (two windows'
own rows; the shared window part untouched) · new gesture or mode NO · new surface NO · roles NO · warning list NO.
A line moved inside two Leave War windows: **WALK** (the item's own tier).

## Roll-call — where the app draws the below-zero line
| Place | Shows the line | Buttons stay put | Proved by |
|---|---|---|---|
| The several-people window (a drag), PC | YES, above the leave buttons | YES — 0px (was 22.7px up) | `e2e/leavewar.spec.ts` "the drag window: the leave tapped stays put…" (lw-desktop); picture `after/pc-several-2-line-shown.png` |
| The one-day window, PC | YES | YES — 0px (was 22.7px) | "the one-day window: the leave tapped stays put…" (lw-desktop); `after/pc-oneday-2-line-shown.png` |
| The one-day window, phone size | YES | YES — 0px (was 22.7px) | the same test (lw-phone); `after/phone-oneday-2-line-shown.png` |
| The several-people window on a phone | NOT WALKED — a touch drag cannot be driven by the test tools (the file's own note); the same code as the PC's | — | — |
| A day where the war refuses leave (no leave buttons) | the line stands on a row of its own, unchanged | no buttons there | not walked; code unchanged |

## Sizing
One route (press a leave that goes below zero, press the same spot again), two windows, two sizes; carried by the two
tests above, each red before the fix. The host opened the three "line shown" pictures.

## What was NOT walked, and why
His iPhone itself (Chrome at phone size only) · the app at 125% on his PC (the fix is a matter of order in the
window, not of size) · the windows' other lines that appear after a press (Delete's question, a decision's result) —
these belong to the look-over's list, unchanged until he has seen it; the hand measurement of them failed twice while
the PC was busy with the sweep and is owed.

## Gates
GitHub's run on pull request 764 — read at the close (see the handoff block). On his PC: the two new tests and the
older "a drag that would go below zero asks once" test, green.

## The look-over ([TAP-JUMP-SWEEP]) — how it was done
A script pressed every control it could find, up to two presses deep, on every main page — as the scheduler and as a
member, at a PC's size (1536 wide) and at phone size — 4,694 presses, and after each press measured whether the
control pressed was still under the same point of the screen. Its budget (12 minutes a page) ran out before every
window-inside-a-window was reached: each page's count of states left unvisited is in the run's summaries (not kept).
The script: `scripts/tapjump/` (run notes at its head). **A machine's list, not yet a checked one:** the host looked at
two of the findings' pictures (the Inputs calendar, a person on the schedule); every finding is to be reproduced by
hand before it is fixed.

## What the look-over found — the classes, as measured
1. **Inputs → Calendar, PC:** pressing a day opens the day's panel at the right, and the whole calendar shrinks and
   drops (the day pressed went 257px left and 34–44px down); the pointer is then over another date. Picture `inputs-day.jpg`. Seen by the host.
2. **Leave War one-day window, phone: "Pick a range"** rose 327px when the calendar opened under it (the same cause as
   the below-zero line: the window grows upward). `range.jpg`.
3. **Schedule (View-only and Edit), the week buttons:** pressing "Jul 06" slid the row 80px, the pointer then over
   "Jun 29". `week.jpg`.
4. **Schedule, pressing a person:** the person pressed moved sideways by 2 to 276px across many people, PC and phone
   (the cause not traced — the highlight, or the day strip turning). `puck-view.jpg`, `puck-edit.jpg`, `puck-phone.jpg`.
5. **Schedule, the highlight tabs CAT / Type / Quals:** each moved 4px right and 3–5px down when opened. `cat.jpg`.
6. **Leave War, phone: pressing a day** scrolled the page up by 10 to 398px as its window opened (likely the page
   bringing the day above the window, on purpose — to confirm). `lwcell.jpg`.
7. **Leave War, PC:** a locked day (member) and an event's band moved about 25px sideways when pressed. `locked.jpg`, `band.jpg`.
8. **Approvals, phone: "Approve all 11"** became "Approve 11 — tap again" and grew 66px to the left (the pointer stays
   on it; its neighbours move). `approve-all.jpg`.
9. **Tracker: pressing an event box** moved the diagram up 311px (39px for the first row). `tracker.jpg`.
10. **Edit Schedule, phone: the AIRCREW tab** of the day's side list moved 257px left and 74px up. `aircrew.jpg`.
11. **Top bar:** the "Saber · Admin" chip moved 15px when pressed (its words change length); "Sync" 10px. `role.jpg`.
12. **Quals, phone:** "Edit quals" widened 13px to "✕ Edit quals" (stays under the pointer).
Known but not measured: the Leave War windows' Delete question and a decision's result line (they appear under or at the
foot of a window that grows upward — the same cause as the fix); Admin's "Tap again to clear", the Users panel's "Tap
again to delete", the Scheduler Board's "Tap again to reset", the Events list's "Press again to delete".

## The hand check (chat 70, 13 Nov 26)
Each finding pressed again, one at a time, in a browser started at 125% (1536 × 740, his PC) and at his iPhone 17
Pro's size (402 × 874, Chrome's engine, touch taps): `scripts/tapjump/repro.spec.ts` with `repro.config.ts` (against
a build served by hand; the port passed as `REPRO_PORT`, since the lock refuses an `E2E_PORT` already answering),
results `scripts/tapjump/repro-results-2026-11-13.jsonl`; the pictures and the page put to him
(https://claude.ai/artifact/XETGVUMWStGcy1Fa8dcV6i) in `docs/img/handpass/2026-11-13-tap-jump-sweep/hand/`. The host
opened every deciding picture.

| # | Place | Measured by hand | Recommended to him |
|---|---|---|---|
| 1 | Inputs → Calendar, pressing a day (PC) | the day panel narrows the calendar and wraps the filters: the day went 257px left, 44px down, the pointer then on another date. Phone: none | FIX — the calendar keeps its size; the panel opens over the side away from the day |
| 2 | Leave War day window, "Pick a range" | up 377px, PC and phone (the window grows upward) | FIX — the calendar opens above the button row (the D2030 cure) |
| 3 | Schedule, CAT / TYPE / QUALS | TYPE pressed with CAT open: 217px left, the finger on the "SUP" chip; each tab 4px when opened | FIX — the tabs stay; the open tab's choices after QUALS |
| 4 | Leave War several-people window, Delete | up 35px when its "sure?" line appears under the buttons; the finger on the line (PC; the phone drag not drivable) | FIX — the line above the buttons (the D2030 cure) |
| 5 | Schedule week buttons | the pressed week moves to the second place | LEAVE — the ruled rolling window of four (scheduler page, week navigation) |
| 6 | Tracker, pressing an event | the chart slides up 297px (PC) / 389px (phone) to fit the window | LEAVE — D1790; taps held while it slides |
| 7 | Leave War on a phone, a day low on screen | the page scrolls 77px to keep the day above its window | LEAVE — on purpose; the finger rests on plain text |
| 8 | Edit Schedule phone, AIRCREW tab | the tab rides the drawer's edge | LEAVE — a drawer's handle |
| 9 | Approve all, the role chip, Sync, Edit quals, Users' Delete | grow or shrink with their words; each still under the finger | LEAVE |
| — | a person on the schedule (6 presses), a locked day and an event band, the day window's Delete / Approve / Refuse, the Events list ✕, a SANS card on Edit Schedule, a day's name | did not move by hand (the script's moves came from its own scroll into view) | nothing |

Not checked: his iPhone itself; the several-people window on a phone; the Scheduler Board's "Tap again to reset" (not
reached); Admin's "Tap again to clear" read only (full width, cannot slide).
