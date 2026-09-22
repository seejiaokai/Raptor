# OIL jobs 1 & 2 — code review, Astra/Codex, independent (22 Sep 26)

Read-only run against the brief in `docs/superpowers/briefs/2026-09-22-oil-jobs12-codereview.md`.
Written blind to Fable's review, which it says it did not read. Verdict below is Codex's own.

Review result: **not ready to close**. I found two silent money defects, two missing ask paths, the acknowledged unloaded-anchor overpayment, and incomplete backward compatibility for published evidence/signatures.

The branch advanced concurrently from `07f7a86` to `b3c65cd` while I was reading. I changed nothing and did not read the other provider’s review document. I reviewed the requested commits plus the resulting current code, including `195943e`.

## 1. Where it is WRONG

### Rank 1 — NEW / DISAGREE with `195943e`: an old issued cancelled claim starts paying after the upgrade

The job-2 schema adds mandatory `OilInputEv.stand`, but schema-v5 issued blocks do not have it.

Scenario:

1. Before `eb28f2c`, publish a Saturday containing an OIL input with `acc:'g'`, answer Yes, and make its landed row `cx:true` or `info:true`.
2. The old `oilInputEligible(day, inp)` finds that row and correctly pays nothing.
3. Reload the persisted schema-v5 book under current code.
4. `oilEvidenceOf` returns the frozen block, whose input has no `stand`.
5. Current [`oilInputEligible`](</C:/Users/User/projects/Raptor/raptor-port/src/engine/oilev.ts:395>) tests that `undefined` is not `cx`, `info`, or `gone`, so it returns true.
6. The issued record now pays the man even though no amendment was issued and the frozen schedule still says cancelled/info-only.

`195943e` repairs only serialization through `standOf`; it does not repair the money reader. Its premise that `acc:'g'` meant “landed and paying” is false: the pre-job-2 reader explicitly rejected cancelled, info-only, and missing rows.

Repair:

1. Red first in `src/engine/oilev.test.ts`: publish a cancelled row, strip `stand` from the frozen input, then assert the issued figure remains `null`. Repeat for `info`.
2. Add a legacy-aware `effectiveStand(day, inp)`:
   - Existing `inp.stand` wins.
   - Non-`g` becomes `unlanded`.
   - For legacy `g`, reproduce the old rule against the frozen `day.ground`: matching live row → `active`/`cx`/`info`; no row → `gone`.
3. Use that function in `oilInputEligible`; do not infer eligibility from `acc` alone.
4. Use the same function for legacy key normalization, passing the corresponding day to the serializer.
5. Alternatively, under the project’s pre-promulgation reset policy, bump `SCHEMA_VERSION` from 5 to 6 and reset `inputs`, `weeks`, and `leavewar`. That is destructive but safer than guessing evidence the old block did not store.

### Rank 2 — NEW: an off-week denial resurrects after A→B→A

[`pruneHandedOverDecisions`](</C:/Users/User/projects/Raptor/raptor-port/src/engine/oilev.ts:237>) only deletes from a cloned projection. That fixes A→B while B holds the request, but not A→B→A.

Scenario:

1. A multi-week request belongs to A. An unloaded/stashed covered day contains `A|i:<iid> = deny`.
2. Load the anchor week and hand the request to B. [`clearOilPersonDecisions`](</C:/Users/User/projects/Raptor/raptor-port/src/ui/oilmode.ts:252>) clears only loaded `DAYS`; the stashed denial remains.
3. The read prune hides it while B owns the request.
4. Before loading that stashed week, hand the request back to A and record A’s fresh Yes.
5. Load the stashed day. The stored key now matches the current holder again, so the prune retains it.
6. A’s supposedly dead denial overrides his fresh Yes and he is unpaid.

Repair:

1. Red first with a multi-week A→B→A test whose denial lives in `WEEKSTASH`; assert A earns after the hand-back.
2. Move the clearing operation out of `ui/oilmode.ts` into an engine/state helper.
3. Clear `${oldPerson}|${item}` from loaded `DAYS` and every readable mutable stashed week.
4. Run the mutation through `writeInputsBatchWith([weekstashStore], …)` so the person change, live clear, stash clear, rollback, persistence, and undo are one operation.
5. Keep the read prune as a defensive guard, not as the mechanism that makes the decision permanently die.
6. Add an undo test proving one undo restores both the assignment and the off-week decision.

## 2. What it broke elsewhere

### Rank 4 — NEW / DISAGREE with `195943e`: persisted signatures still break, and some unchanged days still manufacture amendments

Yes, there are unchanged states that key differently.

First, `195943e` does not cover signature bindings. A schema-v5 [`signBind`](</C:/Users/User/projects/Raptor/raptor-port/src/engine/publish.ts:821>) stores the old OIL string, which contains no `stand` segment. Current [`currentBind`](</C:/Users/User/projects/Raptor/raptor-port/src/engine/publish.ts:806>) always creates the new-format string. The strict comparison therefore invalidates an otherwise unchanged signed day even when the new `standOf` makes `dayHasChanges` clean.

Second, an unchanged legacy cancelled/info-only input is normalized by `standOf` to `active`, while the live projection says `cx`/`info`. That manufactures a pending OIL amendment even though old and new eligibility are both “pay nothing.” Simultaneously, the issued reader has the Rank-1 defect and starts paying it.

The new F3 test only deletes `stand` from a freshly published active block. It does not:

- Age the stored `signBind.oil` string.
- Cover `cx`, `info`, or missing rows.
- Assert issued money remains unchanged.
- Distinguish a true multi-day job-2 correction from a phantom amendment.

Repair:

