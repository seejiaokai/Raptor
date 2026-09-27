# Astra read-only report

## Findings

### Low — the `wfoc` ring test can pass while its named UI behavior is broken

**Files:** `raptor-port/src/ui/flagglow-css.test.ts:137`, `raptor-port/src/ui/highlights.ts:74`, `raptor-port/src/ui/highlights.ts:84`, `raptor-port/src/ui/scheduler.css:1382`, `raptor-port/src/ui/scheduler.css:3141`

**Setup → action → what shows → what should show:** Sign in/view-as a person involved in a warning that also has an echo puck on another day → focus that warning → if `.me` ever leaks onto the `.wfoc.echo` puck, the purple `!important` shadow wins → the warning’s red/amber focus glow should show instead.

The current production code is correct: the warning-focus branch returns at `highlights.ts:84` before `.me` is added at line 97. The defect is the test: `flagglow-css.test.ts:137-140` merely proves that the standalone `.puck.wfoc` declaration contains a blurred shadow. It does not resolve `.puck.me.wfoc`, inspect emitted DOM classes, or guard the crucial early return. It would remain green if that protection were removed and the screen became purple.

The same cascade helper deliberately ignores context selectors at `flagglow-css.test.ts:36-48`, so its “every combination” claim covers puck class combinations, not board, palette, drag-ghost, preview, or ALL AVAIL contexts.

**New vs main:** The vulnerable production ordering already exists on `main`; `flagglow-css.test.ts` is new on this branch, so the misleading green coverage is new.

**Exact fix:**

1. In `src/ui/interact.test.tsx`, add a rendered-DOM test beside the warning-focus cases.
2. Use `setMe()` to make a participant in the chosen warning the signed-in person.
3. Focus that warning and assert every corresponding focused puck has `wfoc` and does not have `me`, including any `.echo` copy.
4. Clear warning focus and assert the person’s ordinary puck regains `me`.
5. Add explicit context cases to the cascade fixture for `.rpuck.standby/.busy`, `.dragimg.lift`, board, preview, and ALL AVAIL ancestors—or rename the existing assertion so it does not claim surface coverage.
6. Perform the A4 break by temporarily removing the return at `highlights.ts:84` or deliberately adding `me` to a focused puck; require the new behavior test to fail, then restore the production code.

No High or Medium functional defect was found.

## Explicit negatives

1. **Rings:** I checked all classes emitted by `html.ts puck()`—severity, `boxred`, `boxdash`, `boxdot`, `oilglow`, `half`, and `oildim`—plus dynamic `me`, `sel`, `hl`, `wfoc`, drag state, palette context, published previews, board, ALL AVAIL, and print/export. The production cascade leaves flagged own pucks matching other flagged pucks, preserves purple fill, gives unflagged own pucks the purple ring/glow, and gives earning own pucks the green OIL ring. I found no production ring defect beyond the missing test guard above.

2. **Every row door:** I checked mouse and finger drops through `applyDrop`, roster-to-seat, both swap ends, moves to append cells, armed append and empty-seat taps, sim/desk/ground primaries and extras, info rows, accepted-request relinking, `iu:` reassignment, Inputs, templates/plans, undo/redo, and command writers. `rowTwice` runs before visible writes; `fillSlot` supplies the append-writer belt. `writeSlot` has no production caller. SC/AVALON and flying FCP/RCP retain their separate rule. I found no missing production door.

3. **Consistency:** Refusal paths return before mutation, pending/edit-log/history work, landing flash, and successful-drop cleanup. Armed placement stays armed; phone drag cleanup reopens/retains the drawer; `slotBar` supplies the same reason to captions, struck roster lines, green eligibility rings, and counts. I found no inconsistent refusal state.

4. **Arrow revert:** Desktop `.week` is back to main’s 20px padding, and the `weekInset`/`scrollPaddingLeft` behavior is absent. The remaining `scroll-padding` mentions are truthful phone/current-behavior comments or historical documentation, not live leftovers. I found no unrelated rollback.

5. **Tests:** Apart from the `wfoc`/context blind spot above, I found no other vacuous assertion or wired production door without the A4 evidence claimed by the sheet. I did not run any test, build, or server, as instructed.

