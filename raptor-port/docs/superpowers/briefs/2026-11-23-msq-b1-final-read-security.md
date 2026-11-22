# Final read — the security reader (batch 1's second half, commit 82e5a28ce)

Saved as it arrived (chat 149's helper ab4d52be817d61e17, 23 Nov 26 ~05:30 MPST). Ran two throwaway tests in a copy of the
commit outside the repo (copy deleted); the repo unchanged.

## Findings

**1. A 142 admin can answer a 149 access request without touching it, by a hand-made command (medium-low; the door
refuses, the gate lets it through)**
- Steps: a newcomer signs in as `newb@mail` and asks to join 149 (only 149's admins should see and answer it — §5, §15
  D12, D2324). Hunter, a plain admin of 142, writes a hand-made `account.add`: a new account named `newb@mail`, role admin,
  linked to a 142 man with no sign-in (`dj` in the test world), leaving the request row alone.
- What happens: the gate passes it; on the next load `accountsLoad` drops the request (a request under a name that already
  has an account is skipped), so it leaves Kestrel's and Saber's Waiting lists; `signIn('newb@mail')` returns ok — the
  newcomer who asked for 149 is in as a 142 admin of Hunter's choosing.
- Should: refused — the door already refuses in D2324's words, "He asked to join 149 — only an admin of 149 can answer it."
  (`addAccount`, `addPersonAndAccount` and `updateAccount`'s rename call `requestNotHis`); the plan's D12 holds "whatever
  path deletes it".
- Where: `state/perms.ts requestRowViolation` looks only at commands that change an `accessreq:` row; an account added or
  renamed onto a waiting request's name answers it through the loader without changing the row. Also open by a forged
  `account.update` rename and by `account.addNew`.
- Fix: in `requestRowViolation` (or section 8) also check every account row the command adds or renames — a name matching
  a waiting request stored before the command needs an admin of that request's squadron; or require such a command to
  delete the request row so the existing rule judges it.
- Test (failed against a copy of 82e5a28ce: the gate returned ok and the request was gone; the probe file
  `secread-probe.test.ts` in the scratch folder), inside `state/request-squadron.test.ts`, reusing its `ask()`:
```ts
it('a forged account under a 149 requester\'s name, its request row left, is refused at the gate', () => {
  ask('newb@mail', 'NEWB', 'u149')
  signInAs('hunter')
  const pid = linkablePeople()[0]          // a 142 man with no sign-in
  const r = commitPeopleSettingsIntent('account.add', null, () => {
    for (const a of ACCOUNTS_LIST) store.set('account:' + a.id, /* each account's row as accountRow writes it */)
    store.set('account:aforge', { id: 'aforge', name: 'newb@mail', role: 'admin', pid, on: true, adminAt: Date.now() })
  }) as any
  accountsLoad()
  expect(r.ok).toBe(false)                         // today: true
  expect(requestByName('newb@mail')).toBeTruthy()  // today: gone
})
```

## Side note (not a finding)
A plain admin's hand-made account can be linked to a person who does not exist (`pid: 'ghost'`); it loads and signs in as
an admin of the default squadron, 142. Cross-squadron is refused (Kestrel, 149's admin: "an account of another squadron
(u142)"), so nobody gains beyond what he could already give his own squadron; probably older than this batch; the door's
`pidProblem` refuses it.

## Checked and holding
Every grant line in `saveAccess` held at the gate (View needs an admin of that squadron; Plan, the master mark and any
right on a master admin's account need a master admin); the bell switch writes only its owner's row; own-account lines
only those a change owes; the posting-failed line the app's alone with the runner's proof; place changes need an admin of
every squadron there; Tracker writes after a pick refused; a View holder's edit controls off on 149 and the gate refuses
the saves; a held sign-in never keeps the password; OIL amounts read from the input's own squadron at door and gate.

## Read
The whole perms.ts diff (requestRowViolation, bellSqnRowViolation, acctLineViolation incl. account.told,
postingFailedViolation, unitRowViolation, accountShapeAndMasterViolation and its moments check, warUnitViolation, the D1′c
exception and line stamps in adminOwnerViolation, the posting pass's audience, trkUnitViolation); pageUnit, readableUnits,
ownPageMayBe, adminOfPage, adminOfUnit, trackerCoverKind; accounts.ts diff; acctlines, bellsqn, belltap, pick; diffs of
notices, units, units-model, store, typing-hold, auth, leavewar/sync, undo-wire, timeline, cutoff, oil, plan, reqdoor and
callers, Login, logout, signinhold, savewait, UsersPanel, useraccess-model, userslist-model, the filter's squadron ticks,
AdminPage, AccessScreen, Shell, topstate, LogicPage, the settings windows, the Tracker page and role.js, probe-bridge,
keyowner, tables; the plan §0–§8, §15, §16. Not read: SquadronsPanel, SquadronMenu, UserAccess, UsersFilter and the CSS
beyond their door calls; rolestable; other tests; the drawings.

## Tidiness notes (filed, not fixed — D489)
1. `perms.ts` members' notices: a whitespace-only change `const rides =(iid: any) => …`.
2. Two bodies decide which squadron an old request with none named belongs to: the gate's `reqUnit` says `BOOT_UNIT`; the
   door's `bootRequestUnit()` falls back to the store's first squadron — they disagree on a store without 142 (harmless
   today, D56); one body.
3. `saveAccess`'s `drops` filter is a hard-to-read nested ternary; in `accountShapeAndMasterViolation` `momentsViolation`
   is worked out before a `continue` that skips its result.

Also, not security: plan §3 item 7 (R2, Approvals' "New" mark per squadron) looks unbuilt — `apprseen:` still a shared key.
