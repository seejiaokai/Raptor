import { describe, expect, it } from 'vitest'

import { balanceOf, type FigureCtx, type Ledger, type Openings } from './counters'
import {
  DEFAULT_OIL_POLICY,
  defaultWindowFrom,
  expiryOf,
  inWindow,
  oilBalanceOf,
  oilLedgerFor,
  readOilPolicy,
  type OilPolicy,
} from './oiltracker'
import { addMonths } from './period'
import { seedLedger, seedOpenings, seedWars } from './seed'

const NONE: OilPolicy = { expiry: null, historyMonths: null }
const DAYS30: OilPolicy = { expiry: { n: 30, unit: 'days' }, historyMonths: 6 }
const MONTHS3: OilPolicy = { expiry: { n: 3, unit: 'months' }, historyMonths: 6 }

/** One person, one war, the cells given — everything else empty. */
function ctxOf(grid: Record<string, string>, ledger: Ledger = [], openings: Openings = {}): FigureCtx {
  return { openings, ledger, sources: [{ grid: { p: grid }, states: {} }] }
}

describe('addMonths', () => {
  it('lands on the same day of the month', () => {
    expect(addMonths('2026-01-15', 1)).toBe('2026-02-15')
    expect(addMonths('2026-11-15', 3)).toBe('2027-02-15')
    expect(addMonths('2026-03-15', -6)).toBe('2025-09-15')
  })
  it('clamps to the last day of a shorter month rather than rolling over', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28')
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29')
    expect(addMonths('2026-05-31', 1)).toBe('2026-06-30')
    expect(addMonths('2026-03-31', -1)).toBe('2026-02-28')
  })
})

describe('the policy', () => {
  it('reads a stored policy and refuses junk', () => {
    expect(readOilPolicy({ expiry: null, historyMonths: 6 })).toEqual({ expiry: null, historyMonths: 6 })
    expect(readOilPolicy({ expiry: { n: 90, unit: 'days' }, historyMonths: null })).toEqual({ expiry: { n: 90, unit: 'days' }, historyMonths: null })
    expect(readOilPolicy({})).toEqual({ expiry: null, historyMonths: null })
    expect(readOilPolicy(null)).toBeNull()
    expect(readOilPolicy([])).toBeNull()
    expect(readOilPolicy({ expiry: { n: 0, unit: 'days' } })).toBeNull()
    expect(readOilPolicy({ expiry: { n: 1.5, unit: 'months' } })).toBeNull()
    expect(readOilPolicy({ expiry: { n: 2, unit: 'years' } })).toBeNull()
    expect(readOilPolicy({ expiry: null, historyMonths: 'six' })).toBeNull()
    expect(readOilPolicy({ expiry: null, historyMonths: 0 })).toBeNull()
  })

  it('expiry is the first day the credit can no longer be used', () => {
    expect(expiryOf('2026-01-01', NONE)).toBeNull()
    expect(expiryOf('2026-01-01', DAYS30)).toBe('2026-01-31')
    expect(expiryOf('2026-01-31', MONTHS3)).toBe('2026-04-30')
    // The undated opening figure never expires.
    expect(expiryOf('', DAYS30)).toBeNull()
  })

  it('the default window is N months back, or open from the first entry', () => {
    expect(defaultWindowFrom({ expiry: null, historyMonths: 6 }, '2026-09-02')).toBe('2026-03-02')
    expect(defaultWindowFrom(NONE, '2026-09-02')).toBeNull()
  })

  it('inWindow: bounds inclusive, either open, the opening figure always in', () => {
    expect(inWindow('2026-03-02', '2026-03-02', '2026-09-02')).toBe(true)
    expect(inWindow('2026-03-01', '2026-03-02', null)).toBe(false)
    expect(inWindow('2026-09-03', null, '2026-09-02')).toBe(false)
    expect(inWindow('', '2026-03-02', '2026-09-02')).toBe(true)
  })
})

