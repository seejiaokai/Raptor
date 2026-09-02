import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { getState, initStore, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

beforeEach(() => {
  initStore(memoryBackend())
})

/* The one ⚙ SETTINGS button (owner, 3 Sep 26): every admin config control folds
   into the sheet it opens, off the top row. Rearranging is NOT in it — that is on
   the grid, started from the ⠿ in the corner. */
describe('the ⚙ Settings sheet', () => {
  it('is admin-only, and folds the config controls into one sheet', () => {
    // a member has neither the button nor any of the controls it holds
    const member = render(<Matrix />)
    expect(screen.queryByTestId('settings-open')).toBeNull()
    expect(screen.queryByTestId('counter-add')).toBeNull()
    member.unmount()

    setRole('admin')
    const { rerender } = render(<Matrix />)
    fireEvent.click(screen.getByTestId('settings-open'))
    rerender(<Matrix />)
    expect(screen.getByTestId('settings-sheet')).toBeTruthy()
    // counters & rows live here now
    expect(screen.getByTestId('counter-add')).toBeTruthy()
    expect(screen.getByTestId('event-add')).toBeTruthy()
    expect(screen.getByTestId('sans-toggle')).toBeTruthy()
    expect(screen.getByTestId('counter-reset-all')).toBeTruthy()
    // the groups editor is folded in
    expect(screen.getByTestId('group-reset')).toBeTruthy()
    // …but rearranging is NOT in the sheet — no Auto-sort here
    expect(screen.queryByTestId('roster-autosort')).toBeNull()
  })

  it('Show SANS adds the SANS group row, whose ✕ hides SANS again', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('settings-open'))
    // no SANS group row until the switch is on
    expect(screen.queryByTestId('grow-SANS')).toBeNull()
    fireEvent.click(screen.getByTestId('sans-toggle'))
    expect(getState().showSans).toBe(true)
    expect(screen.getByTestId('grow-SANS')).toBeTruthy()
    // the SANS row's ✕ is the hide, not a stored-group removal
    fireEvent.click(screen.getByTestId('gdrop-SANS'))
    expect(getState().showSans).toBe(false)
    expect(screen.queryByTestId('grow-SANS')).toBeNull()
  })

  it('keeps the who-wins list tucked behind a disclosure', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('settings-open'))
    expect(screen.queryByTestId('group-priority')).toBeNull()
    fireEvent.click(screen.getByTestId('who-wins-toggle'))
    expect(screen.getByTestId('group-priority')).toBeTruthy()
  })
})

/* Rearranging happens ON THE GRID (owner, 3 Sep 26 — "I thought the rearrange
   could be done on the grid main page itself"): the ⠿ in the corner turns it on,
   a slim bar (Auto-sort + Done) appears, and Done turns it off. */
describe('on-grid rearrange', () => {
  it('the corner ⠿ toggles rearrange mode and the bar, and Done ends it', () => {
    setRole('admin')
    const { rerender } = render(<Matrix />)
    // not rearranging: no bar
    expect(screen.queryByTestId('rearrange-bar')).toBeNull()
    fireEvent.click(screen.getByTestId('roster-arrange'))       // the corner toggle
    rerender(<Matrix />)
    const bar = screen.getByTestId('rearrange-bar')
    expect(bar).toBeTruthy()
    // Auto-sort and Done live on the bar, beside the grid
    expect(screen.getByTestId('roster-autosort')).toBeTruthy()
    fireEvent.click(screen.getByTestId('roster-arrange-done'))
    rerender(<Matrix />)
    expect(screen.queryByTestId('rearrange-bar')).toBeNull()
  })

  it('a member has no rearrange corner', () => {
    render(<Matrix />)
    expect(screen.queryByTestId('roster-arrange')).toBeNull()
  })
})
