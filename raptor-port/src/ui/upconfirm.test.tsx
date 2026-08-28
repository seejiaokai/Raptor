// @vitest-environment jsdom
/* The upchit save-time summary (owner, 27 Aug 26 — "ask at save time", and
   "if the owner doesn't select … can't move forward"): saving an upchit from
   any form opens a sheet that says what it ends, and every medical entry
   dated after it must be answered Keep or Remove — no default — before Save
   enables. Cancel writes nothing. Driven through the REAL InputEditor over
   the real store, the boardaddinput harness idiom. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, writeInputsBatch, HIST } from '../state/store'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { setInpEdit, INPEDIT } from './pops'
import { docAdd } from '../state/docs'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const freshDoc = () => docAdd(new Blob(['x'], { type: 'image/png' }) as any).id
const ISNAP = JSON.stringify(INPUTS)
let TOASTS: string[] = []

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  HOOKS.toast = (m: any) => { TOASTS.push(String(m)) }
})
beforeEach(async () => {
  if (INPEDIT) await act(async () => { setInpEdit(null); notify() })
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  TOASTS = []
})

const plant = (r: any) => { writeInputsBatch(() => { INPUTS.unshift({ allday: true, remarks: '', mod: 'now', yr: 2026, ...r }) }); return INPUTS[0] }
/* the DocViewer/pending-card seed shape, verbatim — the dialog opens on it */
const openUpchitAdd = async (date: string) => {
  await act(async () => {
    setInpEdit({ _new: true, _ctx: 'up', person: 'bane', type: 'Upchit', allday: true, date, yr: 2026, remarks: '', docId: freshDoc() })
    notify()
  })
}
const upchits = () => INPUTS.filter((r: any) => r.person === 'bane' && r.type === 'Upchit')

describe('the sheet gates every upchit save', () => {
  it('Save opens the summary INSTEAD of writing; Cancel leaves the record untouched', async () => {
    const med = plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 13' })
    await openUpchitAdd('Jul 12')
    await click($('#inpEditSave'))
    expect($('[data-testid="upconf"]'), 'the summary sheet is up').toBeTruthy()
    expect(upchits(), 'nothing written yet').toHaveLength(0)
    expect($('[data-testid="upconf-plan"]')!.textContent).toContain('now ends')
    await click($('.upconf-foot .abtn.ghost'))
    expect($('[data-testid="upconf"]'), 'sheet gone').toBeFalsy()
    expect(upchits(), 'Cancel wrote nothing').toHaveLength(0)
    expect(med.endDate, 'the downchit is untouched').toBe('Jul 13')
  })
  it('with no leftovers Save is immediately enabled, and lands the trim + add as ONE undo step', async () => {
    const med = plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 13' })
    const depth = HIST.stack.length
    await openUpchitAdd('Jul 12')
    await click($('#inpEditSave'))
    const save = $('[data-testid="upconf-save"]') as HTMLButtonElement
    expect(save.disabled, 'no leftovers → nothing to answer').toBe(false)
    await click(save)
    expect(upchits()).toHaveLength(1)
    expect(med.endDate, 'the upchit day is a fit day — the C ends the day before').toBe('Jul 11')
    expect(HIST.stack.length, 'one undo step for the whole save').toBe(depth + 1)
  })
})

describe('the forced Keep/Remove on later-dated entries', () => {
  const seed = () => {
    const now = plant({ person: 'bane', type: 'ATT B', date: 'Jul 10', endDate: 'Jul 13' })
    const later = plant({ person: 'bane', type: 'ATT C', date: 'Jul 20', endDate: 'Jul 25' })
    return { now, later }
  }
  it('Save stays disabled until every leftover has an answer', async () => {
    seed()
    await openUpchitAdd('Jul 12')
    await click($('#inpEditSave'))
    const save = $('[data-testid="upconf-save"]') as HTMLButtonElement
    expect(save.disabled, 'unanswered leftover blocks the save').toBe(true)
    expect($('.upconf-need'), 'and the sheet says why').toBeTruthy()
    const seg = $('[data-testid="upconf-left-0"] .seg')!
    await click(seg.querySelectorAll('button')[0])            // Keep
    expect(($('[data-testid="upconf-save"]') as HTMLButtonElement).disabled).toBe(false)
  })
  it('Keep leaves the future entry standing; the covering row still trims', async () => {
    const { now, later } = seed()
    await openUpchitAdd('Jul 12')
    await click($('#inpEditSave'))
    await click($('[data-testid="upconf-left-0"] .seg')!.querySelectorAll('button')[0])
    await click($('[data-testid="upconf-save"]'))
    expect(now.endDate).toBe('Jul 11')
    expect(INPUTS.indexOf(later), 'kept').toBeGreaterThanOrEqual(0)
    expect(later.endDate).toBe('Jul 25')
  })
  it('Remove deletes the future entry in the SAME undo step as the upchit', async () => {
    const { now, later } = seed()
    const depth = HIST.stack.length
    await openUpchitAdd('Jul 12')
    await click($('#inpEditSave'))
    await click($('[data-testid="upconf-left-0"] .seg')!.querySelectorAll('button')[1])
    await click($('[data-testid="upconf-save"]'))
    expect(now.endDate).toBe('Jul 11')
    expect(INPUTS.indexOf(later), 'removed with the upchit').toBe(-1)
    expect(upchits()).toHaveLength(1)
    expect(HIST.stack.length, 'add + trim + removal are one step').toBe(depth + 1)
  })
})
