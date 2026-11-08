# Chat 29 — Inputs and Medical small fixes: the evidence sheet (8 Nov 26)

Branch `claude/chat29-inputs-medical`, pull request 707. Pictures: `docs/img/handpass/2026-11-08-chat29-inputs-medical/`.
The change: [MED-ROOM-DRAGGED] (the Medical tab's room only while the input window stands where it opens),
[INP-ROOM-TIDY] (the room's size one value; the expand button's unused font lines), React Doctor's 8 in these areas
([RD-LEFT-1108] part 2 — 5 fixed, 3 kept with written reasons).

## The eight answers and the tier
1 money NO — no OIL, count or credit is read or written. 2 published record NO — nothing of publishing, signing or
amendments. 3 saved data NO — no stored field or reading changes; the cut-off's draft helpers moved byte for byte.
4 a shared drawer **YES** — the date calendar (`DateCal`) is drawn in many places, and its month-and-year wheel changed.
5 a new gesture NO — no new control; the drag and the wheel are as before. 6 a new surface NO. 7 roles NO. 8 the warning
list NO. **Tier: WALK.**

## The roll-call — the date calendar's month-and-year wheel (the one shared drawer changed)
| Where it is drawn | SHOWS (the lists open from the title) | USABLE (scroll far past 30 rows, arrows, Enter, tap) | Also PAINTED there |
|---|---|---|---|
| Edit Schedule's Jump to a date (`WeekCal`) | | | |
| The input window's own calendar (`RangeCal` in the input window) | | | |
| A date box — the Calendar window's "Every weekday" from date (`DateBox`) | | | |
| A date box — Admin / Users (`DateBox`) | | | |
| A date box — the Leave War's bid, credit and select sheets (`DateBox`) | | | |
| The Inputs and SANS calendars' month title (`DateBox` month mode) | | | |
| The holiday form (`RangeCal`) | | | |
| The Leave War's range (`RangePicker`) | | | |
| The OIL question's "Only some days…" (`OilConfirm`) | | | |
| Admin's run (`AdminPage`) | | | |

## The rows by kind of change (§6)
- A floating surface — the input window over the Medical tab and over the Inputs list: placed, dragged, reopened.
- A component's second home — `CutFields` in the Inputs and the SANS settings windows; `TypeLegend` ("?") in the input window.

## The five sizing lines (§7.0)
1. **Type:** E (layout — the room) and D (the date calendar drawn in many places, each its own caller).
2. **Only a walk finds:** the room at each width with the window at rest, dragged and reopened (Medical, the Inputs
   list); the wheel in each home, scrolled far enough to re-centre; the "?" card giving way to a question; both cut-off
   windows typing, refusing and saving. The tests cover: the dragged room (Medical, red first; Inputs, pull request 676),
   the wheel's re-centre in `e2e/datecal.spec.ts` and `datecal` unit tests, the legend and cut-off fields' unit tests.
3. **The ledger:** E walks find little (four of ten); D walks found a fault every time; chat 7's walk of the same room
   (pull request 676) passed every step, the reads finding the dragged-window gap this job fixes.
4. **The walk chosen:** one Sonnet walker, through the checks lock, on the production build: Medical at 1536×864,
   1229×600 (his PC at 125%) and a phone 390×844 (no room there); the Inputs list at 1536, 1340 and 1339; the expand
   button at rest and pressed; the wheel in every home above; "?" with a question raised; both cut-off windows; the
   plain-user round (D1557) on Inputs and Medical, desktop and phone.
5. **After the walk:** its row in `docs/walk-ledger.md`.

## The lessons of §7.11 that apply
3 (after every press, what tells him) · 4 and 12 (the page behind the window works; every page the window opens from) ·
5 (the cards at rest beside the window) · 17 (the room shown and hidden, measured after each) · 19 (the window closed by
✕, Escape and Cancel) · 2 and 20 (the wheel scrolled quickly and slowly) · the second 23 (side-by-side boxes one height).
The rest do not apply: no print, no pinch, no hidden page, no keyboard rise, no approved drawing changed.

## Orders walked
## Cases carried by a test
## Break tests
## Pictures
## Errors seen
## Not walked, and why
## The reads
## Gate counts
## What the walk found, and each disposition
