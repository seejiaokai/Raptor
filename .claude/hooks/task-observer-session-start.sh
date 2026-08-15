#!/usr/bin/env bash
# SessionStart hook — activates the vendored `task-observer` skill.
#
# From rebelytics/one-skill-to-rule-them-all (CC BY 4.0). The skill's own
# `references/environments.md` §Recommended activation setup asks to be paired
# with a config-level instruction because description-matching alone "is not
# enforceable" and can be missed when the agent is focused on a task. This hook
# is the harness-level half of that (the CLAUDE.md instruction is the other),
# and it re-fires on compact/resume so a compacted session re-activates.
#
# WIRED IN via .claude/settings.json → hooks.SessionStart (owner chose full
# activation, 15 Aug 26). It injects a short instruction, NOT the whole
# SKILL.md — the Skill tool loads the body on invoke. Provenance and the
# opt-out: .claude/skills/TASK-OBSERVER-VENDORED.md.

set -euo pipefail

# The activation instruction (adapted from the skill's recommended block).
read -r -d '' CONTEXT <<'EOF' || true
<task-observer-activation>
At the start of this task-oriented session — any interaction where you will use
tools and produce deliverables — invoke the `task-observer` skill (Skill tool,
name: task-observer) before beginning work, so skill-improvement opportunities
are captured throughout the session. When loading any skill, also check the
observation log for OPEN observations tagged to it and apply their insights even
if the skill file has not been updated yet.

Persistence note: this repo's web/phone sessions run in an ephemeral container
with no stable workspace folder, so the observation log will not survive on its
own — use the skill's handoff-doc mode (references/environments.md) and offer the
handoff as the session winds down, or commit the log into the repo if it should
persist. Provenance/opt-out: .claude/skills/TASK-OBSERVER-VENDORED.md.
</task-observer-activation>
EOF

# Escape for JSON embedding (one C-level pass each).
escape_for_json() {
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\"/\\\"}"
    s="${s//$'\n'/\\n}"
    s="${s//$'\r'/\\r}"
    s="${s//$'\t'/\\t}"
    printf '%s' "$s"
}

escaped=$(escape_for_json "$CONTEXT")

# printf rather than a heredoc for the OUTPUT: bash 5.3+ can hang on the
# heredoc form (see obra/superpowers#571).
printf '{\n  "hookSpecificOutput": {\n    "hookEventName": "SessionStart",\n    "additionalContext": "%s"\n  }\n}\n' "$escaped"

exit 0
