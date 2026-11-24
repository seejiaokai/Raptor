# Shipping — how a change reaches him (loaded in every chat)

Unscoped on purpose — a notes-only chat ships too (D140, D141, D390, D1735). This is the short form (D2460): every
rule, and the moment to open its steps. The steps, the commands and each rule's full wording are in
`raptor-port/docs/shipping-steps.md` under the same headings — **open the section a line names before you act on it,
never from memory.** The rulings behind each line are on `.claude/rules/decisions/how-we-work.md`; the traps of the
checks and the deploy are in `raptor-port/docs/gates-and-deploy.md`.

## "Push" and "merge live"

- Push a branch freely; ask before `main`. A branch push changes nothing official — one that changes the app gives him
  a Vercel link, a notes-only push normally skips the build (D2032) — so "push" and "merge live" are not the same thing (D60,
  D1407, D1737, D1980).
- Nothing reaches `main` without his explicit "merge live". The one exception: a pull request that changes only notes
  goes live by itself once its run is green — the agent checks the file list, merges and says so in its report. A
  rules-diet step waits for his word all the same (D60, D1407, D1737, D1980); an unattended run's notes wait for the
  morning unless he gave "auto merge live" (D1093).
- **Before deciding a job ships as notes only, and before merging one, open the steps** — §"Push" and "merge live" —
  for the exact file list and the checks to run on his PC first. The rulings files can qualify; an unscoped rule file,
  a working guide, a hook, a setting, a skill, an agent, a workflow, `AGENTS.md` and `raptor-port/CLAUDE.md` cannot
  (D1407, D1737, D1980).
- **Before every merge into `main`** — on his word, a notes-only one, an "auto merge live" run — **open the steps and
  follow the four there:** take the merge lock, check the branch is level with `main`, `gh pr merge <PR> --merge`
  (never `--auto`), release the lock (D1746).
- Parallel chats never clash in anything and two never merge at once: each merges on his word, or by itself where the
  notes rule allows, one at a time; the later one brings `main` in first and renumbers its own clashing rulings; each
  keeps its own branch, ports and rulings range (D78, D228, D1746).

## The loop, change by change

- Not held to the end: two to four related jobs of one area share one branch, one check and one merge on his "merge
  live"; a job he wants live at once goes on its own; nothing is piled up for one merge at the end (D1087, D485, D822).
- Finished jobs waiting on his "merge live" at once may merge as one — **open the steps first** (D822, D1930).
- Change → its own tests green locally → commit and push to the session branch (one open pull request accumulates the
  lot) → open the pull request into `main` as soon as the job is built, so its checks run while the app is walked
  (D1086) → once the work is ready for his look and its Vercel preview is Ready, send him the link.
- The link and the pictures come whenever you need him to review something, and when the work is done — not after
  every push of unfinished work (D905, D906). Where the link is: the steps.
- **Never push while that pull request's checks are running:** any push, even of notes, cancels the run in progress
  and restarts it. Look first — the command is in the steps, and a push starts two runs, so read them all — then batch,
  and push when it has finished ([RUN-CHECK-BOTH-RUNS], D151, D870).
- Do not go quiet waiting on the checks or a preview: take the next change. Read the checks' results on your next turn
  and fix a red one then — never discover it at "merge live".
- A green pull request sitting open is the intended resting state. The link never gates the merge — only his "merge
  live" does.
- Vercel is his surface, never your drive target: it sits behind his sign-in. Your surface is the local build and
  preview, the same bundle; the preview is not a gate — correctness rides the gates.

## "Done" means LIVE — and live means ON VERCEL

- The job's closing records are pushed before his look is asked for, written to be true once it is live. On his "merge
  live", merge at once if the run on the last pushed commit is green and the branch is level with `main`; nothing is
  pushed between his word and the merge, except bringing `main` in when the branch is behind it (D1742, D78, D1746).
