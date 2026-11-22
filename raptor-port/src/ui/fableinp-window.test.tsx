// @vitest-environment jsdom
/* FABLE'S READ OF THE INPUTS AREA (22 Nov 26) — proof tests, each written to run RED on the code as it stands.
   F1: a document added to, or taken off, an input of SEVERAL people in its own window is not saved, and the window
       says "Input updated".
   F2: an Other whose "Goes to" is changed in the window, saved together with an OIL answer, keeps where it stood:
       only the answer is written, and the window says "OIL answer saved". */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { commitInput, draftOf } from './inputedit'
import { InputEditor } from './InputWindow'
import { initStore, notify, setSession, writeInputs } from '../state/store'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { setMe } from '../state/auth'
import { INPUTS, idsOf } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
import { rowDocIds } from '../state/docs'
import { undo } from '../state/history'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { _resetFloatWins } from './winorder'
import { setInpEdit } from './pops'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const said: string[] = []
const realToast = HOOKS.toast
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const tid = (id: string) => $(`#inpEditPop [data-testid="${id}"]`) || $(`[data-testid="${id}"]`)
const win = () => tid('win-inputedit')
const crew = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers)
const admin = 'stiff', member = 'bane'
const others = () => crew().filter(id => id !== admin && id !== member)
const live = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
const T0 = new Date('2026-09-01T08:00:00.000Z').getTime()
const put = async (rec: any) => { await act(async () => { expect(writeInputs(() => { INPUTS.push(rec) }), 'the fixture is a legal record').toBe(true); notify() }); return live(rec.iid) }
const openOn = async (r: any) => act(async () => { setInpEdit(live(r.iid)); notify() })

beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore()
  setSession({ user: admin, role: 'admin' }); setMe(admin)
  lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('cal'); setCalMonth({ y: 2026, m: 10 })
  said.length = 0; HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
  await act(async () => { setCalMonth({ y: 2026, m: 10 }); notify() })
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null) })
  HOOKS.toast = realToast
  host.remove(); _resetFloatWins()
})

describe('F1 — a document on an input of several people', () => {
  const sharedRec = (over: any = {}) => {
    const [b, c] = others()
    const rec: any = { iid: 'fbl-doc', type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'brief', mod: '2026-09-01', by: admin, at: T0, ...over }
    rec.people = [b, c].map(p => ({ p, by: admin, at: T0 }))
    return rec
  }
  it('the window: a file attached to a saved shared Meeting, Save — the record carries it', async () => {
    const r = await put(sharedRec())
    await openOn(r)
    expect(win(), 'its window is open').toBeTruthy()
    const file = $('#inpEditPop .docfield input[type="file"]') as HTMLInputElement
    expect(file, 'the window draws the Document row for an input of several').toBeTruthy()
    const f = new File(['x'], 'orders.pdf', { type: 'application/pdf' })
    await act(async () => { Object.defineProperty(file, 'files', { value: [f], configurable: true }); file.dispatchEvent(new Event('change', { bubbles: true })) })
    expect($$('#inpEditPop .docchip'), 'the file shows as a chip in the window').toHaveLength(1)
    await click($('#inpEditSave'))
    expect(win(), 'the window closed as saved').toBeNull()
    expect(rowDocIds(live('fbl-doc')), `the document is on the record (the window said: ${said.join(' | ') || 'nothing'})`).toHaveLength(1)
  })
  it('the window: the ✕ on a shared input’s one document, Save — the document is off the record', async () => {
    const r = await put(sharedRec({ docIds: ['fbl-old'] }))
    await openOn(r)
    await click($('#inpEditPop .docdel'))
    expect($$('#inpEditPop .docchip'), 'the chip is gone from the window').toHaveLength(0)
    await click($('#inpEditSave'))
    expect(win(), 'the window closed as saved').toBeNull()
    expect(rowDocIds(live('fbl-doc')), 'the document was taken off').toHaveLength(0)
  })
  it('the one writer: a document and a new remark saved together on a shared input — both are kept', async () => {
    const r = await put(sharedRec())
    let ok = false
    await act(async () => { ok = commitInput(r, { ...draftOf(r), remarks: 'new words', docIds: ['fbl-new'] }, idsOf(r)); notify() })
    expect(ok).toBe(true)
    expect(live('fbl-doc').remarks).toBe('new words')
    expect(rowDocIds(live('fbl-doc')), 'the document rides the same save').toEqual(['fbl-new'])
  })
})

