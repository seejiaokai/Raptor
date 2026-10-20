// @vitest-environment jsdom
/* [TRK-PINCH-OLD-EDGES] (21 Oct 26) — two older edges of the Tracker chart's pinch, met by the code reads of
   [TRK-CHART-FPS]. What only the code decides is pinned here; what the screen does is the job's walk
   (docs/handpass/2026-10-21-tracker-small.md). Its own file so the Tracker engine boots fresh.
   1. A pinch ended by a lift lost to a redraw (the next PRIMARY touch is the device saying no finger is down) settles its
      zoom — and is then the person's own zoom, as the ordinary lift makes it: the % label shows it, and the next redraw
      on a phone does not fit the chart to the phone's width again.
   2. Edit chart layout switched on while a pinch runs (a third finger, through the menu) does not throw in the pinch's
      moves: the pinch belongs to the mode it began in, and once the mode has changed under it, it does nothing more. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act, createElement, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import * as core from './app/core.js'
import { FlowZoomCtl } from './components/ZoomControls.jsx'
import { initStore, resetSession } from '../state/store'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const C: any = core
function Live() { useSyncExternalStore(C.subscribe, C.getVersion); return createElement(FlowZoomCtl) }

let board: HTMLElement, host: HTMLElement, root: any
const errors: string[] = []
const onError = (e: ErrorEvent) => { errors.push(String(e.message || e.error)) }
beforeAll(async () => {
  initStore()
  resetSession({ user: 'ad', role: 'admin' })
  board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
  /* jsdom lays nothing out: a phone's board, 380px across, so the chart is fitted to it until the zoom is the person's */
  Object.defineProperty(board, 'clientWidth', { configurable: true, get: () => 380 })
  Object.defineProperty(board, 'clientHeight', { configurable: true, get: () => 600 })
  await C.init()
  await C.whenLoaded()
  if (!(board as any).__pinch) C.renderBoard()
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(createElement(Live)) })
  window.addEventListener('error', onError)
})
afterAll(() => { window.removeEventListener('error', onError); act(() => root.unmount()); host.remove(); board.remove() })

/* a finger's pointer event, as a phone sends it */
function finger(type: string, id: number, x: number, y: number, primary: boolean) {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y })
  Object.defineProperty(e, 'pointerType', { value: 'touch' })
  Object.defineProperty(e, 'pointerId', { value: id })
  Object.defineProperty(e, 'isPrimary', { value: primary })
  return e
}
const send = (type: string, id: number, x: number, y: number, primary = false) => act(async () => { board.dispatchEvent(finger(type, id, x, y, primary)) })
const pct = () => document.getElementById('fzPct')!.textContent
const scale = () => { const m = /scale\(([\d.]+)\)/.exec(document.getElementById('viewport')!.getAttribute('transform') || ''); return m ? +m[1] : NaN }

describe('[TRK-PINCH-OLD-EDGES] — a pinch ended by a lift lost to a redraw', () => {
  it('settles its zoom as the person\'s own: the % label shows it and the next redraw does not re-fit it', async () => {
    await act(async () => { C.resetFlowZoom() })   /* the zoom is the phone's fit, not the person's */
    const fit = C.flowZoom
    expect(fit, 'a phone\'s board fits the chart below 100%').toBeLessThan(1)
    expect(pct()).toBe(`${Math.round(fit * 100)}%`)
    await send('pointerdown', 11, 100, 100, true)
    await send('pointerdown', 12, 200, 100)
    await send('pointermove', 12, 300, 100)          /* the fingers twice as far apart */
    const pinched = Math.min(3, +(fit * 2).toFixed(3))
    /* both lifts are lost to a redraw: the next touch is the device's first finger again */
    await send('pointerdown', 13, 150, 150, true)
    expect(C.flowZoom, 'the zoom the pinch reached').toBe(pinched)
    expect(pct(), 'the % label shows the zoom reached, not the one before the pinch').toBe(`${Math.round(pinched * 100)}%`)
    await send('pointerup', 13, 150, 150, true)
    await act(async () => { C.renderBoard() })
    expect(C.flowZoom, 'a redraw on a phone keeps the person\'s zoom rather than fitting the chart again').toBe(pinched)
    expect(errors).toEqual([])
  })
})

