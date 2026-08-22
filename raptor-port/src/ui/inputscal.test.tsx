// @vitest-environment jsdom
/* The Inputs page's month-calendar view (ui/InputsCal.tsx) — the toggle, the
   grid shape, and the chips it draws. The day popover, hold-to-add and drag
   are later tasks and carry no assertions here; this file only pins the
   shell, the view-state round trip, and the DISPLAY contract (the data
   attributes those later tasks will hook). */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { INPUTS, inpId } from '../engine/inputs'
import { INPVIEW, CALMONTH, setCalMonth } from '../state/view'
import { DAYRMK } from '../state/plan'
import { PEOPLE } from '../engine/people'
import { monthCells, MAX_CHIPS } from './InputsCal'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const setSelect = async (sel: string, v: string) => act(async () => {
  const el = $(sel) as unknown as HTMLSelectElement
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')!.set!
  setter.call(el, v)
  el.dispatchEvent(new Event('change', { bubbles: true }))
})
/* jump the open calendar straight to the seeded demo week's month, rather
   than clicking ‹/› however many times it takes to get there from whatever
   month the seed-from-range effect landed on */
const goJul2026 = async () => act(async () => { setCalMonth({ y: 2026, m: 7 }); notify() })

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'inputs')!)
})

describe('monthCells (pure)', () => {
  it('a full grid is a multiple of 7, and the month\'s own days sit inside it', () => {
    const cells = monthCells(2026, 7)
    expect(cells.length % 7).toBe(0)
    expect(cells.find(c => c != null)).toBe('2026-07-01')
    expect(cells).toContain('2026-07-31')
  })

  it('July 2026 opens on a Wednesday, so the grid carries exactly 2 leading blanks', () => {
    const cells = monthCells(2026, 7)
    expect(cells[0]).toBeNull()
    expect(cells[1]).toBeNull()
    expect(cells[2]).toBe('2026-07-01')
  })
})

describe('the Inputs page calendar toggle', () => {
  it('#inCalBtn sits in the filter bar and opens the overlay; #icClose closes it', async () => {
    expect($('#inCalBtn'), 'the toggle button exists').toBeTruthy()
    expect($('#inCalBtn')!.closest('.infilter'), 'it lives in the filter bar').toBeTruthy()
    expect($('#inpCal'), 'closed to start with').toBeFalsy()

    await click($('#inCalBtn'))
    expect($('#inpCal'), 'opens on a click').toBeTruthy()
    expect(INPVIEW).toBe('cal')

    await click($('#icClose'))
    expect($('#inpCal'), 'closes on ✕ List').toBeFalsy()
    expect(INPVIEW).toBe('table')
  })

  it('reopens on the seeded demo week once the calendar is stepped there', async () => {
    await click($('#inCalBtn'))
    await goJul2026()
    expect($('.ic-mon')!.textContent).toBe('July 2026')
    expect(CALMONTH).toEqual({ y: 2026, m: 7 })
  })
})

