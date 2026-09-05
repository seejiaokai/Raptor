/* The drop delta (state/dropflag.ts, 5 Sep 26): what a drop or plant says
   the moment it lands, read off the difference between WARN before and
   after the epilogue's one validate(). Pure, fixture-driven — the drag and
   plant paths that feed it real WARNs are pinned in ui/drag.test.tsx and
   state/store.test.ts. */
import { afterEach, describe, expect, it } from 'vitest'
import { warnDelta, warnKey, flagLine, flagDrop, isNewFlag, NEWFLAGS } from './dropflag'
import { HOOKS } from '../engine/hooks'
import { PEOPLE } from '../engine/people'

const W = (o: any) => ({ sev: 'hard', code: 'X', who: ['casper'], day: 'Thursday', di: 3, msg: 'm', key: null, ...o })
const warn = (all: any[]) => ({ all, byDay: [[], [], [], [], [], [], []], sev: {}, chip: {}, dash: {}, trace: {} })
const cs = PEOPLE.casper.cs

describe('warnDelta — what is new after the write', () => {
  it('is the warnings after that were not there before, by code+day+who+message', () => {
    const a = W({ msg: 'one' }), b = W({ msg: 'two' })
    const d = warnDelta(warn([a]), warn([a, b]))
    expect(d.map(warnKey)).toEqual([warnKey(b)])
  })
  it('the same breach on a different day is new; the same breach re-raised is not', () => {
    const a = W({ di: 3 })
    expect(warnDelta(warn([a]), warn([W({ di: 3 })])).length).toBe(0)
    expect(warnDelta(warn([a]), warn([W({ di: 4, day: 'Friday' })])).length).toBe(1)
  })
  it('notes are left out — the chip says it, the toast is for breaches', () => {
    expect(warnDelta(warn([]), warn([W({ sev: 'note', code: 'LONGDAY' })])).length).toBe(0)
    expect(warnDelta(warn([]), warn([W({ sev: 'adv', code: 'TURN' })])).length).toBe(1)
  })
  it('leads with the flag the puck prints: hard before advisory, then the chip rank', () => {
    const c = W({ code: 'DOUBLE_BOOK', msg: 'c' }), q = W({ code: 'QUAL', msg: 'q' }), t = W({ code: 'TURN', sev: 'adv', msg: 't' })
    expect(warnDelta(warn([]), warn([t, c, q])).map((w: any) => w.code)).toEqual(['QUAL', 'DOUBLE_BOOK', 'TURN'])
    /* a code the table does not know still comes through, after the rest */
    expect(warnDelta(warn([]), warn([W({ code: 'NEW_RULE', msg: 'n' }), q])).map((w: any) => w.code)).toEqual(['QUAL', 'NEW_RULE'])
  })
  it('a baseline that was never validated answers nothing rather than the whole week', () => {
    expect(warnDelta({ all: [], byDay: [] }, warn([W({})])).length).toBe(0)
    expect(warnDelta(null, warn([W({})])).length).toBe(0)
  })
})

describe('flagLine — the validator’s words, the day in front when it is not the drop day', () => {
  it('keeps a message that already opens with the callsign', () => {
    expect(flagLine(W({ msg: `${cs} is a WSO — cannot fly FCP` }), 3)).toBe(`${cs} is a WSO — cannot fly FCP`)
  })
  it('puts the callsign in front of a message that names events, not the man', () => {
    expect(flagLine(W({ msg: 'VL BFM & SC AM clash' }), 3)).toBe(`${cs} — VL BFM & SC AM clash`)
  })
  it('prefixes the day when the breach landed on a day other than the one dropped on', () => {
    expect(flagLine(W({ msg: `${cs} is on the programme 7 days in a row`, di: 6, day: 'Sunday' }), 2))
      .toBe(`Sun · ${cs} is on the programme 7 days in a row`)
    expect(flagLine(W({ msg: `${cs} x`, di: 2, day: 'Wednesday' }), 2)).toBe(`${cs} x`)
  })
})

describe('flagDrop — speaks once, in the breach’s colour, and marks the pucks to pulse', () => {
  const said: any[] = []
  const t0 = HOOKS.toast
  afterEach(() => { HOOKS.toast = t0; said.length = 0; NEWFLAGS.clear() })

  it('returns false and says nothing when the drop raised nothing new', () => {
    HOOKS.toast = (m: any, k?: any) => { said.push([m, k]) }
    expect(flagDrop(warn([W({})]), 3, warn([W({})]))).toBe(false)
    expect(said.length).toBe(0)
    expect(NEWFLAGS.size).toBe(0)
  })
  it('toasts the first new warning, hard in red, with a count of the rest', () => {
    HOOKS.toast = (m: any, k?: any) => { said.push([m, k]) }
    expect(flagDrop(warn([]), 3, warn([W({ msg: `${cs} one` }), W({ msg: `${cs} two`, sev: 'adv' })]))).toBe(true)
    expect(said).toEqual([[`${cs} one (+1 more)`, 'hard']])
  })
  it('an advisory alone is amber', () => {
    HOOKS.toast = (m: any, k?: any) => { said.push([m, k]) }
    flagDrop(warn([]), 3, warn([W({ msg: `${cs} tight`, sev: 'adv' })]))
    expect(said[0][1]).toBe('warn')
  })
  it('marks every named man on the day of his new flag, for a moment', () => {
    HOOKS.toast = () => {}
    flagDrop(warn([]), 3, warn([W({ who: ['casper', 'nact'], di: 6 }), W({ who: ['split'], di: 0, msg: 'z' })]))
    expect(isNewFlag(6, 'casper')).toBe(true)
    expect(isNewFlag(6, 'nact')).toBe(true)
    expect(isNewFlag(0, 'split')).toBe(true)
    expect(isNewFlag(3, 'casper')).toBe(false)
    /* expired entries drop out on read */
    NEWFLAGS.set('6:casper', Date.now() - 1)
    expect(isNewFlag(6, 'casper')).toBe(false)
    expect(NEWFLAGS.has('6:casper')).toBe(false)
  })
})
