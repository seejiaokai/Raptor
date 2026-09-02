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

// MOVING an existing event (owner, 31 Aug 26 — "drag an existing event to move
// it, like LL"). The sheet's Move… button hands the span to the matrix, which
// runs the same drag-to-a-day move mode the roster uses.
describe('moving an event', () => {
  it('the Move… button moves the event onto the day tapped', () => {
    render(<Matrix />)
    // place a single-day event on line 0 at 05 Jan
    fireEvent.click(screen.getByTestId('event-0-2026-01-05'))
    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'MOVEME' } })
    fireEvent.click(screen.getByTestId('event-apply'))
    // reopen it — now the Move… button is offered
    fireEvent.click(screen.getByTestId('event-0-2026-01-05'))
    expect(screen.getByTestId('event-move')).toBeTruthy()
    fireEvent.click(screen.getByTestId('event-move'))
    // the sheet closed and the move banner is up
    expect(screen.queryByTestId('event-sheet')).toBeNull()
    expect(screen.getByTestId('event-move-banner')).toBeTruthy()
    // tap the target day: desktop commits on the click, a phone stages then Confirm
    fireEvent.click(screen.getByTestId('event-0-2026-01-10'))
    const confirm = screen.queryByTestId('event-move-confirm')
    if (confirm) fireEvent.click(confirm)
    expect(dayEvents('2026-01-05')[0]).toBe('')
    expect(dayEvents('2026-01-10')[0]).toBe('MOVEME')
    expect(screen.queryByTestId('event-move-banner')).toBeNull()
  })

  it('offers no Move… on an empty event cell — there is nothing to move', () => {
    openEvent(0, '2026-01-05') // an empty cell, nothing placed
    expect(screen.queryByTestId('event-move')).toBeNull()
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

  /* A FRESH RANGE OPENS ON ONE MERGED BAR (owner, 28 Aug 26 — "can the
     default selection be one merged bar instead of repeat each day"). The
     mode chips are deliberately never touched here: pressing Save alone must
     leave a bar, not the word copied into every covered day. */
  it('defaults a fresh range to one merged bar', () => {
    openEvent(0, '2026-01-05')
    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'Exercise' } })
    fireEvent.click(screen.getByTestId('event-scope-range'))
    expect(screen.getByTestId('event-mode-merge').className).toContain('approve')
    expect(screen.getByTestId('event-mode-repeat').className).not.toContain('approve')
    fireEvent.click(screen.getByTestId('event-day-2026-01-05'))
    fireEvent.click(screen.getByTestId('event-day-2026-01-07'))
    fireEvent.click(screen.getByTestId('event-apply'))
    expect(getState().period.bands.find(b => b.line === 0))
      .toMatchObject({ from: '2026-01-05', to: '2026-01-07', text: 'Exercise' })
    // and nothing was repeated into the days underneath it
    expect(dayEvents('2026-01-06')[0]).toBe('')
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
  /* Per-event tags (owner, 18 Aug 26 — "I don't want u to save it as a
     type"): tapping a tag colours THIS event and never mints the word into
     the library; the library changes only inside Edit types. */
  it('shows the tag of a known word, and tags a new one WITHOUT saving a type', () => {
    openEvent(0, '2026-01-05')
    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'PH' } })
    expect(screen.getByTestId('event-tag-current').textContent).toBe('PH')

    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'Standby' } })
    expect(screen.getByTestId('event-tag-current').textContent).toBe('untagged')
    fireEvent.click(screen.getByTestId('event-tag-work'))
    expect(screen.getByTestId('event-tag-current').textContent).toBe('Work')
    // the library is untouched — the tag belongs to the event alone
    expect(getState().eventDefs.some(d => d.name === 'Standby')).toBe(false)
  })

  it('saves the tag on the event, and it survives reopening', () => {
    openEvent(0, '2026-01-05')
    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'Standby' } })
    fireEvent.click(screen.getByTestId('event-tag-nolv'))
    fireEvent.click(screen.getByTestId('event-apply'))
    const day = getState().period.days.find(d => d.date === '2026-01-05')!
    expect(day.events[0]).toBe('Standby')
    expect(day.eventKinds?.[0]).toBe('nolv')

    // reopen on the SAME rendered grid (a second render would duplicate it)
    fireEvent.click(screen.getByTestId('event-0-2026-01-05'))
    expect(screen.getByTestId('event-tag-current').textContent).toBe('No leave')
  })

  it('tapping the chosen tag again clears it back to untagged', () => {
    openEvent(0, '2026-01-05')
    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'Standby' } })
    fireEvent.click(screen.getByTestId('event-tag-work'))
    fireEvent.click(screen.getByTestId('event-tag-work'))
    expect(screen.getByTestId('event-tag-current').textContent).toBe('untagged')
  })

  it('a merged band carries its tag too', () => {
    openEvent(1, '2026-01-06')
    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'Det block' } })
    fireEvent.click(screen.getByTestId('event-tag-off'))
    fireEvent.click(screen.getByTestId('event-scope-range'))
    fireEvent.click(screen.getByTestId('event-mode-merge'))
    fireEvent.click(screen.getByTestId('event-apply'))
    const band = getState().period.bands.find(b => b.text === 'Det block')!
    expect(band.kind).toBe('off')
    expect(getState().eventDefs.some(d => d.name === 'Det block')).toBe(false)
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

    // reclassify SC (index 3) from work to off
    fireEvent.click(screen.getByTestId('evtype-kind-3-off'))
    expect(getState().eventDefs[3]!.kind).toBe('off')

    // add a new type
    fireEvent.change(screen.getByTestId('evtype-add-name'), { target: { value: 'Standby' } })
    fireEvent.click(screen.getByTestId('evtype-add-kind-nolv'))
    fireEvent.click(screen.getByTestId('evtype-add-btn'))
    expect(getState().eventDefs.some(d => d.name === 'Standby' && d.kind === 'nolv')).toBe(true)

    // reset restores the four seeded types
    fireEvent.click(screen.getByTestId('types-reset'))
    expect(getState().eventDefs).toHaveLength(4)
    expect(getState().eventDefs[3]!.kind).toBe('work')
  })

  it('deleting a middle type does not leave a stale name on the survivor', () => {
    // bug sweep, 18 Aug 26: the name fields are uncontrolled, so an index key
    // let a middle delete shift the array under the same DOM inputs — the
    // survivor showed the deleted type's name, and blurring it renamed the
    // WRONG type. Keying by name fixes it.
    openEvent(0, '2026-01-05')
    fireEvent.click(screen.getByTestId('event-edit-types'))
    // seed: [PH, Off day, No Leave, SC]. Delete the second one.
    fireEvent.click(screen.getByTestId('evtype-del-1'))
    expect(getState().eventDefs.map(d => d.name)).toEqual(['PH', 'No Leave', 'SC'])
    // The input now at position 1 shows the survivor No Leave, not the stale "Off day".
    expect((screen.getByTestId('evtype-name-1') as HTMLInputElement).value).toBe('No Leave')
  })
})
