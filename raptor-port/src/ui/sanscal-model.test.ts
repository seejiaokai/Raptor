/* THE SANS CALENDAR — what a date shows and who a day lists (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.5; owner D617, D626, D627, D629, D642, D646, D648).

   The screen works nothing out: the day's class, its required figures and how many more are needed come from the ONE
   resolver (state/flyplan-model.ts planFor), and the SANS committed from state/flyplan.ts sansCommittedOn. These pin
   only how that answer is READ onto a date and into an opened day's list — the tag or the sun, the pair or the dash,
   which group a man's commitment stands in, his hours, the cut-off a late one missed, and who placed it. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { VCONF } from '../engine/rules'
import { planFor, EMPTY_PLAN, type DayFacts, type FlyPlan } from '../state/flyplan-model'
import { sansCell, sansDayGroups, hoursOf } from './sanscal-model'
import { placedLine } from './placedline'

const facts = (over: Partial<DayFacts> = {}): DayFacts => ({ covered: true, kind: null, availP: 10, availW: 10, ...over })
const none = { f: { p: [], w: [] }, o: { p: [], w: [] }, a: { p: [], w: [] } }
const plan = (over: Partial<FlyPlan>): FlyPlan => ({ ...EMPTY_PLAN, ...over })
const WED = '2026-10-07', SAT = '2026-10-10'

describe('a date on the SANS month', () => {
  it('a day-flying day wears the sun, a night-flying day the moon, and neither wears a tag', () => {
    const day = sansCell(planFor(WED, EMPTY_PLAN, facts(), { p: 0, w: 0 }), '', none)
    expect(day.icon).toBe('day'); expect(day.tag).toBeNull()
    const night = sansCell(planFor(WED, plan({ days: { [WED]: { cls: 'night' } } }), facts(), { p: 0, w: 0 }), '', none)
    expect(night.icon).toBe('night'); expect(night.tag).toBeNull()
  })
  it('a no-fly day says NF in place of the sun, and its pair reads 0 and 0 with no colour', () => {
    const c = sansCell(planFor(WED, plan({ days: { [WED]: { cls: 'nf', p: 16, w: 16 } } }), facts({ availP: 2, availW: 2 }), { p: 0, w: 0 }), '', none)
    expect(c.tag).toEqual({ text: 'NF', kind: 'nf' }); expect(c.icon).toBeNull()
    expect(c.need).toEqual({ p: 0, w: 0 }); expect(c.tone).toBe('none')
  })
  it('a public holiday and an Off day wear the Leave War’s own short form, in their kind — never a sun', () => {
    const ph = sansCell(planFor(WED, EMPTY_PLAN, facts({ kind: 'ph' }), { p: 0, w: 0 }), 'ND', none)
    expect(ph.tag).toEqual({ text: 'ND', kind: 'ph' }); expect(ph.icon).toBeNull()
    const off = sansCell(planFor(WED, EMPTY_PLAN, facts({ kind: 'off' }), { p: 0, w: 0 }), 'OFF', none)
    expect(off.tag).toEqual({ text: 'OFF', kind: 'off' })
    /* a holiday whose short form did not arrive still says what it is */
    expect(sansCell(planFor(WED, EMPTY_PLAN, facts({ kind: 'ph' }), { p: 0, w: 0 }), '', none).tag).toEqual({ text: 'PH', kind: 'ph' })
    expect(sansCell(planFor(WED, EMPTY_PLAN, facts({ kind: 'off' }), { p: 0, w: 0 }), '', none).tag).toEqual({ text: 'OFF', kind: 'off' })
  })
  it('a Saturday with nothing set is blank: no sun, no moon, no NF, and a dash for the pair', () => {
    const c = sansCell(planFor(SAT, EMPTY_PLAN, facts(), { p: 0, w: 0 }), '', none)
    expect(c.icon).toBeNull(); expect(c.tag).toBeNull(); expect(c.need).toBeNull(); expect(c.tone).toBe('none')
  })
  it('the pair is the resolver’s own: pilots, then WSOs, in the day’s colour', () => {
    const p = plan({ days: { [WED]: { p: 12, w: 12 } } })
    const c = sansCell(planFor(WED, p, facts({ availP: 11, availW: 7 }), { p: 2, w: 2 }), '', none)
    expect(c.need).toEqual({ p: 0, w: 3 }); expect(c.tone).toBe('amber')
  })
  it('a day with no required figure, or one no leave period covers, shows a dash and no colour', () => {
    expect(sansCell(planFor(WED, EMPTY_PLAN, facts(), { p: 0, w: 0 }), '', none).need).toBeNull()
    const uncovered = sansCell(planFor(WED, plan({ days: { [WED]: { p: 12, w: 12 } } }), facts({ covered: false, availP: null, availW: null }), { p: 0, w: 0 }), '', none)
    expect(uncovered.need).toBeNull(); expect(uncovered.tone).toBe('none')
  })
  it('one seat with a figure and the other without: the number, and a dash beside it', () => {
    const c = sansCell(planFor(WED, plan({ days: { [WED]: { p: 12 } } }), facts({ availP: 10 }), { p: 0, w: 0 }), '', none)
    expect(c.need).toEqual({ p: 2, w: null })
  })
  it('F, O and A are the SANS committed, pilots then WSOs — whatever the day is', () => {
    const com = { f: { p: ['a', 'b'], w: ['c'] }, o: { p: [], w: ['c', 'd'] }, a: { p: ['a'], w: [] } }
    const c = sansCell(planFor(WED, plan({ days: { [WED]: { cls: 'nf' } } }), facts(), { p: 2, w: 1 }), '', com)
    expect(c.f).toEqual({ p: 2, w: 1 }); expect(c.o).toEqual({ p: 0, w: 2 }); expect(c.a).toEqual({ p: 1, w: 0 })
  })
})

