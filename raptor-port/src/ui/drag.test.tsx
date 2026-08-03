// @vitest-environment jsdom
/* Drag & drop — tfin's "generic drag & drop across the whole edit board"
   group and the B23/B49 applyDrop contracts, driven through the React edit
   page with the same synthesized drag events the reference suite uses. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { slotVal, setSlotVal } from '../engine/slots'
import { HOOKS } from '../engine/hooks'
import { setEditOn, afterSchedMutate } from '../state/view'
import { dragFrom, applyDrop, setDrag } from './drag'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
/* the reference suite's dnd() helper, verbatim in spirit: dragstart on the
   source, dragover + drop on the target, dragend on the source */
const dnd = async (from: Element, to: Element) => {
  const dt: any = { data: {}, effectAllowed: '', setData(k: string, v: string) { this.data[k] = v }, getData(k: string) { return this.data[k] || '' } }
  const mk = (t: string) => { const ev: any = new Event(t, { bubbles: true, cancelable: true }); try { ev.dataTransfer = dt } catch (_) {} return ev }
  await act(async () => {
    from.dispatchEvent(mk('dragstart'))
    to.dispatchEvent(mk('dragover'))
    to.dispatchEvent(mk('drop'))
    from.dispatchEvent(mk('dragend'))
  })
}
/* capture toasts without repainting anything */
let toasts: string[] = []
const origToast = HOOKS.toast

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  await act(async () => { setEditOn(true); notify() })
  HOOKS.toast = (m: any) => { toasts.push(String(m)) }
})

describe('generic drag & drop across the whole edit board (tfin)', () => {
  it('duty / sim / ground / programme cells are droppable, crew are drag sources', () => {
    const fills = (pre: string) => $$(`#eWeek [data-fill^="${pre}"]`)
    expect(fills('d:').length).toBeGreaterThanOrEqual(3)
    expect(fills('s:').length).toBeGreaterThanOrEqual(2)
    expect(fills('g:').length).toBeGreaterThanOrEqual(3)
    expect(fills('a:').length).toBeGreaterThanOrEqual(3)
    expect($$('#eWeek .availpuck [data-person][draggable="true"]').length).toBeGreaterThan(10)
  })

  it('roster puck -> duty seat', async () => {
    const seat = $('#eWeek .seat[data-slot^="d:"][draggable="true"]')
    const key = seat.dataset.slot!, before = slotVal(key)
    const src = $$('#eRoster .rpuck[data-person]').find(x => x.dataset.person !== before)!
    await dnd(src, $(`#eWeek .seat[data-slot="${key}"]`))
    expect(slotVal(key)).toBe(src.dataset.person)
    setSlotVal(key, before); await act(async () => { afterSchedMutate(); notify() })
  })

  it('flying seat <-> duty seat swap', async () => {
    const fly = $('#eWeek .acrow .seat[data-slot][draggable="true"]')
    const duty = $('#eWeek .seat[data-slot^="d:"][draggable="true"]')
    const fk = fly.dataset.slot!, dk = duty.dataset.slot!
    const a = slotVal(fk), b = slotVal(dk)
    await dnd(fly, duty)
    expect(slotVal(fk)).toBe(b)
    expect(slotVal(dk)).toBe(a)
    setSlotVal(fk, a); setSlotVal(dk, b); await act(async () => { afterSchedMutate(); notify() })
  })

  it('roster -> programme append lands in the first free overflow slot', async () => {
    const cell = $('#eWeek [data-fill$=".+"]')
    const base = cell.dataset.fill!.slice(0, -1)
    const n = () => { let i = 0; while (slotVal(base + i)) { i++ } return i }
    const before = n(), src = $('#eRoster .rpuck[data-person]')
    await dnd(src, $(`#eWeek [data-fill="${cell.dataset.fill}"]`))
    expect(n()).toBe(before + 1)
    setSlotVal(base + before, ''); await act(async () => { afterSchedMutate(); notify() })
  })

  it('roster -> empty sim cell picks the first free front seat', async () => {
    const cell = $$('#eWeek [data-fill$=".*"]').find(c => !slotVal(c.dataset.fill!.slice(0, -1) + 'p'))
    if (!cell) return
    const b = cell.dataset.fill!.slice(0, -1), src = $('#eRoster .rpuck[data-person]')
    await dnd(src, $(`#eWeek [data-fill="${cell.dataset.fill}"]`))
    expect(slotVal(b + 'p')).toBe(src.dataset.person)
    setSlotVal(b + 'p', ''); await act(async () => { afterSchedMutate(); notify() })
  })

  it('dragging a seat onto the roster unassigns it', async () => {
    const seat = $('#eWeek .seat[data-slot^="g:"][draggable="true"]')
    const key = seat.dataset.slot!, before = slotVal(key)
    await dnd($(`#eWeek .seat[data-slot="${key}"]`), $('#eRoster'))
    expect(slotVal(key)).toBe('')
    setSlotVal(key, before); await act(async () => { afterSchedMutate(); notify() })
  })

  it('the dnd class is cleared after every drop', () => {
    expect(document.body.classList.contains('dnd')).toBe(false)
  })

  it('the view page stays read-only — no drop cells, nothing draggable', () => {
    expect($$('#vWeek [data-fill]').length).toBe(0)
    expect($$('#vWeek [draggable="true"]').length).toBe(0)
  })
})

