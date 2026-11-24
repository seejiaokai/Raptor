# Security read, round 3: the fixes to round 2 (copy `D:/raptor-work/c156-read3`, branch head)

**Scope.** BRIEF.md §3 item 3 first, then the rest of §3 only where it bears on it. Read whole or in the parts that matter:
- `state/perms.ts`: `sansPlanViolation` (with `SANSPLAN_OWED`, `SANSPLAN_REPLAY`), `sansBackEraseViolation` and `SANS_UNDO_TOLD`, the war-line branch of the bell check that also asks `SANS_UNDO_TOLD`, `restoreFollowUpOwed`, the member section's `noticeseen:` case;
- `leavewar/sansunfiled.ts`: `wireSansBackBefore` (the three probes, the begin hook, the marking projection), `planOwedBy`, `sansPlanOwed`, `planDrops`, `nextStamp`, `planOf`, `readOf`, `dueBase`, `retracted`, `rememberUndoTold`, `sansUndoToldNow`, `sansRetractUndoTold`, `sansTakeBack`;
- `command/commit.ts`: `commit`, `commitAs`, `commitProjection`, `dispatch`, `enqueue` (how `causedBy` is set), `runPipeline`, `finalize`, `deliver`, `onPipelineBegin`;
- `undo/timeline.ts`: `APPLYING`, `applyingRestore`, `verifiedReplay`, `restoreCommit`;
- `leavewar/sync.ts warNoticesReversed`; `state/notices.ts noticeSansBack`, `sansRetracted`, `sansStillHidden`; `state/noticeseen.ts`.

**Reach assumed.** As in round 2: a person signed in, using the screens, any exported command door (`commit`, `commitProjection`, `onCommit`, `onPipelineBegin`) or a command built by hand. Not `commitAs`: it lets the caller name any actor, so with it every gate in the app falls, and on the server the actor comes from the sign-in.

**Tests.** In `D:/raptor-work/c156-read3/raptor-port/src/r3-sec/`, with the config `vitest.r3sec.config.ts` beside them (the Leave War setup, jsdom, TZ Pacific/Midway). Run each file from `raptor-port/`:
`npx vitest run --config src/r3-sec/vitest.r3sec.config.ts src/r3-sec/<file>`.
- `sec-r3-1.test.ts`: 2 tests; the control passes, the HOLE fails (SEC-R3-1).
- `sec-r3-2.test.ts`: 2 tests; the control passes, the HOLE fails (SEC-R3-2).
- `sec-r3-controls.test.ts`: 5 tests, all pass (the doors this round built hold).
- The builder's `src/leavewar/sansplan-sec156.test.ts` and `src/leavewar/sans-reads-156.test.tsx` pass under the app's own config (56/56).
The two SEC files must stay separate: the device's stamp clock is module state, and a poisoned clock would spoil a later control in the same file.

**The core question, answered.** Through any exported door or a command built by hand:
- **Pass as a restore, a Redo or the same person: no.** `SANS_UNDO_TOLD` and `SANSPLAN_REPLAY` answer only for the restore the timeline is applying now (`applyingRestore`: `undo.restore`, `causedBy` equal to the step's seq, `APPLYING` set only around `restoreCommit`), of the same person's step. A queued command drained during a restore gets the restore's own seq as its cause, never the step's, so it never matches. `SANS_UNDO_TOLD` also needs a line that step's Undo wrote (kept against the timeline's own entry, in memory, written only inside an Undo restore), taken away only while he has not read it (his saved record), or its one "taken back", word for word.
- **Pass as a projection a command caused, for a mark that command does not owe: no.** The cause is found by `causedBy`, which only the command layer sets (from the command being delivered), and the marks are worked out from that cause's own changes. My controls: riding Saber's real planning of Hex on Sun 19, a mark for Sat 18, a mark for Ranger, or erasing Hex's Sat 18 is refused; riding Ranger's own read-record command, any mark for Hex is refused; a forged "posting run" that deletes nobody erases nothing.
- **But the VALUE of an owed mark is unbounded, and the device's stamp clock takes in a number from a man's own read record.** A number so large that adding one no longer changes it freezes the mark. From then on no later planning can pass the gate's own "newer than the row was". Two findings follow: SEC-R3-1, reached by a member through his own allowed command, and SEC-R3-2, reached by the planner's own session.

