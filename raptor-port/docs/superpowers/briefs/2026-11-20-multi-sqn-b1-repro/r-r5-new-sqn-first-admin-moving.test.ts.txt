// @vitest-environment jsdom
/* REPRO R5 — a new squadron whose first admin moves tomorrow is refused in the gate's raw words (fable F4, opus minor).
   Correct: refused (D2203 — no right given between a move saved and its day, setGrant's own rule) AND said in plain
   words as setGrant says it, never the gate's internal reason ("member-writes-own: … (grant:g…)"). RED while the claim
   holds. Harness: units-sqn-fixread16.test.ts, copied. */
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { initStore, resetSession, notify } from '../state/store'
import { signIn, sessionFor, accountsLoad, ACCOUNTS_LIST } from '../state/accounts'
import { setSession } from '../state/auth'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { setUnitSeeds, setHome, unitsLoad, addUnit, places, units } from '../state/units'

const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v },
  keys: () => Object.keys(mem),
}
const signInAs = (name: string, pass: string) => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  setUnitSeeds(true); initStore(); accountsLoad(); resetSession(null); _resetTimeline(); installGlobalUndo()
})
afterEach(() => { setSession(null); resetSession(null); _resetTimeline(); vi.useRealTimers() })
afterAll(() => { storeBackend.impl = null })

describe('R5 — Saber makes squadron 160 naming Hunter, whose move to 149 is saved for tomorrow', () => {
  it('refused, in plain words (never the gate\'s internal reason)', () => {
    signInAs('ad', 'a')
    expect(setHome('prowler', 'u149').ok).toBe(true)
    unitsLoad()
    const acct = ACCOUNTS_LIST.find(x => x.pid === 'prowler')!
    const r = addUnit('160', places()[0]!.id, acct.id)
    expect(r.ok, 'D2203: no right given before his move').toBe(false)
    expect(r.message ?? '', 'the gate\'s own words reached the screen').not.toMatch(/member-writes-own|\(grant:|unitrow|perms/i)
    unitsLoad()
    expect(units().some(u => u.num === '160'), 'nothing half made').toBe(false)
  })
  it('(control) the same with no move saved: made', () => {
    signInAs('ad', 'a')
    const acct = ACCOUNTS_LIST.find(x => x.pid === 'prowler')!
    expect(addUnit('160', places()[0]!.id, acct.id).ok).toBe(true)
  })
})