describe('chips (seeded demo data)', () => {
  /* divot's OML (a medical leave, Jul 13, all day) — an unavailable type,
     so inputTone reads it red */
  it('a leave/medical input chips red', () => {
    const cell = $('[data-icday="2026-07-13"]')!
    expect(cell.querySelector('.ic-chip.red'), cell.textContent || '').toBeTruthy()
  })

  /* bane's Appointment (Jul 16, timed 17:00–18:30) — a Duty & other
     commitments type, amber */
  it('an activity/appointment input chips amber', () => {
    const cell = $('[data-icday="2026-07-16"]')!
    expect(cell.querySelector('.ic-chip.amb'), cell.textContent || '').toBeTruthy()
  })

  /* every day the seeded SANS records land on also carries two overlapping
     multi-day leave/medical spans (sufa's ATT C, Jul 13-17; pike's OD,
     Jul 15-17), so red always fills MAX_CHIPS before tone order ever reaches
     san. Filtering to the type itself is what a scheduler would actually do
     to see the SANS picture, and it is what isolates the tone here too. */
  it('a SANS Availability record chips purple', async () => {
    await setSelect('#inFType', 'SANS Availability')
    try {
      const cell = $('[data-icday="2026-07-13"]')!
      expect(cell.querySelector('.ic-chip.san'), cell.textContent || '').toBeTruthy()
    } finally {
      await setSelect('#inFType', 'all')
    }
  })

  it('a spanning input (endDate) chips on every day it covers', async () => {
    const rec: any = { person: 'yeti', date: 'Jul 20', endDate: 'Jul 22', allday: true, type: 'OL', remarks: '', mod: 'now' }
    await act(async () => { INPUTS.unshift(rec); inpId(rec); notify() })
    try {
      for (const d of ['2026-07-20', '2026-07-21', '2026-07-22']) {
        const cell = $(`[data-icday="${d}"]`)!
        expect(cell.querySelector(`[data-iid="${rec.iid}"]`), d).toBeTruthy()
      }
      /* the day just before the span carries nothing of this row's */
      expect($('[data-icday="2026-07-19"]')!.querySelector(`[data-iid="${rec.iid}"]`)).toBeFalsy()
    } finally {
      await act(async () => { INPUTS.splice(INPUTS.indexOf(rec), 1); notify() })
    }
  })

  it('more than MAX_CHIPS on one day shows exactly MAX_CHIPS chips plus a +N more', async () => {
    const day = 'Jul 25'
    const extras: any[] = []
    for (let i = 0; i < MAX_CHIPS + 2; i++) {
      const rec = { person: 'yeti', date: day, allday: true, type: 'Training', remarks: '', mod: 'now' }
      extras.push(rec)
    }
    await act(async () => { extras.forEach(r => { INPUTS.unshift(r); inpId(r) }); notify() })
    try {
      const cell = $('[data-icday="2026-07-25"]')!
      const chipsHere = [...cell.querySelectorAll('.ic-chip')]
      expect(chipsHere.length).toBe(MAX_CHIPS)
      const more = cell.querySelector('[data-icmore]')
      expect(more, 'a +N more button appears').toBeTruthy()
      expect(more!.textContent).toBe(`+${extras.length - MAX_CHIPS} more`)
    } finally {
      await act(async () => { extras.forEach(r => { const ix = INPUTS.indexOf(r); if (ix >= 0) INPUTS.splice(ix, 1) }); notify() })
    }
  })

  it('a day remark shows as .ic-rmk (display only)', async () => {
    await act(async () => { DAYRMK['2026-07-14'] = 'CO visiting — keep it tidy'; notify() })
    try {
      const rmk = $('[data-icday="2026-07-14"] .ic-rmk')
      expect(rmk, 'the remark line appears').toBeTruthy()
      expect(rmk!.getAttribute('title')).toBe('CO visiting — keep it tidy')
    } finally {
      await act(async () => { delete DAYRMK['2026-07-14']; notify() })
    }
  })
})

describe('filtering the calendar', () => {
  it('filtering by person hides other people\'s chips and shows the filter pill', async () => {
    await setSelect('#inFPerson', 'bane')
    try {
      expect($('.ic-filterpill')!.textContent).toContain('Ranger') // bane's callsign
      /* bane's own Appointment on Jul 16 still shows */
      expect($('[data-icday="2026-07-16"]')!.querySelector('.ic-chip.amb'), 'bane\'s own input stays').toBeTruthy()
      /* divot's leave on Jul 13 belongs to someone else and drops out */
      expect($('[data-icday="2026-07-13"]')!.querySelector('.ic-chip.red'), 'another person\'s input is filtered out').toBeFalsy()
    } finally {
      await setSelect('#inFPerson', 'all')
      expect($('.ic-filterpill'), 'the pill goes with the last active filter').toBeFalsy()
    }
  })
})
