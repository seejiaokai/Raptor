---
name: session-handoff
description: Use when the user says "session handoff", "wrap up", "hand off", "handoff summary", "I'm moving to a new chat", or is otherwise about to continue this work in a fresh session. Produces a handoff the NEXT session can actually read — this chat's block in HANDOFF.md, committed to the repo, because the next chat (often on another device) cannot see this one.
---

# Session handoff (RAPTOR)

The next session is a **fresh chat** — often on another device, after a pull, or in a fresh container and clone. It
cannot see this conversation: anything it needs must live in the repo or in git.

The reader is a future agent, not the owner: terse and concrete. That does NOT override the `CLAUDE.md` rule that
explanations to the owner stay plain-language and complete.

The old wording of this file, its stories with it: `raptor-port/docs/archive/session-handoff-skill-2026-11-10.md`
(D1975, D1978).

## Step 1 — write this chat's block in `HANDOFF.md`, every time

The ONE handoff is `HANDOFF.md` at the repo root (D140): `## Now` holds one block per open chat's branch,
`## Next, in order` the project's order, then the standing facts. His instruction: the handoff notes go into the repo,
so the next chat just pulls and reads. The structure every fact follows: `.claude/rules/doc-structure.md`.

**The handoff is COMMITTED AND PUSHED to the chat's `claude/<name>` branch.** It reaches `main` only by
`.claude/rules/shipping.md`'s rule: on the owner's explicit "merge live" (D60 — pushing the branch needs no
permission) — or, where the whole pull request changes only notes (that file's "only notes" list), by itself once its
run is green, the agent merging it by that file's steps — the file list checked, `npm run rulecheck` and the unit
tests that read documents run first, under the merge lock, and said in its report (D1407; a rules-diet step waits for
his word all the same, D1737). So most sessions
end on "pushed, PR open, awaiting merge live": hand him the Vercel preview link and say so in chat. **That is the
NORMAL end state, not an Unfinished item.**

**Look before the push** (`shipping.md`; D151, D870) — any push cancels a run in progress:
`gh run list --branch <branch> --limit 6 --json status,workflowName,headSha`, and push the handoff only when no run of
the branch's last pushed commit is `queued` or `in_progress`.

"Unfinished" means any of: work not yet pushed or not yet handed to the owner, a gate that is red or was never run, a
half-applied edit, a question the owner never answered, a half-finished piece of work THIS session deliberately
stopped on, or a PR left under `subscribe_pr_activity` watch.

- **Write this chat's block, EVERY handoff** — even when nothing is pending (then the block says so in two lines: the
  branch, its PR and state, "nothing pending"). A chat that skips its block leaves the previous block to be read as
  current, which is worse than no handoff at all.
