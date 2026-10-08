// @vitest-environment jsdom
/* DAYS — THE YEAR'S HOLIDAYS (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.4, §3.12;
   owner D631: "the year's public holidays are seen and set in one list"; D638: "a public holiday and an Off day each
   have two doors onto ONE record — the Leave War's Event row, the Holidays list"; D652: the list's "Add a day" form
   carries the short form too — "On grid" beside the name; D641: the form is a window that does not block the page).

   The list is the war's own record seen as a list (leavewar/sync.ts holidaysIn) and its form writes it with the war's
   three commands (holidayAdd / holidayChange / holidayRemove — one named command, one Undo step each). Those rules —
   which period a date is written to, the first free Event row, a band for a run, the short form kept under a change —
   are pinned by leavewar/holidays.test.ts; what is pinned HERE is the screen: the list, the form, what it starts
   with, and that every refusal of the store is said in the window and nothing is lost by it. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { storeBackend, HOOKS } from '../engine/hooks'
import { initStore as raptorInitStore, notify } from '../state/store'
import { setSession } from '../state/auth'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { globalUndo, undoState } from '../undo'
import { createWar, getState, holidayAdd, holidayRemove, initStore as lwInitStore, lwHistInit, setRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { holidaysIn, wireLeaveWarSync, type HolidayLine } from '../leavewar/sync'
import { setDaysWin } from './pops'
import { CURPAGE, setPage } from '../state/view'
import { clearNewWarAsk, peekNewWarAsk } from '../leavewar/ui/warask'
import { _resetFloatWins } from './FloatWindow'
import { DaysWindow } from './DaysWindow'

const mem = new Map<string, string>()
const realMM = window.matchMedia
const toast = HOOKS.toast
/** a screen `w` pixels wide, as the browser would answer each "max-width" question */
const asWide = (w: number) => { (window as any).matchMedia = (q: string) => ({ matches: (m => !!m && w <= +m[1])(/max-width:\s*(\d+)px/.exec(q)), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }) }

beforeEach(() => {
  /* today is Thu 8 Oct 2026 — only the clock's date is held still */
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 8, 12, 0, 0))
  mem.clear()
  storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
  setSession({ user: 'admin-test', role: 'admin' })
  raptorInitStore()
  lwInitStore(memoryBackend())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  HOOKS.toast = () => {}
  setRole('admin')
  asWide(1600)
  clearNewWarAsk(); setPage('viewsched')
})
afterEach(() => {
  cleanup(); _resetFloatWins(); setDaysWin(null); setSession(null); storeBackend.impl = null; _resetTimeline()
  HOOKS.toast = toast; (window as any).matchMedia = realMM; vi.useRealTimers()
})

const t = (id: string) => screen.getByTestId(id)
const q = (id: string) => screen.queryByTestId(id)
const pressed = (id: string) => t(id).getAttribute('aria-pressed')
const val = (id: string) => (t(id) as HTMLInputElement).value
const type = (id: string, v: string) => fireEvent.change(t(id), { target: { value: v } })
const lines = (y: number) => holidaysIn(y)
const line = (y: number, from: string): HolidayLine => lines(y).find(h => h.from === from)!
/** what the list shows: one array per line — its dates, its name, its tag */
const shown = () => [...t('hol-list').querySelectorAll('.hol-line')].map(n => [n.querySelector('.hol-when')!.textContent, n.querySelector('.hol-name')!.textContent, n.querySelector('.hol-tag')!.textContent])
/** a year nothing in the demo world reaches */
const FREE = 2031
function open(iso = '2026-11-02') { render(<DaysWindow />); act(() => { setDaysWin(iso); notify() }) }
const add = () => fireEvent.click(t('hol-add'))
/* THE DATES ARE PICKED ON THE LEAVE WAR'S OWN RANGE CALENDAR (D671): walk it to a month, tap a day */
const MONTHS_L = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const calAt = () => { const [m, y] = t('holcal-month').textContent!.trim().split(/\s+/); return +y * 12 + MONTHS_L.findIndex(x => x.toLowerCase() === m.toLowerCase()) }
const goTo = (iso: string) => {
  let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - calAt()
  for (; d > 0; d--) fireEvent.click(t('holcal-next-month'))
  for (; d < 0; d++) fireEvent.click(t('holcal-prev-month'))
}
const tap = (iso: string) => { goTo(iso); fireEvent.click(t(`holcal-day-${iso}`)) }
/** pick one day, or a run — from a clean calendar, whatever was picked before */
const pick = (from: string, to?: string) => {
  if (q('holcal-clear')) fireEvent.click(t('holcal-clear'))
  tap(from)
  if (to && to !== from) tap(to)
}
const picked = () => [t('hol-dates').getAttribute('data-from'), t('hol-dates').getAttribute('data-to')]

