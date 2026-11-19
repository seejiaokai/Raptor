// @vitest-environment jsdom
/* FR5 SECURITY PROOF (fix read 5, security reader). Claim 1's admin branch in perms.ts inputUnitViolation runs only
   inputBreach for an admin's own input on days he is not admin of. The member section ALSO runs a second test right after
   inputBreach: "who placed a leave on the war" (lwBy / lwAt must come from a before-image of this command). That test is
   not run on the admin branch. Harness copied from state/multi-sqn-fixread4-admin-own-input.test.ts. */
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

describe("FR5-SEC-1: an admin's own input on another squadron's days — who placed it on the war", () => {
  it("control: Ranger (member, moved to 149) may not stamp who placed his leave on the war", () => {
    at('2026-07-15'); boot()
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)
    signInAs('us', 'us')
    expect(writeInputsBatch(() => { INPUTS.push(own('bane', 'z-m1', 'Jul 20', 'Jul 22', { lwBy: 'prowler', lwAt: 1 }) as any) })).toBe(false)
  })
  it("Hunter (142 admin, moved to 149 from tomorrow) may not stamp who placed his leave on 149's days either", () => {
    at('2026-07-15'); boot()
    moveHunter()
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { INPUTS.push(own('prowler', 'z-a1', 'Jul 20', 'Jul 22', { lwBy: 'bane', lwAt: 1 }) as any) }), 'a forged placer on 149 days').toBe(false)
  })
  it("Hunter rewrites the placer of his war-approved leave on 149's days (the 'Placed' fact in 149's war)", () => {
    at('2026-07-15'); boot()
    moveHunter()
    /* the master files his leave as approved on the war, placed by Hunter */
    signInAs('ad', 'a')
    expect(writeInputsBatch(() => { INPUTS.push(own('prowler', 'z-a2', 'Jul 20', 'Jul 22', { lw: 'w2026', lwBy: 'prowler', lwAt: 111 }) as any) })).toBe(true)
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { const r = row('z-a2'); r.lwBy = 'bane'; r.lwAt = 222 }), 'the placer of a 149-day war leave rewritten').toBe(false)
    expect(row('z-a2').lwBy).toBe('prowler')
  })
  /* (chat 113's extension: the proof above covered only a leave wholly after the move. A leave ACROSS the move — one
     day still 142's, where Hunter is an admin, the rest 149's — must be judged as a member's on the whole input, so
     his 142 day cannot carry a rewritten or forged stamp onto 149's days) */
  it("Hunter rewrites the placer of a leave ACROSS his move that 149's admin placed on 149's war", () => {
    at('2026-07-15'); boot()
    moveHunter()
    expect(homeOn('prowler', '2026-07-15')).toBe('u142')
    /* the master files it, placed on 149's war by Kestrel (149's admin) */
    signInAs('ad', 'a')
    expect(writeInputsBatch(() => { INPUTS.push(own('prowler', 'z-x1', 'Jul 15', 'Jul 22', { lw: 'w2026', lwBy: 'kes9', lwAt: 333 }) as any) })).toBe(true)
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { const r = row('z-x1'); r.lwBy = 'prowler'; r.lwAt = 444 }), 'the placer of an across-the-move war leave rewritten').toBe(false)
    expect(row('z-x1').lwBy).toBe('kes9')
    expect(row('z-x1').lwAt).toBe(333)
  })
  it("Hunter may not file a new leave across his move stamped as placed by 149's admin", () => {
    at('2026-07-15'); boot()
    moveHunter()
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { INPUTS.push(own('prowler', 'z-x2', 'Jul 15', 'Jul 22', { lw: 'w2026', lwBy: 'kes9', lwAt: 1 }) as any) }), 'a forged placer across the move').toBe(false)
    expect(row('z-x2')).toBeUndefined()
  })
  it("control: Hunter files his own plain leave across the move (no war stamp) and it goes through", () => {
    at('2026-07-15'); boot()
    moveHunter()
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { INPUTS.push(own('prowler', 'z-x3', 'Jul 15', 'Jul 22') as any) })).toBe(true)
  })
})
