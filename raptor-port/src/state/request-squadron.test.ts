// @vitest-environment jsdom
/* REQUEST ACCESS ASKS THE SQUADRON (batch 1's second half, plan §5 — picture 4; B7, D2094, D2111; §15 D12, D2324): a
   request names the squadron he asks to join (`accessreq:<id>.unit`, the gate checking it names one in the store); its
   audience is that squadron's admins — its own, a Plan holder of it, a master admin — and only they answer it, at the
   door and at the gate, whatever path would answer it; approving with New person makes the new man that squadron's;
   marking seen takes the requests shown, so opening 142's Waiting list leaves 149's request new; a squadron named by a
   request is never removed under it. Red first on the code before the change. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, ACCT, PID } from '../test-support/msq-world'
import {
  requestAccess, ACCESS_REQS, accountsLoad, approveRequestNew, approveRequest, declineRequest, addAccount, updateAccount,
  waitingHere, unseenRequests, markRequestsSeen, waitingCount, saveAccess, accountByName, requestByName,
} from './accounts'
import { homeOn, todayIso, addUnit, units, unitsLoad } from './units'
import { enterSquadron } from './store'
import { commitPeopleSettingsIntent } from './people-settings-commit'
import { store } from '../engine/hooks'
import { globalUndo } from '../undo/timeline'
import { nameToId } from '../engine/people'

useMsqWorld()

const JOIN_149 = 'He asked to join 149 — only an admin of 149 can answer it.'
/* a new person asks to join `unit` */
function ask(name: string, cs: string, unit?: string): string {
  signInAs(name)
  const r = requestAccess({ cs, ini: 'JB', seat: 'FCP', cat: 'C' }, unit)
  expect(r, `${name}'s request`).toBeNull()
  accountsLoad()
  return requestByName(name)!.id
}

describe('a request names its squadron', () => {
  it('stored with the squadron asked', () => {
    const id = ask('newb@mail', 'NEWB', 'u149')
    expect(ACCESS_REQS.find(r => r.id === id)!.unit).toBe('u149')
    expect((store.get('accessreq:' + id, null) as any).unit).toBe('u149')
  })
  it('a squadron that is not there is refused', () => {
    signInAs('newb@mail')
    expect(requestAccess({ cs: 'NEWB', ini: 'JB', seat: 'FCP', cat: 'C' }, 'u999')).toBe('That did not save')
  })
  it('a request stored before this build, with no squadron, reads as the boot squadron\'s (D56)', () => {
    store.set('accessreq:rqold', { id: 'rqold', name: 'old@mail', cs: 'OLD', ini: 'OD', seat: 'FCP', cat: 'C', at: 1 })
    accountsLoad()
    expect(ACCESS_REQS.find(r => r.id === 'rqold')!.unit).toBe('u142')
  })
  it('a forged request row naming no squadron in the store is refused at the gate', () => {
    signInAs('newb@mail')
    const r = commitPeopleSettingsIntent('access.request', { owner: 'newb@mail' } as any, () => {
      store.set('accessreq:rqforge', { id: 'rqforge', name: 'newb@mail', cs: 'NEWB', ini: 'JB', seat: 'FCP', cat: 'C', at: 1, unit: 'u999' })
    }) as any
    expect(r.ok).toBe(false)
  })
})

describe('its audience is that squadron\'s admins', () => {
  it('a 149 request reaches Kestrel, never Hunter (142 only)', () => {
    const id = ask('newb@mail', 'NEWB', 'u149')
    signInAs('kestrel')
    expect(waitingHere().map(r => r.id)).toEqual([id])
    expect(unseenRequests().map(r => r.id)).toEqual([id])
    signInAs('hunter')
    expect(waitingHere()).toEqual([])
    expect(unseenRequests()).toEqual([])
    expect(waitingCount()).toBe(0)
  })
  it('Hunter holding Plan of 149 has it: in his bell, and on 149\'s Waiting list once 149 is picked', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    const id = ask('newb@mail', 'NEWB', 'u149')
    signInAs('hunter')
    expect(unseenRequests().map(r => r.id)).toEqual([id])
    /* the page's squadron's only on the Waiting list and the badges (§15 D3) */
    expect(waitingHere()).toEqual([])
    expect(waitingCount()).toBe(0)
    enterSquadron('u149', false)
    expect(waitingHere().map(r => r.id)).toEqual([id])
    expect(waitingCount()).toBe(1)
  })
  it('opening 142\'s Waiting list leaves 149\'s request new (R-O9, R-A8) — a master admin with requests in both', () => {
    const a = ask('one@mail', 'ONE', 'u142')
    const b = ask('two@mail', 'TWO', 'u149')
    signInAs('saber')
    expect(unseenRequests().map(r => r.id).sort()).toEqual([a, b].sort())
    expect(markRequestsSeen()).toBeNull()
    accountsLoad()
    expect(unseenRequests().map(r => r.id)).toEqual([b])
    enterSquadron('u149', false)
    expect(markRequestsSeen()).toBeNull()
    accountsLoad()
    expect(unseenRequests()).toEqual([])
  })
})

