# Session handoff — [ALL-AVAIL-WINDOW] built, not bug-checked (23 Sep 26)

**Something IS unfinished.** The full handoff is `HANDOFF-NEXT.md` at the repo root — read that; this
file exists only so `CLAUDE.md`'s promise (absent = nothing pending) stays true, and deliberately does
not repeat it.

- **Branch:** `claude/all-avail-window`, pushed, no PR, NOT merged. Start there, not `main`.
- **First job:** the window paints UNDER the scheduler board (z-index 150 against 400) — fix it before
  anything else; then wire `crowdClashes` (the D38 debrief flag).
- **Work list:** `raptor-port/docs/handpass/2026-09-23-allavail-window-fable-scenarios.md`.
- **Gate not yet run on HEAD:** the full `npm test` (only targeted runs after `7c2953b5`).

The previous content of this file (the `[OIL-SEATS-CAN-EARN]` walk) described work that has since
merged (PR #425) and was stale — overwritten, not appended.
