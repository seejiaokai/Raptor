import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { monthSpan, periodMonths, setMemberTodayForTests } from '../engine'
import { closeDates, createWar, getState, initStore, selectWar, setRole, setStretch, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { StageBar } from './Chrome'
import { initStore as raptorInitStore } from '../../state/store'
import { setSession } from '../../state/auth'
import { lwHistInit } from '../state/store'
import { globalUndo } from '../../undo'
import { _resetTimeline, _timelineEntries } from '../../undo/timeline'
import { installGlobalUndo } from '../../state/undo-wire'
import { Matrix } from './Matrix'

/* THE "OPEN FOR BIDDING" WINDOW (owner, D1177, D1168, D1169, D1172 — 21 Oct 26). It replaces the one-window "Open
   bidding on" sheet of the stages: the admin opens the days the squadron may bid on — whole months by their buttons,
   exact days by a stretch's calendar — and nothing is open until he does. The seed's war (JAN – DEC 26) opens
   1 Jan – 31 Mar. Reached through the one chip on the strip (`open-chip`), for everyone: an admin to change the dates, a
   member to read them. */

beforeEach(() => {
  initStore(memoryBackend())
})

const line = (from: string) => screen.getByTestId(`od-line-${from}`)
const month = (key: string) => screen.getByTestId(`od-month-${key}`)
function openWindow() {
  render(<StageBar />)
  fireEvent.click(screen.getByTestId('open-chip'))
  return screen.getByTestId('open-dates')
}

describe('the open chip', () => {
  it('says which dates the squadron may bid on', () => {
    render(<StageBar />)
    expect(screen.getByTestId('open-chip').textContent).toBe('Open for bidding 1 Jan – 31 Mar')
  })

  // A member sees the fact; only an admin can change it. Same chip, because
  // it is the same fact. The role used to flip through an on-screen toggle;
  // since the Raptor merge it rides the Raptor login (resetSession → setRole),
  // so the test drives the seam the way resetSession does — and pins that the
  // old toggle stays gone.
  it('opens the window for everyone — to change for an admin, to read for a member', () => {
    act(() => setRole('member'))
    const sheet = openWindow()
    expect(screen.queryByTestId('role-toggle')).toBeNull()
    expect((within(sheet).getByTestId('od-month-2026-06') as HTMLButtonElement).disabled).toBe(true)
    act(() => setRole('admin'))
    expect((within(sheet).getByTestId('od-month-2026-06') as HTMLButtonElement).disabled).toBe(false)
  })

  /* WAS "is absent unless the war is open" (a window beside BIDDING CLOSED would contradict it). With the stages gone
     the chip stays, and with nothing open it says so (D1177). */
  it('reads "Bidding closed" once nothing is open', () => {
    act(() => setRole('admin'))
    render(<StageBar />)
    act(() => { closeDates('2026-01-01', '2026-12-31') })
    expect(screen.getByTestId('open-chip').textContent).toBe('Bidding closed')
  })
})

/* M1's walk, S29: with a drag-selected block's panel up (a non-blocking panel at the sheets' own layer), the window came up
   under it, unseen. A blocking window is raised over a non-blocking panel, as over the scheduler's floating windows. */
describe('over the selection panel', () => {
  it('the window is raised above a non-blocking panel that is up', () => {
    const panel = document.createElement('div'); panel.className = 'bidsheet nonmodal'; document.body.append(panel)
    try {
      expect(openWindow().className.split(' ')).toContain('raised')
    } finally { panel.remove() }
  })
  it('and stays at its own layer when none is', () => {
    expect(openWindow().className.split(' ')).not.toContain('raised')
  })
})

/* M1's code read (both readers, M1 / F3): after a drag across the months, the next single tap did nothing — the drag's
   click lands on the strip (released on another month) or never comes (a finger), so the "swallow the drag's click" flag
   stayed up and ate the tap. */
/* the break tests' gap 7: the drag test checked only the stretches, which join up either way — a drag written as one
   command per month (five Undo steps for MAY → SEP) passed every test (B12: one gesture, one Undo) */
describe('a drag across months is one Undo step', () => {
  beforeEach(() => {
    setSession({ user: 'ad', role: 'admin' })
    raptorInitStore(); initStore(memoryBackend())
    _resetTimeline(); lwHistInit(); installGlobalUndo()
    setRole('admin')
  })
  afterEach(() => { _resetTimeline(); setSession(null) })
  it('MAY → SEP adds ONE step, and one Undo takes all five months back', () => {
    openWindow()
    const n = _timelineEntries().length
    const strip = screen.getByTestId('od-months')
    const under = { el: month('2026-05') as Element }
    const had = document.elementFromPoint
    document.elementFromPoint = () => under.el
    try {
      fireEvent.pointerDown(month('2026-05'), { button: 0, pointerType: 'mouse', pointerId: 1, clientX: 10, clientY: 10 })
      under.el = month('2026-09')
      fireEvent.pointerMove(strip, { pointerType: 'mouse', pointerId: 1, clientX: 200, clientY: 40 })
      fireEvent.pointerUp(strip, { pointerType: 'mouse', pointerId: 1, clientX: 200, clientY: 40 })
    } finally { document.elementFromPoint = had }
    expect(getState().period.open).toEqual([{ from: '2026-01-01', to: '2026-03-31' }, { from: '2026-05-01', to: '2026-09-30' }])
    expect(_timelineEntries().length).toBe(n + 1)
    act(() => { expect(globalUndo().ok).toBe(true) })
    expect(getState().period.open).toEqual([{ from: '2026-01-01', to: '2026-03-31' }])
  })
})

describe('a tap right after a drag', () => {
  beforeEach(() => { setRole('admin') })
  it('a drag MAY → SEP released on SEP, then ONE tap on NOV opens NOV', () => {
    openWindow()
    const strip = screen.getByTestId('od-months')
    const under = { el: month('2026-05') as Element }
    const had = document.elementFromPoint
    document.elementFromPoint = () => under.el
    try {
      fireEvent.pointerDown(month('2026-05'), { button: 0, pointerType: 'mouse', pointerId: 1, clientX: 10, clientY: 10 })
      under.el = month('2026-09')
      fireEvent.pointerMove(strip, { pointerType: 'mouse', pointerId: 1, clientX: 200, clientY: 40 })
      fireEvent.pointerUp(month('2026-09'), { pointerType: 'mouse', pointerId: 1, clientX: 200, clientY: 40 })
      fireEvent.click(strip)
    } finally { document.elementFromPoint = had }
    expect(month('2026-09').getAttribute('data-state')).toBe('open')
    fireEvent.pointerDown(month('2026-11'), { button: 0, pointerType: 'mouse', pointerId: 2, clientX: 300, clientY: 10 })
    fireEvent.pointerUp(month('2026-11'), { pointerType: 'mouse', pointerId: 2, clientX: 300, clientY: 10 })
    fireEvent.click(month('2026-11'))
    expect(month('2026-11').getAttribute('data-state')).toBe('open')
  })
  it('and a keyboard press on a month right after a drag that left no click (a finger) acts at once', () => {
    openWindow()
    const strip = screen.getByTestId('od-months')
    const under = { el: month('2026-05') as Element }
    const had = document.elementFromPoint
    document.elementFromPoint = () => under.el
    try {
      fireEvent.pointerDown(month('2026-05'), { button: 0, pointerType: 'mouse', pointerId: 1, clientX: 10, clientY: 10 })
      under.el = month('2026-09')
      fireEvent.pointerMove(strip, { pointerType: 'mouse', pointerId: 1, clientX: 200, clientY: 40 })
      fireEvent.pointerUp(strip, { pointerType: 'mouse', pointerId: 1, clientX: 200, clientY: 40 })
    } finally { document.elementFromPoint = had }
    expect(month('2026-09').getAttribute('data-state')).toBe('open')
    fireEvent.keyDown(month('2026-11'), { key: ' ' })
    fireEvent.click(month('2026-11'))
    expect(month('2026-11').getAttribute('data-state')).toBe('open')
  })
})

describe('the month buttons', () => {
  beforeEach(() => { setRole('admin') })

  it('draws one button per month of the period, each with its state', () => {
    openWindow()
    expect(screen.getByTestId('od-months').querySelectorAll('[data-month-ix]')).toHaveLength(12)
    expect(month('2026-01').getAttribute('data-state')).toBe('open')
    expect(month('2026-03').getAttribute('data-state')).toBe('open')
    expect(month('2026-04').getAttribute('data-state')).toBe('closed')
    expect(month('2026-01').textContent).toBe('JAN')
  })

  // D1168: "a tap opens a whole month, first day to last" — and his reading drawn r7-17: a second tap closes it.
  it('opens a whole month on a tap, and closes it on a second', () => {
    openWindow()
    fireEvent.click(month('2026-06'))
    expect(getState().period.open).toEqual([
      { from: '2026-01-01', to: '2026-03-31' },
      { from: '2026-06-01', to: '2026-06-30' },
    ])
    expect(month('2026-06').getAttribute('data-state')).toBe('open')
    expect(line('2026-06-01').textContent).toContain('1 Jun – 30 Jun')
    fireEvent.click(month('2026-06'))
    expect(getState().period.open).toEqual([{ from: '2026-01-01', to: '2026-03-31' }])
    expect(month('2026-06').getAttribute('data-state')).toBe('closed')
    expect(screen.queryByTestId('od-line-2026-06-01')).toBeNull()
  })

  // "Months next to each other join into one stretch on the list" (D1168's reading) — one line, its days counted.
  it('joins months next to each other into ONE line, with its day count', () => {
    openWindow()
    fireEvent.click(month('2026-04'))
    expect(getState().period.open).toEqual([{ from: '2026-01-01', to: '2026-04-30' }])
    expect(screen.getByTestId('od-lines').querySelectorAll('.od-line')).toHaveLength(1)
    expect(line('2026-01-01').textContent).toContain('1 Jan – 30 Apr')
    expect(line('2026-01-01').textContent).toContain('120 days')   // 31 + 28 + 31 + 30
  })

  it('shows a month open in part as "part", and a tap opens it whole', () => {
    act(() => { setStretch({ from: '2026-01-01', to: '2026-03-31' }, '2026-01-01', '2026-03-15') })
    openWindow()
    expect(month('2026-03').getAttribute('data-state')).toBe('part')
    expect(month('2026-02').getAttribute('data-state')).toBe('open')
    expect(line('2026-01-01').textContent).toContain('1 Jan – 15 Mar')
    fireEvent.click(month('2026-03'))
    expect(getState().period.open).toEqual([{ from: '2026-01-01', to: '2026-03-31' }])
    expect(month('2026-03').getAttribute('data-state')).toBe('open')
  })

  /* A HOLD AND DRAG ACROSS THE MONTHS (D1169) opens every month from the first to the one under the finger, in
     CALENDAR order (the red team's A7b). jsdom has no layout, so the month under the pointer is answered by a stand-in
     `elementFromPoint`; the finger's real path on a phone (two rows of six) is left to the browser walk. */
  it('a drag from MAY to SEP opens every month between, in calendar order, as ONE stretch', () => {
    openWindow()
    const strip = screen.getByTestId('od-months')
    const under = { el: month('2026-05') as Element }
    const had = document.elementFromPoint
    document.elementFromPoint = () => under.el
    try {
      fireEvent.pointerDown(month('2026-05'), { button: 0, pointerType: 'mouse', pointerId: 1, clientX: 10, clientY: 10 })
      under.el = month('2026-09')
      fireEvent.pointerMove(strip, { pointerType: 'mouse', pointerId: 1, clientX: 200, clientY: 40 })
      fireEvent.pointerUp(strip, { pointerType: 'mouse', pointerId: 1, clientX: 200, clientY: 40 })
    } finally {
      document.elementFromPoint = had
    }
    expect(getState().period.open).toEqual([
      { from: '2026-01-01', to: '2026-03-31' },
      { from: '2026-05-01', to: '2026-09-30' },
    ])
    for (const m of ['05', '06', '07', '08', '09']) expect(month(`2026-${m}`).getAttribute('data-state')).toBe('open')
  })

  // The pure half of the drag, which the screen hands its two ends: calendar order, either direction.
  it('spans the months between the two ends in calendar order, either way round', () => {
    const months = periodMonths(getState().period)
    expect(monthSpan(months, 4, 8)).toEqual({ from: '2026-05-01', to: '2026-09-30' })
    expect(monthSpan(months, 8, 4)).toEqual({ from: '2026-05-01', to: '2026-09-30' })
    expect(monthSpan(months, 11, 11)).toEqual({ from: '2026-12-01', to: '2026-12-31' })
  })
})

describe('a stretch’s exact days', () => {
  beforeEach(() => { setRole('admin') })

  // D1172: "each open stretch's line carries a calendar icon, not a pencil, since what it opens is the calendar for
  // exact days".
  it('opens the range calendar from the calendar icon, and "Close these days" closes the stretch', () => {
    openWindow()
    expect(screen.queryByTestId('od-range-picker')).toBeNull()
    fireEvent.click(screen.getByTestId('od-cal-2026-01-01'))
    expect(screen.getByTestId('od-range-picker')).toBeTruthy()
    fireEvent.click(screen.getByTestId('od-close-stretch'))
    expect(getState().period.open).toEqual([])
    expect(screen.queryByTestId('od-range-picker')).toBeNull()
  })

  it('“+ Open more dates” opens the calendar for a new stretch', () => {
    openWindow()
    expect(screen.getByTestId('od-more').textContent).toContain('Open more dates')
    fireEvent.click(screen.getByTestId('od-more'))
    expect(screen.getByTestId('od-new-picker')).toBeTruthy()
    expect(screen.queryByTestId('od-more')).toBeNull()
  })

  /* The calendar's whole point (D1172 — "the calendar for exact days"): a start and an end, two taps, as every range
     calendar in the app takes them — and nothing changes until its button applies them (the first tap of a range is a
     one-day run; applied at once, it shrank the stretch to that one day and shut the calendar — found by this file's
     first run, 22 Oct 26). */
  it('takes a stretch’s exact days as a start and an end, applied by its button', () => {
    openWindow()
    fireEvent.click(screen.getByTestId('od-cal-2026-01-01'))
    fireEvent.click(screen.getByTestId('od-range-day-2026-01-10'))
    expect(getState().period.open).toEqual([{ from: '2026-01-01', to: '2026-03-31' }])   // the first tap changes nothing
    fireEvent.click(screen.getByTestId('od-range-day-2026-01-20'))
    expect(getState().period.open).toEqual([{ from: '2026-01-01', to: '2026-03-31' }])
    expect(screen.getByTestId('od-apply').textContent).toBe('Save 10 Jan – 20 Jan')
    fireEvent.click(screen.getByTestId('od-apply'))
    expect(getState().period.open).toEqual([{ from: '2026-01-10', to: '2026-01-20' }])
    expect(screen.queryByTestId('od-range-picker')).toBeNull()
  })

  it('takes a NEW stretch as a start and an end, opened by its button', () => {
    openWindow()
    fireEvent.click(screen.getByTestId('od-more'))
    expect((screen.getByTestId('od-apply') as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByTestId('od-new-next'))
    fireEvent.click(screen.getByTestId('od-new-day-2026-04-10'))
    fireEvent.click(screen.getByTestId('od-new-day-2026-04-20'))
    expect(screen.getByTestId('od-apply').textContent).toBe('Open 10 Apr – 20 Apr')
    fireEvent.click(screen.getByTestId('od-apply'))
    expect(getState().period.open).toEqual([
      { from: '2026-01-01', to: '2026-03-31' },
      { from: '2026-04-10', to: '2026-04-20' },
    ])
  })

  it('Cancel puts the calendar away and changes nothing', () => {
    openWindow()
    fireEvent.click(screen.getByTestId('od-cal-2026-01-01'))
    fireEvent.click(screen.getByTestId('od-range-day-2026-01-10'))
    fireEvent.click(screen.getByTestId('od-range-day-2026-01-20'))
    fireEvent.click(screen.getByTestId('od-cancel'))
    expect(screen.queryByTestId('od-range-picker')).toBeNull()
    expect(getState().period.open).toEqual([{ from: '2026-01-01', to: '2026-03-31' }])
  })

  /* M1's walk, A-F2: Escape closed the calendar AND the window at once, and the keyboard was left on the page body. The
     design guide §3: Escape closes what opened last, and the keyboard returns to the button that opened it. */
  it('Escape puts the calendar away first, then closes the window, and the keyboard goes back to the chip', () => {
    openWindow()
    fireEvent.click(screen.getByTestId('od-cal-2026-01-01'))
    expect(screen.getByTestId('od-range-picker')).toBeTruthy()
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByTestId('od-range-picker')).toBeNull()
    expect(screen.getByTestId('open-dates')).toBeTruthy()
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByTestId('open-dates')).toBeNull()
    expect(document.activeElement).toBe(screen.getByTestId('open-chip'))
  })

  /* the re-walk, S20: with the calendar's month-and-year lists open, the first Escape shuts only the lists (D1012) */
  it('with the calendar’s month list open, Escape shuts the list first, then the calendar, then the window', () => {
    openWindow()
    fireEvent.click(screen.getByTestId('od-cal-2026-01-01'))
    const title = document.querySelector('[data-testid="open-dates"] .dcal-title') as HTMLElement
    fireEvent.click(title)
    expect(title.getAttribute('aria-expanded')).toBe('true')
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.getByTestId('od-range-picker')).toBeTruthy()
    expect((document.querySelector('[data-testid="open-dates"] .dcal-title') as HTMLElement).getAttribute('aria-expanded')).toBe('false')
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByTestId('od-range-picker')).toBeNull()
    expect(screen.getByTestId('open-dates')).toBeTruthy()
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByTestId('open-dates')).toBeNull()
  })
})

