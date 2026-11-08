# [CI-SMOKE-TIMEOUT] — Astra's read (8 Nov 26, the morning after the night; D1743)

Called by the night's coordinator in the morning: the night's helper had run only the fresh Opus read. Model: gpt-6-astra,
reasoning high, read-only. The brief below as sent; the report as returned, its final answer only.

## The brief

You are Astra, a blind code reader for the Raptor repo (a scheduling web app). Read only; change no file.

THE CHANGE: pull request 670, branch `claude/ci-smoke-timeout`. It adds GitHub Actions time limits to the test jobs of
`.github/workflows/deploy.yml`. Nothing in the app changes. Read it with:
  git diff origin/main...origin/claude/ci-smoke-timeout -- .github/workflows/deploy.yml
  git show origin/claude/ci-smoke-timeout:.github/workflows/deploy.yml
Its backlog item is `### [CI-SMOKE-TIMEOUT]` in `git show origin/claude/ci-smoke-timeout:OUTSTANDING.md`.

THE INTENT, as its builder states it: every GitHub test job gets a time limit, set from 20 green runs — build 10
minutes, unit 20, geometry 30, the Tracker smoke 30 per half (12 on the smoke step itself). The 5 Nov 26 "hang" was the
browser install's system download (12.3 of 16 minutes, slow in 9 of 20 runs); two older stalls of 62 and 43 minutes
would now stop at 30. Recent step times: `gh run list --workflow deploy.yml --limit 20` and `gh run view <id> --json jobs`.

ASK — for each, a finding only with a concrete failure (which job, what input or condition), its cause and its fix:
1. Could any limit cancel a HEALTHY run — given measured times, the slow browser-install days, a cold cache, the
   sharded or matrix jobs, a job that waits on another (`needs`)? Name the job, its slowest measured green time and its
   limit.
2. Is every job that runs tests covered, and is each `timeout-minutes` placed where GitHub reads it (job level vs step
   level; valid inside a matrix or a reusable call; not swallowed by `continue-on-error`)?
3. Does a timed-out job fail the required check (so nothing can merge on a cancelled job), rather than pass or skip?
4. Does the change alter anything else in the workflow — triggers, `paths-ignore`, the public-repo routing to GitHub's
   machines, the deploy step, caches, concurrency or cancel-in-progress?
5. Anything else that would make this change wrong.

NOT A FINDING: a problem that lives only in data already stored while the code is correct going forward (the store is
demo data); style or wording preferences; anything about the app's code outside this workflow.

Return: a numbered list of findings, each with severity (high / medium / low), the failure, its cause and the exact fix;
or "no findings" with one line on what you checked for each of 1–5.

## The report

1. **Medium — a timed-out test does not currently block merging.** If either Tracker half exceeds 30 minutes while the secrets scan passes, GitHub can still permit merging. The live ruleset requires only `secrets scan`; traditional branch protection lists no required checks. The timeout correctly produces a non-success result, but that test is not required. **This is an existing enforcement gap, not introduced by this patch.**  
   **Exact fix:** add an aggregate test check that runs on every pull request, explicitly accepts permitted documents-only changes, and otherwise requires every job on the selected runner path to succeed. Make that aggregate required on `main`. Do not simply require the existing path-filtered jobs: documents-only pull requests would then remain blocked. [GitHub’s required-check rules](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks).

No other findings:

- **1 — Timing:** independently reproduced the builder’s 20-green-run measurements:

  | Job | Slowest green | Limit |
  |---|---:|---:|
  | Build | 0:54 | 10:00 |
  | Unit — Leave War 4/4 | 7:29 | 20:00 |
  | Geometry — Leave War phone | 16:26 | 30:00 |
  | Tracker — smoke 2/2 | 17:41 | 30:00 |
  | Tracker smoke step — half 1 | 3:53 | 12:00 |

  Slow installs occurred in nine runs. No demonstrated healthy-run cancellation; a completely cold cache was not independently measured.
- **2 — Coverage and placement:** all test jobs covered, including the existing PC limit of 45 minutes. Limits apply separately to matrix jobs; the smoke’s 12-minute limit is correctly on its step. No reusable calls or `continue-on-error` masking.
- **4 — Other behaviour:** triggers, path exclusions, runner routing, deployment, caches and concurrency are unchanged. Only the disabled deploy job uses `needs`.
- **5 — Further checks:** no additional defect found; the proposed branch’s workflow run passed.

Rulings: none this session. No files changed.

**The host's check (8 Nov 26):** the gap reproduced — `gh api .../rulesets` shows one ruleset on `main`, requiring only
`secrets scan`; `main` has no branch protection. Filed as [TESTS-REQUIRED-ON-MAIN].
