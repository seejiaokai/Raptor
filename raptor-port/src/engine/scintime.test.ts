/* SC's B box is the crew's IN-TIME (owner, 24 Aug 26 — "only if the brief time
   is filled in then u will use that as the in time for the warnings and
   advisories. But we will hardly have a brief time"). A standalone briefs
   nothing, so the value typed into an SC line's B is not a brief at all — it is
   the report time, usually earlier than the shift start, and it moves the crew-
   rest anchor when (and only when) it is filled in.

   What this pins, off the seed's own late duty (stuff stands OPS-O until 21:30
   on the Monday, so crew rest clears at 09:30):
     - a blank B leaves SC anchored on its 07:00 shift start, exactly as before;
     - a typed early B (05:00) pulls the report — and the breach — onto it;
     - a typed B LATER than the shift start is ignored, because the watch still
       begins at 07:00 whatever the crew wrote.
   The engine reads f.br only for w.kind==='sc'; AVALON/BB never reach the fly
   collector (saExempt), and an ordinary flying line's B is a brief as always —
   both covered by brieftime.test.ts, so this file stays purely about SC. */
import { afterEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { validate, WARN, workSpan, dayEvents } from './validate'
import { makeStandalone } from './waves'

const TUE = 1

/* append an SC wave to the Tuesday and seat stuff on its AM MAIN line. stuff is
   free of Tuesday's flying seed, so nothing else of his competes for the anchor;
   his 12:00 OPS-O duty that day is later than any in-time under test. */
const addSC = (br?: string) => {
  const w: any = makeStandalone('sc')
  if (br != null) w.formations[0].br = br
  w.formations[0].aircraft[0].p = 'stuff'
  ;(DAYS[TUE] as any).waves.push(w)
  validate()
}

afterEach(() => { (DAYS[TUE] as any).waves.pop(); validate() })

const scBreach = () => {
  const g: any = WARN.byDay.find((x: any) => x.di === TUE)
  return ((g && g.warns) || []).find((w: any) =>
    w.code === 'CREW_REST' && (w.who || []).includes('stuff'))
}

describe('an SC line reads its B box as the in-time', () => {
  it('a blank B keeps the anchor on the 07:00 shift start (9h30 rest, unchanged)', () => {
    addSC()
    const cr = scBreach()
    expect(cr, 'the shift start alone still breaches after a 21:30 duty').toBeTruthy()
    expect(cr.sev).toBe('hard')
    expect(cr.msg).toContain('SC AM starts 07:00')
    expect(cr.msg).toContain('9h30 rest')
  })

  it('a typed early B (05:00) pulls the report onto it (7h30 rest)', () => {
    addSC('05:00')
    const cr = scBreach()
    expect(cr, 'the earlier in-time deepens the breach').toBeTruthy()
    expect(cr.sev).toBe('hard')
    expect(cr.msg).toContain('SC AM starts 05:00')
    expect(cr.msg).toContain('7h30 rest')
  })

  it('a typed B later than the shift start is ignored — the watch still begins 07:00', () => {
    addSC('08:00')
    const cr = scBreach()
    expect(cr, 'a later B cannot push the report past the shift start').toBeTruthy()
    expect(cr.msg).toContain('SC AM starts 07:00')
    expect(cr.msg).not.toContain('starts 08:00')
  })
})

/* THE B EXTENDS THE DAY (owner, 24 Aug 26 — "if B is filled earlier than TO
   for main only, include the long day duty hours span calculation"). The span
   is workSpan(), shared by the long-day note and the week's duty-hour totals,
   so one assert covers both surfaces. stuff also stands OPS-O 12:00–17:00 this
   Tuesday, so his day ends at 17:00 whatever the B says. */
describe('a typed early B extends the long-day span', () => {
  it('B 05:00 starts the day at 05:00; blank B keeps the 07:00 shift start', () => {
    addSC('05:00')
    expect(workSpan(dayEvents(TUE, 'stuff'))!.s).toBe(300)
    ;(DAYS[TUE] as any).waves.pop()
    addSC()
    expect(workSpan(dayEvents(TUE, 'stuff'))!.s).toBe(420)
  })

  it('a B that tips the span past 12h raises the long-day note off the B itself', () => {
    addSC('04:30')                              // 04:30 → 17:00 is 12h30
    const g: any = WARN.byDay.find((x: any) => x.di === TUE)
    const ld = ((g && g.warns) || []).find((w: any) =>
      w.code === 'LONGDAY' && (w.who || []).includes('stuff'))
    expect(ld, 'the in-time counts toward duty hours now').toBeTruthy()
    expect(ld.msg).toContain('12h30')
    expect(ld.msg).toContain('04:30')
  })

  it('MAIN only — the same B on a SPARE row moves nothing', () => {
    const w: any = makeStandalone('sc')
    w.formations[0].br = '04:30'
    w.formations[0].aircraft[2].p = 'stuff'     // rows 2–3 are SPARE
    ;(DAYS[TUE] as any).waves.push(w)
    validate()
    const evs: any = dayEvents(TUE, 'stuff')
    expect(evs.some((e: any) => e.kind === 'shift'), 'a spare reports nowhere').toBe(false)
    expect(workSpan(evs)!.s, 'his day starts at his 12:00 duty, not the B').toBe(720)
  })
})

/* THE IN-TIME WINDOW ADVISORY (owner, 24 Aug 26 — "have a no brief advisory as
   well if anything cuts or ends between B and TO time for SC main"). From the
   typed B to the shift start the man is already on duty; a commitment that cuts
   into or ends inside that window advises in amber — it is not the hard clash
   the shift window itself raises, but it is not nothing either. split has a
   clean seed Tuesday, so every warning below is the test's own doing. */
describe('anything cutting the B→TO window advises', () => {
  const ILEN = INPUTS.length
  const OLEN = (DAYS[TUE] as any).sims.oft.length
  const addSCFor = (id: string, br?: string, spare = false) => {
    const w: any = makeStandalone('sc')
    if (br != null) w.formations[0].br = br
    w.formations[0].aircraft[spare ? 2 : 0].p = id
    ;(DAYS[TUE] as any).waves.push(w)
    validate()
  }
  afterEach(() => { INPUTS.length = ILEN; (DAYS[TUE] as any).sims.oft.length = OLEN })
  const advs = (id: string) => validate().all.filter((x: any) =>
    x.di === TUE && x.code === 'SC_INTIME' && (x.who || []).includes(id))

  it('a timed input inside the window advises; one ending exactly at the B does not', () => {
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: false, s: 330, e: 390, type: 'Meeting', remarks: '', mod: '' })
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: false, s: 240, e: 300, type: 'Appointment', remarks: '', mod: '' })
    addSCFor('split', '05:00')
    const a = advs('split')
    expect(a.length, 'the 05:30 meeting cuts the window, the 04:00–05:00 appointment ends at the B').toBe(1)
    expect(a[0].sev).toBe('adv')
    expect(a[0].msg).toContain('Meeting')
    expect(a[0].msg).toContain('05:30–06:30')
  })

  it('a sim seat inside the window advises; one crossing into the shift is the hard clash instead', () => {
    ;(DAYS[TUE] as any).sims.oft.push({ label: 'X', str: '0530', end: '0630', p: 'split' })
    addSCFor('split', '05:00')
    expect(advs('split').length, 'the box sits wholly inside B→TO').toBe(1)
    ;(DAYS[TUE] as any).sims.oft.pop()
    ;(DAYS[TUE] as any).sims.oft.push({ label: 'X', str: '0630', end: '0730', p: 'split' })
    const all = validate().all.filter((x: any) => x.di === TUE && (x.who || []).includes('split'))
    expect(all.some((x: any) => x.code === 'DOUBLE_BOOK'), 'crossing 07:00 is the clash rule’s business').toBe(true)
    expect(all.some((x: any) => x.code === 'SC_INTIME'), 'and not double-reported as the advisory').toBe(false)
  })

  it('no B, or a SPARE row, and the window does not exist', () => {
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: false, s: 330, e: 390, type: 'Meeting', remarks: '', mod: '' })
    addSCFor('split')
    expect(advs('split'), 'a blank B opens no window').toEqual([])
    ;(DAYS[TUE] as any).waves.pop()
    addSCFor('split', '05:00', true)
    expect(advs('split'), 'a spare reports nowhere').toEqual([])
  })
})
