/* @vitest-environment jsdom */
/* DATES ARE ANCHORED TO A REAL YEAR (owner, 24 Aug 26 — "What if another year
   has the same day and date … fix it very carefully"). The app stores a date
   as a bare 'Jul 13' label and used to resolve it against whatever week is
   CURRENTLY loaded (baseYear), so an input filed for Jul 13 2026 re-appeared
   on Jul 13 of ANY year you scrolled to — and, the same family, a week that
   spans New Year printed bare January labels that resolved to the WRONG year,
   so a leave running into January never covered the January days of the very
   week it was filed for. The fix: every input carries `yr`, the year its bare
   labels belong to (stamped at creation/boot, re-stamped on edit), every
   engine read resolves labels through it, and week labels carry an explicit
   year whenever a day falls outside the loaded week's own year. */
import { beforeEach, describe, expect, it } from 'vitest'
import { initStore, loadWeek } from '../state/store'
import { DAYS } from './data'
import { DATES, INPUTS, inputCoversDate, dateOrd, baseYear } from './inputs'
import { autoAcceptInput, inpKey } from './slots'
import { stashClear, stashDays } from './weekstash'
import { draftOf, sansOverlapRefusal } from '../ui/inputedit'

/* INPUTS and the week stash are module-level session state (see
   loadweek.test.ts's identical preamble) — start each test at first boot. */
beforeEach(() => {
  stashClear()
  for (let i = INPUTS.length - 1; i >= 0; i--) if ((INPUTS[i] as any)._t) INPUTS.splice(i, 1)
  initStore()
  loadWeek('13/07/2026')
})

describe('cross-year date anchoring', () => {
  it('boot stamps every seed input with its anchor year', () => {
    expect(INPUTS.length).toBeGreaterThan(0)
    expect(INPUTS.every((r: any) => r.yr === 2026)).toBe(true)
  })

  /* the reported bug, exactly: the week of 12 Jul 2027 contains a 'Jul 13'
     too, and every 2026 demo input used to land on it */
  it('a 2026 input does not reappear on the same month/day of another year', () => {
    loadWeek('12/07/2027')
    expect(baseYear()).toBe(2027)
    expect(DATES).toContain('Jul 13')
    const divot: any = INPUTS.find((r: any) => r.person === 'divot' && r.type === 'OML')
    expect(divot).toBeTruthy()
    expect(inputCoversDate(divot, 'Jul 13')).toBe(false)
    // nothing from the (all-2026) global INPUTS covers any day of this 2027 week
    expect(INPUTS.some((r: any) => DATES.some((dt: any) => inputCoversDate(r, dt)))).toBe(false)
    // and no activity input auto-landed on the 2027 ground programme
    expect(DAYS.every((d: any) => !((d.ground || []).length))).toBe(true)
    // back home, the same input still covers its own day
    loadWeek('13/07/2026')
    expect(inputCoversDate(divot, 'Jul 13')).toBe(true)
  })

  it('an input filed while viewing another year belongs to THAT year', () => {
    loadWeek('12/07/2027')
    const r: any = { person: 'divot', date: 'Jul 14', type: 'LL', allday: true, yr: baseYear(), _t: true }
    INPUTS.push(r)
    expect(r.yr).toBe(2027)
    expect(inputCoversDate(r, 'Jul 14')).toBe(true)
    loadWeek('13/07/2026')
    expect(inputCoversDate(r, 'Jul 14')).toBe(false)
  })

  it('the auto-land pass respects the year — a next-year twin never lands this year', () => {
    const twin: any = { person: 'yeti', date: 'Jul 13', type: 'Meeting', allday: false, s: 600, e: 660, yr: 2027, _t: true }
    INPUTS.push(twin)
    expect(autoAcceptInput(twin)).toBe(false)
    expect(DAYS.some((d: any) => ((d.ground || []) as any[]).some((g: any) => g.src === inpKey(twin)))).toBe(false)
  })

  it('same-content inputs a year apart carry distinct content keys', () => {
    const a: any = { person: 'yeti', date: 'Jul 13', type: 'Meeting', s: 600, yr: 2026 }
    const b: any = { person: 'yeti', date: 'Jul 13', type: 'Meeting', s: 600, yr: 2027 }
    expect(inpKey(a)).not.toBe(inpKey(b))
  })
})

