# The fresh, blind Opus read — [E2E-BOARD-KEYS-SKIP], the board-layout keyboard test never skips (9 Nov 26, of `f39cc606b`)

A fresh Opus reader that wrote none of it and saw no other report, given the brief
`2026-11-08-e2e-board-keys-skip-read-brief.md`; read only, no test run. Its report, condensed by the host; the verdict,
each answer and its one note kept.

**Verdict: nothing found.** No way for the test to pass without proving the case, no weaker assertion, nothing changed
outside the test but the backlog item's move.

1. **The box always starts under the keys.** The scroll puts the box's foot at 372. Only boxes inside the board's
   scrolling part are searched, so the pinned bar and crew column are never picked; a box in the head at rest is passed
   over. No box, a scroll not taken, or a marker lost to a redraw each fail (no skip). The three fixture checks are
   stricter than the old skip's condition (foot past 202, whole on screen, top below the bar). Nothing but the app's
   keyboard lift can raise the box from 372 to 195 or less — matching the builder's break test.
2. **It proves the same thing, nothing weaker.** Every step from the tap on is unchanged. For any box the fixture picks,
   the lift needs about 178px and at least 200px of list remains, so the end of the list (the next test's case) is never
   reached; the scroll passes the head's height (about 95), so the bar stands at about 51 every time and the "about 151px"
   check holds.
3. **No concrete way to go red on a correct app; one weak spot, uncertain:** the picker did not repeat the keyboard
   lift's own filter, which leaves out disabled, read-only and tick boxes; such a box picked first would turn the test
   red on a correct app (never pass falsely). None is drawn on the admin's Edit Schedule board; the old test had the same
   exposure. Optional hardening: skip `disabled`, `readOnly` and checkbox / radio / range / button / hidden boxes.
   *Host: taken — the picker now skips them; the spec file re-run twice under the checks lock, 15/15.*
4. **Nothing else changed** — only the backlog item's move.

Checked: the diff and the whole spec file; F-689-1 and D1936's full row; the keyboard lift's code (`keepAboveKeyboard`,
`lift`, `panelRoom`, `keptClear`, `isTypingBox`); the sideways stylesheet block; the board's structure and measured bar
and head heights; when line boxes are disabled or read-only.
