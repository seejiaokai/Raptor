// @vitest-environment jsdom
/* [TRK-CHART-FPS] — the Tracker's chart scrolled by the phone itself, the pinch the app's (owner D992, 18 Oct 26).
   What only the code decides, pinned here; what the screen does is the job's walk (scripts/handpass/trk-fps-walk.mjs).
   Its own file so the Tracker engine boots fresh (vitest gives every file its own module instance).

   TWO FINGERS ARE HELD FROM THE BROWSER: a second finger's touch is cancelled, and every move until all fingers are up,
   so the phone neither scrolls on two fingers nor takes them from the pinch, and the finger left down after a pinch does
   nothing (D134). Chromium — the walk's browser — does not take two fingers from the pinch even without the hold, so its
   break test stayed green (docs/handpass/2026-10-18-trk-chart-fps.md §Break tests): the hold is for the iPhone's WebKit,
   and this file is what proves the wire. Only the chart's own fingers count (the code read's F2). */
import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import * as core from './app/core.js'
import { initStore, resetSession } from '../state/store'

const C: any = core
let board: HTMLElement, outside: HTMLElement
beforeAll(async () => {
  initStore()
  resetSession({ user: 'ad', role: 'admin' })
  board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
  outside = document.createElement('div'); document.body.appendChild(outside)
  await C.init()
  if (!(board as any).__pinch) C.renderBoard()
})
afterAll(() => { board.remove(); outside.remove() })

/* fingers on the screen: ids on the chart, and (by a negative id) any resting elsewhere */
let down: Array<{ identifier: number, target: Element }> = []
const on = () => board.querySelector('#flowSvg') || board
/* a touch event as a phone sends it: `touches` every finger still down, `changedTouches` the ones this event is about */
function send(type: string, changed: Array<{ identifier: number, target: Element }>, at: Element = on()) {
  const ev = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(ev, 'touches', { value: down.slice() })
  Object.defineProperty(ev, 'changedTouches', { value: changed })
  at.dispatchEvent(ev)
  return ev.defaultPrevented
}
const land = (id: number, target: Element = on()) => { const t = { identifier: id, target }; down.push(t); return send('touchstart', [t], target) }
const move = () => send('touchmove', down.filter(t => board.contains(t.target)))
const lift = (id: number) => { const t = down.find(d => d.identifier === id)!; down = down.filter(d => d !== t); return send('touchend', [t], t.target) }

describe('D992 — two fingers are the pinch\'s, one finger is the phone\'s', () => {
  it('the board is wired', () => {
    expect((board as any).__pinch, 'the pinch is listening on the chart').toBe(true)
  })
  it('one finger is left to the phone: neither its touch nor its moves are cancelled', () => {
    expect(land(1)).toBe(false)
    expect(move()).toBe(false)
    lift(1)
  })
  it('a second finger is held: its touch and every move after it are cancelled until all fingers are up (D134)', () => {
    expect(land(1)).toBe(false)
    expect(land(2), 'the second finger\'s touch').toBe(true)
    expect(move(), 'the pinch\'s moves').toBe(true)
    lift(2)
    expect(move(), 'the finger left down after the pinch').toBe(true)
    lift(1)
    expect(land(3), 'the next touch is the phone\'s again').toBe(false)
    expect(move()).toBe(false)
    lift(3)
  })
  it('a finger resting off the chart does not count: the chart\'s one finger is still the phone\'s (the code read\'s F2)', () => {
    /* the thumb's touch lands on another element; the board never hears it, but it is in every later event's touches */
    down.push({ identifier: -1, target: outside })
    expect(land(4), 'one finger on the chart, one resting elsewhere').toBe(false)
    expect(move(), 'the chart scrolls').toBe(false)
    lift(4)
    down = down.filter(d => d.identifier !== -1)
  })
  it('a finger landing anywhere frees its id: a reused id off the chart is not the chart\'s (the fix read\'s 2)', () => {
    land(10); land(11)                        /* held — and their lifts are lost */
    down = []
    /* a thumb lands off the chart with the reused id 10; then one finger on the chart */
    const thumb = { identifier: 10, target: outside }; down.push(thumb); send('touchstart', [thumb], outside)
    expect(land(12), 'one chart finger beside the thumb').toBe(false)
    expect(move(), 'the chart scrolls').toBe(false)
    lift(12); down = []
  })
  it('a lift lost to a redraw is forgotten at the next landing', () => {
    land(5); land(6)                          /* held — and their lifts never reach the board */
    down = []
    expect(land(7)).toBe(false)
    expect(move(), 'no longer held').toBe(false)
    lift(7)
  })
  it('a held finger\'s moves are cancelled at its own target too, so a redraw that detaches it does not free it (the code read\'s F3)', () => {
    const svg = on()
    land(8); land(9)
    const ev = new Event('touchmove', { bubbles: false, cancelable: true })
    Object.defineProperty(ev, 'touches', { value: down.slice() })
    svg.remove()                              /* the redraw: the fingers' target leaves the board */
    svg.dispatchEvent(ev)
    expect(ev.defaultPrevented, 'the move sent to the detached target is still cancelled').toBe(true)
    board.appendChild(svg)
    lift(9); lift(8)
  })
  it('a finger\'s press on the chart starts no drag of the app\'s own (the browser scrolls it); a mouse\'s does', () => {
    const ev = (type: string, kind: string, y: number) => board.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: 20, clientY: y, pointerId: kind === 'mouse' ? 1 : 7, pointerType: kind, isPrimary: true, button: 0, buttons: 1 }))
    ev('pointerdown', 'touch', 300); ev('pointermove', 'touch', 200)
    expect(board.classList.contains('dragging'), 'a finger: not the app\'s drag').toBe(false)
    ev('pointerup', 'touch', 200)
    ev('pointerdown', 'mouse', 300); ev('pointermove', 'mouse', 200)
    expect(board.classList.contains('dragging'), 'a mouse: the app\'s drag (D988)').toBe(true)
    ev('pointerup', 'mouse', 200)
    expect(board.classList.contains('dragging')).toBe(false)
  })
})

