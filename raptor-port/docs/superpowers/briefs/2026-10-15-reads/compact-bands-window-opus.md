# Fresh, blind read — `[COMPACT-BANDS-WINDOW]` (D878), commit 6ebaf1870

Reader: a fresh Opus read that did not write the change. I read every hook file in full as it stands now
(`compact-lib`, `-guard`, `-watch`, `-ready`, `-resume`, `statusline`), the test file, the design note's last two sections,
the overnight guide's "Compact smartly" bullet, `.claude/settings.json`, the main folder's settings, and his user settings.
I ran the tests: 16 of 16 pass. A small script checked `decide()` against the real `WINDOW` (880,000). Holds from 661,000
up to 899,700; lets through at 659,000, at 900,000 and at 901,000; at 700,000 lets through once at least 201,000 tokens
of new output have come in.

## Answers to the brief's questions

1. **Later or less safe? No.** The backstop is still the absolute 900,000 tokens. The percentage form,
   `NEVER_HOLD_AT = 900000 / WINDOW`, compares the same token count whatever room is read. A room read too small or too
   large moves the notes and the floor, but never the backstop. Rounding to tenths lets a compaction through a few
   hundred tokens early, which is the safe side. A smaller model (200k) stays below the floor, so it is never held.
   The app's own attempt (about 845,000) is held in the same 845,000–900,000 span as before, so nothing comes later than
   it did. The large-tail estimate (`pctNow`) works as before. The second attempt on the same request is always let
   through, which covers the case where the tail is underestimated.
2. **The room read is right.** Local, then the project's shared settings, then the user's settings: that is the order
   the app uses for these three. Managed settings and a `--settings` flag are not read, and neither is in use here. The
   main folder and this worktree both set 880,000, and his user settings set nothing. An unparseable file is skipped to
   the next one. The app also ignores an invalid settings file, which is an assumption I did not test, so the two agree.
   Reading the settings beside the hook file is the right anchor. The app takes its settings and its hooks from the same
   folder (`[MAIN-CHECKOUT-STALE]`), so the two cannot disagree. Reading once when each hook starts is fine, because
   every hook is a fresh process.
   One small edge: the code skips a value outside 10,000–1,000,000, where the app may clamp it instead. No such value is
   set on this PC, so it is not a finding.
3. **The status line:** whether the app's `used_percentage` counts against 880,000 or against 1,000,000 cannot be seen
   from here. The design note's "so it agrees with the app's own figure" is an assumption. He sees no status line today
   (check (b)), so it is not a finding.
4. **Tests:** none passes for the wrong reason. Test 14 pins this PC's real settings file on purpose. The spawned hooks
   clear `CLAUDE_CONTEXT_WINDOW` and read this checkout's settings, which are the ones the test assumes. One test has a
   side effect from before this change: finding 5.
5. **Words:** findings 2–4.

## Findings

**1. SHOULD — the guard now holds automatic compactions that are not the app's ordinary one (660,000–845,000).**
- *Failure:* the app's ordinary automatic compaction comes only at 96% of 880,000 (about 845,000, check (a)). So any
  automatic compaction asked for between 660,000 and 845,000 is something else. The first read's finding 5 named one:
  the compaction of an idle chat. Its fix was the floor ("covered by 1's floor"). This change lowers that floor from
  800,000 to 660,000, so the span where such a compaction is held grows from about 45,000 tokens to about 185,000.
- *When one is held* at, say, 700,000:
  - the whole chat is sent uncompacted, which is the cost finding 5 named;
  - the guard sets "waiting", so the next tool use tells the agent "A compaction is waiting… at the next clean point
    commit, push, rewrite the block, then mark ready". The agent stops to checkpoint and marks ready, but the app does
    not try again until about 845,000. The 10-minute mark lapses unused. The note was wrong, and it cost a checkpoint
    in the middle of a step.
- *Cause:* `compact-lib.mjs` sets `HOLD_FROM = BANDS[0]` (75). Holding from 75% does not help the guard catch the app's
  ordinary attempt, because there is no ordinary attempt below 96%.
