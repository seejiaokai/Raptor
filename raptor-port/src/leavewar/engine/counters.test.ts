import { describe, expect, it } from 'vitest'
import type { Grid } from './availability'
import type { States } from './bids'
import {
  balanceOf,
  COUNTERS,
  counterLabel,
  drawnFrom,
  grantedTo,
  takenOf,
  medConOf,
  lveConOf,
  figureParts,
  FIGURES,
  orderedFigures,
  earnedOil,
  DEFAULT_FIGURE_ID,
  DEFAULT_FIGURE_ORDER,
  type Ledger,
  type Openings,
} from './counters'

const approved = (source: 'bid' | 'raptor' = 'bid') => ({ state: 'approved' as const, source })
const pending = { state: 'pending' as const, source: 'bid' as const }
const refused = { state: 'refused' as const, source: 'bid' as const }

describe('COUNTERS', () => {
  // SEVEN counters against EIGHT leave types. LL and OL both spend the annual
  // pool, so a list of leave TYPES would show the same figure twice under two
  // names — and it would grow every time a type was added, which the counter
  // list does not. Both figures moved together when FCL was removed on
  // 10 Aug 26, without this list being edited: it is derived, not restated —
  // and CL (3 Sep 26) arrived here the same way, by naming its own pool.
  it('is the seven entitlements, one fewer than the leave types', () => {
    expect(COUNTERS).toEqual(['annual', 'oil', 'ccl', 'fcl', 'pl', 'el', 'cl'])
  })

  it('has a label for every counter', () => {
    for (const c of COUNTERS) expect(counterLabel(c)).toBeTruthy()
  })

  // The list is derived from the code catalogue, not hand-written beside it.
  // A ninth leave type naming a new counter must appear here without anyone
  // remembering this file.
  it('covers every counter any leave type actually spends', () => {
    expect(new Set(COUNTERS).size).toBe(COUNTERS.length)
  })

  it('refuses to be reordered by a caller mutating the exported array', () => {
    expect(() => (COUNTERS as string[]).reverse()).toThrow()
  })
})

describe('drawnFrom', () => {
  // Each case uses its OWN narrow grid. Sharing one wide grid across them
  // hid a real fact on the first attempt: a cell with no state recorded
  // reads as PENDING and therefore draws, so unrelated cells left unstated
  // were silently adding to every total.

  // LL and OL draw from the same pool. This is the whole reason the panel
  // cycles counters rather than leave types.
  it('draws local and overseas leave from the same annual pool', () => {
    const grid: Grid = { ramp: { '2026-01-05': 'LL', '2026-01-06': 'OL' } }
    const states: States = { ramp: { '2026-01-05': approved(), '2026-01-06': approved() } }
    expect(drawnFrom([{ grid: grid, states: states }], 'ramp', 'annual')).toBe(2)
  })

  it('draws a half day as half', () => {
    const grid: Grid = { ramp: { '2026-01-07': '*LL' } }
    expect(drawnFrom([{ grid: grid, states: { ramp: { '2026-01-07': approved() } } }], 'ramp', 'annual')).toBe(0.5)
    const pm: Grid = { ramp: { '2026-01-07': 'LL*' } }
    expect(drawnFrom([{ grid: pm, states: { ramp: { '2026-01-07': approved() } } }], 'ramp', 'annual')).toBe(0.5)
  })

  it('draws OIL from the OIL counter and nothing from annual', () => {
    const grid: Grid = { ramp: { '2026-01-08': 'OIL' } }
    const states: States = { ramp: { '2026-01-08': approved() } }
    expect(drawnFrom([{ grid: grid, states: states }], 'ramp', 'oil')).toBe(1)
    expect(drawnFrom([{ grid: grid, states: states }], 'ramp', 'annual')).toBe(0)
  })

  // The same worst-case rule the manning rows already use, reached through
  // the same function: a pending bid has been asked for, so it cannot be
  // asked for twice.
  it('draws a pending bid, so nobody can bid leave they have already asked for', () => {
    const grid: Grid = { ramp: { '2026-01-05': 'LL' } }
    expect(drawnFrom([{ grid: grid, states: { ramp: { '2026-01-05': pending } } }], 'ramp', 'annual')).toBe(1)
  })

  it('draws nothing for a refused bid — he did not get the day', () => {
    const grid: Grid = { ramp: { '2026-01-05': 'LL' } }
    expect(drawnFrom([{ grid: grid, states: { ramp: { '2026-01-05': refused } } }], 'ramp', 'annual')).toBe(0)
  })

  it('draws a bid with no decision recorded, which reads as pending', () => {
    const grid: Grid = { ramp: { '2026-01-05': 'LL' } }
    expect(drawnFrom([{ grid: grid, states: {} }], 'ramp', 'annual')).toBe(1)
  })

  // Leave entered on Raptor's input tab was approved verbally. It has been
  // taken, so it spends exactly as an approved bid does.
  it('draws leave Raptor owns, the same as an approved bid', () => {
    const grid: Grid = { ramp: { '2026-01-05': 'LL' } }
    expect(drawnFrom([{ grid: grid, states: { ramp: { '2026-01-05': approved('raptor') } } }], 'ramp', 'annual')).toBe(1)
  })

  it('draws nothing for codes that spend no counter', () => {
    for (const code of ['CSE', 'ATTC', 'HL', 'OML', 'OD', 'FO', 'HO']) {
      const grid: Grid = { ramp: { '2026-01-09': code } }
      for (const c of COUNTERS) expect(drawnFrom([{ grid: grid, states: {} }], 'ramp', c)).toBe(0)
    }
  })

  it('draws nothing for a person with no cells at all', () => {
    expect(drawnFrom([{ grid: { ramp: { '2026-01-05': 'LL' } }, states: {} }], 'nobody', 'annual')).toBe(0)
  })

  it('sums a whole quarter of mixed cells', () => {
    const grid: Grid = {
      ramp: { '2026-01-05': 'LL', '2026-01-06': 'OL', '2026-01-07': '*LL', '2026-01-09': 'CSE' },
    }
    const states: States = {
      ramp: { '2026-01-05': approved(), '2026-01-06': refused, '2026-01-07': pending },
    }
    // LL approved (1) + OL refused (0) + *LL pending (0.5), course ignored.
    expect(drawnFrom([{ grid: grid, states: states }], 'ramp', 'annual')).toBe(1.5)
  })
})

