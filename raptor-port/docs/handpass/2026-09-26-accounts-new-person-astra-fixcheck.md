# Astra — fix check on `[ACCOUNTS-NEW-PERSON]` (`67832f4c` over `107943cd`), 26 Sep 26

*(Saved verbatim from Astra's final message — `codex exec -m gpt-5.6-sol`, reasoning high, read-only; brief `docs/superpowers/briefs/2026-09-26-accounts-new-person-fixcheck-brief.md`. Blind to Fable's fix check. Its findings are dispositioned in the evidence sheet §6.)*


## Findings

### 1. Archived people who already have accounts still receive an impossible approval instruction

Fable #1 is fixed for an active person with an account, but not completely.

In [`rosterMatch()`](/C:/Users/User/projects/Raptor/raptor-port/src/ui/UsersPanel.tsx:120), the archived-person return runs before `accountOfPid`:

- [`UsersPanel.tsx:125`](/C:/Users/User/projects/Raptor/raptor-port/src/ui/UsersPanel.tsx:125) says to restore the person “to link them.”
- Only afterward does [`UsersPanel.tsx:126`](/C:/Users/User/projects/Raptor/raptor-port/src/ui/UsersPanel.tsx:126) check whether that person already has an account.
- Restoring does not make them linkable: [`linkablePeople()`](/C:/Users/User/projects/Raptor/raptor-port/src/state/accounts.ts:160) still excludes anyone with an account.
- Archiving deliberately preserves the account, pinned by [`accounts.test.ts:188`](/C:/Users/User/projects/Raptor/raptor-port/src/state/accounts.test.ts:188).

Concrete failure scenario:

1. Give Rocky an account and archive Rocky through Quals.
2. A new sign-in requests access as “Rocky.”
3. Open Approve.
4. Expected: the note says Rocky already has an account and directs the admin toward that existing account—not toward linking.
5. Disproof: the current note says “restore them on the Quals page to link them.”
6. Restore Rocky. The picker still cannot offer Rocky because the account remains attached.

This applies to newly archived people, so D56 does not exclude it.

Origin: already present in `107943cd`; not introduced by `67832f4c`.

Exact fix:

1. In `UsersPanel.tsx:rosterMatch`, check `accountOfPid(hit)` before returning the archived-person note.
2. Use the existing account-aware wording for both active and archived account holders. The current wording is otherwise correct: it does not falsely declare that the requester must be someone else.
3. Add an NP5 UI test with a person who is both archived and account-bearing. Test both their callsign and bare ID.
4. Assert the picker omits them and the note contains the existing account, contains neither “Pick them” nor “restore … to link.”
5. Add a rendered walk step for this combination and update NP5/ui-contracts accordingly.

### 2. The account editor visually loses its current archived person while retaining that value internally

The broader stale-hidden-form-state audit found a second pre-existing defect.

[`linkablePeople(keep)`](/C:/Users/User/projects/Raptor/raptor-port/src/state/accounts.ts:160) promises to retain the account’s existing person, but [`accounts.ts:163`](/C:/Users/User/projects/Raptor/raptor-port/src/state/accounts.ts:163) applies `!p.archived` before the `id === keep` exception. Consequently, an archived account holder is absent from the editor’s `<select>` even though `AccountRow` still holds that PID in React state.

Concrete failure scenario:

1. Add an account for a live person.
2. Archive that person through Quals; the account correctly remains.
3. Open the account editor.
4. Expected: Callsign/Name visibly shows the account’s current archived person.
5. Disproof: the select has no matching option and appears at “Pick a callsign or name…”, while the internal `pid` remains the archived person.
6. Change only the sign-in and save. The apparently blank picker was not actually blank; the hidden PID remains attached.

Origin: already present in `107943cd`; not introduced by `67832f4c`.

Exact fix:

1. Change the predicate to retain a non-special current value before applying normal eligibility, equivalent to:
   `p && !p.special && (id === keep || (!p.archived && !accountOfPid(id)))`.
2. Keep add/approve pickers unchanged when no `keep` is supplied.
3. Add an account-editor test that archives an account holder, opens the editor, and asserts both the option and selected value show that person.
4. Change only the sign-in, save, and assert the PID remains visibly and durably attached.
5. Add a rendered-browser assertion because this defect concerns how a controlled select displays an unmatched value.

## Disposition of every requested item

- **Fable #1 — incomplete.** The active-account wording is correct and the new NP5 test genuinely separates a free roster person from Ranger. The archived-plus-account branch above remains wrong.
- **Astra #1 — direct fix complete.** [`resetAddForm()`](/C:/Users/User/projects/Raptor/raptor-port/src/ui/UsersPanel.tsx:284) clears name, PID, new-person fields, role, and mode after both successes. The two tests exercise both hidden halves, and the rendered step confirms them. Approve resets on success/Cancel and starts from the request; ordinary account-editor success/Cancel remounts fresh. The archived-editor exception is Finding 2.
- **Astra #2 — complete.** [`catsFor()`](/C:/Users/User/projects/Raptor/raptor-port/src/state/roster-add.ts:45) now returns lists only for FCP/RCP and `[]` otherwise. I checked every reader: request loading, sign-up, Add/Approve, and Quals. Valid new records still receive the required list; invalid seats cannot be newly written. Pilot CAT C → Personnel → WSO now returns to Pick in all three forms.
- **Astra #4 — complete.** Both legacy walks explicitly choose On the roster before reading `#apvPid`. The committed results record 38/38 and 42/42 with zero browser errors.
- **Fable #2 — complete.** The 55/55 walk now directly asserts Available crew, the new person’s own Inputs and Leave War row, and a person-plus-account as the first durable write in a fresh browser context followed by reload.
- **Fable #4 — complete.** [`mk-new-person.mjs`](/C:/Users/User/projects/Raptor/raptor-port/scripts/handpass/am/mk-new-person.mjs:7) clearly says it is a historical mock-up record and not a runnable current-build tool.

## Explicit negatives

- I found no valid FCP/RCP caller receiving an empty CAT list.
- I found no remaining Add-form field omitted from `resetAddForm`.
- I found no stale state after ordinary Approve success, Approve Cancel, account-editor Save, or account-editor Cancel.
- I found no surviving test that still expects Ranger—who has an account—to be offered or told “Pick them.” The remaining “Pick them” assertions use a genuinely linkable person.
- I found no false-action message in `pidProblem`; it checks the existing account before the archived condition.
- I found no weakness in the three added roll-call assertions: each checks the promised rendered state rather than merely navigation or element existence.
- I found no problem dependent only on old stored demo data.
- I did not inspect Fable #3 or Astra #3, as instructed.

I did not rerun suites because this was read-only and the relevant commands write caches/artifacts. I inspected the committed result files and screenshots: 38/38, 42/42, and 55/55, all with zero recorded browser errors.

The checkout changed concurrently during this review: it began clean at `0f924312`; it ended at documents-only `c0c1e213` with unrelated modifications to the evidence sheet and skill-observation log. I made no edits, staging operations, or commits. All code conclusions above are pinned to `107943cd..67832f4c`.

FIX FIRST

