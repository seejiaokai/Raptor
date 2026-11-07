# The rules diet, step 2 — the switch-on: the readers' brief (7 Nov 26)

You are a fresh reader of a documents-and-hooks change in this repo. You did not write it. Read only; change no file;
do not commit or push. Return one report, findings first, each with its place, what is wrong, what goes wrong because
of it, and the exact fix (a finding is a finding only with a concrete failure, its cause and its fix — D489).

**What this is.** The owner's "rules diet" trims what every chat loads. Step 2 wrote a short form of the vendored
`task-observer` skill (`.claude/skills/task-observer/SHORT-FORM.md`) and a shorter note for the hook that fires on each
of his messages. Both texts were read blind by two readers and every finding fixed; the owner approved the short form's
wording (ruling D1740). This change **switches them on** — the hooks now print the new texts — and records the switch
where the project's records say it.

**What a finding is not here.** A problem that lives only in data already stored is not a finding (D56). The short form's
own wording and the per-message note's wording were already read and approved — do not re-review their prose; check only
that what is switched on is what was approved (questions 2 and 3).

**Where to read:** the change is `git diff 9dd3bf1af` on branch `claude/rules-diet-step2` (or, if you were given a copy
of the files, the files named below). The approved drafts: `raptor-port/docs/superpowers/briefs/2026-11-07-rules-diet-step2-short-texts.md`
parts A and B. The rules for rulings: `.claude/rules/record-decisions.md`, the head of `DECISIONS.md`.

## Your questions

1. **The ruling's short line (D138 — a summary never changes what the original meant).** Compare D1740's short line in
   `.claude/rules/decisions/how-we-work.md` with its full row in `.claude/decisions-full/how-we-work.md`
   (`grep -h '^| D1740 |' .claude/decisions-full/*.md`). Does the short line say anything the row does not, or drop a
   condition the row has? Also check D969's full row now marks point F answered by D1740, and that
   `SHORT-FORM.md` names D1740 (the gate's rule that a ruling's home carries its number).
2. **The two hooks against the approved drafts.**
   - `.claude/hooks/record-decisions.sh`: is its printed note exactly part A's "Proposed" text, the comment block above
     it unchanged, the script still exiting 0 on any error?
   - `.claude/hooks/task-observer-session-start.sh`: it prints the short form read from its file, or the old
     instruction if the file cannot be read (part B, step 1). Look for any way it prints nothing, prints broken JSON,
     or stops the session: `set -euo pipefail`; `CLAUDE_PROJECT_DIR` unset (the path falls back to `.`); characters in
     the short form the JSON escaping does not handle (it escapes backslash, double quote, newline, carriage return,
     tab — is any other control character in the file?); a file that exists but is empty. And check whether Claude Code
     caps the size of a SessionStart hook's `additionalContext` (the short form prints about 7,450 bytes) — if a cap
     exists below that, say what it is and where it is documented.
3. **The three other texts from part B** — `raptor-port/CLAUDE.md`'s "Task-observer activation" line, the paragraph added
   to `raptor-port/docs/guide-full.md` §Task-observer activation, and the line added to
   `.claude/skills/TASK-OBSERVER-VENDORED.md` §Local changes: does each say what part B, steps 2–4, says? Name any
   difference in meaning (adding "D1740" beside "D969" is intended).
4. **The new texts that were not in the drafts** — read each for whether it is true against the files and changes no
   rule's meaning:
   - `TASK-OBSERVER-VENDORED.md` §Activation IS wired, item 1: the clause added after "not the whole SKILL.md";
   - `TASK-OBSERVER-VENDORED.md` §Local changes, the 7 Nov 26 line's last sentence (an upstream refresh);
   - `raptor-port/docs/file-map.md`: the rulings row's added clause, the new row for `../.claude/rules/seams/<area>.md`
     (check it against the two seam files' `paths:` and the two area files' `paths:`), and the sentence added to the
     task-observer row.
5. **The document check's start count** — `raptor-port/scripts/docsize-reads.mjs` (`START_SHORT` and the branch in
   `measure`) and the two cases added to `raptor-port/scripts/docsize-selftest.mjs`. Before this change the check
   counted the start hook's here-document; now that is only the fallback, so a hook that names the short form's file is
   counted by the file. Does it count the right thing in every case (the hook names the file and it exists; names it
   and it is missing; a hook that names it only in a comment)? Do the two new cases fail if the branch is removed?
6. **Anything left behind (D201).** Search for the subject — the start hook's instruction to invoke the skill, "invoke
   the `task-observer` skill at the start" — in files a chat loads or a reader would trust (`raptor-port/CLAUDE.md`,
   `raptor-port/docs/`, `.claude/rules/`, `.claude/skills/TASK-OBSERVER-VENDORED.md`, `AGENTS.md`,
   `raptor-port/docs/codex-guide.md`). Name any live place that still tells a chat to invoke the full skill at every
   session start without saying the short form replaces it. Ignore archives (`docs/archive/`, `*-ARCHIVE.md`,
   `.claude/decisions-full/` rows' history) and the skill's own vendored files (left as they are on purpose — part B).

Report in plain sentences. Severity: high (a chat would act wrongly, or a hook fails), medium (a record is untrue or a
meaning shifted), low (wording). End with a one-line verdict: switch on as is / switch on after the named fixes / do not.
