// @vitest-environment jsdom
/* Fable, share 1 — proof: the SANS day window reads its people and its commitments for `pageUnit('own', iso)` — the
   viewer's squadron ON THE DAY SHOWN — while the page it belongs to (the SANS calendar's month, its flying answer, its
   facts) is `pageUnit('own')` today. Ranger, 142's member today (Wed 15 Jul), 149's from Thu 16 Jul, opens Fri 17 Jul
   on his own SANS calendar: the page is 142's, yet the window lists a 149 man's commitment (another squadron's Inputs
   to a man who is not yet its — D2194, D2252), and leaves out 142's. */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { useMsqWorld, signInAs, moveMan, PID } from '../test-support/msq-world'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { writeInputsBatch } from '../state/store'
import { pageUnit } from '../state/perms'
import { SansDay } from './SansDay'
import { sansCalUnit } from './SansCal'
import { _resetFloatWins } from './winorder'

useMsqWorld()
afterEach(() => { cleanup(); _resetFloatWins() })

const FRI = '2026-07-17'
describe("Ranger's SANS day window for a day after his move, opened before it", () => {
  it("lists his own page's squadron's commitments — 142's — not 149's", () => {
    signInAs('saber')
    ;(PEOPLE as any)[PID.osprey].san = true
    const own142 = Object.keys(PEOPLE).find(id => (PEOPLE as any)[id].san && !(PEOPLE as any)[id].archived && !(PEOPLE as any)[id].special && id !== PID.osprey)!
    expect(own142, 'a 142 SANS man in the seed').toBeTruthy()
    expect(writeInputsBatch(() => {
      INPUTS.push({ iid: 'f1s149', person: PID.osprey, type: 'SANS Availability', date: 'Jul 17', yr: 2026, sans: { f: true }, allday: true, mod: '2026-07-01', by: PID.saber, ord: 99970 } as any)
      INPUTS.push({ iid: 'f1s142', person: own142, type: 'SANS Availability', date: 'Jul 17', yr: 2026, sans: { f: true }, allday: true, mod: '2026-07-01', by: PID.saber, ord: 99971 } as any)
    })).toBeTruthy()
    moveMan(PID.ranger, 'u149')
    signInAs('ranger')
    expect([sansCalUnit(), pageUnit('own')], "his SANS calendar is 142's today").toEqual(['u142', 'u142'])
    render(<SansDay iso={FRI} hi={null} onClose={() => {}} />)
    const text = screen.getByTestId('win-sansday').textContent || ''
    const cs = (id: string) => String((PEOPLE as any)[id].cs)
    expect(text.includes(cs(PID.osprey)), "149's Osprey listed on 142's page").toBe(false)
    expect(text.includes(cs(own142)), "142's own SANS man listed").toBe(true)
  })
})
