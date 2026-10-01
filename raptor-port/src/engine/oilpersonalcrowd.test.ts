/* [OIL-PERSONAL-PLACEHOLDER] — a placeholder on a request row whose request NEVER ASKS the OIL question
   ([DB-READINESS] group A, phase 7; plan docs/superpowers/plans/2026-10-01-db-readiness-phase7-plan.md §1.1).

   A "Personal" request lands a row on the Ground Programme like any activity, and it is the one landed kind that
   never asks about OIL (inputs.ts oilAsks — owner, 28 Aug 26). The day's work walk skips every request row whole, and
   the request half of the evidence wrote a placeholder's crowd down only for the requests that ASK — so ALL / ALL AVAIL
   on a Personal row was written down nowhere: no count, no window, nothing frozen at publication.

   D27 / D37: the count shows wherever the puck lands. D44: who was behind it is frozen at publication on EVERY day.

   AND NOBODY EARNS FROM IT. A named man on a Personal row earns nothing (the request half credits only the asking
   kinds; the schedule half skips the row), and D43 says a placeholder behaves exactly like named people. This is the
   record of WHO, never a credit — the second half of this file pins that the fix moved no OIL. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { HOOKS } from './hooks'
import { SCHED, signOf, setDayApproved, dayHasChanges, dayCurVer, daySnapOf } from './publish'
import { ensureRowIds } from './rowids'
import { inputItemKey } from './oil'
import { oilEvidence, oilEvidenceOf, oilEarnedWork, oilEvidenceKey, oilSentOf } from './oilev'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5, TUE = 1
const SAT_ISO = '2026-07-18', TUE_ISO = '2026-07-14'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel
let CROWD = ['bane', 'stiff', 'plasma']
const ITEM = inputItemKey('rq1')

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.correcting = {}
  for (const di of [SAT, TUE])
    Object.assign(DAYS[di] as any, { waves: [], dutywaves: [], sims: {}, ground: [], allhands: [], oild: undefined })
  ensureRowIds(DAYS)
  CROWD = ['bane', 'stiff', 'plasma']
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : di === TUE ? TUE_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => CROWD.slice()
})
afterEach(() => { HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel })

const request = (r: any) => { INPUTS.unshift({ allday: false, s: 9 * 60, e: 17 * 60, remarks: '', mod: 'now', yr: 2026, ...r }); return INPUTS[0] }
const groundRow = (di: number, r: any) => {
  DAYS[di].ground = (DAYS[di].ground || []).concat([r]); ensureRowIds(DAYS)
  return DAYS[di].ground[DAYS[di].ground.length - 1]
}
/* a Personal request `ignite` filed, landed on the day, 09:00–17:00 */
const personal = (di: number, over: any = {}, row: any = {}) => {
  request({ iid: 'rq1', person: 'ignite', type: 'Personal', date: di === SAT ? 'Jul 18' : 'Jul 14', acc: 'g', ...over })
  return groundRow(di, { prog: 'PERSONAL', str: '0900', end: '1700', who: 'ignite', src: 'rq1', ...row })
}
const publish = (di: number) => {
  const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
  setDayApproved(di, true)
}

describe('ALL / ALL AVAIL on a Personal request row is counted (D27, D37)', () => {
  it('in the EXTRAS under the row, on a weekday', () => {
    personal(TUE, {}, { more: ['allavail'] })
    const got = oilSentOf(oilEvidence(TUE), ITEM)
    expect(got.state, 'the day wrote this seat down').toBe('resolved')
    expect(got.people).toEqual(CROWD)
  })

  it('in the NAME BOX itself', () => {
    personal(TUE, {}, { who: 'allavail' })
    expect(oilSentOf(oilEvidence(TUE), ITEM).people).toEqual(CROWD)
  })

  it('and ALL reads the same as ALL AVAIL', () => {
    personal(TUE, {}, { more: ['all'] })
    expect(oilSentOf(oilEvidence(TUE), ITEM).state).toBe('resolved')
  })

  it('ALL in the name box AND ALL AVAIL in the extras: one record for the row, nobody counted twice (Astra, scenario 5)', () => {
    let asks = 0
    HOOKS.oilSentinel = () => { asks++; return CROWD.slice() }
    personal(TUE, {}, { who: 'all', more: ['allavail'] })
    const ev = oilEvidence(TUE)
    expect(Object.keys(ev.sent), 'one address — the row').toEqual([ITEM])
    expect(ev.sent[ITEM]).toEqual(CROWD)
    expect(asks, 'and the crowd is worked out once for it').toBe(1)
  })

  it('on a day that CAN earn too (a Saturday)', () => {
    personal(SAT, {}, { more: ['allavail'] })
    expect(oilSentOf(oilEvidence(SAT), ITEM).people).toEqual(CROWD)
  })

  it('an ALL-DAY Personal request — its row carries no times, the request\'s own window is the one counted over', () => {
    let asked: any = null
    HOOKS.oilSentinel = (_iso: string, win: [number, number]) => { asked = win; return CROWD.slice() }
    personal(TUE, { allday: true, s: 0, e: 1439 }, { str: '', end: '', more: ['allavail'] })
    expect(oilSentOf(oilEvidence(TUE), ITEM).state).toBe('resolved')
    expect(asked, 'the whole day, not the row\'s blank times').toEqual([0, 1439])
  })

  it('a timed request is counted over ITS OWN times, never the whole day', () => {
    let asked: any = null
    HOOKS.oilSentinel = (_iso: string, win: [number, number]) => { asked = win; return CROWD.slice() }
    personal(TUE, {}, { more: ['allavail'] })
    oilEvidence(TUE)
    expect(asked).toEqual([9 * 60, 17 * 60])
  })
})

