// @vitest-environment jsdom
/* AUDIT E — the Inputs table's date window (boundaries of the today → +2
   weeks promise), the heading sort's time-of-day ordering, DOM-vs-model row
   addressing under sort + a narrowed window, and the independence of the two
   RangeCal instances the page mounts (add form vs the #inRangeBtn window). */
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { InputsPage } from './InputsPage'
import { initStore, setSession, notify, writeInputs } from '../state/store'
import { INPUTS } from '../engine/inputs'
import { removeInput } from './inputedit'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const rowTexts = () => $$('#inBody tr').map(tr => tr.textContent || '')
const seed = (o: any) => { INPUTS.unshift({ allday: true, s: 0, e: 1439, type: 'LL', mod: '', remarks: '', ...o }) }
const clean = (mark: string) => {
  for (let i = INPUTS.length - 1; i >= 0; i--) if (String(INPUTS[i].remarks || '').startsWith(mark)) INPUTS.splice(i, 1)
  notify()
}
const showAllDates = async () => {
  if (!$('#inRangePop')) await click($('#inRangeBtn'))
  await click($('#inRangeAll'))
}

/* The clock is pinned INSIDE the demo week so the default window (today →
   today+14) has data under it and the boundary labels are knowable: today is
   Mon 13 Jul 26, the window is Jul 13 → Jul 27 inclusive on both edges. */
beforeAll(async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 6, 13, 9, 0, 0))
  initStore()
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<InputsPage />) })
})

describe('the window\'s edges — today → +14 days, overlap membership', () => {
  it('is inclusive at both ends, and hides one day past either', async () => {
    await act(async () => {
      seed({ person: 'bane', date: 'Jul 11', endDate: 'Jul 13', remarks: 'W-ENDS-TODAY' })
      seed({ person: 'bane', date: 'Jul 10', endDate: 'Jul 12', remarks: 'W-ENDED-YESTERDAY' })
      seed({ person: 'bane', date: 'Jul 27', remarks: 'W-STARTS-AT-EDGE' })
      seed({ person: 'bane', date: 'Jul 28', remarks: 'W-PAST-EDGE' })
      seed({ person: 'bane', date: 'Jul 1', endDate: 'Aug 30', remarks: 'W-SPANS-BOTH' })
      seed({ person: 'bane', date: 'Jul 13', remarks: 'W-SINGLE-TODAY' })
      notify()
    })
    const t = rowTexts().join('|')
    expect(t, 'a span ending exactly today is still live').toContain('W-ENDS-TODAY')
    expect(t, 'one that ended yesterday is not').not.toContain('W-ENDED-YESTERDAY')
    expect(t, 'a single day exactly at today+14 is inside').toContain('W-STARTS-AT-EDGE')
    expect(t, 'today+15 is outside').not.toContain('W-PAST-EDGE')
    expect(t, 'a span across both edges shows').toContain('W-SPANS-BOTH')
    expect(t, 'a single day today shows').toContain('W-SINGLE-TODAY')
  })

  it('All dates shows every seeded row, the out-of-window ones included', async () => {
    await showAllDates()
    const t = rowTexts().join('|')
    for (const m of ['W-ENDS-TODAY', 'W-ENDED-YESTERDAY', 'W-STARTS-AT-EDGE', 'W-PAST-EDGE', 'W-SPANS-BOTH', 'W-SINGLE-TODAY'])
      expect(t, m).toContain(m)
    /* back to the default window for the next test */
    await act(async () => { clean('W-') })
  })

  it('the window label survives an add, an edit and a delete without jumping', async () => {
    /* re-establish the mount default: initialRange is only read at mount, so
       remount fresh under the same clock */
    await act(async () => { createRoot(host.appendChild(document.createElement('div'))).render(<InputsPage />) })
    const btns = $$('#inRangeBtn')
    const btn = btns[btns.length - 1]
    const label = btn.textContent
    expect(label).toContain('13 Jul')
    expect(label).toContain('27 Jul')
    let r: any
    await act(async () => { writeInputs(() => { seed({ person: 'bane', date: 'Jul 14', remarks: 'W-STAY' }); r = INPUTS[0] }) })
    expect(btn.textContent, 'after an add').toBe(label)
    await act(async () => { writeInputs(() => { r.remarks = 'W-STAY 2' }) })
    expect(btn.textContent, 'after an edit').toBe(label)
    await act(async () => { removeInput(r) })
    expect(btn.textContent, 'after a delete').toBe(label)
  })
})

/* ---- the sort's promise: "two inputs on the same day order by time of day"
   (the comment above SORTKEY in InputsPage.tsx). The key appends the minutes
   with a TWO-digit pad, so 600 ('600') compares below 65 ('65') and an
   all-day end (1439) below a timed 65 — lexicographic, not numeric. */
