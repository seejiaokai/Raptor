/* WHERE A DAY WITH NOTHING ENTERED STARTS (owner D1786, 8 Nov 26 — "All as recommended", the pictures round's question 7,
   option A): a flyer's line with no in-time or rally entered starts his day at take-off less the default rally
   (VCONF.reportLead) for his long day and his Insights hours, as it already does for his OIL — one start, not the step.
   Carries D1032 and D592 (1): one clock for OIL, the work-hours bar and the long-day note. Before this, events.ts gave
   such a sortie's event the STEP as its report, so validate.ts workSpan's own take-off-less-rally fallback never fired
   and Insights counted his Friday from 11:00 where the R box suggested 09:00 (notes-sched.md Q3 §(b), §(f)).
   The robustness doctrine's five families are walked below: an unreadable or wordy clock (not following the format),
   nothing entered and no take-off (missing input), a rally after the take-off and a Logic value below the step (user
   errors), the Logic setting changed from its own page (an edit from another page), and the copies that must agree —
   the work span against OIL's window, the long-day note against Insights, `day.fly` and the shift kinds left alone. */
import { beforeEach, describe, expect, it } from 'vitest'
import { buildDay } from './events'
import { workSpan, validate, WARN } from './validate'
import { fltOilWin } from './oil'
import { computeInsights } from './insights'
import { VCONF } from './rules'
import { DAYS } from './data'
import { INPUTS } from './inputs'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
})

const line = (o: any = {}) => ({ cs: 'VL', msn: 'BFM', to: '12:00', ld: '13:00', br: '', rl: '', aircraft: [{ p: 'ignite', w: 'bane', rmks: '', opts: {} }], ...o })
const flyWave = (intimes: string[], formations: any[]) => ({ label: 'FIRST WAVE', intimes, formations })
const dayOf = (waves: any[]) => ({ dow: 'Fri', dt: 'Jul 17', waves, sims: { amt: [], oft: [] }, dutywaves: [], ground: [], allhands: [] })
const built = (waves: any[]) => buildDay(dayOf(waves), 4, 'Jul 18', 'Jul 16')
const evsOf = (b: any, id = 'ignite') => b.events.filter((e: any) => e.id === id)
const span = (waves: any[], id = 'ignite') => workSpan(evsOf(built(waves), id))

describe('D1786 a sortie with nothing entered starts the work span at take-off less the default rally', () => {
  it('nothing entered: the long day and hours start at T/O − reportLead (09:00), not the step (11:00)', () => {
    const b = built([flyWave([], [line()])])
    expect(evsOf(b)[0].report).toBe(null)                          // the event says nothing was entered
    const w = workSpan(evsOf(b))!
    expect(w.s).toBe(720 - VCONF.reportLead)
    expect(w.s).not.toBe(720 - VCONF.step)
    expect(w.e).toBe(780 + VCONF.debrief)
    expect(w.span).toBe(780 + VCONF.debrief - (720 - VCONF.reportLead))
  })

  it('typing the suggested rally into the R box changes nothing — the faint 09:00 is already where his day starts', () => {
    const blank = span([flyWave([], [line()])])
    const typed = span([flyWave([], [line({ rl: '09:00' })])])
    expect([typed!.s, typed!.e, typed!.span]).toEqual([blank!.s, blank!.e, blank!.span])
  })

  it('an entered in-time or rally still starts the day where it says — later than the default included (never a min())', () => {
    expect(span([flyWave(['10:30 IN TIME'], [line()])])!.s).toBe(630)   // later than 09:00: his day starts 10:30
    expect(span([flyWave(['07:30 IN TIME'], [line()])])!.s).toBe(450)   // earlier: 07:30
    expect(span([flyWave([], [line({ rl: '11:15' })])])!.s).toBe(675)   // a rally box later than the step still counts
    expect(span([flyWave(['08:00 VL RALLY'], [line()])])!.s).toBe(480)  // a typed RALLY line (D1034)
  })

  it('a clock the app cannot read, or words with no clock, count as nothing entered — as for OIL', () => {
    for (const t of ['8h00 IN TIME', 'RALLY TBD', 'IN TIME + WX/NOTAMS'])
      expect(span([flyWave([t], [line()])])!.s, t).toBe(720 - VCONF.reportLead)
  })

  it('the work span starts and ends exactly where OIL\'s window does, in every case', () => {
    const cases: Array<[string[], any]> = [
      [[], line()], [['07:30 IN TIME'], line()], [[], line({ rl: '09:15' })], [['8h00 IN TIME'], line()],
      [[], line({ to: '01:30', ld: '03:00' })],                         // the default rally falls the evening before
      [['23:00 IN TIME'], line({ to: '02:00', ld: '03:30' })],          // an entered clock the evening before (D503)
      [[], line({ to: '12:00', ld: '12:00' })],                          // the same take-off and landing (D49)
    ]
    for (const [it, f] of cases) {
      const wv = flyWave(it, [f])
      const w = span([wv])!, oil = fltOilWin(wv, f, VCONF.reportLead, VCONF.debrief)!
      expect([w.s, w.e], JSON.stringify([it, f.to, f.rl])).toEqual(oil)
    }
  })

  it('the Logic page\'s default rally moves the start at once — even below the step, as OIL counts it', () => {
    const was = VCONF.reportLead
    try {
      VCONF.reportLead = 120; expect(span([flyWave([], [line()])])!.s).toBe(600)
      VCONF.reportLead = 30;  expect(span([flyWave([], [line()])])!.s).toBe(690)
      VCONF.reportLead = 0;   expect(span([flyWave([], [line()])])!.s).toBe(720)
    } finally { VCONF.reportLead = was }
  })

  it('a line with no take-off yet still has no span (W4/RF1 unchanged)', () => {
    expect(span([flyWave([], [line({ to: '', ld: '' })])])).toBe(null)
    expect(span([flyWave(['08:00 IN TIME'], [line({ to: '', ld: '' })])])).toBe(null)
  })

  it('only the event changes: day.fly keeps report-or-step (the SANS window) and intime null (crew rest)', () => {
    const b = built([flyWave([], [line()])])
    const fl = b.fly.find((e: any) => e.id === 'ignite')
    expect(fl.report).toBe(720 - VCONF.step)
    expect(fl.intime).toBe(null)
    expect(evsOf(b)[0].s).toBe(720 - VCONF.step)                      // the occupied window still opens at the step
  })

  it('a shift (SC MAIN) keeps its own start: blank B is the shift start, a typed B the earlier', () => {
    const sc = (br: string) => ({ label: 'SC', kind: 'sc', standalone: true, intimes: [], formations: [line({ cs: 'SC', msn: 'AM', to: '07:00', ld: '13:00', br })] })
    const blank = evsOf(built([sc('')]))[0]
    expect(blank.kind).toBe('shift'); expect(blank.report).toBe(420)
    expect(workSpan([blank])!.s).toBe(420)
    expect(workSpan(evsOf(built([sc('06:15')])))!.s).toBe(375)
  })
})

