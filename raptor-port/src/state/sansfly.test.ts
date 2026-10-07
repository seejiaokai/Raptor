/* THE SANS COMMITTED TO FLY, PER SEAT — the third figure of "still needed" (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.2; owner D617, D572, D581, D626).

   still needed = required − those the Leave War shows available − the SANS committed to fly.

   The Leave War's Available rows never count a SANS man (leavewar/engine/availrows.ts); this count takes ONLY a SANS
   man. The two are the two halves of one roster, so nobody is counted twice and nobody is missed. What these pin:
   pilots and WSOs apart, by the man's own seat; each man once a day however short his commitment (D572); a man since
   archived or deleted is not counted (the earlier build's count still counted him); only a commitment to FLY reduces
   the need — OFT and AMT are shown, never subtracted. */
import { describe, expect, it } from 'vitest'
import { sansCommittedOn, sansFly } from './flyplan'

const row = (person: string, extra: Record<string, unknown> = {}) =>
  ({ person, type: 'SANS Availability', date: 'Oct 9', yr: 2026, sans: { f: true }, allday: true, ...extra })
const PEOPLE: Record<string, any> = {
  p1: { cs: 'Alpha', seat: 'FCP', q: 'B', san: true },
  p2: { cs: 'Bravo', seat: 'FCP', q: 'IP', san: true },
  w1: { cs: 'Whisky', seat: 'RCP', q: 'A', san: true },
  w2: { cs: 'Xray', seat: 'RCP', q: 'IW', san: true },
  gone: { cs: 'Left', seat: 'FCP', q: 'B', san: true, archived: true },
  del: { cs: 'Deleted', seat: 'RCP', q: 'B', san: true, archived: true, deleted: true },
  reg: { cs: 'Regular', seat: 'FCP', q: 'B' },
  gnd: { cs: 'Ground', seat: 'GND', pers: true, san: true },
  all: { cs: 'ALL', seat: 'FCP', q: 'A', special: true, archived: true },
}
const D = '2026-10-09'

describe('the SANS committed to fly on a date', () => {
  it('counts pilots and WSOs apart, by the man’s own seat', () => {
    const rows = [row('p1'), row('p2'), row('w1')]
    expect(sansFly(D, rows, PEOPLE)).toEqual({ p: 2, w: 1 })
  })

  it('counts a man once a day — two filings, or a short commitment, are still one man (D572)', () => {
    const rows = [row('p1'), row('p1', { sans: { f: true, o: true } }), row('w1', { allday: false, s: 480, e: 540 })]
    expect(sansFly(D, rows, PEOPLE)).toEqual({ p: 1, w: 1 })
  })

  it('only a commitment to FLY counts; OFT and AMT are listed, never subtracted', () => {
    const rows = [row('p1', { sans: { o: true, a: true } }), row('w1', { sans: { a: true } }), row('w2', { sans: { f: true, o: true, a: true } })]
    expect(sansFly(D, rows, PEOPLE)).toEqual({ p: 0, w: 1 })
    expect(sansCommittedOn(D, rows, PEOPLE)).toEqual({
      f: { p: [], w: ['w2'] },
      o: { p: ['p1'], w: ['w2'] },
      a: { p: ['p1'], w: ['w1', 'w2'] },
    })
  })

  it('a man since archived, or deleted, is not counted', () => {
    const rows = [row('gone'), row('del'), row('p1')]
    expect(sansFly(D, rows, PEOPLE)).toEqual({ p: 1, w: 0 })
    expect(sansCommittedOn(D, rows, PEOPLE).f).toEqual({ p: ['p1'], w: [] })
  })

  it('a man who is not SANS is not counted here — the Leave War’s Available rows already count him', () => {
    expect(sansFly(D, [row('reg'), row('p1')], PEOPLE)).toEqual({ p: 1, w: 0 })
  })

  it('ground crew, a placeholder puck and a name nobody holds are not counted', () => {
    expect(sansFly(D, [row('gnd'), row('all'), row('nobody'), row('')], PEOPLE)).toEqual({ p: 0, w: 0 })
  })

  it('an input of another kind is not a commitment', () => {
    expect(sansFly(D, [row('p1', { type: 'Meeting' }), row('w1', { type: 'LL' })], PEOPLE)).toEqual({ p: 0, w: 0 })
  })

  it('reads the dates as filed: a run of days, its own year, and a run across the year’s end', () => {
    const rows = [
      row('p1', { date: 'Oct 8', endDate: 'Oct 10' }),
      row('p2', { yr: 2027 }),
      row('w1', { date: 'Dec 31', endDate: 'Jan 2 2027' }),
      row('w2', { date: 'Feb 29', yr: 2028 }),
    ]
    expect(sansFly('2026-10-08', rows, PEOPLE)).toEqual({ p: 1, w: 0 })
    expect(sansFly('2026-10-10', rows, PEOPLE)).toEqual({ p: 1, w: 0 })
    expect(sansFly('2026-10-11', rows, PEOPLE)).toEqual({ p: 0, w: 0 })
    expect(sansFly('2027-10-09', rows, PEOPLE)).toEqual({ p: 1, w: 0 })
    expect(sansFly('2027-01-01', rows, PEOPLE)).toEqual({ p: 0, w: 1 })
    expect(sansFly('2028-02-29', rows, PEOPLE)).toEqual({ p: 0, w: 1 })
  })

  it('a day nobody committed to, and something that is not a date, count nobody', () => {
    expect(sansFly('2026-10-12', [row('p1')], PEOPLE)).toEqual({ p: 0, w: 0 })
    expect(sansFly('2026-02-30', [row('p1')], PEOPLE)).toEqual({ p: 0, w: 0 })
    expect(sansFly('', [row('p1')], PEOPLE)).toEqual({ p: 0, w: 0 })
  })

  it('a damaged row is passed over, never thrown on', () => {
    const rows: any[] = [null, {}, { person: 'p1' }, row('p1', { sans: null }), row('w1')]
    expect(sansFly(D, rows, PEOPLE)).toEqual({ p: 0, w: 1 })
  })

  it('reads the app’s own inputs and roster when given none', () => {
    expect(sansFly('2031-01-01')).toEqual({ p: 0, w: 0 })
  })
})
