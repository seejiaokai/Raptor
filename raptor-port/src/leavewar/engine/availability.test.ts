import { describe, expect, it } from 'vitest'
import { availabilityOf, countsFor, type Grid } from './availability'
import type { States } from './bids'
import type { Person } from './people'

const p = (id: string, seat: 'pilot' | 'wso', band: 'instructor' | 'ops', over: Partial<Person> = {}): Person => ({
  id, callsign: id.toUpperCase(), seat, band, sxo: false, from: null, to: null, ...over,
})

describe('availabilityOf', () => {
  const someone = p('a', 'pilot', 'ops')

  it('counts a free person as a whole person', () => {
    expect(availabilityOf(someone, '2026-01-05', undefined)).toBe(1)
  })

  it('counts a half day as half a person, which the spreadsheet could not', () => {
    expect(availabilityOf(someone, '2026-01-05', '*LL')).toBe(0.5)
    expect(availabilityOf(someone, '2026-01-05', '*OIL')).toBe(0.5)
  })

  it('counts a full day of leave as nobody', () => {
    expect(availabilityOf(someone, '2026-01-05', 'LL')).toBe(0)
    expect(availabilityOf(someone, '2026-01-05', 'OD')).toBe(0)
  })

  it('does not count someone on SC duty toward flying, though they are at work', () => {
    expect(availabilityOf(someone, '2026-01-05', 'FO')).toBe(0)
    expect(availabilityOf(someone, '2026-01-05', 'HO')).toBe(0)
  })

  it('does not count someone who has been posted out', () => {
    const gone = p('b', 'pilot', 'ops', { to: '2026-01-12' })
    expect(availabilityOf(gone, '2026-01-12', undefined)).toBe(1)
    expect(availabilityOf(gone, '2026-01-13', undefined)).toBe(0)
  })

  it('treats an unknown code as no effect rather than removing the person', () => {
    expect(availabilityOf(someone, '2026-01-05', 'ZZZ')).toBe(1)
  })
})

