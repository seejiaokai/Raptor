import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initStore } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

/* THE FROZEN ROSTER COLUMNS ARE DRAWN ONCE (owner, 20 Aug 26 — the third look
   at the sideways stutter).

   On a phone the callsign and counter columns used to be `position: sticky` on
   every one of ~80 roster rows, and a sideways drag re-solved all ~160 of those
   pins every frame. They are now drawn a SECOND time, once, in a `.mxband`
   overlay that sits OUTSIDE the sideways scroller — so a sideways scroll never
   moves it and never re-solves anything, and the real columns underneath are
   set free to scroll away.

   jsdom has no layout, so what this file proves is the WIRING: that the overlay
   exists on a phone and not on a desktop, that it draws the SAME people in the
   SAME order as the grid (a row out of step would put every name beside the
   wrong balance), that it stays out of the accessibility tree and the tab order
   while the REAL columns keep their testids and seats, and that its copies of
   the controls still open the same sheets. Whether it actually lines up and
   actually stops the stutter is a real-layout question, measured on the phone.
   The alignment itself is pinned in e2e (lw-phone). */

const PHONE = '(max-width: 700px)'
function setViewport(isPhone: boolean) {
  window.matchMedia = ((q: string) => ({
    matches: isPhone && q === PHONE,
    media: q,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() { return false },
  })) as unknown as typeof window.matchMedia
}

const clone = () => document.querySelector('[data-testid="frozen-cols"]')
const cslist = (root: ParentNode | null) =>
  root ? Array.from(root.querySelectorAll('.who .cs')).map(el => el.textContent) : []

beforeEach(() => {
  initStore(memoryBackend())
})
afterEach(() => {
  // @ts-expect-error — hand the next test a clean slate
  delete window.matchMedia
})

describe('the frozen roster columns, drawn once', () => {
  it('appears on a phone and lists the same people, in the same order, as the grid', () => {
    setViewport(true)
    render(<Matrix />)

    const band = clone()
    expect(band, 'the overlay is drawn on a phone').toBeTruthy()

    // The real grid lives inside `.mx-wrap` (the sideways scroller); the overlay
    // is a sibling OUTSIDE it. So these two selectors never overlap.
    const real = cslist(document.querySelector('.mx-wrap'))
    const copy = cslist(band)
    expect(real.length, 'the grid drew people').toBeGreaterThan(0)
    expect(copy, 'the overlay draws the SAME people in the SAME order').toEqual(real)
  })

  it('is out of the accessibility tree and the tab order — the real columns keep those', () => {
    setViewport(true)
    render(<Matrix />)

    expect(clone()!.getAttribute('aria-hidden'), 'a screen reader skips the copy').toBe('true')
    const btns = clone()!.querySelectorAll<HTMLButtonElement>('.whoedit')
    expect(btns.length).toBeGreaterThan(0)
    expect([...btns].every(b => b.tabIndex === -1), 'no button is tabbed to twice').toBe(true)

    // The REAL callsign button is still the one that carries the testid.
    expect(screen.getByTestId('person-ramp').tagName).toBe('BUTTON')
  })

  it('the overlay callsign still opens the person figures sheet', () => {
    setViewport(true)
    render(<Matrix />)
    const btn = clone()!.querySelector<HTMLButtonElement>('.whoedit')!
    fireEvent.click(btn)
    expect(screen.getByTestId('pfig-close'), 'tapping the frozen callsign opens the sheet').toBeTruthy()
  })

  it('a desktop is left on its untouched sticky path — no overlay at all', () => {
    setViewport(false)
    render(<Matrix />)
    expect(clone(), 'the desktop draws no second copy').toBeNull()
    // and its real columns still carry the callsign, unmoved
    expect(screen.getByTestId('person-ramp')).toBeTruthy()
  })
})
