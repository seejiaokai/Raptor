# The always-loaded rule files before they became checklists (the rules diet, step 4 part 2 — D1735, 8 Nov 26)

Moved here whole, byte for byte, by `backlog-archive.mjs --move` (D138, D1735), each leaving a one-line pointer where it
stood; searched, never loaded. Paths inside are from the repo root. The checklist in each file is the rule; this is the
old wording, with its stories and worked examples. Below, under one heading each, everything that stood below the title
of `.claude/rules/shipping.md`, `doc-structure.md`, `record-decisions.md`, `plain-language.md` and `bug-check.md` —
their own headings keep the level they had there.

## `.claude/rules/shipping.md` — everything below its title, as it stood on 8 Nov 26 before the checklist

Unscoped on purpose: a notes-only chat ships too, and `raptor-port/CLAUDE.md` loads only once a file under
`raptor-port/` is opened. Gathered here in the spring clean (24 Sep 26, D140, D141, D390, D1735) from `raptor-port/CLAUDE.md`
§How to work here and §Build & verify, whose Pages-era wording — and the full story behind each rule — is kept
whole in `raptor-port/docs/archive/raptor-claude-md-2026-09-24.md`. The rulings behind it are rows in
`.claude/rules/decisions/how-we-work.md`; the traps of the checks and the deploy: `raptor-port/docs/gates-and-deploy.md`.

## "Push" and "merge live"

- **Push a BRANCH freely; ASK before `main`** (owner, 23 Sep 26 — D60; notes only merge by themselves, D1407, but not a rules-diet step, D1737). A branch push changes
  nothing official and gives him a Vercel link to LOOK at, so it needs no permission; `main` stays
  gated behind his **"merge live"**. "Push" and "merge live" are NOT synonyms. The question only
  arose because D59 took the repo private (public again since D106, D1530), which meters Actions minutes (D89: checks move to his PC). **Never push while a pull request's checks are running** (D151): any push restarts them and cancels the run in progress.
- **Nothing reaches `main` without his explicit "merge live"** (owner, 2 Sep 26 — *"dont automatically push to
  live next time … then i will manually say merge live"*), whatever the change that touches the app. **Since D1407
  (27 Oct 26 — "All as recommended"; a rules-diet step waits for his word all the same, D1737): a pull request that changes only notes** (the rulings files (`.claude/rules/decisions/`, `.claude/decisions-full/`, `DECISIONS*.md`), `HANDOFF.md`, `OUTSTANDING*.md`, evidence sheets and their pictures (`raptor-port/docs/handpass/`, the picture folders) and the other reference documents under `raptor-port/docs/` — never the unscoped `.claude/rules/*.md` (this merge rule among them), `.claude/hooks/`, `.claude/settings*.json`, `.claude/skills/`, `.claude/agents/`, `.claude/launch.json`, `AGENTS.md`, `raptor-port/CLAUDE.md` or anything under `.github/`) **goes live by itself once its run is green** — the agent
  checks the file list, merges and says so in its report, and since a few checks read documents (the permissions table in `raptor-port/docs/data-model.md` §11, `engine-rules.md`, `remarks-vocabulary.md`, the behaviour registers) and the gates skip a notes-only pull request, the agent runs `npm run rulecheck` and the unit tests that read documents on his PC before such a merge until [REVIEW-LAYERS] builds the guard that does it, with the secrets scan. The 2 Sep 26 rule ended
  the old "auto-merge is the default" rule of 24 Aug 26. Parallel chats merge ONE AT A TIME, each on his word;
  the later one merges `main` in first and renumbers its own clashing rulings (D78).

## The loop, change by change (owner, 2 Sep 26 and 24 Aug 26)
- **Not held to the end (D1087, 20 Oct 26 — "Yes agreed"):** two to four related jobs of one area share one branch, one
  check and one merge on his "merge live"; a job he wants live at once goes on its own; nothing is piled up for one merge
  at the end (D485, D822).
- change → its own tests green locally (the whole gate set too once the repo is private again — §The checks) → commit and push to the session branch (one open PR accumulates the lot) →
  once the work is READY FOR HIS LOOK (built and checked) and its Vercel preview is Ready, send him the link — not
  after every push of unfinished work (D905, 15 Oct 26: "u are still working no need for a link as its not done yet");
  the link and the pictures come whenever you need him to review something, and when the work is done (D906);
  do NOT go quiet waiting on the checks → take the next change. While a preview or a check run cooks he will hand you more work: take
  it; never idle waiting on a rollout.
- **But never push while that PR's checks are running** (D151): any push restarts the whole run and cancels the
  one in progress, even notes-only. Look first — a push starts TWO runs at once, the short documents guard and the
  full checks, so read them all: `gh run list --branch <branch> --limit 6 --json status,workflowName,headSha`, and
  push only when no run of the branch's last pushed commit is `queued` or `in_progress` ([RUN-CHECK-BOTH-RUNS],
  D870); batch, push when it has finished.
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
  §Build & verify). The preview is NOT a gate (15 Aug 26): `vercel.json` at the repo root builds `raptor-port`
  for every push, untested, so a red preview is still just a preview — correctness rides the gates.

