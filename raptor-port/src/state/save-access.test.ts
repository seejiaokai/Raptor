// @vitest-environment jsdom
/* ONE SAVE, ONE COMMAND, ONE UNDO STEP FOR A PERSON'S ACCESS (batch 1's second half, plan §4 item 5 — D2303, R-O3, R-A5,
   R-O10): Admin → Users' opened row saves its role, its master admin mark and every squadron's line together, by
   state/accounts.ts saveAccess, as one `account.access` command. Each check only for the part it governs; the first
   refusal shown, nothing of the Save committed. Red first on the code before saveAccess. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT } from '../test-support/msq-world'
import { saveAccess, accountById, setMaster } from './accounts'
import { addUnit, setGrant, grantOfOn, unitsLoad, units, PLAN_MASTER_ONLY } from './units'
import { levelAcct } from './accounts'
import { commitSettingsIntent } from './people-settings-commit'
import { store } from '../engine/hooks'
import { GRANT_PFX } from './units-model'
import { todayIso } from './units'
import { globalUndo, globalRedo, _timelineEntries } from '../undo/timeline'

const newestUndoable = () => _timelineEntries().at(-1) ?? null

useMsqWorld()

const level = (acct: string, unit: string) => { const a = accountById(acct)!; return grantOfOn(levelAcct(a), unit)?.level ?? 'none' }
/* a third squadron, 150, at Home base, its first admin Kestrel (given Plan of it) — made by the master admin */
function make150(): string {
  signInAs('saber')
  const r = addUnit('150', 'p1', ACCT.kestrel)
  expect(r, '150 made').toMatchObject({ ok: true })
  unitsLoad()
  return units().find(u => u.num === '150')!.id
}

