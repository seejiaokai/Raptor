/* EVERYTHING THAT ENDS THE DAY BEARS CREW REST (owner, 21 Aug 26, in two
   steps the same day). First his own repro — "he ended at 2130 for ops o
   the day prior but when I changed his in time to 0900 no warning" — put
   duty desk rows into the rest-bearing set beside sorties and SC shifts.
   Then the general ruling: "anything that ends the day prior and affects
   the 12 hour crew rest will be a warning of crew rest" — so sims, ground
   events and programme items joined too, and event kind can never again
   downgrade a short night to the tight-turning advisory.

   What this pins:
     - a duty row ending late yesterday + told to report inside 12h today =
       HARD crew-rest breach, whether the instruction is the published
       in-time or a typed brief (insOf takes the EARLIER of the two);
     - a late GROUND EVENT and a late SIM raise the same hard breach;
     - the REST map (the palette's "he is not clear yet") carries every
       kind of ender, so the picker and the engine cannot disagree;
     - a non-flying commitment ends at its WRITTEN end — no debrief tail;
     - a prior day that IS 12h clear stays silent, whatever its kind. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { validate, WARN, REST, restClear } from './validate'
import { VCONF } from './rules'

/* Mon (di 0): stuff stands Ops-O 14:00–21:30 in the seed. Tue (di 1): plant
   him on the RU line and instruct an 09:00 report — 11h30 rest, 30min short. */
const TUE = 1
const ruOf = () => (DAYS[TUE] as any).waves[1].formations.find((f: any) => f.cs === 'RU')

let undo: Array<() => void> = []
beforeEach(() => { undo.forEach(f => f()); undo = []; validate() })

const plant = (mut: () => void, restore: () => void) => { mut(); undo.push(restore) }

const stuffWarns = () => {
  const g: any = WARN.byDay.find((x: any) => x.di === TUE)
  return ((g && g.warns) || []).filter((w: any) => (w.who || []).includes('stuff'))
}