/* ---- a day opened ------------------------------------------------------------------------------------------------ */
const PEOPLE: Record<string, any> = {
  p1: { cs: 'Bolt', seat: 'FCP', q: 'IP', san: true },
  p2: { cs: 'Vapor', seat: 'FCP', q: 'A', san: true },
  w1: { cs: 'Kraken', seat: 'RCP', q: 'IW', san: true },
  w2: { cs: 'Wren', seat: 'RCP', q: 'C', san: true },
  ad: { cs: 'Saber', seat: 'FCP', q: 'A' },
  was: { cs: 'Former', seat: 'FCP', q: 'B' },
  gone: { cs: 'Left', seat: 'RCP', q: 'B', san: true, archived: true },
}
let n = 0
const row = (person: string, extra: Record<string, unknown> = {}) =>
  ({ iid: 'i' + (++n), person, type: 'SANS Availability', date: 'Oct 7', yr: 2026, sans: { f: true }, allday: true, mod: '2026-09-01', ...extra })

describe('a day opened on the SANS calendar', () => {
  it('lists WSOs to fly, pilots to fly, and those who offered only OFT or AMT, each man with the group he stands in', () => {
    const rows = [row('p1'), row('w1'), row('p2', { sans: { o: true, a: true } }), row('w2', { sans: { a: true } })]
    const g = sansDayGroups(WED, rows, PEOPLE)
    expect(g.w.map(e => e.id)).toEqual(['w1'])
    expect(g.p.map(e => e.id)).toEqual(['p1'])
    expect(g.other.map(e => e.id)).toEqual(['p2', 'w2'])
    expect(g.out).toEqual([])
    expect(g.other.map(e => e.letters)).toEqual(['O · A', 'A'])
  })
  it('lists everyone — forty commitments are forty lines, never a count of the rest (D648)', () => {
    const people: Record<string, any> = {}
    const rows = Array.from({ length: 40 }, (_, i) => { people['s' + i] = { cs: 'S' + i, seat: i % 2 ? 'FCP' : 'RCP', q: 'B', san: true }; return row('s' + i) })
    const g = sansDayGroups(WED, rows, people)
    expect(g.w.length + g.p.length + g.other.length).toBe(40)
  })
  it('a man who filed twice for the day is one man in one group, both filings listed with him', () => {
    const rows = [row('w1', { sans: { o: true }, allday: false, s: 480, e: 600 }), row('w1', { allday: false, s: 780, e: 900 })]
    const g = sansDayGroups(WED, rows, PEOPLE)
    expect(g.w.map(e => e.id)).toEqual(['w1', 'w1'])       // he flies, so both his lines stand under WSOs to fly
    expect(g.other).toEqual([]); expect(g.flyW).toBe(1); expect(g.flyP).toBe(0)
  })
  it('an input that is not for the day is not listed, and a range covers every day inside it', () => {
    const rows = [row('p1', { date: 'Oct 6', endDate: 'Oct 8' }), row('w1', { date: 'Oct 8' })]
    expect(sansDayGroups(WED, rows, PEOPLE).p.map(e => e.id)).toEqual(['p1'])
    expect(sansDayGroups(WED, rows, PEOPLE).w).toEqual([])
  })
  it('a commitment of a man the count leaves out is still listed — apart, saying why — so it can be reached and removed', () => {
    const rows = [row('was'), row('gone')]
    const g = sansDayGroups(WED, rows, PEOPLE)
    expect(g.p).toEqual([]); expect(g.w).toEqual([])
    expect(g.out.map(e => [e.id, e.why])).toEqual([['was', 'no longer SANS'], ['gone', 'archived']])
  })
  it('says a man’s hours: all day, the morning, the afternoon, or his own times (D572)', () => {
    expect(hoursOf({ allday: true })).toBe('All day')
    expect(hoursOf({ allday: false, half: 'am' })).toBe('AM')
    expect(hoursOf({ allday: false, half: 'pm' })).toBe('PM')
    expect(hoursOf({ allday: false, s: 600, e: 900 })).toBe('10:00–15:00')
  })
})

