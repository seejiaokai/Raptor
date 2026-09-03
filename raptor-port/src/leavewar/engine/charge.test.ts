import { describe, expect, it } from 'vitest'
import { chargedDays, LONG_LEAVE_DAYS, type CountCtx, type LeaveSource } from './charge'
import { balanceOf, drawnFrom, lveConOf, medConOf, takenOf } from './counters'
import { seedEventDefs } from './eventdefs'
import type { Person } from './people'
import { addDays, buildDays, type Period } from './period'

// The owner's rule (3 Sep 26): leave on a weekend or a public holiday costs
// nothing and counts as nothing — unless a PILOT is 15 days or more into one
// unbroken run of the same pool, in which case every day charges.
//
// Calendar facts the cases lean on (period.test.ts pins the same weekend):
//   2026-01-03 Sat · 2026-01-04 Sun · 2026-01-05 Mon … 2026-01-09 Fri
//   2026-01-10 Sat · 2026-01-11 Sun · 2026-01-12 Mon … 2026-01-16 Fri
//   2026-01-17 Sat · 2026-01-18 Sun · 2026-01-19 Mon

const person = (id: string, seat: Person['seat']): Person =>
  ({ id, callsign: id.toUpperCase(), seat, band: 'ops', sxo: false, from: null, to: null })

const pilotCtx: CountCtx = { eventDefs: seedEventDefs(), people: [person('ace', 'pilot'), person('wiz', 'wso')] }

const period = (start: string, end: string, tweak?: (p: Period) => void): Period => {
  const p: Period = { id: `${start}`, name: 'w', start, end, stage: 'open', bidFrom: null, bidTo: null, days: buildDays(start, end), bands: [] }
  tweak?.(p)
  return p
}

/** `who` holds `code` on every day from `from` for `n` days. */
const span = (from: string, n: number, code: string): Record<string, string> => {
  const out: Record<string, string> = {}
  for (let i = 0; i < n; i++) out[addDays(from, i)] = code
  return out
}

const src = (grid: Record<string, Record<string, string>>, p?: Period, states = {}): LeaveSource => ({ grid, states, period: p })

describe('a weekend or PH day of leave charges nothing', () => {
  it('a Sat/Sun LL draws no annual and shows in no USED figure — but the cell still stands', () => {
    const sources = [src({ wiz: { '2026-01-02': 'LL', '2026-01-03': 'LL', '2026-01-04': 'LL', '2026-01-05': 'LL' } })]
    expect(drawnFrom(sources, 'wiz', 'annual', pilotCtx)).toBe(2)
    expect(takenOf(sources, 'wiz', 'LL', pilotCtx)).toBe(2)
    expect(lveConOf(sources, 'wiz', pilotCtx)).toBe(2)
    expect(balanceOf({ wiz: { annual: 10 } }, [], sources, 'wiz', 'annual', pilotCtx)).toBe(8)
  })

  it('needs no ctx at all to know a weekend — an engine caller with only a grid gets the rule', () => {
    const sources = [src({ wiz: { '2026-01-03': 'OIL', '2026-01-05': 'OIL' } })]
    expect(drawnFrom(sources, 'wiz', 'oil')).toBe(1)
    expect(takenOf(sources, 'wiz', 'OIL')).toBe(1)
  })

  it('a day the war flags `ph` charges nothing', () => {
    const p = period('2026-01-05', '2026-01-09', p => { p.days[2].ph = true }) // Wed 7th
    const sources = [src({ wiz: span('2026-01-05', 5, 'CCL') }, p)]
    expect(drawnFrom(sources, 'wiz', 'ccl', pilotCtx)).toBe(4)
    expect(takenOf(sources, 'wiz', 'CCL', pilotCtx)).toBe(4)
  })

  it("a day carrying an event word tagged 'off' — the admin's PH — charges nothing, even marked AFTER the leave", () => {
    const p = period('2026-01-05', '2026-01-09')
    const sources = [src({ wiz: span('2026-01-05', 5, 'LL') }, p)]
    expect(drawnFrom(sources, 'wiz', 'annual', pilotCtx)).toBe(5)
    // The admin types PH on the Thursday. Nothing is stored about the
    // balance, so the next read simply excuses the day.
    p.days[3].events = ['PH']
    expect(drawnFrom(sources, 'wiz', 'annual', pilotCtx)).toBe(4)
    // …and a band across the week does the same through its own tag.
    p.days[3].events = []
    p.bands = [{ line: 0, from: '2026-01-06', to: '2026-01-06', text: 'closure', kind: 'off' }]
    expect(drawnFrom(sources, 'wiz', 'annual', pilotCtx)).toBe(4)
  })

  it("a management Off day (`free`) is NOT a holiday here — leave on it still charges", () => {
    const p = period('2026-01-05', '2026-01-09')
    p.days[1].events = ['Off day']
    const sources = [src({ wiz: span('2026-01-05', 5, 'LL') }, p)]
    expect(drawnFrom(sources, 'wiz', 'annual', pilotCtx)).toBe(5)
  })

  it('medical is untouched — hospitalisation over a weekend is still hospitalisation', () => {
    const sources = [src({ wiz: { '2026-01-02': 'HL', '2026-01-03': 'HL', '2026-01-04': 'HL', '2026-01-05': 'OML' } })]
    expect(medConOf(sources, 'wiz', pilotCtx)).toBe(4)
    expect(takenOf(sources, 'wiz', 'HL', pilotCtx)).toBe(3)
  })

  it('a half day on a weekend is excused too; on a weekday it still charges its half', () => {
    const sources = [src({ wiz: { '2026-01-03': '*LL', '2026-01-05': 'LL*' } })]
    expect(drawnFrom(sources, 'wiz', 'annual', pilotCtx)).toBe(0.5)
  })
})

