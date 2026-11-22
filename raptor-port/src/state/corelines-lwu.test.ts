// @vitest-environment jsdom
/* CORE LINE 1 (helper "corelines", 22 Nov 26): the squadron whose war approved a leave rides on its Input as `lwU`
   (leavewar/sync.ts doorApprove — helper "warfix", W2-F2: each war holds only its own leave). It is the war's stamp, as
   `lwBy` / `lwAt` are: a person's own command keeps it as it was or drops it, never writes or changes it — or a hand-made
   command moves his leave out of one war's sight and into another's. Harness copied from
   state/multi-sqn-fixread5-admin-placer.test.ts. */
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { initStore, resetSession, notify, writeInputsBatch } from './store'
import { INPUTS } from '../engine/inputs'
import { signIn, sessionFor, accountsLoad } from './accounts'
import { setSession } from './auth'
import { installGlobalUndo } from './undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { setUnitSeeds, setHome, homeOn } from './units'
import { settleWorld } from '../test-support/world'

const mem: Record<string, string> = {}
const fake = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v }, keys: () => Object.keys(mem) }
const signInAs = (name: string, pass: string) => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }
let ISNAP = ''
const at = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); vi.setSystemTime(new Date(y!, m! - 1, d!, 9, 0, 0)) }
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  if (!ISNAP) ISNAP = JSON.stringify(INPUTS)
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  setUnitSeeds(true)
})
afterEach(() => { setSession(null); resetSession(null); _resetTimeline(); vi.useRealTimers() })
afterAll(() => { storeBackend.impl = null })
const boot = () => { initStore(); accountsLoad(); resetSession(null); _resetTimeline(); installGlobalUndo(); settleWorld() }
const own = (pid: string, iid: string, date: string, endDate?: string, extra: Record<string, unknown> = {}) => ({ person: pid, date, ...(endDate ? { endDate } : {}), yr: 2026, allday: true, type: 'LL', remarks: 'mine', by: pid, at: Date.now(), iid, ord: 99000 + iid.length, ...extra })
const row = (iid: string): any => INPUTS.find((x: any) => x.iid === iid)
const moveHunter = () => {
  signInAs('ad', 'a')
  expect(setHome('prowler', 'u149').ok).toBe(true)
  expect(homeOn('prowler', '2026-07-20')).toBe('u149')
}
const moveRanger = () => { signInAs('ad', 'a'); expect(setHome('bane', 'u149').ok).toBe(true) }

describe("the squadron whose war approved a leave (`lwU`) is the war's to write, never a person's own command", () => {
  it('Ranger (a member) may not file his own leave stamped with a war’s squadron', () => {
    at('2026-07-15'); boot()
    moveRanger()
    signInAs('us', 'us')
    expect(writeInputsBatch(() => { INPUTS.push(own('bane', 'z-u1', 'Jul 20', 'Jul 22', { lwU: 'u142' }) as any) }), 'a forged squadron stamp').toBe(false)
    expect(row('z-u1')).toBeUndefined()
  })
  it('Ranger may not change the squadron of a leave 142’s war approved (it would leave 142’s war and enter 149’s)', () => {
    at('2026-07-15'); boot()
    moveRanger()
    signInAs('ad', 'a')
    expect(writeInputsBatch(() => { INPUTS.push(own('bane', 'z-u2', 'Jul 20', 'Jul 22', { lw: 'w2026', lwBy: 'prowler', lwAt: 111, lwU: 'u142' }) as any) })).toBe(true)
    signInAs('us', 'us')
    expect(writeInputsBatch(() => { row('z-u2').lwU = 'u149' }), 'the approving squadron rewritten').toBe(false)
    expect(row('z-u2').lwU).toBe('u142')
  })
  it('Ranger may not add a squadron to a war leave that carries none', () => {
    at('2026-07-15'); boot()
    moveRanger()
    signInAs('ad', 'a')
    expect(writeInputsBatch(() => { INPUTS.push(own('bane', 'z-u3', 'Jul 20', 'Jul 22', { lw: 'w2026', lwBy: 'prowler', lwAt: 111 }) as any) })).toBe(true)
    signInAs('us', 'us')
    expect(writeInputsBatch(() => { row('z-u3').lwU = 'u149' }), 'a squadron stamp added').toBe(false)
    expect(row('z-u3').lwU).toBeUndefined()
  })
  it('Hunter (142’s admin, moved to 149 from tomorrow) may not rewrite the squadron of his war leave on 149’s days', () => {
    at('2026-07-15'); boot()
    moveHunter()
    signInAs('ad', 'a')
    expect(writeInputsBatch(() => { INPUTS.push(own('prowler', 'z-u4', 'Jul 20', 'Jul 22', { lw: 'w2026', lwBy: 'kes9', lwAt: 333, lwU: 'u149' }) as any) })).toBe(true)
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { row('z-u4').lwU = 'u142' }), 'the approving squadron rewritten by another squadron’s admin').toBe(false)
    expect(row('z-u4').lwU).toBe('u149')
  })
  it('Hunter may not file a new leave on 149’s days stamped with a war’s squadron', () => {
    at('2026-07-15'); boot()
    moveHunter()
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { INPUTS.push(own('prowler', 'z-u5', 'Jul 20', 'Jul 22', { lwU: 'u142' }) as any) }), 'a forged squadron stamp').toBe(false)
    expect(row('z-u5')).toBeUndefined()
  })
  it('control: Ranger changes the remarks of his war leave, its stamps kept as they were', () => {
    at('2026-07-15'); boot()
    moveRanger()
    signInAs('ad', 'a')
    expect(writeInputsBatch(() => { INPUTS.push(own('bane', 'z-u6', 'Jul 20', 'Jul 22', { lw: 'w2026', lwBy: 'prowler', lwAt: 111, lwU: 'u142' }) as any) })).toBe(true)
    signInAs('us', 'us')
    expect(writeInputsBatch(() => { row('z-u6').remarks = 'mine, reworded' })).toBe(true)
    expect(row('z-u6').lwU).toBe('u142')
  })
  it('control: Ranger files his own plain leave (no war stamp)', () => {
    at('2026-07-15'); boot()
    moveRanger()
    signInAs('us', 'us')
    expect(writeInputsBatch(() => { INPUTS.push(own('bane', 'z-u7', 'Jul 20', 'Jul 22') as any) })).toBe(true)
  })
})
