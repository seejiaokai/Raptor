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

  it('is FALSE when the landed credit is still fully in the balance, clash or no clash', () => {
    /* This used to read "the credit CLASHED so it never landed" (Fable#5 /
       GU-P2-009). The owner's 20 Sep 26 ruling banks the credit even when it
       overlaps the leave, so there IS a landed credit here now. The guard the
       test exists for still holds and is the point: the warning fires only
       when withdrawing the credit would push the balance BELOW zero, i.e.
       when the credit has already been bid against. It has not been, so the
       answer is still FALSE — by the balance rule rather than by absence. */
    setCell('plasma', '2026-07-18', 'LL')
    setBidState('plasma', '2026-07-18', 'approved')
    sign(SAT_DI); setDayApproved(SAT_DI, true)
    runOilPass()
    const v = getState().wars[0].views['plasma']?.['2026-07-18']!
    expect(v.all.some(c => c.kind === 'credit')).toBe(true)      // the credit is banked now
    expect(oilCreditBidAgainst(SAT_DI)).toBe(false)              // nothing spent against it
  })
})
