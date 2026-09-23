#!/usr/bin/env bash
# Stop hook — [DOCS-GUARD] F1 (Fable, 22 Sep 26; owner D30). At the end of every turn, check that
# no filed backlog record was destroyed. A STOP hook, not an edit hook, on purpose: on 22 Sep 26 the
# destruction was done by a script run through the shell, which an Edit/Write hook never sees; Stop
# fires however the edit was made. It runs only the inventory half of the document gate — a file
# over its line budget must never block a turn (that is D29 rule 3's whole point).
#
# Exit 2 hands the failure back to the agent to fix before it stops. If the agent is already being
# held by this hook (stop_hook_active), it lets go rather than loop — CI runs the same check.
input=$(cat)
dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
script="$dir/raptor-port/scripts/docsize.mjs"
[ -f "$script" ] || exit 0
command -v node >/dev/null 2>&1 || exit 0
# Read the flag as JSON, not as text — `"stop_hook_active" : true` with any spacing is still true
# (Astra, 23 Sep 26). Unparseable input is treated as not active.
active=$(printf '%s' "$input" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(JSON.parse(s).stop_hook_active===true?"1":"0")}catch{process.stdout.write("0")}})')
[ "$active" = "1" ] && exit 0
# Silent and exit 0 whenever every record is accounted for — the common case.
out=$(node "$script" --inventory 2>&1) && exit 0
{
  echo "BACKLOG GUARD: a filed record in OUTSTANDING.md / OUTSTANDING-ARCHIVE.md / DECISIONS.md looks lost or damaged."
  echo "$out" | grep -E '^\s+- |^FAIL'
  echo "Restore it from the base before stopping. If it is deliberate, declare it in the commit (a Docs-guard-allow: trailer)."
} >&2
exit 2
