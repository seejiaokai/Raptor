// @vitest-environment jsdom
/* The green eligibility rings (owner, 13 Aug 26): a blue-selected person also
   rings every slot he could take — bright (.oktake) on an empty slot, dimmed
   (.oktake-f) on one he would take over — and nothing he cannot take, so
   availability reads BEFORE any tap. jsdom can only prove WHICH classes are
   hung (the paints and their distinctness from the armed/severity rings are
   measured in e2e/geometry.spec.ts); what this file pins is that the DOM
   agrees with slotBar — the one eligibility oracle — on every slot, and that
   rings appear, follow mutations, and clear at the right moments. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, writeSlot } from '../state/store'
import { slotVal } from '../engine/slots'
import { slotBar } from '../engine/avail'
import * as view from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const select = async (id: string) => { await act(async () => { view.selectPerson(id, false); notify() }) }
/* THE FIXTURE WSO is found, not named (5 Sep 26). 'wolf' served until slotBar
   learned the two cross-day rules: every filled rear seat he could once take
   over now answers "crew rest — breaks Tuesday" (his Tuesday 05:00 report),
   so the rings that used to lie about him are honest and none light. The
   tests want a WSO the seed week still offers a filled rear seat to — so the
   first one whose selection rings an `.oktake-f` on a `.w` seat is used. */
let WSO = 'wolf'

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  const { PEOPLE } = await import('../engine/people')
  for (const id of Object.keys(PEOPLE).filter(x => PEOPLE[x].seat === 'RCP' && !PEOPLE[x].special && !PEOPLE[x].archived && !PEOPLE[x].pers)) {
    await select(id)
    const ok = $$('#eWeek .seat[data-slot].oktake-f').some(el => el.dataset.slot!.indexOf(':') < 0 && el.dataset.slot!.endsWith('.w'))
    await act(async () => { view.selDrop(); notify() })
    if (ok) { WSO = id; break }
  }
})

describe('green eligibility rings (13 Aug 26)', () => {
  it('the DOM agrees with slotBar on every edit-week slot', async () => {
    const id = WSO                          // a WSO — front seats must never ring
    await select(id)
    const els = $$('#eWeek [data-slot],#eWeek [data-fill]')
    expect(els.length).toBeGreaterThan(50)
    let ringed = 0
    for (const el of els) {
      if (el.classList.contains('armed')) continue
      const raw = el.dataset.slot || el.dataset.fill!
      let why = ''; try { why = slotBar(id, raw) } catch { why = '?' }
      const occ = el.dataset.slot ? slotVal(String(raw).replace(/\.\+$/, '')) : ''
      const want = !why && occ !== id ? (occ ? 'oktake-f' : 'oktake') : ''
      expect(el.classList.contains('oktake'), raw).toBe(want === 'oktake')
      expect(el.classList.contains('oktake-f'), raw).toBe(want === 'oktake-f')
      if (want) ringed++
    }
    expect(ringed, 'the seed week offers him somewhere to go').toBeGreaterThan(0)
    /* the headline rule, stated directly: a WSO never rings a front seat */
    expect($$('#eWeek .seat[data-slot$=".p"].oktake,#eWeek .seat[data-slot$=".p"].oktake-f').length).toBe(0)
    await act(async () => { view.selDrop(); notify() })
  })

  it('a mutation re-rings on the next paint: an emptied seat brightens', async () => {
    const id = WSO
    await select(id)
    /* a JET rear seat: an emptied jet seat keeps its data-slot (`.empty-slot`),
       where an emptied sim seat becomes a bare fill cell with no key to find */
    const filled = $$('#eWeek .seat[data-slot].oktake-f').find(el => el.dataset.slot!.indexOf(':') < 0 && el.dataset.slot!.endsWith('.w'))
    expect(filled, 'the seed week has a takeable filled jet rear seat').toBeTruthy()
    const key = filled!.dataset.slot!
    const before = slotVal(key)
    await act(async () => { writeSlot(key, '') })
    /* WARN was reassigned by the mutation's validate(), so the memo dropped
       and the same key now reads as an empty spot */
    const again = $(`#eWeek [data-slot="${key}"]`)
    expect(again.classList.contains('oktake')).toBe(true)
    expect(again.classList.contains('oktake-f')).toBe(false)
    await act(async () => { writeSlot(key, before); view.selDrop(); notify() })
  })

  it('rings clear with the selection, and never paint outside edit mode', async () => {
    await select(WSO)
    expect($$('.oktake,.oktake-f').length).toBeGreaterThan(0)
    await act(async () => { view.selDrop(); notify() })
    expect($$('.oktake,.oktake-f').length).toBe(0)
    /* view-only: the same selection paints blue but rings nothing */
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'viewsched')!)
    await select(WSO)
    expect($$('.oktake,.oktake-f').length).toBe(0)
    await act(async () => { view.selDrop(); notify() })
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  })

  it('a placeholder selection rings nothing — every slot would light', async () => {
    await select('allavail')
    expect($$('.oktake,.oktake-f').length).toBe(0)
    await act(async () => { view.selDrop(); notify() })
  })
})
