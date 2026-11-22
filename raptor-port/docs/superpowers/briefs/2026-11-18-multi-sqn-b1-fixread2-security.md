# The security read of the second round of fixes — multi-squadron batch 1's full check (18 Nov 26)

Head: a fresh Opus agent (Agent tool, model opus, a new agent, not the check lead and not the Opus fix reader), D1411's
security read, its own brief `SEC2-BRIEF.md` (saved beside this report as
`2026-11-18-multi-sqn-b1-fixread2-security-brief.md`), working only in the exported copy of `4934adaa4` at
`scratchpad/fixread2/copy`, blinded as for the other two reads; blind to Astra's and the Opus reader's reports (both
finished before it started, kept outside the copy, the agent told not to open them; the Opus reader's proof link removed
from the copy first). Started 09:27:48, finished 09:40 on 18 Nov 26 (the reader's own clock). Its proof tests stayed in
`scratchpad/fixread2/sec-proofs/` (linked into the copy as `raptor-port/src/__proof_sec__/`), never in the app. Saved as
it came.

---

SECURITY READ: second round of fixes, multi-squadron batch 1 (branch head 4934adaa4)
Started 09:27:48, finished 09:40 (my own clock, 18 Nov 26).

How I worked: I stayed blind. I opened nothing in fixread2 except SEC2-BRIEF.md, the copy and my own sec-proofs folder, and nothing in the older fixread folder. No handoff block was pasted into my context. I changed no file in the copy.

All proofs are in C:\Users\User\AppData\Local\Temp\claude\37df10f156419f1e\4b825657-ab4e-4e7a-aba0-42051bdae95b\scratchpad\fixread2\sec-proofs\ and were run one file at a time with the given command. "RED" below means the test failed today, which proves the hole.

Cast in the demo: Saber (account acad) is the master and 142's. Hunter (acad2) is made 142's plain admin by Saber in each fixture. Ranger (acus) is a 142 member. Kestrel (acad9) is 149's only admin. Osprey (acus9) is a 149 member.

## Holes, ranked by consequence

### H1. A re-keyed account row slips any 149 account change past the gate, and the master's mark with it
**Actor:** Hunter, 142's plain admin, by a forged settings command once the account list is stored.
- Command: `commitSettingsIntent('account.update', null, () => store.set('account:acus', { id:'acus9', name:'us9', role:'admin', pid:'osp9', on:true, createdAt:-1 }))`. The row is written into Ranger's slot but carries 149's account id.
- What lands:
  - Osprey becomes an admin of 149.
  - With `{id:'acad9', …, on:false, createdAt:-1}`, Kestrel (149's only admin) is switched off. This passes both the squadron check and the last-admin lock.
  - With `{id:'acad', …, on:false, createdAt:-1}` (no `master`), Saber loses his master mark and his account is switched off.
  - In every case Ranger's own account disappears.

**Cause:** the gate and the loader read the account list differently.
- The gate's whole-list comparison (perms.ts homeUnitViolation, about lines 1409–1420) maps each list by the row's own `id`, and the later row wins. So it sees "Ranger's acus removed" (a 142 man, allowed) and acus9/acad9/acad unchanged, because the real row comes later in store order.
- The master check (perms.ts unitRowViolation, about lines 1290–1298) compares sets of master ids, which are unchanged.
- The loader (accounts.ts readAccounts, about lines 165–178) sorts by `createdAt` and keeps the FIRST row of an id, which is the forged one.
- Neither side checks that a row's key `account:<id>` matches its value's `id`.

**Fix, step by step:**
1. At the gate, for every `account:` change, refuse unless `c.after == null || String(c.after.id) === <id from the key>`.
2. Build the before and after lists in `accountImagesAround` through `readAccounts` (the loader's own reader), so the gate judges exactly what the loader will keep.
3. Refuse a list with duplicate ids, names or person ids.
4. Use the same lists for the master comparison in unitRowViolation.

**Introduced by this round?**
- The 149 bypass (Osprey made admin, Kestrel off): yes. The old per-row check judged the written row's before (Ranger, 142) against its after (pid osp9, 149) and would have refused.
- The master bypass: no. unitRowViolation was not changed this round; the hole was already there.

**Proof:** sec5-rekeyed-account.test.ts — 3 of 3 RED.

### H2. A posting for a 149 man, set by 142's plain admin, is carried out by the posting pass (area 7)
**Actor:** Hunter, 142's plain admin.
- Steps:
  1. He loads 149's Leave War world (`swapWarWorld('u149')`, the app's own swap).
  2. He sets the war's role to admin in memory (`setRole('admin')`). This is a screen guard only, not the gate.
  3. He calls `postOut('osp9', <tomorrow>, 'overseas' | 'delete')`.
- What lands:
  - The `lw.postout` command passes the gate.
  - The next day the posting pass, running as the app itself, carries it out. Overseas: Osprey archived and his account suspended. Delete: Osprey and his account deleted.
  - This is a write that should be refused, landing later under the pass's rights in whatever session runs the pass.

**Cause:**
- War record ids carry no squadron in the envelope (`lw.postouts/<pid>`). The unit is added only at the storage door (storage/adapters.ts qualify).
- So perms.ts unitRecordViolation (about lines 1223–1245) never sees a unit.
- homeUnitViolation judges only people, account and home rows.
- postingPassViolation (about lines 1084–1180) checks that the posting is well formed and due, never whose squadron the posted man is.
- postOutProblem (sync.ts about line 3051) has no squadron check.
- Control, refused as it should be: the same posting dated today changes Osprey inside the posting command itself, so section 8 refuses it.

**Fix, step by step:**
1. Carry the war's squadron in every `lw.*` change id, qualified as the schedule's records are, so unitRecordViolation requires admin rights there.
2. At minimum, in homeUnitViolation treat `lw.postouts` (and `lw.label`) changes as changes to that man: refuse unless the actor is an admin of the man's home squadron.
3. In postingPassViolation, refuse a posted man whose home squadron is not the war's squadron.
4. Add `otherSquadronPersonProblem` to postOutProblem so the door says it in words.

**Introduced by this round?** No, it was already there.

**Proof:** sec2-posting-via-149-war.test.ts — 3 RED, the control green.

**Not proved:** by the same cause, other war records (bids, ledger, balance, grade) of 149 can probably be written from 142. I did not prove that.

### H3. The last-admin lock at the gate is asked only when an account row is written
**Actor:** the master, or Kestrel himself.
- Commands:
  - Master: `commitPeopleEdit(() => PEOPLE.kes9.deleted = true)`.
  - Kestrel: `commitPeopleEdit(() => PEOPLE.kes9.special = true)`.
  - Master: `commitSettingsIntent('home.set', …, store.set('home:hkes', {id:'hkes', pid:'kes9', unit:'u142', from:<tomorrow>}))`.
- What lands: all three pass. 149 is left with no admin who can sign in: at once for the first two (the lock's own rule, personOk, discounts a deleted or special person), and from tomorrow for the home move.

**Cause:**
- perms.ts homeUnitViolation computes `img = accts.length ? accountImagesAround(…) : null` and runs adminLockBroken only `if (img)`. A command that changes only a person row or only a home row is never asked.
- adminLockBroken also reads homes on `today` only, never on the later dates a home row changes.

**Fix, step by step:**
1. Run adminLockBroken whenever the command changes accounts, people or homes.
2. When no account row changed, the before and after lists are the same list, judged with the people rows before and after.
3. Evaluate both lists' homes on every date in `dates` (today plus each home row's `from`), not only today.

**Introduced by this round?** The gate lock is new this round and has this gap. Before this round there was no gate lock at all.

**Proof:** sec3-lock-no-account-row.test.ts — 3 RED; the control (account switched off) is refused.

### H4. A plain admin can suspend, demote, rename or archive the master — through Admin → Users' own door too
**Actor:** Hunter, 142's plain admin.
- Controls: `updateAccount('acad', {on:false})` returns no error and the account is off. `updateAccount('acad', {role:'main'})` returns no error and the role is main.
- Forged equivalents also land: the account switched off, demoted or its sign-in name renamed, and his person row deleted, archived or its callsign renamed.
- Consequence: the one master can be stripped of power. A demoted Saber's session is a member's, he cannot change his own account, and there is no other master to put it back. Only the master mark itself and a Delete are protected.

**Cause:**
- accounts.ts updateAccount has no master guard; only masterDeleteProblem and setMaster have one.
- At the gate, unitRowViolation asks only whether the master mark moved. homeUnitViolation lets any admin of his squadron change him.

**Fix, if he rules the master is protected:**
1. Add `masterChangeProblem` to updateAccount and to Archive / Quals: changing a master's account role, switch, name or person, or his person's deleted, archived, special or callsign, needs a master actor.
2. Hold the same at the gate: any change to a row whose before has `master: true`, or to that man's person row, refused unless the actor is a master.

**Product question:** I found no ruling that says a plain admin may not suspend or demote a master. D2191 and D1971 protect only "makes another" and the mark. The brief names this case. Put it to him.

**Introduced by this round?** No, it was already there.

**Proof:** sec4-master-by-plain-admin.test.ts — 8 of 8 RED (2 through the door, 6 forged).

### H5. Another squadron's change history can be written and deleted
**Actor:** Ranger (a 142 member), and Hunter.
- Commands:
  - Ranger: `logAction(null, 'Kestrel cancelled all 149 flying tomorrow', {date, sect:'day', unit:'u149'})`.
  - Hunter: `commitSettingsIntent('elog.sweep', …, store.set(<a 149 line's key>, null))`.
- What lands: a line in 149's history, written by a 142 member; and a 149 line deleted by 142's plain admin.

**Cause:**
- The line's squadron is a field of its value (`u`), and its id `elog:<line>` names none.
- The permission row (perms.ts T.editlog: member C R, admin C R D) never reads `u`.
- This round added `LineAt.unit` (editlog.ts logAction and push), an explicit door that files a line under any squadron named. Before it, `sub` naming a 149 man already did the same.

**Fix, step by step:**
1. At the gate, judge an `elog:` row by its value's `u`, as section 7 does: create needs member or admin there, delete needs admin there.
2. Or qualify the row id with its unit.
3. Accept `LineAt.unit` only where it is the actor's own squadron or his rights allow it.

**Introduced by this round?** The door was widened this round; the gate gap was already there.

**Proof:** sec6-history-other-sqn.test.ts — 2 of 2 RED.

## Tried and refused, by area
1. **Another squadron's people and records:**
   - From 142's own war, postOut for Osprey (149) is refused: he is not in 142's war (sec1, green).
   - A forged posting for him into 142's war is refused before the gate (setPostOut finds no such man).
   - A today-dated posting of a 149 man from 149's war is refused by section 8.
   - The fix's own tests: Archive, Restore and Save name on a 149 man by Hunter all say whose he is.
2. **The master:**
   - A Delete of the master, by Admin → Users or by a posting, is refused or held (fix tests).
   - A forged mark change by a plain admin is refused, and self-master is caught (master id sets differ).
   - Not caught: the re-key in H1 and the plain changes in H4.
3. **The last-admin lock:** a forged switch-off of Kestrel's account row (master or plain) is refused at the gate. Not caught: H3 and the re-key in H1.
4. **The posting pass's hold:** read in code (sync.ts runPoOutcomes and refused()).
   - One retry, then held; several refused postings tried one at a time; each single run ends held. It terminates: PO_RETRIED blocks a second fresh retry.
   - Cleared only by wireLeaveWarSync (a boot). I found no loop.
5. **The account-list comparison:**
   - A first write dropping Osprey's account is refused (fix test).
   - Duplicates written under NEW keys are caught: the forged row lands last and wins the gate's map.
   - Only the reuse of an existing earlier key slot slips (H1).
6. **Home rows:**
   - A forged first row dated tomorrow, a past-dated row and a same-date tie are refused (fix tests).
   - Moving a 142 man to 149 needs both squadrons' admins (sections 6 and 8, read in code).
   - Not caught: the lock (H3).
7. **Retry-then-hold keeping a refused write alive:** the retry runs the same pass after rollback; I found no path that changes the actor. The live path is H2: a posting the gate should have refused is stored and later carried out under the pass's own rights, in any session.

## Unfinished
- The other Leave War records (bids, ledger, balance, grade) written from 142 into 149 by H2's cause.
- Whether a person's home row can be deleted to make him nobody's (or fall back to the demo's 142) on a future date.
- Whether a forged history line can claim another person as its author.
