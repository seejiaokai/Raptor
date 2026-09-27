import { describe, expect, it } from 'vitest'
import { beforeFirstStint, categoryLabel, categoryOf, gapBeforeCurrent, inSquadron, lastDayIn, postingSheetFor, stintAt, type Person } from './people'

const person = (over: Partial<Person> = {}): Person => ({
  id: 'p1',
  callsign: 'RAMP',
  seat: 'pilot',
  band: 'ops',
  sxo: false,
  from: null,
  to: null,
  ...over,
})

describe('categoryOf', () => {
  it('derives all four categories from seat and band', () => {
    expect(categoryOf(person({ seat: 'pilot', band: 'instructor' }))).toBe('IP')
    expect(categoryOf(person({ seat: 'pilot', band: 'ops' }))).toBe('OPSP')
    expect(categoryOf(person({ seat: 'wso', band: 'instructor' }))).toBe('IWSO')
    expect(categoryOf(person({ seat: 'wso', band: 'ops' }))).toBe('OPSW')
  })

  it('does not let the SXO flag change the category', () => {
    expect(categoryOf(person({ seat: 'wso', band: 'ops', sxo: true }))).toBe('OPSW')
  })
})

describe('inSquadron', () => {
  it('counts someone with no dates on any day', () => {
    expect(inSquadron(person(), '2026-01-01')).toBe(true)
  })

  it('stops counting a posted-out member from the day after their last day', () => {
    const p = person({ to: '2026-01-12' })
    expect(inSquadron(p, '2026-01-12')).toBe(true)
    expect(inSquadron(p, '2026-01-13')).toBe(false)
  })

  it('does not count an arrival before their first day', () => {
    const p = person({ from: '2026-02-01' })
    expect(inSquadron(p, '2026-01-31')).toBe(false)
    expect(inSquadron(p, '2026-02-01')).toBe(true)
  })

  it('handles someone who both arrives and leaves inside the period', () => {
    const p = person({ from: '2026-01-10', to: '2026-01-20' })
    expect(inSquadron(p, '2026-01-09')).toBe(false)
    expect(inSquadron(p, '2026-01-15')).toBe(true)
    expect(inSquadron(p, '2026-01-21')).toBe(false)
  })
})

describe('categoryLabel', () => {
  const someone = (seat: Person['seat'], band: Person['band'], sxo: boolean): Person =>
    ({ id: 'x', callsign: 'X', seat, band, sxo, from: null, to: null })

  // The owner's ask: "if they are SXO qualified they will have a (S) tagged
  // to it. Like IW(S)."
  it('tags an SXO with (S) and leaves everyone else alone', () => {
    expect(categoryLabel(someone('wso', 'instructor', true))).toBe('IWSO(S)')
    expect(categoryLabel(someone('wso', 'instructor', false))).toBe('IWSO')
    expect(categoryLabel(someone('pilot', 'ops', true))).toBe('OPSP(S)')
  })

  // SXO sits ON TOP of a category, never instead of one — a requirement of
  // "2 pilots, 2 WSOs, 1 SXO" needs the same person counted twice. So the
  // label decorates what `categoryOf` returns and never replaces it, and
  // everything that counts or requires a category is untouched.
  it('decorates the category rather than replacing it', () => {
    for (const [seat, band] of [['pilot', 'ops'], ['pilot', 'instructor'], ['wso', 'ops'], ['wso', 'instructor']] as const) {
      const p = someone(seat, band, true)
      expect(categoryLabel(p).startsWith(categoryOf(p))).toBe(true)
      expect(categoryOf(p)).toBe(categoryOf({ ...p, sxo: false }))
    }
  })
})

/* D320 (27 Sep 26, "A"): the Leave War keeps EVERY stint a man has in the squadron — `from`/`to` stay the CURRENT
   stint, `past` holds the closed earlier ones. [ONE-DOOR] plan §C. */
