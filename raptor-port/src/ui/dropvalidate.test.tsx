// @vitest-environment jsdom
/* ONE validate() PER DROP (5 Sep 26). barDrop used to revalidate on its own
   before asking slotBar, on top of the one afterSchedMutate runs — two passes
   a drop, three for a swap (~45 ms at 4× in the drop ledger, docs/performance.md).
   The delta rewire moved barDrop after the epilogue's pass, so a drop now
   validates exactly once. This file mocks the validator module with a Proxy
   that counts calls and otherwise passes every live binding (WARN, REST,
   EVD are reassigned by validate — a spread copy would freeze them) straight
   through to the real module. Its own file so the counting mock never
   touches drag.test.tsx's module graph. */
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'

const CALLS = { validate: 0 }
vi.mock('../engine/validate', async (orig) => {
  const real: any = await orig()
  return new Proxy(real, {
    get(t, k) { return k === 'validate' ? (...a: any[]) => { CALLS.validate++; return t.validate(...a) } : t[k] },
  })
})

import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { slotVal, setSlotVal } from '../engine/slots'
import { HOOKS } from '../engine/hooks'
import { afterSchedMutate, AVSHUT } from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const dnd = async (from: Element, to: Element) => {
  const dt: any = { data: {}, effectAllowed: '', setData(k: string, v: string) { this.data[k] = v }, getData(k: string) { return this.data[k] || '' } }
  const mk = (t: string) => { const ev: any = new Event(t, { bubbles: true, cancelable: true }); try { ev.dataTransfer = dt } catch (_) {} return ev }
  await act(async () => {
    from.dispatchEvent(mk('dragstart')); to.dispatchEvent(mk('dragover')); to.dispatchEvent(mk('drop')); from.dispatchEvent(mk('dragend'))
  })
}

beforeAll(async () => {
  initStore()
  const host = document.createElement('div'); document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await act(async () => { $$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
  await act(async () => { AVSHUT.clear(); notify() })
  HOOKS.toast = () => {}
})

describe('a drop validates exactly once', () => {
  it('roster puck → duty seat: one pass', async () => {
    const seat = $('#eWeek .seat[data-slot^="d:"][data-drag]')
    const key = seat.dataset.slot!, before = slotVal(key)
    const src = $$('#eRoster .rpuck[data-person]').find(x => x.dataset.person !== before)!
    CALLS.validate = 0
    await dnd(src, $(`#eWeek .seat[data-slot="${key}"]`))
    expect(slotVal(key)).toBe(src.dataset.person)
    expect(CALLS.validate, 'validate() calls during the drop').toBe(1)
    setSlotVal(key, before); await act(async () => { afterSchedMutate(); notify() })
  })

  it('seat ↔ seat swap: still one pass, not three', async () => {
    const fly = $('#eWeek .acrow .seat[data-slot][data-drag]')
    const duty = $('#eWeek .seat[data-slot^="d:"][data-drag]')
    const fk = fly.dataset.slot!, dk = duty.dataset.slot!
    const a = slotVal(fk), b = slotVal(dk)
    CALLS.validate = 0
    await dnd(fly, duty)
    expect(slotVal(fk)).toBe(b); expect(slotVal(dk)).toBe(a)
    expect(CALLS.validate, 'validate() calls during the swap').toBe(1)
    setSlotVal(fk, a); setSlotVal(dk, b); await act(async () => { afterSchedMutate(); notify() })
  })
})