describe("the pilots' 15-day rule", () => {
  // Mon 5 Jan → Mon 19 Jan is 15 calendar days holding two weekends.
  const fifteen = span('2026-01-05', 15, 'LL')

  it('a pilot 15 days deep charges every day, the weekends inside included', () => {
    const sources = [src({ ace: fifteen })]
    expect(drawnFrom(sources, 'ace', 'annual', pilotCtx)).toBe(15)
    expect(takenOf(sources, 'ace', 'LL', pilotCtx)).toBe(15)
  })

  it('the same 15 days for a WSO charge the eleven working days only', () => {
    const sources = [src({ wiz: fifteen })]
    expect(drawnFrom(sources, 'wiz', 'annual', pilotCtx)).toBe(11)
  })

  it('a pilot with nobody on the roster is not a pilot — the rule needs the people to say so', () => {
    const sources = [src({ ace: fifteen })]
    expect(drawnFrom(sources, 'ace', 'annual')).toBe(11)
    expect(drawnFrom(sources, 'ace', 'annual', { people: [] })).toBe(11)
  })

  it('14 days is short: the weekends inside are excused', () => {
    const sources = [src({ ace: span('2026-01-05', 14, 'LL') })]
    expect(drawnFrom(sources, 'ace', 'annual', pilotCtx)).toBe(10)
    expect(LONG_LEAVE_DAYS).toBe(15)
  })

  it('LL then OL is ONE run — both spend the annual pool', () => {
    const grid = { ...span('2026-01-05', 7, 'LL'), ...span('2026-01-12', 8, 'OL') }
    const sources = [src({ ace: grid })]
    expect(drawnFrom(sources, 'ace', 'annual', pilotCtx)).toBe(15)
  })

  it("a day of another leave — the owner's OIL/FCL/CCL/EL/PL/CL — breaks the run, so two 14s stay short", () => {
    // 14 LL, one OIL, then 14 more LL: 29 days away, no run reaches 15.
    const grid = { ...span('2026-01-05', 14, 'LL'), '2026-01-19': 'OIL', ...span('2026-01-20', 14, 'LL') }
    const sources = [src({ ace: grid })]
    // Each 14-day LL block holds four weekend days → 10 charged, twice; the
    // OIL Monday charges its own counter.
    expect(drawnFrom(sources, 'ace', 'annual', pilotCtx)).toBe(20)
    expect(drawnFrom(sources, 'ace', 'oil', pilotCtx)).toBe(1)
    for (const breaker of ['FCL', 'CCL', 'EL', 'PL', 'CL']) {
      const g = { ...span('2026-01-05', 14, 'LL'), '2026-01-19': breaker, ...span('2026-01-20', 14, 'LL') }
      expect(drawnFrom([src({ ace: g })], 'ace', 'annual', pilotCtx), breaker).toBe(20)
    }
  })

  it('a blank day, a medical day or a refused bid breaks the run the same way', () => {
    const blank = { ...span('2026-01-05', 8, 'LL'), ...span('2026-01-14', 8, 'LL') } // 13th empty
    expect(drawnFrom([src({ ace: blank })], 'ace', 'annual', pilotCtx)).toBe(12)
    const med = { ...span('2026-01-05', 8, 'LL'), '2026-01-13': 'OML', ...span('2026-01-14', 8, 'LL') }
    expect(drawnFrom([src({ ace: med })], 'ace', 'annual', pilotCtx)).toBe(12)
    const refused = { ace: { '2026-01-13': { state: 'refused' as const, source: 'bid' as const } } }
    expect(drawnFrom([src({ ace: span('2026-01-05', 17, 'LL') }, undefined, refused)], 'ace', 'annual', pilotCtx)).toBe(12)
  })

  it('a run may cross a war boundary — entitlements are continuous, wars are windows', () => {
    const a = period('2026-01-01', '2026-01-11'), b = period('2026-01-12', '2026-01-31')
    const sources = [
      src({ ace: span('2026-01-05', 7, 'LL') }, a),
      src({ ace: span('2026-01-12', 8, 'LL') }, b),
    ]
    expect(drawnFrom(sources, 'ace', 'annual', pilotCtx)).toBe(15)
  })

  it('a half day BREAKS the run — a continuous run is full days only', () => {
    // 14 full LL then a half day: the half day is not a full day of leave, so
    // it does not extend the run to 15. The 14-day block stays short — its
    // four weekend days are excused (10 charged) — and the half day charges
    // its own half on the Monday.
    const grid = { ...span('2026-01-05', 14, 'LL'), '2026-01-19': 'LL*' }
    expect(drawnFrom([src({ ace: grid })], 'ace', 'annual', pilotCtx)).toBe(10.5)
  })

  it('a half day in the MIDDLE splits a would-be 15-day run into two short ones', () => {
    // 7 full LL, a half day, 7 more full LL: 15 cells of leave, but the half
    // day breaks the run, so neither side reaches 15 and the weekends inside
    // each side are excused. 5–11 Jan holds one weekend (5 charged), the half
    // on the 12th charges 0.5, 13–19 Jan holds one weekend (5 charged).
    const grid = { ...span('2026-01-05', 7, 'LL'), '2026-01-12': 'LL*', ...span('2026-01-13', 7, 'LL') }
    expect(drawnFrom([src({ ace: grid })], 'ace', 'annual', pilotCtx)).toBe(10.5)
  })

  it('a long run of CL charges every day for a pilot too — the rule is by counter, not by LL/OL', () => {
    expect(drawnFrom([src({ ace: span('2026-01-05', 15, 'CL') })], 'ace', 'cl', pilotCtx)).toBe(15)
    expect(drawnFrom([src({ wiz: span('2026-01-05', 15, 'CL') })], 'wiz', 'cl', pilotCtx)).toBe(11)
  })
})

describe('chargedDays', () => {
  it('reports the counter and the amount per charged date, and nothing for an excused one', () => {
    const m = chargedDays([src({ wiz: { '2026-01-02': 'LL', '2026-01-03': '*OIL' } })], 'wiz', pilotCtx)
    expect([...m.entries()]).toEqual([['2026-01-02', { date: '2026-01-02', counter: 'annual', amount: 1 }]])
  })

  it('is empty for someone with no leave at all', () => {
    expect(chargedDays([src({})], 'nobody', pilotCtx).size).toBe(0)
  })
})
