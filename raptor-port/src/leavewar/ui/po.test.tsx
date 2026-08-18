// Post out (PO) — owner, 18 Aug 26. Marking a person posted out takes them off
// the manpower from that day on and greys their boxes. The grey `.gone` hatch
// and the manning exclusion already keyed off a person's posting-out date
// (`to`); these tests cover the new WRITE PATH — an admin taps a day to place
// it, and a struck day to undo it.

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { getState, initStore, setPostOut, setRole } from '../state/store'
import { countsFor, inSquadron } from '../engine'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

beforeEach(() => {
  initStore(memoryBackend())
})

const anId = () => getState().people[0]!.id

describe('setPostOut', () => {
  it('posts a person out from the given day (last day is the day before), admin only', () => {
    const id = anId()
    setRole('member')
    expect(setPostOut(id, '2026-06-15')).toBe(false)
    setRole('admin')
    expect(setPostOut(id, '2026-06-15')).toBe(true)
    const p = () => getState().people.find(x => x.id === id)!
    expect(p().to).toBe('2026-06-14')
    expect(inSquadron(p(), '2026-06-14')).toBe(true)   // last day in
    expect(inSquadron(p(), '2026-06-15')).toBe(false)  // gone from the tapped day
    expect(setPostOut(id, null)).toBe(true)            // undo
    expect(p().to).toBeNull()
  })

  it('drops the person from the manning counts on and after the post-out day', () => {
    const id = anId()
    const before = countsFor(getState().people, getState().grid, getState().states, '2026-06-15')
    const total = (c: typeof before) => c.byCategory.IP + c.byCategory.OPSP + c.byCategory.IWSO + c.byCategory.OPSW
    setRole('admin')
    setPostOut(id, '2026-06-15')
    const after = countsFor(getState().people, getState().grid, getState().states, '2026-06-15')
    expect(total(after)).toBe(total(before) - 1)
  })
})

describe('placing and undoing PO from the grid', () => {
  it('an admin taps a day to post out, and the struck day to undo', () => {
    const id = anId()
    const day = '2026-06-15'
    setRole('admin')
    render(<Matrix />)

    // Tap the day → the bid sheet carries a "Post out from here" control.
    fireEvent.click(screen.getByTestId(`cell-${id}-${day}`))
    fireEvent.click(screen.getByTestId('bid-postout'))
    expect(getState().people.find(x => x.id === id)!.to).toBe('2026-06-14')

    // The cell now reads as posted out (the greyed `.gone` hatch).
    expect(screen.getByTestId(`cell-${id}-${day}`).className).toContain('gone')

    // Tap the struck day → the ONLY control is Undo, which puts them back.
    fireEvent.click(screen.getByTestId(`cell-${id}-${day}`))
    expect(screen.queryByTestId('bid-picker')).toBeNull()  // not the bid sheet
    fireEvent.click(screen.getByTestId('postout-undo'))
    expect(getState().people.find(x => x.id === id)!.to).toBeNull()
  })
})
