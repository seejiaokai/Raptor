// @vitest-environment jsdom
/* A DOUBLE TAP ON A LEAVE BUTTON OPENS NOTHING BEHIND THE WINDOW ([LW-NIGHT1025-OLDER] (d), the night of 25 Oct 26's walker 1,
   S21.2 — `docs/handpass/parts/lw-night/w1.md`). Pressing a leave places it and closes the window; a finger's second tap a
   moment later (about 170 ms) landed on the grid where the button had stood and opened what was there — a man's CAT pop-up,
   his figures, a day's window. The press that closed the window was the one he meant: for a moment after a window over the
   grid closes, a finger's second tap, or a mouse's double click, at the place of the press that closed it is swallowed, as
   "Show ›" pressed twice already is (F2, `nightwalk.test.tsx`); a key's click (detail 0), a mouse's single click, a finger's
   tap elsewhere (the code read's F3), a month button (the walk's S4e) and a tap after the moment go through. Red first. */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { initStore, lwHistInit, setRole } from '../state/store'
import { setLwOnScreen } from '../state/screen'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

const ISNAP = JSON.stringify(INPUTS)
const DAY = '2026-01-30'
const picker = () => screen.queryByTestId('bid-picker')
/* a finger's tap: its press (a touch) and then its click */
const tap = (el: Element, x = 10, y = 10) => {
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 3, pointerType: 'touch', button: 0, clientX: x, clientY: y }))
  fireEvent.click(el, { detail: 1, clientX: x, clientY: y })
}
/* a mouse's click: its press and then its click, `detail` the browser's count */
const mouse = (el: Element, detail: number, x = 10, y = 10) => {
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'mouse', button: 0, clientX: x, clientY: y }))
  fireEvent.click(el, { detail, clientX: x, clientY: y })
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
    mouse(screen.getByTestId('bid-LL'), 1)
    expect(picker()).toBeNull()
    mouse(screen.getByTestId('cell-asics-2026-01-29'), 2)
    expect(picker()).toBeNull()
  })

  it('a mouse’s single click on another day at once still opens it (a desktop’s quick next click)', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-dusk-${DAY}`))
    mouse(screen.getByTestId('bid-LL'), 1)
    expect(picker()).toBeNull()
    mouse(screen.getByTestId('cell-asics-2026-01-29'), 1, 300, 200)
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

  /* the code read's F3 (D262's reading for move mode): a finger's quick tap on ANOTHER day, away from where the window was
     closed, is a press he meant */
  it('a finger’s quick tap on another day, away from the press that closed the window, opens it', () => {
    render(<Matrix />)
    placeByTap()
    tap(screen.getByTestId('cell-asics-2026-01-29'), 200, 300)
    expect(picker()).toBeTruthy()
  })

  /* the walk's S4e (6 Nov 26): the month buttons stand inside the grid's table (its first row, `.mstripe`) — a month tapped
     just after a leave was placed did nothing */
  it('a month button tapped at once after the window closes is pressed', () => {
    render(<Matrix />)
    placeByTap()
    const month = screen.getByTestId('month-strip').querySelector('button')!
    let reached = 0
    month.addEventListener('click', () => { reached++ })
    tap(month)
    expect(reached, 'the month button’s own click ran').toBe(1)
  })

  /* on the guard's own clock (a fake one — a real wait flaked under a loaded run): 0.5 s after the close still the double
     tap; past 0.6 s a tap there opens as ever */
  it('a finger’s second tap 0.5 s after the close, at the same place, is still the double tap; past 0.6 s it opens', () => {
    render(<Matrix />)
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      placeByTap()
      act(() => { vi.advanceTimersByTime(500) })
      tap(screen.getByTestId('cell-asics-2026-01-29'))
      expect(picker()).toBeNull()
      act(() => { vi.advanceTimersByTime(150) })
      tap(screen.getByTestId('cell-asics-2026-01-29'))
      expect(picker()).toBeTruthy()
    } finally { vi.useRealTimers() }
  })

  /* the fix's narrow read, N1: a window closed by a tap on the grid behind it (its shield) is no press inside the window —
     the same day tapped again at once opens it */
  it('a window closed by a tap on the grid: the same day tapped again at once opens', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-dusk-${DAY}`))
    expect(picker()).toBeTruthy()
    const shield = screen.queryByTestId('sheet-scrim')
    const target = shield ?? screen.getByTestId('cell-asics-2026-01-29')
    tap(target, 200, 300)
    if (picker()) fireEvent.click(screen.getByTestId('bid-cancel'))   // a window that leaves the page working: closed by its ✕ from afar
    expect(picker()).toBeNull()
    tap(screen.getByTestId('cell-asics-2026-01-29'), 200, 300)
    expect(picker(), 'the re-tap he meant').toBeTruthy()
  })

  /* N2: a window closed by Escape leaves no press to guard */
  it('a window closed by Escape: a finger’s tap at once where an old press was opens', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-dusk-${DAY}`))
    tap(screen.getByTestId('portion-am'))   // a press inside the window, at the old spot
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(picker()).toBeNull()
    tap(screen.getByTestId('cell-asics-2026-01-29'))
    expect(picker()).toBeTruthy()
  })
})
