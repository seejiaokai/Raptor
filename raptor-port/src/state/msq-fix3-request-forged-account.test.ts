// @vitest-environment jsdom
/* R5 OF THE SECOND HALF'S FINAL READS — SECURITY (docs/superpowers/briefs/2026-11-23-msq-b1-final-read-security.md,
   finding 1): a waiting request is answered only by an admin of its squadron, whatever path answers it (§15 D12, D2324).
   The doors refuse in D2324's words — "He asked to join 149 — only an admin of 149 can answer it." — but the gate
   (state/perms.ts requestRowViolation) judged only commands that changed an `accessreq:` row. A hand-made `account.add`
   by Hunter, 142's plain admin, under a 149 requester's name, the request row left alone, answered it all the same: the
   loader drops a request whose name has an account, so it left 149's Waiting list, and the newcomer signed in as a 142
   admin of Hunter's choosing. The same through an `account.update` rename (and `account.addNew`, which writes the same
   account row). Now every account row a command adds or renames onto the name of a request waiting before the command
   needs an admin of that request's squadron. Red first: the gate let both through and the request was gone. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, ACCT } from '../test-support/msq-world'
import { requestAccess, accountsLoad, requestByName, linkablePeople, updateAccount, addAccount, signIn } from './accounts'
import { commitPeopleSettingsIntent } from './people-settings-commit'
import { store } from '../engine/hooks'

useMsqWorld()

function ask(name: string, cs: string, unit?: string): string {
  signInAs(name)
  const r = requestAccess({ cs, ini: 'JB', seat: 'FCP', cat: 'C' }, unit)
  expect(r, `${name}'s request`).toBeNull()
  accountsLoad()
  return requestByName(name)!.id
}
/* the accounts stored by a real door first (the very first write stores every account), so a forgery below writes one
   row of a stored list, as a hand-made command would */
function storeAccounts(): void {
  signInAs('saber')
  expect(updateAccount(ACCT.ranger, { on: false })).toBeNull()
  expect(updateAccount(ACCT.ranger, { on: true })).toBeNull()
}

describe('an account under a waiting request\'s name answers it — only an admin of its squadron (R5, §15 D12)', () => {
  it('a forged `account.add` under a 149 requester\'s name, its request row left, is refused at the gate', () => {
    storeAccounts()
    ask('newb@mail', 'NEWB', 'u149')
    signInAs('hunter')
    const pid = linkablePeople()[0]!
    expect(pid, 'a 142 man with no sign-in').toBeTruthy()
    const r = commitPeopleSettingsIntent('account.add', null, () => {
      store.set('account:aforge', { id: 'aforge', name: 'newb@mail', role: 'admin', pid, on: true, createdAt: Date.now(), adminAt: Date.now() })
    }) as any
    accountsLoad()
    expect(r.ok).toBe(false)
    expect(String(r.message)).toMatch(/request to join u149/)
    expect(requestByName('newb@mail'), 'the request still waits').toBeTruthy()
    expect(signIn('newb@mail', 'x').kind, 'no account to sign in with').not.toBe('ok')
  })
  it('a forged `account.update` renaming Ranger\'s sign-in onto the 149 requester\'s name is refused at the gate', () => {
    storeAccounts()
    ask('newb@mail', 'NEWB', 'u149')
    signInAs('hunter')
    const row: any = store.get('account:' + ACCT.ranger, null)
    expect(row).toBeTruthy()
    const r = commitPeopleSettingsIntent('account.update', null, () => {
      store.set('account:' + ACCT.ranger, { ...row, name: 'newb@mail' })
    }) as any
    accountsLoad()
    expect(r.ok).toBe(false)
    expect(requestByName('newb@mail')).toBeTruthy()
  })
  it('the doors still answer as before: Hunter adds an account for a 142 requester; Kestrel for a 149 one', () => {
    ask('new142@mail', 'NEWA', 'u142')
    ask('new149@mail', 'NEWB', 'u149')
    signInAs('hunter')
    expect(addAccount('new142@mail', linkablePeople()[0]!, 'main')).toBeNull()
    expect(addAccount('new149@mail', linkablePeople()[0]!, 'main')).toBe('He asked to join 149 — only an admin of 149 can answer it.')
    signInAs('kestrel')
    expect(addAccount('new149@mail', linkablePeople()[0]!, 'main')).toBeNull()
    accountsLoad()
    expect(requestByName('new142@mail')).toBeFalsy()
    expect(requestByName('new149@mail')).toBeFalsy()
  })
})
