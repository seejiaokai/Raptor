// @vitest-environment jsdom
/* THE DOORS THE LIST'S PENCIL AND PAPERCLIP TOOK WITH THEM, NOW IN THE INPUT'S WINDOW ([INPUT-LIST-AS-DAY-CARD]; owner D718,
   D723 — 10 Oct 26; the plan docs/superpowers/plans/2026-10-10-input-card-plan.md §3, §4 "the doors"). Both were found by
   the scenario designer (Astra's list, 57 and 60) asking what a person could do on the list before that he no longer can:

   · THE PENCIL'S PERSON LIST offered the "Posted out / archived" people to an admin (clearing leave is filed for a man
     who has posted out — [ARCH-STACK] step 4, H5) and kept a DELETED man's own name as its value. The window's list
     offered neither group: with the pencil gone, an admin could no longer move a saved input to an archived man.
   · THE PAPERCLIP opened a medical input's document for EVERY reader (owner, 27 Aug 26). A phone's card carries no
     paperclip (D723), and the window showed a document's NAME only — so on a phone nobody could open it from the
     Inputs list, and a member reading another man's medical input could not open it at all there.

   (The window's date calendar for a one-person input and its unanswered-OIL line are pinned in groupeditor.test.tsx.) */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor } from './inputedit'
import { initStore, notify, setSession, writeInputs } from '../state/store'
import { setInpMode, setInpView, setPage } from '../state/view'
import { setMe } from '../state/auth'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
import { docAdd } from '../state/docs'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { _resetFloatWins } from './FloatWindow'
import { DOCVIEW, setDocView, setInpEdit } from './pops'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const realToast = HOOKS.toast
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const tid = (id: string) => $(`#inpEditPop [data-testid="${id}"]`) || $(`[data-testid="${id}"]`)
const cs = (id: any) => PEOPLE[id].cs as string
const admin = 'stiff', member = 'bane'
const others = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers && id !== admin && id !== member)
const live = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
const choose = async (sel: string, v: string) => {
  const el = $(sel) as HTMLSelectElement
  expect(el, sel).toBeTruthy()
  await act(async () => { el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })) })
}
let n = 0
const single = async (over: any = {}) => {
  const row = { iid: 'wd' + (++n), person: others()[0], type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'solo', mod: '2026-09-01', ...over }
  await act(async () => { writeInputs(() => { INPUTS.push(row) }); notify() })
  return live(row.iid)
}
const openOn = async (r: any) => act(async () => { setInpEdit(live(r.iid)); notify() })
const as = async (who: 'admin' | 'member') => act(async () => {
  if (who === 'admin') { setSession({ user: admin, role: 'admin' }); setMe(admin) } else { setSession({ user: member, role: 'main' }); setMe(member) }
  notify()
})
const flags: [string, string, any][] = []
const mark = (id: string, k: string, v: any) => { flags.push([id, k, PEOPLE[id][k]]); PEOPLE[id][k] = v }

beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); setSession({ user: admin, role: 'admin' }); setMe(admin); lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('cal')
  HOOKS.toast = (() => {}) as any
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null); setDocView(null) })
  for (const [id, k, v] of flags.splice(0)) { if (v === undefined) delete PEOPLE[id][k]; else PEOPLE[id][k] = v }
  HOOKS.toast = realToast
  host.remove(); _resetFloatWins()
})

