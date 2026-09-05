---
name: session-handoff
description: Use when the user says "session handoff", "wrap up", "hand off", "handoff summary", "I'm moving to a new chat", or is otherwise about to continue this work in a fresh session. Produces a handoff the NEXT session can actually read — committed to the repo, because this container is destroyed when the session ends.
---

# Session handoff (RAPTOR)

The next session gets a **fresh container and a fresh clone of the repo**.
It cannot see this conversation. Anything it needs must live in the repo or
in git — a chat-only handoff dies with the session.

The reader is a future agent, not the owner: terse and concrete. That does
NOT override the `CLAUDE.md` rule that explanations to the owner stay
plain-language and complete.

## Step 1 — decide whether a file is warranted

This project ships once per session, at the end (PR → merge → deploy —
`CLAUDE.md` §How to work here, owner 10 Aug 26; it used to ship every green
change as it landed). So the shipment normally happens just BEFORE this skill
runs, and most sessions still end with nothing in flight — but the one PR now
carries the whole session, which makes "did it merge" the single question that
decides everything below. Check first, then branch:

- **Nothing unfinished** → say so in chat, two lines, and write no file. The
  repo and `git log` already tell the next session everything it needs. A
  file saying "nothing pending" is noise the owner has to scroll past.
  **If `raptor-port/docs/session-state.md` already exists, `git rm` it in the
  same commit.** `CLAUDE.md` promises the next session that an absent file
  means nothing was pending — a leftover from three sessions ago silently
  breaks that promise, and it will be read as current. This is not
  hypothetical: one sat in the tree describing gates as unverified for two
  merged PRs after they had gone green.
- **Something unfinished** → write `raptor-port/docs/session-state.md`,
  **overwriting** it, and commit it with the session's final push. Print the
  same content in chat.

**Either way, it has to be COMMITTED AND PUSHED to the designated branch —
and NEVER merged by you.** SUPERSEDED 2 Sep 26 (`CLAUDE.md` §How to work
here, "NO AUTO-MERGE"): changes accumulate on the designated `claude/<name>`
branch and merge to `main` ONLY on the owner's explicit "merge live". The
harness names the designated branch at session start and the next session
works on it, so a handoff committed and pushed there IS visible to it (and it
is in the open PR besides) — the old "it must reach `main` or the next session
can't see it" reasoning no longer holds, and the old instruction to merge the
handoff yourself would now break the owner's rule. End the session on
"pushed, PR open, awaiting merge live", hand him the Vercel preview link, and
say so in chat. **An open PR awaiting "merge live" is the NORMAL end state,
not an Unfinished item.**
**A docs-only handoff has NO checks** (15 Aug 26 — `deploy.yml`
`paths-ignore` skips the workflow when every changed file is `**.md` or
`.claude/**`), so do not wait for a "build" check that will never appear.
Only a handoff riding a code change runs the gates.

"Unfinished" means any of: work not yet pushed or not yet handed to the owner
(a pushed PR AWAITING his "merge live" is the normal end state, not
unfinished), a gate that is red or was never run, a half-applied edit, a
question the owner never answered, a half-finished piece of work THIS session
deliberately stopped on, or a PR left under `subscribe_pr_activity` watch.

**A standing item already recorded in `HANDOFF.md`'s open-work list is NOT
by itself unfinished business, and must not keep this file alive.** The two
files answer different questions: `HANDOFF.md` holds what is open about the
PROJECT, this one holds what is open about the last SESSION. An owner-reserved
decision, a known gap, a deferred nicety — those live in `HANDOFF.md` and stay
there whether a session ran or not. Repeating one here does two kinds of
damage: it duplicates (Rule 6), and it means the file can never be deleted, so
`CLAUDE.md`'s promise that an absent file means nothing was pending quietly
stops being true. That has already happened: the AVALON spare rule, reserved by
the owner and correctly listed in `HANDOFF.md`, kept this file in the tree
across four consecutive sessions that each ended with everything merged and
deployed. Name such an item in ONE line under Open questions if the next
session needs the pointer — never as the reason the file exists.

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
3. **GitHub** — PR numbers and whether they merged, whether the Pages deploy
   went green, any PR left under watch. Two channels exist since 15 Aug 26
   (`CLAUDE.md` §Build & verify): the ungated **Vercel** per-branch preview for
   fast cross-device review, and **GitHub Pages** as the official gated site.
   "Deploy went green" still means Pages — a preview is not a ship.
4. **Plan file**, if one drove the session (`/root/.claude/plans/*.md`).

