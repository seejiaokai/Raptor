// @vitest-environment jsdom
/* A7'S LINE THROUGH THE TOP BAR'S UNDO (the reshape plan docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §6.2 A7;
   §10 "A7's Undo sentence through the top bar's Undo" — war's sentence (leavewar/sync.ts warDayRefusal) and helper "undo &
   roles"' one line in state/undo-wire.ts's `restoreRefusal`; §11's A7 row, the words approved by his D2243, Q3 and Q6).
   An Undo that would put an entry back on a day now another squadron's says war's sentence before anything is written;
   removing one entry of a two-entry cell, or its last entry, still passes (D148: his own earlier entry can still be undone).
   The world: test-support/msq-world.ts (Wed 15 Jul 26, 142's war loaded). Ranger's move to 149 from Thu 16 Jul is written
   as his home rows (as leavewar/multi-sqn-fixread11.test.ts writes them), so it is no Undo step of Saber's. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, mem, PID } from '../test-support/msq-world'
import { unitsLoad } from '../state/units'
import { HOME_PFX } from '../state/units-model'
import { setCell, recordsAt, worldUnit } from './state/store'
import { globalUndo } from '../undo/timeline'

useMsqWorld()

const FRI = '2026-07-17'
const rangerMovesOn16 = () => {
  ;[['u142', '2026-07-01'], ['u149', '2026-07-16']].forEach(([unit, from], i) => {
    mem['sqn142_' + HOME_PFX + 'hr' + i] = JSON.stringify({ id: 'hr' + i, pid: PID.ranger, unit, from })
  })
  unitsLoad()
}
const entriesOn = (iso: string) => recordsAt(PID.ranger, iso)

describe("A7's line — an Undo that would put Ranger's leave back on a day now 149's", () => {
  it("Saber clears Ranger's Fri 17 Jul leave on 142's war; Ranger moves to 149 from Thu 16 Jul; Undo: war's sentence, nothing written", () => {
    signInAs('saber')
    expect(worldUnit()).toBe('u142')
    expect(setCell(PID.ranger, FRI, 'LL')).toBe(true)
    expect(setCell(PID.ranger, FRI, '')).toBe(true)
    rangerMovesOn16()
    const u = globalUndo()
    expect(u.ok).toBe(false)
    expect(u.reason).toBe("Ranger is 149's from Thu 16 Jul, so this can't go back into 142's Leave War.")
    expect(entriesOn(FRI), 'nothing written').toEqual([])
  })

  it('(passes) the Undo of putting his leave there — its last entry taken off', () => {
    signInAs('saber')
    expect(setCell(PID.ranger, FRI, 'LL')).toBe(true)
    rangerMovesOn16()
    const u = globalUndo()
    expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    expect(entriesOn(FRI)).toEqual([])
  })

  it('(passes) the Undo of one entry of a two-entry cell — his afternoon bid beside his morning one', () => {
    signInAs('saber')
    /* (a half day is written with its star: `LL*` the morning, `*LL` the afternoon — leavewar/engine/codes.ts parseCell) */
    expect(setCell(PID.ranger, FRI, 'LL*')).toBe(true)
    expect(setCell(PID.ranger, FRI, '*LL')).toBe(true)
    expect(entriesOn(FRI), 'two entries').toHaveLength(2)
    rangerMovesOn16()
    const u = globalUndo()
    expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    expect(entriesOn(FRI).map((r: any) => r.code), 'the afternoon gone, his morning left').toEqual(['LL*'])
  })
})
