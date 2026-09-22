I found four actionable defects and one documentation/test gap.

## Findings

### [P2] `0901ef08` accepts malformed joining dates from storage

[`dateEnd`](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/state/store.ts:615) treats every string as a valid date. A stored record such as `{from:"garbage", to:null}` now survives boot, although the parent commit rejected it because `to` was not a string.

That malformed `from` is laid onto the live person, then [`inSquadron`](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/engine/people.ts:274) compares it lexically with real ISO dates. This can exclude the person from availability, manning counts, matrix styling, and OIL expansion.

This is newly reachable in `0901ef08`. Arbitrary malformed `to` strings were already accepted before it; I am not attributing that older half to this commit.

Fix:

1. Introduce one shared ISO-day guard, using the codebase’s existing `yyyy-mm-dd` convention.
2. Make `dateEnd` accept only `null` or a value passing that guard.
3. Require at least one end to pass the guard.
4. Add corrupt-storage controls for `from:"June 15"`, `from:""`, and malformed `to`, plus the valid from-only reload case.

### [P2] `e28b7234` can light a frozen preview or the wrong replacement line

[`refreshHighlights`](/C:/Users/User/projects/Raptor/raptor-port/src/ui/highlights.ts:111) walks every `data-warnkey` in the document and matches only its positional key. Unlike the puck and fresh-add paths, it does not exclude `.preview` or `.pv-frozen`.

Opening a preview does not clear `WFOCUS`, while the board explicitly renders old content inside [`.pv-frozen`](/C:/Users/User/projects/Raptor/raptor-port/src/ui/SchedBoard.tsx:204). An old equal-time line at the same position can therefore receive a live warning glow. A structural edit can likewise leave the pre-existing focus alive and shift another equal-time line into the same `ff:day.wave.line.ld` address.

The stale focus lifecycle predates this commit; painting a replacement box from that stale positional key is new in `e28b7234`.

Fix:

1. Clear the two highlight classes as today.
2. Skip matching elements inside `.preview` and `.pv-frozen`; do not exclude the normal `.issued` face, whose official warnings legitimately match its frozen content.
3. Before painting, confirm that the currently displayed warning at `WFOCUS.di/ix` still has the stored code and key.
4. Test an active week preview, board preview, normal issued face, and removal/reordering of a focused line.

### [P2] `ca57f306` widened “missing times” without updating its consumers

[`dayOilBlind`](/C:/Users/User/projects/Raptor/raptor-port/src/engine/oil.ts:361) now includes an equal-time standalone shift. Its consumers still say that the row has “no times”:

- The hard day warning at [`validate.ts:1158`](/C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts:1158).
- The publication message at [`sync.ts:1092`](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/sync.ts:1092).
- The Logic entry, which still describes only a blank duty desk, at [`logic-html.ts:193`](/C:/Users/User/projects/Raptor/raptor-port/src/ui/logic-html.ts:193).

For `08:00–08:00`, both times are visibly present. The warning now directs the scheduler toward the wrong problem. Before `ca57f306`, equal-time shifts were excluded from `dayOilBlind`, so the old wording was not reached by this case.

Fix:

1. Define the shared condition as “no usable duration,” covering missing, unreadable, and equal times.
2. Update the day warning, publication message, warning-code label, and Logic entry to use that wording.
3. Keep the more precise `FLT_NO_LEN` message telling the scheduler that one of the two equal times is wrong.
4. Add tests for a blank desk, equal-time SC, equal-time AVALON/BB, a mixed day, and the issued-snapshot publication message.

### [P2] `ca57f306` leaves the Logic rule internally contradictory

The leading sentence at [`logic-html.ts:198`](/C:/Users/User/projects/Raptor/raptor-port/src/ui/logic-html.ts:198) still states that a flying line with equal times earns OIL. Its later explanation says standalone shifts do not.

This universal lead was already false for shifts; `ca57f306` attempted to repair the rule but only appended the exception. It is an incomplete fix, not a newly introduced underlying defect.

Fix:

1. Rewrite the lead to distinguish “ordinary sortie” from “standalone shift” immediately.
2. Retain the detailed report/debrief explanation below it.
3. Test the rendered Logic text before the explanatory span so the summary itself must state both outcomes.

### [P3] The new boot-routing explanation and test describe a path that does not exist

The added comment says the router is off during the demo capture. In fact, [`initStore`](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/state/store.ts:863) already calls `lwHistInit`, setting `LW_READY=true`, before [`main.tsx`](/C:/Users/User/projects/Raptor/raptor-port/src/main.tsx:59) calls `installDemoWorld`.

The production behavior is currently safe: `lwSyncTurn(() => locked(persistNotify))` emits a reconciliation rather than `lw.edit`, and it coalesces correctly both at idle and inside an existing command. The defect is the new false lifecycle documentation and incomplete test—the test checks only “no edit,” not that exactly one `lw.sync` was emitted.

Fix:

1. Correct the comment to acknowledge that routing is already enabled after `initStore`.
2. Remove the test’s redundant extra `lwHistInit`.
3. Assert exactly one `lw.sync` and zero `lw.edit`.
4. If boot captures are truly required to remain off-stream, split history baselining from route enabling and enable routing only at the later `main.tsx` call.

## Explicit negatives

| Commit | Checks that found no defect |
|---|---|
| `b05d6f52` | No cycle or new dependency graph: `peek.ts` already imports `html.ts`, which already imports `validate.ts`. `fltNoLen` uses only fields present in seeded/stashed formations. The title and passive `badtm` class fit the inert peek contract; it correctly emits no warning address or gesture. |
| `e28b7234` | `wfoc`/`advf` CSS remains scoped to pucks and bad-time boxes. The arm, selection-ring, and fresh-add painters use different classes and targets. |
| `0901ef08` | No other production reader treats `postOuts.to` as mandatory. Valid one-ended windows work correctly through `inSquadron`, `availableFor`, `countsFor`, and the matrix’s null-end handling. |
| `0ef1df31` | The new `to` keep condition matches the archive contract. A joining-only record remains stored and is restored if the person returns, but it no longer forces an archived person onto the visible roster. No other code treats `postOuts` as “everyone the war must draw.” |
| `ca57f306` | `isStandalone(wave)` is the correct sortie-versus-shift discriminator; `saExemptKind` would wrongly omit SC. OIL arithmetic is unchanged and correct. The new command wrapper coalesces correctly when idle, nested in another sync turn, or already committing. |

The added whole-document warning-key query is necessarily additional work on every highlight pass; match count is small, but the claim that it “costs nothing” was not measured here.

Verification: no files were changed. The four focused test files were invoked, but the read-only environment prevented Vitest from creating its temporary directories, so zero tests executed.

Walk: NOT DONE — this was the requested read-only code inspection, not the required FULL browser walk.

