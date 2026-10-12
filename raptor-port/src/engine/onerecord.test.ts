/* ONE RECORD FOR EVERY INPUT — the engine's half of step 2 (a) ([ALL-AVAIL-AS-MEMBER]; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.1, §4.2, §4.3, §4.7 and §5 step 2 (a) — Fable F3).

   Owner, D756 (11 Oct 26): "an input is stored as ONE record with the list of its people — not as one record a person
   kept in step". D759: confirmed, built in steps; nothing stored is converted (D56) and "an old-shaped record must not
   break a load". D762: "for an input with several people the OIL question has one answer, for everyone in it".
   D755: "a row that came from an input IS the input — whoever stands on it … is in the input".

   F3: the moment a record carries `people` and no `person`, OIL projects no claim for it, its row shows nobody and a
   deleted man's row is not found. So the bodies that would otherwise READ NOBODY are changed with the record itself —
   these are their tests. A record in the OLD shape (one `person`) reads exactly as it did: every case here that has an
   old-shaped twin asserts the two agree. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, peopleOf, namedOf, placeholderOf, idsOf, leadOf, onlyNamed, holds, shapeProblem, placeholderProblem,
  isPlaceholderInput, inpDetailKey, frozenInputMatch, inputLines } from './inputs'
import { HOOKS } from './hooks'
import { SCHED } from './publish'
import { ensureRowIds } from './rowids'
import { envMin, uniformOil, inputItemKey } from './oil'
import { oilEvidenceOf, oilEarnedWork, spanDefault, projectOilInputs } from './oilev'
import { requestRowFields, srcvOf, hisLanded, viewOfWeek } from './overlay'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5, SAT_ISO = '2026-07-18'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.correcting = {}
  Object.assign(DAYS[SAT] as any, { waves: [], dutywaves: [], sims: {}, ground: [], allhands: [], oild: undefined })
  ensureRowIds(DAYS)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => []
})
afterEach(() => {
  HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
})

/* a Saturday Training, 09:00–15:00 — in the new shape (`people`) or the old (`person`) */
const base = { type: 'Training', date: 'Jul 18', yr: 2026, allday: false, s: 540, e: 900, remarks: 'range', mod: '2026-07-01' }
const several = (ids: string[], over: any = {}) => ({ iid: 'rq1', ...base, by: 'stiff', at: 1, people: ids.map(p => ({ p, by: 'stiff', at: 1 })), ...over })
const oldOne = (p: string, over: any = {}) => ({ iid: 'rq1', ...base, by: 'stiff', at: 1, person: p, ...over })
const put = (r: any) => { INPUTS.unshift(r); return INPUTS[0] as any }
const figure = (person: string) => {
  const d = DAYS[SAT], ev = oilEvidenceOf(SAT, d)
  const v = uniformOil(envMin((oilEarnedWork(d, ev)[person] || []).map((w: any) => [w.s, w.e] as [number, number])))
  return v === 1 ? 'FO' : v === 0.5 ? 'HO' : null
}

describe('who is in an input — one reader, either shape (D756, D759)', () => {
  it('an old-shaped record reads as a one-person input; a new one as its list, in the order they joined', () => {
    expect(idsOf(oldOne('bane'))).toEqual(['bane'])
    expect(leadOf(oldOne('bane'))).toBe('bane')
    expect(onlyNamed(oldOne('bane'))).toBe('bane')
    const r = several(['plasma', 'bane', 'stiff'])
    expect(idsOf(r)).toEqual(['plasma', 'bane', 'stiff'])
    expect(leadOf(r)).toBe('plasma')
    expect(onlyNamed(r)).toBe(null)
    expect(holds(r, 'bane')).toBe(true)
    expect(holds(r, 'pump')).toBe(false)
    expect(peopleOf(r).length).toBe(3)
  })
  it('an input for ALL AVAIL alone names nobody, in either shape', () => {
    for (const r of [oldOne('allavail'), several(['allavail'])]) {
      expect(namedOf(r)).toEqual([])
      expect(placeholderOf(r).p).toBe('allavail')
      expect(isPlaceholderInput(r)).toBe(true)
      expect(onlyNamed(r)).toBe(null)
      expect(leadOf(r)).toBe('allavail')
      expect(inputLines([r])).toEqual([])
    }
  })
})

