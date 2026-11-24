# Security re-read: chat 156, fix round 2 (copy at f73602f9f)

**Scope.** BRIEF.md §3 item 3 first, then §3 item 1 for round 1's security items and Astra's #1 and #3. I read these in
full or in the parts that matter:
- `state/perms.ts`: `sansPlanViolation`, `sansBackEraseViolation`, the restore and follow-up doors in `adminOwnerViolation`, `ownershipChecks`, and the member section's settings case;
- `leavewar/sansunfiled.ts`: the whole of `wireSansBackBefore` (`setSansPlanReplay`, the begin hook, the marking projection), plus `sansTakeBack`, `sansUntickOwed` and `sansBackCovered`;
- `undo/timeline.ts`: `applyingRestore`, `verifiedReplay`, `applyRestore` and `restoreCommit` (where `APPLYING` is set and cleared);
- `command/commit.ts`: `dispatch`, `runPipeline`, `onPipelineBegin`, `commitProjection`, `commitAs` and `isCommitting`, plus the command index's exports;
- `state/people-settings-commit.ts`: the write hook;
- `engine/hooks.ts`: `store` and `storedKey`;
- `state/noticeseen.ts`;
- `leavewar/sync.ts`: `followUpsOwed`, `warLinesOwed`, `warLineCovered`, `warNoticesReversed`, `retractPostingLines` and the probe wiring;
- every caller of `onPipelineBegin`.

**How I ran the proofs.** The tests are in `D:/raptor-work/c156-reread-sec/sec-reread.test.ts`, with the config
`vitest.sec.config.ts` beside it. The config uses the Leave War setup and TZ Pacific/Midway. A junction links in the copy's
`node_modules`. Nothing in the copy was changed. The command was
`cd D:/raptor-work/c156-read2/raptor-port && npx vitest run --config D:/raptor-work/c156-reread-sec/vitest.sec.config.ts ../../c156-reread-sec/sec-reread.test.ts`.
The result was 11 tests: the 2 HOLE tests fail, as they should against the copy, and all 9 others pass. Those 9 are 4 controls, 1 test
showing the hole's effect, and 4 that show older behaviour. The builder's own
`src/leavewar/sansplan-sec156.test.ts` also passes under the same config (7/7).

**The core question, answered.**
- **Through the app's screens and its ordinary or hand-built commands: no.** Nobody can write or erase another man's planning mark,
  pass as an Undo or Redo the war vouches for, or take his SANS change line away. The restore door checks every
  condition it needs: the restore the timeline is applying now, the same person's step, and that step's own row with its own value. My
  controls could not get past it.
- **From the browser console, calling the app's exported functions** (the reach round 1's SEC156-2 assumed): **yes.** The
  gate takes the command's label as proof that the app wrote the mark. That is RR-SEC-1, below.

---

### RR-SEC-1: the planning mark is vouched for by its label alone, so any code on the page can write or erase it for any man

- **Where:**
  - `state/perms.ts sansPlanViolation`. Outside a restore, it passes any change to `settings/sansplan:*` whose envelope says
    actor `system`, type `sans.planned`, origin `projection`.
  - `command/commit.ts commitProjection`, exported from the command index. It hands exactly that actor and origin to any
    command its caller builds, with any type.
