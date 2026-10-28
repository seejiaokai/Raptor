// The event sheet fitting a phone with the keyboard up (owner, 31 Aug 26 — "can
// this fit the top area of the screen [so] the save buttons and calendar don't
// get blocked by the keyboard … I want to see the full window").
//
// Two mechanisms are pinned here, both about how the sheet opens on a phone:
//   · Sheet.tsx:useKeyboardInset lifts the panel to the top of the visible
//     slice and caps its height while a keyboard is up, then restores the
//     bottom-anchor when it drops. A headless browser cannot raise an iOS
//     keyboard, so this is the real gate — jsdom has no visualViewport, so a
//     stub stands in and 'resize' is fired by hand.
//   · EventSheet.tsx opens WITHOUT stealing focus when the sheet is already a
//     range (a placed band), so the whole window shows with no keyboard; a
//     fresh single-day tap still autofocuses so you can type at once.

import { fireEvent, render, screen } from '@testing-library/react'
import { useLayoutEffect } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initStore, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'
import { Sheet } from './Sheet'

// jsdom has no visualViewport; this EventTarget stub carries the fields the
// hook reads and lets a test fire 'resize' to mimic the keyboard opening.
class VVStub extends EventTarget {
  height = 844
  width = 390
  offsetTop = 0
  offsetLeft = 0
}

let vv: VVStub
const origInnerHeight = window.innerHeight

beforeEach(() => {
  initStore(memoryBackend())
  setRole('admin')
  vv = new VVStub()
  Object.defineProperty(window, 'visualViewport', { value: vv, configurable: true, writable: true })
  Object.defineProperty(window, 'innerHeight', { value: 844, configurable: true, writable: true })
})

afterEach(() => {
  // Put the globals back so the other <Matrix/> suites see jsdom's real
  // (absent) visualViewport and default innerHeight.
  Object.defineProperty(window, 'visualViewport', { value: undefined, configurable: true, writable: true })
  Object.defineProperty(window, 'innerHeight', { value: origInnerHeight, configurable: true, writable: true })
})

const openDay = (line: number, date: string) => {
  render(<Matrix />)
  fireEvent.click(screen.getByTestId(`event-${line}-${date}`))
  return screen.getByTestId('event-sheet')
}

describe('the sheet lifts above a phone keyboard', () => {
  it('re-anchors to the top and caps its height when the keyboard is up, then restores', () => {
    const panel = openDay(0, '2026-01-05')
    // No keyboard yet: the CSS bottom-anchor stands, no inline overrides.
    expect(panel.style.top).toBe('')
    expect(panel.style.bottom).toBe('')

    // Keyboard up: the visible viewport shrinks well below the layout height.
    vv.height = 380
    vv.dispatchEvent(new Event('resize'))
    expect(panel.style.bottom).toBe('auto')
    expect(parseInt(panel.style.top, 10)).toBeGreaterThan(0)
    const cap = parseInt(panel.style.maxHeight, 10)
    expect(cap).toBeGreaterThan(0)
    expect(cap).toBeLessThan(380) // fits inside the slice above the keys
    expect(panel.style.getPropertyValue('--lw-dy')).toBe('0px')

    // Keyboard down: the overrides clear, the bottom-anchor takes back over.
    vv.height = 844
    vv.dispatchEvent(new Event('resize'))
    expect(panel.style.top).toBe('')
    expect(panel.style.bottom).toBe('')
    expect(panel.style.maxHeight).toBe('')
  })

  it('ignores an ordinary viewport nudge (the URL bar), keeping the default anchor', () => {
    const panel = openDay(0, '2026-01-05')
    vv.height = 800 // ~44px shrink — below the keyboard threshold
    vv.dispatchEvent(new Event('resize'))
    expect(panel.style.top).toBe('')
    expect(panel.style.bottom).toBe('')
    expect(panel.style.maxHeight).toBe('')
  })
})