describe('credits and debits are read from what the store already holds', () => {
  it('an FO/HO cell is a credit with the day\'s reason; an OIL day is a debit', () => {
    const led = oilLedgerFor(ctxOf({
      '2026-01-03': 'FO',   // Saturday
      '2026-01-01': 'HO',   // Thursday — a PH (the wire only writes on non-working days)
      '2026-01-12': 'OIL',
      '2026-01-13': '*OIL',
    }), 'p', NONE, '2026-02-01')
    expect(led.credits.map(c => [c.date, c.amount, c.reason, c.source])).toEqual([
      ['2026-01-01', 0.5, 'PH duty', 'auto'],
      ['2026-01-03', 1, 'weekend duty', 'auto'],
    ])
    expect(led.debits.map(d => [d.date, d.amount, d.reason])).toEqual([
      ['2026-01-12', 1, 'OIL taken'],
      ['2026-01-13', 0.5, 'OIL taken (AM)'],
    ])
    expect(led.earned).toBe(1.5)
    expect(led.taken).toBe(1.5)
    expect(led.balance).toBe(0)
    expect(led.first).toBe('2026-01-01')
  })

  it('a refused OIL bid draws nothing — the same gate the manning rows use', () => {
    const ctx: FigureCtx = {
      openings: {}, ledger: [],
      sources: [{ grid: { p: { '2026-01-03': 'FO', '2026-01-12': 'OIL' } }, states: { p: { '2026-01-12': { state: 'refused', source: 'bid' } } } }],
    }
    const led = oilLedgerFor(ctx, 'p', NONE, '2026-02-01')
    expect(led.debits).toEqual([])
    expect(led.balance).toBe(1)
  })

  it('a positive ledger entry is a grant, a negative one a correction; the opening figure is undated', () => {
    const ledger: Ledger = [
      { id: 'g1', personId: 'p', counter: 'oil', amount: 2, date: '2026-02-02', reason: 'CNY workplan', approvedBy: 'SQNCDR' },
      { id: 'g2', personId: 'p', counter: 'oil', amount: -0.5, date: '2026-02-10', reason: 'Correction', approvedBy: 'SQNCDR' },
      { id: 'x', personId: 'p', counter: 'annual', amount: 14, date: '2026-01-01', reason: 'not OIL', approvedBy: 'SQNCDR' },
      { id: 'q', personId: 'other', counter: 'oil', amount: 9, date: '2026-01-01', reason: 'someone else', approvedBy: 'SQNCDR' },
    ]
    const led = oilLedgerFor(ctxOf({}, ledger, { p: { oil: 1.5 } }), 'p', NONE, '2026-03-01')
    expect(led.credits.map(c => [c.id, c.date, c.amount, c.source])).toEqual([
      ['open:p', '', 1.5, 'opening'],
      ['g1', '2026-02-02', 2, 'grant'],
    ])
    expect(led.credits[1].approvedBy).toBe('SQNCDR')
    expect(led.credits[1].ledgerId).toBe('g1')
    expect(led.debits.map(d => [d.id, d.amount, d.source])).toEqual([['g2', 0.5, 'correction']])
    expect(led.granted).toBe(1.5)
    expect(led.balance).toBe(3)
  })

  it('a negative opening figure is an undated debit', () => {
    const led = oilLedgerFor(ctxOf({ '2026-01-03': 'FO' }, [], { p: { oil: -4.5 } }), 'p', NONE, '2026-03-01')
    expect(led.debits.map(d => [d.date, d.amount, d.source])).toEqual([['', 4.5, 'opening']])
    expect(led.balance).toBe(-3.5)
    expect(led.overdrawn).toBe(3.5)
  })
})

describe('FIFO — a day taken draws the oldest credit first', () => {
  it('allocates oldest-first and records both sides', () => {
    const led = oilLedgerFor(ctxOf({
      '2026-01-03': 'FO',    // oldest
      '2026-01-10': 'HO',
      '2026-01-17': 'FO',
      '2026-01-20': 'OIL',   // 1 → all of 3 Jan
      '2026-01-21': 'OIL',   // 1 → 0.5 of 10 Jan + 0.5 of 17 Jan
    }), 'p', NONE, '2026-02-01')
    const [c1, c2, c3] = led.credits
    expect(c1.used).toEqual([{ date: '2026-01-20', amount: 1 }]); expect(c1.left).toBe(0)
    expect(c2.used).toEqual([{ date: '2026-01-21', amount: 0.5 }]); expect(c2.left).toBe(0)
    expect(c3.used).toEqual([{ date: '2026-01-21', amount: 0.5 }]); expect(c3.left).toBe(0.5)
    expect(led.debits[1].from).toEqual([{ creditId: c2.id, amount: 0.5 }, { creditId: c3.id, amount: 0.5 }])
    expect(led.balance).toBe(0.5)
  })

  it('a day with nothing to draw from is overdraw, shown negative and never refused', () => {
    const led = oilLedgerFor(ctxOf({ '2026-01-05': 'OIL', '2026-01-10': 'HO' }), 'p', NONE, '2026-02-01')
    // 5 Jan is taken before 10 Jan is earned. FIFO still lets it draw the
    // credit — the balance is a running total, not a strict timeline — so
    // nothing is unbacked while credit exists.
    expect(led.debits[0].unbacked).toBe(0.5)
    expect(led.balance).toBe(-0.5)
    expect(led.overdrawn).toBe(0.5)
  })

  it('the opening figure is drawn before anything dated', () => {
    const led = oilLedgerFor(ctxOf({ '2026-01-03': 'FO', '2026-01-05': 'OIL' }, [], { p: { oil: 1 } }), 'p', NONE, '2026-02-01')
    expect(led.debits[0].from).toEqual([{ creditId: 'open:p', amount: 1 }])
    expect(led.credits[1].left).toBe(1)
  })
})

