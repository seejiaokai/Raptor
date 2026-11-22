# Fable's fix plan — multi-squadron batch 1, open faults (18 Nov 26, chat 109, D2208)

Saved by the coordinator from Fable's final reply; copied into the repo at the next commit between jobs as
raptor-port/docs/superpowers/briefs/2026-11-18-multi-sqn-b1-fixplan-fable.md.

## 1. Common causes

- **C1 — the gate judges the rows a command wrote, not the state before against the state after.** A1, F1, H3, half of H1, half of A2. `homeUnitViolation` builds `img` only when `accts.length`, and calls `adminLockBroken` only inside `if (img)`; `adminLockBroken` reads homes on `today` only; the master check in `unitRowViolation` compares master-id sets only when an account row changed.
- **C2 — two readings of the account list.** H1, A2. `accountImagesAround` keys by store key, returns raw values; `homeUnitViolation` re-maps by `x.id`, last wins. The loader's `readAccounts` sorts by `createdAt`, keeps the first of an id, name or person, drops a deleted man's. Nothing checks key `account:<id>` matches `value.id`.
- **C3 — a record judged by where the actor stands, not whose it is.** H2, H5, Opus 7, A3. War record ids, history lines and inputs carry no squadron in their ids, so section 7 (`unitRecordViolation`, `unitOf(id)`) never sees them; the admin branch of `ownershipViolation` returns at `a.role === 'admin'`.
- **C4 — the master protected as a mark, not as a person.** H4, A1's master half, A6. `accounts.ts updateAccount` has no master guard; the gate only asks whether the mark moved. D2205 rules it.
- **C5 — order of writes inside one command.** A4. `addPersonAndAccount` and `approveRequestNew` call `HOOKS.warPostIn` before `putNewHome`; `postInNewPerson` returns silently when the projection has no identity.

**The guardrail (closes C1, C2, C4 as a class).** One function in `perms.ts`, called from `ownershipViolation` in place of the account half of `homeUnitViolation` and the `masterMoved` computation. Runs whenever the command changes any `people` row, `account:` row or `home:` row, for every actor except the posting pass (own hold).
Two worlds:
- `peopleB` / `peopleA`: live `PEOPLE`, each `people` change's `before` laid back for B.
- `acctB` / `acctA`: `readAccounts(images, undefined, pid => peopleX[pid])` over `accountImagesAround(...)` — the loader's own reading, both sides.
- `rowsB = unitRowsBefore(env.changes)`, `rowsA = unitRowsBefore([])`.
Assert, in order:
- **G0 shape.** Every `account:` change with `after != null` has `after.id === key`. Every image in the raw after-list survives `readAccounts`, unless its person is deleted in `peopleA`. Else refuse.
- **G1 master (D2205).** For every account master in `acctB`: if its effective row differs in `acctA`, or is missing, or its person's row differs between `peopleB` and `peopleA`, the actor must be a master in `acctB`. Existing rules stay (mark moves only by `account.master`, never his own, one left). A master's person deleted: refused for everyone.
- **G2 ownership.** For every id in `acctB ∪ acctA` whose effective row differs, the actor is admin of that person's squadron (`adminThere`), for both before and after person.
- **G3 last admin.** `dates = {today} ∪ every home from in rowsB ∪ rowsA for a person whose home rows changed`. For each date, able(B) uses peopleB, able(A) peopleA. A squadron with an able home admin before has one after; the app keeps one at all.

## 2. Per claim, by risk

