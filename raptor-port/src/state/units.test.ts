// @vitest-environment jsdom
/* UNITS, PLACES, HOMES AND RIGHTS (multi-squadron batch 1, step 1 — state/units.ts, state/units-model.ts, the master
   mark on the account, and the commit gate's unit rules in state/perms.ts). Red first, rule by rule, as the step's design
   in HANDOFF lists them. */
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { storeBackend, store } from '../engine/hooks'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import { initStore, resetSession, notify } from './store'
import { signIn, sessionFor, addAccount, updateAccount, accountById, accountByName, addPersonAndAccount, levelIn, isMasterAccount, setMaster } from './accounts'
import { addRosterPerson } from './roster-add'
import { commitSettingsIntent } from './people-settings-commit'
import { installGlobalUndo } from './undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { globalUndo } from '../undo'
import { setSession } from './auth'
import {
  units, unitById, places, placeOfOn, homeOn, grantsOf, unitsLoad, setUnitSeeds, addUnit, moveUnit, setPlace, setGrant,
  removeGrant, setHome, todayIso,
} from './units'
import { gmtLabel, validTz, moveFrom } from './units-model'
import { rosterToday } from '../engine/roster'

const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v },
  keys: () => Object.keys(mem),
}
const signInAs = (name: string, pass = 'x') => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }
const UNIT_KEY = /_(unit|place|unitplace|grant|home):/
const unitKeys = () => Object.keys(mem).filter(k => UNIT_KEY.test(k))
const csOf = (cs: string) => Object.keys(PEOPLE).find(k => (PEOPLE as any)[k].cs === cs)
const drop = (...css: string[]) => { for (const cs of css) { const id = csOf(cs); if (id) delete (PEOPLE as any)[id]; delete (ID_BY_CS as any)[cs.toLowerCase()] } }
/* a plain admin — not the master: Saber (ad) adds pike as an admin, and pike signs in with any password */
const plainAdmin = () => { signInAs('ad', 'a'); expect(addAccount('pike@mail', 'pike', 'admin')).toBe(null); signInAs('pike@mail') }

beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  drop('Blaze', 'Gecko')
  setUnitSeeds(true)
  initStore()
  resetSession(null)
  _resetTimeline()
  installGlobalUndo()
})
afterEach(() => { setSession(null); resetSession(null); setUnitSeeds(true); _resetTimeline() })
afterAll(() => { storeBackend.impl = null; drop('Blaze', 'Gecko') })

describe('the GMT label — worked out by Intl for the date, never stored', () => {
  it('Perth is GMT+8; a half-hour zone and summer time read right', () => {
    expect(gmtLabel('Australia/Perth', '2026-11-17')).toBe('GMT+8')
    expect(gmtLabel('Asia/Kolkata', '2026-11-17')).toBe('GMT+5:30')
    expect(gmtLabel('Europe/London', '2026-07-01')).toBe('GMT+1')
    expect(gmtLabel('Europe/London', '2026-01-15')).toBe('GMT+0')
    expect(gmtLabel('America/New_York', '2026-01-15')).toBe('GMT-5')
  })
  it('a time zone is one Intl knows', () => {
    expect(validTz('Australia/Perth')).toBe(true)
    expect(validTz('Mars/Base')).toBe(false)
    expect(validTz('')).toBe(false)
    expect(gmtLabel('Mars/Base', '2026-11-17')).toBe('')
  })
})

