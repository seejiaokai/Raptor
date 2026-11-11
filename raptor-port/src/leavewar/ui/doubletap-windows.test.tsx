// @vitest-environment jsdom
/* A DOUBLE TAP ON ANY OTHER WINDOW'S CLOSING BUTTON OPENS NOTHING BEHIND IT ([LW-DOUBLETAP-OTHER-WINDOWS] — the code read's
   F1 of the night of 6 Nov 26, `docs/handpass/parts/lw1106/read-code.md`). The guard of `doubletap.test.tsx` was armed only
   when the one-day window or the drag window closed; the person window, ⚙ Settings, the event window, the counter form, the
   Events list, the Manning sheet, the OIL tracker and the event box close the same way over the same grid, and a finger's
   second tap a moment later fell through to the day, the name or the chip where the button had stood. The SAME guard now
   arms when any of them closes by a press inside it — the same place (32 px), the same moment (600 ms), the same things let
   through (a tap elsewhere, a mouse's single click, a key, a window closed by a key or by a tap outside it). Red first. */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { initStore, lwHistInit, setRole } from '../state/store'
import { setLwOnScreen } from '../state/screen'
import { memoryBackend } from '../state/storage'
import { elevenCounters } from '../testkit'
import { askLw } from './lwnav'
import { Matrix } from './Matrix'

const ISNAP = JSON.stringify(INPUTS)
const CELL = 'cell-asics-2026-01-29'
const picker = () => screen.queryByTestId('bid-picker')
/* a finger's tap: its press (a touch) and then its click */
const tap = (el: Element, x = 10, y = 10) => {
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 3, pointerType: 'touch', button: 0, clientX: x, clientY: y }))
  fireEvent.click(el, { detail: 1, clientX: x, clientY: y })
}
/* a mouse's click: its press and then its click, `detail` the browser's count */
const mouse = (el: Element, detail: number, x = 10, y = 10) => {
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'mouse', button: 0, clientX: x, clientY: y }))
  fireEvent.click(el, { detail, clientX: x, clientY: y })
}
/* the second tap, where the first one landed: a day's cell behind the window that just closed */
const second = (what: string) => {
  tap(screen.getByTestId(CELL))
  expect(picker(), `${what}: the second tap opens no window behind it`).toBeNull()
}
const settings = () => {
  act(() => askLw({ kind: 'settings' }))
  expect(screen.getByTestId('settings-sheet')).toBeTruthy()
}

beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  initStore(memoryBackend()); lwHistInit(); setRole('admin'); setLwOnScreen(true)
  elevenCounters()   // the Manning sheet opens from a counter's name; the app starts with none (D669)
  /* jsdom draws nothing: the grid's press machine asks what is under a finger */
  if (typeof document.elementFromPoint !== 'function') (document as any).elementFromPoint = () => null
})
afterEach(() => { INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })

