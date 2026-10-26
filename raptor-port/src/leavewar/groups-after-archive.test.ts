/* [LW-GROUPS-STALE-AFTER-ARCHIVE] — a guard, not a fix (27 Oct 26). Filed 21 Oct 26 as "the war's groups keep archived men
   until a reload"; found to be a walk that read January in one picture and December in the other
   (`docs/handpass/parts/lw-small-1027/groups-diagnosis.md`). The right answer, pinned here: an archived man is posted out
   from today (D323) and his months before it stay his (D320), so his group still counts him in the months he was here
   and not after — the same in the session he was archived and after a reload (the war's store re-opened on the same
   saved data, a fresh projection). The headings are counted from the rows the grid draws, through its own month filter
   (`ui/Matrix.tsx rowInWindow`). */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { getState, groupIdOf, initStore as lwInitStore, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { archivePerson, wireLeaveWarSync } from './sync'
import { rowInWindow } from './ui/Matrix'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); PEOPLE0 = JSON.stringify(PEOPLE) })
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
afterEach(() => { resetSession(null) })

/* how many men each group's heading counts in one month, as the grid draws it */
const heads = (ym: string) => {
  const c: Record<string, number> = {}
  for (const p of getState().people) if (rowInWindow(p, `${ym}|${ym}`)) { const g = groupIdOf(p); c[g] = (c[g] || 0) + 1 }
  return c
}

describe('[LW-GROUPS-STALE-AFTER-ARCHIVE] an archived man counts in his group for the months he was here, and not after', () => {
  it('every WSO archived on 21 Oct: January and October keep their WSO groups, December has none — the same after a reload', () => {
    vi.setSystemTime(new Date(2026, 9, 21, 9, 0, 0))
    storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
    const p0 = JSON.parse(PEOPLE0)
    for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
    Object.assign(PEOPLE, p0); indexCallsigns()
    const be = memoryBackend()
    lwInitStore(be); raptorInitStore(); accountsLoad()
    setPeople(projectPeople()); wireLeaveWarSync()
    resetSession(sessionFor(signIn('ad', 'a'))); raptorNotify()
    /* the groups made only of WSOs (SXO holds pilots too) */
    const wsoGroups = (c: Record<string, number>) => Object.keys(c).filter(g => { const m = getState().people.filter(p => groupIdOf(p) === g); return m.length > 0 && m.every(p => p.seat === 'wso') }).sort()
    const before = heads('2026-01')
    const groupsOfWsos = wsoGroups(before)
    expect(groupsOfWsos.length, 'the demo has WSO groups').toBeGreaterThan(0)
    const wsos = getState().people.filter(p => p.seat === 'wso').map(p => p.id)
    for (const id of wsos) expect(archivePerson(id).bad, `${id} archived`).toBeFalsy()
    raptorNotify()
    const read = () => ({ jan: heads('2026-01'), oct: heads('2026-10'), dec: heads('2026-12') })
    const session = read()
    for (const g of groupsOfWsos) {
      expect(session.jan[g], `${g} in January, the session he was archived`).toBe(before[g])
      expect(session.oct[g], `${g} in October`).toBeGreaterThan(0)
      expect(session.dec[g], `${g} in December — after they left, no heading`).toBeUndefined()
    }
    const rosterThen = getState().people.map(p => `${p.id}:${p.to}`).sort().join(',')
    lwInitStore(be); setPeople(projectPeople())                      // a reload: the same saved data, a fresh projection
    expect(getState().people.map(p => `${p.id}:${p.to}`).sort().join(','), 'the same men, the same last days').toBe(rosterThen)
    expect(read(), 'the same headings after the reload').toEqual(session)
  })
})