describe('expiry', () => {
  it('a credit past its date is retired from the balance, and the sheet says how much', () => {
    // FO on 3 Jan, 30 days → gone on 2 Feb.
    const jan = ctxOf({ '2026-01-03': 'FO', '2026-01-10': 'HO' })
    expect(oilLedgerFor(jan, 'p', DAYS30, '2026-02-01').balance).toBe(1.5)
    const feb = oilLedgerFor(jan, 'p', DAYS30, '2026-02-02')
    expect(feb.balance).toBe(0.5)
    expect(feb.expired).toBe(1)
    expect(feb.credits[0].expires).toBe('2026-02-02')
    expect(feb.credits[0].expired).toBe(1)
    expect(feb.credits[0].left).toBe(0)
  })

  it('a day taken cannot draw a credit that had already expired on that day — it skips to the next', () => {
    const led = oilLedgerFor(ctxOf({
      '2026-01-03': 'FO',    // expires 2 Feb
      '2026-02-07': 'FO',    // Saturday; expires 9 Mar
      '2026-02-10': 'OIL',   // 3 Jan is dead by now → draws 7 Feb
    }), 'p', DAYS30, '2026-02-15')
    expect(led.credits[0].used).toEqual([]); expect(led.credits[0].expired).toBe(1)
    expect(led.credits[1].used).toEqual([{ date: '2026-02-10', amount: 1 }])
    expect(led.balance).toBe(0)
    expect(led.expired).toBe(1)
  })

  it('months count on the calendar, clamped', () => {
    const led = oilLedgerFor(ctxOf({ '2026-01-31': 'FO' }), 'p', MONTHS3, '2026-04-29')
    expect(led.credits[0].expires).toBe('2026-04-30')
    expect(led.balance).toBe(1)
    expect(oilBalanceOf(ctxOf({ '2026-01-31': 'FO' }), 'p', MONTHS3, '2026-04-30')).toBe(0)
  })

  it('the opening figure never expires', () => {
    const led = oilLedgerFor(ctxOf({}, [], { p: { oil: 2 } }), 'p', DAYS30, '2030-01-01')
    expect(led.balance).toBe(2)
    expect(led.expired).toBe(0)
  })

  it('a grant expires from its own date like an earned day', () => {
    const ledger: Ledger = [{ id: 'g1', personId: 'p', counter: 'oil', amount: 2, date: '2026-01-01', reason: 'award', approvedBy: 'OC' }]
    expect(oilBalanceOf(ctxOf({}, ledger), 'p', DAYS30, '2026-01-30')).toBe(2)
    expect(oilBalanceOf(ctxOf({}, ledger), 'p', DAYS30, '2026-01-31')).toBe(0)
  })
})

describe('with no expiry the tracker IS the old sum', () => {
  it('matches balanceOf for every seeded person, negative openings included', () => {
    const openings = seedOpenings()
    const ledger = seedLedger()
    const sources = seedWars()
    const ctx: FigureCtx = { openings, ledger, sources }
    const people = new Set([...Object.keys(openings), ...ledger.map(e => e.personId), ...sources.flatMap(w => Object.keys(w.grid))])
    expect(people.size).toBeGreaterThan(10)
    for (const p of people) {
      expect(oilBalanceOf(ctx, p, DEFAULT_OIL_POLICY, '2026-12-31'), p).toBeCloseTo(balanceOf(openings, ledger, sources, p, 'oil'), 6)
    }
  })

  it('and the breakdown still sums once something has expired', () => {
    const ctx: FigureCtx = { openings: { p: { oil: 1 } }, ledger: [], sources: [{ grid: { p: { '2026-01-03': 'FO', '2026-03-10': 'OIL' } }, states: {} }] }
    const led = oilLedgerFor(ctx, 'p', DAYS30, '2026-03-11')
    // opening 1 + earned 1 − taken 1 − expired 1 = 0; the OIL day drew the
    // opening (oldest), so the earned day sat unused and expired on 2 Feb.
    expect(led.balance).toBe(0)
    expect(led.expired).toBe(1)
    expect(1 + led.earned + led.granted - led.taken - led.expired).toBe(led.balance)
  })
})
