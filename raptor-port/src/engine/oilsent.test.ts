/* [OIL-SEATS-CAN-EARN] STEP 9a — who is behind a placeholder, answered by ONE
   body, on every day, and held still once the day has gone out.
   Plan: docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md §4, §5 step 9.

   D27: the pucks are a SCHEDULING feature. Dropped anywhere, they work out who
   would attend and show the count — whether or not the day earns OIL and
   whether or not the earn mode is on. Until now the count existed only on a
   weekend, inside the mode, because the whole answer was a by-product of
   working out the money.

   D44: who was behind a puck is FROZEN at publication on EVERY day, earning or
   not. The issued schedule keeps the people it went out with; the working copy
   shows today's answer; the difference raises the ordinary pending mark and the
   scheduler amends or publishes the end-of-day version. That is the owner's own
   correction of this build's first answer, and the fact that settled it is one
   the code could not supply: the squadron reviews every change at the close of
   the day, so a pending mark for a changed crowd is the signal their process
   runs on, not noise.

   AND THE RESOLVER IS NOT "FROZEN IF PRESENT, ELSE LIVE" (OSE-T-02). That would
   break D44 on the snapshots that ALREADY EXIST: a day issued before this build
   recorded no membership at all on a non-earning day, and older duty and sim
   placeholders have no entry either. Falling back to live would let an ISSUED
   version change its own count the moment somebody filed leave — the one thing
   D44 forbids. So a block says whether it records membership at all; one that
   does not says "membership not recorded" and nothing is invented for it. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { HOOKS } from './hooks'
import { SCHED } from './publish'
import { ensureRowIds } from './rowids'
import { rowItemKey, inputItemKey } from './oil'
import { oilEvidence, oilSentOf, type OilEvidence } from './oilev'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5, TUE = 1
const SAT_ISO = '2026-07-18', TUE_ISO = '2026-07-14'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel
const CROWD = ['bane', 'stiff', 'plasma']

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}
  for (const di of [SAT, TUE]) {
    Object.assign(DAYS[di] as any, { waves: [], dutywaves: [], sims: {}, ground: [], allhands: [], oild: undefined })
  }
  ensureRowIds(DAYS)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : di === TUE ? TUE_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => CROWD.slice()
})
afterEach(() => { HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel })

const puckRow = (di: number, who = 'allavail') => {
  ;(DAYS[di] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who }]
  ensureRowIds(DAYS)
  return rowItemKey((DAYS[di] as any).ground[0].rid)
}

describe('the day writes down who is behind each puck — on EVERY day (D27, D44)', () => {
  it('a WEEKEND records it, as it always did', () => {
    const item = puckRow(SAT)
    expect(oilEvidence(SAT).sent[item]).toEqual(CROWD)
  })

  it('A WEEKDAY RECORDS IT TOO — the count is a scheduling fact, not a money one', () => {
    const item = puckRow(TUE)
    const ev = oilEvidence(TUE)
    expect(ev.earns, 'a Tuesday earns nobody anything').toBe(false)
    expect(ev.sent[item], 'and it still knows who would attend').toEqual(CROWD)
  })

  it('a day with no puck on it writes nothing down, so an ordinary day is unchanged', () => {
    puckRow(TUE, 'bane')
    expect(Object.keys(oilEvidence(TUE).sent)).toEqual([])
  })

  it('a duty desk and a sim row record theirs as well', () => {
    Object.assign(DAYS[TUE] as any, {
      dutywaves: [{ label: 'DUTIES', rows: [{ role: 'SDO', id: 'allavail', str: '0700', end: '1900' }] }],
      sims: { amt: [{ str: '1300', end: '1500', p: 'allavail', w: '' }] },
    })
    ensureRowIds(DAYS)
    const ev = oilEvidence(TUE)
    expect(ev.sent[rowItemKey((DAYS[TUE] as any).dutywaves[0].rows[0].rid)]).toEqual(CROWD)
    expect(ev.sent[rowItemKey((DAYS[TUE] as any).sims.amt[0].rid)]).toEqual(CROWD)
  })
})

describe('ONE body answers "who is behind this puck" (Fable correction 2)', () => {
  it('it hands back the people the day wrote down', () => {
    const item = puckRow(SAT)
    const got = oilSentOf(oilEvidence(SAT), item)
    expect(got.people).toEqual(CROWD)
    expect(got.state, 'the day wrote this seat down').toBe('resolved')
  })

  it('a seat with no puck on it says so — nothing is missing', () => {
    const ev = oilEvidence(SAT)
    const got = oilSentOf(ev, 'r:nothing-here')
    expect(got.people).toEqual([])
    expect(got.state, 'there is simply no puck there').toBe('none')
  })

  it('A PUCK NOBODY IS FREE FOR IS A REAL ANSWER, not an absence', () => {
    /* the difference that decides whether the screen says "0" or says nothing:
       an empty LIST means the rules looked and found nobody; no list at all
       means they never looked. */
    const item = puckRow(SAT)
    HOOKS.oilSentinel = () => []
    const got = oilSentOf(oilEvidence(SAT), item)
    expect(got.people).toEqual([])
    expect(got.state, 'the day looked, and the answer was nobody').toBe('resolved')
  })

  it('AN OLDER ISSUED BLOCK SAYS SO, rather than having an answer invented for it (OSE-T-02)', () => {
    /* a block frozen by a build that did not record membership on every day.
       Falling back to today's availability here is exactly what D44 forbids —
       the issued day's count would move the moment somebody filed leave. */
    const old = { iso: SAT_ISO, earns: false, d: {}, inputs: [], sent: {} } as OilEvidence
    const got = oilSentOf(old, 'r:anything')
    expect(got.people, 'nothing is invented').toEqual([])
    expect(got.state, 'and the caller is told it does not know').toBe('unrecorded')
  })

  it('an older block that DID record the day\'s membership still answers from it', () => {
    /* earning days have carried their membership all along — those entries stay
       good and must not be thrown away with the ones that are missing */
    const old = { iso: SAT_ISO, earns: true, d: {}, inputs: [], sent: { 'r:x': ['bane'] } } as OilEvidence
    const got = oilSentOf(old, 'r:x')
    expect(got.people).toEqual(['bane'])
    expect(got.state).toBe('resolved')
  })
})

describe('the issued day holds its people still (D44)', () => {
  it('a change in who is available never moves a block that has been written', () => {
    const item = puckRow(SAT)
    const frozen = oilEvidence(SAT)
    HOOKS.oilSentinel = () => ['bane']                    // three of them file leave
    expect(oilSentOf(frozen, item).people, 'the block is the record').toEqual(CROWD)
    expect(oilEvidence(SAT).sent[item], 'while the working copy shows today\'s answer').toEqual(['bane'])
  })
})

describe('a request row\'s crowd is written down the same way (step 6)', () => {
  it('on a weekday as well as a weekend', () => {
    INPUTS.unshift({ iid: 'rq9', person: 'bane', type: 'Training', date: 'Jul 14', yr: 2026,
      acc: 'g', allday: false, s: 9 * 60, e: 17 * 60, remarks: '', mod: 'now', oil: {} })
    ;(DAYS[TUE] as any).ground = [{ prog: 'Training', str: '0900', end: '1700', who: 'bane', src: 'rq9', more: ['allavail'] }]
    ensureRowIds(DAYS)
    expect(oilEvidence(TUE).sent[inputItemKey('rq9')]).toEqual(CROWD)
  })
})
