/* GRANT OIL OVER A DRAG (his D1394, 26 Oct 26 — "one grant on each day picked … one reason for all of them"; [LW-DRAG-GRANT-OIL]).
   The drag window carries Grant OIL in the third place of the row under the leaves, an admin's, as the one-day window does
   (D1349). Its amount is the one control (D1392, D1395 H): it opens on half a day for a morning or afternoon Duration and a
   day for a whole one; every person-day dragged then gets ONE award of it, one reason and one giver for all, in one Undo. */
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { awardsOnDay, initStore, lwHistInit, setDayAward, setPeople, setRole } from '../state/store'
import { globalUndo } from '../../undo'
import { initStore as raptorInitStore } from '../../state/store'
import { setSession } from '../../state/auth'
import { projectPeople } from '../state/raptorRoster'
import { wireLeaveWarSync } from '../sync'
import { _resetTimeline } from '../../undo/timeline'
import { installGlobalUndo } from '../../state/undo-wire'
import { memoryBackend } from '../state/storage'
import { SelectSheet } from './SelectSheet'

const ISNAP = JSON.stringify(INPUTS)
const P = 'dusk'
const D1 = '2026-02-10', D2 = '2026-02-11'
const sel = { people: [P], from: D1, to: D2, cells: [{ personId: P, date: D1 }, { personId: P, date: D2 }] }

beforeEach(() => {
  try { localStorage.clear() } catch { /* none */ }
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore()
  initStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  setRole('admin')
})
afterEach(() => { _resetTimeline(); setSession(null); INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })

let done = 0
const mount = (role: 'admin' | 'member' = 'admin') => {
  done = 0
  render(<SelectSheet sel={sel as any} people={() => 'Dusk'} role={role} canDecide={role === 'admin'}
    onDone={() => { done++ }} onMove={() => {}} onClose={() => {}} />)
}
const pressed = (id: string) => screen.getByTestId(id).getAttribute('aria-pressed') === 'true'

describe('Grant OIL in the drag window (D1394)', () => {
  it('an admin\'s, in the row under the leaves; a member has none', () => {
    mount('member')
    expect(screen.queryByTestId('sel-oil')).toBeNull()
  })

  it('a whole-day Duration opens on FO · 1; one grant on each day, one reason, in one Undo', () => {
    mount()
    fireEvent.click(screen.getByTestId('sel-oil'))
    expect(pressed('sel-oil-pick-fo')).toBe(true)
    fireEvent.change(screen.getByTestId('sel-oil-why'), { target: { value: 'Weekend exercise' } })
    expect(screen.getByTestId('sel-oil-give').textContent).toBe('Give FO')
    fireEvent.click(screen.getByTestId('sel-oil-give'))
    for (const d of [D1, D2]) {
      expect(awardsOnDay(P, d), d).toHaveLength(1)
      expect(awardsOnDay(P, d)[0], d).toMatchObject({ amount: 1, reason: 'Weekend exercise' })
    }
    expect(done).toBe(1)
    globalUndo()
    expect(awardsOnDay(P, D1).length + awardsOnDay(P, D2).length, 'one Undo takes them all').toBe(0)
  })

  it('a morning Duration opens on HO · ½: half a day on each, drawn in the morning (D1391)', () => {
    mount()
    fireEvent.click(screen.getByTestId('sel-portion-am'))
    fireEvent.click(screen.getByTestId('sel-oil'))
    expect(pressed('sel-oil-pick-ho')).toBe(true)
    fireEvent.click(screen.getByTestId('sel-oil-give'))
    for (const d of [D1, D2]) expect(awardsOnDay(P, d)[0], d).toMatchObject({ amount: 0.5, half: 'am' })
  })

  it('any other amount typed, as on the one-day window (D1392); a day already holding an award gains this one (D82)', () => {
    expect(setDayAward(P, D1, 1, { note: 'earlier' })).toBeNull()
    mount()
    fireEvent.click(screen.getByTestId('sel-oil'))
    fireEvent.change(screen.getByTestId('sel-oil-days'), { target: { value: '2' } })
    expect(screen.getByTestId('sel-oil-give').textContent).toBe('Give FO · 2 days')
    fireEvent.click(screen.getByTestId('sel-oil-give'))
    expect(awardsOnDay(P, D1).map(a => a.amount).sort()).toEqual([1, 2])
    expect(awardsOnDay(P, D2).map(a => a.amount)).toEqual([2])
  })

  it('a refusal is said in the window, and nothing is written', () => {
    mount()
    fireEvent.click(screen.getByTestId('sel-oil'))
    fireEvent.change(screen.getByTestId('sel-oil-days'), { target: { value: '0.3' } })
    fireEvent.click(screen.getByTestId('sel-oil-give'))
    expect(screen.getByTestId('sel-oil-err').textContent).toBeTruthy()
    expect(awardsOnDay(P, D1)).toHaveLength(0)
    expect(done).toBe(0)
  })
})
