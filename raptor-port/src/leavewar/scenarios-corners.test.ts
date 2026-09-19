// [ARCH-STACK] step 4 — SCENARIOS for the nastier corners (20 Sep 26 bug
// hunt): halves decided across doors (the drag/bulk decide must not read a day
// as done because a filed leave sits on top of an undecided bid — the bug this
// file caught), two wars, a medical swallowing a whole leave, publishing and
// amending a weekend day, "OK, seen" permissions and undo, and the OIL pass's
// fixed point around absences.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { DAYS } from '../engine/data'
import { SCHED, signOf } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore, writeInputs, writeText } from '../state/store'
import { commitSetDayApproved, commitPublishALDay } from '../state/sched-commit'
import { setSession, setMe } from '../state/auth'
import { projectPeople } from './state/raptorRoster'
import {
  ackReplacement, advanceStage, changeAbsenceById, getState, initStore as lwInitStore, lwHistInit,
  moveAbsenceById, moveCells, rawState, setBidState, setBidStates, setCell, setCellRange, setPeople,
  setRole, setViewer,
} from './state/store'
import { memoryBackend } from './state/storage'
import { runOilPass, wireLeaveWarSync } from './sync'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
const toast = HOOKS.toast
let said: string[] = []

beforeEach(() => {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  stashClear()
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore(); lwInitStore(memoryBackend()); setPeople(projectPeople()); wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  said = []; HOOKS.toast = (m: any) => { said.push(String(m)) }
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); setSession(null); setMe('bane'); setViewer(null) })

let n = 0
const file = (person: string, type: string, date: string, extra: Record<string, any> = {}) => {
  const row: any = { iid: `z${++n}`, person, type, date, yr: 2026, allday: true, remarks: '', mod: '2026-02-01', ...extra }
  if (row.allday === false) delete row.allday
  const ok = writeInputs(() => { INPUTS.unshift(row) })
  return { ok, row }
}
const grid = (p: string, d: string) => getState().grid[p]?.[d]
const warOf = (d: string) => getState().wars.find(w => w.period.start <= d && d <= w.period.end)!
const gridIn = (p: string, d: string) => warOf(d).grid[p]?.[d]
const recsIn = (p: string, d: string) => (rawState().wars.find(w => w.period.start <= d && d <= w.period.end)!.recs[p]?.[d] ?? [])
const lwRows = (p: string) => INPUTS.filter((r: any) => r.person === p && r.lw)
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }

describe('halves across doors', () => {
  it('a morning bid approved beside an afternoon leave already filed: both stand, the day charges once per half', () => {
    setRole('admin')
    file('ammo', 'OIL', 'Feb 10', { allday: false, half: 'pm', s: 721, e: 1439 })
    expect(setCell('ammo', '2026-02-10', '*LL')).toBe(true)
    advanceStage()
    setBidState('ammo', '2026-02-10', 'approved')
    const v = getState().views.ammo['2026-02-10']!
    expect(v.all.filter(c => c.kind === 'absence')).toHaveLength(2)
    expect(v.charges.map(c => c.amount)).toEqual([0.5, 0.5])
    expect(v.amber).toBe(false)
  })
})

describe('two wars', () => {
  it('a bid in the SECOND war is replaced by a filing on that date, not the first war\'s', () => {
    setRole('admin')
    const second = getState().wars.find(w => w.period.start.startsWith('2027'))
    expect(second, 'the seed holds a 2027 war').toBeTruthy()
    const d = second!.period.start.slice(0, 8) + '15'      // mid-January 2027
    expect(setCell('ammo', d, 'LL')).toBe(true)
    expect(recsIn('ammo', d).some(r => r.kind === 'request')).toBe(true)
    file('ammo', 'ATT C', `Jan 15 2027`)
    expect(recsIn('ammo', d).some(r => r.kind === 'request')).toBe(false)
    expect(recsIn('ammo', d).some(r => r.kind === 'notice')).toBe(true)
    expect(gridIn('ammo', d)).toBe('ATTC')
  })

  it('moving approved leave into the next war is refused', () => {
    setRole('admin')
    setCell('ammo', '2026-12-30', 'LL'); advanceStage()
    setBidState('ammo', '2026-12-30', 'approved')
    const iid = String(lwRows('ammo')[0].iid)
    const r = moveAbsenceById('ammo', '2026-12-30', iid, '2027-01-05')
    expect(typeof r).toBe('string')
    expect(lwRows('ammo')[0].date).toBe('Dec 30')
  })
})