describe('nothing open', () => {
  beforeEach(() => { setRole('admin') })

  it('says bidding is closed', () => {
    initStore(memoryBackend())
    setRole('admin')
    act(() => { closeDates('2026-01-01', '2026-12-31') })
    openWindow()
    expect(screen.getByTestId('od-none').textContent).toContain('Nothing is open, so bidding is closed.')
  })

  // D1177's reading: "a tap on 'Bidding closed' shows the last open stretch and who closed it".
  it('names the last open stretch and who closed it', () => {
    setViewer('asics')
    const cs = getState().people.find(p => p.id === 'asics')!.callsign
    act(() => { closeDates('2026-01-01', '2026-12-31') })
    openWindow()
    expect(screen.getByTestId('od-last').textContent).toBe(`Last open 1 Jan – 31 Mar · closed by ${cs}`)
  })

  // Empty means closed (the red team's B2): a new period opens nothing until the admin does — and, never closed, it
  // has no last stretch to name.
  it('a new period is closed, with no last stretch to name', () => {
    act(() => { createWar('JAN – DEC 28', '2028-01-01', '2028-12-31'); selectWar('war-2028-01-01-2028-12-31') })
    expect(getState().period.start).toBe('2028-01-01')
    openWindow()
    expect(screen.getByTestId('open-chip').textContent).toBe('Bidding closed')
    expect(screen.getByTestId('od-none').textContent).toContain('Nothing is open, so bidding is closed.')
    expect(screen.queryByTestId('od-last')).toBeNull()
  })
})

