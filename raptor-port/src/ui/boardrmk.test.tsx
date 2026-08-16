// @vitest-environment jsdom
/* EVERY REMARKS BOX SHOWS AT ALL TIMES (owner, 16 Aug 26).

   The phone board used to HIDE an empty remarks box on a duty/sim/ground row
   and reveal one at a time behind a "+" on the row's control strip (RMKOPEN).
   The owner asked for every remarks box to sit beside the pucks on their own
   row instead — where an empty one costs no extra line — so the reveal, its
   "+" button and the RMKOPEN state are all gone: the box is drawn on every row
   at all times, empty or not, on both surfaces and at every width.

   jsdom has no layout engine, so what this file proves is the markup and the
   wiring: that every c6r row carries a `.rmkin` input with no `.empty` class,
   that no `.rmkadd` "+" button is emitted anywhere, and that typing a remark
   commits it through the funnel. What it looks like painted (the box riding
   the pucks' row, aligned under Start) is `e2e/geometry.spec.ts`. */
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { elogClear } from '../engine/editlog'
import { openScheduler } from './board'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const change = async (el: Element, value: string) => {
  await act(async () => {
    (el as HTMLInputElement).value = value
    el.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

beforeAll(async () => {
  initStore()
  const host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})

beforeEach(async () => {
  /* every duty row on DAYS[0] starts with no rmks in the fixture data, so
     each test clears whatever the last one wrote back to blank */
  DAYS[0].dutywaves[0].rows.forEach((r: any) => { delete r.rmks })
  elogClear()
  SCHED.pending = {}
  await act(async () => { openScheduler(0); notify() })
})

const dutyRow = (ri: number) => $(`#sbBoard .sb-panel.duty .sb-arow.c6r[data-move="mv:d.0.0.${ri}"]`)
const rmkIn = (ri: number) => dutyRow(ri).querySelector('.rmkin') as HTMLInputElement

describe('the remarks box is always drawn, and the + reveal is gone', () => {
  it('an empty duty row still renders its remarks input, with no .empty class', () => {
    expect(DAYS[0].dutywaves[0].rows.length, 'the fixture needs at least two rows').toBeGreaterThanOrEqual(2)
    expect(rmkIn(0), 'the box is drawn even when empty').toBeTruthy()
    expect(rmkIn(0).classList.contains('empty'), 'and never carries the retired .empty hide').toBe(false)
    expect(rmkIn(0).getAttribute('placeholder'), 'a faded Remarks placeholder says what it is').toBe('Remarks')
    expect(rmkIn(0).dataset.bfld).toBe('dr:0.0.0.rmks')
  })

  it('every remarks box on the board carries no .empty and there is no + button anywhere', () => {
    const boxes = $$('#sbBoard .rmkin')
    expect(boxes.length, 'the board draws remarks boxes').toBeGreaterThan(0)
    expect(boxes.every(b => !b.classList.contains('empty')), 'none are marked empty-hidden').toBe(true)
    expect($$('#sbBoard [data-rmkadd]').length, 'the reveal + is gone').toBe(0)
    expect($$('#sbBoard .rmkadd').length, 'no rmkadd button class either').toBe(0)
  })

  it('a row with a remark shows it in the box', async () => {
    DAYS[0].dutywaves[0].rows[0].rmks = 'Covering the late brief'
    await act(async () => { notify() })
    expect(rmkIn(0).value).toBe('Covering the late brief')
    expect(rmkIn(0).classList.contains('empty')).toBe(false)
  })

  it('typing a remark commits through the funnel', async () => {
    await change(rmkIn(0), 'Standing in for Bane')
    expect(DAYS[0].dutywaves[0].rows[0].rmks).toBe('Standing in for Bane')
    expect(rmkIn(0).classList.contains('empty')).toBe(false)
  })
})