describe('the two parts of Days', () => {
  it('a wide screen shows the month and the holidays side by side, with no tabs', () => {
    open()
    expect(t('days-part-month')).toBeTruthy(); expect(t('days-part-holidays')).toBeTruthy()
    expect(q('days-tabs')).toBeNull()
    expect(t('win-days').className).toContain('two')
  })
  it('a narrower one — a 1440px laptop too — shows two tabs: Month first; Holidays swaps the part, and back', () => {
    asWide(1440)
    open()
    expect(t('days-tabs').getAttribute('role')).toBe('tablist')
    expect(t('days-tab-month').getAttribute('aria-selected')).toBe('true'); expect(t('days-tab-holidays').getAttribute('aria-selected')).toBe('false')
    expect(t('days-part-month')).toBeTruthy(); expect(q('days-part-holidays')).toBeNull()
    fireEvent.click(t('days-tab-holidays'))
    expect(t('days-tab-holidays').getAttribute('aria-selected')).toBe('true')
    expect(q('days-part-month')).toBeNull(); expect(t('days-part-holidays')).toBeTruthy()
    fireEvent.click(t('days-tab-month'))
    expect(t('days-part-month')).toBeTruthy(); expect(q('days-part-holidays')).toBeNull()
    expect(t('win-days').className).not.toContain('two')
  })
  it('a phone has the tabs too, and its one stepping button', () => {
    asWide(390)
    open()
    expect(t('days-tabs')).toBeTruthy(); expect(t('days-step-2026-11-02')).toBeTruthy()
  })
})

describe('the list', () => {
  it('opens on the year of the month Days opened on; ‹ and › step a year', () => {
    open('2026-11-02')
    expect(t('hol-year').textContent).toBe('2026')
    fireEvent.click(t('hol-next')); expect(t('hol-year').textContent).toBe('2027')
    fireEvent.click(t('hol-prev')); fireEvent.click(t('hol-prev')); expect(t('hol-year').textContent).toBe('2025')
  })
  it('one line for each of the year’s public holidays and Off days, in date order — its dates, its name, its tag', () => {
    holidayAdd({ kind: 'ph', name: 'Deepavali', from: '2026-11-09', to: '2026-11-09' })
    holidayAdd({ kind: 'off', name: 'Stand-down', from: '2026-12-28', to: '2026-12-30' })
    open()
    const all = lines(2026)
    expect(shown().length).toBe(all.length)
    expect(all.length).toBeGreaterThanOrEqual(2)
    expect(shown()).toContainEqual(['Mon 9 Nov', 'Deepavali', 'PH'])
    expect(shown()).toContainEqual(['Mon 28 – Wed 30 Dec', 'Stand-down', 'OFF'])
    const froms = [...t('hol-list').querySelectorAll('.hol-line')].map(n => n.getAttribute('data-from')!)
    expect(froms).toEqual([...froms].sort())
    expect(froms).toEqual(all.map(h => h.from))
  })
  it('a run across two months names both', () => {
    holidayAdd({ kind: 'off', name: 'Stand-down', from: '2026-10-30', to: '2026-11-02' })
    open()
    expect(shown()).toContainEqual(['Fri 30 Oct – Mon 2 Nov', 'Stand-down', 'OFF'])
  })
  it('a line that is over is dimmed; one still to come is not', () => {
    holidayAdd({ kind: 'ph', name: 'Past one', from: '2026-10-07', to: '2026-10-07' })
    holidayAdd({ kind: 'ph', name: 'Today', from: '2026-10-08', to: '2026-10-08' })
    open()
    const of = (from: string) => t('hol-list').querySelector(`.hol-line[data-from="${from}"]`)!
    expect(of('2026-10-07').className).toContain('is-past')
    expect(of('2026-10-08').className).not.toContain('is-past')
  })
  it('a line says what it opens', () => {
    holidayAdd({ kind: 'ph', name: 'Deepavali', from: '2026-11-09', to: '2026-11-09' })
    open()
    expect(t('hol-list').querySelector('.hol-line[data-from="2026-11-09"]')!.getAttribute('aria-label')).toBe('Change: Deepavali, Mon 9 Nov, public holiday')
  })
  it('a year a leave period covers, with none: it says so', () => {
    createWar(String(FREE), `${FREE}-01-01`, `${FREE}-12-31`)
    open(`${FREE}-03-01`)
    expect(q('hol-list')).toBeNull()
    expect(t('hol-empty').textContent).toBe(`No public holidays or Off days in ${FREE}.`)
    expect(q('hol-nocover')).toBeNull()
  })
  it('a holiday set on the Leave War while the window is up appears at once (two doors, one record)', () => {
    open()
    const n = shown().length
    act(() => { holidayAdd({ kind: 'ph', name: 'Deepavali', from: '2026-11-09', to: '2026-11-09' }) })
    expect(shown().length).toBe(n + 1)
    /* and the month beside it wears the tag */
    expect(t('days-tag-2026-11-09').textContent).toBe('PH')
  })
})

