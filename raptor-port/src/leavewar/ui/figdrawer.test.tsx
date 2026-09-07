import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getState, initStore, setCell, setRole, toggleFigure } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

/* THE FIGURES DRAWER (owner, 6 Sep 26) — every figure for everyone, popped out
   beside the names over the day columns.

   jsdom has no layout engine, so what this file proves is the WIRING: which
   columns are drawn and in what order, that the titles carry the colour key,
   that each box shows the same number the closed column shows, what a tap on a
   box or a title opens, and — the one that would fail silently — that every
   drawer row is keyed to a REAL row it can copy a height from. Whether the two
   tables actually line up is a real-layout question, pinned in e2e and looked
   at in a browser. */

beforeEach(() => initStore(memoryBackend()))

// jsdom has no matchMedia, so the drawer opens CLOSED here (a real desktop
// browser opens it open — the e2e pins that); every test opens it by the bar.
const open = () => fireEvent.click(screen.getByTestId('figures-toggle'))
const drawer = () => screen.getByTestId('figdrawer')

/* jsdom answers every `getBoundingClientRect` with zeros, and the drawer is
   deliberately inert until something measures — so the tests below that need
   the MEASURED half (where it sits, how wide it came out, where a pop-up is
   put) lend it a laid-out page for the length of one test. `rect` is what
   every element reports; `innerWidth` narrows the screen so the clamp has
   something to clamp against. Restored after each test — a stray stub would
   silently change every other file's idea of layout. */
const realRect = Element.prototype.getBoundingClientRect
const realW = window.innerWidth, realH = window.innerHeight
function layOut(rect: Partial<DOMRect>, innerWidth = 1024, innerHeight = 900) {
  const box = { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, ...rect }
  Element.prototype.getBoundingClientRect = function () { return { ...box, toJSON: () => box } as DOMRect }
  Object.defineProperty(window, 'innerWidth', { value: innerWidth, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: innerHeight, configurable: true })
}
afterEach(() => {
  Element.prototype.getBoundingClientRect = realRect
  Object.defineProperty(window, 'innerWidth', { value: realW, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: realH, configurable: true })
})