describe('a medical that swallows a whole leave', () => {
  it('removes the leave entirely, and undo brings it back', () => {
    file('rocky', 'LL', 'Feb 10', { endDate: 'Feb 11' })
    expect(file('rocky', 'ATT C', 'Feb 09', { endDate: 'Feb 13' }).ok).toBe(true)
    expect(INPUTS.filter((r: any) => r.person === 'rocky' && r.type === 'LL')).toHaveLength(0)
    expect(globalUndo().ok).toBe(true)
    expect(INPUTS.filter((r: any) => r.person === 'rocky' && r.type === 'LL')).toHaveLength(1)
    expect(grid('rocky', '2026-02-10')).toBe('LL')
  })

  it('a cut keeps the moved marks of the days that survive', () => {
    setRole('admin')
    setCellRange('ammo', '2026-02-09', '2026-02-11', 'LL')
    advanceStage()
    setBidStates(['2026-02-09', '2026-02-10', '2026-02-11'].map(d => ({ personId: 'ammo', date: d })), 'approved')
    expect(moveCells([{ personId: 'ammo', date: '2026-02-09' }], 5)).toBe('moved')   // 9 -> 14, dotted
    expect(getState().views.ammo['2026-02-14']!.main!.movedFrom).toBe('2026-02-09')
    file('ammo', 'ATT C', 'Feb 10')                                                   // cuts the 10th out
    expect(getState().views.ammo['2026-02-14']!.main!.movedFrom).toBe('2026-02-09')
    expect(grid('ammo', '2026-02-11')).toBe('LL')
  })
})

describe('publishing an amendment (the AL path)', () => {
  it('a bid placed AFTER the publish is refused at the bid door (B5)', () => {
    setRole('admin')
    sign(5); commitSetDayApproved(5, true)
    runOilPass()
    expect(setCell('plasma', '2026-07-18', 'LL')).toBe(false)     // plasma is recorded as working it
  })

  it('an AL that puts someone NEW on that Saturday replaces their bid too', () => {
    setRole('admin')
    expect(setCell('rocky', '2026-07-18', 'LL')).toBe(true)
    sign(5); commitSetDayApproved(5, true)
    expect(recsIn('rocky', '2026-07-18').some(r => r.kind === 'request'), 'rocky has no work yet').toBe(true)
    // the amendment: rocky is put on the Saturday duty desk
    ;(DAYS[5] as any).dutywaves[0].rows.push({ role: 'SDO 2', id: 'rocky', str: '0800', end: '1800' })
    writeText('dn:5.0', 'an amendment')
    sign(5); commitPublishALDay(5)
    expect(recsIn('rocky', '2026-07-18').some(r => r.kind === 'request')).toBe(false)
    expect(recsIn('rocky', '2026-07-18').some(r => r.kind === 'notice')).toBe(true)
  })
})

describe('"OK, seen"', () => {
  it('an admin may clear someone else\'s notice, a member may not clear another\'s, and undo restores it', () => {
    setRole('admin'); setCell('ammo', '2026-02-10', 'LL')
    file('ammo', 'ATT C', 'Feb 10')
    const notice = recsIn('ammo', '2026-02-10').find(r => r.kind === 'notice') as any
    setRole('member'); setViewer('rocky')
    expect(ackReplacement('ammo', notice.id)).toBe(0)
    setRole('admin')
    expect(ackReplacement('ammo', notice.id)).toBe(1)
    expect(globalUndo().ok).toBe(true)
    expect(recsIn('ammo', '2026-02-10').some(r => r.kind === 'notice')).toBe(true)
  })
})

describe('the OIL pass is idempotent around absences', () => {
  it('removing the leave lets the credit appear on the next pass; running twice changes nothing', () => {
    const sat = '2026-07-18'
    setRole('admin')
    file('plasma', 'LL', 'Jul 18')
    sign(5); commitSetDayApproved(5, true)
    runOilPass()
    expect(recsIn('plasma', sat).some(r => r.kind === 'credit')).toBe(false)
    const row = INPUTS.find((r: any) => r.person === 'plasma' && r.type === 'LL')!
    writeInputs(() => { INPUTS.splice(INPUTS.indexOf(row), 1) })
    runOilPass()
    const once = JSON.stringify(recsIn('plasma', sat))
    expect(recsIn('plasma', sat).some(r => r.kind === 'credit')).toBe(true)
    runOilPass()
    expect(JSON.stringify(recsIn('plasma', sat))).toBe(once)
  })
})

void changeAbsenceById; void said