---

### SEC-R3-1: a member's own read record freezes the device's stamp clock, and other men stop being told of a day they are put back on

- **Where:** `leavewar/sansunfiled.ts nextStamp` (and `LAST_STAMP`). It reads `read` from the man's saved read record with `Number(g)`, unchecked. Then `LAST_STAMP = Math.max(Date.now(), LAST_STAMP + 1, read + 1, planOf(pid, iso) + 1)` sets the clock for the whole device. The gate's value test in `state/perms.ts sansPlanViolation` is `Number.isInteger(v) && v > 0`, then `v > before`. Both accept 1e300, and so does `planOf`.
- **The concrete case (msq world, Wed 15 Jul 26). Test: `sec-r3-1.test.ts`, "HOLE".**
  1. Saber ticks Hex (`rocky`) and Ranger (`bane`) SANS.
  2. Hex, signed in, saves his own read record through his own `notices.seen` command: `{ upto: 0, ids: ['sansdue:rocky~2026-07-18.1e300'] }`. The gate rightly lets him write his own row, and nothing checks what is in it. The same works with `9007199254740991`.
  3. On Saber's device, Saber puts Hex on Sat 18. `nextStamp` reads 1e300 from Hex's record, and the device's clock becomes 1e300. Adding one to 1e300 gives 1e300.
  4. Saber puts Ranger on Sun 19. His mark is written as 1e300, which the gate allows as greater than 0. Ranger reads his reminder.
  5. Saber takes Ranger off Sun 19 and puts him back. The projection writes 1e300 again, `v > before` fails, and the whole projection is refused.
  - Control, the same steps without step 2 (same file, run first): Ranger's reminder is lit again.
- **What goes wrong for him:**
  - Ranger is put back on a SANS day and is never told (D2394 2a, "a newly planned day"). He never touched anything; Hex did it with a write he is allowed.
  - Until Saber's page is reloaded, every mark that device writes for anyone is 1e300. Each such day then stays frozen in the store for good, so every man planned on that device in that session is affected, Hex's whole squadron included.
  - A refused projection takes every mark of that command with it, so other men's real marks in the same planning are lost too.
  - Anyone who can save a read record can do this, members included, and it reaches every admin's device that later plans him.
- **Cause:**
  - The stamp clock trusts a number written by the man the mark is about, and is shared by every man on the device.
  - Neither the writer nor the gate bounds the value to a safe whole number, so "newer than every mark before it" can stop being possible.
- **The fix (steps):**
  1. In `leavewar/sansunfiled.ts`, add one shared bound, exported for the gate:
     `export const STAMP_SLACK = 86_400_000` and `export const okStamp = (g: unknown): g is number => typeof g === 'number' && Number.isSafeInteger(g) && g > 0 && g <= Date.now() + STAMP_SLACK`.
  2. In `planOf`: return the value only if `okStamp(v)`, else 0.
  3. In `readOf` and `nextStamp` (and `keepReminders` in `state/noticeseen.ts`, which folds the same tokens): take a read `g` only if `okStamp(g)`, else ignore it.
  4. In `nextStamp`, stop the device clock from taking in one man's numbers:
     ```ts
     LAST_STAMP = Math.max(Date.now(), LAST_STAMP + 1)
     return Math.max(LAST_STAMP, read + 1, planOf(pid, iso) + 1)
     ```
     The result is still newer than his read and the day's row, never above `Date.now() + STAMP_SLACK + 1`, and the next man starts from the device's own clock.
  5. In `state/perms.ts sansPlanViolation`, the put branch:
     - replace `typeof v === 'number' && Number.isInteger(v) && v > 0` with `Number.isSafeInteger(v) && (v as number) > 0`;
     - in the `ok` test for a put, add `&& (v as number) <= Date.now() + 2 * 86_400_000`. The gate cannot see the writer's clock, so give it a day's margin over the writer's bound.
  6. Tests: `sec-r3-1.test.ts` turns green, all its asserts. Add to the branch: Hex's read record holding a day at `now + 23 h` (inside the bound) still leaves Ranger told on Sun 19. That proves step 4: one man's number no longer moves the device clock for another.
  7. `docs/data-model.md` §11, the `Setting` row for `sansplan:`: "a safe whole number, not more than a day ahead of the writer's clock".
