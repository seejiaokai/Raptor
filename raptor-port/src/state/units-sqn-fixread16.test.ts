// @vitest-environment jsdom
/* FABLE'S SAMPLE REVIEW (D2234, 20 Nov 26, chat 123): the faults it found in the batch's own squadron code, each
   reproduced here red before its fix. Harness as units-sqn-fixread2.test.ts; the reader's set-ups copied, never imported.
   - Sample 1 (D2203): a View or Plan given after a move is saved, but before its day, survived the move.
   - Sample 2 (D2203): a move was refused whole when the man held a right in a squadron the mover is not an admin of. */
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, store } from '../engine/hooks'
import { initStore, resetSession, notify } from './store'
import { signIn, sessionFor, accountsLoad, levelIn } from './accounts'
import { setSession } from './auth'
import { installGlobalUndo } from './undo-wire'
import { _resetTimeline, globalUndo } from '../undo/timeline'
import { setUnitSeeds, setHome, setGrant, homeOn, unitsLoad, addUnit, todayIso } from './units'
import { GRANT_PFX } from './units-model'
import { commitSettingsIntent } from './people-settings-commit'

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
  setUnitSeeds(true)
  initStore()
  accountsLoad()
  resetSession(null)
  _resetTimeline()
  installGlobalUndo()
})
afterEach(() => { setSession(null); resetSession(null); _resetTimeline(); vi.useRealTimers() })
afterAll(() => { storeBackend.impl = null })

describe('Sample 1 (D2203) — no right given between a move saved and its day outlives the move', () => {
  for (const level of ['view', 'admin'] as const) {
    it(`a ${level} of a third squadron given to Ranger on 15 Jul, his move to 149 saved for 16 Jul: none on 16 Jul`, () => {
      signInAs('ad', 'a')
      const u150 = addUnit('150', 'p1')
      expect(u150.ok).toBe(true)
      expect(setHome('bane', 'u149').ok).toBe(true)
      setGrant('acus', u150.id!, level, 'bane')
      on(16)
      expect(homeOn('bane')).toBe('u149')
      expect(levelIn('acus', u150.id!), 'his right ends with the move').toBeNull()
    })
  }
  it('(control) the same right given on 16 Jul, after the move, stands', () => {
    signInAs('ad', 'a')
    const u150 = addUnit('150', 'p1')
    expect(setHome('bane', 'u149').ok).toBe(true)
    on(16)
    expect(setGrant('acus', u150.id!, 'view', 'bane').ok).toBe(true)
    expect(levelIn('acus', u150.id!)).toBe('view')
  })
  it('the gate holds it too: the right written straight, past setGrant, on 15 Jul with the move saved — refused', () => {
    signInAs('ad', 'a')
    const u150 = addUnit('150', 'p1')
    expect(setHome('bane', 'u149').ok).toBe(true)
    const r = commitSettingsIntent('grant.set', null, () => { store.set(GRANT_PFX + 'gx1', { id: 'gx1', account: 'acus', unit: u150.id!, level: 'view', from: todayIso() }) }) as any
    expect(r.ok).toBe(false)
    unitsLoad()
    expect(levelIn('acus', u150.id!)).toBeNull()
  })
  it('(control) the move undone the same day puts back the rights it dropped', () => {
    signInAs('ad', 'a')
    const u150 = addUnit('150', 'p1')
    expect(setGrant('acus', u150.id!, 'view', 'bane').ok).toBe(true)
    expect(setHome('bane', 'u149').ok).toBe(true)
    unitsLoad()
    expect(levelIn('acus', u150.id!), 'dropped by the move').toBeNull()
    expect(globalUndo()).toBeTruthy()
    unitsLoad()
    expect(homeOn('bane', '2026-07-16')).toBe('u142')
    expect(levelIn('acus', u150.id!), 'back with the Undo').toBe('view')
  })
})

describe("Sample 2 (D2203) — whoever may move him may move him, his other rights going with the move", () => {
  it("Ranger holds View of 150; Hunter (142's admin, Plan of 149) moves him to 149: the move takes, the View goes", () => {
    signInAs('ad', 'a')
    const u150 = addUnit('150', 'p1')
    expect(setGrant('acus', u150.id!, 'view', 'bane').ok).toBe(true)
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    signInAs('ad2', 'a2')
    const r = setHome('bane', 'u149')
    expect(r.message ?? '', 'no words from inside the gate').not.toMatch(/member-writes-own|grant:/)
    expect(r.ok).toBe(true)
    on(16)
    expect(homeOn('bane')).toBe('u149')
    expect(levelIn('acus', u150.id!)).toBeNull()
  })
  it('(control) the same move with no third-squadron right takes', () => {
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    signInAs('ad2', 'a2')
    expect(setHome('bane', 'u149').ok).toBe(true)
  })
})
