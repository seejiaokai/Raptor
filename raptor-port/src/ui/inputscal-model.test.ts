/* THE INPUTS MONTH — which bar sits on which line of which week (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.6, §3.13; owner D626, D632, D639, D653, D655, D664).

   The screen works nothing out: these pin how the list of inputs becomes the month's bars — one bar across the days an
   input covers, cut at a week's end and carried on; a line of its own in each week; "+N more" where a day holds more
   than its lines; a group filing as ONE bar; the phone's lines from whatever height the screen gives, never fewer than
   three; and the tag a date wears (a public holiday, an Off day, a no-fly day — never a sun or a moon here, D627). */
import { describe, expect, it } from 'vitest'
import { EMPTY_PLAN, planFor, type DayFacts, type FlyPlan } from '../state/flyplan-model'
import { barText, dayTag, fitLanes, itemsOn, layoutBars, monthItems, type BarItem } from './inputscal-model'

const PEOPLE: Record<string, any> = {
  p1: { cs: 'Saber', seat: 'FCP' }, p2: { cs: 'Ranger', seat: 'FCP' }, p3: { cs: 'Wisp', seat: 'RCP' },
  p4: { cs: 'Anvil', seat: 'RCP' }, p5: { cs: 'Quill', seat: 'FCP' },
}
let n = 0
const inp = (person: string, type: string, date: string, endDate?: string, over: any = {}) =>
  ({ iid: 'i' + (++n), person, type, date, endDate, yr: 2026, allday: true, s: 360, e: 1080, ...over })
const ALL = { fPerson: 'all', fType: 'all', fSearch: '' }
/* the week of Mon 6 Jul 26 and the one after; July 2026 begins on a Wednesday, so its first week has two blanks */
const W1 = [null, null, '2026-07-01', '2026-07-02', '2026-07-03', '2026-07-04', '2026-07-05']
const W2 = ['2026-07-06', '2026-07-07', '2026-07-08', '2026-07-09', '2026-07-10', '2026-07-11', '2026-07-12']
const W3 = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19']
const items = (rows: any[], f = ALL) => monthItems(rows, f, PEOPLE)
const seg = (wk: ReturnType<typeof layoutBars>, key: string) => wk.segs.find(s => s.item.key === key)!

