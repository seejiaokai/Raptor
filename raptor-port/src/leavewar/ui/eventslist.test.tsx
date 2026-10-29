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

/* THE WALK'S FINDINGS ON THE EVENTS LIST (29 Oct 26, the evidence sheet's F1, F3) */
describe('the Events list — the walk’s findings', () => {
  it('F1: a run saved "Repeat each day" opens whole — a rename and a Delete act on every day of it', () => {
    for (const d of ['2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05', '2026-02-06']) setDayEvent(d, 0, 'REPEAT5')
    render(<Matrix />)
    openEvents()
    fireEvent.click(screen.getByTestId('evline-0-2026-02-02'))
    expect(screen.getByTestId('event-sheet').querySelector('.bidsheet-hd .dt')!.textContent).toMatch(/2.*6 Feb/)
    expect(screen.getByTestId('event-mode-repeat').className, 'kept as a word on each day').toContain('approve')
    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'RENAMED5' } })
    fireEvent.click(screen.getByTestId('event-apply'))
    const words = () => getState().period.days.filter(d => d.date >= '2026-02-02' && d.date <= '2026-02-06').map(d => d.events[0])
    expect(words()).toEqual(Array(5).fill('RENAMED5'))
    expect(lineTexts()).toContainEqual(['Mon 2 – Fri 6 Feb', 'RENAMED5', null])
    fireEvent.click(screen.getByTestId('evline-0-2026-02-02'))
    fireEvent.click(screen.getByTestId('event-delete'))
    expect(words()).toEqual(Array(5).fill(''))
  })

  it('F3: a new event saved from the list is ringed in the list, and brought into view', () => {
    render(<Matrix />)
    openEvents()
    fireEvent.click(screen.getByTestId('events-add'))
    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'Late one' } })
    pickDay('2026-12-28')
    fireEvent.click(screen.getByTestId('event-apply'))
    const line = screen.getByTestId('evline-0-2026-12-28')
    expect(line.classList.contains('innew')).toBe(true)
  })
})

