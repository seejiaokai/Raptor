// @vitest-environment jsdom
/* [INPUT-NEW-DEFAULTS] — an input's window, as he ruled it (15 Oct 26; drawn first on the real app,
   scripts/handpass/mock-input-defaults.mjs, the page docs/mock/2026-10-15-input-new-defaults/):
     · D917  a NEW input from the Inputs page — the List's "+ Input", a day or a run on the Inputs calendar — opens on
             OL, "the most common leave taken"; a saved input keeps its kind; a board panel's + Add keeps its own start.
     · D919  the title box carries a pencil INSIDE it at its right end (his pick P1): a drawing only — hidden from a
             screen reader, never a button of its own (a tap on it is a tap on the box: the stylesheet lets it through,
             walked in a real browser) — and none where the box is not there or the input may only be read.
     · D920  what is still to be filled in stands ABOVE the calendar: When and Remarks come before Dates, for every
             kind and every door (his first idea, D913 A). */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor, newInputSeed, firstPersonalType } from './inputedit'
import { initStore, notify, setSession, writeInputs } from '../state/store'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { setMe } from '../state/auth'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { _resetFloatWins } from './FloatWindow'
import { setInpEdit } from './pops'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const realToast = HOOKS.toast
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const admin = 'stiff'
const others = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers && id !== admin)
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
const pick = async (sel: string, v: string) => {
  const el = $(sel) as HTMLSelectElement
  expect(el, sel).toBeTruthy()
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(el, v); el.dispatchEvent(new Event('change', { bubbles: true })) })
}
let n = 0
const file = async (over: any = {}) => {
  const row = { iid: 'nd' + (++n), person: others()[0], type: 'Meeting', date: 'Oct 20', yr: 2026, allday: false, s: 600, e: 660, remarks: '', mod: '2026-09-01', by: others()[0], at: 1, ...over }
  await act(async () => { writeInputs(() => { INPUTS.push(row) }); notify() })
  return row
}
const mount = async (view: 'table' | 'cal' = 'table') => {
  setInpView(view); setCalMonth({ y: 2026, m: 10 })
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
  if (view === 'table') { if (!$('#inRangePop')) await click($('#inRangeBtn')); await click($('#inRangeAll')) }
}
const win = '[data-testid="win-inputedit"]'
const keys = () => $$(win + ' .inped-k').map(k => (k.textContent || '').trim())
const typeNow = () => ($(win + ' #inpEditType') as HTMLSelectElement | null)?.value

beforeEach(() => {
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); INPUTS.splice(0, INPUTS.length)
  setSession({ user: admin, role: 'admin' }); setMe(admin); lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('table')
  HOOKS.toast = (() => {}) as any
})
afterEach(async () => {
  await act(async () => { root?.unmount(); setInpEdit(null) })
  HOOKS.toast = realToast
  host?.remove(); _resetFloatWins(); INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
})

