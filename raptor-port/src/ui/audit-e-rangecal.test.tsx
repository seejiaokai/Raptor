// @vitest-environment jsdom
/* AUDIT E — RangeCal on its own: a range across a month boundary, backwards
   clicks across months, a same-day range, and the untouched picker opening on
   the demo month whatever the clock says. */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { RangeCal } from './RangeCal'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let picked: { s: string, e: string }
function Harness() {
  const [r, setR] = useState({ s: '', e: '' })
  picked = r
  return <RangeCal idPrefix="au" start={r.s} end={r.e}
    onPick={(s, e) => setR({ s, e })} />
}
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const day = (iso: string) => $(`#auCal [data-cal="${iso}"]`)

beforeEach(async () => {
  document.body.innerHTML = ''
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<Harness />) })
})

describe('RangeCal', () => {
  it('opens on the demo month even when the clock is somewhere else', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 12))
    document.body.innerHTML = ''
    host = document.createElement('div')
    document.body.appendChild(host)
    await act(async () => { createRoot(host).render(<Harness />) })
    expect($('#auCal .rc-mon').textContent).toBe('Jul 2026')
    vi.useRealTimers()
  })

  it('takes a range across a month boundary, and each month marks its own days', async () => {
    await click(day('2026-07-30'))
    expect(picked).toEqual({ s: '2026-07-30', e: '' })
    await click($('#auCal .rc-nav[aria-label="Next month"]'))
    expect($('#auCal .rc-mon').textContent).toBe('Aug 2026')
    await click(day('2026-08-02'))
    expect(picked, 'the range closed across the boundary').toEqual({ s: '2026-07-30', e: '2026-08-02' })
    /* August's first is BETWEEN the ends and is marked so */
    expect(day('2026-08-01').classList.contains('mid')).toBe(true)
    expect(day('2026-08-02').classList.contains('e')).toBe(true)
    /* July's own view still marks the start */
    await click($('#auCal .rc-nav[aria-label="Previous month"]'))
    expect(day('2026-07-30').classList.contains('s')).toBe(true)
    expect(day('2026-07-31').classList.contains('mid')).toBe(true)
  })

  it('a backwards second click across months becomes the new start', async () => {
    await click($('#auCal .rc-nav[aria-label="Next month"]'))
    await click(day('2026-08-05'))
    expect(picked).toEqual({ s: '2026-08-05', e: '' })
    await click($('#auCal .rc-nav[aria-label="Previous month"]'))
    await click(day('2026-07-20'))
    expect(picked, 'earlier than the start — cannot be an end').toEqual({ s: '2026-07-20', e: '' })
    await click(day('2026-07-22'))
    expect(picked).toEqual({ s: '2026-07-20', e: '2026-07-22' })
  })

  it('two clicks on one day are a one-day range, marked start and end at once', async () => {
    await click(day('2026-07-15'))
    await click(day('2026-07-15'))
    expect(picked).toEqual({ s: '2026-07-15', e: '2026-07-15' })
    expect(day('2026-07-15').classList.contains('s')).toBe(true)
    expect(day('2026-07-15').classList.contains('e')).toBe(true)
    expect($$('#auCal .rc-d.mid'), 'nothing between a day and itself').toHaveLength(0)
    /* and a third click starts fresh rather than sticking */
    await click(day('2026-07-18'))
    expect(picked).toEqual({ s: '2026-07-18', e: '' })
  })

  it('the "go to today" button pages to the notional today month and rings it, without picking', async () => {
    /* walk away from the demo month first */
    for (let i = 0; i < 4; i++) await click($('#auCal .rc-nav[aria-label="Next month"]'))
    expect($('#auCal .rc-mon').textContent).toBe('Nov 2026')
    await click($('#auCal .rc-today'))
    /* back on the notional today month (weeknav TODAY = 13 Jul 2026), 13 ringed */
    expect($('#auCal .rc-mon').textContent).toBe('Jul 2026')
    expect(day('2026-07-13').classList.contains('today')).toBe(true)
    /* it did NOT pick — no range was set */
    expect(picked).toEqual({ s: '', e: '' })
    expect($$('#auCal .rc-d.s')).toHaveLength(0)
  })

  it('year rollover: stepping back from January lands on December of the year before', async () => {
    for (let i = 0; i < 7; i++) await click($('#auCal .rc-nav[aria-label="Previous month"]'))
    expect($('#auCal .rc-mon').textContent).toBe('Dec 2025')
    expect(day('2025-12-31'), 'the grid speaks that year\'s ISO dates').toBeTruthy()
  })
})
