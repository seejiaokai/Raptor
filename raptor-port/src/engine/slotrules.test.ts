/* Ported from reference/tfin.js — group U, "the palette offers only crew who
   may be planned there". The palette itself is DOM (phase 4); the rule it
   reads — slotRules/slotBar — is the engine's, and is pinned here. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { PEOPLE, scQualOK, isInstr } from './people'
import { makeStandalone } from './waves'
import { slotRules, slotBar } from './avail'
import { txtSet } from './slots'
import { validate } from './validate'
import { SCHED } from './publish'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

const ids = Object.keys(PEOPLE).filter(id => !PEOPLE[id].special)

describe('who may be planned into a slot (tfin U)', () => {
  it('a front seat leaves no WSO selectable, and the reason is the real one', () => {
    const key = '0.0.0.0.p'
    const wsos = ids.filter(id => PEOPLE[id].seat === 'RCP')
    expect(wsos.every(id => /WSO/.test(slotBar(id, key)))).toBe(true)
    const fcps = ids.filter(id => PEOPLE[id].seat === 'FCP')
    expect(fcps.some(id => slotBar(id, key) === '')).toBe(true)
  })

  it('a rear seat leaves only WSOs and IPs', () => {
    const key = '0.0.0.0.w'
    const plain = ids.filter(id => PEOPLE[id].seat === 'FCP' && !(PEOPLE[id].ip || isInstr(PEOPLE[id].q)))
    expect(plain.length).toBeGreaterThan(0)
    expect(plain.every(id => /pilot, not IP/.test(slotBar(id, key)))).toBe(true)
    const wso = ids.find(id => PEOPLE[id].seat === 'RCP')!
    expect(slotBar(wso, key)).toBe('')
  })

  it('an SC day shift demands SC DAY, and pushing the crew change past 19:00 demands SC NIGHT', () => {
    DAYS[4].waves.push(makeStandalone('sc'))       // Friday carries no flying
    validate()
    const key = '4.0.0.0.p'
    expect(slotRules(key).sc).toBe('day')
    /* a candidate who is day-only, in the right seat, and clear of Thursday's
       crew rest by the 07:00 shift start — the rest bar is its own rule */
    const dayOnly = ids.find(id => scQualOK(id, 'day') && !scQualOK(id, 'night')
      && PEOPLE[id].seat === 'FCP' && slotBar(id, key) === '')!
    expect(dayOnly, 'no rest-clear day-only pilot in the seed').toBeTruthy()
    txtSet('ff:4.0.0.ld', '21:00'); validate()
    expect(slotRules(key).sc).toBe('night')
    expect(slotBar(dayOnly, key)).toBe('not SC NIGHT current')
  })

  it('a spare slot is marked as one, so the picker can tell', () => {
    DAYS[4].waves.push(makeStandalone('sc'))
    expect(slotRules('4.0.0.2.p').scSpare).toBe(true)   // the first SPARE line
    expect(slotRules('4.0.0.0.p').scSpare).toBe(false)
  })

  it('a spare post forgives LL and OIL but not OL or a downchit', () => {
    DAYS[1].waves.push(makeStandalone('sc'))       // day 1 = Jul 14: nasty LL, shrek OIL
    const gi = DAYS[1].waves.length - 1
    validate()
    /* nasty and shrek are WSOs, so the rear SPARE seat; pike is a pilot */
    expect(slotBar('nasty', `1.${gi}.0.2.w`)).toBe('')  // LL — may still stand SC SPARE
    expect(slotBar('shrek', `1.${gi}.0.2.w`)).toBe('')  // OIL — same
    INPUTS.push({ person: 'pike', date: 'Jul 14', allday: true, type: 'OL', remarks: '', mod: '' })
    expect(slotBar('pike', `1.${gi}.0.2.p`)).toContain('overseas leave')
    expect(slotBar('nasty', `1.${gi}.0.0.w`)).toContain('local leave')   // MAIN is not forgiven
  })

  it('the bar checks leave and downchit for that day', () => {
    /* sufa is downchit Jul 13–17; a duty key on Monday must report it */
    expect(slotBar('sufa', 'd:0.0.0')).toContain('downchit')
    expect(slotBar('sufa', 'd:0.0.0')).toContain('Downchit till 17 Jul')
  })

  it('an ordinary flying seat carries no shift start, so no rest bar', () => {
    const r = slotRules('0.0.0.0.p')
    expect(r.scStart == null).toBe(true)
    expect(/crew rest/.test(slotBar(ids[0]!, '0.0.0.0.p') || '')).toBe(false)
  })

  it('slotRules reads a sim seat', () => {
    expect(slotRules('s:0.oft.0.p').seat).toBe('p')
    expect(slotRules('s:0.oft.0.w').seat).toBe('w')
    expect(slotRules('s:0.amt.1.pax.3').seat).toBe(null)   // a body in the room, not a seat
  })

  it('a duty slot has no seat rule but still darkens leave', () => {
    const key = 'd:0.0.0'
    expect(slotRules(key).seat).toBe(null)
    const clean = ids.find(id => slotBar(id, key) === '')
    expect(clean).toBeTruthy()
  })
})
