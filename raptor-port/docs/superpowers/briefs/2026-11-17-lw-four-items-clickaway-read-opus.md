# The fresh Opus reader's read of the click-away (chat 104, 17 Nov 26)

*(Condensed by the host from the reader's report; brief `2026-11-17-lw-four-items-clickaway-read-brief.md`, on `30e4e1162`.
Blind to Astra and to the walk. His D2176 — an outside click always closes the editor, the change dropped — came in
during the reads and made F1, F2 and F4 moot.)*

- **F1 (medium-high):** with an unsaved change in an award the range or the archive then hides, every other award refused
  to open, with nothing to say why. Reproduced red (`leavewar.spec.ts`, since removed with the guard it tested). Moot under
  D2176: no guard is left.
- **F2 (medium):** a half picked as it was shown, or an amount put back after picking one, counted as a change and kept
  the editor open. Reproduced red; moot under D2176.
- **F3 (low-medium, desktop):** a drag begun inside the editor (selecting the reason's words) and let go outside closed
  it — the click goes to a box around both. Reproduced red; **fixed**: a press that began in the editor or its calendar
  is the editor's own. Test: "a drag begun inside it and let go outside closes nothing; a press alone closes nothing".
- **F4 (for him):** the tracker's ✕ drops an unsaved change. Settled by D2176 (the change is known to be dropped).
- **Tests:** the desktop slide half cannot fail (a wheel makes no press) — the F3 test's held press now guards against a
  close-on-press version; no test covered the correction calendar — added ("its calendar is its own"; its red check
  against a build without the calendar exception is owed, chat 105); fixed waits (250ms, 300ms) — left, D87 noted:
  the 300ms follows a slide, as a pause before "still open".
- **Checked right:** "2.0" equals "2"; an armed Delete cleared on close; a refused save; a member opens no editor; a
  wheel, a pinch or a touch slide makes no click; keyboard Enter on an award makes no click; a click on another award
  closes this editor and opens that one; the calendar's veil and patch count as inside.
