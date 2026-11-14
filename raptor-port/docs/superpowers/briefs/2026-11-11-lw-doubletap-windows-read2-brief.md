# The Leave War's double-tap guard — the narrow read of the fix round (11 Nov 26, chat 64, job 4)

You are a fresh reader. READ ONLY: change no file in the checkout, commit nothing, push nothing, run nothing that
builds (no browser tests, no `npm run build`, no full unit suite — a walker may be using the built app). Work in
`C:\Users\User\projects\Raptor\.claude\worktrees\next-jobs-recommendation-fixes-3756f8`, branch
`claude/lw-doubletap-windows`. You are handed ONLY the fix and the findings it answers. Do not open `HANDOFF.md`,
anything under `raptor-port/docs/handpass/` or `raptor-port/docs/img/`, or any other reader's report (nothing named
`*-read-astra.md` / `*-read-opus.md`).

## The code under review
`git diff 245dd9a4e be789fdc7 -- raptor-port/src raptor-port/e2e` — the fix round's commits only. Read the surrounding
code as far as you need (`raptor-port/src/leavewar/ui/Matrix.tsx`: `guardGrid`, `lastPressRef`, the `winsUp` bits, the
event box's closing effect; `raptor-port/src/leavewar/ui/Sheet.tsx` for how a window closes).

## Background, in four lines
On a phone, when a window over the Leave War's grid closes by a tap, a fast second tap in the same place must not reach
the grid behind (32px, 600 ms; `guardGrid(true)`). Each window is one bit; a bit that drops arms the guard at the place
of the last press, if that press was inside a window (`.bidsheet`, or the small event box `.evpeek`). Everything else —
a tap elsewhere, a tap after the time, the top bar, a scroll or pinch, a mouse's single click, a key — goes through.

## The findings the fix answers
- **A.** The event box closed WITHOUT a tap — Escape (caught on `window` with `stopPropagation`, so the document
  `keydown` reset never ran), a scroll, a resize, a pinch's start — after a press inside it, armed the guard with that
  old press: the next deliberate tap on a day near the old spot within 600 ms was swallowed.
- **B.** The same, wider: a press that began on the event box and became a swipe (the page's scroll closes the box);
  and any bit dropping from something other than a press while the last press, however old, was inside a window.
  The asked fix: the remembered press carries a time (refreshed when that press ends), a `pointercancel` clears it, and
  the guard is armed only when the press is inside a window AND less than 1000 ms old.
- **C.** Tests only: the browser test's "nothing opened" list named `sel-sheet` (the drag window is `select-sheet`);
  missing tests for two windows up with one closing, a hand-over, a failed save.
- **D.** A comment that said "every other window over the grid" — corrected to the eight it covers.

## Questions — each with evidence (file and line); say plainly where you find nothing
1. Does each fix do exactly what its finding asked — and is Escape, a scroll, a resize, a pinch start, a swipe begun on
   the box, and an old press each now unable to arm the guard?
2. **A real double tap now let through** (the worse side of an age limit): can a window close by a genuine tap whose
   remembered press is null or "too old" at the moment the bit drops — a button held long then released; a close that
   lands a frame or a second after its press (a save that waits, a confirm's second press, a hand-over through a
   timer or an effect); a `pointercancel` that the browser fires for an ordinary tap or after the closing click; the
   `pointerup` listener missing a press that ends outside the document or on a removed element; a pen?
3. **A new false swallow:** can the new listeners or the helper make the guard eat a press it let through before?
4. Listener hygiene: are the new listeners added once and removed in the same cleanup; does anything outlive the grid?
5. Is the first guard (the one-day and drag windows, bit 1) changed in any way by the age limit — in particular a
   leave button pressed (the window closes), a Delete after its "sure?" press, a Post out?
6. The new tests: is any hollow (passing with its fix reverted)? Does any existing test's assertion get weaker?

## What is NOT a finding
A problem only in data already stored (demo data, cleared before the database step); a scheduler who is not an admin
(there is none); the windows the guard does not cover (the Required rows' panel, rename form and number pad, the
day-details panel, the under-manned days list, the move banners, New period, Open for bidding on a desktop — filed);
a double tap on the event box's Edit closing the event window it opened (older, `Sheet.tsx`, filed); the ✕ over the
bell; a window closed by a tap on the grid beside it.

## How to report — your FINAL REPLY, under 500 words
Start with the exact words "Narrow read, job 4 —". Each finding numbered: the concrete case (each press in order, what
the person sees, what they should see), file and line, and exact step-by-step fix instructions with the test that
would catch it. Explicit negatives for each question where you found nothing. A one-line verdict at the end. Aim for
10 minutes.
