/* Fable's read — OIL leave filed on the Inputs page for a day no leave period covers yet is not taken off his OIL,
   while the same leave of any other kind is taken off its balance (engine/leaveyear.ts "A DATE NO PERIOD COVERS"). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { ELOG } from '../engine/editlog'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { NOTICES } from '../state/notices'
import { noticeSeenLoad } from '../state/noticeseen'
import { createWar, figureCtxOf, getState, grantOil, initStore as lwInitStore, leaveFiguresOf, lwHistInit, rawState, setPeople, setTypedBalance } from './state/store'
import { memoryBackend } from './state/storage'
import { setMemberTodayForTests, oilLedgerOf, warHolding } from './engine'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync } from './sync'
import { fileAbsence } from './testkit'
import { myLeaveOf } from './ui/myleave'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
const TODAY = '2026-11-16'
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }

beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); PEOPLE0 = JSON.stringify(PEOPLE) })
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 10, 16, 8, 0, 0)); setMemberTodayForTests(TODAY)
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v }, keys: () => Object.keys(mem) }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  NOTICES.length = 0
  ELOG.rows.length = 0
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  noticeSeenLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  HOOKS.toast = () => {}
  signInAs('ad', 'a')
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); resetSession(null); setMemberTodayForTests('2000-01-01') })

const oil = (pid: string) => oilLedgerOf(figureCtxOf(), pid).balance

describe('leave on a day no leave period covers yet (a January leave filed in November, before the new year\'s period is made)', () => {
  it('the world: no period holds Mon 7 – Fri 11 Feb 2028', () => {
    expect(warHolding(rawState().wars, '2028-02-07')).toBeFalsy()
  })
  it('LL there comes off his LVE at once (the engine\'s reading 17) …', () => {
    expect(setTypedBalance('bane', 'LVE', 20, 0)).toBe(true)
    fileAbsence('bane', 'LL', '2028-02-07', '2028-02-11')
    expect(leaveFiguresOf('bane').kinds.LVE.app).toBe(15)
  })
  it('… and OIL there must come off his OIL at once too — the same leave, the same days', () => {
    expect(grantOil(['bane'], 5, '2026-11-02', 'exercise')).toBeNull()
    const before = oil('bane')
    fileAbsence('bane', 'OIL', '2028-02-07', '2028-02-11')
    /* five working days of OIL taken */
    expect(oil('bane')).toBe(before - 5)
  })
  it('… as it does the moment a period holding those days is made (so the figure jumps by itself)', () => {
    expect(grantOil(['bane'], 5, '2026-11-02', 'exercise')).toBeNull()
    const before = oil('bane')
    fileAbsence('bane', 'OIL', '2028-02-07', '2028-02-11')
    const between = oil('bane')
    expect(createWar('2028', '2028-01-01', '2028-12-31')).toBe('created')
    expect({ between, after: oil('bane'), myLeave: myLeaveOf(getState().wars, 'bane', TODAY).oil }).toEqual({ between: before - 5, after: before - 5, myLeave: before - 5 })
  })
})
