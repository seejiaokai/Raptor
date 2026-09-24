# Memory additions (machine-local, outside the repo) — install = append each block, add the one new file

The two-provider review tool (the claudex-loop plugin) is installed per machine, not in the repo, so its lessons
belong in this machine's memory notes, which live beside it (the 23 Sep 26 review's precedent). Folder:
`C:\Users\User\.claude\projects\C--Users-User-projects-Raptor\memory\`.

## Append to `astra-codex-cli-available.md` (observations #227, #234)

**Building a brief for the other provider (24 Sep 26 review).** Point the reviewer at the LIVE files — the
rulings, the plan on disk — rather than pasting them into the brief: a ruling he makes while they read then
reaches them for free. If he rules mid-review, record it in the live file at once, let the reviews in flight
finish, and redo only the findings the ruling invalidates — never restart the round. And hand Codex, by path,
the area rules files the change touches (`.claude/rules/decisions/<area>.md`): it loads none of `.claude/rules/`
by itself (D140, `.claude/rules/doc-structure.md`).

## Append to `prefer-codex-for-bug-checks-fable-scarce.md` (observation #229)

**A reviewer's thinking level is a launch setting, never inherited (24 Sep 26 review).** The claudex runner
takes `--effort low|medium|high|xhigh|max` (it becomes the Claude CLI's `--effort`, or Codex's
`model_reasoning_effort`); without it the CLI's own default applies, and his settings set none. Pass
`--effort high` on every review call meant to run at high. An in-chat helper started with a model override gets
its agent definition's `effort:` or the model's default — NOT this chat's level; if he wants in-chat Fable
helpers pinned, offer a project agent definition (`model: fable`, `effort: high`), which applies from the next
session.

## New file `guiding-him-through-setup-steps.md` (observation #208), and its line in `MEMORY.md`

```markdown
---
name: guiding-him-through-setup-steps
description: When he must do a setup step himself (a credential, a GitHub settings page), write each step so the screen confirms it and no click can lose what a later step needs.
metadata:
  type: feedback
---

When he carries out a setup step himself — anything the agent may not do (a credential, a runner
registration, a settings page): (1) every copy/record step comes BEFORE any button that could close or finish
the dialog; (2) each step names what the screen should show next (the exact folder in the prompt), so a wrong
turn shows at once; (3) give the recovery line for the likely mistake up front; (4) afterwards, verify read-only
and tell him where things actually ended up.

**Why:** 23 Sep 26 — re-registering his PC's GitHub runner, the steps said "click Remove, copy the command it
shows"; he clicked through, the command was never copied, and the PC's copy stayed registered. He also followed
the page's own Download box into a nested folder (`C:\actions-runner\actions-runner`), so a later "tidy up the
old folder" would delete the live one. He follows the screen, not the plan.

**How to apply:** any numbered instructions for him to do by hand. Pairs with [[plain-language-in-reports]].
```

`MEMORY.md` line: `- [Guiding him through setup steps](guiding-him-through-setup-steps.md) — copy/record BEFORE any closing button; each step says what the screen shows next; recovery line up front; verify after.`
