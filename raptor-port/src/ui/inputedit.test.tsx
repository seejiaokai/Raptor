// @vitest-environment jsdom
/* Editing an input from the schedule (owner, 10 Aug 26 — build two of the
   leave-types work). The commit itself is the Inputs page's, shared through
   ui/inputedit.tsx, so what these pin is the part that is NEW: which surfaces
   carry the control (an input's own type label), who may press it, and that
   the dialog writes the row it was opened on — one undo step, week
   re-validated, accepted rows relinked. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, undo, writeInputsBatch } from '../state/store'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { acceptInput, acceptedDay, inpKey } from '../engine/slots'
import { inpId } from '../engine/inputs'
import { INPEDIT, setInpEdit } from './pops'
import { HALF_AM } from './inputedit'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
/* React tracks an input's value on the node, so a plain assignment is
   swallowed — go through the prototype setter, as the Inputs page tests do */
const set = async (el: Element, value: string) => {
  const proto = el instanceof HTMLSelectElement ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')!.set!
  await act(async () => {
    setter.call(el, value)
    el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
  })
}
const page = async (p: string) => click($$('.nav a[data-page]').find(a => a.dataset.page === p)!)

/* Monday's own inputs. The seed's leave rows are the ones both blocks draw. */
const MON = 'Jul 13'
const monRows = () => INPUTS.filter((i: any) => i.date === MON)
/* a row's own label on the edit week, addressed by the content key it carries
   — two rows can print the same words, so the words are not an address */
const weekBtn = (inp: any) => $(`#eWeek .day[data-day="0"] [data-inpedit="${inpKey(inp)}"]`)

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await page('editsched')
})
beforeEach(async () => { if (INPEDIT) await act(async () => { setInpEdit(null); notify() }) })

describe('the control — which surfaces carry it, and who may press it', () => {
  it('every input row on the edit week carries one', () => {
    const rows = $$('#eWeek .day[data-day="0"] .sec-inp .pl-row, #eWeek .day[data-day="0"] .sec-unav .pl-row')
    expect(rows.length).toBeGreaterThan(0)
    rows.forEach(r => expect(r.querySelector('[data-inpedit]'),
      (r.querySelector('.ntx') as HTMLElement || {} as any).textContent || '').toBeTruthy())
  })

  it('View-only Sched draws the same Unavailable block with nothing to press', async () => {
    await page('viewsched')
    const rows = $$('#vWeek .day[data-day="0"] .sec-unav .pl-row')
    expect(rows.length).toBeGreaterThan(0)
    expect($$('#vWeek [data-inpedit]')).toHaveLength(0)
    await page('editsched')
  })

  it('a member gets no editable label, and is refused if one is clicked anyway', async () => {
    await act(async () => { setSession({ user: 'user', role: 'member' }); notify() })
    await page('viewsched')                       // a member cannot reach editsched's edit mode
    expect($$('[data-inpedit]')).toHaveLength(0)
    /* the gate is the HANDLER, not the missing markup — a stale button left
       by a repaint that raced the logout must not open it either */
    const btn = document.createElement('button')
    btn.dataset.inpedit = 'nobody|Jul 13|LL|'
    document.body.appendChild(btn)
    await click(btn)
    expect(INPEDIT).toBe(null)
    btn.remove()
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
    await page('editsched')
  })

  it('the board carries it on both input panels', async () => {
    await click($('#eWeek .day[data-day="0"] .dow.sb-open'))
    expect($$('#schedBoard .pinp [data-inpedit]').length).toBeGreaterThan(0)
    expect($$('#schedBoard .unav [data-inpedit]').length).toBeGreaterThan(0)
    await click($('#sbClose'))
  })
})

/* ---- typing in the cells (owner, 10 Aug 26 — "no need to open a new window")
   The commit is commitInputEdit's, already covered above, so these pin the
   part that is new: the address survives the list moving under it, blank
   times mean all day, and a refusal changes nothing. */