describe('the window’s Person list offers what the pencil’s did (Astra’s scenario 57)', () => {
  const groupOf = () => $('#inpEditPerson optgroup[label="Posted out / archived"]') as HTMLOptGroupElement | null
  it('an admin, a saved input: the posted-out / archived people are offered in their own group, and the input can be moved to one', async () => {
    const gone = others()[3]
    mark(gone, 'archived', true)
    const r = await single()
    await openOn(r)
    expect(groupOf(), 'the group is there').toBeTruthy()
    expect([...groupOf()!.querySelectorAll('option')].map(o => o.getAttribute('value'))).toContain(gone)
    await choose('#inpEditPerson', gone)
    await click($('#inpEditSave'))
    expect(live(r.iid).person, 'the input is his now').toBe(gone)
  })
  it('an input that already belongs to an archived man opens ON him — once, in that group — and a save of its remarks keeps him', async () => {
    const gone = others()[3]
    mark(gone, 'archived', true)
    const r = await single({ person: gone })
    await openOn(r)
    const sel = $('#inpEditPerson') as HTMLSelectElement
    expect(sel.value).toBe(gone)
    expect(sel.selectedOptions[0].textContent).toBe(cs(gone))
    expect([...sel.querySelectorAll(`option[value="${gone}"]`)], 'listed once').toHaveLength(1)
    await click($('#inpEditSave'))
    expect(live(r.iid).person).toBe(gone)
  })
  it('an input of a DELETED man keeps HIS name as the list’s value — never the first man on the list — and is saved as his', async () => {
    const gone = others()[4]
    mark(gone, 'archived', true); mark(gone, 'deleted', true)
    /* …with ANOTHER man archived, so the list does carry its "Posted out / archived" group: the deleted man is in
       neither it nor the roster, and his own name must still be the value (the break test found this case unproved
       while the group was empty — 10 Oct 26) */
    mark(others()[3], 'archived', true)
    const r = await single({ person: gone, date: 'Sep 1' })
    await openOn(r)
    const sel = $('#inpEditPerson') as HTMLSelectElement
    expect(sel.value).toBe(gone)
    expect(sel.selectedOptions[0].textContent).toBe(cs(gone))
    expect(groupOf(), 'the group is on the list').toBeTruthy()
    expect([...groupOf()!.querySelectorAll('option')].map(o => o.getAttribute('value')), 'a deleted man is offered to nobody').not.toContain(gone)
    await click($('#inpEditSave'))
    expect(live(r.iid).person).toBe(gone)
  })
  it('a NEW input’s window keeps the list it had: no archived group (the List’s own Add form is where clearing leave is filed)', async () => {
    mark(others()[3], 'archived', true)
    await act(async () => { setInpEdit({ _new: true, _calendar: true, _ctx: 'i', person: admin, type: 'Meeting', date: 'Oct 13', allday: false, s: 600, e: 660 }); notify() })
    expect($('#inpEditPerson')).toBeTruthy()
    expect(groupOf()).toBeNull()
  })
  it('a member is offered no list at all, as before', async () => {
    mark(others()[3], 'archived', true)
    const r = await single({ person: member, by: member, type: 'LL', allday: true })
    await as('member')
    await openOn(r)
    expect($('#inpEditPerson')).toBeNull()
  })
})

describe('an input’s document is opened from its window (Astra’s scenario 60 — the phone’s card has no paperclip)', () => {
  const doc = () => docAdd(new Blob(['x'], { type: 'image/png' }) as any).id
  it('a saved medical input with a document: the window has a "document" button, and it opens the viewer on THAT input', async () => {
    const r = await single({ type: 'OML', allday: true, s: 0, e: 1439, docIds: [doc()] })
    await openOn(r)
    const b = tid('inped-docview')!
    expect(b.getAttribute('aria-label')).toMatch(/document/i)
    await click(b)
    expect(DOCVIEW && DOCVIEW.row && DOCVIEW.row.iid).toBe(r.iid)
  })
  it('ANOTHER man’s medical input, read by a member: the form is read only, and the document can still be opened (owner, 27 Aug 26 — every account may view it)', async () => {
    const r = await single({ type: 'OML', allday: true, s: 0, e: 1439, docIds: [doc()] })
    await as('member')
    await openOn(r)
    expect($('#inpEditSave'), 'read only').toBeNull()
    const b = tid('inped-docview')!
    expect(b.closest('[inert]'), 'outside the read-only form — it can be pressed').toBeNull()
    await click(b)
    expect(DOCVIEW && DOCVIEW.row && DOCVIEW.row.iid).toBe(r.iid)
  })
  it('an input with no document has no such button; nor has a new one', async () => {
    const r = await single({ type: 'OML', allday: true, s: 0, e: 1439 })
    await openOn(r)
    expect(tid('inped-docview')).toBeNull()
    await act(async () => { setInpEdit(null); notify() })
    await act(async () => { setInpEdit({ _new: true, _calendar: true, _ctx: 'i', person: admin, type: 'OML', date: 'Oct 13', allday: true, s: 0, e: 1439 }); notify() })
    expect(tid('inped-docview')).toBeNull()
  })
})
