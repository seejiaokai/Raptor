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
    /* scoped to the section rows — the sheet now also lists flying waves below,
       which carry their own .arrsec-name */
    expect($$('[data-arrsecrow] .arrsec-name').map(n => n.textContent))
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

/* the flying-waves list within the sheet (owner, 29 Aug 26 — "within the waves I
   also want the option to reorder … put SC at the top, then 1st wave 2nd wave").
   A two-wave day is built here the same way sort.test.ts / reorder.test.ts do,
   because the seed's day 0 need not carry two. */
describe('the Arrange sheet\'s flying-waves list', () => {
  const twoWaveDay = async () => {
    DAYS[0].waves = [
      { label: 'WAVE 1', formations: [{ cs: 'VIPER', msn: 'BFM', to: '10:00', ld: '11:00', aircraft: [{ p: 'p1', w: 'w1' }] }] },
      { label: 'SC', kind: 'sc', standalone: true, formations: [{ cs: 'SC', msn: 'AM', to: '07:00', ld: '13:00', aircraft: [{ p: 'p2', w: 'w2' }] }] },
    ]
    await act(async () => { setArrangeSec(null); notify() })
    await act(async () => { setArrangeSec(0); notify() })
  }

  it('lists the day\'s waves by their board titles, in model order', async () => {
    await twoWaveDay()
    expect($$('[data-arrwaverow]').map(r => r.dataset.arrwaverow)).toEqual(['0', '1'])
    expect($$('[data-arrwaverow] .arrsec-name').map(n => n.textContent)).toEqual(['1st wave', 'SC'])
  })

  it('the ▼ on a wave moves that block down (store.moveWaveBlock)', async () => {
    await twoWaveDay()
    const first = $$('[data-arrwaverow="0"]')[0]!
    await click(first.querySelectorAll('.tnudge')[1])   // ▼
    expect(DAYS[0].waves.map((w: any) => w.label)).toEqual(['SC', 'WAVE 1'])
  })

  it('the top ▲ and bottom ▼ are disabled (no wrap-around)', async () => {
    await twoWaveDay()
    const rows = $$('[data-arrwaverow]')
    expect((rows[0].querySelectorAll('.tnudge')[0] as HTMLButtonElement).disabled).toBe(true)
    expect((rows.slice(-1)[0].querySelectorAll('.tnudge')[1] as HTMLButtonElement).disabled).toBe(true)
  })

  it('draws no waves list on a day with fewer than two waves', async () => {
    DAYS[0].waves = [{ label: 'WAVE 1', formations: [] }]
    await act(async () => { setArrangeSec(null); notify() })
    await act(async () => { setArrangeSec(0); notify() })
    expect($$('[data-arrwaverow]')).toHaveLength(0)
    /* the sections list is still there — the sheet's core job is unaffected */
    expect($$('[data-arrsecrow]').length).toBe(5)
  })
})
