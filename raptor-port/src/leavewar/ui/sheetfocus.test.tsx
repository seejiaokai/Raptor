// A SHEET HOLDS THE KEYBOARD, AND A WAR SWITCH CLOSES IT (the absence-record re-test, W5-F3, 26 Sep 26 — found by
// the orders walker, reproduced by the host with its own probe).
//
// With the bid sheet open, the war behind it is under the sheet's scrim for a MOUSE — but the keyboard was never held:
// Tab walked out of the sheet to the controls behind it (the Period picker, Stage advance, the bidding window…).
// Switching the war there left the old sheet open and live, and its LL wrote a bid on 28 Dec 26 in the 26 war while
// the 27 war was on screen, showing nothing. Fable S14 / Astra 11: a sheet closes or goes inert on a war switch.
//
// Now Tab and Shift+Tab stay inside the topmost sheet (the one wrapper every Leave War sheet is built from), and a
// war switch closes the grid's open sheet the way it already dropped the drag selection.
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { getState, initStore, selectWar, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'
import { Sheet } from './Sheet'

beforeEach(() => { initStore(memoryBackend()) })

describe('Tab stays inside an open sheet', () => {
  const mount = () => render(<>
    <button data-testid="behind">behind the sheet</button>
    <Sheet testid="t-sheet" label="t" onClose={() => {}}>
      <button data-testid="first">first</button>
      <button data-testid="last">last</button>
    </Sheet>
  </>)
  const tab = (shift = false) => fireEvent.keyDown(document.activeElement || document.body, { key: 'Tab', shiftKey: shift })

  it('from the last control, Tab comes round to the first — never the page behind', () => {
    mount()
    screen.getByTestId('last').focus()
    tab()
    expect(document.activeElement).toBe(screen.getByTestId('first'))
  })
  it('from the first control, Shift+Tab goes round to the last', () => {
    mount()
    screen.getByTestId('first').focus()
    tab(true)
    expect(document.activeElement).toBe(screen.getByTestId('last'))
  })
  it('focus left behind the sheet is brought into it on the next Tab', () => {
    mount()
    screen.getByTestId('behind').focus()
    tab()
    expect(document.activeElement).toBe(screen.getByTestId('first'))
  })
})

describe('a war switch closes the sheet that was open on the old war', () => {
  it('the bid sheet does not survive the switch', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-ramp-2026-01-06'))
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
    act(() => selectWar(getState().wars[1].period.id))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
  })
  /* the event sheet too (Fable's final code read, F4, 26 Sep 26): its line and date would apply to the war now on
     screen — the one day-acting sheet the first guard left out */
  it('the event sheet does not survive the switch', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('event-0-2026-01-05'))
    expect(screen.getByTestId('event-sheet')).toBeTruthy()
    act(() => selectWar(getState().wars[1].period.id))
    expect(screen.queryByTestId('event-sheet')).toBeNull()
  })
})
