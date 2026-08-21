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
     - a prior day that IS 12h clear stays silent, whatever its kind;
     - THE DAY STARTS AT ITS FIRST COMMITMENT (the owner's 21:30 / 08:00
       meeting / 10:00 in-time / 11:00 brief example): an earlier scheduled
       event on the fly-day binds the breach, the message names it, and the
       warning anchors on its row — but only when he flies that day. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { validate, WARN, REST, restClear } from './validate'
import { VCONF } from './rules'
import { INPUTS } from './inputs'

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

  /* THE DAY STARTS AT ITS FIRST COMMITMENT (owner, 21 Aug 26 — his own
     worked example, verbatim: ends Monday 21:30, "reports the next day at
     0800 for meeting, but even tho the in time writes 1000, and brief time
     writes 1100. The first event of this day already breaks the 12 hour
     rest"). The in-time and brief are both clear of the 09:30 line; the
     08:00 meeting is not, and the meeting is what the warning names. */
  it("the owner's example: 21:30 end, 10:00 in-time, 11:00 brief — an 08:00 meeting still breaches", () => {
    const ru = ruOf()
    const seat = ru.aircraft[1]
    const w2: any = (DAYS[TUE] as any).waves[1]
    const wasIn = w2.intimes.slice(), wasW = seat.w, wasBr = ru.br
    plant(() => {
      seat.w = 'stuff'; w2.intimes = [...wasIn.slice(0, 1), '1000H: RU IN TIME']; ru.br = '11:00'
      ;(DAYS[TUE] as any).ground.push({ prog: 'MTG W OC', str: '0800', end: '0900', who: 'stuff' })
    }, () => { seat.w = wasW; w2.intimes = wasIn; ru.br = wasBr; (DAYS[TUE] as any).ground.pop() })
    validate()
    const cr = stuffWarns().find((w: any) => w.code === 'CREW_REST')
    expect(cr, 'the meeting binds the breach').toBeTruthy()
    expect(cr.sev).toBe('hard')
    expect(cr.msg, 'names the first commitment').toContain('his day starts 08:00 (MTG W OC)')
    expect(cr.msg, 'and the report it precedes').toContain('before the 10:00 report')
    expect(cr.msg).toContain('ended 21:30')
    /* leave-by follows the MEETING: 08:00 + 24h − 12h = Monday 20:00 */
    expect(cr.leaveBy).toBe('20:00')
    /* the warning anchors on the meeting's own row, so the jump pans there */
    expect(String(cr.key)).toMatch(/^g:1\./)
  })

  it('the same meeting at 10:00 is clear — the rule is arithmetic, not suspicion of meetings', () => {
    const ru = ruOf()
    const seat = ru.aircraft[1]
    const w2: any = (DAYS[TUE] as any).waves[1]
    const wasIn = w2.intimes.slice(), wasW = seat.w
    plant(() => {
      seat.w = 'stuff'; w2.intimes = [...wasIn.slice(0, 1), '1000H: RU IN TIME']
      ;(DAYS[TUE] as any).ground.push({ prog: 'MTG W OC', str: '1000', end: '1100', who: 'stuff' })
    }, () => { seat.w = wasW; w2.intimes = wasIn; (DAYS[TUE] as any).ground.pop() })
    validate()
    expect(stuffWarns().find((w: any) => w.code === 'CREW_REST'), '10:00 is past the 09:30 clearance').toBeFalsy()
  })

  it('with no earlier event the breach message is byte-identical to before — told to report', () => {
    const ru = ruOf()
    const seat = ru.aircraft[1]
    const w2: any = (DAYS[TUE] as any).waves[1]
    const wasIn = w2.intimes.slice(), wasW = seat.w
    plant(() => { seat.w = 'stuff'; w2.intimes = [...wasIn.slice(0, 1), '0900H: RU IN TIME'] },
      () => { seat.w = wasW; w2.intimes = wasIn })
    validate()
    const cr = stuffWarns().find((w: any) => w.code === 'CREW_REST')
    expect(cr.msg).toContain('told to report 09:00')
    expect(cr.msg).not.toContain('his day starts')
  })

  it('an early meeting with NO flying that day asks for no rest at all', () => {
    /* the rule exists because he flies — a meeting-only day carries no
       12-hour requirement, however late Monday ran */
    const wasG = ((DAYS[TUE] as any).ground || []).length
    plant(() => { (DAYS[TUE] as any).ground.push({ prog: 'MTG W OC', str: '0800', end: '0900', who: 'stuff' }) },
      () => { (DAYS[TUE] as any).ground.length = wasG })
    validate()
    expect(stuffWarns().find((w: any) => w.code === 'CREW_REST'), 'no sortie, no crew-rest rule').toBeFalsy()
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

/* DUTY & COMMITMENT INPUTS BEAR CREW REST (owner, 21 Aug 26 — "everything in
   duty and commitments affects crew rest if the person is flying… do not
   include personal, sans availability", both sides, and "use the timings u
   see": typed times only, an all-day record moves nothing). The type set is
   inputs.ts:restsInput; the same rule is mirrored into the patched reference
   by refwin.ts:reirest(). Seed dates: Mon = 'Jul 13', Tue = 'Jul 14'. */
describe('a duty & commitment INPUT bears crew rest', () => {
  /* stuff flies RU on Tuesday with a 10:00 in-time and an 11:00 brief — both
     clear of his 21:30 Monday duty (clear at 09:30). Each case then plants
     one INPUT and asks what it changes. */
  const flyStuffAt10 = () => {
    const ru = ruOf()
    const seat = ru.aircraft[1]
    const w2: any = (DAYS[TUE] as any).waves[1]
    const wasIn = w2.intimes.slice(), wasW = seat.w, wasBr = ru.br
    plant(() => { seat.w = 'stuff'; w2.intimes = [...wasIn.slice(0, 1), '1000H: RU IN TIME']; ru.br = '11:00' },
      () => { seat.w = wasW; w2.intimes = wasIn; ru.br = wasBr })
    return ru
  }
  const plantInput = (rec: any) =>
    plant(() => { INPUTS.push({ mod: '2026-06-26', remarks: '', ...rec }) }, () => { INPUTS.pop() })

  it('a timed Meeting input at 08:00 binds the breach and is named in the warning', () => {
    flyStuffAt10()
    plantInput({ person: 'stuff', date: 'Jul 14', allday: false, s: 8 * 60, e: 9 * 60, type: 'Meeting' })
    validate()
    const cr = stuffWarns().find((w: any) => w.code === 'CREW_REST')
    expect(cr, 'the input binds the breach').toBeTruthy()
    expect(cr.sev).toBe('hard')
    expect(cr.msg).toContain('his day starts 08:00 (Meeting)')
    expect(cr.msg).toContain('before the 10:00 report')
    /* leave-by follows the input: 08:00 + 24h − 12h = Monday 20:00 */
    expect(cr.leaveBy).toBe('20:00')
    /* an unaccepted input has no board row, so the warning anchors on the
       LEG — the one row of his the scheduler can jump to */
    expect(String(cr.key)).toMatch(/^1\.1\./)
  })

  it('a LATE SHOW remark on the jet cannot dash an input-bound breach', () => {
    const ru = flyStuffAt10()
    const wasR = ru.aircraft[1].rmks
    plant(() => { ru.aircraft[1].rmks = '2A: LATE SHOW' }, () => { ru.aircraft[1].rmks = wasR })
    plantInput({ person: 'stuff', date: 'Jul 14', allday: false, s: 8 * 60, e: 9 * 60, type: 'Meeting' })
    validate()
    const cr = stuffWarns().find((w: any) => w.code === 'CREW_REST')
    expect(cr).toBeTruthy()
    expect(cr.msg, 'no late-show clause: the remark is about the jet, not the meeting').not.toContain('Late show')
    expect(!!(WARN.dash && WARN.dash[TUE] && WARN.dash[TUE].stuff), 'ring stays solid').toBe(false)
  })

  it('an ALL-DAY input moves nothing — no timing to see', () => {
    flyStuffAt10()
    plantInput({ person: 'stuff', date: 'Jul 14', allday: true, s: 0, e: 1439, type: 'Meeting' })
    validate()
    expect(stuffWarns().find((w: any) => w.code === 'CREW_REST')).toBeFalsy()
  })

  it("the type spelled 'Personal' is excluded by the owner's ruling", () => {
    flyStuffAt10()
    plantInput({ person: 'stuff', date: 'Jul 14', allday: false, s: 8 * 60, e: 9 * 60, type: 'Personal' })
    validate()
    expect(stuffWarns().find((w: any) => w.code === 'CREW_REST')).toBeFalsy()
  })

  it('an Other input reads by its remarks in the message', () => {
    flyStuffAt10()
    plantInput({ person: 'stuff', date: 'Jul 14', allday: false, s: 8 * 60, e: 9 * 60, type: 'Other', remarks: 'JPT PLANNING' })
    validate()
    const cr = stuffWarns().find((w: any) => w.code === 'CREW_REST')
    expect(cr).toBeTruthy()
    expect(cr.msg).toContain('his day starts 08:00 (JPT PLANNING)')
  })

  it('a Training input ending 22:00 YESTERDAY starts the clock — both sides count', () => {
    /* waldo has nothing else on Monday; the input is his whole evening */
    const ru = ruOf()
    const seat = ru.aircraft[1]
    const w2: any = (DAYS[TUE] as any).waves[1]
    const wasIn = w2.intimes.slice(), wasW = seat.w
    plant(() => { seat.w = 'waldo'; w2.intimes = [...wasIn.slice(0, 1), '0900H: RU IN TIME'] },
      () => { seat.w = wasW; w2.intimes = wasIn })
    plantInput({ person: 'waldo', date: 'Jul 13', allday: false, s: 19 * 60, e: 22 * 60, type: 'Training' })
    validate()
    const g: any = WARN.byDay.find((x: any) => x.di === TUE)
    const cr = ((g && g.warns) || []).filter((w: any) => (w.who || []).includes('waldo'))
      .find((w: any) => w.code === 'CREW_REST')
    expect(cr, 'hard breach off an input ender').toBeTruthy()
    expect(cr.msg).toContain('ended 22:00')
    expect(cr.msg, 'an input ends at its written end').not.toContain('debrief assumed')
    /* and the palette agrees: 22:00 + 12h − 24h = 10:00 into Tuesday */
    expect(restClear(TUE, 'waldo')).toBe(22 * 60 + VCONF.crewRest - 1440)
  })

  it('leave and medical inputs stay out of crew rest — the ruling is the commitments group', () => {
    const ru = ruOf()
    const seat = ru.aircraft[1]
    const w2: any = (DAYS[TUE] as any).waves[1]
    const wasIn = w2.intimes.slice(), wasW = seat.w
    plant(() => { seat.w = 'waldo'; w2.intimes = [...wasIn.slice(0, 1), '0900H: RU IN TIME'] },
      () => { seat.w = wasW; w2.intimes = wasIn })
    plantInput({ person: 'waldo', date: 'Jul 13', allday: false, s: 19 * 60, e: 22 * 60, type: 'LL' })
    plantInput({ person: 'waldo', date: 'Jul 13', allday: false, s: 17 * 60, e: 23 * 60, type: 'ATT B' })
    validate()
    const g: any = WARN.byDay.find((x: any) => x.di === TUE)
    const mine = ((g && g.warns) || []).filter((w: any) => (w.who || []).includes('waldo'))
    expect(mine.find((w: any) => w.code === 'CREW_REST')).toBeFalsy()
  })

  it('an OD (overseas duty) input counts — it sits in the commitments group', () => {
    const ru = ruOf()
    const seat = ru.aircraft[1]
    const w2: any = (DAYS[TUE] as any).waves[1]
    const wasIn = w2.intimes.slice(), wasW = seat.w
    plant(() => { seat.w = 'waldo'; w2.intimes = [...wasIn.slice(0, 1), '0900H: RU IN TIME'] },
      () => { seat.w = wasW; w2.intimes = wasIn })
    plantInput({ person: 'waldo', date: 'Jul 13', allday: false, s: 12 * 60, e: 22 * 60, type: 'OD' })
    validate()
    const g: any = WARN.byDay.find((x: any) => x.di === TUE)
    const cr = ((g && g.warns) || []).filter((w: any) => (w.who || []).includes('waldo'))
      .find((w: any) => w.code === 'CREW_REST')
    expect(cr).toBeTruthy()
    expect(cr.msg).toContain('ended 22:00')
  })

  it("TODAY's own afternoon input never files as yesterday's end — the nx midnight copy is skipped", () => {
    /* stuff at the clear 10:00 in-time; a Tuesday 13:00–21:00 Meeting sits
       AFTER his report. Its nx copy lives in Monday's minute-space at +1440,
       and counting it would put his "previous end" at Tuesday 21:00 and
       breach a perfectly legal morning. */
    flyStuffAt10()
    plantInput({ person: 'stuff', date: 'Jul 14', allday: false, s: 13 * 60, e: 21 * 60, type: 'Meeting' })
    validate()
    expect(stuffWarns().find((w: any) => w.code === 'CREW_REST')).toBeFalsy()
  })
})
