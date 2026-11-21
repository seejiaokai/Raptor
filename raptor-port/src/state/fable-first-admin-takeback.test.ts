// @vitest-environment jsdom
/* FABLE F1 — the first admin's move into his new squadron can never be taken back or undone (Piece C, lastadmin.ts).
   150 is new, Hunter its first admin by Plan. Saber saves Hunter's move into 150 (from Thu 16 Jul), then — the same
   minute — takes it back, or presses Undo. Both leave exactly the world that stood before the move (Hunter at home in
   142, his Plan of 150 holding on every day), which the lock accepted. RED while the lock refuses them. */
import { describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT } from '../test-support/msq-world'
import { levelIn } from './accounts'
import { addUnit, setHome, unitsLoad, homeOn } from './units'
import { globalUndo } from '../undo/timeline'

useMsqWorld()
function movedIn(): string {
  signInAs('saber')
  const r = addUnit('150', 'p1', ACCT.hunter)
  expect(r.ok, JSON.stringify(r)).toBe(true)
  expect(setHome(PID.hunter, r.id!).ok, 'his move into 150 saved').toBe(true)
  unitsLoad()
  expect(homeOn(PID.hunter, '2026-07-16')).toBe(r.id)
  return r.id!
}
describe('F1 — Hunter, the first admin of 150, moved into 150 by mistake', () => {
  it('the same day Saber takes the move back: allowed — 150 keeps Hunter by his Plan, as before the move', () => {
    const u = movedIn()
    const r = setHome(PID.hunter, 'u142')
    unitsLoad()
    expect(r, 'the take-back').toMatchObject({ ok: true })
    expect(homeOn(PID.hunter, '2026-07-16')).toBe('u142')
    expect(levelIn(ACCT.hunter, u, '2026-07-16'), 'his Plan of 150 never ended').toBe('admin')
  })
  it('the same day Saber presses Undo: the move is undone', () => {
    const u = movedIn()
    const r = globalUndo() as any
    unitsLoad()
    expect(r.ok, JSON.stringify({ ok: r.ok, reason: r.reason })).toBe(true)
    expect(homeOn(PID.hunter, '2026-07-16')).toBe('u142')
    expect(levelIn(ACCT.hunter, u, '2026-07-16')).toBe('admin')
  })
  it('(control) a retarget to 149 instead is still refused — his Plan of 150 would end on the 16th', () => {
    movedIn()
    expect(setHome(PID.hunter, 'u149').ok).toBe(false)
  })
})
