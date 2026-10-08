// @vitest-environment jsdom
/* THE INPUT EDITOR AS A WINDOW ON THE INPUTS PAGE (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md
   §3.7, and §5 "The editor behind a window").

   Owner, D641 (7 Oct 26): every pop-up window of the job "should be able to drag around and the background still works
   (clickable editable) when this window is up" — and "an input or a commitment being filed" is one of them. The plan
   settles what he left to it (D641 reading 6): what happens when the thing a window shows is changed from the page
   behind it.

     "An editor never saves a field its user did not change. … When the record changes behind it: fields the user has
      not touched take the live values silently; a field changed BOTH ways is listed — 'Changed while this window was
      open: end date — theirs 14 Jan, yours 12 Jan' — with a choice per field. Save writes only the user's own changes
      over the live record … A record replaced by an Undo is treated the same way. One editor at a time: opening
      another input while one holds unsaved changes asks, in that window, before replacing it."  "A record that has
      gone closes its window with a line saying so."

   It carries the editor when it is opened ON THE INPUTS PAGE; opened from the board or the week it is the blocking
   dialog it always was (the plan: "unchanged — outside this job's mock-ups"). */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor, commitInputEdit, draftOf, removeInput } from './inputedit'
import { initStore, notify, setSession, undo, writeInputs } from '../state/store'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { _resetFloatWins } from './FloatWindow'
import { INPEDIT, setInpEdit } from './pops'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const said: string[] = []
const realToast = HOOKS.toast
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const tid = (id: string) => $(`[data-testid="${id}"]`)
const win = () => tid('win-inputedit')
const crew = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers)
const live = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
let n = 0
/* filed through the app's own door, so it is a step the Undo list knows */
const file = async (over: any = {}) => {
  const row = { iid: 'ew' + (++n), person: crew()[0], type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'first', mod: '2026-09-01', ...over }
  await act(async () => { writeInputs(() => { INPUTS.push(row) }); notify() })
  return live(row.iid)
}
const openOn = async (r: any) => act(async () => { setInpEdit(live(r.iid)); notify() })
const type = async (sel: string, v: string) => {
  const el = $(sel) as HTMLInputElement
  expect(el, sel).toBeTruthy()
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })) })
}
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
/* a change made on the page BEHIND the window — by its own command, as the List's edit in place or a drag makes one */
const behind = async (iid: string, change: Record<string, unknown>) => act(async () => { const r = live(iid); commitInputEdit(r, { ...draftOf(r), ...change }); notify() })
const rmk = () => ($('#inpEditRmk') as HTMLInputElement).value

beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); setSession({ user: 'a', role: 'admin' }); lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('cal'); setCalMonth({ y: 2026, m: 10 })
  said.length = 0; HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
  await act(async () => { setCalMonth({ y: 2026, m: 10 }); notify() })
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null) })
  HOOKS.toast = realToast
  host.remove(); _resetFloatWins(); setSession(null); storeBackend.impl = null; setPage('inputs')
})

