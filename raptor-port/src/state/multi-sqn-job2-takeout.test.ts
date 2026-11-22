// @vitest-environment jsdom
/* JOB 2 (19 Nov 26), Astra's 3 — the inputs gate's "take myself out" exception (7c, his D755) on an input naming men of
   two squadrons. It asked only that one man went and nobody came, so a member could take himself out AND rewrite what was
   left for the other squadron's man in the same command; and his Undo of a plain take-out, which puts him back, was
   refused by the squadron test before the gate's own replay check was reached. Now the exception is the gate's own
   `ownPart` (only his entry differs, and the filer's handover with him), forward only as a removal, and the reverse only
   as his own verified replay. The proofs are Astra's (docs/superpowers/briefs/2026-11-19-multi-sqn-b1-job2-astra.md). */
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { initStore, resetSession, notify, writeInputsBatch } from './store'
import { INPUTS, holds } from '../engine/inputs'
import { takePerson } from '../engine/inputown'
import { signIn, sessionFor, accountsLoad } from './accounts'
import { setSession } from './auth'
import { installGlobalUndo } from './undo-wire'
import { _resetTimeline, globalUndo, globalRedo } from '../undo/timeline'
import { setUnitSeeds, setHome } from './units'

const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v },
  keys: () => Object.keys(mem),
}
const signInAs = (name: string, pass: string) => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }
let ISNAP = ''

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 10, 18, 9))           // Wed 18 Nov 26
  if (!ISNAP) ISNAP = JSON.stringify(INPUTS)
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
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

const input = (iid: string, ids: string[], by: string): any => ({
  iid, type: 'Training', date: 'Nov 20', yr: 2026, allday: true, remarks: 'original', by, at: Date.now(),
  people: ids.map(p => ({ p, by, at: Date.now() })),
})
const find = (iid: string) => INPUTS.find((x: any) => x.iid === iid) as any

describe("Astra 3 — a member's take-out of an input naming another squadron's man", () => {
  it('taking himself out AND rewriting what is left for the 149 man in one command is refused', () => {
    signInAs('us', 'us')
    expect(writeInputsBatch(() => { INPUTS.push(input('proof-cross-edit', ['bane', 'rocky'], 'bane')) })).toBe(true)
    signInAs('ad', 'a')
    expect(setHome('rocky', 'u149').ok).toBe(true)
    signInAs('us', 'us')
    const r = find('proof-cross-edit')
    expect(writeInputsBatch(() => {
      takePerson(r, 'bane')
      r.remarks = 'changed for the remaining 149 man'
    })).toBe(false)
    expect(find('proof-cross-edit').remarks).toBe('original')
  })
  it('…while the plain take-out goes through, and its Undo and Redo too', () => {
    signInAs('ad', 'a')
    expect(writeInputsBatch(() => { INPUTS.push(input('proof-cross-undo', ['bane', 'osp9'], 'stiff')) })).toBe(true)
    signInAs('us', 'us')
    expect(writeInputsBatch(() => { takePerson(find('proof-cross-undo'), 'bane') })).toBe(true)
    expect(holds(find('proof-cross-undo'), 'bane')).toBe(false)
    expect(globalUndo().ok).toBe(true)
    expect(holds(find('proof-cross-undo'), 'bane')).toBe(true)
    expect(globalRedo().ok).toBe(true)
    expect(holds(find('proof-cross-undo'), 'bane')).toBe(false)
  })
  it('…and putting himself into the other squadron’s man’s input, forward, stays refused', () => {
    signInAs('ad', 'a')
    expect(writeInputsBatch(() => { INPUTS.push(input('proof-cross-in', ['osp9'], 'stiff')) })).toBe(true)
    signInAs('us', 'us')
    const r = find('proof-cross-in')
    expect(writeInputsBatch(() => { r.people.push({ p: 'bane', by: 'bane', at: Date.now() }) })).toBe(false)
    expect(holds(find('proof-cross-in'), 'bane')).toBe(false)
  })
})
