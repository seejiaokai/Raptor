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
import { acceptInput, unacceptInput } from './slots'
import { collectEvents } from './events'
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

/* THE FAIL-CLOSED DEFAULT (owner, 26 Aug 26 — closing HANDOFF's typo seam).
   An UNRECOGNISED type — a typo, or a record from an older store whose type
   was since renamed — used to slip into the Meeting-amber branch on a shift
   while reading hard against a sortie. Unknown now grades hard on BOTH: the
   amber branch takes a KNOWN soft type only (validate.ts's inpMeta gate,
   mirrored in refwin.ts reinput as the MEETING literal). */
describe('an unrecognised type fails closed against SC MAIN', () => {
  it('a typo\'d type hard-flags the shift, timed', () => {
    addSC(P); inp('Trainng')
    const w = mine('INPUT_FLY')
    expect(w.length).toBe(1)
    expect(w[0].sev).toBe('hard')
    expect(w[0].msg).toContain('Trainng but tasked — SC AM')
    expect(mine('SHIFT_SOFT').length, 'no amber voice for an unknown type').toBe(0)
  })
  it('an ALL-DAY typo\'d type hard-flags too', () => {
    addSC(P); inp('Appointmnt', { allday: true, s: undefined, e: undefined })
    const w = mine('INPUT_FLY')
    expect(w.length).toBe(1)
    expect(w[0].msg).toContain('Appointmnt but tasked — SC AM')
    expect(mine('SHIFT_SOFT').length).toBe(0)
  })
  it('the same typo is hard against a real sortie — the two representations agree', () => {
    const f: any = (DAYS[TUE] as any).waves[0].formations[0]
    f.aircraft[0].p = P
    inp('Trainng', { s: 520, e: 600 })     // 08:40–10:00, inside WAVE 1's window
    const w = mine('INPUT_FLY')
    expect(w.length).toBe(1)
    expect(w[0].sev).toBe('hard')
    expect(w[0].msg).toContain('Trainng clashes with')
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
  it('the ALL sentinel (owner, 28 Aug 26) is byte-for-byte the same: no warning anywhere', () => {
    addSC(P)
    ;(DAYS[TUE] as any).ground.push({ prog: 'TRAINING', who: 'ALL', str: '0800', end: '0900' })
    ;(DAYS[TUE] as any).allhands.push({ prog: 'SQN EVENT', str: '0800', end: '0900', who: 'ALL' })
    expect(nameToId('ALL')).toBe('all')
    expect(PEOPLE.all.special, 'a sentinel, not a person').toBe(true)
    expect(validate().all.filter((x: any) => (x.who || []).includes('all')).length).toBe(0)
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

/* A REMOVED INPUT IS DORMANT (owner, 26 Aug 26 — the preview follow-up:
   removed Comet's accepted Training back to Personal Inputs and it still rang
   "Training but tasked — SC AM"; "if it goes there, stop it from flagging
   anything, until its added back to ground programme"). unacceptInput parks it
   as acc 'r'; inputDormant blanks it from the engine. */
describe('a removed input flags nothing until re-accepted', () => {
  it('the owner\'s exact case: accepted all-day Training vs SC MAIN, removed, re-accepted', () => {
    addSC(P); inp('Training', { allday: true, s: undefined, e: undefined })
    const r: any = INPUTS[INPUTS.length - 1]
    expect(acceptInput(TUE, r, 'g')).toBe(true)
    /* all-day promotion keeps the raw voice (time-less row carries nothing) */
    expect(mine('INPUT_FLY').length).toBe(1)
    unacceptInput(TUE, r)
    expect(r.acc).toBe('r')
    expect(mine().filter((x: any) => x.sev !== 'note').length, 'removed — silent everywhere').toBe(0)
    expect(acceptInput(TUE, r, 'g'), 'the Accept button works again from removed').toBe(true)
    expect(mine('INPUT_FLY').length, 'accepted back — the red returns').toBe(1)
  })
  it('a removed TIMED red-list input goes quiet too — row voice and raw voice both', () => {
    addSC(P); inp('CSE')
    const r: any = INPUTS[INPUTS.length - 1]
    expect(acceptInput(TUE, r, 'g')).toBe(true)
    expect(mine('DOUBLE_BOOK').length, 'the landed row carries the clash').toBe(1)
    unacceptInput(TUE, r)
    expect(mine().filter((x: any) => x.sev !== 'note').length).toBe(0)
  })
  it('dormancy is engine-wide: day.input drops the removed input', () => {
    inp('Duty')
    const r: any = INPUTS[INPUTS.length - 1]
    expect(collectEvents()[TUE].input.some((x: any) => x.id === P && x.type === 'Duty')).toBe(true)
    acceptInput(TUE, r, 'g'); unacceptInput(TUE, r)
    expect(collectEvents()[TUE].input.some((x: any) => x.id === P && x.type === 'Duty'),
      'inpShow blanks a dormant input out of day.input').toBe(false)
  })
  it('a fresh, never-landed input still counts — only a deliberate removal parks', () => {
    addSC(P); inp('Training')                     // acc undefined — the 10 Aug rule holds
    expect(mine('INPUT_FLY').length).toBe(1)
  })
})