describe('a late commitment says the cut-off it missed (D646)', () => {
  const keep: Record<string, unknown> = {}
  beforeEach(() => { for (const k of ['sansLead', 'sansCutMode', 'sansCutWd', 'sansCutWeeks']) keep[k] = (VCONF as any)[k]; Object.assign(VCONF, { sansCutMode: 1, sansCutWd: 2, sansCutWeeks: 2 }) })
  afterEach(() => { Object.assign(VCONF, keep) })
  it('for the week of Mon 19 Oct the cut-off is Wed 7 Oct: changed on the 8th it is late, on the 7th it is not', () => {
    const late = sansDayGroups('2026-10-21', [row('w1', { date: 'Oct 21', mod: '2026-10-08' })], PEOPLE).w[0]
    expect(late.late).toBe('after the cut-off, Wed 7 Oct')
    const onTime = sansDayGroups('2026-10-21', [row('w1', { date: 'Oct 21', mod: '2026-10-07' })], PEOPLE).w[0]
    expect(onTime.late).toBe('')
  })
})

describe('who placed it, and when (D629)', () => {
  const at = new Date(2026, 9, 7, 14, 32).getTime(), later = new Date(2026, 9, 8, 9, 10).getTime()
  it('names who placed it, the day and the time', () => {
    expect(placedLine({ person: 'w1', by: 'w1', at, modBy: 'w1', modAt: at }, PEOPLE)).toBe('Placed by Kraken · 7 Oct 26, 14:32')
  })
  it('says who it was placed FOR when that is another person', () => {
    expect(placedLine({ person: 'w1', by: 'ad', at, modBy: 'ad', modAt: at }, PEOPLE)).toBe('Placed by Saber for Kraken · 7 Oct 26, 14:32')
  })
  it('a later change is said the same way — by whom and when', () => {
    expect(placedLine({ person: 'w1', by: 'w1', at, modBy: 'ad', modAt: later }, PEOPLE))
      .toBe('Placed by Kraken · 7 Oct 26, 14:32 · changed by Saber · 8 Oct 26, 09:10')
    /* a change made by the app itself (a posting that ran on its date) has a time and no name */
    expect(placedLine({ person: 'w1', by: 'w1', at, modAt: later }, PEOPLE)).toBe('Placed by Kraken · 7 Oct 26, 14:32 · changed 8 Oct 26, 09:10')
  })
  it('a record that never recorded who placed it shows no line at all', () => {
    expect(placedLine({ person: 'w1', mod: '2026-10-07' }, PEOPLE)).toBe('')
    expect(placedLine({ person: 'w1', at }, PEOPLE)).toBe('')
  })
  it('a filer who is no longer on the roster is not printed as a code', () => {
    expect(placedLine({ person: 'w1', by: 'zz9', at, modBy: 'zz9', modAt: at }, PEOPLE)).toBe('Placed by someone no longer listed for Kraken · 7 Oct 26, 14:32')
  })
  it('the opened day carries the line with each commitment', () => {
    const g = sansDayGroups(WED, [row('w1', { by: 'ad', at, modBy: 'ad', modAt: at })], PEOPLE)
    expect(g.w[0].placed).toBe('Placed by Saber for Kraken · 7 Oct 26, 14:32')
  })
})
