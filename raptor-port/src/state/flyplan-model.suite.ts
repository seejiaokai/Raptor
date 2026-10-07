/* THE FLYING PLAN'S RESOLVER — its tests, as ONE body run twice (the build plan §3.2, §5): by `flyplan-model.test.ts`
   in the scheduler's project, and by `leavewar/flyplan-model-tz.test.ts` under the Leave War suite's hostile time zone
   (Pacific/Midway), because the Leave War's rows read the same resolver and every date here must be worked out on
   ISO strings through UTC, never local time (.claude/rules/raptor-executor.md §Correctness). */
import { describe, expect, it } from 'vitest'
import {
  planFor, monthAnswers, weekdayOf, isWeekend, addDays, validIso, validFlyDay, validFlyRule, validFlyRun, validTones,
  inheritedCls, trimDay, nextCls, toneOf, EMPTY_PLAN, DEFAULT_TONES,
  type FlyPlan, type DayFacts,
} from './flyplan-model'

const facts = (over: Partial<DayFacts> = {}): DayFacts => ({ covered: true, kind: null, availP: 10, availW: 10, ...over })
const plan = (over: Partial<FlyPlan> = {}): FlyPlan => ({ days: {}, rules: [], runs: {}, ...over })
const none = { p: 0, w: 0 }
/* 2026: 12 Jan is a Monday, 15 Jan a Thursday, 17 Jan a Saturday, 18 Jan a Sunday */
const MON = '2026-01-12', THU = '2026-01-15', FRI = '2026-01-16', SAT = '2026-01-17', SUN = '2026-01-18'

