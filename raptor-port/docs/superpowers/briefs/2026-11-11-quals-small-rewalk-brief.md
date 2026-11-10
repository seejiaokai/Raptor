# Job 3 — the RE-WALK after the fix round: the walker's brief (chat 64, 11 Nov 26)

You walked this page earlier tonight (your first brief: the scratch folder's `job3/walker-brief.md` — every rule in it
still holds: walk, do not read code for bugs, do not fix, record exactly; write nothing in the checkout but pictures;
never build, never run a test file, never switch branch, commit, push or stash; serve `raptor-port/dist` yourself on a
free port — 4391 if free — and stop it BY ITS PORT when you finish; a fresh browser context per scenario; watch console
errors, page errors and failed requests). Your scripts are in the scratch folder's `job3/walk/` — reuse them.

**What is new.** `raptor-port/dist` is now built from `c242ba658` (the fix round). Do not build. Three things changed
on the Quals page:
1. **The filter case.** If the filter box hides a man's row when the page is sent to him ("Check his quals", "Check my
   quals", an Undo or Redo of a change to him), nothing is outlined and the page stays. When his row is next drawn (the
   filter cleared), he is outlined and the page makes its ONE trip to him if he is out of view. After that, nothing
   moves the page back.
2. **One finger, one drag.** A column drag begun on a heading belongs to the finger (or mouse) that began it. A second
   finger put down during it CANCELS it: no column moves, Undo gains nothing, no lift frame or landing mark is left.
3. **A redraw during a drag** from the pinned row no longer wipes the picked-up look from the pressed heading.

**Pictures go in NEW folders** under `raptor-port/docs/img/handpass/2026-11-11-quals-small/`, each named with an `r-`
start (`r-filter-pc`, `r-filter-phone`, `r-drag-pc`, `r-drag-phone`, `r-2f`, `r-pin`, `r-trip`, `r-lw`, `r-misc`).
Never write into, rename or delete a folder that is already there. If a run fails and you run it again, use a new
folder name (`r-filter-pc2`) and tell me which folders are the citable ones. On the phone, picture within about 100ms
of each lift with the finger's last place left as it was, as well as the settled picture.

Sizes as before: desktop 1280×800 (Chromium, mouse); phone 402×874, touch, scale 3 (Chromium, real CDP fingers);
WebKit at the phone's size where marked WK (no finger drags there — you found it cannot make one).

## The scenarios — for each: PASS / FAIL / OBSERVED / NOT RUN, the numbers, the picture
**R1 — the filter case (pc, phone, WK).** Set up as your A8: a man far down with a sign-in (Zenith), sent to by "Check
his quals" with the filter box holding text that hides him.
- a. At the press: the page stays, nothing outlined.
- b. While he is still hidden: tick another man's box (in Edit), press a sort — the page stays.
- c. Clear the filter by backspacing in the box, one key at a time, as a person does: at the keystroke that draws his
  row — is he outlined, did the page go to him ONCE, is his row clear of the top bar and the pinned heading? Record the
  page's scroll before and after, where the filter box is now (on or off screen), and where the typing cursor is.
  Picture it at once and again after a second.
- d. The same, clearing the filter by selecting all its text and deleting it in one press; and (pc) by any ✕ / clear
  control the box has, if it has one.
- e. After the trip: a tick elsewhere, a sort, the filter typed again and cleared again — the page must NOT go back to
  him.
- f. Undo: tick a man near the top (in Edit), type a filter that hides him, scroll to the foot if the page still
  scrolls, press Undo — record what happens (expected: nothing outlined, the page stays). Clear the filter: he is
  outlined; the page goes to him once only if he is out of view. Then Redo with the filter hiding him, and clear again.
- g. The filter NOT hiding him (your A1 / A2 again, pc and phone): one trip at the press, then a tick, a sort, a filter
  typed and cleared, entering and leaving Edit — no trip back.
- h. A second ask for a DIFFERENT man who is off screen (your A4, not run before): the page goes to the new man, the
  outline moves to him.
