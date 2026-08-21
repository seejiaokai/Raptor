// @vitest-environment jsdom
/* AUDIT E — half-days driven through the in-place cells and the dialog
   (halfOf's PM boundary, the HANDOFF-listed gap), clear-a-time against an
   ACCEPTED row, the member gate at the write path, and the three-editors
   agreement the ui-contract names (Inputs page / week cells / board panels
   over ONE list). */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, writeInputsBatch } from '../state/store'
import { INPUTS, inpId, inpTimeText } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { acceptInput, inpKey } from '../engine/slots'
import { afterSchedMutate, PIOPEN } from '../state/view'
import { setInpField, removeInput, HALF_PM } from './inputedit'
import { sbUnavailPanel, sbInputsGroupPanel } from './board-html'
import { INPEDIT, setInpEdit } from './pops'
import { parseHM } from '../engine/time'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const page = async (p: string) => click($$('.nav a[data-page]').find(a => a.dataset.page === p)!)
const cell = (inp: any, f: string) => $(`#eWeek .day[data-day="0"] [data-inp="${inpId(inp)}.${f}"]`)
const type = async (el: Element, text: string) => {
  await act(async () => { (el as HTMLElement).textContent = text })
  await act(async () => { el.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
}
const plant = async (r: any) => {
  await act(async () => { writeInputsBatch(() => { inpId(r); INPUTS.unshift(r) }); notify() })
  return r
}
const scrap = async (r: any) => { await act(async () => { if (INPUTS.indexOf(r) >= 0) removeInput(r); notify() }) }

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await page('editsched')
})
/* Personal Inputs folds by default now (Aug 26) — expand day 0's so the week
   and board input cells this file edits render. */
beforeEach(async () => { await act(async () => { if (INPEDIT) setInpEdit(null); PIOPEN.add(0); notify() }) })

describe('halfOf\'s PM boundary, reached through the in-place cells', () => {
  it('a start typed as 12:01 on an all-day row derives the PM half', async () => {
    const inp: any = await plant({ person: 'bane', date: 'Jul 13', allday: true, s: 0, e: 1439, type: 'LL', remarks: '', mod: 'now' })
    await type(cell(inp, 'str'), '12:01')
    expect([inp.allday, inp.s, inp.e]).toEqual([false, parseHM(HALF_PM[0]), parseHM(HALF_PM[1])])
    expect(inp.half, 'exactly the PM window derives the label').toBe('pm')
    await scrap(inp)
  })

  it('12:00 does not — one minute off the boundary is no half at all', async () => {
    const inp: any = await plant({ person: 'bane', date: 'Jul 13', allday: true, s: 0, e: 1439, type: 'LL', remarks: '', mod: 'now' })
    await type(cell(inp, 'str'), '12:00')
    expect([inp.s, inp.e]).toEqual([720, 1439])
    expect(inp.half, 'not a recognised half').toBeUndefined()
    await scrap(inp)
  })

  it('full → am → pm → full through the cells, label following the window each step', async () => {
    const inp: any = await plant({ person: 'bane', date: 'Jul 13', allday: true, s: 0, e: 1439, type: 'LL', remarks: '', mod: 'now' })
    await type(cell(inp, 'str'), '00:00')
    await type(cell(inp, 'end'), '12:00')
    expect(inp.half).toBe('am')
    await type(cell(inp, 'str'), '12:01')
    await type(cell(inp, 'end'), '23:59')
    expect(inp.half).toBe('pm')
    /* clear ONE time — the whole pair goes, and the half with it */
    await type(cell(inp, 'end'), '')
    expect(inp.allday, 'clearing one cell means all day').toBe(true)
    expect(inp.half).toBeUndefined()
    expect(cell(inp, 'str').textContent, 'both cells read blank').toBe('')
    expect(cell(inp, 'end').textContent).toBe('')
    await scrap(inp)
  })
})

describe('half-days and clears against the ACCEPTED filing', () => {
  it('typing a half window onto an accepted Meeting moves its ground row\'s times', async () => {
    const inp: any = await plant({ person: 'bane', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'acc half', mod: 'now' })
    await act(async () => { expect(acceptInput(0, inp, 'g')).toBe(true); afterSchedMutate(); notify() })
    await type(cell(inp, 'str'), '00:00')
    await type(cell(inp, 'end'), '12:00')
    const row = (DAYS[0].ground || []).find((r: any) => r.src === inpKey(inp))
    expect(row, 'still exactly one linked row').toBeTruthy()
    expect([row.str, row.end], 'the row follows the input\'s window').toEqual(['00:00', '12:00'])
    /* and clearing a time regenerates it TIME-LESS, the all-day row shape */
    await type(cell(inp, 'str'), '')
    const row2 = (DAYS[0].ground || []).find((r: any) => r.src === inpKey(inp))
    expect(row2).toBeTruthy()
    expect([row2.str, row2.end], 'an all-day promotion is a time-less row').toEqual(['', ''])
    await scrap(inp)
  })
})