describe('countsFor', () => {
  const people: Person[] = [
    p('ip1', 'pilot', 'instructor'),
    p('ip2', 'pilot', 'instructor'),
    p('op1', 'pilot', 'ops'),
    p('iw1', 'wso', 'instructor'),
    p('ow1', 'wso', 'ops'),
    p('ow2', 'wso', 'ops', { sxo: true }),
  ]

  it('counts each category', () => {
    const c = countsFor(people, {}, {}, '2026-01-05')
    expect(c.byCategory).toEqual({ IP: 2, OPSP: 1, IWSO: 1, OPSW: 2 })
  })

  it('counts SXO separately without removing them from their own category', () => {
    const c = countsFor(people, {}, {}, '2026-01-05')
    expect(c.sxo).toBe(1)
    expect(c.byCategory.OPSW).toBe(2)
  })

  it('makes a set the lesser of available pilots and available WSOs', () => {
    // 3 pilots, 3 WSOs -> 3 sets
    expect(countsFor(people, {}, {}, '2026-01-05').sets).toBe(3)
  })

  it('produces a fractional set count from a half day', () => {
    const grid: Grid = { ow1: { '2026-01-05': '*LL' } }
    // pilots 3, wsos 2.5 -> 2.5 sets
    expect(countsFor(people, grid, {}, '2026-01-05').sets).toBe(2.5)
  })

  it('reports people on SC duty separately from people on leave', () => {
    const grid: Grid = { ip1: { '2026-01-05': 'FO' }, op1: { '2026-01-05': 'LL' } }
    const c = countsFor(people, grid, {}, '2026-01-05')
    expect(c.duty).toBe(1)
    expect(c.byCategory.IP).toBe(1)
    expect(c.byCategory.OPSP).toBe(0)
  })

  it('drops a posted-out member from every count', () => {
    const gone = [...people, p('old', 'pilot', 'instructor', { to: '2026-01-01' })]
    expect(countsFor(gone, {}, {}, '2026-01-05').byCategory.IP).toBe(2)
  })

  it('ensures pilots can be the constraining seat with fractional availability', () => {
    // Take the baseline people (3 pilots, 3 WSOs), remove half of one pilot
    // with a half-day code: 2.5 pilots, 3 WSOs -> 2.5 sets
    const grid: Grid = { ip1: { '2026-01-05': '*LL' } }
    expect(countsFor(people, grid, {}, '2026-01-05').sets).toBe(2.5)
  })

  it('does not count posted-out people in duty tally even if they carry an SC duty code', () => {
    const postedOut = p('gone', 'pilot', 'instructor', { to: '2026-01-04' })
    const withPostedOutDuty = [...people, postedOut]
    const grid: Grid = { gone: { '2026-01-05': 'FO' } }
    expect(countsFor(withPostedOutDuty, grid, {}, '2026-01-05').duty).toBe(0)
  })

  it('counts the HO credit code in the duty tally like FO', () => {
    const grid: Grid = { ip1: { '2026-01-05': 'HO' } }
    const c = countsFor(people, grid, {}, '2026-01-05')
    expect(c.duty).toBe(1)
  })

  it('handles a pm-portion cell (the trailing asterisk)', () => {
    expect(availabilityOf(p('a', 'pilot', 'ops'), '2026-01-05', 'LL*')).toBe(0.5)
  })

  // FL P / WM P split the pilots by CAT (owner, 18 Aug 26): flight leads are
  // CAT B and above with the instructor pilots, wingmen are CAT C and below;
  // WSOs are neither, and the two rows together are every pilot.
  it('splits pilots into FL P and WM P, WSOs into neither', () => {
    const crew = [
      p('fi', 'pilot', 'instructor', { q: 'FI' }),   // instructor pilot -> FL
      p('ip', 'pilot', 'instructor', { q: 'IP' }),   // instructor pilot -> FL
      p('a', 'pilot', 'ops', { q: 'A' }),            // ops A -> FL
      p('b', 'pilot', 'ops', { q: 'B' }),            // ops B -> FL
      p('c', 'pilot', 'ops', { q: 'C' }),            // ops C -> WM
      p('d', 'pilot', 'ops', { q: 'D' }),            // ops D -> WM
      p('ocu', 'pilot', 'ops', { q: 'OCU' }),        // OCU -> WM
      p('iw', 'wso', 'instructor', { q: 'IW' }),     // WSO -> neither
      p('ow', 'wso', 'ops', { q: 'C' }),             // WSO -> neither
    ]
    const c = countsFor(crew, {}, {}, '2026-01-05')
    expect(c.flp).toBe(4)
    expect(c.wmp).toBe(3)
    // a half day of leave costs half a lead, fractional like every count
    const half = countsFor(crew, { a: { '2026-01-05': '*LL' } }, {}, '2026-01-05')
    expect(half.flp).toBe(3.5)
  })

  it('an ops pilot with no CAT falls back to wingman, so the split stays total', () => {
    const crew = [p('x', 'pilot', 'ops')]   // no q
    const c = countsFor(crew, {}, {}, '2026-01-05')
    expect(c.flp).toBe(0)
    expect(c.wmp).toBe(1)
  })
})

describe('availability and the bid state', () => {
  const someone = p('a', 'pilot', 'ops')

  it('removes a person whose bid is pending — the worst case is what warns', () => {
    expect(availabilityOf(someone, '2026-01-05', 'LL', 'pending')).toBe(0)
  })

  it('removes a person whose bid was approved', () => {
    expect(availabilityOf(someone, '2026-01-05', 'LL', 'approved')).toBe(0)
  })

  it('does NOT remove a person whose bid was refused — he is at work', () => {
    expect(availabilityOf(someone, '2026-01-05', 'LL', 'refused')).toBe(1)
  })

  it('refuses a half day back to a whole person, not half of one', () => {
    expect(availabilityOf(someone, '2026-01-05', '*LL', 'refused')).toBe(1)
    expect(availabilityOf(someone, '2026-01-05', '*LL', 'pending')).toBe(0.5)
  })

  it('keeps a sick man away whatever state is attached', () => {
    expect(availabilityOf(someone, '2026-01-05', 'OML', 'refused')).toBe(0)
  })

  // A refused bid gives back the person, not the roster window. Someone
  // posted out on the 4th is not at work on the 5th however his last bid
  // was decided, and the duty short-circuit must still win too.
  it('does not resurrect a posted-out man, or put a duty man back on the programme', () => {
    const gone = p('b', 'pilot', 'ops', { to: '2026-01-04' })
    expect(availabilityOf(gone, '2026-01-05', 'LL', 'refused')).toBe(0)
    expect(availabilityOf(someone, '2026-01-05', 'FO', 'refused')).toBe(0)
  })

  it('puts a refused person back into the counts', () => {
    const people = [p('op1', 'pilot', 'ops'), p('ow1', 'wso', 'ops')]
    const grid: Grid = { op1: { '2026-01-05': 'LL' } }
    expect(countsFor(people, grid, {}, '2026-01-05').byCategory.OPSP).toBe(0)
    const states: States = { op1: { '2026-01-05': { state: 'refused', source: 'bid' } } }
    expect(countsFor(people, grid, states, '2026-01-05').byCategory.OPSP).toBe(1)
  })
})

