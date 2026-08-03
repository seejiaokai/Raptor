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

This project ships every green change immediately (PR → merge → deploy), so
most sessions end with nothing in flight. Check first, then branch:

- **Nothing unfinished** → say so in chat, two lines, and write no file. The
  repo and `git log` already tell the next session everything it needs. A
  file saying "nothing pending" is noise the owner has to scroll past.
- **Something unfinished** → write `raptor-port/docs/session-state.md`,
  **overwriting** it, and commit it with the session's final push. Print the
  same content in chat.

"Unfinished" means any of: an open or unmerged PR, a gate that is red or was
never run, a half-applied edit, a question the owner never answered, a
deliberate deferral, or a PR left under `subscribe_pr_activity` watch.

## Step 2 — gather state, in this order

1. **This conversation** — decisions made, questions the owner left hanging,
   things deliberately pushed to later. You know what you touched; do not
   grep to rediscover it.
2. **Git** — `git status --short` and `git log --oneline -5`.
   (Nate's original skill forbids git here. That is right for a persistent
   local machine and wrong for us: the next session cannot read this chat but
   can read git, so git is the reliable half of the handoff.)
3. **GitHub** — PR numbers and whether they merged, whether the Pages deploy
   went green, any PR left under watch.
4. **Plan file**, if one drove the session (`/root/.claude/plans/*.md`).

Nothing further. No broad Glob sweeps, no filesystem audit. If you did not
touch it this session, it does not belong in the handoff.

## Step 3 — the template

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
- `npm test` · `npm run build` · `node reference/tfin.js` — last run
  <green / red / not run>. Run them from `raptor-port/`, not the repo root.

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
