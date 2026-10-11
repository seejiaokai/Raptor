/* [OIL-SEATS-CAN-EARN] STEP 9a — who is behind a placeholder, answered by ONE
   body, on every day, and held still once the day has gone out.
   Plan: docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md §4, §5 step 9.

   D27: the pucks are a SCHEDULING feature. Dropped anywhere, they work out who
   would attend and show the count — whether or not the day earns OIL and
   whether or not the earn mode is on. Until now the count existed only on a
   weekend, inside the mode, because the whole answer was a by-product of
   working out the credit.

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
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, inpId, idsOf } from './inputs'
import { HOOKS } from './hooks'
import { SCHED } from './publish'
import { ensureRowIds } from './rowids'
import { rowItemKey, inputItemKey } from './oil'
import { oilEvidence, oilSentOf, type OilEvidence } from './oilev'
import { initStore } from '../state/store'
import { setSession, setMe, DEFAULT_ME } from '../state/auth'
import { commitInput, draftOf } from '../ui/inputedit'
import { rowPut, rowTake } from '../ui/reqdoor'
import { setOilAsk, setInpEdit } from '../ui/pops'

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

  it('A WEEKDAY RECORDS IT TOO — the count is a scheduling fact, not a credit one', () => {
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

/* SINCE THE ONE-RULE BUILD THE PLACEHOLDER ON A REQUEST'S ROW IS ONE OF THE INPUT'S OWN PEOPLE (owner D755, 11 Oct 26:
   "a row that came from an input IS the input: whoever stands on it … is in the input"; D753), so it is the INPUT that
   is asked, not its row (oilev.ts oilEvidence) — and a man NAMED in the input is never in its crowd: he is there as
   himself (D762; the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.7). In this describe the record is put
   straight into INPUTS — in step 2 of that build the doors refused a placeholder beside named people, and a fixture
   was the only way to have one. Step 3 (12 Oct 26 — owner D750, D753, D755) opened the doors; the describe after it
   writes the same membership down with the hands themselves. */
describe('an input\'s crowd is written down the same way — under the input\'s own address (step 6; D753, D755)', () => {
  const filed = (ids: string[]) => {
    INPUTS.unshift({ iid: 'rq9', type: 'Training', date: 'Jul 14', yr: 2026, acc: 'g', allday: false, s: 9 * 60, e: 17 * 60,
      remarks: '', mod: 'now', oil: {}, people: ids.map(p => ({ p })) })
    ;(DAYS[TUE] as any).ground = [{ prog: 'TRAINING', str: '0900', end: '1700', who: ids[0], more: ids.slice(1), src: 'rq9' }]
    ensureRowIds(DAYS)
  }

  it('on a weekday as well as a weekend — an input for ALL AVAIL alone: everyone who is free', () => {
    filed(['allavail'])
    expect(oilEvidence(TUE).sent[inputItemKey('rq9')]).toEqual(CROWD)
  })

  it('…and beside a named man: he is in the input as himself, never in its crowd', () => {
    filed(['bane', 'allavail'])
    expect(oilEvidence(TUE).sent[inputItemKey('rq9')]).toEqual(['stiff', 'plasma'])
  })

  /* (second pass, with step 3) ALL reads as ALL AVAIL does, and the order they joined in is no part of it */
  it('ALL beside a named man, and the placeholder first of the list: the same crowd, without him', () => {
    filed(['bane', 'all'])
    expect(oilEvidence(TUE).sent[inputItemKey('rq9')]).toEqual(['stiff', 'plasma'])
    INPUTS[0].people = [{ p: 'all' }, { p: 'bane' }]
    expect(oilEvidence(TUE).sent[inputItemKey('rq9')]).toEqual(['stiff', 'plasma'])
  })
})

