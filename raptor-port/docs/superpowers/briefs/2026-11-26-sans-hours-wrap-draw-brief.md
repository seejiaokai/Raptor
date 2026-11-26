# Brief — draw D2750 (a SANS man's offered hours never cut in the crew list's letter column) — chat 186, 26 Nov 26

You draw a proposed change on the real app before anything is built (his D1625). Work ONLY in
`C:/Users/User/projects/Raptor-sans` (branch `claude/sans-warnlines-185`; commit nothing, push nothing). Read first:
`.claude/skills/brainstorming/mockups-on-the-real-app.md` and `raptor-port/docs/walk-scripts.md` §1–§3 (search, never
read whole). His ruling, full row: `grep -h '^| D2750 |' .claude/decisions-full/scheduler.md` (and D2581, D2582).

## What exists

`raptor-port/docs/mock/2026-11-25-sans-d2588/draw.mjs` — its scene `col` (from about line 493) stages Sun 19, an AMT
seat 13:00–14:00, five SANS filings (Jester offered AMT 08:00–10:00), picks the seat on Edit Schedule's crew panel, and
pictures the crew list's SANS section today (`col-today-*`), then with the letters moved into one column
(`col-new-*`) — where Jester's badge reads "A · 08:00–1…", cut. Serve the frozen build exactly as its header says:
`cd "C:/Users/User/projects/Raptor-sans/raptor-port" && npx vite preview --port 4880 --strictPort --outDir D:/raptor-work/c185-build`
(port 4880 free first; prove the page names `index-SXKkjfaJ.js`); run one size a process, e.g.
`SZ=d ONLY=cap,col DRAW_OUT=D:/raptor-work/c186-wrap/run-d node docs/mock/2026-11-25-sans-d2588/draw.mjs`, then `SZ=p`.

## What to add (to the `col` scene; nothing else changes)

1. `col-nopick-*`: the same day and filings, NO place picked — the SANS section as it reads today (the letters with
   no reasons; assert on screen that no reason line shows and Jester's "A · 08:00–10:00" is whole). Real app, nothing
   changed.
2. `col-wrap-*`: the place picked, letters in one column as `col-new`, and Jester's hours moved onto a second line
   directly under his "A", left-aligned with it, in the badge's own font, size and colour, never cut; his row grows only
   as much as the second line needs; every other row untouched. Mark it with the kit's pink outline and "New" tag.
   Assert: the hours' full text shows, nothing in the section is cut (`scrollWidth <= clientWidth` on every badge),
   other rows' heights unchanged.
Both at desktop 1536 and phone 402, deviceScaleFactor 2, cropped to the SANS section as `col-*` are.

## The page

The page source is the template `D:/raptor-work/c186-draw/index.tpl.html`; build it with
`D:/raptor-work/c186-draw/fill.mjs` after changing its `DIR` to
`C:/Users/User/projects/Raptor-sans/raptor-port/docs/mock/2026-11-25-sans-d2588`. In the column section ("The crew list's
F / O / A letters in one column"), replace the "Jester's hours get cut short" bullet with a short question in the
page's own shape: when it happens (Saber picks the AMT seat; Jester offered AMT 08:00–10:00), picture `col-nopick`
(no place picked: no reasons, his hours whole) and picture `col-wrap` (place picked: his hours on a second line under
the letter), "Recommended: hours on a second line under the letter", and "Your answer: second line (recommended) /
something else". Add one line to the top "New since you last looked" note naming this question. Plain words, no
ruling numbers or code words on the page; two or three sentences at most of your own text — they go to a fresh Fable
reader after you.

## Hand back

Write to `D:/raptor-work/c186-wrap/report.md`: the commands run, each assertion's result, the four picture files'
paths and sizes, the exact words you added to the page, and anything the drawing found. Stop the server on 4880 when
done. Return a three-line summary.