describe('the week that spans New Year', () => {
  it('labels a day outside the week-start year with its year', () => {
    loadWeek('28/12/2026')
    expect([...DATES]).toEqual(['Dec 28', 'Dec 29', 'Dec 30', 'Dec 31', 'Jan 1 2027', 'Jan 2 2027', 'Jan 3 2027'])
    expect(DAYS.map((d: any) => d.dt)).toEqual([...DATES])
  })

  it('a leave running into January covers the January days of its own week', () => {
    loadWeek('28/12/2026')
    const span: any = { person: 'pike', date: 'Dec 30', endDate: 'Jan 2 2027', allday: true, type: 'LL', yr: 2026, _t: true }
    expect(['Dec 30', 'Dec 31', 'Jan 1 2027', 'Jan 2 2027'].every(dt => inputCoversDate(span, dt))).toBe(true)
    expect(inputCoversDate(span, 'Dec 29')).toBe(false)
    expect(inputCoversDate(span, 'Jan 3 2027')).toBe(false)
    const single: any = { person: 'sufa', date: 'Jan 1 2027', allday: true, type: 'OL', yr: 2026, _t: true }
    expect(inputCoversDate(single, DATES[4])).toBe(true)
  })

  it('a December date does not bleed onto the same date a year on', () => {
    loadWeek('28/12/2026')
    const r: any = { person: 'pike', date: 'Dec 30', allday: true, type: 'LL', yr: 2026, _t: true }
    INPUTS.push(r)
    expect(inputCoversDate(r, 'Dec 30')).toBe(true)
    loadWeek('27/12/2027')            // the same dates, a year later
    expect(DATES).toContain('Dec 30')
    expect(inputCoversDate(r, 'Dec 30')).toBe(false)
  })

  /* the cross-week flag reads (weekctx.ts) consume stashed days by their `dt`
     labels — a stash written under one baseYear must still read correctly
     under another, so stashDays re-derives every label for the CURRENT year
     convention */
  it('a stashed week re-labels its days for whatever week is now loaded', () => {
    loadWeek('28/12/2026')
    DAYS[6].notes.push('planned')     // dirty the week so leaving stashes it
    loadWeek('04/01/2027')            // baseYear is 2027 now
    const st: any = stashDays('28/12/2026')
    expect(st).toBeTruthy()
    expect(st.days[0].dt).toBe('Dec 28 2026')
    expect(st.days[6].dt).toBe('Jan 3')          // 2027 = the loaded year, bare
    expect(dateOrd(st.days[0].dt)).toBe(20261228)
  })
})

describe('the editors resolve a row through its own year', () => {
  it('draftOf hands the edit form the date the input actually means', () => {
    loadWeek('12/07/2027')
    const r: any = { person: 'divot', date: 'Jul 13', type: 'LL', allday: true, yr: 2026 }
    expect(draftOf(r).start).toBe('2026-07-13')
  })

  it('a SANS record does not block the same month/day in another year', () => {
    const rec: any = { person: 'krait', date: 'Jul 14', allday: true, type: 'SANS Availability', sans: { f: true }, yr: 2026, _t: true }
    INPUTS.push(rec)
    // same year: refused, as before
    expect(sansOverlapRefusal('krait', 'Jul 14', undefined, null)).not.toBe('')
    // another year, same month/day: no clash
    loadWeek('12/07/2027')
    expect(sansOverlapRefusal('krait', 'Jul 14', undefined, null)).toBe('')
  })
})

/* dateOrd/baseYear are MEMOISED (25 Aug 26 — a year of INPUTS made every
   schedule pass re-parse the same labels millions of times). The memo caches
   only the pure label parse; the year fallback resolves per call. These pin
   the one way a memo could break the 24 Aug year-anchor semantics: serving a
   stale year after the loaded week changes. */
describe('the date memo never serves a stale year', () => {
  it('a bare label re-resolves through baseYear on every week change', () => {
    loadWeek('13/07/2026')
    expect(dateOrd('Jul 14')).toBe(20260714) // warm the memo under 2026
    loadWeek('12/07/2027')
    expect(dateOrd('Jul 14')).toBe(20270714) // same label, new week, new year
    loadWeek('13/07/2026')
    expect(dateOrd('Jul 14')).toBe(20260714)
  })
  it('an explicit label year and a row anchor still outrank the loaded week', () => {
    loadWeek('12/07/2027')
    expect(dateOrd('Jul 14 2026')).toBe(20260714) // label's own year wins
    expect(dateOrd('Jul 14', 2026)).toBe(20260714) // row anchor beats baseYear
    expect(dateOrd('not a date', 2026)).toBe(null) // unparseable stays null
    loadWeek('13/07/2026')
  })
})
