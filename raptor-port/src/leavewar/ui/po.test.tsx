// Post out (PO) — owner, 18 Aug 26. Marking a person posted out takes them off
// the manpower from that day on and greys their boxes. The grey `.gone` hatch
// and the manning exclusion already keyed off a person's posting-out date
// (`to`); these tests cover the WRITE PATH — an admin taps a day to place it,
// and a struck day to manage or undo it.
//
// Reworked 19 Aug 26 (owner): ANY date is legal — past, future, outside the
// war — the sheet folds its controls behind one button, and every PO carries
// an explicit "Archive on PO date" choice (default ON) that sync.ts's
// auto-archive pass reads.

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

  it('takes any real date — before the war, after it, years away (owner, 19 Aug 26)', () => {
    const id = anId()
    setRole('admin')
    const p = () => getState().people.find(x => x.id === id)!
    // before the loaded war (2026): strikes their whole history from there
    expect(setPostOut(id, '2025-03-10')).toBe(true)
    expect(p().to).toBe('2025-03-09')
    expect(inSquadron(p(), '2026-01-01')).toBe(false)
    // far in the future: nothing on this war's screen changes yet
    expect(setPostOut(id, '2031-01-01')).toBe(true)
    expect(p().to).toBe('2030-12-31')
    expect(inSquadron(p(), '2026-12-31')).toBe(true)
    // malformed is refused — the guard-rails line: refuse malformed data only
    expect(setPostOut(id, 'June 15')).toBe(false)
    expect(setPostOut(id, '')).toBe(false)
    expect(p().to).toBe('2030-12-31')
  })

  it('stores the archive choice explicitly, and clearing the PO clears it', () => {
    const id = anId()
    setRole('admin')
    const p = () => getState().people.find(x => x.id === id)!
    expect(p().poArchive).toBeUndefined()              // never posted: no choice recorded
    setPostOut(id, '2026-06-15')                       // default: archive ON
    expect(p().poArchive).toBe(true)
    setPostOut(id, '2026-06-15', false)                // the custom case: switch off
    expect(p().poArchive).toBe(false)
    setPostOut(id, null)                               // undo clears the choice too
    expect(p().poArchive).toBeUndefined()
  })
})

describe('placing and managing PO from the grid', () => {
  it('an admin taps a day, opens the PO controls, and confirms; the struck day manages it', () => {
    const id = anId()
    const day = '2026-06-15'
    setRole('admin')
    render(<Matrix />)

    // Tap the day → the bid sheet folds the PO controls behind one button
    // (owner, 19 Aug 26 — "show this toggle when the admin clicks PO").
    fireEvent.click(screen.getByTestId(`cell-${id}-${day}`))
    expect(screen.queryByTestId('po-confirm')).toBeNull()
    fireEvent.click(screen.getByTestId('bid-postout'))
    // The date seeds with the tapped day, the archive switch is ON by default.
    expect((screen.getByTestId('po-date') as HTMLInputElement).value).toBe(day)
    expect(screen.getByTestId('po-archive').getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByTestId('po-confirm'))
    const p = () => getState().people.find(x => x.id === id)!
    expect(p().to).toBe('2026-06-14')
    expect(p().poArchive).toBe(true)

    // The cell now reads as posted out (the greyed `.gone` hatch).
    expect(screen.getByTestId(`cell-${id}-${day}`).className).toContain('gone')

    // Tap the struck day → the manage sheet, not the bid sheet: it names the
    // PO date, moves it, flips the archive switch, or undoes the whole thing.
    fireEvent.click(screen.getByTestId(`cell-${id}-${day}`))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    expect((screen.getByTestId('postout-date') as HTMLInputElement).value).toBe(day)
    fireEvent.click(screen.getByTestId('postout-archive'))     // → custom, no auto-archive
    expect(p().poArchive).toBe(false)
    // An EARLIER date: the tapped day stays struck, so the sheet stays up.
    // (Moving it past the tapped day un-strikes that cell and the sheet
    // rightly gives way to the bid picker — the sheet is derived state.)
    fireEvent.change(screen.getByTestId('postout-date'), { target: { value: '2026-06-10' } })
    expect(p().to).toBe('2026-06-09')
    fireEvent.click(screen.getByTestId('postout-undo'))
    expect(p().to).toBeNull()
    expect(p().poArchive).toBeUndefined()
  })

  it('a custom date typed into the picker posts out from a day nobody tapped', () => {
    const id = anId()
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${id}-2026-06-15`))
    fireEvent.click(screen.getByTestId('bid-postout'))
    fireEvent.change(screen.getByTestId('po-date'), { target: { value: '2026-09-01' } })
    fireEvent.click(screen.getByTestId('po-archive'))          // the custom case: archive off
    fireEvent.click(screen.getByTestId('po-confirm'))
    const p = getState().people.find(x => x.id === id)!
    expect(p.to).toBe('2026-08-31')
    expect(p.poArchive).toBe(false)
  })

  it("the person's LAST day wears the PO corner tag (owner, 19 Aug 26)", () => {
    const id = anId()
    setRole('admin')
    render(<Matrix />)
    expect(screen.queryByTestId(`polast-${id}`)).toBeNull()
    fireEvent.click(screen.getByTestId(`cell-${id}-2026-06-15`))
    fireEvent.click(screen.getByTestId('bid-postout'))
    fireEvent.click(screen.getByTestId('po-confirm'))
    // The tag sits on the last day IN (June 14), not on the first day gone.
    const tag = screen.getByTestId(`polast-${id}`)
    expect(tag.textContent).toBe('PO')
    expect(screen.getByTestId(`cell-${id}-2026-06-14`).className).toContain('pofin')
    expect(screen.getByTestId(`cell-${id}-2026-06-14`).contains(tag)).toBe(true)
  })

  it('a member sees no PO controls at all', () => {
    const id = anId()
    setRole('member')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${id}-2026-06-15`))
    expect(screen.queryByTestId('bid-postout')).toBeNull()
  })
})
