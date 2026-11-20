// @vitest-environment jsdom
/* REPRO R4 — a move that keeps old View/Plan (fable F3, security S17-3, astra 1, core-read astra, core security shape 4).
   Correct (D2203: when a man moves squadron every View and Plan he holds of others is cleared; old rights never follow
   him): either the forged command is refused, or on the day he is the new squadron's he holds no old right.
   RED while the claim holds. Harness: units-sqn-fixread16.test.ts, copied. */
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, store } from '../engine/hooks'
import { initStore, resetSession, notify } from '../state/store'
import { signIn, sessionFor, accountsLoad, levelIn } from '../state/accounts'
import { setSession } from '../state/auth'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { setUnitSeeds, setGrant, homeOn, unitsLoad, addUnit, todayIso } from '../state/units'
import { HOME_PFX } from '../state/units-model'
import { commitSettingsIntent } from '../state/people-settings-commit'

const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v },
  keys: () => Object.keys(mem),
}
const signInAs = (name: string, pass: string) => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }
const on = (d: number) => { vi.setSystemTime(new Date(2026, 6, d, 9, 0, 0)); unitsLoad() }

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  setUnitSeeds(true); initStore(); accountsLoad(); resetSession(null); _resetTimeline(); installGlobalUndo()
})
afterEach(() => { setSession(null); resetSession(null); _resetTimeline(); vi.useRealTimers() })
afterAll(() => { storeBackend.impl = null })

const forgedMove = (to: string, from: string) => commitSettingsIntent('home.set', null, () => {
  store.set(HOME_PFX + 'hx0', { id: 'hx0', pid: 'bane', unit: 'u142', from: todayIso() })
  store.set(HOME_PFX + 'hx1', { id: 'hx1', pid: 'bane', unit: to, from })
}) as any

describe('R4 — no old right outlives a move', () => {
  it('(a, fable F3) Hunter forges a move dated 17 Jul (past tomorrow); Saber gives View of 150 on the 15th; on the 17th it is gone', () => {
    signInAs('ad', 'a')
    const u150 = addUnit('150', 'p1', 'acad9' /* a bystander first admin — §9.2, Piece C */).id!
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    signInAs('ad2', 'a2')
    const r = forgedMove('u149', '2026-07-17')
    unitsLoad()
    signInAs('ad', 'a')
    const g = setGrant('acus', u150, 'view', 'bane')
    on(17)
    const kept = r.ok && g.ok && homeOn('bane') === 'u149' && levelIn('acus', u150) != null
    expect(kept, `forged ${JSON.stringify(r)}, grant ${JSON.stringify(g)}, view on 17th ${levelIn('acus', u150)}`).toBe(false)
  })
  it('(b, security S17-3) master forges a move dated 20 Jul; View of 150 given on the 16th; on the 20th it is gone', () => {
    signInAs('ad', 'a')
    const u150 = addUnit('150', 'p1', 'acad9' /* a bystander first admin — §9.2, Piece C */).id!
    const r = forgedMove('u149', '2026-07-20')
    on(16)
    const g = setGrant('acus', u150, 'view', 'bane')
    on(20)
    const kept = r.ok && g.ok && homeOn('bane') === 'u149' && levelIn('acus', u150) != null
    expect(kept, `forged ${JSON.stringify(r)}, grant ${JSON.stringify(g)}, view on 20th ${levelIn('acus', u150)}`).toBe(false)
  })
  it('(c, astra 1) Hunter forges a tomorrow-dated move without dropping Ranger\'s View of 150: refused, or the View gone on the 16th', () => {
    signInAs('ad', 'a')
    const u150 = addUnit('150', 'p1', 'acad9' /* a bystander first admin — §9.2, Piece C */).id!
    expect(setGrant('acus', u150, 'view', 'bane').ok).toBe(true)
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    signInAs('ad2', 'a2')
    const r = forgedMove('u149', '2026-07-16')
    on(16)
    const kept = r.ok && homeOn('bane') === 'u149' && levelIn('acus', u150) != null
    expect(kept, `forged ${JSON.stringify(r)}, view on 16th ${levelIn('acus', u150)}`).toBe(false)
  })
  it('(d, core astra) the master forges a tomorrow-dated move to a new squadron, Ranger\'s View of 149 left standing', () => {
    signInAs('ad', 'a')
    const u777 = addUnit('777', 'p1', 'acad9' /* a bystander first admin — §9.2, Piece C */).id!
    expect(setGrant('acus', 'u149', 'view', 'bane').ok).toBe(true)
    const r = forgedMove(u777, '2026-07-16')
    on(16)
    const kept = r.ok && homeOn('bane') === u777 && levelIn('acus', 'u149') != null
    expect(kept, `forged ${JSON.stringify(r)}, view of 149 on 16th ${levelIn('acus', 'u149')}`).toBe(false)
  })
})
