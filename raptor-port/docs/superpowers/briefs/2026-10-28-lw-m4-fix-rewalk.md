# The M4 fixes' re-walk — the walker's brief (the night of 27–28 Oct 26)

You are a Sonnet walker (D787, D588): you walk the running app and take pictures; you do not read code for bugs, edit
anything under `raptor-port/src`, build, commit or push. This re-walks ONLY what the night's fixes touched (the bug-check
order §5, "re-walk only what the fixes touched").

**First read, whole:** the re-walk brief `raptor-port/docs/superpowers/briefs/2026-10-28-lw-m4-rewalk.md` (its set-up,
helpers, traps, sizes and report shape hold; the first walk's brief it names too), and the fixes' report
`raptor-port/docs/handpass/parts/lw-m4/fixes-night.md` (what each fix does). The earlier re-walk's own scripts are your
recipes: `raptor-port/scripts/handpass/lw-m4-rw-a*.mjs` (desktop) and `lw-m4-rw-b*.mjs` (phone) — copy their steps.
The checkout and the server are as in the re-walk brief; the build on port 4173 is now commit da770b233 (bundle
`index-DI37kq8O.js`), frozen while you walk. Your files: scripts `raptor-port/scripts/handpass/lw-m4-rw2-*.mjs`, pictures
`raptor-port/docs/img/handpass/2026-10-27-lw-m4/rewalk2/`, report `raptor-port/docs/handpass/parts/lw-m4/rewalk2.md`.

## The steps (each a PASS only when the screen shows the right thing)
- **F1 a day with two halves (M1, M2) — desktop:** through the app, give one man an approved leave on one half of a day
  (a bid on the afternoon, approved), then a bid on the morning of the same day. In Approvals approve the morning line,
  then tap the lit "Approved": the MORNING goes back to pending and the afternoon stays approved (check both on the grid's
  cell and in the bid window). Approve again, then one tap on Refuse: the morning is refused, the afternoon still approved.
  Then sign in as that man (after a write, the lib's `switchTo`) and read his bell: one right line per decision, never
  "deleted" for an approval.
- **F2 Undo and Redo after a change of mind (M3) — desktop:** Approve a line, one tap on Refuse, Undo: the line shows lit
  "Approved" again and the record agrees; Undo again: pending; Redo: lit "Approved", both buttons working; Redo: lit
  "Refused". Read the record each time (the grid's cell or the bid window).
- **F3 a lit line changed elsewhere (M7) — desktop:** approve a line, tap its dates (the grid, the slim bar), put that
  leave back to a bid on the grid, Back ▴: the old line no longer shows lit "Approved" as if nothing happened, and the
  request is not shown twice.
- **F4 Pick dates open, a press on a line (M4) — phone, by finger:** open "Pick dates…", press a line's Approve: the
  calendar closes and NOTHING is decided (header count and every line unchanged); press again: that line, and only it, is
  approved. The same on the desktop with the mouse.
- **F5 posting out (M5) — desktop and once on the phone:** a man with a posting-out date still to come and leave after it:
  in the bid window Approve is refused with "He posts out on <date>: refuse or delete it" (the same words as Approvals).
  A man whose posting has RUN (post him out with today's date or earlier — note what the app allows) and a pending bid
  before it: Approvals and the bid window both refuse it alike.
- **F6 leaving from Approvals (M6) — desktop:** open Approvals, then the slim bar (a line's dates), then go to another page
  (Edit Schedule, Inputs) from the menu: that page opens at its top and does not jump; come back to the Leave War: the
  grid and Approvals as left. The same from the Approvals page itself.
- **F7 the bell's foot (M8) — phone:** a long bell (12+ lines); a finger that starts on the "↓ N more" strip and drags up
  moves the list (or nothing), never the page behind; a drag on the list itself still scrolls the list.
- **F8 the phone's slim bar (M13) — phone 402:** the bar about 8px in from each side, about 46 tall, its foot about 10px
  above the screen's (measure its box); beside r22-6-phone; Back ▴ and ✕ each pressed by finger; a window opened with the
  bar up stands above it.

Lessons (§7.11) carried here: 1 (state × reading — F1, F2), 3 (feedback after each press — say what showed it), 4 (a press
behind an open picker — F4), 5 (what stands over a thing — F8), 8 (the drawing — F8). Return to the host only: the counts,
each FAIL in one line with its pictures and the ruling it breaks, and what you could not reach.