describe('an input as a bar', () => {
  it('a one-day input is a bar one day wide, on the first line', () => {
    const r = inp('p1', 'LL', 'Jul 8')
    const wk = layoutBars(W2, items([r]), 7)
    expect(wk.segs).toHaveLength(1)
    expect(seg(wk, r.iid)).toMatchObject({ lane: 0, c0: 2, c1: 2, head: true, tail: true })
    expect(wk.more).toEqual([0, 0, 0, 0, 0, 0, 0])
  })
  it('an input of several days is ONE bar across them', () => {
    const r = inp('p5', 'OML', 'Jul 6', 'Jul 9')
    const wk = layoutBars(W2, items([r]), 7)
    expect(wk.segs).toHaveLength(1)
    expect(seg(wk, r.iid)).toMatchObject({ lane: 0, c0: 0, c1: 3, head: true, tail: true })
  })
  it('a bar that runs past Sunday is cut at the week’s end and carried on in the next week', () => {
    const r = inp('p1', 'LL', 'Jul 10', 'Jul 14')
    const its = items([r])
    expect(seg(layoutBars(W2, its, 7), r.iid)).toMatchObject({ c0: 4, c1: 6, head: true, tail: false })
    expect(seg(layoutBars(W3, its, 7), r.iid)).toMatchObject({ c0: 0, c1: 1, head: false, tail: true })
  })
  it('a bar that began last month starts at the month’s first date, never in the blank dates before it', () => {
    const r = inp('p1', 'LL', 'Jun 29', 'Jul 2')
    expect(seg(layoutBars(W1, items([r]), 7), r.iid)).toMatchObject({ c0: 2, c1: 3, head: false, tail: true })
  })
  it('an input that does not touch the week draws nothing there', () => {
    expect(layoutBars(W2, items([inp('p1', 'LL', 'Jul 14')]), 7).segs).toEqual([])
  })
  it('an input whose date cannot be read is on no bar and breaks nothing', () => {
    expect(items([inp('p1', 'LL', 'sometime')])).toEqual([])
    /* an end before its start reads as its one first day — and is drawn there, one day wide (the strictness proof of
       8 Oct 26 found this line asserting only that the input was still listed) */
    const back = items([inp('p1', 'LL', 'Jul 9', 'Jul 6')])
    expect(back).toHaveLength(1)
    expect([back[0].a, back[0].b]).toEqual(['2026-07-09', '2026-07-09'])
    expect(layoutBars(W2, back, 7).segs[0]).toMatchObject({ c0: 3, c1: 3 })
  })
  it('two inputs that share a day take two lines; one that does not overlap goes back to the first', () => {
    const a = inp('p1', 'LL', 'Jul 6', 'Jul 8'), b = inp('p2', 'LL', 'Jul 8', 'Jul 9'), c = inp('p3', 'LL', 'Jul 10')
    const wk = layoutBars(W2, items([a, b, c]), 7)
    expect(seg(wk, a.iid).lane).toBe(0)
    expect(seg(wk, b.iid).lane).toBe(1)
    expect(seg(wk, c.iid).lane).toBe(0)
    expect(wk.lanes).toBe(2)
  })
  it('the longer bar takes the higher line, so a week reads long bars first (as the approved month is drawn)', () => {
    /* the short one is first in the month's own order (Ranger before Saber), so only the length can put the long one on top */
    const short = inp('p2', 'LL', 'Jul 6'), long = inp('p1', 'LL', 'Jul 6', 'Jul 10')
    const wk = layoutBars(W2, items([short, long]), 7)
    expect(seg(wk, long.iid).lane).toBe(0)
    expect(seg(wk, short.iid).lane).toBe(1)
  })
  it('a day with more inputs than lines shows the lines and counts the rest, day by day', () => {
    const rows = ['p1', 'p2', 'p3', 'p4', 'p5'].map(p => inp(p, 'LL', 'Jul 7'))
    const wide = inp('p1', 'OML', 'Jul 6', 'Jul 8', { iid: 'wide' })
    const wk = layoutBars(W2, items([wide, ...rows]), 3)
    expect(wk.segs).toHaveLength(3)                       // the wide bar and two of the five
    expect(wk.segs.every(s => s.lane < 3)).toBe(true)
    expect(wk.more).toEqual([0, 3, 0, 0, 0, 0, 0])
    expect(wk.lanes).toBe(3)
  })
  it('a bar hidden for want of a line is counted on EVERY day it covers', () => {
    const rows = [inp('p1', 'LL', 'Jul 6', 'Jul 8'), inp('p2', 'LL', 'Jul 6', 'Jul 8'), inp('p3', 'LL', 'Jul 6', 'Jul 7')]
    expect(layoutBars(W2, items(rows), 2).more).toEqual([1, 1, 0, 0, 0, 0, 0])
  })
  it('SANS availability is on no bar (it is filed on the SANS calendar only — D620)', () => {
    expect(items([inp('p1', 'SANS Availability', 'Jul 8', undefined, { sans: { f: true } })])).toEqual([])
  })
})

describe('what a bar says', () => {
  it('the callsign and the kind; on a phone a one-day bar says the callsign alone', () => {
    const [one] = items([inp('p3', 'OIL', 'Jul 8')])
    const [many] = items([inp('p5', 'OML', 'Jul 6', 'Jul 9')])
    expect(barText(one, false)).toBe('Wisp · OIL')
    expect(barText(one, true)).toBe('Wisp')
    expect(barText(many, true)).toBe('Quill · OML')
  })
  it('an input reads by its own title; an Other without one reads "Other" — no longer by its remarks (D716)', () => {
    const [it0] = items([inp('p1', 'Other', 'Jul 8', undefined, { title: 'Dental', remarks: 'back by 1400' })])
    expect(barText(it0, false)).toBe('Saber · Dental')
    expect(it0.kind, 'its kind, for the tip and the day card').toBe('Other')
    const [it1] = items([inp('p1', 'Other', 'Jul 8', undefined, { remarks: 'Dental' })])
    expect(barText(it1, false)).toBe('Saber · Other')
    expect(it1.kind).toBe('')
    const [it2] = items([inp('p1', 'Event', 'Jul 8', undefined, { title: 'Sports day' })])
    expect(barText(it2, false)).toBe('Saber · Sports day')
    expect(it2.kind).toBe('Event')
  })
  /* A TIMED INPUT IS DRAWN LIGHTER THAN AN ALL-DAY ONE (D729 — V4): the model says which it is */
  it('an all-day input is not timed; one with hours, or a half day, is', () => {
    const [day, hrs, half] = items([inp('p1', 'LL', 'Jul 8'), inp('p2', 'Meeting', 'Jul 9', undefined, { allday: false, s: 600, e: 660 }),
      inp('p3', 'LL', 'Jul 10', undefined, { allday: false, half: 'am', s: 0, e: 720 })])
    expect([day.allday, hrs.allday, half.allday]).toEqual([true, false, false])
  })
  it('red for an absence, amber for a duty or a commitment — the List’s own colours', () => {
    const [ll, mtg] = items([inp('p1', 'LL', 'Jul 8'), inp('p2', 'Meeting', 'Jul 9')])
    expect(ll.tone).toBe('red')
    expect(mtg.tone).toBe('amb')
  })
})

