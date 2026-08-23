/* WEEKCTX — synthetic adjacent weeks, via a partial mock of weeks-data.ts's
   weekBundle. Real-data pins live in crossweek.test.ts; this file hand-builds
   previous (and, for the maxRun boundary, before-previous) weeks so every
   window edge — the hard/tight crew-rest split, the maxRun>7 two-week walk,
   the run-reset-on-absence rule, and the acc/xweek bypass — can be pinned
   directly instead of hunting for real data that happens to land on it.

   CACHE SUBTLETY (weekctx.ts:bundleCache is module-level and never cleared):
   every test below loads a WEEK KEY, never reused by any other test in this
   file, derived from a fixed BASE ten weeks apart per test — so the bundle
   keys each test's `bundle()` calls touch (curWeek, curWeek-1w, curWeek-2w)
   never overlap another test's. Nothing here calls loadWeek/DAYS-swap: CURWEEK
   is set directly (setCurWeek, the same primitive loadWeek itself uses) and
   the loaded week's own Monday (DAYS[0], the real seed data) is mutated in
   place exactly as audit-c-tail.test.ts and dutyrest.test.ts do, then restored. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { setCurWeek } from './waves'
import { VCONF } from './rules'
import { validate, WARN, REST, chipOf } from './validate'

const { MOCKS, weekBundleMock } = vi.hoisted(() => {
  const MOCKS: Record<string, any> = {}
  const weekBundleMock = vi.fn((v: any) => MOCKS[v])
  return { MOCKS, weekBundleMock }
})
vi.mock('./weeks-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./weeks-data')>()
  return {
    ...actual,
    /* real emptyWeek/shiftWeekKey/edgeDate/weekDateLabels survive untouched
       (spread from importOriginal) — only weekBundle's own two authored-week
       branches are replaced, by a lookup this file controls per test */
    weekBundle: (v: any) => weekBundleMock(v) ?? actual.emptyWeek(v),
  }
})
// eslint-disable-next-line import/first
import { weekDateLabels, shiftWeekKey } from './weeks-data'
// eslint-disable-next-line import/first
import { seedRunIn, prevSundaySeed } from './weekctx'

const BASE = '03/08/2026'   // an arbitrary real Monday, unrelated to the seed weeks
const wkFor = (i: number) => shiftWeekKey(BASE, i * 10)   // 10 weeks apart — no ±1/±2w overlap ever

const DOWS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const blankDay = (dow: string, dt: string): any =>
  ({ dow, dt, wc: '0 X 0 X 0', notes: [], allhands: [], waves: [], sims: { amt: [], oft: [] }, dutywaves: [], ground: [] })
/* a hand-built week bundle: blank days with per-index overrides, same shape
   weekBundle/emptyWeek hand back (days/dates/inputs/seedSans) */
const weekOf = (labels: string[], overrides: Record<number, any> = {}) => ({
  days: DOWS.map((dow, i) => ({ ...blankDay(dow, labels[i]), ...(overrides[i] || {}) })),
  dates: labels.slice(),
  inputs: [],
  seedSans: false,
})
const dutyRow = (id: string, str: string, end: string) =>
  ({ dutywaves: [{ label: 'Duty', rows: [{ role: 'SDO', id, str, end }] }] })
const groundRow = (id: string) =>
  ({ ground: [{ prog: 'DUTY SPELL', str: '0900', end: '1000', who: id }] })

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
})
afterEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  setCurWeek('13/07/2026')
  validate()
})

/* puts `id` on the loaded week's Monday (DAYS[0]) WAVE 1 / VL formation, RCP
   seat, with a T/O the report-time math below is built against. Mirrors
   dutyrest.test.ts's fixture mechanics (mutate the seat, not the whole day). */
function flyMonday(id: string, to: string, br = '') {
  const f = (DAYS[0] as any).waves[0].formations[0]
  f.to = to; f.ld = '07:25'; f.br = br
  f.aircraft[0].w = id
}

