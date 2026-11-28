# Final read — the fresh, blind Opus reader (batch 1's second half, commit 82e5a28ce)

Saved as it arrived (chat 149's helper ab469986ce93173af, 23 Nov 26 ~05:15 MPST). Read only; tests written out, not run.

## Findings, most severe first

**1. One undo can leave a person's bell "Show" buttons dead for good**
- Steps: Saber (master admin) makes squadron 150 with "+ New squadron", Hunter its first admin. Saber's bell now shows
  "Show 142 149 150"; he presses 150 on (Hunter may too). Saber presses Undo — a bell switch is no Undo step, so it takes
  back "+ New squadron", nothing blocking. Saber (or Hunter) presses 149 in the bell's Show row.
- What happens: refused ("a bell switch that will not read"); the button does not change, no message; every later press
  refused the same way — the switch can never be changed again.
- Why: `state/bellsqn.ts setBellSquadron` writes `{ ...bellChoices(p), [unit]: on }`, carrying the stale id; `bellChoices`
  never drops ids no longer in the store; the gate `state/perms.ts bellSqnRowViolation` refuses any key not in
  `unitRowsBefore([]).units`; the undo's "a unit removed while still named" check does not look at `bellsqn:` rows; the
  result is ignored in `ui/topbits.tsx BellShowRow`.
- Should: plan §7 item 3 — "each his to switch". Drop ids not in `units()` before writing, or let the gate pass unchanged
  stale keys.
- Test (fails today):
```ts
import { it, expect } from 'vitest'
import { useMsqWorld, signInAs, ACCT, PID } from '../test-support/msq-world'
import { addUnit, placeOfOn, todayIso, units } from '../state/units'
import { setBellSquadron, bellShows } from '../state/bellsqn'
import { globalUndo } from '../undo/timeline'
useMsqWorld()
it('the bell switch still saves after the squadron it named is undone away', async () => {
  signInAs('saber')
  const r: any = addUnit('150', placeOfOn('u142', todayIso())!.id, ACCT.hunter); expect(r.ok).toBe(true)
  expect(setBellSquadron(r.id, true)).toBe(true)
  await globalUndo()
  expect(units().some(u => u.id === r.id)).toBe(false)
  expect(setBellSquadron('u149', false)).toBe(true)
  expect(bellShows(PID.saber, 'u149')).toBe(false)
})
```

**2. R2 was never built: one Leave War Approvals "New" mark covers every squadron**
- Steps: Saber (or Hunter with Plan of 149) has new requests in both 142's and 149's Leave War; picks 142, opens Approvals;
  picks 149, opens Approvals.
- What happens: 149's requests no longer show "New".
- Why: `state/apprseen.ts` keeps one `apprseen:<pid>` row; the key is in the shared list in `storage/keyowner.ts`, not
  split by squadron; `leavewar/ui/ApprovalsPage.tsx` l.96 calls `openApprovals(pid)` with no squadron.
- Should: plan §3 item 7 (R2), §15 D14 — the key moves into the per-squadron space, with this test. No record found of it
  being put off.
- Test (fails today):
```ts
signInAs('saber'); enterSquadron('u149'); openApprovals(PID.saber, 1000)
enterSquadron('u142'); openApprovals(PID.saber, 2000)
enterSquadron('u149'); expect(apprSeenAt(PID.saber)).toBe(1000)   // 2000 today
```

**3. Making a Plan holder a master admin through the master mark's own command keeps his Plan rows, and the gate lets it through**
- Steps: Saber gives Hunter Plan of 149, then runs `state/accounts.ts setMaster(ACCT.hunter, true)` (no screen calls it
  now; a master admin can send it by hand).
- What happens: it saves; Hunter is master and still holds Plan of 149; Admin → Users shows "Full access", hiding it; it
  returns when the mark comes off. R-O10's problem.
- Why: `setMaster` drops no rights, writes only `kept`; in `state/perms.ts unitRowViolation` "a right left on an account
  made a master admin" runs only for `account.access`; the other check looks only at grant rows the command changes.
- Should: §15 D14 — "the gate refuses a grant row left on one after the command", for any command. Apply it to every
  command that sets the mark, or make `setMaster` drop rights as `saveAccess` does.
- Test (fails today):
```ts
signInAs('saber'); expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
const r = setMaster(ACCT.hunter, true)
expect(r.ok && !!grantOfOn(levelAcct(accountById(ACCT.hunter)!), 'u149')).toBe(false)
```

**4. Admin → Users' Save can save half and only show the refusal**
- Steps: on Hunter's opened row Saber picks View for 149 and changes the sign-in to a taken name; Save.
- What happens: the View saves as one command and Undo step; the rename is refused and only its refusal shows; the row
  stays open with View picked, reading as if nothing saved.
- Why: `ui/UsersPanel.tsx PersonEditor.save` runs `saveAccess(...) || updateAccount(a.id, { name })` as two commands.
- Should: plan §4 item 5 — one Save, one command, one Undo step. Check the name first, or carry the rename in
  `account.access`.
- Test: render `PersonEditor` for Hunter, pick 149 → View, type a taken sign-in, Save; expect no grant on 149 (today stored).

## What it read
The gate and doors (perms.ts diff, accounts.ts diff), units / units-model, acctlines, notices diff, bellsqn, belltap,
pick, store / typing-hold / undo-wire / undo describe & timeline / leavewar sync diffs, the edit-rights files (auth,
cutoff, engine/oil, plan, roster-add), the screens (UsersPanel, UserAccess and model, users list model, squadrons model
and part of the panel, Login, logout, signinhold, AccessScreen, SquadronMenu, topbits, topstate, AdminPage, Shell,
LogicPage, InputWindow diff, Tracker diffs, owncal, caldrag, oilday, heldro). Checked, no fault: saveAccess against the
gate; the own-account lines' writer incl. Undo/Redo; pass and archive dropping rights; posting-failed proof, move-line
ids and day window; request audience, seen marks, approve/link by squadron; the place rule; Tracker cover and sign-in hold.

## Not read
New test files and CSS; usersfilter-model / UsersFilter, rolestable; the ~30 smaller reclassified files beyond spot
checks (trusted the inventory test); engine/inputs, probe-bridge, HolidaysPanel beyond its diff; whether the command layer
accepts `account.told` / `posting.failed` under the inputs scope.

## Tidiness notes (filed, not fixed — D489)
1. The same rules in three places: `setGrant`, `saveAccess`, `firstAdminProblem` each repeat "moves squadron tomorrow",
   "not on a master admin", "Plan for admins only"; `setMaster` and `saveAccess` each repeat the `kept` logic (finding 3
   is one such drift).
2. `state/perms.ts`, member notices case: a stray change `const rides =(iid: any)` (a space lost).
3. `bellChoices` keeps ids of removed squadrons (finding 1's root); the place refusal's `COUNT` word list in `units.ts`
   stops at twelve, then falls back to digits mid-sentence.
