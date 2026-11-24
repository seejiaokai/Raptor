**Fresh, blind Opus read of the SANS words build (copy at `0eaacc411`). I found 4 faults and have 3 questions. I would fix F1 first.**

I read `ROUND.diff` and the whole files it touches: `sansunfiled.ts`, the changed parts of `sync.ts`, `notices.ts`, `noticeseen.ts`, `quals-write.ts`, `people-settings-commit.ts` and `inputedit.tsx`, plus the SANS parts of `perms.ts`, the command layer and the undo timeline. I changed nothing in the copy.

**Failing tests:** `D:\raptor-work\c156-read-opus\opus-read.test.ts`, run with `D:\raptor-work\c156-read-opus\vitest.opus.config.mjs`. It uses the same fixture as `sans-words-156.test.tsx`. The copy's own config cannot run any test: its `tsconfig.json` points to a `tsconfig.node.json` that is not in the export, and the transform stops on it. My config switches the tsconfig off; with it the copy's own `sans-words-156` passes 77/77 as a control. My file: **7 tests fail, 1 control passes.**

---

### F1 — a change line that did not end his SANS lights a reminder he had already read (rule 2a broken)
- **Where:** `leavewar/sansunfiled.ts` `dueBase`, which counts every stored `sansback` line except `later`/`earlier`.
- **Case A:** Saber ticks Hex SANS on Quals today (Wed 15) and posts him out as SANS from Fri 17. Hex is planned Sat 18 and reads his reminder. Saber presses "Undo post out".
  - Hex is still SANS by his tick and nothing new was planned.
  - His reminder comes back unread.
  - Its id went from `sansdue:rocky~2026-07-15,2026-07-16,2026-07-18.1` to `sansdue:rocky:1~…`, a base he never read.
- **Case B:** Hex is ticked and posted from Fri 17, files Thu 16 (a day only the tick covers), and reads. Saber unticks him. The "You're no longer SANS." line is rightly written for Thu 16. But his reminder for Sat 18, which still stands under the posting, lights again.
- **Cause:** the base is meant to change only when his SANS ended ("the same posting made again is news"). It counts any `undone`, `other` or `untick` line, even where he stays SANS (by his tick, or by a posting that stands).
- **Fix:**
  - The writer (`sansTakeBack`) stores a flag, e.g. `ended: true`, only when after the change he has no SANS day from today: `!sansFiler(p)` and no `sansOnP` from today.
  - `dueBase` counts only flagged lines.
  - `sansBackCovered` requires the flag to equal the same computation.
- **Tests:** both are in my file, under "OPUS-156 F1".

### F2 — tapping another line, or "Mark all read", while the reminder is gone forgets that he read it (reading 1 broken)
- **Where:** `state/noticeseen.ts`, `markNoticeRead` and `markAllNoticesRead`.
- **Case:** Hex is posted from Fri 17, planned Sat 18, and reads the reminder. Saber files Sat 18 for him, so the reminder goes, and Hex gets a filing line. Hex taps that line, or presses "Mark all read". Saber then deletes the filing. The reminder comes back unread.
  - The reading says "a filing deleted brings back a day he already read: dark".
- **Cause:** `markNoticeRead` keeps an old `sansdue:` id only while a reminder of that base is live. `markAllNoticesRead` keeps only ids still in `allNoticesFor`. With the reminder gone, both drop it. I confirmed this: his read list was `["sansdue:rocky~2026-07-18"]` before, empty after.
- **Fix:** never drop his `sansdue:<pid>…` ids in either function. Better, fold them into one id per base holding each day's highest count, so they stay small.
- **Test sketch:**
  ```
  plan(SATI); posted(); hexReads(); commitNewInput(draft(SAT));
  signInAs('hex'); markNoticeRead(<his filing line>); signInAs('ad','a');
  removeInput(mine()[0]); expect(dueUnread()).toBe(0)   // gets 1
  ```

### F3 — a posting command can take away an owed SANS line, though no command now takes one away (permission gate)
- **Where:** `state/perms.ts` `sansBackEraseViolation`. It lets any delete of a `sansback` line through when the same command changes that man's `lw.postouts` record.
- **Case:** Saber unticks Hex, which owes "You're no longer SANS." for Thu 16. A hand-built `lw.postout` command moves Hex's posting to Sat 18 and splices that line out of the bell. The command stands.
- **Cause:** after D2391 no writer deletes a stored SANS line. `retractPostingLines` only removes posting lines and the reminder, which is worked out and never stored. Replaced lines are hidden by `over`, not deleted. So the exception is a door nothing legitimate uses.
- **Limits:** this is an admin of the man's own squadron. A member is refused, and another squadron's admin is refused by the owner check.
- **Fix:** drop the `lw.postouts` exception, so only a verified Undo/Redo replay may delete a `sansback` line.

