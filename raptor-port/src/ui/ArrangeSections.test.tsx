// @vitest-environment jsdom
/* ArrangeSections — the per-day section-order sheet (ARRANGESEC in pops.ts).
   Mounted standalone like DutyTplModal.test. The engine/store guarantees are
   pinned in engine/secorder.test.ts and state/store.test.ts; this only checks
   the sheet wires its ▲▼ and "Apply to all days" to those write paths. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrangeSections } from './ArrangeSections'
import { DAYS } from '../engine/data'
import { secOrder } from '../engine/order'
import { initStore, setSession, notify } from '../state/store'
import { setArrangeSec } from './pops'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const DSNAP = JSON.stringify(DAYS)

beforeAll(async () => {
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<ArrangeSections />) })
})

beforeEach(async () => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  setSession({ user: 'a', role: 'admin' })
  initStore()
  await act(async () => { setArrangeSec(0); notify() })
})

describe('the Arrange sections sheet', () => {
  it('lists the five sections in the day\'s current order', () => {
    const rows = $$('[data-arrsecrow]').map(r => r.dataset.arrsecrow)
    expect(rows).toEqual(['prog', 'waves', 'duty', 'sims', 'ground'])
    expect($$('.arrsec-name').map(n => n.textContent))
      .toEqual(['Programme', 'Flying waves', 'Duties', 'Sims', 'Ground Programme'])
  })

  it('the ▼ on a row moves that section down (store.moveSection)', async () => {
    /* the first row is Programme; its ▼ is the second .tnudge in its grip */
    const progRow = $$('[data-arrsecrow="prog"]')[0]!
    await click(progRow.querySelectorAll('.tnudge')[1])   // ▼
    expect(secOrder(DAYS[0])).toEqual(['waves', 'prog', 'duty', 'sims', 'ground'])
  })

  it('the top ▲ and bottom ▼ are disabled (no wrap-around)', () => {
    const first = $$('[data-arrsecrow]')[0]!, last = $$('[data-arrsecrow]').slice(-1)[0]!
    expect((first.querySelectorAll('.tnudge')[0] as HTMLButtonElement).disabled, 'top ▲ off').toBe(true)
    expect((last.querySelectorAll('.tnudge')[1] as HTMLButtonElement).disabled, 'bottom ▼ off').toBe(true)
  })

  it('"Apply to all days" gives every day this day\'s order', async () => {
    await click($$('[data-arrsecrow="ground"]')[0]!.querySelectorAll('.tnudge')[0])   // ground up one
    const want = secOrder(DAYS[0])
    await click(host.querySelector('#arrSecAll'))
    DAYS.forEach((d: any) => expect(secOrder(d)).toEqual(want))
  })
})