describe('…and only where a row with a placeholder really stands', () => {
  it('a Personal row with NO placeholder writes nothing — an ordinary day\'s record is unchanged', () => {
    personal(TUE, {}, { more: ['stiff'] })
    const ev = oilEvidence(TUE)
    expect(ev.sent).toEqual({})
    expect(oilEvidenceKey(ev, DAYS[TUE]), 'a weekday with no puck still keys to nothing').toBe('')
  })

  it.each([
    ['cancelled', { cx: 1 }],
    ['information only', { info: 1 }],
    ['a kept row (a version\'s row whose request cannot stand there — D363)', { kept: 1 }],
  ])('a %s row writes nothing', (_n, flag) => {
    personal(TUE, {}, { more: ['allavail'], ...flag })
    expect(oilSentOf(oilEvidence(TUE), ITEM).state).toBe('none')
  })

  it('a request TAKEN OFF the programme writes nothing', () => {
    personal(TUE, { acc: 'r' }, { more: ['allavail'] })
    expect(oilSentOf(oilEvidence(TUE), ITEM).state).toBe('none')
  })

  it('a row whose request is GONE writes nothing', () => {
    groundRow(TUE, { prog: 'PERSONAL', str: '0900', end: '1700', who: 'ignite', src: 'ghost', more: ['allavail'] })
    expect(oilSentOf(oilEvidence(TUE), inputItemKey('ghost')).state).toBe('none')
  })

  it('a request that does not cover this day writes nothing here', () => {
    personal(TUE, { date: 'Jul 16' }, { more: ['allavail'] })
    expect(oilSentOf(oilEvidence(TUE), ITEM).state).toBe('none')
  })

  it('a request with a nought-minute window has nothing to count over (D31)', () => {
    personal(TUE, { s: 9 * 60, e: 9 * 60 }, { str: '0900', end: '0900', more: ['allavail'] })
    expect(oilSentOf(oilEvidence(TUE), ITEM).state).toBe('none')
  })
})

describe('NOBODY EARNS FROM IT — the record of who, never a credit (D43: like named people)', () => {
  it('the crowd, the requester and a named extra all earn nothing from a Personal row on a Saturday', () => {
    personal(SAT, {}, { more: ['allavail', 'pump'] })
    const ev = oilEvidence(SAT)
    expect(oilSentOf(ev, ITEM).people, 'counted').toEqual(CROWD)
    expect(Object.keys(oilEarnedWork(DAYS[SAT], ev)), 'and credited nothing').toEqual([])
  })

  it('a request that ASKS is written down exactly as before — one entry, the same people', () => {
    request({ iid: 'rq2', person: 'bane', type: 'Training', date: 'Jul 18', acc: 'g', oil: { [SAT_ISO]: 1 } })
    groundRow(SAT, { prog: 'TRAINING', str: '0900', end: '1700', who: 'bane', src: 'rq2', more: ['allavail'] })
    const ev = oilEvidence(SAT)
    expect(Object.keys(ev.sent)).toEqual([inputItemKey('rq2')])
    expect(Object.keys(oilEarnedWork(DAYS[SAT], ev)).sort(), 'the requester and the crowd, as today').toEqual(['bane', 'plasma', 'stiff'])
  })
})

describe('the crowd is FROZEN at publication, and a later change reads pending (D44, D45)', () => {
  it('the issued day keeps the people it went out with; the working copy shows today\'s', () => {
    personal(TUE, {}, { more: ['allavail'] })
    publish(TUE)
    expect(dayHasChanges(TUE), 'nothing pending straight after publishing').toBe(false)
    CROWD = ['bane', 'stiff']                              // plasma has filed leave since
    const snap: any = daySnapOf(TUE, dayCurVer(TUE))
    expect(oilSentOf(oilEvidenceOf(TUE, snap.d), ITEM).people, 'the record').toEqual(['bane', 'stiff', 'plasma'])
    expect(oilSentOf(oilEvidence(TUE), ITEM).people, 'today').toEqual(['bane', 'stiff'])
    expect(dayHasChanges(TUE), 'the difference raises the ordinary pending mark').toBe(true)
  })
})
