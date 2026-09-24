# The gates and the deploy — how they run, and how they mislead

**Tier 2: read it before trusting or re-running a red gate, and before touching the workflows or the runner.**
Moved WHOLE on 24 Sep 26 (D138, D140) from `HANDOFF.md` (§Gate status's per-gate table and its traps; §Deploy)
so the handoff every chat reads holds only the current baseline. The CURRENT counts stay in `HANDOFF.md`
§Gate baseline; how to run the gates is `raptor-port/CLAUDE.md` §Build & verify.

## Now (24 Sep 26) — how the checks and the deploy run today

- **The checks run on HIS PC** (D89, 23 Sep 26): ONE job, `pc` in `.github/workflows/deploy.yml`, a Windows service.
  The way back to GitHub's own parallel jobs: the repo variable `CI_ON_GITHUB=true`. Take the runner OFF this repo
  before any collaborator is added (Astra SEC-101, `[REPO-PRIVATE]`). Where it lives and how it was set up:
  §The checks run on HIS PC, at the end of this file.
- **Never two full gate runs at once, and never a full local run while his PC's runner is mid-run** (D86) — look
  first: `gh run list`.
- **Never push while a PR's checks are running** (D151, measured 23 Sep 26): GitHub judges the WHOLE pull request,
  so once it carries code any push — even notes-only — restarts every gate and cancels the run in progress. The
  older note in the `unit (raptor)` row below ("a docs-only push … starts no new one") predates that measurement.
- **There is no GitHub Pages site** (D59, 23 Sep 26): the publish job is off, and every Pages trap below is history.
  The app is seen on VERCEL: a preview per branch (his surface — the agent's is the local `vite preview`) and the
  live app from `main`. **"Done" after "merge live" means live on Vercel** (D143): merge → `main`'s run green on
  his PC → the Production deployment for that commit READY (`gh api repos/<owner>/<repo>/deployments?environment=Production`,
  then its statuses) → one notification with the link. The whole loop: `.claude/rules/shipping.md`.
- **Docs-only changes skip the gates** (`paths-ignore`: `**.md`, `.claude/**`, `raptor-port/scripts/docsize*.mjs`,
  `backlog-archive.mjs`, `docs-guard.yml`); the Docs guard (`docs-guard.yml`) still runs on every PR and every push
  to `main`, and a docs-only change still merges only on his "merge live".

## How the gates lie — moved whole from `HANDOFF.md` §Gate status (24 Sep 26)

*The baselines in the first paragraphs are history; the current one is `HANDOFF.md` §Gate baseline.*

**Current main baseline — PR #420 ([SYNC-INTEG] medical guardrail batch: medical
member-filed only, relaxed document prompt, clutter-only clear-old-data) MERGED
LIVE 21 Sep 26** — `[S4-BUGHUNT]` merged (PR #422), all nine deploy jobs green,
the live page loaded and checked (the one input window carries Ack / Approve /
Refuse / Move; under-manned reads 0 days). Counts watched on this tree:
`npm test` **5230 across 327 files** (2 vitest projects); `tfin.js` **728/0**;
build clean; `test:e2e` **447 passed / 0 failed** (45 skipped); `smoke:tracker`
**425/0**; `perf` **4/0**; `rulecheck` OK.
**Re-read 22 Sep 26 on `claude/oil-seats-can-earn` after the OIL-seats walk's
fixes, all six watched:** `npm test` **5629 across 352 files**; `tfin.js`
**728/0**; build clean; `test:e2e` **447 / 0** (45 skipped); `smoke:tracker`
**425 / 0**; `rulecheck` OK (53 rulings named by a test, 7 by nothing — the
recorded baseline). `perf` NOT re-run on that branch. Pre-existing note kept: the two
Windows-local geometry crew-rest flakes pass in isolation and on Linux CI.
Post-build bug-checked by BOTH providers (Fable + Astra) — ten findings, all
fixed and test-pinned before the merge.
Pre-build plan red-teamed by Codex (APPROVED after 1 revise round); post-build code
inspected by Codex + Fable (Fable: no permission/data-loss holes). **The per-gate
table and traps below predate this baseline — the trap descriptions still stand;
only their raw counts are older.**

**Earlier tree the table below was captured on — the 5–6 Sep 26 batch, PR #368
(CI head `8b269df` plus a docs-only handoff commit, squash-merged on the
owner's "merge") + PR #369 (one guard on the Shell's pre-warm poll, after
#368's own deploy run 903 went red on `unit (raptor)` with every test green —
the timer trap in the table below).** CI run 901 on `8b269df` and the re-run of
904 on #369: all seven gate jobs green (build + reference suite, unit raptor,
unit leavewar ×2, geometry ×3). Counts in the table are from runs watched here
on that tree (superseded by the #373 baseline above; the traps stand):

| gate | reading |
|---|---|
| `npm test` | **4670 across 275 files** (13 Sep 26, incl. the course-id 1B-i pins) — two vitest projects, raptor + leavewar. **The RAPTOR project is flaky under load on a busy container** (6 Sep 26): three consecutive runs of one unchanged tree gave a post-teardown unhandled error (React's scheduler finishing work after jsdom went away, reported against `src/ui/odds.test.tsx`), then one failed test, then a clean 2632/2632 — while the branch base ran clean too. Every test passes; it is the exit code that wanders. Re-run before treating it as a finding, and read the "Unhandled Errors" block (obs 85) — this is the same shape as the two already fixed. **It is a FAMILY, not one test, and it is LOAD, not the tree (22 Sep 26).** `src/ui/stsaved.test.tsx` joined `odds.test.tsx` in it: two of its cases failed on the two full runs taken while the tracker smoke and the browser gate were running alongside, and passed on the two runs taken alone — 6/6 in isolation, 16/16 run straight after the three new OIL files in one process, and 5449/5449 twice with nothing else going. That file is the expected shape: its subject is a SELF-EXPIRING 1.2s window, so a loaded machine expires it before the assertion. **Do not run the unit gate concurrently with the browser gates**, and do not read a failure from a concurrent run as a finding without re-running it alone. |
| `node reference/tfin.js` | **728/0** (the reference is read-only; the "Ground Programme" title trim rides the tolerant normaliser in `html.test.ts`) |
| `npm run build` | clean |
| `npm run test:e2e` | **lw-phone 128 + lw-desktop 133 passed / 0 failed (21 skipped by project gate); raptor geometry 134 / 0** — three playwright projects, 416 tests, ~12.5 min locally. Two traps from this batch: (a) a `npm run build` DURING a browser run swaps the files the test server serves and fails whatever page load is in flight (one login-timeout red, green on the clean re-run — never rebuild while `test:e2e` runs); (b) a background `npx playwright test` launched WITHOUT `cd raptor-port` runs from the repo root and reports "No tests found" as exit 0. The older lead stands: the desktop carry-day test ("View-only opens on the day Edit was showing", `geometry.spec.ts`) went red once in the drag round and passed alone — for ~5 s after the edit page opens the store notifies ~10 times and each pass re-lands `eWeek.scrollLeft`, which can race `parkOn`'s scroll. |
| `probes:adapted` | **all 6 GREEN**. **Read the LAST line, not the last tally**: each probe prints its own count as it finishes, and the suite's verdict is the line after it, `all 6 adapted probes passed`. |
| `npm run smoke:tracker` | **the Tracker tab's vendored browser suite** (7 Sep 26) — 427 checks from the standalone repo (13 Sep 26, incl. course-id 1B-i) driven through Raptor's login and tab; builds + serves itself on 4179, or `APP_URL=http://localhost:4173/` against a running preview. ~8 min locally. **427/0 in CI 13 Sep 26** (the first run inside Raptor found six fails, all the host's — five bare Raptor class rules restyling the tab, since reset in `tracker.css`, and one selector the suite itself had to scope to the section). Its 4 tests near the end use a second browser page; a `localStorage.clear()` inside it also clears Raptor's `rules`/`stores` keys in that browser — harmless, but don't run it against a browser you care about. |
| `perf` | **4/0** — board DOM 1023 ≤ **1150** (the ceiling is a SETTLED owner decision since 28 Aug 26 — `CLAUDE.md` §Stable decisions). |
| CI `unit (raptor)` | can go red with EVERY test green: the summary's `Errors 1` line — an unhandled error after a file ended. Run 899 was the 6-second fresh-add timer (`view.ts flashAdded`) firing into a torn-down jsdom (`paintFreshAdds` now returns with no `document`); run 903 was the Shell's self-re-arming pre-warm poll (`Shell.tsx`) firing after a test that never unmounts the App (it now returns with no `window`, #369). Both shapes — a long one-shot timer and a re-arming poll in a production module — outlive a test file; read the "Unhandled Errors" block before calling a red run a flake (obs 85). A docs-only push on a PR CANCELS its running gate job and starts no new one (`paths-ignore`) — re-run the cancelled run rather than pushing again. |

**On a local WINDOWS dev box, two e2e specs fail deterministically yet are NOT
bugs** (12 Sep 26): `geometry.spec.ts` "the board flying line carries the brief
inline between MSN and TO at phone width" (raptor) and `leavewar.spec.ts` "a
finger behind an open sheet scrolls the grid itself…" (lw-phone). Both reproduce
on clean `main` and both pass in CI on Linux (a merged-green PR's own checks
confirm it), so they are a Windows browser/layout/touch-emulation quirk — trust
CI for them, don't chase them locally. (`smoke:tracker`'s `addStudent` timeout
that used to sit beside these was a REAL bug, not a Windows quirk — DIAGNOSED +
FIXED 17 Sep 26, see [TRK-SMOKE] in OUTSTANDING-ARCHIVE.md; no longer re-run-and-hope.)
None of these gate a tracker- or storage-only change.

**How the gates lie — the durable traps, worth more than any count:**

- **`npm run perf` asserts FOUR things, not seven, since 10 Aug 26** — two
  DOM ceilings and two behavioural checks. The three per-node TIMING budgets
  were removed as assertions on the owner's decision, after he asked what
  they had ever caught: nothing, in the life of this repo, while the ceilings
  were right all four times they fired. The timings are still measured and
  printed, so a real slowdown is still visible; a wandering number just isn't
  a failure any more. **Do not re-add them, and do not "fix" one by widening
  it** — a bar loose enough to cover a 3×-swinging estimator would pass a
  genuine doubling too. Reasoning and the counted record:
  `docs/probe-sweep.md` §The three timing budgets stopped being assertions.
  If a printed timing ever looks wrong, the PAIRED recipe in the same file is
  still how to settle it: one reading proves nothing on this container (nine
  readings of one unchanged commit spread 1.08×–1.23×).
- **`probes:adapted` and `perf` do NOT serve themselves** — start
  `npx vite preview --port 4173` first or both fail with
  `ERR_CONNECTION_REFUSED`, which reads like a code fault and is not.
- **And that cuts the other way: if a preview is ALREADY running on 4173,
  `npm run test:e2e` reuses it and never rebuilds** (`reuseExistingServer` in
  `playwright.config.ts`, off in CI only) — so e2e silently measures whatever
  was built last, not your working tree. A CSS change was proven "still
  passing" against a stale bundle that way, and a deliberately-broken control
  case passed too, which is how it was caught. **Kill the preview before
  trusting an e2e run after editing CSS or markup**, or run the two in the
  other order: e2e first, then start the preview for the probes.
- **The CI runner can run ~30% slower than this container, and vitest's
  default 5s per-test timeout was the margin that failed main's deploy on
  19 Aug 26** — a board.test.tsx test that runs ~1s locally timed out, its
  abandoned cleanup left TEST BLOCK duty rows installed, and the NEXT test
  failed on markup that had nothing to do with it (the misleading half:
  the second failure is the one a reader debugs first, and it is pure
  fallout). The identical commit had passed the identical PR gate minutes
  earlier. Both vitest projects run a 20s testTimeout now (vite.config.ts) —
  headroom, not a target; a test that genuinely needs seconds is still worth
  a look. If a main run ever fails on a test the PR run just passed, read
  for "Test timed out" FIRST, and check whether every later failure in the
  same file is downstream of an un-run `finally`. — every rect Vitest reports is 0×0, so it
  can prove which class was emitted and nothing about what was painted.
  Geometry contracts are gated by `e2e/geometry.spec.ts` (the fourth CI
  gate, 86 checks); wider visual work still wants the probe path
  (`npx vite preview --port 4173` + `probes/`).
- **A MONTH JUMP IS NOT OVER WHEN THE CLICK RETURNS, and a rect read too early
  is a hard failure, not a flake** (20 Aug 26). The Leave War roster's row
  window is deliberately DEBOUNCED to scroll REST (writing scrollLeft mid-fling
  kills a touch scroll's momentum), and the reflow it then runs re-narrows every
  column the hidden rows' chips had widened and puts the anchored column back.
  So a measurement taken straight after `month-MAR.click()` reads a layout
  nothing ever settled at — and taking two boxes in two `boundingBox()` calls
  lets the reflow fire BETWEEN them, comparing a rect from one layout against a
  rect from the next. The blocked-exercise-week e2e did both and failed by a
  byte-identical ~10.9px on BOTH projects, three runs running, which is exactly
  what made it read as a code fault. Repaired with `settleGrid` (poll until the
  scroll position AND a day column's own left edge both hold still — the reflow
  moves the columns without moving the scroller) plus one atomic `evaluate` for
  all three rects. **Any new Leave War geometry test that navigates first wants
  the same two habits.** TWO tests in that family were red on main by 20 Aug 26,
  not one: the blocked-exercise band above, and "every month in the strip can be
  reached and lights itself", whose `expect.poll` passes the instant the strip
  lights up — while the grid is still moving — so the next month was tapped into
  the previous jump's settle. It waits for the grid to be still between jumps
  now. A PRODUCT fix was tried first (dropping the pending anchor correction on
  an explicit jump) and reverted: with it disabled the same scenario still
  passed, so it was not what the failure was about. **Worth restating as a
  habit: prove a fix with the control case before keeping it** — the change
  looked plausible and did nothing.
- **jsdom cannot HIT-TEST either, and that is a separate trap** (12 Aug 26). A
  pointer bug on the board hid there for a day: dispatching a synthetic
  pointerdown straight at the element you mean is not what a finger does, and a
  gesture wired to the wrong element passes every such test. The board swipe's
  real fault was that mid-settle a finger landed on `.schedboard` (the live board
  was a screen away and the preview was `pointer-events:none`), so the press went
  to an element with no listener on it. **In a browser test, dispatch to
  `document.elementFromPoint(x, y)`, not to the element you have in hand.** The
  swipe itself was removed hours later, so the worked example is gone with it —
  the lesson is not, and it applies to the row-drag and puck-drag machines that
  are still there.

*The section below moved whole from `HANDOFF.md` §Deploy on 24 Sep 26. Its GitHub Pages parts are history since D59 —
the Now block at the top of this file is current.*

## Deploy — the traps, all still live

**SUPERSEDED 23 Sep 26 (D59): the repo is PRIVATE, GitHub Pages is GONE and the publish job is OFF — Vercel is the only viewer (`raptor-kai-e2f5.vercel.app`); the Pages traps below are history until `[DEPLOY-DOCS]` rewrites them.** Was: **Two channels since 15 Aug 26 — Vercel for speed, Pages for the official
site.** The owner's dev loop felt like ~20 min per change; the fix was to stop
routing every look through the gated Pages deploy.
- **Vercel** builds `raptor-port` from the root `vercel.json` and gives every
  branch/PR its own live URL in ~1 min, ungated — the fast per-branch preview
  the owner taps himself and the one to drive while iterating. Not a gate: a
  red preview is still just a preview. The owner connects it once in the Vercel
  dashboard (Import the repo; `vercel.json` carries the build settings so no
  dashboard config is needed). Contract: `CLAUDE.md` §Build & verify.
- **GitHub Pages** stays the OFFICIAL, gated site, published on merge to main
  only — the "done means live" endpoint. Paid once per session, not per change.
- **CI was sped up the same day**: the Playwright browser download is cached
  (`actions/cache` keyed on the lockfile) and the geometry suite runs 3
  workers with one CI retry (`playwright.config.ts`). NOT all cores — the
  first `workers:'100%'` run on main starved the shared vite preview and
  flaked the desktop carry-day test, failing the publish; 3 keeps most of the
  ~30% win (~1.7min → ~1.2min at 4 cores) with headroom, and the retry
  absorbs a residual flake visibly (the reporter logs retried passes). That
  made the checking wait ~2–3 min in August; by 3 Sep 26 the suites had grown
  to 17 min serial, which is the next bullet.
- **SINCE 23 Sep 26 (D89) THE DEFAULT IS ONE JOB ON THE OWNER'S PC** — a self-hosted Windows runner,
  the `pc` job in `deploy.yml` (private repo = GitHub's 2-core machines, `[CI-TWO-CORES]`). The
  parallel jobs below are the way back: set the repo variable `CI_ON_GITHUB` to `true`. The runner is a
  Windows SERVICE under NETWORK SERVICE at `C:\actions-runner\actions-runner` (never delete
  `C:\actions-runner`); take it OFF the repo before any collaborator is added (`deploy.yml`, SEC-101).
- **Never push to a branch while its pull request's checks are running (owner, D151)** — the push restarts
  the whole run and cancels the one in progress, even a notes-only push. Batch notes; push when it is done.
- **The gates run as PARALLEL JOBS since 3 Sep 26 (owner ask: "shorten the
  time taken to merge live").** Measured on #354's publish, the last
  single-job run: 17m26s end to end = install+build 20s, vitest 9m41s
  (1563 s of test time over 4 workers), Playwright 6m29s (1071 s over 3
  workers), Pages publish 5 s. So the wait was the two suites queued on one
  runner, and Leave War was most of both: its ten heaviest jsdom files
  (`src/leavewar/ui/*.test.tsx`, each test renders a 365-column year) were
  two thirds of the unit time and its two browser projects three quarters of
  the geometry time. The workflow now runs `build` (tsc + bundle + parity +
  artifact), `unit (raptor|leavewar)` via `npx vitest run --project`, and
  `geometry (raptor|lw-phone|lw-desktop)` via `npx playwright test --project`
  as six parallel jobs; `deploy` needs all of them, so nothing publishes red
  and the gate set is unchanged. Public repo, so the extra runners are free.
  MEASURED on the first parallel PR run (#355's gate on the workflow commit,
  same tree as #354's 16m16s serial PR gate): **8m28s end to end** — build
  41 s (parity 27 s of it), unit raptor 4m38s, unit leavewar **8m24s** (the
  long pole, and slower than the ~5 min estimate: its ten heavy jsdom files
  each want a whole core, so four of them side by side on a 4-core runner do
  not scale the way the mixed serial run did), geometry raptor 2m29s /
  lw-phone 3m17s / lw-desktop 3m07s. Every leg spends ~10 s on runner
  setup and ~20 s on Chromium install even with the cache hit. On main add
  the publish (5 s on 3 Sep). So the Leave War unit leg is SHARDED in two in
  the same PR (`--shard=1/2`, `2/2`): vitest splits the file list by a sha1
  of each path — fixed, not duration-aware; replaying that hash over the
  serial run's per-file times gives ~595 s / ~433 s with the heavy files
  5/4, so expect the leg at ~5 min and the whole gate at ~5 min. Record the
  measured figure from the PR run that carries it. Making the Leave War
  jsdom tests render less than a full year would cut the LOCAL gate too and
  is the deeper fix. Rejected: publishing on main without re-running the
  gates (90 s, but the owner merges before the PR gate finishes, so the main
  run is the only CI that completes before publish) and paid larger runners.
- **Docs-only PRs and pushes skip the workflow entirely** (`paths-ignore`:
  `**.md` + `.claude/**`, added the same day — nothing under those patterns
  is imported into the bundle, verified by grep). A session-handoff commit
  therefore has NO checks to wait for — do not sit waiting for a "build" check
  that will never appear on such a PR. **It does NOT merge itself: that is an
  exemption from the GATES, never from the owner's explicit "merge live"**
  (corrected 17 Sep 26; the old wording said "merges immediately", the same
  stale exemption that got a fix merged without him on 9 Sep). A mixed
  code+docs PR still runs the full gates.
- **Known cosmetic warning, deliberately deferred (15 Aug 26):** the runner
  logs "actions/checkout@v4, setup-node@v4, cache@v4 target Node 20, forced
  onto Node 24". A warning, not a failure — every run passes with it. Bump
  the action majors on a quiet day, NOT bundled into another workflow change:
  the one workflow edit this repo shipped broke main's deploy on its first
  run (the workers flake), so workflow changes go one at a time.

GitHub Pages must stay enabled (Settings → Pages → Source: GitHub Actions).
The workflow refuses to publish on any red test. The four gates also run on
every **pull request** into main, so a red PR is caught before merge; a PR
run gates only — it uploads no artifact and never deploys. Publishing stays
push-to-main.

**Checking a shipped change against the deployed page is a standing
instruction** (owner opened the network policy, 7 Aug 26) — a green workflow
is not evidence the page serves. Recipe and the three Chromium launch
settings it needs (without them every host fails as `ERR_CONNECTION_RESET`,
which looks like an outage and is not): `CLAUDE.md` §Build & verify.

- **The publish step has a ten-minute ceiling you cannot raise.**
  `actions/deploy-pages` polls until Pages serves the artifact and aborts at
  600000 ms, CANCELLING a deployment that is still reporting progress — so a
  green build publishes nothing. Passing a bigger `timeout:` does not work;
  the action clamps it and says so in the log. Pages took about 8 minutes for
  this repo in early August (two minutes of margin against a queue nobody here
  controls) and 5 SECONDS on 3 Sep 26 — the ceiling is a trap for slow days,
  not the daily cost; the daily cost is the gates, above. Ruled out as causes
  before blaming the queue:
  the artifact is 0.15 MB over 5 files, the environment goes
  waiting→queued→in_progress in 1–3 s, and the repo sits at 2 deployments/hour
  against a soft limit of 10. If the wait becomes permanently over ten
  minutes the fix is a different publish path — a `gh-pages` branch, which
  never waits on the rollout, or another host — not a re-run and not another
  timeout value. Reasoning is in the deploy step's own comment in
  `.github/workflows/deploy.yml`.
- **Three GitHub-side faults, separate from that ceiling and from each
  other**, and one of them makes retrying pointless:
  - `Failed to resolve action download info` · `Service Unavailable` /
    `Bad Gateway` — the runner could not fetch the action definitions. It
    never reached the repo. Re-run.
  - **`Invalid actions OIDC token ... No keys from key endpoint match` — the
    trap.** It appears when you RE-RUN an old failed job: that run's identity
    token has since rotated, so re-running a stale run can NEVER succeed
    however many times it is tried. Trigger a FRESH run instead
    (`workflow_dispatch` on `deploy.yml`, ref `main`), which mints a new one.
  - **No runner assigned at all** — job cancelled after ~15 min with an empty
    `runner_name` and zero steps recorded. Pure capacity. Re-run later.
- **The Actions status API reads 10–20 minutes STALE, and that is the single
  biggest time-waster in this pipeline.** Repeatedly it reported a step "in
  progress" that had finished half an hour earlier — a gate that took 2m17s
  looked hung for 35 minutes, and the natural conclusion (something is wrong
  with my change) was wrong every time.
  **`list_workflow_jobs` is NOT a reliable way round it** — that was the
  advice here until 10 Aug 26, when a PR gate that finished at 10:36:13 was
  still being reported step-by-step as "Geometry in progress" by that very
  endpoint more than thirty minutes later. It is sometimes fresher; it is not
  dependably fresher, so do not plan around it. On that run the PR
  **check-runs** endpoint was the one that eventually told the truth.
  What DOES work, both measured: for a PUBLISH, the deployed page itself is
  the only trustworthy signal — poll `curl -sS https://seejiaokai.github.io/Raptor/`
  for the new bundle hash out of `dist/index.html` (Pages rolled over in
  90 s–3.5 min all day, nowhere near the ten-minute ceiling). For a PR GATE
  there is no page, so there is no fast signal at all: budget for the answer
  arriving up to half an hour after the job really finished, poll on a long
  interval rather than a short one, and spend the wait on something else.
  Never conclude a run is hung from that API alone, and never re-run or
  dispatch on it.
- **Two token traps.** A merge made with the **raw session token** (curl
  `PUT /pulls/{n}/merge`) produces NO push-deploy at all, while a merge
  through the **GitHub tooling** triggers one normally — so do not reflexively
  dispatch after merging; check for a push run first, or the dispatch
  supersedes a healthy run and cancels it (the concurrency group is
  `cancel-in-progress`). That mistake was made here twice, once in each
  direction. And the raw session token gets `403 Resource not accessible by
  integration` on `POST /actions/workflows/{id}/dispatches`, which returns an
  EMPTY body on success too — so a script cannot tell refusal from success and
  will cheerfully report runs it never started. Dispatch through the GitHub
  tooling, not curl.

## The checks run on HIS PC

A Windows service under NETWORK SERVICE at `C:\actions-runner\actions-runner` (never delete `C:\actions-runner`);
its folder permissions were tightened by him (Astra SEC-102, done). PR #428's evidence (the Leave War fixes):
`raptor-port/docs/handpass/2026-09-23-lw-monthjump.md` PART TWO.

## How pushes cost runs (his question, 23 Sep 26)

Any push to a branch with an open PR re-runs the whole check set, even notes-only (D151's reason). Notes wait
and ride along with the next real change or the merge; the merge itself earns one run on `main`.