describe('D1786 on the week: the long-day note and Insights move together', () => {
  /* the notes' worked example (notes-sched.md Q3 §(f)): Friday 17 Jul, a new line VL, take-off 12:00, landing 13:00,
     Saint (salsa) in the front seat, Echo (freak) in the back, nothing else typed */
  const addVL = (f: any = {}) => DAYS[4].waves.push(flyWave([], [line({ aircraft: [{ p: 'salsa', w: 'freak', rmks: '', opts: {} }], ...f })]))
  const hrs = (id: string) => (computeInsights().hours.find((h: any) => h.id === id) || { mins: 0 }).mins

  it('Insights counts Saint 18h30 and Echo 27h25 — the drawn A — and typing the suggested 09:00 changes nothing', () => {
    expect(DAYS[4].waves.length).toBe(0)                               // the seed Friday has no flying
    const s0 = hrs('salsa'), e0 = hrs('freak')
    addVL()
    expect(hrs('salsa') - s0).toBe(13 * 60 + VCONF.debrief - (12 * 60 - VCONF.reportLead))   // 09:00 → 15:00, 6h
    expect(hrs('salsa')).toBe(18 * 60 + 30)
    expect(hrs('freak')).toBe(27 * 60 + 25)
    DAYS[4].waves[0].formations[0].rl = '09:00'
    expect(hrs('salsa')).toBe(18 * 60 + 30)
    expect(hrs('freak')).toBe(27 * 60 + 25)
  })

  it('a day that is long only from the default rally now gets its note, worded from that start', () => {
    addVL({ to: '08:00', ld: '15:30' })                                // 05:00 → 17:30 = 12h30; from the step it was 10h30
    validate()
    const n = (WARN.byDay[4]?.warns || []).find((w: any) => w.code === 'LONGDAY' && w.who.includes('salsa'))
    expect(n, 'Saint gets the long-day note').toBeTruthy()
    expect(n.msg).toContain('12h30')
    expect(n.msg).toContain('05:00 → 17:30 (last landing 15:30 + 2h debrief assumed)')
    expect(WARN.chip[4]?.salsa).toContain('LD')
  })

  it('the same day with an in-time typed after the default keeps its shorter day and no note', () => {
    addVL({ to: '08:00', ld: '15:30', rl: '07:00' })                   // 07:00 → 17:30 = 10h30
    validate()
    expect((WARN.byDay[4]?.warns || []).some((w: any) => w.code === 'LONGDAY' && w.who.includes('salsa'))).toBe(false)
  })
})
