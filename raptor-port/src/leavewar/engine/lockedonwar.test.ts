/* [LW-LOCKMARK] (31 Oct 26) — WHETHER THE WAR MAY WRITE A DAY IS ASKED OF THE DAY'S OWN ENTRIES (design §6). The merge used to
   synthesise a `source: 'raptor'` mark on the day's record and the grid asked that (`raptorOwns`); the mark went and
   `lockedOnWar` answers from the day view — the same answer for every case the mark carried, pinned here one by one. */
import { describe, expect, it } from 'vitest'
import { AM, FULL, PM, dayView, lockedOnWar, type Contrib } from './dayview'

const leave = (over: Partial<Contrib> = {}): Contrib => ({ id: 'i1', kind: 'absence', code: 'LL', win: FULL, lw: true, ...over })

describe('lockedOnWar — the day locked on the war, from its own entries', () => {
  it('an empty day, or none at all, is open', () => {
    expect(lockedOnWar(undefined)).toBe(false)
    expect(lockedOnWar(dayView([]))).toBe(false)
  })
  it('a bid the war placed keeps the day open — pending or refused', () => {
    for (const state of ['pending', 'refused'] as const)
      expect(lockedOnWar(dayView([{ id: 'r1', kind: 'request', code: 'LL', win: FULL, state }]))).toBe(false)
  })
  it('an award given on the war keeps it open; a credit the app worked out locks it', () => {
    expect(lockedOnWar(dayView([{ id: 'c1', kind: 'credit', code: 'FO', win: FULL }]))).toBe(false)
    expect(lockedOnWar(dayView([{ id: 'c1', kind: 'credit', code: 'FO', win: FULL, auto: true }]))).toBe(true)
  })
  it('leave the war approved keeps it open; leave filed on the Inputs page locks it', () => {
    expect(lockedOnWar(dayView([leave()]))).toBe(false)
    expect(lockedOnWar(dayView([leave({ lw: false })]))).toBe(true)
  })
  it('a medical, a course or overseas duty locks it, even one approved on the war', () => {
    for (const code of ['ATTC', 'HL', 'OML', 'CSE', 'OD']) expect(lockedOnWar(dayView([leave({ code, lw: true })])), code).toBe(true)
  })
  it('war-approved leave beside an absence filed on the Inputs page: the whole day is locked', () => {
    expect(lockedOnWar(dayView([leave({ id: 'a', win: AM }), leave({ id: 'b', win: PM, lw: false })]))).toBe(true)
  })
})