### F4 — the new `sansplan:` count is written raw, judged by nothing, from any device
- **Where:** `state/people-settings-commit.ts`, the settings write hook (around line 397). A key that is not in `SETTINGS_KEYS`, written outside a command, is written raw. `sansplan:` has no guard; `noticeseen:` has one for exactly this (SEC2-2 (a)).
- **Case:** Hex reads his reminder. Saber, or Hex himself signed in as a member, runs a bare `store.set('sansplan:rocky:2026-07-18', 99)`. It is saved, and his read reminder lights with nothing newly planned.
  - Because the key is shared across squadrons, any squadron's admin can light any man's bell this way. That goes against D2194 and the brief's §3.2 ("every write goes through the app's command layer").
  - The command door itself holds: a user-built `sans.planned` command is refused (my control test passes).
- **Fix:** add `if (!isCommitting() && k.startsWith('sansplan:')) throw …` beside the read-record guard. In `ownershipChecks`, let a `sansplan:` change pass only for the system actor's `sans.planned`, or a verified replay. The count is folded into the admin's planning step and its Undo writes it back as the admin.

---

### Questions (no concrete failure shown)
- **Q1:** a week created or copied with him already on it writes its days with no before-image. `wireSansBackBefore`'s counter skips such changes (`!c.before`), so a man planned that way never lights a reminder he had read. Is a new week "newly planned"?
- **Q2:** `sansBackCovered` accepts a SANS line with no `how` (`p.how !== undefined && …`). An admin's command could then write the older, title-less form for an owed change. Should the gate require `p.how === o.how`?
- **Q3 (speed):**
  - `onPipelineBegin` runs at the start of every command. It walks every posting and the roster, makes one pass over every input, and scans every bell line once per SANS man (`dueBase`).
  - `sansUnfiledLines` is not cached. On each bell draw it reads the count once per day, and when lit it lists every stored key (`store.keys`).
  - It cannot loop: the count's own commit is filtered out by its origin.
  - The `sansplan:` rows are never pruned: past days and deleted men's rows stay. They grow with planning, not without end.

### Smaller notes
- Undo and Redo of a planning step do take the count back and put it back: it is folded into the step (1 → none → 1 in my probe). The code comment "an Undo or a Redo counts nothing" is wrong in wording only; the behaviour fits the rule.
- The sequences I checked and found holding: the change lines A–E, untick then Undo (taken back) then Redo (told again), several changes before he reads, the date arriving, a man both ticked and posted with his untick and nothing hidden, the cut run across a month end, and a shared offer refused whole.

### Tidiness (D489, filed, not fixed)
1. **Duplicated:**
   - The ISO-date pattern is written again in `sansunfiled.ts`, `notices.ts`, `perms.ts` and twice inline in `inputedit.tsx`.
   - `loose`/`LooseRec` in `sansunfiled.ts` duplicates `looseRec` in `sync.ts`.
   - `postingHow` (the writer) and `howOfAfter` (the gate) mirror each other.
2. **Harder to follow than it needs to be:**
   - The reminder's read state is encoded in its id (base `~` day.count list, parsed back by `readOf`).
   - There are two different "read" tests: `lit` in `sansUnfiledLines` and `dueRead`.
   - Reading 3's over/kept/carried bookkeeping spreads across three files, and `sansBackLeft` depends on a probe installed at wiring time.
3. **Left doing nothing:**
   - `unfiledNow` sets `const from = sansPostedFrom(pid)` and never uses it; `start` is only an alias for `today`.
   - The bell's "more" line (`bell-more-words` in `topbits.tsx`) is no longer filled by anything.
   - Stale comments: `sansunfiled.ts`'s header (lines 5–8, "nobody can file until it does"), the cache's "only the one man it concerns", and the "Undo counts nothing" comment above.

**4 findings (F1–F4) and 3 questions. Fix first: F1, then F2 (both relight a reminder he read, against the rule "a newly planned date only"); then F4, then F3.**