- **Stored data:** a 1e300 already in the demo store is not a finding (D56). Once step 2 makes `planOf` read it as 0, the next real planning of that day writes a fresh mark. The gate's `v > before` still compares with the raw stored row, so that first write after the fix is refused. Either let the put branch use the same bounded read (`okStamp(c.before) ? c.before : 0`), or leave it to the database step's clear. **Recommended: the bounded read, one line,** so the gate and the writer judge one number.

### SEC-R3-2: an owed mark may be written with any value, so the planner's session can freeze a man's day for good

- **Where:** `state/perms.ts sansPlanViolation`, the put branch: `owed.put.has(id) && v > before`, with no ceiling. Reached through `commitProjection` from an `onCommit` subscriber during the delivery of a real planning. The queued projection gets that planning as its `causedBy`, so the owed set is the real one.
- **The concrete case (msq world, Wed 15 Jul). Test: `sec-r3-2.test.ts`, "HOLE".**
  1. Saber ticks Hex SANS.
  2. A subscriber on Saber's page waits for his next schedule change. Saber puts Hex on Sun 19. The app writes the real mark, then the subscriber's `sans.planned` projection writes `sansplan:rocky:2026-07-19 = 1e300`. It is owed (the cause newly puts Hex on Sun 19) and greater than the row, so it passes.
  3. Hex reads.
  4. Saber takes Hex off Sun 19 and puts him back. The new mark, 1e300 + 1 = 1e300, is refused.
  - Control (same file, first): without the subscriber, Hex is lit again.