describe('grantedTo', () => {
  const ledger: Ledger = [
    { id: 'g1', personId: 'ramp', counter: 'annual', amount: 14, date: '2026-01-01', reason: 'Annual top-up', approvedBy: 'SQNCDR' },
    { id: 'g2', personId: 'ramp', counter: 'oil', amount: 2, date: '2026-01-15', reason: 'CNY workplan', approvedBy: 'SQNCDR' },
    { id: 'g3', personId: 'ramp', counter: 'annual', amount: -1, date: '2026-02-01', reason: 'Correction', approvedBy: 'SQNCDR' },
    { id: 'g4', personId: 'tata', counter: 'annual', amount: 20, date: '2026-01-01', reason: 'Annual top-up', approvedBy: 'SQNCDR' },
  ]

  it('sums the grants for one person and one counter', () => {
    expect(grantedTo(ledger, 'ramp', 'annual')).toBe(13)
    expect(grantedTo(ledger, 'ramp', 'oil')).toBe(2)
  })

  // Corrections are negative grants, not a second mechanism — §Counters says
  // one ledger covers top-ups, awards and corrections alike.
  it('lets a correction be a negative amount rather than its own kind', () => {
    expect(grantedTo([ledger[2]], 'ramp', 'annual')).toBe(-1)
  })

  it('is zero for a person or counter with no entries', () => {
    expect(grantedTo(ledger, 'ramp', 'ccl')).toBe(0)
    expect(grantedTo(ledger, 'nobody', 'annual')).toBe(0)
    expect(grantedTo([], 'ramp', 'annual')).toBe(0)
  })
})