describe('a group filing is ONE bar (D655)', () => {
  const grp = (people: string[], over: any = {}) => people.map(p => inp(p, 'Meeting', 'Jul 8', undefined, { grp: 'g1', grpBy: 'p1', allday: false, ...over }))
  /* THE COUNT FIRST (owner D729 — the design vet's V4, 10 Oct 26: "4 · Meeting"). The bar used to lead with whoever
     comes first in the alphabet — "Anvil +3 · Meeting" — so Saber's own meeting did not show his name, and a bar cut
     short lost the "+3". It says how many and what; the opened day names everyone. */
  it('one bar for the entry: HOW MANY first, then what it is — never one callsign and "+N" (D729)', () => {
    const its = items(grp(['p1', 'p2', 'p3', 'p4']))
    expect(its).toHaveLength(1)
    expect(its[0].rows.map((r: any) => r.person)).toEqual(['p4', 'p2', 'p1', 'p3'])   // Anvil, Ranger, Saber, Wisp
    expect(barText(its[0], false)).toBe('4 · Meeting')
    expect(layoutBars(W2, its, 7).segs).toHaveLength(1)
  })
  it('…by its own title where it has one, and the same on a phone’s one-day bar — the count is never dropped', () => {
    const [photo] = items(grp(['p1', 'p2', 'p3'], { type: 'Event', title: 'Squadron photo' }))
    expect(barText(photo, false)).toBe('3 · Squadron photo')
    expect(barText(photo, true)).toBe('3 · Squadron photo')
    const [two] = items(grp(['p1', 'p2']))
    expect(barText(two, true)).toBe('2 · Meeting')
  })
  it('an input for ALL AVAIL or ALL is one record: its bar keeps the placeholder’s name', () => {
    const P2 = { ...PEOPLE, allavail: { cs: 'ALL AVAIL', special: true } }
    const [it0] = monthItems([inp('allavail', 'Duty', 'Jul 8')], ALL, P2)
    expect(barText(it0, false)).toBe('ALL AVAIL · Duty')
  })
  it('a man whose record was changed alone reads as his own input beside the entry', () => {
    const rows = grp(['p1', 'p2', 'p3'])
    rows[1].e = 900
    const its = items(rows)
    expect(its).toHaveLength(2)
    expect(its.map(i => barText(i, false)).sort()).toEqual(['2 · Meeting', 'Ranger · Meeting'])
  })
  it('the Person filter shows an entry when ANY of its people passes; the bar still names them all', () => {
    const its = items(grp(['p1', 'p2', 'p3']), { ...ALL, fPerson: 'p3' })
    expect(its).toHaveLength(1)
    expect(its[0].rows).toHaveLength(3)
    expect(items(grp(['p1', 'p2']), { ...ALL, fPerson: 'p5' })).toEqual([])
  })
})

describe('the filters are the List’s own', () => {
  const rows = () => [inp('p1', 'LL', 'Jul 8', undefined, { remarks: 'family' }), inp('p2', 'Meeting', 'Jul 8'), inp('p3', 'LL', 'Jul 9')]
  it('by person, by type, and by a word in the remarks or the callsign', () => {
    expect(items(rows(), { ...ALL, fPerson: 'p2' }).map(i => i.who)).toEqual(['Ranger'])
    expect(items(rows(), { ...ALL, fType: 'LL' }).map(i => i.who).sort()).toEqual(['Saber', 'Wisp'])
    expect(items(rows(), { ...ALL, fSearch: 'FAMILY' }).map(i => i.who)).toEqual(['Saber'])
    expect(items(rows(), { ...ALL, fSearch: 'wis' }).map(i => i.who)).toEqual(['Wisp'])
  })
})

