// @vitest-environment jsdom
/* The Inputs page's month-calendar view (ui/InputsCal.tsx) — the toggle, the
   grid shape, and the chips it draws. The day popover, hold-to-add and drag
   are later tasks and carry no assertions here; this file only pins the
   shell, the view-state round trip, and the DISPLAY contract (the data
   attributes those later tasks will hook). */
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, undo, writeInputs } from '../state/store'
import { INPUTS, inpId, defaultAllday } from '../engine/inputs'
import { INPVIEW, CALMONTH, setCalMonth } from '../state/view'
import { DAYRMK, PLANPUCKS, addPlanPuck, removePlanPuck } from '../state/plan'
import { ME } from '../state/auth'
import { PEOPLE, QORDER } from '../engine/people'
import { fmt, fmtDay, firstPersonalType } from './inputedit'
import { INPEDIT, setInpEdit } from './pops'
import { monthCells, MAX_CHIPS, HOLD_ADD } from './InputsCal'

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
/* a REAL PointerEvent — jsdom 30 (this repo's version, verified in
   caldrag.test.tsx) constructs one with clientX/clientY/pointerId round-
   tripping, so both caldrag.ts's own machine and InputsCal.tsx's own
   hold-to-add gesture (both native pointer listeners on the grid) see a
   genuine event, not a stand-in. */
const ptr = (type: string, x: number, y: number, id = 1) =>
  new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: id, pointerType: 'touch', isPrimary: true })
/* a React-controlled text input needs the native value setter, or React's
   own change-detection swallows a same-string re-set — the same trick every
   other *.test.tsx in this app uses. */
const typeInto = async (el: Element, value: string) => act(async () => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
  setter.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
})
/* React delegates onBlur off the bubbling focusout event, not bare blur —
   DutyTplModal.test.tsx's own idiom. */
