/* THE EVENTS LIST (owner D1500, 29 Oct 26 — "All as recommended"): Settings → Events…; the Event rows' events over the
   period in View, one line each by date (a band one line), its kind's mark, past ones greyed; "＋ Event" and "Edit
   presets" at its top; a tap opens the event; no filter chips. Pinned through the grid as the ⚙ press reaches it. */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { getState, initStore, setDayEvent, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'
import { setMemberTodayForTests } from '../engine'
import { askLw } from './lwnav'

const openSettings = () => act(() => { askLw({ kind: 'settings' }) })
const openEvents = () => { openSettings(); fireEvent.click(screen.getByTestId('settings-events')) }
const lineTexts = () => [...screen.getByTestId('events-list').querySelectorAll('.hol-line')].map(b =>
  [b.querySelector('.hol-when')!.textContent, b.querySelector('.hol-name')!.textContent, b.querySelector('.evpeek-kind')?.textContent ?? null])

/* a day picked on the new event's own calendar, as a finger does: its month stepped to, then one tap (one day) */
const pickDay = (iso: string) => {
  for (let i = 0; i < 13 && !screen.queryByTestId('event-day-' + iso); i++) fireEvent.click(screen.getByTestId('event-next'))
  fireEvent.click(screen.getByTestId('event-day-' + iso))
}

beforeEach(() => { initStore(memoryBackend()); setRole('admin') })

describe('the Events list (D1500)', () => {
  it('opens from Settings in its own window, titled EVENTS and the period in View, with ＋ Event and Edit presets', () => {
    render(<Matrix />)
    openEvents()
    const sheet = screen.getByTestId('events-sheet')
    expect(sheet.querySelector('.bidsheet-hd .who')!.textContent).toBe('EVENTS')
    expect(screen.getByTestId('events-period').textContent).toBe(getState().period.name)
    expect(screen.getByTestId('events-add').textContent).toBe('＋ Event')
    expect(screen.getByTestId('events-presets').textContent).toBe('Edit presets')
    expect(sheet.querySelector('.tchip, .fchip'), 'no filter chips').toBeNull()
  })

  it('lists each event once — a run of days one line — with its kind, none for an untagged one', () => {
    const p = getState().period
    for (const d of ['2026-02-09', '2026-02-10', '2026-02-11']) setDayEvent(d, 0, 'EX SHIELD')
    setDayEvent('2026-01-23', 1, 'Off day')
    expect(p.start <= '2026-01-23').toBe(true)
    render(<Matrix />)
    openEvents()
    const rows = lineTexts()
    expect(rows).toContainEqual(['Mon 9 – Wed 11 Feb', 'EX SHIELD', null])
    expect(rows).toContainEqual(['Fri 23 Jan', 'Off day', 'Off day'])
    /* the seed's PH on 1 Jan, its kind the preset's */
    expect(rows).toContainEqual(['Thu 1 Jan', 'PH', 'Public holiday'])
    const order = rows.map(r => r[0])
    expect(order.indexOf('Thu 1 Jan')).toBeLessThan(order.indexOf('Fri 23 Jan'))
  })

  it('greys an event whose last day is before the app’s today', () => {
    setMemberTodayForTests('2026-01-08')                     // the drawing's today
    setDayEvent('2026-01-07', 1, 'DET'); setDayEvent('2026-01-08', 1, 'DET')
    render(<Matrix />)
    openEvents()
    expect(screen.getByTestId('evline-0-2026-01-01').classList.contains('is-past')).toBe(true)
    expect(screen.getByTestId('evline-1-2026-01-07').classList.contains('is-past'), 'running over today').toBe(false)
  })

  it('a tap on a line opens that event’s window; closing it brings the list back', () => {
    setDayEvent('2026-03-16', 0, 'SC')
    render(<Matrix />)
    openEvents()
    fireEvent.click(screen.getByTestId('evline-0-2026-03-16'))
    expect(screen.queryByTestId('events-sheet'), 'the list waits behind it').toBeNull()
    expect((screen.getByTestId('event-text') as HTMLInputElement).value).toBe('SC')
    fireEvent.click(screen.getByTestId('event-cancel'))
    expect(screen.getByTestId('events-sheet')).toBeTruthy()
  })

  it('＋ Event opens a new event with nothing picked; saved, it goes on the first free row and shows in the list', () => {
    setDayEvent('2026-04-14', 0, 'DET')
    render(<Matrix />)
    openEvents()
    fireEvent.click(screen.getByTestId('events-add'))
    expect(screen.queryByTestId('event-delete'), 'nothing to delete yet').toBeNull()
    expect(screen.queryByTestId('event-move'), 'nothing to move yet').toBeNull()
    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'Exercise Kite' } })
    fireEvent.click(screen.getByTestId('event-apply'))
    expect(screen.getByTestId('event-problem').textContent).toMatch(/Pick its day/)
    // pick 14 Apr on the event's calendar: the first row holds DET that day, so it lands on the second
    pickDay('2026-04-14')
    fireEvent.click(screen.getByTestId('event-apply'))
    const day = getState().period.days.find(d => d.date === '2026-04-14')!
    expect(day.events[0]).toBe('DET')
    expect(day.events[1]).toBe('Exercise Kite')
    expect(screen.getByTestId('events-sheet'), 'back to the list').toBeTruthy()
    expect(lineTexts()).toContainEqual(['Tue 14 Apr', 'Exercise Kite', null])
  })

  it('＋ Event over a run where every row is taken is refused with the Holidays list’s sentence', () => {
    for (const line of [0, 1]) setDayEvent('2026-04-15', line, 'X' + line)
    render(<Matrix />)
    openEvents()
    fireEvent.click(screen.getByTestId('events-add'))
    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'Late one' } })
    pickDay('2026-04-15')
    fireEvent.click(screen.getByTestId('event-apply'))
    expect(screen.getByTestId('event-problem').textContent).toMatch(/Every Event row is already used on those dates/)
  })

  it('Edit presets opens the presets; its ‹ goes back to the list', () => {
    render(<Matrix />)
    openEvents()
    fireEvent.click(screen.getByTestId('events-presets'))
    expect(screen.getByTestId('event-types-sheet')).toBeTruthy()
    fireEvent.click(screen.getByTestId('types-back'))
    expect(screen.getByTestId('events-sheet')).toBeTruthy()
  })

  it('a member has no way in', () => {
    setRole('member')
    render(<Matrix />)
    openSettings()
    expect(screen.queryByTestId('settings-events')).toBeNull()
    expect(screen.queryByTestId('events-sheet')).toBeNull()
  })
})
