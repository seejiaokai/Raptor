// @vitest-environment jsdom
// THE APP'S DATE CALENDAR OVER A LEAVE WAR SHEET, ON A TOUCH SCREEN ([ONE-DATE-CALENDAR] step one — the Leave War's
// posting dates: "PO from" and "PI from" on the one-day sheet, the two posting sheets and the panel for a dragged block).
//
// On a touch screen a sheet's scrim lets the finger through to the grid (Sheet.tsx useGridPan, `(pointer: coarse)`), and a
// SHIELD on the document eats every tap that lands "under the sheet" — and closes the sheet on it. The app's date
// calendar floats on the page itself (ui/DateBox.tsx — a layer on <body>), so it is inside no sheet: to the shield a tap
// on one of its dates was a tap under the sheet. It would have been eaten (the date never picked) and the sheet closed.
// jsdom has no `matchMedia`, so no other test here mounts a sheet as a phone does; this file does (as holdsheet.test.tsx).
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Sheet } from './Sheet'
import { DateBox } from '../../ui/DateBox'
import { boxValue, pickDate } from '../../ui/datecal-testkit'

describe('a date picked on the calendar that floats over a sheet, on a touch screen', () => {
  const origMM = window.matchMedia
  const onClose = vi.fn()
  const onChange = vi.fn()
  function Host() {
    const [v, setV] = useState('2026-07-14')
    return (
      <Sheet testid="the-sheet" label="A posting" onClose={onClose}>
        <DateBox testid="po-date" label="Post Slipway out from" value={v} onChange={x => { setV(x); onChange(x) }} />
      </Sheet>
    )
  }
  /* a finger's tap as the browser sends it: every event the shield listens for, then the click */
  const tap = (el: Element) => {
    for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup'] as const) fireEvent(el, new MouseEvent(type, { bubbles: true, cancelable: true }))
    fireEvent.click(el)
  }
  beforeEach(() => {
    onClose.mockClear(); onChange.mockClear()
    ;(window as any).matchMedia = (q: string) => ({ matches: q.includes('coarse'), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
    render(<Host />)
  })
  afterEach(() => { cleanup(); (window as any).matchMedia = origMM })

  it('picks the date and leaves the sheet up', () => {
    tap(screen.getByTestId('po-date'))
    expect(screen.getByTestId('dcal-card')).toBeTruthy()
    tap(screen.getByTestId('dcal-day-2026-07-20'))
    expect(onChange).toHaveBeenCalledWith('2026-07-20')
    expect(boxValue(screen.getByTestId('po-date'))).toBe('2026-07-20')
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByTestId('the-sheet')).toBeTruthy()
  })
  it('turning its months, opening its lists and its Today icon are taps on the calendar, not under the sheet', () => {
    tap(screen.getByTestId('po-date'))
    tap(screen.getByTestId('dcal-next')); tap(screen.getByTestId('dcal-title')); tap(screen.getByTestId('dcal-today'))
    expect(screen.getByTestId('dcal-card')).toBeTruthy()
    expect(onClose).not.toHaveBeenCalled()
  })
  it('a tap on the veil round the calendar closes the calendar only — the sheet stays, its date as it was', () => {
    tap(screen.getByTestId('po-date'))
    tap(screen.getByTestId('dcal-scrim'))
    expect(screen.queryByTestId('dcal-card')).toBeNull()
    expect(onClose).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
    expect(boxValue(screen.getByTestId('po-date'))).toBe('2026-07-14')
  })
  /* A SHEET HEARS ESCAPE AND TAB AT THE DOCUMENT, ON THE WAY DOWN (Sheet.tsx — Escape closes the topmost sheet; Tab is
     kept inside it, and "focus left behind it is brought in"). The calendar floats outside the sheet, so both would act
     on the SHEET while a date was being picked: Escape would close the sheet under the calendar, and Tab would pull the
     keyboard back behind the veil. The calendar takes both keys first, at the window (ui/DateBox.tsx). */
  it('Escape closes the calendar first — the sheet only on a second press', () => {
    fireEvent.click(screen.getByTestId('po-date'))
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    expect(screen.queryByTestId('dcal-card')).toBeNull()
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByTestId('the-sheet')).toBeTruthy()
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('Tab walks the calendar’s own stops: the sheet does not pull the keyboard back behind the veil', () => {
    fireEvent.click(screen.getByTestId('po-date'))
    const card = screen.getByTestId('dcal-card')
    const stops = [...card.querySelectorAll<HTMLElement>('button, [tabindex]')].filter(e => !(e as HTMLButtonElement).disabled && e.tabIndex >= 0)
    expect(stops.length).toBeGreaterThan(3)
    stops[1].focus()
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' })
    expect(document.activeElement, 'Tab did not go to the calendar’s next stop').toBe(stops[2])
    fireEvent.keyDown(document.activeElement!, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(stops[1])
    /* and round the ends, still inside the card */
    stops[stops.length - 1].focus()
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' })
    expect(document.activeElement).toBe(stops[0])
    expect(card.contains(document.activeElement)).toBe(true)
  })
  it('with the calendar gone, a tap under the sheet still closes the sheet (the shield keeps its job)', () => {
    pickDate(screen.getByTestId('po-date'), '2026-07-20')
    const under = document.createElement('div'); document.body.appendChild(under)
    tap(under)
    expect(onClose).toHaveBeenCalledTimes(1)
    under.remove()
  })
})
