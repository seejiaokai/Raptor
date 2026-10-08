// @vitest-environment jsdom
/* THE SANS CALENDAR'S "+ COMMITMENT" FORM — the Fly / AMT / OFT ticks and the window they are offered for.

   These six rules were pinned through the Inputs List's add form (ui/inputs.test.tsx, "the SANS Availability sub-form
   on the add form") until that form stopped offering SANS availability (owner D620, 7 Oct 26 — "in list mode remove
   sans avail and move that function to sans calendar solely"). They are RE-POINTED here at the form that now does the
   job — the editor the SANS calendar's "+ Commitment" opens — not dropped: the three ticks beside the standard span
   picker (the owner's phone bug of 14 Aug 26: no per-event time pair inside the picker), SANS aircrew only, no empty
   tick set, the flags alone under All day, AM, and a custom window. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor, sansRefusal } from './inputedit'
import { initStore, notify, setSession } from '../state/store'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
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
const toasts: string[] = []
const realToast = HOOKS.toast
const $ = (sel: string) => host.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => Array.from(host.querySelectorAll(sel)) as HTMLElement[]
const click = async (sel: string) => { const el = $(sel); expect(el, sel).toBeTruthy(); await act(async () => { el!.click() }) }
const setValue = async (sel: string, v: string) => {
  const el = $(sel) as HTMLInputElement | HTMLSelectElement
  expect(el, sel).toBeTruthy()
  const proto = el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype
  await act(async () => { Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, v); el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true })) })
}
const tick = (label: string) => $$('#inpEditSans .sanspick-ck').find(l => l.textContent?.includes(label))!.querySelector('input[type="checkbox"]') as HTMLInputElement
const press = async (el: HTMLElement) => act(async () => { el.click() })
const DAY = '2026-10-23'
const sansId = () => Object.keys(PEOPLE).find(id => PEOPLE[id].san && !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special)!
/* the SANS tab, the day, "+ Commitment" — the one door a SANS availability is filed through */
const openForm = async () => {
  await click('#inSansMode')
  await act(async () => { $(`[data-icday="${DAY}"]`)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })) })
  await click('[data-testid="sd-add"]')
  expect($('#inpEditSans'), 'the form is up, with its ticks').toBeTruthy()
}
const saved = () => INPUTS.find((r: any) => r.type === 'SANS Availability' && r.date === 'Oct 23' && r.yr === 2026) as any

beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed).filter((r: any) => !(r.type === 'SANS Availability' && r.date === 'Oct 23')))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); setSession({ user: 'a', role: 'admin' }); lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('cal'); setCalMonth({ y: 2026, m: 10 })
  toasts.length = 0
  HOOKS.toast = (m: any) => { toasts.push(String(m)) }
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
  await act(async () => { setCalMonth({ y: 2026, m: 10 }); notify() })
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null) })
  HOOKS.toast = realToast
  host.remove(); _resetFloatWins(); setSession(null); storeBackend.impl = null
})

describe('the SANS calendar’s "+ Commitment" form', () => {
  it('three ticks — Fly, AMT, OFT — beside the standard span picker and time fields, never a time pair of their own', async () => {
    await openForm()
    const rows = $$('#inpEditSans .sanspick-ck')
    expect(rows.map(r => r.textContent?.trim())).toEqual(['Fly', 'AMT', 'OFT'])
    expect($$('#inpEditSans input[type="time"]').length, 'no per-event time pair inside the picker').toBe(0)
    expect($('#inpEditSpan'), 'the standard span picker is offered too').toBeTruthy()
    expect($('#inpEditStart') && $('#inpEditEnd'), 'and the standard time fields').toBeTruthy()
    expect($('#inpEditAllday'), 'a half-day kind never gets the plain tick').toBeNull()
    expect($('#inpEditSpan [data-span="all"]')!.getAttribute('aria-pressed'), 'it opens all-day').toBe('true')
    expect($('#inpEditTypeFixed')!.textContent, 'the kind is a value here, not a choice').toBe('SANS Availability')
  })

  it('SANS aircrew only: the form offers nobody else, and the rule itself refuses anyone else', async () => {
    await openForm()
    const offered = $$('#inpEditPerson option').map(o => (o as HTMLOptionElement).value)
    expect(offered.length).toBeGreaterThan(0)
    expect(offered.every(id => !!PEOPLE[id].san), 'every person offered is SANS').toBe(true)
    const nonSans = Object.keys(PEOPLE).find(id => !PEOPLE[id].san && !PEOPLE[id].archived)!
    expect(sansRefusal(nonSans, { f: true })).toMatch(/SANS aircrew only/)
  })

  it('refuses an empty tick set, and writes nothing', async () => {
    await openForm()
    await setValue('#inpEditPerson', sansId())
    if (tick('Fly').checked) await press(tick('Fly'))
    const n = INPUTS.length
    await click('#inpEditSave')
    expect(INPUTS.length, 'nothing was added').toBe(n)
    expect(toasts.some(t => /Tick at least one/.test(t)), toasts.join(' | ')).toBe(true)
    expect($('#inpEditSans'), 'the form stays, with what he chose').toBeTruthy()
  })

  it('Fly and OFT under the default All day save the two flags and nothing of a window', async () => {
    await openForm()
    await setValue('#inpEditPerson', sansId())
    if (!tick('Fly').checked) await press(tick('Fly'))
    await press(tick('OFT'))
    const n = INPUTS.length
    await click('#inpEditSave')
    expect(INPUTS.length).toBe(n + 1)
    const r = saved()
    expect(r.person).toBe(sansId())
    expect(r.allday).toBe(true)
    expect(r.half).toBeUndefined()
    expect(r.sans, 'true flags, never the old {s,e} shape').toEqual({ f: true, o: true })
  })

  it('AM saves a half day with its label and the ticked flag', async () => {
    await openForm()
    await setValue('#inpEditPerson', sansId())
    if (tick('Fly').checked) await press(tick('Fly'))
    await press(tick('AMT'))
    await click('#inpEditSpan [data-span="am"]')
    await click('#inpEditSave')
    const r = saved()
    expect(r.allday).toBe(false)
    expect(r.half).toBe('am')
    expect(r.sans).toEqual({ a: true })
  })

  it('Custom, 08:00 to 12:00, saves those minutes', async () => {
    await openForm()
    await setValue('#inpEditPerson', sansId())
    if (!tick('Fly').checked) await press(tick('Fly'))
    await click('#inpEditSpan [data-span="custom"]')
    await setValue('#inpEditStart', '08:00')
    await setValue('#inpEditEnd', '12:00')
    await click('#inpEditSave')
    const r = saved()
    expect(r.allday).toBe(false)
    expect(r.s).toBe(480)
    expect(r.e).toBe(720)
    expect(r.sans).toEqual({ f: true })
  })
})
