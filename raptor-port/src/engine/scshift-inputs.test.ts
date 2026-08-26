/* SC MAIN vs personal inputs — the per-TYPE grading (owner, 26 Aug 26).
   The red-list commitments (Training, CSE, Fly with, Personal, Appointment,
   Duty, Other) hard-flag an SC MAIN shift — it may launch the man — while a
   Meeting speaks the amber SHIFT_SOFT, in BOTH representations (raw input and
   accepted ground row). ATT B hard-flags the shift too (narrowed from the
   10 Aug "bars the jet and nothing else"). Hand-typed ground rows are graded
   by their own words. SC SPARE and AVALON stay exactly as they were.
   'split' has a clean seed Tuesday (scintime.test.ts's own fixture note), so
   every warning below is the test's own doing. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, shiftHardInput, shiftHardLabel } from './inputs'
import { PEOPLE, nameToId } from './people'
import { acceptInput } from './slots'
import { SCHED } from './publish'
import { makeStandalone } from './waves'
import { validate } from './validate'
import { slotBar } from './avail'
import { SHIFT_HARD } from './rules'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const TUE = 1, P = 'split'

beforeEach(() => {
  const d = JSON.parse(DSNAP); DAYS.length = 0; d.forEach((x: any) => DAYS.push(x))
  const i = JSON.parse(ISNAP); INPUTS.length = 0; i.forEach((x: any) => INPUTS.push(x))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}; SCHED.al = 0
  validate()
})

/* SC AM 07:00–13:00 on Tuesday; MAIN seat 0 (or SPARE row 2) for `id` */
const addSC = (id: string, spare = false, br?: string) => {
  const w: any = makeStandalone('sc')
  if (br != null) w.formations[0].br = br
  w.formations[0].aircraft[spare ? 2 : 0].p = id
  ;(DAYS[TUE] as any).waves.push(w)
  return (DAYS[TUE] as any).waves.length - 1
}
const inp = (type: string, extra: any = {}) =>
  INPUTS.push({ person: P, date: 'Jul 14', allday: false, s: 600, e: 660, type, remarks: '', mod: '', ...extra })
const mine = (code?: string) => validate().all.filter((x: any) =>
  x.di === TUE && (x.who || []).includes(P) && (!code || x.code === code))

describe('raw inputs are graded by type against SC MAIN', () => {
  it('every red-list type hard-flags, timed', () => {
    for (const t of ['Training', 'CSE', 'Fly with', 'Personal', 'Appointment', 'Duty', 'Other']) {
      expect(shiftHardInput(t), t).toBe(true)
      const d = JSON.parse(DSNAP); DAYS.length = 0; d.forEach((x: any) => DAYS.push(x))
      INPUTS.length = 0; JSON.parse(ISNAP).forEach((x: any) => INPUTS.push(x))
      addSC(P); inp(t)
      const w = mine('INPUT_FLY')
      expect(w.length, t).toBe(1)
      expect(w[0].sev, t).toBe('hard')
      expect(w[0].msg, t).toContain(`${t} but tasked — SC AM`)
    }
  })
  it('an ALL-DAY red-list input counts too', () => {
    addSC(P); inp('Training', { allday: true, s: undefined, e: undefined })
    const w = mine('INPUT_FLY')
    expect(w.length).toBe(1)
    expect(w[0].msg).toContain('Training but tasked — SC AM')
  })
  it('a Meeting is the amber SHIFT_SOFT, timed and all-day alike', () => {
    addSC(P); inp('Meeting')
    let w = mine('SHIFT_SOFT')
    expect(w.length).toBe(1)
    expect(w[0].sev).toBe('adv')
    expect(w[0].msg).toContain('also down for Meeting')
    expect(mine('INPUT_FLY').length).toBe(0)
    INPUTS.pop(); inp('Meeting', { allday: true, s: undefined, e: undefined })
    w = mine('SHIFT_SOFT')
    expect(w.length, 'all-day Meeting reads amber, not silent').toBe(1)
  })
  it('ATT B hard-flags the SHIFT — he may be required to fly — but keeps his desk', () => {
    addSC(P); inp('ATT B', { allday: true, s: undefined, e: undefined, remarks: 'grounded' })
    const w = mine('DNIF_FLY')
    expect(w.length).toBe(1)
    expect(w[0].msg).toContain('Downchit but tasked — SC AM')
    /* the desk carve-out survives: a duty post the same day raises nothing new */
    ;(DAYS[TUE] as any).dutywaves[0].rows.push({ role: 'TEST', id: P, str: '1400', end: '1500' })
    expect(mine('DNIF_FLY').length, 'the duty post adds no second flag').toBe(1)
  })
})

describe('accepted ground rows are graded by their source type', () => {
  it('an accepted Training row is the hard clash, spoken ONCE', () => {
    addSC(P)
    const i = INPUTS[inp('Training') - 1]
    expect(acceptInput(TUE, i, 'g')).toBe(true)
    const all = mine()
    expect(all.filter((x: any) => x.code === 'DOUBLE_BOOK' && /SC AM & TRAINING clash/.test(x.msg)).length).toBe(1)
    expect(all.filter((x: any) => x.code === 'INPUT_FLY').length, 'the raw copy stays deferred to its row').toBe(0)
  })
  it("an accepted 'Other' stays hard via its source type, though its label is the remarks", () => {
    addSC(P)
    const i = INPUTS[inp('Other', { remarks: 'ESCORT VISIT' }) - 1]
    expect(acceptInput(TUE, i, 'g')).toBe(true)
    expect(mine('DOUBLE_BOOK').filter((x: any) => /SC AM & ESCORT VISIT clash/.test(x.msg)).length).toBe(1)
  })
  it('an accepted Meeting row stays the amber SHIFT_SOFT, spoken once', () => {
    addSC(P)
    const i = INPUTS[inp('Meeting') - 1]
    expect(acceptInput(TUE, i, 'g')).toBe(true)
    expect(mine('SHIFT_SOFT').length).toBe(1)
    expect(mine('DOUBLE_BOOK').length).toBe(0)
  })
})

