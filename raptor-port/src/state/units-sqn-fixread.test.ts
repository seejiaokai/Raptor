// @vitest-environment jsdom
/* THE FIX READ OF THE FULL CHECK (multi-squadron batch 1, 18 Nov 26): Astra's and a fresh Opus reader's blind reads of the
   full check's twelve fixes, each claim reproduced here red first before its fix. A man, his account and his home stay his
   own squadron's admins' (D2191); never a squadron left with no admin (D2184 Q10); a move counts from tomorrow (D2119); a
   master is never deleted (the master mark changes only by its own command — D2191). The write path says it in words; the
   commit gate (perms.ts sections 6 and 8) holds it for every door, a forged command included. */
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, store } from '../engine/hooks'
import { initStore, resetSession, notify } from './store'
import { signIn, sessionFor, updateAccount, accountById, accountsLoad, seedAccounts, deleteAccountProblem } from './accounts'
import { setSession } from './auth'
import { installGlobalUndo } from './undo-wire'
import { _resetTimeline, globalUndo, globalRedo } from '../undo/timeline'
import { ELOG, elogFlush, logAction } from '../engine/editlog'
import { UNIT } from '../engine/unitview'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { updatePersonField } from './quals-write'
import { setUnitSeeds, setHome, homeOn, todayIso, unitsLoad, unitRows } from './units'
import { moveFrom } from './units-model'
import { addDays } from './flyplan-model'
import { commitSettingsIntent } from './people-settings-commit'
import { isNewToMe, markSeen, changesLoad } from './changes'
import { switchUnit } from './store'
import { rosterToday } from '../engine/roster'

const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v },
  keys: () => Object.keys(mem),
}
const signInAs = (name: string, pass: string) => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }

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

describe('Opus 1 — a master is never deleted, said first', () => {
  it("Admin → Users' Delete of Saber, by 142's plain admin: the words say he is a master admin", () => {
    signInAs('ad2', 'a2')
    expect(deleteAccountProblem('stiff')).toBe("Saber is a master admin, so he can't be deleted")
  })
})

describe('Astra 1 — the first write of the account list cannot drop another squadron’s account unseen', () => {
  it("142's plain admin's forged first write without Osprey's account is refused; Osprey's account stays", () => {
    signInAs('ad2', 'a2')
    const r = commitSettingsIntent('account.update', null, () => {
      for (const a of seedAccounts()) if (a.id !== 'acus9') store.set(`account:${a.id}`, a)
    })
    accountsLoad()
    expect(r).toMatchObject({ ok: false, message: expect.stringMatching(/another squadron \(u149\)/) })
    expect(accountById('acus9')).toBeTruthy()
  })
  it('…while his own first write, dropping nothing, goes through (no seeded row read as changed)', () => {
    signInAs('ad2', 'a2')
    expect(updateAccount('acus', { name: 'ranger2' })).toBe(null)
    expect(accountById('acus')!.name).toBe('ranger2')
    expect(accountById('acus9')).toBeTruthy()
  })
})

