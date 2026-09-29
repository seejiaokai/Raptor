# Final independent code read — Astra

## Verdict

Two medium-severity findings remain in `HEAD` (`604d7691`) against `origin/main` (`d3650865`). Both affect newly created data and are therefore outside D56’s exclusion.

The working tree changed during this review, so all cited target lines were re-read directly from `HEAD`. I did not open the other reviewer’s report, start the app, run tests, or modify files.

## Finding 1 — Medium

### What

“OK, seen” is excluded from Undo, but Redo can resurrect the notice.

`lw.ack` deletes notices from the same `lw.cell` record captured by the earlier filing step. The timeline advances the record revision but does not preserve the acknowledgement separately. Redo later restores the filing’s exact forward snapshot, including the notice that was already acknowledged.

### Where

- `raptor-port/src/undo/timeline.ts:145`
- `raptor-port/src/undo/timeline.ts:182-185`
- `raptor-port/src/undo/timeline.ts:795`
- `raptor-port/src/leavewar/state/store.ts:1101-1108`
- `raptor-port/src/leavewar/state/store.ts:2847-2868`
- Missing post-Redo assertion: `raptor-port/e2e/step4-leavewar.spec.ts:301-310`

### Concrete scenario

- Setup: A person has an LL bid. An admin files LL over it from Inputs, producing the replaced-bid notice on Leave War.
- Action: Open the notice, press “OK, seen,” then Undo the filing and Redo it.
- What shows: Undo correctly restores the bid. Redo writes the recorded forward `lw.cell` list wholesale, so the acknowledged amber notice returns.
- What should show: The filing returns, but the notice remains seen. The test’s own comment says “the notice, once seen, stays seen,” yet line 310 only checks the approved chip and never checks that the notice remains absent.

### Does `main` do the same?

No, not in this exact form. `main` records `lw.ack` as its own step, so it has a separate Redo that removes the notice again. This build intentionally removes that step but does not provide durable acknowledgement state outside the restored cell image.

### Exact fix

1. Add durable acknowledgement state keyed by person plus the notice’s stable sequence, separate from `lw.cell`.
2. Persist and decompose it as its own Leave War collection, such as `lw.acks`; register it in `LW_COLLS` and handle it in `applyLwRecord`.
3. Change `ackReplacement` to write that acknowledgement marker. It may still remove current notice rows, but the marker must survive independently.
4. Make every notice reader and renderer suppress a notice whose person/sequence is acknowledged, including one reintroduced by Undo or Redo.
5. Keep `lw.ack` in `NOT_STEPS`; because the acknowledgement record is not part of the earlier filing closure, replaying that closure will not reverse it.
6. Add a unit test and extend `step4-leavewar.spec.ts` through: bid → filing → OK seen → Undo filing → Redo filing → notice still absent.
7. Reload after that sequence and assert the notice remains absent, proving the acknowledgement is persisted rather than only hidden in memory.

## Finding 2 — Medium

### What

The landing and focus code treats any folded Leave War projection as though the user’s original action happened on Leave War.

A schedule action such as publishing a weekend/PH day can include both scheduler records and an automatic `lw.cell` OIL-credit projection. `landingOf` then puts Leave War first, while `snapView` focuses Leave War and returns before bringing the scheduler day into view.

The underlying problem is that `Landing.pages` conflates the action’s primary surface with every surface on which a consequence happens.

### Where

- `raptor-port/src/state/undo-wire.ts:102-127`
- `raptor-port/src/state/undo-wire.ts:138-156`
- Coverage only uses a schedule note without a cross-module projection: `raptor-port/src/state/undo-wire.test.ts:255-260`
- The walked publish case confirms the folded Leave War credit but reopens the same day before Undo: `raptor-port/scripts/handpass/cr-a1-pub.mjs:43-56`

### Concrete scenario

- Setup: Publish Saturday or Sunday with work that grants an automatic Leave War OIL credit. The resulting schedule entry contains scheduler records and `lw.cell`.
- Action A: Move the board to another day, then press the board’s Undo.
- What shows: `snapView` sees `lw.cell`, calls `focusDay`, and returns at line 147. It never calls `boardTab` or `bringDayIntoView`, so the board remains on the wrong day.
- Action B: After publishing, navigate to Admin or Leave War and press the top-bar Undo.
- What shows: Admin is sent to Leave War because it is first in `pages`; Leave War remains there because it is considered an acceptable current page.
- What should show: Publishing is a scheduler action. Undo must open Edit Schedule and bring the published day into view. The automatic OIL credit is a folded consequence, not the action’s primary location.

The reciprocal case is also structurally wrong: a Leave War-origin action with schedule projections can remain on Edit Schedule because any page in the closure is treated as acceptable, despite the code comment saying the act belongs on Leave War.

### Does `main` do the same?

Partly:

- On an already-open board showing the wrong day, `main` does **not** do the same. It checks only `entry.scope.module === 'lw'`, then reaches the scheduler-day logic and changes the board day. The new `forward.some(lw.*)` condition introduces this regression.
- From another page, `main` also fails to navigate because it lacks the new B7 landing feature entirely. This build was intended to fix that behavior, but the folded projection is misclassified as the primary surface.

### Exact fix

1. Replace `Landing.pages` with separate concepts, for example `{ primary, acceptable, then }`.
2. Determine `primary` from the root user action—principally `entry.scope.module` and its command type—not from projection collections:
   - scheduler/week action → `editsched`;
   - Leave War action → `leavewar`;
   - input/plan/lookahead action → `inputs`;
   - people action → `quals`;
   - settings action → the specific Admin, Logic, or Quals destination.
3. Use `acceptable` only for the explicitly approved multi-surface input exceptions: a loaded-week input may remain on Edit Schedule, and a visible absence input may remain on Leave War.
4. Do not make Leave War acceptable merely because a scheduler closure contains an automatic `lw.*` projection.
5. In `snapView`, select `focusDay` only for a Leave War-primary action. For a scheduler-primary action, continue to `schedDayOf`, `boardTab`, or `bringDayIntoView` even when its closure contains `lw.cell`.
6. Add tests for:
   - schedule publish plus `lw.cell`, undone from Leave War and Admin → Edit Schedule;
   - the same closure with the board on another day → board moves to the published day;
   - Leave War-origin action plus scheduler projection, undone from Edit Schedule → Leave War;
   - existing Inputs multi-surface exceptions remain unchanged.

## Explicit negatives

I checked and found sound:

- Own-action authorization, member-view refusal, sign-in/sign-out clearing, sticky named barriers, and say-once-then-pass-over behavior.
- D350’s excluded operations and final-delete handling.
- Both pre-snap and in-reducer restore-rule checks, whole-transaction store enlistment, callsign collision checks, account/admin guards, and deleted-person guards.
- People/settings restore seams rebuilding their derived state.
- `lw.stage` command registration, authorization classification, and dedicated wording.
- Text-detail metadata from command through timeline description.
- One-step wave-template grouping.
- Change-history reversal lines only where the forward action wrote a line.
- Live Quals column reads.
- Page/role roll-call for the top-bar pair, the board’s shared pair/Sync/bell controls, Done-only exit, and the More-menu gates.
- Tracker’s separate undo engine, hosted bridge, and standalone-header fallback.
- Board navigation through the shared bell closes the board instead of navigating beneath it.
- No migration-only or already-stored-demo-data issue was reported.

Non-functional hygiene: `git diff --check origin/main...HEAD` reports trailing whitespace in seven added lines across `leavewar/state/store.ts` and `state/store.ts`. I did not count that as a product finding because no enforced gate was identified.

