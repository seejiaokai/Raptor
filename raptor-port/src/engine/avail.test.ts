/* Ported from reference/tfin.js — the availability / selection-count helpers
   that back the palette and the un-click rules (group W's personCount, plus
   the day sets the free-crew list is built from). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { personCount, personWarnDays, dayOff, dayEngaged, dayStandby, availByWave, slotBar, personBusy } from './avail'
import { makeStandalone } from './waves'
import { setSlotVal, acceptInput, unacceptInput } from './slots'
import { INPUTS } from './inputs'
import { validate } from './validate'
import { SCHED } from './publish'
import { VCONF } from './rules'

const DSNAP = JSON.stringify(DAYS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

describe('selection counting and day sets (tfin W / B38)', () => {
  it('the count walks every place a person can be written', () => {
    const base = personCount('bane')
    expect(base).toBeGreaterThan(0)
    /* writing him into one more slot moves the count by exactly one */
    const key = 'g:0.1'
    const before = personCount('bane')
    setSlotVal(key, 'bane')
    expect(personCount('bane')).toBe(before + 1)
  })

  it('personWarnDays lists the days a person is flagged on', () => {
    validate()
    expect(personWarnDays('bane').length).toBeGreaterThan(0)
    expect(personWarnDays('__nobody__')).toEqual([])
  })

  it('leave and downchit close the day (dayOff)', () => {
    expect(dayOff(DAYS[0]).has('divot')).toBe(true)   // downchit Jul 13
    expect(dayOff(DAYS[1]).has('nasty')).toBe(true)   // LL Jul 14
  })

  it('tasked crew are engaged; an SC spare is standing by, not tasked', () => {
    expect(dayEngaged(DAYS[0]).has('stiff')).toBe(true)
    DAYS[4].waves.push(makeStandalone('sc'))
    const f = DAYS[4].waves[0].formations[0]
    f.aircraft[0].p = 'razer'      // MAIN — tasked
    f.aircraft[2].p = 'vinci'      // SPARE — standing by
    expect(dayEngaged(DAYS[4]).has('razer')).toBe(true)
    expect(dayEngaged(DAYS[4]).has('vinci')).toBe(false)
    expect(dayStandby(DAYS[4]).has('vinci')).toBe(true)
  })

  it('availByWave buckets free crew by wave', () => {
    const a = availByWave(DAYS[0])
    expect(Array.isArray(a.wins) && Array.isArray(a.byWave) && Array.isArray(a.anyWave)).toBe(true)
    expect(a.wins.length).toBe(2)                     // Monday has two waves
    /* nobody off that day is offered anywhere */
    expect(a.anyWave).not.toContain('divot')
    a.byWave.forEach((b: string[]) => expect(b).not.toContain('divot'))
  })
})

/* Fly availability (owner, Aug 26): a Fly input means the man is flying with
   ANOTHER SQUADRON, so once a scheduler actions it he is away — off the
   Available-crew strip, faded in the palette, barred from slots with the
   reason. Un-actioned it is still just a request, matching the validator
   gate; the two gates must not drift apart. */
describe('an actioned Fly reads as away', () => {
  const fly = () => INPUTS.find((i: any) => i.type === 'Fly' && i.person === 'bruise')!

  it('un-actioned free · actioned off/barred · undo frees again', () => {
    const inp = fly(), d = DAYS[0]
    expect(inp).toBeTruthy()
    expect(dayOff(d).has('bruise')).toBe(false)
    const free0 = availByWave(d)
    expect(free0.anyWave.concat(...free0.byWave)).toContain('bruise')
    expect(slotBar('bruise', '0.0.0.0.p')).toBe('')
    acceptInput(0, inp, 'g')
    expect(dayOff(d).has('bruise')).toBe(true)
    const free1 = availByWave(d)
    expect(free1.anyWave.concat(...free1.byWave)).not.toContain('bruise')
    expect(slotBar('bruise', '0.0.0.0.p')).toContain('flying with another squadron')
    unacceptInput(0, inp)
    expect(dayOff(d).has('bruise')).toBe(false)
    expect(slotBar('bruise', '0.0.0.0.p')).toBe('')
  })

  it('filing it under Unavailable closes the day just the same', () => {
    const inp = fly(), d = DAYS[0]
    acceptInput(0, inp, 'u')
    expect(dayOff(d).has('bruise')).toBe(true)
    unacceptInput(0, inp)
  })
})

/* ---------------------------------------------------------------------------
   HALF-DAY ABSENCES IN THE PALETTE (owner, 10 Aug 26). dayOff still means "off
   for the WHOLE day" — it feeds the day-info tally and the struck-through rank
   as well as the palette, and a man on AM leave is genuinely not off for the
   day. A timed absence occupies time exactly as a task does, so it is folded
   into the same per-wave overlap availByWave already runs.
   --------------------------------------------------------------------------- */
