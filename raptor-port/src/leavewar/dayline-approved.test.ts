/* HIS D1296 ON AN APPROVED LEAVE ([LW-DAYLINE-PLACED-BID], the batch's own walk, 24 Oct 26). The admin's "Approve what I
   enter" is ticked as a window opens (D1186), so the bid he places is approved as it is placed and becomes a leave on the
   Inputs page; the window reopened on that day drew NO day line at all — the store's what-if left the day out, because a
   second write over an approved leave is refused. D1296: a window opened on a day that already holds the bid shows that
   day's manning as it now stands, the bid counted. Through the real door: the approval writes the Input, the war reads it
   back as an absence, and the line is asked through `sync.ts bidDayLine` as the window asks it. */
import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS, idsOf } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore } from '../state/store'
import { projectPeople } from './state/raptorRoster'
import { availRules, cellProblem, getState, initStore as lwInitStore, setBidState, setCell, setPeople, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { bidDayLine, installAbsenceDoor, syncAbsences } from './sync'
import { availHave } from './engine/availrows'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
const DAY = '2026-02-11'

beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0
  JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  stashClear()
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  installAbsenceDoor()
  setRole('admin')
})

const availP = () => { const st = getState(); return availHave(availRules().p, st.people, st.grid, st.states, DAY, st.views) }

describe('the day line on an approved leave (D1296)', () => {
  it('a window reopened on his approved leave reads the day as it stands — a line, never none', () => {
    const pilot = getState().people.find(p => p.seat === 'pilot' && !p.san && !getState().views[p.id]?.[DAY])!
    const free = availP()
    expect(setCell(pilot.id, DAY, 'LL')).toBe(true)
    setBidState(pilot.id, DAY, 'approved')
    syncAbsences()
    expect(INPUTS.some((r: any) => idsOf(r).includes(pilot.id) && r.type === 'LL'), 'the approval wrote the leave on the Inputs page').toBe(true)
    expect(availP(), 'the leave counts him out').toBe(free - 1)
    expect(cellProblem(pilot.id, DAY, 'LL'), 'a second write over the approved leave is refused').toBeTruthy()
    const days = bidDayLine(pilot.id, [DAY], 'LL')
    expect(days, 'the reopened window still has its line').toHaveLength(1)
    expect(days[0]!.standing).toBe(true)
    expect(days[0]!.avail).toMatchObject({ seat: 'p', before: free - 1, after: free - 1 })
  })

  it('a day refused for another reason, with him not away, still draws no line', () => {
    const pilot = getState().people.find(p => p.seat === 'pilot' && !p.san && !getState().views[p.id]?.[DAY])!
    expect(bidDayLine(pilot.id, ['1999-01-01'], 'LL')).toEqual([])
  })
})
