// @vitest-environment jsdom
/* THE WINDOWS SHELL — one body for every window of the Inputs / SANS calendar job (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.7; owner D641, 7 Oct 26: "all those pop up windows …
   should be able to drag around and the background still works (clickable editable) when this window is up").

   `FloatWin` is a SHELL over the app's one movable-window helper (ui/floatwin.ts — where a window sits, the drag, the
   phone layout, which window is in front): a title bar it is dragged by, ✕, `role="dialog"` that is NOT modal — no
   veil, no close on a press outside, no keyboard held inside; focus moved in on opening and back to the opener on
   closing; a press brings a window to the front; Escape closes the front one. It closes by its ✕, by Escape, or by the
   button that finishes it — the caller's. Days, the calendars' settings, a day opened on a calendar and the input
   editor on the Inputs page are built on it in the steps that follow; this file is the shell alone. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { FloatWin, _resetFloatWins, bringForward } from './FloatWindow'
import { frontWin } from './floatwin'

afterEach(() => { cleanup(); _resetFloatWins() })

function Page({ onClose = () => {}, two = false, onOther = () => {} }: { onClose?: () => void; two?: boolean; onOther?: () => void }) {
  const [open, setOpen] = useState(false)
  const [n, setN] = useState(0)
  return (
    <div>
      <button data-testid="opener" onClick={() => setOpen(true)}>open</button>
      <button data-testid="behind" onClick={() => setN(x => x + 1)}>pressed {n}</button>
      <input data-testid="behind-box" defaultValue="" />
      {open && (
        <FloatWin id="days" title="Days" sub="admins only" testid="win-days" onClose={() => { onClose(); setOpen(false) }}>
          <button data-testid="in1">one</button><button data-testid="in2">two</button>
        </FloatWin>
      )}
      {open && two && (
        <FloatWin id="other" title="Settings" testid="win-other" onClose={onOther}><button data-testid="o1">x</button></FloatWin>
      )}
    </div>
  )
}
const open = () => fireEvent.click(screen.getByTestId('opener'))
const win = (id = 'win-days') => screen.getByTestId(id)

describe('the shell', () => {
  it('is a dialog that says it is NOT modal, named by its title, with a bar and a ✕', () => {
    render(<Page />); open()
    const w = win()
    expect(w.getAttribute('role')).toBe('dialog')
    expect(w.getAttribute('aria-modal')).toBe('false')
    expect(w.getAttribute('aria-label')).toBe('Days')
    expect(w.className).toContain('floatwin')
    expect(w.querySelector('.win-bar .win-ttl')!.textContent).toBe('Daysadmins only')
    expect(w.querySelector('.win-bar .win-ttl small')!.textContent).toBe('admins only')
    expect(w.querySelector('.win-bar .win-grip')).toBeTruthy()
    expect(screen.getByTestId('win-days-x').getAttribute('aria-label')).toBe('Close Days')
    expect(w.querySelector('.win-body [data-testid="in1"]')).toBeTruthy()
  })
  it('draws no veil, and the page behind it still works: a press there acts on the page and the window stays', () => {
    const onClose = vi.fn()
    render(<Page onClose={onClose} />); open()
    expect(document.querySelector('.sheetscrim, .scrim, [data-testid="sheet-scrim"]')).toBeNull()
    fireEvent.pointerDown(screen.getByTestId('behind')); fireEvent.click(screen.getByTestId('behind'))
    expect(screen.getByTestId('behind').textContent).toBe('pressed 1')
    fireEvent.pointerDown(document.body); fireEvent.click(document.body)
    expect(win()).toBeTruthy(); expect(onClose).not.toHaveBeenCalled()
  })
  it('✕ closes it', () => {
    const onClose = vi.fn()
    render(<Page onClose={onClose} />); open()
    fireEvent.click(screen.getByTestId('win-days-x'))
    expect(onClose).toHaveBeenCalledTimes(1); expect(screen.queryByTestId('win-days')).toBeNull()
  })
})

describe('the keyboard', () => {
  it('focus moves INTO the window when it opens, and back to what opened it when it closes', () => {
    render(<Page />)
    screen.getByTestId('opener').focus()
    open()
    expect(win().contains(document.activeElement)).toBe(true)
    fireEvent.click(screen.getByTestId('win-days-x'))
    expect(document.activeElement).toBe(screen.getByTestId('opener'))
  })
  it('Tab is not held inside it', () => {
    render(<Page />); open()
    screen.getByTestId('in2').focus()
    const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    screen.getByTestId('in2').dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(false)
  })
  it('Escape closes it while the keyboard is in it', () => {
    const onClose = vi.fn()
    render(<Page onClose={onClose} />); open()
    screen.getByTestId('in1').focus()
    fireEvent.keyDown(screen.getByTestId('in1'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('Escape in a box on the page BEHIND is that box’s own: the window stays', () => {
    const onClose = vi.fn()
    render(<Page onClose={onClose} />); open()
    screen.getByTestId('behind-box').focus()
    fireEvent.keyDown(screen.getByTestId('behind-box'), { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled(); expect(win()).toBeTruthy()
  })
})

describe('two windows', () => {
  it('the one opened last is in front; a press on the other brings it forward', () => {
    render(<Page two />); open()
    expect(frontWin()).toBe('other')
    expect(win('win-other').className).toContain('front'); expect(win().className).not.toContain('front')
    fireEvent.pointerDown(screen.getByTestId('in1'))
    expect(frontWin()).toBe('days')
    expect(win().className).toContain('front'); expect(win('win-other').className).not.toContain('front')
  })
  it('Escape closes only the FRONT one', () => {
    const onClose = vi.fn(), onOther = vi.fn()
    render(<Page two onClose={onClose} onOther={onOther} />); open()
    screen.getByTestId('in1').focus()
    fireEvent.keyDown(screen.getByTestId('in1'), { key: 'Escape' })    // "Settings" was opened last: it is the front one
    expect(onOther).toHaveBeenCalledTimes(1); expect(onClose).not.toHaveBeenCalled()
    fireEvent.pointerDown(screen.getByTestId('in1'))                   // Days to the front
    fireEvent.keyDown(screen.getByTestId('in1'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1); expect(onOther).toHaveBeenCalledTimes(1)
  })
  /* THE CALENDAR JOB'S BUG CHECK (8 Oct 26). "In front" was one remembered name: when the front window closed, the name
     stayed its, so NO window left on screen was in front - none wore the mark, and Escape did nothing until one was
     pressed. The window left - the one brought forward most recently of those still up - is the front one. */
  function Three() {
    const [up, setUp] = useState<Record<string, boolean>>({ days: true, other: true, third: true })
    const w = (id: string) => up[id] && (
      <FloatWin key={id} id={id} title={id} testid={'win-' + id} onClose={() => setUp(u => ({ ...u, [id]: false }))}><button data-testid={'b-' + id}>x</button></FloatWin>
    )
    return <div>{w('days')}{w('other')}{w('third')}</div>
  }
  it('when the front one closes, the one left is in front: it wears the mark and the next Escape closes it', () => {
    render(<Three />)
    expect(frontWin()).toBe('third')
    fireEvent.pointerDown(screen.getByTestId('b-days'))                 // Days forward: the order is now other, third, days
    expect(frontWin()).toBe('days')
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByTestId('win-days')).toBeNull()
    expect(frontWin(), 'the one brought forward before it').toBe('third')
    expect(win('win-third').className).toContain('front'); expect(win('win-other').className).not.toContain('front')
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByTestId('win-third')).toBeNull()
    expect(frontWin()).toBe('other'); expect(win('win-other').className).toContain('front')
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByTestId('win-other')).toBeNull()
    expect(frontWin(), 'none is left').toBe('')
  })
  /* the same check (walker G): "Calendar..." pressed in a settings window while the Calendar window was ALREADY up left it
     behind the settings window that asked for it - a door that opens a window brings it forward when it is up */
  it('a window asked for again while it is up comes to the front; one that is not up is not named in front', () => {
    render(<Three />)
    expect(frontWin()).toBe('third')
    act(() => { bringForward('days') })
    expect(frontWin()).toBe('days')
    expect(win('win-days').className).toContain('front'); expect(win('win-third').className).not.toContain('front')
    act(() => { bringForward('nobody') })
    expect(frontWin(), 'a window that is not up is never the front one').toBe('days')
  })
})

