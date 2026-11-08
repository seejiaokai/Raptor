# The blind code read of chat 7's Inputs job — Astra (8 Nov 26)

Astra's report (`codex exec -m gpt-6-astra`, reasoning high, read-only), word for word, as it came back. Its brief: `2026-11-08-chat7-inputs-briefs.md` §The readers' brief; the read of commit `2eb13b28f`. What was done with each finding: the evidence sheet, `raptor-port/docs/handpass/2026-11-08-chat7-inputs.md`.

---

1. **P2 — The reserved space ignores the window’s remembered position.** At 1536px, open an input, drag its window 60px left, close it, then reopen it. The window retains that position, but the table still reserves space for the default right-hand position. Its rightmost columns therefore overlap the window while unused space remains on the right.

   **Cause:** [06-inputs.css:67](C:/Users/User/projects/Raptor/.claude/worktrees/pr-inputs-add-right-5b2653/raptor-port/src/ui/scheduler/06-inputs.css:67) reserves a fixed 446px; [InputsPage.tsx:741](C:/Users/User/projects/Raptor/.claude/worktrees/pr-inputs-add-right-5b2653/raptor-port/src/ui/InputsPage.tsx:741) checks only whether the editor is open. Neither follows its actual position.

   **Exact fix:** Calculate the reservation from the editor’s actual left edge, updating on opening, completed dragging and viewport resizing. Apply it only when Remarks retains the agreed usable width; otherwise use the overlay fallback. Preserve the user’s window position.

   **Regression case:** After that drag-and-reopen sequence, assert `table.right <= editor.left`. The fixed offsets leave approximately 48px of overlap. This is a source-derived finding; I did not run the browser case.

2. **P3 — The test comment names a nonexistent browser test.** Following the verification pointer in [inputs.test.tsx:114](C:/Users/User/projects/Raptor/.claude/worktrees/pr-inputs-add-right-5b2653/raptor-port/src/ui/inputs.test.tsx:114) leads to `e2e/inputs-add-right.spec.ts`, which does not exist.

   **Exact fix:** Point it to the D1787 tests in `e2e/inputs-calendar.spec.ts`.

Open questions: none.

Read-only review: no files changed, no build or tests run, and no other reader’s or walker’s report opened.

Rulings: none this session.