describe('a half-day absence frees the other half in the palette', () => {
  const ISNAP = JSON.stringify(INPUTS)
  afterEach(() => { INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })

  /* Monday's two waves: VL/RU 12:40–15:05, then the night wave 19:20–21:10 */
  it('dayOff keeps only whole-day absences', () => {
    INPUTS.push({ person: 'stiff', date: 'Jul 13', allday: false, s: 240, e: 720, half: 'am', type: 'LL', remarks: '', mod: '' })
    validate()
    expect(dayOff(DAYS[0]).has('stiff')).toBe(false)     // not off for the DAY
    expect(dayOff(DAYS[0]).has('divot')).toBe(true)      // OML all day, still is
  })

  it('and it drops him only from the waves it actually overlaps', () => {
    const d = DAYS[0]
    /* find a man the palette already offers for the NIGHT wave, so the only
       thing this test can move is the absence */
    const base = availByWave(d)
    const wi = base.wins.length - 1
    const who = base.byWave[wi][0] || base.anyWave[0]
    expect(who, 'nobody available for the night wave in the seed').toBeTruthy()
    const inWave = (i: number) => { const a = availByWave(d); return a.byWave[i].includes(who) || a.anyWave.includes(who) }
    /* Monday flies in the afternoon and at night, so a MORNING absence takes
       nothing away — he is still offered for the night wave */
    INPUTS.push({ person: who, date: 'Jul 13', allday: false, s: 240, e: 720, half: 'am', type: 'LL', remarks: '', mod: '' })
    validate()
    expect(inWave(wi)).toBe(true)
    /* the afternoon half covers both waves, so every band loses him */
    INPUTS.pop()
    INPUTS.push({ person: who, date: 'Jul 13', allday: false, s: 721, e: 1439, half: 'pm', type: 'LL', remarks: '', mod: '' })
    validate()
    const pm = availByWave(d)
    expect(pm.byWave.every((b: any) => !b.includes(who))).toBe(true)
    expect(pm.anyWave.includes(who)).toBe(false)
  })

  /* THE FAST-PATH HOLE: an untasked man skips the window check entirely, so a
     man whose ONLY commitment is a timed absence would otherwise read free in
     every wave — the absence would do nothing at all. */
  it('an untasked man with a timed absence does not slip through as free-all-day', () => {
    const d = DAYS[0]
    const free = availByWave(d).anyWave.find((id: any) => !dayEngaged(d).has(id))!
    expect(free, 'no untasked man in the seed').toBeTruthy()
    INPUTS.push({ person: free, date: 'Jul 13', allday: false, s: 721, e: 1439, half: 'pm', type: 'LL', remarks: '', mod: '' })
    validate()
    const a = availByWave(d)
    expect(a.anyWave.includes(free)).toBe(false)
    expect(a.byWave.every((b: any) => !b.includes(free))).toBe(true)
  })

  /* THE OTHER SIDE OF THAT HOLE: a day with no flying has no bands to bucket
     into, so anyWave is the only bucket there is. Without the second guard the
     man would vanish from the strip altogether — the same bug inverted. */
  it('but on a non-flying day he stays in the strip, because there are no bands', () => {
    const di = DAYS.findIndex((d: any) => !(d.waves || []).length)
    expect(di, 'the seed has no non-flying day to test').toBeGreaterThanOrEqual(0)
    const d = DAYS[di]
    const free = availByWave(d).anyWave[0]
    INPUTS.push({ person: free, date: d.dt, allday: false, s: 721, e: 1439, half: 'pm', type: 'LL', remarks: '', mod: '' })
    validate()
    expect(availByWave(d).anyWave.includes(free)).toBe(true)
  })
})

/* The "available crew · by wave" strip is built from personBusy, and its step /
   dekit pads used to be the literals 60 and 30 while every other consumer of a
   sortie's occupied window (slotRules, events.ts, validate.ts) read VCONF. At
   the shipped defaults the two agree, so the fault was dormant — it woke the
   moment an admin edited either rule on the Logic tab, and the strip then
   offered a man the warning list already considered occupied. */
describe('personBusy follows the editable step / dekit rules', () => {
  const flyWindow = () => {
    const f = DAYS[0].waves[0].formations[0]
    f.to = '12:00'; f.ld = '13:00'; f.aircraft[0].p = 'split'
    return personBusy(DAYS[0], 'split')[0]
  }

  it('at the defaults the window is take-off − step to landing + dekit', () => {
    const w = flyWindow()
    expect(w[0]).toBe(720 - VCONF.step)
    expect(w[1]).toBe(780 + VCONF.dekit)
  })

  it('raising the step rule widens the busy window by the same amount', () => {
    const before = flyWindow()
    const step0 = VCONF.step, dekit0 = VCONF.dekit
    try {
      VCONF.step = step0 + 90
      VCONF.dekit = dekit0 + 15
      const after = flyWindow()
      expect(after[0]).toBe(before[0] - 90)
      expect(after[1]).toBe(before[1] + 15)
    } finally { VCONF.step = step0; VCONF.dekit = dekit0 }
  })
})
