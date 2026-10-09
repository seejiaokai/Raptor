/* THE TWO LATE CUT-OFFS (owner D628, D639, 7 Oct 26; the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.9).

   D628: "the late cut-off can be set either as a number of days or as a weekday of a number of weeks before (for
   example the Wednesday two weeks prior)". D639: the SANS calendar and the Inputs calendar EACH have their own.

   So there are two sets of the same four values — the Inputs calendar's (inputLead, inputCutMode, inputCutWd,
   inputCutWeeks) and the SANS calendar's (sansLead, sansCutMode, sansCutWd, sansCutWeeks) — and each input is judged
   by its own calendar's set: a SANS availability input by the SANS set, every other input by the Inputs set.
     mode 0  a number of DAYS before the week's Monday — the rule as it has always been
     mode 1  a WEEKDAY of a number of WEEKS before: the week's Monday − weeks × 7 + weekday (Monday = 0)
   The Inputs calendar starts on mode 0 at 14 days, so nothing about it moves (lateinput.test.ts is untouched and still
   passes — the plan's risk 6). The SANS calendar starts as the Wednesday two weeks before, his own example.

   A cut-off is THE END OF ITS DAY (D639): the deadline day itself is on time, the day after is late.

   The tests walk the rules-engine doctrine's five families: a value in the wrong format, a missing value, a user's
   mistake, a change made from another page (the Logic page moves a rule under an input already filed), and the two
   sets kept apart. */
import { afterEach, describe, expect, it } from 'vitest'
import { VCONF, RULE_SPEC, RULE_STD, ruleFmt, ruleParse, rulesReset, rulesResetMem, rulesSave, rulesLoad, rulesOffCount } from './rules'
import { store, storeBackend } from './hooks'
import { cutSetOf, cutRuleText, inputDueISO, inputOwnDueISO, isLateInput, lateNote } from './inputs'

afterEach(() => { rulesReset(); storeBackend.impl = null })

const leave = (date: string, mod: string, extra: any = {}) => ({ person: 'yeti', date, type: 'LL', allday: true, mod, ...extra })
const sans = (date: string, mod: string, extra: any = {}) => ({ person: 'yeti', date, type: 'SANS Availability', allday: true, sans: { f: true }, mod, ...extra })
const weekday = (iso: string) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(iso + 'T12:00:00Z').getUTCDay()]

describe('the standard values', () => {
  it('the Inputs calendar starts exactly as today: a number of days, fourteen', () => {
    expect([VCONF.inputCutMode, VCONF.inputLead]).toEqual([0, 14])
    expect(inputDueISO('17/08/2026')).toBe('2026-08-03')
  })

  it('the SANS calendar starts as the Wednesday two weeks before', () => {
    expect([VCONF.sansCutMode, VCONF.sansCutWd, VCONF.sansCutWeeks]).toEqual([1, 2, 2])
    /* the week of Mon 13 Jul: two weeks before is the week of Mon 29 Jun; its Wednesday is 1 Jul */
    expect(inputOwnDueISO(sans('Jul 14', ''))).toBe('2026-07-01')
    expect(weekday('2026-07-01')).toBe('Wed')
  })

  it('every one of the eight has its range, and the standard sits inside it', () => {
    for (const k of ['inputLead', 'inputCutMode', 'inputCutWd', 'inputCutWeeks', 'sansLead', 'sansCutMode', 'sansCutWd', 'sansCutWeeks']) {
      expect(RULE_SPEC[k], k).toBeTruthy()
      expect(RULE_STD.v[k] >= RULE_SPEC[k].lo && RULE_STD.v[k] <= RULE_SPEC[k].hi, k).toBe(true)
    }
    expect(rulesOffCount()).toBe(0)
  })
})

