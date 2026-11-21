// @vitest-environment jsdom
/* Fix read 3, O1 (the fresh Opus reader's proof, kept as its regression): F2's rule — "a man's own input is his whatever its squadron" (perms.ts 7c, onlyMe) — is a
   member's only (it was, before this fix). An ADMIN's own input across a saved move of his squadron is refused him, before and after the move,
   while a member in the same place is let through. The code's own comment says such an input is changed "only by a master
   or by the man himself". Set up as state/multi-sqn-job2-inputs.test.ts. */
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { initStore, resetSession, notify, writeInputsBatch } from './store'
import { INPUTS } from '../engine/inputs'
import { signIn, sessionFor, accountsLoad } from './accounts'
import { setSession } from './auth'
import { installGlobalUndo } from './undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { setUnitSeeds, setHome, homeOn, todayIso } from './units'
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
const own = (pid: string, iid: string, date: string, endDate?: string) => ({ person: pid, date, ...(endDate ? { endDate } : {}), yr: 2026, allday: true, type: 'LL', remarks: 'mine', by: pid, at: Date.now(), iid, ord: 99000 + iid.length })

describe("an admin's own input across a saved move of his squadron", () => {
  it('control: Ranger (a member), moved to 149 from tomorrow, files his own leave for next week', () => {
    at('2026-07-15'); boot()
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)
    signInAs('us', 'us')
    expect(writeInputsBatch(() => { INPUTS.push(own('bane', 'pr-m1', 'Jul 20', 'Jul 22') as any) })).toBe(true)
  })
  it('control: Hunter with no move files the same leave', () => {
    at('2026-07-15'); boot()
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { INPUTS.push(own('prowler', 'pr-a0', 'Jul 20', 'Jul 22') as any) })).toBe(true)
  })
  it('Hunter (142 admin), moved to 149 from tomorrow, files his own leave for next week', () => {
    at('2026-07-15'); boot()
    signInAs('ad', 'a')
    expect(setHome('prowler', 'u149').ok).toBe(true)
    expect(homeOn('prowler', '2026-07-20')).toBe('u149')
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { INPUTS.push(own('prowler', 'pr-a1', 'Jul 20', 'Jul 22') as any) }), 'his own leave is his').toBe(true)
  })
  it('Hunter, two days after his move, changes the remarks of his own leave dated before it', () => {
    at('2026-07-15'); boot()
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { INPUTS.push(own('prowler', 'pr-a2', 'Jul 15') as any) })).toBe(true)
    signInAs('ad', 'a')
    expect(setHome('prowler', 'u149').ok).toBe(true)
    at('2026-07-17')
    expect(homeOn('prowler', todayIso())).toBe('u149')
    signInAs('ad2', 'a2')
    const r = INPUTS.find((x: any) => x.iid === 'pr-a2') as any
    expect(writeInputsBatch(() => { r.remarks = 'changed after my move' }), 'his own leave is his').toBe(true)
  })
})
