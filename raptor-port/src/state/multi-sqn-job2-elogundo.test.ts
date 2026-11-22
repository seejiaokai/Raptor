// @vitest-environment jsdom
/* PROOF (blind read of job 2's fixes): with the squadron in view now asked too, a line its giver may file in neither its
   own squadron nor the one in view is dropped. A 142 member with View of 149, 149 in view, changes his own input (its
   line goes to 142 — kept test) and presses Undo: the Undo line carries no man and no unit, so it is asked of 149 only,
   and is lost — in no squadron's history at all. */
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, store } from '../engine/hooks'
import { initStore, resetSession, notify, switchUnit, writeInputsBatch } from './store'
import { INPUTS, leadOf } from '../engine/inputs'
import { signIn, sessionFor, accountsLoad } from './accounts'
import { setSession } from './auth'
import { installGlobalUndo } from './undo-wire'
import { _resetTimeline, globalUndo } from '../undo/timeline'
import { elogFlush } from '../engine/editlog'
import { setUnitSeeds, setGrant } from './units'

const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v },
  keys: () => Object.keys(mem),
}
const signInAs = (name: string, pass: string) => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }
const lines = () => store.keys('elog:').map(k => store.get(k, null)).filter(Boolean) as any[]

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 10, 18, 9))
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

function run(view149: boolean) {
  signInAs('ad', 'a')
  expect(setGrant('acus', 'u149', 'view', 'bane').ok).toBe(true)
  signInAs('us', 'us')
  if (view149) switchUnit('u149')
  const mine = INPUTS.find((x: any) => String(leadOf(x)) === 'bane' && (!Array.isArray(x.people) || x.people.length === 1)) as any
  expect(writeInputsBatch(() => { mine.remarks = 'changed' })).toBeTruthy()
  elogFlush()
  expect(lines().some(x => x.sub === 'bane' && /remarks/.test(String(x.lbl)))).toBe(true)
  const r = globalUndo()
  expect(r.ok).toBe(true)
  elogFlush()
  return lines().filter(x => /^Undo/.test(String(x.lbl)))
}

describe("a member's own Undo line, made with another squadron in view", () => {
  it('control: 142 in view — his Undo line is kept, in 142', () => {
    const u = run(false)
    expect(u.length).toBeGreaterThan(0)
    expect(u.every(x => x.u === 'u142')).toBe(true)
  })
  it('149 in view (View only) — his Undo line should be kept in his own 142, not lost', () => {
    const u = run(true)
    expect(u.length, 'the Undo line is in no history at all').toBeGreaterThan(0)
    expect(u.every(x => x.u === 'u142')).toBe(true)
  })
})
