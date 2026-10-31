# The code check runs by itself — [CODE-CHECK-CI] (31 Oct 26)

Branch `claude/code-check-ci-ada539`, cut level with `main` after pull request 604; pull request 605. His ruling D1539
(building D1536's answer to the M365 plan's point 4): React Doctor's "no new finding" check runs by itself — a GitHub check
on every pull request, and a run at the end of every working session that reports the count and blocks nothing; his
permission to change the project's hooks and settings for it, one fresh reader before it is switched on. Also recorded: D1540's
ruleset, read back. **Nothing in the app changed** (no file under `raptor-port/src`).
`Walk: not needed — no change a person can see in the app; the proofs are the live runs below (the GitHub check green and red, the hook on this checkout).`

## The tier (the bug-check order §5)

| Question | Answer, and why |
|---|---|
| 1 Money (OIL included) | No — no app code. |
| 2 The published record | No — no app code. |
| 3 Saved data | No — nothing the app stores; the hook keeps one small note in the checkout's own git folder, never in the project. |
| 4 A shared drawer | No — nothing drawn. |
| 5 A new gesture or mode | No — nothing on screen. |
| 6 A new surface | No. |
| 7 Roles | No — the job asks only to read the code; no repository setting was changed (D1540's was his, only read back). |
| 8 The warning list | No. |

**Tier: NONE for the app.** What a wrong build costs here is in the tooling: a check that passes when it should fail, one
that fails on old findings, or a hook that slows or stops a turn. So each part was run for real, red as well as green, and
the hook (and the job) were read by one fresh, blind Opus reader before the hook was switched on (D1539, D976's pattern).
**The walk, sized (§7.0):** the "running thing" is the check itself, so the walk is the check run where it will run — on
GitHub's machines on a real pull request, and the hook at the end of a turn on this checkout — not a walk of the app.

## The trap found before building

React Doctor 0.9.18 (read in its own code, 31 Oct 26): in its "changed" mode, when it cannot read `main`'s side — a
shallow copy with no shared starting point (GitHub's usual checkout), a base it cannot find — it lists every finding in the
changed files and switches its own pass/fail **off** ("gate exempt"): the run passes whatever the change holds. A job built
the obvious way would have been green forever. So `scripts/code-check.mjs` reads React Doctor's JSON report and is red
("could not compare") unless the report says it compared.

## The runs

| What | Result |
|---|---|
| The whole check, packages installed and not | 952 findings both ways, the same file:line list (`diff` empty) — so the job skips `npm ci` |
| The script by hand, nothing changed | "no new finding (0 changed files)", exit 0 |
| The script, an iframe with no sandbox planted in the Edit Schedule legend file | "1 new finding … `src/ui/TypeLegend.tsx:83` iframe missing sandbox attribute", exit 1; the file's two old findings not counted (matched 2) |
| The script, a base that does not exist | "could not compare … does not exist", exit 2 |
| The hook's tests (`node --test .claude/hooks/code-check-stop.test.mjs`) | 10 / 10; three rules broken on purpose — the fingerprint skip, the degraded mark, the "src only" trigger — each turns a test red (the degraded case first slipped through, a neighbouring rule catching it; a case added) |
| The hook live, this checkout | nothing under src changed: 0.3 s, silent · the planted fault: 16 s, `{"systemMessage": "Code check: 1 new finding … TypeLegend.tsx:83 …"}`, exit 0 · same code again: 0.7 s, silent · plant removed, a Git Bash `/c/…` folder given: silent, exit 0 |
| The GitHub job, pull request 605 (this work) | green, 49 s: "main taken as 3b73fa5" (main's tip — right), "no new finding (2 changed files read against origin/main)" |
| The GitHub job, scratch pull request 606 (605 + the planted iframe) | **red**, about 30 s of checking: "main taken as 3b73fa5", "1 new finding in 3 changed files … `src/ui/TypeLegend.tsx:83` iframe missing sandbox attribute", the mark on the line, exit 1. Then 606 closed, its branch `claude/code-check-scratch-plant` deleted (read back: gone), its other runs cancelled — the plant is on no branch |
| The ruleset (D1540), read back | "main: secrets scan" — active, the default branch, no bypass, requires `secrets scan` (GitHub Actions), blocks deletion and force-pushes |

## The read (one fresh, blind Opus reader — D1539, D790; before the hook was wired in)

Read the script, the job and the hook, and tested them for real outside the worktree: a scratch project on raptor-port's own
settings through the real React Doctor; the CI copy rebuilt exactly (a merge commit fetched blobless at depth 2 with the
same sparse patterns, main moved on after the branch point, a picture renamed and one added); the hook on `/c/…` and
`c:/…` folders. **No silent green, and no red on old findings:** `HEAD~1` is main's side; a missing base side is "could not
compare", exit 2; with the base prefetched and the remote then cut off (a private repo), right — 2 new, main's own change
not counted; the sparse copy reads the same as a full one; the token reaches only the git commands and is never printed;
the hook never holds a turn. Findings, all fixed in fix round 1 (commit "Code check fix round 1"), each red first:

| # | Finding | Fix |
|---|---|---|
| 1 | On Windows a run cut off at its time limit left React Doctor running (the timer stopped only the shell) — proved by the reader | the run is stopped as a whole tree (`taskkill /T`; a process group elsewhere), its pipes let go so a survivor never keeps anything waiting, and React Doctor told its own limit 15 s earlier; a test starts a program that starts its own long-lived child, cuts it off, and finds both gone — with the old stop put back, that test fails (and, before the pipes were let go, hung: the two survivors seen and stopped by hand) |
| 2 (low) | A change to React Doctor's settings or `package.json` / a tsconfig after a red count was not checked again | the fingerprint covers them |
| 3 (low) | The hook's line reaches him, not the agent, and named files and lines | plain words: "Code check: 1 new problem in the code this branch changes. The pull request's code check holds the change until it is fixed." (round 2's wording — the count covers the whole branch, not one session) |
| 4 (cosmetic) | React Doctor's error shown as raw data; `:` and `,` unescaped in GitHub's marks | its message alone; escaped |
| 5 (later) | A path filter skips the job on a notes-only pull request, so it must never be a required check | written in `gates-and-deploy.md` §Now |

After the round: the hook's tests 14 / 14; live, the planted fault named by `npm run lint:changed` (exit 1) and the hook's
plain line shown (17 s); nothing left running.
**The fix round's own narrow read** (a second fresh, blind Opus reader, given only the fix commit and the findings): all four fixes right and complete — the Windows tree stop and the Linux process group checked, both callers wait for the check, the exit codes 0/1/2 kept, `--max-duration` never cuts a normal run short (a 77-file change took 17–27 s uncached) and an overrun comes back "not compared". Four low points, all taken in **fix round 2**, each red first: (1) React Doctor marks files its linter dropped only in a second place (`skippedCheckReasons`, "lint:partial") — now refused too; (2) the hook's allowance in the settings must exceed its own worst case (about 170 s) — set to 200 s, so the app never kills it mid-run; (3) the wording — the count covers the branch, not the session; (4) a test gap — the settings files tracked from the start, as in the real repo (the test's tsconfig case first wrote the base's own contents; corrected). Then 14 / 14; the partial mark and the settings fingerprint each broken on purpose and seen to fail. Round 2 is small guards and wording — no third read (the order's cap, §5).

**Switched on** after both reads: `.claude/settings.json`, a third Stop hook beside the design pass and the backlog guard, `"timeout": 200`; its exact command run by hand on this branch — silent, exit 0 (this branch changes no app code).

## Not covered

- **A private repo:** the job is built to work there (the token passed to the base fetch), but runs only while the repo is
  public; untried private.
- **The hook's message reaches him, not the agent** (the app's line under a turn — a Stop hook cannot tell the agent without
  holding the turn open, which D1539 rules out). The pull request's check is what stops a new finding.
