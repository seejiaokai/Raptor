/* The INDICATED brief time (owner, 6 Aug 26). A scheduler types a B per
   formation and every brief-driven rule follows it; VCONF.briefLead is only
   the default the board suggests, and a blank line is still checked against
   that suggestion. Crew rest anchors on the earlier of the in-time and the
   brief, for everyone. A `late show` remark does not move that anchor and
   does not excuse the breach — it is still a red warning, counted — it
   changes the RING: dashed while the crew still clears rest by the latest
   show (VCONF.showLead before T/O), solid once they cannot make the jet.

   Snapshot/restore pattern lifted from engine/insights.test.ts so mutating
   DAYS here cannot leak into another test file. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { PEOPLE } from './people'
import { collectEvents, lateShowOf } from './events'
import { validate, WARN } from './validate'
import { VCONF } from './rules'
import { parseHM } from './time'
import { isStandalone, makeStandalone } from './waves'

const CREW = 'waldo'      // idle across the seed week, so planting him moves nothing else
const DSNAP = JSON.stringify(DAYS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
})

/* the first ordinary (non-standalone) formation of a given day */
const firstForm = (di: number) => {
  const w = (DAYS[di].waves || []).find((x: any) => !isStandalone(x) && (x.formations || []).length)
  return w ? w.formations[0] : null
}
const legsOf = (di: number, id: string) => collectEvents()[di].fly.filter((e: any) => e.id === id)

describe('the brief time a scheduler indicates', () => {
  it('a typed B becomes the leg brief, in place of the suggested time', () => {
    const f: any = firstForm(0)!
    const crew = f.aircraft[0].p
    expect(legsOf(0, crew)[0].brief, 'blank B briefs off the default')
      .toBe(parseHM(f.to)! - VCONF.briefLead)
    f.br = '06:05'
    expect(legsOf(0, crew)[0].brief, 'the typed B wins').toBe(parseHM('06:05'))
  })

  it('a blank B still briefs — the default is the suggestion, not an opt-out', () => {
    const f: any = firstForm(0)!
    const crew = f.aircraft[0].p
    f.br = ''
    expect(legsOf(0, crew)[0].brief).toBe(parseHM(f.to)! - VCONF.briefLead)
    f.br = '  '
    expect(legsOf(0, crew)[0].brief, 'whitespace is not a time either').toBe(parseHM(f.to)! - VCONF.briefLead)
  })

  /* A shift is not a sortie: it briefs nothing, and every consumer gates on
     shift before it reads a brief, so a value typed on one must stay inert.
     Standalone waves are built at runtime by makeStandalone rather than
     carried in the seed, so the test has to make one. */
  it('a typed B on a standalone wave is ignored', () => {
    const w: any = makeStandalone('sc')!
    w.formations[0].aircraft[0].p = CREW
    w.formations[0].br = '03:00'
    DAYS[0].waves.push(w)
    const legs = legsOf(0, CREW)
    expect(legs.length, 'the planted shift crew produced a leg').toBeGreaterThan(0)
    expect(legs.every((e: any) => e.shift), 'it is a shift, not a sortie').toBe(true)
    expect(legs.every((e: any) => e.brief == null), 'a shift never carries a brief').toBe(true)
    expect(legs.every((e: any) => !e.lateShow), 'nor a late-show exemption').toBe(true)
  })

  it('the brief-clash window moves with the typed B', () => {
    const f: any = firstForm(0)!
    /* an otherwise-idle body, so the only brief window in play is this one —
       a seed crew member often flies twice, and the second leg's own window
       would keep catching the meeting */
    f.aircraft.push({ p: CREW, w: '', area: '', rmks: '', opts: {} })
    const to = parseHM(f.to)!
    /* a meeting two hours before T/O: inside the default 2h20 brief window,
       outside a 30-minute one */
    DAYS[0].ground = DAYS[0].ground || []
    DAYS[0].ground.push({ prog: 'SCRATCH MTG', str: hhmmOf(to - 120), end: hhmmOf(to - 100), who: PEOPLE[CREW].cs })
    validate()
    const briefWarns = () => WARN.byDay[0].warns.filter((w: any) => w.code === 'NO_BRIEF' && (w.who || []).includes(CREW))
    expect(briefWarns().length, 'the default window catches it').toBeGreaterThan(0)
    f.br = hhmmOf(to - 30)
    validate()
    expect(briefWarns().length, 'a 30-minute brief starts after the meeting ends').toBe(0)
  })
})