describe('an input edited in place', () => {
  /* the cells address an input by its own id, never by where it sits */
  const cell = (inp: any, f: string) => $(`#eWeek .day[data-day="0"] [data-inp="${inpId(inp)}.${f}"]`)
  /* rows are created the way the Inputs page creates them — inside the write,
     with an address already on them, so the snapshot the add pushes carries it */
  const plant = async (r: any) => {
    await act(async () => { writeInputsBatch(() => { inpId(r); INPUTS.unshift(r) }); notify() })
    return r
  }
  const type = async (el: Element, text: string) => {
    await act(async () => { (el as HTMLElement).textContent = text })
    await act(async () => { el.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
  }

  it('a start time on an all-day row makes it timed, to the end of the day', async () => {
    const inp: any = { person: 'pike', date: MON, allday: true, s: 0, e: 1439, type: 'LL', remarks: '', mod: 'now' }
    await plant(inp)
    expect(cell(inp, 'str').textContent).toBe('')          // all day shows nothing
    await type(cell(inp, 'str'), '0900')
    expect([inp.allday, inp.s, inp.e]).toEqual([false, 540, 1439])
  })

  /* clearing EITHER cell is the way back, and it has to be: with the
     symmetric "clear both" rule the first clear defaulted the other end to
     the edge of the day, so the pair was never blank at once and an all-day
     row was a one-way trip. */
  it('clearing a time puts it back to all day', async () => {
    for (const f of ['str', 'end']) {
      const inp: any = { person: 'pike', date: MON, allday: false, s: 540, e: 660, type: 'LL', remarks: '', mod: 'now' }
      await plant(inp)
      await type(cell(inp, f), '')
      expect(inp.allday, `cleared ${f}`).toBe(true)
    }
  })

  it('a window that lands exactly on a half gets the half label, and loses it again', async () => {
    const inp: any = { person: 'pike', date: MON, allday: true, s: 0, e: 1439, type: 'LL', remarks: '', mod: 'now' }
    await plant(inp)
    await type(cell(inp, 'str'), '0000')
    await type(cell(inp, 'end'), '1200')
    expect(inp.half).toBe('am')
    await type(cell(inp, 'end'), '1300')
    /* commitInputEdit DELETES the label rather than blanking it, so a record
       that is not a half carries no half at all */
    expect(inp.half).toBeUndefined()
  })

  it('an unreadable time and a backwards window are both refused, and the cell heals', async () => {
    const inp: any = { person: 'pike', date: MON, allday: false, s: 540, e: 660, type: 'LL', remarks: '', mod: 'now' }
    await plant(inp)
    await type(cell(inp, 'str'), 'lunchtime')
    expect([inp.s, inp.e]).toEqual([540, 660])
    expect(cell(inp, 'str').textContent).toBe('09:00')
    await type(cell(inp, 'end'), '0800')                   // before the start
    expect([inp.s, inp.e]).toEqual([540, 660])
    expect(cell(inp, 'end').textContent).toBe('11:00')
  })

  it('remarks commit, and one edit is one undo step', async () => {
    const inp: any = { person: 'pike', date: MON, allday: true, s: 0, e: 1439, type: 'LL', remarks: 'before', mod: 'now' }
    await plant(inp)
    await type(cell(inp, 'rmks'), 'after')
    expect(inp.remarks).toBe('after')
    await act(async () => { undo(); notify() })
    expect((INPUTS.find((r: any) => r.iid === inp.iid) || {}).remarks).toBe('before')
  })

  /* THE ADDRESS IS THE POINT. INPUTS.unshift renumbers every row, so a cell
     that had captured a position when it was drawn would commit onto the
     wrong man's leave — which is why these carry an id at all. */
  it('a row added above it does not move where the cell writes', async () => {
    const mine: any = { person: 'pike', date: MON, allday: true, s: 0, e: 1439, type: 'LL', remarks: 'mine', mod: 'now' }
    await plant(mine)
    const other: any = { person: 'nasty', date: MON, allday: true, s: 0, e: 1439, type: 'LL', remarks: 'not mine', mod: 'now' }
    await plant(other)
    /* re-found by the SAME address after the list moved — that is the claim */
    await type(cell(mine, 'rmks'), 'still mine')
    expect(mine.remarks).toBe('still mine')
    expect(other.remarks).toBe('not mine')
  })

  it('the view-only week gets no cells at all', async () => {
    await page('viewsched')
    expect($$('#vWeek [data-inp]')).toHaveLength(0)
    await page('editsched')
  })
})

describe('the dialog writes the row it was opened on', () => {
  it('opens on the clicked input, showing its own type and times', async () => {
    const inp = monRows()[0]
    await click(weekBtn(inp))
    expect(INPEDIT).toBe(inp)
    expect(($('#inpEditPop') as any).hidden).toBe(false)
    expect(($('#inpEditType') as HTMLSelectElement).value).toBe(inp.type)
    expect($('#inpEditTitle').textContent).toContain(MON)
  })

  it('a new window saves onto that row, revalidates, and undoes in one step', async () => {
    const inp = monRows()[0]
    await click(weekBtn(inp))
    /* All day → Custom, then a window of its own */
    if ($('#inpEditSpan')) await click($('#inpEditSpan [data-span="custom"]'))
    else await click($('#inpEditAllday'))
    await set($('#inpEditStart'), '09:00')
    await set($('#inpEditEnd'), '11:30')
    await set($('#inpEditRmk'), 'dentist')
    await click($('#inpEditSave'))
    expect(INPEDIT).toBe(null)
    expect([inp.allday, inp.s, inp.e, inp.remarks]).toEqual([false, 540, 690, 'dentist'])
    expect(inp.mod).toBe('now')
    await act(async () => { undo(); notify() })
    expect(INPUTS.find((r: any) => r.remarks === 'dentist')).toBeUndefined()
  })

  it('AM fills the half and labels it; a type with no halves drops the label', async () => {
    const inp = monRows().find((i: any) => i.type === 'LL') || monRows()[0]
    inp.type = 'LL'
    await act(async () => notify())
    await click(weekBtn(inp))
    await click($('#inpEditSpan [data-span="am"]'))
    expect(($('#inpEditStart') as HTMLInputElement).value).toBe(HALF_AM[0])
    await click($('#inpEditSave'))
    expect([inp.s, inp.e, inp.half]).toEqual([0, 720, 'am'])
    /* CSE has no half in INPUT_META, so the picker goes and the label must
       not be left stranded on the record where nobody can see or change it */
    await click(weekBtn(inp))
    await set($('#inpEditType'), 'CSE')
    expect($('#inpEditSpan')).toBe(null)
    await click($('#inpEditSave'))
    expect(inp.half).toBeUndefined()
    expect(inp.type).toBe('CSE')
  })

  it('a bad window is refused and the dialog stays open with the typing in it', async () => {
    const inp = monRows()[0]
    await click(weekBtn(inp))
    if ($('#inpEditSpan')) await click($('#inpEditSpan [data-span="custom"]'))
    await set($('#inpEditStart'), '14:00')
    await set($('#inpEditEnd'), '09:00')
    await click($('#inpEditSave'))
    expect(INPEDIT).toBe(inp)
    expect(($('#inpEditEnd') as HTMLInputElement).value).toBe('09:00')
    await click($('#inpEditCancel'))
  })

  it('Cancel is a real cancel', async () => {
    const inp = monRows()[0]
    const before = JSON.stringify(inp)
    await click(weekBtn(inp))
    await set($('#inpEditRmk'), 'typed then abandoned')
    await click($('#inpEditCancel'))
    expect(JSON.stringify(inp)).toBe(before)
  })

  it('Delete removes the input, and takes its accepted ground row with it', async () => {
    const inp: any = { person: 'pike', date: MON, allday: false, s: 480, e: 600, type: 'Appointment', remarks: 'x-ray', mod: 'now' }
    const di = DAYS.findIndex((d: any) => d.dt === MON)
    /* through the funnel, so the setup itself is one undo step — an input
       planted straight onto the array would leave the undo below landing on a
       snapshot from before it existed, and the test would be measuring that */
    await act(async () => { writeInputsBatch(() => { INPUTS.unshift(inp); acceptInput(di, inp, 'g') }); notify() })
    expect(acceptedDay(inp)).toBe(di)
    const rows = () => (DAYS[di].ground || []).length
    const had = rows()
    await click(weekBtn(inp))
    await click($('#inpEditDel'))
    expect(INPUTS.indexOf(inp)).toBe(-1)
    expect(rows()).toBe(had - 1)
    await act(async () => { undo(); notify() })
    expect(INPUTS.find((r: any) => r.remarks === 'x-ray')).toBeTruthy()
  })

  it('an input undone from under an open dialog refuses to save', async () => {
    const inp: any = { person: 'pike', date: MON, allday: true, s: 0, e: 1439, type: 'LL', remarks: 'ghost', mod: 'now' }
    await act(async () => { INPUTS.unshift(inp); notify() })
    await click(weekBtn(inp))
    await act(async () => { INPUTS.splice(INPUTS.indexOf(inp), 1); notify() })
    await set($('#inpEditRmk'), 'still typing')
    await click($('#inpEditSave'))
    expect(INPUTS.indexOf(inp)).toBe(-1)
    expect(INPEDIT).toBe(null)
  })
})
