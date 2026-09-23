# HANDOFF — 23 Sep 26. PR #428 is OPEN and NOT merged (D152): the next chat fixes the Leave War bugs ON ITS BRANCH, then everything merges together.

**Pick `claude/lw-monthjump-phone` in the new-chat picker — NOT `main`.** Before acting: `git fetch`, and
check PR #428's state (open when this was written) — this file describes the world when it was written.

## Where it started

He asked for the three Leave War browser tests filed as `[LW-MONTHJUMP-PHONE]` to be made robust on a slow
machine — test-only, waiting on what each needs, not a fixed time (**D87**) — with red-before / green-after
proof. Two were slow-machine timeouts and are fixed. The third (the phone month-jump test) turned out to be
catching an APP bug that shows on FAST machines, so it was left unchanged and filed. Along the way GitHub's
slowness was traced to the private repo's 2-core machines, and the checks were moved onto his own PC (**D89**).

## Shipped — on the branch, NOT merged

- The two desktop scenarios in `raptor-port/e2e/step4-leavewar.spec.ts` wait on conditions, not pauses;
  the reload one reads each person's figures from one sheet opening. Proof tables:
  `raptor-port/docs/handpass/2026-09-23-lw-monthjump.md` §3–§4 (whole browser suite unchanged, 461/0).
- An opt-in slow-browser switch, `E2E_CPU_THROTTLE=<n>` (`raptor-port/e2e/app.ts`).
- The checks run on HIS PC by default: the `pc` job in `.github/workflows/deploy.yml` (a self-hosted Windows
  runner, "JK"), GitHub's machines when the repo variable `CI_ON_GITHUB` is `true`. After Astra's second read:
  the PC runs only HIS OWN changes in a PRIVATE repo (anything else goes to GitHub), least-privilege token,
  no persisted checkout credential, pinned `PORT_URL`/`APP_URL`, a line-ending step that stops on any error.
- The Leave War scrubber test waits out the app's own 250ms drag window (`raptor-port/e2e/leavewar.spec.ts`).
- PR #428 — open when written. Its last GitHub run (on the variable, GitHub's machines): see Gates.

## Unfinished — the next chat's job, in this order

1. **Fix `[LW-MONTHJUMP-PHONE]`** (app, bug-check order WALK tier, phone): the spec is in `OUTSTANDING.md`
   (Astra's, matching the builder's); the evidence and both pictures are the evidence sheet §5. Then make
   the phone test measure only once the grid has held still past the rest window — drop its first-success
   poll, which can pass on a sample taken before the shift.
2. **Fix `[LW-HBAR-RESYNC]`** (his word, D150): one trailing `syncHbar` when the 250ms drag window closes.
3. **Delete the repo variable `CI_ON_GITHUB`** (set 23 Sep 26 only because the phone test is red on his fast
   PC until step 1), push ONCE, and see `all gates (your PC)` go green. Never push while a run is going (D151).
4. **The runner as a Windows service, under a RESTRICTED account** (Astra SEC-002 — never Administrator):
   GitHub → Settings → Actions → Runners → JK → Remove (he runs the removal command it shows, in
   `C:\actions-runner`), then add it again from "New self-hosted runner", answering **Y** to "run as service"
   and giving a non-admin account (NETWORK SERVICE at least; a dedicated standard user is better). He was
   asked to close the Administrator window that was running it by hand.
5. **An independent read before "merge live"**: Astra's round-2 fixes (the guard, permissions, pinned URLs,
   exit codes, the Pages note) have NOT been re-inspected — hand them to the reader with the Leave War fix.
6. If the checks must ever run on GitHub's machines again: try the ±1px tolerance in `gridAtRest` first.
7. Merge on his "merge live". `[HUMAN-RETEST]` (D85/D86) comes after — he confirmed Leave War first.

## Gates

- Last full LOCAL run on this branch (before the CI move): `npm test` 5760/5760 · build OK · `tfin.js` 728/0 ·
  `test:e2e` 461 passed / 45 skipped / 0 failed · `smoke:tracker` 425/0 · rulecheck OK · docsize OK.
- On his PC (trial 3, `570dd471`): every gate ran; the only red was the phone month test — the app bug.
- On GitHub (private, 2-core, `416751d4`): RED — the LL scenario timed out twice, the reload one once (inside
  `gridAtRest`, passed on retry), and the untouched flash test failed twice. The step4 waits are NOT yet robust
  on GitHub's private machine; candidate fix: let `gridAtRest` tolerate ±1px (evidence sheet, end of §7).
- `probes:adapted` / `perf`: not run (no UI change on this branch).

## Open questions

- Public repo vs his PC as the runner: recommended staying private on his PC (private, free, ~14 min a green
  run vs ~9 on public GitHub, ~20 on private GitHub); he has not decided. If it ever goes public, remove
  the runner from the repo first — the guard already sends public runs to GitHub's machines.

## Rulings this session

D87 (wait on what a test needs) · D88 (go public — reversed by D89) · D89 (checks on his PC) · D150 (Leave
War first, including the scrollbar item) · D151 (never push while a PR's checks run) · D152 (don't merge yet;
fix, then merge together). D150–D152 sit above D86's D120+ start; a clash is settled by D78.

## Pick up here

Fix `[LW-MONTHJUMP-PHONE]` on `claude/lw-monthjump-phone`, bug-check order first.