describe('the late-show remark', () => {
  it('the remark parser reads the squadron phrasings and nothing else', () => {
    expect(lateShowOf('2A: LATE SHOW')).toBe(true)
    expect(lateShowOf('2A: show at brief')).toBe(true)
    expect(lateShowOf('1B: SHOW @ BRIEF')).toBe(true)
    expect(lateShowOf('2A: BFM-5')).toBe(false)
    expect(lateShowOf('')).toBe(false)
    expect(lateShowOf(null)).toBe(false)
    /* the OFT brief-lead remark must not read as a late show */
    expect(lateShowOf('A: IEPE / EP-3N // BRIEF 30 PRIOR')).toBe(false)
  })

  it('the flag rides on the aircraft that carries the remark', () => {
    const f: any = firstForm(0)!
    f.aircraft[0].rmks = '2A: LATE SHOW'
    const crew = f.aircraft[0].p, other = f.aircraft[1] && f.aircraft[1].p
    expect(legsOf(0, crew)[0].lateShow).toBe(true)
    if (other) expect(legsOf(0, other)[0].lateShow, 'the other jet is unaffected').toBe(false)
  })
})

/* The owner's table, run against the real engine. Day 1 is used so there is a
   previous day to have flown; every case plants the same otherwise-idle crew
   on a late-finishing sortie the day before. */