describe('a year no leave period covers', () => {
  it('whole: it says so and offers to create it; pressed, the year is covered and the line goes', () => {
    open(`${FREE}-03-01`)
    expect(t('hol-nocover').textContent).toContain(`No leave period covers ${FREE} yet.`)
    fireEvent.click(t('hol-create-year'))
    expect(getState().wars.some(w => w.period.start === `${FREE}-01-01` && w.period.end === `${FREE}-12-31`)).toBe(true)
    expect(q('hol-nocover')).toBeNull(); expect(t('hol-empty')).toBeTruthy()
  })
  it('in part: it names the dates left out, and offers no whole-year button', () => {
    createWar('Q1', `${FREE}-01-01`, `${FREE}-03-31`)
    open(`${FREE}-03-01`)
    expect(t('hol-nocover').textContent).toContain(`No leave period covers 1 Apr – 31 Dec ${FREE} yet.`)
    expect(q('hol-create-year')).toBeNull()
  })
  it('two holes are both named', () => {
    createWar('Mid', `${FREE}-04-01`, `${FREE}-09-30`)
    open(`${FREE}-03-01`)
    expect(t('hol-nocover').textContent).toContain(`No leave period covers 1 Jan – 31 Mar or 1 Oct – 31 Dec ${FREE} yet.`)
  })
  it('in part: each run left out has a button that asks the Leave War for its own New-period sheet on those dates', () => {
    createWar('Mid', `${FREE}-04-01`, `${FREE}-09-30`)
    open(`${FREE}-03-01`)
    expect(t(`hol-new-period-${FREE}-01-01`).textContent).toBe('Add a period for 1 Jan – 31 Mar…')
    expect(t(`hol-new-period-${FREE}-10-01`).textContent).toBe('Add a period for 1 Oct – 31 Dec…')
    fireEvent.click(t(`hol-new-period-${FREE}-10-01`))
    expect(peekNewWarAsk()).toEqual({ from: `${FREE}-10-01`, to: `${FREE}-12-31` })
    /* the sheet is the war's, on its page — he is taken there; Days stays up */
    expect(CURPAGE).toBe('leavewar'); expect(t('win-days')).toBeTruthy()
  })
})