describe('applyDrop contracts (B23 / B49)', () => {
  it('dragFrom reads a slot seat', () => {
    const el = $('#eWeek .acrow .seat[data-slot][draggable="true"]')
    const r: any = dragFrom(el)
    expect(r && r.kind).toBe('slot')
    expect(r.key).toBe(el.dataset.slot)
  })

  it('dragFrom reads a roster puck', () => {
    const el = $('#eRoster .rpuck[data-person]')
    const r: any = dragFrom(el)
    expect(r && r.kind).toBe('roster')
    expect(r.id).toBe(el.dataset.person)
  })

  it('dragFrom ignores anything undraggable', () => {
    expect(dragFrom(document.body)).toBe(null)
    expect(dragFrom(null)).toBe(null)
  })

  it('applyDrop is a no-op without a drag', () => {
    expect(applyDrop($('#eWeek .seat[data-slot]'), 0, 0)).toBe(false)
  })

  it('dropping a puck back where it started says so instead of doing nothing', async () => {
    const seat = $$('#eWeek .seat[data-slot^="d:"][draggable="true"]').find(s => slotVal(s.dataset.slot!))!
    toasts = []
    await dnd(seat, seat)
    expect(toasts).toContain('Already in that seat')
    expect(slotVal(seat.dataset.slot!)).toBeTruthy()
  })

  it('a jet line refuses a third body', async () => {
    const row = $('#eWeek .acrow')
    /* a spot on the row that is neither a seat nor a people cell */
    const el = [...row.querySelectorAll('*')].find(x =>
      !x.closest('.sb-slot,.seat[data-slot]') && !x.closest('[data-fill]')) || row
    const src = $('#eRoster .rpuck[data-person]')
    toasts = []
    await dnd(src, el as Element)
    expect(toasts).toContain('A jet line carries two — FCP and RCP')
  })

  it('dragging a seat to empty page space removes it', async () => {
    const seat = $$('#eWeek .seat[data-slot^="d:"][draggable="true"]').find(s => slotVal(s.dataset.slot!))!
    const key = seat.dataset.slot!, before = slotVal(key)
    await dnd(seat, document.body)
    expect(slotVal(key)).toBe('')
    setSlotVal(key, before); await act(async () => { afterSchedMutate(); notify() })
  })

  it('a roster puck let go on empty space is still a no-op', () => {
    const id = $('#eRoster .rpuck[data-person]').dataset.person!
    setDrag({ kind: 'roster', id })
    expect(applyDrop(document.body, 0, 0)).toBe(false)
  })

  it('a seat puck dropped on jet-row dead space keeps its seat', async () => {
    const seat = $$('#eWeek .acrow .seat[data-slot][draggable="true"]').find(s => slotVal(s.dataset.slot!))!
    const key = seat.dataset.slot!, before = slotVal(key)
    const row = seat.closest('.acrow')!
    const el = [...row.querySelectorAll('*')].find(x =>
      !x.closest('.sb-slot,.seat[data-slot]') && !x.closest('[data-fill]')) || row
    toasts = []
    await dnd(seat, el as Element)
    expect(toasts).toContain('A jet line carries two — FCP and RCP')
    expect(slotVal(key)).toBe(before)
  })

  it('every duty / ground / sim list cell is an append target', () => {
    const f = $$('#eWeek [data-fill]').map(x => x.dataset.fill!)
    const list = f.filter(k => /^[dgs]:/.test(k))
    expect(list.length).toBeGreaterThanOrEqual(6)
    expect(list.every(k => /\.\+$/.test(k))).toBe(true)
  })
})

/* put the real toast back for any suite that runs after this file */
describe('cleanup', () => {
  it('restores the toast hook', () => { HOOKS.toast = origToast; expect(true).toBe(true) })
})