describe('opening the full window vs typing at once', () => {
  it('focuses the name field on a fresh single-day tap, so you can type at once', () => {
    openDay(0, '2026-01-05')
    expect(document.activeElement).toBe(screen.getByTestId('event-text'))
  })

  it('closes the keyboard on Enter by blurring the name field', () => {
    // Pressing Return means "done typing the name" — it drops focus (which is
    // what dismisses the phone keyboard), it does not save.
    openDay(0, '2026-01-05')
    const input = screen.getByTestId('event-text')
    expect(document.activeElement).toBe(input)
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(document.activeElement).not.toBe(input)
    // and the sheet is still open — Enter did not commit
    expect(screen.getByTestId('event-sheet')).toBeTruthy()
  })

  it('opens a placed range with the field NOT focused, so the full window shows', () => {
    render(<Matrix />)
    // place a merged band 05→09 on line 0
    fireEvent.click(screen.getByTestId('event-0-2026-01-05'))
    { const edit = screen.queryByTestId('event-peek-edit'); if (edit) fireEvent.click(edit) }   // a filled cell opens the small box first (plan §3.12)
    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'Exercise' } })
    fireEvent.click(screen.getByTestId('event-scope-range'))
    fireEvent.click(screen.getByTestId('event-mode-merge'))
    fireEvent.click(screen.getByTestId('event-day-2026-01-05'))
    fireEvent.click(screen.getByTestId('event-day-2026-01-09'))
    fireEvent.click(screen.getByTestId('event-apply'))
    // reopen it via a covered day — a band open, so no autofocus
    fireEvent.click(screen.getByTestId('event-band-0-2026-01-05'))
    { const edit = screen.queryByTestId('event-peek-edit'); if (edit) fireEvent.click(edit) }   // a filled cell opens the small box first (plan §3.12)
    expect(screen.getByTestId('event-sheet')).toBeTruthy()
    expect(document.activeElement).not.toBe(screen.getByTestId('event-text'))
  })
})

/* A WINDOW THAT PLACES ITSELF KEEPS ITS PLACE (the M5a browser tests, 29 Oct 26). The person window docks at the grid's
   right edge on a desktop and the Grades window under "Grades…" — each writes its own top (the person window its height
   too) on the panel. The keyboard hook's no-keyboard branch cleared top, bottom and max-height on every call, and it is
   called as the sheet opens and on every focus change (vvfollow.ts) — so on a desktop, with no keyboard ever, the docked
   window lost its top and fell to where it stood in the page's flow, under the grid, off the screen, its ✕ out of reach.
   The hook now undoes only what it wrote itself, and puts back what stood before the keys came up. */
describe('a sheet that places itself keeps its place', () => {
  function Docked() {
    useLayoutEffect(() => {
      const p = document.querySelector<HTMLElement>('[data-testid="docked"]')!
      p.style.top = '120px'; p.style.maxHeight = '500px'
    }, [])
    return <Sheet testid="docked" label="Docked" onClose={() => {}} modal={false}><input data-testid="docked-box" /></Sheet>
  }

  it('with no keyboard, on opening and on a focus change, its own top and height stand', () => {
    render(<Docked />)
    const panel = screen.getByTestId('docked')
    expect(panel.style.top).toBe('120px')
    expect(panel.style.maxHeight).toBe('500px')
    fireEvent.focusIn(screen.getByTestId('docked-box'))
    vv.dispatchEvent(new Event('resize'))
    expect(panel.style.top).toBe('120px')
    expect(panel.style.maxHeight).toBe('500px')
  })

  it('the keyboard lifts it, and when the keys go down its own place comes back', () => {
    render(<Docked />)
    const panel = screen.getByTestId('docked')
    vv.height = 380
    vv.dispatchEvent(new Event('resize'))
    expect(panel.style.bottom).toBe('auto')
    expect(parseInt(panel.style.maxHeight, 10)).toBeLessThan(380)
    vv.height = 844
    vv.dispatchEvent(new Event('resize'))
    expect(panel.style.top).toBe('120px')
    expect(panel.style.maxHeight).toBe('500px')
    expect(panel.style.bottom).toBe('')
  })

  /* the fresh read of the M5a fixes, finding 5 (29 Oct 26): the place before the keys was taken once, at their first frame,
     and put back when they went — so a window that placed itself afresh while they were up (a phone turned sideways while
     typing: the person window docks again) got its old place back on the way down, the phone form's on a desktop form */
  it('a window that re-places itself while the keys are up keeps its new place when they go down', () => {
    render(<Docked />)
    const panel = screen.getByTestId('docked')
    vv.height = 380
    vv.dispatchEvent(new Event('resize'))
    panel.style.top = '200px'                 // the window re-placing itself, the keys still up
    vv.dispatchEvent(new Event('resize'))
    expect(panel.style.bottom).toBe('auto')   // still lifted above the keys meanwhile
    vv.height = 844
    vv.dispatchEvent(new Event('resize'))
    expect(panel.style.top).toBe('200px')
    expect(panel.style.maxHeight).toBe('500px')
    expect(panel.style.bottom).toBe('')
  })
})