- **Only your own block.** It sits between `<!-- now:<branch> -->` and `<!-- /now -->`; rewrite it WHOLE (never append
  to it — a block that accumulates becomes a changelog, and `git log` already is one). Newest block first under
  `## Now`. Change it with the editor tool, between its two markers. A script that cuts or replaces a block matches
  each marker anchored to the start of its own line — never as a substring: a block may quote a marker, and text the
  same script has just inserted may repeat an anchor — and `npm run docsize` runs before the commit (it checks the
  file's markers and its three headings).
- **Another chat's block** is removed only when `git fetch` shows its work merged into `main` AND anything it left
  open is already an `OUTSTANDING.md` item. Otherwise leave it exactly as it is — a parallel chat (a second worktree)
  owns it, and the later merge keeps both (D78). The document gate warns when a block's branch is already merged, and
  fails two blocks for one branch.
  - The residue check is a READ of that block, made when it is removed: every line it marks owed, open, "not filed" or
    "to tell him" is matched to a backlog id, a ruling or an evidence sheet — never taken from a later block's
    sentence that "its leftovers are filed". A long block goes to a helper with that exact brief, and the host checks
    its quotes.
  - Before removing any, list the open pull requests that change `HANDOFF.md`
    (`gh pr list --state open --json number,headRefName,files`): while one is open, leave the blocks beside its own,
    or tell its chat that its next push needs `main` brought in — a clashing pull request runs no checks.
- **Open residue goes to the backlog, not the block:** anything still open becomes (or updates) an `OUTSTANDING.md`
  item with its place in the priority list; the block names it in one line. A standing item already in the backlog is
  NOT this chat's leftover — name it in one line only if the next chat needs the pointer.
- **Every open pull request is accounted for.** Run `gh pr list --state open` and name, in one line of the block, each
  one no `## Now` block owns ("Also open, waiting for his merge live: …"), with how far behind `main` each is.
- **One notes branch per chat:** an inherited notes-only pull request and this chat's own block go on one branch and
  merge once — each extra pull request is another race with the level check while other chats merge.
- **`## Next, in order`** changes only when the order itself changed (his word, or an item finished); it is the
  project's, not this chat's. Read its first line before the commit all the same: a "RIGHT NOW" line whose work has
  merged is moved whole to `raptor-port/docs/archive/` and replaced by a pointer to `OUTSTANDING.md`'s priority list —
  no writer owns it, so it rots.
- **Print the same block in chat,** and give him the opening line (below).

### The opening line he pastes

**Every handoff ends with his ready-to-paste opening line for the fresh chat** (his standing instruction): the line
itself puts the new chat on its branch, then "Read `HANDOFF.md` — the `claude/<branch>` block under `## Now` — then …".

- **He picks nothing; he only pastes (D975; this wording approved, D976).** The new-chat screen has no branch or
  worktree picker: each new chat starts in a fresh worktree on a fresh branch of its own. So the opening line does the
  switching:
  - **A NEW job:** "run `git fetch origin` and check this branch is level with `origin/main`" — never "git pull",
    which pulls nothing on a branch with no upstream; "git pull" is for a chat continuing a pushed branch.
  - **A fresh chat that continues THIS chat's branch:** "Switch this chat to the branch `claude/<name>`:
    `git fetch origin`, `git switch claude/<name>`, `git branch -u origin/claude/<name>`, `git pull --ff-only`. If the
    switch is refused because another checkout holds the branch, release it there only if that checkout — the folder
    git names in the refusal — has no uncommitted changes (`git -C <that folder> status --porcelain` prints nothing)
    and is on the same commit as `origin/claude/<name>` (`git -C <that folder> rev-parse HEAD` equals
    `git rev-parse origin/claude/<name>`); then `git -C <that folder> switch --detach` and switch again. Otherwise
    stop and tell him which folder holds it and why it was left alone." The `-u` line matters: git's `push.default`
    here is `upstream`, so a branch left tracking `origin/main` pushes to main.
  - **A branch that has just merged:** never named.
- **Every opening line says:** "if `git status --short --untracked-files=no` shows changes you did not make, or
  another chat works in this folder, do not switch branches here: a new job runs
  `git worktree add --no-track -b claude/<new-name> ../Raptor-<short> origin/main`, a continuing one
  `git worktree add ../Raptor-<short> claude/<name>` (the branch itself, never detached, so its commits land on it) —
  a short path, never under a temp or scratchpad folder — and works only there; make one write there first, and if the
  file tools refuse it (a chat started in a worktree may not write into another), stop and tell him." The walks'
  untracked pictures are not another chat's changes. Two chats switching one folder put one chat's commit on the
  other's branch.
- **A design or question job:** the line says why the job is due now and what he will get from it (pictures and
  questions; nothing in the app changes).
- **A chat number in it is a hint:** "the next free number in `main`'s `HANDOFF.md` when you start (was N at <time>)",
  checked there before use.
- **Ready to paste means it goes out UNCHANGED:** never put a choice inside it as a `<a / b>` slot — he will send it
  unfilled, beside an instruction that cannot wait. Ask each open choice as its own numbered question first, or give
  one complete line per option.
- **Tell him to TYPE a word of his own after pasting it** ("go"; "I'm away — run it"): a first message that is only
  pasted text may be held for his confirmation, which stalls a start he meant to leave unattended.

### Release the branch as your LAST step (D975)

Git allows a branch in one folder at a time. Write "released" on the block's "Branch:" line before the final commit;
once that commit is pushed, run `git switch --detach` in this checkout as the very last command — nothing is edited or
committed after it.

- If the push has to wait (a check run in progress, D151), the line says "not released — push waiting" and the release
  waits for the push.
- A notes-only pull request this chat merges by itself (D1407) is merged first, once its run is green: the release
  comes after that merge — and, if `main` had to be brought in, after that push.
- If he gives this chat more work afterwards, switch back first (`git switch claude/<name>`); if git refuses because a
  new chat now holds the branch, that work belongs to the new chat — tell him so.
- When this chat stays open by design (it hands a side session the work), the opening line instead keeps the new chat
  on its own branch: `git fetch origin`, `git merge --ff-only origin/claude/<name>`,
  `git branch -u origin/claude/<name>` (check `branch.<b>.merge` never names `main`), pushes by
  `git push origin HEAD:refs/heads/claude/<name>` — and this chat pushes nothing more to it.

## Step 2 — gather state, in this order

1. **This conversation** — decisions made, questions the owner left hanging, things deliberately pushed to later. You
   know what you touched; do not grep to rediscover it.
   **Unless the context was cleared or compacted mid-session** — then you do NOT know, and guessing is worse than
   looking. Reconstruct from `git log --oneline origin/main..HEAD` and `git diff --name-status origin/main...HEAD`
   (or, if this session's work has already merged, the session-start range Step 3 gives), and say in the file that
   the early context was lost so the next session weighs it accordingly.
2. **Git** — `git status --short` and `git log --oneline -5`: the next session cannot read this chat but can read
   git, so git is the reliable half of the handoff.
3. **GitHub** — each PR's number and state, READ now, whether its checks passed, and any PR left under watch. The
   owner merges between sessions, so the file records merge state as "PR #N — open when this was written; check before
   acting", never as a bare "not merged" the next session will trust.
4. **Plan file**, if one drove the session (the harness's `plans/` folder: `~/.claude/plans/` on a desktop,
   `/root/.claude/plans/` in a web container).
5. **What is still running, and what the next chat is told to use.** Helpers, a served build, the check lock, a
   background run: for each, who receives its report and who releases it — and that this chat does NOTHING further
   once a new chat picks the block up (or exactly what it will finish). Every result that so far lives only in this
   chat or its scratch folder is copied into the repo before the block is committed. A job the block gives to a named
   model or tool is probed once, by the route the next chat will use; the working command — or "not reachable from
   here, because …" — goes in the block.

Nothing further — no broad Glob sweeps, no filesystem audit. If you did not touch it this session, it does not belong
in the handoff. (Step 3's check is the one exception, and it is bounded to this session's own diff.)

## Step 3 — check the durable docs were kept true

`raptor-port/CLAUDE.md` §Coding conventions requires every PR to keep the records true, each fact in its one home
(`.claude/rules/doc-structure.md`). That is easy to forget on a small change, and the document gate checks only part
of it; the handoff is the last moment before the chat ends, so it checks it here — a **bounded** check, not the
filesystem audit Step 2 rules out. One command, over this session's diff only:

```
git diff --name-status <session-start-commit>...HEAD
```

**The range must start at the commit the session STARTED from and end at your own `HEAD`** — the parent of your first
commit (`git log --oneline -8` shows it). Both wrong ranges fail silently, reporting a clean bill on a session that
added files: `origin/main...HEAD` is empty once the session's work has merged, and `<start>...origin/main` is empty
while the work waits on the branch for "merge live".

**If a merge to `main` happened this session** — yours or the owner's — re-read the WHOLE `## Now` section of
`HANDOFF.md` and reconcile every block against `git log origin/main`, not only the block this session wrote: a block
whose branch merged is removed once its open residue is filed (Step 1). A "current state" section must hold nothing
already done, and the staleness an earlier session left sits in lines your diff never touched.

**A merge that changed `.claude/settings*.json`, `.claude/hooks/` or `.claude/skills/` is in force only once the main
checkout (`C:\Users\User\projects\Raptor`) is on `main`:** a worktree chat started from the desktop app loads those
from the main checkout, not from its own folder. When the main checkout is on another branch or behind `origin/main`,
follow the guarded, full-path recipe in `raptor-port/docs/gates-and-deploy.md`, "A worktree chat loads its settings,
hooks and skills from the MAIN checkout". If any condition fails, leave it alone and name what holds it. The block's
pick-up then tells the next chat to verify by what the app itself reports (`get_usage`, the skill list) — never by
running the script by hand.

**Merged between chats — sweep for it, whoever merged.** He merges on his own word, often after the chat that built
the thing has ended. For every `## Now` block and every line of `OUTSTANDING.md`'s priority list that says "waiting
for … merge", read the named pull request's state now (`gh pr view <n> --json state`): one that has merged is retired
or rewritten in the same change, or named to him if its residue is unclear.

For each path the diff reports, confirm — by reading the live record that holds it (`HANDOFF.md`, `OUTSTANDING.md` or
`raptor-port/docs/file-map.md`), not from memory:

- **Added / renamed / deleted source file** → is it in (or gone from) the file map, `raptor-port/docs/file-map.md`? A
  file that never reaches the map is invisible to every later session.
- **A known issue RESOLVED** → its `OUTSTANDING.md` item LEAVES, by
  `node raptor-port/scripts/backlog-archive.mjs <ID> --homes <file>` — never left in place as a "RESOLVED" note:
  1. Before it leaves, walk EVERY deliverable the item ever named — its oldest blocks included — and mark each done,
     filed as its own item, or dropped by a ruling: a status line's "the only thing left is X" is a summary, not a
     check.
  2. Search the full rulings rows (`.claude/decisions-full/`) for the item's id named as a HOME, too: point each at
     `OUTSTANDING-ARCHIVE.md` first, or the gate refuses the move.
  3. The script leaves the item's line in the priority list, and the document check passes it: remove that line by
     hand in the same change.
  4. On a pull request that carries code, archive what the job finishes BEFORE its last checked commit — a refusal
     met after his "merge live" costs another whole check run (D151).
  5. Its contract goes to the right structured doc first (`engine-rules`, `ui-contracts`, `feature-impact`,
     `performance`); its story goes in the commit message — that is what makes `git log` the changelog.
- **A known issue CREATED** → an `OUTSTANDING.md` item: what is open and the pointer, no narrative, and its place in
  the priority list.
- **A rule the owner changed** (roles, gates, validation, auth) → `.claude/rules/record-decisions.md`'s "fix what it
  leaves behind" (D201); the same fact often sits in `README.md`, `raptor-port/README.md` and `CLAUDE.md` too. Grep
  the changed term across `*.md` and fix every copy.
- **A NUMBER this session moved** — the one the bullets above miss, because nothing was added, removed or re-ruled:
  test counts, DOM ceilings, measured node counts, budgets, timings. They are quoted in prose that no test reads, so
  nothing else can catch them. Check two places by name: `HANDOFF.md` §Gate baseline (the counts, which you may only
  restate if you re-ran them) and `raptor-port/docs/probe-sweep.md` (the live `DOM_CEILING` values and the list of
  raises).

**`HANDOFF.md` is a CURRENT-STATE doc** — read at the start of every chat, so every line costs every chat. It has a
fixed shape (its own head; `.claude/rules/doc-structure.md`), and an edit lands in its section and nowhere else:
- the header — what the file is, how blocks are written — and the standing reference below the baseline
  (`## Standing constraints`, `## Where to look`, `## Moved …`): edit only when the fact itself changes;
- `## Now` — one block per open chat's branch (Step 1); merged blocks come OUT;
- `## Next, in order` — the project's order, short, pointing into `OUTSTANDING.md`'s priority list;
- `## Gate baseline` — only the newest watched count (the number bullet above), never a per-batch history: the count
  it replaces moves whole to its archive file (D1733).

Open work is NOT kept here — it is `OUTSTANDING.md`, the one backlog. The file map is `raptor-port/docs/file-map.md`;
the gate and deploy traps are `raptor-port/docs/gates-and-deploy.md`. Never write the story of how something was
found or fixed into `HANDOFF.md`: it belongs in a commit message, a backlog item or a structured doc, and the
document gate's ceiling on the file is the tripwire that says so. `HANDOFF-ARCHIVE.md` stays a FROZEN snapshot (as of
4 Sep 26) — never append to it; a whole section that is no longer needed leaves by
`node raptor-port/scripts/backlog-archive.mjs --move` to `raptor-port/docs/archive/` (`.claude/rules/doc-structure.md`).

Fix what you find, in this session's final commit. If a gap is real but outside what you were asked to do, put it in
**Unfinished** — never leave it found-but-unrecorded.

**Condense this chat's own scaffolding** (owner, D69): the progress notes it wrote into the repo to survive a
compaction — a running block in an evidence sheet, a context doc's working log — are cut down to state, decisions and
pointers when the work closes, keeping every rule, condition, date and reason (D138 — when in doubt, move the block
whole to `raptor-port/docs/archive/` with `backlog-archive.mjs --move` instead of rewording it), as their OWN
docs-only commit before the final push. Only what THIS chat wrote, and never inside a fix (D29).

## Step 4 — the template (this chat's block)

Same structure every time. Write "none" rather than dropping a line — stable structure is the point.

```
<!-- now:claude/<name> -->
### CHAT <n> — <one line: what this chat was about>, written <date> — verify before use
- **Where it started:** <1-2 sentences: what the owner asked for, constraints that emerged>
- **Shipped:** <change> — PR #<n>, open/merged when written; checks green/red/not run
- **Unfinished:** <item> — <state, what is left> (or "none"); open residue → `[ITEM-ID]` in OUTSTANDING.md
- **Branch:** `claude/<name>`; its PR <#n or none>; released here (`git switch --detach`) — or why not. If it has MERGED, the next chat starts as a new job — its own
  fresh branch, level with `origin/main` — and never switches to this one.
- **Gates:** GitHub's run on the last pushed commit — <green / red / in progress / none, and why>; on his PC —
  <each check run: the run that made it and its count — "the whole Leave War project, 227 files / 4,037 tests" or "only the
  touched files: a, b" — or red / not run; never a bare "green">; `npm run probes:adapted` · `npm run perf` — <the same>
  (not in CI, so a UI or validation change shipped without them is Unfinished, not a footnote).
  Run from `raptor-port/`; a fresh checkout needs `npm ci` first.
- **Open questions for him:** <question> — <context needed to answer it> (or "none")
- **Running when written:** <helper / served build / lock / background run — who receives its report, who releases it> (or "none")
- **Pick up here:** <1-2 sentences: the single most likely next action; a plan file that drove the session first>
- **Opening line:** <the exact line he was given for the fresh chat — the next chat compares its first message with it>
- **Rulings:** <the numbers recorded this chat, or "none"> · **Walk:** <the closing report's line, or "none", and why> · **Reads owed:** <each read a job went without, or "none"> · **Next chat number:** <the next free number, checked against `main`'s `HANDOFF.md` and every open block when this block is written> (D1744)
<!-- /now -->
```

**What makes the block something the next chat can act on:**

- Every step the next chat is told to RUN names its command, and what that runs is committed (check each path with
  `git ls-files`). A list of cases to run goes into the repo as data beside its runner, not as a sentence.
- A "to build" list that turns a ruling into code names says "the agent's reading". The ruling's own words stay the
  spec: the next chat re-derives the list from them against the code.
- Work designed but not built: leave its failing tests, parked under a name the build does not compile, and a
  one-page note of the shapes they call — and tell the next chat to mark the note "built" when it is.
- A trap is written from what was measured, with how it was measured; a trap that was only inferred is marked a guess.
- A job that resumes an unmerged branch: beside "where the branch meets `main`", list what the rulings recorded since
  the branch forked leave stale ON it (`git grep <subject> origin/<branch>`) — the chat that recorded them on `main`
  could not reach that text.
- Chats started side by side each get, in the block, a ruling-number range and an observation-number range. A chat
  joining others reads every open branch's block for claimed ranges before announcing one — a pushed block beats a
  message.
- Name any document-size marker carried over (`docsize: OVER by <n>, deferred`): the next documents-only change must
  settle it.
- A next step that names a numbered piece of a plan (a merge, a phase, a batch) is checked against the plan and its
  ruling's full row — it exists and is not done; when the plan is finished, say so.
- Work that spans chats: "Pick up here" names the next slice by its parts and its clean stop, sized against what a
  fresh chat has left after its start-up load, measured — one build to a slice where its scripts must be read whole.
- How a job ships is decided by the files it will change, checked against `.claude/rules/shipping.md`'s "only notes"
  list — a size-tripwire raise changes a script and waits for "merge live".
- A step that removed a field, a mark or a rule ran its area's whole suite (or searched the tests for the removed
  name) before the block says green.
