# Vendored: pbakaus/impeccable

The `impeccable/` skill directory beside this file comes from
[pbakaus/impeccable](https://github.com/pbakaus/impeccable) **v4.1.1**
(commit `7b646ba`, 14 Aug 26), Apache 2.0 licensed — the licence and NOTICE
ride with it at `impeccable/LICENSE` and `impeccable/NOTICE.md` (© Paul Bakaus).
Three pieces landed, all upstream's own Claude Code payload copied verbatim:

- `.claude/skills/impeccable/` — the skill: `SKILL.md`, 23 command references
  under `reference/`, and the design-detector scripts under `scripts/`.
- `.claude/agents/impeccable-*.md` — four subagents (asset-producer,
  documenter, finish-reviewer, manual-edit-applier).
- `.claude/settings.json` — the design-detector **hook** (see below).

## Why vendored rather than installed

Same reason as superpowers (see `SUPERPOWERS-VENDORED.md`). Impeccable installs
either globally into `~/.claude` or as a plugin under `~/.claude/plugins` — both
per-machine. A Claude Code web/phone session gets a fresh container with only
this repo cloned into it, so a locally-installed copy is never present.
Repo-level skills ship with the clone, so vendoring is the only way the skill
reaches a phone or web session working on THIS project. The owner asked for
exactly that ("use it anywhere, including my phone").

## The hook IS wired in

Unlike superpowers' SessionStart hook (vendored but deliberately dark), this
skill's design-detector hook is **live**, at the owner's request. `.claude/
settings.json` registers it on two events:

- **PostToolUse** (`Edit|Write|MultiEdit`) — an immediate-tier check after a UI
  file changes (5s timeout).
- **Stop** — a full-rule deep pass at the end of a turn (30s timeout).

Both commands self-guard: they no-op silently if `hook.mjs` is missing or if
Node < 22 is on PATH (the container ships v22, so it runs). This was previously
the repo's only `.claude/settings.json` — a later session adding project
settings must MERGE into this file, not overwrite it, or the hook goes dark.

## Known caveats (not bugs)

- **The offline detector is an undercount.** `scripts/detect.mjs` wants
  `htmlparser2`/`css-select`/`css-tree`/`domutils`; a fresh container has none,
  so it falls back to regex matching and prints a DEGRADED banner
  (custom properties, selector matching and computed contrast are not
  evaluated). The full 59-rule path runs via `npx impeccable …`, which pulls
  those deps — that needs the network policy to allow npm, and the allow-listed
  `Bash(npx impeccable *)` in the skill's frontmatter.
- **Node 22+ required for the hook.** Below that it prints a one-time
  "not running" system message and exits 0.

## Updating

No auto-update. Re-clone upstream and re-copy the three pieces:

```sh
git clone --depth 1 https://github.com/pbakaus/impeccable.git /tmp/imp
cp -a /tmp/imp/.claude/skills/impeccable/. .claude/skills/impeccable/
cp /tmp/imp/.claude/agents/impeccable-*.md .claude/agents/
cp /tmp/imp/LICENSE .claude/skills/impeccable/LICENSE
cp /tmp/imp/NOTICE.md .claude/skills/impeccable/NOTICE.md
# settings.json carries the hook — re-copy ONLY if this repo has no other
# settings; otherwise merge upstream's hooks block by hand.
```

Check upstream's release notes first: the SKILL description is broad
("design, redesign, shape, critique, audit, polish…"), so a version bump can
change how often it fires.

## Overlap with what this repo already has

Not conflicts, but know they coexist. Impeccable is frontend-design-focused,
which is squarely this app's territory (measured CSS/geometry contracts,
`scheduler.css`), so it is genuinely relevant here rather than dead weight.

| impeccable covers | already partly covered by |
|---|---|
| chart/visualisation colour + layout | the `dataviz` skill |
| artifact/page visual design | the `artifact-design` skill |
| "verify in bounded passes, then stop" | `CLAUDE.md` §Build & verify — **that one wins** for this repo's five real gates; do not let the skill's own QA loop replace them |