describe('Astra 5, Opus 2 and 6 — a home row is judged day by day, against the squadron he leaves on each', () => {
  const forge = (id: string, row: any) => { const r = commitSettingsIntent('home.set', null, () => { store.set('home:' + id, row) }) as any; unitsLoad(); return r }
  afterEach(() => { vi.useRealTimers() })
  it("Astra 5: a forged first row dated tomorrow cannot move Ranger today (his first row reaches back)", () => {
    signInAs('ad', 'a')
    expect(homeOn('bane', todayIso())).toBe('u142')
    const r = forge('hfuture', { id: 'hfuture', pid: 'bane', unit: 'u149', from: moveFrom(todayIso()) })
    expect(r).toMatchObject({ ok: false, message: expect.stringMatching(/already begun/) })
    expect(homeOn('bane', todayIso())).toBe('u142')
  })
  it("F1: 142's plain admin cannot rewrite the days a man spent in 149", () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 1, 9, 0, 0))                       // 1 Oct 26
    signInAs('ad', 'a')
    expect(setHome('osp9', 'u142').ok).toBe(true)                          // the master moves Osprey to 142 from 2 Oct
    vi.setSystemTime(new Date(2026, 10, 1, 9, 0, 0))                      // 1 Nov 26
    expect(homeOn('osp9', '2026-09-15')).toBe('u149')
    signInAs('ad2', 'a2')
    const r = forge('hzzpast', { id: 'hzzpast', pid: 'osp9', unit: 'u142', from: '2026-09-01' })
    expect(r).toMatchObject({ ok: false })
    expect(homeOn('osp9', '2026-09-15')).toBe('u149')
  })
  it("F2 and F2b: 142's plain admin cannot take back from 149 a man the master has moved there, nor cancel the move", () => {
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)                          // Ranger: 149's from tomorrow
    const t1 = moveFrom(todayIso()), t2 = addDays(t1, 1)
    signInAs('ad2', 'a2')
    expect(forge('hzzback', { id: 'hzzback', pid: 'bane', unit: 'u142', from: t2 })).toMatchObject({ ok: false, message: expect.stringMatching(/u149/) })
    expect(forge('hzzzzz', { id: 'hzzzzz', pid: 'bane', unit: 'u142', from: t1 })).toMatchObject({ ok: false, message: expect.stringMatching(/u149/) })
    expect(homeOn('bane', t1)).toBe('u149')
    expect(homeOn('bane', t2)).toBe('u149')
  })
  it("…while the master, an admin of both, may hand him back from a later date, and his ordinary moves still go through", () => {
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)
    const t2 = addDays(moveFrom(todayIso()), 1)
    expect(forge('hback2', { id: 'hback2', pid: 'bane', unit: 'u142', from: t2 })).toMatchObject({ ok: true })
    expect(homeOn('bane', t2)).toBe('u142')
    expect(setHome('her9', 'u142').ok).toBe(true)
  })
  it('Opus 6: on a shared store the master places a man with no squadron from today', () => {
    /* the seeded squadrons, written down as a shared store holds them; his home row none */
    const seeded = unitRows()
    for (const u of seeded.units) mem['sqn142_unit:' + u.id] = JSON.stringify(u)
    for (const p of seeded.places) mem['sqn142_place:' + p.id] = JSON.stringify(p)
    for (const x of seeded.unitplaces) mem['sqn142_unitplace:' + x.id] = JSON.stringify(x)
    for (const h of seeded.homes) mem['sqn142_home:' + h.id] = JSON.stringify(h)
    setUnitSeeds(false); unitsLoad()
    expect(homeOn('rocky', rosterToday())).toBe(null)
    signInAs('ad', 'a')
    expect(setHome('rocky', 'u142')).toMatchObject({ ok: true })
    expect(homeOn('rocky', todayIso())).toBe('u142')
  })
})

describe('Astra 2 — the last-admin lock per squadron holds at the commit gate', () => {
  it("even the master's forged update switching Kestrel (149's only admin) off is refused", () => {
    signInAs('ad', 'a')
    expect(updateAccount('acus9', { name: 'osprey9' })).toBe(null)   // the list stored first, an ordinary change
    const a = { ...accountById('acad9')! }
    const r = commitSettingsIntent('account.update', null, () => { store.set('account:acad9', { ...a, on: false }) })
    accountsLoad()
    expect(r).toMatchObject({ ok: false, message: expect.stringMatching(/u149.*no admin/) })
    expect(accountById('acad9')!.on).toBe(true)
  })
  it('…and demoting him the same; making a second 149 admin first lets him go', () => {
    signInAs('ad', 'a')
    expect(updateAccount('acus9', { name: 'osprey9' })).toBe(null)
    const a = { ...accountById('acad9')! }
    expect(commitSettingsIntent('account.update', null, () => { store.set('account:acad9', { ...a, role: 'main' }) })).toMatchObject({ ok: false, message: expect.stringMatching(/u149/) })
    expect(updateAccount('acus9', { role: 'admin' })).toBe(null)
    expect(updateAccount('acad9', { on: false })).toBe(null)
    expect(accountById('acad9')!.on).toBe(false)
  })
})