- A brief written for another chat — a side session, the next chat's helpers — names the branch and commit its
  pointers live on, never this chat's worktree folder; a block not yet on `main` is named by its branch or pasted in.
  It names the rulings the job needs by number (their full rows) and the sections to read, because the first file it
  opens in an area loads that area's whole rulings page — and the side chat commits its own block after its first
  change, not at the first warning.
- The app's safety check judges who typed the word: a merge made on his "merge live" quoted in a side session's brief
  is refused, even where his standing word covers that chat. So the chat he said it in merges; or the brief says the
  merge will need his word typed in the chat that makes it, and he is told now that he will be asked there once more.

## Rules

1. **Never touch another chat's block** (Step 1 says when a merged one may go).
2. **Never invent state.** "none" beats a guess. A build note that says how an existing mechanism will behave (Undo,
   a save, a permission) names the ruling or test that shows it, or says "unchecked". A time is read from the clock
   (`date`) or the commit or file it names, in the step that writes it — never estimated or carried from a compaction
   summary; a progress line may name its commit instead.
3. Paths must be repo-relative from the repo root, or absolute. Never relative to a working directory the next
   session may not share.
4. No retrospective, no "what went well", no emojis, no recommendations beyond the single "Pick up here" line. The
   next session decides.
5. Do not restate what `CLAUDE.md`, `HANDOFF.md` or `docs/` already say. The handoff covers only what those cannot
   know: this session's leftovers. This is a rule about **duplication, not maintenance** — Step 3 still requires you
   to correct those files where this session made them wrong.
6. **This file describes a moving project, so it goes stale too.** If a step here contradicts what you just did, fix
   the step in the same commit.
