// @vitest-environment jsdom
/* ARCHIVED OR POSTED OVERSEAS, HIS VIEW AND PLAN END (his D2311 — batch 1's second half, plan §4 item 8, R-O1, R-A4):
   Archive on Admin → Users, and an Overseas Sqn posting (which archives him), drop every View and Plan his sign-in holds in
   another squadron in the archive's own command; Restore does not put them back; a hand Suspend leaves them; the rights go
   even where his account was already suspended by hand. The gate lets those removals through only where the same command
   archives that account's man. Red first on the code before endRightsOfArchived. */
import { describe, it, expect, vi } from 'vitest'
import { PEOPLE } from '../engine/people'
import { useMsqWorld, signInAs, PID, ACCT } from '../test-support/msq-world'
import { accountById, levelAcct, updateAccount, saveAccess } from './accounts'
import { grantOfOn, unitsLoad, todayIso } from './units'
import { archivePerson, restoreArchivedPerson, postOut, runPoOutcomes } from '../leavewar/sync'
import { worldUnit } from '../leavewar/state/store'
import { commitPeopleSettingsIntent } from './people-settings-commit'
import { store } from '../engine/hooks'
import { GRANT_PFX } from './units-model'

useMsqWorld()

const level = (acct: string, unit: string) => { const a = accountById(acct)!; return grantOfOn(levelAcct(a), unit)?.level ?? 'none' }
const day16 = () => { vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0)); unitsLoad() }
/* Ranger (142's member) given View of 149 by Kestrel, 149's admin */
function rangerView149(): void {
  signInAs('kestrel')
  expect(saveAccess(ACCT.ranger, { grants: { u149: 'view' } })).toBeNull()
  expect(level(ACCT.ranger, 'u149')).toBe('view')
}

describe('D2311 — archived or posted overseas, View and Plan end', () => {
  it('Hunter archives Ranger, who holds View of 149: the View ends in the archive\'s own command; Restore does not bring it back', () => {
    rangerView149()
    signInAs('hunter')
    expect(archivePerson(PID.ranger).bad).toBeNull()
    expect((PEOPLE as any)[PID.ranger].archived).toBe(true)
    expect(level(ACCT.ranger, 'u149')).toBe('none')
    expect(restoreArchivedPerson(PID.ranger, todayIso())).toBe(true)
    expect((PEOPLE as any)[PID.ranger].archived).toBeFalsy()
    expect(level(ACCT.ranger, 'u149')).toBe('none')
  })
  it('a hand Suspend leaves his View; archived after it, the View ends all the same', () => {
    rangerView149()
    signInAs('hunter')
    expect(updateAccount(ACCT.ranger, { on: false })).toBeNull()
    expect(level(ACCT.ranger, 'u149')).toBe('view')
    expect(archivePerson(PID.ranger).bad).toBeNull()
    expect(level(ACCT.ranger, 'u149')).toBe('none')
  })
  it('Hunter\'s Overseas Sqn posting while he holds Plan of 149 — 142\'s war loaded: on its date his Plan ends', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    expect(postOut(PID.hunter, '2026-07-16', 'overseas')).toBe(true)
    day16()
    signInAs('saber')
    expect(worldUnit()).toBe('u142')
    runPoOutcomes()
    expect((PEOPLE as any)[PID.hunter].archived).toBe(true)
    expect(level(ACCT.hunter, 'u149')).toBe('none')
  })
  it('…and with 149\'s war loaded (Kestrel opens the app on the date): the pass over every squadron ends it too', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    expect(postOut(PID.hunter, '2026-07-16', 'overseas')).toBe(true)
    day16()
    signInAs('kestrel')
    expect(worldUnit()).toBe('u149')
    runPoOutcomes()
    expect((PEOPLE as any)[PID.hunter].archived).toBe(true)
    expect(level(ACCT.hunter, 'u149')).toBe('none')
  })
  it('a forged removal of Ranger\'s View of 149 beside an unrelated archive (Casper) is refused at the gate', () => {
    rangerView149()
    signInAs('hunter')
    const g = grantOfOn(levelAcct(accountById(ACCT.ranger)!), 'u149')!
    const r = commitPeopleSettingsIntent('person.archive', null, () => {
      const p = (PEOPLE as any).casper
      p.archived = true; p.archivedBy = 'admin'; p.archivedOn = todayIso()
      store.set(GRANT_PFX + g.id, null)
    }) as any
    expect(r.ok).toBe(false)
    unitsLoad()
    expect(level(ACCT.ranger, 'u149')).toBe('view')
  })
})
