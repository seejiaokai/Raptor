import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { getState, initStore, setPeople, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

beforeEach(() => {
  initStore(memoryBackend())
})

/* THE LEAVE WAR HAS NO "EDIT PERSON" (D460, D461 — 30 Sep 26: "Just remove the edit person functionality in the leave
   war. U can only change in quals"). A man's seat, band and SXO change only on Quals; the war shows what the roster
   projection says (state/raptorRoster.ts — seat and SXO as Quals holds them, band from his CAT). These tests pinned the
   war's own editor (the name sheet's Edit person → Edit aircrew: Seat, Band, SXO); they now pin that it is gone and that
   what it used to change still reaches the grid — from the projection, the one door. `quals` stands in for Quals: the
   projection arriving with the man changed there. */
const quals = (id: string, patch: Partial<ReturnType<typeof getState>['people'][number]>) =>
  act(() => { setPeople(getState().people.map(p => (p.id === id ? { ...p, ...patch } : p))) })

describe('the Leave War has no Edit person', () => {
  it('offers a member the figures sheet and no editor', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('person-ramp'))
    expect(screen.getByTestId('person-figures')).toBeTruthy()
    expect(screen.queryByTestId('person-edit')).toBeNull()
  })

  it('offers an admin the figures sheet and no editor either', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('person-ramp'))
    expect(screen.getByTestId('person-figures')).toBeTruthy()
    expect(screen.queryByTestId('person-edit')).toBeNull()
    expect(screen.queryByTestId('person-sheet')).toBeNull()
  })
})

describe('the grid follows what Quals says', () => {
  it('an SXO ticked on Quals shows on the war — the chip and the SXO heading — and untagged, goes', () => {
    render(<Matrix />)
    quals('tata', { sxo: true })
    expect(screen.getByTestId('cat-tata').className).toContain('q-sxo')
    expect(screen.getByTestId('group-SXO')).toBeTruthy()
    quals('tata', { sxo: false })
    expect(screen.getByTestId('cat-tata').className).toContain('q-ins')
  })

  // The SXO row counts heads that hold the qualification: gaining it on Quals moves it…
  it('moves the SXO count when somebody gains SXO on Quals', () => {
    render(<Matrix />)
    const before = screen.getByTestId('count-sxo-2026-01-05').textContent
    quals('tata', { sxo: true })
    expect(screen.getByTestId('count-sxo-2026-01-05').textContent).not.toBe(before)
  })

  // …and the CATEGORY count must not move with it, because SXO sits on top of a category rather than instead of one.
  it('leaves the category count alone when SXO is added', () => {
    render(<Matrix />)
    const before = screen.getByTestId('count-ip-2026-01-05').textContent
    quals('tata', { sxo: true })
    expect(screen.getByTestId('count-ip-2026-01-05').textContent).toBe(before)
  })

  it('moves the category counts when a seat changes on Quals', () => {
    render(<Matrix />)
    const before = screen.getByTestId('count-ip-2026-01-05').textContent
    quals('tata', { seat: 'wso' })
    expect(screen.getByTestId('count-ip-2026-01-05').textContent).not.toBe(before)
  })
})
