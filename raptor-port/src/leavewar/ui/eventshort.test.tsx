// @vitest-environment jsdom
/* THE EVENT ROWS PRINT A SHORT FORM, AND A TAP OPENS THE FULL NAME (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.12, "The grid"; owner D643, D644).

   Measured on a phone before this: "No Leave" widened its day and made the Event row two lines tall. Now a day cell
   prints `shortOf(…)` — never more than three characters — and sets its width from that, so no event widens a day; a
   merged band prints its full text where the bar is wide enough, else its short form. The full name is one tap away,
   for EVERYONE: a small box under the cell with the name, the kind in its colour and the date; an admin's box carries
   "Edit", which opens the sheet. An EMPTY cell still opens the sheet at once for an admin. The box is a small menu,
   not a window: a press outside, Escape and a scroll each close it (D641's reading 2).

   (Whether the columns really stay equal in width is a browser's to say — e2e/leavewar.spec.ts.) */
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Matrix } from './Matrix'
import { addEventBand, initStore, setDayEvent, setRole, updateEventType } from '../state/store'
import { memoryBackend } from '../state/storage'

beforeEach(() => { initStore(memoryBackend()); setRole('admin') })
afterEach(cleanup)

const cell = (iso: string, line = 0) => screen.getByTestId(`event-${line}-${iso}`)
const box = () => screen.queryByTestId('event-peek')

describe('a day cell prints the short form', () => {
  it('a preset’s own: "No Leave" prints NL, "Off day" OFF', () => {
    setDayEvent('2026-05-12', 0, 'No Leave')
    setDayEvent('2026-05-13', 0, 'Off day')
    render(<Matrix />)
    expect(cell('2026-05-12').textContent).toBe('NL')
    expect(cell('2026-05-13').textContent).toBe('OFF')
  })
  it('the event’s own first, then one derived from its name', () => {
    setDayEvent('2026-05-12', 0, 'National Day', 'off', 'NAT')
    setDayEvent('2026-05-13', 0, 'National Day', 'off')
    setDayEvent('2026-05-14', 0, 'Exercise')
    render(<Matrix />)
    expect(cell('2026-05-12').textContent).toBe('NAT')
    expect(cell('2026-05-13').textContent).toBe('ND')
    expect(cell('2026-05-14').textContent).toBe('EXE')
  })
  it('never asks its day for more than three characters of width — and the same for every filled day', () => {
    setDayEvent('2026-05-12', 0, 'National Day', 'off')
    setDayEvent('2026-05-13', 0, 'No Leave')
    setDayEvent('2026-05-14', 0, 'Off day')
    setDayEvent('2026-05-15', 0, 'Range closure 0900-1400')
    render(<Matrix />)
    for (const iso of ['2026-05-12', '2026-05-13', '2026-05-14', '2026-05-15']) {
      const w = parseFloat(cell(iso).style.minWidth)
      expect(cell(iso).style.minWidth.endsWith('ch')).toBe(true)
      expect(w).toBeGreaterThanOrEqual(1)
      expect(w).toBeLessThanOrEqual(3)
      expect(cell(iso).textContent!.length).toBeLessThanOrEqual(3)
    }
  })
  it('says the full name to a screen reader and on hover', () => {
    setDayEvent('2026-05-12', 0, 'National Day', 'off', 'NAT')
    render(<Matrix />)
    expect(cell('2026-05-12').getAttribute('title')).toBe('National Day')
    expect(cell('2026-05-12').getAttribute('aria-label')).toContain('National Day')
  })
  it('follows a preset’s short form when it is changed', () => {
    setDayEvent('2026-05-12', 0, 'PH')
    render(<Matrix />)
    expect(cell('2026-05-12').textContent).toBe('PH')
    act(() => { updateEventType(0, { short: 'HOL' }) })
    expect(cell('2026-05-12').textContent).toBe('HOL')
  })
  it('still reddens a working event, short or not', () => {
    setDayEvent('2026-05-12', 0, 'Squadron Conference', 'work')
    render(<Matrix />)
    expect(cell('2026-05-12').textContent).toBe('SC')
    expect(cell('2026-05-12').className).toContain('work')
  })
  it('an empty cell prints nothing for a member and the add hint for an admin', () => {
    render(<Matrix />)
    expect(cell('2026-05-12').textContent).toBe('＋')
    cleanup(); setRole('member')
    render(<Matrix />)
    expect(cell('2026-05-12').textContent).toBe('')
  })
})

describe('a merged band prints its full text where the bar is wide enough, else its short form', () => {
  it('wide: about three characters a day spanned', () => {
    addEventBand(0, '2026-05-12', '2026-05-16', 'National Day', 'off', 'NAT')   // 5 days, 12 letters
    render(<Matrix />)
    expect(screen.getByTestId('event-band-0-2026-05-12').textContent).toBe('National Day')
  })
  it('narrow: its own short form, else the derived one', () => {
    addEventBand(0, '2026-05-12', '2026-05-13', 'National Day', 'off', 'NAT')   // 2 days
    addEventBand(1, '2026-05-12', '2026-05-13', 'Block leave', 'free')
    render(<Matrix />)
    expect(screen.getByTestId('event-band-0-2026-05-12').textContent).toBe('NAT')
    expect(screen.getByTestId('event-band-1-2026-05-12').textContent).toBe('BL')
    expect(screen.getByTestId('event-band-0-2026-05-12').getAttribute('title')).toBe('National Day')
  })
})