## Ship once per session, at the end (10 Aug 26) — moved whole to `raptor-port/docs/archive/rule-files-2026-11-02.md` (D1556); its live points are in "The loop" and "The checks" (D1086, D1087)

## "Done" means LIVE — and live means ON VERCEL (owner, 10 and 12 Aug 26; D143, 24 Sep 26)
- **On his "merge live" (D1742, 7 Nov 26):** the job's closing records were pushed before his look was
  asked for, written to be true once it is live; merge at once if the run on the last pushed commit is green, then
  confirm the live app as below — nothing is pushed between his word and the merge. If his look brings a change, the fix and its records are pushed together and his look is asked again (D1742). His "auto merge live" for a run covers all it produces, its records pull request too (D1093).
- **Tell him when you are done, with `PushNotification`** — when the work is genuinely finished, and when you
  are BLOCKED waiting on his answer. One line, plainly. Not for progress, not for a quick reply he is clearly
  watching, never twice for the same work. **Since D1097 (21 Oct 26): every stop that waits on him** — the work done
  and his next step due, a question, an answer, a look or any other input — gets its one notification, whether or
  not he seems to be watching; an unattended run keeps its one at the end (D596).
- **A green check is not done, and a merged PR is not done.** Once he has said "merge live" — never before —
  carry it the whole way without checking in: merge when the PR's checks are green → `main`'s own run goes green
  (on GitHub's machines while the repo is public, on his PC once it is private) → Vercel reports the live app READY (the Production deployment for that `main` commit —
  `gh api repos/<owner>/<repo>/deployments?environment=Production`, then its statuses) → ONE notification, with
  the link. **His "merge live" (or "merge now") means his own look is done — never ask him about it again (D1640, 4 Nov 26).** **His look on his phone replaces the live-page look** the agent used to do on GitHub Pages (gone
  since D59 and D343, the repo public again since D106, D1530): the live app sits behind his sign-in, and the agent is never given a login to it (D143).
- **During an unattended run (D596, 5 Oct 26)** a question is not a reason to stop or to notify: park it in the run's
  one list and carry on with everything else; preview links and questions go in the closing report; ONE notification,
  when the run ends or when nothing authorised can continue.
- The only reasons to come back sooner: a red check you cannot fix, a genuine question, or a merge he has told
  you to hold. Waiting is not a reason — schedule a check-in and let it fire, rather than reporting "still
  building".

## The checks
- **While the repo is public, GitHub's run of the pull request is a job's full check (D1086, 20 Oct 26 — "Yes agreed").**
  Open the pull request into `main` as soon as the job is built — a branch pushed with no pull request, or a pull request
  based on another branch, starts no checks — so GitHub's
  run (about 6 minutes since D1089 — 5m53s measured 20 Oct 26 — the same set as his PC's: build, the original's 728, unit, browser, the Tracker's, the rule and
  document checks) goes while the app is walked. On his PC run only the tests of what you change and the build the walk
  drives; no full gate run there. Nothing merges until GitHub's run is green and he has said "merge live" (a notes-only pull request: D1407 — not a rules-diet step, D1737); a red run is
  fixed before his look is asked for; its slowest checks are split across more machines, every area still run (D1089). GitHub's machines download the project without the walks' pictures, which no check reads (D1091). The run that counts is the one on the branch's last pushed commit; fixes found during
  the walk are batched and pushed only once the run in progress has finished (D151). Once the repo is private again (D106 ended — D1530 keeps it public until he says otherwise), the full check is back on his PC (D89).
- **A small follow-up fix on an open pull request whose whole set has already passed (D902, 15 Oct 26 — his "Ok")** runs only the
  tests it touches before the push; GitHub's run of the pull request is its full check, and nothing merges until it is green.
  A job's first push keeps the whole set on his PC — except while the repo is public, when GitHub's run is that check too (D1086, above).
- **While the repo is public (D106, 25 Sep 26; until he says otherwise — D1530, 31 Oct 26)** the checks run on GitHub's machines (the workflow sends a
  public repo there by itself) and his PC's runner stays STOPPED; when it goes private again, the runner starts again.
