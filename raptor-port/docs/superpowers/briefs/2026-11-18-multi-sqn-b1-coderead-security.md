# The security read (D1411) — multi-squadron batch 1, steps 0–4 (18 Nov 26)

Head (from the brief, the run and the reader's own clock): a fresh Opus agent (Agent tool, not the check lead), brief
`SECURITY-BRIEF.md` (saved beside this report as `2026-11-18-multi-sqn-b1-security-brief.md`), working only in its own
exported copy of `7e0a7c661`, blind to the walk (not started), to the Opus code read (run alongside in its own copy) and
to Astra's code read (started after it ended). Started 03:59:37, finished about 04:11. Its proof tests stayed in its copy
(`src/__proof_sec__/`), never in the app. Saved as it came.

---

Security read (Opus, blind), copy of 7e0a7c661, started Wed 18 Nov 26 03:59:37 MPST, finished Wed 18 Nov 26 04:11 MPST

No handoff block was pasted into my context. I worked only in `job5/copy-sec/`. I changed no app file. My proof tests are in `copy-sec/raptor-port/src/__proof_sec__/`, five files. I ran each one alone, and every one ends red. Each `it` states what should hold, so a red run is the finding.

Seven findings, ranked by consequence. All are NEW on this branch: on `main` there is only one squadron, so none of these holes existed there.

---

## F1 — A plain admin of one squadron can change the other squadron's accounts and the master's account. The last-admin lock counts every squadron's admins. (Brief items 1, 2, 4.) CONFIRMED.

**Case.** Prowler (`ad2`) is a plain admin of 142. Through Admin → Users, which lists both squadrons until step 5 and offers role, Suspend/Enable, rename, re-link, Archive and Delete on every row, he can do all of the following. Each one goes through today:
- Make Kestrel (`ad9`, 149's only admin) a member, or switch his sign-in off. 149 is then left with no admin of its own. The lock does not stop it because 142 still has admins.
- Make Osprey (`us9`, a 149 member) an admin of 149.
- Add an account with the admin role for a 149 man who has none (Merlin, `mer9`). That gives 142's admin a way into 149: on the demo any password signs in to a non-seeded account.
- Make Saber (the master) a member, switch him off, or rename his sign-in. The master mark stays on the account, so "one master always left" holds on paper. In practice no master can sign in or act as admin, so nobody can make a squadron or another master any more.
- Kestrel (149) can switch Saber off the same way.

**Proof.** `__proof_sec__/cross-sqn-accounts.test.ts`: 8 cases, all red (`updateAccount` / `addAccount` return null, meaning saved).

**Cause.**
- `state/accounts.ts:387` `updateAccount` and `:375` `addAccount` check only `mayManageAccounts()`.
- The lock at `:404` (`list.some(canSignInAsAdmin)`) and in `deleteAccountProblem` at `:484` counts admins of every squadron.
- At the commit gate, `state/perms.ts:1344` (`if (... a.role === 'admin') return null`) lets an admin write any `people`, `inputs` or `settings/account:` row.
- `unitRecordViolation` (`:1209`) only sees ids that carry a unit, and these are community records with no unit in the id.
- `unitRowViolation` guards only the master field of an account row (`:1240–1247`), not the master's other fields.

**Rulings this breaks.** D2191: "a man of the other squadron … given View, nothing else of his row changeable". D2094 as narrowed by D2160 Q5: another squadron is View only, and 149's admins are made only by 149's admins or a master.

**Fix, step by step.**
1. In `perms.ts`, add `communityRowViolation(env)`. Call it in `ownershipViolation` right after `unitRecordViolation`, for every non-system actor.
   - For each change to `people/<pid>`, to `settings/account:<id>` (the `pid` of the before and after images), or to `inputs` (every person in the before and after, via `idsOf`), find each named person's home unit with `homeBefore(pid, today, unitRowsBefore(env.changes))`. For an input, also check each date it covers.
   - An admin actor needs `levelBefore(acct, unit, today, rows) === 'admin'` in that unit.
   - A member actor needs that unit to be his own home.
   - A brand-new person (no before image) is judged by the home row written in the same command, from the rows after.
2. In the same function, any change to an account row whose before image has `master: true` needs a master actor (and never his own account, as now).
3. Mirror both rules in the screens' refusals, in the app's words: `updateAccount`, `addAccount`/`pidProblem` (a person of a unit where you are not admin), `deleteAccountProblem`, and Archive (`leavewar/sync.ts archivePerson` → `suspendForArchive`).
4. The last-admin lock should count per squadron: "at least one enabled admin of THIS squadron who can sign in". This changes D166's lock, so it is his call: does the master count as a squadron's admin for the lock? My recommendation is no, because the master is the platform's and not the squadron's. Apply it in `updateAccount`, `deleteAccountProblem`, `suspendForPosting`, `suspendForArchive`, `lastAdminIfGone` and `accountsRestoreProblem` (the Undo path).
5. In data-model §11, mark the `User`, `Person` and `Input` rows "of a person whose home is a unit where the actor holds the right". `perms.test.ts` pairs §11 with the code, so edit both together.

---

## F2 — `home.set`: an admin of 142 can pull any 149 man, including 149's only admin, into 142. (Brief item 2.) CONFIRMED.

**Case.** Prowler calls `setHome('kes9', 'u142')`. It is kept. From tomorrow Kestrel is a 142 man, and with his account role that makes him 142's admin. 149 has no admin. `setHome('osp9', 'u142')` works the same way.

There is no screen for this yet (step 5 builds one). Today it takes a hand-made call, but the commit gate is meant to refuse a hand-made call, and the database's security is built from it.

**Proof.** `cross-sqn-accounts.test.ts`, the 'home.set' block: 2 cases red.

**Cause.** `perms.ts:1293` checks `adminOf(img.unit)` only on the row's own before and after images. A move is a NEW row (`state/units.ts:196 setHome` mints a new id when the date differs), so the before image is null. Only the destination is checked, and the squadron he is taken FROM is never asked.

Also, nothing at the gate holds `from` to "tomorrow" (D2119). A hand-made home row with `from: '2000-01-01'` passes too and re-homes a man's whole past. That moves past OIL between the squadrons' passes (`homeUnitOf` on the date). The same is true of `unitplace:` rows.

**Fix.**
1. In `unitRowViolation`, for `HOME_PFX` rows, also require `adminOf(homeBefore(n.pid, n.from, before))`: the unit he is in on the date the row takes effect, read from the rows before. Where the man has no home row and no fallback, require the actor's own unit.
2. Require `n.from >= moveFrom(today)` when the man already has a home row, and `n.from >= today` for his first.
3. Require `n.from >= moveFrom(today)` for a new `unitplace:` row.

---

## F3 — A 142 admin can rename, re-category or delete a 149 man; a member may file for another squadron's man. (Brief items 1, 6.) CONFIRMED for the admin part.

**Case.** As Prowler: `updatePersonField('osp9', {callsign: 'Pigeon'})`, `updatePersonField('har9', {cat: 'OCU'})` and `deletePerson('gan9')` are all kept. Also, `mayEditQualsOf('osp9')` answers true for him. The Quals page itself is filtered to his own squadron, but Admin → Users' Delete and Archive reach 149's rows today.

By reading only, not proved: with "members may file for others" on, a member's hand-made input naming a man of the other squadron passes `inputBreach` / `filedForOther` (`perms.ts:937`). No check asks the other man's squadron. The notice riding it would then ring that man's bell.

**Proof.** `__proof_sec__/cross-sqn-people.test.ts`: 4 cases red.

**Cause.** The same as F1: `people` and `inputs` are community records, `perms.ts:1344` returns early for an admin, and the gate's own questions (`mayEditQualsOf` and the other `may…` checks) do not ask the squadron.

**Fix.** The gate rule in F1 step 1 covers it. Also make `mayEditQualsOf`, `mayManageRoster` (per person) and `mayEditInput` ask `levelIn(SESSION.user, homeOn(pid)) === 'admin'`, so the screens agree with the gate.

---

## F4 — Sign-out with a save waiting, then the other squadron's person signs in on the same tab: he gets the first person's Tracker and can write it. (Brief item 5.) CONFIRMED.

**Case.**
1. Prowler (142) opens the Tracker and edits something.
2. The browser refuses the save. `logOut` ends the session but does not reload, by design (`ui/logout.ts:30`).
3. Osprey (149 member) signs in on the same tab and opens the Tracker. He sees 142's courses, charts and marks, its + Add offers 142's roster (`tracker/peoplewire.ts`: `storageUnit() || myUnit()`), and every edit he makes is written into 142's Tracker. Members may write the Tracker (D121).

**Proof.** `__proof_sec__/same-tab-tracker.test.ts`: red. After the second sign-in the Tracker stays bound to u142, and 142's record is readable.

**Cause.**
- `tracker/storage.js:62`: `bindStorageUnit` refuses any new unit once the Tracker has loaded. The header relies on "signing out reloads", which is untrue while a save waits.
- At the commit gate, Tracker and Leave War change ids carry no unit, so `unitRecordViolation` never asks whose Tracker it is.

Everything else is put right on that path:
- the schedule in view (`switchUnit`)
- the Leave War (`swapWarWorld`)
- the Undo list (`endUndoSession`)
- Inputs, Medical, Quals and OIL day list (filtered by `myUnit()` at render)
- the bell (per person)

**Fix.**
1. Gate: add a probe like `setLwDayOpenProbe`. `tracker/storage.js` installs one answering `storageUnit()`, and `leavewar/sync.ts` installs one answering `worldUnit()`. In `unitRecordViolation`, add that unit to `units` for every change in a Tracker or Leave War collection (`trk.*`, `lw.*`, `tracker`, `leavewar`). The 149 man's write is then refused with the existing words.
2. Screen: when the Tracker page mounts and `storageUnit()` is bound to a unit other than `myUnit()`, show the page's existing failed-load state with Retry, which reloads the app (D1631). That reuses a look he has already seen, so no new mock-up should be needed. If any new words are needed, they go to him as a mock-up first (D1625).

---

## F5 — 149's change history, remarks included, shows in 142's changes window; 142's admin can clear 149's history. (Brief items 3, 6.) CONFIRMED.

**Case.**
1. Kestrel (149 admin) changes the remark on Heron's leave to a private reason.
2. Ranger (142 member) opens the changes window for that week. The line with Heron's private reason is listed. The bell's "new to you" marks count it too.

By reading: Admin → Data's "Clear edit history…" (`elog.sweep`, `engine/editlog.ts:256`) by any admin deletes both squadrons' lines in the time range.

**Proof.** `__proof_sec__/history-cross-sqn.test.ts`: red. `elogWeekRows('13/07/2026')` holds the 149 line after the 142 member signs in.

**Cause.** `elog:` lines are unqualified, which was deferred on purpose (`engine/hooks.ts:216` comment, `storage/keyowner.ts:54`). `elogWeekRows` (`engine/editlog.ts:124`) filters by date only. The deferral was safe with one squadron, but batch 1 seeds 149 with people and inputs, so the leak goes live with this merge. It breaks D2132 (Inputs stay on his own squadron) and D2191 (View never shows another squadron's bell).

**Fix.**
1. Stamp each line with `unit: UNIT` when it is logged (`logAction` / `changeLinesFor`).
2. Filter `elogWeekRows`, `elogRows`, `elogGroups`, `elogKeySet` / `elogFor` and the new-to-you count (`state/changes.ts`) to the unit in view.
3. Limit `elogSweep` to the actor's own unit's lines, and make the gate refuse a sweep of another unit's line.
4. A line about an input should take the unit of the input's people (`inputUnitOf`), not the unit in view.

---

## F6 — On the demo, a plain admin can delete the master's account; "one master always left" is not enforced there. (Brief item 2.) CONFIRMED.

**Case.** Prowler deletes Saber on Admin → Users (`deletePerson('stiff')`). It is kept, whether or not account rows were stored before, and no master is left.

**Proof.** `__proof_sec__/master-delete.test.ts` (fresh store) and `master-delete2.test.ts` (rows already stored): both red.

**Cause.** `state/accounts.ts:601` `accountBefore(id, null)` reads a missing image as the seeded account. `unitRowViolation` (`perms.ts:1243–1246`) uses it for the AFTER side too, so a deleted master reads as "still master, no change". The end-check "one master must be left" is then never reached.

With the demo seeds off (a shared store) the delete would be caught. But the demo is the app as it runs today, and the harm is to new actions, not stored data, so D56 does not apply.

**Fix.**
1. In `masterCh`, read the after side as `c.after != null ? c.after : (no account rows remain after the command ? seed : null)`. Keep the seed fallback only for the case the comment names: an Undo of the very first account write, which removes every stored row.
2. Run the "one master must be left" check whenever any account row changes, not only when `masterCh` is non-empty.
3. F1 step 2 (only a master changes a master's account) also closes this.

---

## F7 (minor) — `place.set`: a squadron's admin changes a place the other squadron shares.

142's admin may rename the shared "Home base" or change its time zone, which moves 149's dates and labels too. This is as §11 is written ("an admin of a unit at it today"), so it is a question for him, not a fault. My recommendation: a shared place is changed only by a master, or by an admin of every squadron at it.

---

## Watch items for step 5 (not reachable today)

- Blue/red answers (`insights.role`) and other schedule writes with unqualified change ids rely on the unit in view. Once the "142 ▾" switch exists, an Undo of a 142 answer replayed while 149 is in view must be checked.
- `guestview` and access requests read the boot unit for a guest.

## Checked and found nothing

- **The other squadron's unit-qualified records** (weeks, days, versions, the planning calendar, `u149@` settings including Logic, templates and `memberfile`): a 142 admin is refused, and so is a member or a View grant; Undo and Redo are re-judged on the rows before. A member writing any schedule record is refused.
- **`grant.set` / `grant.remove`:** an admin cannot grant himself, or anyone, a right in a unit he is not admin of. A grant in the account's own home unit is refused. Authority is judged on the rows before the command. A self-grant through the same command is refused.
- **`unit.add` and `account.master`:** master only (`MASTER_ONLY_COMMANDS`). A unit row changed by any other command type is still judged master-only per row, so the list is complete for type-level checks. A master never changes his own mark. A master mark forged into `account.add` / `account.update`, or into an Undo that is not the timeline's, is refused (except the demo delete in F6).
- **The developer bridge's raised role:** nothing reachable without the bridge raises the session role. It comes from `sessionFor`'s account role; `switchRoleView` only lowers it and restores it for an admin account; `sessionNow` remakes the session from the account.
- **Sign-out paths:** the top bar, the phone drawer, the guest page and the access-wait screen all use `logOut`, and the lapse path in `App.tsx` uses `resetSession`. On each, the Undo list is cleared, the Leave War is swapped, the schedule in view moves home, and Inputs, Medical, Quals and the OIL day list filter per render. Only the Tracker (F4) and the shared history (F5) carry over.
- **The bell:**
  - B10 holiday lines go only to the schedulers whose own squadron has inputs to answer (`toFor`).
  - The line's count, the OIL day list and `saveOilDay` filter by the reader's own squadron.
  - B12 posting lines go only to the loaded war's own squadron (`ownSchedulerIds`).
  - Input notices go only to the people in the input.

  A hand-made OIL answer on the other squadron's input passes the gate. That is F3's root cause.
- **Medical, the Inputs page and its calendars, Quals, the people pickers:** all filtered to the person's own squadron.

## Proof files

All five are in `C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/4b825657-ab4e-4e7a-aba0-42051bdae95b/scratchpad/job5/copy-sec/raptor-port/src/__proof_sec__/`, each run alone with `npx vitest run src/__proof_sec__/<file>`, every one red:
- `cross-sqn-accounts.test.ts`
- `cross-sqn-people.test.ts`
- `same-tab-tracker.test.ts`
- `history-cross-sqn.test.ts`
- `master-delete.test.ts` and `master-delete2.test.ts`