Nothing further — no broad Glob sweeps, no filesystem audit. If you did not
touch it this session, it does not belong in the handoff. (Step 3's check is
the one exception, and it is bounded to this session's own diff.)

## Step 3 — check the durable docs were kept true

`CLAUDE.md` requires every PR to keep `../HANDOFF.md` true: a new, renamed or
deleted file edits its **file map**; a resolved known issue comes OFF its open
list and a created one goes ON it (see the hygiene rules below). That rule is easy to honour on a big change and easy to forget
on a small one, and nothing else in the workflow checks it. The handoff is
the last moment before the container dies, so it checks it here.

This is a **bounded** check, not the filesystem audit Step 2 rules out. One
command, over this session's diff only:

```
git diff --name-status <session-start-commit>...origin/main
```

**`origin/main...HEAD` is the WRONG range here, and it fails silently.** This
project merges before the handoff runs (Step 1), so by the time you get here
`HEAD` and `origin/main` are usually the same commit — that diff is empty and
the check reports a clean bill on a session that added three files. Use the
commit the session STARTED from, which is the parent of your first commit:
`git log --oneline -8` will show it, or take it from the merge you just made.
Corrected 11 Aug 26, after the empty-range version would have passed a session
that had added two test files and moved four numbers.

For each path it reports, confirm — by reading `HANDOFF.md`, not from
memory:

- **Added / renamed / deleted source file** → is it in (or gone from) the
  file map? A file that never reaches the map is invisible to every later
  session. `src/ui/RangeCal.tsx` shipped and stayed unmapped for weeks
  exactly this way.
- **A known issue RESOLVED** → it is REMOVED from `HANDOFF.md` §Open /
  deferred / queued — never left there as a "RESOLVED" bullet. Its contract
  goes to the right structured doc (`engine-rules`, `ui-contracts`,
  `feature-impact`, `performance`); its story goes in the commit message —
  that is what makes `git log` the changelog. **A known issue CREATED** → a
  1–3 line entry there: what is open and the pointer, no narrative.
- **A rule the owner changed** (roles, gates, validation, auth) → the same
  fact often sits in `README.md`, `raptor-port/README.md` and `CLAUDE.md`
  too. Grep the changed term across `*.md` and fix every copy. A member
  ceased to be view-only on 5 Aug and three docs went on saying otherwise.
- **A NUMBER this session moved** — and this is the one the three bullets
  above miss, because nothing was added, removed or re-ruled: test counts, DOM
  ceilings, measured node counts, budgets, timings. They are quoted in prose
  that no test reads, so nothing else can catch them. Two places carry them and
  both went stale in one session: `HANDOFF.md` §Gate status (the counts, which
  you may only restate if you re-ran them) and `docs/probe-sweep.md` (the live
  `DOM_CEILING` values and the list of raises). Check those two by name.

**`HANDOFF.md` is a CURRENT-STATE doc, cut from 3,882 to ~550 lines on 4 Sep
26 — keep it that way.** It is read at the start of most sessions, so every
line costs every session. It has a fixed shape, and an edit lands in its
section and nowhere else:
- §Reference docs — the map of where each kind of truth lives (add a row only
  for a NEW doc).
- §Gate status — the six current readings + the seven durable traps. Restate
  a count only from a run you watched; never add a per-batch history.
- §In flight — the live thread(s), a few lines each, with the still-open
  residuals and a pointer to the doc that holds the detail.
- §Open / deferred / queued — 1–3 lines per item + pointer. A resolved item is
  REMOVED (above), never annotated as done.
- §Standing constraints, §Deploy, §File map — standing reference; edit only
  when the fact itself changes.

Never write the story of how something was found or fixed into `HANDOFF.md`
— that narrative is exactly the bloat the cut removed. It belongs in the
commit message. Never append to `HANDOFF-ARCHIVE.md` either: it is a FROZEN
snapshot (as of 4 Sep 26), searched for history, not a running log — `git
log` is the changelog. If an edit would push `HANDOFF.md` back toward
narrative, that is the signal it belongs in a commit message or a structured
doc instead.

Fix what you find, in this session's final commit. If a gap is real but
outside what you were asked to do, put it in **Unfinished** — never leave it
found-but-unrecorded.

## Step 4 — the template

Same structure every time. Write "none" rather than dropping a section —
stable structure is the point.

```
# Session handoff — <one line: what this session was about>

## Where it started
<2-3 sentences: what the owner asked for, constraints that emerged>

## Shipped
- <change> — PR #<n>, merged/open, deploy green/red/pending

## Unfinished
- <item> — <what state it is in, what is left to do>

## Branch state
- Designated branch: `claude/<name>`
- Its PR is <merged / open #n / none>.
- If MERGED, the next session must reset before starting new work:
  `git fetch origin main && git checkout -B <branch> origin/main`
  Otherwise it stacks commits onto already-merged history.

## Gates
- `npm test` · `npm run build` · `node reference/tfin.js` ·
  `npm run test:e2e` — last run <green / red / not run>, with the counts.
- `npm run probes:adapted` · `npm run perf` — <green / red / not run>.
  Not in CI, so if a UI or validation change shipped without them, that is
  an Unfinished item, not a footnote.
  Run all of these from `raptor-port/`, not the repo root; a fresh
  container needs `npm ci` first.

## Open questions
- <question the owner has not answered> — <context needed to answer it>

## Pick up here
<1-2 sentences: the single most likely next action>
```

## Rules

1. **Never append to `session-state.md` — overwrite it.** A handoff that
   accumulates becomes a changelog, and `git log` already is one.
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
8. **`HANDOFF.md` stays a current-state doc** (Step 3): resolved items come
   OUT, stories go in commit messages, `HANDOFF-ARCHIVE.md` stays frozen. A
   handoff that grows `HANDOFF.md` has redone the thing the 4 Sep 26 cut
   undid.
