/* A PERSONAL INPUT THAT HOLDS ALL AVAIL / ALL — COUNTED, FROZEN, AND EARNING NOBODY (owner D778, 12 Oct 26: "Personal is
   not work" / "So all avail all can go on personal"; D776: "a Personal input may hold several people, as every other
   kind of input does").

   THE HISTORY OF THIS FILE, kept because each turn was a ruling:
   · [OIL-PERSONAL-PLACEHOLDER] ([DB-READINESS] group A, phase 7, 1 Oct 26) — it pinned a placeholder the scheduler
     dropped on a PERSONAL request's row: counted (D27, D37), frozen at publication (D44), and earning nobody (D43).
   · The one-rule build (12 Oct 26, steps 2 and 3) — D755 made whoever stands on an input's row one of the input's own
     people, and D755 (4) with D712 kept a Personal input one person's own and without a placeholder: the row could
     not exist, and this file pinned the refusal.
   · D776 and D778 (the same day) — a Personal input is the same as an Event for everything about people: several
     people, ALL AVAIL or ALL on a one-day one. D712 is narrowed (it stands for "Fly with"), D755 (4) withdrawn for the
     Personal kind. AND IT IS STILL NOT WORK: no OIL question, nothing earned — by the men named in it or by the men
     behind its puck (the agent's reading, told to him).
   So the cases of 1 Oct are back, each re-expressed to the one record: the placeholder is one of the INPUT's people
   (never a row's own extra), and nobody NAMED in the input is in its crowd.

   WHAT IS HELD: the write takes it (inputs.ts placeholderProblem, shapeProblem); the day's record writes its crowd down
   — membership only (oilev.ts oilEvidence) — so the count shows, the window lists the men and an issued day holds them
   still; and no claim is projected, so nothing reaches the credit. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, PLACEHOLDER_KINDS, oilAsks, placeholderProblem, shapeProblem } from './inputs'
import { HOOKS } from './hooks'
import { SCHED, signOf, setDayApproved, dayHasChanges, dayCurVer, daySnapOf } from './publish'
import { ensureRowIds } from './rowids'
import { inputItemKey } from './oil'
import { oilEvidence, oilEvidenceOf, oilEarnedWork, oilEvidenceKey, oilSentOf, projectOilInputs } from './oilev'
import { requestRowFields, srcvOf } from './overlay'

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

/* a Personal input for the day, 09:00–17:00, holding `ids` — the record as the app writes it */
const rec = (di: number, ids: string[], over: any = {}) => ({ iid: 'rq1', type: 'Personal', date: di === SAT ? 'Jul 18' : 'Jul 14', yr: 2026,
  allday: false, s: 9 * 60, e: 17 * 60, remarks: '', mod: 'now', by: 'ignite', acc: 'g', people: ids.map(p => ({ p })), ...over })
/* …filed, and landed on its day: its row is the copy the request writes (overlay.ts requestRowFields) */
const personal = (di: number, ids: string[], over: any = {}, row: any = {}) => {
  INPUTS.unshift(rec(di, ids, over))
  const r: any = INPUTS[0]
  ;(DAYS[di] as any).ground = ((DAYS[di] as any).ground || []).concat([{ ...requestRowFields(r), src: 'rq1', srcv: srcvOf(r), ...row }])
  ensureRowIds(DAYS)
  return r
}
const publish = (di: number) => {
  const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
  setDayApproved(di, true)
}

