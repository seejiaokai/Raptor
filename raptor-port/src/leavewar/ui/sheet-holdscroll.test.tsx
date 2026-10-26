/* A FINGER ON A LEAVE WAR WINDOW NEVER SCROLLS THE PAGE BEHIND IT (owner D686, 9 Oct 26 — "a scroll that begins on a window
   moves what is in the window, or nothing"; found again on the Leave War's Settings window on his iPhone, 22 Oct 26 — "I
   could scroll the page behind this page somehow vertically"). The war's windows relied on the stylesheet's
   `overscroll-behavior: contain`, which an iPhone ignores where what is in the window fits or has reached its end. They now
   take the same guard as the app's other windows (ui/floatwin.ts holdPageScroll). A finger on the BACKGROUND still scrolls
   the grid (owner, 28 Aug 26 — the page stays scrollable under a sheet; Sheet.tsx). Not reproduced in the build PC's
   browser (it honours the stylesheet) — what is pinned is the rule the window follows. */
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sheet } from './Sheet'

const swipe = (el: Element, y0: number, y1: number, x0 = 100, x1 = 100) => {
  const mk = (type: string, x: number, y: number) => { const e = new Event(type, { bubbles: true, cancelable: true }); Object.defineProperty(e, 'touches', { value: [{ clientX: x, clientY: y }] }); return e }
  el.dispatchEvent(mk('touchstart', x0, y0))
  const move = mk('touchmove', x1, y1)
  el.dispatchEvent(move)
  return move.defaultPrevented
}

function Page({ top, modal = true }: { top?: number; modal?: boolean }) {
  return (
    <div>
      <div data-testid="behind">the grid</div>
      <Sheet testid="settings-sheet" label="Settings" onClose={() => {}} modal={modal}>
        <button data-testid="fits">Reset order</button>
        {top !== undefined && (
          <div data-testid="list" style={{ overflowY: 'auto' }} ref={n => {
            if (!n) return
            Object.defineProperty(n, 'scrollHeight', { value: 500, configurable: true }); Object.defineProperty(n, 'clientHeight', { value: 200, configurable: true })
            Object.defineProperty(n, 'scrollTop', { value: top, configurable: true })
          }}><button data-testid="deep">x</button></div>
        )}
      </Sheet>
    </div>
  )
}

describe('a finger on a Leave War window never scrolls the page behind it (D686)', () => {
  it('what is in the window fits: a swipe up or down on it is stopped', () => {
    render(<Page />)
    expect(swipe(screen.getByTestId('fits'), 300, 200)).toBe(true)
    expect(swipe(screen.getByTestId('fits'), 200, 300)).toBe(true)
  })
  it('a list inside it that can still move takes the swipe; at its end the page does not', () => {
    const v = render(<Page top={100} />)
    expect(swipe(screen.getByTestId('deep'), 300, 200)).toBe(false)
    expect(swipe(screen.getByTestId('deep'), 200, 300)).toBe(false)
    v.unmount()
    render(<Page top={300} />)
    expect(swipe(screen.getByTestId('deep'), 300, 200), 'at the foot, finger up').toBe(true)
  })
  it('the same on a window that does not block the page (the Required and selection panels)', () => {
    render(<Page modal={false} />)
    expect(swipe(screen.getByTestId('fits'), 300, 200)).toBe(true)
  })
  it('a swipe sideways is not the window’s business, and a finger on the grid behind still scrolls it (28 Aug 26)', () => {
    render(<Page />)
    expect(swipe(screen.getByTestId('fits'), 300, 304, 100, 200)).toBe(false)
    expect(swipe(screen.getByTestId('behind'), 300, 200)).toBe(false)
  })
})
