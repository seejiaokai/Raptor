import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  addEventBand,
  getState,
  initStore,
  setDayEvent,
  setDayEventRange,
  setRole,
} from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

beforeEach(() => {
  initStore(memoryBackend())
})

describe('the two event lines', () => {
  it('gives every day two of them', () => {
    render(<Matrix />)
    expect(screen.getByTestId('event-row-0')).toBeTruthy()
    expect(screen.getByTestId('event-row-1')).toBeTruthy()
    expect(screen.getByTestId('event-0-2026-01-05')).toBeTruthy()
    expect(screen.getByTestId('event-1-2026-01-05')).toBeTruthy()
  })

  // The seed marks public holidays on line 0, so the row is not empty on
  // first run and the surface is visible without anyone typing.
  it('shows what the seed already put there', () => {
    render(<Matrix />)
    expect(screen.getByTestId('event-0-2026-01-01').textContent).toBe('PH')
  })

  // A member reads events; only an admin can open the editor on one.
  it('is read-only for a member and tappable for an admin', () => {
    render(<Matrix />)
    expect(screen.getByTestId('event-0-2026-01-05').className).not.toContain('editable')
    fireEvent.click(screen.getByTestId('event-0-2026-01-05'))
    expect(screen.queryByTestId('event-sheet')).toBeNull()

    setRole('admin')
    render(<Matrix />)
    expect(screen.getAllByTestId('event-0-2026-01-05')[1]!.className).toContain('editable')
  })
})

describe('event classification colours', () => {
  it('tints a PH column green (off day) on the header and the cells', () => {
    render(<Matrix />)
    expect(screen.getByTestId('head-2026-01-01').className).toContain('evoff')
    // a person cell in the same column carries it too — the whole bar
    const anyPerson = getState().people[0]!.id
    expect(screen.getByTestId(`cell-${anyPerson}-2026-01-01`).className).toContain('evoff')
  })

  it('tints a no-leave column orange', () => {
    setRole('admin')
    setDayEvent('2026-01-08', 0, 'No Leave')
    render(<Matrix />)
    expect(screen.getByTestId('head-2026-01-08').className).toContain('evnolv')
  })

  it('never tints the column for a work word, but reddens the word', () => {
    setRole('admin')
    setDayEvent('2026-01-08', 0, 'SC')
    render(<Matrix />)
    expect(screen.getByTestId('head-2026-01-08').className).not.toContain('evoff')
    expect(screen.getByTestId('head-2026-01-08').className).not.toContain('evnolv')
    expect(screen.getByTestId('event-0-2026-01-08').className).toContain('work')
  })

  it('lets off win over no-leave on one day', () => {
    setRole('admin')
    setDayEvent('2026-01-08', 0, 'No Leave')
    setDayEvent('2026-01-08', 1, 'PH')
    render(<Matrix />)
    expect(screen.getByTestId('head-2026-01-08').className).toContain('evoff')
    expect(screen.getByTestId('head-2026-01-08').className).not.toContain('evnolv')
  })
})

describe('merged bands render as one spanning cell', () => {
  it('draws a band and skips the days it covers', () => {
    setRole('admin')
    addEventBand(0, '2026-02-02', '2026-02-06', 'Exercise')
    render(<Matrix />)
    const band = screen.getByTestId('event-band-0-2026-02-02')
    expect(band.textContent).toBe('Exercise')
    expect(band.getAttribute('colspan')).toBe('5')
    // a day under the band is no longer its own cell
    expect(screen.queryByTestId('event-0-2026-02-03')).toBeNull()
    // a day just outside it still is
    expect(screen.getByTestId('event-0-2026-02-07')).toBeTruthy()
  })

  it('reddens a merged band whose label is a work type', () => {
    setRole('admin')
    addEventBand(1, '2026-02-02', '2026-02-04', 'SC')
    render(<Matrix />)
    expect(screen.getByTestId('event-band-1-2026-02-02').className).toContain('work')
  })

  it('repeats a word into each day of a range', () => {
    setRole('admin')
    setDayEventRange('2026-02-02', '2026-02-04', 0, 'SC')
    render(<Matrix />)
    expect(screen.getByTestId('event-0-2026-02-02').textContent).toBe('SC')
    expect(screen.getByTestId('event-0-2026-02-03').textContent).toBe('SC')
    expect(screen.getByTestId('event-0-2026-02-04').textContent).toBe('SC')
  })
})