describe('what one input may hold — held at the write (the plan §4.1; D753, D755 (4), D655 reading 4)', () => {
  it('a Training for three is fine; so is any old-shaped record', () => {
    expect(shapeProblem(several(['plasma', 'bane', 'stiff']))).toBe('')
    expect(shapeProblem(oldOne('bane'))).toBe('')
    expect(shapeProblem(oldOne('bane', { type: 'LL', grp: 'g1', grpBy: 'stiff' }))).toBe('')
  })
  it('nobody in it, or a person twice, is refused', () => {
    expect(shapeProblem(several([]))).toMatch(/at least one person/i)
    expect(shapeProblem(several(['bane', 'plasma', 'bane']))).toMatch(/already on this input/i)
  })
  /* (it read "…; so is a Personal input (D755 (4))" until D776, 12 Oct 26 — "A2": a Personal input may hold several
     people, as every other kind does. The only kinds still one person's are these two, each needing its own document.) */
  it('a medical entry or an upchit is one person\'s — and a Personal input is NOT, since D776', () => {
    expect(shapeProblem(several(['bane', 'plasma'], { type: 'OML' }))).toMatch(/one person/i)
    expect(shapeProblem(several(['bane', 'plasma'], { type: 'Upchit' }))).toMatch(/one person/i)
    expect(shapeProblem(several(['bane', 'plasma'], { type: 'Personal' }))).toBe('')
    expect(shapeProblem(several(['bane'], { type: 'Personal' }))).toBe('')
  })
  /* THE RULES SURVIVE; THEIR WORDS CHANGED in step 3 of the build (the plan §4.4 — D726, as short as is still understood):
     "can be filed only for … or Other" is "is for … and Other", "is filed one day at a time" is "is for one day". The
     whole sentences are pinned now — a pattern would have let the next rewording through unread. */
  it('a placeholder input keeps its rules in the new shape — six kinds, one day, never under Unavailable', () => {
    expect(placeholderProblem(several(['allavail']))).toBe('')
    expect(placeholderProblem(several(['allavail'], { type: 'LL' }))).toBe('ALL AVAIL is for Training, Meeting, Personal, Appointment, Duty, Event and Other')
    expect(placeholderProblem(several(['allavail'], { endDate: 'Jul 19' }))).toBe('ALL AVAIL is for one day')
    expect(placeholderProblem(several(['allavail'], { acc: 'u' }))).toMatch(/Unavailable/)
    expect(shapeProblem(several(['allavail'], { type: 'LL' }))).toBe('ALL AVAIL is for Training, Meeting, Personal, Appointment, Duty, Event and Other')
    /* two placeholders never stand in one input (D753: "an input takes ALL or ALL AVAIL, never both") — in the plan's
       sentence, naming the one that is already in it */
    expect(shapeProblem(several(['allavail', 'all']))).toBe('This input already has ALL AVAIL')
    expect(shapeProblem(several(['all', 'allavail']))).toBe('This input already has ALL')
  })
  /* STEP 3 (owner D750, D753, D755 — the plan §4.1): the invariant "a placeholder is filed on its own" left the list. In
     the new shape a placeholder is ONE ENTRY of the list like any other — and the old shape, which holds one `person`,
     can only ever be a placeholder alone, so it reads as it always did. */
  it('a placeholder beside named people breaks nothing; each of its rules still bars the whole input', () => {
    expect(shapeProblem(several(['plasma', 'bane', 'allavail']))).toBe('')
    expect(shapeProblem(several(['all', 'plasma']))).toBe('')
    expect(shapeProblem(several(['plasma', 'allavail'], { endDate: 'Jul 19' }))).toBe('ALL AVAIL is for one day')
    expect(shapeProblem(several(['plasma', 'bane'], { endDate: 'Jul 19' })), 'the same input without it runs two days').toBe('')
    expect(shapeProblem(several(['plasma', 'allavail'], { type: 'OD' }))).toBe('ALL AVAIL is for Training, Meeting, Personal, Appointment, Duty, Event and Other')
    expect(shapeProblem(several(['plasma', 'bane'], { type: 'OD' }))).toBe('')
    /* a medical kind: the placeholder's own rule is said first, as at every door — never the document sentence */
    expect(shapeProblem(several(['plasma', 'allavail'], { type: 'OML' }))).toBe('ALL AVAIL is for Training, Meeting, Personal, Appointment, Duty, Event and Other')
    /* a named person twice is still refused with a placeholder in it */
    expect(shapeProblem(several(['bane', 'allavail', 'bane']))).toMatch(/already on this input/i)
  })
})

