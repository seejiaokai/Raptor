/* THE INPUT KIND "EVENT" (owner, D713 + D714, 9 Oct 26 — `[INPUT-EVENT-KIND]`).

   His words: "Ask it, its work, it can be an official event too … It should be like a ground programme so yes it
   should clash … It shows on the inputs calendar, same thing it shows directly on the schedule unless taken out by an
   admin" (D713), then "Yes it can be a clash like that, not the meeting softer amber" (D714).

   So Event is one more row of the ONE table (engine/inputs.ts INPUT_META) with the flags Training, Appointment and Duty
   carry, and everything else follows from the table. Each derived rule is asserted here by name rather than assumed —
   a kind that silently missed one of them would be a commitment on one screen and something else on another.
   The plan: docs/superpowers/plans/2026-10-09-input-all-avail-plan.md §4. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import {
  INPUTS, INPUT_META, INPUT_TYPES, inpMeta, typeGroup, isPersonal, isUnavail, isAway, restsInput, oilAsks, canSpare, canWork,
  shiftHardInput, shiftHardLabel, defaultAllday, inputRuleText, needsDoc, isLeave, isDownchit, isSansAvail, isUpchit,
} from './inputs'
import { INPUT_TYPES as SCHEMA_TYPES } from './schema'
import { SCHED } from './publish'
import { makeStandalone } from './waves'
import { validate } from './validate'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const TUE = 1, P = 'split'

beforeEach(() => {
  const d = JSON.parse(DSNAP); DAYS.length = 0; d.forEach((x: any) => DAYS.push(x))
  const i = JSON.parse(ISNAP); INPUTS.length = 0; i.forEach((x: any) => INPUTS.push(x))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}; SCHED.al = 0
  validate()
})

describe('D713 — Event is a kind, and a commitment like the others', () => {
  it('is in the one table, after Duty, with the flags Training / Appointment / Duty carry', () => {
    expect(INPUT_TYPES).toContain('Event')
    expect(INPUT_TYPES.indexOf('Event'), 'it sits straight after Duty in the type list').toBe(INPUT_TYPES.indexOf('Duty') + 1)
    const { name: _n, ...flags } = INPUT_META['Event']
    const { name: _d, ...duty } = INPUT_META['Duty']
    expect(flags, 'the same flags as Duty, to the letter').toEqual(duty)
    expect(INPUT_META['Event'].name).toBe('event')
    expect(inpMeta(' event ').name, 'looked up whatever the case').toBe('event')
  })

  it('every derived rule answers as it does for Duty, Training and Appointment', () => {
    for (const pred of [typeGroup, isPersonal, isUnavail, restsInput, oilAsks, canSpare, canWork, shiftHardInput, defaultAllday,
      needsDoc, isLeave, isDownchit, isSansAvail, isUpchit])
      for (const like of ['Duty', 'Training', 'Appointment'])
        expect(pred('Event'), `${pred.name} — as ${like}`).toBe(pred(like))
    expect(isAway({ type: 'Event', acc: 'g' }), 'a man on an Event is busy, never "away"').toBe(false)
  })

  it('sits under "Duty & other commitments", lands on the programme, opens timed', () => {
    expect(typeGroup('Event')).toBe('other')
    expect(isPersonal('Event'), 'it lands on the Ground Programme unless an admin takes it off').toBe(true)
    expect(defaultAllday('Event'), 'a timed commitment: All day starts off').toBe(false)
  })

  it('asks the OIL question and bears crew rest — "its work" (D713)', () => {
    expect(oilAsks('Event')).toBe(true)
    expect(restsInput('Event')).toBe(true)
  })

  it('the legend and the Logic table say of it what they say of Duty', () => {
    expect(inputRuleText('Event')).toBe(inputRuleText('Duty'))
    expect(inputRuleText('Event')).toContain('across an SC MAIN shift this is a Warning')
  })

  it('the declared record types carry it (schema.ts)', () => {
    expect([...SCHEMA_TYPES]).toEqual(Object.keys(INPUT_META))
  })
})

describe('D714 — an Event clashes red across a standby shift, not Meeting\'s amber', () => {
  /* SC AM 07:00–13:00 on Tuesday, MAIN seat 0 for `id` — scshift-inputs.test.ts's own fixture */
  const addSC = (id: string) => {
    const w: any = makeStandalone('sc')
    w.formations[0].aircraft[0].p = id
    ;(DAYS[TUE] as any).waves.push(w)
  }
  const inp = (type: string, extra: any = {}) =>
    INPUTS.push({ person: P, date: 'Jul 14', allday: false, s: 600, e: 660, type, remarks: '', mod: '', ...extra })
  const mine = (code?: string) => validate().all.filter((x: any) =>
    x.di === TUE && (x.who || []).includes(P) && (!code || x.code === code))

  it('a man on an SC MAIN shift with an Event in its hours: ONE red warning, worded as Training\'s is', () => {
    expect(shiftHardInput('Event')).toBe(true)
    addSC(P); inp('Event')
    const w = mine('INPUT_FLY')
    expect(w.length).toBe(1)
    expect(w[0].sev).toBe('hard')
    expect(w[0].msg).toContain('Event but tasked — SC AM')
    expect(mine('SHIFT_SOFT').length, 'never the amber advisory a Meeting gets').toBe(0)
  })

  it('an all-day Event counts too', () => {
    addSC(P); inp('Event', { allday: true, s: undefined, e: undefined })
    expect(mine('INPUT_FLY').length).toBe(1)
  })

  it('and a Meeting is still amber — the one soft kind is unchanged', () => {
    expect(shiftHardInput('Meeting')).toBe(false)
    addSC(P); inp('Meeting')
    expect(mine('SHIFT_SOFT').length).toBe(1)
    expect(mine('INPUT_FLY').length).toBe(0)
  })

  it('the word typed on a ground row counts as the kind does — as TRAINING and DUTY already do', () => {
    expect(shiftHardLabel('SQN EVENT')).toBe(true)
    expect(shiftHardLabel('Event: games night')).toBe(true)
    expect(shiftHardLabel('EVENTS BRIEF'), 'a whole word, not a fragment').toBe(false)
    expect(shiftHardLabel('PREVENT FOD WALK'), 'a whole word, not a fragment').toBe(false)
    expect(shiftHardLabel('MEETING')).toBe(false)
  })
})
