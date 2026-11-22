/* AN INPUT'S SQUADRONS — ONE BODY (the reshape plan §3.2 A-iii, §3.4): its span, the squadrons it touches across a
   move, the day reader against the list reader, the year's end and an end before its start. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, acrossMove, PID } from '../test-support/msq-world'
import { INPUTS, inputSpanIso, inputSquadrons, inputOnDay, inputTouches, inputsTouching, inputsListed, inputUnitOf, inputBelongs } from '../engine/inputs'
import { homeHandle } from '../engine/roster'

useMsqWorld()
const R = PID.ranger
const add = (r: any) => { INPUTS.push(r); return INPUTS[INPUTS.length - 1] }

describe('inputSpanIso', () => {
  it('one day, a span, the year\'s end, an end before its start', () => {
    expect(inputSpanIso({ person: R, date: 'Jul 14', yr: 2026 })).toEqual(['2026-07-14', '2026-07-14'])
    expect(inputSpanIso({ person: R, date: 'Jul 14', endDate: 'Jul 17', yr: 2026 })).toEqual(['2026-07-14', '2026-07-17'])
    expect(inputSpanIso({ person: R, date: 'Dec 30', endDate: 'Jan 2 2027', yr: 2026 })).toEqual(['2026-12-30', '2027-01-02'])
    /* never written by the app: its first day alone — never no day, never a year later (Opus L6) */
    expect(inputSpanIso({ person: R, date: 'Jul 17', endDate: 'Jul 14', yr: 2026 })).toEqual(['2026-07-17', '2026-07-17'])
  })
})

describe('across Ranger\'s move (142 → 149 from Thu 16 Jul)', () => {
  it('a leave from Tue 14 to Fri 17 Jul touches both squadrons; a day reader reads each day\'s', () => {
    const leave = add({ person: R, date: 'Jul 14', endDate: 'Jul 17', allday: true, type: 'LL', yr: 2026 })
    acrossMove(R, 'u142', 'u149')
    expect(inputSquadrons(leave).sort()).toEqual(['u142', 'u149'])
    expect(inputTouches(leave, 'u142') && inputTouches(leave, 'u149')).toBe(true)
    expect(['2026-07-14', '2026-07-16'].map(d => inputOnDay(leave, 'u142', d))).toEqual([true, false])
    expect(inputsTouching('u149')).toContain(leave)
    /* whose people its window offers: the squadron of its first day */
    expect(inputUnitOf(leave)).toBe('u142')
    /* today's inputBelongs, with and without a day — unchanged */
    expect(inputBelongs(leave, 'u142')).toBe(true)
    expect(inputBelongs(leave, 'u149', '2026-07-17')).toBe(true)
  })
  it('a leave wholly before the move, or wholly after, touches one squadron', () => {
    const before = add({ person: R, date: 'Jul 14', endDate: 'Jul 15', allday: true, type: 'LL', yr: 2026 })
    const after = add({ person: R, date: 'Jul 20', endDate: 'Jul 21', allday: true, type: 'LL', yr: 2026 })
    acrossMove(R, 'u142', 'u149')
    expect(inputSquadrons(before)).toEqual(['u142'])
    expect(inputSquadrons(after)).toEqual(['u149'])
  })
  it('his own Inputs list keeps every input naming him, wherever it sits (C2)', () => {
    const after = add({ person: R, date: 'Jul 20', allday: true, type: 'LL', yr: 2026 })
    acrossMove(R, 'u142', 'u149')
    expect(inputsListed('u142', R)).toContain(after)
    expect(inputsListed('u142', PID.hunter)).not.toContain(after)
  })
  it('an end before its start is judged on its first day\'s squadrons (Opus L6)', () => {
    const odd = add({ person: R, date: 'Jul 17', endDate: 'Jul 14', allday: true, type: 'LL', yr: 2026 })
    acrossMove(R, 'u142', 'u149')
    expect(inputSquadrons(odd)).toEqual(['u149'])
  })
})

describe('a placeholder-only input (ALL AVAIL / ALL)', () => {
  it('its filer\'s squadron on its first day — or the squadron stamped on it (the C3 slot)', () => {
    const meet = add({ person: 'allavail', by: PID.hunter, date: 'Jul 24', allday: true, type: 'Meeting', yr: 2026 })
    expect(inputSquadrons(meet)).toEqual(['u142'])
    const stamped = add({ person: 'allavail', by: PID.hunter, date: 'Jul 24', allday: true, type: 'Meeting', yr: 2026, u: 'u142' })
    acrossMove(PID.hunter, 'u142', 'u149')
    expect(inputSquadrons(meet)).toEqual(['u149'])
    expect(inputSquadrons(stamped)).toEqual(['u142'])
    expect(inputOnDay(stamped, 'u142', '2026-07-24')).toBe(true)
  })
})

describe('the gate hands in its own handle', () => {
  it('inputSquadrons reads the handle it is given, never the live one', () => {
    const leave = add({ person: R, date: 'Jul 14', endDate: 'Jul 17', allday: true, type: 'LL', yr: 2026 })
    const fixed = { on: () => 'u150', changesIn: () => [] }
    expect(inputSquadrons(leave, fixed)).toEqual(['u150'])
    expect(inputSquadrons(leave, homeHandle())).toEqual(['u142'])
  })
})
