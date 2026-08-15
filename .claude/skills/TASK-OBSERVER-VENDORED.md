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

## Known caveats (not bugs)

- **The observation log does not persist on web/phone.** The skill writes to
  `[workspace folder]/skill-observations/log.md` on a STABLE path; an ephemeral
  container has none, so the log is torn down with the session. The skill's
  handoff-doc mode (`references/environments.md`) is the intended fallback —
  collect observations in-session and hand them off — or commit the log into the
  repo (e.g. under `docs/`) if it should genuinely last. Nothing here sets up
  persistent storage; that is left to the skill's runtime behaviour.
- **Overlap with this repo's own handoff machinery.** `HANDOFF.md`,
  `docs/session-state.md` and the `session-handoff` skill already cover durable
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
