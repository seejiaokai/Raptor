/* THE EVENTS LIST (owner D1500, 29 Oct 26 — "All as recommended"): Settings → Events…; the Event rows' events over the
   period in View, one line each by date (a band one line), its kind's mark, past ones greyed; "＋ Event" and "Edit
   presets" at its top; a tap opens the event; no filter chips. Pinned through the grid as the ⚙ press reaches it. */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getState, initStore, setDayEvent, setRole } from '../state/store'

/* the Undo on the note after a delete is the top bar's own Undo (the one timeline — ui/topbits.tsx globalUndoEngine); a
   unit test has no timeline wired, so its press is caught here and the restore itself is proved by the walk */
const undoPress = vi.fn()
vi.mock('../../ui/topbits', async orig => ({ ...(await orig<typeof import('../../ui/topbits')>()), globalUndoEngine: () => ({ canUndo: true, canRedo: false, undoTitle: 'Undo', redoTitle: 'Redo', undo: undoPress, redo: () => {} }) }))
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'
import { setMemberTodayForTests } from '../engine'
import { askLw } from './lwnav'
import { readFileSync } from 'node:fs'

const openSettings = () => act(() => { askLw({ kind: 'settings' }) })
const openEvents = () => { openSettings(); fireEvent.click(screen.getByTestId('settings-events')) }
/* (a line with no kind keeps its kind's column, empty, since D1513 — read here as no kind) */
const lineTexts = () => [...screen.getByTestId('events-list').querySelectorAll('.hol-line')].map(b =>
  [b.querySelector('.hol-when')!.textContent, b.querySelector('.hol-name')!.textContent, b.querySelector('.evpeek-kind')?.textContent || null])

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

/* THE SPLIT, AND EACH LINE'S OWN EDIT AND DELETE (his D1512–D1516, 29 Oct 26; the drawing of record the F- frames of
   scripts/handpass/mock-events-split.mjs): Squadron events first, then Holidays (public holidays and Off days), each under
   the Settings window's own section heading with its count; every line its kind in one column (empty for none), then the
   app's pencil and a ✕ that asks once — "Delete — sure?" in the kind's place, the ✕ red — and a second press deletes,
   a note at the foot naming it with Undo; an empty list keeps its heading and one line. */