describe('a day opened', () => {
  it('lists every input covering it — the ones no line had room for too', () => {
    const rows = ['p1', 'p2', 'p3', 'p4', 'p5'].map(p => inp(p, 'LL', 'Jul 7'))
    const its = items([...rows, inp('p1', 'Meeting', 'Jul 6', 'Jul 8'), inp('p2', 'Meeting', 'Jul 9')])
    expect(itemsOn('2026-07-07', its)).toHaveLength(6)
    expect(itemsOn('2026-07-09', its)).toHaveLength(1)
    expect(itemsOn('2026-07-10', its)).toEqual([])
  })
  it('absences first, then commitments; all-day before timed; then by callsign', () => {
    const its = items([
      inp('p3', 'Meeting', 'Jul 7', undefined, { allday: false, s: 600 }),
      inp('p1', 'LL', 'Jul 7'),
      inp('p4', 'LL', 'Jul 7'),
      inp('p2', 'Meeting', 'Jul 7', undefined, { allday: false, s: 480 }),
    ])
    expect(itemsOn('2026-07-07', its).map(i => i.who)).toEqual(['Anvil', 'Saber', 'Ranger', 'Wisp'])
  })
})

describe('the lines a phone’s week has room for (D653, D664)', () => {
  const M = { head: 22, lane: 16, more: 14 }
  it('the week rows share the height the screen gives, and the lines are what fits', () => {
    /* 600px for five weeks: 120 a row; less the date line and the "+N more" line leaves 84 — five lines of 16 */
    expect(fitLanes(600, 5, M)).toEqual({ row: 120, lanes: 5 })
    expect(fitLanes(720, 5, M)).toEqual({ row: 144, lanes: 6 })
  })
  it('never fewer than three lines and the "+N more" line: a short screen or a six-week month makes the row taller than its share', () => {
    const floor = 22 + 3 * 16 + 14
    expect(fitLanes(300, 6, M)).toEqual({ row: floor, lanes: 3 })
    expect(fitLanes(0, 5, M)).toEqual({ row: floor, lanes: 3 })
    expect(fitLanes(NaN, 5, M)).toEqual({ row: floor, lanes: 3 })
  })
})

describe('the tag a date wears (D627)', () => {
  const facts = (over: Partial<DayFacts> = {}): DayFacts => ({ covered: true, kind: null, availP: 10, availW: 10, ...over })
  const plan = (over: Partial<FlyPlan>): FlyPlan => ({ ...EMPTY_PLAN, ...over })
  const WED = '2026-10-07'
  const none = { p: 0, w: 0 }
  it('a public holiday and an Off day wear the Leave War’s own short form, in their kind', () => {
    expect(dayTag(planFor(WED, EMPTY_PLAN, facts({ kind: 'ph' }), none), 'ND')).toEqual({ text: 'ND', kind: 'ph' })
    expect(dayTag(planFor(WED, EMPTY_PLAN, facts({ kind: 'off' }), none), '')).toEqual({ text: 'OFF', kind: 'off' })
    expect(dayTag(planFor(WED, EMPTY_PLAN, facts({ kind: 'ph' }), none), '')).toEqual({ text: 'PH', kind: 'ph' })
  })
  it('a no-fly day says NF', () => {
    expect(dayTag(planFor(WED, plan({ days: { [WED]: { cls: 'nf' } } }), facts(), none), '')).toEqual({ text: 'NF', kind: 'nf' })
  })
  it('a day-flying or a night-flying day wears nothing here — the sun and the moon are the SANS calendar’s alone', () => {
    expect(dayTag(planFor(WED, EMPTY_PLAN, facts(), none), '')).toBeNull()
    expect(dayTag(planFor(WED, plan({ days: { [WED]: { cls: 'night' } } }), facts(), none), '')).toBeNull()
  })
  it('a holiday on a no-fly weekday says the holiday', () => {
    expect(dayTag(planFor(WED, plan({ days: { [WED]: { cls: 'nf' } } }), facts({ kind: 'ph' }), none), 'PH')).toEqual({ text: 'PH', kind: 'ph' })
  })
})

describe('the bar a pointer is asked about', () => {
  it('each item keeps its first and last day, for a drag that moves it by days', () => {
    const [it0] = items([inp('p1', 'LL', 'Jul 6', 'Jul 10')]) as BarItem[]
    expect([it0.a, it0.b]).toEqual(['2026-07-06', '2026-07-10'])
  })
})