- **What goes wrong for him:**
  - Hex is never again told he was put on Sun 19, by anyone, from any device. The row is frozen in the shared store.
  - The mark is meant to be the app's alone (§11). Here a value no planning would write is saved under a real planning's cover.
  - The reach is the planner's own session: the admin himself, or any code on his page. It is narrower than RR-SEC-1's (a member or another squadron's admin), but the harm lasts for good.
- **Cause:** RR-SEC-1's fix spec (mine, round 2) bounded the value only from below ("greater than `before`"). The builder followed it exactly.
- **The fix:** SEC-R3-1's step 5. A forged value above `Date.now() + 2 days`, or not a safe integer, is refused. `sec-r3-2.test.ts` then turns green. Optional and stricter: refuse unless `v <= Math.max(Date.now(), before) + env.changes.length + STAMP_SLACK`. Not needed for the harm.

---

### Older, not counted (marked "older")

- **A man's own read record is free-form.** `notices.seen` checks only that the row is his. Any id or number he puts there is read back by other people's devices: `nextStamp` (SEC-R3-1) and `readOf`. Beyond SEC-R3-1 this harms only his own reminder: a read of 1e300 for a day means that day never lights for him. Filed, so the database step's `NoticeSeen` rule can carry a shape (ids as strings, each reminder token a date and a safe whole number).

### Questions (no concrete failure)

- **Q1.** `SANS_UNDO_TOLD` and `SANSPLAN_REPLAY` treat "the same person" as `(entry.actor.personId ?? null) === (env.actor.personId ?? null)`. Two different accounts with no person both read as null. This only matters if a step recorded by one person-less account could be redone by another in the same session (the Undo list clears at sign-out). Same pattern as `verifiedReplay` (older). Should a person-less actor never count as the same person?
- **Q2.** The owed marks are worked out from the cause's changes against the world as it is when the projection runs, not as it was when the cause ran. Through the exported doors the cause can only be the command being delivered, so the two are moments apart. At the database step `causedBy` becomes a field the client sends, and the server must check that it names a command of the same session and the same actor, delivered just now, never any older planning still in the stream. Worth one line in `handover-dataverse.md`.

### What I checked and found sound

- **`causedBy` cannot be chosen through the exported doors.** `commit` never sets one, since a person's own command has none. `commitProjection` at rest has none, so the gate refuses with "no planning of his owes". Raised inside a running command, it joins that command's envelope and is judged as that command (a person's own), so "written only by the app" refuses it. Raised during delivery, it is queued with the delivering command's seq.
- **`planOwedBy`.** Only a person's own command owes marks, and only the posting's run (`lw.postoutRun`, system actor, projection origin) owes `gone`. A forged posting run that deletes nobody erases nothing (control). A restore owes no marks: its marks are replayed, `SANSPLAN_REPLAY`, image for image.
- **`sansPlanOwed`.** It marks only a SANS man of the squadron in view, newly on the day, from today, with nothing filed. It skips another squadron's man, so 149's admin cannot reach 142's men through his own schedule.
- **`SANS_UNDO_TOLD`, the delete branch.** It needs the line's id in that step's Undo list and his saved record unread. A line he has read can only be struck, never deleted. The put branch needs a new line (no before-image), naming a told line he has read, exactly `retractionOf` it, the only one for that line, and to the same man, name and day. Signature, date and the one-per-man-per-day count are still asked by the bell check around it.
- **`rememberUndoTold`** writes only in an Undo restore the timeline is applying (`restoreNow`, `dir === 'undo'`), and only the line `noticeSansBack` just pushed. `UNDO_TOLD` is a module `WeakMap` with no exported writer.
- **`sansBackEraseViolation`.** No posting change lets a SANS line go now. Only a verified replay or the Redo's own retraction does.
- **A "taken back" line hides what it names and ends nothing** (`dueBase`, `sansRetracted`). Only `SANS_UNDO_TOLD` or `restoreFollowUpOwed` can owe one. `sansBackCovered` refuses `back`, `again` and `ref` on every forward line.

### §3.1: round 2's findings, at the gate (my brief's part)

| Round-2 finding | Verdict | Why |
|---|---|---|
| RR-SEC-1 = Opus R4 (the mark vouched for by its label) | **CLOSED** | Both concrete cases are refused end to end: Ranger lighting Hex's read reminder, and Kestrel putting out a real one (builder's `sansplan-sec156` RR-SEC-1 block, and `sans-reads-156` R2-3, both test the exact cases). A subscriber of an unrelated command is refused (builder's test, and my control riding Ranger's own command). A mark not owed, riding a real planning, is refused (my controls). The value remainder is a new finding, SEC-R3-2. It is not RR-SEC-1 reopened: the spec I gave asked only for "greater than before". |
| Astra F1 = Opus R2 = Fable F2 (the Redo takes back its Undo's line): the gate side | **CLOSED at the gate** | `SANS_UNDO_TOLD` is the narrowest door that lets the retraction through: it is tied to the restore being applied, the same person, the step's own Undo list, unread to delete, the exact single retraction to strike. An ordinary command is refused (builder's R2-1 "the gate" test). Whether the bell then reads right (Undo / Redo / reload, another admin between) is §3.2's and not verified by me. |
| Astra F4 = Opus R5 (a man deleted by his posting's run takes his rows): the gate side | **CLOSED at the gate** | `planOwedBy` lets the run owe only `gone`. Builder's R2-5 passes. A forged run deleting nobody erases nothing (my control). |
| Astra F3 = Opus R1 = Fable F1 (the held weeks); Astra F2 (the hidden sentence); Fable Q5 | **Not judged here** | Not permission questions. Nothing in them widens a gate. |

### Tidiness note (D489, filed, not fixed)

1. **Duplicated:**
   - The planning mark's key pattern is written twice: `SANSPLAN_ID` in `perms.ts` and `PLAN_KEY` in `sansunfiled.ts`.
   - "A line a 'taken back' names" is written three times: `retracted` in `sansunfiled.ts`, `sansRetracted` in `notices.ts`, and inline in `setSansUndoTold`'s "one taken back a line" filter.
   - The valid-stamp test is written separately in `planOf` and the gate. SEC-R3-1's fix should make it one exported `okStamp`, or the two will drift again.
2. **Harder to follow than needed:** `setSansPlanReplay` still re-implements `verifiedReplay` (round 2's tidiness 1). It is unchanged.
3. **Left doing nothing:** in `sansPlanViolation`, the shape check's "a man unknown" test applies only to puts (`v != null && !PEOPLE[...]`). Every put must now also be in `owed.put`, which is built only from men in `PEOPLE`, so that test can no longer refuse anything the owed check would let through.

**2 findings (SEC-R3-1, SEC-R3-2), 1 older note, 2 questions. Fix SEC-R3-1 first:** a member reaches it with his own allowed write, and it silences other men. Its step 5 closes SEC-R3-2 in the same change.