/* THE SAME MEMBERSHIP, WRITTEN DOWN AS THE DOORS CHANGE WHO IS IN THE INPUT (step 3 of the one-rule build, 12 Oct 26 —
   owner D750, D753, D755, D757; the plan §4.4, §4.7). On a WEEKDAY, deliberately: the count is a scheduling fact, not
   a credit one (D27) — nothing here earns anybody anything, and who stands behind the puck is still written down at
   every hand. The input is filed by its one writer (ui/inputedit.tsx commitInput) and changed by its row's door
   (ui/reqdoor.ts); nothing is written onto the row. Kept last: the store is wired here. */
describe('who is behind an input\'s placeholder follows every hand on its row — a weekday too (step 3; D27, D753, D755, D757)', () => {
  const toast = HOOKS.toast
  beforeAll(() => { initStore() })
  beforeEach(() => { setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe('stiff'); HOOKS.toast = () => {} })
  afterEach(() => { HOOKS.toast = toast; setOilAsk(null); setInpEdit(null); setSession(null); setMe(DEFAULT_ME) })
  const file = (ppl: string[]): any => {
    const had = new Set((INPUTS as any[]).map(r => String(inpId(r))))
    expect(commitInput(null, draftOf({ person: ppl[0], type: 'Training', date: 'Jul 14', yr: 2026, allday: false, s: 9 * 60, e: 17 * 60, remarks: '' }), ppl), 'filed').toBe(true)
    const made = (INPUTS as any[]).filter(r => !had.has(String(inpId(r))))
    expect(made, 'ONE record').toHaveLength(1)
    return made[0]
  }
  const rowOf = (r: any) => ((DAYS[TUE] as any).ground || []).find((g: any) => g && String(g.src) === String(inpId(r)))
  const place = (r: any, who?: string) => {
    const row = rowOf(r), ri = ((DAYS[TUE] as any).ground || []).indexOf(row)
    if (who == null) return `g:${TUE}.${ri}.+`
    return String(row.who) === who ? `g:${TUE}.${ri}` : `g:${TUE}.${ri}.x${(row.more || []).indexOf(who)}`
  }
  const crowd = (r: any) => oilEvidence(TUE).sent[inputItemKey(String(inpId(r)))]

  it('filed for a named man alone: nothing is written down — ALL AVAIL dropped on its row: everyone free but him', () => {
    const r = file(['bane'])
    expect(crowd(r), 'no puck, no entry — an ordinary day is unchanged').toBeUndefined()
    expect(rowPut(place(r), 'allavail')).toBe('done')
    expect(idsOf(r).map(String)).toEqual(['bane', 'allavail'])
    expect(crowd(r), 'he is in the input as himself, never in its crowd').toEqual(['stiff', 'plasma'])
    expect(oilEvidence(TUE).earns, 'and a Tuesday earns nobody anything').toBe(false)
  })

  it('a man of the crowd put on by name leaves it; the named man taken off joins it (D757 step 4: "the count rises by one"); ALL AVAIL taken off: no entry', () => {
    const r = file(['bane', 'allavail'])
    expect(crowd(r)).toEqual(['stiff', 'plasma'])
    expect(rowPut(place(r), 'stiff')).toBe('done')
    expect(crowd(r), 'stiff is named in it now').toEqual(['plasma'])
    expect(rowTake(place(r, 'bane'))).toBe('done')
    expect(idsOf(r).map(String), 'ALL AVAIL stays when anyone leaves').toEqual(['allavail', 'stiff'])
    expect(crowd(r), 'bane is free now: one of the crowd').toEqual(['bane', 'plasma'])
    expect(rowTake(place(r, 'allavail'))).toBe('done')
    expect(crowd(r), 'no placeholder in the input: nothing is written down for it').toBeUndefined()
  })

  it('ONE body still answers for it: resolved while the puck is in the input, none once it has left', () => {
    const r = file(['bane', 'allavail'])
    const item = inputItemKey(String(inpId(r)))
    expect(oilSentOf(oilEvidence(TUE), item)).toMatchObject({ people: ['stiff', 'plasma'], state: 'resolved' })
    expect(rowTake(place(r, 'allavail'))).toBe('done')
    expect(oilSentOf(oilEvidence(TUE), item).state).toBe('none')
  })
})
