/* The INDICATED brief time (owner, 6 Aug 26). A scheduler types a B per
   formation and every brief-driven rule follows it; VCONF.briefLead is only
   the default the board suggests, and a blank line is still checked against
   that suggestion. Crew rest anchors on the earlier of the in-time and the
   brief — unless the aircraft's remarks say the crew shows at the brief, in
   which case the brief alone anchors it. That is an exemption from the
   IN-TIME, never from crew rest itself.

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
      .toBe(parseHM(f.to) - VCONF.briefLead)
    f.br = '06:05'
    expect(legsOf(0, crew)[0].brief, 'the typed B wins').toBe(parseHM('06:05'))
  })

  it('a blank B still briefs — the default is the suggestion, not an opt-out', () => {
    const f: any = firstForm(0)!
    const crew = f.aircraft[0].p
    f.br = ''
    expect(legsOf(0, crew)[0].brief).toBe(parseHM(f.to) - VCONF.briefLead)
    f.br = '  '
    expect(legsOf(0, crew)[0].brief, 'whitespace is not a time either').toBe(parseHM(f.to) - VCONF.briefLead)
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
    const to = parseHM(f.to)
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

describe('late show — an exemption from the in-time, not from crew rest', () => {
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

/* The owner's worked examples, run against the real engine. Day 1 is used so
   there is a previous day to have flown; both cases plant the same crew on a
   late-finishing sortie the day before. */
describe('the crew-rest anchor (owner worked examples)', () => {
  /* "the crew left at X" is the end of their working day, which the engine
     takes as landing + the 2h debrief — so the previous sortie lands 2h
     before the time the owner quotes. Today's line then takes an in-time and
     a brief, and we read back whether CREW_REST fired for him. */
  const runCase = (leftAt: string, inTime: string, brief: string, rmks: string) => {
    const prev: any = firstForm(0)!
    prev.aircraft.push({ p: CREW, w: '', area: '', rmks: '', opts: {} })
    const ldPrev = hhmmOf(parseHM(leftAt) - VCONF.debrief)
    prev.ld = ldPrev; prev.to = hhmmOf(parseHM(ldPrev) - 85)
    const today: any = firstForm(1)!
    today.aircraft.push({ p: CREW, w: '', area: '', rmks, opts: {} })
    today.br = brief
    const wave = DAYS[1].waves.find((w: any) => (w.formations || []).includes(today))
    wave.intimes = [`${today.cs} IN TIME ${inTime.replace(':', '')}H`]
    validate()
    return WARN.byDay[1].warns.some((w: any) => w.code === 'CREW_REST' && (w.who || []).includes(CREW))
  }

  it('in-time 11:00 with a 12:00 brief, off a midnight finish, breaches', () => {
    /* left 00:00 → rest clears 12:00; the in-time is the earlier anchor and
       11:00 is inside it */
    expect(runCase('00:00', '11:00', '12:00', '2A: BFM-5')).toBe(true)
  })

  it('the same line with a late-show remark does not, because the brief is the anchor', () => {
    /* the crew is not required at 11:00, only from the 12:00 brief — which is
       exactly when rest expires, so nothing is breached */
    expect(runCase('00:00', '11:00', '12:00', '2A: LATE SHOW')).toBe(false)
  })

  it('but a 00:30 finish against a 12:00 brief still breaches, remark or not', () => {
    /* rest now clears 12:30 and the BRIEF itself is inside it: the remark
       exempts the crew from the in-time, never from crew rest */
    expect(runCase('00:30', '11:00', '12:00', '2A: LATE SHOW')).toBe(true)
    expect(runCase('00:30', '11:00', '12:00', '2A: BFM-5')).toBe(true)
  })
})

function hhmmOf(m: number) {
  const x = ((m % 1440) + 1440) % 1440
  return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0')
}
