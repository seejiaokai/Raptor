Reviewed the exported copy of `claude/msq-b1-screens-135`, using `FIX.diff` for `e9791020e`.

**Findings: none meeting the brief’s evidence requirements.**

The three fixes appear consistent on inspection:

- Closing the last Leave War window releases the delayed landing. Ordinary closes without a pending hold avoid notifying the page.
- The Input window now remains held when a View-only pick removes its original page. Returning to its squadron restores editing.
- The phone menu tracks dismissal through the press rather than elapsed time. The next pointer press clears a cancelled press’s note; Escape uses its separate closing path.

**Read:** the brief, complete diff, changed logic and added tests; surrounding permission, squadron-pick, window-close, read-only, Escape and Undo-landing paths; applicable project guidance and full rulings D2381, D2323 and D2384.

**Limits:** static review only. Tests and browser checks were not run; this copy has no installed test dependencies. No files changed, no build run, and no excluded reports or walk evidence opened.

**Tidiness notes:** none.

Rulings: none this session.