// @vitest-environment jsdom
/* Fix read 4, claim 1 (the fresh Opus reader's §1, the worst): fix read 3's O1 let a man's own input — naming only him —
   through the squadron test whatever its squadron, an admin's too. For a member the own-input rules still ran after it
   (perms.ts inputBreach, from the member section); for an admin nothing did, since that section returns early for an
   admin. So Hunter, 142's admin moved to 149 from tomorrow, could save his own leave on 149's days with the war's
   approved mark or a scheduler's cancel mark, and clear the cancel 149's admin had put on it — overriding the other
   squadron's scheduler decisions on his own leave; and the same after the move on 142's days. Now: an admin's own input
   passes as an admin's only where he is an admin of every squadron it touches; anywhere else the member's own-input
   rules hold him. Harness as state/multi-sqn-fixread3-admin-own-input.test.ts (which stays green beside this). */
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
const own = (pid: string, iid: string, date: string, endDate?: string, extra: Record<string, unknown> = {}) => ({ person: pid, date, ...(endDate ? { endDate } : {}), yr: 2026, allday: true, type: 'LL', remarks: 'mine', by: pid, at: Date.now(), iid, ord: 99000 + iid.length, ...extra })
const row = (iid: string): any => INPUTS.find((x: any) => x.iid === iid)
/* Hunter (142's admin) moved by the master to 149 from tomorrow, 16 Jul */
const moveHunter = () => {
  signInAs('ad', 'a')
  expect(setHome('prowler', 'u149').ok).toBe(true)
  expect(homeOn('prowler', '2026-07-20')).toBe('u149')
}

describe("an admin's own input on another squadron's days keeps the own-input rules", () => {
  it("before his move: his own leave on 149's days saved with the war's approved mark is refused (as Ranger's is)", () => {
    at('2026-07-15'); boot()
    moveHunter()
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { INPUTS.push(own('prowler', 'f4-lw', 'Jul 20', 'Jul 22', { lw: 'w2026' }) as any) }), "the war's mark is not his to set there").toBe(false)
    expect(row('f4-lw')).toBeUndefined()
    /* control: Ranger, a member moved the same way, is refused the same */
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)
    signInAs('us', 'us')
    expect(writeInputsBatch(() => { INPUTS.push(own('bane', 'f4-lwm', 'Jul 20', 'Jul 22', { lw: 'w2026' }) as any) })).toBe(false)
  })
  it("before his move: his own leave on 149's days saved with a scheduler's cancel mark is refused", () => {
    at('2026-07-15'); boot()
    moveHunter()
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { INPUTS.push(own('prowler', 'f4-cx', 'Jul 20', 'Jul 22', { cx: true, cxr: 'Weather' }) as any) }), "a cancel mark is 149's scheduler's").toBe(false)
    expect(row('f4-cx')).toBeUndefined()
  })
  it("before his move: Kestrel (149) cancels his leave on 149's days — Hunter cannot clear the cancel", () => {
    at('2026-07-15'); boot()
    moveHunter()
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { INPUTS.push(own('prowler', 'f4-k', 'Jul 20', 'Jul 22') as any) }), 'his own plain leave is his').toBe(true)
    signInAs('ad9', 'a9')
    expect(writeInputsBatch(() => { const r = row('f4-k'); r.cx = true; r.cxr = 'Weather' }), "149's admin cancels on 149's days").toBe(true)
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { const r = row('f4-k'); delete r.cx; delete r.cxr }), "the cancel is 149's to take off").toBe(false)
    expect(row('f4-k').cx).toBe(true)
  })
  it("after his move: his own leave on 142's days — Saber's cancel stays, and the war's mark is refused him", () => {
    at('2026-07-15'); boot()
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { INPUTS.push(own('prowler', 'f4-a', 'Jul 15') as any) })).toBe(true)
    moveHunter()
    at('2026-07-17')
    expect(homeOn('prowler', todayIso())).toBe('u149')
    signInAs('ad', 'a')
    expect(writeInputsBatch(() => { const r = row('f4-a'); r.cx = true; r.cxr = 'Weather' }), "142's admin cancels on 142's day").toBe(true)
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { const r = row('f4-a'); delete r.cx; delete r.cxr }), "the cancel is 142's to take off").toBe(false)
    expect(writeInputsBatch(() => { row('f4-a').lw = 'w2026' }), "the war's mark is 142's to set").toBe(false)
    /* …and his own plain change of it is still his (fix read 3's O1) */
    expect(writeInputsBatch(() => { row('f4-a').remarks = 'changed after my move' })).toBe(true)
  })
  it("control: in his own squadron he is its admin — his cancel mark on his own leave there is his to set", () => {
    at('2026-07-15'); boot()
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { INPUTS.push(own('prowler', 'f4-c', 'Jul 20', 'Jul 22', { cx: true, cxr: 'Weather' }) as any) })).toBe(true)
  })
})
