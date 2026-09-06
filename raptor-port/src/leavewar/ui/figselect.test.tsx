import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { advanceStage, initStore, lwHistEpoch, lwUndo, setBalance, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'
import { FIGSEL_ATTR } from './select'

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
   nothing, so the drag is fed a stub keyed on a `data-y` written onto the
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
/** Whose row a counter cell is (`bal-<person>`), read off the grid rather than
 *  named, so a re-keyed seed cannot leave a test quietly asserting nothing. */
const personOf = (cell: HTMLElement) => cell.dataset.testid!.slice(4)
/** The COMMITTED selection — the attribute React renders (`data-figsel`), never
 *  the gesture's own mid-drag mark. */
const marked = () => [...document.querySelectorAll(`[${FIGSEL_ATTR}]`)] as HTMLElement[]

/** Lay the first three rows of the closed column out at y = 10, 30 and 50 and
 *  answer `elementFromPoint` from that, so a drag from one to another has
 *  something to hit. Everything else answers null — a point off the three is
 *  off the grid, which is the hold-last-focus path. */
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
const pointerMove = (y: number) =>
  window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', clientX: 20, clientY: y }))
const pointerUp = () =>
  window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, pointerType: 'mouse', button: 0 }))
const pointerCancel = () =>
  window.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1, pointerType: 'mouse' }))

/** One macrotask, for the 0ms sweep that retires a committed drag's one-shot
 *  click swallow (select.ts `swallowNextClick`). */
const tick = () => act(() => new Promise<void>(r => { setTimeout(r, 0) }))

/** A mouse drag from one laid-out row to another: down, past MOUSE_SLOP (which
 *  arms it), onto the target row, up. `end` says how it finishes — a release
 *  commits, a cancel is the browser taking the gesture away mid-drag (an iOS
 *  system gesture, a notification). */