export function flyplanModelSuite(): void {
  describe('dates are worked out on ISO strings through UTC', () => {
    it('knows each weekday, Monday first', () => {
      expect(weekdayOf(MON)).toBe(0); expect(weekdayOf(THU)).toBe(3); expect(weekdayOf(SAT)).toBe(5); expect(weekdayOf(SUN)).toBe(6)
      expect(isWeekend(SAT)).toBe(true); expect(isWeekend(SUN)).toBe(true); expect(isWeekend(FRI)).toBe(false)
    })
    it('steps over a month end, a year end and a leap day', () => {
      expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
      expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
      expect(addDays('2027-01-01', -1)).toBe('2026-12-31')
      expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
      expect(addDays('2028-02-29', 1)).toBe('2028-03-01')
      expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
    })
    it('refuses what is not a real date', () => {
      for (const bad of ['', '2026-1-5', '2026-02-30', '2027-02-29', '2026-13-01', 'Jan 5', null, undefined, 20260105])
        expect(validIso(bad as any), String(bad)).toBe(false)
      expect(validIso('2028-02-29')).toBe(true)
    })
  })

  describe('a day\'s flying class (D627, D631, D638, D642)', () => {
    it('a weekday is day flying by default; Saturday and Sunday start with no flying set', () => {
      expect(planFor(MON, plan(), facts(), none).cls).toBe('day')
      expect(planFor(SAT, plan(), facts(), none).cls).toBe('none')
      expect(planFor(SUN, plan(), facts(), none).cls).toBe('none')
    })
    it('a date set for itself wins: night, no fly, a weekend set to fly', () => {
      expect(planFor(MON, plan({ days: { [MON]: { cls: 'night' } } }), facts(), none).cls).toBe('night')
      expect(planFor(MON, plan({ days: { [MON]: { cls: 'nf' } } }), facts(), none).cls).toBe('nf')
      expect(planFor(SAT, plan({ days: { [SAT]: { cls: 'day' } } }), facts(), none).cls).toBe('day')
    })
    it('"every Thursday from a date onward, no end" holds from that date and not before', () => {
      const p = plan({ rules: [{ id: 'r1', wd: 3, cls: 'nf', from: '2026-01-15' }] })
      expect(planFor('2026-01-08', p, facts(), none).cls).toBe('day')
      expect(planFor('2026-01-15', p, facts(), none).cls).toBe('nf')
      expect(planFor('2027-06-10', p, facts(), none).cls).toBe('nf')          // a Thursday a year and a half on
      expect(planFor('2026-01-16', p, facts(), none).cls).toBe('day')         // the Friday is untouched
    })
    it('a rule with an end stops after its last day', () => {
      const p = plan({ rules: [{ id: 'r1', wd: 3, cls: 'night', from: '2026-01-15', until: '2026-01-29' }] })
      expect(planFor('2026-01-29', p, facts(), none).cls).toBe('night')
      expect(planFor('2026-02-05', p, facts(), none).cls).toBe('day')
    })
    it('of two rules for one weekday, the one that started later is in force', () => {
      const p = plan({ rules: [
        { id: 'a', wd: 3, cls: 'nf', from: '2026-01-01' },
        { id: 'b', wd: 3, cls: 'night', from: '2026-02-05' },
      ] })
      expect(planFor('2026-01-29', p, facts(), none).cls).toBe('nf')
      expect(planFor('2026-02-05', p, facts(), none).cls).toBe('night')
      /* the later one ends: the earlier one, never ended, is in force again */
      const q = plan({ rules: [p.rules[0], { ...p.rules[1], until: '2026-02-12' }] })
      expect(planFor('2026-02-19', q, facts(), none).cls).toBe('nf')
    })
    it('a date set apart from its rule keeps its own class, and stepped back to the rule its row goes', () => {
      const p = plan({ rules: [{ id: 'r1', wd: 3, cls: 'nf', from: '2026-01-01' }], days: { [THU]: { cls: 'day' } } })
      expect(planFor(THU, p, facts(), none).cls).toBe('day')
      expect(planFor(THU, p, facts(), none).clsFrom).toBe('date')
      expect(inheritedCls(THU, p)).toBe('nf')
      /* trimDay drops a class that only repeats what the date would inherit — and the whole row when nothing is left */
      expect(trimDay(THU, { cls: 'nf' }, p)).toBeNull()
      expect(trimDay(THU, { cls: 'nf', p: 4 }, p)).toEqual({ p: 4 })
      expect(trimDay(THU, { cls: 'day' }, p)).toEqual({ cls: 'day' })
      expect(trimDay(MON, { cls: 'day' }, plan())).toBeNull()
      expect(trimDay(SAT, { cls: 'none' }, plan())).toBeNull()
      expect(trimDay(MON, {}, plan())).toBeNull()
    })
    it('the phone\'s one button steps day, night, no fly — and on a weekend on to "not set"', () => {
      expect(nextCls('day', false)).toBe('night'); expect(nextCls('night', false)).toBe('nf'); expect(nextCls('nf', false)).toBe('day')
      expect(nextCls('none', true)).toBe('day'); expect(nextCls('day', true)).toBe('night')
      expect(nextCls('night', true)).toBe('nf'); expect(nextCls('nf', true)).toBe('none')
      expect(nextCls('none', false)).toBe('day')
    })
    it('a public holiday and an Off day show their tag instead of a class — whatever is set under them', () => {
      for (const kind of ['ph', 'off'] as const) {
        const r = planFor(MON, plan({ days: { [MON]: { cls: 'night' } }, rules: [{ id: 'r', wd: 0, cls: 'nf', from: '2026-01-01' }] }), facts({ kind }), none)
        expect(r.cls).toBeNull(); expect(r.kind).toBe(kind)
      }
    })
  })

  describe('the required figures (D622, D636, D637)', () => {
    it('with nothing typed there is no figure, and no need', () => {
      const r = planFor(MON, plan(), facts(), none)
      expect(r.req).toEqual({ p: null, w: null }); expect(r.need).toEqual({ p: null, w: null }); expect(r.tone).toBe('none')
    })
    it('a figure typed for one date holds for that date only', () => {
      const p = plan({ days: { [MON]: { p: 16, w: 14 } } })
      expect(planFor(MON, p, facts(), none).req).toEqual({ p: 16, w: 14 })
      expect(planFor('2026-01-13', p, facts(), none).req).toEqual({ p: null, w: null })
    })
    it('a figure running from a date holds on every flying day after it, until a later one takes over', () => {
      const p = plan({ runs: { [MON]: { p: 18, w: 16 }, '2026-02-02': { p: 20 } } })
      expect(planFor('2026-01-09', p, facts(), none).req).toEqual({ p: null, w: null })
      expect(planFor(MON, p, facts(), none).req).toEqual({ p: 18, w: 16 })
      expect(planFor('2026-01-30', p, facts(), none).req).toEqual({ p: 18, w: 16 })
      /* pilots and WSOs run apart: the later run names pilots only, so the WSOs' figure carries on */
      expect(planFor('2026-02-02', p, facts(), none).req).toEqual({ p: 20, w: 16 })
      expect(planFor(MON, p, facts(), none).reqFrom).toEqual({ p: 'run', w: 'run' })
      expect(planFor('2026-01-20', p, facts(), none).runStart).toEqual({ p: MON, w: MON })
      expect(planFor('2026-02-03', p, facts(), none).runStart).toEqual({ p: '2026-02-02', w: MON })
    })
    it('a run ended for a seat leaves that seat with no figure from then on', () => {
      const p = plan({ runs: { [MON]: { p: 18, w: 16 }, '2026-01-26': { p: null } } })
      expect(planFor('2026-01-23', p, facts(), none).req).toEqual({ p: 18, w: 16 })
      expect(planFor('2026-01-26', p, facts(), none).req).toEqual({ p: null, w: 16 })
      expect(planFor('2026-03-02', p, facts(), none).req).toEqual({ p: null, w: 16 })
    })
    it('a one-day figure inside a run does not end it — the run carries on the next day', () => {
      const p = plan({ runs: { [MON]: { p: 18, w: 16 } }, days: { '2026-01-14': { p: 12 } } })
      expect(planFor('2026-01-14', p, facts(), none).req).toEqual({ p: 12, w: 16 })
      expect(planFor('2026-01-14', p, facts(), none).reqFrom).toEqual({ p: 'date', w: 'run' })
      expect(planFor('2026-01-15', p, facts(), none).req).toEqual({ p: 18, w: 16 })
    })
    it('a running figure skips weekends, public holidays and Off days — a figure typed on such a day holds', () => {
      const p = plan({ runs: { [MON]: { p: 18, w: 16 } }, days: { [SUN]: { p: 6, w: 6 }, [SAT]: { cls: 'day' } } })
      expect(planFor(SAT, p, facts(), none).req).toEqual({ p: null, w: null })       // set to fly, still no running figure
      expect(planFor(SUN, p, facts(), none).req).toEqual({ p: 6, w: 6 })
      expect(planFor('2026-01-13', p, facts({ kind: 'ph' }), none).req).toEqual({ p: null, w: null })
      expect(planFor('2026-01-13', p, facts({ kind: 'off' }), none).req).toEqual({ p: null, w: null })
      const q = plan({ runs: p.runs, days: { '2026-01-13': { p: 8 } } })
      expect(planFor('2026-01-13', q, facts({ kind: 'ph' }), none).req).toEqual({ p: 8, w: null })
    })
    it('a no-fly day needs nobody: it reads 0 over a typed figure and over a running one, and lifting it brings the figure back', () => {
      const run = { [MON]: { p: 18, w: 16 } }
      const nf = planFor(THU, plan({ runs: run, days: { [THU]: { cls: 'nf', p: 12 } } }), facts({ availP: 0, availW: 0 }), none)
      expect(nf.cls).toBe('nf'); expect(nf.req).toEqual({ p: 0, w: 0 }); expect(nf.reqFrom).toEqual({ p: 'nf', w: 'nf' })
      expect(nf.need).toEqual({ p: 0, w: 0 }); expect(nf.tone).toBe('none')
      const back = planFor(THU, plan({ runs: run, days: { [THU]: { p: 12 } } }), facts(), none)
      expect(back.req).toEqual({ p: 12, w: 16 })
      /* a no-fly day by its weekday's rule, the same */
      const byRule = planFor(THU, plan({ runs: run, rules: [{ id: 'r', wd: 3, cls: 'nf', from: '2026-01-01' }] }), facts(), none)
      expect(byRule.req).toEqual({ p: 0, w: 0 })
    })
    it('holds across a year\'s end and on a leap day', () => {
      const p = plan({ runs: { '2026-12-28': { p: 9, w: 9 } } })
      expect(planFor('2027-01-04', p, facts(), none).req).toEqual({ p: 9, w: 9 })
      expect(planFor('2028-02-29', p, facts(), none).req).toEqual({ p: 9, w: 9 })       // a Tuesday
    })
    it('reads a stored record it cannot trust as nothing', () => {
      const p = plan({
        days: { [MON]: { p: -1, w: 2.5 } as any, [THU]: { cls: 'both' } as any, 'not-a-date': { p: 5 } },
        runs: { [MON]: { p: 'lots' } as any },
        rules: [{ id: 'x', wd: 9, cls: 'nf', from: '2026-01-01' }, { id: 'y', wd: 3, cls: 'nf', from: 'soon' } as any],
      })
      expect(planFor(MON, p, facts(), none).req).toEqual({ p: null, w: null })
      expect(planFor(THU, p, facts(), none).cls).toBe('day')
    })
  })

  describe('still needed, and the day\'s colour (D617, D618, D626)', () => {
    const fig = plan({ days: { [MON]: { p: 16, w: 14 } } })
    it('is the required figure less those available less the SANS committed to fly, per seat, never below zero', () => {
      const r = planFor(MON, fig, facts({ availP: 12, availW: 14 }), { p: 1, w: 3 })
      expect(r.need).toEqual({ p: 3, w: 0 })
    })
    it('rounds a half-day absence UP: 15.5 available against 16 needs 1', () => {
      expect(planFor(MON, fig, facts({ availP: 15.5, availW: 13.5 }), none).need).toEqual({ p: 1, w: 1 })
    })
    it('is unknown where no leave period covers the date — but a no-fly day still needs nobody', () => {
      const r = planFor(MON, fig, { covered: false, kind: null, availP: null, availW: null }, none)
      expect(r.req).toEqual({ p: 16, w: 14 }); expect(r.need).toEqual({ p: null, w: null }); expect(r.tone).toBe('none')
      const nf = planFor(MON, plan({ days: { [MON]: { cls: 'nf' } } }), { covered: false, kind: null, availP: null, availW: null }, none)
      expect(nf.need).toEqual({ p: 0, w: 0 })
    })
    it('colours by the two needs added together, at each boundary of the three figures', () => {
      expect(DEFAULT_TONES).toEqual({ yellowFrom: 1, amberFrom: 3, redFrom: 5 })
      expect(toneOf(0, DEFAULT_TONES)).toBe('none'); expect(toneOf(1, DEFAULT_TONES)).toBe('yellow'); expect(toneOf(2, DEFAULT_TONES)).toBe('yellow')
      expect(toneOf(3, DEFAULT_TONES)).toBe('amber'); expect(toneOf(4, DEFAULT_TONES)).toBe('amber')
      expect(toneOf(5, DEFAULT_TONES)).toBe('red'); expect(toneOf(40, DEFAULT_TONES)).toBe('red')
      expect(toneOf(3, { yellowFrom: 2, amberFrom: 4, redFrom: 9 })).toBe('yellow')
      const at = (availP: number, availW: number) => planFor(MON, fig, facts({ availP, availW }), none).tone
      expect(at(16, 14)).toBe('none'); expect(at(15, 14)).toBe('yellow'); expect(at(14, 13)).toBe('amber'); expect(at(13, 12)).toBe('red')
      /* one seat with a figure and the other without: the known need alone colours the day */
      expect(planFor(MON, plan({ days: { [MON]: { p: 16 } } }), facts({ availP: 13 }), none).tone).toBe('amber')
    })
  })

  describe('what is refused at the write', () => {
    it('a day', () => {
      expect(validFlyDay({})).toBe(true); expect(validFlyDay({ cls: 'nf', p: 0, w: 12 })).toBe(true)
      for (const bad of [null, [], { cls: 'both' }, { p: -1 }, { w: 1.5 }, { p: '4' }, { required: 4 }, { cls: 'day', flying: 'day' }])
        expect(validFlyDay(bad as any), JSON.stringify(bad)).toBe(false)
    })
    it('a weekday rule', () => {
      expect(validFlyRule({ id: 'r', wd: 3, cls: 'nf', from: '2026-01-15' })).toBe(true)
      expect(validFlyRule({ id: 'r', wd: 3, cls: 'night', from: '2026-01-15', until: '2026-01-15' })).toBe(true)
      for (const bad of [
        { id: 'r', wd: 7, cls: 'nf', from: '2026-01-15' }, { id: 'r', wd: 3, cls: 'x', from: '2026-01-15' },
        { id: 'r', wd: 3, cls: 'nf', from: '2026-02-30' }, { id: 'r', wd: 3, cls: 'nf', from: '2026-01-15', until: '2026-01-14' },
        { id: '', wd: 3, cls: 'nf', from: '2026-01-15' }, { id: 'r', wd: 3, cls: 'nf', from: '2026-01-15', extra: 1 }, null,
      ]) expect(validFlyRule(bad as any), JSON.stringify(bad)).toBe(false)
    })
    it('a running figure', () => {
      expect(validFlyRun({ p: 18 })).toBe(true); expect(validFlyRun({ p: null, w: 0 })).toBe(true)
      for (const bad of [{}, { p: -2 }, { w: 3.3 }, { p: 1, x: 2 }, null, { p: '5' }]) expect(validFlyRun(bad as any), JSON.stringify(bad)).toBe(false)
    })
    it('the three colour figures: whole numbers, 1 or more, each above the last', () => {
      expect(validTones({ yellowFrom: 1, amberFrom: 3, redFrom: 5 })).toBe(true)
      for (const bad of [{ yellowFrom: 0, amberFrom: 3, redFrom: 5 }, { yellowFrom: 2, amberFrom: 2, redFrom: 5 }, { yellowFrom: 1, amberFrom: 5, redFrom: 5 },
        { yellowFrom: 1, amberFrom: 3 }, { yellowFrom: 1.5, amberFrom: 3, redFrom: 5 }, { amberFrom: 1, redFrom: 3 }, null])
        expect(validTones(bad as any), JSON.stringify(bad)).toBe(false)
    })
  })

  describe('a month\'s answers — what the rows and the calendars draw, and repaint on (the plan §3.3)', () => {
    const f = () => facts()
    it('gives one answer for every date of the month', () => {
      const a = monthAnswers(2028, 2, EMPTY_PLAN, f, () => none)
      expect(Object.keys(a)).toHaveLength(29); expect(a['2028-02-29'].cls).toBe('day')
    })
    it('moves when a run or a weekday rule that started BEFORE the month changes', () => {
      const march = (p: FlyPlan) => JSON.stringify(monthAnswers(2026, 3, p, f, () => none))
      const base = march(plan({ runs: { [MON]: { p: 18, w: 16 } }, rules: [{ id: 'r', wd: 3, cls: 'nf', from: '2026-02-05' }] }))
      expect(march(plan({ runs: { [MON]: { p: 19, w: 16 } }, rules: [{ id: 'r', wd: 3, cls: 'nf', from: '2026-02-05' }] }))).not.toBe(base)
      expect(march(plan({ runs: { [MON]: { p: 18, w: 16 } }, rules: [{ id: 'r', wd: 3, cls: 'night', from: '2026-02-05' }] }))).not.toBe(base)
      expect(march(plan({ runs: { [MON]: { p: 18, w: 16 } }, rules: [{ id: 'r', wd: 3, cls: 'nf', from: '2026-02-05' }] }))).toBe(base)
      /* a record dated wholly outside what March reads changes nothing */
      expect(march(plan({ runs: { [MON]: { p: 18, w: 16 } }, rules: [{ id: 'r', wd: 3, cls: 'nf', from: '2026-02-05' }], days: { '2026-04-01': { p: 3 } } }))).toBe(base)
    })
  })
}