describe('balanceOf', () => {
  const openings: Openings = { ramp: { annual: 10, oil: 1 } }
  const ledger: Ledger = [
    { id: 'g1', personId: 'ramp', counter: 'annual', amount: 14, date: '2026-01-01', reason: 'top-up', approvedBy: 'SQNCDR' },
  ]
  const grid: Grid = { ramp: { '2026-01-05': 'LL', '2026-01-06': 'OL', '2026-01-07': 'OIL' } }
  const states: States = {
    ramp: { '2026-01-05': approved(), '2026-01-06': pending, '2026-01-07': approved() },
  }

  it('is the opening figure plus grants less what the grid has drawn', () => {
    // 10 opening + 14 granted - 2 taken (LL approved, OL pending) = 22
    expect(balanceOf(openings, ledger, [{ grid, states }], 'ramp', 'annual')).toBe(22)
    expect(balanceOf(openings, ledger, [{ grid, states }], 'ramp', 'oil')).toBe(0)
  })

  it('treats a missing opening figure as nothing rather than throwing', () => {
    expect(balanceOf({}, [], [{ grid: {}, states: {} }], 'nobody', 'annual')).toBe(0)
    expect(balanceOf(openings, ledger, [{ grid, states }], 'ramp', 'ccl')).toBe(0)
  })

  // §Counters: balances already go negative in the real sheet — annual at
  // −14, OIL at −5.5. Negative shows red and is never refused, so the sum
  // must not clamp.
  it('goes negative rather than clamping at zero', () => {
    const thin: Openings = { ramp: { annual: 1 } }
    expect(balanceOf(thin, [], [{ grid, states }], 'ramp', 'annual')).toBe(-1)
  })

  it('gives a refusal back to the balance', () => {
    const allRefused: States = { ramp: { '2026-01-05': refused, '2026-01-06': refused } }
    expect(balanceOf(openings, ledger, [{ grid, states: allRefused }], 'ramp', 'annual')).toBe(24)
  })

  // Nothing rounds anywhere else in this engine and nothing rounds here.
  it('stays fractional', () => {
    const half: Grid = { ramp: { '2026-01-05': '*LL' } }
    expect(balanceOf({ ramp: { annual: 1 } }, [], [{ grid: half, states: {} }], 'ramp', 'annual')).toBe(0.5)
  })
})

describe('earnedOil — duty stood on a non-working day (wire 4)', () => {
  it('sums FO as a full day and HO as a half into the OIL balance', () => {
    const grid: Grid = { ramp: { '2026-01-10': 'FO', '2026-01-11': 'HO' } }
    expect(earnedOil([{ grid, states: {} }], 'ramp')).toBe(1.5)
    // opening 1 + earned 1.5 − nothing taken = 2.5
    expect(balanceOf({ ramp: { oil: 1 } }, [], [{ grid, states: {} }], 'ramp', 'oil')).toBe(2.5)
  })

  it('earns across every war, like drawnFrom — December duty is January\'s balance', () => {
    const a: Grid = { ramp: { '2025-12-27': 'FO' } }
    const b: Grid = { ramp: { '2026-01-10': 'HO' } }
    expect(earnedOil([{ grid: a, states: {} }, { grid: b, states: {} }], 'ramp')).toBe(1.5)
  })

  it('feeds ONLY the OIL balance — leave codes earn nothing, other counters see no earned term', () => {
    // The LL is on the Monday: a Sunday of leave would charge nothing since
    // 3 Sep 26 (charge.ts), and this case is about the earned term.
    const grid: Grid = { ramp: { '2026-01-10': 'FO', '2026-01-12': 'LL' } }
    expect(earnedOil([{ grid, states: {} }], 'ramp')).toBe(1)
    expect(balanceOf({ ramp: { annual: 5 } }, [], [{ grid, states: {} }], 'ramp', 'annual')).toBe(4)
  })

  it('the OIL BAL figure reads it: earned + granted − taken', () => {
    const ctx = {
      openings: {},
      ledger: [{ id: 'g1', personId: 'ramp', counter: 'oil' as const, amount: 0.5, date: '2026-01-01', reason: 'award', approvedBy: 'SQNCDR' }],
      sources: [{ grid: { ramp: { '2026-01-10': 'FO', '2026-01-20': 'OIL' } }, states: {} }],
    }
    // earned 1 (FO) + granted 0.5 − taken 1 (OIL) = 0.5
    expect(FIGURES.find(f => f.id === 'oilbal')!.value(ctx, 'ramp')).toBe(0.5)
  })
})

