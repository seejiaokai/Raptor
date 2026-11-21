// @vitest-environment jsdom
/* REPRO R2 — a move then a same-day move back strips a third squadron's right from a man who never moves (fable F2,
   opus F2, security S17-1 + its one-command forged variant). Asserts the CORRECT behaviour (D2203 clears rights only
   when a man moves; D2191/D2192 a 142/149 admin cannot take away 150's right), so it is RED while the claim holds.
   Harness: units-sqn-fixread16.test.ts, copied. */
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, store } from '../engine/hooks'
import { initStore, resetSession, notify } from '../state/store'
import { signIn, sessionFor, accountsLoad, levelIn } from '../state/accounts'
import { setSession } from '../state/auth'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { setUnitSeeds, setHome, setGrant, removeGrant, homeOn, unitsLoad, addUnit, todayIso, unitRows } from '../state/units'
import { GRANT_PFX, HOME_PFX } from '../state/units-model'
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

/* Saber (master) makes 150, gives Ranger View of 150, gives Hunter Plan of 149; then signs in as Hunter */
const setup = () => {
  signInAs('ad', 'a')
  const u150 = addUnit('150', 'p1')
  expect(u150.ok).toBe(true)
  expect(setGrant('acus', u150.id!, 'view', 'bane').ok).toBe(true)
  expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
  signInAs('ad2', 'a2')
  unitsLoad()
  return u150.id!
}

describe('R2 — a man who never moves keeps a third squadron\'s right', () => {
  it('(control) Hunter cannot take Ranger\'s 150 View away bare', () => {
    const u150 = setup()
    expect(removeGrant('acus', u150).ok).toBe(false)
    unitsLoad()
    expect(levelIn('acus', u150)).toBe('view')
  })
  it('Hunter saves a move to 149 then moves him back to 142 the same day: on 16 Jul he is 142\'s and still holds View of 150', () => {
    const u150 = setup()
    expect(setHome('bane', 'u149').ok).toBe(true)
    unitsLoad()
    setHome('bane', 'u142')
    on(16)
    expect(homeOn('bane'), 'he never moved').toBe('u142')
    expect(levelIn('acus', u150), "150's right taken by a 142/149 admin with no move").toBe('view')
  })
  it('one forged command: 149 for one day (16th), 142 again from the 17th, the 150 View deleted — refused or the View stands (arguable: a one-day move is a move)', () => {
    const u150 = setup()
    const g = unitRows().grants.find(x => x.account === 'acus' && x.unit === u150)!
    const r = commitSettingsIntent('home.set', null, () => {
      store.set(HOME_PFX + 'hz0', { id: 'hz0', pid: 'bane', unit: 'u142', from: todayIso() })
      store.set(HOME_PFX + 'hz1', { id: 'hz1', pid: 'bane', unit: 'u149', from: '2026-07-16' })
      store.set(HOME_PFX + 'hz2', { id: 'hz2', pid: 'bane', unit: 'u142', from: '2026-07-17' })
      store.set(GRANT_PFX + g.id, null)
    }) as any
    unitsLoad()
    expect({ ok: r.ok, view: levelIn('acus', u150) }).not.toEqual({ ok: true, view: null })
  })
})
