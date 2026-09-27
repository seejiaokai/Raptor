Static review only, as requested. I changed nothing and ran no server, npm command, or test.

## Findings, ranked by severity

### 1. Medium — leaving one duplicate behind can hide a real busy warning

Files: [avail.ts:378](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-build-ef7d85/raptor-port/src/engine/avail.ts:378), [avail.ts:560](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-build-ef7d85/raptor-port/src/engine/avail.ts:560), [validate.ts:1741](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-build-ef7d85/raptor-port/src/engine/validate.ts:1741)

- Setup: Put the same person into two places on one programme row, which the current plant-then-warn behavior permits. Create an overlapping row elsewhere.
- Action: Drag only one copy to the overlapping row.
- Screen shows: The hover can omit “already on [source row]” because the whole source row is excluded. In the six-day calculation, two placements collapsed into one event can also make the source day look empty.
- It should show: The source-row conflict, because another copy remains there. Rest-day calculation must likewise retain that occupied day.
- Origin: **New with this branch.** `git show main:raptor-port/src/engine/avail.ts` excludes the destination row only; this branch added the source-row exclusion. Main’s cross-day code also did not use the new `seatRow` “sole event” comparison.

Fix:

1. Add a helper that expands the source row with `rowPlaces()` and checks whether the person occupies any place other than the exact `fromKey`.
2. Exclude the source row only when that check is false.
3. In `crossDayIfPlaced`, declare the source event “sole” only when no other source-row place contains the person.
4. Keep flying-seat handling exact-seat based.
5. Add cases for programme duplicates, sim front+pax, desk primary+extra, ground primary+extra, and a six-day-to-seven-day move. Assert that hover and post-drop warnings agree.

### 2. Medium — the background guard accepts moves that occur after npm, or are later undone

Files: [bg-cwd-guard.mjs:31](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-build-ef7d85/.claude/hooks/bg-cwd-guard.mjs:31), [bg-cwd-guard.mjs:43](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-build-ef7d85/.claude/hooks/bg-cwd-guard.mjs:43)

- Setup: Start outside `raptor-port`.
- Action: Submit `npm test; cd raptor-port`, or `cd raptor-port; cd ..; npm test`, as a background command.
- Screen shows: The guard allows it, then npm runs from the wrong folder and fails or resolves the wrong package.
- It should show: The guard refusal explaining that every npm invocation must execute inside `raptor-port`.
- Origin: **Already on main.** `git show main:.claude/hooks/bg-cwd-guard.mjs` has the same unordered `MOVES_IN.some(...)` decision. The branch changes matching boundaries but not execution order.

Fix:

1. Examine each npm invocation separately.
2. Process preceding directory-changing segments in order, tracking `cd`, `Set-Location`, `Push-Location`, and `Pop-Location`.
3. Allow npm only if the effective directory at that point is inside `raptor-port`, or that invocation has a valid `--prefix`.
4. Refuse commands whose shell flow cannot be determined safely.
5. Add the two examples above plus PowerShell push/pop and multiple-npm regression cases.

### 3. Low — a valid start folder below `raptor-port` is refused

File: [bg-cwd-guard.mjs:46](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-build-ef7d85/.claude/hooks/bg-cwd-guard.mjs:46)

- Setup: Start the chat in `raptor-port\scripts`.
- Action: Run bare background `npm run docsize`.
- Screen shows: The guard refuses it because only the exact basename `raptor-port` is accepted.
- It should show: The command proceeding; npm walks upward to `raptor-port/package.json`.
- Origin: **Already on main**, where all bare background npm commands were refused. This branch adds an exact-folder exception but still misses descendants.

Fix:

1. Resolve and normalize `startDir`, including separators, case, and trailing separators.
2. Walk its ancestors and accept when a path component is exactly `raptor-port`.
3. Do not accept lookalikes such as `raptor-port-old`.
4. Add Windows, POSIX, mixed-case, trailing-separator, descendant, and sibling tests.

### 4. Low — the new “every flag ring” test ignores three flag-ring rules

Files: [flagglow-css.test.ts:27](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-build-ef7d85/raptor-port/src/ui/flagglow-css.test.ts:27), [scheduler.css:1340](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-build-ef7d85/raptor-port/src/ui/scheduler.css:1340)

- Setup: A puck has `.warn`, `.warn.hard`, or `.warn.note`.
- Action: A later edit adds blur to one of those three ring shadows.
- Screen shows: The puck glows, while the named regression test remains green.
- It should show: A plain ring, and the test should fail on the regression.
- Origin: **New with this branch.** Main has no `flagglow-css.test.ts`; the branch’s regex only selects `boxred`, `boxdash`, and `boxdot`.

Fix:

1. Include `.puck.warn`, `.puck.warn.hard`, and `.puck.warn.note`.
2. Assert an explicit expected selector inventory so an omitted family fails.
3. Add a mutation-style case for each family that inserts blur and proves the assertion breaks.

## Explicit negatives

- **Area 0:** Apart from finding 1, I found no post-write caller missing `lastFilled`; pre-write callers correctly retain `+`, and `rowPlaces` covers programme, sim, desk, and ground multi-place rows.
- **Area 1:** I found no additional unsafe raw-key comparison in pending/change, OIL selection, history, or request handling.
- **Area 2:** I found no missed week reader or writer. Landing, warning reveal, left-arrow inset, Sunday jump, and resize helpers use the shared inset path.
- **Area 3:** I found no reset-order defect. The admin gate, undo, persisted empty order, war switching, Rearrange/SANS, and filtered Matrix ordering are consistent.
- **Area 4:** Current solid, dashed, amber, thin-red, and gray CSS rings contain no blur. The older purple masking behavior is unchanged from main and already dispositioned.
- **Area 5:** Other than findings 2 and 3, the inspected Windows/PowerShell spelling, case, trailing-separator, and lookalike-folder boundaries were sound.
- **Area 6:** Apart from finding 4 and the missing guard cases above, I found no clearly vacuous new regression test. I did not treat demo old data or disposed sheet items A5/A6 as findings.