describe('the seeds — read with no rows, never written at load', () => {
  it('142 and 149 at Home base (Perth), both from a far-past date; nothing stored', () => {
    expect(units().map(u => u.id)).toEqual(['u142', 'u149'])
    expect(unitById('u149')).toEqual({ id: 'u149', num: '149', kind: 'sqn' })
    expect(places()).toEqual([{ id: 'p1', name: 'Home base', tz: 'Australia/Perth' }])
    expect(placeOfOn('u142', '2001-03-04')?.tz).toBe('Australia/Perth')
    expect(placeOfOn('u149', todayIso())?.name).toBe('Home base')
    expect(unitKeys()).toEqual([])
  })
  it('on the demo a person with no home row is at 142; on a shared store, nowhere', () => {
    expect(homeOn('bane', rosterToday())).toBe('u142')
    setUnitSeeds(false)
    expect(homeOn('bane', rosterToday())).toBe(null)
    expect(units()).toEqual([])
  })
  it('a stored row of the same id wins over the seed', () => {
    mem['sqn142_unit:u149'] = JSON.stringify({ id: 'u149', num: '150', kind: 'sqn' })
    unitsLoad()
    expect(unitById('u149')!.num).toBe('150')
    expect(units().length).toBe(2)
  })
  it('a row that cannot be trusted is read as nothing', () => {
    mem['sqn142_unit:u9'] = JSON.stringify({ id: 'u-9', num: '9', kind: 'sqn' })
    mem['sqn142_place:p9'] = JSON.stringify({ id: 'p9', name: 'Nowhere', tz: 'Mars/Base' })
    unitsLoad()
    expect(units().map(u => u.id)).toEqual(['u142', 'u149'])
    expect(places().length).toBe(1)
  })
})

describe('levelIn — master, home, grant, none', () => {
  it('the master is admin in every unit', () => {
    expect(isMasterAccount('acad')).toBe(true)
    expect(levelIn('acad', 'u142', rosterToday())).toBe('admin')
    expect(levelIn('acad', 'u149', rosterToday())).toBe('admin')
  })
  it('in his home unit an account is its own role; elsewhere its grant; otherwise none', () => {
    expect(isMasterAccount('acus')).toBe(false)
    expect(levelIn('acus', 'u142', rosterToday())).toBe('member')
    expect(levelIn('acus', 'u149', rosterToday())).toBe(null)
    signInAs('ad', 'a')
    expect(setGrant('acus', 'u149', 'view', 'bane').ok).toBe(true)
    expect(grantsOf('acus')).toMatchObject([{ account: 'acus', unit: 'u149', level: 'view' }])
    expect(levelIn('acus', 'u149', rosterToday())).toBe('view')
    expect(levelIn('nobody', 'u142', rosterToday())).toBe(null)
  })
  it('a grant is never in the account\'s own home unit — his role there is on his account', () => {
    signInAs('ad', 'a')
    const r = setGrant('acus', 'u142', 'admin', 'bane')
    expect(r.ok).toBe(false)
    expect(grantsOf('acus')).toEqual([])
  })
})

describe('a new person gets his home inside the command that makes him (D2094)', () => {
  it('person.add — the adder\'s home unit, from today, in the same command', () => {
    signInAs('ad', 'a')
    expect(addRosterPerson({ cs: 'Gecko', ini: '', seat: 'FCP', cat: 'OCU' })).toBe(null)
    const pid = csOf('Gecko')!
    const homes = unitKeys().filter(k => k.includes('_home:')).map(k => JSON.parse(mem[k]!))
    expect(homes).toMatchObject([{ pid, unit: 'u142', from: todayIso() }])
  })
  it('account.addNew — the same, beside his account', () => {
    signInAs('ad', 'a')
    expect(addPersonAndAccount('blaze@mail', { cs: 'Blaze', ini: 'rtk', seat: 'RCP', cat: 'D' }, 'main')).toBe(null)
    const pid = csOf('Blaze')!
    expect(homeOn(pid, rosterToday())).toBe('u142')
    expect(unitKeys().filter(k => k.includes('_home:')).map(k => JSON.parse(mem[k]!))).toMatchObject([{ pid, unit: 'u142' }])
    expect(levelIn(accountByName('blaze@mail')!.id, 'u142', rosterToday())).toBe('member')
  })
  it('an adder whose home is 149 puts the new man in 149', () => {
    /* Kestrel, 149's admin (a move of Saber's own home counts from tomorrow since the full check of 18 Nov 26 — D2119 —
       so it no longer makes him 149's today) */
    signInAs('ad9', 'a9')
    expect(addRosterPerson({ cs: 'Gecko', ini: '', seat: 'FCP', cat: 'OCU' })).toBe(null)
    expect(homeOn(csOf('Gecko')!, rosterToday())).toBe('u149')
  })
})

