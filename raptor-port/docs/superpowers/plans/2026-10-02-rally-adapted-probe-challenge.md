# Sol challenge: adapted audit repair

Sol 6.1, 2 Oct 2026. This challenges Astra's bounded repair plan before adapter edits; it is not a final inspection of Sol's output.

The wrong Inputs command scope is concrete: the old fixture routes an Inputs write through the scheduler command. Retain the count/DOM purpose, use the supported localhost `fileInput` bridge (the production Inputs writer), bind the new record by its generated iid, assert the Inputs scope and page/filter state across Undo and Redo. Do not navigate back or force a render to conceal an incorrect landing. Capture the old scope/page fault separately without using it as a passing test.

Replace the fabricated legacy AL with an isolated fresh browser context, navigate to an empty week, and use actual +Note, note editing, signatures, publication, deletion, Undo and Redo controls. This keeps the existing audit page's later flight-slot checks independent. No reporting stages exist on a note-only day, so publication has a valid chronology without deleting or bypassing the guard.

One plan premise needs qualification: note objects have rid, but `rowids.ts` NONROW includes dn and `canonical.ts` explicitly describes notes as positional canonical content. Therefore a stable note-object identity alone does not prove that a live cell must retain an AL1 tint after changing position against the frozen AL1. Capture actual canonical pending, attribution and frozen issue before choosing the live-cell expectation. Never manufacture a green answer by rewriting an issued record; do not erase the old remapping guard. `keys.test.ts` retains the separate legacy shiftKeys contract. Astra has been asked for a bounded clarification of the current positional-note authority.

No application source or product semantics are authorized by this fixture repair. A valid production-route failure remains a defect requiring disposition. Preserve the old 24/3 current and baseline logs, and run the repaired audit then the complete adapted set. Existing broad source gates and the frozen production bundle remain applicable if only the probe changes.

## Actual-route disposition

The isolated observation `.superpowers/rally-audit-note-observe.json` settles the path actually exercised: complete real Original/AL1, earlier-note deletion, Undo and Redo. Settled deletion preserves `changes['dn:0.1']=1`, no dead-index2 mark, BRAVO unmarked, CHARLIE EDIT solid AL1; pending holds the deletion and the canonical pending count remains positive. Undo restores the same note ids/order and CHARLIE's index2 AL1 mark; Redo restores index1. Complete issued AL1 remains frozen. Thus the adapter retains the original two mark-remapping guards and adds immutable current-format issuance instead of asserting that AL1 must be rewritten. It does not claim note rid is the canonical addressing grammar or that a future pending rebase yields the same tint.

Astra's clarification correctly identified positional canonical notes, but its predicted post-rebase pending-AL2 paint is not the settled deletion command's observed result: the delete epilogue does not perform that rebase here. That prediction is qualified rather than turned into a new test expectation. The actual audit adds a real AL1 preview and AL2 publication, model/DOM identities, Undo/Redo, and no fake controls or legacy issued records. Existing separate `keys.test.ts` legacy remapping tests remain untouched.

The old Inputs failure is reproduced with scope/page observations:46 model/46 rows before; command scope `sched`; after Undo46 model, active Edit Schedule, Inputs body absent (zero rows). The repaired writer emits `inputs` scope and keeps page, All dates and filters through Undo/Redo. No manual repaint/navigation repairs the assertion.

Rulings: none added.