describe('F2 — an Other moved by "Goes to" in a save that also answers OIL', () => {
  it('Unavailable picked, Save, the OIL question answered — the input stands under Unavailable', async () => {
    const b = others()[0]
    /* Sat 17 Oct 26, nobody has answered its OIL question (as one filed from the Leave War, or brought back from a cancel) */
    const r = await put({ iid: 'fbl-goes', type: 'Other', date: 'Oct 17', yr: 2026, allday: true, s: 0, e: 1439, remarks: 'family', mod: '2026-09-01', by: b, at: T0, people: [{ p: b, by: b, at: T0 }] })
    expect(r.acc, 'it stands on the Ground Programme').toBeUndefined()
    await openOn(r)
    await click(tid('inpEdit-goes-u'))
    expect(tid('inpEdit-goes-u')!.getAttribute('aria-pressed'), 'Unavailable is picked in the window').toBe('true')
    await click($('#inpEditSave'))
    expect($$('[data-testid="oilconf"]'), 'the save asks the OIL question first').toHaveLength(1)
    await click(tid('oil-no')); await click(tid('oilconf-save'))
    expect(win(), 'the window closed as saved').toBeNull()
    expect(live('fbl-goes').oil, 'the answer was written').toBeTruthy()
    expect(live('fbl-goes').acc, `where it goes was saved too (the window said: ${said.join(' | ') || 'nothing'})`).toBe('u')
  })
})

/* THE PINS OF THE FIX (22 Nov 26): each fixed save is ONE step — one Undo puts back exactly the record that stood before
   it (oil.md: "Answered, the answer and the change are one step and one Undo") — a change of documents alone never
   moves the late date (D1150 — "they can apply first but upload after"), and the one-person input's document save is
   as it was. */
