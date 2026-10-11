/* [OIL-PERSONAL-PLACEHOLDER] ([DB-READINESS] group A, phase 7, 1 Oct 26) — this file pinned a placeholder the scheduler
   dropped on a PERSONAL request's row: counted (D27, D37), frozen at publication (D44), and earning nobody (D43).

   THAT ROW CANNOT EXIST ANY MORE ([ALL-AVAIL-AS-MEMBER] step 2, 12 Oct 26; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.1). Owner, D755 (11 Oct 26): "a row that came from an input IS the input: whoever stands
   on it … is in the input" — so a placeholder on a request's row is one of the input's own people, and a Personal
   input is one person's own (D755 (4)); ALL AVAIL / ALL is offered for six kinds only, never "Fly with" or "Personal"
   (D712, D753). What is true now, and all this file still pins:
   · the write refuses a Personal input that holds a placeholder, alone or beside its man (inputs.ts placeholderProblem,
     shapeProblem — held at every door and at the save boundary);
   · every kind that MAY hold one asks the OIL question, so the crowd of any placeholder is written down by the asking
     half of the day's record (oilsent.test.ts, oilclaimcrowd.test.ts) — the non-asking half had this one case;
   · and such a record, if it were forced in, projects no claim and earns nobody anything (D43: like named people — a
     named man on a Personal row never earned either). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, PLACEHOLDER_KINDS, oilAsks, placeholderProblem, shapeProblem } from './inputs'
import { HOOKS } from './hooks'
import { ensureRowIds } from './rowids'
import { inputItemKey } from './oil'
import { oilEvidence, oilEarnedWork, projectOilInputs } from './oilev'
import { requestRowFields } from './overlay'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5, SAT_ISO = '2026-07-18'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel
const ITEM = inputItemKey('rq1')

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  Object.assign(DAYS[SAT] as any, { waves: [], dutywaves: [], sims: {}, ground: [], allhands: [], oild: undefined })
  ensureRowIds(DAYS)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => ['bane', 'stiff', 'plasma']
})
afterEach(() => { HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel })

/* a Personal input for the Saturday, 09:00–17:00, holding `ids` */
const personal = (ids: string[], over: any = {}) => ({ iid: 'rq1', type: 'Personal', date: 'Jul 18', yr: 2026,
  allday: false, s: 9 * 60, e: 17 * 60, remarks: '', mod: 'now', by: 'ignite', people: ids.map(p => ({ p })), ...over })

describe('a Personal input never holds ALL AVAIL / ALL (D712, D753, D755 (4))', () => {
  it('the write refuses it — the placeholder alone, beside its man, and in a record of the old shape', () => {
    for (const ph of ['allavail', 'all']) {
      expect(placeholderProblem(personal([ph])), ph).toMatch(/can be filed only for/i)
      expect(shapeProblem(personal([ph])), ph).toMatch(/can be filed only for/i)
      expect(shapeProblem(personal(['ignite', ph])), `${ph} beside its man`).not.toBe('')
      expect(placeholderProblem({ ...personal([]), people: undefined, person: ph }), `${ph}, the old shape`).toMatch(/can be filed only for/i)
    }
    expect(shapeProblem(personal(['ignite'])), 'THE CONTROL: one man\'s own Personal input is fine').toBe('')
  })

  it('every kind that MAY hold one asks the OIL question — Personal is not among them, and does not ask', () => {
    expect(PLACEHOLDER_KINDS).not.toContain('Personal')
    for (const t of PLACEHOLDER_KINDS) expect(oilAsks(t), t).toBe(true)
    expect(oilAsks('Personal')).toBe(false)
  })
})

describe('…and one forced past the write earns nobody anything (D43: like named people)', () => {
  it.each([
    ['the placeholder alone', ['allavail']],
    ['beside its man', ['ignite', 'allavail']],
    ['ALL, in the name box', ['all', 'ignite']],
  ])('%s: no claim is projected, and neither the crowd nor the man is credited — an allow cannot invent it', (_n, ids) => {
    INPUTS.unshift(personal(ids as string[], { acc: 'g', oil: { [SAT_ISO]: 1 } }))
    ;(DAYS[SAT] as any).ground = [{ ...requestRowFields(INPUTS[0]), src: 'rq1' }]
    ensureRowIds(DAYS)
    expect(projectOilInputs(SAT_ISO).some(i => i.iid === 'rq1'), 'a kind that never asks projects no claim').toBe(false)
    expect(Object.keys(oilEarnedWork(DAYS[SAT], oilEvidence(SAT)))).toEqual([])
    ;(DAYS[SAT] as any).oild = { people: { [`stiff|${ITEM}`]: 'allow', [`ignite|${ITEM}`]: 'allow' } }
    expect(Object.keys(oilEarnedWork(DAYS[SAT], oilEvidence(SAT))), 'an allow counts real work; it never invents it').toEqual([])
  })
})