describe('dragging', () => {
  /* jsdom lays nothing out — every rect is 0 x 0 — so a window's rect is given here as a real browser would report it:
     where its own inline place says it is, 300 x 200 */
  const realRect = Element.prototype.getBoundingClientRect
  afterEach(() => { Element.prototype.getBoundingClientRect = realRect })
  const layOut = () => {
    Element.prototype.getBoundingClientRect = function (this: HTMLElement) {
      if (!this.classList || !this.classList.contains('floatwin')) return realRect.call(this)
      const left = parseFloat(this.style.left) || 0, top = parseFloat(this.style.top) || 0
      return { left, top, x: left, y: top, width: 300, height: 200, right: left + 300, bottom: top + 200, toJSON() {} } as DOMRect
    }
  }
  it('the bar drags the window, and where he put it is kept for the next time that window opens', () => {
    layOut()
    render(<Page />); open()
    const bar = win().querySelector('.win-bar') as HTMLElement
    fireEvent.pointerDown(bar, { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(bar, { clientX: 160, clientY: 140, pointerId: 1 })
    fireEvent.pointerUp(bar, { clientX: 160, clientY: 140, pointerId: 1 })
    expect(win().style.left).toBe('60px'); expect(win().style.top).toBe('40px')
    expect(win().hasAttribute('data-placed')).toBe(true)
    fireEvent.click(screen.getByTestId('win-days-x'))
    open()
    expect(win().style.left).toBe('60px'); expect(win().style.top).toBe('40px')
    /* only the PLACE is kept: the size is handed back to the stylesheet, so the window fits whatever it now holds */
    expect(win().style.width).toBe(''); expect(win().style.height).toBe('')
  })
  it('dragged low, it is capped at the room under it — its foot, and whatever button stands there, stays on the screen', () => {
    layOut()
    Object.defineProperty(window, 'innerHeight', { value: 700, configurable: true })
    render(<Page />); open()
    const bar = win().querySelector('.win-bar') as HTMLElement
    fireEvent.pointerDown(bar, { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(bar, { clientX: 100, clientY: 500, pointerId: 1 })
    fireEvent.pointerUp(bar, { clientX: 100, clientY: 500, pointerId: 1 })
    expect(win().style.top).toBe('400px')
    expect(win().style.maxHeight).toBe('292px')                        // 700 - 400 - 8
  })
  it('a press on the ✕ never starts a drag', () => {
    render(<Page />); open()
    fireEvent.pointerDown(screen.getByTestId('win-days-x'), { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(win().querySelector('.win-bar')!, { clientX: 160, clientY: 140, pointerId: 1 })
    expect(win().style.left).toBe('')
  })
})


/* A FINGER ON A WINDOW NEVER SCROLLS THE PAGE BEHIND IT (owner D686, 9 Oct 26 — found on his iPhone: with the new-input
   window up and a finger moved on it, "the page behind this window is being scrolled instead of the window that my
   finger is on"). Where what is in the window fits, or has reached its end, an iPhone hands the swipe to the page
   behind; the stylesheet's `overscroll-behavior` does not stop that there. The window stops it itself: a swipe that
   nothing inside it can take is taken by nobody. Not reproduced on the build PC (its browser engine does not do it) —
   what is pinned here is the rule the window follows. */
describe('a finger on a window never scrolls the page behind it (D686)', () => {
  const swipe = (el: Element, y0: number, y1: number, x0 = 100, x1 = 100) => {
    const mk = (type: string, x: number, y: number) => { const e = new Event(type, { bubbles: true, cancelable: true }); Object.defineProperty(e, 'touches', { value: [{ clientX: x, clientY: y }] }); return e }
    el.dispatchEvent(mk('touchstart', x0, y0))
    const move = mk('touchmove', x1, y1)
    el.dispatchEvent(move)
    return move.defaultPrevented
  }
  function Scrolly({ top }: { top: number }) {
    return (
      <FloatWin id="days" title="Days" testid="win-days" onClose={() => {}}>
        <div data-testid="scr" style={{ overflowY: 'auto' }} ref={n => {
          if (!n) return
          Object.defineProperty(n, 'scrollHeight', { value: 500, configurable: true }); Object.defineProperty(n, 'clientHeight', { value: 200, configurable: true })
          Object.defineProperty(n, 'scrollTop', { value: top, configurable: true })
        }}><button data-testid="deep">x</button></div>
      </FloatWin>
    )
  }
  it('what is in the window fits: a swipe up or down on it is stopped — the page behind does not get it', () => {
    render(<Page />); open()
    expect(swipe(screen.getByTestId('in1'), 300, 200)).toBe(true)
    expect(swipe(screen.getByTestId('in1'), 200, 300)).toBe(true)
  })
  it('a list inside it that CAN still move takes the swipe: it is left alone', () => {
    render(<Scrolly top={100} />)
    expect(swipe(screen.getByTestId('deep'), 300, 200), 'finger up, list not at its foot').toBe(false)
    expect(swipe(screen.getByTestId('deep'), 200, 300), 'finger down, list not at its top').toBe(false)
  })
  it('at its top a pull down is stopped, at its foot a push up — the list has no more, and the page must not take it', () => {
    const v = render(<Scrolly top={0} />)
    expect(swipe(screen.getByTestId('deep'), 200, 300), 'at the top, finger down').toBe(true)
    expect(swipe(screen.getByTestId('deep'), 300, 200), 'at the top, finger up: it can move').toBe(false)
    v.unmount()
    render(<Scrolly top={300} />)
    expect(swipe(screen.getByTestId('deep'), 300, 200), 'at the foot, finger up').toBe(true)
  })
  it('a swipe SIDEWAYS on it is not the window’s business', () => {
    render(<Page />); open()
    expect(swipe(screen.getByTestId('in1'), 300, 304, 100, 200)).toBe(false)
  })
  it('a finger on the page BEHIND still scrolls the page (D641)', () => {
    render(<Page />); open()
    expect(swipe(screen.getByTestId('behind'), 300, 200)).toBe(false)
  })
})
