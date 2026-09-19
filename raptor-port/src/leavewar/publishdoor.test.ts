// The publish door ([ARCH-STACK] step 4 — clash check B5, owner answer A,
// 20 Sep 26): publishing a weekend / PH day replaces the clashing part of an
// undecided leave bid INSIDE the publish command, so undoing the publish
// brings the bid back. Weekday work never replaces a bid.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { SCHED, signOf } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore } from '../state/store'
import { commitSetDayApproved } from '../state/sched-commit'
import { setSession } from '../state/auth'
import { projectPeople } from './state/raptorRoster'
import { advanceStage, initStore as lwInitStore, lwHistInit, rawState, setBidState, setCell, setPeople, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { runOilPass, wireLeaveWarSync } from './sync'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
const SAT = '2026-07-18'   // the seed Saturday: plasma stands SDO 0800–1800
const MON = '2026-07-13'
const toast = HOOKS.toast
let said: string[] = []

beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0
  JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  stashClear()
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  said = []
  HOOKS.toast = (m: any) => { said.push(String(m)) }
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); setSession(null) })

const publish = (di: number) => {
  const g = signOf(di)
  g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
  return commitSetDayApproved(di, true)
}
const recs = (p: string, d: string) => rawState().wars[0]!.recs[p]?.[d] ?? []

describe('publishing weekend work replaces a clashing leave bid (B5, answer A)', () => {
  it('the bid goes, a notice names the published schedule, and the OIL credit lands', () => {
    setRole('admin')
    expect(setCell('plasma', SAT, 'LL')).toBe(true)
    publish(5)
    runOilPass()
    const list = recs('plasma', SAT)
    expect(list.some(r => r.kind === 'request')).toBe(false)
    expect(list.find(r => r.kind === 'notice')).toMatchObject({ code: 'LL', byType: 'published schedule', byWho: 'the published schedule' })
    expect(list.some(r => r.kind === 'credit')).toBe(true)
    expect(said.some(m => m.includes("Publishing replaces plasma") || m.includes('bid on 18 Jul'))).toBe(true)
  })

  it('undoing the publish brings the bid back; redo replaces it again', () => {
    setRole('admin')
    expect(setCell('plasma', SAT, 'LL')).toBe(true)
    publish(5)
    expect(recs('plasma', SAT).some(r => r.kind === 'request')).toBe(false)
    expect(globalUndo().ok).toBe(true)
    expect(recs('plasma', SAT).filter(r => r.kind === 'request')).toHaveLength(1)
    expect(recs('plasma', SAT).some(r => r.kind === 'notice')).toBe(false)
    expect(globalRedo().ok).toBe(true)
    expect(recs('plasma', SAT).some(r => r.kind === 'request')).toBe(false)
  })

  it('an acknowledged bid is replaced too; a refused one stays as history', () => {
    setRole('admin')
    expect(setCell('plasma', SAT, 'LL')).toBe(true)
    expect(setCell('rocky', SAT, 'OL')).toBe(true)
    advanceStage()
    setBidState('plasma', SAT, 'acknowledged')
    setBidState('rocky', SAT, 'refused')
    publish(5)
    expect(recs('plasma', SAT).some(r => r.kind === 'request')).toBe(false)
    expect(recs('rocky', SAT).filter(r => r.kind === 'request')).toHaveLength(1)
  })

  it('weekday work never replaces a bid — that stays the schedule\'s own warning', () => {
    setRole('admin')
    // whoever stands Monday's desk: bid them LL that day
    const sdo = String(DAYS[0].dutywaves[0].rows[0].id ?? '')
    expect(sdo).not.toBe('')
    expect(setCell(sdo, MON, 'LL')).toBe(true)
    publish(0)
    expect(recs(sdo, MON).filter(r => r.kind === 'request')).toHaveLength(1)
  })
})