describe('a member reads it', () => {
  afterEach(() => { setMemberTodayForTests('2000-01-01') })

  it('reads only: months disabled, no calendar icon, no “+ Open more dates”', () => {
    setRole('member')
    openWindow()
    expect((month('2026-01') as HTMLButtonElement).disabled).toBe(true)
    expect(month('2026-01').getAttribute('data-state')).toBe('open')
    expect(line('2026-01-01').textContent).toContain('1 Jan – 31 Mar')
    expect(screen.queryByTestId('od-cal-2026-01-01')).toBeNull()
    expect(screen.queryByTestId('od-more')).toBeNull()
    fireEvent.click(month('2026-06'))
    expect(getState().period.open).toEqual([{ from: '2026-01-01', to: '2026-03-31' }])
  })

  // D1211: he never bids before today, so what is open FOR HIM starts at today.
  it('shows him the open dates from his today', () => {
    setMemberTodayForTests('2026-02-10')
    setRole('member')
    openWindow()
    expect(line('2026-02-10').textContent).toContain('10 Feb – 31 Mar')
    expect(month('2026-01').getAttribute('data-state')).toBe('closed')
    /* read from today (D1268; the fresh read's F1): every day of February from today is open, so it reads open — its
       days before today are past, not "closed in part" */
    expect(month('2026-02').getAttribute('data-state')).toBe('open')
    expect(screen.getByTestId('open-chip').textContent).toBe('Open for bidding 10 Feb – 31 Mar')
  })
})

