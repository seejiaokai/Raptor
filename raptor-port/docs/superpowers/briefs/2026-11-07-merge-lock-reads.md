# D1746 — the merge lock: the two fresh reads (7 Nov 26, the night's job 0)

Two fresh, blind Opus readers, one after the other, on branch `claude/merge-one-at-a-time`. Each read the change against
D78, D1742, D151, D1093, D1407 and D228. The first read the uncommitted diff; the second read the commits `b5ca930f2` and
`1883707c5`. Each report below is the reader's own, condensed only in layout.

## Read 1 — the first draft (before `1883707c5`)

1. **His words → the rule:** no finding; the "etc." reading (D228, D302) fair; no new duty.
2. **Shipping passages vs rules in force:**
   (a) the lock reads as covering only merges on his word: name D1407's merges and D1093's runs, and never `gh pr merge --auto`, which lands later, outside the lock. The `main` ruleset does not ask GitHub for an up-to-date branch, so the level check is the only guard.
   (b) D1742's one allowed push (bringing `main` in) was not recorded in its mark or in D1746's "narrows" sentence.
3. **Commands:**
   (a) a bare `release` deletes the CHECKS lock, even during another chat's full run: write the folder out;
   (b) `VAR=x cmd` is Bash-only: say "in the Bash tool, from the repo root";
   (c) `git fetch origin main` does not refresh `origin/<branch>`, and `--is-ancestor` prints nothing: `git fetch origin main <branch>`, plus `&& echo level || echo behind`;
   (d) the "level" test itself: no finding;
   (e) a hand-taken lock left behind blocks every chat for 2 hours: release it whatever happens.
4. **Other:** say whether his word stands after `main` is brought in (yes, unless that changed app code); let "confirm the live app" accept a later Production deployment whose commit holds the merge.

**Done in `1883707c5`:** every point.

## Read 2 — after the fixes (`1883707c5`)

1. **The fixes are in.** Two gaps remain:
   (a) "release whatever happened" includes a `take` stopped while still waiting, for example killed by the Bash tool's 2-minute default. `release` deletes the folder whoever holds it. Fix: run `take` with a 600000 timeout, and release only after it printed `gatelock: taken`.
   (b) "unless bringing main in changed the app's code" reads two ways: it should say "unless settling a clash changed this branch's own app code".
2. **D151:** when the branch is behind while its own run is still going, bringing `main` in is a push that cancels that run. Fix: "once no run of the branch is queued or in progress (D151)". D78, D1742, D1093, D1407, D228: none.
3. **D1747:** the one-line rule, its full row and D1717's mark agree. One leftover (D201): the plan's line about D1717's order needs "(for 7 Nov 26, narrowed by D1747 — §3)".
4. **Commands:** the `take` and `git fetch` commands are split across two lines of the file. Copied as they stand, Bash runs the script without the folder setting, so it takes the CHECKS lock instead (confirmed with a harmless `status`). Fix: each command whole on one line.

**Done in the next commit:** every point; chats 1 and 2 were sent the corrected steps by message the same night.