describe('the crew-rest anchor (owner worked examples)', () => {
  /* "the crew left at X" is the end of their working day, which the engine
     takes as landing + the 2h debrief — so the previous sortie lands 2h
     before the time the owner quotes. Today's line then takes an in-time and
     a brief, and we read back whether CREW_REST fired for him. */
  const runCase = (leftAt: string, inTime: string, brief: string, rmks: string, to?: string) => {
    const prev: any = firstForm(0)!
    prev.aircraft.push({ p: CREW, w: '', area: '', rmks: '', opts: {} })
    /* the previous sortie takes off in the evening and lands `leftAt` minus
       the debrief — so a finish after midnight WRAPS into the next day, which
       is what "left at 02:21" means. Deriving T/O from the landing instead
       produced an early-morning sortie that ended before midnight, cleared
       rest before the day even started, and silently raised no warning. */
    prev.to = '20:00'; prev.ld = hhmmOf(parseHM(leftAt)! - VCONF.debrief)
    const today: any = firstForm(1)!
    today.aircraft.push({ p: CREW, w: '', area: '', rmks, opts: {} })
    today.br = brief
    /* T/O matters because the latest show is measured back from it, so the
       cases state it rather than inheriting whatever the seed line flies */
    if (to) { today.to = to; today.ld = hhmmOf(parseHM(to)! + 85) }
    const wave = DAYS[1].waves.find((w: any) => (w.formations || []).includes(today))
    wave.intimes = [`${today.cs} IN TIME ${inTime.replace(':', '')}H`]
    validate()
    const w = WARN.byDay[1].warns.find((x: any) => x.code === 'CREW_REST' && (x.who || []).includes(CREW))
    return {
      flagged: !!w, sev: w && w.sev, msg: (w && w.msg) || '',
      leaveBy: w && w.leaveBy, prevDi: w && w.prevDi,
      /* the ring style is published per person, not on the warning row —
         a chip carries no stroke of its own */
      dashed: !!(WARN.dash && WARN.dash[1] && WARN.dash[1][CREW]),
    }
  }

  /* The owner's table, in his own numbers: in-time 12:00, brief 13:00,
     T/O 15:20 — so rest must be clear by 12:00, and the latest show is 14:20.
     `left` is when the previous day ENDED (landing + the 2h debrief). */
  const TABLE = { inTime: '12:00', brief: '13:00', to: '15:20' }
  const run = (left: string, rmks: string) =>
    runCase(left, TABLE.inTime, TABLE.brief, rmks, TABLE.to)

  it('exactly 12 hours is legal — the boundary is not a breach', () => {
    /* left 00:00 → rest clears 12:00, which is the in-time itself */
    expect(run('00:00', '2A: BFM-5').flagged).toBe(false)
    expect(run('00:00', '2A: LATE SHOW').flagged).toBe(false)
  })

  it('inside the window it is red with a SOLID ring', () => {
    for (const left of ['00:01', '01:30', '02:20']) {
      const r = run(left, '2A: BFM-5')
      expect(r.flagged, `left ${left}`).toBe(true)
      expect(r.sev, `left ${left}`).toBe('hard')
      expect(r.dashed, `left ${left} rings solid`).toBe(false)
    }
  })

  it('a sanctioned late show rings DASHED — still red, still counted', () => {
    for (const left of ['00:01', '01:30', '02:20']) {
      const r = run(left, '2A: LATE SHOW')
      expect(r.flagged, `left ${left}`).toBe(true)
      expect(r.sev, `left ${left} is still a hard warning`).toBe('hard')
      expect(r.dashed, `left ${left} rings dashed`).toBe(true)
      expect(r.msg).toContain('still makes the 14:20 show')
    }
  })

  it('past the latest show it rings SOLID again — he cannot make the flight', () => {
    for (const left of ['02:21', '04:00']) {
      const r = run(left, '2A: LATE SHOW')
      expect(r.flagged, `left ${left}`).toBe(true)
      expect(r.dashed, `left ${left} is past 14:20, so solid`).toBe(false)
      expect(r.msg).toContain('Late show cannot save it')
      /* and without the remark it is solid for the ordinary reason */
      expect(run(left, '2A: BFM-5').dashed).toBe(false)
    }
  })

  it('the dashed/solid boundary is the editable latest-show rule', () => {
    const orig = VCONF.showLead
    try {
      /* 02:21 clears rest at 14:21 — past a 60-minute show (14:20), inside a
         120-minute one (13:20)... which makes it worse, so widen the other
         way: a 30-minute show puts the line at 14:50 and he makes it */
      VCONF.showLead = 60
      expect(run('02:21', '2A: LATE SHOW').dashed).toBe(false)
      VCONF.showLead = 30
      expect(run('02:21', '2A: LATE SHOW').dashed).toBe(true)
    } finally { VCONF.showLead = orig }
  })

  /* the previous-day trace: the warning must say when he had to leave, and
     name the day it is measured from, so the UI needs no second derivation */
  it('names the leave-by time and the previous day', () => {
    const r = run('01:30', '2A: BFM-5')
    /* anchor 12:00 − 12h = 00:00 the previous day */
    expect(r.leaveBy).toBe('00:00')
    expect(r.msg).toContain('so he had to leave by 00:00')
    expect(r.prevDi).toBe(0)
  })

  it("the owner's 23:30 landing example reads as he described it", () => {
    /* lands 23:30 → ends 01:30 with the debrief; next day's in-time 12:00
       means he had to be gone by 00:00 */
    const r = runCase('01:30', '12:00', '13:00', '2A: BFM-5', '15:20')
    expect(r.flagged).toBe(true)
    expect(r.leaveBy).toBe('00:00')
  })
})

function hhmmOf(m: number) {
  const x = ((m % 1440) + 1440) % 1440
  return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0')
}
