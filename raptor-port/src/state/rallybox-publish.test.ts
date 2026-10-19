/* [RALLY-PER-FORMATION] on a PUBLISHED day (owner D1032: "a change on a published day waits for the next amendment",
   D45): a formation's R box typed after publishing is one pending change, the issued copy keeps the rally it went out
   with, and the next amendment carries the new one. Written through the real text command and the real publish doors,
   as rally-publish.test.ts does. */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { DAYS } from '../engine/data'
import { SCHED, signOf, dayDelta, dayShownPendCount } from '../engine/publish'
import { HOOKS } from '../engine/hooks'
import { txtSet } from '../engine/slots'
import { initStore } from './store'
import { setSession } from './auth'
import { commitSetDayApproved, commitPublishALDay, schedWrite, SCHED_TYPES } from './sched-commit'

const saved = JSON.stringify(DAYS), savedBook = JSON.stringify(SCHED)
const sign = (di = 0) => Object.assign(signOf(di), { cur: 'ignite', sked: 'bane', plan: 'stiff', appr: 'pump' })
beforeEach(() => {
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved))
  Object.keys(SCHED).forEach(k => delete SCHED[k]); Object.assign(SCHED, JSON.parse(savedBook))
  Object.assign(SCHED, { pending: {}, changes: {}, added: {}, als: [], al: 0, dayOK: {}, sign: {}, signBind: {}, orig: {}, cur: {}, drafts: {}, curDraft: {}, correcting: {} })
  DAYS.forEach((d: any) => { d.waves = [] })
  DAYS[0].waves = [{ label: 'FIRST WAVE', intimes: ['08:00 IN TIME'], formations: [{ cs: 'VL', to: '12:00', ld: '13:00', br: '10:00', aircraft: [] }] }]
  setSession({ user: 'ad', role: 'admin' }); initStore()
  vi.spyOn(HOOKS, 'toast').mockImplementation(() => {})
})
afterEach(() => { vi.restoreAllMocks(); DAYS.splice(0, DAYS.length, ...JSON.parse(saved)); Object.keys(SCHED).forEach(k => delete SCHED[k]); Object.assign(SCHED, JSON.parse(savedBook)) })

describe('the R box on a published day waits for the next amendment (D1032, D45)', () => {
  it('a typed rally is one pending change; the issued copy keeps none; the amendment carries 07:30', () => {
    sign(); commitSetDayApproved(0, true)
    expect(dayShownPendCount(0)).toBe(0)
    schedWrite(SCHED_TYPES.text, () => { txtSet('ff:0.0.0.rl', '0730') }, { key: 'ff:0.0.0.rl' })
    expect(DAYS[0].waves[0].formations[0].rl).toBe('07:30')
    expect(dayShownPendCount(0), 'one pending change').toBe(1)
    expect(dayDelta(0).some((e: any) => String(e.key || e.k || JSON.stringify(e)).includes('.rl')), 'the delta names the rally box').toBe(true)
    expect(SCHED.orig[0].d.waves[0].formations[0].rl || '', 'the issued copy keeps the rally it went out with').toBe('')
    sign(); commitPublishALDay(0)
    expect(SCHED.als).toHaveLength(1)
    expect(SCHED.als[0].snap.d.waves[0].formations[0].rl, 'the amendment carries the new rally').toBe('07:30')
    expect(dayShownPendCount(0)).toBe(0)
  })
})
