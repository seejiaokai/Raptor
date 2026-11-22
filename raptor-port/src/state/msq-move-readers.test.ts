// @vitest-environment jsdom
/* THE BEHAVIOUR GUARD OVER A SQUADRON MOVE (the reshape plan §2, Piece 0 — Fable's "the guards count spellings, not
   behaviour", C shape 4). The two enumeration guards (engine/roster-readers.test.ts, engine/inputsfor-readers.test.ts)
   count how a list is walked; they cannot see a reader that walks it the right way on the WRONG DAY. This table asks
   each reader the question a person's screen asks, on the three days around one move — Ranger, 142 → 149, saved on
   Wed 15 Jul 26, counting from Thu 16 Jul (D2119): the day before it counts, the move day, the day after.

   Each row is one reader. The rows right today are here now; a row of an open fault is added RED FIRST with its fix
   (the plan §9.1), so this file is never committed red. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, acrossMove, pastMidnight, on, signInAs, PID } from '../test-support/msq-world'
import { homeOn } from './units'
import { rosterOf, unitPeople, onRosterOf, homeUnitOf } from '../engine/roster'
import { INPUTS, inputsFor, inputBelongs } from '../engine/inputs'
import { getVersion } from './store'

useMsqWorld()

const R = PID.ranger
type Days = { before: string; moveDay: string; after: string }
const three = (d: Days) => [d.before, d.moveDay, d.after] as const

describe('the world itself (Piece 0)', () => {
  it('the move is saved through the real door and counts from tomorrow', () => {
    const d = acrossMove(R, 'u142', 'u149')
    expect(d).toEqual({ before: '2026-07-15', moveDay: '2026-07-16', after: '2026-07-17' })
  })
  it('pastMidnight moves the clock and the app\'s own wake tells the page — no notify() called by the test', () => {
    on(15, 23, 58)
    const v = getVersion()
    expect(pastMidnight()).toBe('2026-07-16')
    expect(getVersion()).toBeGreaterThan(v)
  })
  it('the five seeded sign-ins sign in', () => {
    for (const who of ['saber', 'hunter', 'ranger', 'kestrel', 'osprey'] as const) expect(signInAs(who), who).toMatchObject({ kind: 'ok' })
  })
})

describe('each reader, on the day before his move, the move day and the day after', () => {
  it('his squadron (state/units.ts homeOn, the engine\'s homeUnitOf)', () => {
    const d = acrossMove(R, 'u142', 'u149')
    expect(three(d).map(x => homeOn(R, x))).toEqual(['u142', 'u149', 'u149'])
    expect(three(d).map(x => homeUnitOf(R, x))).toEqual(['u142', 'u149', 'u149'])
  })
  it('each squadron\'s roster (rosterOf, onRosterOf, unitPeople) — the crew list, the palette, the SANS day read it by day', () => {
    const d = acrossMove(R, 'u142', 'u149')
    expect(three(d).map(x => rosterOf('u142', x).includes(R))).toEqual([true, false, false])
    expect(three(d).map(x => rosterOf('u149', x).includes(R))).toEqual([false, true, true])
    expect(three(d).map(x => onRosterOf(R, 'u149', x))).toEqual([false, true, true])
    expect(three(d).map(x => R in unitPeople('u142', x))).toEqual([true, false, false])
  })
  it('a day reader of his leave across the move (inputsFor with the day) — each day on that day\'s squadron', () => {
    INPUTS.push({ person: R, date: 'Jul 15', endDate: 'Jul 17', allday: true, type: 'LL', remarks: '', mod: '' })
    const leave = INPUTS[INPUTS.length - 1]
    const d = acrossMove(R, 'u142', 'u149')
    expect(three(d).map(x => inputBelongs(leave, 'u142', x))).toEqual([true, false, false])
    expect(three(d).map(x => inputsFor('u149', x).includes(leave))).toEqual([false, true, true])
  })
})
