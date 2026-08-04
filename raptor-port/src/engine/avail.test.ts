/* Ported from reference/tfin.js — the availability / selection-count helpers
   that back the palette and the un-click rules (group W's personCount, plus
   the day sets the free-crew list is built from). */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { personCount, personWarnDays, dayOff, dayEngaged, dayStandby, availByWave, slotBar } from './avail'
import { makeStandalone } from './waves'
import { setSlotVal, acceptInput, unacceptInput } from './slots'
import { INPUTS } from './inputs'
import { validate } from './validate'
import { SCHED } from './publish'

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
