# The fix round's narrow read, round 2 — the fresh Opus reader (chat 105, 17 Nov 26)

*(Condensed by the host from the reader's report; brief `2026-11-17-lw-four-items-fixread2-brief.md`, on `59ebfdfcf` and
`c78106577`, finding 1 also checked on `901ee405f`. Blind to the walk and to the earlier readers.)*

1. **Medium — already fixed by `901ee405f`:** on a PC the Manning pair rows lost their olive or green on the name and
   balance cells under the mouse — the new rule outweighs the pairs' own (0,4,3 against 0,4,2). `901ee405f`'s layered
   rules and test judged correct. (The host's own probe had found it first: find 22.)
2. **Low:** a click made by the keys (Enter or Space on a tracker button outside the editor) closed nothing if the last
   mouse press had been inside — the remembered press was never cleared. Fix: forget it on each click; judge a click with
   `detail` 0 by its target alone. → find 23, fixed red-first in `0eee82d0d`.
3. **Low (test):** "a tap on another award" brought the award only to the nearest edge, where it can sit under the pinned
   columns. → taken: to the middle, checked drawn on top.
4. **Low (his call):** a press begun outside and let go inside closed the editor — the mirror of the drag fixed in
   `59ebfdfcf`. → find 24: the host's call, spared (a press let go inside is the editor's own), red-first.
5. **Low (tests):** the tint test's own-row check and the pair loop could skip silently; the calendar test never checked
   the date unchanged. → taken; the own-row checks of BOTH the tint and the hover-ring tests had in fact run nothing
   (find 25).

**Checked right:** every way a press starts and ends for the click-away (mouse, pen, touch, a cancelled press, right
and middle click, a second finger); the calendar's veil and patch as the editor's own; Save, Cancel, Delete, ✕, a held
press while the tracker closes; no listener left behind or doubled; the credit bar's click-away beside it; a member. The
tint: the cells stay solid; his own row excluded; headings and the month strip untouched; event rows tint as their days
do; scrolled sideways or down; a touch laptop's tap leaves the tint as the days' already does.
