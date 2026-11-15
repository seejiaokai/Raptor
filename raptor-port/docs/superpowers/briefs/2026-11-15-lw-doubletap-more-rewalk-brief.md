# Job 3 — the re-walk of the reads' fixes: the walker's brief (chat 81, 15 Nov 26, ~06:45)

The same rules as `2026-11-15-lw-doubletap-more-walker-brief.md` — read it whole first (the checkout, what you may
write, standing the build up on port 4392, sizes, real touch, a picture within about 100 ms of the second tap and once
settled, errors watched). The build is now `claude/lw-doubletap-more` at `65e90282c`, `raptor-port/dist` already built
from it — do not build or run test files. Pictures in a NEW folder:
`raptor-port/docs/img/handpass/2026-11-15-lw-doubletap-more/rewalk/`. Scripts in the scratch folder `job3/rewalk/`.

## What the fixes changed
1. A key press now makes the grid forget the last finger press before any window's own Escape handler runs — so a
   window closed by Escape never arms the guard with an older press.
2. The slim "Back to Approvals" bar's ✕ now arms the guard (admin: Approvals → tap a request's dates → the grid at that
   day with the slim bar at the foot).
3. The scheduler's Calendar window, opened from the Leave War's ⚙ → Calendar…, now arms the guard when closed by its ✕.

## Scenarios — PASS / FAIL / OBSERVED / NOT RUN, with pictures
- **R1 — Escape from the number pad (a touch tablet 1024×768 with a keyboard, Chromium):** open a Required cell's pad by
  touch, with a live day under a digit; tap the digit; press Escape; within 300 ms tap the day where the digit stood.
  Expected: the pad closes, the figure unchanged, the day opens. Again with the selection panel (Escape), the rename
  form (Escape), the day panel (Escape), New period (Escape) and a move banner (Escape) — each after a finger press
  inside it, then a tap on the grid where that press was: it opens.
- **R2 — the slim Approvals bar (phone 402×874, real touch; again in WebKit):** double tap its ✕ at about 120 and 350 ms
  — nothing opens behind; after 800 ms the same spot opens what lies there; its "Back ▴" still takes him back to
  Approvals; a far tap at once opens a day.
- **R3 — the Calendar window (phone; scroll the grid first so its ✕ stands over the pinned dates or a day):** double tap
  its ✕ at 120 and 350 ms — nothing opens behind; after 800 ms the same spot opens; it reopens from ⚙ at once.
- **R4 — the first walk's guarded cases still hold (phone, Chromium):** the selection panel's Apply, the number pad's
  Done, the day panel's ✕, an under-manned row, a record move's Cancel, New period's ✕ — double tapped at 120 ms,
  nothing behind; a far tap at once opens.
- **R5 — a short plain-user round (phone, then desktop 1536×864):** a Required figure set and undone; the slim bar from
  Approvals and back; ⚙ → Calendar… opened and closed; a day panel; a bid moved; each closes and the grid answers a tap
  1 s later.

## Report — your FINAL REPLY, under 450 words
Per scenario: the result, what opened, the picture's name. Every FAIL or OBSERVED with how to repeat it. Errors. NOT RUN
and why. The picture count. Aim for about 25 minutes.
