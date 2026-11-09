# Astra's re-read of the fix round — commit d0372e62f (codex exec -m gpt-6-astra, reasoning high, read-only; brief: the combined fixes no reader had seen; saved word for word)

REVISE

1. **Main-checkout recipe — the destination branch is unchecked.**  
   Passage: `gates-and-deploy.md`, “then `switch main` if needed and `merge --ff-only origin/main`”.

   Constructed case: detached HEAD and local `main` both point to B; fetched `origin/topic` also holds B; `origin/main` points to B’s parent A. The folder is clean and unused. Every check passes, switching succeeds, and the merge reports “Already up to date”. Unmerged changes remain loaded, contradicting “on `main` and up to date”.

   **Replace that passage with:**
   > Before switching, require `git -C C:/Users/User/projects/Raptor merge-base --is-ancestor refs/heads/main refs/remotes/origin/main` to exit 0; otherwise leave the folder untouched and report what holds it. Then switch to `main` if needed and merge `origin/main` with `--ff-only`, using the same full-path prefix. Confirm `rev-parse HEAD` equals `rev-parse refs/remotes/origin/main` before calling the update complete.

2. **Handoff’s new-job fallback still leaves commits detached.**  
   Passage: session-handoff Step 1, “a new job runs `git worktree add --detach ../Raptor-<short> origin/main`”.

   The following new-job instruction only fetches and checks alignment; it never creates a branch. This retains A5’s detached-commit fault and contradicts D975’s requirement for the new job’s own branch.

   **Replace that command with:**
   > `git worktree add --no-track -b claude/<new-name> ../Raptor-<short> origin/main`

3. **The combined report exception misses sequential readers.**  
   Passage: overnight Part 2, “except a reader’s report while another reader of the same job is still reading”.

   When the first reader finishes before the second starts, that condition is false and the report enters the checkout. This contradicts §4’s “until every reader has reported”, including when the missing reader is started by the next sentence.

   **Replace the exception through its §4 reference with:**
   > except that each reader’s report and every copy or summary stay in a scratch folder outside the checkout until all required blind readers of that job have reported, including readers not yet started (the bug-check order §4).

4. **Two evidence-sheet instructions still contradict the repaired blindness rule.**  
   Passages: bug-check order §5, FULL table: “**both** models read the code, given the sheet and asked for absences”; “Order of steps in FULL”: “the two reads, *with the evidence sheet in their hands*”.

   Both still instruct giving the walk’s report to the fresh Opus reader, contrary to D790 and the repaired §4a.

   **Replace the first passage with:**
   > **both** models read the finished code and the same brief under §4’s blindness rules, and are asked for absences

   **Replace the second with:**
   > the two reads, given the finished code and the same brief under §4’s blindness rules