- **H1 (re-keyed row) — real (C2).** Fix G0 + G2 + G1 over `readAccounts` lists. Test first, `units-sqn-fixread.test.ts`: as Hunter, after one ordinary account edit so the list is stored, run the three forged `store.set('account:acus', {id:'acus9'|'acad9'|'acad', …})` writes from the report; expect ok:false and, after `accountsLoad()`, Osprey not admin, Kestrel on, Saber master and on, Ranger's account present. Could break: the first write of the list (stores every seeded row) and the Undo of that first write (all rows gone, seeds read again) — keep `accountImagesAround`'s seed fallback. Check the demo "lock-out repair" in the loader is not part of `readAccounts`.
- **H4 (plain admin suspends, demotes, renames, archives the master) — real (C4).** Fix G1 at the gate. At the doors, `masterChangeProblem(pid)` in `accounts.ts` beside `masterDeleteProblem`: words when the target's account is master and the actor's is not. Call first in `updateAccount`, `archivePerson` (via `archiveProblem`), the restore doors, `updatePersonField`, the Quals rename. Reuse the built sentence pattern; a NEW sentence is new words — list it for the owner. Test: the reader's eight cases (2 doors, 6 forged) refused; Saber as master doing the same to a second master allowed; Hunter's ordinary edit of Ranger allowed. Could break: the master's own Quals edits — G1 passes when the actor is a master, himself included, on person fields.
- **A1 / H3 / F1 — real (C1).** Fix G1 + G3. Lock words in `units.ts setHome` (same sentence as `lockProblem`), computed for the `from` date. Tests: Hunter forges `PEOPLE.stiff.deleted = true` through `commitPeopleIntent('person.delete')`: refused. Saber deletes or marks `special` `kes9` by a people-only command: refused. Saber `setHome('kes9','u142')`: refused in words, no home row. Control: with a second able 149 admin, all three pass. Could break: the posting pass (leave system actors out of G3; `poHeldReason` holds it); Undo of a home move.
- **H2 (posting a 149 man by 142's admin through 149's war) — real (C3).** One probe, `setLwUnitProbe(() => unit of the war world now loaded)`, installed from `sync.ts` like `setLwDayOpenProbe`. In `ownershipViolation`, before the admin early-return: any change whose collection starts `lw.` by a non-system actor — an admin needs `levelBefore(acct, warUnit) === 'admin'`; a member needs his home there. Closes postings and bids, ledger, balance, grade. Also `postingPassViolation`: refuse a posted man whose home (before) is not the war's squadron; add `otherSquadronPersonProblem` to `postOutProblem`. Tests: reader's sec2 three cases refused; forged `lw.ledger` and `lw.cell` for Osprey from Hunter in 149's world refused; Kestrel's own allowed. Could break: browser tests raising a member to admin through the developer bridge — copy section 7's reading of the role in force at home; account-less session reads the unit in view.
- **H5 (another squadron's history written or deleted) — real (C3).** Gate, settings rows under the history prefix: read `u` off `after` (create) or `before` (delete). Create needs member or admin level in `u`; delete admin in `u`; a put over an existing line refused for all but the app. `engine/editlog.ts logAction`: accept `LineAt.unit` only when the actor has a level there, else the squadron in view. Check the line's author equals the actor's person. Tests: reader's sec6 two refused; master's Undo of Osprey's CAT still files in 149. Could break: `changelines.ts logReversed`.
- **A3 (master's Archive / Restore / Delete of a 149 man act on 142's war) — real.** One helper in `sync.ts`, `inWarOf(pid, fn)`: if the subject's home squadron is not the loaded war's, `swapWarWorld(subjectUnit)` before and swap back after, outside the transaction, in a `finally`. Wrap Archive, Restore, Restore as, Delete's war half. First read what `swapWarWorld` clears or notifies (posting holds, viewer mirror, a pending save); if the swap is not clean in one tick, STOP and report rather than patch. Guard the posting pass with a flag so it does not run in the foreign world. Tests: reader's four (149 stint closed yesterday after master Archive and Delete; Restore and Restore as succeed with the post-in date; 142's war byte-identical before and after).
- **A4 (post-in date lost) — real (C5).** Move `putNewHome(pid, me())` right after `putNewPerson` in `addPersonAndAccount`, `approveRequestNew`, `roster-add.ts`. In `postInNewPerson` throw `CmdRefused('That did not save')` when a war is loaded and no identity is found; silent return only when no war exists. Test: `addPersonAndAccount('join149', …, '2026-12-01')` as Kestrel → `postOuts[pid].from === '2026-12-01'`; the roster-only add and approval too.
- **A2 (colliding sign-in name drops Kestrel) — real (C2).** Closed by G0. Tests: rename `acad2` to `ad9` on a fresh store → ok:false; stored; normalised-name clash; duplicate person; reordered rows.
- **A5.** `changelines.ts` keeps the squadron by sequence number (`LINE_UNIT`); confirm the reader's test exists and is green, else write it.
- **F3 — in the working copy.** Needs its test: no seeds, a forged first home dated last week refused, today passes.
- **A6 (master refusal first).** Move the master check to the top of `deleteAccountProblem` (the other-squadron check at ~line 539 may come first); test the exact master sentence for Saber, Hunter, Kestrel.
- **A7.** `otherSquadronPersonProblem` (accounts.ts ~319) tests the stored role; use `roleOf()`.
- **F2.** New words on screen — NOT tonight; put to the owner (drawing).
- **m4page tense test.** Restore a fixed clock and the exact sentence.

## 3. The inputs gate

Put back `inputUnitViolation` as built, with: members too — a member's input may name another person only of his own squadron; judge by each named person's home on the input's date, the actor needing admin in every squadron named.
The tests: no test flag in the gate, no seed path that skips it. Cause: `commitInputsWith` resyncs the saved baseline to memory before it enlists, but `commitSched` does not; a test that empties `INPUTS` outside a command then runs a schedule command makes a diff that "deletes" the 149 seed inputs.
1. `src/test-support/world.ts` exporting `settleWorld()`, calling the existing `resyncSchedBaseline()` and `resyncPeopleBaseline()`.
2. In each of the seven files call `settleWorld()` right after the out-of-band reset; in `command-write-seam.test.ts` also take `ISNAP` after the first `initStore`.
3. Where a test's point is that an input delete is emitted, keep the 149 inputs in the world.
4. A small test that no file under `src/` outside `*.test.*` imports `test-support/`.
The gate stays strict for every actor; no assertion changes.

## 4. Order, and risks nobody named

Order: 1 guardrail G0–G3 with H1, A2, A1/H3/F1 red first · 2 H4 doors · 3 war-squadron probe (H2) + posting-pass home check · 4 inputs gate + seven test worlds · 5 H5 · 6 A4, then A3 · 7 A6, A7, F3's test, m4page · 8 `docs/data-model.md` §11 in the same change, then the full suite once under the lock.

Still open after these fixes:
1. Members filing for others across squadrons — fold into the inputs gate.
2. The admin early-return: `notices` (a forged bell line to a 149 man, against D2194), `seen:<pid>`, `noticeseen:<pid>`, `accessreq:` open to another squadron's admin; only `lwseen:` held. Needs an owner-squadron check for admins.
3. Tracker records — confirm every row id is squadron-qualified so section 7 sees it.
4. The actor's own account read from memory (`ACCOUNTS_LIST.find`) in sections 7 and 8 — file for the database step.
5. Rights after a move (D2203): `levelFrom` honours a grant whatever the holder's home is now — drop his grants in the command that moves him, or ignore a grant older than his latest home row.
6. The inputs resync launders a bare memory change into the baseline — the owner-squadron gate catches the cross-squadron case.
7. A home row deleted — covered; add the test.
8. Undo after midnight of a home move refused with the generic words — acceptable; say so in the evidence sheet.