describe('which set judges an input', () => {
  it('a SANS availability input by the SANS calendar’s; every other input by the Inputs calendar’s', () => {
    expect(cutSetOf(sans('Jul 14', ''))).toBe('sans')
    for (const type of ['LL', 'OL', 'Meeting', 'Appointment', 'Duty', 'Fly with', 'OD', 'ATT C', 'Upchit'])
      expect(cutSetOf({ type }), type).toBe('inputs')
    expect(cutSetOf(null)).toBe('inputs')
  })

  it('the two never borrow from each other', () => {
    /* same day, same stamp: 30 Jun is after the Inputs cut-off (29 Jun) and before the SANS one (1 Jul) */
    expect(isLateInput(leave('Jul 14', '2026-06-30'))).toBe(true)
    expect(isLateInput(sans('Jul 14', '2026-06-30'))).toBe(false)
    /* moving the Inputs rule does not move a SANS input … */
    VCONF.inputLead = 0
    expect(isLateInput(leave('Jul 14', '2026-06-30'))).toBe(false)
    expect(inputOwnDueISO(sans('Jul 14', ''))).toBe('2026-07-01')
    /* … and moving the SANS rule does not move a leave */
    VCONF.inputLead = 14
    VCONF.sansCutWeeks = 4
    expect(inputOwnDueISO(sans('Jul 14', ''))).toBe('2026-06-17')
    expect(inputOwnDueISO(leave('Jul 14', ''))).toBe('2026-06-29')
  })

  it('the SANS set has a days mode of its own too', () => {
    VCONF.sansCutMode = 0; VCONF.sansLead = 7
    expect(inputOwnDueISO(sans('Jul 14', ''))).toBe('2026-07-06')
    expect(inputOwnDueISO(leave('Jul 14', '')), 'the Inputs days are untouched').toBe('2026-06-29')
  })
})

describe('mode 1 — a weekday of a number of weeks before', () => {
  const due = (date: string, yr?: number) => inputOwnDueISO(leave(date, '', yr ? { yr } : {}))
  const set = (wd: number, weeks: number) => { VCONF.inputCutMode = 1; VCONF.inputCutWd = wd; VCONF.inputCutWeeks = weeks }

  it('is the week’s Monday, back that many weeks, forward to that weekday', () => {
    set(2, 2)                                             // the Wednesday two weeks before
    expect(due('Jul 14')).toBe('2026-07-01')
    set(0, 1)                                             // the Monday of the week before
    expect(due('Jul 14')).toBe('2026-07-06')
    set(4, 1)                                             // the Friday of the week before
    expect(due('Jul 14')).toBe('2026-07-10'); expect(weekday('2026-07-10')).toBe('Fri')
    set(6, 1)                                             // the Sunday before the week starts
    expect(due('Jul 14')).toBe('2026-07-12'); expect(weekday('2026-07-12')).toBe('Sun')
    set(3, 3)                                             // the Thursday three weeks before
    expect(due('Jul 14')).toBe('2026-06-25'); expect(weekday('2026-06-25')).toBe('Thu')
  })

  it('every day of a week has the same deadline — it is the week’s, not the day’s', () => {
    set(2, 2)
    for (const d of ['Jul 13', 'Jul 14', 'Jul 15', 'Jul 16', 'Jul 17', 'Jul 18', 'Jul 19']) expect(due(d), d).toBe('2026-07-01')
    expect(due('Jul 20')).toBe('2026-07-08')
  })

  it('steps over a month’s end and a year’s end through real dates', () => {
    set(2, 2)
    expect(due('Aug 3')).toBe('2026-07-22')
    expect(due('Mar 2')).toBe('2026-02-18')
    expect(due('Jan 12')).toBe('2025-12-31')               // week of Mon 12 Jan 26 → Wed 31 Dec 25
    expect(due('Jan 5 2027')).toBe('2026-12-23')           // week of Mon 4 Jan 27
    expect(due('Mar 6', 2028)).toBe('2028-02-23')          // a leap February in between
    expect(weekday('2028-02-23')).toBe('Wed')
  })

  it('the cut-off is the end of its day: that day is on time, the next is late', () => {
    set(2, 2)
    expect(isLateInput(leave('Jul 14', '2026-07-01')), 'the deadline day itself').toBe(false)
    expect(isLateInput(leave('Jul 14', '2026-07-02')), 'the day after').toBe(true)
    expect(isLateInput(leave('Jul 14', '2026-06-20')), 'well before').toBe(false)
  })

  it('the SANS calendar’s own standard, judged the same way', () => {
    expect(isLateInput(sans('Jul 14', '2026-07-01'))).toBe(false)
    expect(isLateInput(sans('Jul 14', '2026-07-02'))).toBe(true)
  })

  it('a week named by its key answers by the Inputs set, or by the SANS set when asked', () => {
    set(2, 2)
    expect(inputDueISO('13/07/2026')).toBe('2026-07-01')
    VCONF.sansCutWeeks = 3
    expect(inputDueISO('13/07/2026', 'sans')).toBe('2026-06-24')
    expect(inputDueISO('13/07/2026', 'inputs')).toBe('2026-07-01')
  })
})