describe('D917 — a new input from the Inputs page opens on OL', () => {
  it('the one seed of its doors: OL, with or without dates, and OL\'s own all-day start', () => {
    expect(newInputSeed().type).toBe('OL')
    const run = newInputSeed('2026-10-16', '2026-10-15')
    expect(run.type).toBe('OL')
    expect([run.date, run.endDate], 'a run still sorted, start first').toEqual(['Oct 15', 'Oct 16'])
    expect(newInputSeed().allday, 'leave is all day').toBe(true)
  })
  it('a board panel\'s + Add keeps its own start — the first commitment kind, never OL', () => {
    expect(firstPersonalType()).not.toBe('OL')
  })
  it('the List\'s "+ Input": the window opens on OL, and OL has no title box', async () => {
    await mount('table')
    await click($('#inNew'))
    expect(typeNow()).toBe('OL')
    expect($(win + ' #inpEditOwnTitle'), 'OL takes no title (D716)').toBeNull()
  })
  it('"+ Input" in a day opened on the Inputs calendar: OL too', async () => {
    await mount('cal')
    await act(async () => { $('[data-icday="2026-10-15"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })) })
    await click($('#icPopAdd'))
    expect(typeNow()).toBe('OL')
  })
  it('a saved input reopened keeps its own kind', async () => {
    await mount('table')
    const r = await file({ type: 'Meeting', person: admin, by: admin })
    await click($(`#inBody tr[data-iid="${r.iid}"] [data-testid="in-open"]`))
    expect(typeNow()).toBe('Meeting')
  })
})

describe('D919 — the title box carries a pencil inside it', () => {
  it('a commitment kind: the pencil stands in the title box, a drawing hidden from a screen reader, not a button', async () => {
    await mount('table')
    await click($('#inNew'))
    await pick(win + ' #inpEditType', 'Event')
    const box = $(win + ' #inpEditOwnTitle')
    expect(box, 'Event takes a title').toBeTruthy()
    const pen = box!.parentElement!.querySelector('.inped-pen') as HTMLElement | null
    expect(pen, 'beside the box, in its own wrapper').toBeTruthy()
    expect(box!.parentElement!.classList.contains('inped-title')).toBe(true)
    expect(pen!.getAttribute('aria-hidden')).toBe('true')
    expect(pen!.closest('button'), 'never a button of its own').toBeNull()
    expect(pen!.querySelector('svg'), 'a line drawing, never the ✏ glyph').toBeTruthy()
    expect(pen!.textContent || '').not.toContain('✏')
  })
  it('back to OL: the box and its pencil both go', async () => {
    await mount('table')
    await click($('#inNew'))
    await pick(win + ' #inpEditType', 'Event')
    await pick(win + ' #inpEditType', 'OL')
    expect($(win + ' .inped-pen')).toBeNull()
  })
  it('a saved Event of his own: the pencil shows', async () => {
    await mount('table')
    const r = await file({ type: 'Event', person: admin, by: admin })
    await click($(`#inBody tr[data-iid="${r.iid}"] [data-testid="in-open"]`))
    expect($(win + ' .inped-pen')).toBeTruthy()
  })
  it('an Event a member may only read: no pencil', async () => {
    const r = await file({ type: 'Event' })
    const member = others()[1]
    /* a member's session, as ui/groupeditor.test.tsx makes one; his window opened on another man's input */
    setSession({ user: member, role: 'main' }); setMe(member); lwSetRole('member')
    await mount('table')
    await act(async () => { setInpEdit(INPUTS.find((x: any) => x.iid === r.iid)); notify() })
    expect($(win + ' #inpEditOwnTitle'), 'the title is there to read').toBeTruthy()
    expect($(win + ' .inped-body[inert]'), 'the form is read only').toBeTruthy()
    expect($(win + ' .inped-pen'), 'nothing says it can be changed').toBeNull()
  })
})

describe('D920 — When and Remarks stand above the calendar', () => {
  const above = (k: string[]) => {
    const d = k.indexOf('Dates')
    expect(d, 'the calendar is there').toBeGreaterThan(-1)
    expect(k.indexOf('When'), 'When above the calendar').toBeLessThan(d)
    expect(k.indexOf('Remarks'), 'Remarks above the calendar').toBeLessThan(d)
    expect(k.indexOf('Type'), 'the kind still first').toBeLessThan(k.indexOf('When'))
  }
  it('a new OL from the List', async () => {
    await mount('table')
    await click($('#inNew'))
    above(keys())
  })
  it('a new Event, its title above it all', async () => {
    await mount('table')
    await click($('#inNew'))
    await pick(win + ' #inpEditType', 'Event')
    const k = keys()
    above(k)
    expect(k.indexOf('Title')).toBeLessThan(k.indexOf('When'))
  })
  it('a saved input reopened', async () => {
    await mount('table')
    const r = await file({ type: 'Meeting', person: admin, by: admin })
    await click($(`#inBody tr[data-iid="${r.iid}"] [data-testid="in-open"]`))
    above(keys())
  })
})
