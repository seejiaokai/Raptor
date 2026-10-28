import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getState, initStore, lwHistEpoch, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

/* THE GRID'S LVE FIGURES, AND NOTHING THAT ONCE HUNG OFF THEM (M5a, 28 Oct 26).
   D1245: the grid's Balances fold and the FIGURES drawer it opened are gone — every balance lives on the Balances tab,
   and each name keeps only its LVE figure beside it. D1491: the drag down those figures, and the bar it raised to give
   several people extra LVE at once, are gone too — a leave balance changes only by its box on the Balances page or the
   person window, by approved leave and by 1 Jan. What stays: the figure, and a tap on it opening that person's LVE.
   These replace figdrawer.test.tsx and figselect.test.tsx, which pinned the two removed things.

   jsdom has no layout: every rect is 0×0 and `elementFromPoint` answers nothing, so the drag is fed a stub keyed on a
   `data-y` written onto the cells under test — the same trick select.test.ts uses — so a drag that WOULD have armed the
   old gesture really reaches the column here. */

beforeEach(() => {
  initStore(memoryBackend())
  setRole('admin')
})
const origEFP = document.elementFromPoint
afterEach(() => { document.elementFromPoint = origEFP })

/** The LVE column's cells, in grid order — one per person row. */
const balCells = () => [...document.querySelectorAll('td[data-testid^="bal-"]')] as HTMLElement[]

function layOutColumn(): [HTMLElement, HTMLElement, HTMLElement] {
  const [a, b, c] = balCells()
  const rows = [a!, b!, c!]
  rows.forEach((el, i) => el.setAttribute('data-y', String(10 + i * 20)))
  document.elementFromPoint = (_x: number, y: number) =>
    rows.find(el => el.getAttribute('data-y') === String(y)) ?? null
  return [a!, b!, c!]
}
const pointerDown = (el: Element, y: number, pointerType = 'mouse') =>
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType, clientX: 20, clientY: y, button: 0 }))
const pointerMove = (y: number, pointerType = 'mouse') =>
  window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, pointerType, clientX: 20, clientY: y }))
const pointerUp = (pointerType = 'mouse') =>
  window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, pointerType, button: 0 }))

/** Nothing that marks a selection of figures, anywhere on the page. */
const anyFigureSelection = () => document.querySelectorAll('[data-figsel], [data-figdrag]').length

describe('the grid draws no figures drawer (D1245)', () => {
  it('no Balances fold, no drawer, no drawer class — for an admin or a member', () => {
    render(<Matrix />)
    for (const role of ['admin', 'member'] as const) {
      act(() => setRole(role))
      expect(screen.queryByTestId('figures-toggle')).toBeNull()
      expect(screen.queryByTestId('figdrawer')).toBeNull()
      expect(document.querySelector('.mxdrawer')).toBeNull()
      expect(document.querySelector('.mx-outer')!.classList.contains('mx-figures')).toBe(false)
    }
  })

  it('each name keeps its LVE figure beside it: one heading, one figure cell a row', () => {
    render(<Matrix />)
    expect(screen.getAllByTestId('counter-head')).toHaveLength(1)
    expect(screen.getByTestId('counter-name').textContent).toBe('+LVE')
    const people = document.querySelectorAll('.mx-wrap table.mx tr[data-testid^="row-"]')
    expect(people.length).toBeGreaterThan(0)
    for (const tr of people) expect(tr.querySelectorAll(':scope > td.bal').length).toBe(1)
  })
})

describe('a drag down the LVE figures raises no bar and writes nothing (D1491)', () => {
  it('a mouse drag over three figures: no bar, no selection, nothing written', () => {
    render(<Matrix />)
    const [a] = layOutColumn()
    const epoch = lwHistEpoch(), ledger = getState().ledger.length
    act(() => { pointerDown(a, 10); pointerMove(16); pointerMove(30); pointerMove(50); pointerUp() })
    expect(screen.queryByTestId('balance-bar')).toBeNull()
    expect(anyFigureSelection()).toBe(0)
    expect(lwHistEpoch()).toBe(epoch)
    expect(getState().ledger.length).toBe(ledger)
  })

  describe('on a phone', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())
    it('a finger held on a figure and dragged down raises no bar either; the column stays LVE', () => {
      render(<Matrix />)
      const [a] = layOutColumn()
      act(() => { pointerDown(a, 10, 'touch') })
      act(() => { vi.advanceTimersByTime(400) })           // well past the old hold that armed it
      act(() => { pointerMove(30, 'touch'); pointerMove(50, 'touch'); pointerUp('touch') })
      expect(screen.queryByTestId('balance-bar')).toBeNull()
      expect(anyFigureSelection()).toBe(0)
      expect(screen.getByTestId('counter-name').textContent).toBe('+LVE')
    })
  })
})

describe('a tap on a name\'s LVE figure still opens his LVE', () => {
  it('opens the breakdown sheet for that person, for an admin and a member', () => {
    render(<Matrix />)
    for (const role of ['admin', 'member'] as const) {
      act(() => setRole(role))
      fireEvent.click(balCells()[0]!)
      expect(screen.getByTestId('figure-breakdown')).toBeTruthy()
      fireEvent.click(screen.getByTestId('breakdown-close'))
      expect(screen.queryByTestId('figure-breakdown')).toBeNull()
    }
  })
})