describe('the master-only commands', () => {
  it('a member and a plain admin are refused unit.add and account.master', () => {
    signInAs('us', 'us')
    expect(addUnit('150', 'p1', 'acad9' /* a first admin named, so master-only is what refuses — §9.2 */).ok).toBe(false)
    expect(setMaster('acad', false).ok).toBe(false)
    plainAdmin()
    expect(addUnit('150', 'p1', 'acad9' /* a first admin named, so master-only is what refuses — §9.2 */).ok).toBe(false)
    expect(units().length).toBe(2)
    expect(setMaster(accountByName('pike@mail')!.id, true).ok).toBe(false)
    expect(isMasterAccount(accountByName('pike@mail')!.id)).toBe(false)
  })
  it('the master adds a unit at a place, naming its first admin', () => {
    signInAs('ad', 'a')
    /* (§9.2 of the reshape plan — setup only: the first admin is an admin's sign-in, Hunter's, since Plan is an admin's —
       the Plan audit's PA2, D2201; it named Ranger's, a member's) */
    const r = addUnit('150', 'p1', 'acad2')
    expect(r.ok).toBe(true)
    expect(unitById(r.id!)).toMatchObject({ num: '150', kind: 'sqn' })
    expect(placeOfOn(r.id!, todayIso())?.id).toBe('p1')
    expect(levelIn('acad2', r.id!, rosterToday())).toBe('admin')
    expect(addUnit('150', 'p1').ok).toBe(false)   // one squadron per number
  })
  it('a master cannot drop his own mark, and one master is always left', () => {
    signInAs('ad', 'a')
    expect(setMaster('acad', false).ok).toBe(false)
    expect(isMasterAccount('acad')).toBe(true)
    expect(addAccount('pike@mail', 'pike', 'admin')).toBe(null)
    const pike = accountByName('pike@mail')!.id
    expect(setMaster(pike, true).ok).toBe(true)
    expect(isMasterAccount(pike)).toBe(true)
    signInAs('pike@mail')
    expect(setMaster('acad', false).ok).toBe(true)   // pike is now the one master left
    expect(setMaster(pike, false).ok).toBe(false)     // his own — never
    expect([isMasterAccount('acad'), isMasterAccount(pike)]).toEqual([false, true])
  })
  it('a change of the mark inside any other command is refused at the commit gate', () => {
    plainAdmin()
    const forged = commitSettingsIntent('account.update', null, () => {
      store.set('account:acad', { id: 'acad', name: 'ad', role: 'admin', pid: 'stiff', on: true })
    })
    expect(forged).toMatchObject({ ok: false })
    expect(isMasterAccount('acad')).toBe(true)
    signInAs('ad', 'a')
    const own = commitSettingsIntent('account.update', null, () => {
      store.set('account:acus', { id: 'acus', name: 'us', role: 'main', pid: 'bane', on: true, master: true })
    })
    expect(own).toMatchObject({ ok: false })
    expect(isMasterAccount('acus')).toBe(false)
  })
  /* since his D2205 (18 Nov 26 — "only a master admin changes a master's account") the editor here is a second master:
     a plain admin's rename of Saber is now refused (state/units-sqn-fixread2.test.ts, security H4); the point is unchanged
     — a change of something else keeps the mark */
  it('the account editor keeps the mark when it changes something else', () => {
    plainAdmin()
    const pike = accountByName('pike@mail')!.id
    signInAs('ad', 'a')
    expect(setMaster(pike, true).ok).toBe(true)
    signInAs('pike@mail')
    expect(updateAccount('acad', { name: 'saber2' })).toBe(null)
    expect(accountById('acad')).toMatchObject({ name: 'saber2', master: true })
    expect(JSON.parse(mem['sqn142_account:acad']!)).toMatchObject({ master: true })
  })
})