- **Once the repo is private (D89; public meanwhile, D106, D1530):** when the repo goes private, read this first — how the checks then run on his PC, moved whole to `raptor-port/docs/gates-and-deploy.md` §The checks run on HIS PC (D1556).
- **Parallel chats take turns through ONE lock on his PC (D228, 26 Sep 26 — "why not both? and deconflict the full
  checks").** Each parallel chat keeps its own branch, ports and rulings range (D228). Before the full unit suite, any browser-test run of more than one file, the Tracker smoke or a fanned-out
  walk, TAKE the lock: `node raptor-port/scripts/gatelock.mjs take "<branch> — <what>"` (or by hand: make the folder
  `C:\Users\User\.raptor-gates-lock` — it fails if it exists — and write `owner.txt`); if it is held, WAIT (check every
  few minutes; never start alongside); RELEASE it the moment the run ends, pass or fail (`… gatelock.mjs release`, or
  delete the folder). `… gatelock.mjs run` takes it, runs the whole gate set in order and releases when it ends — a run you
  STOP does not: release it yourself at once. A lock with no sign of life for 2 hours is stale — `run` and `exec` refresh
  its time stamp every minute while they run, and a lock taken by hand is refreshed with `… gatelock.mjs beat` during a
  long run ([GATELOCK-STALE-LIVE], 2 Nov 26); break a stale one and say so (ask its holder first while a chat that could hold it is open). One UNIT test file, a typecheck or one walk script
  on a build already served needs no lock; anything that BUILDS — a browser-test run of even one file — waits until the lock is free.
  The folder sits OUTSIDE every checkout, so every worktree on the PC shares it. **`… gatelock.mjs exec "<branch> — <what>"
  -- <command>`** takes it, runs that one command and always releases it. **A guard enforces this and the push rules
  (D976, `[PUSH-LOCK-GUARD]`):** it refuses a full run without the lock, anything that builds while another chat holds it,
  a push that would land on `main`, and a push while that branch's checks run — its refusal says what to run instead
  (`raptor-port/docs/gates-and-deploy.md`).
- **Parallel chats talk to each other so they do not clash (D302, 27 Sep 26 — "Can all 3 chats communicate so that there
  will not be clashing … U guys handle it").** Before changing a file or function another open chat's branch also
  changes (compare the branches: `git diff --name-only $(git merge-base origin/main <branch>) <branch>`), message that
  chat (`ListAgents`, then `SendMessage`): what you will change there and what you will leave; answer the same when asked;
  settle an overlap between you at once. Repeat what you promised in your own `HANDOFF.md` block. The merge order and
  "merge live" stay HIS — a chat never merges for another (D60, D78; notes only: D1407, D1737).
- **Docs-only changes skip the gates** (`paths-ignore` in `deploy.yml`: `**.md`, `.claude/**`, the document-gate
  scripts `raptor-port/scripts/docsize*.mjs` and `backlog-archive.mjs`, and `docs-guard.yml`) — but the Docs guard
  (`docs-guard.yml`, two to three billed minutes) still runs on every PR and every push to `main`. **An exemption from
  the GATES**; since D1407 a change of notes only (the list above) merges by itself once its run is green (a rules-diet step on his word all the same, D1737), and any other docs change
  (a rule that governs the agent, a hook, a setting, a working guide, a workflow) still merges only on his "merge live" (corrected 17 Sep 26, narrowed 27 Oct 26). A PR that mixes code and docs runs everything — and GitHub judges the WHOLE PR, so once it carries
  code even a notes-only push re-runs every gate (D151).

## Pull requests

- **Do NOT watch PRs** (owner, 15 Aug 26; the app's "Auto-fix" too: found on, switch it off and say so — D1090). The harness auto-watches an opened PR
  and floods the owner's phone with CI/review/Vercel `<wake>` blocks for little
  gain (gates + live page are checked before the PR opens; he leaves no review
  comments). Call `unsubscribe_pr_activity` immediately after opening any PR;
  never leave one watched. Doesn't change the ship-to-live duty. An explicit
  "babysit this PR" ask overrides, for that PR only.
- Reading the preview URL off the PR once is NOT watching (24 Aug 26) — fetch the link, then unsubscribe.

## `.claude/rules/doc-structure.md` — everything below its title, as it stood on 8 Nov 26 before the checklist

**Owner, 24 Sep 26 — D140:** *"read only what's applicable for the job automatically and knows how to navigate …
new info going into the repo will follow this structure automatically … so that I don't need to do another
optimisation in the future or spring cleaning."* **D141:** no line targets — the test is whether a block is NEEDED
where it sits, organised and written clearly. **D138:** a move never rewords; a rewrite is checked for meaning. The rulings' full text is a searched tier (D390), and each area converts to a page of how it works now (D1735).
The full policy and the tiers: `raptor-port/docs/doc-budget.md`. This file is its short, always-loaded form.

## What a chat reads, and when
- **Already loaded:** the rule files under `.claude/rules/` without `paths:` (this one, `shipping.md`,
  `plain-language.md`, `bug-check.md`, `record-decisions.md`) and the general rulings `decisions/how-we-work.md`.
  `raptor-port/CLAUDE.md` — the project guide and its map, §Where things live — loads once any file under
  `raptor-port/` is opened; most of its rules are ONE line, each naming its full text in `raptor-port/docs/guide-full.md` (D391).
- **At the start of a chat:** `HANDOFF.md` — where things stand (`## Now`, a block per chat) and what is next.
- **By itself, per area:** `.claude/rules/decisions/scheduler.md`, `leave-war.md`, `oil.md`, `tracker.md`,
  `people-accounts.md`, `it-flow-guide.md`, `inputs.md` (the Inputs pages — D802), `design.md` (the screen-design rulings — how a screen looks and behaves, loaded with screen work, D1554, D1735) — each area's rulings, settled decisions and architecture — load when a matching file is opened
  **with the Read tool**. A shell read (`cat`, `grep`) does not load them, and neither does planning before any file is
  open: **before planning or editing in an area, open its file yourself** — People & accounts for any work on
  accounts, sign-in, Admin → Users, Quals, one-door, posting in or out, archive, restore or delete (D390, D1735). A brief for
  ASTRA names the area files the change touches and their full-text files — Codex loads none of this by itself (D140, D141).
- **A ruling loads as one line — in an area converted to a page, as a statement of its page; its full row does not (D390, D1735).** Before acting on a ruling's detail or asking him about
  it, open its full row in `.claude/decisions-full/` — `grep -h '^| D149 |' .claude/decisions-full/*.md` (the shell;
  the Grep tool hides a long row).
- **When the job needs it:** the reference doc the map names. **Never whole:** an archive, a full-text rulings file or the guide's full text —
  search it.
- **Before telling him anything is undecided or missing:** search every rulings file, `DECISIONS-ARCHIVE.md` and
  `OUTSTANDING.md` (`record-decisions.md`).

## Where a new fact goes — one home each
| It is… | Its home |
|---|---|
| a ruling — a decision, preference, correction, "leave it", "no" | one full row at the top of its area's rulings table, the moment he says it; `backlog-archive.mjs --rulings` moves the row to `.claude/decisions-full/` and leaves its short line — in an area converted to a page, the page's line is rewritten or added instead (`record-decisions.md`, D390, D1735) |
| an open job, a found-not-fixed, a deferral, a question to put to him later | an `OUTSTANDING.md` item — the ONE backlog — and a line in its priority list |
| how a rule or a surface behaves (a contract) | `engine-rules.md`, `ui-contracts.md`, `feature-impact.md`, `performance.md`, `data-schema.md` (in `raptor-port/docs/`) |
| a rule EVERY task needs, whatever the area | an unscoped file under `.claude/rules/` (a general ruling: `decisions/how-we-work.md`) — `raptor-port/CLAUDE.md` loads only once a `raptor-port/` file is opened, so it carries the project-side copy or pointer, never the only one |
| a project rule every task under `raptor-port/` needs (how to build, verify, code) | ONE line in `raptor-port/CLAUDE.md` — at most 350 characters when it names a full text; if it outgrows the line, its detail goes under its own `###` heading in `raptor-port/docs/guide-full.md`, named by the line's ending pointer, one heading per short form (D391; the gate pairs them) |
| a rule or piece of architecture ONE area needs | that area's file under `.claude/rules/decisions/` |
| where things stand, what this chat left, what is next | this chat's own block under `## Now` in `HANDOFF.md`, rewritten at each handoff |
| a gate count | `HANDOFF.md` §Gate baseline — only a count from a run you watched |
| a gate or deploy trap | `raptor-port/docs/gates-and-deploy.md` |
| a new, renamed or deleted file | `raptor-port/docs/file-map.md`, in the same change |
| the story of how something was found or fixed | the commit message; a bug check's evidence sheet (`raptor-port/docs/handpass/`) |
| a plan, design, brief, review log, scenario list (the Claudex loop's too) | `raptor-port/docs/superpowers/{specs,plans,briefs}/<date>-<name>.md`, linked from its backlog item — never the repo root |
| a reference doc every chat of an area needs | `raptor-port/docs/`, AND a row in `raptor-port/CLAUDE.md` §Where things live (the gate checks) |
| a one-off handoff for a big job | NOT a new root file — this chat's block in `HANDOFF.md ## Now`, plus a tier-3 doc linked from its backlog item |

## When it leaves — moved whole, never deleted, never reworded
- A **finished backlog item** → `OUTSTANDING-ARCHIVE.md`, by `node raptor-port/scripts/backlog-archive.mjs <ID> --homes <file>`
  after its lasting facts have a pointer in a live doc (D29, D137).
- A **replaced ruling, one a later ruling restates in full (D971, a fresh reader checking each), or a spent one-off permission** → `DECISIONS-ARCHIVE.md`, by `… backlog-archive.mjs --rulings` (D136, D137, D1735) —
  its mark written in its full row in `.claude/decisions-full/`; the command drops its short line, and on a page every line citing it is rewritten first (D390, D1735).
- A `## Now` **block whose work has merged** → removed at the next handoff, once its open residue is filed.
- A **passage a newer ruling supersedes**, in a file every chat reads → moved whole to `raptor-port/docs/archive/` IN
  THE SAME CHANGE, leaving the new rule and a one-line pointer (newest-instruction-wins says fix the stale text; this
  says where the old text goes).
- **Anything no longer needed where it sits** (D141, D390, D1735) → moved whole by `… backlog-archive.mjs --move` (exact anchors,
  byte for byte, a one-line pointer naming the destination) to its home above. `node raptor-port/scripts/docsize.mjs
  --moves` then lists what left and did not arrive — the rewrites a reviewer must read.

## In his workflow
He works until the context is full, then hands off to a fresh chat; he seldom compacts; he merges only when happy,
on his "merge live"; he sometimes runs two worktrees in parallel and merges both (D140, D141, D390, D1735).
- **The handoff** is the step that matters: the session-handoff skill rewrites this chat's `## Now` block, files
  what is open, removes merged blocks, and gives him a ready-to-paste opening line that names `HANDOFF.md` and the
  branch, and Remote Control is on in the new chat (D1195 — the app's setting already connects it; where it is off, the new chat switches it on). **He picks nothing — he only pastes (D975, 17 Oct 26): the new-chat screen has no branch or
  worktree picker, so the outgoing chat releases its branch as its last step and the opening line switches the new chat
  to it, with what to do if the switch is refused** — a new job: level with `main`; an unmerged branch continuing: that
  `claude/<name>` branch; a just-merged branch: never. Compaction, if it happens, is the same: persist first.
- **Unattended runs (D596, D667, D766)** — when he leaves a job to run while he is asleep or away: moved whole to `raptor-port/docs/doc-budget.md` §5 (D1556); the overnight guide carries the same rulings.
- **Parallel chats** each touch only their own `## Now` block, their own backlog items and their own D-number range;
  the later merge brings `main` in first (D78).
- **The Claudex loop** (Opus 5.5 builds; the code read a fresh, blind Opus read, Astra and Sol 6.1 only on his call, Fable on his call only — D67, D353, D590, D601, D790, D903, D1734, D1738, D1739): plans and review logs are tier-3 docs (the
  table above); the ripple walk reads `feature-impact.md`.

## The check that keeps it
`npm run docsize` — in CI (the Docs guard) and, for everything but sizes, at the end of every turn (the Stop hook):
a lost or doubled backlog item or ruling, a rulings map out of step, a misfiled document (a new `.md` at the repo
root outside its short list, a document outside `raptor-port/docs/`, an always-loaded rules file nobody registered,
two `## Now` blocks for one branch, a new reference doc no map names), and `HANDOFF.md` losing its shape — a block's
`<!-- /now -->`, or one of `## Now`, `## Next, in order`, `## Gate baseline` (each once, in that order). Each always-read file also has a size
TRIPWIRE (D141, D390, D1735): crossing it means "move what does not belong here to its home", never "cut to a number" — and a
change that touches `raptor-port/src` never trims a document (D29, D137).

## `.claude/rules/record-decisions.md` — everything below its title, as it stood on 8 Nov 26 before the checklist

Unscoped, so it loads before any project file. The record is one file per AREA under
`.claude/rules/decisions/`, with `DECISIONS.md` at the repo root as the front door and map (D137 — the last
section's pointer below), and `.claude/hooks/record-decisions.sh` fires this check on every message he sends.

## The lapse this exists to stop

The story behind this rule — two misses of one evening, 21 Sep 26 (D13, D137), and why the lapse is misclassifying, not forgetting — is kept whole in `raptor-port/docs/guide-full.md` §Write his rulings down at the moment (D1556).

## The rule

**The moment he states something that outlives the current task, add it to its area's rulings file
BEFORE doing the work it implies** (D13, D137; the three steps — and, for an area converted to a page, its own steps — are at the head of `DECISIONS.md`). Not after the
work, not at the end of the session, not "once I see where it lands".

What counts: a ruling, a product decision, a correction to how you work, a preference, a "leave
it", an explicit no, a supersession of an earlier ruling, an answer to a question you put to him.

What does not: ordinary task instructions ("run the tests", "check that file", "push it"). Those
die with the task and belong nowhere.

**Every entry names the file that will now carry it — and then you make that file carry it, with its D-number
beside the ruling there** (the gate fails a new row whose Markdown home never mentions its number — `[RULING-HOMES-AUDIT]`,
28 Sep 26: one row's "corrected" home had never been corrected, and only reading found it).
The rulings list is an INDEX, never the only home. A ruling recorded only there is still lost,
because nobody reads an index while building. The home is the document the next session will
actually open: the behaviour register, `engine-rules.md`, `ui-contracts.md`, the standing order,
the area file, or `raptor-port/CLAUDE.md` if EVERY task needs it (`doc-structure.md`). **Never `OUTSTANDING.md` alone** (D29 rule 2, 23 Sep 26; D137): the backlog
is where finished work leaves from, so a ruling homed only there is one archive pass from lost.

**Put it where it BELONGS, not where you happen to be working.** That is the specific error both
misses shared.

## Two catches, because the moment will sometimes be missed

1. **The checkpoint sweep.** Before any handoff, any commit that closes a piece of work, and any
   report that calls something done: re-read what he actually said this session, list every ruling,
   and check each one is in its area's rulings file **and** in its real home — and that every ruling
   it REPLACED or RESTATES IN FULL (D971), and every one-off permission it SPENT, is marked and archived (`DECISIONS.md` step 2).
   This is what catches what the moment missed.
2. **The report line.** Every closing report carries, beside Status / Changes / Checks / Walk:

   `Rulings: <n> recorded → <area file(s)> (D<x>–D<y>)` — or `Rulings: none this session`.

   A field that cannot be filled without doing the thing makes a miss visible to HIM, not just to
   you. That is the same shape as the `Walk:` line, and for the same reason.

## When a ruling overwrites another — fix what it leaves behind (D201, 26 Sep 26)

**Owner:** *"every new ruling if it overwrites the old ones make sure u fix the things u mentioned."* The later ruling wins
(D90, D201) — but the older one lives on in every file that still states it, in the app that still does it, and by its absence
from the lists that should carry the new one. Nobody reading those later knows the rule changed. So, **in the same change
that records the ruling**:
1. **The documents.** Search for the rule's SUBJECT (the thing it governs — "own row", "change history", "OIL award"), not
   only its D-number, across `raptor-port/docs/` (the reference docs, `data-model.md` and its §11 permissions table,
   `handover-dataverse.md`, specs, look cards), code comments and test names. Correct each, or mark it with a pointer.
2. **The app.** If the app does not yet do what the new ruling says, file the build in `OUTSTANDING.md` with its place.
3. **The lists.** Add the ruling to every list it belongs in that does not carry it (the permissions table, a register).

The new row's "Where it lives now" names what was fixed and what was filed. A change inside `raptor-port/src` still never
trims a document (D29, D137) — a correction is not a trim.

## If you notice a ruling you never recorded

Say so plainly and record it, however old. Do not quietly fold it in — he has no way to tell the
difference between a ruling that was captured and one that merely got done, and that ambiguity is
the whole problem.

## READ IT BEFORE YOU ASK HIM ANYTHING (added 22 Sep 26)

The rule above is the WRITING half, and it works — on 22 Sep 26 an approved design was saved to
`docs/mock/`, ruled on four times in `DECISIONS.md` (D38–D41) and filed in `OUTSTANDING.md` as the
next job. Every one of those records was correct and current.

**And the agent still told the owner no design existed, and put the settled question to him as an
open choice.** It answered from a CODE COMMENT that had gone stale the same afternoon. He had to
ask three times before it searched the record.

**Owner, 22 Sep 26 (D53, D137):** *"God dam why u need me to tell u 3 times to find the mock up? Is it because
u didn't save this to outstanding?"* — the answer was no. Saving was never the problem.

### The check

**Before you tell him something is undecided, before you put ANY choice to him, and before you call
anything missing or unbuilt: search the rulings and the backlog** — `.claude/rules/decisions/` (every
area, not only the ones loaded: an area loads only when one of its files is READ, so a notes-only or
design session has none of them), **the full rows in `.claude/decisions-full/`** (a short line — or a page's line once its area converts — is the rule; his
words, its conditions and its readings are only there — D390, D1735), `DECISIONS-ARCHIVE.md` and `OUTSTANDING.md`. Not
the code. Not the specs folder. Those, by keyword, every time — with the SHELL's grep: the Grep tool prints
"[Omitted long matching line]" for a full row, and a search that returned no text is not a read. It costs one search.

The three failures that made this check — a named entry is a pointer, not a scope; the backlog is read every time; search for a claim's SUBJECT, never its phrasing — and why a code comment is never evidence about today (the rulings win; fix the comment in the same change): kept whole in `raptor-port/docs/guide-full.md` §Write his rulings down at the moment (D1556).

## Keeping the list whole, and read by relevance (D136, D137, D390) — moved whole to `raptor-port/docs/doc-budget.md` §5 (D1556)

## `.claude/rules/plain-language.md` — everything below its title, as it stood on 8 Nov 26 before the checklist

Applies to EVERY message to the owner, in every session, whatever the task — not only while
building. The owner is NOT technical. This file is the operative short form; the full reasoning and
the dated owner decisions behind it live in `raptor-port/CLAUDE.md` §How to work here and, in full, in
`raptor-port/docs/guide-full.md` (6 Aug, 10 Aug and 13 Sep 26). Where they differ, those are the source of truth —
but these directives stand on their own so they are in force before any project file is read.

- **Never paste raw output at him.** No log lines, stack traces, JSON, run ids, commit hashes, HTTP
  codes, `file:line` references or CSS class names. Read the thing yourself and report what it
  MEANS. "The publish step gave up after ten minutes" — not the error text.
- **Lead with what it means for him**, then the detail only if it earns its place. He wants to know:
  is it working, is it live, what do I do now.
- **Name things the way the app does.** "The ring around the puck", "the warning list", "the
  previous day" — never internal function, file or class names. Those belong in code comments and
  commit messages, which are written for the next agent, not for him.
- **Say what you did and whether it worked.** A gate table with counts is fine — that is a result,
  not jargon. A walkthrough of the diff is not.
- **Keep it SHORT and ordinary.** Short sentences, everyday words. No flourishes, no drum-roll
  structure, no repeating a point for effect. If a reply runs past a screen, most of it is probably
  restatement.
- **This is about VOCABULARY, not depth.** Never thin out the reasoning, the trade-offs or the
  caveats — say them in ordinary words. Never hide a limitation because explaining it would cost a
  sentence more.
- **Don't put technical or implementation decisions to him.** Make the call yourself and say what
  you decided and why, in plain terms. Product-direction choices stay his.
- **End at a decision point with a concrete, numbered "here's what you do now."** When you stop to wait for him, the
  message itself says so — that you are waiting, and for what — with your own recommendation (a handoff question says
  whether you recommend it, and why); never only in the app's next-step box (D904, 15 Oct 26). Whenever you need his
  review, and when the work is done, the preview link and the pictures come with it; whenever a handoff is due, the
  ready-to-paste prompt (D906).
  **Anything on screen talked about — a change, a question, or only what a backlog item is and where it sits — comes with
  pictures of the real app, the place marked, the first time it is raised; never words alone (D853, D921).**

When a technical term is genuinely unavoidable, define it in the same sentence in ordinary words,
once — then keep using the plain phrase.

## A CHECK BEFORE YOU SEND (added 17 Sep 26, after this rule was broken repeatedly)

The rules above were in force all session and still got broken three times — the owner had to ask
"can you re-explain that with less jargon" three separate times, and said it made the reply read
like it might be made up. A rule you agree with and don't apply is worth nothing, so here is a
mechanical check. **Run it on every message before sending.**

1. **Scan for names only a programmer would know.** Any function name, file name, field name,
   record shape, count of "fields", flag, hook, or internal noun (`histPush`, `schedFields`,
   `crossable`, "the record shape", "the registry", "the seam", "the funnel", "the envelope",
   "latching", "decomposition", "disclosure"). Each one is either DELETED or replaced with what it
   MEANS to him. Not defined — replaced.
2. **Name things the way the APP does**, as he sees them on screen: the schedule, the day, an
   amendment, publishing, signing, the working copy, a saved plan, the ring around the puck, the
   warning list. If a thing has no name on screen, describe what it does in a short phrase.
3. **Every claim gets its consequence.** Never "X was wrong, fixed". Always "X said this, it's
   actually that, and here's what would have gone wrong." He judges importance by consequence; a
   bare correction reads as noise or invention.
4. **Cut it — but shorter is never thinner (D825, D832).** If a section is longer than the point needs, most of the excess is restatement: cut restatement and filler, never the app's name for a thing, a number he would judge or act by (a count, a date, a time, a size — an id, a hash, a code or a line number is check 1's to remove), a reason, a consequence or what he must do. Before sending something he will act on, find each of these in the words themselves — what happened, what it costs him, what he does now; one you can only supply from what you know is a fact you cut.
5. **Ask yourself: would this sentence mean anything to someone who has never opened the code?**
   If not, rewrite it. That is the whole test.

**If he asks you to re-explain something, treat it as a defect in your writing, not a gap in his
understanding.** Re-explain fully, without shortening the substance, and don't repeat the framing
that failed. Do not defend the first version.

**Longer context makes this WORSE, not better.** The drift showed up in the long, dense replies
late in a session, where internal vocabulary had been building up for hours. The more context you
are holding, the harder you run this check.

## `.claude/rules/bug-check.md` — everything below its title, as it stood on 8 Nov 26 before the checklist

Unscoped on purpose, like `plain-language.md`: this loads before any project file is read, so it is
in force before anything else can talk you out of it. The full method is
`raptor-port/docs/bug-check-order.md`. This file exists to make sure you OPEN that one — by its checklist,
`raptor-port/docs/bug-check-checklist.md`, which names the section to open at each step (D1735).

## The trigger — you decide this, never the owner

**He must never have to say which checks to run** (D9). The moment any of these is true, the bug-check
order is in force:

- he asks to bug-check, test, verify, review, "check for bugs", "make sure it works", or asks
  whether something is safe to merge;
- you have just built, fixed or changed anything under `raptor-port/src`;
- you are about to report a piece of work as done, ready, or ready for "merge live";
- he reports something wrong on screen, or asks why something looks or behaves a certain way;
- a review, a gate or a reviewer hands back a finding you are about to act on.

**Then, before you execute anything:**

1. **READ `raptor-port/docs/bug-check-checklist.md`, and at each step the section of the order it names** — whole,
   whenever that step applies (D1735). Not from memory — open them. They change.
2. **Answer its eight questions** (§5) against the actual change, and state the TIER out loud:
   NONE / LOOK / WALK / FULL. If you cannot answer a question NO with a reason you could write
   down, the answer is YES.
3. **Tell him, in one short block, what that tier means you are about to do** — the list of checks, the
   SIZE of the walk and why (D607, D608 — step 4), and roughly how long. He reads it; he does not have to choose it.
   If he wants less, he will say so, and that is his call to make, not yours to assume.
4. **Then execute it**, in the order §5 gives (roll-call and door check → SIZE THE WALK, `raptor-port/docs/walk-ledger.md`
   → walk → gates → the model reads → fix → re-walk what the fixes touched → evidence sheet → his look).
   **Sizing never means no walk, and a test that changes the data directly never stands in for pressing a control
   on screen** (the order's §7.0 — D607, D608).

## A fault he finds that the walk missed (D1297, 24 Oct 26)

Learn from it by yourself (D1297), the same day, without asking him: fix it red-first, write why the walk missed it as a lesson
in the order's §7.11, and from then on every sizing step and walker's brief checks its scenarios against that list.
Every closing report names the lessons added, and he may strike any (D1297).

## The three that get skipped under pressure — do not

- **A code review plus green tests is NOT a bug check.** Two frontier models passed the OIL build;
  the owner then found three defects by opening the app, all of them surfaces that were never
  wired up. Reading code cannot find a line that is not there.
- **The ROLL-CALL comes first.** List EVERY place the app draws the thing you touched, and give
  each one a written *has it / must not, because… / MISSING*. No blank cells. That one table would
  have caught all three.
- **A walk that left no picture did not happen.** The closing report carries the `Walk:` line from
  §9. Without it, nothing may be reported as ready for "merge live".

## When to call in Fable and Codex

§4 of the order decides it, not habit (D353: scenarios and side questions ONE, Astra first; a plan's red team BOTH). Short form: **scenario design first** (ask them what is
MISSING, not whether the code is wrong), **both of them reading the code** only on money, published
records, permissions or persistence — and **never another static review when what is missing is
someone running the app.** That last one has a name now: review pile-on.
**Who they are now (D590, D601, 5 Oct 26 — Astra and Sol 6.1 only on his call since D1734, as D1738 and D1739 call Astra for the rules diet's reworded steps):** for work Opus wrote, Astra reviews and Sol 6.1 is the second reader where two are
required; Fable is on call only (a bug Opus cannot crack, or a big open-ended plan, on his word). What Codex wrote, Opus reads.
**Unless he calls for a ChatGPT reader (D790, 13 Oct 26 — "Yes option 2"; D1734, 7 Nov 26: his subscription is back on a Pro plan with lower limits, and Astra or Sol 6.1 is called only when he calls for it, each time):** every job that needs a code read gets a FRESH, blind
Opus read of its finished code (never by the chat that wrote it). **Fable is used for nothing unless he calls for it (D903,
15 Oct 26 — "don't include fable in anything anymore unless I call for it")** — the riskiest changes get the Opus read alone.

## WHAT IS NOT A FINDING (owner, D56, 23 Sep 26) — read this BEFORE you spend anything

*"Make sure the bug checks dont waste time catching these bugs in the future. It will not happen
because ill clear all the demo data anyway before shiping this app into a real database."*

**A problem that lives ONLY in data already stored is not a finding (D56).** No reviewer, no walk step, no
fix. The whole store is demo data and is CLEARED before the database step.

**Both must be true or the rule does not apply:** the harm exists only in data already stored, AND
the code is already correct going forward. If new data would be hurt too, it is a real finding.
**"Pre-existing" alone is NOT this** — that is about the defect's age; this is about the data's
future. Put the exclusion in the REVIEWER'S BRIEF so the finding is never produced (order §2b, §4).

## If you catch yourself about to skip it

Say so to him, plainly, and say why. A skipped check he agreed to is a decision; a skipped check he
never heard about is how three bugs reached him on 21 Sep 26.

## With the Claudex loop — moved whole to `raptor-port/docs/bug-check-order.md`, after §4a (D1556)
