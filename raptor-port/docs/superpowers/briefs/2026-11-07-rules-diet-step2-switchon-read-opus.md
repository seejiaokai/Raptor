# The rules diet, step 2, switch-on: blind read by a fresh Opus reader (7 Nov 26)

*Saved whole, as returned. Brief: `2026-11-07-rules-diet-step2-switchon-read-brief.md` (all six questions). What was done
with each finding: the drafts document's part E, "The switch-on's reads".*

This was a read-only review. I changed nothing in the repo and committed nothing. My scratch scripts and outputs are in `C:\Users\User\AppData\Local\Temp\claude\165715d78b84c047\676465c8-b34d-407a-82fd-05bfbb92680d\scratchpad\`.

## Findings

**F1 — medium. The measure of what a chat reads now counts the skill-notes guide twice.**
- **Where:** `raptor-port/scripts/docsize-reads.mjs`, `TASK_READS`, line 44: `{ f: '.claude/skills/task-observer/SKILL.md', why: 'the skill-notes guide, invoked at every task\'s start' }`.
- **What is wrong:** the new branch in `measure` counts the short form at the start. The full `SKILL.md` stays in every job's task column, unconditionally. I ran `measure()` on the worktree:
  - start: `SHORT-FORM.md` at 2,701 tokens;
  - every job (notes, Leave War, scheduler, Inputs, Tracker): `SKILL.md` at 9,862 tokens in its task column.
- **What goes wrong:** this report exists so "each step of the diet can be measured again before and after" (its own head comment; D1732, D1735). The switch-on will show as roughly 2,400 tokens more per chat, when it actually saves about 7,500. The before-and-after figures put to him for step 2 would be wrong in direction as well as size.
- **Fix:**
  1. In `measure`, note whether the start item is the short form:
     ```js
     let usesShort = false
     if (read(START_NOTE) != null) { …; usesShort = short != null; start.push(…) }
     const tReads = usesShort ? taskReads.filter(r => r.f !== '.claude/skills/task-observer/SKILL.md') : taskReads
     ```
     Better: a new `export const START_FULL = '.claude/skills/task-observer/SKILL.md'`.
  2. Use `tReads` in both `taskReads.map(r => take(r, 'task'))` and `follow([...taskReads.map(r => r.f), ...j.opens], …)`.
  3. Change line 44's `why` to say it is read only when the hook gives its fallback.
  4. Update the head comment's `task` line 12 ("— the skill-notes guide, HANDOFF.md …").
  5. Add a self-test case that passes a `taskReads` containing `SKILL.md`:
     - with the hook naming the short form and the file present, `SKILL.md` is not in the task column;
     - with the file missing, it is.

**F2 — medium. The backlog still says the short form is not done.**
- **Where:** `OUTSTANDING.md` line 225, in the priority list: "[CONTEXT-START-SIZE] — left: the short skill-notes guide (F) and his own connectors setting (E)". The item's status (around line 1997) says the same: "Left: F, the short skill-notes guide, not done (told him)" and "F: not done …".
- **What is wrong:** this change builds F, D1740 approves it, and the hooks switch it on. D201 says to fix the lists in the same change.
- **What goes wrong:** every chat reads the priority list before calling anything open (D53). The next chat would tell him the short form is unbuilt, or start it again.
- **Fix:** in this change:
  - line 225 → "left: his own connectors setting (E); F, the skill-notes short form, built and switched on on `claude/rules-diet-step2` (D1740), live on his "merge live" (D1737)";
  - the same in the item's bold status line;
  - archive the item by script once it merges, if only E, his own setting, remains.
- This may have been planned for the closing commit. It is not in this diff.

**F3 — low (could happen later). Nothing guards Claude Code's 10,000-character limit on the start hook's text.**
- **Where:** `.claude/hooks/task-observer-session-start.sh` and `SHORT-FORM.md`.
- **What is wrong:** Claude Code's hooks documentation (https://code.claude.com/docs/en/hooks; docs.claude.com redirects there) caps a hook's `additionalContext` at 10,000 characters. It appears under "JSON output" and again under "Add context for Claude". It also says:
  - over the limit, the text is saved to a file, and Claude gets the file path plus a preview of up to the first 2,000 characters;
  - "Claude Code doesn't ask Claude to read the file";
  - no setting raises the limit.
- Today the short form arrives as 7,401 characters, about 2,600 under the cap. Nothing checks it.
- **What goes wrong:** if a later edit takes the short form past 10,000 characters, every chat silently gets only its first 2,000. Those include "this is enough: do not invoke the full skill", so the chat would neither see the rest nor invoke the full skill.
- **Fix:** do either or both:
  - in the hook, after the two `CONTEXT` lines, add `if [ "${#CONTEXT}" -gt 9500 ]; then CONTEXT="$FALLBACK"; fi` (it fails open to the old instruction);
  - add a size tripwire of about 9,500 bytes on `SHORT-FORM.md` to the document check, with this reason.

**F4 — low (could happen later). A stray control character would break the JSON and lose the whole note.**
- **Where:** `escape_for_json` in the start hook. It escapes only backslash, double quote, newline, carriage return and tab.
- **Today:** checked byte by byte, the file has no other control character, no DEL and no byte-order mark.
- **Reproduced in scratch:** a form feed or a \x01 in the file gives invalid JSON ("Bad control character in string literal").
- **What goes wrong:** per the same documentation page, invalid JSON from a SessionStart hook is a non-blocking error, and the session goes on *without the hook's output*. The chat would get neither the short form nor the fallback.
- **Fix:** do either:
  - before escaping, add `CONTEXT="$(printf '%s' "$CONTEXT" | tr -d '\000-\010\013\014\016-\037\177')"`;
  - or have the document check fail on such a character in `SHORT-FORM.md`.

**F5 — low. The measure decides "the hook names the short form" with a plain substring test.**
- **Where:** `docsize-reads.mjs` `measure`: `hook.includes(START_SHORT)`.
- **What is wrong, proven with a scratch copy:**
  - a hook that names the file only in a comment, and prints its here-document, is counted as the short form;
  - a hook whose `SHORT-FORM.md` exists but is empty is counted at 0 tokens, while the real hook prints its fallback in that case.
- **What goes wrong:** the report's start figure would not match what the hook prints. Neither case exists today: the real hook names the file on a code line, and the file is full.
- **Fix:**
  ```js
  const names = linesOf(hook).some(l => !/^\s*#/.test(l) && l.includes(START_SHORT))
  const s = names ? read(START_SHORT) : null
  const short = s != null && s.trim() ? s : null
  ```
  Add a self-test case for a comment-only mention.

**F6 — low. D1740's full row does not name the switch-on's homes.**
- **Where:** `.claude/decisions-full/how-we-work.md`, D1740's home cell. It names only `SHORT-FORM.md` and "the drafts document".
- **What is wrong:** the switch-on now lives in the start hook, `raptor-port/CLAUDE.md` §How to work here, `guide-full.md` §Task-observer activation, `TASK-OBSERVER-VENDORED.md` §Local changes and the file map. Each of the four documents already cites D1740. `record-decisions.md` asks that an entry name the files that carry it.
- **What goes wrong:** a later search of D1740's homes finds only the short form.
- **Fix:** append to the home cell: "; switched on 7 Nov 26 in `.claude/hooks/task-observer-session-start.sh`, `raptor-port/CLAUDE.md` §How to work here, `raptor-port/docs/guide-full.md` §Task-observer activation, `.claude/skills/TASK-OBSERVER-VENDORED.md` §Local changes". The document check's home test passes for each: every one is touched on the branch, and every Markdown one cites D1740.

**F7 — low. The drafts document's head is now untrue.**
- **Where:** `raptor-port/docs/superpowers/briefs/2026-11-07-rules-diet-step2-short-texts.md`, lines 8–9 ("Parts A and B are drafts **not yet switched on**: their hooks are unchanged on the branch …") and line 75 ("nothing loads it yet"). D1740's row names this document as a home.
- Also: part B's "7,373 bytes" is stale. The short form was 7,419 bytes after the readers' fixes and is 7,448 with D1740's citation.
- **Fix:** add one dated line under the head: "Switched on 7 Nov 26 (D1740): both hooks now print parts A and B; part B's steps 2–4 are in."

**F8 — low (wording). Two sentences in the file map.**
- **Where:** `raptor-port/docs/file-map.md`, the rulings row.
- **What is wrong:** the row still says "each area file also carries … (Leave War, Tracker) its architecture" in the present tense, then adds "— and on 7 Nov 26 on to `../.claude/rules/seams/`". As written it says the area file both carries the architecture and does not.
- **Fix:** "… and (Leave War, Tracker) its architecture until 7 Nov 26, moved whole from `CLAUDE.md` on 24 Sep 26 (D140) and on 7 Nov 26 on to `../.claude/rules/seams/` (the row below)".
- **Also:** the new seams row omits that `seams/leave-war.md` also carries the qual catalogue bullet (its "## Moved from the rulings' §Settled — the bullet that binds a seam file"). Add "and (Leave War) the qual catalogue bullet".
- **Outside this diff (it came from the earlier moves commit):** `raptor-port/CLAUDE.md` §Where things live, the rulings row, still says each area file "carries that area's settled decisions and architecture too (D140)". That is now untrue for the Leave War and the Tracker.

**F9 — low (comment only). The start hook's comment leaves out one of the cases.**
- **Where:** `.claude/hooks/task-observer-session-start.sh`, lines 15–16.
- **What is wrong:** it lists the full skill's uses as "a review, a skill's creation or edit, or a case the short form does not cover". It omits "its setup", which D1740, the short form and the other three texts all include. No chat loads this comment.
- **Fix:** "a review, a skill's creation or edit, a question about its setup, or a case …".

## The six questions

**1. D1740's short line against its full row.**
- The short line is the row's bold rule, word for word. It says nothing the row does not.
- It leaves out the row's readings (2)–(4): the archival change, the per-message note switching on with it, and live only on "merge live". That is the short-line shape D390 sets. Reading (4) is D1737, which is itself a loaded line, so nothing is lost.
- D969's full row carries "— ANSWERED 7 Nov 26 BY D1740: F, the skill-notes short form, is approved as worded." Its short line ends "— changed by D1740, D976".
- `SHORT-FORM.md` names D1740 on its line 3.
- The one change to the short form since the approved version (a5f064930) is that citation, 29 bytes.
- The gate's home test passes: the row's only backticked home cites D1740.

**2. The two hooks against the approved drafts.**
- **The per-message note:** byte-identical to part A's "Proposed" text (625 bytes). Its comment block, lines 1–12, is untouched. `trap exit_ok ERR` and `exit 0` are kept. My run exited 0.
- **The start hook — normal case:** prints valid JSON whose text equals the file minus its last newline (7,401 characters).
  - Exit 0, about 0.09 seconds against its 5-second limit.
  - Same result with the project folder given in Windows form (backslashes or forward slashes), and in the C locale.
- **The start hook — fallback cases:** each gives the fallback as valid JSON. The fallback's text is byte-identical to the old instruction.
  - project folder unset and run from `/`;
  - file missing, empty, newlines only, or a folder.
- **Small cases:**
  - CRLF line endings are fine.
  - A file of spaces only prints the spaces. That is a nit, not a finding.
- **`set -euo pipefail` cannot stop it:** every command that could fail is guarded, and settings.json always runs it as `$CLAUDE_PROJECT_DIR/…`.
- **Control characters:** none in the file today; F4 covers the future case.
- **The size cap:** 10,000 characters, stated in Claude Code's hooks documentation (above). The short form sits under it today; F3 covers the gap.

**3. The three other texts of part B.**
- **The `CLAUDE.md` line:** part B step 2, verbatim, plus "D1740". Its short-form part is 347 characters, within the 350 the gate measures.
- **The `guide-full.md` paragraph:** step 3, verbatim, apart from the intended "its wording approved — D1740". It is placed after the old paragraph, which stays.
- **The `TASK-OBSERVER-VENDORED.md` line:** it says everything step 4 asks — the file, the hook change, the fallback, when the full skill is used, and the archival change — and adds the readers' provenance.
- No difference in meaning in any of the three.

**4. The new texts that were not in the drafts.**
- **Item 1's clause:** true. The hook injects the short form, not the whole `SKILL.md`.
- **The upstream-refresh sentence:** true. §Updating copies `SKILL.md`, the reference files and `LICENSE.txt` one by one and never clears the folder, so `SHORT-FORM.md` stays. "Read it again against the new `SKILL.md`" adds a sensible step and changes no ruling.
- **The file map's seams row:** checked against the `paths:` lists. Each seam file holds its area's own paths, line for line, plus the seam paths. Each area rulings file now holds only its own. The row is true apart from F8.
- **The task-observer row's sentence:** true.

**5. The document check's start count.**
- Hook names the file and the file exists: counted by the file. Correct.
- Hook names the file and the file is missing: counted by the fallback here-document. Correct.
- Hook names it only in a comment: wrongly counted as the short form (F5).
- **The two new self-test cases, mutation-tested in scratch:**
  - the first fails when the branch is removed ("counted .claude/hooks/task-observer-session-start.sh");
  - the second passes either way, by design — it pins the fallback, and would catch a branch that counted a missing file.
- **The full self-test:** 289 passes, "selftest OK", exit 0. The worktree was left unchanged.
- **The larger gap:** F1. The check still counts the full guide in every job's task column.

**6. Anything left behind.**
- No live text a chat loads still tells it to invoke the full skill at every start without saying the short form replaces it:
  - `raptor-port/CLAUDE.md` is updated;
  - in `guide-full.md` the old paragraph is followed by the new one that replaces it;
  - `.claude/rules/`, `AGENTS.md` and `codex-guide.md` say nothing about the skill;
  - `TASK-OBSERVER-VENDORED.md` is updated;
  - the hook's here-document is the intended fallback;
  - the skill's own description is left as it is, on purpose.
- What is left behind on this subject:
  - the measure's `TASK_READS` entry (F1);
  - the backlog's "F not done" (F2).
- Older specs and plans are history and were ignored.

**Verdict: switch on after the named fixes — F1 and F2. F3–F9 are low and may ride with them.**
