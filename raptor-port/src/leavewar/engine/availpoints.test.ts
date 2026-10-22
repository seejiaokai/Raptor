/* THE AVAILABLE ROWS' AMBER AND RED POINTS (the Leave War overhaul, batch 3 — D1190, D1191, D1202) and the days
   breaking a manning rule they now join (D1243, narrowing D1213).

   Each point is a number plus or minus that day's Required, never an absolute figure: red under Required + red ("+ 0"
   by default, the rule the rows always had), amber, where set, under Required + amber and not already red. A day with no
   Required shows neither. The one answer is `availVerdict`; the list of red days is `redDays`, which takes an Available
   row at red and never one at amber. */
import { describe, expect, it } from 'vitest'
import {
  amberHidden, availPointsOf, availRedLines, availVerdict, builtinAvailRule, cleanAvailRule, readAvailPoints,
  AVAIL_P, AVAIL_W, DEFAULT_AVAIL_POINTS,
} from './availrows'
import { redDays, type DayVerdict } from './evaluate'

describe('availVerdict — one answer for an Available row on a day', () => {
  it('with no points of its own it is today\'s rule: red under Required, never amber', () => {
    expect(availVerdict(23, 24)).toBe('red')
    expect(availVerdict(24, 24)).toBe('')                 // meeting Required is met
    expect(availVerdict(25, 24)).toBe('')
    expect(availVerdict(23.5, 24)).toBe('red')            // a half day of leave is half a man
    expect(DEFAULT_AVAIL_POINTS).toEqual({ red: 0 })
  })
  it('amber shows above red: "+ 2" turns a day amber with one or none to spare', () => {
    const p = { amber: 2, red: 0 }
    expect(availVerdict(26, 24, p)).toBe('')
    expect(availVerdict(25.5, 24, p)).toBe('amber')
    expect(availVerdict(25, 24, p)).toBe('amber')
    expect(availVerdict(24, 24, p)).toBe('amber')
    expect(availVerdict(23.5, 24, p)).toBe('red')         // red wins where both hold
  })
  it('negatives: "− 1" goes red only once two short, amber at "+ 0" in front of it', () => {
    const p = { amber: 0, red: -1 }
    expect(availVerdict(24, 24, p)).toBe('')
    expect(availVerdict(23.5, 24, p)).toBe('amber')
    expect(availVerdict(23, 24, p)).toBe('amber')        // exactly one short: met red's point
    expect(availVerdict(22.5, 24, p)).toBe('red')
  })
  it('red set at or above amber hides amber — and the window can say so', () => {
    const p = { amber: 1, red: 2 }
    for (const have of [20, 24, 25, 25.5]) expect(availVerdict(have, 24, p)).not.toBe('amber')
    expect(amberHidden(p)).toBe(true)
    expect(amberHidden({ amber: 1, red: 1 })).toBe(true)
    expect(amberHidden({ amber: 2, red: 0 })).toBe(false)
    expect(amberHidden({ red: 0 })).toBe(false)           // no amber set: nothing is hidden
  })
  it('a day with no Required, or no count, shows neither', () => {
    expect(availVerdict(3, null, { amber: 5, red: 4 })).toBe('')
    expect(availVerdict(null, 24, { amber: 5, red: 4 })).toBe('')
  })
})

describe('the points as stored', () => {
  const rule = (points?: unknown) => ({ ...builtinAvailRule(AVAIL_P), ...(points === undefined ? {} : { points }) } as any)
  it('a stored row without points reads as today', () => {
    const clean = cleanAvailRule(rule())!
    expect(clean.points).toBeUndefined()
    expect(availPointsOf(clean)).toEqual({ red: 0 })
  })
  it('a pair is kept, negatives too; "red + 0" alone is not written down', () => {
    expect(cleanAvailRule(rule({ amber: 2, red: 0 }))!.points).toEqual({ amber: 2, red: 0 })
    expect(cleanAvailRule(rule({ amber: -0.5, red: -2 }))!.points).toEqual({ amber: -0.5, red: -2 })
    expect(cleanAvailRule(rule({ red: 0 }))!.points).toBeUndefined()
    expect(cleanAvailRule(rule({ red: 1 }))!.points).toEqual({ red: 1 })
  })
  it('the threshold stays held at 0 — the points are never an absolute figure', () => {
    expect(cleanAvailRule({ ...rule({ amber: 2, red: 0 }), threshold: { amber: 30, red: 20 } })!.threshold).toEqual({ amber: 0, red: 0 })
  })
  it('what is not a pair is left out (today\'s rule then serves)', () => {
    expect(readAvailPoints(null)).toBeNull()
    expect(readAvailPoints([1, 2])).toBeNull()
    expect(readAvailPoints({ red: 'x' })).toBeNull()
    expect(readAvailPoints({ red: 1e6 })).toBeNull()
    expect(readAvailPoints({ amber: 'x', red: 1 })).toEqual({ red: 1 })   // a bad amber is no amber
    expect(readAvailPoints({ amber: 3 })).toEqual({ amber: 3, red: 0 })   // red absent reads "+ 0"
    expect(cleanAvailRule(rule('nonsense'))!.points).toBeUndefined()
  })
})

describe('redDays — the days breaking a manning rule', () => {
  const v = (date: string, results: [string, number, 'ok' | 'amber' | 'red'][]): DayVerdict => ({
    date, verdict: 'ok', counts: {} as any,
    results: results.map(([id, have, verdict]) => ({ ruleId: id, label: id.toUpperCase(), have, amber: 0, red: 0, verdict })),
  })
  const verdicts = {
    '2026-01-05': v('2026-01-05', [['ip', 3, 'amber']]),
    '2026-01-06': v('2026-01-06', [['sxo', 1, 'red'], ['ip', 4, 'ok']]),
    '2026-01-07': v('2026-01-07', []),
  }
  const dates = Object.keys(verdicts)
  const rules = { p: { ...builtinAvailRule(AVAIL_P), points: { amber: 2, red: 0 } }, w: builtinAvailRule(AVAIL_W) }
  /* Mon: Available P amber only; Tue: P red; Wed: W red */
  const day: Record<string, Parameters<typeof availRedLines>[1]> = {
    '2026-01-05': { p: { have: 25, required: 24 }, w: { have: 18, required: 16 } },
    '2026-01-06': { p: { have: 23, required: 24 }, w: { have: 18, required: null } },
    '2026-01-07': { p: { have: 28, required: 24 }, w: { have: 15, required: 16 } },
  }
  it('without the Available rows it is the Manning rows\' red days alone, as it always was', () => {
    expect(redDays(dates, verdicts)).toEqual([{ date: '2026-01-06', lines: [{ ruleId: 'sxo', label: 'SXO', have: 1 }] }])
  })
  it('an Available row at red counts, named with its figure; at amber it never does', () => {
    const out = redDays(dates, verdicts, d => availRedLines(rules, day[d]!))
    expect(out).toEqual([
      { date: '2026-01-06', lines: [{ ruleId: 'sxo', label: 'SXO', have: 1 }, { ruleId: 'availp', label: 'Available P', have: 23, need: expect.any(Number) }] },
      { date: '2026-01-07', lines: [{ ruleId: 'availw', label: 'Available W', have: 15, need: expect.any(Number) }] },
    ])
    expect(out.some(d => d.date === '2026-01-05')).toBe(false)   // Available P amber on Mon: not a red day
  })
})