describe('a Personal input holds several people, and ALL AVAIL / ALL on a one-day one — the write takes it (D776, D778)', () => {
  it('several people; a placeholder alone; a placeholder beside its people — each is a sound record', () => {
    expect(shapeProblem(rec(TUE, ['ignite', 'pump', 'bane']))).toBe('')
    for (const ph of ['allavail', 'all']) {
      expect(placeholderProblem(rec(TUE, [ph])), ph).toBe('')
      expect(shapeProblem(rec(TUE, [ph])), ph).toBe('')
      expect(shapeProblem(rec(TUE, ['ignite', ph])), `${ph} beside its man`).toBe('')
      expect(placeholderProblem({ ...rec(TUE, []), people: undefined, person: ph }), `${ph}, a record of the old shape`).toBe('')
    }
  })

  it('what stays refused: more than one day, both placeholders at once, a person twice — and "Fly with", which D712 still keeps out', () => {
    expect(shapeProblem(rec(TUE, ['ignite', 'allavail'], { endDate: 'Jul 15' }))).toBe('ALL AVAIL is for one day')
    expect(shapeProblem(rec(TUE, ['all', 'allavail']))).toMatch(/already has/)
    expect(shapeProblem(rec(TUE, ['ignite', 'ignite']))).toMatch(/already on this input/)
    expect(placeholderProblem(rec(TUE, ['allavail'], { type: 'Fly with' }))).toBe('ALL AVAIL is for Training, Meeting, Personal, Appointment, Duty, Event and Other')
  })

  it('Personal is one of the kinds a placeholder may be filed for — and the only one of them that never asks the OIL question', () => {
    expect(PLACEHOLDER_KINDS).toContain('Personal')
    expect(PLACEHOLDER_KINDS).not.toContain('Fly with')
    for (const t of PLACEHOLDER_KINDS) expect(oilAsks(t), t).toBe(t !== 'Personal')
  })
})

describe('ALL / ALL AVAIL on a Personal input is counted (D27, D37, D778)', () => {
  it('beside its man, on a weekday — the crowd is the men behind the puck, never the man named in the input', () => {
    personal(TUE, ['ignite', 'allavail'])
    const got = oilSentOf(oilEvidence(TUE), ITEM)
    expect(got.state, 'the day wrote this input\'s crowd down').toBe('resolved')
    expect(got.people).toEqual(CROWD)
  })

  it('a man named in the input is not counted behind its puck too', () => {
    personal(TUE, ['bane', 'allavail'])
    expect(oilSentOf(oilEvidence(TUE), ITEM).people).toEqual(['stiff', 'plasma'])
  })

  it('filed for the placeholder alone', () => {
    personal(TUE, ['allavail'])
    expect(oilSentOf(oilEvidence(TUE), ITEM).people).toEqual(CROWD)
  })

  it('and ALL reads the same as ALL AVAIL — one record for the input, the crowd worked out once', () => {
    let asks = 0
    HOOKS.oilSentinel = () => { asks++; return CROWD.slice() }
    personal(TUE, ['ignite', 'all'])
    const ev = oilEvidence(TUE)
    expect(Object.keys(ev.sent), 'one address — the input').toEqual([ITEM])
    expect(ev.sent[ITEM]).toEqual(CROWD)
    expect(asks).toBe(1)
  })

  it('on a day that CAN earn too (a Saturday)', () => {
    personal(SAT, ['ignite', 'allavail'])
    expect(oilSentOf(oilEvidence(SAT), ITEM).people).toEqual(CROWD)
  })

  it('an ALL-DAY Personal input — the input\'s own window is the one counted over (its row carries no times)', () => {
    let asked: any = null
    HOOKS.oilSentinel = (_iso: string, win: [number, number]) => { asked = win; return CROWD.slice() }
    personal(TUE, ['ignite', 'allavail'], { allday: true, s: 0, e: 1439 })
    expect(oilSentOf(oilEvidence(TUE), ITEM).state).toBe('resolved')
    expect(asked, 'the whole day').toEqual([0, 1439])
  })

  it('a timed one is counted over ITS OWN times, never the whole day', () => {
    let asked: any = null
    HOOKS.oilSentinel = (_iso: string, win: [number, number]) => { asked = win; return CROWD.slice() }
    personal(TUE, ['ignite', 'allavail'])
    oilEvidence(TUE)
    expect(asked).toEqual([9 * 60, 17 * 60])
  })
})

