// [GLOBAL-UNDO] §6.6 — oilCreditBidAgainst(di): the Unpublish button's warn. True
// when withdrawing a published day's OIL credit would push a credited person's OIL
// balance negative (a bid was spent against it). Same harness as oilsync.test.ts.
import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, signOf, setDayApproved } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore } from '../state/store'
import { projectPeople } from './state/raptorRoster'
import { getState, initStore as lwInitStore, setBidState, setCell, setPeople, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { oilCreditBidAgainst, runOilPass } from './sync'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
const SAT_DI = 5           // the seed Saturday (2026-07-18): plasma stands SDO, earns FO
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }

beforeEach(() => {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  stashClear()
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  setRole('admin')
})

describe('oilCreditBidAgainst — the §6.6 warn', () => {
  it('is FALSE when the credited person has not overspent their OIL', () => {
    sign(SAT_DI); setDayApproved(SAT_DI, true)
    runOilPass()                                  // plasma earns FO (1) on the Saturday
    expect(getState().wars[0].grid['plasma']?.['2026-07-18']).toBe('FO')
    expect(oilCreditBidAgainst(SAT_DI)).toBe(false)
  })

  it('is TRUE once the credit has been bid against (an approved OIL day drawn)', () => {
    sign(SAT_DI); setDayApproved(SAT_DI, true)
    runOilPass()
    // plasma (opening OIL 0) spends their whole earned OIL on an approved OIL day:
    // balance 0, so withdrawing the Saturday's FO credit would put it at −1.
    setCell('plasma', '2026-07-20', 'OIL')
    setBidState('plasma', '2026-07-20', 'approved')
    expect(oilCreditBidAgainst(SAT_DI)).toBe(true)
  })

  it('is FALSE for a still-draft day (no credit to withdraw)', () => {
    expect(oilCreditBidAgainst(SAT_DI)).toBe(false)
  })
})
