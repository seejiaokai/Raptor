# Vendored: vercel-labs/skills — find-skills

The `find-skills/` skill directory beside this file is a single `SKILL.md` from
[vercel-labs/skills](https://github.com/vercel-labs/skills) (`skills/find-skills/`,
commit `c6f69c6`, 10 Aug 26), **MIT** licensed — the licence rides with it at
`find-skills/LICENSE` (© 2026 Vercel, Inc.).

## Why vendored rather than installed

Same reason as `impeccable` and `superpowers` (see their `*-VENDORED.md`). The
skill itself even documents the alternative: `npx skills add <owner/repo@skill>
-g` installs into the per-machine user config, which a fresh Claude Code
web/phone container never has. Repo-level skills ship with the clone, so
vendoring is the only way it reaches a phone or web session on THIS project.

## What it is

A discovery helper: when the user asks "is there a skill for X" / "how do I do
X", it points at the open agent-skills ecosystem — check the
[skills.sh](https://skills.sh/) leaderboard, then `npx skills find [query]`, vet
install count + source reputation, and offer to install. **It is guidance only:**
no scripts, no hooks, no agents, no `allowed-tools` — nothing was wired into
`.claude/settings.json`. It leans on the `npx skills` CLI at runtime, which needs
the network policy to allow npm.

Note the overlap with this harness's own built-ins: the Skill tool already
surfaces enabled skills, and `SuggestSkills`/`SearchSkills` search the
org/Anthropic catalog. `find-skills` covers the *public* `skills.sh` ecosystem
those don't — that's what it adds.

## Updating

No auto-update. Re-copy the one file:

```sh
git clone --depth 1 https://github.com/vercel-labs/skills.git /tmp/vlskills
cp /tmp/vlskills/skills/find-skills/SKILL.md .claude/skills/find-skills/SKILL.md
cp /tmp/vlskills/LICENSE .claude/skills/find-skills/LICENSE
```