describe('the grid shows which days are open', () => {
  it('dims the columns a member may not bid on, and not the ones they may', () => {
    render(<Matrix />)
    expect(screen.getByTestId('head-2026-02-11').className).not.toContain('locked')
    expect(screen.getByTestId('cell-ramp-2026-02-11').className).not.toContain('locked')
    expect(screen.getByTestId('head-2026-08-11').className).toContain('locked')
    expect(screen.getByTestId('cell-ramp-2026-08-11').className).toContain('locked')
  })

  /* "locks nothing for an admin" — KEPT through the open dates: the dates do not bind him, the green outline shows him
     what is open, and the dim on his screen was measured to slow his tap about threefold (M1's speed check, 22 Oct 26). */
  it('dims nothing for the admin — the open dates do not bind him', () => {
    setRole('admin')
    render(<Matrix />)
    expect(screen.getByTestId('head-2026-02-11').className).not.toContain('locked')
    expect(screen.getByTestId('head-2026-08-11').className).not.toContain('locked')
    expect(screen.getByTestId('cell-ramp-2026-08-11').className).not.toContain('locked')
  })

  it('offers no bid sheet on a closed day — the closed note instead — and one on an open day', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-ramp-2026-08-11'))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    expect(screen.getByTestId('closed-note')).toBeTruthy()
    fireEvent.click(screen.getByTestId('closed-note-close'))
    fireEvent.click(screen.getByTestId('cell-ramp-2026-02-11'))
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
  })

  /* WAS "locks the whole year for a member once the war closes". CHANGED by D1177's reading: "with nothing open the
     grid shows as normal" — no dim — while a member still cannot bid anywhere. */
  it('dims nothing once nothing is open, and a member still cannot bid', () => {
    setRole('admin')
    closeDates('2026-01-01', '2026-12-31')
    setRole('member')
    render(<Matrix />)
    expect(screen.getByTestId('head-2026-02-11').className).not.toContain('locked')
    expect(screen.getByTestId('head-2026-08-11').className).not.toContain('locked')
    fireEvent.click(screen.getByTestId('cell-ramp-2026-02-11'))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    expect(screen.getByTestId('closed-note')).toBeTruthy()
  })
})

