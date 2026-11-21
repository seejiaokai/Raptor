// @vitest-environment jsdom
/* JOB 2 (19 Nov 26), Astra's 5 — a squadron's change history is written only by its own people (H5, section 7d). The
   push asked the actor's rights only for a squadron OTHER than the one in view, so a 142 member given View of 149 who
   switched the view to 149 filed a line in 149's history (View writes nothing — D2094). Now every line's squadron is
   asked, the one in view too; a line the actor may not file there is never kept. The proof is Astra's
   (docs/superpowers/briefs/2026-11-19-multi-sqn-b1-job2-astra.md). */
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, store } from '../engine/hooks'
import { initStore, resetSession, notify, switchUnit, writeInputsBatch } from './store'
import { INPUTS, leadOf } from '../engine/inputs'
import { signIn, sessionFor, accountsLoad } from './accounts'
import { setSession } from './auth'
import { installGlobalUndo } from './undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { elogFlush, logAction } from '../engine/editlog'
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

describe("Astra 5 — a 142 member with View of 149, 149 in view", () => {
  it("cannot file a line in 149's history", () => {
    signInAs('ad', 'a')
    expect(setGrant('acus', 'u149', 'view', 'bane').ok).toBe(true)
    signInAs('us', 'us')
    switchUnit('u149')
    logAction(null, 'proof-forged-149-history', { date: '2026-11-20', sect: 'day', unit: 'u149' })
    logAction(null, 'proof-forged-149-history-2', { date: '2026-11-20', sect: 'day' })
    elogFlush()
    expect(lines().some(x => x.u === 'u149' && /^proof-forged/.test(x.lbl))).toBe(false)
  })
  it("…while his own input's line, made with 149 in view, is filed in 142's history", () => {
    signInAs('ad', 'a')
    expect(setGrant('acus', 'u149', 'view', 'bane').ok).toBe(true)
    signInAs('us', 'us')
    switchUnit('u149')
    const mine = INPUTS.find((x: any) => String(leadOf(x)) === 'bane' && (!Array.isArray(x.people) || x.people.length === 1)) as any
    expect(writeInputsBatch(() => { mine.remarks = 'with 149 in view' })).toBeTruthy()
    elogFlush()
    const mineLines = lines().filter(x => x.sub === 'bane')
    expect(mineLines.length).toBeGreaterThan(0)
    expect(mineLines.every(x => x.u === 'u142')).toBe(true)
  })
})