describe('on the Inputs page the editor is a window (D641)', () => {
  it('a window on the shell: its title says whose input and when, no veil is drawn, and it does not take the page away', async () => {
    const r = await file()
    await openOn(r)
    expect(win()!.getAttribute('aria-modal')).toBe('false')
    expect(win()!.querySelector('.win-ttl')!.textContent).toContain(PEOPLE[r.person].cs)
    expect(win()!.querySelector('.win-ttl')!.textContent).toContain('13 Oct')
    expect($('.airpop#inpEditPop'), 'not the blocking dialog').toBeNull()
    expect($('#inpEditPop'), 'the same form, by the same name').toBeTruthy()
  })
  it('a press on the page outside it leaves it up, and the month behind it still opens a day', async () => {
    const r = await file()
    await openOn(r)
    await act(async () => { document.body.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(win()).toBeTruthy()
    await act(async () => { $('[data-icday="2026-10-20"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })) })
    expect(tid('win-inputsday'), 'the day opened behind it').toBeTruthy()
    expect(win(), 'and the editor is still there').toBeTruthy()
  })
  it('it closes by its cross, by Cancel, and by Escape', async () => {
    const r = await file()
    await openOn(r); await click(tid('win-inputedit-x')); expect(win()).toBeNull()
    await openOn(r); await click($('#inpEditCancel')); expect(win()).toBeNull()
    await openOn(r)
    await act(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
    expect(win()).toBeNull()
  })
  it('"+ Input" is a window too', async () => {
    await act(async () => { setInpEdit({ _new: true, _calendar: true, _ctx: 'i', person: crew()[0], type: 'Meeting', date: 'Oct 14', allday: false, s: 600, e: 660 }); notify() })
    expect(win()!.querySelector('.win-ttl')!.textContent).toContain('New input')
    expect($('#inpEditSave')!.textContent).toBe('Add')
  })
  it('opened anywhere else it is the blocking dialog it always was', async () => {
    const r = await file()
    await act(async () => { setPage('editsched'); notify() })
    await openOn(r)
    expect(win()).toBeNull()
    expect($('.airpop#inpEditPop')!.hidden).toBe(false)
    expect($('#inpEditTitle')!.textContent).toContain(PEOPLE[r.person].cs)
  })
})

describe('it never saves a field its user did not change', () => {
  it('remarks changed in the window, the end date changed behind it: Save keeps BOTH — the end date as it was set behind', async () => {
    const r = await file()
    await openOn(r)
    await type('#inpEditRmk', 'mine')
    await behind(r.iid, { end: '2026-10-15' })
    expect(live(r.iid).endDate, 'the change behind landed').toBe('Oct 15')
    await click($('#inpEditSave'))
    expect(live(r.iid).endDate, 'the window did not put the old end date back').toBe('Oct 15')
    expect(live(r.iid).remarks).toBe('mine')
    expect(win()).toBeNull()
  })
  it('the Undo steps afterwards are in order: his save first, then the change behind', async () => {
    const r = await file()
    await openOn(r)
    await type('#inpEditRmk', 'mine')
    await behind(r.iid, { end: '2026-10-15' })
    await click($('#inpEditSave'))
    await act(async () => { undo() })
    expect([live(r.iid).remarks, live(r.iid).endDate]).toEqual(['first', 'Oct 15'])
    await act(async () => { undo() })
    expect([live(r.iid).remarks, live(r.iid).endDate || '']).toEqual(['first', ''])
  })
  it('a field he has not touched takes the live value silently — the window shows it', async () => {
    const r = await file()
    await openOn(r)
    await behind(r.iid, { remarks: 'theirs' })
    expect(rmk()).toBe('theirs')
    expect(tid('inped-clash')).toBeNull()
  })
})

describe('a field changed BOTH ways is put to him', () => {
  it('it is listed — theirs and yours — and Save waits for his choice', async () => {
    const r = await file()
    await openOn(r)
    await type('#inpEditRmk', 'mine')
    await behind(r.iid, { remarks: 'theirs' })
    const clash = tid('inped-clash')!
    expect(clash.textContent).toContain('Changed while this window was open')
    expect(clash.textContent).toContain('remarks'); expect(clash.textContent).toContain('theirs'); expect(clash.textContent).toContain('mine')
    expect(rmk(), 'what he typed is not thrown away').toBe('mine')
    await click($('#inpEditSave'))
    expect(live(r.iid).remarks, 'nothing is saved until he chooses').toBe('theirs')
    expect(win()).toBeTruthy()
    expect(said.join(' | ')).toMatch(/choose/i)
  })
  it('"Keep mine" saves his; "Take theirs" shows theirs and saves nothing of his for that field', async () => {
    const r = await file()
    await openOn(r)
    await type('#inpEditRmk', 'mine')
    await behind(r.iid, { remarks: 'theirs' })
    await click(tid('inped-clash-mine-remarks'))
    expect(tid('inped-clash')).toBeNull()
    await click($('#inpEditSave'))
    expect(live(r.iid).remarks).toBe('mine')

    await openOn(r)
    await type('#inpEditRmk', 'mine again')
    await behind(r.iid, { remarks: 'theirs again' })
    await click(tid('inped-clash-theirs-remarks'))
    expect(tid('inped-clash')).toBeNull(); expect(rmk()).toBe('theirs again')
    await click($('#inpEditSave'))
    expect(live(r.iid).remarks).toBe('theirs again')
  })
  it('the end date changed both ways says both dates in words', async () => {
    const r = await file({ endDate: 'Oct 14' })
    await openOn(r)
    await behind(r.iid, { end: '2026-10-16' })
    expect(tid('inped-clash'), 'a field he did not touch does not clash').toBeNull()
  })
})

describe('the record behind the window goes, or is put back by Undo', () => {
  it('deleted behind it: the window closes and says so', async () => {
    const r = await file()
    await openOn(r)
    await type('#inpEditRmk', 'mine')
    await act(async () => { removeInput(live(r.iid)); notify() })
    expect(win()).toBeNull()
    expect(said.join(' | ')).toMatch(/removed|deleted/i)
    expect(INPEDIT).toBeNull()
  })
  it('a change behind it taken back by Undo: the window follows the record as it now is, and keeps what he typed', async () => {
    const r = await file()
    await behind(r.iid, { end: '2026-10-15' })
    await openOn(r)
    await type('#inpEditRmk', 'mine')
    await act(async () => { undo() })
    expect(live(r.iid).endDate || '', 'the end date went back').toBe('')
    expect(win(), 'the window stays').toBeTruthy()
    expect(rmk()).toBe('mine')
    await click($('#inpEditSave'))
    expect([live(r.iid).remarks, live(r.iid).endDate || '']).toEqual(['mine', ''])
  })
})

describe('one editor at a time', () => {
  it('with unsaved changes, opening another input asks in the window before replacing it', async () => {
    const a = await file(), b = await file({ person: crew()[1], date: 'Oct 14', remarks: 'second' })
    await openOn(a)
    await type('#inpEditRmk', 'half typed')
    await openOn(b)
    expect(tid('inped-swap')!.textContent).toMatch(/unsaved changes/i)
    expect(rmk(), 'the window still shows the first, with what he typed').toBe('half typed')
    await click(tid('inped-swap-stay'))
    expect(tid('inped-swap')).toBeNull(); expect(rmk()).toBe('half typed')
    await openOn(b)
    await click(tid('inped-swap-go'))
    expect(rmk(), 'the second input is now in the window').toBe('second')
    expect(live(a.iid).remarks, 'and nothing of the first was saved').toBe('first')
  })
  it('with nothing unsaved it simply shows the other input', async () => {
    const a = await file(), b = await file({ person: crew()[1], date: 'Oct 14', remarks: 'second' })
    await openOn(a); await openOn(b)
    expect(tid('inped-swap')).toBeNull(); expect(rmk()).toBe('second')
  })
})
