// @vitest-environment jsdom
/* The medical clash sheet (owner, 27 Aug 26 — "ask at save time"): a new
   medical entry overlapping a DIFFERENT-type one never resolves silently.
   The sheet forces a choice per clash — the new entry takes the shared days,
   or the existing status keeps them and the new entry is filed around it
   (splitting into pieces where needed). Driven through the REAL InputEditor
   over the real store, the upconfirm harness idiom. */
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
/* a new medical entry through the shared dialog (the Unavailable + Add ctx) */
const openMedAdd = async (type: string, date: string, endDate?: string) => {
  await act(async () => {
    setInpEdit({ _new: true, _ctx: 'u', person: 'bane', type, date, ...(endDate ? { endDate } : {}), allday: true, yr: 2026, remarks: '', docId: freshDoc() })
    notify()
  })
}
const rows = (type: string) => INPUTS.filter((r: any) => r.person === 'bane' && r.type === type)
const spanOf = (r: any) => r.date + (r.endDate ? '-' + r.endDate : '')

describe('the clash sheet gates a different-type overlap', () => {
  it('Save opens the sheet instead of writing; the choice is forced; Cancel writes nothing', async () => {
    plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 15' })
    await openMedAdd('ATT B', 'Jul 13', 'Jul 18')
    await click($('#inpEditSave'))
    expect($('[data-testid="medclash"]'), 'the clash sheet is up').toBeTruthy()
    expect(rows('ATT B'), 'nothing written yet').toHaveLength(0)
    expect(($('[data-testid="medclash-save"]') as HTMLButtonElement).disabled, 'unanswered clash blocks the save').toBe(true)
    expect($('[data-testid="medclash-0"]')!.textContent).toContain('Jul 13 – Jul 15')
    await click($('.upconf-foot .abtn.ghost'))
    expect($('[data-testid="medclash"]'), 'sheet gone').toBeFalsy()
    expect(rows('ATT B'), 'Cancel wrote nothing').toHaveLength(0)
    expect(rows('ATT C')[0].endDate, 'the old status untouched').toBe('Jul 15')
  })
  it('"new takes them" trims the old row — the programmatic default, now chosen out loud', async () => {
    const c = plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 15' })
    const depth = HIST.stack.length
    await openMedAdd('ATT B', 'Jul 13', 'Jul 18')
    await click($('#inpEditSave'))
    await click($('[data-testid="medclash-0"] .seg button'))               // "ATT B takes them"
    await click($('[data-testid="medclash-save"]'))
    expect(c.endDate).toBe('Jul 12')
    expect(rows('ATT B').map(spanOf)).toEqual(['Jul 13-Jul 18'])
    expect(HIST.stack.length, 'one undo step').toBe(depth + 1)
  })
  it('"old keeps them" files the new entry AROUND the kept status', async () => {
    const c = plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 15' })
    await openMedAdd('ATT B', 'Jul 13', 'Jul 18')
    await click($('#inpEditSave'))
    await click($('[data-testid="medclash-0"] .seg').querySelectorAll('button')[1])   // "ATT C keeps them"
    await click($('[data-testid="medclash-save"]'))
    expect(c.endDate, 'the kept status is untouched').toBe('Jul 15')
    expect(rows('ATT B').map(spanOf), 'the new entry starts after it').toEqual(['Jul 16-Jul 18'])
  })
  it('keeping a status in the MIDDLE splits the new entry into two rows, one undo step', async () => {
    const c = plant({ person: 'bane', type: 'ATT C', date: 'Jul 13', endDate: 'Jul 14' })
    const depth = HIST.stack.length
    await openMedAdd('ATT B', 'Jul 10', 'Jul 20')
    await click($('#inpEditSave'))
    await click($('[data-testid="medclash-0"] .seg').querySelectorAll('button')[1])
    await click($('[data-testid="medclash-save"]'))
    expect(c.date + '-' + c.endDate).toBe('Jul 13-Jul 14')
    expect(rows('ATT B').map(spanOf).sort()).toEqual(['Jul 10-Jul 12', 'Jul 15-Jul 20'])
    expect(HIST.stack.length, 'the split lands as one undo step').toBe(depth + 1)
  })
  it('keeping a status that covers the WHOLE new entry refuses — nothing left to file', async () => {
    plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 20' })
    await openMedAdd('ATT B', 'Jul 13', 'Jul 14')
    await click($('#inpEditSave'))
    await click($('[data-testid="medclash-0"] .seg').querySelectorAll('button')[1])
    await click($('[data-testid="medclash-save"]'))
    expect(TOASTS.join(' ')).toContain('nothing left to file')
    expect(rows('ATT B')).toHaveLength(0)
    expect(rows('ATT C')[0].endDate).toBe('Jul 20')
  })
  it('a same-type overlap never reaches the sheet — the edit-instead refusal stands', async () => {
    plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 15' })
    await openMedAdd('ATT C', 'Jul 13', 'Jul 18')
    await click($('#inpEditSave'))
    expect($('[data-testid="medclash"]')).toBeFalsy()
    expect(TOASTS.join(' ')).toContain('already filed over these days')
  })
})