describe('Plan D — a hard crew-rest breach seeded from the previous week\'s Sunday', () => {
  it('a Sunday duty till 23:00 + a ~06:00 Monday report breaches, with no trace pollution', () => {
    const WK = wkFor(0)
    const prevKey = shiftWeekKey(WK, -1)
    MOCKS[prevKey] = weekOf(weekDateLabels(prevKey), { 6: dutyRow('waldo', '1900', '2300') })
    setCurWeek(WK)
    /* T/O 06:00, blank brief → briefOf = 06:00 − 2h20 = 03:40 (no intime is
       published for this seat, so that IS the instructed report); duty ends
       23:00 → clear at 23:00 + 12h − 24h = 11:00, well after 03:40 → hard */
    flyMonday('waldo', '06:00')
    const r = validate()
    const cr = r.all.find((w: any) => w.code === 'CREW_REST' && (w.who || []).includes('waldo') && w.di === 0)
    expect(cr, 'hard crew-rest breach seeded from Sunday').toBeTruthy()
    expect(cr.sev).toBe('hard')
    expect(cr.prevDi).toBeNull()               // the trace belongs to a day this WARN cannot address
    expect(cr.msg).toContain('Sunday')
    expect(cr.msg).toContain('ended 23:00')
    expect(chipOf(0, 'waldo')).toBe('CR')
    expect(REST[0].waldo).toBe(11 * 60)         // 23:00 + 12h − 24h = 11:00
    /* markTrace no-ops on a null previous-day index — no numeric day key in
       WARN.trace may carry this breach */
    expect(Object.values(WARN.trace || {}).every((d: any) => !d || !d.waldo)).toBe(true)
  })
})

describe('Plan E — the same shape, a lighter gap: tight-turning advisory, not a hard breach', () => {
  it('a Sunday duty till 15:20 clears the hard line but sits inside the nominal window', () => {
    const WK = wkFor(1)
    const prevKey = shiftWeekKey(WK, -1)
    MOCKS[prevKey] = weekOf(weekDateLabels(prevKey), { 6: dutyRow('waldo', '0800', '1520') })
    setCurWeek(WK)
    /* T/O 06:00 → nominal (T/O − 3h) = 03:00, instructed (blank-brief T/O − 2h20) = 03:40.
       Duty ends 15:20 → clear at 15:20 + 12h − 24h = 03:20 — inside (03:00, 03:40], so
       the ACTUAL report (03:40) is clear (no hard) but the NOMINAL one (03:00) is not (TT). */
    flyMonday('waldo', '06:00')
    const r = validate()
    const hard = r.all.find((w: any) => w.code === 'CREW_REST' && (w.who || []).includes('waldo') && w.di === 0)
    expect(hard, 'no hard breach — the actual report is clear').toBeFalsy()
    const tt = r.all.find((w: any) => w.code === 'CREW_TIGHT' && (w.who || []).includes('waldo') && w.di === 0)
    expect(tt, 'tight-turning advisory fires instead').toBeTruthy()
    expect(tt.sev).toBe('adv')
    expect(tt.msg).toContain('Sunday')
    expect(chipOf(0, 'waldo')).toBe('TT')
  })
})

