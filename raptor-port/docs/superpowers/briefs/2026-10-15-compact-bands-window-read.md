# Brief — a fresh, blind read of `[COMPACT-BANDS-WINDOW]` (D878)

**You are the one fresh reader his ruling D878 requires before he approves a change to the project's hooks** (and D70's
one reader for the two lines of a working guide it changes). You did not write this. Read-only: change no file except your
report.

## What changed, and why
The compaction set-up (`.claude/hooks/compact-*.mjs`, `statusline.mjs`; design
`raptor-port/docs/superpowers/specs/2026-10-15-compact-when-ready.md`) counted the chat against 1,000,000 tokens. The app
now counts it against its own room, the `autoCompactWindow` setting (880,000 in `.claude/settings.json`), and compacts at
96% of that (about 845,000). So the first note (80% of 1M = 800,000) came only about 45,000 before the compaction. His
ruling D878: count against the app's own room, the first note well before the compaction (the agent's reading, told to
him: about 75% of 880,000 = 660,000; the guard's window from there to the compaction point).

The commit to read: `git show 6ebaf1870` (branch `claude/glow-off-compact-bands-window-40b514`). Read the WHOLE of each hook
file as it now stands, the test file, the design note's last section, and the two changed lines of
`.claude/skills/overnight/SKILL.md` (around "Compact smartly").

## What to look for — absences first
1. **Does any path now make a compaction LATER or LESS SAFE than before?** The standing rule (D870): never hold a compaction
   the app needs to RECOVER (an overfull request); never hold near the true limit. The backstop is kept at 900,000 tokens
   absolute (`NEVER_HOLD_TOKENS`); in percent of an 880,000 room that is ~102.3. Check `decide()` and `readFill()` together
   with the new `WINDOW` — e.g. `pctNow` with a large tail, a chat on a smaller model, a room read wrong.
2. **The room read (`appRoom`)**: the app runs hooks from `$CLAUDE_PROJECT_DIR/.claude/hooks/` (the MAIN checkout's folder,
   `[MAIN-CHECKOUT-STALE]`); the function reads the settings beside the hook file, local first, then his user settings.
   Is that the order the app itself uses for `autoCompactWindow`? What if the setting is in the user file but a different
   value in the project file? What happens when a settings file exists but cannot be parsed? Is reading at import (once
   per hook run) a problem?
3. **The status line**: the app may hand it `context_window.used_percentage` (of its own room) — does the line now agree
   with the notes? (He sees no status line in the desktop app today — check (b) — so this is low weight.)
4. **Tests**: does any test pass for the wrong reason (e.g. reading the real settings file on this PC, an env override
   leaking between tests, a spawned hook reading a different settings file than the test assumes)?
5. **Words**: do the notes, comments and the guide lines say what the code does? Anything still saying "80%" that now
   means something else?

## Not a finding
A problem that lives only in data already stored (D56) — e.g. an old state file in the temp folder. A style preference
without a concrete failure (D489: a finding needs the concrete failure, its cause and its exact fix).

## Report
Write `raptor-port/docs/superpowers/briefs/2026-10-15-reads/compact-bands-window-opus.md`: each finding numbered, with
severity (must / should / low), the concrete failure, its cause, and the exact fix (file, what to change). Then one line:
"Safe to switch on as is: yes / no, because …". Return a short summary to the host.
