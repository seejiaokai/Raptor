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