describe('"the same input" to a published day (inpDetailKey — the plan §4.2; D178)', () => {
  it('a record rewritten in the new shape, saying the same, is no change', () => {
    expect(inpDetailKey(several(['bane']))).toBe(inpDetailKey(oldOne('bane')))
    expect(inpDetailKey(several(['allavail']))).toBe(inpDetailKey(oldOne('allavail')))
  })
  it('the order people joined in is no part of it; who is in it is', () => {
    expect(inpDetailKey(several(['bane', 'plasma']))).toBe(inpDetailKey(several(['plasma', 'bane'])))
    expect(inpDetailKey(several(['bane', 'plasma']))).not.toBe(inpDetailKey(several(['bane'])))
    expect(inpDetailKey(several(['bane', 'plasma']))).not.toBe(inpDetailKey(several(['bane', 'stiff'])))
  })
  it('a frozen old-shaped copy against the live record in the new shape: nothing; a person added since: ONE edit', () => {
    const frozen = { rq1: oldOne('bane') }
    put(several(['bane']))
    expect(frozenInputMatch(frozen, 'Jul 18').diffs).toEqual([])
    INPUTS[0].people.push({ p: 'plasma', by: 'stiff', at: 2 })
    const diffs = frozenInputMatch(frozen, 'Jul 18').diffs
    expect(diffs.length).toBe(1)
    expect(diffs[0].id).toBe('rq1')
    expect(diffs[0].was && diffs[0].now).toBeTruthy()
  })
})

describe('the row an input writes (requestRowFields — the plan §4.3; D755)', () => {
  it('the first to join stands in the name box, the rest under it, in the order they joined', () => {
    const f: any = requestRowFields(several(['plasma', 'bane', 'stiff']))
    expect(f.who).toBe('plasma')
    expect(f.more).toEqual(['bane', 'stiff'])
    expect(f.prog).toBe('TRAINING')
  })
  it('a one-person input writes what it always wrote, in either shape — and no row is re-made for the new shape alone', () => {
    const a: any = requestRowFields(oldOne('bane')), b: any = requestRowFields(several(['bane']))
    expect(a.who).toBe('bane')
    expect(b.who).toBe('bane')
    expect('more' in a).toBe(false)
    expect('more' in b).toBe(false)
    expect(srcvOf(several(['bane']))).toBe(srcvOf(oldOne('bane')))
  })
  it('the row is re-made when who is in the input changes', () => {
    expect(srcvOf(several(['bane', 'plasma']))).not.toBe(srcvOf(several(['bane'])))
    expect(srcvOf(several(['bane', 'plasma']))).not.toBe(srcvOf(several(['plasma', 'bane'])))
  })
  it('landed on its day, the one row carries everyone — and follows the input when a person joins', () => {
    put(several(['plasma', 'bane']))
    const days = JSON.parse(JSON.stringify(DAYS))
    viewOfWeek('13/07/2026', days, { loaded: true, issued: () => null })
    const rows = days[SAT].ground.filter((g: any) => g.src === 'rq1')
    expect(rows.length).toBe(1)
    expect(rows[0].who).toBe('plasma')
    expect(rows[0].more).toEqual(['bane'])
    INPUTS[0].people.push({ p: 'stiff', by: 'stiff', at: 2 })
    viewOfWeek('13/07/2026', days, { loaded: true, issued: () => null })
    const again = days[SAT].ground.filter((g: any) => g.src === 'rq1')
    expect(again.length).toBe(1)
    expect(again[0].rid).toBe(rows[0].rid)
    expect(again[0].more).toEqual(['bane', 'stiff'])
  })
})