describe('a duty row bears crew rest', () => {
  it('the seed really has stuff on Ops-O until 21:30 the day before', () => {
    const row = (DAYS[0] as any).dutywaves[1].rows.find((r: any) => r.id === 'stuff')
    expect(row.role).toBe('OPS-O')
    expect(row.end).toBe('2130')
  })

  it('a published in-time of 0900 after a 21:30 duty raises the HARD breach', () => {
    const ru = ruOf()
    const seat = ru.aircraft[1]
    const w2: any = (DAYS[TUE] as any).waves[1]
    const wasIn = w2.intimes.slice(), wasW = seat.w
    plant(() => { seat.w = 'stuff'; w2.intimes = [...wasIn.slice(0, 1), '0900H: RU IN TIME'] },
      () => { seat.w = wasW; w2.intimes = wasIn })
    validate()
    const cr = stuffWarns().find((w: any) => w.code === 'CREW_REST')
    expect(cr, 'hard crew-rest breach raised').toBeTruthy()
    expect(cr.sev).toBe('hard')
    expect(cr.msg).toContain('told to report 09:00')
    /* a duty ends when it ends — no debrief assumption in the tail */
    expect(cr.msg).toContain('ended 21:30')
    expect(cr.msg).not.toContain('debrief assumed')
  })

  it('a typed brief of 09:00 raises the same breach — insOf reads the EARLIER of in-time and brief', () => {
    const ru = ruOf()
    const seat = ru.aircraft[1]
    const wasW = seat.w, wasBr = ru.br
    plant(() => { seat.w = 'stuff'; ru.br = '09:00' }, () => { seat.w = wasW; ru.br = wasBr })
    validate()
    const cr = stuffWarns().find((w: any) => w.code === 'CREW_REST')
    expect(cr, 'breach from the brief alone').toBeTruthy()
    expect(cr.sev).toBe('hard')
  })

  it('the REST map carries the duty-ender, so the palette agrees with the engine', () => {
    validate()
    /* 21:30 + 12h − 24h = 09:30 into Tuesday */
    expect(restClear(TUE, 'stuff')).toBe(21 * 60 + 30 + VCONF.crewRest - 1440)
    expect(REST[TUE].chaps, 'his fellow 21:30 duty-enders read the same').toBe(21 * 60 + 30 + VCONF.crewRest - 1440)
  })

  it('a report clear of the 12h stays silent', () => {
    const ru = ruOf()
    const seat = ru.aircraft[1]
    const w2: any = (DAYS[TUE] as any).waves[1]
    const wasIn = w2.intimes.slice(), wasW = seat.w
    plant(() => { seat.w = 'stuff'; w2.intimes = [...wasIn.slice(0, 1), '1000H: RU IN TIME'] },
      () => { seat.w = wasW; w2.intimes = wasIn })
    validate()
    expect(stuffWarns().find((w: any) => w.code === 'CREW_REST')).toBeFalsy()
  })

  it('a late GROUND EVENT yesterday raises the hard breach too', () => {
    /* waldo is idle across the seed week; give him a Mon evening ground
       event to 22:00 and a Tue 09:00 report — 11h rest, an hour short */
    const ru = ruOf()
    const seat = ru.aircraft[1]
    const w2: any = (DAYS[TUE] as any).waves[1]
    const wasIn = w2.intimes.slice(), wasW = seat.w
    plant(() => {
      (DAYS[0] as any).ground.push({ prog: 'SQN TOWNHALL', str: '1900', end: '2200', who: 'waldo' })
      seat.w = 'waldo'; w2.intimes = [...wasIn.slice(0, 1), '0900H: RU IN TIME']
    }, () => { (DAYS[0] as any).ground.pop(); seat.w = wasW; w2.intimes = wasIn })
    validate()
    const g: any = WARN.byDay.find((x: any) => x.di === TUE)
    const mine = ((g && g.warns) || []).filter((w: any) => (w.who || []).includes('waldo'))
    const cr = mine.find((w: any) => w.code === 'CREW_REST')
    expect(cr, 'hard breach off a ground event').toBeTruthy()
    expect(cr.sev).toBe('hard')
    /* a ground event ends at its written end — nothing is assumed */
    expect(cr.msg).toContain('ended 22:00')
    expect(cr.msg).not.toContain('debrief assumed')
    /* and the palette agrees: 22:00 + 12h − 24h = 10:00 into Tuesday */
    expect(restClear(TUE, 'waldo')).toBe(22 * 60 + VCONF.crewRest - 1440)
  })

  it('a late SIM yesterday raises it the same', () => {
    const ru = ruOf()
    const seat = ru.aircraft[1]
    const w2: any = (DAYS[TUE] as any).waves[1]
    const wasIn = w2.intimes.slice(), wasW = seat.w
    plant(() => {
      (DAYS[0] as any).sims.oft.push({ label: 'BFM-3', str: '1930', end: '2130', p: '', w: 'waldo', rmks: '' })
      seat.w = 'waldo'; w2.intimes = [...wasIn.slice(0, 1), '0900H: RU IN TIME']
    }, () => { (DAYS[0] as any).sims.oft.pop(); seat.w = wasW; w2.intimes = wasIn })
    validate()
    const g: any = WARN.byDay.find((x: any) => x.di === TUE)
    const mine = ((g && g.warns) || []).filter((w: any) => (w.who || []).includes('waldo'))
    const cr = mine.find((w: any) => w.code === 'CREW_REST')
    expect(cr, 'hard breach off a sim').toBeTruthy()
    expect(cr.msg).toContain('ended 21:30')
    expect(cr.msg).not.toContain('debrief assumed')
  })

  it('a prior day that IS clear stays silent, whatever its kind', () => {
    /* fantom's seed ground event ends 12:30 Mon, so even an 03:00 report is
       14h30 later — clear. Before the widening this case was silent because
       ground events did not count; now it is silent because the arithmetic
       says so, which is the difference this file exists to hold. */
    const ru = ruOf()
    const seat = ru.aircraft[0]
    const w2: any = (DAYS[TUE] as any).waves[1]
    const wasIn = w2.intimes.slice(), wasW = seat.w
    plant(() => { seat.w = 'fantom'; w2.intimes = [...wasIn.slice(0, 1), '0300H: RU IN TIME'] },
      () => { seat.w = wasW; w2.intimes = wasIn })
    validate()
    const g: any = WARN.byDay.find((x: any) => x.di === TUE)
    const mine = ((g && g.warns) || []).filter((w: any) => (w.who || []).includes('fantom'))
    expect(mine.find((w: any) => w.code === 'CREW_REST'), 'no breach when rest is genuinely clear').toBeFalsy()
  })
})
