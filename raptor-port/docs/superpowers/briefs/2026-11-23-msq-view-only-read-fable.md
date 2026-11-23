# The Fable read and scenarios — a squadron he only views, and the ☰ menu's squadron drop-down (23 Nov 26, HEAD cd94a4e8e)

His D2385 (Fable's last 7% for the bug checks). A fresh blind helper; brief `2026-11-23-msq-view-only-read-brief.md`. It
glimpsed the working copy's newer test titles (no other report). Findings:

1. **An input window left open through the landing stopped being held** — Hunter, Plan of 149, on 149's Inputs with an
   existing input's window open, switches to the member view: the page lands on View-only Sched and the window, judging
   its squadron by the page now in view, came back live with no band. Cause `ui/InputWindow.tsx` (`ownPage` from today's
   `CURPAGE`). Fixed: the kind of page it was opened on is kept with it — reproduced red first
   (`ui/msq-pick-windows.test.tsx` "Fable 1"), now held with the generic band (not a pick: nothing greyed, the gate
   refuses its saves — as for a Plan lowered).
2. = Opus F1 (a Leave War window across a pick) — fixed before this read.
3. = Opus F2 / Astra 2 (one shade tap) — fixed. 4. = Opus F3 (Tab out) — fixed.
5. `LANDED` not cleared at a session change — fixed (a hardening; no failure). The bell's re-entry home passes "his
   pick" (a window's band could read "You picked 142") — wording only, not changed.

Scenarios it names for the re-walk: an input window across the member-view switch; a Leave War window across a pick; the
shade tap; a bell "confirm your OIL" line with 149 picked (142 back, the window on the right row, no band); unsaved Tracker
edits then a View-only pick (no question, edits kept); a right lowered from another browser (not walkable here); an access
request's bell with 149 picked (142 back, Admin → Users, the toast 142's count); the keyboard through the ☰ menu.
