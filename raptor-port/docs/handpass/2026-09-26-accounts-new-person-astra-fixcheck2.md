# Astra — second fix check on `[ACCOUNTS-NEW-PERSON]` (`20e3d4f4`), 26 Sep 26

*(Saved verbatim from Astra's final message — read-only, brief `docs/superpowers/briefs/2026-09-26-accounts-new-person-fixcheck2-brief.md`, blind to Fable's. Dispositioned in the evidence sheet §6, round 3.)*

## Finding

**MEDIUM — the new-account guidance still names an unavailable door for the reviewing admin’s own account.** This is **new in `20e3d4f4`**.

Concrete scenario:

1. A new principal, `saber.new@mail`, requests access as `Saber`.
2. The sole seeded admin signs back in as `ad`, whose account belongs to Saber.
3. Approve says to change that account’s sign-in under Accounts ([UsersPanel.tsx:131](/C:/Users/User/projects/Raptor/raptor-port/src/ui/UsersPanel.tsx:131)).
4. Saber’s account row is disabled because it is the current admin’s own account ([UsersPanel.tsx:200](/C:/Users/User/projects/Raptor/raptor-port/src/ui/UsersPanel.tsx:200), [UsersPanel.tsx:214](/C:/Users/User/projects/Raptor/raptor-port/src/ui/UsersPanel.tsx:214)).
5. Even a direct call to `updateAccount` refuses before renaming the account or clearing the request ([accounts.ts:253](/C:/Users/User/projects/Raptor/raptor-port/src/state/accounts.ts:253)).

Thus “change that account’s sign-in under Accounts” is not executable by this admin. The existing regression test uses editable member accounts, so it misses this case.

Exact fix:

1. In `rosterMatch`, detect when the matched account is the current admin’s own account using the same predicate as `AccountRow`.
2. For that case say, for example: “If it is you on a new sign-in, another admin must change your account’s sign-in under Accounts—your own account cannot be changed while you are signed into it.”
3. Keep the current wording for accounts belonging to other people; do not weaken the self-account guard.
4. Add an NP5 test requesting as `Saber`/`stiff`, signed in as `ad`, asserting the note names another admin and the account editor is disabled. Update `ui-contracts.md` and the walk wording/evidence.

## Four requested fixes

| Fix | Result |
|---|---|
| Archived person with an account | **Complete.** Account precedence now wins, “(archived)” appears, and the note never says restore-to-link. |
| Both ways out in the account note | **Incomplete.** Correct for another person’s editable account; wrong for the current admin’s own account as above. |
| Archived person without an account | **Complete.** It names both restore-for-the-same-person and New-person-with-another-name. |
| Archived person retained in account editor | **Complete.** The existing account’s person remains visible and selected. |

## Explicit negatives

- `linkablePeople(keep)` does **not** offer placeholders: `!p.special` applies before the `keep` exception.
- It does **not** offer an unrelated archived person: only the exact `keep` PID bypasses the archived filter.
- It does **not** offer another account’s person in reachable new data. `AccountRow` supplies its own `a.pid`, while loading and write guards enforce one account per person. A malformed historic duplicate would be stored-demo-data-only under D56.
- `updateAccount` still refuses missing/special people, another account’s person, and an archived person that is not this account’s current person ([accounts.ts:229](/C:/Users/User/projects/Raptor/raptor-port/src/state/accounts.ts:229)).
- Renaming an editable account to the waiting name does clear that request after a successful commit ([accounts.ts:265](/C:/Users/User/projects/Raptor/raptor-port/src/state/accounts.ts:265)). A switched-off account remains switched off; that deliberate access state is not overridden.
- The committed `57/57` walk and pictures 46–47 visually prove the archived-member scenarios, but do not exercise the self-account case.
- No D56-only finding was raised.
- I ran no unit suite or browser test, following the read-only/no-browser brief. I inspected the committed tests, walk JSON, and images. I made no edits, staging operations, or commits.

## Verdict

**FIX FIRST**

