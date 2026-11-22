// @vitest-environment jsdom
/* JOB 2 (19 Nov 26) — the inputs gate (7c) across a move of squadron. It read an input's squadron off its people's home on
   the input's FIRST day only: 142's plain admin could put a leave on a man that runs on into the days he is 149's (the
   security read's SEC-4). And it read a member's own input by the same first day against his rights today, so across a
   saved move he was refused his own input (Fable's F2) — a member's own input is his (§11). Now an input is judged by its
   people's homes on every day it covers (its first day and every saved move inside it), and a member's input naming only
   himself, before and after, is his whatever its squadron. The proofs are the security reader's and Fable's
   (docs/superpowers/briefs/2026-11-19-multi-sqn-b1-job2-{security,fable}.md). */
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { initStore, resetSession, notify, writeInputsBatch } from './store'
import { INPUTS, leadOf, inputAtIso, inputBelongs } from '../engine/inputs'
import { signIn, sessionFor, accountsLoad } from './accounts'
import { setSession } from './auth'
import { installGlobalUndo } from './undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { setUnitSeeds, setHome, homeOn, todayIso } from './units'
import { moveFrom } from './units-model'
import { addDays } from './flyplan-model'
import { settleWorld } from '../test-support/world'

const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v },
  keys: () => Object.keys(mem),
}
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
const mineOf = () => INPUTS.find((x: any) => String(leadOf(x)) === 'bane' && (!Array.isArray(x.people) || x.people.length === 1)) as any

describe('SEC-4 — an input judged by its man\'s squadron on every day it covers', () => {
  it('after the master moves Ranger to 149 from tomorrow, Hunter (142) may not put a leave on him that runs into his 149 days', () => {
    at('2026-07-15'); boot()
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)
    expect(homeOn('bane', moveFrom(todayIso()))).toBe('u149')
    signInAs('ad2', 'a2')
    const rec = { person: 'bane', date: 'Jul 15', endDate: 'Jul 24', yr: 2026, allday: true, type: 'LL', remarks: 'by 142', by: 'prowler', at: Date.now(), iid: 'isec4', ord: 99999 }
    const ok = writeInputsBatch(() => { INPUTS.push(rec as any) })
    const stored = INPUTS.find((x: any) => x.iid === 'isec4')
    if (stored) expect(inputBelongs(stored, 'u149', '2026-07-20'), "it stands on 149's schedule on the 20th").toBe(true)
    expect(ok, "refused: it covers days he is 149's").toBe(false)
  })
  it('…while one that ends before his move is still 142\'s to file', () => {
    at('2026-07-15'); boot()
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'bane', date: 'Jul 15', yr: 2026, allday: true, type: 'LL', remarks: 'today only', by: 'prowler', at: Date.now(), iid: 'isec4c', ord: 99997 } as any) })).toBe(true)
  })
  it("…and 149's own admin (Kestrel) files leave on his man's 149 days", () => {
    at('2026-07-15'); boot()
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)
    signInAs('ad9', 'a9')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'bane', date: 'Jul 18', endDate: 'Jul 24', yr: 2026, allday: true, type: 'LL', remarks: '149', by: 'kes9', at: Date.now(), iid: 'isec4b', ord: 99998 } as any) })).toBe(true)
  })
})

describe("Fable F2 — a member and his own input across a move of squadron", () => {
  it('control: Ranger changes the remarks of his own input (no move)', () => {
    const iso = inputAtIso(mineOf().date, mineOf().yr)!
    at(addDays(iso, -5)); boot()
    signInAs('us', 'us')
    expect(writeInputsBatch(() => { mineOf().remarks = 'mine' })).toBeTruthy()
    expect(mineOf().remarks).toBe('mine')
  })
  it('his move to 149 saved for tomorrow: his own input dated after it is still his to change today', () => {
    const iso = inputAtIso(mineOf().date, mineOf().yr)!
    at(addDays(iso, -5)); boot()
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)
    expect(homeOn('bane', todayIso())).toBe('u142')
    expect(homeOn('bane', iso)).toBe('u149')
    signInAs('us', 'us')
    writeInputsBatch(() => { mineOf().remarks = 'mine, before I move' })
    expect(mineOf().remarks).toBe('mine, before I move')
  })
  it('after he has moved: his own input dated before the move is still his to change', () => {
    const iso = inputAtIso(mineOf().date, mineOf().yr)!
    at(iso); boot()
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)
    at(addDays(iso, 2))
    expect(homeOn('bane', todayIso())).toBe('u149')
    expect(homeOn('bane', iso)).toBe('u142')
    signInAs('us', 'us')
    writeInputsBatch(() => { mineOf().remarks = 'mine, after I moved' })
    expect(mineOf().remarks).toBe('mine, after I moved')
  })
})
