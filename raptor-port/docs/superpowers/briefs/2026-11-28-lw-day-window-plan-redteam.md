# Red-team brief — the Leave War day-window build plan (chat 198, 28 Nov 26)

You are one of two blind red-team readers of a BUILD PLAN. Another reader gets this same brief; you will not see their
report and they will not see yours. Read only; change no file except your own report.

**The plan:** `raptor-port/docs/superpowers/plans/2026-11-28-lw-day-window-plan.md` (written by a fresh Fable). It plans,
for the Raptor app's Leave War tab: the day window rebuilt to the approved drawing (A2), the "Placed by Saber" line,
the period list with "+ New period" first, and the schedule's "To review".

**Do not read** `HANDOFF.md` or any other review of this plan.

**The sources the plan must answer to** (read them yourself; do not trust the plan's summary of them):
- The owner's rulings: `.claude/rules/decisions/leave-war.md` (section "The bid windows and the day's list" first),
  `.claude/rules/decisions/scheduler.md`, `.claude/rules/decisions/inputs.md`, `.claude/rules/decisions/design.md`,
  `.claude/rules/decisions/people-accounts.md` where it touches who may change what. Full rows, his words and the
  readings: `.claude/decisions-full/<area>.md` — search a row by its number (`grep -h '^| D2887 |' .claude/decisions-full/*.md`).
  Especially D2880–D2927, D1552, D1187, D2883, D2890, D2892, D2896, D2783, D947.
- The backlog items `[COMBINED-INPUT-ROWS]` and `[LW-PERIODS-MANAGE]` in `OUTSTANDING.md`.
- The drawings of record (approved as drawn, D2926): `raptor-port/docs/mock/2026-11-28-what-we-build/` — the draw
  scripts describe each frame; `build-sheet.html` lists what was folded for later.
- The code: `raptor-port/src/leavewar/` (its own store), `raptor-port/src/state/perms.ts` (the one place that answers
  "may this person do this?"), the Inputs page's windows under `raptor-port/src/ui/`, the schedule's Personal Inputs.
  Architecture rules: `raptor-port/CLAUDE.md` (the mutation and persistence funnels; the Leave War as a second app),
  `.claude/rules/seams/leave-war.md`.

**What to look for — what is MISSING or WRONG, not style:**
1. Any ruling the plan breaks, misreads, or leaves out; any clash between rulings it misses or settles on its own
   (a builder's reading presented as his rule is a finding).
2. Who may change what: a member vs an admin, an entry filed on the Inputs page changed from the war, an approved leave
   going back to pending, Auto-approve — any path where the plan lets someone do what the rulings or `perms.ts` forbid,
   or blocks what they allow.
3. Saved data: any change that would not be saved, saved twice, or saved outside the one command path; Undo.
4. Places the plan's roll-call misses — somewhere the app draws or changes the same thing.
5. Steps in the wrong order, tests that would pass without the fix, a step too large to test on its own.
6. Whether its split into two branches is right.

**Not a finding:** a problem that lives only in data already stored while the code is right going forward (all stored
data is demo data, cleared before the database step). A scheduler is always an admin — a scheduler who is not an admin
is not a case. Style or wording preferences.

**Each finding:** a concrete failure (who does what, what happens, what should happen), its cause in the plan (section or
step), the ruling or code it rests on, and the exact change to the plan — step by step, detailed enough to apply
without asking. Rank most serious first. End with a one-line verdict: APPROVE, REVISE or BLOCK.

Write your whole report to the file your instructions name.