- i. pc at 2560×1440 (a wide screen, where far more rows fit): "Check his quals" for Zenith — record whether the page
  moved and that his outlined row is in view; then a tick elsewhere — no jump.

**R2 — the pinned heading's drag again (pc by mouse; phone by finger).** Page scrolled down, Edit quals.
- a. pc: drag a pinned heading three columns right, slowly; again as a quick flick; a drag left; a drop on itself; a
  press and release. One lift frame, one landing mark, the order changed in the pinned row and the table, Undo / Redo.
- b. phone: the same by a finger, at an ordinary speed and as a quick flick; the page's place unchanged; the pinned
  cells opaque mid-drag.
- c. pc and phone: carried to the right edge — the table and the pinned row scroll sideways together; drop; Undo.

**R3 — a second finger (phone, Chromium, two real CDP fingers).** For each case record: did any column move, did Undo
gain a step, is any lift frame, landing mark or picked-up look left on screen, and does a fresh one-finger drag work
straight after.
- a. First finger down on a pinned heading and dragged a little (the lift frame showing), held; second finger down on
  another pinned heading, moved sideways 80px, lifted; then the first finger moved again and lifted.
- b. As a, but the second finger goes down on the table's body below.
- c. As a, but begun on the table's OWN heading row (page at the top), second finger on another of its headings.
- d. Two fingers put down together on the pinned row from rest and pinched apart, and the same on the table's own
  heading row and on the table's body: record what each does (does the table zoom?) — record only, no judgement.

**R4 — a redraw during a drag (pc).** Mid-drag on a pinned heading (mouse held down, the lift frame showing), change
the window's size by a few px (`page.setViewportSize`), wait 300ms, move once more: the pressed pinned heading still
wears its picked-up look, exactly one landing mark shows; drop — the order is written. Picture mid-drag after the
resize.

**R5 — the pinned row keeps up (pc and phone).** With the page scrolled down so the pinned row shows:
- a. Tap a pinned heading (not in Edit quals): the sort mark shows on that pinned heading at once; tap again; tap
  another.
- b. Enter Edit quals while scrolled down: the pinned headings gain their ✕ and can be dragged; leave it: they lose
  both, and a drag lifts nothing.
- c. In Edit quals add a column, then remove one with the table's own ✕ (scroll up for it, then down again): the
  pinned row shows the same columns as the table each time. Then drag the column YOU ADDED by its pinned heading: it
  moves like any other, Undo puts it back.
- d. Change the tab (Pilots / WSOs / Personnel / All) and type in the filter: the pinned row's headings match the
  table's, and three pinned headings' left edges equal their columns' cells (your B8 measure).
- e. phone: pinch the table to zoom out and in, part-way down the page, the fingers drifting; picture mid-pinch; after
  it, the pinned headings' left edges and widths equal their columns', and no row shows through the pinned row.
- f. phone: a hard flick to the page's very foot and back to the top, twice: the pinned row is there when scrolled
  down, hidden at the top, and aligned.

**R6 — what was not run before.**
- a. The Leave War's quals list after a pinned drag: on Quals, move a column by dragging its PINNED heading; open the
  Leave War and find where a person's quals are listed (a person's window, the grid's quals columns or filter — say
  where you found it); does its order follow the new order? Picture both.
- b. phone: "Check my quals" (your A5, by Archive then Restore of bane, sign in as `us`) — one trip, outlined, then a
  tick on his own row: no jump.
- c. phone: the member `us` on the pinned row — no ✕, a finger's drag lifts nothing, the order unchanged.

**R7 — the plain round again, short (pc and phone):** the filter, the four tabs, tick / untick, Undo / Redo, a sort,
add a column and remove it, Done, Export — anything that behaves differently from your first walk is a finding.

## Your report — your FINAL REPLY, under 600 words
Per scenario id: the result, the deciding numbers, the picture's folder and name. Every FAIL and every OBSERVED
difference with exactly how to repeat it. Errors seen. What was NOT RUN and why. The citable picture folders. Do not
delete anything; do not ask for anything to be deleted.
