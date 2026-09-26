# Brief — the second fix check on `[ACCOUNTS-NEW-PERSON]` (Fable 5.1 and Astra, each on its own), 26 Sep 26

**Read-only. Do not edit, stage or commit anything; do not run the full unit suite or any browser test.** Your
final message is your report.

Repo `C:\Users\User\projects\Raptor`, branch `claude/accounts-new-person`. Your fix checks of `67832f4c`
(`raptor-port/docs/handpass/2026-09-26-accounts-new-person-{fable,astra}-fixcheck.md` — both exist, read both) found
four things; Opus 5.5 fixed them in ONE commit, **`20e3d4f4`** (`git diff c0c1e213 20e3d4f4 -- raptor-port/src
raptor-port/docs/ui-contracts.md raptor-port/docs/superpowers/specs raptor-port/scripts`):

| Finding | The fix |
|---|---|
| Both #1 — archived + has an account got "restore to link" | `UsersPanel.tsx` `rosterMatch`: the account is checked before archived; "(archived)" shown |
| Fable #2 — the note gave only the someone-else way out | both ways out named: "If it is them on a new sign-in, change that account's sign-in under Accounts — that answers this request. If it is someone else, …" |
| Fable #3 — the archived, no-account note | gains the someone-else sentence |
| Astra #2 — the account editor dropped its archived person from its picker | `accounts.ts` `linkablePeople`: `keep` is offered before the archived / has-an-account filter |

**The task — check ONLY this commit:** does each fix do what its finding asked, completely, and did it break
anything nearby? In particular: can the new `linkablePeople(keep)` ever offer a person an account must NOT be
linked to (another account's person; an ALL / ALL AVAIL placeholder; an archived person who is not this
account's own)? Does `updateAccount` still refuse what it should when the editor now shows an archived person?
Is "that answers this request" true for every path the admin could take from the note (renaming the account's
sign-in to the waiting name — `accounts.ts updateAccount`)? Is any sentence the note now says still a door the
screen does not have? **Assume the defect may be a MISSING case.** For each finding: a concrete scenario, NEW in
`20e3d4f4` or older, and exact fix steps. Explicit negatives. **Not a finding (owner, D56):** harm only in demo
data already stored when the code is right going forward. End with **CLEAN** or **FIX FIRST**.

Evidence: tests `raptor-port/src/ui/accounts-newperson.test.tsx` (NP5, and the account-editor test); the walk
`raptor-port/docs/img/handpass/2026-09-26-accounts-new-person/walk3/walk.json` (57/57, steps `d-FC1-archived-account`,
`d-FC2-archived-editor`, pictures `46`, `47`). Rulings: `.claude/rules/decisions/how-we-work.md` D166, D204,
D214–D227, D56; `.claude/rules/raptor-executor.md`.
