# The read of the compaction set-up — the reader's report (15 Oct 26)

One fresh, blind Opus reader, read-only, of the set-up built for `[COMPACT-WHEN-MOD]` (D868, D870, D871): the design
`../specs/2026-10-15-compact-when-ready.md`, the scripts in `.claude/hooks/compact-*.mjs` and `statusline.mjs`, the
settings, and the guide edits. Saved the moment it arrived; what the host did is at the end.

## Findings, most serious first (the reader's, condensed without changing their meaning)

1. **HIGH — the guard can make a request fail, and keep failing.** Claude Code's hooks page (PreCompact): blocking a
   compaction triggered "to recover from a context-limit error already returned by the API" makes "the underlying
   error surface and the current request fail". The guard cannot tell a recovery compaction from a proactive one, and
   its fullness is the last request already in the record, against an assumed 1M window. Shown: a record at 89% then
   about 150k tokens of tool output (really about 104%) — held; a 195k chat on a 200k model, read as 19.5% of 1M —
   held; with no new request after the failure, every retry reads the same figure and is held again — overnight the
   run would die. Also if PreCompact fires for a helper (whose hook gets the main chat's record). Fix: hold only from
   80% to under 90%, never for a helper (`agent_id`), and never twice on the same last request (store its uuid at a
   hold; a second attempt with no new request goes through).
2. **MEDIUM — the reminder goes into helpers, and the main chat then never gets it.** PostToolUse fires for helpers'
   tool calls with `agent_id` and the main chat's record; the helper used up the band. Fix: silent when `agent_id`.
3. **MEDIUM — marking "ready" does not make the compaction come at the clean point.** The app tries only once 85% is
   crossed; a mark at 81–84% approves any compaction in the next 45 minutes, so it lands wherever 85% is crossed,
   mid-step. Fix: the 80% reminder asks for the checkpoint only; when the guard holds, it records that, and the watch
   hook says once "a compaction is waiting — at the next clean point save the state and mark ready; it comes at your
   next step"; the mark's life about 10 minutes; the overnight bullet to match.
4. **LOW-MEDIUM — the reminders can stop for the rest of a chat** if the after-compaction hook does not run (the band
   stays high). Fix: when the fullness falls below the stored band, lower the band.
5. **LOW-MEDIUM — idle compaction is held too** (it is `auto`), so an idle chat is resent whole. Covered by 1's floor.
6. **LOW — a long saved block does not come back whole:** a hook's printed text over 10,000 characters is cut to a
   2,000-character preview; the largest block in the last 80 versions was 11,294. Fix: over about 9,500, print the
   header and "open it in HANDOFF.md now" without the block.
7. **LOW — Windows line endings hide the block.** Fix: split on `\r?\n`.
8. **LOW — the records are out of date** (the block and the backlog still say "waiting for his build it"); if handed
   back after a compaction they give the wrong state. Fix: rewrite both.
9. **LOW — the overnight bullet's wording:** "above that mark" is ambiguous; "where a piece does not run, the app
   compacts near full" is wrong if the lowered point applies and the guard does not.
10. **LOW — the ready command breaks from a subfolder** (relative path). Fix:
    `node "$(git rev-parse --show-toplevel)/.claude/hooks/compact-ready.mjs"`.

**Ran:** the 8 tests (pass); the settings parse, the diff only adds; the watch hook through its exact command on a
3.8MB record, 139–160 ms per tool use (node start-up alone about 110 ms); made-up records fed to the guard (above);
the after-compaction hook in a throwaway repo; the ready command from a subfolder; the status line ("Chat 42% full");
this chat's record (no helper entries, one model, no unexpected drops); all output valid JSON, every exit 0; the
`gh run list` fields; his own settings carry nothing that cancels the project's. **Not checked:** real behaviour in
the app (the point moving, the status line in the desktop Code tab, the reminder reaching the agent, a held
compaction tried again); whether PreCompact fires inside helpers; which shell runs the status line on Windows; how
the app turns 880000 into its point.

## What the host did

All ten taken. Beyond the reader's fix for 1, the guard also adds an estimate of what came AFTER the last request
(the bytes of the later lines, about four to a token) — so the reader's own case (89% then 150k of tool output) is let
through on the FIRST attempt, not only the second: a recovery compaction must never be held even once.
