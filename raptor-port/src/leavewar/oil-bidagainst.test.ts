// [GLOBAL-UNDO] §6.6 — oilCreditBidAgainst(di): the Unpublish button's warn. True
// when withdrawing a published day's OIL credit would push a credited person's OIL
// balance negative (a bid was spent against it). Same harness as oilsync.test.ts.
import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, signOf, setDayApproved, dayCurVer, verLabel } from '../engine/publish'
import { commitPublishALDay, commitUnpublish } from '../state/sched-commit'
import { setSession } from '../state/auth'
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

/* [UNPUB-WARN-AL-RESTORES] (Astra's F2 on [OIL-WORK-START], 6 Oct 26 — built 20 Oct 26). Withdrawing an AMENDMENT does
   not leave the day earning nothing: the version before it is the issued schedule again and ITS OIL pays. The warning
   used to rebuild the balance with the day's credit simply left out, so it warned on a withdrawal that RAISED his balance.
   It now rebuilds it with the credit the surviving version carries. Astra's checks, each: an ORIGINAL withdrawn (above);
   an AL withdrawn to a higher, a lower and an equal credit; to a version that credits him nothing; and a credit that
   never landed (above). The day is published through the app's own publish path and the credit landed by the pass. */
describe('oilCreditBidAgainst — an AMENDMENT withdrawn puts the earlier version\'s OIL back', () => {
  const sdo = () => (DAYS[SAT_DI] as any).dutywaves[0].rows[0]
  const times = (str: string, end: string) => { sdo().str = str; sdo().end = end }
  const FULL = ['0800', '1800'] as const, HALF = ['0800', '1200'] as const, FULL2 = ['0700', '1800'] as const
  const publishTwice = (orig: readonly [string, string], al: readonly [string, string]) => {
    times(...orig); sign(SAT_DI); setDayApproved(SAT_DI, true); runOilPass()
    times(...al); sign(SAT_DI); commitPublishALDay(SAT_DI); runOilPass()
    expect(dayCurVer(SAT_DI) && verLabel(dayCurVer(SAT_DI)), 'AL1 is the issued schedule').toBe('AL1')
  }
  const spendOneDay = () => { setCell('plasma', '2026-07-20', 'OIL'); setBidState('plasma', '2026-07-20', 'approved') }
  const cell = () => getState().wars[0].grid['plasma']?.['2026-07-18']
  beforeEach(() => { setSession({ user: 'ad', role: 'admin' }) })

  it('to a HIGHER credit (the Original a full day, AL1 a half): no warning — his balance goes up', () => {
    publishTwice(FULL, HALF)
    expect(cell(), 'AL1 pays a half day').toBe('HO')
    spendOneDay()
    expect(oilCreditBidAgainst(SAT_DI), 'the Original\'s full day comes back: 0.5 − 1 → 1 − 1').toBe(false)
  })

  it('to a LOWER credit (the Original a half, AL1 a full day): it warns — his balance would go below zero', () => {
    publishTwice(HALF, FULL)
    expect(cell()).toBe('FO')
    spendOneDay()
    expect(oilCreditBidAgainst(SAT_DI), '1 − 1 → 0.5 − 1').toBe(true)
  })

  it('to an EQUAL credit (a full day both times): no warning — nothing he holds changes', () => {
    publishTwice(FULL, FULL2)
    expect(cell()).toBe('FO')
    spendOneDay()
    expect(oilCreditBidAgainst(SAT_DI)).toBe(false)
  })

  it('to a version that credits him nothing (AL1 put him on the desk): it warns', () => {
    sdo().id = ''; times(...FULL); sign(SAT_DI); setDayApproved(SAT_DI, true); runOilPass()
    expect(cell(), 'the Original credits nobody — nobody is on the desk').toBeUndefined()
    sdo().id = 'plasma'; sign(SAT_DI); commitPublishALDay(SAT_DI); runOilPass()
    expect(verLabel(dayCurVer(SAT_DI))).toBe('AL1')
    expect(cell(), 'AL1 credits him').toBe('FO')
    spendOneDay()
    expect(oilCreditBidAgainst(SAT_DI)).toBe(true)
  })

  it('and the withdrawal itself lands what the warning reckoned: the Original\'s full day', () => {
    publishTwice(FULL, HALF)
    spendOneDay()
    commitUnpublish(SAT_DI); runOilPass()
    expect(verLabel(dayCurVer(SAT_DI)), 'the Original is the issued schedule again').toBe('Original')
    expect(cell(), 'its full day is credited again').toBe('FO')
  })
})