describe('Plan F — the maxRun>7 walk into a SECOND prior week', () => {
  const origMax = VCONF.maxRun
  beforeEach(() => { VCONF.maxRun = 8 })
  afterEach(() => { VCONF.maxRun = origMax })

  it('7 days in the immediate prior week + the week-before\'s Sunday seeds a count of 8, and DAYS_RUN fires n=9', () => {
    const WK = wkFor(2)
    const prevKey = shiftWeekKey(WK, -1)
    const prevPrevKey = shiftWeekKey(WK, -2)
    const row = groundRow('waldo')
    MOCKS[prevKey] = weekOf(weekDateLabels(prevKey), { 0: row, 1: row, 2: row, 3: row, 4: row, 5: row, 6: row })
    MOCKS[prevPrevKey] = weekOf(weekDateLabels(prevPrevKey), { 6: row })   // k=8
    setCurWeek(WK)
    expect(seedRunIn(WK, VCONF.maxRun)).toEqual({ waldo: 8 })
    // the second bundle really was asked for, not just assumed present
    expect(weekBundleMock.mock.calls.some((c: any) => c[0] === prevPrevKey)).toBe(true)
    // waldo on the loaded Monday too (a ground row — no flying, so this test
    // stays clear of any crew-rest interaction from the mocked Sunday's time)
    ;(DAYS[0] as any).ground.push({ prog: 'DUTY SPELL', str: '0900', end: '1000', who: 'waldo' })
    const r = validate()
    const hit = r.all.find((w: any) => w.code === 'DAYS_RUN' && (w.who || []).includes('waldo') && w.di === 0)
    expect(hit, 'DAYS_RUN fires on the 9th consecutive day').toBeTruthy()
    expect(hit.msg).toContain('9 days in a row')
  })

  it('a BLANK week-before Sunday caps the count at 7 — the second bundle\'s DATA matters, not just the call', () => {
    const WK = wkFor(3)
    const prevKey = shiftWeekKey(WK, -1)
    const row = groundRow('waldo')
    MOCKS[prevKey] = weekOf(weekDateLabels(prevKey), { 0: row, 1: row, 2: row, 3: row, 4: row, 5: row, 6: row })
    // prevPrevKey deliberately left unmocked → falls back to a blank emptyWeek
    setCurWeek(WK)
    expect(seedRunIn(WK, VCONF.maxRun)).toEqual({ waldo: 7 })
  })
})

describe('Plan (run-reset) — presence on Thu/Fri without Sunday seeds nothing', () => {
  it('only ids present on the nearest day (prior Sunday) are ever tracked at all', () => {
    const WK = wkFor(4)
    const prevKey = shiftWeekKey(WK, -1)
    const row = groundRow('waldo')
    MOCKS[prevKey] = weekOf(weekDateLabels(prevKey), { 3: row, 4: row })   // Thu, Fri — Sunday (6) stays blank
    setCurWeek(WK)
    expect(seedRunIn(WK, VCONF.maxRun)).toEqual({})
  })
})

describe('Plan J (would-land input) — an activity input on the previous Sunday counts as work regardless of acc', () => {
  it('acc:\'g\' (as if the loaded week had already landed it) does not exclude the seed read', () => {
    const WK = wkFor(5)
    const prevKey = shiftWeekKey(WK, -1)
    const labels = weekDateLabels(prevKey)
    setCurWeek(WK)
    // no MOCKS entry at all — an unauthored previous week, worked ONLY via the global INPUTS array
    INPUTS.push({ person: 'waldo', date: labels[6], allday: true, type: 'Meeting', acc: 'g', remarks: '', mod: '' })
    expect(seedRunIn(WK, VCONF.maxRun)).toEqual({ waldo: 1 })
  })
})

describe('Plan J (spanning-input rest) — a typed restsInput row on the previous Sunday seeds REST[0]', () => {
  it('sets the clear-minute whether or not acc is set — the xweek bypass in inpShow', () => {
    const WK = wkFor(6)
    const prevKey = shiftWeekKey(WK, -1)
    const labels = weekDateLabels(prevKey)
    setCurWeek(WK)
    INPUTS.push({ person: 'waldo', date: labels[6], allday: false, s: 19 * 60, e: 22 * 60, type: 'Meeting', remarks: '', mod: '' })
    INPUTS.push({ person: 'chaps', date: labels[6], allday: false, s: 19 * 60, e: 22 * 60, type: 'Meeting', acc: 'g', remarks: '', mod: '' })
    validate()
    const expected = 22 * 60 + VCONF.crewRest - 1440
    expect(REST[0].waldo).toBe(expected)
    expect(REST[0].chaps, 'acc set (as if landed by the loaded week) still counts').toBe(expected)
  })
})

describe('Empty/unauthored previous week', () => {
  it('seedRunIn returns {} and prevSundaySeed returns an empty, di:null seed', () => {
    const WK = wkFor(7)
    setCurWeek(WK)
    expect(seedRunIn(WK, VCONF.maxRun)).toEqual({})
    expect(prevSundaySeed(WK)).toEqual({ events: [], input: [], dow: 'Sunday', di: null })
  })
})
