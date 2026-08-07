/* A turn chips, it does not ring (owner, 7 Aug 26).

   Three rules put a turn on a puck: the same-day tight turn (TURN → TT), the
   double turn (DT_SUM → DT) and the overnight tight turn (CREW_TIGHT → TT).
   The first two chipped bare; the third also rang amber, so the same TT glyph
   meant "ringed problem" on one puck and "unringed note" on another, with
   nothing on screen to tell a reader which. The owner's call is that none of
   them need a ring — a turn is a note, not something to go and fix.

   CREW_TIGHT fires NOWHERE on the seed week, which is why this needs its own
   file: every seed-driven assertion passes identically with the ring left in,
   so it would pin nothing. The case below builds a real overnight tight turn
   and reads the published marks back off the engine.

   Snapshot/restore of DAYS follows engine/brieftime.test.ts, so mutating the
   week here cannot leak into another test file. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { validate, WARN } from './validate'
import { VCONF } from './rules'
import { isStandalone } from './waves'
import { hm24 } from './time'

const CREW = 'waldo'      // idle across the seed week, so planting him moves nothing else
const DSNAP = JSON.stringify(DAYS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
})

const firstForm = (di: number) => {
  const w = (DAYS[di].waves || []).find((x: any) => !isStandalone(x) && (x.formations || []).length)
  return w ? w.formations[0] : null
}

/* An overnight TIGHT turn is a narrow target: crew rest has to expire after
   the nominal report but at or before the time he was actually told to show,
   or the engine raises the hard breach instead. That window is exactly
   reportLead − briefLead wide, so the times are derived from VCONF rather
   than written down — a rule edit moves the case with it instead of silently
   turning it into a breach (or into nothing at all). */
const plantTightTurn = () => {
  const to = 12 * 60                                    // today's T/O, noon
  const nominal = to - VCONF.reportLead                 // when the engine says he reports
  const instructed = to - VCONF.briefLead               // when he is actually told to
  const earliest = Math.floor((nominal + instructed) / 2)   // rest clears between the two
  /* earliest = prevEnd + crewRest − 1440, so run it backwards to place
     yesterday's finish; the debrief is what turns that finish into a landing */
  const prevEnd = earliest + 1440 - VCONF.crewRest
  const prevLand = prevEnd - VCONF.debrief

  const prev: any = firstForm(0)!
  prev.aircraft.push({ p: '', w: CREW, area: '', rmks: '', opts: {} })
  prev.ld = hm24(prevLand); prev.to = hm24(prevLand - VCONF.dur)

  const today: any = firstForm(1)!
  today.aircraft.push({ p: '', w: CREW, area: '', rmks: '', opts: {} })
  today.to = hm24(to); today.ld = hm24(to + VCONF.dur)
  /* the seed wave publishes an early in-time, and crew rest anchors on the
     EARLIER of that and the brief — leave it in and the case is a breach, not
     a tight turn. Clearing it leaves the brief as the instructed time. */
  const wave = DAYS[1].waves.find((w: any) => (w.formations || []).includes(today))
  wave.intimes = []
  return { nominal, instructed, earliest }
}

describe('an overnight tight turn', () => {
  it('is raised as an advisory, and it really is tight rather than a breach', () => {
    plantTightTurn()
    validate()
    const mine = WARN.byDay[1].warns.filter((w: any) => (w.who || []).includes(CREW))
    const tight = mine.find((w: any) => w.code === 'CREW_TIGHT')
    expect(tight, 'the case must actually produce CREW_TIGHT — ' + mine.map((w: any) => w.code).join(',')).toBeTruthy()
    expect(tight.sev).toBe('adv')
    expect(mine.find((w: any) => w.code === 'CREW_REST'), 'a breach would be testing the wrong branch').toBeFalsy()
  })

  it('chips TT and leaves the puck unringed', () => {
    plantTightTurn()
    validate()
    expect(WARN.chip[1] && WARN.chip[1][CREW], 'the chip is the whole mark now').toBe('TT')
    expect(WARN.sev[1] && WARN.sev[1][CREW], 'no ring of any severity').toBeUndefined()
  })

  it('a man who also trips a ringing rule keeps that ring', () => {
    /* Dropping the ring must not make the puck quieter than it was for any
       OTHER reason — the tight turn stops contributing a ring, it does not
       suppress one. Waldo is a WSO, so seating him in the front of a second
       jet is an illegal seat: hard rule, hard ring, and the Q chip outranks
       his TT. (A second sortie in the same window would NOT do here — the
       engine reads that as a double turn, not a clash, so it rings nothing
       either and would prove only that two silent rules are silent.) */
    plantTightTurn()
    const today: any = firstForm(1)!
    const other: any = (DAYS[1].waves || []).filter((w: any) => !isStandalone(w))
      .flatMap((w: any) => w.formations || []).find((f: any) => f !== today)
    other.aircraft.push({ p: CREW, w: '', area: '', rmks: '', opts: {} })
    validate()
    expect(WARN.byDay[1].warns.some((w: any) => w.code === 'QUAL' && (w.who || []).includes(CREW))).toBe(true)
    expect(WARN.sev[1][CREW], 'the illegal seat still rings red').toBe('hard')
    expect(WARN.chip[1][CREW], 'and the louder chip still wins').toBe('Q')
  })
})
