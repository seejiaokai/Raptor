// @vitest-environment jsdom
/* The My Programme page (owner, 7 Aug 26): one person's week as day cards —
   the page most of the squadron logs in for. "Me" is the view-as person; the
   engine's own per-person index (dayEvents) feeds the timeline, personWarns
   the issue rows, traceOf the cross-day mark. These tests pin the content
   rules; the geometry (single column on a phone, no sideways scroll) is the
   e2e gate's job, since jsdom has no layout. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { validate, dayEvents, traceOf, traceIx } from '../engine/validate'
import { personWarns } from '../engine/avail'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { ME, setMe } from '../state/auth'
import * as view from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

beforeAll(async () => {
  ;(Element.prototype as any).scrollIntoView = function () {}
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  validate()
})

beforeEach(async () => {
  await act(async () => { view.selDrop(); view.setPage('myprog'); setMe('bane'); notify() })
})

describe('the My Programme page', () => {
  it('is reachable from the nav and renders a card per day', () => {
    expect($('#topnav [data-page="myprog"]'), 'the topbar link exists').toBeTruthy()
    expect($$('#page-myprog .mpday').length).toBe(DAYS.length)
  })

  it('shows the timeline of the view-as person, in start order', () => {
    /* find a day where bane has at least two events, so order is provable */
    const di = DAYS.findIndex((_: any, i: number) => dayEvents(i, 'bane').length >= 2)
    expect(di, 'the seed gives bane a busy day').toBeGreaterThanOrEqual(0)
    const want = [...dayEvents(di, 'bane')].sort((a: any, b: any) => a.s - b.s).map((e: any) => e.label)
    const got = [...$$('#page-myprog .mpday')[di].querySelectorAll('.mpev .lb')]
      .map(el => (el.childNodes[0].textContent || '').trim())
    expect(got).toEqual(want)
  })

  it('a sortie carries the four times aircrew plan around', () => {
    const di = DAYS.findIndex((_: any, i: number) => dayEvents(i, 'bane').some((e: any) => e.kind === 'fly'))
    expect(di, 'bane flies somewhere in the seed').toBeGreaterThanOrEqual(0)
    const card = $$('#page-myprog .mpday')[di]
    const sub = card.querySelector('.mpev.fly .mpsub') as HTMLElement
    expect(sub, 'the fly row grows the sub-line').toBeTruthy()
    for (const w of ['report', 'brief', 'T/O', 'land']) expect(sub.textContent).toContain(w)
  })

  it('a person with nothing on a day gets an honest empty state', () => {
    /* build the case rather than hoping: someone with a free day exists */
    const hit = Object.keys(PEOPLE).find(id => !PEOPLE[id].archived
      && DAYS.some((_: any, i: number) => dayEvents(i, id).length === 0))
    expect(hit, 'someone has a free day in the seed').toBeTruthy()
    act(() => { setMe(hit!); notify() })
    const di = DAYS.findIndex((_: any, i: number) => dayEvents(i, hit!).length === 0)
    expect($$('#page-myprog .mpday')[di].textContent).toContain('Nothing tasked')
  })

  it('the in-page view-as switches the whole page to that person', async () => {
    const other = Object.keys(PEOPLE).find(id => id !== 'bane' && !PEOPLE[id].archived)!
    await act(async () => {
      const sel = $('#mpViewAs') as HTMLSelectElement
      sel.value = other
      sel.dispatchEvent(new Event('change', { bubbles: true }))
    })
    expect(ME).toBe(other)
    expect($('#page-myprog .mphdr .cs').textContent).toBe(PEOPLE[other].cs)
  })

  it('his inputs show with their actioned state', () => {
    /* the seed carries inputs; pick any person+day an input covers */
    const inp: any = INPUTS.find((i: any) => PEOPLE[i.person])
    expect(inp, 'the seed has inputs').toBeTruthy()
    act(() => { setMe(inp.person); notify() })
    const txt = $('#page-myprog').textContent!
    expect(txt).toMatch(/actioned|pending|Away/)
  })

  it('free text renders as text, never as markup', async () => {
    /* the security axis: a hostile remark must come out inert. INPUTS remarks
       are the free-text field this page prints. */
    const inp: any = INPUTS.find((i: any) => PEOPLE[i.person])
    const saved = inp.remarks
    inp.remarks = '<img src=x onerror=alert(1)>'
    try {
      await act(async () => { setMe(inp.person); notify() })
      expect($('#page-myprog').querySelector('img'), 'no element got created').toBeNull()
      expect($('#page-myprog').textContent).toContain('<img src=x')
    } finally { inp.remarks = saved; await act(async () => { notify() }) }
  })

  it('a warning row jumps to the week, focused on that warning', async () => {
    /* bane is flagged in the seed; his card carries the row */
    const di = DAYS.findIndex((_: any, i: number) => personWarns(i, 'bane').length > 0)
    expect(di, 'bane is flagged somewhere').toBeGreaterThanOrEqual(0)
    const row = $$('#page-myprog .mpday')[di].querySelector('.witem[data-myw]') as HTMLElement
    expect(row, 'the card carries his warning').toBeTruthy()
    const [wdi, wix] = String(row.dataset.myw).split('.').map(Number)
    await click(row)
    expect(view.CURPAGE, 'the page left for the week').toBe('viewsched')
    expect(view.WFOCUS && view.WFOCUS.di, 'focused on the warning\'s day').toBe(wdi)
    expect(view.WFOCUS.ix).toBe(wix)
    expect(view.DWOPEN.has(wdi), 'its box is open, so Clear focus renders').toBe(true)
  })

  it('the cross-day crew-rest mark rides on the causing day\'s card', () => {
    const di = DAYS.findIndex((_: any, i: number) =>
      Object.keys(PEOPLE).some(id => traceOf(i, id)))
    expect(di, 'the seed traces a breach back a day').toBeGreaterThanOrEqual(0)
    const id = Object.keys(PEOPLE).find(x => traceOf(di, x))!
    act(() => { setMe(id); notify() })
    const row = $$('#page-myprog .mpday')[di].querySelector('.dwtrace .witem[data-myw]') as HTMLElement
    expect(row, 'the Breaks-tomorrow row is on his causing day').toBeTruthy()
    const t = traceOf(di, id)
    expect(row.dataset.myw, 'addressed at the breach day\'s warning')
      .toBe(`${t.di}.${traceIx(t, id)}`)
  })
})