describe('hand-typed ground rows are graded by their own words', () => {
  const cs = () => PEOPLE[P].cs
  it('TRAINING and FLY WITH go red; MEETING and ACADEMICS stay amber', () => {
    expect(shiftHardLabel('FLY WITH 145')).toBe(true)
    expect(shiftHardLabel('ACADEMICS')).toBe(false)
    addSC(P)
    ;(DAYS[TUE] as any).ground.push({ prog: 'TRAINING', who: cs(), str: '0900', end: '1000' })
    ;(DAYS[TUE] as any).ground.push({ prog: 'ACADEMICS', who: cs(), str: '1030', end: '1100' })
    ;(DAYS[TUE] as any).ground.push({ prog: 'MEETING', who: cs(), str: '1110', end: '1140' })
    const all = mine()
    expect(all.filter((x: any) => x.code === 'DOUBLE_BOOK' && /TRAINING/.test(x.msg) && x.sev === 'hard').length).toBe(1)
    expect(all.filter((x: any) => x.code === 'SHIFT_SOFT' && /ACADEMICS/.test(x.msg)).length).toBe(1)
    expect(all.filter((x: any) => x.code === 'SHIFT_SOFT' && /MEETING/.test(x.msg)).length).toBe(1)
  })
  it('a programme item always stays advisory, whatever its words', () => {
    addSC(P)
    ;(DAYS[TUE] as any).allhands.push({ prog: 'TRAINING DAY', str: '0900', end: '1000', who: cs() })
    expect(mine('SHIFT_SOFT').length).toBe(1)
    expect(mine('DOUBLE_BOOK').length).toBe(0)
  })
  it('flipping SHIFT_HARD.ground to hard makes the overlay a no-op', () => {
    SHIFT_HARD.ground = true
    try {
      addSC(P)
      ;(DAYS[TUE] as any).ground.push({ prog: 'ACADEMICS', who: cs(), str: '0900', end: '1000' })
      expect(mine('DOUBLE_BOOK').length).toBe(1)
      expect(mine('SHIFT_SOFT').length).toBe(0)
    } finally { SHIFT_HARD.ground = false }
  })
})

describe('the crew picker gives the same answer as the flag', () => {
  it('a red-list ground row inside the window bars the armed SC MAIN slot; a Meeting row does not', () => {
    /* arm the man's OWN seat, so his shift event is the excluded self and the
       ground row alone decides — a swap/re-test must not read him as busy on
       the very slot being planned */
    const gi = addSC(P)
    ;(DAYS[TUE] as any).ground.push({ prog: 'TRAINING', who: PEOPLE[P].cs, str: '0900', end: '1000' })
    validate()
    expect(slotBar(P, `${TUE}.${gi}.0.0.p`)).toMatch(/on TRAINING .*inside this shift/)
    ;(DAYS[TUE] as any).ground.pop()
    ;(DAYS[TUE] as any).ground.push({ prog: 'MEETING', who: PEOPLE[P].cs, str: '0900', end: '1000' })
    validate()
    expect(slotBar(P, `${TUE}.${gi}.0.0.p`)).not.toMatch(/inside this shift/)
  })
})

describe('what does NOT change', () => {
  it('an ALL AVAIL sentinel on a ground or programme row raises nothing against SC', () => {
    addSC(P)
    ;(DAYS[TUE] as any).ground.push({ prog: 'TRAINING', who: 'ALL AVAIL', str: '0800', end: '0900' })
    ;(DAYS[TUE] as any).allhands.push({ prog: 'SQN EVENT', str: '0800', end: '0900', who: 'ALL AVAIL' })
    expect(nameToId('ALL AVAIL')).toBe('allavail')
    expect(validate().all.filter((x: any) => (x.who || []).includes('allavail')).length).toBe(0)
  })
  it('SC SPARE stays uncrosschecked — a Training input raises nothing on him', () => {
    addSC(P, true); inp('Training')
    expect(mine().filter((x: any) => ['INPUT_FLY', 'SHIFT_SOFT', 'DOUBLE_BOOK'].includes(x.code)).length).toBe(0)
  })
  it('AVALON stays on its one availability check — a Training input raises nothing', () => {
    const w: any = makeStandalone('avalon')
    w.formations[0].aircraft[0].p = P
    ;(DAYS[TUE] as any).waves.push(w)
    inp('Training', { allday: true, s: undefined, e: undefined })
    expect(mine().length).toBe(0)
  })
  it('an input overlapping the shift speaks through the clash voice only — never also SC_INTIME', () => {
    addSC(P, false, '06:00')
    inp('Meeting', { s: 390, e: 800 })     // 06:30–13:20: cuts the in-time window AND the shift
    expect(mine('SHIFT_SOFT').length).toBe(1)
    expect(mine('SC_INTIME').length, 'already reported — the in-time cut must not double it').toBe(0)
  })
})