describe('saveAccess — one Save', () => {
  it('Saber gives Hunter Plan of 149 and View of 150 in one Save; one Undo puts both back, one Redo gives both again', () => {
    const u150 = make150()
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan', [u150]: 'view' } })).toBeNull()
    expect(level(ACCT.hunter, 'u149')).toBe('admin')
    expect(level(ACCT.hunter, u150)).toBe('view')
    expect(newestUndoable()?.type).toBe('account.access')
    expect(globalUndo().ok).toBe(true)
    expect(level(ACCT.hunter, 'u149')).toBe('none')
    expect(level(ACCT.hunter, u150)).toBe('none')
    expect(globalRedo().ok).toBe(true)
    expect(level(ACCT.hunter, 'u149')).toBe('admin')
    expect(level(ACCT.hunter, u150)).toBe('view')
  })
  it('a refusal in the second change saves neither: Saber gives Ranger, a member, View of 149 and Plan of 150', () => {
    const u150 = make150()
    signInAs('saber')
    expect(saveAccess(ACCT.ranger, { grants: { u149: 'view', [u150]: 'plan' } })).toBe('Plan is for admins only.')
    expect(level(ACCT.ranger, 'u149')).toBe('none')
    expect(level(ACCT.ranger, u150)).toBe('none')
  })
  it('Member → Admin with Plan of 149 in one Save passes: Plan is judged on the role after the Save (R-O3c)', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.ranger, { role: 'admin', grants: { u149: 'plan' } })).toBeNull()
    expect(accountById(ACCT.ranger)!.role).toBe('admin')
    expect(level(ACCT.ranger, 'u149')).toBe('admin')
    expect(globalUndo().ok).toBe(true)
    expect(accountById(ACCT.ranger)!.role).toBe('main')
    expect(level(ACCT.ranger, 'u149')).toBe('none')
  })
  it('Admin → Master admin drops his View and Plan rows in the same command (R-O10); one Undo puts all back', () => {
    const u150 = make150()
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan', [u150]: 'view' } })).toBeNull()
    expect(saveAccess(ACCT.hunter, { master: true })).toBeNull()
    expect(accountById(ACCT.hunter)!.master).toBe(true)
    expect(level(ACCT.hunter, 'u149')).toBe('none')
    expect(level(ACCT.hunter, u150)).toBe('none')
    expect(globalUndo().ok).toBe(true)
    expect(accountById(ACCT.hunter)!.master).toBeUndefined()
    expect(level(ACCT.hunter, 'u149')).toBe('admin')
    expect(level(ACCT.hunter, u150)).toBe('view')
  })
  it('Master admin → Member in one Save takes the mark off and the role down (D2303) — a master admin\'s alone', () => {
    signInAs('saber')
    expect(setMaster(ACCT.hunter, true).ok).toBe(true)
    signInAs('kestrel')
    expect(saveAccess(ACCT.hunter, { role: 'main' })).toBe('Only a master admin can do that')
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { role: 'main' })).toBeNull()
    const h = accountById(ACCT.hunter)!
    expect(h.role).toBe('main')
    expect(h.master).toBeUndefined()
  })
  it('the last-admin refusal: Saber making Kestrel, 149\'s only admin, a member', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.kestrel, { role: 'main' })).toBe("Kestrel is 149's last admin. Make another admin of 149 first.")
    expect(accountById(ACCT.kestrel)!.role).toBe('admin')
  })
  it('a row where only another squadron\'s line changed asks none of the account\'s checks: Kestrel gives Hunter, a 142 man, View of 149 (R-O3b)', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
    expect(level(ACCT.hunter, 'u149')).toBe('view')
    /* …but his role is 142's to change, not 149's */
    expect(saveAccess(ACCT.hunter, { role: 'main' })).toBe("He is 142's. Only an admin of 142 can change his account.")
  })
  it('View of a squadron is given only by an admin of it (R5, D2299): Hunter, 142 only, giving Ranger View of 149', () => {
    signInAs('hunter')
    expect(saveAccess(ACCT.ranger, { grants: { u149: 'view' } })).toBe('Only an admin of 149 can give access to 149.')
    expect(level(ACCT.ranger, 'u149')).toBe('none')
  })
  it('Plan is a master admin\'s to give (PA1): Kestrel giving Hunter Plan of 149', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBe(PLAN_MASTER_ONLY)
  })
  it('a master admin\'s account has no squadron lines to give (R4) — refused at the door; setGrant too (R2-O14)', () => {
    signInAs('saber')
    expect(setMaster(ACCT.hunter, true).ok).toBe(true)
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBe('This change could not be saved.')
    expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter)).toMatchObject({ ok: false })
    expect(level(ACCT.hunter, 'u149')).toBe('none')
  })
  it('his own account is never his to save', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.saber, { grants: { u149: 'view' } })).toBe("You can't change your own account — ask another admin")
  })
  it('nothing changed saves nothing', () => {
    signInAs('saber')
    const before = newestUndoable()
    expect(saveAccess(ACCT.hunter, { role: 'admin', grants: { u149: 'none' } })).toBeNull()
    expect(newestUndoable()).toBe(before)
  })
  it('Plan lowered to View in one Save keeps one row for the squadron, at View', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
    expect(level(ACCT.hunter, 'u149')).toBe('view')
  })
  it('the gate holds the same: a forged one Save giving Ranger View of 149 by Hunter (142 only) is refused', () => {
    signInAs('hunter')
    const r = commitSettingsIntent('account.access', null, () => { store.set(GRANT_PFX + 'gf1', { id: 'gf1', account: ACCT.ranger, unit: 'u149', level: 'view', from: todayIso() }) }) as any
    expect(r.ok).toBe(false)
    unitsLoad()
    expect(level(ACCT.ranger, 'u149')).toBe('none')
  })
  it('the gate holds the same: a forged right given on a master admin\'s account is refused (R2-O14)', () => {
    signInAs('saber')
    expect(setMaster(ACCT.hunter, true).ok).toBe(true)
    const r = commitSettingsIntent('grant.set', null, () => { store.set(GRANT_PFX + 'gf2', { id: 'gf2', account: ACCT.hunter, unit: 'u149', level: 'view', from: todayIso() }) }) as any
    expect(r.ok).toBe(false)
    unitsLoad()
    expect(level(ACCT.hunter, 'u149')).toBe('none')
  })
  it('the gate holds the same: a forged one Save making Hunter a master admin and keeping his Plan of 149 is refused (R-O10)', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    const h = accountById(ACCT.hunter)!
    const r = commitSettingsIntent('account.access', null, () => { store.set('account:' + h.id, { id: h.id, name: h.name, role: 'admin', pid: h.pid, on: true, master: true, masterFrom: todayIso() }) }) as any
    expect(r.ok).toBe(false)
  })
  it('the Undo bubble names the change as drawn (D2326): "Plan of 149 given · Hunter"', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    expect(newestUndoable()?.label).toBe('Plan of 149 given · Hunter')
  })
})
