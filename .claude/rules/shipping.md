# Shipping — how a change reaches him (loaded in every chat)

Unscoped on purpose — a notes-only chat ships too, and `raptor-port/CLAUDE.md` loads only once a file under
`raptor-port/` is opened (D140, D141, D390, D1735). The rulings behind each line are on
`.claude/rules/decisions/how-we-work.md`; the traps of the checks and the deploy are in `raptor-port/docs/gates-and-deploy.md`;
the Pages-era wording and the full story behind each rule, in `raptor-port/docs/archive/raptor-claude-md-2026-09-24.md`.

## "Push" and "merge live"

- Push a branch freely; ask before `main`. A branch push changes nothing official and gives him a Vercel link to look
  at, so it needs no permission; `main` stays gated behind his "merge live" — "push" and "merge live" are not the same
  thing (D60, D1407, D1737, D1980).
- Nothing reaches `main` without his explicit "merge live", whatever the change that touches the app — but a pull
  request that changes only notes goes live by itself once its run is green: the agent checks the file list, merges and
  says so in its report. A rules-diet step waits for his "merge live" all the same, even one that changes only notes
  (D60, D1407, D1737, D1980). On an unattended run nothing merges by itself, notes included, unless he gave "auto merge live"
  for it; the night's notes are merged in the morning (D1980, D596, D1093).
- "Only notes" means every file is one of: the rulings files (`.claude/rules/decisions/`, `.claude/decisions-full/`,
  `DECISIONS*.md`), `HANDOFF.md`, `OUTSTANDING*.md`, evidence sheets and their pictures (`raptor-port/docs/handpass/`,
  the picture folders) and the other reference documents under `raptor-port/docs/` — never a working guide, and never
  the unscoped `.claude/rules/*.md` (this merge rule among them), `.claude/hooks/`, `.claude/settings*.json`,
  `.claude/skills/`, `.claude/agents/`, `.claude/launch.json`, `AGENTS.md`, `raptor-port/CLAUDE.md` or anything under
  `.github/` (D1407, D1737, D1980).
- Before such a merge — since a few checks read documents (the permissions table in `raptor-port/docs/data-model.md`
  §11, `engine-rules.md`, `remarks-vocabulary.md`, the behaviour registers) and the gates skip a notes-only pull
  request — the agent runs `npm run rulecheck` and the unit tests that read documents on his PC, until
  [REVIEW-LAYERS] builds the guard that does it, with the secrets scan (D1407, D1737, D1980).
- Chats may run side by side as long as they never clash in anything, and above all two never merge at once: parallel
  chats merge one at a time — each on his word, or by itself where the next bullet allows — each under the merge lock
  and level check below; the later one merges `main` in first and renumbers its own clashing rulings (D78, D1746).
- Every merge into `main` — on his word, a notes-only pull request merging by itself (D1407, D1737, D1980), an "auto merge
  live" run (D1093) — is made in the Bash tool from the repo root, each command whole on one line (split, it runs without the
  folder setting and takes the checks lock), in four steps (D1746):
  1. Take the merge lock — the Bash call's timeout 600000 — and go on only once it prints `gatelock: taken`:
     `RAPTOR_GATE_LOCK='C:/Users/User/.raptor-merge-lock' node raptor-port/scripts/gatelock.mjs take "<branch> — merge <PR>"`
  2. `git fetch origin main <branch>`, then `git merge-base --is-ancestor origin/main origin/<branch> && echo level || echo behind`.
     Behind: release the lock; once no run of the branch is queued or in progress (D151), bring `main` in, wait for that
     run to pass and start again at 1. His word still stands unless settling a clash changed this branch's own app code,
     which goes back for his look (D1742, D1746). Bringing `main` in is `git merge --no-commit --no-ff origin/main`, then
     the settle step first, `node raptor-port/scripts/records-merge.mjs`, then the rulings merge it names, then your own edits (D1930).
  3. Level, its last run green: `gh pr merge <PR> --merge` — never `--auto`, which merges later, outside the lock
     (`main` does not make GitHub ask for an up-to-date branch, so this check is the only guard) (D1746).
  4. Release a lock you took at once, whatever happened next — merged, refused or stopped — never after a `take` stopped
     while it waited (release deletes the folder whoever holds it), and with its folder written out (a bare `release` deletes
     the checks lock, D228) (D1746):
     `RAPTOR_GATE_LOCK='C:/Users/User/.raptor-merge-lock' node raptor-port/scripts/gatelock.mjs release`

