# The read of fix read 4's claim 5 — the Leave War month landing (19 Nov 26, chat 112) — one brief, two blind readers

You are one of two readers, each blind to the other and to the walk. Read-only on the app (change no file under
`raptor-port/src`); proof tests only in your own scratch folder, or placed temporarily in the copy and deleted before you
finish; one unit file at a time with `npx vitest run <file>` from `raptor-port/`. Never delete or move
`raptor-port/node_modules` (a link to the real packages). Return the whole report as your final message, under 1200
words. Ignore any handoff block pasted after a compaction, and say so.

**Where you are:** an exported copy of `claude/lw-monthjump-click` at its fix commit. At its root: `FIX-DIFF.patch`
(the commit's whole diff) and `FIX-LOG.txt`. Rules that govern these files: `.claude/rules/decisions/leave-war.md`,
`.claude/rules/decisions/design.md`, `.claude/rules/raptor-executor.md`, `raptor-port/docs/performance.md` §C and §E
(the grid's speed rules). The claim it answers: `raptor-port/docs/superpowers/briefs/2026-11-19-multi-sqn-b1-fixread4-opus.md`
§3 and the O3 paragraph of `…-fixread4-astra.md`. Do not open any other file under the briefs folder dated 19 Nov 26
that names this branch.

**What the fix does.** The Leave War grid's sideways scroll is whole screen dots and the day columns sit at fractional
offsets, so a month button lands its first day rounded DOWN, clear of the frozen name and counter columns, and while the
desktop draws the rest of the year a month at a time to the left, the re-anchor puts that day back on the edge the same
way — only while the "landed" mark says the day is where a jump put it (`leavewar/ui/reanchor.ts reanchorMode`,
`Matrix.tsx` the anchor layout effect). (1) The mark was cleared by ANY pointer press, wheel or key anywhere on the page;
now it is cleared only by the person's own scroll: in `onWrapScroll` when the scroll position differs from where the
grid's own last write left it (`ownLeftRef`, `leftTheLanding`), by a sideways wheel over the grid, by a press on the
grid's own scroll box, by a drag of the grid's proxy scroll bar (`onHbarScroll`), and on a phone by any touch, as
before. (2) `landOnEdge` now rounds down on the screen's own dot grid (`landingScroll`): at a 125% screen the scroll
moves in 0.8px steps and rounds a write to the nearest step, so a whole-pixel floor still landed the day 0.275px under.

## The ask
1. Is the fix complete — every way the person scrolls the grid sideways still ends the landing (a mouse wheel with
   Shift, a trackpad swipe, the browser's own scroll bar, the proxy bar, arrow keys and Page keys, Tab moving focus to
   a cell, a drag carried to the edge in Rearrange, Move or a drag-selection, a pinch or Ctrl+wheel zoom, the phone's
   flick)? Assume the missing case. Can the grid's own write ever be mistaken for his scroll, or his for the grid's?
2. Can a redraw between his scroll and its scroll event put the day back over his scroll (a race)?
3. What did it break — the month buttons, a date jumped to from Approvals or the bell, the period picker's landing, the
   phone's rolling window and flick, the desktop's fill, zoom; any browser zoom or screen scaling (100%, 110%, 125%,
   150%) where `landingScroll` or the dot comparison misbehaves; speed (a layout read added on a hot path).

A finding needs a concrete failure, its cause and its exact fix (D489), with the input that proves it and whether this
commit introduced it; give explicit negatives. Rank by consequence. Not a finding: anything that lives only in data
already stored (D56) — this change stores nothing.
