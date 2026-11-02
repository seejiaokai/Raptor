// @vitest-environment jsdom
// THE DOCUMENT VIEWER OVER A LEAVE WAR WINDOW, ON A TOUCH SCREEN (his find on his iPhone, 2 Nov 26 — "When I press close.
// The window behind closes first then the document page closes on a 2nd tap").
//
// On a touch screen a blocking sheet's scrim lets the finger through to the grid (Sheet.tsx useGridPan, `(pointer: coarse)`)
// and a SHIELD on the document eats every tap that lands "under the sheet" and closes the sheet on it. The app's document
// viewer (ui/DocViewer.tsx — one pop-up on <body>, over everything) is inside no sheet, so to the shield a tap on its Close,
// its ✕ or its own dark surround was a tap under the sheet: eaten before the viewer heard it, and the bid window behind it
// closed instead. The viewer went only on a second tap, once the sheet and its shield were gone.
// jsdom has no `matchMedia`, so this file mounts a sheet as a phone does (as datebox-sheet.test.tsx).
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Sheet } from './Sheet'
import { DocViewer } from '../../ui/DocViewer'
import { DOCVIEW, setDocView } from '../../ui/pops'
import { initStore, notify } from '../../state/store'
import { docAdd } from '../../state/docs'

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
/* a finger's tap as the browser sends it: every event the shield listens for, then the click */
const tap = (el: Element) => {
  for (const type of ['pointerdown', 'touchstart', 'mousedown', 'pointerup', 'touchend', 'mouseup'] as const) fireEvent(el, new MouseEvent(type, { bubbles: true, cancelable: true }))
  fireEvent.click(el)
}

describe('the document viewer opened over a Leave War window, on a touch screen', () => {
  const origMM = window.matchMedia
  const onClose = vi.fn()
  beforeAll(() => {
    ;(URL as any).createObjectURL = vi.fn(() => 'blob:stub')
    ;(URL as any).revokeObjectURL = vi.fn()
    initStore()
  })
  beforeEach(() => {
    onClose.mockClear()
    ;(window as any).matchMedia = (q: string) => ({ matches: q.includes('coarse'), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
    act(() => { setDocView(null); notify() })
    render(<>
      <div data-testid="grid-behind">the war's grid</div>
      <Sheet testid="bid-picker" label="Gambit · Thu 23 Jul" onClose={onClose}>
        <button type="button" className="docchip" data-testid="chip"
          onClick={() => { const { id } = docAdd(new Blob(['x'], { type: 'image/png' }) as any); setDocView({ row: { person: 'bane', type: 'OML', date: 'Jul 23', docIds: [id] }, readOnly: true }); notify() }}>cert.png</button>
      </Sheet>
      <DocViewer />
    </>)
    act(() => { tap(screen.getByTestId('chip')) })
    expect(($('#docViewPop') as any).hidden, 'the chip opened the viewer').toBe(false)
  })
  afterEach(() => { cleanup(); (window as any).matchMedia = origMM; act(() => { setDocView(null) }) })

  for (const [what, sel] of [['its Close', '#docViewDone'], ['its ✕', '#docViewClose'], ['its own dark surround', '#docViewPop']] as const) {
    it(`one tap on ${what} closes the viewer only — the window behind stays open`, () => {
      act(() => { tap($(sel)) })
      expect(DOCVIEW, 'the viewer closed on the first tap').toBeNull()
      expect(($('#docViewPop') as any).hidden).toBe(true)
      expect(onClose, 'the bid window behind was not closed').not.toHaveBeenCalled()
      expect(screen.getByTestId('bid-picker')).toBeTruthy()
    })
  }
  it('a tap on the viewer’s picture does nothing at all', () => {
    act(() => { tap($('.docview-img')) })
    expect(DOCVIEW).not.toBeNull()
    expect(onClose).not.toHaveBeenCalled()
  })
  it('with the viewer closed, a tap under the window still closes the window (the shield is kept)', () => {
    act(() => { tap($('#docViewDone')) })
    act(() => { tap(screen.getByTestId('grid-behind')) })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  /* the same for every pop-up of the app's own over a sheet (the OIL question, "No document" — `.airpop` on <body>, drawn above
     every sheet): its buttons answer the first tap, the window behind stays */
  it('any pop-up of the app’s own opened over the window answers its own first tap', () => {
    act(() => { tap($('#docViewDone')) })
    const pop = document.createElement('div'); pop.className = 'airpop upconf-pop'
    const btn = document.createElement('button'); const hit = vi.fn(); btn.addEventListener('click', hit); pop.appendChild(btn)
    document.body.appendChild(pop)
    act(() => { tap(btn) })
    expect(hit).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
    pop.remove()
  })
  /* TAB GOES ROUND THE VIEWER, NOT THE WINDOW BEHIND ([LW-VIEWER-TAB], found by the doc-chip read, 2 Nov 26). The window's own
     Tab keeping was heard first and pulled the keys into the window; the viewer's then pulled them back to its first button —
     so every Tab landed on Close and its ✕ was never reached. The window now leaves Tab to a keyboard-holding window opened
     over it, as its Escape already did. */
  const tab = (shift = false) => act(() => { fireEvent.keyDown(document.activeElement ?? document, { key: 'Tab', shiftKey: shift }) })
  it('Tab inside the viewer goes Close → ✕ → Close, never into the window behind', () => {
    act(() => { $('#docViewDone').focus() })
    tab()
    expect(document.activeElement, 'Tab from Close reaches the ✕').toBe($('#docViewClose'))
    tab()
    expect(document.activeElement, 'Tab from the ✕ goes round to Close').toBe($('#docViewDone'))
    tab(true)
    expect(document.activeElement, 'Shift+Tab from Close goes to the ✕').toBe($('#docViewClose'))
    expect(screen.getByTestId('chip').contains(document.activeElement)).toBe(false)
  })
  it('with the viewer closed, Tab is held inside the window again', () => {
    act(() => { tap($('#docViewDone')) })
    act(() => { (document.body as HTMLElement).focus() })
    tab()
    expect(screen.getByTestId('bid-picker').contains(document.activeElement), 'Tab from outside comes back into the window').toBe(true)
  })
  it('Escape closes the viewer first, the window only on a second press', () => {
    act(() => { fireEvent.keyDown(document.activeElement ?? document, { key: 'Escape' }) })
    expect(DOCVIEW).toBeNull()
    expect(onClose).not.toHaveBeenCalled()
    act(() => { fireEvent.keyDown(document.activeElement ?? document, { key: 'Escape' }) })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
