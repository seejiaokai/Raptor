import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { advanceStage, getState, initStore, setCell, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { SelectSheet } from './SelectSheet'
import type { Selection } from './select'

// The batched selection sheet (owner, 27 Aug 26). The DRAG that opens it needs
// a real browser and is covered by e2e; here the sheet is rendered directly to
// pin that its chips drive the batch store writers with the right guards.

const cell = (person: string, date: string) => ({ personId: person, date })
const rampTwo: Selection = {
  people: ['ramp'],
  from: '2026-01-06',
  to: '2026-01-07',
  cells: [cell('ramp', '2026-01-06'), cell('ramp', '2026-01-07')],
}
const noop = () => {}
const mount = (sel: Selection, props: Partial<Parameters<typeof SelectSheet>[0]> = {}) =>
  render(
    <SelectSheet
      sel={sel}
      people={id => id}
      role="admin"
      canDecide={false}
      medical
      onDone={noop}
      onMove={noop}
      onClose={noop}
      {...props}
    />,
  )

beforeEach(() => { initStore(memoryBackend()); setRole('admin') })

describe('the selection sheet', () => {
  it('fills one code across the whole selection', () => {
    const onDone = vi.fn()
    mount(rampTwo, { onDone })
    fireEvent.click(screen.getByTestId('sel-LL'))
    expect(getState().grid.ramp['2026-01-06']).toBe('LL')
    expect(getState().grid.ramp['2026-01-07']).toBe('LL')
    expect(onDone).toHaveBeenCalledWith(true)
  })

  it('the portion rides the fill — a morning writes the *LL half', () => {
    mount(rampTwo)
    fireEvent.click(screen.getByTestId('sel-portion-am'))
    fireEvent.click(screen.getByTestId('sel-LL'))
    expect(getState().grid.ramp['2026-01-06']).toBe('*LL')
  })

  it('reports a partial write and keeps the sheet up', () => {
    const onDone = vi.fn()
    // tata carries a Raptor-owned OIL on 2026-01-09 (seed) — it must skip
    const sel: Selection = {
      people: ['tata'], from: '2026-01-08', to: '2026-01-09',
      cells: [cell('tata', '2026-01-08'), cell('tata', '2026-01-09')],
    }
    mount(sel, { onDone })
    fireEvent.click(screen.getByTestId('sel-LL'))
    expect(screen.getByTestId('sel-note').textContent).toMatch(/1 written\. 1 skipped/)
    expect(getState().grid.tata['2026-01-09']).toBe('OIL')
  })

  it('delete confirms on a second tap (no undo here)', () => {
    setCell('ramp', '2026-01-06', 'LL')
    setCell('ramp', '2026-01-07', 'LL')
    const onDone = vi.fn()
    mount(rampTwo, { onDone })
    fireEvent.click(screen.getByTestId('sel-delete'))
    expect(screen.getByTestId('sel-delete').textContent).toContain('sure')
    expect(getState().grid.ramp['2026-01-06']).toBe('LL') // not yet
    fireEvent.click(screen.getByTestId('sel-delete'))
    expect(getState().grid.ramp?.['2026-01-06']).toBeUndefined()
    expect(onDone).toHaveBeenCalled()
  })

  it('offers Decide only when told to, and it batch-approves', () => {
    setCell('ramp', '2026-01-06', 'LL')
    setCell('ramp', '2026-01-07', 'LL')
    expect(screen.queryByTestId('sel-approve')).toBeNull() // canDecide false by default
    // the store itself now refuses a decision unless an admin holds it at
    // closed/published (canDecide) — put the war in the state the sheet's
    // canDecide prop claims
    setRole('admin'); advanceStage()
    mount(rampTwo, { canDecide: true })
    fireEvent.click(screen.getByTestId('sel-approve'))
    expect(getState().states.ramp['2026-01-06'].state).toBe('approved')
    expect(getState().states.ramp['2026-01-07'].state).toBe('approved')
  })

  it('the Pending decision uses the app word, not "Acknowledge"', () => {
    mount(rampTwo, { canDecide: true })
    expect(screen.getByTestId('sel-pending').textContent).toBe('Pending')
  })

  it('a member sees no Medical row and no Decide row', () => {
    setRole('member')
    mount(rampTwo, { role: 'member', medical: false, canDecide: false })
    expect(screen.queryByTestId('sel-OML')).toBeNull()
    expect(screen.queryByTestId('sel-approve')).toBeNull()
    expect(screen.getByTestId('sel-LL')).toBeTruthy() // but can still fill
  })

  it('hides Delete and Move when the box holds no movable bid (Fill-only)', () => {
    // rampTwo's cells are empty here — nothing to delete or move
    mount(rampTwo)
    expect(screen.queryByTestId('sel-delete')).toBeNull()
    expect(screen.queryByTestId('sel-move')).toBeNull()
    expect(screen.getByTestId('sel-LL')).toBeTruthy() // Fill still offered
  })

  it('shows Delete and Move once the box holds a movable bid', () => {
    setCell('ramp', '2026-01-06', 'LL')   // one input inside the box
    mount(rampTwo)
    expect(screen.getByTestId('sel-delete')).toBeTruthy()
    expect(screen.getByTestId('sel-move')).toBeTruthy()
  })

  it('offers Post-out only for a single-person selection', () => {
    const onPostOut = vi.fn()
    mount(rampTwo, { onPostOut })
    expect(screen.getByTestId('sel-postout')).toBeTruthy()
    const twoPeople: Selection = {
      people: ['ramp', 'dusk'], from: '2026-01-06', to: '2026-01-06',
      cells: [cell('ramp', '2026-01-06'), cell('dusk', '2026-01-06')],
    }
    mount(twoPeople, { onPostOut })
    expect(screen.queryAllByTestId('sel-postout')).toHaveLength(1) // only the first mount's
  })
})