describe('D989, kept by D992 — the app\'s own move stops the phone\'s glide (the code read\'s F1)', () => {
  it('right after a finger\'s scroll the box stops being a scroll box for two frames (whether the iPhone\'s glide then stops is his look card)', async () => {
    const frames: Array<() => void> = []
    const raf = globalThis.requestAnimationFrame
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => { frames.push(() => cb(0)); return frames.length }) as typeof requestAnimationFrame
    try {
      board.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 3, isPrimary: true }))
      board.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerType: 'touch', pointerId: 3 }))
      board.dispatchEvent(new Event('scroll'))          /* the phone's scroll — and its glide — under way */
      C.stopGlide(board)
      expect(board.style.overflow, 'not a scroll box: the glide is dropped').toBe('hidden')
      frames.splice(0).forEach(f => f())
      expect(board.style.overflow, 'still not, through the next frame').toBe('hidden')
      frames.splice(0).forEach(f => f())
      expect(board.style.overflow, 'a scroll box again two frames on').toBe('')
      /* the Tracker's own queued frames (its landing) run out, each ending any stop it made */
      for (let i = 0; i < 10 && frames.length; i++) frames.splice(0).forEach(f => f())
      expect(board.style.overflow).toBe('')
      /* a finger that lands and has not scrolled since (a tap that only stopped the glide, then a chip's landing) */
      await new Promise(r => setTimeout(r, 2))
      for (let i = 0; i < 10 && frames.length; i++) frames.splice(0).forEach(f => f())   /* and any the wait let in */
      expect(board.style.overflow).toBe('')
      board.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 4, isPrimary: true }))
      C.stopGlide(board)
      expect(board.style.overflow, 'no scroll since that finger: nothing to stop').toBe('')
    } finally { globalThis.requestAnimationFrame = raf }
  })
  it('a key\'s own move after a flick stops the glide, and a key held down stops it once, not at every repeat (the third read\'s F1)', () => {
    const frames: Array<() => void> = []
    const raf = globalThis.requestAnimationFrame
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => { frames.push(() => cb(0)); return frames.length }) as typeof requestAnimationFrame
    const stopOnKey = () => C.stopGlide(board)
    try {
      for (let i = 0; i < 10 && frames.length; i++) frames.splice(0).forEach(f => f())
      board.addEventListener('keydown', stopOnKey)    /* as the chart's keys, Home / End and the undo do */
      board.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 7, isPrimary: true }))
      board.dispatchEvent(new Event('scroll'))
      board.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
      expect(board.style.overflow, 'the key\'s move stopped the glide').toBe('hidden')
      frames.splice(0).forEach(f => f()); frames.splice(0).forEach(f => f())
      expect(board.style.overflow).toBe('')
      board.dispatchEvent(new Event('scroll'))          /* the key's own move */
      board.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
      expect(board.style.overflow, 'the repeat: the mark was spent, nothing to stop').toBe('')
    } finally {
      board.removeEventListener('keydown', stopOnKey)
      for (let i = 0; i < 10 && frames.length; i++) frames.splice(0).forEach(f => f())
      globalThis.requestAnimationFrame = raf
    }
  })
  it('a wheel after the finger clears its mark: the box is left alone', async () => {
    board.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 5, isPrimary: true }))
    board.dispatchEvent(new Event('wheel'))
    board.dispatchEvent(new Event('scroll'))
    C.stopGlide(board)
    expect(board.style.overflow).toBe('')
  })
  it('a box with scrollbars that take room (a touch-screen laptop) keeps them: never two frames without them', () => {
    const frames: Array<() => void> = []
    const raf = globalThis.requestAnimationFrame
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => { frames.push(() => cb(0)); return frames.length }) as typeof requestAnimationFrame
    try {
      Object.defineProperty(board, 'offsetWidth', { value: 400, configurable: true })
      Object.defineProperty(board, 'clientWidth', { value: 385, configurable: true })
      board.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 6, isPrimary: true }))
      board.dispatchEvent(new Event('scroll'))
      C.stopGlide(board)
      expect(board.style.overflow, 'scrollable again at once').toBe('')
    } finally {
      delete (board as any).offsetWidth; delete (board as any).clientWidth
      for (let i = 0; i < 10 && frames.length; i++) frames.splice(0).forEach(f => f())
      globalThis.requestAnimationFrame = raf
    }
  })
  it('a box no finger has scrolled is left alone (a mouse, a wheel)', async () => {
    const b2 = document.createElement('div'); document.body.appendChild(b2)
    C.dragScroll(b2)
    b2.dispatchEvent(new Event('scroll'))               /* a wheel — no finger ever touched it */
    C.stopGlide(b2)
    expect(b2.style.overflow).toBe('')
    b2.remove()
  })
})
