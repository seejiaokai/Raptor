// @vitest-environment jsdom
/* The Medical view (owner, 27 Aug 26): three derived sections over INPUTS,
   an as-of date that replays history, and the document viewer behind every
   card. Rendered through the real App so the INPVIEW routing, the title-row
   button and the store wiring are all the ones the user gets. */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, writeInputsBatch } from '../state/store'
import { INPUTS, inpId } from '../engine/inputs'
import { docAdd } from '../state/docs'
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

let host: HTMLDivElement
let root: Root

beforeAll(async () => {
  ;(URL as any).createObjectURL = vi.fn(() => 'blob:stub')
  ;(URL as any).revokeObjectURL = vi.fn()
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
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

/* Unmount before the file ends: a render task left queued by the last test
   would otherwise fire after vitest tears jsdom down and die with "window is
   not defined" — an unhandled error that fails the job while every test
   passed (the teardown race closed across the suite, 10 Sep 26). */
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
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
  /* D927 (15 Oct 26, built as drawn — D912): the row under the tabs carries no "Medical" heading — it repeated the tab
     picked just above it — and the as-of button is the row's first control. Its 36 height is a browser's to measure
     (e2e/inputs-calendar.spec.ts, "D927"). */
  it('D927 the row under the tabs has no heading: the as-of button leads it', () => {
    const head = $('#medView .ic-head')
    expect(head.querySelector('.med-title'), 'the heading is gone').toBeNull()
    expect(head.firstElementChild?.id, 'the as-of button stands first in the row').toBe('medCalBtn')
    expect((head.textContent || '').replace($('#medCalBtn').textContent || '', ''), 'no word "Medical" left in the row').not.toMatch(/Medical/)
  })
  it('the three sections sort our men correctly as of today', () => {
    expect(cardsIn('med-down').map(c => c.textContent).join(' ')).toContain('ATT C')
    /* each card says the period it covers (owner D960 — "15-17 Jul") */
    expect($('.medsec.med-down').textContent).toContain('10–14 Jul')
    expect($('.medsec.med-pend').textContent).toContain('was down 1–5 Jul')
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
  // The overlapping-episode grouping (owner, 1 Sep 26): when a person's
  // documented medical entries run into each other, ONE card carries them all
  // and opening it hands the viewer the whole episode to page.
  it('overlapping documented statuses group into one card that opens a pager', async () => {
    const d1 = docAdd(new Blob(['1'], { type: 'image/png' }) as any).id
    const d2 = docAdd(new Blob(['2'], { type: 'image/png' }) as any).id
    await plant({ person: 'ogre', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 12', docId: d1 })
    await plant({ person: 'ogre', type: 'ATT B', date: 'Jul 13', endDate: 'Jul 16', docId: d2 })
    const card = cardsIn('med-down').find(c => c.querySelector('.medcard-docn'))
    expect(card, 'the episode card carries a document count').toBeTruthy()
    expect(card!.querySelector('.medcard-docn')!.textContent).toContain('2 documents')
    await act(async () => { setDocView(null); notify() })
    await click(card!)
    expect(DOCVIEW.rows && DOCVIEW.rows.length, 'opening hands the viewer the whole episode').toBe(2)
    await act(async () => { setDocView(null); notify() })
  })
  // Several files on ONE entry (owner, 1 Sep 26): the badge counts FILES, so
  // a lone two-file entry reads "2 documents" and opens the same pager the
  // episode card does — the viewer expands the row itself.
  it('a single entry with two files says "2 documents" on its card', async () => {
    const f1 = docAdd(new Blob(['s1'], { type: 'image/png' }) as any).id
    const f2 = docAdd(new Blob(['s2'], { type: 'image/png' }) as any).id
    await plant({ person: 'dj', type: 'ATT C', date: 'Jul 11', endDate: 'Jul 15', docId: f1, docIds: [f1, f2] })
    const card = cardsIn('med-down').find(c => c.textContent!.includes('Ace'))
    expect(card, 'the two-file entry lists as down today').toBeTruthy()
    expect(card!.querySelector('.medcard-docn')!.textContent).toContain('2 documents')
    await act(async () => { setDocView(null); notify() })
    await click(card!)
    expect(DOCVIEW.row && DOCVIEW.row.docIds && DOCVIEW.row.docIds.length, 'the tapped row carries both files for the viewer to page').toBe(2)
    await act(async () => { setDocView(null); notify() })
  })
  it('picking an as-of date replays history, and Today returns', async () => {
    /* on 3 Jul shrek was DOWN (1–5 Jul) and yeti still on his ATT B; bane not yet */
    await act(async () => { setMedAsOf('2026-07-03'); notify() })
    expect($('.medsec.med-down').textContent).toContain('1–5 Jul')
    expect($('.medsec.med-pend').textContent).toContain('Nobody is owing an upchit')
    await click($('#medToday'))
    expect($('.medsec.med-pend').textContent).toContain('was down 1–5 Jul')
  })
  it('the month grid picks a date', async () => {
    await click($('#medCalBtn'))
    await click(document.querySelector('[data-medday="2026-07-03"]'))
    expect($('#medCalBtn').textContent).toContain('3 Jul')
    await click($('#medToday'))
  })
  /* D959 (the words pass, round 3): Medically Down and Pending Upchit carry no grey line — the heading and the as-of
     button say it; Upchit Complete keeps "the past 30 days, newest first", the only place that says older ones are not
     listed. D960: no card carries the placed line — the input's window says who placed it and when. */
  it('D959 D960 two sections lose their grey line, and no card says who placed it', async () => {
    await act(async () => { setMedAsOf(null); notify() })
    expect($('.medsec.med-down .medsec-sub'), 'Medically Down: no grey line').toBeNull()
    expect($('.medsec.med-pend .medsec-sub'), 'Pending Upchit: no grey line').toBeNull()
    expect($('.medsec.med-down .medsec-h').textContent).not.toMatch(/cannot fly/)
    expect($('.medsec.med-pend .medsec-h').textContent).not.toMatch(/still owed/)
    expect($('.medsec.med-done .medsec-sub').textContent).toBe('the past 30 days, newest first')
    expect($$('.medcard').length).toBeGreaterThan(0)
    for (const c of $$('.medcard')) expect(c.textContent, 'no placed line on a card').not.toMatch(/Placed by|\d\d:\d\d/)
    expect($$('[data-testid="medcard-placed"]')).toEqual([])
  })
  /* D960's period: one day says its day once; a period across two months names both; one running into the next year
     ends in that year (the row's yr anchors its start) */
  it('D960 a one-day entry says its day once, and a period across months names both', async () => {
    const one = await plant({ person: 'bane', type: 'OML', date: 'Aug 20' })
    const two = await plant({ person: 'shrek', type: 'ATT C', date: 'Aug 30', endDate: 'Sep 2' })
    await act(async () => { setMedAsOf('2026-08-20'); notify() })
    const oneCard = $(`.medcard[data-medcard="${one.iid}"]`)
    expect(oneCard.querySelector('.medcard-t')!.textContent).toBe('20 Aug')
    await act(async () => { setMedAsOf('2026-08-31'); notify() })
    expect($(`.medcard[data-medcard="${two.iid}"]`).querySelector('.medcard-t')!.textContent).toBe('30 Aug – 2 Sep')
    await act(async () => { setMedAsOf('2026-09-04'); notify() })
    expect($(`.medcard[data-medcard="${two.iid}"]`).querySelector('.medcard-t')!.textContent).toBe('was down 30 Aug – 2 Sep')
    await act(async () => { setMedAsOf(null); notify() })
  })
  /* Medical is a TAB of the Inputs page since the three tabs (D620, D626): it has no close cross of its own, and is
     left by choosing another tab */
  it('is left by choosing the Inputs tab', async () => {
    expect($('#medClose')).toBeNull()
    await click($('#inMemberMode'))
    expect($('#medView')).toBeNull()
  })
})
