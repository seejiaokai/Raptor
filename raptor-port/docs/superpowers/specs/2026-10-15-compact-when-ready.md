# Compacting when ready — the design (`[COMPACT-WHEN-MOD]`, D868, D870)

**His rulings:** D868 — from about 80% full the agent chooses the moment to compact, without asking him, the state
saved first, so a big job does not compact twice (a handoff to a fresh chat stays his usual way). D870 — "Build it":
built now, with the check-run fix (`[RUN-CHECK-BOTH-RUNS]`), tested, read by one fresh reader and approved by him
before it is switched on; nothing in it may make compaction later than the app's own point (97%).

## What was measured (15 Oct 26, this chat)

- **The chat's own record carries its fullness.** The last assistant entry of the conversation's record (the
  transcript file every hook is handed) holds the token counts of that request; input + cache-written + cache-read =
  335,823 tokens, against the app's own reading of 336,480 (34% of 1,000,000). So a hook can read the fullness
  itself, whether or not the on-screen line works in the desktop app.
- **Moving the app's compaction point:** the documented setting (`autoCompactWindow`, a token count) was written into
  the project settings at 880,000; the app's reading in the same turn still said "compacts at 97%". Whether it applies
  from the next message, the next chat, or not at all in the desktop app is still to be read.
- **The agent cannot start a compaction itself** (Claude Code's documentation: no tool runs `/compact`, no hook can).
  Whether a scheduled message of `/compact` runs as the command is undocumented — not tested (it would compact the
  chat it is tested in).

## The pieces

1. **The compaction point lowered** to about 85% (the setting above; the exact figure set from what the app's reading
   shows once it applies).
2. **A reminder at 80%, 85%, 90%, 95%** — a hook after each tool use reads the fullness from the record and, once per
   band, tells the agent: finish the step in hand, commit, push, rewrite this chat's `HANDOFF.md` block as a handoff
   would; start no new helper, walk or gate run until then. **Then judge (D871):** if the job is nearly done (the work
   left fits in the room left, the handoff written) and he is using the chat, do not compact — ask him once, in one
   line with that judgement, whether to hand off to a fresh chat; if he is away (his word that he is leaving a big job
   unattended, or an /overnight run), or he does not answer and the chat keeps filling, mark "ready" and let the
   compaction come at that clean point.
3. **"Ready"** — a one-line command the agent runs after that checkpoint; it leaves a small mark beside the checkout's
   git data (never committed).
4. **A guard before an automatic compaction** — holds it back while the chat is under 90% full and no fresh "ready"
   mark exists; at 90% or more, or when the fullness cannot be read, it never holds (so compaction is never later
   than the app's own point).
5. **After a compaction** — a hook prints, into the fresh context, the instruction to re-read this chat's
   `HANDOFF.md` block, the working guide in use and the files of the step in hand before the next change, and the
   block itself; it clears the "ready" mark and the reminders.
6. **The fullness on his screen** — the status line: "Chat 34% full"; from 80% "· compact at the next clean point";
   "· ready" once marked. Whether the desktop app shows a status line is to be seen on his screen.

Every script is plain, readable Node (D623) and fails open: any error lets the app do what it does today.

## Not yet done — waiting on his permission

The safety check of his Claude app refused the agent's work on the hooks as "self-modification" (15 Oct 26) and asks
for his explicit permission. Until he gives it, nothing of pieces 2–6 is written.
