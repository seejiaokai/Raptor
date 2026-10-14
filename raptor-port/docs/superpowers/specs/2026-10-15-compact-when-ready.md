# Compacting when ready — the design (`[COMPACT-WHEN-MOD]`, D868, D870)

**His rulings:** D868 — from about 80% full the agent chooses the moment to compact, without asking him, the state
saved first, so a big job does not compact twice (a handoff to a fresh chat stays his usual way). D870 — "Build it":
built now, with the check-run fix (`[RUN-CHECK-BOTH-RUNS]`), tested, read by one fresh reader and approved by him
before it is switched on; nothing in it may make compaction later than the app's own point (97%).

**When it applies (D874, which replaced D873):** in the day, to a big job that would otherwise fill the chat before a
suitable point to hand off comes. The agent goes on suggesting a handoff to a fresh chat whenever it judges the work
is at a suitable point — clean, committed, little lost — as it always has, mid-job included. At night (and when he is away) the whole run is covered, with the guard off (D872).

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
   unattended, or an /overnight run), or he does not answer and the chat keeps filling, carry on — the compaction will
   come, and a second note says when (piece 4). *(As first drafted this note asked for "ready" at once; the fresh read
   showed the compaction would then land wherever 85% was crossed later — changed, 15 Oct 26.)*
3. **"Ready"** — a one-line command the agent runs once told a compaction is waiting, after its checkpoint; it leaves
   a small mark beside the checkout's git data (never committed), good for ten minutes.
4. **A guard before an automatic compaction** — holds it back only when it is an ordinary automatic compaction outside
   a helper, the last request stood from 80% to under 90% and is still under 90% with what came in since, it has not
   already held on that same request, and there is no fresh "ready" mark; then it notes that one is waiting, and the
   next tool use tells the agent once. Otherwise it never holds — so compaction is never later than the app's own
   point, and a compaction the app needs to recover is never refused.
5. **After a compaction** — a hook prints, into the fresh context, the instruction to re-read this chat's
   `HANDOFF.md` block, the working guide in use and the files of the step in hand before the next change, and the
   block itself; it clears the "ready" mark and the reminders.
6. **The fullness on his screen** — the status line: "Chat 34% full"; from 80% "· compact at the next clean point";
   "· ready" once marked. Whether the desktop app shows a status line is to be seen on his screen.

Every script is plain, readable Node (D623) and fails open: any error lets the app do what it does today.

## Built (15 Oct 26) — on his explicit permission

The safety check of his Claude app refused the work on the hooks as "self-modification" until he wrote: *"I allow
you to change this project's Claude settings and hooks for the compaction set-up"*. Then built: the scripts in
`.claude/hooks/` (`compact-lib.mjs`, `compact-watch.mjs`, `compact-ready.mjs`, `compact-guard.mjs`,
`compact-resume.mjs`, `statusline.mjs`), wired in `.claude/settings.json` (`autoCompactWindow` 880000, PostToolUse `*`,
PreCompact `auto`, SessionStart `compact`, `statusLine`), and the check-run fix (`[RUN-CHECK-BOTH-RUNS]`) in
`.claude/rules/shipping.md`, `HANDOFF.md`'s header and the session-handoff guide.

**Checked:** eight tests (`node --test .claude/hooks/compact-hooks.test.mjs`) — the fullness read, the bands, the
guard's five cases, the block handed back, the status line, rubbish input failing open, the POSIX-path fallback;
the four wired commands run through bash exactly as written in the settings, on this chat's real record (39% read);
end to end in this checkout — held without a mark, let through with one, the status line saying "ready to compact",
the block handed back and the mark cleared. **Found and fixed by that run:** a folder handed in the POSIX way
(`/c/Users/…`) is not a folder to Node on Windows, so the mark was written and never found — git now falls back to
the script's own folder.

**The fresh read (`../briefs/2026-10-15-compact-set-up-read.md`) found ten faults, all fixed, the first one serious:**
as first built, the guard could hold a compaction the app needs to RECOVER from an overfull request, which makes that
request fail — overnight, the end of the run. The guard now holds only an automatic compaction, outside a helper,
with the last request from 80% to under 90% AND under 90% once what came in since is added, and never twice on the
same request (pieces 4 above, in `compact-guard.mjs`). And "ready" is asked for only once a compaction is actually
waiting (the guard has held one), for the next ten minutes — so the compaction lands at that clean point, not
wherever 85% is crossed later; the 80% note asks for the checkpoint and the handoff judgement only (D871). Helpers
neither get the notes nor use them up; the notes come back after a compaction even if the after-hook did not run; a
block too long for the app to pass on is named instead of cut; Windows line endings; the ready command runs from any
folder. Twelve tests pin them.

