# Scenario-design brief — `[ONE-DOOR]`, built (27 Sep 26)

You design the WALK for a built change; you did not build it. Read-only: change no file, run nothing.

**The change:** branch `claude/one-door`. Read the plan `raptor-port/docs/superpowers/plans/2026-09-27-one-door-plan.md`
(§1 the rulings, §C the stints, §9 round 1), its review log `raptor-port/docs/superpowers/specs/2026-09-27-one-door-plan-review-log.md`,
the contract `raptor-port/docs/ui-contracts.md` §Admin → Users — one door, the approved mock-up
`raptor-port/docs/mock/one-door.html`, and the rulings in `.claude/rules/decisions/how-we-work.md` (D320–D324, D305–D310,
D280–D299) and `.claude/rules/decisions/leave-war.md` ("Also read"). The code: `git diff origin/main...claude/one-door`
(or read the files the plan names: `src/ui/UsersPanel.tsx`, `src/ui/WelcomeBack.tsx`, `src/ui/App.tsx`, `src/ui/QualsPage.tsx`,
`src/state/accounts.ts`, `src/state/roster-add.ts`, `src/leavewar/sync.ts`, `src/leavewar/state/store.ts`,
`src/leavewar/engine/people.ts`, `src/leavewar/ui/Matrix.tsx`, `src/leavewar/ui/BidPicker.tsx`).

**Your job — hunt for what is MISSING, not whether the code is wrong.** Starting from the user promise and the rulings,
enumerate every qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and
meaningful order of actions. Assume every existing line may be correct and the defect may be a MISSING call site. For each
item state where the visible sign and the working gesture should exist in the production app. Then rank concrete walk
scenarios — setup, action, expected result, and the observation that would disprove correctness — starting with the
least-shared or most specialised surface.

Cover at least: the ROLL-CALL of every place the app draws or changes a person's sign-in / roster state (Admin → Users on
desktop and phone, Quals, the Leave War grid, its sheets, its OIL tracker and manning counts, the crew lists and pickers,
ALL AVAIL, the sign-in and access screens, the welcome note, a published day he is on — its "pending" and four
sign-offs); every ORDER that has an opposite (Archive ↔ Restore, Suspend ↔ Enable, a posting ↔ Undo post out, Archive
over a pending posting, Restore on the day vs later, Archive again after Restore, Delete from each state); both ROLES and
the admin's member view; a RELOAD after each; SHOW SANS on/off; a man with no account; a man whose post-in is still to
come; the walk must be doable through the app's own controls (say where it is not — that is a missing door).

**What is NOT a finding (owner, D56):** this app is pre-promulgation and its entire stored world is DEMO DATA that will be
CLEARED before the database step. Do not report a problem whose harm exists only in data already stored when the code is
already correct going forward. If the app would do it again to NEW data, report it.

**Deliver:** (1) the roll-call table (surface · has it / must not, because… / MISSING), (2) the door check (every action →
its on-screen control, in every state), (3) the ranked scenario list, each with setup / action / expected / disproof and
the width(s) to walk it at, (4) any place you already suspect a missing line, with the exact file and why. Plain words;
explicit negatives welcome.