describe('a double tap on another window\'s closing button ([LW-DOUBLETAP-OTHER-WINDOWS])', () => {
  it('the person window\'s ✕', () => {
    render(<Matrix />)
    fireEvent.click(screen.getAllByTestId('person-asics')[0]!)
    expect(screen.getByTestId('person-window')).toBeTruthy()
    tap(screen.getByTestId('pw-close'))
    expect(screen.queryByTestId('person-window')).toBeNull()
    second('the person window')
  })

  it('⚙ Settings\' ✕', () => {
    render(<Matrix />)
    settings()
    tap(screen.getByTestId('settings-close'))
    expect(screen.queryByTestId('settings-sheet')).toBeNull()
    second('Settings')
  })

  it('⚙ Settings\' "Rearrange the grid", which closes it onto the grid', () => {
    render(<Matrix />)
    settings()
    tap(screen.getByTestId('settings-rearrange'))
    expect(screen.queryByTestId('settings-sheet')).toBeNull()
    tap(screen.getAllByTestId('person-asics')[0]!)
    expect(screen.queryByTestId('person-window'), 'no figures opened behind it').toBeNull()
  })

  it('the event window\'s ✕', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('event-0-2026-01-05'))
    expect(screen.getByTestId('event-sheet')).toBeTruthy()
    tap(screen.getByTestId('event-cancel'))
    expect(screen.queryByTestId('event-sheet')).toBeNull()
    second('the event window')
  })

  it('the event window\'s Save, and then its Delete', async () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('event-0-2026-01-05'))
    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'Range day' } })
    tap(screen.getByTestId('event-apply'))
    expect(screen.queryByTestId('event-sheet'), 'saved and closed').toBeNull()
    second('the event window\'s Save')
    /* past the moment, the saved event opened again through its box's Edit, and deleted by a finger */
    await act(async () => { await new Promise(r => setTimeout(r, 650)) })
    fireEvent.click(screen.getByTestId('event-0-2026-01-05'))
    fireEvent.click(screen.getByTestId('event-peek-edit'))
    expect(screen.getByTestId('event-sheet')).toBeTruthy()
    await act(async () => { await new Promise(r => setTimeout(r, 650)) })
    tap(screen.getByTestId('event-delete'))
    expect(screen.queryByTestId('event-sheet'), 'deleted and closed').toBeNull()
    second('the event window\'s Delete')
  })

  it('the counter form\'s ✕, and its Cancel', async () => {
    render(<Matrix />)
    settings()
    fireEvent.click(screen.getByTestId('counter-add'))
    expect(screen.getByTestId('counter-form')).toBeTruthy()
    tap(screen.getByTestId('cform-close'))
    expect(screen.queryByTestId('counter-form')).toBeNull()
    second('the counter form\'s ✕')
    await act(async () => { await new Promise(r => setTimeout(r, 650)) })
    settings()
    fireEvent.click(screen.getByTestId('counter-add'))
    tap(screen.getByTestId('cform-cancel'))
    expect(screen.queryByTestId('counter-form')).toBeNull()
    second('the counter form\'s Cancel')
  })

  it('the counter form\'s Delete (a counter opened from its Manning sheet)', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('manning-info-sets'))
    fireEvent.click(screen.getByTestId('counter-edit-open'))
    expect(screen.getByTestId('counter-form')).toBeTruthy()
    /* "Delete counter" asks once (D677): its first press arms it, its second deletes and closes */
    fireEvent.click(screen.getByTestId('cform-delete'))
    if (screen.queryByTestId('counter-form')) tap(screen.getByTestId('cform-delete'))
    expect(screen.queryByTestId('counter-form'), 'deleted and closed').toBeNull()
    second('the counter form\'s Delete')
  })

  it('the counter form\'s Save (a counter opened from its Manning sheet, renamed)', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('manning-info-sets'))
    fireEvent.click(screen.getByTestId('counter-edit-open'))
    fireEvent.change(screen.getByTestId('cform-name'), { target: { value: 'CREW SETS 2' } })
    tap(screen.getByTestId('cform-save'))
    expect(screen.queryByTestId('counter-form'), 'saved and closed').toBeNull()
    second('the counter form\'s Save')
  })

  it('the Events list\'s ✕', () => {
    render(<Matrix />)
    settings()
    fireEvent.click(screen.getByTestId('settings-events'))
    expect(screen.getByTestId('events-sheet')).toBeTruthy()
    tap(screen.getByTestId('events-close'))
    expect(screen.queryByTestId('events-sheet')).toBeNull()
    second('the Events list')
  })

  it('the Manning sheet\'s ✕', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('manning-info-sets'))
    expect(screen.getByTestId('manning-sheet')).toBeTruthy()
    tap(screen.getByTestId('manning-info-close'))
    expect(screen.queryByTestId('manning-sheet')).toBeNull()
    second('the Manning sheet')
  })

  it('the OIL tracker\'s ✕', () => {
    render(<Matrix />)
    act(() => askLw({ kind: 'oil' }))
    expect(screen.getByTestId('oil-sheet')).toBeTruthy()
    tap(screen.getByTestId('oil-close'))
    expect(screen.queryByTestId('oil-sheet')).toBeNull()
    second('the OIL tracker')
  })

  it('the event box\'s Edit — a press inside the box that takes it away', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('event-0-2026-01-01'))
    expect(screen.getByTestId('event-peek')).toBeTruthy()
    tap(screen.getByTestId('event-peek-edit'))
    expect(screen.queryByTestId('event-peek')).toBeNull()
    second('the event box')
  })

  /* what the built guard lets through, it lets through here too */
  it('a finger\'s quick tap on another day, away from the ✕, opens it', () => {
    render(<Matrix />)
    settings()
    tap(screen.getByTestId('settings-close'))
    tap(screen.getByTestId(CELL), 200, 300)
    expect(picker()).toBeTruthy()
  })

  it('a mouse\'s single click on a day at once after the ✕ opens it; its double click\'s second click does not', () => {
    render(<Matrix />)
    settings()
    mouse(screen.getByTestId('settings-close'), 1)
    mouse(screen.getByTestId(CELL), 2)
    expect(picker(), 'the double click\'s second click').toBeNull()
    settings()
    mouse(screen.getByTestId('settings-close'), 1)
    mouse(screen.getByTestId(CELL), 1)
    expect(picker(), 'a desktop\'s quick next click').toBeTruthy()
  })

  it('a window closed by Escape leaves no press to guard: a tap at once opens', () => {
    render(<Matrix />)
    fireEvent.click(screen.getAllByTestId('person-asics')[0]!)
    tap(screen.getByTestId('pw-name'))   // a press inside the window, at the old spot
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTestId('person-window')).toBeNull()
    tap(screen.getByTestId(CELL))
    expect(picker()).toBeTruthy()
  })

  it('a tap after the moment opens as ever', async () => {
    render(<Matrix />)
    settings()
    tap(screen.getByTestId('settings-close'))
    await act(async () => { await new Promise(r => setTimeout(r, 650)) })
    tap(screen.getByTestId(CELL))
    expect(picker()).toBeTruthy()
  })

  /* the event box closed by a press OUTSIDE it (on the grid) is the grid's own press — the built guard's N1: the day
     tapped is opened, never eaten */
  it('the event box closed by a tap on a day: that day opens', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('event-0-2026-01-01'))
    expect(screen.getByTestId('event-peek')).toBeTruthy()
    tap(screen.getByTestId(CELL))
    expect(screen.queryByTestId('event-peek')).toBeNull()
    expect(picker()).toBeTruthy()
  })
})