**Approved, with the guard OFF whenever he is away (D872, 15 Oct 26 — "approve, guard off at night").** One small risk
was left in the guard — its estimate of what came in since the last request could read low at the worst moment, and
one refused request at night ends the run. So: `compact-ready.mjs --away` switches the guard off (an /overnight run's
step 9, or his word that he leaves a job unattended), `--back` switches it on again (the morning report); the mark
lapses by itself after sixteen hours. While it is off the app compacts at about 85% whenever it gets there; the 80%
note and the saved block handed back after a compaction stay on.

**Still untested — first read in a NEW chat once this is on `main`** (the settings and hooks are taken when a chat
starts; this chat still reads "compacts at 97%"): (a) the app's own reading of the compaction point in a new chat
(`get_usage` → `autoCompactsAtPercent`; expected about 85); (b) whether the status line shows in the desktop app's
Code tab; (c) whether the reminder reaches the agent after a tool use; (d) whether a held compaction is tried again
later. If (a) does not move, the guard has nothing to hold and the set-up falls back to the reminder, the saved block
handed back and the app's own 97% — never worse than today.

**Read 15 Oct 26 in a new chat, with the main folder on `main` (`[MAIN-CHECKOUT-STALE]`):** (a) TAKEN — the app now counts the
chat against 880,000 and compacts at 96% of it, about 845,000 (about 85% of the whole room); the notes count against
1,000,000, so the first comes only about 45,000 before it — `[COMPACT-BANDS-WINDOW]`. (b) NO — he sees no status line
under the message box in the desktop app's Code tab; the fullness reaches him only through the agent's reports. (c), (d)
not yet seen — they need a chat that reaches 80%.

**The fix approved — D878 (15 Oct 26, his "4 fix"; filed as `[COMPACT-BANDS-WINDOW]`):** the notes and the guard count the
chat against the app's own room and the first note comes well before the compaction (the agent's reading: about 75% of
880,000, the guard's window from there to the compaction point). His permission to change the hooks for that fix; tested
and read by one fresh reader before it is switched on. Built as its own job.

**Built (15 Oct 26, branch `claude/glow-off-compact-bands-window-40b514`) — `[COMPACT-BANDS-WINDOW]`, D878.** Every figure the
hooks give is now a percentage of the APP'S room, read as the app reads it: the `autoCompactWindow` setting in the project's
local settings, else its shared settings (the folder the hooks sit in), else his own; else the whole 1,000,000
(`compact-lib.mjs appRoom`). With 880,000: the notes at 75, 80, 85 and 90% of it — the first at 660,000, some 185,000 before
the app compacts at 96% (about 845,000); the guard holds an automatic compaction from that first note to under 900,000
tokens (90% of the model's whole room, as before — about 102% of the app's room, so it can hold the app's own attempt for
a clean point and never holds near the true limit); the status line's "compact at the next clean point" from 75%, so it
agrees with the app's own figure. On a room of the whole 1M (no setting) the backstop is 90% as first built and the notes
start at 750,000. Pieces 2, 4 and 6 above read with these figures. **Checked:** 16 tests (`node --test
.claude/hooks/compact-hooks.test.mjs`) — the room read (the first file that sets it, local first, nonsense ignored, a
test's override), this checkout's figures (the note at 660,000, at least 180,000 before the compaction, the backstop at
900,000), and the hooks run as the app runs them: silent at 650,000, the note at 665,000 ("76% full, about 665k of the
app's 880k"), the app's own attempt at 846,000 held, one at 901,000 never held, the status line from 75%. The same record
at 665,000 run through the hooks on `main` gives no note at all. The overnight guide's two lines that named 80% now name
the first note (D878). **Switched on** only by his "merge live" and the main folder brought level (`[MAIN-CHECKOUT-STALE]`):
the app runs the hooks from the main folder. Read by one fresh reader before he approves it (D878, D70).
