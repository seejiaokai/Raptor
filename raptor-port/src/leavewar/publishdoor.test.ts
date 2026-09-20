// THE PUBLISH DOOR ([ARCH-STACK] step 4).
//
// REWRITTEN 20 Sep 26 to the owner's answer on the last of the three open
// questions: publishing a weekend / PH day no longer THROWS AWAY an undecided
// leave bid it overlaps — it flags the day and says so. It used to remove the
// clashing part and leave a "the schedule took your bid" notice, while a bid
// placed AFTER the publish was kept and flagged: the same two facts, opposite
// outcomes decided only by which came first. Owner: "keep the bid and flag the
// day, both ways."
//
// So this file now pins the OPPOSITE of what it pinned this morning, and that
// is the point — the old expectations WERE the rule, and they move with it.
// Sets aside the second half of clash check B5 ("publishing is the door that
// replaces an undecided bid, so undo of the publish brings the bid back");
// with nothing removed there is nothing to bring back.
//
// The amber is not built here: the OIL credit lands on the day regardless, and
// a credit overlapping an undecided bid is already a forbidden pair. Weekday
// work still never reaches the war.
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
import { advanceStage, getState, initStore as lwInitStore, lwHistInit, rawState, setBidState, setCell, setPeople, setRole } from './state/store'
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

describe('publishing weekend work FLAGS a clashing leave bid (owner, 20 Sep 26)', () => {
  it('the bid stays live, no notice is left, the OIL credit lands, and the day flags', () => {
    setRole('admin')
    expect(setCell('plasma', SAT, 'LL')).toBe(true)
    publish(5)
    runOilPass()
    const list = recs('plasma', SAT)
    // The bid is untouched — that is the whole ruling.
    expect(list.filter(r => r.kind === 'request')).toHaveLength(1)
    // Nothing was taken, so there is nothing to tell the person they lost.
    expect(list.some(r => r.kind === 'notice')).toBe(false)
    expect(list.some(r => r.kind === 'credit')).toBe(true)
    // …and the day carries the amber, which is what an admin acts on.
    const v = getState().views['plasma']?.[SAT]
    expect(v?.amber).toBe(true)
    expect(v?.conflicts.length).toBeGreaterThan(0)
  })

  it('the admin is told at the moment of publishing, in words that say the bid is still live', () => {
    setRole('admin')
    expect(setCell('plasma', SAT, 'LL')).toBe(true)
    publish(5)
    const msg = said.find(m => m.includes('bid on 18 Jul'))
    expect(msg).toBeDefined()
    expect(msg).toContain('still live')
    expect(msg).not.toMatch(/replac/i)
  })

  it('undo and redo of the publish leave the bid exactly where it was', () => {
    // B5's other half goes with the first: nothing is removed, so there is
    // nothing for an undo to bring back.
    setRole('admin')
    expect(setCell('plasma', SAT, 'LL')).toBe(true)
    publish(5)
    expect(recs('plasma', SAT).filter(r => r.kind === 'request')).toHaveLength(1)
    expect(globalUndo().ok).toBe(true)
    expect(recs('plasma', SAT).filter(r => r.kind === 'request')).toHaveLength(1)
    expect(globalRedo().ok).toBe(true)
    expect(recs('plasma', SAT).filter(r => r.kind === 'request')).toHaveLength(1)
  })

  it('an acknowledged bid is kept too; a refused one is neither touched nor mentioned', () => {
    setRole('admin')
    expect(setCell('plasma', SAT, 'LL')).toBe(true)
    expect(setCell('rocky', SAT, 'OL')).toBe(true)
    advanceStage()
    setBidState('plasma', SAT, 'acknowledged')
    setBidState('rocky', SAT, 'refused')
    said = []
    publish(5)
    expect(recs('plasma', SAT).filter(r => r.kind === 'request')).toHaveLength(1)
    expect(recs('rocky', SAT).filter(r => r.kind === 'request')).toHaveLength(1)
    // A refused bid blocks nothing and is nobody's decision to make again.
    expect(said.join(' ')).not.toContain('rocky')
  })

  it('a bid placed AFTER the publish lands the same way — that symmetry is the point', () => {
    setRole('admin')
    publish(5)
    runOilPass()
    expect(setCell('plasma', SAT, 'LL')).toBe(true)
    expect(recs('plasma', SAT).filter(r => r.kind === 'request')).toHaveLength(1)
    expect(getState().views['plasma']?.[SAT]?.amber).toBe(true)
  })

  it('weekday work still never reaches the war', () => {
    setRole('admin')
    // whoever stands Monday's desk: bid them LL that day
    const sdo = String(DAYS[0].dutywaves[0].rows[0].id ?? '')
    expect(sdo).not.toBe('')
    expect(setCell(sdo, MON, 'LL')).toBe(true)
    said = []
    publish(0)
    expect(recs(sdo, MON).filter(r => r.kind === 'request')).toHaveLength(1)
    expect(said.join(' ')).not.toContain('bid on')
  })
})
