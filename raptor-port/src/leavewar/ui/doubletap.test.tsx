// @vitest-environment jsdom
/* A DOUBLE TAP ON A LEAVE BUTTON OPENS NOTHING BEHIND THE WINDOW ([LW-NIGHT1025-OLDER] (d), the night of 25 Oct 26's walker 1,
   S21.2 — `docs/handpass/parts/lw-night/w1.md`). Pressing a leave places it and closes the window; a finger's second tap a
   moment later (about 170 ms) landed on the grid where the button had stood and opened what was there — a man's CAT pop-up,
   his figures, a day's window. The press that closed the window was the one he meant: for a moment after a window over the
   grid closes, a finger's or a mouse's click on the grid is swallowed, as "Show ›" pressed twice already is (F2,
   `nightwalk.test.tsx`); a key's click (detail 0) still goes through, and a tap after the moment opens as ever. Red first. */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { initStore, lwHistInit, setRole } from '../state/store'
import { setLwOnScreen } from '../state/screen'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

const ISNAP = JSON.stringify(INPUTS)
const DAY = '2026-01-30'
const picker = () => screen.queryByTestId('bid-picker')
/* a finger's tap: its press (a touch) and then its click */
const tap = (el: Element) => {
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 3, pointerType: 'touch', button: 0 }))
  fireEvent.click(el, { detail: 1 })
}

beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  initStore(memoryBackend()); lwHistInit(); setRole('admin'); setLwOnScreen(true)
  /* jsdom draws nothing: the grid's press machine asks what is under a finger */
  if (typeof document.elementFromPoint !== 'function') (document as any).elementFromPoint = () => null
})
afterEach(() => { INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })

/* the window's leave pressed by a finger: it places the leave and the window closes */
function placeByTap() {
  fireEvent.click(screen.getByTestId(`cell-dusk-${DAY}`))
  expect(picker()).toBeTruthy()
  tap(screen.getByTestId('bid-LL'))
  expect(picker(), 'the leave placed closes the window').toBeNull()
}

describe('a double tap on a leave button ((d))', () => {
  it('the second tap, landing on a day under where the button stood, opens no window', async () => {
    render(<Matrix />)
    placeByTap()
    tap(screen.getByTestId('cell-asics-2026-01-29'))
    expect(picker(), 'no stray window').toBeNull()
    await act(async () => { await new Promise(r => setTimeout(r, 600)) })
    tap(screen.getByTestId('cell-asics-2026-01-29'))
    expect(picker(), 'a tap after the moment opens as ever').toBeTruthy()
  })

  it('…nor a man\'s figures, landing on his name', async () => {
    render(<Matrix />)
    placeByTap()
    tap(screen.getAllByTestId('person-asics')[0]!)
    expect(screen.queryByTestId('person-window'), 'no figures opened').toBeNull()
  })

  it('a mouse’s double click on the leave: its second click (detail 2) opens nothing behind it', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-dusk-${DAY}`))
    fireEvent.click(screen.getByTestId('bid-LL'), { detail: 1 })
    expect(picker()).toBeNull()
    fireEvent.click(screen.getByTestId('cell-asics-2026-01-29'), { detail: 2 })
    expect(picker()).toBeNull()
  })

  it('a mouse’s single click on another day at once still opens it (a desktop’s quick next click)', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-dusk-${DAY}`))
    fireEvent.click(screen.getByTestId('bid-LL'), { detail: 1 })
    expect(picker()).toBeNull()
    const cell = screen.getByTestId('cell-asics-2026-01-29')
    cell.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'mouse', button: 0 }))
    fireEvent.click(cell, { detail: 1 })
    expect(picker()).toBeTruthy()
  })

  it('a key\'s click (detail 0) on the grid at once still goes through', () => {
    render(<Matrix />)
    placeByTap()
    fireEvent.click(screen.getByTestId('cell-asics-2026-01-29'), { detail: 0 })
    expect(picker()).toBeTruthy()
  })

  it('a double tap on the window’s ✕ opens nothing behind it either', () => {
    render(<Matrix />)
    /* a window over the grid closed by a press on its ✕ — the same moment, the same fall-through */
    fireEvent.click(screen.getByTestId(`cell-dusk-${DAY}`))
    expect(picker()).toBeTruthy()
    tap(screen.getByTestId('bid-cancel'))
    expect(picker()).toBeNull()
    tap(screen.getByTestId('cell-asics-2026-01-29'))
    expect(picker(), 'a double tap on ✕ opens nothing behind it').toBeNull()
  })
})
