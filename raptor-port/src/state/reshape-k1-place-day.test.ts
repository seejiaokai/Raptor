// @vitest-environment jsdom
/* REPRO K1 — the gate never checks a squadron place row's date: a back-dated place, an erased past move (core read,
   opus F1; its probe A, copied). Correct (D2160 R7: a new place counts from the next day's start, never splitting a day;
   a place keeps its history; units.ts moveUnit writes tomorrow only): both forged commands refused. RED while the claim
   holds. */
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, store } from '../engine/hooks'
import { initStore, resetSession, notify } from '../state/store'
import { signIn, sessionFor, accountsLoad } from '../state/accounts'
import { setSession } from '../state/auth'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { setUnitSeeds, setPlace, moveUnit, placeOfOn, unitRows, unitsLoad } from '../state/units'
import { commitSettingsIntent } from '../state/people-settings-commit'

const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v },
  keys: () => Object.keys(mem),
}
const signInAs = (name: string, pass: string) => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  setUnitSeeds(true); initStore(); accountsLoad(); resetSession(null); _resetTimeline(); installGlobalUndo()
})
afterEach(() => { setSession(null); resetSession(null); _resetTimeline(); vi.useRealTimers() })
afterAll(() => { storeBackend.impl = null })

describe('K1 — a squadron place row dated in the past', () => {
  it("142's plain admin back-dates 142's place to 1 Jan by a forged unit.place: refused", () => {
    signInAs('ad2', 'a2')
    const p = setPlace({ name: 'Det base', tz: 'Australia/Darwin' })
    expect(p.ok).toBe(true)
    expect(placeOfOn('u142', '2026-01-05')?.id).toBe('p1')
    const r = commitSettingsIntent('unit.place', null, () => {
      store.set('unitplace:upzz', { id: 'upzz', unit: 'u142', place: p.id, from: '2026-01-01' })
    }) as any
    unitsLoad()
    expect(r.ok, `committed; 142's place on 5 Jan now ${placeOfOn('u142', '2026-01-05')?.id}`).toBe(false)
  })
  it('…and deletes a place row in force since 2 Jul, on 10 Jul: refused', () => {
    vi.setSystemTime(new Date(2026, 6, 1, 9, 0, 0)); unitsLoad()
    signInAs('ad2', 'a2')
    const p = setPlace({ name: 'Det base', tz: 'Australia/Darwin' })
    expect(moveUnit('u142', p.id!).ok).toBe(true)
    vi.setSystemTime(new Date(2026, 6, 10, 9, 0, 0)); unitsLoad()
    expect(placeOfOn('u142', '2026-07-05')?.id).toBe(p.id)
    const row = unitRows().unitplaces.find(x => x.unit === 'u142' && x.place === p.id)!
    const r = commitSettingsIntent('unit.place', null, () => { store.set('unitplace:' + row.id, null) }) as any
    unitsLoad()
    expect(r.ok, `committed; 142's place on 5 Jul now ${placeOfOn('u142', '2026-07-05')?.id}`).toBe(false)
  })
  it('(control) the honest move writes tomorrow only', () => {
    signInAs('ad2', 'a2')
    const p = setPlace({ name: 'Det base', tz: 'Australia/Darwin' })
    expect(moveUnit('u142', p.id!).ok).toBe(true)
    unitsLoad()
    expect(placeOfOn('u142', '2026-07-15')?.id).toBe('p1')
    expect(placeOfOn('u142', '2026-07-16')?.id).toBe(p.id)
  })
})
