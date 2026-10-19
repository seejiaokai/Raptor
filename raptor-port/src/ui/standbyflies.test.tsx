// @vitest-environment jsdom
/* THE FLIES CHIP ON A STANDBY ROW ([STANDBY-FLIES], owner D1060, D1061, D1063, D1064, D1065, 19 Oct 26 — drawn on the
   real app and approved as drawn: docs/img/handpass/2026-10-19-standby-flies/mock/).

   A lit "✓ FLIES" beside the MAIN / SPARE badge on a row that flies, on all three screens; a dashed "FLIES" — the button
   that ticks a row by hand — on the Scheduler Board only ("less clutter for something that rarely happens", D1064); a
   row lit because its shift has a B or R typed is no button (it is taken out with CX, D1046); the tap is an ordinary
   change that a published day holds as pending. Same preamble as sarole.test.tsx — no shared helper module. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, setPage } from '../state/store'
import { DAYS } from '../engine/data'
import { ridKey } from '../engine/rowids'
import { makeStandalone, saFlies } from '../engine/waves'
import { SCHED } from '../engine/publish'
import { dayHTML } from './html'
import { boardHTML, openScheduler } from './board'
import { peekDayHTML } from './peek'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const rk = (k: string) => ridKey(k, DAYS)
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const count = (h: string, re: RegExp) => (h.match(re) || []).length
/* on Edit Schedule, as the board is opened from it — set before every board read (sarole.test.tsx does the same) */
const edit = async () => { await act(async () => { setPage('editsched'); notify() }) }

let WI = -1
beforeAll(async () => {
  initStore()
  const sc: any = makeStandalone('sc')!
  sc.formations[0].aircraft[0].p = 'split'; sc.formations[0].aircraft[2].p = 'stuff'
  sc.formations[1].aircraft[0].p = 'bullet'; sc.formations[1].aircraft[2].p = 'glass'
  DAYS[0].waves.push(sc)
  WI = DAYS[0].waves.length - 1
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await act(async () => { setPage('editsched'); notify() })
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
})

const F = (li: number) => DAYS[0].waves[WI].formations[li]
const LIT = new RegExp(`class="sarole saflies on[^"]*"[^>]*>✓ FLIES<`, 'g')
const DASHED_ = () => new RegExp(`<button class="sarole saflies sp" data-safly="0\\.${WI}\\.`, 'g')

describe('SF7 — nothing typed: the board offers the tick, the week shows nothing (D1064)', () => {
  it('the board: a dashed FLIES button on each of the eight rows, none lit', async () => {
    await edit()
    const h = boardHTML(0)
    expect(count(h, DASHED_())).toBe(8)
    expect(count(h, LIT)).toBe(0)
  })
  it('Edit Schedule\'s week and View-only Sched: no Flies chip at all', () => {
    for (const ed of [true, false]) {
      const h = dayHTML(0, ed)
      expect(h, String(ed)).not.toContain('saflies')
    }
  })
  it('an ordinary flying line never carries one', () => {
    expect(boardHTML(0)).not.toMatch(/data-safly="0\.0\./)
  })
})

describe('SF2 SF7 SF10 — a hand tick (D1061)', () => {
  it('the board\'s button ticks one row — lit on all three screens, the rest of its shift untouched — and a second tap takes it off', async () => {
    await edit()
    await act(async () => { openScheduler(0); notify() })
    const btn = document.querySelector(`[data-safly="0.${WI}.1.2"]`) as HTMLElement
    expect(btn.tagName).toBe('BUTTON')
    expect(btn.getAttribute('aria-pressed')).toBe('false')
    await click(btn)
    const f = F(1)
    expect(f.aircraft[2].fly).toBe(true)
    expect(f.aircraft.map((a: any) => saFlies(DAYS[0].waves[WI], f, a))).toEqual([false, false, true, false])
    expect(SCHED.pending[rk(`st:0.${WI}.1.2`)], 'an ordinary change, held for the next amendment').toBeTruthy()
    const b2 = document.querySelector(`[data-safly="0.${WI}.1.2"]`) as HTMLElement
    expect(b2.textContent).toBe('✓ FLIES')
    expect(b2.getAttribute('aria-pressed')).toBe('true')
    for (const ed of [true, false]) expect(count(dayHTML(0, ed), LIT), `week ${ed}: one lit, read only`).toBe(1)
    expect(dayHTML(0, true)).not.toContain('data-safly')
    await click(b2)
    expect(f.aircraft[2].fly).toBeUndefined()
    expect(count(boardHTML(0), LIT)).toBe(0)
  })
})

describe('SF1 SF3 SF7 — a shift with its R typed flies whole (D1044, D1045, D1046)', () => {
  it('every row of AM lit, on every screen; on the board none is a button — CX takes a row out', async () => {
    await edit()
    F(0).rl = '06:30'
    try {
      const b = boardHTML(0)
      expect(count(b, LIT)).toBe(4)
      expect(b).not.toMatch(new RegExp(`data-safly="0\\.${WI}\\.0\\.`))
      expect(b).toMatch(/title="Flies: this shift has its B or R typed\. A row that does not come in is cancelled with CX\."/)
      expect(count(b, DASHED_()), 'PM still offers the tick').toBe(4)
      for (const ed of [true, false]) expect(count(dayHTML(0, ed), LIT), String(ed)).toBe(4)
      F(0).aircraft[3].cx = true
      expect(count(boardHTML(0), LIT), 'a cancelled row shows nothing').toBe(3)
    } finally { F(0).rl = ''; delete F(0).aircraft[3].cx }
  })
})

describe('SF4 — an AVALON / BB wave head says it flies, not "checks only" (walker B, 19 Oct 26)', () => {
  it('the week and the peek: "· flies" once a row flies; the standby words while none does', () => {
    const av: any = makeStandalone('avalon')!
    DAYS[0].waves.push(av)
    try {
      expect(dayHTML(0, false)).toContain('availability, currency and seat checks only')
      av.formations[0].rl = '18:30'
      const h = dayHTML(0, false)
      expect(h).toMatch(/standalone · flies</)
      expect(peekDayHTML(DAYS[0], 0, true)).toMatch(/standalone · flies</)
    } finally { DAYS[0].waves.pop() }
  })
})

describe('SF7 — the next-week peek shows a flying row, read only (D1063)', () => {
  it('"✓ FLIES" before the row\'s words; nothing on a row standing by', () => {
    F(0).rl = '06:30'
    try {
      const h = peekDayHTML(DAYS[0], 0, true)
      expect(count(h, /✓ FLIES · /g)).toBe(4)
    } finally { F(0).rl = '' }
    expect(peekDayHTML(DAYS[0], 0, true)).not.toContain('FLIES')
  })
})
