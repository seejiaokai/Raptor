# Adapted probe: note-mark correction after actual command evidence

Author: Astra, 2 Oct 2026. Bounded correction to `2026-10-02-rally-adapted-probe-repair.md` and the subsequent positional-note clarification. Neither earlier record is rewritten. No adapter approval, production edit, test/browser run or final code inspection by this author.

## What was wrong in my earlier reasoning

The first plan wrongly generalized stable amendment keys to day notes. Notes may carry record ids, but `src/engine/rowids.ts` explicitly lists `dn` in NONROW; its key remains positional. `canonical.ts` and `rowids.test.ts` pin that distinction.

My subsequent clarification correctly recognized positional canonical comparison but incorrectly proposed pending AL2 on both surviving cells as the expectation for the ordinary delete route. That inference conflated canonical publication differences with the live historical mark maps. I qualified it as applying after pending rebasing, but the real delete route under examination does not invoke that wholesale rebase. Do not change the app or weaken the probe to manufacture that prediction.

## Actual observed contract

Read evidence: `.superpowers/rally-audit-note-observe.json`, produced by Sol through actual controls in a fresh empty week beginning4 January2027. It contains Original, AL1, deletion, Undo and Redo snapshots and an empty errors array. This author extracted each stage's notes, marks and DOM, and compared the complete saved AL arrays after deletion/Undo/Redo to AL1; all three comparisons were equal.

| Stage | Live notes | Live changes | Live pending | Rendered attribution |
|---|---|---|---|---|
| AL1 | ALPHA, BRAVO, CHARLIE EDIT | `dn:0.2 = 1` | empty | CHARLIE EDIT at index2 has solid AL1 |
| Delete ALPHA | BRAVO, CHARLIE EDIT | `dn:0.1 = 1` | `del:0.1.note = 1` | BRAVO unmarked; CHARLIE EDIT at index1 has solid AL1; no index2 cell |
| Undo | ALPHA, BRAVO, CHARLIE EDIT | `dn:0.2 = 1` | empty | CHARLIE EDIT returns to index2 with solid AL1 |
| Redo | BRAVO, CHARLIE EDIT | `dn:0.1 = 1` | `del:0.1.note = 1` | same as deletion |

The issued AL1 snapshot, its original note ordering and its diff remain unchanged. The stored note ids remain consistent across these stages, but they are not the authority translating amendment keys.

## Why that result follows the actual route

`ui/board.ts` handles note deletion by splicing the notes, calling `shiftKeys`, recording the deletion and running the scheduler mutation epilogue. `engine/keys.ts` moves the live positional changes mark from index2 to1. It leaves current-format issued snap/diff untouched; its legacy keys-array handling remains separately tested.

`state/view.ts:rawSchedEpilogue` calls `reconcileIssuedMarks`, not a wholesale `rebaseDayPending`. The reconciliation skips inert deletion keys and does not manufacture all positional differences into new pending cell marks. `engine/publish.ts:alAttr` reads the live changes/pending maps, so CHARLIE keeps the remapped solid AL1 while the deletion is represented by its inert pending key.

`canonicalDiff`/`dayDelta` independently compare the working document with the current issued document for publication eligibility and the next issuance. They can detect positional differences without immediately repainting every such cell as pending. `rebaseDayPending` is a distinct operation on other routes; this report makes no claim that every rebase, plan switch or version load preserves the exact same live tint. Do not derive the ordinary delete route's expected tint solely from a hypothetical rebase.

## Correct adapter assertions

Retain the original meaningful post-delete regression guards, now on a valid production-created Original/AL1:

- CHARLIE EDIT's live mark is solid AL1 at index1; the old index2 changes mark is absent.
- BRAVO is not falsely marked as AL1 or as the deleted note.
- The deletion is pending and the authoritative publication comparison remains positive.
- The entire issued AL1 record is unchanged; its real preview preserves ALPHA/BRAVO/CHARLIE EDIT in issued order.
- Actual Undo and Redo restore the live order, marks and pending state shown above.
- Actual AL2 captures the changed document while AL1 remains unchanged.

The supplied observation file proves the recorded deletion/Undo/Redo states and AL1 equality. The real preview, authoritative pending-list check and AL2 publication assertions remain for the repaired adapter to execute; they are not claimed proved by this file. The isolated legacy shiftKeys tests retain their separate positional-remap regression coverage.

## Inputs diagnostic also closed

The same observation file's `oldScope` confirms the earlier Inputs diagnosis: before Undo, Inputs has46 model records and46 rows; the added record is recorded as `sched.mutate` with scope module `sched`. After Undo, the model returns to46, the active page is `editsched`, and `#inBody` is absent. Thus the old zero-row assertion was reading an unmounted page. Repair remains a real Inputs-scoped add/save followed by Undo on Inputs, not navigation back to mask the incorrect fixture scope.

Rulings: none added. These corrections specify evidence expectations only; the fresh final inspector still reads the completed adapter and retained evidence.