- *Fix:*
  - In `compact-lib.mjs`, set `HOLD_FROM` to a point just below the app's own attempt, for example
    `BANDS[BANDS.length - 1]` (90% of the room = 792,000). That keeps "nothing is held before the agent has been told",
    because the first note at 75% still comes first.
  - In the test file:
    - line 176: change `HOLD_FROM === BANDS[0]` to `HOLD_FROM >= BANDS[0] && HOLD_FROM < 96`;
    - add one case: an automatic compaction at 700,000 is let through.
  - Lines 53 and 66 follow the constant and need no change.
  - Change the words to match: the guard's header (lines 13–15), the `HOLD_FROM` comment, the design note's "the guard
    holds … from that first note", and the settings description's "from that first note".
- *For him:* this narrows the reading he was told ("the guard's window from there to the compaction point"). The host
  should say so. The notes stay at 75%. Only the start of the window where a compaction is held moves.

**2. LOW — three places still give the compaction point as "about 85%", while the notes now say "about 96%".**
- *Failure:* the agent can be given two different figures for the same moment:
  - `compact-ready.mjs --away` prints "the app compacts at about 85% by itself" during an /overnight run;
  - the guard's header (lines 2–3 and 22) says "about 85%";
  - the watch hook's header (line 9) says "wherever 85% is crossed";
  - the notes now say "it compacts by itself at about 96%", and in the notes' own count, 85% is a note band (748,000),
    not the compaction.
- *Cause:* these lines count against 1,000,000 and were not updated.
- *Fix:* write "about 845,000 tokens (96% of the app's 880,000 room)" in `compact-ready.mjs` line 18 and in
  `compact-guard.mjs` lines 2–3 and 22. In `compact-watch.mjs` line 9, write "not wherever the app's own point is
  crossed later".

**3. LOW — the overnight guide's own paragraph still starts the clean-point hunt "from about 80% full".**
- *Failure:* `.claude/skills/overnight/SKILL.md` line 104 says "from about 80% full the agent chooses the moment
  itself". The same paragraph, and the bullet under it, now say the note comes at 75% of the app's room and that the
  agent acts from that note. An agent reading 80% as the hooks' figure would wait from 660,000 to 704,000, against what
  the note tells it.
- *Cause:* only two of the three lines in that bullet that name 80% were changed.
- *Fix:* line 104 should read "from the first note (75% of the app's room — D878; D868's 'about 80%')". This is a
  working-guide line (D70), so it goes with the other two.

**4. LOW — the note says "it compacts by itself at about 96%" even when no room setting was found.**
- *Failure:* if `autoCompactWindow` is missing or unreadable, the room falls back to 1,000,000. The note would then say
  "of the app's 1000k; it compacts by itself at about 96%". Nobody has measured the app's point without the setting, so
  that sentence may be false. This does not happen in this checkout.
- *Cause:* `compact-watch.mjs` line 24 hard-codes the clause.
- *Fix:* export from `compact-lib.mjs` whether the room came from a setting, and add the "of the app's Nk… 96%" clause
  only when it did.

**5. LOW (from before this change, outside the diff) — running the test file can switch the guard back on during an
/overnight run.**
- *Failure:* the away test runs `compact-ready.mjs --back` in its `finally`, from the test runner's folder, and that
  clears the REAL away mark of that checkout. The spawned guards are given `cwd: dir`, which is not a git folder, so they
  fall back to the runner's own checkout. If an overnight agent runs `node --test .claude/hooks/compact-hooks.test.mjs`
  in its own worktree, its away mark is gone and the guard holds again at night — the case D872 forbids.
- *Cause:* the tests use the real git folder for the marks.
- *Fix:* `git init` a throwaway folder in the temp dir. Spawn `compact-ready.mjs` with `cwd` set to it, and pass that
  folder as `cwd` to every spawned guard, so the marks never touch a real checkout.

## Verdict

Safe to switch on as is: **yes**, because no path makes a compaction later or less safe. The 900,000-token backstop and
the second-attempt rule are unchanged, and the room read matches the app. Finding 1 is about wasted cost and a false
"waiting" note, not about safety, and is worth fixing before or soon after he approves.
