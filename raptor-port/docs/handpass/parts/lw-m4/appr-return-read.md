# The fix read — his video and picture of 28 Oct 26 (commit adff8bc25)

One fresh, blind Opus reader, handed only the fix commit and the two faults (28 Oct 26). Its report, as returned:

**Finding 1 — MEDIUM, older than the fix (the walk had found and filed it as [LW-APPR-PERIOD-LANDING] before this report
came): a period changed while the grid is hidden loses its landing.** Steps: an admin, on a phone or a desktop, scrolls the
grid to October, opens the Approvals page and changes the period in the View picker; he presses Grid or OIL ✕. The grid
returns at the old sideways position, not the new period's landing day (D1177) — the store says a period switched to "is
always a jump". Since the fix, that stale month is drawn cleanly. Cause (Matrix.tsx): selectWar bumps focusSeq, the focus
effect calls jumpTo; with the grid hidden every rect is 0, so the scroll adds 0 and the jump is spent. Fix: in jumpTo and
the pending-jump layout effect, when the scroller's width is 0, keep the date in a hidden-jump ref; in the off→on branch,
re-read the view, take that date and jumpTo it, then wake the drawing; clear it on a real scroll. Not blocking this fix.

No other findings.

**(a)** Both fixes right for their faults; every return goes through setLwOnScreen(true) — leaving the Approvals page by
Grid, OIL, the slim bar; the page's return from another page or the bell. A period change under the OIL tracker or Settings
leaves the grid laid out underneath, so it draws normally. **(b)** Nothing breaks: the ask taken once (setOilUp's bump
re-runs the effect, which takes nothing; StrictMode's second run likewise); a re-read with zero sizes cannot poison the view
(measureStripGeo leaves the geometry empty, measureStrip returns before touching it); at mount prevOnRef is seeded from the
live signal; the page's activation now also wakes the phone, harmless; a short war drawn whole is untouched. **(c)** The
new phone test is a real guard: red on the old code, the held-back scroll sound (React listens on the scroller itself, a
document capture-phase stop prevents it), and `days > 0` catches a false zero.