describe('Astra 3 and 4, Opus 3 — whose history a line is filed in', () => {
  const saved = () => store.keys('elog:').map(k => store.get(k, null)).filter(Boolean) as any[]
  it("a mission-role line made on 149's schedule is 149's line (its `sub` is a formation's row id, never a man)", () => {
    signInAs('ad9', 'a9')
    expect(UNIT).toBe('u149')
    let rid = ''
    for (const d of DAYS as any[]) for (const w of d?.waves || []) for (const f of w?.formations || []) if (!rid && f?.rid) rid = String(f.rid)
    expect(rid).not.toBe('')
    /* the `at` state/changelines.ts builds for an insights.role change */
    logAction(null, 'Line · mission role · test-mr', { date: '2026-07-13', sect: 'day', sub: rid, fld: 'mission-role', from: 'Unresolved', to: 'Blue' })
    elogFlush()
    expect(saved().find(l => String(l.lbl).includes('test-mr'))?.u).toBe('u149')
    expect(ELOG.rows.some(r => r.lbl.includes('test-mr')), "in 149's changes window").toBe(true)
  })
  it("the Undo and Redo of the master's change to a 149 man, made from 142's view, are 149's lines, as the change is", () => {
    signInAs('ad', 'a')
    expect(UNIT).toBe('u142')
    const q0 = (PEOPLE as any).osp9.q
    expect(updatePersonField('osp9', { cat: 'OCU' })).toBe(null)
    elogFlush()
    expect(globalUndo()).toMatchObject({ ok: true })
    elogFlush()
    expect((PEOPLE as any).osp9.q).toBe(q0)
    expect(globalRedo()).toMatchObject({ ok: true })
    elogFlush()
    const lines = saved().filter(l => /^(Undo|Redo)/.test(String(l.lbl)))
    expect(lines.length).toBe(2)
    expect(lines.map(l => l.u)).toEqual(['u149', 'u149'])
    expect(ELOG.rows.some(r => /^(Undo|Redo)/.test(r.lbl)), "none in 142's window").toBe(false)
  })
})

describe('Astra 6 — what is new to a man is kept per squadron', () => {
  afterEach(() => { vi.useRealTimers() })
  it("marking 142's lines seen leaves an older 149 line nobody marked still new to him", () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 18, 7, 0, 0))
    signInAs('ad9', 'a9')
    logAction(null, '149 unread probe', { date: '2026-07-13', sect: 'day' })
    elogFlush()
    vi.setSystemTime(new Date(2026, 10, 18, 7, 5, 0))
    signInAs('ad2', 'a2')
    logAction(null, '142 read probe', { date: '2026-07-13', sect: 'day' })
    elogFlush()
    vi.setSystemTime(new Date(2026, 10, 18, 7, 10, 0))
    signInAs('ad', 'a')
    expect(UNIT).toBe('u142')
    const l142 = ELOG.rows.find(r => r.lbl === '142 read probe')!
    expect(isNewToMe(l142)).toBe(true)
    expect(markSeen(ELOG.rows)).toBe(true)
    expect(isNewToMe(l142)).toBe(false)
    switchUnit('u149')
    const l149 = ELOG.rows.find(r => r.lbl === '149 unread probe')!
    expect(l149, "in 149's changes window").toBeTruthy()
    expect(isNewToMe(l149), 'still new to Saber in 149').toBe(true)
    /* marking it there keeps 142's mark: back in 142 nothing is new again */
    expect(markSeen(ELOG.rows)).toBe(true)
    expect(isNewToMe(l149)).toBe(false)
    switchUnit('u142')
    expect(isNewToMe(ELOG.rows.find(r => r.lbl === '142 read probe')!)).toBe(false)
    /* and it is his row, kept: read again from the store */
    changesLoad()
    expect(isNewToMe(ELOG.rows.find(r => r.lbl === '142 read probe')!)).toBe(false)
  })
  it('a row in the old shape reads as every squadron’s until that squadron is marked', () => {
    signInAs('ad9', 'a9')
    logAction(null, 'old-shape probe', { date: '2026-07-13', sect: 'day' })
    elogFlush()
    signInAs('ad', 'a')
    store.set('seen:stiff', { upto: { at: Date.now() + 60_000, lineId: 'zz.1' }, extra: [] })
    changesLoad()
    switchUnit('u149')
    const l = ELOG.rows.find(r => r.lbl === 'old-shape probe')!
    expect(isNewToMe(l)).toBe(false)                         // his old mark covers 149's line
    expect(isNewToMe(l, 'prowler')).toBe(true)               // a man with no row: new
  })
})
