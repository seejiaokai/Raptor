// THE PHONE HOLD WITH THE SHEET ACTUALLY MOUNTED (the absence-record re-test's re-walk, 26 Sep 26 — W4's re-walker
// found W4-1's first fix did not work in the running app). A finger held on ONE day and lifted opens the selection
// sheet; the finger's own tap arrives ~20–30 ms later. The first fix kept the drag's one-shot swallow alive long enough
// to catch that tap — but on a touch screen an open sheet puts its own tap shield on the document (Sheet.tsx
// useGridPan, `(pointer: coarse)`), and the shield closes the sheet on a click that lands under it. The swallow and the
// shield both listen on the document, and `stopPropagation` does not stop another listener on the SAME node — so the
// swallowed tap still reached the shield and the sheet closed 22 ms after it opened. selecttap.test.ts mounts no sheet
// and jsdom has no `matchMedia`, so it could not see this; this file mounts the real Sheet with a coarse pointer.

import { act, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { wireSelect } from './select'
import { Sheet } from './Sheet'

describe('a finger held on one day and lifted keeps the selection sheet — with the sheet mounted, on a touch screen (W4-1)', () => {
  let wrap: HTMLElement, cell: HTMLElement, teardown: () => void
  let open: (v: boolean) => void = () => {}
  const origEFP = document.elementFromPoint
  const origMM = window.matchMedia
  function Host() {
    const [on, setOn] = useState(false)
    open = setOn
    return on ? <Sheet testid="sel-sheet" label="Selection" onClose={() => setOn(false)}><button>Fill</button></Sheet> : null
  }
  beforeEach(() => {
    vi.useFakeTimers()
    document.elementFromPoint = () => null
    ;(window as any).matchMedia = (q: string) => ({ matches: q.includes('coarse'), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
    render(<Host />)
    wrap = document.createElement('div')
    cell = document.createElement('div')
    cell.setAttribute('data-testid', 'cell-ramp-2026-01-06')
    wrap.appendChild(cell)
    document.body.appendChild(wrap)
    teardown = wireSelect(wrap, { order: () => ['ramp'], dates: () => ['2026-01-06'], enabled: () => true, onSelect: () => act(() => open(true)) })
  })
  afterEach(() => { teardown(); wrap.remove(); document.elementFromPoint = origEFP; (window as any).matchMedia = origMM; vi.useRealTimers() })

  it('the tap the finger leaves 30 ms after the lift neither reaches the day nor closes the sheet', () => {
    cell.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: 5, clientY: 5, button: 0 }))
    act(() => { vi.advanceTimersByTime(200) })   // the hold arms
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, pointerType: 'touch', button: 0 }))
    expect(screen.getByTestId('sel-sheet')).toBeTruthy()
    act(() => { vi.advanceTimersByTime(30) })
    act(() => { cell.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })) })
    expect(screen.queryByTestId('sel-sheet')).toBeTruthy()
  })
  it('a real tap under the sheet afterwards still closes it (the shield keeps its job)', () => {
    cell.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: 5, clientY: 5, button: 0 }))
    act(() => { vi.advanceTimersByTime(200) })
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, pointerType: 'touch', button: 0 }))
    act(() => { vi.advanceTimersByTime(30) })
    act(() => { cell.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })) })   // the trailing tap
    act(() => { vi.advanceTimersByTime(1000) })
    act(() => { cell.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })) })   // a real tap later
    expect(screen.queryByTestId('sel-sheet')).toBeNull()
  })
})