describe('a right in a unit is given only by an admin OF that unit (read from the row)', () => {
  it('an admin of 142 is refused a grant on 149, and allowed one on 142', () => {
    /* the 149 man is Osprey, seeded at 149 (a move made here would count from tomorrow — D2119, the full check) */
    plainAdmin()
    const no = setGrant('acus', 'u149', 'view', 'bane')
    expect(no.ok).toBe(false)
    expect(grantsOf('acus')).toEqual([])
    const self = setGrant(accountByName('pike@mail')!.id, 'u149', 'admin', 'pike')
    expect(self.ok).toBe(false)                         // never by the right the command itself gives
    expect(setGrant('acus9', 'u142', 'view', 'osp9').ok).toBe(true)
    expect(levelIn('acus9', 'u142', rosterToday())).toBe('view')
    /* (§9.3 of the reshape plan — rewritten to the ruling: Plan is a master admin's to give, D2199, D2211 — the Plan
       audit's PA1; this pinned a plain admin giving it, written a day before D2199. RE-POINTED AT U2 — his D2626: 142's
       own admin (Pike) may give Plan of 142 now, so the refusal here is the other rule, Plan is for an admin (PA2 —
       D2201, D785): Osprey is a member, in the generic words, as before for a member) */
    expect(setGrant('acus9', 'u142', 'admin', 'osp9')).toMatchObject({ ok: false, message: 'This change could not be saved.' })
    expect(levelIn('acus9', 'u142', rosterToday())).toBe('view')
    expect(removeGrant('acus9', 'u142').ok).toBe(true)
    expect(levelIn('acus9', 'u142', rosterToday())).toBe(null)
  })
  it('a member gives no right and moves no unit', () => {
    signInAs('us', 'us')
    expect(setGrant('acoutlaw', 'u149', 'view', 'casper').ok).toBe(false)
    expect(moveUnit('u142', 'p1').ok).toBe(false)
    expect(setPlace({ name: 'Second base', tz: 'Asia/Singapore' }).ok).toBe(false)
  })
  it('an admin moves his own unit from tomorrow, and not another\'s', () => {
    signInAs('ad', 'a')
    const p = setPlace({ name: 'Second base', tz: 'Asia/Singapore' })
    expect(p.ok).toBe(true)
    plainAdmin()
    expect(moveUnit('u149', p.id!).ok).toBe(false)
    expect(moveUnit('u142', p.id!).ok).toBe(true)
    expect(placeOfOn('u142', todayIso())?.id).toBe('p1')               // today is unchanged (D2119)
    expect(placeOfOn('u142', moveFrom(todayIso()))?.id).toBe(p.id)      // from tomorrow
    expect(placeOfOn('u142', '2001-01-01')?.id).toBe('p1')              // the history is kept
  })
})

describe('the rows are written only by their commands', () => {
  it('a raw store.set of a unit row is refused', () => {
    signInAs('ad', 'a')
    expect(() => store.set('unit:u9', { id: 'u9', num: '9', kind: 'sqn' })).toThrow()
    expect(() => store.set('grant:g1', { id: 'g1', account: 'acus', unit: 'u149', level: 'admin' })).toThrow()
    expect(unitKeys()).toEqual([])
  })
  it('Undo of a grant puts it back as it was', () => {
    signInAs('ad', 'a')
    expect(setGrant('acus', 'u149', 'view', 'bane').ok).toBe(true)
    expect(levelIn('acus', 'u149', rosterToday())).toBe('view')
    expect(globalUndo().ok).toBe(true)
    expect(levelIn('acus', 'u149', rosterToday())).toBe(null)
    expect(grantsOf('acus')).toEqual([])
  })
})
