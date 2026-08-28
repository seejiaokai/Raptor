// @vitest-environment jsdom
/* The OIL ask (owner, 28 Aug 26 — "it will ask the user if the duty and
   commitment deserves an applicable OIL"): saving a duty-&-commitments input
   whose span covers a weekend/PH opens a sheet BEFORE anything is written —
   Yes/No for one day, All/Some/None with a tap-to-toggle day grid for a
   span. No default; Cancel writes nothing; the answers land on the row
   (row.oil) in the SAME undo step as the save. Driven through the REAL
   InputEditor over the real store, the upconfirm harness idiom. The demo
   week is Mon 13 – Sun 19 Jul 26, so Jul 18/19 are the weekend. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, writeInputsBatch, HIST } from '../state/store'
import { INPUTS, oilAsks } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { setInpEdit, INPEDIT } from './pops'
import { commitInputEdit, draftOf, oilGate } from './inputedit'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
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

const openAdd = async (seed: any) => {
  await act(async () => {
    setInpEdit({ _new: true, person: 'bane', allday: true, remarks: 'oiltest', yr: 2026, ...seed })
    notify()
  })
}
/* only the rows THIS suite files — the seed already carries bane activity rows */
const mine = () => INPUTS.filter((r: any) => r.person === 'bane' && oilAsks(r.type) && /oiltest/.test(r.remarks || ''))

describe('the OIL ask gates a weekend/PH duty-&-commitments save', () => {
  it('Save opens the sheet INSTEAD of writing; Cancel leaves everything unwritten', async () => {
    await openAdd({ type: 'Duty', date: 'Jul 18' })
    await click($('#inpEditSave'))
    expect($('[data-testid="oilconf"]'), 'the OIL sheet is up').toBeTruthy()
    expect(mine().length, 'nothing written yet').toBe(0)
    expect(($('[data-testid="oilconf-save"]') as HTMLButtonElement).disabled, 'no default — Save waits').toBe(true)
    await click($('[data-testid="oilconf"] .x'))
    expect($('[data-testid="oilconf"]')).toBeFalsy()
    expect(mine().length, 'cancel wrote nothing').toBe(0)
  })

  it('Yes writes the row AND its FO answer as ONE undo step', async () => {
    const ix0 = HIST.ix
    await openAdd({ type: 'Duty', date: 'Jul 18' })          // all-day → FO suggested
    await click($('#inpEditSave'))
    expect($('[data-testid="oilconf"]')!.textContent).toContain('FO — a full day')
    await click($('[data-testid="oil-yes"]'))
    await click($('[data-testid="oilconf-save"]'))
    const r = mine()[0]
    expect(r, 'the input landed').toBeTruthy()
    expect(r.oil).toEqual({ '2026-07-18': 1 })
    expect(HIST.ix, 'save + answer is one undo step').toBe(ix0 + 1)
  })

  it('No OIL records the explicit decline — a 0, not an absence', async () => {
    await openAdd({ type: 'Duty', date: 'Jul 18' })
    await click($('#inpEditSave'))
    await click($('[data-testid="oil-no"]'))
    await click($('[data-testid="oilconf-save"]'))
    expect(mine()[0].oil).toEqual({ '2026-07-18': 0 })
  })

  it('a timed input under six hours offers HO, and Yes records the half', async () => {
    await openAdd({ type: 'Meeting', date: 'Jul 18', allday: false, s: 8 * 60, e: 12 * 60 })
    await click($('#inpEditSave'))
    expect($('[data-testid="oilconf"]')!.textContent).toContain('HO — half a day')
    await click($('[data-testid="oil-yes"]'))
    await click($('[data-testid="oilconf-save"]'))
    expect(mine()[0].oil).toEqual({ '2026-07-18': 0.5 })
  })

  it('a weekday input never asks — it saves straight through', async () => {
    await openAdd({ type: 'Duty', date: 'Jul 15' })
    await click($('#inpEditSave'))
    expect($('[data-testid="oilconf"]')).toBeFalsy()
    expect(mine().length).toBe(1)
    expect(mine()[0].oil).toBeUndefined()
  })

  it('a span offers All / Some / None, and "some" is a tap-to-toggle day grid', async () => {
    await openAdd({ type: 'Training', date: 'Jul 17', endDate: 'Jul 19' })  // Fri–Sun → Sat+Sun applicable
    await click($('#inpEditSave'))
    expect($('[data-testid="oilconf"]')!.textContent).toContain('2 non-working days')
    await click($('[data-testid="oil-some"]'))
    expect($('[data-testid="oilcal"]'), 'the day grid is up').toBeTruthy()
    await click($('[data-oilday="2026-07-18"]'))            // select Saturday
    await click($('[data-oilday="2026-07-19"]'))            // select Sunday…
    await click($('[data-oilday="2026-07-19"]'))            // …tap again to DESELECT (owner's ask)
    await click($('[data-testid="oilconf-save"]'))
    expect(mine()[0].oil).toEqual({ '2026-07-18': 1, '2026-07-19': 0 })
  })

  it('an edit whose answers still cover the plan does not re-ask', async () => {
    await openAdd({ type: 'Duty', date: 'Jul 18' })
    await click($('#inpEditSave'))
    await click($('[data-testid="oil-yes"]'))
    await click($('[data-testid="oilconf-save"]'))
    const r = mine()[0]
    await act(async () => { setInpEdit(r); notify() })
    await click($('#inpEditSave'))
    expect($('[data-testid="oilconf"]'), 'answers current — no sheet').toBeFalsy()
    expect(TOASTS.join('|')).toContain('Input updated')
    expect(r.oil).toEqual({ '2026-07-18': 1 })
  })
})

describe('the answers belong to the acknowledged commitment', () => {
  const plant = (r: any) => { writeInputsBatch(() => { INPUTS.unshift({ allday: true, remarks: '', mod: 'now', yr: 2026, ...r }) }); return INPUTS[0] }

  it('a retype OUT of the ask set voids them (the delete half/sans precedent)', () => {
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', s: 0, e: 1439, oil: { '2026-07-18': 1 } })
    const d = draftOf(r); d.type = 'LL'
    expect(commitInputEdit(r, d)).toBe(true)
    expect(r.oil, 'LL does not ask for OIL — the answer went with the type').toBeUndefined()
  })

  it('moving the input to ANOTHER person voids them — the new person must be asked', () => {
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', s: 0, e: 1439, oil: { '2026-07-18': 1 } })
    const d = draftOf(r); d.person = 'stiff'
    expect(commitInputEdit(r, d)).toBe(true)
    expect(r.oil).toBeUndefined()
  })

  it('a time-only edit keeps them — the gate re-asks when the plan goes stale', () => {
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', allday: false, s: 8 * 60, e: 12 * 60, oil: { '2026-07-18': 0.5 } })
    const d = draftOf(r); d.remarks = 'refined'
    expect(commitInputEdit(r, d)).toBe(true)
    expect(r.oil).toEqual({ '2026-07-18': 0.5 })
    /* and the gate REPORTS the staleness once the hours change the amount */
    const d2 = draftOf(r); d2.eTime = '1800'                 // 10h → FO now
    const g: any = oilGate(d2, r)
    expect(g.kind).toBe('ask')
  })
})