function dragDown(from: HTMLElement, toY = 30, end: 'up' | 'cancel' = 'up') {
  const y0 = Number(from.getAttribute('data-y'))
  act(() => {
    pointerDown(from, y0)
    pointerMove(y0 + 6)
    pointerMove(toY)
    if (end === 'up') pointerUp(); else pointerCancel()
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
    // amount, so the war's history must not have moved.
    expect(lwHistEpoch()).toBe(epoch)
    // ...and the bar it exists for is up, naming the run and the pool it will
    // credit (the column opens on +LVE).
    expect(screen.getByTestId('balance-bar')).toBeTruthy()
    expect(screen.getByTestId('oil-credit-who').textContent).toBe('2 people · +LVE')
  })

  /* NO DESELECT BUTTON — a press outside the bar and the boxes drops the run,
     the tracker's own rule (owner, 2 Sep 26). A press ON a box is the next drag
     or a tap for that person's breakdown, so it must survive. The listener
     captures, because the boxes and the bar both stop presses of their own. */
  it('a press outside the bar and the boxes clears the run; a press on a box does not', () => {
    render(<Matrix />)
    const [a] = layOutColumn()
    dragDown(a)
    expect(marked()).toHaveLength(2)

    fireEvent.pointerDown(a)                       // the box itself: still selected
    expect(marked()).toHaveLength(2)
    expect(screen.getByTestId('balance-bar')).toBeTruthy()

    fireEvent.pointerDown(document.body)           // anywhere else: gone, bar and marks
    expect(marked()).toHaveLength(0)
    expect(screen.queryByTestId('balance-bar')).toBeNull()
  })

  /* ESCAPE CLEARS IT TOO — but a sheet open over the selection gets the press
     first, or one key would take away both the panel being read and the run
     underneath it. The bar's listener yields while a `.bidsheet` is mounted;
     Sheet's own capture handler closes that, and the next press reaches here. */
  it('Escape clears the run — after any open sheet has had it', async () => {
    render(<Matrix />)
    const [a] = layOutColumn()
    dragDown(a)
    expect(marked()).toHaveLength(2)
    // The breakdown, opened over the live selection (the tick first: a
    // committed drag swallows the one click that follows it).
    await tick()
    fireEvent.click(a)
    expect(screen.getByTestId('figure-breakdown')).toBeTruthy()

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByTestId('figure-breakdown')).toBeNull()
    expect(marked()).toHaveLength(2)                // the run is still the user's

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(marked()).toHaveLength(0)
    expect(screen.queryByTestId('balance-bar')).toBeNull()
  })

  it('a member\'s drag does nothing — keying balances is the admin\'s', () => {
    setRole('member')
    render(<Matrix />)
    const [a] = layOutColumn()
    dragDown(a)
    expect(marked()).toHaveLength(0)
    expect(screen.queryByTestId('balance-bar')).toBeNull()
  })

  // The admin's "view as member" flip can land while a selection is live, and
  // the bar is a WRITE control: it has to leave with the role, not sit there
  // offering a Save the store would refuse (absent, not disabled — the house
  // rule for every admin control in this app).
  it('the bar goes when an admin flips to viewing as a member — and takes the highlight with it', () => {
    render(<Matrix />)
    const [a] = layOutColumn()
    dragDown(a)
    expect(screen.getByTestId('balance-bar')).toBeTruthy()
    act(() => { setRole('member') })
    expect(screen.queryByTestId('balance-bar')).toBeNull()
    // …and the run itself goes with it (review, 6 Sep 26). The bar's mount was
    // gated on the role from the start; the SELECTION was not, so the flip left
    // a member-viewing screen with a run still lit and nothing on screen able to
    // clear or use it.
    expect(marked()).toHaveLength(0)
  })

  it('an undo, a stage change and the drawer toggle all drop it', async () => {
    render(<Matrix />)
    const [a] = layOutColumn()
    // Something to undo: the selection itself writes nothing, so a bare undo
    // would no-op and prove nothing about the clear.
    act(() => { setBalance(personOf(a), 'annual', 9) })
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
    const [a, b, c] = layOutColumn()
    dragDown(a)
    expect(marked()).toHaveLength(2)
    // An unrelated admin write: every row re-renders, and FigureCell rebuilds
    // its className from `wide`/`flash` as it goes. A class painted onto the
    // box by the gesture would be wiped here — which is the whole reason the
    // mark is an attribute React itself renders. The person is read off the
    // grid, never named: `setBalance` returns false for an unknown id and
    // notifies nobody, so a renamed seed would leave this asserting nothing.
    act(() => { setBalance(personOf(c), 'annual', 5) })
    expect(marked().map(el => el.getAttribute('data-testid'))).toEqual([a.dataset.testid, b.dataset.testid])
  })

  // THE TWO WRITERS MUST NOT SHARE AN ATTRIBUTE (6 Sep 26 review). React renders
  // `data-figsel` for the committed selection; the gesture paints its own
  // `data-figdrag` while dragging and wipes it on release. Sharing one attribute
  // looked fine until a drag overlapped a live selection: the gesture's clear
  // stripped a box whose React prop had NOT changed, so React never put it back
  // — a selected person went dark while still selected, and the bar (Task 3)
  // would key a number into somebody the screen no longer showed.
  it('a second drag overlapping the first leaves EVERY selected box lit', () => {
    render(<Matrix />)
    const [a, b, c] = layOutColumn()
    dragDown(a, 30)                       // a..b
    expect(marked()).toHaveLength(2)
    dragDown(b, 50)                       // b..c — b is already selected
    // The union is a..c: b must not have been wiped on the way through.
    expect(marked().map(el => el.getAttribute('data-testid')))
      .toEqual([a.dataset.testid, b.dataset.testid, c.dataset.testid])
  })

  it('an armed drag the browser CANCELS leaves the live selection lit', () => {
    render(<Matrix />)
    const [a, b] = layOutColumn()
    dragDown(a, 30)
    expect(marked()).toHaveLength(2)
    // A cancel commits nothing and changes no state — so nothing re-renders
    // afterwards, and anything the gesture wiped on the way out would stay
    // wiped. The selection made a moment ago is still the user's.
    dragDown(a, 30, 'cancel')
    expect(marked().map(el => el.getAttribute('data-testid'))).toEqual([a.dataset.testid, b.dataset.testid])
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