describe('a holiday on a date no leave period covers WAITS — and is saved by itself once one does', () => {
  const fill = (iso: string) => { add(); type('hol-name', 'National Day'); pick(iso) }
  it('no period reaches the year: the form says it is kept and offers to create the year; created, the holiday is saved and the form closes', () => {
    open(`${FREE}-03-01`); fill(`${FREE}-08-09`)
    fireEvent.click(t('hol-save'))
    expect(t('hol-err').textContent).toBe(`No leave period covers 9 Aug ${String(FREE).slice(2)} yet.`)
    expect(t('hol-waiting').textContent).toBe('It is kept here, and saved by itself as soon as a leave period covers it.')
    expect(t('hol-wait-create').textContent).toBe(`Create the ${FREE} leave period`)
    expect(q('hol-wait-period')).toBeNull()
    fireEvent.click(t('hol-wait-create'))
    expect(getState().wars.some(w => w.period.start === `${FREE}-01-01` && w.period.end === `${FREE}-12-31`)).toBe(true)
    expect(line(FREE, `${FREE}-08-09`)).toMatchObject({ kind: 'ph', name: 'National Day' })
    expect(q('win-holiday')).toBeNull()
    expect(shown()).toContainEqual(['Sat 9 Aug', 'National Day', 'PH'])
  })
  it('covered in part: it offers the Leave War’s New-period sheet on the run that holds the date; once that period exists the holiday is saved', () => {
    createWar('Q1', `${FREE}-01-01`, `${FREE}-03-31`)
    open(`${FREE}-03-01`); fill(`${FREE}-08-09`)
    fireEvent.click(t('hol-save'))
    expect(t('hol-waiting')).toBeTruthy(); expect(q('hol-wait-create')).toBeNull()
    expect(t('hol-wait-period').textContent).toBe('Add a leave period for 1 Apr – 31 Dec…')
    fireEvent.click(t('hol-wait-period'))
    expect(peekNewWarAsk()).toEqual({ from: `${FREE}-04-01`, to: `${FREE}-12-31` })
    expect(CURPAGE).toBe('leavewar')
    /* the form is still there, holding it, while he makes the period on the Leave War */
    expect(val('hol-name')).toBe('National Day'); expect(lines(FREE).length).toBe(0)
    act(() => { createWar('Rest', `${FREE}-04-01`, `${FREE}-12-31`) })
    expect(line(FREE, `${FREE}-08-09`)).toMatchObject({ kind: 'ph', name: 'National Day' })
    expect(q('win-holiday')).toBeNull()
  })
  it('a period made any other way does it too — the "+ New" on the Leave War, a shorter one that still holds the date', () => {
    open(`${FREE}-03-01`); fill(`${FREE}-08-09`)
    fireEvent.click(t('hol-save'))
    act(() => { createWar('Aug only', `${FREE}-08-01`, `${FREE}-08-31`) })
    expect(lines(FREE).map(h => h.from)).toEqual([`${FREE}-08-09`])
  })
  it('a period that does NOT hold the date changes nothing: it still waits', () => {
    open(`${FREE}-03-01`); fill(`${FREE}-08-09`)
    fireEvent.click(t('hol-save'))
    act(() => { createWar('Q1', `${FREE}-01-01`, `${FREE}-03-31`) })
    expect(lines(FREE).length).toBe(0); expect(t('hol-waiting')).toBeTruthy()
    /* and the year is covered in part now, so the way out it offers has changed with it */
    expect(q('hol-wait-create')).toBeNull(); expect(t('hol-wait-period').textContent).toBe('Add a leave period for 1 Apr – 31 Dec…')
  })
  it('an edit after the refusal ends the wait: he changed it, so he saves it himself', () => {
    open(`${FREE}-03-01`); fill(`${FREE}-08-09`)
    fireEvent.click(t('hol-save'))
    type('hol-name', 'National Day (obs)')
    expect(q('hol-waiting')).toBeNull(); expect(q('hol-wait-create')).toBeNull()
    act(() => { createWar(String(FREE), `${FREE}-01-01`, `${FREE}-12-31`) })
    expect(lines(FREE).length).toBe(0); expect(t('win-holiday')).toBeTruthy()
    fireEvent.click(t('hol-save'))
    expect(line(FREE, `${FREE}-08-09`).name).toBe('National Day (obs)')
  })
  it('the new period holds its first day but not its last: it is not saved in part — the form says why and stops waiting', () => {
    open(`${FREE}-03-01`); add()
    type('hol-name', 'Stand-down'); pick(`${FREE}-08-30`, `${FREE}-09-02`)
    fireEvent.click(t('hol-save'))
    expect(t('hol-waiting')).toBeTruthy()
    act(() => { createWar('Aug only', `${FREE}-08-01`, `${FREE}-08-31`) })
    expect(lines(FREE).length).toBe(0)
    expect(t('hol-err').textContent).toMatch(/run past 31 Aug/)
    expect(q('hol-waiting')).toBeNull(); expect(t('win-holiday')).toBeTruthy()
  })
  it('refused for ANOTHER reason on such a date — a short form that is not one — it does not wait: he has something to put right first', () => {
    open(`${FREE}-03-01`); fill(`${FREE}-08-09`)
    type('hol-short', 'a b')
    fireEvent.click(t('hol-save'))
    expect(t('hol-err').textContent).toBe('The short form is one to three letters or digits, with no space.')
    expect(q('hol-waiting')).toBeNull(); expect(q('hol-wait-create')).toBeNull()
    act(() => { createWar(String(FREE), `${FREE}-01-01`, `${FREE}-12-31`) })
    expect(lines(FREE).length).toBe(0)
  })
  it('Cancel gives the wait up: a period made afterwards saves nothing', () => {
    open(`${FREE}-03-01`); fill(`${FREE}-08-09`)
    fireEvent.click(t('hol-save')); fireEvent.click(t('hol-cancel'))
    act(() => { createWar(String(FREE), `${FREE}-01-01`, `${FREE}-12-31`) })
    expect(lines(FREE).length).toBe(0)
  })
  it('a line being CHANGED onto such a date waits the same way, and is moved — not copied — once the period exists', () => {
    holidayAdd({ kind: 'ph', name: 'National Day', from: '2026-08-10', to: '2026-08-10' })
    open(); fireEvent.click(t('hol-list').querySelector('.hol-line[data-from="2026-08-10"]')!)
    pick(`${FREE}-08-09`)
    fireEvent.click(t('hol-save'))
    expect(t('hol-waiting')).toBeTruthy()
    expect(lines(2026).some(h => h.from === '2026-08-10')).toBe(true)
    act(() => { createWar(String(FREE), `${FREE}-01-01`, `${FREE}-12-31`) })
    expect(lines(FREE).map(h => h.name)).toEqual(['National Day'])
    expect(lines(2026).some(h => h.from === '2026-08-10')).toBe(false)
  })
})

