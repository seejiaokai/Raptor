

## Seen in passing

- **The take-off note sits over the question's buttons on the phone turned on its side (844 x 390).** Straight after "Accept" the
  earlier note "Ground item removed — back under Personal Inputs — RANGE BRIEF, 09:00–12:00, Ranger" is still on screen and is drawn
  over the foot of the OIL sheet, hiding "Don't put back" and "Put back" in the picture (`14-side-question.png`,
  `14b-side-toast-over-sheet.png`). Its pointer-events are none and the buttons are the topmost element at their centres (checked
  with `elementFromPoint` every 500 ms for 4.5 s), so a press goes through; it is a look-only overlap. Only seen at 844 x 390; the
  sheet was fully clear of it at desktop and at 390 x 844 (the note is at the foot of the screen there, below the sheet).
- **Scenario 13 — the Inputs page for Ranger did not list "Range brief" in its default view** (page text contained no "Range
  brief" on `inputs`, `viewsched` or `editsched`). I did not look further (the calendar opened on a different month than July
  as far as I could tell); not part of the brief. His stored input was there (`INPUTS` still held it, filed by Saber).
- On the Friday route every landed input shows a "LATE" tag (its week's cut-off was 29 Jun and the machine's date is 13 Oct). Not
  a fault; noted because it appears in every Personal Inputs card picture.
- The Scheduler Board's crew drawer on a phone: the brief's armed-tap order (name first, then the row's "+ add") did NOT work in my
  hands: tapping the AIRCREW tab again to close the drawer dropped the arming, and the tap on the row then selected the row. What
  worked: tap the row first (it highlights and the crew drawer shows who may go on it, with reasons), then tap the name in the
  drawer. Reported as a route note only — the dot scenarios were walked by that order.

## Console and page errors

None. The scripts listened for page errors, console errors and HTTP 4xx/5xx on every scenario run; none were raised in any final
run (`results.jsonl` holds no error entry).

## Notes on the walk itself (script-side, all superseded in the table)

- First attempt at scenario 14 used `setViewportSize` to 844 x 390 on a phone-emulated page; the page then reported 1035 x 479
  inner size, so that run was thrown away and scenario 14 was re-walked with a context opened at 844 x 390 (the table's row).
- The first reader of the gold dot looked for `data-histdot` on the puck element itself and called scenarios 15, 17 and 20 FAIL.
  The markup shows the attribute sits on the puck's own seat wrapper (`<span class="seat" data-slot="g:2.2.x0" data-histdot="">`
  around Tally's puck). The brief says "his puck ... carries it"; the observed placement is the wrapper. The table reports the
  re-read (puck itself false, own seat wrapper true; Ranger's seat wrapper false). The host should confirm that the wrapper is the
  intended carrier.
- Scenario 18 on the phone: a tap on Tally's puck did not take him off; I then tried one mouse drag off the row inside the
  phone-sized page (a touch drag cannot be made by this driver), which did. The table row says so.
- Scenario 20's plain row was made with the board's own "+ Item" button; its title and times (and nothing else) were set through
  the developer bridge, because typing into its boxes was not needed for the test. The man was put on by the same drop as in 15.

## What I could not walk

Nothing was left unwalked. Limits to know: touch drags were not made as touch (no such driver) — the phone drop was an armed tap,
and the one phone take-off of Tally in 18 was a mouse drag in a phone-sized page; scenario 13 looked only at View-only Sched, Edit
Schedule and the Inputs page as Ranger (he has no way to open a day's Scheduler Board — no day heading carries the opener — so
"Accept"/"Undo" cannot be reached by a member in the pages he has).
