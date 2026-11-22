// @vitest-environment jsdom
/* THE WINDOW'S ✕ ASKS FOR EVERY FIELD IT CAN LOSE (owner D1622; found by Fable's helper beside Inputs F1/F2, 22 Nov 26):
   the "Close it and lose them?" test read the window's ordinary fields only, so an Other moved to Unavailable, an
   Attach's "To" typed or a document attached — and nothing else — closed at once on ✕ and was lost without a word. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor } from './InputWindow'
import { initStore, notify, setSession, writeInputs } from '../state/store'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { setMe } from '../state/auth'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { _resetFloatWins } from './winorder'
import { setInpEdit } from './pops'
import { undo } from '../state/history'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const realToast = HOOKS.toast
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const tid = (id: string) => $(`#inpEditPop [data-testid="${id}"]`) || $(`[data-testid="${id}"]`)
const admin = 'stiff'
const crew = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers && id !== admin)
const live = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
const T0 = new Date('2026-09-01T08:00:00.000Z').getTime()

beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore()
  setSession({ user: admin, role: 'admin' }); setMe(admin)
  lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('cal'); setCalMonth({ y: 2026, m: 10 })
  HOOKS.toast = (() => {}) as any
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null) })
  HOOKS.toast = realToast
  host.remove(); _resetFloatWins()
})

const openOther = async () => {
  const b = crew()[0]
  const rec = { iid: 'uns-goes', type: 'Other', date: 'Oct 14', yr: 2026, allday: true, s: 0, e: 1439, remarks: 'away', mod: '2026-09-01', by: b, at: T0, people: [{ p: b, by: b, at: T0 }] }
  await act(async () => { expect(writeInputs(() => { INPUTS.push(rec) })).toBe(true); notify() })
  await act(async () => { setInpEdit(live('uns-goes')); notify() })
  expect(tid('win-inputedit'), 'premise: the window is up').toBeTruthy()
}

describe('the window’s ✕ with only a "Goes to" or a document not saved', () => {
  it('Unavailable picked and nothing else: ✕ asks before losing it, and the window stays', async () => {
    await openOther()
    await click(tid('inpEdit-goes-u'))
    await click(tid('win-inputedit-x'))
    expect(tid('inped-escask'), '✕ asks "Close it and lose them?"').toBeTruthy()
    expect(tid('win-inputedit'), 'the window stays while it asks').toBeTruthy()
    expect(live('uns-goes').acc, 'nothing saved yet').toBeUndefined()
  })
  it('a document attached and nothing else: ✕ asks too', async () => {
    await openOther()
    const file = $('#inpEditPop .docfield input[type="file"]') as HTMLInputElement
    expect(file, 'the window draws the Document row').toBeTruthy()
    const f = new File(['x'], 'orders.pdf', { type: 'application/pdf' })
    await act(async () => { Object.defineProperty(file, 'files', { value: [f], configurable: true }); file.dispatchEvent(new Event('change', { bubbles: true })) })
    await click(tid('win-inputedit-x'))
    expect(tid('inped-escask'), '✕ asks before losing the document').toBeTruthy()
  })
  it('Astra F1: an Undo of "Goes to" behind the open window is followed — the remark saved next does not put it back', async () => {
    await openOther()
    await click(tid('inpEdit-goes-u')); await click($('#inpEditSave'))
    expect(live('uns-goes').acc, 'premise: saved under Unavailable').toBe('u')
    await act(async () => { setInpEdit(live('uns-goes')); notify() })
    const box = $('#inpEditRmk') as HTMLInputElement
    expect(box, 'the remarks box').toBeTruthy()
    await act(async () => {
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(box), 'value')!.set!.call(box, 'away, now with words')
      box.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await act(async () => { undo(); notify() })
    expect(live('uns-goes').acc, 'the Undo took it back to the programme').toBeUndefined()
    await click($('#inpEditSave'))
    expect(live('uns-goes').remarks, 'his remark is saved').toBe('away, now with words')
    expect(live('uns-goes').acc, 'and the Undo stands: it is not put back under Unavailable').toBeUndefined()
  })
  it('left as it is: nothing changed, ✕ closes at once without asking', async () => {
    await openOther()
    await click(tid('win-inputedit-x'))
    expect(tid('inped-escask')).toBeNull()
    expect(tid('win-inputedit')).toBeNull()
  })
})
