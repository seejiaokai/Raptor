// @vitest-environment jsdom
/* The medical-document ask (owner, [SYNC-INTEG] — "prompt once: Upload or No
   document"). Filing a NEW medical input with no certificate no longer HARD-
   refuses; the editor opens DocConfirm first. "No document" files it with none
   (for a record that genuinely isn't available); "Upload" dismisses so the filer
   can attach one. Driven through the REAL InputEditor over the real store, the
   upconfirm harness idiom. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { setInpEdit, INPEDIT } from './pops'
import { docAdd, rowDocIds } from '../state/docs'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
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
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  HOOKS.toast = (m: any) => { TOASTS.push(String(m)) }
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
})
beforeEach(async () => {
  if (INPEDIT) await act(async () => { setInpEdit(null); notify() })
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  TOASTS = []
})

const openMedAdd = async (over: any = {}) => {
  await act(async () => {
    setInpEdit({ _new: true, _ctx: 'u', person: 'bane', type: 'ATT C', allday: true, date: 'Jul 10', yr: 2026, remarks: '', ...over })
    notify()
  })
}
const meds = () => INPUTS.filter((r: any) => r.person === 'bane' && r.type === 'ATT C')

describe('the medical-document prompt gates a bare new medical save', () => {
  it('Save with no document opens the ask instead of writing — never the old hard refusal', async () => {
    await openMedAdd()
    await click($('#inpEditSave'))
    expect($('[data-testid="docconf"]'), 'the ask is up').toBeTruthy()
    expect(meds(), 'nothing written yet').toHaveLength(0)
    expect(TOASTS.join(' '), 'no hard-refusal toast').not.toContain('Attach the medical document')
  })

  it('"No document" files it with none', async () => {
    await openMedAdd()
    await click($('#inpEditSave'))
    await click($('[data-testid="docconf-nodoc"]'))
    expect($('[data-testid="docconf"]'), 'sheet gone').toBeFalsy()
    const rows = meds()
    expect(rows, 'the medical filed').toHaveLength(1)
    expect(rowDocIds(rows[0]).length, 'with no document').toBe(0)
  })

  it('"Upload" dismisses and writes nothing — the filer stays in the editor to attach one', async () => {
    await openMedAdd()
    await click($('#inpEditSave'))
    await click($('[data-testid="docconf-upload"]'))
    expect($('[data-testid="docconf"]'), 'sheet gone').toBeFalsy()
    expect(meds(), 'Upload wrote nothing').toHaveLength(0)
    expect($('#inpEditPop'), 'the editor is still open').toBeTruthy()
  })

  it('a medical WITH a document files straight through, no ask', async () => {
    await openMedAdd({ docId: freshDoc() })
    await click($('#inpEditSave'))
    expect($('[data-testid="docconf"]'), 'no ask when a doc is attached').toBeFalsy()
    expect(meds(), 'filed at once').toHaveLength(1)
  })
})

/* The Inputs PAGE has its own two save paths (add + edit) — the page a member
   actually files on (Fable M2). They wire the same docGate/DocConfirm, so pin
   the prompt on both there too, including that the resume closure still carries
   the right person/type. */
describe('the Inputs page add form prompts for a bare medical too', () => {
  const gotoInputs = async () => {
    await click($$('.nav a[data-page]').find(a => (a as HTMLElement).dataset.page === 'inputs') || null)
  }
  const setType = async (v: string) => act(async () => {
    const sel = $('#inType') as unknown as HTMLSelectElement
    Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')!.set!.call(sel, v)
    sel.dispatchEvent(new Event('change', { bubbles: true }))
  })
  const pickADay = async () => { await click($('#inCal [data-cal]')); await click($('#inCal [data-cal]')) }
  const attc = () => INPUTS.filter((r: any) => r.type === 'ATT C')

  it('add: a medical with no document opens the ask; "No document" files it bare', async () => {
    await gotoInputs()
    await setType('ATT C')
    await pickADay()
    const n = attc().length
    await click($('#inAdd'))
    expect($('[data-testid="docconf"]'), 'the ask is up on the page too').toBeTruthy()
    expect(attc().length, 'nothing written yet').toBe(n)
    await click($('[data-testid="docconf-nodoc"]'))
    expect($('[data-testid="docconf"]'), 'sheet gone').toBeFalsy()
    expect(attc().length, 'the bare medical filed').toBe(n + 1)
    expect(rowDocIds(attc()[0]).length, 'with no document').toBe(0)
  })

  it('add: "Upload" writes nothing and keeps the form', async () => {
    await gotoInputs()
    await setType('ATT C')
    await pickADay()
    const n = attc().length
    await click($('#inAdd'))
    await click($('[data-testid="docconf-upload"]'))
    expect($('[data-testid="docconf"]'), 'sheet gone').toBeFalsy()
    expect(attc().length, 'Upload wrote nothing').toBe(n)
  })
})
