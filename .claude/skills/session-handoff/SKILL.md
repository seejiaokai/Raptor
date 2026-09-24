---
name: session-handoff
description: Use when the user says "session handoff", "wrap up", "hand off", "handoff summary", "I'm moving to a new chat", or is otherwise about to continue this work in a fresh session. Produces a handoff the NEXT session can actually read — this chat's block in HANDOFF.md, committed to the repo, because the next chat (often on another device) cannot see this one.
---

# Session handoff (RAPTOR)

The next session is a **fresh chat** — often on another device, after a pull,
or in a fresh container and clone. It cannot see this conversation. Anything it needs must live in the repo or
in git — a chat-only handoff dies with the session.

The reader is a future agent, not the owner: terse and concrete. That does
NOT override the `CLAUDE.md` rule that explanations to the owner stay
plain-language and complete.

## Step 1 — write this chat's block in `HANDOFF.md`, every time

Since 24 Sep 26 (owner, D140) the ONE handoff is `HANDOFF.md` at the repo root: `## Now` holds one block per
open chat's branch, `## Next, in order` the project's order, then the standing facts. It replaced
`raptor-port/docs/session-state.md` (retired to `raptor-port/docs/archive/`) and `HANDOFF-NEXT.md` (now a
three-line signpost to it). His own instruction is that the handoff notes go into the repo, in `HANDOFF.md`, so
the next chat — often on another device — just pulls and reads. The structure every fact follows:
`.claude/rules/doc-structure.md`.

Work accumulates on the session's branch and reaches `main` only on the
owner's "merge live" (`.claude/rules/shipping.md`; D60 — pushing the branch
needs no permission, `main` always does). So most sessions end with the branch
pushed and waiting for him — the normal end state, not unfinished business.