1. Add red tests for an unchanged signed active claim, unchanged signed `cx`, unchanged signed `info`, and a genuine multi-day correction.
2. Prefer schema version 6/reset if the dev-phase reset ruling remains acceptable.
3. If preserving v5 state, migrate bindings only where a day-aware normalized issued key equals the normalized live key. Leave the signature invalid where job 2 genuinely changes money.
4. Do not accept the old binding merely because it matches a legacy serializer; that could keep a signature valid when job 2 has genuinely changed a multi-day payout.

For newly written evidence containing `stand`, I found no ordinary same-version phantom through reload, stash/restore, plan selection, recovery, or undo. Those routes preserve/restore the row and re-derive `acc`, or represent a real eligibility change.

## 3. What is MISSING

### Rank 5 — NEW: calendar date drag bypasses the ask

[`moveInput`](</C:/Users/User/projects/Raptor/raptor-port/src/ui/caldrag.ts:112>) calls `commitInputEdit` directly.

Testable scenario:

1. A Duty on Saturday has an FO Yes.
2. Drag it to Sunday in the same loaded week.
3. `commitInputEdit` deliberately retains the old Saturday-keyed answer.
4. Sunday is now unanswered, but no OIL question opens.
5. Sunday pays nothing unless the holder later notices the bell.

Repair:

1. Red first in the calendar-drag suite: drag an answered Saturday request to Sunday and assert `OILASK` identifies the request immediately.
2. Extract the post-commit “raise OIL ask if the saved row is now pending” code currently embedded in `reassignInput`.
3. Call it after a successful calendar commit.
4. Add a rendered test proving the sheet opens for the new date and names the current holder.

### Rank 6 — NEW: both in-place time editors reprice without asking

[`setInpField`](</C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:1222>) also calls `commitInputEdit` directly. Its two production doors are the board field handler and the contenteditable week/input handler.

Scenario:

1. A Saturday 08:00–10:00 request has an HO Yes.
2. Edit its end time in place to 18:00.
3. `commitInputEdit` correctly deletes the stale HO answer.
4. No question opens; the code relies on the notification bell being noticed later.

There is already a test explicitly pinning the deletion, but none requiring the immediate ask.

Repair:

1. Red first: call `setInpField` on an answered HO row, assert the answer is invalidated and `OILASK === iid`.
2. Use the same shared post-commit ask helper as calendar drag and `reassignInput`.
3. Exercise both UI call sites so one cannot regress while the helper unit stays green.
4. Keep remarks-only edits as the negative control: they must not ask.

I found no third direct mutation of the stored input’s `person`. Production assignments reduce to `commitInputEdit` plus `reassignInput`’s draft change; both ultimately flow through the commit.

## 4. Read-side prune

**DISAGREE in part.**

The immutability claim is correct:

- `oilEvidence` clones `d.oild`.
- The prune mutates that clone only.
- `daySnap` stores a separate frozen `d.oilev`.
- `oilEvidenceOf` returns that frozen block for a modern issued snapshot.
- I found no production caller that passes a modern issued block through the prune.

So it cannot mutate `DAYS`, `Day.oild`, or a modern issued `Day.oilev`.

The statement that `oilEvidence` runs “only on the live day” is too broad: it accepts an explicit day and `oilEvidenceOf` can derive evidence for a day lacking `oilev`, such as legacy/test data. That still does not mutate the supplied day because `oild` is cloned.

The correctness claim is not sufficient, however: because the prune is non-persistent, it causes the A→B→A resurrection in Rank 2.

## 5. Stated unloaded-anchor limit

### Rank 3 — KNOWN / DISAGREE that it can remain open

It must close before release. A cancelled request paying covered days is a direct overpayment and can be frozen into a signed publication.

The current implementation is weaker than the comment suggests because [`landedStanding`](</C:/Users/User/projects/Raptor/raptor-port/src/engine/oilev.ts:184>) returns `unlanded` immediately whenever the globally stored `acc` is no longer `g`. Week loading deliberately clears the derived `g`, so it never reaches the advertised `elsewhere` distinction in the ordinary unloaded-anchor case.

Repair:

1. Red first: stash an anchor row with `cx:true`, load another covered week with a Yes answer, and assert no figure. Add active-stashed-row and info-only controls.
2. Factor the existing stash scan in `inputedit.tsx` into an engine helper.
3. Search loaded `DAYS` first, then readable non-current stash blobs for `ground[].src === iid`.
4. Return the actual stashed row state: `active`, `cx`, or `info`.
5. Only after both searches miss should `acc`, first-day presence, and `gone`/`unlanded`/`elsewhere` be considered.
6. Skip the stale stash entry for `CURWEEK`; live `DAYS` are authoritative.
7. Treat unreadable/protected stash conservatively—quarantine or no-pay—not as positive evidence of work.
8. Round-trip the test through `loadWeek` and reload, not merely a hand-built projection.

## 6. Explicit negatives

Checked and found clean:

- No additional production assignment to a stored input’s `person`.
- Dialog saves run `oilGate` before writing and do not preload the old holder’s answers.
- `reassignInput` raises the question for its drag route.
- Loaded-day clearing is item-specific and does not remove decisions for other requests.
- The prune ignores row-item keys, keeps orphans inert, and does not alias live decisions.
- Current-format evidence sorts inputs by stable `iid`; input-array reordering does not change the key.
- A loaded anchor marked `cx`, `info`, or actually missing is rejected across all covered days.
- Dormant `acc:'r'` requests remain ineligible.
- Plan/version restoration strips derived `oilev` from the working copy while leaving issued blocks frozen.
- For current-format snapshots, undo/redo restores `DAYS`, `INPUTS`, issue records, and bindings together; I found no new `stand` drift there.
- I found no row-cloning regression: the repair still uses one landed row.

No tests were executed and no files were changed by this review. The checkout was clean at final inspection on `b3c65cd`.

