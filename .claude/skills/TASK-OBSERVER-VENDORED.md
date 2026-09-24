# Vendored: rebelytics/one-skill-to-rule-them-all — task-observer

The `task-observer/` skill directory beside this file comes from
[rebelytics/one-skill-to-rule-them-all](https://github.com/rebelytics/one-skill-to-rule-them-all)
(commit `281f134`, 17 Jul 26), **CC BY 4.0** — created by **Eoghan Henn /
[rebelytics.com](https://rebelytics.com)**. Attribution is required; the licence
rides with it at `task-observer/LICENSE.txt` and the skill body carries the
credit inline. The skill's real `name:` is **task-observer**; "One Skill to Rule
Them All" is its marketing name and a trigger phrase.

## What landed (the bundle only)

Per the skill's own bundle manifest — `SKILL.md` plus its three reference files:

- `.claude/skills/task-observer/SKILL.md`
- `.claude/skills/task-observer/references/{weekly-review,skill-authoring,environments}.md`
- `.claude/skills/task-observer/LICENSE.txt`

The repo's two ~1.5 MB marketing PNGs, `README.md` and `USER-GUIDE.md` were
**not** vendored — they are docs, not part of the runnable skill. Read them
upstream if needed.

## Why vendored rather than installed

Same reason as `impeccable` and `find-skills` (see their `*-VENDORED.md`): a
per-machine install never reaches a fresh Claude Code web/phone container, and
repo-level skills ship with the clone. The owner wanted it usable on this
project from anywhere, phone included.

## Activation IS wired (owner chose full activation, 15 Aug 26)

The skill is a meta-observer meant to run at the **start of every task session**
and watch the work for reusable-skill opportunities. Its own
`references/environments.md` says description-matching alone "is not
enforceable," so it asks to be paired with a config instruction and/or a
session-start hook. Both were added:

1. **SessionStart hook** — `.claude/hooks/task-observer-session-start.sh`, wired
   into `.claude/settings.json` under `hooks.SessionStart` (matcher
   `startup|clear|compact`, so it re-fires on compaction/resume). It injects a
   short activation instruction, not the whole SKILL.md. This merged ALONGSIDE
   impeccable's existing `PostToolUse`/`Stop` hooks — that file now carries all
   three events; a future edit must preserve all of them.
2. **CLAUDE.md instruction** — a "Task-observer activation" paragraph in
   `raptor-port/CLAUDE.md` §How to work here (the structural half that survives
   compaction).

**To opt out:** delete the `SessionStart` block from `.claude/settings.json`
(leave `PostToolUse`/`Stop`) and remove the CLAUDE.md paragraph. The skill then
still works on description-match, just not automatically every session.

## Reviews in this repo (23 Sep 26)

How this repo runs the skill's review procedure (`references/weekly-review.md`),
where that procedure's defaults do not fit a git repo with vendored skills:

- **ONE log, in the repo:** `.claude/skill-observations/log.md`, committed. This
  pins the skill's "unless the user's configuration pins it elsewhere": never
  create a second log under `~/.claude/projects/<id>/…/skill-observations/`,
  even though that is the skill's default stable path — the repo is the only
  store every device and web session shares. (A second log did appear there on
  15 Sep 26 and no review ever saw it.)
- **Where lessons land:** in the skills — a few lines in the section they belong
  to, or a reference file inside the skill for longer material. **Not** in
  `raptor-port/CLAUDE.md` or `.claude/rules/`: those load every session and are
  capped by the docsize ratchet (D14). A lesson already stated there is closed as
  "already reflected", not copied into a skill.
- **Vendored skills are forked on purpose.** Every local change is listed in that
  skill's `*-VENDORED.md` register, so an upstream refresh re-applies it instead
  of silently erasing it.
- **Staging:** drafts go to `.claude/skill-updates/<date>/`, never over the live
  skills, until the owner approves. Installing = copying the approved drafts over
  the live files on the review branch; going live = his "merge live" (D60).
- **Who reads the drafts (owner, D70):** Fable AND Astra, one round each, before
  he approves — never the model that wrote them.
- **Clean up when the review ends (owner, D69):** after installing, delete the
  holding folder (git keeps the drafts), move the resolved entries to
  `archive/` the same day, and delete the review's handoff note once merged.
- **Parallel branches are parallel log writers.** When two branches' logs meet at
  a merge, keep the reviewed side and re-append the other side's new entries at
  the end with fresh numbers.

## Local changes to the vendored skill

- **23 Sep 26 review:** `SKILL.md` Numbering discipline gained item 4
  (parallel branches are parallel log writers) and Acting on Observations
  gained "Close it where you apply it"; `references/weekly-review.md` Step 3
  now also searches the project's own docs and settles where lessons land.
  The session-start hook's message pins the ONE log location (above). An
  upstream refresh overwrites these files: re-apply them
  (`git log -p -- .claude/skills/task-observer`).
- **24 Sep 26 review (owner-approved, D146):** `SKILL.md` Numbering discipline item 4 gained the
  cross-branch check's silent failure (Git Bash rewrites `rev:path` unless
  `MSYS_NO_PATHCONV=1`) and "run it on the current branch first".

## Known caveats (not bugs)

- **The skill's default log location does not persist on web/phone** — an
  ephemeral container has no stable folder. That is why this repo commits the
  log (§Reviews in this repo above); nothing else is needed.
- **Overlap with this repo's own handoff machinery.** `HANDOFF.md` (the one
  handoff since 24 Sep 26) and the `session-handoff` skill already cover durable
  cross-session state. task-observer's handoff-doc mode is adjacent but aimed at
  *skill* improvement, not project state — keep them distinct.

## Updating

No auto-update. Re-copy the bundle:

```sh
git clone --depth 1 https://github.com/rebelytics/one-skill-to-rule-them-all.git /tmp/oskrta
cp /tmp/oskrta/SKILL.md .claude/skills/task-observer/SKILL.md
cp /tmp/oskrta/references/*.md .claude/skills/task-observer/references/
cp /tmp/oskrta/LICENSE.txt .claude/skills/task-observer/LICENSE.txt
```
