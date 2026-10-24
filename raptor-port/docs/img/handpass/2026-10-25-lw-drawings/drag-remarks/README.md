# The drag window lists each entry's remark (D1347, D1339) — pictures, 25 Oct 26

Drawn on the built app (this branch, served on port 4180) by `raptor-port/scripts/handpass/lw-1025-drag-remarks.mjs`, as
admin (Saber), on Drifter. Every picture comes at two sizes: `-phone` (402 × 874 at 3×, his iPhone) and `-desk`
(1440 × 900 at 1×). "Today" = the real app, only the dashed cyan mark and the label added. "Drawn" = the app's own nodes
changed on the page. The run's log: `run-phone.json`, `run-desk.json`.

The fixtures, placed through the app's own controls and checked in what the app saved: three separate pending LL bids —
Tue 8 Dec "Wedding" (the one-day window); Wed 9 – Thu 10 Dec "Family trip", ONE entry over two days (a drag over 9–10 Dec,
"Family trip" typed in the drag window, LL pressed there — both days saved with those words); Fri 11 Dec with no remark.

| Picture | Real / drawn | What it shows | Values chosen |
|---|---|---|---|
| `a1-today-two` | real | A drag over 8–10 Dec (two entries, different remarks): the Remarks box is empty | — |
| `a2-drawn-two` | drawn | Above the box, two read-only grey lines, "8 Dec · Wedding" and "9–10 Dec · Family trip"; the box empty with its "Remarks" placeholder | The lines are the sheets' own line of small grey text, class `.note` (11.5px, `--ink-3`, measured `rgb(138,150,163)`), one per line inside a row of the window's own kind (`.bidsheet-row`, its 6px gap kept); the dates written as the window's own title writes them (`compactSpan`: "8 Dec", "9–10 Dec") |
| `b1-today-one` | real | A drag over the one entry 9–10 Dec "Family trip": the box is empty (D1339's "the box shows it" is not built yet) | — |
| `b2-drawn-one` | drawn | The same drag, the box showing "Family trip"; no grey lines | — |
| `c1-drawn-noremark` | drawn | A drag over 8–11 Dec: only the two remarks listed; 11 Dec, which has none, is not listed | Recommended: an entry with no remark is not listed |

Seen in the real app, not asked: on a phone the drag window's title breaks "8–10 Dec · 3 days" over two lines ("3 / days"),
in every picture here.