describe('"+ Add"', () => {
  it('opens a window beside Days that does not block it: a public holiday, nothing picked, the calendar on today’s month', () => {
    open(); add()
    expect(t('win-holiday').getAttribute('aria-label')).toBe('Add a holiday')
    expect(t('win-holiday').getAttribute('aria-modal')).toBe('false')
    expect(t('win-days')).toBeTruthy()
    expect(pressed('hol-kind-ph')).toBe('true'); expect(pressed('hol-kind-off')).toBe('false')
    expect(val('hol-name')).toBe(''); expect(val('hol-short')).toBe('')
    /* a date he did not choose is never saved (D671): none is picked for him */
    expect(picked()).toEqual(['', ''])
    expect(t('holcal-month').textContent).toMatch(/October\s+2026/i)
    expect(t('holcal-selection').textContent).toBe('Pick a start date')
    expect(q('hol-delete')).toBeNull(); expect(t('hol-save-more')).toBeTruthy()
    /* no date boxes any more — one calendar */
    expect(q('hol-from')).toBeNull(); expect(q('hol-to')).toBeNull()
    expect(t('win-holiday').querySelector('input[type="date"]')).toBeNull()
  })
  it('on another year’s list the calendar opens on that January', () => {
    open(); fireEvent.click(t('hol-next')); add()
    expect(t('holcal-month').textContent).toMatch(/January\s+2027/i)
    expect(picked()).toEqual(['', ''])
  })
  it('it is the Leave War’s own picker: one tap is one day, a later tap makes the run, an earlier one starts again, a third starts over, Clear empties it', () => {
    open(); add()
    tap('2026-11-09'); expect(picked()).toEqual(['2026-11-09', '2026-11-09'])
    tap('2026-11-11'); expect(picked()).toEqual(['2026-11-09', '2026-11-11'])
    expect(t('holcal-day-2026-11-10').getAttribute('aria-pressed')).toBe('true')
    expect(t('holcal-selection').textContent).toMatch(/9 Nov.*11 Nov/)
    tap('2026-11-20'); expect(picked()).toEqual(['2026-11-20', '2026-11-20'])          // a third tap starts over
    tap('2026-11-18'); expect(picked()).toEqual(['2026-11-18', '2026-11-18'])          // before the start: begins there
    fireEvent.click(t('holcal-clear')); expect(picked()).toEqual(['', ''])
  })
  it('a run may cross into the next month: ‹ › page the calendar and the pick is kept', () => {
    open(); add()
    tap('2026-10-30'); tap('2026-11-02')
    expect(picked()).toEqual(['2026-10-30', '2026-11-02'])
    fireEvent.click(t('hol-save'))
    expect(line(2026, '2026-10-30')).toMatchObject({ to: '2026-11-02' })
  })
  it('Save writes ONE holiday in one Undo step, closes, and the list and the month follow', () => {
    open(); add()
    type('hol-name', 'Deepavali'); pick('2026-11-09')
    fireEvent.click(t('hol-save'))
    expect(line(2026, '2026-11-09')).toMatchObject({ kind: 'ph', name: 'Deepavali', to: '2026-11-09' })
    expect(q('win-holiday')).toBeNull(); expect(t('win-days')).toBeTruthy()
    expect(shown()).toContainEqual(['Mon 9 Nov', 'Deepavali', 'PH'])
    expect(t('days-tag-2026-11-09').textContent).toBe('PH')
    expect(undoState().undoLabel).toContain('a public holiday on 9 Nov')
    act(() => { globalUndo() })
    expect(lines(2026).some(h => h.from === '2026-11-09')).toBe(false)
    expect(q('days-tag-2026-11-09')).toBeNull()
  })
  it('an Off day over a run of days is one line', () => {
    open(); add()
    fireEvent.click(t('hol-kind-off'))
    type('hol-name', 'Stand-down'); pick('2026-12-28', '2026-12-30')
    fireEvent.click(t('hol-save'))
    expect(line(2026, '2026-12-28')).toMatchObject({ kind: 'off', name: 'Stand-down', to: '2026-12-30' })
    expect(shown()).toContainEqual(['Mon 28 – Wed 30 Dec', 'Stand-down', 'OFF'])
  })
  it('no name typed: the box shows the kind’s usual word, and that is what is saved', () => {
    open(); add()
    const usual = t('hol-name').getAttribute('placeholder')!
    expect(usual.length).toBeGreaterThan(0)
    pick('2026-11-09'); fireEvent.click(t('hol-save'))
    expect(line(2026, '2026-11-09').name).toBe(usual)
    cleanup(); _resetFloatWins(); setDaysWin(null)
    open(); add(); fireEvent.click(t('hol-kind-off'))
    const usualOff = t('hol-name').getAttribute('placeholder')!
    expect(usualOff).not.toBe(usual)
    pick('2026-11-10'); fireEvent.click(t('hol-save'))
    expect(line(2026, '2026-11-10')).toMatchObject({ kind: 'off', name: usualOff })
  })
  it('"On grid" is its short form — capitals, three at most; one that is not a short form is refused with the rule', () => {
    open(); add()
    type('hol-name', 'National Day'); pick('2026-08-10'); type('hol-short', 'nd')
    expect(val('hol-short')).toBe('ND')
    expect(t('hol-short').getAttribute('maxlength')).toBe('3')
    fireEvent.click(t('hol-save'))
    expect(line(2026, '2026-08-10').short).toBe('ND')
    add()
    type('hol-name', 'Other'); pick('2026-08-11'); type('hol-short', 'a b')
    fireEvent.click(t('hol-save'))
    expect(t('hol-err').textContent).toBe('The short form is one to three letters or digits, with no space.')
    expect(lines(2026).some(h => h.from === '2026-08-11')).toBe(false); expect(t('win-holiday')).toBeTruthy()
  })
  it('"Save and add another" saves, says so, and stays — the kind kept, the calendar ready on the day after’s month, the name cleared', () => {
    open(); add()
    fireEvent.click(t('hol-kind-off'))
    type('hol-name', 'Stand-down'); type('hol-short', 'SD'); pick('2026-12-28', '2026-12-30')
    fireEvent.click(t('hol-save-more'))
    expect(line(2026, '2026-12-28')).toMatchObject({ kind: 'off', to: '2026-12-30' })
    expect(t('win-holiday')).toBeTruthy()
    expect(t('hol-saved').textContent).toBe('Saved: Stand-down, Mon 28 – Wed 30 Dec.')
    expect(pressed('hol-kind-off')).toBe('true')
    expect(val('hol-name')).toBe(''); expect(val('hol-short')).toBe('')
    /* nothing is picked for the next one — and the calendar is on the month of the day after */
    expect(picked()).toEqual(['', ''])
    expect(t('holcal-month').textContent).toMatch(/December\s+2026/i)
    /* the note goes at the next edit */
    type('hol-name', 'x'); expect(q('hol-saved')).toBeNull()
  })
  /* the test above saves 28–30 Dec, whose day after is in the month the calendar was already paged to — so it never saw
     the calendar MOVE (found by breaking the rule on purpose, 8 Oct 26: with the move taken out, every test passed) */
  it('…and the calendar MOVES to the day after: a holiday saved on a month’s last day leaves it on the next month', () => {
    open(); add()
    type('hol-name', 'Month end'); pick('2026-11-30')
    expect(t('holcal-month').textContent).toMatch(/November\s+2026/i)
    fireEvent.click(t('hol-save-more'))
    expect(line(2026, '2026-11-30')).toMatchObject({ to: '2026-11-30' })
    expect(picked()).toEqual(['', ''])
    expect(t('holcal-month').textContent).toMatch(/December\s+2026/i)
  })
  it('a date no leave period covers is refused in the window, and what he typed stays', () => {
    open(`${FREE}-03-01`); add()
    type('hol-name', 'National Day'); pick(`${FREE}-08-09`)
    fireEvent.click(t('hol-save'))
    expect(t('hol-err').textContent).toBe(`No leave period covers 9 Aug ${String(FREE).slice(2)} yet.`)
    expect(t('win-holiday')).toBeTruthy(); expect(val('hol-name')).toBe('National Day'); expect(picked()[0]).toBe(`${FREE}-08-09`)
    /* any edit takes the line down */
    type('hol-name', 'National Day!'); expect(q('hol-err')).toBeNull()
  })
  it('nothing picked is not saved — it says what to do; and picking takes the line down', () => {
    open(); add()
    type('hol-name', 'Deepavali')
    fireEvent.click(t('hol-save'))
    expect(t('hol-err').textContent).toBe('Pick its day — or its first and last day — on the calendar.')
    expect(lines(2026).some(h => h.name === 'Deepavali')).toBe(false); expect(t('win-holiday')).toBeTruthy()
    tap('2026-11-09'); expect(q('hol-err')).toBeNull()
    fireEvent.click(t('hol-save'))
    expect(line(2026, '2026-11-09').name).toBe('Deepavali')
  })
  it('Cancel and ✕ close it and save nothing; closing Days takes it too', () => {
    open(); add()
    type('hol-name', 'Deepavali'); pick('2026-11-09')
    fireEvent.click(t('hol-cancel'))
    expect(q('win-holiday')).toBeNull(); expect(lines(2026).some(h => h.from === '2026-11-09')).toBe(false)
    add(); fireEvent.click(t('win-holiday-x')); expect(q('win-holiday')).toBeNull()
    add(); fireEvent.click(t('win-days-x'))
    expect(q('win-holiday')).toBeNull(); expect(q('win-days')).toBeNull()
  })
})

