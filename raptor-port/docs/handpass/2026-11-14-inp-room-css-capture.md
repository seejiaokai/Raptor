# [INP-ROOM-TIDY-2] — the room rules written once: the before / after capture (14 Nov 26)

Branch `claude/code-tidy-1114` (chat 72's overnight job 2). The change: the input window's room on the Inputs list
(four rules) and on the Medical tab (one rule) — each written with its own copy of the test "the window stands where it
opens", `body:has(.floatwin.inpedwin:not([data-placed]))` — now sit once, nested under that one test, in
`src/ui/scheduler/25-inputs-calendar.css`. The build writes them out flat, the same selectors as before, after the
rules they used to follow in the cascade.

**How it was checked.** `scripts/handpass/inp-room-css-capture.mjs`, run on the build before the change (served from a
copy, port 4297) and the build after (port 4298), each in a fresh browser world per size, the clock fixed:

- sizes: 1536 × 864 (at 125%), 1229 × 600 (his PC's page), 402 × 874 (his iPhone, touch);
- states: the Inputs list (every date) and the Medical tab — with no window; with the input's window where it opens
  ("+ Input", "+ Medical"); on a desktop also dragged away, then closed and reopened where he left it (a row's open
  button; a card's "Edit input"). 20 states;
- recorded: every element of the page's workspace and of the window, every computed property and its ::before /
  ::after — 11,760 elements in all.

**Result.** Before vs after: 20 states, 11,760 elements, **no difference**. Before vs a second before run: no
difference (the record is steady). The records themselves sat beside the run, outside the repo
(`C:/Users/User/raptor-night-1114/code-tidy/`); the room was seen made and given back in them (the Inputs list's
padding 446px at rest at 1536 and 20px once dragged; the Medical tab's 446px at rest at 1536 and 1229, 16px once dragged;
none on the phone).