describe('the gate lives at the write path, not the markup', () => {
  it('a member\'s focusout on a stale in-place cell writes nothing', async () => {
    const inp: any = await plant({ person: 'bane', date: 'Jul 13', allday: true, s: 0, e: 1439, type: 'LL', remarks: 'guarded', mod: 'now' })
    /* the cell exists while the admin session is up; grab its address, then
       the session changes under it — the exact shape routeFocusOut's top
       gate is written for */
    const el = cell(inp, 'rmks')
    expect(el, 'the admin week renders the cell').toBeTruthy()
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    /* a stale copy of the cell, as a repaint that raced the logout leaves */
    const stale = document.createElement('span')
    stale.setAttribute('data-inp', `${inpId(inp)}.rmks`)
    stale.textContent = 'MEMBER WRITE'
    document.body.appendChild(stale)
    await act(async () => { stale.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
    expect(inp.remarks, 'the write was refused at the path').toBe('guarded')
    stale.remove()
    /* and the member\'s week draws no editable input cells at all */
    expect($$('[data-inp]')).toHaveLength(0)
    expect($$('[data-inpedit]')).toHaveLength(0)
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
    await page('editsched')
    await scrap(inp)
  })
})

/* Three editors over one list — the drift risk docs/ui-contracts.md names.
   An edit made on any one surface must be what the other two read. */
describe('three editors, one list', () => {
  it('a week-cell edit is what the board panels and the Inputs table show', async () => {
    const inp: any = await plant({ person: 'bane', date: 'Jul 13', allday: true, s: 0, e: 1439, type: 'LL', remarks: 'drift check', mod: 'now' })
    await type(cell(inp, 'rmks'), 'edited on the week')
    expect(inp.remarks).toBe('edited on the week')
    /* the board's Unavailable panel draws the same value */
    const board = sbUnavailPanel(DAYS[0], 0)
    expect(board).toContain('edited on the week')
    /* and the Inputs page table does too */
    await page('inputs')
    if (!$('#inRangePop')) await click($('#inRangeBtn'))
    await click($('#inRangeAll'))
    expect($$('#inBody tr').map(t => t.textContent).join('|')).toContain('edited on the week')
    await page('editsched')
    await scrap(inp)
  })

  it('an Inputs-page row edit is what the week and the board read back', async () => {
    const inp: any = await plant({ person: 'bane', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'from the page', mod: 'now' })
    await page('inputs')
    if (!$('#inRangePop')) await click($('#inRangeBtn'))
    await click($('#inRangeAll'))
    const row = $$('#inBody tr').find(tr => (tr.textContent || '').includes('from the page'))!
    await click(row.querySelector('[data-edit]'))
    const rm = $('#inBody tr.ined [data-ed="remarks"]') as HTMLInputElement
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    await act(async () => { setter.call(rm, 'edited on the page'); rm.dispatchEvent(new Event('input', { bubbles: true })) })
    await click($('#inBody tr.ined [data-save]'))
    expect(inp.remarks).toBe('edited on the page')
    await page('editsched')
    expect(cell(inp, 'rmks').textContent, 'the week cell reads the page\'s edit').toBe('edited on the page')
    expect(sbInputsGroupPanel(DAYS[0], 0), 'so does the board\'s Personal Inputs panel').toContain('edited on the page')
    await scrap(inp)
  })

  it('a dialog edit (the week/board modal) is what the page table shows', async () => {
    const inp: any = await plant({ person: 'bane', date: 'Jul 13', allday: true, s: 0, e: 1439, type: 'LL', remarks: 'dialog start', mod: 'now' })
    await act(async () => { setInpEdit(inp); notify() })
    const rm = $('#inpEditRmk') as HTMLInputElement
    expect(rm).toBeTruthy()
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    await act(async () => { setter.call(rm, 'edited in the dialog'); rm.dispatchEvent(new Event('input', { bubbles: true })) })
    await click($('#inpEditSave'))
    expect(inp.remarks).toBe('edited in the dialog')
    expect(inpTimeText(inp, 'str')).toBe('')
    await page('inputs')
    /* the table remounts on the default window (the real clock sits outside
       the demo week, so it opens empty — deliberate); widen it to read rows */
    if (!$('#inRangePop')) await click($('#inRangeBtn'))
    await click($('#inRangeAll'))
    expect($$('#inBody tr').map(t => t.textContent).join('|')).toContain('edited in the dialog')
    await page('editsched')
    await scrap(inp)
  })
})