describe('…and only where the input really holds a placeholder and stands', () => {
  it('a Personal input of NAMED people only writes nothing — an ordinary day\'s record is unchanged', () => {
    personal(TUE, ['ignite', 'stiff'])
    const ev = oilEvidence(TUE)
    expect(ev.sent).toEqual({})
    expect(oilEvidenceKey(ev, DAYS[TUE]), 'a weekday with no puck still keys to nothing').toBe('')
  })

  it.each([
    ['cancelled', { cx: true, cxr: 'WX' }],
    ['information only', { info: true }],
  ])('a %s input writes nothing (the marks are the input\'s — D760)', (_n, mark) => {
    personal(TUE, ['ignite', 'allavail'], mark)
    expect(oilSentOf(oilEvidence(TUE), ITEM).state).toBe('none')
  })

  it('one TAKEN OFF the programme writes nothing', () => {
    personal(TUE, ['ignite', 'allavail'], { acc: 'r' })
    expect(oilSentOf(oilEvidence(TUE), ITEM).state).toBe('none')
  })

  it('one that does not cover this day writes nothing here', () => {
    personal(TUE, ['ignite', 'allavail'], { date: 'Jul 16' })
    expect(oilSentOf(oilEvidence(TUE), ITEM).state).toBe('none')
  })

  it('one with a nought-minute window has nothing to count over (D31)', () => {
    personal(TUE, ['ignite', 'allavail'], { s: 9 * 60, e: 9 * 60 })
    expect(oilSentOf(oilEvidence(TUE), ITEM).state).toBe('none')
  })
})

describe('NOBODY EARNS FROM IT — the record of who, never a credit (D778: "Personal is not work")', () => {
  it.each([
    ['the placeholder alone', ['allavail']],
    ['beside its people', ['ignite', 'pump', 'allavail']],
    ['ALL, first in the list', ['all', 'ignite']],
    ['three named people and no puck', ['ignite', 'pump', 'bane']],
  ])('%s, on a Saturday: no claim is projected, nobody is credited — and an allow cannot invent it', (_n, ids) => {
    personal(SAT, ids as string[], { oil: { [SAT_ISO]: 1 } })
    expect(projectOilInputs(SAT_ISO).some(i => i.iid === 'rq1'), 'a kind that never asks projects no claim').toBe(false)
    expect(Object.keys(oilEarnedWork(DAYS[SAT], oilEvidence(SAT)))).toEqual([])
    ;(DAYS[SAT] as any).oild = { people: { [`stiff|${ITEM}`]: 'allow', [`ignite|${ITEM}`]: 'allow' } }
    expect(Object.keys(oilEarnedWork(DAYS[SAT], oilEvidence(SAT))), 'an allow counts real work; it never invents it').toEqual([])
  })

  it('THE CONTROL: the same people and puck on a TRAINING answered Yes do earn — the difference is the kind', () => {
    personal(SAT, ['ignite', 'allavail'], { type: 'Training', oil: { [SAT_ISO]: 1 } })
    const ev = oilEvidence(SAT)
    expect(Object.keys(ev.sent)).toEqual([ITEM])
    expect(Object.keys(oilEarnedWork(DAYS[SAT], ev)).sort(), 'its man and the crowd').toEqual(['bane', 'ignite', 'plasma', 'stiff'])
  })
})

describe('the crowd is FROZEN at publication, and a later change reads pending (D44, D45)', () => {
  it('the issued day keeps the people it went out with; the working copy shows today\'s', () => {
    personal(TUE, ['ignite', 'allavail'])
    publish(TUE)
    expect(dayHasChanges(TUE), 'nothing pending straight after publishing').toBe(false)
    CROWD = ['bane', 'stiff']                              // plasma has filed leave since
    const snap: any = daySnapOf(TUE, dayCurVer(TUE))
    expect(oilSentOf(oilEvidenceOf(TUE, snap.d), ITEM).people, 'the record').toEqual(['bane', 'stiff', 'plasma'])
    expect(oilSentOf(oilEvidence(TUE), ITEM).people, 'today').toEqual(['bane', 'stiff'])
    expect(dayHasChanges(TUE), 'the difference raises the ordinary pending mark').toBe(true)
  })
})