- **Write this chat's block, EVERY handoff** — even when nothing is pending
  (then the block says so in two lines: the branch, its PR and state, "nothing
  pending"). A chat that skips its block leaves the previous block to be read
  as current, which is worse than no handoff at all.
- **Only your own block.** It sits between `<!-- now:<branch> -->` and
  `<!-- /now -->`; rewrite it WHOLE (never append to it — a block that
  accumulates becomes a changelog, and `git log` already is one). Newest block
  first under `## Now`.
- **Another chat's block** is removed only when `git fetch` shows its work
  merged into `main` AND anything it left open is already an `OUTSTANDING.md`
  item. Otherwise leave it exactly as it is — a parallel chat (a second
  worktree) owns it, and the later merge keeps both (D78). The document gate
  warns when a block's branch is already merged, and fails two blocks for one
  branch.
- **Open residue goes to the backlog, not the block:** anything still open
  becomes (or updates) an `OUTSTANDING.md` item with its place in the priority
  list; the block names it in one line. A standing item already in the backlog
  is NOT this chat's leftover — name it in one line only if the next chat needs
  the pointer.
- **`## Next, in order`** changes only when the order itself changed (his word,
  or an item finished); it is the project's, not this chat's.
- Print the same block in chat, and give him the **ready-to-paste opening line**
  for the fresh chat: which branch to pick in the new-chat picker, and "Read
  `HANDOFF.md` — the `claude/<branch>` block under `## Now` — then …".

**Either way, it has to be COMMITTED AND PUSHED to the designated branch —
and NEVER merged by you.** SUPERSEDED 2 Sep 26 (`.claude/rules/shipping.md`,
"merge live"): changes accumulate on the designated `claude/<name>` branch and
merge to `main` ONLY on the owner's explicit "merge live". A handoff committed
and pushed there IS visible to the next chat (and it is in the open PR
besides). End the session on "pushed, PR open, awaiting merge live", hand him
the Vercel preview link, and say so in chat. **An open PR awaiting "merge
live" is the NORMAL end state, not an Unfinished item.**
**A docs-only handoff has NO checks ONLY if its whole pull request is docs**
(15 Aug 26 — `deploy.yml` `paths-ignore` skips the workflow when every changed
file is `**.md` or `.claude/**`). GitHub judges a pull request's WHOLE diff, not
the last push: once the PR carries code, a notes-only push re-runs every gate
AND cancels the run in progress (corrected 23 Sep 26, after exactly that; owner
D151 — never push while a PR's checks are running). So check
`gh run list --branch <branch> --limit 1` first, and push the handoff only when
no run is going.

"Unfinished" means any of: work not yet pushed or not yet handed to the owner
(a pushed PR AWAITING his "merge live" is the normal end state, not
unfinished), a gate that is red or was never run, a half-applied edit, a
question the owner never answered, a half-finished piece of work THIS session
deliberately stopped on, or a PR left under `subscribe_pr_activity` watch.

## Step 2 — gather state, in this order

1. **This conversation** — decisions made, questions the owner left hanging,
   things deliberately pushed to later. You know what you touched; do not
   grep to rediscover it.
   **Unless the context was cleared or compacted mid-session** — then you do
   NOT know, and guessing is worse than looking. Reconstruct from
   `git log --oneline origin/main..HEAD` and
   `git diff --name-status origin/main...HEAD` (or, if this session's work has
   already merged, the session-start range Step 3 gives), and say in the file
   that the early context was lost so the next session weighs it accordingly.
2. **Git** — `git status --short` and `git log --oneline -5`.
   (Nate's original skill forbids git here. That is right for a persistent
   local machine and wrong for us: the next session cannot read this chat but
   can read git, so git is the reliable half of the handoff.)
3. **GitHub** — each PR's number and state, READ now, whether its checks
   passed, and any PR left under watch. The owner merges between sessions, so
   the file records merge state as "PR #N — open when this was written; check
   before acting", never as a bare "not merged" the next session will trust.
   The app is viewed on **Vercel** (a link per branch). The old GitHub Pages
   site was switched off on 23 Sep 26 (D59) — there is no Pages deploy to
   report.
4. **Plan file**, if one drove the session (the harness's `plans/` folder:
   `~/.claude/plans/` on a desktop, `/root/.claude/plans/` in a web container).

Nothing further — no broad Glob sweeps, no filesystem audit. If you did not
touch it this session, it does not belong in the handoff. (Step 3's check is
the one exception, and it is bounded to this session's own diff.)

## Step 3 — check the durable docs were kept true

`raptor-port/CLAUDE.md` §Coding conventions requires every PR to keep the
records true, each fact in its one home (`.claude/rules/doc-structure.md`): a
new, renamed or deleted file edits the **file map**
(`raptor-port/docs/file-map.md`); a resolved known issue LEAVES the backlog and a
created one goes INTO it (see the hygiene rules below). That rule is easy to honour on a big change and easy to forget
on a small one, and the document gate checks only part of it. The handoff is
the last moment before the chat ends, so it checks it here.

This is a **bounded** check, not the filesystem audit Step 2 rules out. One
command, over this session's diff only:

```
git diff --name-status <session-start-commit>...HEAD
```

**The range must start at the commit the session STARTED from and end at your
own `HEAD`** — the parent of your first commit (`git log --oneline -8` shows
it). Both wrong ranges fail silently, reporting a clean bill on a session that
added files: `origin/main...HEAD` was empty back when sessions merged before
the handoff (11 Aug 26), and `<start>...origin/main` is empty now that work
waits on the branch for "merge live" — the session's commits are not on
`main` yet (corrected 23 Sep 26).

**If a merge to `main` happened this session** — yours or the owner's —
re-read the WHOLE `## Now` section of `HANDOFF.md` and reconcile every block
against `git log origin/main`, not only the block this session wrote: a block
whose branch merged is removed once its open residue is filed (Step 1). A
"current state" section must hold nothing already done, and the staleness an
earlier session left sits in lines your diff never touched.

For each path it reports, confirm — by reading the live record that holds it
(`HANDOFF.md`, `OUTSTANDING.md` or `raptor-port/docs/file-map.md`), not from
memory:

- **Added / renamed / deleted source file** → is it in (or gone from) the
  file map, `raptor-port/docs/file-map.md`? A file that never reaches the map
  is invisible to every later session. `src/ui/RangeCal.tsx` shipped and
  stayed unmapped for weeks exactly this way.
- **A known issue RESOLVED** → its `OUTSTANDING.md` item LEAVES, by
  `node raptor-port/scripts/backlog-archive.mjs <ID> --homes <file>` —
  never left in place as a "RESOLVED" note. Its contract goes to the right
  structured doc first (`engine-rules`, `ui-contracts`, `feature-impact`,
  `performance`); its story goes in the commit message — that is what makes
  `git log` the changelog. **A known issue CREATED** → an `OUTSTANDING.md`
  item: what is open and the pointer, no narrative, and its place in the
  priority list.
- **A rule the owner changed** (roles, gates, validation, auth) → the same
  fact often sits in `README.md`, `raptor-port/README.md` and `CLAUDE.md`
  too. Grep the changed term across `*.md` and fix every copy. A member
  ceased to be view-only on 5 Aug and three docs went on saying otherwise.
- **A NUMBER this session moved** — and this is the one the three bullets
  above miss, because nothing was added, removed or re-ruled: test counts, DOM
  ceilings, measured node counts, budgets, timings. They are quoted in prose
  that no test reads, so nothing else can catch them. Two places carry them and
  both went stale in one session: `HANDOFF.md` §Gate baseline (the counts, which
  you may only restate if you re-ran them) and `docs/probe-sweep.md` (the live
  `DOM_CEILING` values and the list of raises). Check those two by name.

**`HANDOFF.md` is a CURRENT-STATE doc** — read at the start of every chat, so
every line costs every chat. It was cut from 3,882 to ~550 lines on 4 Sep 26,
had drifted back to 984, and was cut again on 24 Sep 26 (D140) to the one
handoff. It has a fixed shape, and an edit lands in its section and nowhere
else:
- the header — what the file is, how blocks are written (edit only when that
  changes);
- `## Now` — one block per open chat's branch (Step 1);
- `## Next, in order` — the project's order, short, pointing into
  `OUTSTANDING.md`'s priority list;
- `## Gate baseline` — the latest watched counts (Step 3's number bullet),
  REPLACED each time, never a per-batch history;
- `## Standing constraints`, `## Where to look`, `## Moved …` — standing
  reference; edit only when the fact itself changes.
Open work is NOT kept here — it is `OUTSTANDING.md`, the one backlog. The file
map is `raptor-port/docs/file-map.md`; the gate and deploy traps are
`raptor-port/docs/gates-and-deploy.md`.

Never write the story of how something was found or fixed into `HANDOFF.md`
— that narrative is exactly the bloat the cuts removed. It belongs in the
commit message. `HANDOFF-ARCHIVE.md` stays a FROZEN snapshot (as of 4 Sep 26) —
never append to it; a whole section that is no longer needed leaves by
`node raptor-port/scripts/backlog-archive.mjs --move` to `raptor-port/docs/archive/`
(`.claude/rules/doc-structure.md`). If an edit would push `HANDOFF.md` back
toward narrative, that is the signal it belongs in a commit message, a backlog
item or a structured doc instead — and the document gate's ceiling on the file
is the tripwire that says so.

Fix what you find, in this session's final commit. If a gap is real but
outside what you were asked to do, put it in **Unfinished** — never leave it
found-but-unrecorded.

## Step 4 — the template (this chat's block)

Same structure every time. Write "none" rather than dropping a line —
stable structure is the point.

```
<!-- now:claude/<name> -->
### `claude/<name>` — <one line: what this chat was about>, written <date> — verify before use
- **Where it started:** <1-2 sentences: what the owner asked for, constraints that emerged>
- **Shipped:** <change> — PR #<n>, open/merged when written; checks green/red/not run
- **Unfinished:** <item> — <state, what is left> (or "none"); open residue → `[ITEM-ID]` in OUTSTANDING.md
- **Branch:** `claude/<name>`; its PR <#n or none>. If it has MERGED, the next chat resets before new work:
  `git fetch origin main && git checkout -B <branch> origin/main` — otherwise it stacks commits onto
  already-merged history.
- **Gates:** `npm test` · `npm run build` · `node reference/tfin.js` · `npm run test:e2e` —
  <green / red / not run, with counts>; `npm run probes:adapted` · `npm run perf` — <green / red / not run>
  (not in CI, so a UI or validation change shipped without them is Unfinished, not a footnote).
  Run from `raptor-port/`; a fresh checkout needs `npm ci` first.
- **Open questions for him:** <question> — <context needed to answer it> (or "none")
- **Pick up here:** <1-2 sentences: the single most likely next action; a plan file that drove the session first>
<!-- /now -->
```

## Rules

1. **Never append to your `## Now` block — rewrite it whole; never touch
   another chat's block** (Step 1 says when a merged one may go). A handoff
   that accumulates becomes a changelog, and `git log` already is one.
2. **Never invent state.** "none" beats a guess.
3. Paths must be repo-relative from the repo root, or absolute. Never
   relative to a working directory the next session may not share.
4. If a plan file drove the session, name it first under "Pick up here".
5. No retrospective, no "what went well", no emojis, no recommendations
   beyond the single "Pick up here" line. The next session decides.
6. Do not restate what `CLAUDE.md`, `HANDOFF.md` or `docs/` already say.
   The handoff covers only what those cannot know: this session's leftovers.
   This is a rule about **duplication, not maintenance** — Step 3 still
   requires you to correct those files where this session made them wrong.
7. **This file describes a moving project, so it goes stale too.** Its gate
   list was three commands for weeks after the geometry gate became the
   fourth. If a step here contradicts what you just did, fix the step in the
   same commit.
8. **`HANDOFF.md` stays a current-state doc** (Step 3): merged blocks come
   OUT, open work lives in `OUTSTANDING.md`, stories go in commit messages,
   `HANDOFF-ARCHIVE.md` stays frozen. A handoff that grows `HANDOFF.md` has
   redone the thing the 4 Sep and 24 Sep 26 cuts undid.
9. **Every handoff ends with his opening line for the fresh chat** — the branch
   to pick in the new-chat picker and "Read `HANDOFF.md`, the `claude/<name>`
   block under `## Now`" — ready to paste (his standing instruction).
