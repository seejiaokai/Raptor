// @vitest-environment jsdom
/* DOCUMENTS ON EVERY INPUT, AND A NEW LEAVE'S ASK (owner D1150, the Leave War overhaul's M3 7.4): the input window draws
   the Document row for every kind; a NEW leave with none asks "No document — …" ([Upload] / [No document]), never a
   stop; a leave already saved and edited never asks; a file picked rides on the leave. The harness is the design vet's
   (ui/inputsvet.test.tsx). */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor } from './inputedit'
import { initStore, notify, setSession, writeInputs } from '../state/store'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { setMe } from '../state/auth'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
import { rowDocIds } from '../state/docs'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { _resetFloatWins } from './FloatWindow'
import { setInpEdit } from './pops'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const realToast = HOOKS.toast
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const admin = 'stiff'
const live = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
const setType = async (v: string) => {
  const el = $('#inpEditType') as HTMLSelectElement
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(el, v); el.dispatchEvent(new Event('change', { bubbles: true })) })
}
const docRow = () => [...document.querySelectorAll('#inpEditPop .inped-f')].find(f => f.querySelector('.inped-k')?.textContent === 'Document')
const mount = async () => {
  setInpView('table'); setCalMonth({ y: 2026, m: 7 })
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
}
/* a new input for himself on 14 Jul 26 — it opens on OL, a leave (owner D917) */
const newLeave = async () => {
  await click($('#inNew'))
  await click($('#inpEdCal [data-iso="2026-07-14"]'))
}
const added = () => INPUTS.filter((r: any) => r.type === 'OL')

beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length)
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); INPUTS.splice(0, INPUTS.length)
  setSession({ user: admin, role: 'admin' }); setMe(admin); lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('table')
  _resetTimeline(); installGlobalUndo()
  HOOKS.toast = (() => {}) as any
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null) })
  HOOKS.toast = realToast
  host.remove(); _resetFloatWins(); INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
})

describe('the Document row on every kind (D1150)', () => {
  it('a leave, a duty and a medical each draw it', async () => {
    await mount()
    await click($('#inNew'))
    expect(docRow(), 'OL').toBeTruthy()
    await setType('Training')
    expect(docRow(), 'Training').toBeTruthy()
    await setType('ATT C')
    expect(docRow(), 'a medical').toBeTruthy()
  })
})

describe('a new leave asks for its document — never a stop (D1150)', () => {
  it('saving with none asks, in the leave’s words; "No document" files it', async () => {
    await mount()
    await newLeave()
    await click($('#inpEditSave'))
    const ask = $('[data-testid="docconf"]')
    expect(ask, 'the ask').toBeTruthy()
    expect(ask!.querySelector('.airpop-head b')!.textContent).toBe(`No document — ${PEOPLE[admin].cs}, OL`)
    expect(ask!.textContent).toContain('Attach the approval from the leave app now, or file it and attach it later.')
    expect(added(), 'nothing filed yet').toHaveLength(0)
    await click($('[data-testid="docconf-nodoc"]'))
    expect(added(), 'filed').toHaveLength(1)
    expect(rowDocIds(added()[0])).toEqual([])
  })
  it('"Upload" goes back to the window and files nothing', async () => {
    await mount()
    await newLeave()
    await click($('#inpEditSave'))
    await click($('[data-testid="docconf-upload"]'))
    expect($('[data-testid="docconf"]')).toBeNull()
    expect($('[data-testid="win-inputedit"]'), 'the window is still there').toBeTruthy()
    expect(added()).toHaveLength(0)
  })
  it('a file picked first: no ask, and the leave keeps it', async () => {
    await mount()
    await newLeave()
    const pick = docRow()!.querySelector('input[type="file"]') as HTMLInputElement
    await act(async () => {
      Object.defineProperty(pick, 'files', { value: [new File(['%PDF-1.4'], 'approval.pdf', { type: 'application/pdf' })], configurable: true })
      pick.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await click($('#inpEditSave'))
    expect($('[data-testid="docconf"]')).toBeNull()
    expect(added()).toHaveLength(1)
    expect(rowDocIds(added()[0])).toHaveLength(1)
  })
  it('a leave already saved, opened and saved again, never asks', async () => {
    const row = { iid: 'dl1', person: admin, type: 'LL', date: 'Jul 20', yr: 2026, allday: true, remarks: '', mod: '2026-07-01', by: admin, at: 1 }
    await act(async () => { writeInputs(() => { INPUTS.push(row) }); notify() })
    await mount()
    if (!$('#inRangePop')) await click($('#inRangeBtn'))
    await click($('#inRangeAll'))
    await click($('#inBody tr[data-iid="dl1"]')!.querySelector('[data-testid="in-open"]'))
    expect($('[data-testid="win-inputedit"]')).toBeTruthy()
    await click($('#inpEditSave'))
    expect($('[data-testid="docconf"]')).toBeNull()
    expect(live('dl1')).toBeTruthy()
  })
})

describe('the type filter picks a family; a leave or medical row with no document says so (D1179)', () => {
  const put = async (iid: string, type: string, extra: any = {}) => {
    const row = { iid, person: admin, type, date: 'Jul 20', yr: 2026, allday: true, remarks: '', mod: '2026-07-01', by: admin, at: 1, ...extra }
    await act(async () => { writeInputs(() => { INPUTS.push(row) }); notify() })
  }
  const shownIids = () => [...document.querySelectorAll('#inBody tr[data-iid]')].map(t => t.getAttribute('data-iid'))
  const pickType = async (v: string) => {
    const el = $('#inFType') as HTMLSelectElement
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(el, v); el.dispatchEvent(new Event('change', { bubbles: true })) })
  }
  it('"All leave" shows every kind of leave and nothing else; "All medical" the medical kinds', async () => {
    await put('f1', 'LL'); await put('f2', 'OL'); await put('f3', 'ATT C'); await put('f4', 'Meeting', { allday: false, s: 600, e: 660 })
    await mount()
    if (!$('#inRangePop')) await click($('#inRangeBtn'))
    await click($('#inRangeAll'))
    const opts = [...($('#inFType') as HTMLSelectElement).options].map(o => o.textContent)
    expect(opts).toContain('All leave')
    expect(opts).toContain('All medical')
    expect(opts).toContain('All duty & commitments')
    await pickType('grp:leave')
    expect(shownIids().sort()).toEqual(['f1', 'f2'])
    await pickType('grp:med')
    expect(shownIids()).toEqual(['f3'])
  })
  it('"No document" on a bare leave and a bare medical, never on a duty, and not where a file is', async () => {
    await put('n1', 'LL'); await put('n2', 'ATT C'); await put('n3', 'Meeting', { allday: false, s: 600, e: 660 }); await put('n4', 'OL', { docId: 'doc-zz' })
    await mount()
    if (!$('#inRangePop')) await click($('#inRangeBtn'))
    await click($('#inRangeAll'))
    const has = (iid: string) => !!$(`#inBody tr[data-iid="${iid}"] [data-testid="in-nodoc"]`)
    expect(has('n1')).toBe(true)
    expect(has('n2')).toBe(true)
    expect(has('n3')).toBe(false)
    expect(has('n4')).toBe(false)
  })
})
