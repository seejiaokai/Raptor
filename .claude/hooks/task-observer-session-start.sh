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
# activation, 15 Aug 26). Since 7 Nov 26 (his D969, point F; D1740 — the rules
# diet's step 2) it injects the skill's SHORT FORM, `.claude/skills/task-observer/
# SHORT-FORM.md`, in place of the instruction to invoke the whole SKILL.md (about
# 10,200 tokens a chat); the full skill is invoked only for a review, a skill's
# creation or edit, a question about its setup, or a case the short form does not
# cover. If the short form
# cannot be read, it prints the old instruction, unchanged (it fails open).
# Provenance and the opt-out: .claude/skills/TASK-OBSERVER-VENDORED.md.

set -euo pipefail

SHORT="${CLAUDE_PROJECT_DIR:-.}/.claude/skills/task-observer/SHORT-FORM.md"

# The instruction used before the short form, kept as the fallback.
read -r -d '' FALLBACK <<'EOF' || true
<task-observer-activation>
At the start of this task-oriented session — any interaction where you will use
tools and produce deliverables — invoke the `task-observer` skill (Skill tool,
name: task-observer) before beginning work, so skill-improvement opportunities
are captured throughout the session. When loading any skill, also check the
observation log for OPEN observations tagged to it and apply their insights even
if the skill file has not been updated yet.

Log location, pinned for this repo: the ONE observation log is
.claude/skill-observations/log.md, committed with the work — on every device
and in web sessions alike. Never create another under
~/.claude/projects/.../skill-observations/ (the skill's default path): no review
ever sees it. How reviews run here, and provenance/opt-out:
.claude/skills/TASK-OBSERVER-VENDORED.md.
</task-observer-activation>
EOF

CONTEXT=""
if [ -r "$SHORT" ]; then CONTEXT="$(cat "$SHORT" 2>/dev/null || true)"; fi
# A control character other than tab, newline or carriage return would break the JSON below, and the session would
# get no note at all, so any is stripped; and the app cuts a note past 10,000 characters to a 2,000-character preview
# it does not ask the chat to read (its hooks guide), so a short form that long, or an empty one, prints the old
# instruction instead (a fresh reader's F3 and F4, 7 Nov 26).
CONTEXT="$(printf '%s' "$CONTEXT" | tr -d '\000-\010\013\014\016-\037\177' || true)"
if [ -z "${CONTEXT//[[:space:]]/}" ] || [ "${#CONTEXT}" -gt 9500 ]; then CONTEXT="$FALLBACK"; fi

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
