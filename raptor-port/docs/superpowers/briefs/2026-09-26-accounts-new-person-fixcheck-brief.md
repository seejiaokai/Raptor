# Brief — the fix check on `[ACCOUNTS-NEW-PERSON]` (Fable 5.1 and Astra, each on its own), 26 Sep 26

**Read-only. Do not edit, stage or commit anything.** Write your report as your final message.

## What you are checking

Branch `claude/accounts-new-person`, repo `C:\Users\User\projects\Raptor`. The build was read by both of you
(your reports: `raptor-port/docs/handpass/2026-09-26-accounts-new-person-fable-read.md` and
`…-astra-read.md` — both exist, so you may read both). Opus 5.5 then fixed the findings in ONE commit,
`67832f4c`, on top of `107943cd`. See it with `git diff 107943cd 67832f4c` (code, tests, walk scripts, two
documents; the rest is pictures).

| Finding | What was done |
|---|---|
| Fable #1 — the approve note tells the admin to pick a person the picker cannot offer (he already has an account) | `src/ui/UsersPanel.tsx` `rosterMatch`: an `accountOfPid` branch with its own note. **The wording departs from Fable's suggested text on purpose:** it does not say "this is someone else" (the asker may be that person on a new sign-in — the account editor's job), it says he can't be picked here and, if the asker is someone else, New person with another callsign or name. Judge whether that is right. Tests: `src/ui/accounts-newperson.test.tsx` NP5 (the old test moved to a person with no account; a new test for the has-an-account note and the picker). `docs/ui-contracts.md` §Admin → Users; the register NP5 |
| Astra #1 — the Add form does not fully clear | `UsersPanel.tsx` `resetAddForm`, called after both successes. Two tests (NP1 block) |
| Astra #2 — personnel keep an internal CAT list | `src/state/roster-add.ts` `catsFor` — FCP and RCP only, `[]` otherwise. Tests: `roster-add.test.ts` NP7, `accounts-newperson.test.tsx` "a CAT never rides through Personnel" (sign-up, Add, Approve). Register NP4 |
| Astra #4 — `acc-walk.mjs` / `acc-walk2.mjs` abort at approval | both take "On the roster" after Approve; re-run 38/38 and 42/42 (`docs/img/handpass/2026-09-26-accounts-new-person/acc-rewalk/`) |
| Fable #2 — three roll-call rows narrowed without a line | `scripts/handpass/np-walk.mjs` gains the steps (the board's Available crew; the new person's own Inputs and Leave War row; a person + account as a fresh world's first write, then a reload); re-walk `walk3/` 55/55 |
| Fable #4 — `mk-new-person.mjs` fills `#accFull` | a header note: a record of the mock-up, not a tool to re-run |
| Fable #3 — the plan says the ui-contracts passages were MOVED | being corrected in a separate documents-only commit (the plan's §8 and §Round 1 F7) — **not yours to check** |
| Astra #3 — the evidence sheet | being finished after this check — **not yours to check** |

## What to answer — use this wording as the task

> Do not merely review the changed code. For each finding above, say whether the fix does what the finding
> asked, COMPLETELY — and then hunt for what is still MISSING: the same kind of defect somewhere the fix did not
> reach. **Assume every changed line may be correct and the defect may be a MISSING call site.** In particular:
> every other reader of `catsFor` or of a seat value (does anything now get an empty list where it needed one?);
> every other form on Admin → Users or the sign-up that keeps state across a success or a mode switch (the
> approve form, the account editor); every other note or message that asks the admin to do something the
> screen does not let him do; every test that pinned the old behaviour and still passes for the wrong reason.
> For each item, give a concrete failure scenario (setup, action, expected, the observation that would
> disprove correctness), and whether it is NEW in `67832f4c` or already on `107943cd`.

**Not a finding (owner, D56):** this app is pre-promulgation and its entire stored world is DEMO DATA that will
be CLEARED before the database step. Do not report a problem whose harm exists only in data already stored when
the code is already correct going forward — no migration, no back-compat, no "an existing record would read
wrongly". If the app would do it again to NEW data, report it.

Give **exact, step-by-step fix instructions per finding** (file, function, what to change, the test that pins
it), and **explicit negatives** ("I checked X and found nothing"). End with a one-word verdict: **CLEAN** or
**FIX FIRST**.

## Read these (the rules load for Claude by themselves; Codex must open them by path)

- `.claude/rules/decisions/how-we-work.md` — D214, D216, D217, D219, D220, D222, D224–D227 (this feature's
  rulings), D56, D67, D166
- `.claude/rules/decisions/scheduler.md` (D218, D149 — the Quals own-row rules) and `.claude/rules/raptor-executor.md`
- The plan `raptor-port/docs/superpowers/plans/2026-09-26-accounts-new-person-plan.md` (approved; not to be
  re-opened) and the register `raptor-port/docs/superpowers/specs/2026-09-26-accounts-behaviour-register.md`
- The evidence sheet `raptor-port/docs/handpass/2026-09-26-accounts-new-person.md` (its roll-call §3 is the list
  to read against; §6–§10 are being filled after you)
- The walk script `raptor-port/scripts/handpass/np-walk.mjs` and its results `…/walk3/walk.json`
</content>
</invoke>