describe('D320 — every stint (past stints beside the current one)', () => {
  /* Hex: here until 14 Jun (posted out 15 Jun), back from 1 Sep */
  const back = () => person({ from: '2026-09-01', to: null, past: [{ from: null, to: '2026-06-14' }] })

  it('D320: counts him in an earlier stint, not in the gap, and again from his post-in', () => {
    const p = back()
    expect(inSquadron(p, '2026-04-06')).toBe(true)
    expect(inSquadron(p, '2026-06-14')).toBe(true)
    expect(inSquadron(p, '2026-06-15')).toBe(false)
    expect(inSquadron(p, '2026-08-31')).toBe(false)
    expect(inSquadron(p, '2026-09-01')).toBe(true)
  })

  it('D320: a day in the gap is away, never "not yet arrived"; only a day before the FIRST stint is', () => {
    const p = back()
    expect(beforeFirstStint(p, '2026-07-01')).toBe(false)
    const q = person({ from: '2026-09-01', to: null, past: [{ from: '2026-03-01', to: '2026-06-14' }] })
    expect(beforeFirstStint(q, '2026-02-28')).toBe(true)
    expect(beforeFirstStint(q, '2026-07-01')).toBe(false)
    /* one stint, as today: before `from` is not yet arrived */
    expect(beforeFirstStint(person({ from: '2026-02-01' }), '2026-01-31')).toBe(true)
    expect(beforeFirstStint(person(), '2026-01-31')).toBe(false)
  })

  it('D320: every stint\'s last day is a last day in (the PO corner), the current one\'s too', () => {
    const p = person({ from: '2026-09-01', to: '2026-11-30', past: [{ from: null, to: '2026-06-14' }] })
    expect(lastDayIn(p, '2026-06-14')).toBe(true)
    expect(lastDayIn(p, '2026-11-30')).toBe(true)
    expect(lastDayIn(p, '2026-06-13')).toBe(false)
  })

  it('D320: stintAt names the stint a day falls in — a past one by its index, the current one, or none', () => {
    const p = back()
    expect(stintAt(p, '2026-04-06')).toBe(0)
    expect(stintAt(p, '2026-10-01')).toBe('current')
    expect(stintAt(p, '2026-07-01')).toBe(null)
  })

  it('D320: a gap day right before the current stint is its gap; a gap between two past stints is not', () => {
    const p = person({ from: '2026-09-01', to: null, past: [{ from: null, to: '2026-03-31' }, { from: '2026-05-01', to: '2026-06-14' }] })
    expect(gapBeforeCurrent(p, '2026-07-01')).toBe(true)
    expect(gapBeforeCurrent(p, '2026-04-15')).toBe(false)
    expect(gapBeforeCurrent(p, '2026-10-01')).toBe(false)
  })

  it('D320, pinned unchanged: a man with ONE stint reads exactly as before (no `past`, an empty `past`)', () => {
    for (const p of [person({ from: '2026-02-01', to: '2026-10-31' }), person({ from: '2026-02-01', to: '2026-10-31', past: [] })]) {
      expect(inSquadron(p, '2026-01-31')).toBe(false)
      expect(inSquadron(p, '2026-02-01')).toBe(true)
      expect(inSquadron(p, '2026-10-31')).toBe(true)
      expect(inSquadron(p, '2026-11-01')).toBe(false)
      expect(beforeFirstStint(p, '2026-01-31')).toBe(true)
      expect(lastDayIn(p, '2026-10-31')).toBe(true)
    }
  })
})

/* round 1 (Fable F2 / Astra 1): which posting sheet a tap on a day outside his stints opens — by stint, not by
   "before the current post-in" */
describe('D320 — postingSheetFor (the tap routing)', () => {
  it('one stint, as today: before the post-in → Post in; after the post-out → Post out; inside → none', () => {
    const p = person({ from: '2026-02-01', to: '2026-10-31' })
    expect(postingSheetFor(p, '2026-01-15')).toBe('pi')
    expect(postingSheetFor(p, '2026-11-01')).toBe('po')
    expect(postingSheetFor(p, '2026-05-01')).toBeUndefined()
  })
  it('D320: a day in an earlier stint is an ordinary day; the gap before the current stint → its Post in', () => {
    const p = person({ from: '2026-09-01', to: null, past: [{ from: '2026-01-05', to: '2026-06-14' }] })
    expect(postingSheetFor(p, '2026-04-06')).toBeUndefined()
    expect(postingSheetFor(p, '2026-07-01')).toBe('pi')
  })
  it('D320: before the FIRST stint, and a gap between two earlier stints, open no posting sheet (read-only)', () => {
    const p = person({ from: '2026-09-01', to: '2026-11-30', past: [{ from: '2026-01-05', to: '2026-03-31' }, { from: '2026-05-01', to: '2026-06-14' }] })
    expect(postingSheetFor(p, '2026-01-02')).toBeUndefined()
    expect(postingSheetFor(p, '2026-04-15')).toBeUndefined()
    expect(postingSheetFor(p, '2026-12-01')).toBe('po')
  })
})
