// @vitest-environment jsdom
/* AUDIT E — RangeCal on its own: a range across a month boundary, backwards
   clicks across months, a same-day range, and the untouched picker opening on
   the demo month whatever the clock says. Since step two of the app's one date calendar (D901, 15 Oct 26) RangeCal
   IS that calendar: the same behaviour, found by the new parts
   (docs/superpowers/briefs/2026-10-15-calendar-step-two-test-map.md). */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { RangeCal } from './RangeCal'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
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
const day = (iso: string) => $(`#auCal [data-iso="${iso}"]`)
/** the month shown, "yyyy-mm" */
const month = () => $('[data-testid="auCal"]').getAttribute('data-month')
const NEXT = '[data-testid="auCal-next"]'
const PREV = '[data-testid="auCal-prev"]'

beforeEach(async () => {
  document.body.innerHTML = ''
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<Harness />) })
})

/* Unmount after every test: a render task left queued by the last test
   would otherwise fire after vitest tears jsdom down and die with "window is
   not defined" — an unhandled error that fails the job while every test
   passed (the teardown race closed across the suite, 10 Sep 26). Root is
   per-test here (beforeEach), so the unmount pairs with afterEach. */
afterEach(async () => {
  await act(async () => { root.unmount() })
  host.remove()
})

describe('RangeCal', () => {
  it('opens on the demo month even when the clock is somewhere else', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 12))
    document.body.innerHTML = ''
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
    await act(async () => { root.render(<Harness />) })
    expect(month()).toBe('2026-07')
    vi.useRealTimers()
  })

  it('takes a range across a month boundary, and each month marks its own days', async () => {
    await click(day('2026-07-30'))
    expect(picked).toEqual({ s: '2026-07-30', e: '' })
    await click($(NEXT))
    expect(month()).toBe('2026-08')
    await click(day('2026-08-02'))
    expect(picked, 'the range closed across the boundary').toEqual({ s: '2026-07-30', e: '2026-08-02' })
    /* August's first is BETWEEN the ends and is marked so */
    expect(day('2026-08-01').classList.contains('is-mid')).toBe(true)
    expect(day('2026-08-02').classList.contains('is-to')).toBe(true)
    /* July's own view still marks the start */
    await click($(PREV))
    expect(day('2026-07-30').classList.contains('is-from')).toBe(true)
    expect(day('2026-07-31').classList.contains('is-mid')).toBe(true)
  })

  it('a backwards second click across months becomes the new start', async () => {
    await click($(NEXT))
    await click(day('2026-08-05'))
    expect(picked).toEqual({ s: '2026-08-05', e: '' })
    await click($(PREV))
    await click(day('2026-07-20'))
    expect(picked, 'earlier than the start — cannot be an end').toEqual({ s: '2026-07-20', e: '' })
    await click(day('2026-07-22'))
    expect(picked).toEqual({ s: '2026-07-20', e: '2026-07-22' })
  })

  it('two clicks on one day are a one-day range, marked start and end at once', async () => {
    await click(day('2026-07-15'))
    await click(day('2026-07-15'))
    expect(picked).toEqual({ s: '2026-07-15', e: '2026-07-15' })
    /* one disc for a run of one day: the picked look, no band */
    expect(day('2026-07-15').classList.contains('is-sel')).toBe(true)
    expect(day('2026-07-15').classList.contains('is-in')).toBe(false)
    expect($$('#auCal .dcal-d.is-mid'), 'nothing between a day and itself').toHaveLength(0)
    /* and a third click starts fresh rather than sticking */
    await click(day('2026-07-18'))
    expect(picked).toEqual({ s: '2026-07-18', e: '' })
  })

  it('the "go to today" button pages to the notional today month and rings it, without picking', async () => {
    /* walk away from the demo month first */
    for (let i = 0; i < 4; i++) await click($(NEXT))
    expect(month()).toBe('2026-11')
    await click($('[data-testid="auCal-today"]'))
    /* back on the notional today month (weeknav TODAY = 13 Jul 2026), 13 ringed */
    expect(month()).toBe('2026-07')
    expect(day('2026-07-13').classList.contains('is-today')).toBe(true)
    /* it did NOT pick — no range was set */
    expect(picked).toEqual({ s: '', e: '' })
    expect($$('#auCal .dcal-d.is-sel')).toHaveLength(0)
  })

  it('year rollover: stepping back from January lands on December of the year before', async () => {
    for (let i = 0; i < 7; i++) await click($(PREV))
    expect(month()).toBe('2025-12')
    expect(day('2025-12-31'), 'the grid speaks that year\'s ISO dates').toBeTruthy()
  })
})
