/* [ABSENCE-SMALL-SEEN] 1 (28 Sep 26) — EVERY CLASH LINE NAMES WHERE IT CAN BE UNDONE. The Leave War's clash strip said
   "— resolve on the sheet" on every line, but when the leave in the way was filed on the Inputs page the day's sheet has
   no control for it (it says "Change it on the Inputs page"), and once a war is published its approved leave cannot be
   sent back from the sheet either (21 Sep 26: published leave is finished paperwork). Found by the absence-record
   re-test (W6 N2). One test per holder of the day — a bid, leave the war approved, the same once the war is published,
   leave filed on the Inputs page — each on the strip the admin reads, not only in the list behind it.

   Same harness as oilsync.test.ts: both real stores, headless, the seed Saturday (plasma stands SDO 0800–1800). */
import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, signOf, setDayApproved } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore } from '../state/store'
import { projectPeople } from './state/raptorRoster'
import { advanceStage, getState, initStore as lwInitStore, reopenStage, setBidState, setCell, setPeople, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { getClashes, installAbsenceDoor, runOilPass, syncAbsences } from './sync'
import { StageBar } from './ui/Chrome'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
const SAT = '2026-07-18'

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

const publishSat = () => {
  const g = signOf(5)
  g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
  setDayApproved(5, true)
  runOilPass()
}
/* the one clash on plasma's Saturday, and the line the admin reads for it */
const theClash = () => {
  const mine = getClashes().filter(c => c.person === 'plasma' && c.date === SAT)
  expect(mine, 'one clash on the Saturday').toHaveLength(1)
  return mine[0]!
}
const stripLine = () => {
  const { container, unmount } = render(<StageBar />)
  const row = [...container.querySelectorAll('[data-testid="sync-clashes"] .row')].map(r => r.textContent || '').find(t => /18 Jul 26/.test(t))
  unmount()
  expect(row, 'the strip carries the Saturday').toBeTruthy()
  return row!
}
const stageTo = (want: string) => {
  for (let i = 0; i < 4 && getState().period.stage !== want; i++) {
    const order = ['draft', 'open', 'closed', 'published']
    if (order.indexOf(getState().period.stage) < order.indexOf(want)) advanceStage(); else reopenStage()
  }
  expect(getState().period.stage).toBe(want)
}

describe('every clash line names where it can be undone', () => {
  it('a bid in the way: decide the bid on the sheet', () => {
    setCell('plasma', SAT, 'LL')                       // an undecided bid; July is outside the seed bid window, admin writes it
    publishSat()
    const c = theClash()
    expect(c.kind).toBe('duty')
    expect(c.wayOut).toBe('bid')
    expect(stripLine()).toMatch(/— decide the bid on the sheet$/)
  })

  it('leave the war approved: send it back or delete it on the sheet', () => {
    stageTo('closed')
    setCell('plasma', SAT, 'LL')
    setBidState('plasma', SAT, 'approved')             // the absence door writes the Input, carrying the war's mark
    expect(INPUTS.some((r: any) => r.person === 'plasma' && r.lw), 'the approval wrote war-approved leave').toBe(true)
    publishSat()
    expect(theClash().wayOut).toBe('war')
    expect(stripLine()).toMatch(/— send the leave back or delete it on the sheet$/)
  })

  it('the same leave once the war is published: the sheet offers neither, so step the war back', () => {
    stageTo('closed')
    setCell('plasma', SAT, 'LL')
    setBidState('plasma', SAT, 'approved')
    stageTo('published')
    publishSat()
    expect(theClash().wayOut).toBe('war-published')
    expect(stripLine()).toMatch(/— the leave is published: step the war back to BIDDING CLOSED to change it$/)
  })

  it('leave filed on the Inputs page: change it there — the sheet has no control for it', () => {
    INPUTS.push({ iid: 'cwo-ll-1', person: 'plasma', type: 'LL', date: 'Jul 18', yr: 2026, allday: true, remarks: '', mod: 'now' })
    syncAbsences()
    publishSat()
    expect(theClash().wayOut).toBe('inputs')
    const line = stripLine()
    expect(line).toMatch(/— change the leave on the Inputs page$/)
    expect(line, 'never the old words that sent him to an empty sheet').not.toMatch(/resolve on the sheet/)
  })
})
