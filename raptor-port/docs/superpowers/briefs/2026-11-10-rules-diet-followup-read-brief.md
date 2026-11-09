# The rules diet's follow-up — the blind read's brief (10 Nov 26, chat 48, D1949)

Sent word for word to Astra (`codex exec`, reasoning high, read-only) and to a fresh, blind Opus reader. You are one of
two readers, blind to each other. READ ONLY: change no file, run no command that writes, commit nothing. Work in
`C:\Users\User\projects\Raptor\.claude\worktrees\rules-diet-followup-4a76cd`, branch `claude/rules-diet-followup-4a76cd`.

## Background
The project's rules for the agent live in rulings files under `.claude/rules/decisions/` — one page per area. A page
with `paths:` at its top loads by itself into a chat only when the chat opens a file matching one of those paths (a file
read with the Read tool; a shell read loads nothing). A page with no `paths:` loads in every chat. Each statement on a
page cites the owner's rulings after it; each ruling's full row (his words, what it means, where it lives) is in
`.claude/decisions-full/<area>.md` (`grep -h '^| D1949 |' .claude/decisions-full/*.md`). The design guide
(`raptor-port/docs/design-practices.md`) is read by section in any interface job, as `.claude/rules/ui-design.md` names.
The measure of what a job reads: `node raptor-port/scripts/docsize.mjs --reads --verbose` (its model jobs are in
`raptor-port/scripts/docsize-reads.mjs`).

## What changed (one commit on `main` at `786886b6d`: `git diff 786886b6d HEAD`)
Under the owner's D1949 (read its full row) and the backlog item `[RULES-DIET-FOLLOWUP]` in `OUTSTANDING.md`:
1. The scheduler's rulings page, `.claude/rules/decisions/scheduler.md`, no longer lists `raptor-port/docs/performance.md`
   and `raptor-port/docs/feature-impact.md` in its `paths:`. Before, a Leave War or Tracker job loaded the whole scheduler
   page (about 31,000 tokens) only because it opened those two guides.
2. To keep what a Leave War job needs: two new pointer lines on the Leave War page's "From other areas" section, naming
   the scheduler-page rulings that govern Leave War screens and are stated nowhere a Leave War job loads, and a line that
   the scheduler page does not load with a Leave War file; the same one line on the Tracker page.
3. The performance guide (a note at the top of Part 1) and the ripple map (the end of "How to read it") now say the
   rulings are on the area pages, which do not load with them.
4. `HANDOFF.md`: six blocks of chats whose work has merged were removed (the four the item names, and chats 46 and 47);
   their leftovers were filed in `OUTSTANDING.md` — a new item `[SCHED-MARKS-ASKS]`, and additions to `[IT-QUESTIONS]`,
   `[CHECK-TOOLS-HARDEN]` and `[RULES-DIET]`; the follow-up item's status. The blocks before: `git show 786886b6d:HANDOFF.md`
   (in Git Bash set `MSYS_NO_PATHCONV=1` first).

## The five questions — answer each, with evidence
1. **A ruling a job can no longer reach.** After the change, which jobs open either guide without opening a file that
   still loads the scheduler page — a Leave War job, a Tracker job, an OIL, People & accounts or IT flow guide job, a
   notes-only chat that edits either guide? For each, check every statement on the scheduler page that names the Leave
   War, the Tracker, or every screen / the whole app, and each of the page's settled speed rulings, against what that job
   still loads (every page's `paths:`, `.claude/rules/seams/*.md`, the design guide's sections). Name any ruling a job now
   needs but cannot reach, and say whether the pointers added cover it.
2. **The pointer lines faithful.** Do the new lines on `leave-war.md` and `tracker.md` say what the scheduler page's lines
   and the full rows they cite say — no scope widened or narrowed (to one screen, the phone, members or admins), no
   condition, exception or "not built" dropped, no reading of the agent's stated as his rule? Is every number cited one
   the line's words cover, and is any number its words cover missing?
3. **The guides' notes.** Is each placed where a reader by section reads it (the measure's sections for those files; the
   ripple map's own "How to read it")? Is each accurate — the section names it points to exist, the claim about what loads
   true?
4. **The handoff's leftovers.** For each of the six removed blocks: is every open point — a question for him, a thing
   unchecked, a thing waiting, a recommendation not yet answered — now in `OUTSTANDING.md` (an existing item or a new
   one), or plainly finished? Is each new filing faithful to the block — no claim widened, no point merged into another
   that changes it?
5. **Anything else this change breaks** — a contradiction with a ruling or another guide, a safeguard dropped, a
   statement now false elsewhere (search for text that says the scheduler page loads with the performance guide or the
   ripple map), bulk added. Reproduce the measure's Leave War and Tracker totals.

**Not a finding:** a fault in a ruling or a page that this change did not touch; a problem living only in data already
stored (D56). A finding names the file and line, the concrete consequence (which job, missing which ruling, doing what
wrong), its cause and the fix. Say plainly if you find nothing under a question. End with a one-line verdict.