describe('what never changes with the mode', () => {
  it('a downchit and an upchit stay exempt', () => {
    VCONF.inputCutMode = 1
    expect(isLateInput({ person: 'yeti', date: 'Jul 14', type: 'ATT C', allday: true, mod: '2026-07-13' })).toBe(false)
    expect(isLateInput({ person: 'yeti', date: 'Jul 14', type: 'OML', allday: true, mod: '2026-07-13' })).toBe(false)
    expect(isLateInput({ person: 'yeti', date: 'Jul 14', type: 'Upchit', allday: true, mod: '2026-07-13' })).toBe(false)
  })

  it('an input with no usable stamp, or no readable date, is never accused — in either mode, for either set', () => {
    for (const mode of [0, 1]) {
      VCONF.inputCutMode = mode; VCONF.sansCutMode = mode
      for (const make of [leave, sans]) {
        expect(isLateInput(make('Jul 14', '')), 'no stamp').toBe(false)
        expect(isLateInput(make('Jul 14', 'yesterday')), 'a stamp that is not a date').toBe(false)
        expect(isLateInput(make('', '2026-07-30')), 'no date').toBe(false)
        expect(isLateInput(make('the 14th', '2026-07-30')), 'a date nobody can read').toBe(false)
        expect(inputOwnDueISO(make('the 14th', '2026-07-30'))).toBe('')
      }
    }
    expect(isLateInput(null)).toBe(false)
  })

  it('the note on the mark names the day it was changed, the deadline it missed and its week', () => {
    VCONF.inputCutMode = 1; VCONF.inputCutWd = 2; VCONF.inputCutWeeks = 2
    const n = lateNote(leave('Jul 14', '2026-07-03'))
    expect(n).toContain('3 Jul'); expect(n).toContain('1 Jul'); expect(n).toContain('13 Jul')
    expect(lateNote(sans('Jul 14', '2026-07-03'))).toContain('1 Jul')
    expect(lateNote(sans('Jul 14', '2026-07-01'))).toBe('')
  })
})

describe('a value in the wrong shape never breaks the rule', () => {
  const due = () => inputOwnDueISO(leave('Jul 14', ''))

  it('a mode that is neither 0 nor 1 is read as days, as it always was', () => {
    for (const bad of [2, -1, 0.5, '1', 'weekday', null, undefined, NaN]) {
      VCONF.inputCutMode = bad
      expect(due(), String(bad)).toBe('2026-06-29')
    }
  })

  it('a weekday or a number of weeks outside its range is held to the nearest real one', () => {
    VCONF.inputCutMode = 1
    VCONF.inputCutWeeks = 2
    VCONF.inputCutWd = 9;  expect(due(), 'past Sunday → Sunday').toBe('2026-07-05')
    VCONF.inputCutWd = -3; expect(due(), 'before Monday → Monday').toBe('2026-06-29')
    VCONF.inputCutWd = 2.7; expect(due(), 'a fraction → the whole weekday').toBe('2026-07-01')
    VCONF.inputCutWd = 'Wed'; expect(due(), 'a word → Monday').toBe('2026-06-29')
    VCONF.inputCutWd = 2
    VCONF.inputCutWeeks = 0;  expect(due(), 'no weeks → one: never a deadline inside its own week').toBe('2026-07-08')
    VCONF.inputCutWeeks = -2; expect(due()).toBe('2026-07-08')
    VCONF.inputCutWeeks = NaN; expect(due()).toBe('2026-07-08')
    VCONF.inputCutWeeks = 99; expect(due(), 'held at the most the setting allows — eight weeks').toBe('2026-05-20')
  })

  it('a deadline never lands inside the week it is for', () => {
    VCONF.inputCutMode = 1
    for (let wd = 0; wd <= 6; wd++) for (let w = 1; w <= RULE_SPEC.inputCutWeeks.hi; w++) {
      VCONF.inputCutWd = wd; VCONF.inputCutWeeks = w
      expect(due() < '2026-07-13', `wd ${wd} weeks ${w}`).toBe(true)
    }
  })
})

