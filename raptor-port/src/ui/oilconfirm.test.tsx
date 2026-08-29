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
import { INPUTS, oilAsks, inpId } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { setInpEdit, INPEDIT } from './pops'
import { CURPAGE, setPage } from '../state/view'
import { commitInputEdit, draftOf, oilGate, oilAnswered } from './inputedit'

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

  it('an in-place time edit that REPRICES a positive answer voids that day (bug pass, 28 Aug 26)', () => {
    /* the board's and week's cells commit straight through commitInputEdit —
       no oilGate — so a stretched window must not silently turn an
       acknowledged HO cell into FO: the repriced day reads unanswered again
       (the bell re-asks); an explicit decline is not hours-dependent and stays */
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', endDate: 'Jul 19', allday: false, s: 8 * 60, e: 10 * 60, oil: { '2026-07-18': 0.5, '2026-07-19': 0 } })
    const d = draftOf(r); d.eTime = '1800'                   // 2h → 10h: the HO answer no longer prices it
    expect(commitInputEdit(r, d)).toBe(true)
    expect(r.oil).toEqual({ '2026-07-19': 0 })
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

describe('the revise button (owner, 29 Aug 26 — change a recorded OIL answer in place)', () => {
  const plant = (r: any) => {
    const row: any = { allday: true, remarks: 'oiltest', mod: 'now', yr: 2026, ...r }
    inpId(row)                       // the page keys its rows by iid
    writeInputsBatch(() => { INPUTS.unshift(row) })
    return INPUTS[0]
  }

  it('oilAnswered draws it exactly where a decision exists', () => {
    const yes = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', s: 0, e: 1439, oil: { '2026-07-18': 1 } })
    const no = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', s: 0, e: 1439, oil: { '2026-07-18': 0 } })
    const unasked = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', s: 0, e: 1439 })
    const weekday = plant({ person: 'bane', type: 'Duty', date: 'Jul 15', s: 0, e: 1439, oil: { '2026-07-15': 1 } })
    const leave = plant({ person: 'bane', type: 'LL', date: 'Jul 18', s: 0, e: 1439, oil: { '2026-07-18': 1 } })
    const dormant = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', s: 0, e: 1439, acc: 'r', oil: { '2026-07-18': 1 } })
    expect(oilAnswered(yes)).toBe(true)
    expect(oilAnswered(no), 'an explicit decline IS a decision to revise').toBe(true)
    expect(oilAnswered(unasked), 'unanswered stays the bell\'s business').toBe(false)
    expect(oilAnswered(weekday), 'no applicable day, nothing to revise').toBe(false)
    expect(oilAnswered(leave), 'not an ask-set type').toBe(false)
    expect(oilAnswered(dormant), 'a dormant row asks nothing').toBe(false)
  })

  it('the editor\'s Change… re-opens the sheet, and a yes can become a no', async () => {
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', s: 0, e: 1439, oil: { '2026-07-18': 1 } })
    await act(async () => { setInpEdit(r); notify() })
    expect($('[data-testid="oil-revise"]'), 'the button is drawn on an answered row').toBeTruthy()
    expect(document.body.textContent).toContain('credited on its non-working day')
    await click($('[data-testid="oil-revise"]'))
    expect($('[data-testid="oilconf"]'), 'the sheet is up over the editor').toBeTruthy()
    await click($('[data-testid="oil-no"]'))
    await click($('[data-testid="oilconf-save"]'))
    expect(r.oil, 'the yes became an explicit decline').toEqual({ '2026-07-18': 0 })
  })

  it('…and a mistaken No becomes a credit — one ordinary undo step', async () => {
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', s: 0, e: 1439, oil: { '2026-07-18': 0 } })
    await act(async () => { setInpEdit(r); notify() })
    expect(document.body.textContent).toContain('no OIL on its non-working day')
    const ix0 = HIST.ix
    await click($('[data-testid="oil-revise"]'))
    await click($('[data-testid="oil-yes"]'))
    await click($('[data-testid="oilconf-save"]'))
    expect(r.oil).toEqual({ '2026-07-18': 1 })
    expect(HIST.ix, 'the revise is one undo step').toBe(ix0 + 1)
  })

  it('an UNANSWERED row draws no button — that question is the bell\'s to land', async () => {
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', s: 0, e: 1439 })
    await act(async () => { setInpEdit(r); notify() })
    expect($('[data-testid="oil-revise"]')).toBeFalsy()
    await act(async () => { setInpEdit(null); notify() })
  })

  it('the Inputs page row wears an OIL chip that revises without touching the fields', async () => {
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', endDate: 'Jul 19', s: 0, e: 1439, oil: { '2026-07-18': 1, '2026-07-19': 0 } })
    await act(async () => { setPage('inputs'); notify() })
    /* the table opens on a today → +2-months window; the July rows need "All
       dates" (the inputs.test.tsx showAllDates idiom) */
    if (!$('#inRangePop')) await click($('#inRangeBtn'))
    await click($('#inRangeAll'))
    const chip = document.querySelector(`tr[data-iid="${r.iid}"] .roil`)
    expect(chip, 'the row wears the OIL chip').toBeTruthy()
    await click(chip)
    expect($('[data-testid="oilconf"]'), 'the sheet opened straight off the row').toBeTruthy()
    await click($('[data-testid="oil-all"]'))
    await click($('[data-testid="oilconf-save"]'))
    expect(r.oil, 'both days credited now — the fields untouched').toEqual({ '2026-07-18': 1, '2026-07-19': 1 })
    expect(r.type).toBe('Duty')
    expect(TOASTS.join('|')).toContain('OIL decision updated')
  })
})

describe('the bell (owner, 28 Aug 26 — the retro notification)', () => {
  it('lights for a pending OIL question, and the tap lands the editor + sheet on the exact input', async () => {
    const row: any = { person: 'bane', type: 'Duty', date: 'Jul 18', allday: true, s: 0, e: 1439, remarks: 'oiltest', mod: 'now', yr: 2026 }
    inpId(row)
    await act(async () => { writeInputsBatch(() => { INPUTS.unshift(row) }) })
    expect($('#notifyBell')!.className, 'the bell glows for the unanswered question').toContain('on')
    await click($('#notifyBell'))
    expect(CURPAGE, 'the tap lands on the Inputs page').toBe('inputs')
    expect(INPEDIT, 'the editor opened on the exact input').toBe(row)
    expect($('[data-testid="oilconf"]'), 'the OIL sheet is already up').toBeTruthy()
    /* answering puts the bell out — the predicate is derived, nothing to clear */
    await click($('[data-testid="oil-yes"]'))
    await click($('[data-testid="oilconf-save"]'))
    expect(row.oil).toEqual({ '2026-07-18': 1 })
    expect($('#notifyBell')!.className, 'answered — the bell is dark').not.toContain('on')
  })

  it('stays dark for someone ELSE\'s pending question — it is the view-as person\'s bell', async () => {
    const row: any = { person: 'stiff', type: 'Duty', date: 'Jul 18', allday: true, s: 0, e: 1439, remarks: 'oiltest', mod: 'now', yr: 2026 }
    inpId(row)
    await act(async () => { writeInputsBatch(() => { INPUTS.unshift(row) }) })
    expect($('#notifyBell')!.className).not.toContain('on')   // ME is bane
  })
})
