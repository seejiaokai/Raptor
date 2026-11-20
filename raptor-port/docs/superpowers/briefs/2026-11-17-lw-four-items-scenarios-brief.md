# Scenario design for the four Leave War items — Astra's brief (17 Nov 26, chat 101)

You are Astra, the standing reviewer, asked for ONE job: design the walk's scenarios (the bug-check order's §4, rank 1).
You are not reviewing whether the code is right; you are hunting for what is MISSING — the surfaces, orders and states a
walk must drive so that a defect cannot hide. Read-only: change no file, run nothing that writes. Return the whole report
as your final message.

**Where you are:** the repository root, branch `claude/lw-four-items`, commit at HEAD. The app is in `raptor-port/`. The
diff: `git diff origin/main...HEAD -- raptor-port/src`.

## The finder wording (use it)

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
> most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

A scheduler is always an admin: never design a scenario for a scheduler who is not one (D785); a member (`us`/`us`) is in
scope as a person who is not a scheduler. Sign-in: `ad`/`a` (admin). A Leave War period can be locked (read-only).

## What changed (the user promise) — each from the ruling's full row

The rulings' full rows: `grep -h '^| D215[1-8] |' .claude/decisions-full/*.md`. The area's rulings page:
`.claude/rules/decisions/leave-war.md` (read its Balances, The grid and OIL on the war sections) and the screen-design
rulings `.claude/rules/decisions/design.md`.

1. **Balances' layout and pending tag (D2156, answering D2153, D2154).** "The Balances page is built as option B: every
   column set from the left, its heading starting where its box or figure starts, a long heading on two lines, the LVE and
   OTHER LEAVE labels at their group's start with rules over exactly their columns; LVE's pending column headed 'PENDING
   APPROVAL', its figure in a dashed amber tag with no minus; another kind's pending figure a small dashed amber tag on its
   box's top corner." The person window's tiles are NOT part of it (the host's reading, not asked). Drawing:
   `raptor-port/docs/mock/2026-11-17-lw-balances-align/` option b. Standing rulings kept: D1482, D1483 (a phone pinches
   out until every column fits), D1252, D1253, D1493/D1497 (a read-only figure ends where a box's would).
2. **The grid's hover ring (D2157, answering D2151, D2152).** "On a desktop the Leave War grid's one day under the mouse:
   a thin cyan ring, inset 1px rgba(59,198,232,.6), hollow, no fill, the tapped day's strength; today's faint tint along
   the row under the mouse stays; a phone is unchanged." The host's readings: the stronger marks (a picked or dragged
   selection, the move's landing day) win over it; it is drawn on a man's day cells only. Drawing:
   `raptor-port/docs/mock/2026-11-17-lw-grid-hover/`.
3. **The OIL award editor's fixed layout (D2155, answering D2150).** "One fixed layout — amount, AM, PM, date; then reason
   and given-by side by side; then Save, Cancel, Delete — the AM / PM place left empty, not greyed, when the amount is not
   a half day, and Delete always as wide as 'Really delete?', so nothing moves." It writes OIL awards (amount, half,
   reason, given-by) — money in the app's terms. Drawing: `raptor-port/docs/mock/2026-11-17-lw-oil-editor/` o2.
4. **The new period's name from its dates (D2158).** "In the 'New leave war' window the Name box fills itself from the
   dates picked, in the form the periods already use — 'JAN - MAR 27'; one month 'JAN 27'; across a year's end
   'DEC 26 - FEB 27' — and changes with the dates whenever they change. The agent's readings, told to him: a name he types
   himself is kept when the dates change afterwards, and a box he empties follows the dates again; the dates' months name
   it, whatever the day of the month." The name is saved data (what the period is saved and listed under).

## What the host already has (do not repeat; tell us what it LACKS)

The evidence sheet `raptor-port/docs/handpass/2026-11-17-lw-four-items.md` holds the host's roll-call (every place each
change draws) and the cases already carried by tests. Read it after you have made your own list from the rulings and
the code, and say which places, doors, orders and states it is missing.

## What to return

1. Your own enumeration: for each of the four, every renderer, door (every way to open the window or page — from the
   tab, from another page, from a window), role (admin / member), state (locked / unlocked, phone / desktop, his own
   row, empty / filled day), and downstream reader of what is written (where the new period's name and an edited award
   are read afterwards).
2. The roll-call's gaps — each a place, door or state the sheet lacks.
3. Ranked failure scenarios, at most about 25, most likely to find a real fault first: setup, action, EXPECTED (with its
   source — a ruling number, or "RECORD exactly what it shows" where no ruling settles it), and the observation that
   would disprove correctness. Mark which need a phone (402px wide, touch) and which a desktop mouse.
4. Explicit negatives: "I checked X and found nothing to add".