const focusOut = async (el: Element) => act(async () => { el.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
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
  it('#inCalBtn leads the title row as a prominent switch and opens the overlay; #icClose closes it', async () => {
    expect($('#inCalBtn'), 'the toggle button exists').toBeTruthy()
    /* lifted into the title row and accent-styled (owner, 22 Aug 26 — "make
       the calendar button more obvious"); it is no longer the plain grey
       button in the filter bar */
    expect($('#inCalBtn')!.closest('.title'), 'it leads the title row now').toBeTruthy()
    expect($('#inCalBtn')!.classList.contains('calview'), 'and wears the prominent style').toBe(true)
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

  /* the header buttons must repaint what they change — setCalMonth is a bare
     module-let write, so each button has to notify() itself. This clicks the
     REAL buttons, because the helper above (setCalMonth + notify by hand) is
     exactly how the missing notify slipped past the suite and had to be
     caught on the live view instead. */
  it('the ‹ › and Today buttons actually move the visible month', async () => {
    expect($('.ic-mon')!.textContent).toBe('July 2026')
    await click($('#icPrev'))
    expect($('.ic-mon')!.textContent).toBe('June 2026')
    await click($('#icNext'))
    await click($('#icNext'))
    expect($('.ic-mon')!.textContent).toBe('August 2026')
    /* a real clock sits under Today, so pin the shape rather than the name:
       whatever month it is, the title repaints to it and CALMONTH agrees */
    await click($('#icToday'))
    const now = new Date()
    expect(CALMONTH).toEqual({ y: now.getFullYear(), m: now.getMonth() + 1 })
    expect($('.ic-mon')!.textContent).toContain(String(now.getFullYear()))
    await goJul2026()                    // back where the chip tests expect
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

/* ---------------------------------------------------------------------------
   THE DAY POPOVER, HOLD-TO-ADD, AND THE GESTURE WIRING — every one of these
   drives a REAL event on the rendered element and reads the resulting DOM
   back, never the model alone (a bug already got past this session once by
   driving state instead of the control). The calendar stays open at July
   2026 from the describes above; these use empty days (no seeded record
   touches Jul 6/8/9/11/18/27) so each test's fixture is its own. */
describe('the day popover — tap an empty cell, close it two ways', () => {
  it('a quick tap opens .ic-pop for that day; ✕ closes it; the backdrop closes it too', async () => {
    const cell = $('[data-icday="2026-07-06"]')!
    await act(async () => { cell.dispatchEvent(ptr('pointerdown', 40, 40)) })
    await act(async () => { cell.dispatchEvent(ptr('pointerup', 40, 40)) })
    expect($('.ic-pop'), 'the popover opens on a tap').toBeTruthy()
    expect($('.ic-pop-head b')!.textContent).toBe(fmtDay('2026-07-06'))

    await click($('#icPopClose'))
    expect($('.ic-pop'), 'closes on the ✕').toBeFalsy()

    await act(async () => { cell.dispatchEvent(ptr('pointerdown', 40, 40)) })
    await act(async () => { cell.dispatchEvent(ptr('pointerup', 40, 40)) })
    expect($('.ic-pop')).toBeTruthy()
    await act(async () => { $('.ic-popwrap')!.dispatchEvent(ptr('pointerdown', 5, 5)) })
    expect($('.ic-pop'), 'closes on a backdrop pointerdown').toBeFalsy()
  })
})

describe('hold-to-add on an empty cell', () => {
  it(`holding ${HOLD_ADD}ms seeds a new personal input for ME, without also opening the popover`, async () => {
    vi.useFakeTimers()
    try {
      const cell = $('[data-icday="2026-07-08"]')!
      await act(async () => { cell.dispatchEvent(ptr('pointerdown', 30, 30)) })
      await act(async () => { vi.advanceTimersByTime(HOLD_ADD) })
      await act(async () => { cell.dispatchEvent(ptr('pointerup', 30, 30)) })

      expect(INPEDIT, 'the add-input dialog seeded').toBeTruthy()
      expect(INPEDIT._new).toBe(true)
      expect(INPEDIT.date).toBe(fmt('2026-07-08'))
      expect(INPEDIT.person).toBe(ME)
      expect(INPEDIT.allday).toBe(defaultAllday(firstPersonalType()))
      expect($('.ic-pop'), 'the fired hold suppressed the tap-to-open popover').toBeFalsy()
    } finally {
      vi.useRealTimers()
      await act(async () => { setInpEdit(null); notify() })
    }
  })

  it('releasing before the hold fires, with no meaningful movement, opens the popover instead', async () => {
    vi.useFakeTimers()
    try {
      const cell = $('[data-icday="2026-07-08"]')!
      await act(async () => { cell.dispatchEvent(ptr('pointerdown', 30, 30)) })
      await act(async () => { vi.advanceTimersByTime(HOLD_ADD - 50) }) // short of the hold
      await act(async () => { cell.dispatchEvent(ptr('pointerup', 30, 30)) })

      expect(INPEDIT, 'no add-dialog for an early release').toBeFalsy()
      expect($('.ic-pop'), 'a tap opens the popover instead').toBeTruthy()
      await click($('#icPopClose'))
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('.ic-more opens the popover listing every entry, not just MAX_CHIPS', () => {
  it('lists all of a day\'s entries beyond the chip cutoff', async () => {
    const extras: any[] = []
    for (let i = 0; i < MAX_CHIPS + 2; i++) {
      extras.push({ person: 'yeti', date: 'Jul 27', allday: true, type: 'Training', remarks: '', mod: 'now' })
    }
    await act(async () => { extras.forEach(r => { INPUTS.unshift(r); inpId(r) }); notify() })
    try {
      const more = $('[data-icday="2026-07-27"] [data-icmore]')!
      await click(more)
      expect($('.ic-pop')).toBeTruthy()
      expect($$('.ic-poprow').length, 'every entry, not the MAX_CHIPS cutoff').toBe(extras.length)
      await click($('#icPopClose'))
    } finally {
      await act(async () => { extras.forEach(r => { const ix = INPUTS.indexOf(r); if (ix >= 0) INPUTS.splice(ix, 1) }); notify() })
    }
  })
})

describe('a popover entry row shows its remark on an aligned second line', () => {
  it('a remark renders as .ic-poprow-rmk under the identity line; a blank one draws none', async () => {
    const withRmk: any = { person: 'yeti', date: 'Jul 24', allday: true, type: 'Training', remarks: 'brief the new guy', mod: 'now' }
    const noRmk: any = { person: 'yeti', date: 'Jul 24', allday: true, type: 'OL', remarks: '', mod: 'now' }
    await act(async () => { [withRmk, noRmk].forEach(r => { INPUTS.unshift(r); inpId(r) }); notify() })
    try {
      /* two entries is under the chip cutoff, so there is no "+N more" to
         click — tap the cell's empty space to open the popover, the same
         gesture the empty-cell test uses */
      const cell = $('[data-icday="2026-07-24"]')!
      await act(async () => { cell.dispatchEvent(ptr('pointerdown', 40, 40)) })
      await act(async () => { cell.dispatchEvent(ptr('pointerup', 40, 40)) })
      expect($('.ic-pop')).toBeTruthy()
      const row = $(`[data-popiid="${withRmk.iid}"]`)!
      const rmk = row.querySelector('.ic-poprow-rmk')
      expect(rmk, 'the remark line renders').toBeTruthy()
      expect(rmk!.textContent).toBe('brief the new guy')
      /* the identity line still carries who + type, unchanged */
      expect(row.querySelector('.ic-poprow-top .ic-poprow-who')!.textContent).toBe(PEOPLE.yeti.cs)
      /* a remark-less row draws no remark line at all — it stays one tidy line */
      expect($(`[data-popiid="${noRmk.iid}"]`)!.querySelector('.ic-poprow-rmk'), 'no empty remark line').toBeFalsy()
      await click($('#icPopClose'))
    } finally {
      await act(async () => { [withRmk, noRmk].forEach(r => { const ix = INPUTS.indexOf(r); if (ix >= 0) INPUTS.splice(ix, 1) }); notify() })
    }
  })
})

describe('a horizontal swipe pages the month', () => {
  /* down on a cell (bubbles to the grid), release on window at an offset —
     the gesture reads the total travel on release. A cell that always exists
     whatever month is showing, so the same helper works after a page. */
  const swipe = async (dx: number, dy = 0) => {
    const cell = $('[data-icday]')!
    await act(async () => {
      cell.dispatchEvent(ptr('pointerdown', 200, 300))
      window.dispatchEvent(ptr('pointerup', 200 + dx, 300 + dy))
    })
  }
  it('swipe left → next month, swipe right → previous; vertical or short drags do not page', async () => {
    await goJul2026()
    expect($('.ic-mon')!.textContent).toContain('July 2026')
    await swipe(-80)                                   // left → next
    expect(CALMONTH).toEqual({ y: 2026, m: 8 })
    expect($('.ic-mon')!.textContent).toContain('August 2026')
    await swipe(80)                                    // right → previous
    expect(CALMONTH).toEqual({ y: 2026, m: 7 })
    await swipe(40, 130)                               // mostly vertical — a scroll, not a page
    expect(CALMONTH, 'a vertical drag never pages').toEqual({ y: 2026, m: 7 })
    await swipe(-40)                                   // under SWIPE_MIN — neither a page nor a tap
    expect(CALMONTH, 'a short drag never pages').toEqual({ y: 2026, m: 7 })
    expect($('.ic-pop'), 'and a short drag did not open the popover either').toBeFalsy()
    await goJul2026()
  })
  it('pages across a year boundary and back', async () => {
    await act(async () => { setCalMonth({ y: 2026, m: 12 }); notify() })
    await swipe(-80)
    expect(CALMONTH, 'December → next is January of the next year').toEqual({ y: 2027, m: 1 })
    await swipe(80)
    expect(CALMONTH, 'January → previous is December of the year before').toEqual({ y: 2026, m: 12 })
    await goJul2026()
  })
})

describe('a popover entry row opens the same edit route as a chip', () => {
  it('tapping a row sets INPEDIT to that EXACT record (object identity, not a re-lookup)', async () => {
    const rec: any = INPUTS.find((r: any) => r.person === 'divot' && r.type === 'OML')
    expect(rec, 'the seeded OML record exists').toBeTruthy()
    /* a cell TAP is the popover's front door (the +N more button only exists
       past MAX_CHIPS, which the redesigned side-by-side cell rarely hits) */
    const cell = $('[data-icday="2026-07-13"]')!
    await act(async () => { cell.dispatchEvent(ptr('pointerdown', 10, 10)) })
    await act(async () => { cell.dispatchEvent(ptr('pointerup', 10, 10)) })
    const row = $(`[data-popiid="${rec.iid}"]`)!
    expect(row, 'the row renders').toBeTruthy()
    await click(row)
    expect(INPEDIT).toBe(rec)
    expect($('.ic-pop'), 'the popover stays open under the modal').toBeTruthy()
    await act(async () => { setInpEdit(null); notify() })
    await click($('#icPopClose'))
  })
})

describe('the day popover — scheduler day remark', () => {
  it('typing #icRmkEdit and blurring commits it to DAYRMK and repaints the cell\'s .ic-rmk; undo reverts it', async () => {
    const iso = '2026-07-09'
    const cell = $(`[data-icday="${iso}"]`)!
    await act(async () => { cell.dispatchEvent(ptr('pointerdown', 10, 10)) })
    await act(async () => { cell.dispatchEvent(ptr('pointerup', 10, 10)) })
    expect($('.ic-pop')).toBeTruthy()

    const input = $('#icRmkEdit') as HTMLInputElement
    expect(input, 'a scheduler sees the editable remark field').toBeTruthy()
    await typeInto(input, 'CO visiting')
    await focusOut(input)

    expect(DAYRMK[iso]).toBe('CO visiting')
    expect(cell.querySelector('.ic-rmk')!.textContent).toBe('CO visiting')

    await act(async () => { undo() })
    expect(DAYRMK[iso]).toBeUndefined()

    await click($('#icPopClose'))
  })
})

describe('the day popover — planning notes (pucks)', () => {
  it('+ Note adds one (Enter commits) shown as a .plan chip; ✏ edits, ✕ removes; undo walks it all back', async () => {
    const iso = '2026-07-11'
    const cell = $(`[data-icday="${iso}"]`)!
    await act(async () => { cell.dispatchEvent(ptr('pointerdown', 10, 10)) })
    await act(async () => { cell.dispatchEvent(ptr('pointerup', 10, 10)) })
    expect($('.ic-pop')).toBeTruthy()

    await click($('#icAddPuck'))
    const addInput = $('.ic-poppuck-edit') as HTMLInputElement
    expect(addInput, 'the new-note box opened').toBeTruthy()
    await typeInto(addInput, 'brief the new guy')
    await act(async () => { addInput.focus(); addInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })) })

    expect(PLANPUCKS.some((p: any) => p.date === iso && p.text === 'brief the new guy'), 'Enter committed the note').toBe(true)
    expect(cell.querySelector('.ic-chip.plan'), 'the day shows a plan chip').toBeTruthy()

    const pid = PLANPUCKS.find((p: any) => p.date === iso)!.id

    await click($(`[data-ppedit="${pid}"]`))
    const editInput = $('.ic-poppuck-edit') as HTMLInputElement
    await typeInto(editInput, 'brief the new guy at 0800')
    await focusOut(editInput)
    expect(PLANPUCKS.find((p: any) => p.id === pid)!.text).toBe('brief the new guy at 0800')

    await click($(`[data-ppdel="${pid}"]`))
    expect(PLANPUCKS.find((p: any) => p.id === pid)).toBeUndefined()

    await act(async () => { undo() }) // back over the delete
    expect(PLANPUCKS.find((p: any) => p.id === pid)).toBeTruthy()
    await act(async () => { undo() }) // back over the edit
    expect(PLANPUCKS.find((p: any) => p.id === pid)!.text).toBe('brief the new guy')
    await act(async () => { undo() }) // back over the add
    expect(PLANPUCKS.find((p: any) => p.id === pid)).toBeUndefined()

    await click($('#icPopClose'))
  })
})

describe('a puck chip tap opens the popover with that note already in edit mode', () => {
  it('caldrag routes a puck tap to onTap, which pre-opens its inline edit box', async () => {
    const iso = '2026-07-18'
    let added = false
    await act(async () => { writeInputs(() => { added = addPlanPuck(iso, 'check quals') }) })
    expect(added).toBe(true)
    const pid = PLANPUCKS.find((p: any) => p.date === iso)!.id
    try {
      const chip = $(`[data-icday="${iso}"] [data-icdrag][data-pid="${pid}"]`)!
      expect(chip, 'the plan chip renders').toBeTruthy()
      await act(async () => { chip.dispatchEvent(ptr('pointerdown', 5, 5)) })
      await act(async () => { chip.dispatchEvent(ptr('pointerup', 5, 5)) })

      expect($('.ic-pop'), 'the popover opened').toBeTruthy()
      expect($('.ic-pop-head b')!.textContent).toBe(fmtDay(iso))
      const editBox = $('.ic-poppuck-edit') as HTMLInputElement
      expect(editBox, 'the note is already switched into its inline edit box').toBeTruthy()
      expect(editBox.value).toBe('check quals')
      await click($('#icPopClose'))
    } finally {
      await act(async () => { writeInputs(() => { removePlanPuck(pid) }) })
    }
  })
})

describe('caldrag chip-tap wiring, driven on the real grid', () => {
  it('a real pointerdown+pointerup on an input chip sets INPEDIT to that EXACT record', async () => {
    const rec: any = INPUTS.find((r: any) => r.person === 'bane' && r.type === 'Appointment' && r.date === 'Jul 16')
    expect(rec, 'the seeded Appointment record exists').toBeTruthy()
    const chip = $(`[data-icday="2026-07-16"] [data-icdrag][data-iid="${rec.iid}"]`)!
    expect(chip, 'the chip renders').toBeTruthy()
    await act(async () => { chip.dispatchEvent(ptr('pointerdown', 5, 5)) })
    await act(async () => { chip.dispatchEvent(ptr('pointerup', 5, 5)) })
    expect(INPEDIT).toBe(rec)
    await act(async () => { setInpEdit(null); notify() })
  })
})

describe('the 22 Aug 26 cell redesign — title, sections, side-by-side inputs', () => {
  it('a SANS chip reads its F/O/A letters, never the words', async () => {
    /* the seeded records carry sans flags (state/demoseed.ts) — find one on
       its cell and read the chip the calendar drew for it */
    const rec: any = INPUTS.find((r: any) => r.type === 'SANS Availability' && r.sans)
    expect(rec, 'a seeded SANS record exists').toBeTruthy()
    await setSelect('#inFType', 'SANS Availability')
    try {
      const chip = host.querySelector(`[data-iid="${rec.iid}"]`)!
      expect(chip, 'its chip renders').toBeTruthy()
      expect(chip.textContent).not.toContain('SANS')
      expect(chip.textContent).not.toContain('Availability')
      expect(chip.textContent).toMatch(/[FOA](\/[FOA])*/)
    } finally {
      await setSelect('#inFType', 'all')
    }
  })

  /* the multi-select puck picker (owner, 23 Aug 26; reworked 24 Aug 26 — a
     category "just … fade those pucks so that I know which puck is applicable.
     Not select them", pucks grouped by seat like the palette). */
  it('+ Pucks opens the picker; a category FADES the rest without selecting; tapping pucks selects; OK adds them; right-click and ✕ remove', async () => {
    const iso = '2026-07-09'
    const cell = $(`[data-icday="${iso}"]`)!
    await act(async () => { cell.dispatchEvent(ptr('pointerdown', 10, 10)) })
    await act(async () => { cell.dispatchEvent(ptr('pointerup', 10, 10)) })
    expect($('.ic-pop')).toBeTruthy()

    await click($('#icAddPucks'))
    expect($('.ic-pick'), 'the picker opened instead of making an empty row').toBeTruthy()
    expect(PLANPUCKS.find((p: any) => p.kind === 'pucks' && p.date === iso), 'no row until OK').toBeFalsy()
    /* the roster is grouped by seat, the way the palette lays it out */
    expect($('.ic-pick-body .ic-pick-grp'), 'pucks are grouped by seat').toBeTruthy()
    let sec: any
    try {
      /* a category chip HIGHLIGHTS by fading the rest — it selects NOTHING */
      const catA = $('.ic-pick-cats [data-pickcat="A"]')!
      await click(catA)
      expect(catA.className, 'the chip reads on (highlight is live)').toContain('on')
      expect(host.querySelectorAll('.ic-pickp.on').length, 'highlighting never selects a puck').toBe(0)
      expect(host.querySelectorAll('.ic-pickp.dim').length, 'non-matching pucks faded').toBeGreaterThan(0)
      expect(host.querySelectorAll('.ic-pickp:not(.dim):not(.already)').length, 'matching pucks stay bright').toBeGreaterThan(0)
      /* pick two people by hand — a tap selects, faded or not */
      const pickTwo = [...host.querySelectorAll('.ic-pickp:not(.already)')].slice(0, 2) as HTMLElement[]
      const pickedIds = pickTwo.map(b => b.getAttribute('data-pickp')!)
      for (const b of pickTwo) await click(b)
      expect(host.querySelectorAll('.ic-pickp.on').length).toBe(2)
      expect(($('#icPickOk') as HTMLButtonElement).textContent).toContain('2')
      /* OK creates ONE new pucks row carrying the two picks */
      await click($('#icPickOk'))
      expect($('.ic-pick'), 'the picker closed on OK').toBeFalsy()
      sec = PLANPUCKS.find((p: any) => p.kind === 'pucks' && p.date === iso)
      expect(sec, 'a pucks row was created').toBeTruthy()
      expect(sec.ids.length).toBe(2)
      expect(sec.ids, 'the hand-picked people are on it').toEqual(expect.arrayContaining(pickedIds))
      expect($(`[data-secpucks="${sec.id}"] .puck`), 'the row draws real pucks').toBeTruthy()
      expect(cell.querySelector('.ic-pks .ic-pk'), 'the cell carries the tiny chip').toBeTruthy()
      /* the per-puck ✕ is gone now (owner, 24 Aug 26 — removal is drag-off or
         right-click); no seated puck carries a delete button anymore */
      expect($(`[data-secpucks="${sec.id}"] [data-pkdel]`), 'no per-puck ✕').toBeFalsy()
      /* RIGHT-CLICK a seated puck removes it, leaving a GAP so the rest don't
         shift — the blanked slot stays in place */
      const chip = $(`[data-secpucks="${sec.id}"]`)!.querySelector('.ic-secpk:not(.ic-secpk-gap)') as HTMLElement
      await act(async () => { chip.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true })) })
      expect(sec.ids.filter(Boolean).length, 'right-click dropped one puck').toBe(1)
      expect(sec.ids[0], 'the removed slot is blanked, not closed').toBe('')
      expect($(`[data-secpucks="${sec.id}"] .ic-secpk-gap`), 'a gap cell holds the position').toBeTruthy()
    } finally {
      sec = PLANPUCKS.find((p: any) => p.kind === 'pucks' && p.date === iso)
      if (sec) await act(async () => { removePlanPuck(sec.id); notify() })
      if ($('#icPopClose')) await click($('#icPopClose'))
    }
  })

  /* the picker's within-group order and the SANS seat split (owner, 24 Aug 26 —
     "arrange sans into pilot then wso … arranged in the cat hierarchy order.
     Like FI then IR then IP etc for pilot"). */
  it('picker: SANS splits into Pilots then WSOs, and every group reads in CAT-ladder order (highest first)', async () => {
    const iso = '2026-07-09'
    const cell = $(`[data-icday="${iso}"]`)!
    await act(async () => { cell.dispatchEvent(ptr('pointerdown', 10, 10)) })
    await act(async () => { cell.dispatchEvent(ptr('pointerup', 10, 10)) })
    await click($('#icAddPucks'))
    expect($('.ic-pick'), 'the picker opened').toBeTruthy()
    try {
      const grp = (label: string) => $$('.ic-pick-body .ic-pick-grp')
        .find(g => (g.querySelector('.ic-pick-gh')?.firstChild?.textContent || '') === label)
      const idsIn = (label: string) => {
        const g = grp(label); expect(g, `group "${label}" present`).toBeTruthy()
        return [...g!.querySelectorAll('.ic-pickp')].map(b => b.getAttribute('data-pickp')!)
      }
      /* SANS is split, pilots before WSOs */
      const heads = $$('.ic-pick-body .ic-pick-gh').map(h => h.firstChild?.textContent || '')
      const iPil = heads.indexOf('SANS · Pilots'), iWso = heads.indexOf('SANS · WSOs')
      expect(iPil, 'SANS · Pilots header present').toBeGreaterThanOrEqual(0)
      expect(iWso, 'SANS · WSOs comes after SANS · Pilots').toBeGreaterThan(iPil)
      /* SANS pilots are all front-seat, SANS WSOs all not */
      expect(idsIn('SANS · Pilots').every(id => PEOPLE[id].seat === 'FCP'), 'SANS pilots are FCP').toBe(true)
      expect(idsIn('SANS · WSOs').every(id => PEOPLE[id].seat !== 'FCP'), 'SANS WSOs are not FCP').toBe(true)
      /* every seat group reads highest CAT first (QORDER non-increasing) */
      const ladderOK = (label: string) => {
        const ranks = idsIn(label).map(id => QORDER[PEOPLE[id].q] ?? -1)
        return ranks.every((r, i) => i === 0 || ranks[i - 1] >= r)
      }
      for (const label of ['Pilots', 'WSOs', 'SANS · Pilots', 'SANS · WSOs']) {
        expect(ladderOK(label), `${label} in CAT-ladder order`).toBe(true)
      }
    } finally {
      if ($('#icPickCancel')) await click($('#icPickCancel'))
      if ($('#icPopClose')) await click($('#icPopClose'))
    }
  })

  it('the popover orders sections above the inputs block, + Input leading it', async () => {
    const iso = '2026-07-13'
    await act(async () => { addPlanPuck(iso, 'note first'); notify() })
    const cell = $(`[data-icday="${iso}"]`)!
    await act(async () => { cell.dispatchEvent(ptr('pointerdown', 10, 10)) })
    await act(async () => { cell.dispatchEvent(ptr('pointerup', 10, 10)) })
    try {
      const body = $('.ic-pop-body')!
      const secs = body.querySelector('.ic-secs')!
      const inpSec = body.querySelector('.ic-inp-sec')!
      expect(secs, 'sections render').toBeTruthy()
      expect(inpSec, 'the inputs block renders').toBeTruthy()
      expect(secs.compareDocumentPosition(inpSec) & Node.DOCUMENT_POSITION_FOLLOWING,
        'sections sit ABOVE the inputs block').toBeTruthy()
      /* + Input is the block's own first control, top-left */
      expect(inpSec.firstElementChild!.id).toBe('icPopAdd')
      /* the admin section buttons lead the body */
      expect(body.firstElementChild!.classList.contains('ic-secbtns')).toBe(true)
    } finally {
      const note: any = PLANPUCKS.find((p: any) => p.text === 'note first')
      await act(async () => { if (note) removePlanPuck(note.id); notify() })
      await click($('#icPopClose'))
    }
  })

  it('the day title renders in the popover head beside the date', async () => {
    const iso = '2026-07-10'
    const cell = $(`[data-icday="${iso}"]`)!
    await act(async () => { cell.dispatchEvent(ptr('pointerdown', 10, 10)) })
    await act(async () => { cell.dispatchEvent(ptr('pointerup', 10, 10)) })
    try {
      const head = $('.ic-pop-head')!
      expect(head.querySelector('#icRmkEdit'), 'the title input lives in the head').toBeTruthy()
    } finally {
      await click($('#icPopClose'))
    }
  })
})

describe('member session — reduced controls, same reach to add and to open a chip', () => {
  it('no remark editor, no +Note, but +Add input and the chip-edit route both stay', async () => {
    const iso = '2026-07-13' // divot's OML lives here, among several other entries
    const rec: any = INPUTS.find((r: any) => r.person === 'bane' && r.type === 'Appointment' && r.date === 'Jul 16')
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    try {
      /* the cell tap is the popover's front door — see the identity test above */
      const cell = $(`[data-icday="${iso}"]`)!
      await act(async () => { cell.dispatchEvent(ptr('pointerdown', 10, 10)) })
      await act(async () => { cell.dispatchEvent(ptr('pointerup', 10, 10)) })
      expect($('.ic-pop')).toBeTruthy()
      expect($('#icRmkEdit'), 'no title editor for a member').toBeFalsy()
      expect($('#icAddPuck'), 'no +Note for a member').toBeFalsy()
      expect($('#icAddPucks'), 'no +Pucks for a member').toBeFalsy()
      expect($('#icPopAdd'), '+Input stays available to everyone').toBeTruthy()
      await click($('#icPopClose'))

      const chip = $(`[data-icday="2026-07-16"] [data-icdrag][data-iid="${rec.iid}"]`)!
      await act(async () => { chip.dispatchEvent(ptr('pointerdown', 5, 5)) })
      await act(async () => { chip.dispatchEvent(ptr('pointerup', 5, 5)) })
      expect(INPEDIT, 'a chip tap still opens the modal for a member').toBe(rec)
      await act(async () => { setInpEdit(null); notify() })
    } finally {
      await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
    }
  })
})

describe('Esc layering: popover first, then the calendar', () => {
  it('the first Esc closes just the popover; the second closes the calendar', async () => {
    const cell = $('[data-icday="2026-07-06"]')!
    await act(async () => { cell.dispatchEvent(ptr('pointerdown', 10, 10)) })
    await act(async () => { cell.dispatchEvent(ptr('pointerup', 10, 10)) })
    expect($('.ic-pop')).toBeTruthy()

    await act(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
    expect($('.ic-pop'), 'first Esc closes just the popover').toBeFalsy()
    expect($('#inpCal'), 'the calendar itself is still open').toBeTruthy()

    await act(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
    expect($('#inpCal'), 'second Esc closes the calendar').toBeFalsy()
    expect(INPVIEW).toBe('table')
  })
})
