/* [OIL-REQ-NAMEBOX] — A MAN THE SCHEDULER PUTS IN THE NAME BOX OF ANOTHER MAN'S REQUEST ROW EARNS FROM IT (owner, D470,
   1 Oct 26 — [DB-READINESS] group A, phase 7).

   D18 made a second man the scheduler adds UNDER a member's landed request row earn from it, the same as the man who
   filed it. The row's NAME BOX was left alone on purpose in that build: in every ordinary path it holds the member who
   filed, and crediting "whoever is in the box" was a second change to who earns with no case behind it. Put to him as a
   question with the case spelled out, he answered yes: a named man in that box, in place of the member, did the work and
   earns — as an extra does — and THE MEMBER WHO FILED STILL EARNS ON HIS OWN ANSWER, which is never overwritten.

   So the name box is gathered like the extras (oilev.ts landedExtras): a real person who is not the request's own
   holder is ordinary scheduled work on the request's address — default yes, his own switch. The holder is never
   gathered there; he stays in the request half. A request that never asks (Personal) still earns nobody anything. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { HOOKS } from './hooks'
import { SCHED } from './publish'
import { ensureRowIds } from './rowids'
import { envMin, uniformOil, inputItemKey } from './oil'
import { oilEvidence, oilEarnedWork, landedExtras } from './oilev'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5, SAT_ISO = '2026-07-18'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel
const ITEM = inputItemKey('rq1')

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.correcting = {}
  Object.assign(DAYS[SAT] as any, { waves: [], dutywaves: [], sims: {}, ground: [], allhands: [], oild: undefined })
  ensureRowIds(DAYS)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => []
})
afterEach(() => { HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel })

/* bane FILES a Training request for the Saturday, 09:00–17:00, and answers Yes; it lands a row */
const landed = (over: any = {}, row: any = {}) => {
  INPUTS.unshift({ iid: 'rq1', person: 'bane', type: 'Training', date: 'Jul 18', yr: 2026, acc: 'g',
    allday: false, s: 9 * 60, e: 17 * 60, remarks: '', mod: '2026-07-01', oil: { [SAT_ISO]: 1 }, ...over })
  ;(DAYS[SAT] as any).ground = [{ prog: 'TRAINING', str: '0900', end: '1700', who: 'bane', src: 'rq1', ...row }]
  ensureRowIds(DAYS)
}
const work = () => oilEarnedWork(DAYS[SAT], oilEvidence(SAT))
const figure = (person: string) => {
  const v = uniformOil(envMin((work()[person] || []).map((w: any) => [w.s, w.e] as [number, number])))
  return v === 1 ? 'FO' : v === 0.5 ? 'HO' : null
}
const earners = () => Object.keys(work()).sort()

describe('a named man in the request row\'s NAME BOX earns from it (D470)', () => {
  it('he earns the request\'s own day, as a man added under the row does (D18)', () => {
    landed({}, { who: 'stiff' })
    expect(earners(), 'the man in the box, and the member who filed').toEqual(['bane', 'stiff'])
    expect(figure('stiff')).toBe('FO')
  })

  it('THE MEMBER WHO FILED STILL EARNS ON HIS OWN ANSWER — his name off the row changes nothing for him', () => {
    landed({}, { who: 'stiff' })
    expect(figure('bane'), 'his Yes still stands').toBe('FO')
  })

  it('…and his own No still stands too: the man in the box earns, the member does not', () => {
    landed({ oil: { [SAT_ISO]: 0 } }, { who: 'stiff' })
    expect(earners()).toEqual(['stiff'])
  })

  it('an UNANSWERED request: the man in the box still earns (ordinary work), the member not until he answers', () => {
    landed({ oil: {} }, { who: 'stiff' })
    expect(earners()).toEqual(['stiff'])
  })

  it('it is the span of ordinary scheduled work on the request\'s own address — default yes, via the request', () => {
    landed({}, { who: 'stiff' })
    const w = work().stiff[0] as any
    expect(w.item).toBe(ITEM)
    expect(w.dflt).toBe(true)
    expect([w.s, w.e], 'the request\'s own window').toEqual([9 * 60, 17 * 60])
  })

  it('an ALL-DAY request: the row carries no times, and he earns over the request\'s window all the same', () => {
    landed({ allday: true, s: 0, e: 1439 }, { who: 'stiff', str: '', end: '' })
    expect(figure('stiff')).toBe('FO')
  })
})

describe('each man on the row is decided on his own', () => {
  it('the man in the box can be taken off alone — the member keeps earning', () => {
    landed({}, { who: 'stiff' })
    ;(DAYS[SAT] as any).oild = { people: { [`stiff|${ITEM}`]: 'deny' } }
    expect(earners()).toEqual(['bane'])
  })

  it('his refusal is not thrown away as a stale one — he is on the row (the hand-over prune keeps it)', () => {
    landed({}, { who: 'stiff' })
    ;(DAYS[SAT] as any).oild = { people: { [`stiff|${ITEM}`]: 'deny' } }
    expect(oilEvidence(SAT).d.people, 'the decision survives the read').toEqual({ [`stiff|${ITEM}`]: 'deny' })
  })

  it('a man in the box AND a man under the row both earn, each once', () => {
    landed({}, { who: 'stiff', more: ['plasma'] })
    expect(earners()).toEqual(['bane', 'plasma', 'stiff'])
    expect(work().stiff.length).toBe(1)
  })

  it('one man in the box and again under the row is one man', () => {
    landed({}, { who: 'stiff', more: ['stiff'] })
    expect(landedExtras(DAYS[SAT], 'rq1', 'bane')).toEqual(['stiff'])
    expect(work().stiff.length).toBe(1)
  })
})

describe('what it does NOT change', () => {
  it('THE CONTROL: the member in his own name box is not an extra — he earns once, on his answer', () => {
    landed()
    expect(landedExtras(DAYS[SAT], 'rq1', 'bane'), 'the holder is never gathered here').toEqual([])
    expect(earners()).toEqual(['bane'])
    expect(work().bane.length).toBe(1)
  })

  it('a CANCELLED or information-only row earns nobody — the man in the box included', () => {
    landed({}, { who: 'stiff', cx: 1 })
    expect(earners()).toEqual([])
    ;(DAYS[SAT] as any).ground[0].cx = undefined; (DAYS[SAT] as any).ground[0].info = 1
    expect(earners()).toEqual([])
  })

  it('a request that never asks (Personal) earns nobody anything, whoever is in its box', () => {
    landed({ type: 'Personal', oil: undefined }, { prog: 'PERSONAL', who: 'stiff' })
    expect(earners()).toEqual([])
  })

  it('a placeholder in the box is still the crowd, never a named man (D46)', () => {
    HOOKS.oilSentinel = () => ['plasma', 'stiff']
    landed({}, { who: 'allavail' })
    expect(earners()).toEqual(['bane', 'plasma', 'stiff'])
  })

  it('free text in the box (a name the roster does not hold) earns nobody', () => {
    landed({}, { who: 'Visitor' })
    expect(earners()).toEqual(['bane'])
  })

  it('a day that cannot earn stays at nothing', () => {
    HOOKS.oilEarningDay = () => false
    landed({}, { who: 'stiff' })
    expect(earners()).toEqual([])
  })
})
