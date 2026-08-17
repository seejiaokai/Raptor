import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { getState, initStore, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

beforeEach(() => {
  initStore(memoryBackend())
  setRole('admin')
})

const openEvent = (line: 0 | 1, date: string) => {
  render(<Matrix />)
  fireEvent.click(screen.getByTestId(`event-${line}-${date}`))
  return screen.getByTestId('event-sheet')
}

const dayEvents = (date: string) => getState().period.days.find(d => d.date === date)!.events

describe('opening the sheet', () => {
  it('opens on an admin tap and prefills the day text', () => {
    openEvent(0, '2026-01-01') // seeded PH
    expect((screen.getByTestId('event-text') as HTMLInputElement).value).toBe('PH')
  })
})

describe('writing one day', () => {
  it('saves the typed text to that day and line', () => {
    openEvent(0, '2026-01-05')
    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'CO visit' } })
    fireEvent.click(screen.getByTestId('event-apply'))
    expect(dayEvents('2026-01-05')).toEqual(['CO visit', ''])
    expect(screen.queryByTestId('event-sheet')).toBeNull()
  })

  it('deletes a day event', () => {
    openEvent(0, '2026-01-01')
    fireEvent.click(screen.getByTestId('event-delete'))
    expect(dayEvents('2026-01-01')[0]).toBe('')
  })
})

describe('a range', () => {
  it('repeats the word into each day', () => {
    openEvent(0, '2026-01-05')
    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'SC' } })
    fireEvent.click(screen.getByTestId('event-scope-range'))
    fireEvent.click(screen.getByTestId('event-mode-repeat'))
    fireEvent.click(screen.getByTestId('event-day-2026-01-05'))
    fireEvent.click(screen.getByTestId('event-day-2026-01-07'))
    fireEvent.click(screen.getByTestId('event-apply'))
    expect(dayEvents('2026-01-05')[0]).toBe('SC')
    expect(dayEvents('2026-01-06')[0]).toBe('SC')
    expect(dayEvents('2026-01-07')[0]).toBe('SC')
    expect(dayEvents('2026-01-08')[0]).toBe('')
  })

  it('makes one merged bar', () => {
    openEvent(0, '2026-01-05')
    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'Exercise' } })
    fireEvent.click(screen.getByTestId('event-scope-range'))
    fireEvent.click(screen.getByTestId('event-mode-merge'))
    fireEvent.click(screen.getByTestId('event-day-2026-01-05'))
    fireEvent.click(screen.getByTestId('event-day-2026-01-09'))
    fireEvent.click(screen.getByTestId('event-apply'))
    const band = getState().period.bands.find(b => b.line === 0)
    expect(band).toMatchObject({ from: '2026-01-05', to: '2026-01-09', text: 'Exercise' })
  })

  it('opens on an existing band and can delete it', () => {
    // make one, then reopen it via a covered day
    openEvent(0, '2026-01-05')
    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'Exercise' } })
    fireEvent.click(screen.getByTestId('event-scope-range'))
    fireEvent.click(screen.getByTestId('event-mode-merge'))
    fireEvent.click(screen.getByTestId('event-day-2026-01-05'))
    fireEvent.click(screen.getByTestId('event-day-2026-01-09'))
    fireEvent.click(screen.getByTestId('event-apply'))
    expect(getState().period.bands).toHaveLength(1)

    // reopening on a covered day loads the band's label
    fireEvent.click(screen.getByTestId('event-band-0-2026-01-05'))
    expect((screen.getByTestId('event-text') as HTMLInputElement).value).toBe('Exercise')
    fireEvent.click(screen.getByTestId('event-delete'))
    expect(getState().period.bands).toHaveLength(0)
  })
})

describe('tagging a word', () => {
  it('shows the tag of a known word and tags a new one', () => {
    openEvent(0, '2026-01-05')
    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'PH' } })
    expect(screen.getByTestId('event-tag-current').textContent).toBe('Off day')

    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'Standby' } })
    expect(screen.getByTestId('event-tag-current').textContent).toBe('untagged')
    fireEvent.click(screen.getByTestId('event-tag-work'))
    expect(getState().eventDefs.some(d => d.name === 'Standby' && d.kind === 'work')).toBe(true)
    expect(screen.getByTestId('event-tag-current').textContent).toBe('Work')
  })

  it('fills the field from a quick-pick chip', () => {
    openEvent(0, '2026-01-05')
    fireEvent.click(screen.getByTestId('event-quick-0')) // PH
    expect((screen.getByTestId('event-text') as HTMLInputElement).value).toBe('PH')
  })
})

describe('the type library', () => {
  it('opens, edits a kind, adds and removes a type', () => {
    openEvent(0, '2026-01-05')
    fireEvent.click(screen.getByTestId('event-edit-types'))
    expect(screen.getByTestId('event-types-sheet')).toBeTruthy()

    // reclassify SC (index 2) from work to off
    fireEvent.click(screen.getByTestId('evtype-kind-2-off'))
    expect(getState().eventDefs[2]!.kind).toBe('off')

    // add a new type
    fireEvent.change(screen.getByTestId('evtype-add-name'), { target: { value: 'Standby' } })
    fireEvent.click(screen.getByTestId('evtype-add-kind-nolv'))
    fireEvent.click(screen.getByTestId('evtype-add-btn'))
    expect(getState().eventDefs.some(d => d.name === 'Standby' && d.kind === 'nolv')).toBe(true)

    // reset restores the three seeded types
    fireEvent.click(screen.getByTestId('types-reset'))
    expect(getState().eventDefs).toHaveLength(3)
    expect(getState().eventDefs[2]!.kind).toBe('work')
  })

  it('deleting a middle type does not leave a stale name on the survivor', () => {
    // bug sweep, 18 Aug 26: the name fields are uncontrolled, so an index key
    // let a middle delete shift the array under the same DOM inputs — the
    // survivor showed the deleted type's name, and blurring it renamed the
    // WRONG type. Keying by name fixes it.
    openEvent(0, '2026-01-05')
    fireEvent.click(screen.getByTestId('event-edit-types'))
    // seed: [PH, No Leave, SC]. Delete the middle one.
    fireEvent.click(screen.getByTestId('evtype-del-1'))
    expect(getState().eventDefs.map(d => d.name)).toEqual(['PH', 'SC'])
    // The input now at position 1 shows the survivor SC, not the stale "No Leave".
    expect((screen.getByTestId('evtype-name-1') as HTMLInputElement).value).toBe('SC')
  })
})
