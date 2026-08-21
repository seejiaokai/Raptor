/* A DUTY DESK ROW BEARS CREW REST (owner, 21 Aug 26 — his own repro: "he
   ended at 2130 for ops o the day prior but when I changed his in time to
   0900 no warning. Likewise when I change the brief time to 0900"). Before
   this, only a sortie or an SC shift the day before could raise the hard
   CREW_REST; a late desk duty fed the tight-turning advisory only — which is
   exactly the TT chip his screenshot shows where he expected red.

   What this pins:
     - a duty row ending late yesterday + told to report inside 12h today =
       HARD crew-rest breach, whether the instruction is the published
       in-time or a typed brief (insOf takes the EARLIER of the two);
     - the REST map (the palette's "he is not clear yet") carries the
       duty-ender too, so the picker and the engine cannot disagree;
     - a duty ends at its WRITTEN end — no debrief tail is assumed;
     - a sim or ground event yesterday still raises the advisory only. */
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

  it('a sim or ground event yesterday still gives the advisory, not the breach', () => {
    /* fantom sits a ground event Mon 10:30–12:30 and nothing rest-bearing;
       plant him on Tue RU with an 0300 in-time so even a midnight-anchored
       12h cannot be clear — only CREW_TIGHT may fire */
    const ru = ruOf()
    const seat = ru.aircraft[0]
    const w2: any = (DAYS[TUE] as any).waves[1]
    const wasIn = w2.intimes.slice(), wasW = seat.w
    plant(() => { seat.w = 'fantom'; w2.intimes = [...wasIn.slice(0, 1), '0300H: RU IN TIME'] },
      () => { seat.w = wasW; w2.intimes = wasIn })
    validate()
    const g: any = WARN.byDay.find((x: any) => x.di === TUE)
    const mine = ((g && g.warns) || []).filter((w: any) => (w.who || []).includes('fantom'))
    expect(mine.find((w: any) => w.code === 'CREW_REST'), 'no hard breach off a ground event').toBeFalsy()
  })
})