describe('the values are settings like any other: typed, bounded, saved, reset', () => {
  it('each reads in words and parses back', () => {
    expect(ruleFmt('inputCutWd', 2)).toBe('Wednesday')
    expect(ruleFmt('sansCutWd', 0)).toBe('Monday')
    expect(ruleFmt('inputCutWeeks', 1)).toBe('1 week'); expect(ruleFmt('sansCutWeeks', 2)).toBe('2 weeks')
    expect(ruleFmt('inputCutMode', 0)).toBe('a number of days'); expect(ruleFmt('sansCutMode', 1)).toBe('a weekday')
    expect(ruleFmt('sansLead', 14)).toBe('14 days')
    expect(ruleParse('inputCutWd', '4')).toBe(4); expect(ruleParse('inputCutWeeks', '3')).toBe(3)
    expect(ruleParse('sansCutMode', '1')).toBe(1); expect(ruleParse('sansLead', '10 days')).toBe(10)
    expect(ruleParse('inputCutWd', 'soon')).toBeNull()
  })

  it('survive a save and a load; a stored value out of range is ignored', () => {
    const mem = new Map<string, string>()
    storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { mem.set(k, v) } } as any
    VCONF.inputCutMode = 1; VCONF.inputCutWd = 4; VCONF.inputCutWeeks = 3; VCONF.sansCutMode = 0; VCONF.sansLead = 10
    rulesSave()
    expect(store.get('rules', null).v).toEqual({ inputCutMode: 1, inputCutWd: 4, inputCutWeeks: 3, sansCutMode: 0, sansLead: 10 })
    rulesResetMem()                                      // the values in memory only — what a reload starts from
    expect(VCONF.inputCutMode).toBe(0)
    rulesLoad()
    expect([VCONF.inputCutMode, VCONF.inputCutWd, VCONF.inputCutWeeks, VCONF.sansCutMode, VCONF.sansLead]).toEqual([1, 4, 3, 0, 10])
    /* hand-edited storage: a weekday of 9, a mode of 5, weeks as text */
    rulesResetMem()
    store.set('rules', { v: { inputCutWd: 9, inputCutMode: 5, inputCutWeeks: '3', sansCutWeeks: 0 }, s: {} })
    rulesLoad()
    expect([VCONF.inputCutWd, VCONF.inputCutMode, VCONF.inputCutWeeks, VCONF.sansCutWeeks]).toEqual([2, 0, 2, 2])
  })
})

describe('the rule in words, as each calendar states it', () => {
  it('follows the set in force — it changes when the setting changes (D628)', () => {
    expect(cutRuleText('inputs')).toBe('14 days before the week starts')
    expect(cutRuleText('sans')).toBe('the Wednesday two weeks before')
    VCONF.inputLead = 1
    expect(cutRuleText('inputs')).toBe('1 day before the week starts')
    VCONF.inputLead = 0
    expect(cutRuleText('inputs')).toBe('the Monday the week starts')
    VCONF.inputCutMode = 1; VCONF.inputCutWd = 4; VCONF.inputCutWeeks = 1
    expect(cutRuleText('inputs')).toBe('the Friday of the week before')
    VCONF.sansCutWeeks = 3; VCONF.sansCutWd = 0
    expect(cutRuleText('sans')).toBe('the Monday three weeks before')
    VCONF.sansCutMode = 0; VCONF.sansLead = 7
    expect(cutRuleText('sans')).toBe('7 days before the week starts')
  })
})