describe('[TRK-PINCH-OLD-EDGES] — Edit chart layout switched on while a pinch runs', () => {
  it('the pinch\'s moves do not throw, change nothing in the new mode, and the lift ends it cleanly', async () => {
    errors.length = 0
    await send('pointerdown', 21, 100, 100, true)
    await send('pointerdown', 22, 200, 100)
    await send('pointermove', 22, 250, 100)
    const zoomBefore = C.flowZoom
    await act(async () => { C.toggleArrange() })     /* a third finger, through the menu */
    expect(C.arrangeMode).toBe(true)
    const k = scale()
    await send('pointermove', 22, 320, 100)
    await send('pointermove', 21, 60, 100)
    expect(errors, 'the pinch\'s moves after the switch').toEqual([])
    expect(scale(), 'the editing canvas is not zoomed by a pinch begun outside it').toBe(k)
    await send('pointerup', 22, 320, 100)
    await send('pointerup', 21, 60, 100, true)
    expect(errors, 'the lifts').toEqual([])
    expect(scale(), 'nor by its lift').toBe(k)
    await act(async () => { C.toggleArrange() })
    expect(C.arrangeMode).toBe(false)
    expect(C.flowZoom, 'out of Edit chart layout the zoom is the one the editing canvas had').toBe(Math.min(3, Math.max(0.1, k)))
    expect(Number.isFinite(zoomBefore)).toBe(true)
    /* and the next pinch outside Edit chart layout works as ever */
    await send('pointerdown', 23, 100, 100, true)
    await send('pointerdown', 24, 200, 100)
    await send('pointermove', 24, 300, 100)
    await send('pointerup', 24, 300, 100)
    await send('pointerup', 23, 100, 100, true)
    expect(errors).toEqual([])
    expect(C.flowZoom, 'the next pinch doubles the zoom').toBe(Math.min(3, +(Math.min(3, Math.max(0.1, k)) * 2).toFixed(3)))
  })
})

describe('[TRK-PINCH-OLD-EDGES] — Edit chart layout switched on and off again while one pinch runs', () => {
  it('the pinch stays over: back outside Edit chart layout its moves and its lift change nothing', async () => {
    errors.length = 0
    await send('pointerdown', 31, 100, 100, true)
    await send('pointerdown', 32, 200, 100)
    await send('pointermove', 32, 250, 100)
    await act(async () => { C.toggleArrange() })
    await send('pointermove', 32, 260, 100)
    await act(async () => { C.toggleArrange() })
    const z = C.flowZoom
    await send('pointermove', 32, 400, 100)
    await send('pointerup', 32, 400, 100)
    await send('pointerup', 31, 100, 100, true)
    expect(errors).toEqual([])
    expect(C.flowZoom, 'the zoom the switch back set stands').toBe(z)
  })
})

describe('[TRK-PINCH-OLD-EDGES] — switched on and straight off again with the fingers held still (the code read\'s finding 1)', () => {
  it('no move between the two switches: the lift still settles nothing', async () => {
    errors.length = 0
    await act(async () => { C.resetFlowZoom() })
    await send('pointerdown', 51, 100, 100, true)
    await send('pointerdown', 52, 200, 100)
    await send('pointermove', 52, 250, 100)          /* the chart stretched */
    await act(async () => { C.toggleArrange() })
    await act(async () => { C.toggleArrange() })     /* and back, before any finger moved */
    const z = C.flowZoom
    await send('pointerup', 52, 250, 100)
    await send('pointerup', 51, 100, 100, true)
    expect(errors).toEqual([])
    expect(C.flowZoom, 'the zoom the switch back set stands').toBe(z)
  })
})