## The loop, change by change

- Not held to the end: two to four related jobs of one area share one branch, one check and one merge on his "merge
  live"; a job he wants live at once goes on its own; nothing is piled up for one merge at the end (D1087, D485, D822).
- Finished jobs waiting on his "merge live" at once may merge as one (D822, D1930): each job's chat agrees and freezes its
  branch at a named commit; a new branch from `main` takes each by its own merge commit (a job is dropped by building it
  again without it, never a revert), its run green, its link and job list sent to him, jobs sharing a screen or file checked
  together (D485); his "merge live" for that named batch, typed in the chat that merges it (D1742; a clash settled in a job's
  app code goes back for his look, D1746); the job pull requests closed with a pointer once it is green; then the four steps
  above. Not a notes-only pull request (D1407, D1737, D1980) nor the D1795/D1796 chats' own rule; never stacked on another's branch.
- Change → its own tests green locally (the whole gate set too once the repo is private again — §The checks) → commit
  and push to the session branch (one open pull request accumulates the lot) → once the work is ready for his look
  (built and checked) and its Vercel preview is Ready, send him the link — not after every push of unfinished work
  (D905, D906).
- The link and the pictures come whenever you need him to review something, and when the work is done (D906).
- Do not go quiet waiting on the checks — take the next change. While a preview or a check run cooks he will hand you
  more work: take it; never idle waiting on a rollout.
- Never push while that pull request's checks are running: any push restarts the whole run and cancels the one in
  progress, even a notes-only push. Look first — a push starts two runs at once, the short documents guard and the full
  checks, so read them all: `gh run list --branch <branch> --limit 6 --json status,workflowName,headSha`, and push
  only when no run of the branch's last pushed commit is `queued` or `in_progress`; batch, and push when it has
  finished ([RUN-CHECK-BOTH-RUNS], D151, D870).
- The pull request's checks finish after each push: read their results on your next turn and fix a red one then —
  never discover it at "merge live".
- A green pull request sitting open is the intended resting state, not a thing to finish. The link never gates the
  merge — only his "merge live" does.
- Where the link is: the `vercel[bot]` comment on the pull request (its Preview URL is stable per branch), or the
  Preview deployment of the branch's head commit on GitHub (`gh api repos/<owner>/<repo>/deployments`, then its
  statuses — the URL rides the status). Hand it to him every time.
- Vercel is his surface, never your drive target: it sits behind his Vercel sign-in, so he can open it and your
  browser cannot (it answers with a 302 to `vercel.com/sso-api`). Your fast surface is the local
  `npm run build && npx vite preview` — the same bundle, byte for byte (`raptor-port/CLAUDE.md` §Build & verify).
- The preview is not a gate: `vercel.json` at the repo root builds `raptor-port` for every push, untested, so a red
  preview is still just a preview — correctness rides the gates.

## Ship once per session, at the end (10 Aug 26) — moved whole to `raptor-port/docs/archive/rule-files-2026-11-02.md` (D1556); its live points are in "The loop" and "The checks" (D1086, D1087)

## "Done" means LIVE — and live means ON VERCEL

- On his "merge live": the job's closing records were pushed before his look was asked for, written to be true once it
  is live; merge at once if the run on the last pushed commit is green and the branch is level with `main`, under the
  merge lock, then confirm the live app as below (a later Production deployment whose commit holds the merge counts) —
  nothing is pushed between his word and the merge, except bringing `main` in when the branch is behind it (step 2
  above) (D1742, D78, D1746).