describe('a deleted man and an input\'s row (overlay.ts hisLanded — the plan §4.3)', () => {
  it('the row is his where he is the input\'s only person, in either shape; never where others remain', () => {
    const d = (r: any) => { INPUTS.length = 0; put(r); return { ground: [{ src: 'rq1', who: leadOf(r), rid: 'r1' }] } }
    expect([...hisLanded(d(oldOne('bane')), 'bane')]).toEqual(['rq1'])
    expect([...hisLanded(d(several(['bane'])), 'bane')]).toEqual(['rq1'])
    expect([...hisLanded(d(several(['bane', 'plasma'])), 'bane')]).toEqual([])
    expect([...hisLanded(d(several(['plasma', 'bane'])), 'bane')]).toEqual([])
  })
})

describe('OIL: one claim an input, one answer for everyone in it (D762; the plan §4.7)', () => {
  it('an input of three projects ONE claim, naming its three people', () => {
    put(several(['plasma', 'bane', 'stiff'], { oil: { [SAT_ISO]: 1 } }))
    const cl: any[] = projectOilInputs(SAT_ISO)
    expect(cl.length).toBe(1)
    expect(cl[0].iid).toBe('rq1')
    expect(cl[0].people).toEqual(['plasma', 'bane', 'stiff'])
    expect(cl[0].ph).toBe(null)
    expect(cl[0].ans).toBe(1)
  })
  it('an old-shaped record projects the same claim as its twin in the new shape', () => {
    put(oldOne('bane', { oil: { [SAT_ISO]: 0.5 } }))
    const a = projectOilInputs(SAT_ISO)
    INPUTS.length = 0
    put(several(['bane'], { oil: { [SAT_ISO]: 0.5 } }))
    expect(projectOilInputs(SAT_ISO)).toEqual(a)
    expect((a[0] as any).people).toEqual(['bane'])
  })
  it('a Yes earns for every person in it; a No, or no answer, for none', () => {
    put(several(['plasma', 'bane', 'stiff'], { oil: { [SAT_ISO]: 1 } }))
    for (const p of ['plasma', 'bane', 'stiff']) expect(figure(p), p).toBe('HO')
    INPUTS[0].oil = { [SAT_ISO]: 0 }
    for (const p of ['plasma', 'bane', 'stiff']) expect(figure(p), p).toBe(null)
    delete INPUTS[0].oil
    for (const p of ['plasma', 'bane', 'stiff']) expect(figure(p), p).toBe(null)
  })
  it('each person\'s switch starts where his credit does, and switching one off leaves the others', () => {
    put(several(['plasma', 'bane', 'stiff'], { oil: { [SAT_ISO]: 1 } }))
    const item = inputItemKey('rq1')
    const ev = oilEvidenceOf(SAT, DAYS[SAT])
    for (const p of ['plasma', 'bane', 'stiff']) expect(spanDefault(DAYS[SAT], ev, p, item), p).toBe(true)
    ;(DAYS[SAT] as any).oild = { people: { [`bane|${item}`]: 'deny' }, pa: { [`bane|${item}`]: 0 } }
    expect(figure('bane')).toBe(null)
    expect(figure('plasma')).toBe('HO')
    expect(figure('stiff')).toBe('HO')
  })
  it('a switch made about a man who left the input and came back does not come back with him (his `h`)', () => {
    const item = inputItemKey('rq1')
    put(several(['plasma', 'bane'], { oil: { [SAT_ISO]: 1 }, hand: 2 }))
    /* bane was put back in at holding 2; the refusal was made under holding 0 */
    INPUTS[0].people[1].h = 2
    ;(DAYS[SAT] as any).oild = { people: { [`bane|${item}`]: 'deny' }, pa: { [`bane|${item}`]: 0 } }
    expect(figure('bane')).toBe('HO')
    /* …and one made under the holding he stands in now does decide */
    ;(DAYS[SAT] as any).oild = { people: { [`bane|${item}`]: 'deny' }, pa: { [`bane|${item}`]: 2 } }
    expect(figure('bane')).toBe(null)
  })
})
