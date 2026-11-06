# Job 3's builder report to the night's coordinator (6 Nov 26), saved as it arrived

Branch `claude/people-quals-1106` at 8232135b6.

- [QUALS-HEAD-FINGER-CAPTURE] built — real: a finger pressed on a heading's words and slid onto the next heading moved nothing (the old test passed only near the screen edge). The drag now lets go of the pressed element's own hold and reads the heading under the finger. Test in `e2e/pinchzoom.spec.ts`, red on main.
- [QUALS-PINCH-NOSDA-HEAD] built — Playwright's WebKit 26.5 and Chromium take the scroll-driven path (his iPhone on iOS 26 or later should too; an older iOS would not); with the feature reported missing the pinned name heading sat at −159 px against a table edge at 20. The still name heading is drawn in both paths and the row's own hides while pinching (D1287's way). Test red on main.
- [QUALS-ZOOM-EDGE-SLIVER] built — cause found: in a collapsed-border table the name cell's left border slot belongs to the table and the sticky cell leaves it see-through; scrolled sideways the cells under it showed (16 and 17 of 124 readings, 0 after). On a phone, only while scrolled sideways, a 3 px strip of the cell's own fill sits left of it; a first version hid the table's left line when not scrolled — caught by the pixel comparison and redone. Test red on main.
- React Doctor on People and Quals: 36 → 0 (16 fixed, 20 kept with reasons; `doctor.config.json` untouched). New `src/ui/peoplepick-model.ts`. 22 of 22 screens pixel-identical before and after at 1536 Chromium and 402 WebKit.
- Sign-in: `Login.tsx` touched (labels naming their boxes only), `accounts.ts` a comment; a fresh Opus security read found no hole (`read-security.md`).

Walk: `docs/handpass/2026-11-06-people-quals.md` · 105 pictures (65 walk + 40 re-walk) · 11 surfaces · 21 orders · MISSING: 0 (two older gaps filed). 77 steps: 68 pass, 0 fail, 9 not applicable; the plain-user round re-walked after the read's fix, 39 pass.

Code read (fresh blind Opus, `read-opus.md`): finding 1 (low) — turning the Undo outline into a ref could let the page jump twice; not reproduced, reverted to main's code and the rule kept off with its reason. A lost space and a file-map line put right.

Checks: 49 unit-test files, 1,230 tests passed; Quals and frozen-header browser tests 20 passed; lint:changed no new finding; docsize OK. Questions for him: none.

To file: [QUALS-PINNED-HEAD-NO-DRAG] — in Edit quals, scrolled down, a heading in the pinned row cannot start a column drag (the press listener is on the table alone). [QUALS-OUTLINE-RESCROLL] — Quals' outline after "Check his quals" or an Undo is never cleared, so a later repaint with that row off screen may scroll the page back to it (found by the read, not walked). Close the three Quals items once merged. Temp build folders removed; preview servers stopped.
