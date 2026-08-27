// @vitest-environment jsdom
/* The Medical view (owner, 27 Aug 26): three derived sections over INPUTS,
   an as-of date that replays history, and the document viewer behind every
   card. Rendered through the real App so the INPVIEW routing, the title-row
   button and the store wiring are all the ones the user gets. */
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, writeInputsBatch } from '../state/store'
import { INPUTS, inpId } from '../engine/inputs'
import { DOCVIEW, setDocView } from './pops'
import { setMedAsOf } from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const plant = async (r: any) => {
  await act(async () => { writeInputsBatch(() => { const row = { allday: true, remarks: '', mod: 'now', yr: 2026, ...r }; inpId(row); INPUTS.unshift(row) }); notify() })
  return INPUTS[0]
}
const cardsIn = (sec: string) => $$(`.medsec.${sec} .medcard`)

beforeAll(async () => {
  ;(URL as any).createObjectURL = vi.fn(() => 'blob:stub')
  ;(URL as any).revokeObjectURL = vi.fn()
  initStore()
  const host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'inputs')!)
  /* the notional today is 13 Jul 26 (weeknav.TODAY): bane is down across it,
     shrek's downchit expired on 5 Jul unanswered (unlike divot/sufa he has
     no SEED medical row to cover today), yeti upchitted 8 Jul after a
     June downchit */
  await plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 14', remarks: 'Medically down till 14 Jul' })
  await plant({ person: 'shrek', type: 'OML', date: 'Jul 1', endDate: 'Jul 5' })
  await plant({ person: 'yeti', type: 'ATT B', date: 'Jun 20', endDate: 'Jul 8' })
  await plant({ person: 'yeti', type: 'Upchit', date: 'Jul 8' })
})

describe('the Medical view', () => {
  it('the title-row button carries the live count and opens the view', async () => {
    const btn = $('#inMedBtn')
    expect(btn.textContent).toContain('Medical')
    /* TWO badges now (owner, 27 Aug 26): red = down now, amber = pending.
       bane is down and shrek pends (yeti is upchitted; the seed rows add
       their own — so each badge reads at LEAST one) */
    expect(+($('.medcount:not(.pend)')?.textContent || '0')).toBeGreaterThanOrEqual(1)
    expect(+($('.medcount.pend')?.textContent || '0')).toBeGreaterThanOrEqual(1)
    await click(btn)
    expect($('#medView')).toBeTruthy()
  })
  it('the three sections sort our men correctly as of today', () => {
    expect(cardsIn('med-down').map(c => c.textContent).join(' ')).toContain('ATT C')
    expect($('.medsec.med-down').textContent).toContain('till 14 Jul')
    expect($('.medsec.med-pend').textContent).toContain('was down till 5 Jul')
    expect($('.medsec.med-done').textContent).toContain('upchitted 8 Jul')
  })
  it('a card opens the document viewer for that row', async () => {
    await act(async () => { setDocView(null); notify() })
    await click(cardsIn('med-down')[0])
    expect(DOCVIEW && DOCVIEW.row && DOCVIEW.row.type).toBeTruthy()
    await act(async () => { setDocView(null); notify() })
  })
  it('a pending card opens the viewer in its upchit context', async () => {
    const pend = $$('.medsec.med-pend .medcard').find(c => c.textContent!.includes('5 Jul'))!
    await click(pend)
    expect(DOCVIEW.up).toBe(true)
    await act(async () => { setDocView(null); notify() })
  })
  it('picking an as-of date replays history, and Today returns', async () => {
    /* on 3 Jul shrek was DOWN (1–5 Jul) and yeti still on his ATT B; bane not yet */
    await act(async () => { setMedAsOf('2026-07-03'); notify() })
    expect($('.medsec.med-down').textContent).toContain('till 5 Jul')
    expect($('.medsec.med-pend').textContent).toContain('Nobody is owing an upchit')
    await click($('#medToday'))
    expect($('.medsec.med-pend').textContent).toContain('was down till 5 Jul')
  })
  it('the month grid picks a date', async () => {
    await click($('#medCalBtn'))
    await click(document.querySelector('[data-medday="2026-07-03"]'))
    expect($('#medCalBtn').textContent).toContain('3 Jul')
    await click($('#medToday'))
  })
  it('closes back to the list', async () => {
    await click($('#medClose'))
    expect($('#medView')).toBeNull()
  })
})