- Then carry it the whole way without checking in — **open the steps for how to read each:** `main`'s own run green →
  a READY Production deployment whose commit holds the merge → one notification, with the link. A green check is not
  done, and a merged pull request is not done (D143).
- A merge of notes only normally starts no build on Vercel: confirm the skip (`raptor-port/docs/gates-and-deploy.md`,
  "A notes-only push skips its build") and report the notes merged, without waiting for a new READY (D2032).
- His "merge live" (or "merge now") means his own look is done — never ask him about it again (D1640). If his look
  brings a change — or bringing `main` in to settle a clash changed this branch's own app code — the fix and its
  records are pushed together and his look is asked again (D1742, D1746).
- His "auto merge live" for a run covers all it produces, its records pull request too (D1093).
- Every stop that waits on him — the work done, a question, an answer, a look or any other input — gets one
  `PushNotification`, whether or not he seems to be watching: one line, plainly, never for progress, never twice for
  the same work (D1097).
- An unattended run does not stop or notify for a question: it parks it in the run's one list and carries on; preview
  links and questions go in the closing report; one notification, when the run ends or nothing authorised can continue
  (D596).
- Come back sooner only for a red check you cannot fix, a genuine question, or a merge he told you to hold. Waiting is
  not a reason — schedule a check-in, never report "still building".
- His look on his phone is the live look: the live app sits behind his sign-in, and the agent is never given a login
  to it (D143).

## The checks

- While the repo is public, GitHub's run of the pull request — about 6 minutes, the same set as his PC's — is a job's
  full check; on his PC run only the tests of what you change and the build the walk drives (D1086, D1089, D902). A
  branch with no pull request, or one based on another branch, starts no checks. GitHub's machines download the
  project without the walks' pictures, which no check reads (D1091).
- Nothing merges until GitHub's run on the branch's last pushed commit is green and he has said "merge live" (notes
  only: the rule above); a red run is fixed before his look is asked for (D1086, D151).
- Once the repo is private again the full check is back on his PC and his runner restarts — read the steps first (D89,
  D106, D1530).
- **Before the full unit suite, a browser-test run of more than one file, the Tracker smoke or a fanned-out walk, open
  the steps and take the checks lock.** Anything else that builds — even one browser-test file — waits until the lock
  is free; one unit test file, a typecheck or one walk script on a build already served needs none. Held: wait, never
  start alongside. Release a lock you took the moment the run ends, pass or fail; a stale lock: the steps (D228).
- A guard refuses a full run without the lock, a build while another chat holds it, a push that would land on `main`
  and a push while that branch's checks run ([PUSH-LOCK-GUARD], D976). It is a backstop, not the rule: every rule here
  is kept by hand all the same.
- **Before changing a file or function another open chat's branch also changes, message that chat** — what you will
  change and what you will leave — and settle the overlap at once; answer the same when asked, and repeat what you
  promised in your own `HANDOFF.md` block (how to compare the branches and reach the other chat: the steps); the
  merge order and "merge live" stay his, and a
  chat never merges for another (D302, D60, D78, D1746; notes only: D1407, D1737, D1980).
- Docs-only changes skip the gates, not the Docs guard, and not his word: only a change of notes merges by itself; a
  rule that governs the agent, a hook, a setting, a working guide or a workflow merges only on his "merge live"
  (D1407, D1737, D1980). A pull request that mixes code and docs runs everything (D151).

## Pull requests

- Do not watch pull requests: call `unsubscribe_pr_activity` immediately after opening one and never leave one
  watched; reading the preview link once is not watching. An explicit "babysit this PR" ask overrides, for that pull
  request only. The ship-to-live duty is unchanged.
- The app's "Auto-fix" is not left on either: found on, switch it off and say so (D1090).

## The full wording of this file, as it stood until 24 Nov 26 — moved whole to `raptor-port/docs/shipping-steps.md` (D2460); older wording, `raptor-port/docs/archive/rule-files-2026-11-08.md` (D138, D1735)
