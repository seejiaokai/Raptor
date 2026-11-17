// @vitest-environment jsdom
/* A MAN, HIS ACCOUNT AND HIS HOME ARE HIS OWN SQUADRON'S ADMINS' (the full check of multi-squadron batch 1, 18 Nov 26).
   Red first: each case below was a failing proof in the blind reads' own copies of the branch (the security read's
   cross-sqn-accounts, cross-sqn-people, master-delete; the Opus read's account-cross and home-cross) and the host's own
   find (approving a request for a man already on the roster moved him into the approving admin's squadron). D2191: a
   man of the other squadron is given View, nothing else of his row changeable; D2184 Q10: never a squadron left with no
   admin; D2119: a move counts from tomorrow. The write path says it in words; the commit gate (perms.ts sections 6 and 8)
   holds it for every door — a forged command included. */
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { storeBackend, store } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { initStore, resetSession, notify } from './store'
import {
  signIn, sessionFor, updateAccount, accountById, addAccount, accountsLoad, accountByName, levelIn, approveRequest,
  requestAccess, approveRequestNew, deleteAccountProblem,
} from './accounts'
import { setSession } from './auth'
import { installGlobalUndo } from './undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { setUnitSeeds, setHome, homeOn, todayIso, unitRows } from './units'
import { moveFrom } from './units-model'
import { updatePersonField } from './quals-write'
import { deletePerson } from './person-delete'
import { mayEditQualsOf } from './perms'
import { commitSettingsIntent } from './people-settings-commit'

const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v },
  keys: () => Object.keys(mem),
}
const signInAs = (name: string, pass: string) => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }
const tomorrow = () => moveFrom(todayIso())

beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  setUnitSeeds(true)
  initStore()
  accountsLoad()
  resetSession(null)
  _resetTimeline()
  installGlobalUndo()
})
afterEach(() => { setSession(null); resetSession(null); _resetTimeline() })
afterAll(() => { storeBackend.impl = null })

describe("another squadron's accounts — refused, with the reason", () => {
  it("142's plain admin (Prowler) cannot demote, switch off or raise 149's men", () => {
    signInAs('ad2', 'a2')
    expect(updateAccount('acad9', { role: 'main' })).toMatch(/149/)
    expect(updateAccount('acad9', { on: false })).toMatch(/149/)
    expect(updateAccount('acus9', { role: 'admin' })).toMatch(/149/)
    expect(accountById('acad9')).toMatchObject({ role: 'admin', on: true })
    expect(levelIn('acus9', 'u149')).toBe('member')
  })
  it("…nor add an account for a 149 man", () => {
    signInAs('ad2', 'a2')
    expect(addAccount('evil@mail', 'mer9', 'admin')).toMatch(/149/)
    expect(accountByName('evil@mail')).toBeFalsy()
  })
  it("149's admin (Kestrel) cannot make 142's member an admin of 142", () => {
    signInAs('ad9', 'a9')
    expect(updateAccount('acus', { role: 'admin' })).toMatch(/142/)
    expect(accountById('acus')!.role).toBe('main')
  })
  it("a forged write of a 142 admin's OWN account onto a 149 man is refused (the fix's blind read, F1)", () => {
    signInAs('ad2', 'a2')
    expect(levelIn('acad2', 'u149')).toBe(null)
    expect(updateAccount('acus', { name: 'us2' })).toBe(null)   // the list stored first, an ordinary 142 change
    const was = JSON.stringify(accountById('acad2'))
    const r = commitSettingsIntent('account.update', null, () => {
      store.set('account:acad2', { ...JSON.parse(was), pid: 'mer9' })
    })
    accountsLoad()
    expect(r).toMatchObject({ ok: false })
    expect(levelIn('acad2', 'u149')).toBe(null)
  })
  it('the master is an admin of every squadron: Saber changes a 149 account', () => {
    signInAs('ad', 'a')
    expect(updateAccount('acus9', { name: 'osprey9' })).toBe(null)
    expect(accountById('acus9')!.name).toBe('osprey9')
  })
  it('the commit gate refuses a forged 149 account write by a 142 admin', () => {
    signInAs('ad2', 'a2')
    const was = JSON.stringify(accountById('acus9'))
    const r = commitSettingsIntent('account.update', null, () => {
      store.set('account:acus9', { ...JSON.parse(was), role: 'admin' })
    })
    expect(r).toMatchObject({ ok: false })
    expect(accountById('acus9')!.role).toBe('main')
  })
})

