# The fresh blind Opus read of the third fix round — Fable's `27db0c659` (23 Nov 26)

Brief: `2026-11-23-msq-view-only-fixread3-brief.md`. Blind to the handoff, the walk and the other readers. Six probes in
the session scratchpad (`rt3/probe.scratch.test.tsx`); the repo untouched.

**Findings: none.** No test could be written that fails on today's code for any path the brief names.

**Checked:** a Plan holder held at a pick of 149, a real Undo, the same input opened again by the Leave War's door — held
throughout; a View holder held over View-only Sched, a real Undo of his own change takes him back to 142's Inputs, the
window live (right: 142 in view again); a Plan holder held, the member view on, the record put back as a new object, the
member view off, 142 picked — held with the pick's band throughout, no Save in the member view, given back at 142; unsaved
words and another input asked for while held — kept and held through the question and "Keep editing", "Discard and open"
judged afresh; a new input (no id) held at the pick and after an Undo of something else; the set-aside note cannot leak —
dropped when a new input is taken up, cleared on close; no crash, no endless redraw; the commit's test file 14 of 14.

**Read:** the brief and diff; `ui/InputWindow.tsx` InputEditor (the opening note, take-up, record-follow, close, the refused
save, the swap question, both window shapes); every opener of an input window (the bell, the OIL ask, the give-back
re-find, the Leave War's opener, the week and board labels); `state/perms.ts` pageUnit, pageOffered, viewOnlyPick;
`state/store.ts` heldWindowBand, enterSquadron; `state/typing-hold.ts`.

**Tidiness (filed, not fixed):** 1. "The same input" written two ways (the swap question by raw id, the note as text) — one
helper. 2. The note's rules in two places inside a function of nearly 1,500 lines — a small piece of its own owning take /
keep / set aside / bring back / drop. 3. The View-holder test stands in for a refused command by replacing the record by
hand; a test driving a real refused command would cover the real path.