describe('only an admin of its squadron answers it — at the door and at the gate (D12)', () => {
  it('Hunter cannot decline, approve or approve-new a 149 request; Kestrel can, and approving makes the new man 149\'s', () => {
    const id = ask('newb@mail', 'NEWB', 'u149')
    signInAs('hunter')
    expect(declineRequest(id)).toBe(JOIN_149)
    expect(approveRequestNew(id, { cs: 'NEWB', ini: 'JB', seat: 'FCP', cat: 'C' }, 'main', todayIso())).toBe(JOIN_149)
    expect(approveRequest(id, 'casper', 'main')).toBe(JOIN_149)
    expect(ACCESS_REQS.some(r => r.id === id)).toBe(true)
    signInAs('kestrel')
    expect(approveRequestNew(id, { cs: 'NEWB', ini: 'JB', seat: 'FCP', cat: 'C' }, 'main', todayIso())).toBeNull()
    const pid = nameToId('NEWB')!
    expect(homeOn(pid, todayIso())).toBe('u149')
    expect(accountByName('newb@mail')?.pid).toBe(pid)
  })
  it('a master admin on 142\'s page approving a 149 request makes the new man 149\'s', () => {
    const id = ask('newb@mail', 'NEWB', 'u149')
    signInAs('saber')
    expect(approveRequestNew(id, { cs: 'NEWB', ini: 'JB', seat: 'FCP', cat: 'C' }, 'main', todayIso())).toBeNull()
    expect(homeOn(nameToId('NEWB')!, todayIso())).toBe('u149')
  })
  it('linking a 149 request to a 142 man is refused, even for an admin of both', () => {
    const id = ask('newb@mail', 'NEWB', 'u149')
    signInAs('saber')
    expect(approveRequest(id, 'casper', 'main')).not.toBeNull()
    expect(ACCESS_REQS.some(r => r.id === id)).toBe(true)
  })
  it('Hunter adding an account, or renaming one, under the name of a 149 request is refused in its words', () => {
    ask('newb@mail', 'NEWB', 'u149')
    signInAs('hunter')
    expect(addAccount('newb@mail', 'casper', 'main')).toBe(JOIN_149)
    expect(updateAccount(ACCT.ranger, { name: 'newb@mail' })).toBe(JOIN_149)
    expect(requestByName('newb@mail')).toBeTruthy()
  })
  it('a forged decline of a 149 request by Hunter is refused at the gate', () => {
    const id = ask('newb@mail', 'NEWB', 'u149')
    signInAs('hunter')
    const r = commitPeopleSettingsIntent('access.decline', null, () => { store.set('accessreq:' + id, null) }) as any
    expect(r.ok).toBe(false)
    accountsLoad()
    expect(ACCESS_REQS.some(x => x.id === id)).toBe(true)
  })
})

describe('a squadron named by a request is never removed under it (R-O11)', () => {
  it('the Undo of "+ New squadron" is refused while a request names 150', () => {
    signInAs('saber')
    expect(addUnit('150', 'p1', ACCT.kestrel)).toMatchObject({ ok: true })
    unitsLoad()
    const u150 = units().find(u => u.num === '150')!.id
    /* his request arrives from another device (signing in as him here would clear Saber's Undo list, D148) */
    store.set('accessreq:rq150', { id: 'rq150', name: 'newb@mail', cs: 'NEWB', ini: 'JB', seat: 'FCP', cat: 'C', at: 1, unit: u150 })
    accountsLoad()
    expect(globalUndo().ok).toBe(false)
    unitsLoad()
    expect(units().some(u => u.id === u150)).toBe(true)
  })
  it('with no request naming it, the same Undo goes through (the setup proves only the request holds it)', () => {
    signInAs('saber')
    expect(addUnit('150', 'p1', ACCT.kestrel)).toMatchObject({ ok: true })
    unitsLoad()
    const u150 = units().find(u => u.num === '150')!.id
    expect(globalUndo().ok).toBe(true)
    unitsLoad()
    expect(units().some(u => u.id === u150)).toBe(false)
  })
})
void PID
