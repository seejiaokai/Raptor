// @vitest-environment jsdom
/* [TRK-CHART-FPS] — the Tracker's chart scrolled by the phone itself, the pinch the app's (owner D992, 18 Oct 26).
   What only the code decides, pinned here; what the screen does is the job's walk (scripts/handpass/trk-fps-walk.mjs).
   Its own file so the Tracker engine boots fresh (vitest gives every file its own module instance).

   TWO FINGERS ARE HELD FROM THE BROWSER: a second finger's touch is cancelled, and every move until all fingers are up,
   so the phone neither scrolls on two fingers nor takes them from the pinch, and the finger left down after a pinch does
   nothing (D134). Chromium — the walk's browser — does not take two fingers from the pinch even without the hold, so its
   break test stayed green (docs/handpass/2026-10-18-trk-chart-fps.md §Break tests): the hold is for the iPhone's WebKit,
   and this file is what proves the wire. */
import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import * as core from './app/core.js'
import { initStore, resetSession } from '../state/store'

const C: any = core
let board: HTMLElement
beforeAll(async () => {
  initStore()
  resetSession({ user: 'ad', role: 'admin' })
  board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
  await C.init()
  if (!(board as any).__pinch) C.renderBoard()
})
afterAll(() => { board.remove() })

/* a touch event as a phone sends it: `touches` is every finger still down */
function touch(type: string, fingers: number) {
  const ev = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(ev, 'touches', { value: Array.from({ length: fingers }, (_, i) => ({ identifier: i })) })
  const on = board.querySelector('#flowSvg') || board
  on.dispatchEvent(ev)
  return ev.defaultPrevented
}

describe('D992 — two fingers are the pinch\'s, one finger is the phone\'s', () => {
  it('the board is wired', () => {
    expect((board as any).__pinch, 'the pinch is listening on the chart').toBe(true)
  })
  it('one finger is left to the phone: neither its touch nor its moves are cancelled', () => {
    expect(touch('touchstart', 1)).toBe(false)
    expect(touch('touchmove', 1)).toBe(false)
    expect(touch('touchend', 0)).toBe(false)
  })
  it('a second finger is held: its touch and every move after it are cancelled until all fingers are up (D134)', () => {
    expect(touch('touchstart', 1)).toBe(false)
    expect(touch('touchstart', 2), 'the second finger\'s touch').toBe(true)
    expect(touch('touchmove', 2), 'the pinch\'s moves').toBe(true)
    touch('touchend', 1)
    expect(touch('touchmove', 1), 'the finger left down after the pinch').toBe(true)
    touch('touchend', 0)
    expect(touch('touchstart', 1), 'the next touch is the phone\'s again').toBe(false)
    expect(touch('touchmove', 1)).toBe(false)
  })
  it('a lift lost to a redraw is forgotten at the next one-finger touch', () => {
    touch('touchstart', 2)                       /* held — and its lift never reaches the board */
    expect(touch('touchstart', 1)).toBe(false)
    expect(touch('touchmove', 1), 'no longer held').toBe(false)
    touch('touchend', 0)
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
