**One finding: the new regression check needs correction.** I found no app behaviour defect in the reviewed changes.

**P2 — the reopening check skips “Edit input”.** After dragging and closing the input window, the [new check](C:/Users/User/projects/Raptor/.claude/worktrees/pictures-round-57c55c/raptor-port/e2e/medical.spec.ts:347) clicks a Medical card and immediately waits for the input window. A card opens the document viewer; only its **Edit input** button opens the input window. Both desktop cases would therefore time out before checking the remembered position.

Exact fix:

1. Keep the card click.
2. Wait for the document viewer to appear.
3. Press **Edit input**.
4. Keep the existing checks that the input window opens, retains its placed state, and leaves no reserved space.
5. Rerun both desktop cases.

Other checks found no defect:

- Medical spacing follows the window’s placement state, including reopening and phone/desktop resizing.
- Both reserved spaces inherit the shared width values.
- The month/year reset remains bounded; I found no new render loop or change to date-selection callbacks.
- The moved cut-off helpers retain their original behaviour, and both settings windows use them.

This was a read-only code review. I ran no tests or browser walkthrough and opened neither the walk evidence nor another reviewer’s report. Nothing changed.

Rulings: none this session.

Tidiness note, for filing only:

1. **Older implementation remnants:** none found in the changed lines.
2. **Avoidable duplication:** none newly introduced.
3. **Inaccurate comment:** the “?” card’s new comment says it stays shut when the question goes away. If reopened while the question remains, clearing the question leaves it open. Correct that explanation without changing behaviour.