- **The concrete case (msq world, Wed 15 Jul 26):**
  1. Saber posts Hex (`rocky`, 142's) out as SANS from Fri 17 Jul and plans him on Sat 18. Hex reads his reminder.
  2. Signed in as Ranger (142's member), the console calls
     `commitProjection({ type: 'sans.planned', scope: { module: 'settings' }, apply: t => { t.enlist(settingsStore); store.set('sansplan:rocky:2026-07-18', Date.now() + 1e9) } })`.
     It returns `ok: true`, the row is saved, and Hex's bell lights again with nothing newly planned.
  3. Later, Saber really does put Hex on Sun 19, and Hex's bell lights (D2394 2a). Kestrel (149's admin) makes the same call
     with `store.set('sansplan:rocky:2026-07-19', null)`. It returns `ok: true`, and Hex's bell goes dark.
  4. The same delete form can erase every mark a man has, past or future, through the "a day gone by / a man deleted"
     branch of the shape check. That branch checks neither that the day is past nor that the man is gone.
- **What goes wrong for him:**
  - Any signed-in person can show Hex a "planned, nothing filed" reminder he does not owe, or put out one the rules say he does
    owe. That includes a member, and another squadron's admin, since the row names no squadron.
  - These are exactly SEC156-1's and SEC156-2's harms, reached through a third door.
  - The forged mark is also what `nextStamp` builds on. A huge stamp written today means every real planning after it
    writes a stamp above it. The reminder still works, but the stamps no longer say when the planning was made.
- **Cause:**
  - The fix answered Astra #1 by trusting the envelope's actor, type and origin. Astra #1's own fix said not to:
    "A command name or system actor alone must not authorize arbitrary counters."
  - Its claim in FINDINGS.md item 1 ("refused unless the app's own `sans.planned` projection … writes it") is not what the
    gate checks. It checks the label, and the label is free to anyone who can call `commitProjection`.
  - The code base learned this lesson before for the bell (fix read 7, fault S: "a command's type is only a label"). The bell
    lines were then tied to the change that owes them (warMade, then `WAR_OWED`).
- **The system-actor door itself is older and app-wide** (round 1's Q2). The same call writes Hex's read record (`noticeseen:rocky`).
  My "older" test shows that passing. So this round did not widen the door. But the new gate rests on it as its only test, and the
  claimed fix does not hold at the reach this round set out to close.
- **The fix — tie the mark to the planning that owes it, the way war lines are tied to `WAR_OWED`:**
  1. **`leavewar/sansunfiled.ts`:** move the reading half of the `onCommit` body into one exported function:
     `sansPlanOwed(changes, today): { put: Set<string>; owedMen: Set<string>; gone: Set<string> }`.
     - `put` holds the `planKey`s of the (man, day) pairs that a `days` change newly names him on, under exactly today's conditions:
       on or after today, `sansFiler`, `sansOnP`, his home in view, nothing filed.
     - `owedMen` holds the men with a `put`.
     - `gone` holds the men a `people` change deletes.
     - The callback then writes from that result, as it does today.
  2. **`state/perms.ts`:** add `let SANSPLAN_OWED: ((changes: readonly Change[], today: string) => { put: Set<string>; owedMen: Set<string>; gone: Set<string> }) | null`
     and `setSansPlanOwed(fn)`. `wireSansBackBefore` installs it beside `setSansPlanReplay`.
  3. **In `sansPlanViolation`, after the existing actor/type/origin test:**
     - Find the cause, `commandStream().find(e => e.seq === env.causedBy)` (`commandStream` is in the command index).
       Refuse unless the cause exists, its `origin === 'user'` and `SANSPLAN_OWED` is installed. Compute
       `o = SANSPLAN_OWED(cause.changes, todayIso())`.
     - For each `sansplan` change, parse `<pid>:<iso>` with `SANSPLAN_ID`.
       - **A removal** (a delete, or an `after` of null) passes only if `o.gone.has(pid)`, or if `o.owedMen.has(pid) && iso < today`.
       - **A put** passes only if `o.put.has(c.id)`, with a positive whole number greater than `typeof c.before === 'number' ? c.before : 0`.
     - Anything else: `a SANS planning mark no planning of his owes (<where>)`.
     - A `commitProjection` called from outside any command has no `causedBy`, so it is refused. One called from a
       subscriber of an unrelated command gets that command as its cause, which names nobody newly, so it is refused too.
  4. **Tests:** both RR-SEC-1 tests turn green. The builder's `sans-reads-156` block "1 — a day newly planned …" and
     `sansplan-sec156` stay green. Add a case where a subscriber of an unrelated command (Saber changing Logic) calls the
     door with the label and a put for Hex: refused.
  5. **`docs/data-model.md` §11, the `Setting` row:** "written only by the app, for a day a person's own change newly put him on".
- **Failing tests:** `sec-reread.test.ts`, the block "RR-SEC-1 (HOLE)", 2 cases (red). The block "RR-SEC-1, its effect shown"
  passes against the copy and shows what Hex sees in both directions.

---

### Older, reached by this row too: not counted, said so it can be weighed (marked "older")

1. **A write made while a command is being delivered, or at the very start of one, is saved raw and never judged.**
   - The write hook's guard is `!isCommitting()`. `isCommitting()` is also true during phases 8/9 (delivery) and in a
     start-of-command hook, which runs before the guard snapshot and before any store is enlisted. So a `store.set` made
     from an `onCommit` subscriber, or from an `onPipelineBegin` hook, goes straight to storage: no envelope carries it and no
     check sees it.
   - Two tests show it, both passing: one erases Saber's real mark on Sun 19 from a subscriber, the other writes 77 from a begin hook.
   - The read record's guard (`noticeseen:`) has the same gap.
   - This round's change to `onPipelineBegin` (restores may now ask for it) widens where such a hook runs, but adds no power.
     A hook could already do this in every person's own command.
   - Fix, filed: for the guarded prefixes (`sansplan:`, `noticeseen:` and the other "typed command only" rows), require
     `isInReducer()` and the settings store enlisted, not `isCommitting()`.
2. **His own squadron's admin can write a man's read record in any command.**
   - Saber's `account.update` command putting `noticeseen:rocky` with the reminder's id passes. Hex's lit reminder goes dark,
     though he read nothing.
   - §11 gives an admin only R on another person's `NoticeSeen`. The gate holds that only across squadrons
     (`adminOwnerViolation`). The member section holds it for members.
   - Shown by the test "older (the read record's rule …)", which passes.
   - This round now reads the saved record as the truth for the reminder and for the follow-ups (Astra #3), so the saved
     record is worth guarding by its owner. Fix, filed: refuse any change to `noticeseen:<pid>` unless
     `env.type === 'notices.seen'` and `pid === actor.personId`, for admins as for members, except a verified replay.
3. **A posting's "taken back" to an admin still trusts this device's memory of what he read.** `retractPostingLines` asks
   `hasRead`, not `hasReadSaved`, and `warLinesOwed` owes a `poback` for any change of the posting record, with no read
   check. This is Astra #3's shape for the posting lines, not the SANS lines. It is older, and this round did not touch it.

### Questions (no concrete failure)

- **Q1 (was round 1's Q1, sharper now):** a member holds R on every `Setting`. The mark is now a timestamp, so a member can read when, to the
  millisecond, each man was last newly put on each date. Should §11 name this row's readers as the man himself and admins?
- **Q2 (outside my brief: for the readers of §3.2, not verified):** W12-1's "said on the later line only" counts the hidden
  days of every later `sansback` line, `again` copies included, whether or not that line is shown. Suppose a Redo's `again`
  copy outlives the line it repeats, because a second Undo took that line away and the copy is no longer shown. It still
  silences the older line's sentence, so a day still hidden may be said on no line (D2341: "a hiding is never silent").

### What I checked and found sound

- **`setSansPlanReplay`** (this round's restore door for the mark). It vouches for a row only when all of these hold:
  - `applyingRestore` answers: the restore the timeline is applying right now, `undo.restore`, with `causedBy` equal to the step's seq.
    `APPLYING` is set only around `restoreCommit` and cleared in `finally`.
  - The step's actor is the same person.
  - The row is in the step's own list, and its value is the value the step recorded, the last image if written twice.

  My controls found no way past it:
  - a hand-built `undo.restore` envelope with no restore running: refused;
  - a restore raised through the internal `commitAs`, with any `causedBy`: refused;
  - during Saber's real Undo of his planning, a mark for another day, another man's mark, or his own row at another value: each refused;
  - the step's own row: passes.

  A queued commit drained during a restore runs with its own origin and cause, so it never matches.
- **`sansBackEraseViolation` without its posting exception.** No writer deletes a stored SANS line any more:
  `retractPostingLines` deletes only `po` lines, and the reminder is worked out, never stored. A person delete does not touch the bell.
  So nothing honest is refused, and a hand-built posting command can no longer take the line away. A rewrite is still
  `lineRewritten`'s, and a forged `again`/`ref` copy that would hide a line passes only as the follow-up a real restore owes.
- **The start-of-command hooks.** The change-history hook (`elogAdoptHeld`) takes no argument and keeps the default
  `['user']`, so it is unchanged. The SANS hook only reads, and for a non-people command it notes nothing. In a restore, the
  untick line it makes possible must still be owed by the restore's own people change (`sansUntickOwed`), match exactly
  (`sansBackCovered`, against the note taken as the restore began) and go to the actor's own squadron's man.
- **The SANS follow-ups read the saved record.** The follow-ups probe and the writer read the saved record (`readSaved`), and
  `sansTakeBack` reads it too (`seenSavedOf`). `seenOf` now returns a copy.
- **A unit-named key cannot alias the mark.** `u142@sansplan:…` is stored under its own name and read by no one, and the guard
  reads the plain name (`localOf`).

### Round 1's security items and Astra's #1 and #3

| Item | Verdict | Why |
|---|---|---|
| SEC156-1 (another squadron's admin writes the mark inside an ordinary command) | **CLOSED** | Kestrel's `account.update` is refused at the gate and end to end. The builder's test covers round 1's case exactly. |
| SEC156-2 (a bare `store.set` from the console, saved unjudged) | **CLOSED** for its case | A bare write outside every command throws. But the same person reaches the row from the console through `commitProjection` (RR-SEC-1), and through a raw write during delivery or a begin hook (older 1). |
| SEC156-3 (a hand-made posting command deletes his untick line) | **CLOSED** | Only the verified replay passes. Round 1's exact envelope is refused, and nothing honest needed the old door. |
| Astra #1 (the mark written without a genuine planning, for another person) | **CLOSED ONLY IN PART** | Raw writes and ordinary commands are refused. The gate still takes "system actor + label" as proof, which Astra's fix spec ruled out: RR-SEC-1, 2 red tests. |
| Astra #3 (a forged read in memory lets Undo tell another person) | **CLOSED** | The writer and the gate both read the saved record, and `seenOf` is a copy. The posting lines' own memory read is older (older 3), and his own admin can still rewrite his saved read record (older 2). |

### Tidiness note (D489, filed, not fixed)

1. **Duplicated:** `setSansPlanReplay` re-implements `verifiedReplay`: the same restore, the same person, the step's last
   image, compared. Putting `sansplan:` on `verifiedReplay`'s `settingsRow` list would let the gate ask the one `REPLAY`,
   and the new probe and its setter could go. That removes a chain from `perms.ts` to `sansunfiled.ts` to
   `undo/timeline.ts` for one row.
2. **Harder to follow than needed:**
   - `sansBackEraseViolation`'s refusal still reads "taken away by no change of his posting", but no posting change lets
     the line go now.
   - The begin hook stores `activeEnvelope()` though it is now handed `env`, which is the same object.
3. **Left doing nothing:** `sansPlanViolation`'s shape check passes a removal for any well-formed key. The only writer
   that removes rows is the projection, which RR-SEC-1's fix will judge by the day and the man, so the shape branch for
   removals then says less than the check beside it.

**1 finding (RR-SEC-1), 3 older notes, 2 questions. Fix RR-SEC-1 first:** tie each mark to the planning that owes it
(`SANSPLAN_OWED` from the cause envelope). Then older 2, the read record by its owner only, because this round made the saved
read record what the reminder and the follow-ups trust.