describe("a squadron's last admin (D2184 Q10)", () => {
  it("not even the master leaves 149 with no admin of its own — the reason names him", () => {
    signInAs('ad', 'a')
    expect(updateAccount('acad9', { role: 'main' })).toBe("Kestrel is 149's last admin. Make another admin of 149 first.")
    expect(updateAccount('acad9', { on: false })).toMatch(/149's last admin/)
    expect(deleteAccountProblem('kes9')).toMatch(/149's last admin/)
  })
  it('once 149 has a second admin, the first may go', () => {
    signInAs('ad', 'a')
    expect(updateAccount('acus9', { role: 'admin' })).toBe(null)
    expect(updateAccount('acad9', { role: 'main' })).toBe(null)
  })
})

describe("another squadron's people", () => {
  it("142's plain admin may not edit a 149 man's Quals row, rename him, re-category or delete him", () => {
    signInAs('ad2', 'a2')
    expect(mayEditQualsOf('osp9')).toBe(false)
    expect(mayEditQualsOf('bane')).toBe(true)
    expect(updatePersonField('osp9', { callsign: 'Pigeon' })).not.toBe(null)
    expect((PEOPLE as any).osp9.cs).toBe('Osprey')
    const q = (PEOPLE as any).har9.q
    expect(updatePersonField('har9', { cat: 'OCU' })).not.toBe(null)
    expect((PEOPLE as any).har9.q).toBe(q)
    expect(deletePerson('gan9')).not.toBe(null)
    expect(!!(PEOPLE as any).gan9?.deleted).toBe(false)
  })
  it("149's own admin still edits his own men", () => {
    signInAs('ad9', 'a9')
    expect(mayEditQualsOf('osp9')).toBe(true)
    expect(updatePersonField('osp9', { callsign: 'Pigeon' })).toBe(null)
    expect((PEOPLE as any).osp9.cs).toBe('Pigeon')
    expect(updatePersonField('osp9', { callsign: 'Osprey' })).toBe(null)
  })
})

describe('home.set — the squadron he leaves, and never today', () => {
  it("142's plain admin cannot pull 149's men into 142", () => {
    signInAs('ad2', 'a2')
    expect(setHome('osp9', 'u142').ok).toBe(false)
    expect(setHome('kes9', 'u142').ok).toBe(false)
    expect(homeOn('osp9', tomorrow())).toBe('u149')
  })
  it("149's plain admin cannot take a 142 man into 149", () => {
    signInAs('ad9', 'a9')
    expect(homeOn('prowler')).toBe('u142')
    expect(setHome('prowler', 'u149').ok).toBe(false)
    expect(homeOn('prowler', tomorrow())).toBe('u142')
  })
  it("the master moves a 142 man with no home row — from tomorrow, today untouched", () => {
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)
    expect(homeOn('bane', todayIso())).toBe('u142')
    expect(homeOn('bane', tomorrow())).toBe('u149')
  })
  it('the gate refuses a forged home row from today for a man who has a squadron', () => {
    signInAs('ad', 'a')
    const r = commitSettingsIntent('home.set', null, () => {
      store.set('home:hforged', { id: 'hforged', pid: 'bane', unit: 'u149', from: todayIso() })
    })
    expect(r).toMatchObject({ ok: false })
    expect(homeOn('bane', todayIso())).toBe('u142')
  })
})

describe('approving a request', () => {
  it("linked to a man already on the roster, he keeps his squadron — no home is written", () => {
    signInAs('n@mail', 'x')
    expect(requestAccess({ cs: 'Newbie', ini: 'NB', seat: 'FCP', cat: 'C' })).toBe(null)
    signInAs('ad9', 'a9')
    const homesBefore = unitRows().homes.length
    const req = Object.keys(mem).find(k => k.includes('accessreq:'))
    expect(req).toBeTruthy()
    const rid = JSON.parse(mem[req!]!).id
    expect(approveRequest(rid, 'mer9', 'main')).toBe(null)
    expect(unitRows().homes.length).toBe(homesBefore)
    expect(homeOn('mer9', todayIso())).toBe('u149')
  })
  it("a NEW man approved by 149's admin is 149's", () => {
    signInAs('n2@mail', 'x')
    expect(requestAccess({ cs: 'Newbie', ini: 'NB', seat: 'FCP', cat: 'C' })).toBe(null)
    signInAs('ad9', 'a9')
    const req = Object.keys(mem).find(k => k.includes('accessreq:'))
    const rid = JSON.parse(mem[req!]!).id
    expect(approveRequestNew(rid, { cs: 'Newbie', ini: 'NB', seat: 'FCP', cat: 'C' }, 'main')).toBe(null)
    const pid = Object.keys(PEOPLE).find(k => (PEOPLE as any)[k].cs === 'Newbie')!
    expect(homeOn(pid, todayIso())).toBe('u149')
    delete (PEOPLE as any)[pid]
  })
})

describe("the master's account and a plain admin's Delete (the security read's F6)", () => {
  it('Prowler cannot delete Saber, the one master — before or after the accounts are stored as rows', () => {
    signInAs('ad2', 'a2')
    expect(deletePerson('stiff')).not.toBe(null)
    expect(accountById('acad')).toBeTruthy()
    expect(updateAccount('acus', { name: 'us2' })).toBe(null)
    expect(deletePerson('stiff')).not.toBe(null)
    expect(accountById('acad')).toBeTruthy()
    expect(!!(PEOPLE as any).stiff?.deleted).toBe(false)
  })
})
