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
})

describe('"+ Add"', () => {
  it('opens a window beside Days that does not block it, starting on a public holiday today', () => {
    open(); add()
    expect(t('win-holiday').getAttribute('aria-label')).toBe('Add a holiday')
    expect(t('win-holiday').getAttribute('aria-modal')).toBe('false')
    expect(t('win-days')).toBeTruthy()
    expect(pressed('hol-kind-ph')).toBe('true'); expect(pressed('hol-kind-off')).toBe('false')
    expect(val('hol-name')).toBe(''); expect(val('hol-short')).toBe('')
    expect(val('hol-from')).toBe('2026-10-08'); expect(val('hol-to')).toBe('2026-10-08')
    expect(q('hol-delete')).toBeNull(); expect(t('hol-save-more')).toBeTruthy()
  })
  it('on another year’s list it starts on that year’s first day', () => {
    open(); fireEvent.click(t('hol-next')); add()
    expect(val('hol-from')).toBe('2027-01-01'); expect(val('hol-to')).toBe('2027-01-01')
  })
  it('the last day follows the first while they are one day, and never falls before it', () => {
    open(); add()
    type('hol-from', '2026-11-09'); expect(val('hol-to')).toBe('2026-11-09')
    type('hol-to', '2026-11-10')
    type('hol-from', '2026-11-08'); expect(val('hol-to')).toBe('2026-11-10')        // a run keeps its end
    type('hol-from', '2026-11-12'); expect(val('hol-to')).toBe('2026-11-12')        // … until the start passes it
  })
  it('Save writes ONE holiday in one Undo step, closes, and the list and the month follow', () => {
    open(); add()
    type('hol-name', 'Deepavali'); type('hol-from', '2026-11-09')
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
    type('hol-name', 'Stand-down'); type('hol-from', '2026-12-28'); type('hol-to', '2026-12-30')
    fireEvent.click(t('hol-save'))
    expect(line(2026, '2026-12-28')).toMatchObject({ kind: 'off', name: 'Stand-down', to: '2026-12-30' })
    expect(shown()).toContainEqual(['Mon 28 – Wed 30 Dec', 'Stand-down', 'OFF'])
  })
  it('no name typed: the box shows the kind’s usual word, and that is what is saved', () => {
    open(); add()
    const usual = t('hol-name').getAttribute('placeholder')!
    expect(usual.length).toBeGreaterThan(0)
    type('hol-from', '2026-11-09'); fireEvent.click(t('hol-save'))
    expect(line(2026, '2026-11-09').name).toBe(usual)
    cleanup(); _resetFloatWins(); setDaysWin(null)
    open(); add(); fireEvent.click(t('hol-kind-off'))
    const usualOff = t('hol-name').getAttribute('placeholder')!
    expect(usualOff).not.toBe(usual)
    type('hol-from', '2026-11-10'); fireEvent.click(t('hol-save'))
    expect(line(2026, '2026-11-10')).toMatchObject({ kind: 'off', name: usualOff })
  })
  it('"On grid" is its short form — capitals, three at most; one that is not a short form is refused with the rule', () => {
    open(); add()
    type('hol-name', 'National Day'); type('hol-from', '2026-08-10'); type('hol-short', 'nd')
    expect(val('hol-short')).toBe('ND')
    expect(t('hol-short').getAttribute('maxlength')).toBe('3')
    fireEvent.click(t('hol-save'))
    expect(line(2026, '2026-08-10').short).toBe('ND')
    add()
    type('hol-name', 'Other'); type('hol-from', '2026-08-11'); type('hol-short', 'a b')
    fireEvent.click(t('hol-save'))
    expect(t('hol-err').textContent).toBe('The short form is one to three letters or digits, with no space.')
    expect(lines(2026).some(h => h.from === '2026-08-11')).toBe(false); expect(t('win-holiday')).toBeTruthy()
  })
  it('"Save and add another" saves, says so, and stays — the kind kept, the next day ready, the name cleared', () => {
    open(); add()
    fireEvent.click(t('hol-kind-off'))
    type('hol-name', 'Stand-down'); type('hol-short', 'SD'); type('hol-from', '2026-12-28'); type('hol-to', '2026-12-30')
    fireEvent.click(t('hol-save-more'))
    expect(line(2026, '2026-12-28')).toMatchObject({ kind: 'off', to: '2026-12-30' })
    expect(t('win-holiday')).toBeTruthy()
    expect(t('hol-saved').textContent).toBe('Saved: Stand-down, Mon 28 – Wed 30 Dec.')
    expect(pressed('hol-kind-off')).toBe('true')
    expect(val('hol-name')).toBe(''); expect(val('hol-short')).toBe('')
    expect(val('hol-from')).toBe('2026-12-31'); expect(val('hol-to')).toBe('2026-12-31')
    /* the note goes at the next edit */
    type('hol-name', 'x'); expect(q('hol-saved')).toBeNull()
  })
  it('a date no leave period covers is refused in the window, and what he typed stays', () => {
    open(`${FREE}-03-01`); add()
    type('hol-name', 'National Day'); type('hol-from', `${FREE}-08-09`)
    fireEvent.click(t('hol-save'))
    expect(t('hol-err').textContent).toBe(`No leave period covers 9 Aug ${String(FREE).slice(2)} yet.`)
    expect(t('win-holiday')).toBeTruthy(); expect(val('hol-name')).toBe('National Day'); expect(val('hol-from')).toBe(`${FREE}-08-09`)
    /* any edit takes the line down */
    type('hol-name', 'National Day!'); expect(q('hol-err')).toBeNull()
  })
  it('a last day before the first, and no first day, are refused with a sentence', () => {
    open(); add()
    type('hol-from', '2026-11-09'); type('hol-to', '2026-11-01')
    fireEvent.click(t('hol-save'))
    expect(t('hol-err').textContent).toBe('The last day cannot be before the first.')
    type('hol-from', '')
    fireEvent.click(t('hol-save'))
    expect(t('hol-err').textContent).toBe('Choose its first day.')
    expect(lines(2026).some(h => h.from === '2026-11-09' || h.from === '2026-11-01')).toBe(false)
  })
  it('Cancel and ✕ close it and save nothing; closing Days takes it too', () => {
    open(); add()
    type('hol-name', 'Deepavali'); type('hol-from', '2026-11-09')
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
    expect(val('hol-from')).toBe('2026-08-10'); expect(val('hol-to')).toBe('2026-08-10')
    expect(t('hol-delete')).toBeTruthy(); expect(q('hol-save-more')).toBeNull()
  })
  it('Save changes that one record — a new name, a longer run — in one Undo step', () => {
    seed(); open(); openLine('2026-08-10')
    const n = lines(2026).length
    type('hol-name', 'National Day weekend'); type('hol-to', '2026-08-11')
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
    type('hol-to', '2026-08-11'); fireEvent.click(t('hol-save'))
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
