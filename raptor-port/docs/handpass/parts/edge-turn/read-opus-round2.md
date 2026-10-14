# Round two — a fresh, blind Opus read of the fix commit `c5047e7ce` (F1–F4), the night of 15 Oct 26

Given only the fix commit and the findings it answers (`read-opus.md`); read-only. Saved as it came back; dispositions in
the evidence sheet §11.

**Verdict:** all four fixes right in substance; F1 and F2 complete; F4 sound; F3 does what it set out to do but does not
put the undo history back exactly, and reacts to a cancel from any pointer — both low. Nothing high or medium.

**R1 (low) — the bend square's cancel restores the bend, but not the redo list, and can remove the wrong undo step.**
Make a change, Undo it (Redo lit); ✎ Edit lines → an arrow → a finger on its bend square, the system cancels the touch:
the bend comes back but Redo goes dark; with 60 steps stored the oldest is lost too; if anything pushes or pops during
the hold (Ctrl+Z from an iPad keyboard) the pop removes a real step. *Cause:* `pushUndo()` at the press clears `redoStack`
and may trim the bottom step; the cancel only pops the top entry (`core.js:3341`, `3353`). *Fix:* keep `undoStack.slice()`
and `redoStack.slice()` before `pushUndo()` and the entry it pushed; in the cancel, if that entry is still on top put both
lists back, else remove that entry where it is; `notify()`. The pinch path is unaffected.

**R2 (low) — the four new cancels, and the older releases, react to any pointer, not the one dragging.** A second finger
whose touch the browser cancels (a slide on something it scrolls) ends the first finger's drag and snaps its line or bend
back while the first finger is still down. Before the commit that finger's lift already ended the drag (keeping the
change); the snap-back is new. *Cause:* the listeners are on `window` and never compare `pointerId` (`core.js:3353, 3368,
3407, 3437`); the ball and group drags listen on the captured element. *Fix:* `const pid = e.pointerId` in each press;
`mv`, `up` and `cancel` return unless `ev2.pointerId === pid`.

**Answers:** F1 — `renderBoard()` keeps `selEdge` and the tool; the square is redrawn at its new place; the only other bare
`wireBoard()` on a release is the ball's `endDrag` (older — n ball moves give a wheel step n+1 zooms and duplicate
listeners; it doubles no edge pan). F2 — right; no case where it stops a pan that should run; it cannot let the chart's
start slip past. (Older, not this change: a ball or handle can still be dropped left of / above the chart's start without
any pan right after ⤢ Fit and be cut off outside the editor — close it by clamping the positions.) F3 — each cancel
restores what its drag changed, but for R1; with the pinch, `stop()` first removes the cancel, no double restore. F4 —
sound; a release with no chip lifted, a tap in the day window, other pointers do nothing.

**Test notes:** T11 walks only a drawn line's end cancelled; T9's speed window would let a doubled mouse pass — its undo
count (+3) is what catches the old fault; once R2 is fixed T11's desktop cancel must carry the drag's own `pointerId`.