- If his look brings a change, the fix and its records are pushed together and his look is asked again — so too when
  bringing `main` in to settle a clash changed this branch's own app code (D1742, D1746).
- His "auto merge live" for a run covers all it produces, its records pull request too (D1093).
- Tell him when you are done, with `PushNotification` — when the work is genuinely finished, and when you are blocked
  waiting on his answer. One line, plainly. Not for progress, not for a quick reply he is clearly watching, never twice
  for the same work.
- Since D1097, over the line above: every stop that waits on him — the work done and his next step due, a question, an answer, a look or any other input
  — gets its one notification, whether or not he seems to be watching; an unattended run keeps its one at the end
  (D1097, D596).
- A green check is not done, and a merged pull request is not done. Once he has said "merge live" — never before —
  carry it the whole way without checking in: merge when the pull request's checks are green → `main`'s own run goes
  green (on GitHub's machines while the repo is public, on his PC once it is private) → Vercel reports the live app
  READY (the Production deployment for that `main` commit — `gh api repos/<owner>/<repo>/deployments?environment=Production`,
  then its statuses) → one notification, with the link (D143).
- His "merge live" (or "merge now") means his own look is done — never ask him about it again (D1640).
- His look on his phone replaces the live-page look the agent used to do on GitHub Pages (gone since D59 and D343, the
  repo public again since D106, D1530): the live app sits behind his sign-in, and the agent is never given a login to
  it (D143).
- During an unattended run a question is not a reason to stop or to notify: park it in the run's one list and carry on
  with everything else; preview links and questions go in the closing report; one notification, when the run ends or
  when nothing authorised can continue (D596).
- The only reasons to come back sooner: a red check you cannot fix, a genuine question, or a merge he has told you to
  hold. Waiting is not a reason — schedule a check-in and let it fire, rather than reporting "still building".

## The checks

- While the repo is public, GitHub's run of the pull request is a job's full check. Open the pull request into `main`
  as soon as the job is built — a branch pushed with no pull request, or a pull request based on another branch, starts
  no checks — so GitHub's run goes while the app is walked (D1086).
- That run takes about 6 minutes (5m53s measured 20 Oct 26) and is the same set as his PC's: build, the original's 728,
  unit, browser, the Tracker's, the rule and document checks. Its slowest checks are split across more machines, every
  area still run (D1089).
- While the repo is public, on his PC run only the tests of what you change and the build the walk drives — no full
  gate run there (D1086).
- Nothing merges until GitHub's run is green and he has said "merge live" (a notes-only pull request: D1407 — not a
  rules-diet step, D1737, nor on an unattended run, D1980); a red run is fixed before his look is asked for (D1086).
- GitHub's machines download the project without the walks' pictures, which no check reads (D1091).
- The run that counts is the one on the branch's last pushed commit; fixes found during the walk are batched and pushed
  only once the run in progress has finished (D151).
- A small follow-up fix on an open pull request whose whole set has already passed runs only the tests it touches
  before the push; GitHub's run of the pull request is its full check, and nothing merges until it is green. A job's
  first push keeps the whole set on his PC — except while the repo is public, when GitHub's run is that check too
  (D902, D1086).
- While the repo is public the checks run on GitHub's machines — the workflow sends a public repo there by itself — and
  his PC's runner stays stopped. Once it is private again (D106 ended — D1530 keeps it public until he says otherwise),
  the runner starts again and the full check is back on his PC; read first how they then run, moved whole to
  `raptor-port/docs/gates-and-deploy.md` §The checks run on HIS PC (D89, D106, D1530, D1556).
- Parallel chats' full checks take turns through one lock on his PC, the checks lock (merges have the merge lock of
  their own, §"Push" and "merge live"); each parallel chat keeps its own branch, ports and rulings range (D228, D1746).
