import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { advanceStage, initStore, lwHistEpoch, lwUndo, setBalance, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

/* THE FIGURE SELECTION (owner, 6 Sep 26) — a drag down ONE figure column picks
   a run of people, for the docked balance bar.

   The gesture's own geometry is pinned DOM-free in select.test.ts and driven
   for real in e2e; what this file proves is the WIRING through the matrix:
   that the admin's drag reaches the counter column at all, that it writes
   nothing, that a member's does nothing, that the things which invalidate a
   selection clear it, that the counter swipe stands down for the touch the
   drag armed, and — the one that would fail silently — that a store write
   mid-selection leaves the highlight standing (the reason it is an attribute
   React owns rather than a class painted from outside).

   jsdom has no layout: every rect is 0×0 and `elementFromPoint` answers
   nothing, so the drag is fed a stub keyed on a `data-y` written onto the two
   cells under test — the same trick select.test.ts uses, and the only way to
   hit-test a column here. */

beforeEach(() => {
  initStore(memoryBackend())
  setRole('admin')
})

const origEFP = document.elementFromPoint
afterEach(() => { document.elementFromPoint = origEFP })

/** The counter column's cells, in grid order — one per person row. */
const balCells = () => [...document.querySelectorAll('td[data-testid^="bal-"]')] as HTMLElement[]
const marked = () => [...document.querySelectorAll('[data-figsel]')] as HTMLElement[]

/** Lay the first two rows of the closed column out at y = 10 and 30 and answer
 *  `elementFromPoint` from that, so a drag from one to the other has something
 *  to hit. Everything else answers null — a point off the two is off the grid,
 *  which is the hold-last-focus path. */
function layOutColumn(): [HTMLElement, HTMLElement] {
  const [a, b] = balCells()
  a!.setAttribute('data-y', '10')
  b!.setAttribute('data-y', '30')
  document.elementFromPoint = (_x: number, y: number) =>
    [a!, b!].find(c => c.getAttribute('data-y') === String(y)) ?? null
  return [a!, b!]
}

const pointerDown = (el: Element, y: number, pointerType = 'mouse') =>
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType, clientX: 20, clientY: y, button: 0 }))
const pointerMove = (y: number) =>
  window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', clientX: 20, clientY: y }))
const pointerUp = () =>
  window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, pointerType: 'mouse', button: 0 }))

/** One macrotask, for the 0ms sweep that retires a committed drag's one-shot
 *  click swallow (select.ts `swallowNextClick`). */
const tick = () => act(() => new Promise<void>(r => { setTimeout(r, 0) }))

/** A mouse drag from the first laid-out row to the second: down, past
 *  MOUSE_SLOP (which arms it), onto the second row, up. */
function dragDown(from: HTMLElement) {
  act(() => {
    pointerDown(from, 10)
    pointerMove(16)
    pointerMove(30)
    pointerUp()
  })
}

describe('a drag down the figure column selects a run of people', () => {
  it('an admin\'s drag lights the run — and writes nothing', () => {
    render(<Matrix />)
    const [a, b] = layOutColumn()
    const epoch = lwHistEpoch()
    dragDown(a)
    // The highlight is React's now (the gesture cleared its own marks on
    // release), on exactly the two boxes dragged over.
    expect(marked().map(c => c.getAttribute('data-testid'))).toEqual([a.dataset.testid, b.dataset.testid])
    expect(marked()[0]!.getAttribute('data-figsel')).toBe('1')
    // A selection is a selection: nothing is written until the bar takes an
    // amount (Task 3), so the war's history must not have moved.
    expect(lwHistEpoch()).toBe(epoch)
  })

  it('a member\'s drag does nothing — keying balances is the admin\'s', () => {
    setRole('member')
    render(<Matrix />)
    const [a] = layOutColumn()
    dragDown(a)
    expect(marked()).toHaveLength(0)
  })

  it('an undo, a stage change and the drawer toggle all drop it', async () => {
    render(<Matrix />)
    const [a] = layOutColumn()
    // Something to undo: the selection itself writes nothing, so a bare undo
    // would no-op and prove nothing about the clear.
    act(() => { setBalance(a.dataset.testid!.slice(4), 'annual', 9) })
    dragDown(a)
    expect(marked()).toHaveLength(2)
    // UNDO: a restore can rewrite the very rows the selection covers, so the
    // gesture's result must not outlive it (the day grid's own rule).
    act(() => { lwUndo() })
    expect(marked()).toHaveLength(0)

    dragDown(layOutColumn()[0])
    expect(marked()).toHaveLength(2)
    act(() => { advanceStage() })
    expect(marked()).toHaveLength(0)

    dragDown(layOutColumn()[0])
    expect(marked()).toHaveLength(2)
    // The drawer toggle: the same boxes are drawn in a second place while it
    // is open, so a selection made against one layout does not follow into the
    // other. The tick first — a committed drag swallows the ONE click that
    // follows it (the anchor's own, which would otherwise open a breakdown
    // over the selection) and sweeps that listener a tick later, so a test
    // pressing a button in the same tick is pressing into the swallow.
    await tick()
    fireEvent.click(screen.getByTestId('figures-toggle'))
    expect(screen.getByTestId('figures-toggle').getAttribute('aria-expanded')).toBe('true')
    expect(marked()).toHaveLength(0)
  })

  it('a store write mid-selection leaves the highlight standing', () => {
    render(<Matrix />)
    const [a, b] = layOutColumn()
    dragDown(a)
    expect(marked()).toHaveLength(2)
    // An unrelated admin write: every row re-renders, and FigureCell rebuilds
    // its className from `wide`/`flash` as it goes. A class painted onto the
    // box by the gesture would be wiped here — which is the whole reason the
    // mark is an attribute React itself renders.
    act(() => { setBalance('tata', 'annual', 5) })
    expect(marked().map(c => c.getAttribute('data-testid'))).toEqual([a.dataset.testid, b.dataset.testid])
  })
})

describe('the counter swipe stands down for the touch a figure drag armed', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  const column = () => screen.getByTestId('counter-name').textContent

  it('a hold-and-drag never cycles the column; a plain flick still does', () => {
    render(<Matrix />)
    const [a] = layOutColumn()
    const before = column()

    // The finger lands, holds past HOLD (the drag arms), drags a row down and
    // lifts — travelling 60px sideways on the way out, which is a swipe by
    // every measure the swipe handler has.
    fireEvent.touchStart(a, { touches: [{ clientX: 20, clientY: 10 }] })
    act(() => { pointerDown(a, 10, 'touch') })
    act(() => { vi.advanceTimersByTime(200) })
    act(() => { pointerMove(30); pointerUp() })
    fireEvent.touchEnd(a, { changedTouches: [{ clientX: 80, clientY: 10 }] })
    expect(column()).toBe(before)          // the select owned that touch
    expect(marked()).toHaveLength(2)       // ...and kept what it selected

    // The quick flick — no hold, nothing armed — still cycles the column, which
    // is the fast path this must not cost.
    fireEvent.touchStart(a, { touches: [{ clientX: 20, clientY: 10 }] })
    fireEvent.touchEnd(a, { changedTouches: [{ clientX: 80, clientY: 10 }] })
    expect(column()).not.toBe(before)
  })
})