/* THE FRESH CODE READ'S FINDINGS (29 Oct 26, the evidence sheet's R1–R3) */
describe('the Events list — the code read’s findings', () => {
  it('R1: Move… on an event opened from the list hands the grid over — the list does not come back over it', () => {
    setDayEvent('2026-03-16', 0, 'SC')
    render(<Matrix />)
    openEvents()
    fireEvent.click(screen.getByTestId('evline-0-2026-03-16'))
    fireEvent.click(screen.getByTestId('event-move'))
    expect(screen.queryByTestId('event-sheet')).toBeNull()
    expect(screen.queryByTestId('events-sheet'), 'the list stays shut while the event is moved').toBeNull()
  })

  it('R2: a run of one word on several days, opened whole from the list, offers no Move… (it would move its first day only)', () => {
    for (const d of ['2026-03-02', '2026-03-03', '2026-03-04']) setDayEvent(d, 0, 'EXER')
    render(<Matrix />)
    openEvents()
    fireEvent.click(screen.getByTestId('evline-0-2026-03-02'))
    expect(screen.getByTestId('event-delete')).toBeTruthy()
    expect(screen.queryByTestId('event-move')).toBeNull()
  })

  it('R3: a refusal already on view (the box left by Tab) never holds Done — it says why, the name put back, and Done leaves', () => {
    render(<Matrix />)
    openEvents()
    fireEvent.click(screen.getByTestId('events-presets'))
    const other = (screen.getByTestId('evtype-name-1') as HTMLInputElement).value
    const box = screen.getByTestId('evtype-name-0') as HTMLInputElement
    const was = box.value
    fireEvent.change(box, { target: { value: other } })
    fireEvent.blur(box)                                      // no press: Tab, or Enter
    expect(screen.getByTestId('event-problem').textContent).toMatch(/already an event type/)
    expect((screen.getByTestId('evtype-name-0') as HTMLInputElement).value).toBe(was)
    // a kind pressed after it (it succeeds and clears the sentence) holds nothing either (the fix read's finding 1)
    fireEvent.click(screen.getByTestId('types-done'))
    expect(screen.getByTestId('events-sheet')).toBeTruthy()
  })

  it('R3: a refusal caused by a press on the backdrop holds the window, as one by Done does', () => {
    render(<Matrix />)
    openEvents()
    fireEvent.click(screen.getByTestId('events-presets'))
    const other = (screen.getByTestId('evtype-name-1') as HTMLInputElement).value
    const box = screen.getByTestId('evtype-name-0') as HTMLInputElement
    fireEvent.change(box, { target: { value: other } })
    const scrims = screen.getAllByTestId('sheet-scrim'); const scrim = scrims[scrims.length - 1]!
    fireEvent.pointerDown(scrim)
    fireEvent.blur(box)
    fireEvent.pointerUp(scrim)
    fireEvent.click(scrim)
    expect(screen.getByTestId('event-types-sheet'), 'not closed over the refusal').toBeTruthy()
    expect(screen.getByTestId('event-problem').textContent).toMatch(/already an event type/)
  })

  /* R3's walk (29 Oct 26): in a browser the refusal's sentence, drawn as the box lost focus at the PRESS on Done, grew the
     window under the pointer — Done moved 23px, the release fell on the sentence and the press was lost, so leaving took
     three presses. The sentence now waits for the press to finish: nothing moves under the pointer. */
  it('R3: the refusal shows once the press on Done has finished, so that press lands', () => {
    render(<Matrix />)
    openEvents()
    fireEvent.click(screen.getByTestId('events-presets'))
    const other = (screen.getByTestId('evtype-name-1') as HTMLInputElement).value
    const box = screen.getByTestId('evtype-name-0') as HTMLInputElement
    fireEvent.change(box, { target: { value: other } })
    const done = screen.getByTestId('types-done')
    fireEvent.pointerDown(done)
    fireEvent.blur(box)                                      // the press takes the focus: the rename is refused here
    expect(screen.queryByTestId('event-problem'), 'nothing drawn under the pointer mid-press').toBeNull()
    fireEvent.pointerUp(done)
    fireEvent.click(done)
    expect(screen.getByTestId('event-types-sheet')).toBeTruthy()
    expect(screen.getByTestId('event-problem').textContent).toMatch(/already an event type/)
    fireEvent.click(screen.getByTestId('types-done'))
    expect(screen.getByTestId('events-sheet')).toBeTruthy()
  })

  it('R3: a name still being typed when Done is pressed (an iPhone keeps the focus in the box) is saved or refused first', () => {
    render(<Matrix />)
    openEvents()
    fireEvent.click(screen.getByTestId('events-presets'))
    const other = (screen.getByTestId('evtype-name-1') as HTMLInputElement).value
    const box = screen.getByTestId('evtype-name-0') as HTMLInputElement
    const was = box.value
    box.focus()
    fireEvent.change(box, { target: { value: other } })
    fireEvent.click(screen.getByTestId('types-done'))        // no blur before the click
    expect(screen.getByTestId('event-types-sheet'), 'refused: stays to say so').toBeTruthy()
    expect(screen.getByTestId('event-problem').textContent).toMatch(/already an event type/)
    expect((screen.getByTestId('evtype-name-0') as HTMLInputElement).value).toBe(was)
    // and an accepted one is saved, not lost with the window
    const box2 = screen.getByTestId('evtype-name-0') as HTMLInputElement
    box2.focus()
    fireEvent.change(box2, { target: { value: 'PH renamed' } })
    fireEvent.click(screen.getByTestId('types-done'))
    expect(getState().eventDefs[0]!.name).toBe('PH renamed')
    expect(screen.getByTestId('events-sheet')).toBeTruthy()
  })
})