- Before the full unit suite, any browser-test run of more than one file, the Tracker smoke or a fanned-out walk, take
  the lock: `node raptor-port/scripts/gatelock.mjs take "<branch> — <what>"` (or by hand: make the folder
  `C:\Users\User\.raptor-gates-lock` — it fails if it exists — and write `owner.txt`). If it is held, wait — check
  every few minutes, never start alongside. Release it the moment the run ends, pass or fail
  (`… gatelock.mjs release`, or delete the folder) (D228).
- `… gatelock.mjs run` takes it, runs the whole gate set in order and releases when it ends — a run you stop does not:
  release it yourself at once. `… gatelock.mjs exec "<branch> — <what>" -- <command>` takes it, runs that one command
  and always releases it (D228, D976).
- A lock with no sign of life for 2 hours is stale: `run` and `exec` refresh its time stamp every minute while they
  run, and a lock taken by hand is refreshed with `… gatelock.mjs beat` during a long run ([GATELOCK-STALE-LIVE]).
  Break a stale one and say so — ask its holder first while a chat that could hold it is open (D228).
- One unit test file, a typecheck or one walk script on a build already served needs no lock; anything that builds — a
  browser-test run of even one file — waits until the lock is free. The folder sits outside every checkout, so every
  worktree on the PC shares it (D228).
- A guard enforces the lock and the push rules ([PUSH-LOCK-GUARD], D976): it refuses a full run without the lock,
  anything that builds while another chat holds it, a push that would land on `main`, and a push while that branch's
  checks run — its refusal says what to run instead (`raptor-port/docs/gates-and-deploy.md`). The guard is a backstop,
  not the rule: it lets a push through when it cannot reach GitHub, and Codex has no hooks — so every rule above is
  kept by hand all the same.
- Parallel chats talk to each other so they never clash in anything: before changing a file or function another open
  chat's branch also changes (compare the branches: `git diff --name-only $(git merge-base origin/main <branch>) <branch>`),
  message that chat (`ListAgents`, then `SendMessage`) — what you will change there and what you will leave; answer
  the same when asked; settle an overlap between you at once; repeat what you promised in your own `HANDOFF.md` block.
  The merge order and "merge live" stay his — a chat never merges for another, and two never merge at once (the merge
  lock, §"Push" and "merge live") (D302, D60, D78, D1746; notes only: D1407, D1737, D1980).
- Docs-only changes skip the gates (`deploy.yml`'s list: `**.md`, `.claude/**`, `.impeccable/**`, the document-gate
  scripts `raptor-port/scripts/docsize*.mjs`, `backlog-archive.mjs`, `records-merge*`, and `docs-guard.yml` — on a push to `main` by
  `paths-ignore`; on a pull request the run still starts, its first job skips the gates, and its last, "checks passed",
  always reports, the one check GitHub can require — `raptor-port/docs/gates-and-deploy.md`), but the Docs guard
  (`docs-guard.yml`, two to three billed minutes) still runs on every pull request and every push to `main`.
- That is an exemption from the gates only: a change of notes only (the "only notes" list of §"Push" and "merge live") merges by itself once its run is
  green (a rules-diet step on his word all the same), and any other docs change — a rule that governs the agent, a
  hook, a setting, a working guide, a workflow — still merges only on his "merge live" (D1407, D1737, D1980).
- A pull request that mixes code and docs runs everything — and GitHub judges the whole pull request, so once it
  carries code even a notes-only push re-runs every gate (D151).

## Pull requests

- Do not watch pull requests: the harness auto-watches an opened one and floods his phone with check, review and
  Vercel `<wake>` blocks for little gain. Call `unsubscribe_pr_activity` immediately after opening any pull request;
  never leave one watched. This does not change the ship-to-live duty. An explicit "babysit this PR" ask overrides, for
  that pull request only.
- The app's "Auto-fix" is not left on either: found on, switch it off and say so (D1090).
- Reading the preview URL off the pull request once is not watching — fetch the link, then unsubscribe.

## The old wording of this file, its stories and worked examples with it — moved whole to `raptor-port/docs/archive/rule-files-2026-11-08.md` (D138, D1735)