const sec = (k: 'squadron' | 'holidays') => screen.getByTestId('events-sec-' + k)
const secNames = (k: 'squadron' | 'holidays') => [...sec(k).querySelectorAll('.hol-line .hol-name')].map(n => n.textContent)
const dayWord = (iso: string, line = 0) => getState().period.days.find(d => d.date === iso)!.events[line]
describe('the Events list split (D1512–D1516)', () => {
  beforeEach(() => { undoPress.mockClear() })

  it('Squadron events first, then Holidays — public holidays and Off days there, every other kind and none here', () => {
    setDayEvent('2026-03-09', 0, 'Ex Pitch Black', 'work')
    setDayEvent('2026-04-06', 1, 'ORE', 'nolv')
    setDayEvent('2026-05-22', 0, 'Squadron dinner')
    setDayEvent('2026-08-10', 1, 'Off — National Day', 'free')
    render(<Matrix />)
    openEvents()
    const list = screen.getByTestId('events-list')
    const secs = [...list.querySelectorAll('[data-testid^="events-sec-"]')].map(s => s.getAttribute('data-testid'))
    expect(secs).toEqual(['events-sec-squadron', 'events-sec-holidays'])
    expect(secNames('squadron')).toEqual(['Ex Pitch Black', 'ORE', 'Squadron dinner'])
    expect(secNames('holidays')).toContain('PH')
    expect(secNames('holidays')).toContain('Off — National Day')
    expect(secNames('holidays')).not.toContain('Squadron dinner')
    const head = (k: 'squadron' | 'holidays') => screen.getByTestId('events-head-' + k)
    expect(head('squadron').textContent).toBe('Squadron events · 3')
    expect(head('holidays').textContent).toBe(`Holidays · ${secNames('holidays').length}`)
    expect(head('squadron').classList.contains('gs-sec'), 'the Settings window’s own heading').toBe(true)
  })

  it('every line keeps a kind column — its mark, or empty for an event with no kind (D1513)', () => {
    setDayEvent('2026-05-22', 0, 'Squadron dinner')
    setDayEvent('2026-03-16', 0, 'SC', 'work')
    render(<Matrix />)
    openEvents()
    const kind = (key: string) => screen.getByTestId('evkind-' + key)
    expect(kind('0-2026-05-22').textContent).toBe('')
    expect(kind('0-2026-05-22').classList.contains('none')).toBe(true)
    expect(kind('0-2026-03-16').textContent).toBe('Working event')
    expect(kind('0-2026-03-16').classList.contains('work')).toBe(true)
  })

  it('each line has the app’s pencil, which opens the event as a tap on the line does (D1512)', () => {
    setDayEvent('2026-03-16', 0, 'SC', 'work')
    render(<Matrix />)
    openEvents()
    const pen = screen.getByTestId('evedit-0-2026-03-16')
    expect(pen.tagName).toBe('BUTTON')
    expect(pen.querySelector('svg.pen-ic'), 'the drawn pencil, never a typed one').toBeTruthy()
    expect(pen.getAttribute('aria-label')).toBe('Edit SC, Mon 16 Mar')
    fireEvent.click(pen)
    expect((screen.getByTestId('event-text') as HTMLInputElement).value).toBe('SC')
    fireEvent.click(screen.getByTestId('event-cancel'))
    // the line itself still opens it
    fireEvent.click(screen.getByTestId('evline-0-2026-03-16'))
    expect((screen.getByTestId('event-text') as HTMLInputElement).value).toBe('SC')
  })

  it('the ✕ asks once: its first press arms it in place — "Delete — sure?" in the kind’s column — and deletes nothing', () => {
    setDayEvent('2026-03-16', 0, 'SC', 'work')
    render(<Matrix />)
    openEvents()
    const x = screen.getByTestId('evdel-0-2026-03-16')
    expect(x.textContent).toBe('✕')
    expect(x.getAttribute('aria-label')).toBe('Delete SC, Mon 16 Mar')
    fireEvent.click(x)
    expect(screen.getByTestId('events-sheet'), 'the list stays').toBeTruthy()
    expect(screen.queryByTestId('event-sheet'), 'no event window').toBeNull()
    expect(dayWord('2026-03-16')).toBe('SC')
    const armed = screen.getByTestId('evdel-0-2026-03-16')
    expect(armed.classList.contains('arm')).toBe(true)
    expect(armed.textContent, 'the cross keeps its box').toBe('✕')
    expect(armed.getAttribute('aria-label')).toBe('Delete SC, Mon 16 Mar — press again to delete')
    expect(screen.getByTestId('evkind-0-2026-03-16').textContent).toBe('Delete — sure?')
    expect(screen.getByTestId('evkind-0-2026-03-16').classList.contains('sure')).toBe(true)
  })

  it('a second press deletes it, and a note at the foot names it with Undo — the top bar’s own Undo', () => {
    setDayEvent('2026-03-16', 0, 'SC', 'work')
    render(<Matrix />)
    openEvents()
    fireEvent.click(screen.getByTestId('evdel-0-2026-03-16'))
    fireEvent.click(screen.getByTestId('evdel-0-2026-03-16'))
    expect(dayWord('2026-03-16')).toBe('')
    expect(screen.queryByTestId('evline-0-2026-03-16'), 'gone from the list').toBeNull()
    const note = screen.getByTestId('events-undo-note')
    expect(note.classList.contains('secdef-snack'), 'the app’s own bar with a button').toBe(true)
    expect(note.getAttribute('role')).toBe('status')
    expect(note.querySelector('.secdef-msg')!.textContent).toBe('SC deleted')
    fireEvent.click(screen.getByTestId('events-undo'))
    expect(undoPress).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('events-undo-note'), 'the note goes once pressed').toBeNull()
  })

  it('the ask is taken back by any other press — another line’s ✕ moves it, a press elsewhere clears it', () => {
    setDayEvent('2026-03-16', 0, 'SC', 'work')
    setDayEvent('2026-05-22', 0, 'Squadron dinner')
    render(<Matrix />)
    openEvents()
    fireEvent.click(screen.getByTestId('evdel-0-2026-03-16'))
    fireEvent.pointerDown(screen.getByTestId('evdel-0-2026-05-22'))
    fireEvent.click(screen.getByTestId('evdel-0-2026-05-22'))
    expect(screen.getByTestId('evdel-0-2026-03-16').classList.contains('arm')).toBe(false)
    expect(screen.getByTestId('evkind-0-2026-03-16').textContent).toBe('Working event')
    expect(screen.getByTestId('evdel-0-2026-05-22').classList.contains('arm')).toBe(true)
    expect(dayWord('2026-03-16'), 'nothing deleted').toBe('SC')
    // a press anywhere else in the window takes it back
    fireEvent.pointerDown(screen.getByTestId('events-head-squadron'))
    expect(screen.getByTestId('evdel-0-2026-05-22').classList.contains('arm')).toBe(false)
    expect(dayWord('2026-05-22')).toBe('Squadron dinner')
  })

  it('a ✕ on a run of one word over several days deletes every day of it, in one go', () => {
    for (const d of ['2026-02-02', '2026-02-03', '2026-02-04']) setDayEvent(d, 0, 'REPEAT3')
    render(<Matrix />)
    openEvents()
    fireEvent.click(screen.getByTestId('evdel-0-2026-02-02'))
    fireEvent.click(screen.getByTestId('evdel-0-2026-02-02'))
    expect(['2026-02-02', '2026-02-03', '2026-02-04'].map(d => dayWord(d))).toEqual(['', '', ''])
  })

  it('an empty list keeps its heading, its count 0, and one line saying so (D1515 fix 6)', () => {
    render(<Matrix />)
    openEvents()
    expect(secNames('squadron'), 'the seed holds holidays only').toEqual([])
    expect(screen.getByTestId('events-head-squadron').textContent).toBe('Squadron events · 0')
    expect(screen.getByTestId('events-empty-squadron').textContent).toBe(`No squadron events in ${getState().period.name}.`)
  })

  it('a new event lands in its own list, ringed (D1515 fix 6)', () => {
    render(<Matrix />)
    openEvents()
    fireEvent.click(screen.getByTestId('events-add'))
    fireEvent.change(screen.getByTestId('event-text'), { target: { value: 'Families day' } })
    pickDay('2026-10-31')
    fireEvent.click(screen.getByTestId('event-apply'))
    const line = screen.getByTestId('evline-0-2026-10-31')
    expect(sec('squadron').contains(line)).toBe(true)
    expect(line.classList.contains('innew')).toBe(true)
  })

  /* THE WALK'S F1 (29 Oct 26, on the phone): the note is drawn on the page, outside the window, and on a touch screen the
     window's shield (Sheet.tsx useGridPan) takes every tap outside a window as one on the grid under it — it ate the tap on
     Undo and CLOSED the list, so the delete was never taken back. jsdom has no matchMedia: a phone's is put in. */
  it('F1: on a touch screen a tap on the note’s Undo undoes — the shield does not eat it, the list stays', () => {
    const origMM = window.matchMedia
    ;(window as any).matchMedia = (q: string) => ({ matches: q.includes('coarse'), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
    try {
      setDayEvent('2026-03-16', 0, 'SC', 'work')
      render(<Matrix />)
      openEvents()
      const tap = (el: Element) => {
        for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup'] as const) fireEvent(el, new MouseEvent(type, { bubbles: true, cancelable: true }))
        fireEvent.click(el)
      }
      tap(screen.getByTestId('evdel-0-2026-03-16')); tap(screen.getByTestId('evdel-0-2026-03-16'))
      expect(dayWord('2026-03-16')).toBe('')
      tap(screen.getByTestId('events-undo'))
      expect(undoPress).toHaveBeenCalledTimes(1)
      expect(screen.queryByTestId('events-sheet'), 'the list stays open').toBeTruthy()
    } finally { (window as any).matchMedia = origMM }
  })

  /* THE WALK'S F2 (29 Oct 26, on the phone): a name too long for the note ran it off both sides of the screen, Undo with it —
     the note is one line, so its words end in "…" and its Undo always stands whole (measured on the phone by the walk) */
  it('F2: a long name in the note ends in …, its Undo never pushed off the screen', () => {
    const css = readFileSync('src/leavewar/ui/bidpicker.css', 'utf8').replace(/\r\n/g, '\n')
    expect(css).toMatch(/#page-leavewar \.secdef-snack\.ev-undo \.secdef-msg \{[^}]*min-width: 0;[^}]*text-overflow: ellipsis/)
    expect(css).toMatch(/#page-leavewar \.secdef-snack\.ev-undo \.secdef-btn \{ flex: none; \}/)
  })

  /* THE FRESH CODE READ'S FINDINGS (29 Oct 26) */
  it('R2: after a delete the keyboard is on the note’s Undo, so it can be reached; after Undo it is back in the window', async () => {
    setDayEvent('2026-03-16', 0, 'SC', 'work')
    render(<Matrix />)
    openEvents()
    const x = screen.getByTestId('evdel-0-2026-03-16')
    x.focus(); fireEvent.click(x); fireEvent.click(screen.getByTestId('evdel-0-2026-03-16'))
    expect(document.activeElement, 'not lost with its line').toBe(screen.getByTestId('events-undo'))
    fireEvent.click(screen.getByTestId('events-undo'))
    await act(async () => { await new Promise(r => setTimeout(r, 20)) })
    // the line is not back here (the timeline is not wired in a unit test): the keyboard goes to the window's first button
    expect(screen.getByTestId('events-sheet').contains(document.activeElement)).toBe(true)
  })

  it('R5: the asking is said aloud — the kind column is a polite live region', () => {
    setDayEvent('2026-03-16', 0, 'SC', 'work')
    render(<Matrix />)
    openEvents()
    expect(screen.getByTestId('evkind-0-2026-03-16').getAttribute('aria-live')).toBe('polite')
  })

  it('R1, R6: the two lists stand one under the other until the window can hold a line; the tap areas meet without overlap', () => {
    const css = readFileSync('src/leavewar/ui/bidpicker.css', 'utf8').replace(/\r\n/g, '\n')
    const has = (s: string) => expect(css.includes(s), s).toBe(true)
    const block = css.slice(css.indexOf('@media (max-width: 1100px) {'))
    expect(block.length, 'a 1100px block').toBeGreaterThan(30)
    expect(block.slice(0, block.indexOf('\n}'))).toContain('.bidsheet .ev-split { flex-direction: column; align-items: stretch; gap: 6px; }')
    expect(block.slice(0, block.indexOf('\n}'))).toContain('#page-leavewar .bidsheet[data-testid="events-sheet"]:not(.fullpage) { width: min(560px, calc(100vw - 24px)); }')
    has(".bidsheet .ev-ctl::before { content: ''; position: absolute; inset: -9px -7px; }")
  })

  it('the controls are buttons of their own, not inside another button, each with a finger-sized tap area', () => {
    setDayEvent('2026-03-16', 0, 'SC', 'work')
    render(<Matrix />)
    openEvents()
    const line = screen.getByTestId('evline-0-2026-03-16')
    expect(line.tagName, 'a line holding two buttons is not itself a button').not.toBe('BUTTON')
    expect(line.querySelectorAll('button').length).toBe(2)
    const css = readFileSync('src/leavewar/ui/bidpicker.css', 'utf8').replace(/\r\n/g, '\n')
    // the tap area: the drawn 22px box, a 40px target round it (the review's fix 3)
    expect(css).toMatch(/\.bidsheet \.ev-ctl::before \{[^}]*inset: -9px/)
  })
})