describe('a tap on a filled cell opens the box — for everyone', () => {
  it('a member: the full name, the kind and the date; no Edit, no sheet', () => {
    setDayEvent('2026-05-12', 0, 'National Day', 'off', 'NAT')
    setRole('member')
    render(<Matrix />)
    fireEvent.click(cell('2026-05-12'))
    expect(box()).not.toBeNull()
    expect(box()!.textContent).toContain('National Day')
    expect(screen.getByTestId('event-peek-kind').textContent).toBe('Public holiday')
    expect(screen.getByTestId('event-peek-kind').className).toContain('off')
    expect(box()!.textContent).toContain('12 May')
    expect(screen.queryByTestId('event-peek-edit')).toBeNull()
    expect(screen.queryByTestId('event-sheet')).toBeNull()
  })
  it('an admin: the same box with Edit, which opens the sheet on that event', () => {
    setDayEvent('2026-05-12', 0, 'National Day', 'off', 'NAT')
    render(<Matrix />)
    fireEvent.click(cell('2026-05-12'))
    expect(screen.queryByTestId('event-sheet')).toBeNull()
    fireEvent.click(screen.getByTestId('event-peek-edit'))
    expect(screen.getByTestId('event-sheet')).toBeTruthy()
    expect(box()).toBeNull()
  })
  it('the kind is the event’s own tag, else its word’s — an untagged "PH" reads Public holiday, a plain word no kind', () => {
    setDayEvent('2026-05-12', 0, 'PH')
    setDayEvent('2026-05-13', 0, 'Visit')
    setDayEvent('2026-05-14', 0, 'PH', 'free')
    setDayEvent('2026-05-15', 0, 'No Leave')
    setDayEvent('2026-05-18', 0, 'SC')
    render(<Matrix />)
    const kindAt = (iso: string) => { fireEvent.click(cell(iso)); return screen.queryByTestId('event-peek-kind')?.textContent ?? null }
    expect(kindAt('2026-05-12')).toBe('Public holiday')
    expect(kindAt('2026-05-13')).toBeNull()
    expect(kindAt('2026-05-14')).toBe('Off day')
    expect(kindAt('2026-05-15')).toBe('No leave')
    expect(kindAt('2026-05-18')).toBe('Working event')
  })
  it('a merged band: its name and its dates', () => {
    addEventBand(0, '2026-05-12', '2026-05-13', 'National Day', 'off', 'NAT')
    setRole('member')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('event-band-0-2026-05-12'))
    expect(box()!.textContent).toContain('National Day')
    expect(box()!.textContent).toMatch(/12.*13 May/)
  })
  it('an EMPTY cell opens the sheet at once for an admin, and nothing for a member', () => {
    render(<Matrix />)
    fireEvent.click(cell('2026-05-12'))
    expect(screen.getByTestId('event-sheet')).toBeTruthy()
    expect(box()).toBeNull()
    cleanup(); setRole('member')
    render(<Matrix />)
    fireEvent.click(cell('2026-05-12'))
    expect(screen.queryByTestId('event-sheet')).toBeNull()
    expect(box()).toBeNull()
  })
})

describe('the box is a small menu, not a window', () => {
  const open = () => {
    setDayEvent('2026-05-12', 0, 'National Day', 'off', 'NAT')
    setDayEvent('2026-05-14', 0, 'Exercise', 'work')
    render(<Matrix />)
    fireEvent.click(cell('2026-05-12'))
    expect(box()).not.toBeNull()
  }
  it('a press outside closes it', () => {
    open()
    fireEvent.pointerDown(screen.getByTestId('event-1-2026-05-20'))
    expect(box()).toBeNull()
  })
  it('a press INSIDE it does not', () => {
    open()
    fireEvent.pointerDown(box()!)
    expect(box()).not.toBeNull()
  })
  it('Escape closes it', () => {
    open()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(box()).toBeNull()
  })
  it('a scroll closes it', () => {
    open()
    fireEvent.scroll(window)
    expect(box()).toBeNull()
  })
  it('a second tap on the same cell closes it; a tap on another event moves it there', () => {
    open()
    fireEvent.pointerDown(cell('2026-05-12')); fireEvent.click(cell('2026-05-12'))
    expect(box()).toBeNull()
    fireEvent.pointerDown(cell('2026-05-12')); fireEvent.click(cell('2026-05-12'))
    expect(box()!.textContent).toContain('National Day')
    fireEvent.pointerDown(cell('2026-05-14')); fireEvent.click(cell('2026-05-14'))
    expect(box()!.textContent).toContain('Exercise')
    expect(box()!.textContent).not.toContain('National Day')
  })
  it('goes when its event is taken away under it', () => {
    open()
    act(() => { setDayEvent('2026-05-12', 0, '') })
    expect(box()).toBeNull()
  })
})
