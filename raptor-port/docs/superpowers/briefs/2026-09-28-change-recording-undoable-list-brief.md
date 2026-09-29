# Review brief — which changes should, and should not, be taken back by the one Undo (28 Sep 26)

You are an independent reviewer. Another model from a different provider does the same job at the same time; you will
not see each other's answer. **Read-only: edit nothing, run no tests, builds or the app.** The repository is
`C:\Users\User\projects\Raptor`, branch `claude/change-recording-retest`.

## Why you are asked

The owner (non-technical, a fighter squadron's scheduler) asked: *"have either astra or fable or both to look at which one
should have or dont have undo"*. The builder has proposed the list below. Your job is to judge it **as the people who use
the app would** — an admin scheduler, a squadron member, an admin in the member view (D292) — and to find anything the list
MISSES: a change somewhere in the app that is on neither side, or a change on the wrong side. For each, say which side and
why, in words a scheduler would accept, and what a person would experience if it were on the other side.

**Also answer the owner's open question:** on the Leave War, moving a war's stage (Open for bidding → Bidding closed →
Published, and back to Draft) can be undone today — an admin who closes bidding by mistake takes it back and bidding
reopens. Keep that, or should the stage move only by its own buttons? Say what a member sees in each case.

## The proposed list

**Already taken back today (unchanged):** a schedule edit (a seat, a text box, a wave / row / section added, moved or
deleted, a template applied), Publish and Unpublish (undo of a publish unpublishes it — AM39c), a sign-off and its clear,
Discard, a warning muted, an OIL Earn choice (the mode's own stop at its door), an input filed / edited / deleted /
reassigned (Inputs page, calendar, board), the planning calendar, and on the Leave War: bids, decisions, moves, approved
leave moved or removed, OIL awards, balances, the OIL policy, the bid window, a war created or renamed, the stage, and every
⚙ setting (counters, event rows, Show SANS, groups, colours, roster and manning order).

**New in this build (`[UNDO-ROSTER-SETTINGS]`):** on Quals — any tick (SANS, SXO, SCHEDULER included), CAT, initials,
flight, remarks, a callsign change (refused if another man on the roster holds the name by then), the LoX columns; on
Admin → Users — Give access, Refuse a request, Give sign-in to an existing person, Suspend / Enable, role, puck, sign-in
name, the guest switch (refused if it would leave no admin able to sign in, change your own account, or switch on an
archived man's sign-in); Admin's config — duty / wave / day templates, the default arrangement, wave show/hide, lookahead;
the Logic page — every rule and "Reset to standard"; the board's stores and cancel reasons.

**Never taken back, and why:**
1. Adding a person (with or without his sign-in), Archive, Restore / Restore as, Delete, a posting (post out / post in
   and the sheet's own undos) — the owner's D350 ("4 ok"): each writes the Leave War's posting record, which Undo cannot
   yet restore safely; each has its own way back (Restore, "Undo post out", Delete); a Delete is final (D287). Filed as
   `[UNDO-POSTING-RECORD]`. **Settled — do not reopen; you may name a consequence the owner should know.**
2. "Seen" marks — "Mark all as seen" (changes window), the admins' bell put out by seeing the waiting list (D227), the
   welcome-back note dismissed (D305). They record what one person has looked at; a member's could never be undone at
   all (the restore is refused as an admin's record), so his Undo would stick behind it.
3. A person waiting for access sending his own request — he has no Undo door; an admin refuses it.
4. The posting pass that runs by itself on a posting's date — nobody's action.
5. Looking around — which week, war or day is on screen, filters, highlights, search, folds, a LATE mark hidden on the
   board; a bug report on the Help page.
6. The change history itself — an undo adds a line, never erases one.

## Where to look

The rulings (a later one wins — D90): `.claude/rules/decisions/how-we-work.md` (D148, D166, D227, D287, D292, D305,
D310, D322, D347–D350), `.claude/rules/decisions/scheduler.md` (D44, D45, D98, D103, D168–D172, D263, D337–D346),
`.claude/rules/decisions/leave-war.md`, `.claude/rules/decisions/oil.md`. The behaviour: `raptor-port/docs/undo-contract.md`,
the register `raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md` (AM32–AM39d). The two
scenario reports already written (read them — do not repeat them, build on them):
`raptor-port/docs/superpowers/briefs/2026-09-28-change-recording-scenarios-fable.md` and `…-astra.md` (their roll-calls
list every writer). The code: `raptor-port/src/undo/`, `raptor-port/src/state/undo-wire.ts`,
`raptor-port/src/state/people-settings-commit.ts` (`SETTINGS_KEYS`), `raptor-port/src/state/accounts.ts`
(`ACCOUNT_TYPES`), `raptor-port/src/leavewar/state/store.ts` (the Leave War's commands), `raptor-port/src/state/sched-commit.ts`.

**What is NOT a finding (owner, D56):** the app's stored world is demo data cleared before the database step. Do not
report harm that exists only in data already stored when the code is already correct going forward.

## How to report

1. **Missing from the list** — every change anywhere in the app that is on neither side (page, control, what it writes),
   with the side you would put it on and why.
2. **On the wrong side** — each with the person's experience either way, and your recommendation.
3. **The stage question** — keep or not, with what a member sees.
4. **Anything on the "new" list that needs a refusal the builder has not named** (like the callsign and the last admin).
5. **Explicit negatives** — what you checked and agree with.
Keep it short and in plain words: the owner reads the summary.
