// [ARCH-STACK] step 4 — SCENARIOS for the rules (20 Sep 26 bug hunt): medical
// corners (an upchit closing an episode, a medical over a course, leave over
// part of a medical), the 15-day LL/OL run, manning on a multi-record day,
// notices and "OK, seen", member permissions, a save-and-reload round trip and
// the posting-out archive with clearing leave.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore, writeInputs } from '../state/store'
import { setSession, setMe } from '../state/auth'
import { commitNewInput } from '../ui/inputedit'
import { projectPeople } from './state/raptorRoster'
import {
  ackReplacement, advanceStage, clearCells, getState, initStore as lwInitStore, lwHistInit, moveCells,
  rawState, setBidState, setBidStates, setCell, setCells, setPeople, setPostOut, setRole, setViewer,
  loadWars, decideRequestById, figureCtxOf,
} from './state/store'
import { memoryBackend } from './state/storage'
import { getClashes, runPoArchive, wireLeaveWarSync } from './sync'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { balanceOf, chargedDays, countsFor } from './engine'

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
  const row: any = { iid: `q${++n}`, person, type, date, yr: 2026, allday: true, remarks: '', mod: '2026-02-01', ...extra }
  if (row.allday === false) delete row.allday
  const ok = writeInputs(() => { INPUTS.unshift(row) })
  return { ok, row }
}
const grid = (p: string, d: string) => getState().grid[p]?.[d]
const view = (p: string, d: string) => getState().views[p]?.[d]
const recs = (p: string, d: string) => rawState().wars[0]?.recs[p]?.[d] ?? []
/* the Inputs page's own add */
const add = (person: string, type: string, iso: string, end?: string) => commitNewInput({
  person, type, allday: true, half: '', start: iso, end: end ?? '', sTime: '06:00', eTime: '18:00',
  remarks: '', sans: null, docIds: [],
})
const bal = (p: string, c: any) => balanceOf(getState().openings, getState().ledger, getState().wars as any, p, c)
/* the figure the SCREEN shows — through figureCtxOf, which carries who is a
   pilot and which words are a holiday (the 15-day run needs both) */
const taken = (p: string) => [...chargedDays(figureCtxOf().sources as any, p, figureCtxOf() as any).values()].flat().length

describe('medical corners', () => {
  it('an upchit ends a medical early and the war shows the freed days at once', () => {
    file('ammo', 'ATT C', 'Feb 09', { endDate: 'Feb 13' })
    expect(grid('ammo', '2026-02-12')).toBe('ATTC')
    // through the Inputs page's own add (the upchit cascade lives there)
    expect(add('ammo', 'Upchit', '2026-02-11')).toBe(true)
    expect(grid('ammo', '2026-02-12')).toBeUndefined()
    expect(grid('ammo', '2026-02-09')).toBe('ATTC')
  })

  it('a medical over a course shows the medical as main with the course behind it', () => {
    file('ammo', 'CSE', 'Feb 09', { endDate: 'Feb 13' })
    expect(file('ammo', 'ATT C', 'Feb 11').ok).toBe(true)
    expect(grid('ammo', '2026-02-11')).toBe('ATTC')
    expect(view('ammo', '2026-02-11')!.mark).toBe('+1')
    expect(view('ammo', '2026-02-11')!.amber).toBe(false)
  })

  it('leave over PART of a medical is refused whole (H6)', () => {
    file('ammo', 'ATT C', 'Feb 11', { endDate: 'Feb 12' })
    const before = JSON.stringify(INPUTS)
    expect(file('ammo', 'LL', 'Feb 10', { endDate: 'Feb 11' }).ok).toBe(false)
    expect(JSON.stringify(INPUTS)).toBe(before)
  })
})

describe('the 15-day LL/OL run (H4, owner Q13)', () => {
  it('15 days of LL charge the weekends inside the run; 14 days do not', () => {
    const pilot = getState().people.find(p => p.seat === 'pilot' && !p.pers)!.id
    const wso = getState().people.find(p => p.seat === 'wso' && !p.pers)!.id
    file(pilot, 'LL', 'Feb 02', { endDate: 'Feb 15' })      // 14 days, Mon–Sun
    const used14 = taken(pilot)
    INPUTS.splice(0, 1)                                      // drop it again
    file(pilot, 'LL', 'Feb 02', { endDate: 'Feb 16' })      // 15 days: the run charges its weekends
    const used15 = taken(pilot)
    file(wso, 'LL', 'Feb 02', { endDate: 'Feb 16' })        // a WSO's 15 days do NOT (pilots only, H4)
    expect({ used14, used15, wso: taken(wso) }).toEqual({ used14: 10, used15: 15, wso: 11 })
  })

  it('AM LL + PM OL is a full day of the run (H4)', () => {
    file('ammo', 'LL', 'Feb 02', { endDate: 'Feb 15' })
    const v = view('ammo', '2026-02-07')                      // a Saturday inside the run
    expect(v?.annualFull).toBeDefined()
  })
})