describe('the pins of the fix — Undo, the late date, and the one-person input as before', () => {
  const sharedRec = (over: any = {}) => {
    const [b, c] = others()
    const rec: any = { iid: 'fbl-doc', type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'brief', mod: '2026-09-01', by: admin, at: T0, ...over }
    rec.people = [b, c].map(p => ({ p, by: admin, at: T0 }))
    return rec
  }
  const oneOther = () => {
    const b = others()[0]
    return { iid: 'fbl-goes', type: 'Other', date: 'Oct 17', yr: 2026, allday: true, s: 0, e: 1439, remarks: 'family', mod: '2026-09-01', by: b, at: T0, people: [{ p: b, by: b, at: T0 }] }
  }
  const attach = async (name: string) => {
    const file = $('#inpEditPop .docfield input[type="file"]') as HTMLInputElement
    expect(file, 'the window draws the Document row').toBeTruthy()
    const f = new File(['x'], name, { type: 'application/pdf' })
    await act(async () => { Object.defineProperty(file, 'files', { value: [f], configurable: true }); file.dispatchEvent(new Event('change', { bubbles: true })) })
  }
  const snap = (iid: string) => JSON.stringify(live(iid))
  const undoOnce = async () => act(async () => { undo(); notify() })

  it('a document attached to a shared input: the late date is not moved, and one Undo takes the document off again', async () => {
    const r = await put(sharedRec())
    const before = snap('fbl-doc')
    await openOn(r); await attach('orders.pdf'); await click($('#inpEditSave'))
    expect(rowDocIds(live('fbl-doc'))).toHaveLength(1)
    expect(live('fbl-doc').mod, 'a file attached is not a change to what was filed').toBe('2026-09-01')
    await undoOnce()
    expect(snap('fbl-doc'), 'exactly the record as it stood').toBe(before)
  })
  it('a document taken off a shared input: the other stays, and one Undo puts back exactly what stood', async () => {
    const r = await put(sharedRec({ docId: 'fbl-a', docIds: ['fbl-a', 'fbl-b'] }))
    const before = snap('fbl-doc')
    await openOn(r)
    expect($$('#inpEditPop .docchip')).toHaveLength(2)
    await click($('#inpEditPop .docdel'))
    await click($('#inpEditSave'))
    expect(rowDocIds(live('fbl-doc')), 'the first was taken off, the second kept').toEqual(['fbl-b'])
    expect(live('fbl-doc').mod).toBe('2026-09-01')
    await undoOnce()
    expect(snap('fbl-doc')).toBe(before)
    expect(rowDocIds(live('fbl-doc'))).toEqual(['fbl-a', 'fbl-b'])
  })
  it('the one writer: a draft that carries no document list leaves a shared input’s documents alone', async () => {
    const r = await put(sharedRec({ docId: 'fbl-a' }))
    const d: any = { ...draftOf(r), remarks: 'new words' }; delete d.docIds
    let ok = false
    await act(async () => { ok = commitInput(r, d, idsOf(r)); notify() })
    expect(ok).toBe(true)
    expect(live('fbl-doc').remarks).toBe('new words')
    expect(rowDocIds(live('fbl-doc'))).toEqual(['fbl-a'])
  })
  it('the one writer: the same documents and nothing else changed writes nothing', async () => {
    const r = await put(sharedRec({ docId: 'fbl-a' }))
    const before = snap('fbl-doc')
    let ok = false
    await act(async () => { ok = commitInput(r, draftOf(r), idsOf(r)); notify() })
    expect(ok).toBe(true)
    expect(snap('fbl-doc')).toBe(before)
  })
  it('a ONE-person input: a file attached in its window is saved as before — on the record, the late date not moved, one Undo', async () => {
    const b = others()[0]
    const r = await put({ iid: 'fbl-one', type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'brief', mod: '2026-09-01', by: b, at: T0, people: [{ p: b, by: b, at: T0 }] })
    const before = snap('fbl-one')
    await openOn(r); await attach('orders.pdf'); await click($('#inpEditSave'))
    expect(win()).toBeNull()
    expect(rowDocIds(live('fbl-one'))).toHaveLength(1)
    expect(live('fbl-one').mod).toBe('2026-09-01')
    await undoOnce()
    expect(snap('fbl-one')).toBe(before)
  })
  it('F2: "Goes to" and the OIL answer are ONE step — one Undo puts back both, and the window never says "OIL answer saved"', async () => {
    const r = await put(oneOther())
    const before = snap('fbl-goes')
    await openOn(r)
    await click(tid('inpEdit-goes-u')); await click($('#inpEditSave'))
    await click(tid('oil-no')); await click(tid('oilconf-save'))
    expect(live('fbl-goes').acc).toBe('u')
    expect(live('fbl-goes').oil).toBeTruthy()
    expect(said, 'a change went with the answer, so it is not "the answer alone"').not.toContain('OIL answer saved')
    await undoOnce()
    expect(snap('fbl-goes'), 'neither the move nor the answer is left behind').toBe(before)
  })
  it('an OIL answer ALONE is still written by itself: where it goes and the late date are left as they were', async () => {
    const r = await put(oneOther())
    const before = snap('fbl-goes')
    await openOn(r)
    await click($('#inpEditSave'))
    await click(tid('oil-no')); await click(tid('oilconf-save'))
    expect(win()).toBeNull()
    expect(live('fbl-goes').oil).toBeTruthy()
    expect(live('fbl-goes').acc).toBeUndefined()
    expect(live('fbl-goes').mod, 'an answer alone never makes an on-time input read late').toBe('2026-09-01')
    expect(said).toContain('OIL answer saved')
    await undoOnce()
    expect(snap('fbl-goes')).toBe(before)
  })
})