/* D1265, D1268 (owner, 23 Oct 26 — "1 yes" to the drawing): a month wholly before today is past — dimmed with the grid's
   padlock and not pressable, for the admin too; a stretch wholly past reads "past"; the admin's chip counts from today. */
describe('past months in the window (D1268)', () => {
  afterEach(() => { setMemberTodayForTests('2000-01-01') })
  it('on 1 Apr the seed\'s Jan–Mar is past: its months locked and not pressable, its stretch reads "past", the chip "Bidding closed"', () => {
    setMemberTodayForTests('2026-04-01')
    setRole('admin'); setViewer(null)
    openWindow()
    for (const k of ['2026-01', '2026-02', '2026-03']) {
      expect(month(k).classList.contains('past')).toBe(true)
      expect((month(k) as HTMLButtonElement).disabled).toBe(true)
    }
    expect(month('2026-04').classList.contains('past')).toBe(false)
    expect((month('2026-04') as HTMLButtonElement).disabled).toBe(false)
    expect(line('2026-01-01').textContent).toContain('past')
    expect(line('2026-01-01').classList.contains('past')).toBe(true)
    /* a tap on a past month does nothing */
    fireEvent.click(month('2026-02'))
    expect(getState().period.open).toEqual([{ from: '2026-01-01', to: '2026-03-31' }])
    expect(screen.getByTestId('open-chip').textContent).toBe('Bidding closed')
  })
  it('a month part past is not past: a tap opens it from today; a month ahead from its first day', () => {
    setMemberTodayForTests('2026-04-15')
    setRole('admin'); setViewer(null)
    openWindow()
    expect(month('2026-04').classList.contains('past')).toBe(false)
    fireEvent.click(month('2026-04'))
    expect(getState().period.open.some(s => s.from === '2026-04-15' && s.to === '2026-04-30')).toBe(true)
    fireEvent.click(month('2026-06'))
    expect(getState().period.open.some(s => s.from === '2026-06-01')).toBe(true)
  })
  /* the fresh read (F1): opened from today, the month read "open in part" (its days before today closed) and a second tap
     tried to open it again — nothing happened. Its state is read from today: open, a second tap closes it. */
  it('the current month opened from today reads open, and a second tap closes it', () => {
    setMemberTodayForTests('2026-04-15')
    setRole('admin'); setViewer(null)
    openWindow()
    fireEvent.click(month('2026-04'))
    expect(month('2026-04').getAttribute('data-state')).toBe('open')
    fireEvent.click(month('2026-04'))
    expect(getState().period.open.some(s => s.to >= '2026-04-15' && s.from <= '2026-04-30')).toBe(false)
    expect(month('2026-04').getAttribute('data-state')).toBe('closed')
  })
})