describe('balances across more than one leave war', () => {
  // THE point of the multi-war change, and the thing most easily got wrong.
  // Leave bid in the Jan–Mar war still spends annual leave while you are
  // looking at Apr–Jun. A balance that only counted the war on screen would
  // let the same twenty days be bid twice over.
  const openings: Openings = { ramp: { annual: 20 } }
  const q1 = {
    grid: { ramp: { '2026-02-10': 'LL', '2026-02-11': 'LL' } },
    states: { ramp: { '2026-02-10': approved(), '2026-02-11': approved() } },
  }
  // Mon 11 / Tue 12 May — 10 May is a Sunday, which charges nothing since
  // 3 Sep 26 (charge.ts); this case is about the wars, not the calendar.
  const q2 = {
    grid: { ramp: { '2026-05-11': 'LL', '2026-05-12': '*LL' } },
    states: { ramp: { '2026-05-11': approved(), '2026-05-12': pending } },
  }

  it('draws from every war, not just the one being looked at', () => {
    expect(drawnFrom([q1], 'ramp', 'annual')).toBe(2)
    expect(drawnFrom([q2], 'ramp', 'annual')).toBe(1.5)
    expect(drawnFrom([q1, q2], 'ramp', 'annual')).toBe(3.5)
  })

  it('leaves the balance the same whichever war is open', () => {
    // 20 opening − 3.5 taken across both = 16.5, and the order of the wars
    // must not change it.
    expect(balanceOf(openings, [], [q1, q2], 'ramp', 'annual')).toBe(16.5)
    expect(balanceOf(openings, [], [q2, q1], 'ramp', 'annual')).toBe(16.5)
  })

  it('still honours a refusal in a war that is not on screen', () => {
    const refusedQ2 = {
      grid: q2.grid,
      states: { ramp: { '2026-05-11': refused, '2026-05-12': refused } },
    }
    expect(drawnFrom([q1, refusedQ2], 'ramp', 'annual')).toBe(2)
  })

  it('counts nothing from a war the person has no leave in', () => {
    const empty = { grid: {}, states: {} }
    expect(drawnFrom([q1, empty], 'ramp', 'annual')).toBe(2)
    expect(drawnFrom([], 'ramp', 'annual')).toBe(0)
  })
})

// `OFF` was leave that cost nothing until 2 Sep 26; now it is not a code at
// all (an Off day is a management EVENT). A stray `OFF` in a grid — legacy
// data — must draw from nothing and count as nothing, exactly as any unknown
// code does, rather than being guessed into some counter.
describe('a legacy OFF cell draws nothing', () => {
  it('leaves every counter untouched however much OFF is in the grid', () => {
    const sources = [{
      grid: { ramp: { '2026-01-05': 'OFF', '2026-01-06': 'OFF', '2026-01-07': '*OFF' } },
      states: {},
    }]
    for (const counter of COUNTERS) {
      expect(drawnFrom(sources, 'ramp', counter)).toBe(0)
    }
    expect(takenOf(sources, 'ramp', 'OFF')).toBe(0)
  })

  it('keeps a balance exactly where it was', () => {
    const openings = { ramp: { annual: 10 } }
    const sources = [{ grid: { ramp: { '2026-01-05': 'OFF' } }, states: {} }]
    expect(balanceOf(openings, [], sources, 'ramp', 'annual')).toBe(10)
  })

  // The contrast that gives the two above their teeth: an ordinary leave type
  // over the same day DOES draw, so a `drawnFrom` that had simply stopped
  // counting would fail here rather than passing all three.
  it('unlike ordinary leave over the same day', () => {
    const sources = [{ grid: { ramp: { '2026-01-05': 'LL' } }, states: {} }]
    expect(drawnFrom(sources, 'ramp', 'annual')).toBe(1)
  })

  // OFF has no counter, so it must not put a column in the panel — a counter
  // nobody can ever have a balance of would be a column of blanks.
  it('adds no counter to the panel', () => {
    expect(COUNTERS).not.toContain(undefined)
    expect(COUNTERS).not.toContain(null)
    expect(COUNTERS).toEqual(['annual', 'oil', 'ccl', 'fcl', 'pl', 'el', 'cl'])
  })
})

describe('takenOf — days of ONE type taken', () => {
  it('counts by type, portion-aware', () => {
    const sources = [{ grid: { ramp: { '2026-01-05': 'LL', '2026-01-06': '*LL', '2026-01-07': 'OL' } }, states: {} }]
    expect(takenOf(sources, 'ramp', 'LL')).toBe(1.5)
    expect(takenOf(sources, 'ramp', 'OL')).toBe(1)
  })

  // The whole reason takenOf exists beside drawnFrom: LL and OL both spend the
  // annual pool, so the per-COUNTER figure cannot tell them apart. The
  // per-TYPE one can.
  it('separates LL from OL where drawnFrom cannot', () => {
    const sources = [{ grid: { ramp: { '2026-01-05': 'LL', '2026-01-06': 'OL' } }, states: {} }]
    expect(drawnFrom(sources, 'ramp', 'annual')).toBe(2)
    expect(takenOf(sources, 'ramp', 'LL')).toBe(1)
    expect(takenOf(sources, 'ramp', 'OL')).toBe(1)
  })

  it('counts the medical markers, which spend no counter at all', () => {
    const sources = [{ grid: { ramp: { '2026-01-06': 'ATTC', '2026-01-07': 'OML' } }, states: {} }]
    expect(takenOf(sources, 'ramp', 'ATTC')).toBe(1)
    expect(takenOf(sources, 'ramp', 'OML')).toBe(1)
  })

  it('does not count a refused bid, the same rule the balances use', () => {
    const sources = [{ grid: { ramp: { '2026-01-05': 'LL' } }, states: { ramp: { '2026-01-05': refused } } }]
    expect(takenOf(sources, 'ramp', 'LL')).toBe(0)
  })
})