describe('sorting within one day, by time of day', () => {
  beforeAll(async () => {
    await showAllDates()
    await act(async () => {
      seed({ person: 'bane', date: 'Jul 13', allday: false, s: 65, e: 100, remarks: 'S-0105' })   // 01:05–01:40
      seed({ person: 'bane', date: 'Jul 13', allday: false, s: 600, e: 660, remarks: 'S-1000' })  // 10:00–11:00
      seed({ person: 'bane', date: 'Jul 13', allday: false, s: 60, e: 65, remarks: 'S-END-0105' }) // ends 01:05
      seed({ person: 'bane', date: 'Jul 13', remarks: 'S-ALLDAY' })                                // ends 23:59
      notify()
    })
    /* two clicks land start ascending whatever an earlier test left */
    await click($('#intbl thead th[data-sort="start"]'))
    if ($('#intbl thead th[data-sort="start"]').getAttribute('aria-sort') !== 'ascending')
      await click($('#intbl thead th[data-sort="start"]'))
  })

  it('start ascending puts 01:05 before 10:00 on the same day', () => {
    const t = rowTexts()
    const a = t.findIndex(x => x.includes('S-0105'))
    const b = t.findIndex(x => x.includes('S-1000'))
    expect(a, 'both rows visible').toBeGreaterThanOrEqual(0)
    expect(b).toBeGreaterThanOrEqual(0)
    expect(a, '01:05 sorts before 10:00').toBeLessThan(b)
  })

  it('end ascending puts an 01:05 end before an all-day (23:59) end on the same day', async () => {
    await click($('#intbl thead th[data-sort="end"]'))
    if ($('#intbl thead th[data-sort="end"]').getAttribute('aria-sort') !== 'ascending')
      await click($('#intbl thead th[data-sort="end"]'))
    const t = rowTexts()
    const timed = t.findIndex(x => x.includes('S-END-0105'))
    const allday = t.findIndex(x => x.includes('S-ALLDAY'))
    expect(timed).toBeGreaterThanOrEqual(0)
    expect(allday).toBeGreaterThanOrEqual(0)
    expect(timed, 'an end at 01:05 sorts before an end at 23:59').toBeLessThan(allday)
    await act(async () => { clean('S-') })
    await click($('#intbl thead th[data-sort="start"]'))
  })
})

/* ---- DOM order is NOT model order: the buttons carry model indices, and the
   action must land on the row CLICKED, whatever the sort and the window say. */
describe('DOM-vs-model addressing under sort and a narrowed window', () => {
  beforeAll(async () => {
    await showAllDates()
    await act(async () => {
      /* three rows whose DOM order under a name-sort differs from model order */
      seed({ person: 'yeti', date: 'Jul 15', remarks: 'A-YETI' })
      seed({ person: 'bane', date: 'Jul 16', remarks: 'A-BANE' })
      seed({ person: 'stiff', date: 'Jul 14', remarks: 'A-STIFF' })
      notify()
    })
  })

  it('delete hits the row clicked after sorting by name descending', async () => {
    await click($('#intbl thead th[data-sort="name"]'))
    await click($('#intbl thead th[data-sort="name"]'))   // descending
    const row = $$('#inBody tr').find(tr => (tr.textContent || '').includes('A-YETI'))!
    const n = INPUTS.length
    await click(row.querySelector('[data-inx]'))
    expect(INPUTS.length).toBe(n - 1)
    expect(INPUTS.some((r: any) => r.remarks === 'A-YETI'), 'the clicked row went').toBe(false)
    expect(INPUTS.some((r: any) => r.remarks === 'A-BANE'), 'its neighbours stayed').toBe(true)
    expect(INPUTS.some((r: any) => r.remarks === 'A-STIFF')).toBe(true)
  })

  it('edit + save hits the row clicked even after a lower-indexed input is deleted mid-edit', async () => {
    const row = $$('#inBody tr').find(tr => (tr.textContent || '').includes('A-BANE'))!
    await click(row.querySelector('[data-edit]'))
    expect($('#inBody tr.ined')).toBeTruthy()
    /* a DIFFERENT input is deleted while the editor is open — every model
       index below it shifts down one */
    const victim = INPUTS.find((r: any) => r.remarks === 'A-STIFF')
    await act(async () => { removeInput(victim) })
    const rm = $('#inBody tr.ined [data-ed="remarks"]') as HTMLInputElement
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    await act(async () => { setter.call(rm, 'A-BANE EDITED'); rm.dispatchEvent(new Event('input', { bubbles: true })) })
    await click($('#inBody tr.ined [data-save]'))
    expect(INPUTS.some((r: any) => r.remarks === 'A-BANE EDITED'), 'the edit landed on the opened row').toBe(true)
    expect(INPUTS.some((r: any) => r.remarks === 'A-YETI EDITED' || r.remarks === 'A-STIFF EDITED'), 'and nowhere else').toBe(false)
    await act(async () => { clean('A-') })
    await click($('#intbl thead th[data-sort="start"]'))
  })
})

/* ---- the two calendars on the page are separate state ---- */
describe('the add form\'s calendar and the window picker do not share state', () => {
  it('picking a table window leaves the add form\'s pick alone, and vice versa', async () => {
    /* pick dates on the add form */
    await click($('#inCal [data-cal="2026-07-14"]'))
    await click($('#inCal [data-cal="2026-07-16"]'))
    expect($('#inDates').textContent).toBe('14 Jul → 16 Jul')
    /* now narrow the table window on the other calendar */
    if (!$('#inRangePop')) await click($('#inRangeBtn'))
    await click($('#inRangeCal [data-cal="2026-07-20"]'))
    await click($('#inRangeCal [data-cal="2026-07-22"]'))
    expect($('#inDates').textContent, 'the form pick is untouched').toBe('14 Jul → 16 Jul')
    expect($('#inRangeBtn').textContent).toContain('20 Jul')
    /* and re-picking on the form does not move the window */
    await click($('#inCal [data-cal="2026-07-17"]'))
    expect($('#inRangeBtn').textContent, 'the window is untouched').toContain('20 Jul')
    await showAllDates()
  })
})