// The SC D / SC N team counts (owner, 19 Aug 26): one team is 2 SC-qualified
// pilots + 2 SC-qualified WSOs + 1 SXO + 1 more crew — six DIFFERENT people,
// ground crew never counted. The count is how many complete teams the day can
// still man; someone standing SC duty counts as present, they are at work.
describe('the SC D / SC N team counts', () => {
  const D = '2026-01-05'
  // Exactly one team with nothing to spare: six people, each role covered once.
  const team: Person[] = [
    p('p1', 'pilot', 'ops', { scd: true }),
    p('p2', 'pilot', 'ops', { scd: true }),
    p('w1', 'wso', 'ops', { scd: true }),
    p('w2', 'wso', 'ops', { scd: true }),
    p('sx', 'pilot', 'ops', { sxo: true }),
    p('c1', 'wso', 'ops'),
  ]

  it('counts one complete team from six distinct people, and no night team without night quals', () => {
    const c = countsFor(team, {}, {}, D)
    expect(c.scd).toBe(1)
    expect(c.scn).toBe(0)
  })

  it('reads the night flags for SC N', () => {
    const night = team.map(x => ({ ...x, scn: x.scd, scd: undefined }))
    const c = countsFor(night, {}, {}, D)
    expect(c.scn).toBe(1)
    expect(c.scd).toBe(0)
  })

  it('a missing sixth body means no complete team — the any-crew seat is part of the combination', () => {
    expect(countsFor(team.slice(0, 5), {}, {}, D).scd).toBeLessThan(1)
  })

  it('ground crew never fill the any-crew seat', () => {
    const withGnd = [...team.slice(0, 5), p('g1', 'wso', 'ops', { pers: true, seat: 'gnd' })]
    expect(countsFor(withGnd, {}, {}, D).scd).toBeLessThan(1)
  })

  // The distinctness trap the four simple counts cannot see: the only SXO
  // doubling as one of the only two SC pilots can fill one role, not both.
  it('the only SXO doubling as an SC pilot cannot fill both roles', () => {
    const overlap: Person[] = [
      p('p1', 'pilot', 'ops', { scd: true, sxo: true }),
      p('p2', 'pilot', 'ops', { scd: true }),
      p('w1', 'wso', 'ops', { scd: true }),
      p('w2', 'wso', 'ops', { scd: true }),
      p('c1', 'wso', 'ops'),
      p('c2', 'wso', 'ops'),
    ]
    expect(countsFor(overlap, {}, {}, D).scd).toBeLessThan(1)
  })

  it('but a SPARE SXO or a spare SC pilot makes the overlap legal again', () => {
    const covered: Person[] = [
      p('p1', 'pilot', 'ops', { scd: true, sxo: true }),
      p('p2', 'pilot', 'ops', { scd: true }),
      p('p3', 'pilot', 'ops', { scd: true }),
      p('w1', 'wso', 'ops', { scd: true }),
      p('w2', 'wso', 'ops', { scd: true }),
      p('c1', 'wso', 'ops'),
    ]
    expect(countsFor(covered, {}, {}, D).scd).toBe(1)
  })

  it('leave costs a team fractionally, half days included', () => {
    const grid: Grid = { p1: { [D]: '*LL' } }
    // 1.5 SC-day pilots against a need of 2 per team.
    expect(countsFor(team, grid, {}, D).scd).toBe(0.75)
  })

  it('a full day of leave on the one SXO takes the team to zero', () => {
    const grid: Grid = { sx: { [D]: 'LL' } }
    expect(countsFor(team, grid, {}, D).scd).toBe(0)
  })

  // Presence, not flying availability: an SC duty stander reads 0 to every
  // other figure but they are AT WORK — a fully-manned duty day must not go
  // red for being manned.
  it('someone standing SC duty still counts toward the team', () => {
    const grid: Grid = { p1: { [D]: 'FO' }, sx: { [D]: 'HO' } }
    expect(countsFor(team, grid, {}, D).scd).toBe(1)
  })
})
