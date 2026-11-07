<task-observer-short-form>
The skill-notes guide (`task-observer`, vendored at `.claude/skills/task-observer/`) in its short form for this project
(his D969, point F; its wording approved, D1740). At the start of a task session — any session where you will use tools and produce deliverables —
this is enough: do not invoke the full skill. For this project it replaces the skill description's instruction to invoke
the full skill at every session start. Invoke it (Skill tool, `task-observer`) only to run a review, to create or edit a
skill, for a question about its setup, or for a case this short form does not cover.

**The one log:** `.claude/skill-observations/log.md`, committed with the work, on every device and in web sessions alike.
Never create another (the skill's default path under `~/.claude/projects/` is not used here). How reviews run here, and
provenance: `.claude/skills/TASK-OBSERVER-VENDORED.md`.

**At the start:** scan the OPEN notes (and active principles in `.claude/skill-observations/cross-cutting-principles.md`,
if there) and keep them in mind without raising them unprompted. Read `.claude/skill-observations/last-review-date.txt`
(a date is when a review last ran; `never`, none yet — a missing file is recreated with `never`, and only a review that
ran writes a date). If it is older than 7 days, or `never`, and notes are open, offer the review in one line and carry on
with his task — never hold his work for it. Past about 60 open notes, make the offer a line in the closing report or
handoff instead ("the log holds N unreviewed notes; a review is a job of its own — start one?"); past about 10 for one
skill, offer that skill's review alone. When you load any skill, apply the log's OPEN notes tagged to it, even if the
skill file has not been updated yet.

**What to watch — the whole session**, the work and also his feedback and any talk about how work should be done:
- a new skill: a reusable workflow or method no skill captures, a recurring task with a clear shape, a process he
  explains ("I always do it this way");
- a better skill: a skill's rule broken (it needs enforcing — a checklist, a check, a step that cannot be skipped — not
  saying louder), a correction that shows a missing rule or case, corrections forming a pattern, feedback that
  generalises, a better way than the skill's, something that worked well enough to make it the recommended way, an
  undocumented use case, a wrong assumption, a step new tooling made obsolete, a naming, framing or structure suggestion
  (even in passing), a principle other skills share;
- a simpler skill: a part never relevant across many sessions, a rule from one unproven case, a step always skipped,
  rules that contradict, complexity added just in case that never triggered, a rule always broken (enforce it or remove it).
Do not log a one-off correction that does not generalise, what a skill already says, a tool bug unrelated to method, or,
as open-source, a note that needs a client's private detail to be useful (log it as internal instead).

**How to log — silently, in the same turn or the next, never held in mind for later:**
1. Read the log's highest number now, never from memory:
   `grep -o '### Observation [0-9]*' .claude/skill-observations/log.md | grep -o '[0-9]*' | sort -n | tail -1`.
   Other open branches write the log too — number past their entries, and say so in the entry; one search of every
   branch: `git grep -h -o -E '^### Observation [0-9]+' $(git for-each-ref --format='%(refname)' refs/remotes) -- .claude/skill-observations/log.md | sort -u -k3,3n | tail -3`.
2. Just before appending, check that number is not already in the log; if it is, go past every existing number and log
   a one-line note of the collision. Before a write by a script, keep a backup and count the `### Observation` headings
   in the live file: an append adds exactly one. Append at the end — never mid-file, never another numbering format.
3. After, check the number occurs once; if a parallel writer took it, renumber your own entry (found from your
   append's line count, not the last match) to the next free number, and read the line back to see the change took.
The entry — `**Status:** OPEN` is its first field, always:
```
### Observation N: <short title>

**Status:** OPEN
**Date:** <date>
**Session context:** <the task>
**Skill:** <its name, or "New skill candidate: <working name>">
**Type:** open-source | internal
**Phase/Area:** <the part of the skill or workflow>

**Issue:** <what happened — clear weeks later without this chat>
**Suggested improvement:** <the concrete change; for a skill, the section or rule>
**Principle:** <the general lesson; for open-source, no client or project detail>
```
Open-source is the default (a lesson others could use, its specifics stripped); internal holds his or the project's
own specifics or preferences. Evidence that lives only in this session is saved into the repo first and named on a
`**Reference file:**` line.

**When to write:** after about every third task-list step you complete, write to the log — your notes, or a one-line
"no observations" marker; and whenever you present or render a major deliverable or finish a batch of steps, write
what is pending first.

**A trap met again** is not a new note: add a dated line under the earlier one ("met again <date>: <job>") — or, if it
is closed, a new note citing its number — and propose a guard: a check inside the action that triggers it, or, where a
safer way costs nothing extra, an unconditional default in place of a judgement each time.

**Cite a note** only by its `### Observation N:` heading, never by a search tool's line number; before quoting it,
compare it with the log's highest number (a number past it is a line number misread).

**At the end:** check every number you wrote is still in the log exactly once (a parallel writer can erase one without
a sign; re-append a lost one with a fresh number and log a note of the collision), and that each has its Status line,
follows Issue → Suggested improvement → Principle, has its type, names the section for an existing skill, and, if
open-source, keeps client and project detail out of its Principle. Then give him your notes grouped by skill —
new-skill candidates apart — each one sentence with its type; say they wait for the next review, and stop. Raise a note
sooner only if it needs his input, a skill is giving wrong output now, or notes cluster on one skill. Act on a note only
when he asks, in a review, or to correct a skill giving wrong output in this session; when a note's lesson lands
anywhere, mark its entry `ACTIONED (<date>) — <where>` in the same change.

**Changing the log beyond an append** — a status, an archive, a renumber, a merge of two branches' logs — follows the
full skill's "Log-write safety" (a backup, the log read fresh just before the write, one entry at a time, the count of
headings checked against the live file). Resolved notes are not archived on every write here: they move to the archive
only at a review's clean-up (`.claude/skills/TASK-OBSERVER-VENDORED.md`, D69), and that move keeps "Archival on
Write"'s date rule and count check. At a merge, keep the reviewed side's entries (or either side's, if neither was
reviewed) and re-append the other side's new ones at the end with fresh numbers, correcting any cross-reference to them.
</task-observer-short-form>