describe('the two consumed aggregates', () => {
  it('MED CON sums ATT C, HL and OML', () => {
    const sources = [{ grid: { ramp: { '2026-01-05': 'ATTC', '2026-01-06': 'HL', '2026-01-07': 'OML', '2026-01-08': 'LL' } }, states: {} }]
    expect(medConOf(sources, 'ramp')).toBe(3)
  })

  it('counts a half-day medical as half — the owner\'s AM/PM medical inputs', () => {
    const sources = [{ grid: { ramp: { '2026-01-05': '*ATTC', '2026-01-06': 'HL*', '2026-01-07': 'OML' } }, states: {} }]
    expect(medConOf(sources, 'ramp')).toBe(2)
    expect(takenOf(sources, 'ramp', 'ATTC')).toBe(0.5)
  })

  it('deliberately leaves ATT B out of MED CON — the owner\'s sum names the other three', () => {
    const sources = [{ grid: { ramp: { '2026-01-05': 'ATTB', '2026-01-06': 'HL' } }, states: {} }]
    expect(medConOf(sources, 'ramp')).toBe(1)
    // ATT B days are still countable per type, they just feed no figure.
    expect(takenOf(sources, 'ramp', 'ATTB')).toBe(1)
  })

  it('LVE CON sums the seven leave codes and deliberately excludes medical', () => {
    // Weekdays only (12–16 Jan and 19–20 Jan are Mon–Fri, Mon–Tue): a
    // weekend day of leave charges nothing since 3 Sep 26 (charge.ts), and
    // this case is about MEMBERSHIP, not the calendar.
    const sources = [{ grid: { ramp: {
      '2026-01-12': 'LL', '2026-01-13': 'OL', '2026-01-14': 'OIL',
      '2026-01-15': 'CCL', '2026-01-16': 'PL', '2026-01-19': 'FCL', '2026-01-20': 'CL', '2026-01-21': 'OML',
    } }, states: {} }]
    // Eight leave/medical days, but LVE CON counts only the seven — OML is
    // medical and lives in MED CON.
    expect(lveConOf(sources, 'ramp')).toBe(7)
  })
})

