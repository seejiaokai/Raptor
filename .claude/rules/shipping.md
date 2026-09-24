# Shipping — how a change reaches him (loaded in every chat)

Unscoped on purpose: a notes-only chat ships too, and `raptor-port/CLAUDE.md` loads only once a file under
`raptor-port/` is opened. Gathered here in the spring clean (24 Sep 26, D140) from `raptor-port/CLAUDE.md`
§How to work here and §Build & verify, whose Pages-era wording — and the full story behind each rule — is kept
whole in `raptor-port/docs/archive/raptor-claude-md-2026-09-24.md`. The rulings behind it are rows in
`.claude/rules/decisions/how-we-work.md`; the traps of the checks and the deploy: `raptor-port/docs/gates-and-deploy.md`.

## "Push" and "merge live"

- **Push a BRANCH freely; ASK before `main`** (owner, 23 Sep 26 — D60). A branch push changes
  nothing official and gives him a Vercel link to LOOK at, so it needs no permission; `main` stays
  gated behind his **"merge live"**. "Push" and "merge live" are NOT synonyms. The question only
  arose because D59 took the repo private, which meters Actions minutes (D89: checks move to his PC). **Never push while a pull request's checks are running** (D151): any push restarts them and cancels the run in progress.
- **Nothing reaches `main` without his explicit "merge live"** (owner, 2 Sep 26 — *"dont automatically push to
  live next time … then i will manually say merge live"*), whatever the change — docs-only included. It ended
  the old "auto-merge is the default" rule of 24 Aug 26. Parallel chats merge ONE AT A TIME, each on his word;
  the later one merges `main` in first and renumbers its own clashing rulings (D78).

## The loop, change by change (owner, 2 Sep 26 and 24 Aug 26)
- change → the gates green locally → commit and push to the session branch (one open PR accumulates the lot) →
  the moment its Vercel preview is Ready (~1 min after the push), send him the link — do NOT go quiet waiting
  on the checks → take the next change. While a preview or a check run cooks he will hand you more work: take
  it; never idle waiting on a rollout.
- **But never push while that PR's checks are running** (D151): any push restarts the whole run and cancels the
  one in progress, even notes-only. Look first (`gh run list --branch <branch> --limit 1`); batch, push when
  it has finished.
- The PR's checks finish after each push: READ their conclusions on your next turn and fix a red one then —
  never discover it at "merge live" (7 Sep 26: six red runs sat unread while the branch was tested on the
  preview, and the merge waited on a fix only the checks could see).
- **A green PR sitting open is the intended resting state**, not a thing to finish. The link never gates the
  merge — only his "merge live" does (9 Sep 26: an older auto-merge clause, still being followed, got a fix
  merged live without him).
- **Where the link is:** the `vercel[bot]` comment on the PR (its Preview URL is stable per branch), or the
  Preview deployment of the branch's head commit on GitHub (`gh api repos/<owner>/<repo>/deployments`, then
  its statuses — the URL rides the status). Hand it to him every time.
- **Vercel is HIS surface, never your drive target** (24 Aug 26): it sits behind his Vercel sign-in, so he can
  open it and your browser cannot (it answers with a 302 to `vercel.com/sso-api`). Your fast surface is the
  local `npm run build && npx vite preview` — the same bundle, byte for byte (`raptor-port/CLAUDE.md`
  §Build & verify).

## Ship once per session, at the end (owner, 10 Aug 26)
Build and verify everything locally as you go, then ONE PR carries the lot. **Shipping is not how you test**:
`npm run build && npx vite preview` is the same bundle that deploys, so every check — driving it in a browser
included — happens before the PR. Prefer batches: most of the cost is loading this app into context (measured
10 Aug 26: fifteen changes in one pass ran ~6 min each, where a single change shipped alone took an hour and a
half).

## "Done" means LIVE — and live means ON VERCEL (owner, 10 and 12 Aug 26; D143, 24 Sep 26)
- **Tell him when you are done, with `PushNotification`** — when the work is genuinely finished, and when you
  are BLOCKED waiting on his answer. One line, plainly. Not for progress, not for a quick reply he is clearly
  watching, never twice for the same work.
- **A green check is not done, and a merged PR is not done.** Once he has said "merge live" — never before —
  carry it the whole way without checking in: merge when the PR's checks are green → `main`'s own run on his PC
  goes green → Vercel reports the live app READY (the Production deployment for that `main` commit —
  `gh api repos/<owner>/<repo>/deployments?environment=Production`, then its statuses) → ONE notification, with
  the link. **His look on his phone replaces the live-page look** the agent used to do on GitHub Pages (gone
  since D59): the live app sits behind his sign-in, and the agent is never given a login to it (D143).
- The only reasons to come back sooner: a red check you cannot fix, a genuine question, or a merge he has told
  you to hold. Waiting is not a reason — schedule a check-in and let it fire, rather than reporting "still
  building".

## The checks
- **They run on HIS PC** (D89): one job, a Windows service, the `pc` job in `.github/workflows/deploy.yml`; the
  way back to GitHub's own machines is the repo variable `CI_ON_GITHUB=true`. Never two full gate runs at once,
  and never a full local run while his PC's runner is mid-run (D86).
- **Docs-only changes skip the gates** (`paths-ignore` in `deploy.yml`: `**.md`, `.claude/**`, the document-gate
  scripts `raptor-port/scripts/docsize*.mjs` and `backlog-archive.mjs`, and `docs-guard.yml`) — but the Docs guard
  (`docs-guard.yml`, about a billed minute) still runs on every PR and every push to `main`. **An exemption from
  the GATES, never from his approval**: a docs-only change merges ONLY on his explicit "merge live" (corrected
  17 Sep 26). A PR that mixes code and docs runs everything — and GitHub judges the WHOLE PR, so once it carries
  code even a notes-only push re-runs every gate (D151).

## Pull requests

- **Do NOT watch PRs** (owner, 15 Aug 26). The harness auto-watches an opened PR
  and floods the owner's phone with CI/review/Vercel `<wake>` blocks for little
  gain (gates + live page are checked before the PR opens; he leaves no review
  comments). Call `unsubscribe_pr_activity` immediately after opening any PR;
  never leave one watched. Doesn't change the ship-to-live duty. An explicit
  "babysit this PR" ask overrides, for that PR only.
