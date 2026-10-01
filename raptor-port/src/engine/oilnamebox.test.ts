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
import { oilEvidence, oilEarnedWork, landedExtras, oilSentOf } from './oilev'
import { viewOfWeek, srcvOf } from './overlay'

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

/* THE NAME BOX IS THE SCHEDULER'S WHEN IT HOLDS SOMEONE OTHER THAN THE HOLDER — AND IT SURVIVES THE MEMBER'S OWN EDIT
   (Fable's final read, F1 — phase 7). A request's row is worked out from the request whenever its day is read
   (overlay.ts, rule 6): when the member edits his request, the row is re-made in place, keeping what the scheduler set —
   the extras, the red box, CX, information only. It did NOT keep the name box: it wrote the request's own man back, so a
   man the scheduler had put there (D470) or a placeholder (D46) vanished at the member's next edit of his remarks — and,
   since D470, his OIL with him — with no line anywhere. A FORMER holder left in the box by a hand-over still gives way
   to the new one. */
describe('the scheduler\'s man in the name box survives the member\'s own edit of his request (Fable F1)', () => {
  const view = () => viewOfWeek('13/07/2026', DAYS as any[], { loaded: true, issued: () => null })
  const row = () => (DAYS[SAT] as any).ground.find((g: any) => g && g.src === 'rq1')
  /* the row as it was last made from the request — so only the edit below re-makes it */
  const stamp = (as: any = INPUTS[0]) => { row().srcv = srcvOf(as) }

  it('a named man: still in the box after the member edits his remarks, and still earning', () => {
    landed({}, { who: 'stiff' }); stamp()
    ;(INPUTS[0] as any).remarks = 'bring the checklist'
    view()
    expect(row().rmks, 'the member\'s edit reached the row').toBe('bring the checklist')
    expect(row().who, 'and the scheduler\'s man is still in the box').toBe('stiff')
    expect(earners()).toEqual(['bane', 'stiff'])
  })

  it('…and after the member changes his times', () => {
    landed({}, { who: 'stiff' }); stamp()
    ;(INPUTS[0] as any).s = 10 * 60
    view()
    expect(row().who).toBe('stiff')
    expect(figure('stiff'), 'he earns over the request\'s new window').toBe('FO')
  })

  it('a placeholder in the box survives it too — its crowd is still written down (D46)', () => {
    HOOKS.oilSentinel = () => ['plasma']
    landed({}, { who: 'allavail' }); stamp()
    ;(INPUTS[0] as any).remarks = 'bring the checklist'
    view()
    expect(row().who).toBe('allavail')
    expect(oilSentOf(oilEvidence(SAT), ITEM).state).toBe('resolved')
  })

  it('a FORMER holder left in the box by a hand-over gives way to the new holder', () => {
    landed({}, { who: 'bane' }); stamp()
    Object.assign(INPUTS[0] as any, { person: 'plasma', hand: 1, leftAt: { bane: 1 }, oil: {} })
    view()
    expect(row().who, 'the request\'s new man').toBe('plasma')
  })

  it('THE CONTROL: the member in his own box — an edit re-makes the row exactly as before', () => {
    landed({}, { who: 'bane', more: ['stiff'] }); stamp()
    ;(INPUTS[0] as any).remarks = 'bring the checklist'
    view()
    expect(row().who).toBe('bane')
    expect(row().more, 'the extras kept, as always').toEqual(['stiff'])
    expect(row().rmks).toBe('bring the checklist')
  })

  it('the member, moved to the extras under another man\'s box, is not taken off his own row by an edit', () => {
    landed({}, { who: 'stiff', more: ['bane'] }); stamp()
    ;(INPUTS[0] as any).remarks = 'bring the checklist'
    view()
    expect(row().who).toBe('stiff')
    expect(row().more).toEqual(['bane'])
  })
})

/* A HAND-OVER TO AND FROM THE MAN IN THE BOX, with a decision about him standing (Astra's final read, gap 3). The rule
   is phase 6 (a)'s for an extra: a decision about a man is void once the request has LEFT him since it was made
   (`leftAt`), and is kept while he is on the row or holds the request. */
describe('a hand-over to and from the man in the name box, with a decision about him (Astra, gap 3)', () => {
  const view = () => viewOfWeek('13/07/2026', DAYS as any[], { loaded: true, issued: () => null })
  const row = () => (DAYS[SAT] as any).ground.find((g: any) => g && g.src === 'rq1')
  const KEY = `stiff|${ITEM}`

  it('handed TO him: he is the holder now, his earlier tap-off still stands, and nobody earns twice', () => {
    landed({}, { who: 'stiff' }); row().srcv = srcvOf(INPUTS[0])
    ;(DAYS[SAT] as any).oild = { people: { [KEY]: 'deny' } }
    Object.assign(INPUTS[0] as any, { person: 'stiff', hand: 1, leftAt: { bane: 1 }, oil: { [SAT_ISO]: 1 } })
    view()
    expect(row().who, 'the box holds the request\'s man — the same man').toBe('stiff')
    expect(oilEvidence(SAT).d.people, 'it never left him: the tap-off is kept').toEqual({ [KEY]: 'deny' })
    expect(earners(), 'so he earns nothing, and the old holder is off the row').toEqual([])
  })

  it('…and handed on FROM him: the decision made while he was on it is void, and he is off the row', () => {
    landed({}, { who: 'stiff' }); row().srcv = srcvOf(INPUTS[0])
    ;(DAYS[SAT] as any).oild = { people: { [KEY]: 'deny' } }
    Object.assign(INPUTS[0] as any, { person: 'plasma', hand: 2, leftAt: { bane: 1, stiff: 2 }, oil: { [SAT_ISO]: 1 } })
    view()
    expect(row().who, 'a former holder gives way').toBe('plasma')
    expect(oilEvidence(SAT).d.people, 'the stale decision decides nothing').toBeUndefined()
    expect(earners()).toEqual(['plasma'])
  })
})