describe('FIGURES and orderedFigures', () => {
  // Eleven since 2 Sep 26: OFF USED went (owner — "remove the OFF used
  // counter"). Thirteen since 3 Sep 26: CL BAL and CL USED joined, after
  // FCL USED (owner — "2 counters to show the balance and used").
  it('is the thirteen figures in the owner\'s order — OIL BAL joined with wire 4, OFF USED removed, CL BAL/USED added', () => {
    expect(FIGURES.map(f => f.label)).toEqual([
      'LL USED', 'OL USED', 'OIL USED', 'OIL BAL', 'CCL USED', 'PL USED',
      'FCL USED', 'CL BAL', 'CL USED', 'MED USED', 'OML USED', 'LVE BAL', 'LVE USED',
    ])
    expect(FIGURES.find(f => f.label === 'OFF USED')).toBeUndefined()
  })

  it('has exactly three balance figures — OIL BAL, CL BAL and LVE BAL; every other is consumed', () => {
    expect(FIGURES.filter(f => f.kind === 'bal').map(f => f.label)).toEqual(['OIL BAL', 'CL BAL', 'LVE BAL'])
    expect(FIGURES.filter(f => f.kind === 'con')).toHaveLength(10)
    // Each balance names the counter it reads — what the Cinch sheet's Set
    // button keys on — and only OIL's goes to the tracker instead.
    expect(FIGURES.filter(f => f.kind === 'bal').map(f => f.counter)).toEqual(['oil', 'cl', 'annual'])
    expect(FIGURES.filter(f => f.kind === 'con').every(f => f.counter === undefined)).toBe(true)
  })

  it('carries each aggregate\'s composition as its legend', () => {
    expect(FIGURES.find(f => f.id === 'med')!.legend).toBe('ATT C + HL + OML')
    expect(FIGURES.find(f => f.id === 'lvecon')!.legend).toBe('LL + OL + OIL + CCL + PL + FCL + CL')
  })

  it('computes a figure through its ctx — CON via takenOf, BAL via balanceOf', () => {
    const ctx = { openings: { ramp: { annual: 10 } }, ledger: [], sources: [{ grid: { ramp: { '2026-01-05': 'LL' } }, states: {} }] }
    expect(FIGURES.find(f => f.id === 'll')!.value(ctx, 'ramp')).toBe(1)
    // LVE BAL = opening 10 − 1 drawn.
    expect(FIGURES.find(f => f.id === 'lvebal')!.value(ctx, 'ramp')).toBe(9)
  })

  it('opens on LVE BAL by default', () => {
    expect(FIGURES.find(f => f.id === DEFAULT_FIGURE_ID)!.label).toBe('LVE BAL')
    expect([...DEFAULT_FIGURE_ORDER]).toEqual(FIGURES.map(f => f.id))
  })

  it('orders by a saved id list', () => {
    expect(orderedFigures(['lvebal', 'll']).map(f => f.id).slice(0, 2)).toEqual(['lvebal', 'll'])
  })

  it('appends catalogue figures a stale saved order omits, and never duplicates', () => {
    const out = orderedFigures(['lvebal'])
    expect(out[0].id).toBe('lvebal')
    expect(out).toHaveLength(FIGURES.length)
  })

  it('drops an unknown id and dedups a repeated one', () => {
    const out = orderedFigures(['nope', 'll', 'll'])
    expect(out.filter(f => f.id === 'll')).toHaveLength(1)
    expect(out.some(f => f.id === 'nope')).toBe(false)
    expect(out).toHaveLength(FIGURES.length)
  })
})

describe('figureParts — the tap-a-counter breakdown (owner, 17 Aug 26)', () => {
  const f = (id: string) => FIGURES.find(x => x.id === id)!
  const ctx = {
    openings: { ramp: { annual: 10, oil: 2 } },
    ledger: [{ id: 'g1', personId: 'ramp', counter: 'oil', amount: 1, date: '2026-01-01', reason: 'grant', approvedBy: 'boss' }] as Ledger,
    sources: [{ grid: { ramp: {
      '2026-01-05': 'ATTC', '2026-01-06': '*HL', '2026-01-07': 'OML', '2026-01-08': 'LL',
      '2026-01-09': 'OIL', '2026-01-10': 'FO',
    } }, states: {} }],
  }

  it('MED USED opens as its three markers, half days included, and the parts sum to the figure', () => {
    const parts = figureParts(f('med'), ctx, 'ramp')
    expect(parts).toEqual([
      { label: 'ATT C', value: 1 },
      { label: 'HL', value: 0.5 },
      { label: 'OML', value: 1 },
    ])
    expect(parts.reduce((s, p) => s + p.value, 0)).toBe(f('med').value(ctx, 'ramp'))
  })

  it('LVE USED opens as its seven codes and sums to the figure', () => {
    const parts = figureParts(f('lvecon'), ctx, 'ramp')
    expect(parts.map(p => p.label)).toEqual(['LL', 'OL', 'OIL', 'CCL', 'PL', 'FCL', 'CL'])
    expect(parts.reduce((s, p) => s + p.value, 0)).toBe(f('lvecon').value(ctx, 'ramp'))
  })

  it('a balance opens as opening + granted (+ earned for OIL) − taken, signed so it sums', () => {
    const oil = figureParts(f('oilbal'), ctx, 'ramp')
    expect(oil).toEqual([
      { label: 'opening figure', value: 2 },
      { label: 'granted', value: 1 },
      { label: 'earned by weekend/PH work', value: 1 },
      { label: 'taken', value: -1 },
    ])
    expect(oil.reduce((s, p) => s + p.value, 0)).toBe(f('oilbal').value(ctx, 'ramp'))
    // LVE BAL has no earned row — nothing but OIL is earned by working.
    expect(figureParts(f('lvebal'), ctx, 'ramp').map(p => p.label))
      .toEqual(['opening figure', 'granted', 'taken'])
  })

  it('a single-code figure restates itself as one line, so every figure answers', () => {
    expect(figureParts(f('ll'), ctx, 'ramp')).toEqual([{ label: 'days taken', value: 1 }])
  })
})