describe('the figures drawer (owner, 6 Sep 26)', () => {
  it('is closed at first, and the corner bar opens and closes it', () => {
    render(<Matrix />)
    const bar = screen.getByTestId('figures-toggle')
    expect(bar.textContent).toBe('▸ FIGURES')
    expect(bar.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByTestId('figdrawer')).toBeNull()
    open()
    expect(screen.getByTestId('figdrawer')).toBeTruthy()
    expect(bar.textContent).toBe('▾ FIGURES')
    expect(bar.getAttribute('aria-expanded')).toBe('true')
    open()
    expect(screen.queryByTestId('figdrawer')).toBeNull()
  })

  it('shows every visible figure as a column, in the picker\'s order, titles coloured', () => {
    render(<Matrix />)
    open()
    const heads = [...drawer().querySelectorAll('th.fig')]
    expect(heads.map(h => h.getAttribute('data-fig'))).toEqual(['lve', 'oil', 'ccl', 'fcl', 'cl', 'pl', 'lvetot', 'medtot'])
    const lve = heads[0]!.querySelectorAll('.rot')
    expect([...lve].map(l => l.textContent)).toEqual(['+LVE', '−LL −OL'])
    expect(lve[1]!.querySelector('b.amber')!.textContent).toBe('−LL')
    expect(lve[1]!.querySelector('b.red')!.textContent).toBe('−OL')
    expect(heads[1]!.querySelector('.rot')!.textContent).toBe('+OIL −OIL')
    expect(heads[6]!.querySelector('.rot b.red')!.textContent).toBe('−LVE TOT')
  })

  it('draws one box per person per figure, the same numbers the column shows', () => {
    render(<Matrix />)
    open()
    const box = drawer().querySelector('[data-fig="lve"][data-person="ramp"] .fb')!
    expect(box.textContent).toBe(screen.getByTestId('bal-ramp').querySelector('.fb')!.textContent)
    expect(drawer().querySelectorAll('td.fig[data-person="ramp"]')).toHaveLength(8)
  })

  /* The rows are memoised (`DrawerPersonRow` — eight figures for sixty people
     is ~520 boxes, each reading that person's whole grid), so the thing to pin
     is that a written cell still moves the number: the memo is keyed on the
     figure context, which every store change rebuilds. */
  it('moves a box the moment leave is written', () => {
    render(<Matrix />)
    open()
    const box = (fig: string) => Number(drawer().querySelector(`[data-fig="${fig}"][data-person="ramp"] .fb`)!.textContent)
    const bal = box('lve'), tot = box('lvetot')
    act(() => setCell('ramp', '2026-03-02', 'LL'))
    expect(box('lve')).toBe(bal - 1)
    expect(box('lvetot')).toBe(tot + 1)
  })

  it('a box opens that person\'s breakdown of THAT figure', () => {
    render(<Matrix />)
    open()
    fireEvent.click(drawer().querySelector('[data-fig="medtot"][data-person="ramp"]')!)
    const sheet = screen.getByTestId('figure-breakdown')
    expect(sheet.textContent).toContain('MED TOT')
    expect(sheet.querySelector('.bidsheet-hd .who')!.textContent).toBe(getState().people.find(p => p.id === 'ramp')!.callsign)
  })

  it('a title opens a pop-up saying what the column counts, closed by an outside tap or Escape', () => {
    render(<Matrix />)
    open()
    fireEvent.click(drawer().querySelector('th.fig[data-fig="lvetot"] button')!)
    expect(screen.getByTestId('figpop').textContent).toContain('All leave taken: LL + OL + OIL + CCL + FCL + CL + PL')
    fireEvent.pointerDown(document.body)
    expect(screen.queryByTestId('figpop')).toBeNull()
    fireEvent.click(drawer().querySelector('th.fig[data-fig="lve"] button')!)
    expect(screen.getByTestId('figpop').textContent).toContain('opening + granted − LL − OL')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTestId('figpop')).toBeNull()
  })

  it('a hidden figure leaves the drawer', () => {
    setRole('admin')
    toggleFigure('fcl')
    render(<Matrix />)
    open()
    const heads = [...drawer().querySelectorAll('th.fig')]
    expect(heads.map(h => h.getAttribute('data-fig'))).not.toContain('fcl')
    expect(heads).toHaveLength(7)
  })

  /* The heights are COPIED from the real rows (`syncOverlayHeights`), which is
     the only thing keeping the two independently laid out tables level — and a
     key that names no real row copies nothing, silently, on a browser only. So
     pin the keys here: same rows, same order, one real twin each. */
  it('keys every row to the real row it copies a height from', () => {
    render(<Matrix />)
    open()
    const keys = [...drawer().querySelectorAll('tbody.mxbody > tr')].map(tr => tr.getAttribute('data-drawer-key'))
    expect(keys.length).toBeGreaterThan(0)
    const table = document.querySelector('.mx-wrap table.mx')!
    for (const k of keys) expect(table.querySelectorAll(`[data-testid="${k}"]`)).toHaveLength(1)
    // The event lines come first (a blank box across the block), then the
    // roster in the grid's own order — the same sequence the frozen band draws.
    expect(keys.slice(0, 2)).toEqual(['event-row-0', 'event-row-1'])
    const band = keys.slice(2)
    expect(band).toEqual([...document.querySelectorAll('.mx-wrap table.mx tbody.mxbody > tr')]
      .map(tr => tr.getAttribute('data-testid')))
  })

  /* The month-bracket label sticks clear of whatever is frozen, and the drawer
     changes what that is: it is published as `--drawer-w` on open and taken
     away on close, so the label goes back to the closed pair's offset. Left
     behind, the label sat over the drawer un-stuck and vanished under the
     stuck bar's frozen copy (6 Sep 26 review). */
  it('publishes the drawer\'s width for the month label, and takes it back on close', () => {
    layOut({ left: 0, right: 240, top: 0, bottom: 40, width: 240, height: 40 })
    render(<Matrix />)
    const outer = document.querySelector<HTMLElement>('.mx-outer')!
    expect(outer.classList.contains('mx-figures')).toBe(false)
    expect(outer.style.getPropertyValue('--drawer-w')).toBe('')
    open()
    expect(outer.classList.contains('mx-figures')).toBe(true)
    expect(outer.style.getPropertyValue('--drawer-w')).toBe('240px')
    open()
    expect(outer.classList.contains('mx-figures')).toBe(false)
    expect(outer.style.getPropertyValue('--drawer-w')).toBe('')
  })

  /* The pop-up is screen-fixed, so nothing but the clamp keeps it on a phone:
     off the last title of a 390px screen its 260px box would run off the right
     edge. Same body as the quals popover (`popat.ts`). */
  it('keeps the title pop-up on screen, and drops it on a scroll or a resize', () => {
    layOut({ left: 300, right: 328, top: 60, bottom: 122, width: 28, height: 62 }, 390, 800)
    render(<Matrix />)
    open()
    const title = () => drawer().querySelector<HTMLElement>('th.fig[data-fig="medtot"] button')!
    fireEvent.click(title())
    // 390 − 260 (the box's own max-width) − 6 of margin
    expect(screen.getByTestId('figpop').style.left).toBe('124px')
    expect(screen.getByTestId('figpop').style.top).toBe('128px')
    // The grid's sideways scroll does not bubble, so the listener captures.
    fireEvent.scroll(document.querySelector('.mx-wrap')!)
    expect(screen.queryByTestId('figpop')).toBeNull()
    fireEvent.click(title())
    expect(screen.getByTestId('figpop')).toBeTruthy()
    fireEvent(window, new Event('resize'))
    expect(screen.queryByTestId('figpop')).toBeNull()
  })

  /* Rearranging drags a roster row by hit-testing whatever is under the
     pointer, and the drawer covers a wide strip beside the grip column at the
     very width it opens by default — so it stands down to taps for the mode,
     rather than tearing itself down like the band. */
  it('stands down to taps while an admin is rearranging', () => {
    setRole('admin')
    render(<Matrix />)
    open()
    expect(drawer().style.pointerEvents).toBe('')
    fireEvent.click(screen.getByTestId('roster-arrange'))
    expect(drawer().style.pointerEvents).toBe('none')
    fireEvent.click(screen.getByTestId('roster-arrange'))
    expect(drawer().style.pointerEvents).toBe('')
  })

  it('leaves the real table alone — one cell per row, the same as closed', () => {
    render(<Matrix />)
    const cells = document.querySelectorAll('.mx-wrap table.mx [data-testid="row-ramp"] > td').length
    open()
    expect(document.querySelectorAll('.mx-wrap table.mx [data-testid="row-ramp"] > td').length).toBe(cells)
    expect(screen.getAllByTestId(/^counter-head$/)).toHaveLength(1)
  })
})