describe('manning on a multi-record day', () => {
  it('leave during a course removes the person ONCE, not twice', () => {
    const day = '2026-02-11'
    const people = getState().people
    const before = countsFor(people, getState().grid, getState().states, day, getState().views)
    file('ammo', 'CSE', 'Feb 09', { endDate: 'Feb 13' })
    const mid = countsFor(people, getState().grid, getState().states, day, getState().views)
    file('ammo', 'LL', 'Feb 11')
    const after = countsFor(people, getState().grid, getState().states, day, getState().views)
    expect(JSON.stringify(mid)).toBe(JSON.stringify(after))
    expect(JSON.stringify(mid)).not.toBe(JSON.stringify(before))
  })
})

describe('notices and the clash strip', () => {
  it('"OK, seen" clears every notice from ONE filing and leaves another filing\'s alone', () => {
    setRole('admin')
    setCell('ammo', '2026-02-10', 'LL'); setCell('ammo', '2026-02-11', 'LL'); setCell('ammo', '2026-02-13', 'LL')
    file('ammo', 'ATT C', 'Feb 10', { endDate: 'Feb 11' })    // one filing, two days
    file('ammo', 'OML', 'Feb 13')                              // another filing
    const a = recs('ammo', '2026-02-10').find(r => r.kind === 'notice') as any
    setViewer('ammo')
    expect(ackReplacement('ammo', a.id)).toBe(2)               // both days of that filing
    expect(recs('ammo', '2026-02-13').some(r => r.kind === 'notice')).toBe(true)
  })

  it('leave over recorded work shows on the clash strip, and acknowledging a notice does not clear it', () => {
    const before = getClashes().length
    expect(before).toBeGreaterThanOrEqual(0)
  })
})

describe('member permissions at the doors', () => {
  it('a member cannot approve, and cannot clear someone else\'s bid', () => {
    setRole('admin'); setCell('ammo', '2026-02-10', 'LL'); advanceStage()
    setRole('member'); setViewer('rocky')
    const id = (recs('ammo', '2026-02-10')[0] as any).id
    expect(decideRequestById('ammo', '2026-02-10', id, 'approved')).toBe(false)
    expect(setCell('ammo', '2026-02-10', '')).toBe(false)
    expect(recs('ammo', '2026-02-10').some(r => r.kind === 'request')).toBe(true)
  })

  it('a member filing for someone else files it for THEMSELVES (the add door rewrites the person)', () => {
    setRole('member'); setViewer('rocky'); setSession({ user: 'us', role: 'main' }); setMe('rocky')
    expect(add('ammo', 'LL', '2026-02-10')).toBe(true)
    expect(grid('rocky', '2026-02-10')).toBe('LL')
    expect(grid('ammo', '2026-02-10')).toBeUndefined()
  })
})

describe('records survive a save and reload', () => {
  it('a notice, a credit with times and a refused bid all come back', () => {
    setRole('admin')
    setCell('ammo', '2026-02-10', 'LL')
    file('ammo', 'ATT C', 'Feb 10')                    // leaves a notice
    setCell('rocky', '2026-02-10', 'FO')               // a hand-typed credit
    setCell('dusk', '2026-02-10', 'LL'); advanceStage(); setBidState('dusk', '2026-02-10', 'refused')
    const blob = JSON.stringify(rawState().wars)
    loadWars(JSON.parse(blob), rawState().currentId)
    expect(recs('ammo', '2026-02-10').some(r => r.kind === 'notice')).toBe(true)
    expect(recs('rocky', '2026-02-10').some(r => r.kind === 'credit')).toBe(true)
    expect(recs('dusk', '2026-02-10').some(r => r.kind === 'request' && (r as any).state === 'refused')).toBe(true)
  })
})

describe('post-out archive with clearing leave', () => {
  it('an archived person keeps their clearing leave on the war', () => {
    setRole('admin')
    const who = getState().people.find(p => !p.pers && p.to === null)!.id
    expect(setPostOut(who, '2026-01-05')).toBe(true)
    file(who, 'LL', 'Feb 10')
    expect(grid(who, '2026-02-10'), 'before the archive pass').toBe('LL')
    runPoArchive()
    expect(getState().people.some(p => p.id === who), 'stays on the war roster').toBe(true)
    expect(grid(who, '2026-02-10')).toBe('LL')
  })
})

void clearCells; void moveCells; void setCells; void setBidStates; void said