describe('a line opens to change or delete', () => {
  const seed = () => { holidayAdd({ kind: 'ph', name: 'National Day', from: '2026-08-10', to: '2026-08-10', short: 'ND' }) }
  const openLine = (from: string) => fireEvent.click(t('hol-list').querySelector(`.hol-line[data-from="${from}"]`)!)
  it('with what it holds — and Delete instead of "Save and add another"', () => {
    seed(); open(); openLine('2026-08-10')
    expect(t('win-holiday').getAttribute('aria-label')).toBe('Change a holiday')
    expect(pressed('hol-kind-ph')).toBe('true'); expect(val('hol-name')).toBe('National Day'); expect(val('hol-short')).toBe('ND')
    expect(picked()).toEqual(['2026-08-10', '2026-08-10'])
    expect(t('holcal-month').textContent).toMatch(/August\s+2026/i)
    expect(t('hol-delete')).toBeTruthy(); expect(q('hol-save-more')).toBeNull()
  })
  it('Save changes that one record — a new name, a longer run — in one Undo step', () => {
    seed(); open(); openLine('2026-08-10')
    const n = lines(2026).length
    type('hol-name', 'National Day weekend'); tap('2026-08-11')
    fireEvent.click(t('hol-save'))
    expect(lines(2026).length).toBe(n)
    expect(line(2026, '2026-08-10')).toMatchObject({ name: 'National Day weekend', to: '2026-08-11' })
    expect(q('win-holiday')).toBeNull()
    expect(undoState().undoLabel).toContain('a change to the public holiday')
    act(() => { globalUndo() })
    expect(line(2026, '2026-08-10')).toMatchObject({ name: 'National Day', to: '2026-08-10' })
  })
  it('a change that leaves "On grid" alone keeps the short form it had', () => {
    seed(); open(); openLine('2026-08-10')
    tap('2026-08-11'); fireEvent.click(t('hol-save'))
    expect(line(2026, '2026-08-10').short).toBe('ND')
  })
  it('a holiday with no short form of its own shows what it prints — and a rename with "On grid" left alone prints the NEW name’s', () => {
    /* the box shows "ND", made from the name; it is not the holiday's own, so it must not be saved as if he had typed it */
    holidayAdd({ kind: 'ph', name: 'National Day', from: '2026-08-10', to: '2026-08-10' })
    open(); openLine('2026-08-10')
    expect(val('hol-short')).toBe('ND')
    type('hol-name', 'Deepavali'); fireEvent.click(t('hol-save'))
    expect(line(2026, '2026-08-10').name).toBe('Deepavali')
    expect(line(2026, '2026-08-10').short).toBe('DEE')
  })
  it('"On grid" emptied gives up its own short form — the name’s then prints', () => {
    holidayAdd({ kind: 'ph', name: 'National Day', from: '2026-08-10', to: '2026-08-10', short: 'XX' })
    open(); openLine('2026-08-10')
    expect(val('hol-short')).toBe('XX')
    type('hol-short', ''); fireEvent.click(t('hol-save'))
    expect(line(2026, '2026-08-10').short).toBe('ND')
  })
  it('Delete takes it away in one Undo step and closes; Undo brings it back', () => {
    seed(); open(); openLine('2026-08-10')
    fireEvent.click(t('hol-delete'))
    expect(lines(2026).some(h => h.from === '2026-08-10')).toBe(false); expect(q('win-holiday')).toBeNull()
    expect(undoState().undoLabel).toContain('removing the public holiday')
    act(() => { globalUndo() })
    expect(line(2026, '2026-08-10')).toMatchObject({ name: 'National Day' })
  })
  it('a holiday taken away on the Leave War while its window is up: Save says it is no longer there', () => {
    seed(); open(); openLine('2026-08-10')
    act(() => { holidayRemove(line(2026, '2026-08-10')) })
    type('hol-name', 'Other'); fireEvent.click(t('hol-save'))
    expect(t('hol-err').textContent).toBe('That holiday is no longer there — it was changed on the Leave War.')
    expect(t('win-holiday')).toBeTruthy()
  })
})

describe('one side window at a time', () => {
  it('"+ Add" takes the place of "Every Thursday", and a weekday’s heading takes the place of the holiday form', () => {
    open()
    fireEvent.click(t('days-wd-3')); expect(t('win-every')).toBeTruthy()
    add()
    expect(q('win-every')).toBeNull(); expect(t('win-holiday')).toBeTruthy()
    fireEvent.click(t('days-wd-3'))
    expect(q('win-holiday')).toBeNull(); expect(t('win-every')).toBeTruthy()
    expect(within(t('win-days')).getByTestId('days-wd-3').getAttribute('aria-expanded')).toBe('true')
  })
})
