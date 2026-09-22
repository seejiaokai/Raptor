// @vitest-environment jsdom
/* D50 — A SIM ROW ALWAYS SHOWS ONE SPARE SEAT, EVEN WHEN IT IS FULL.
   Owner, 22 Sep 26, during the walk: "Keep one spare seat showing".
   Sheet: docs/handpass/2026-09-22-oil-seats.md §6 finding 3.

   THE FAULT THIS PINS. Every other kind of row carries a thin drop strip under
   its people, so there is always somewhere that means "another body". The sim
   seat grid deliberately does not — `.schedboard .ppl.fcprcp .addz{display:none}`
   — and it padded its seats to an EVEN count, which leaves a spare only when the
   count is ODD. So a sim row holding an even number of people had no empty seat
   and no strip: the drag a scheduler would naturally make landed on a seated man
   and REPLACED him, with nothing on screen to say so.

   The gap is PRE-EXISTING; what changed is that [OIL-SEATS-CAN-EARN] step 5 made
   that seat pay real people, so the promise that a placeholder on a sim row
   counts the men it stands for could not be exercised through the screen at all.

   It costs one row of height on a full sim row. The owner was shown that cost
   and chose it over filing the gap.

   THE RULE, as it is built: the cell always contains at least one EMPTY seat. On
   a row where a real seat is already empty that seat IS the door and nothing is
   added — the height is only spent where it buys something. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import * as view from '../state/view'
import { DAYS } from '../engine/data'
import { boardHTML } from './board'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const DSNAP = JSON.stringify(DAYS)
const MON = 0

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'ad', role: 'admin' }); view.setPage('editsched'); notify() })
})
afterAll(async () => { await act(async () => { root.unmount() }); host.remove() })
beforeEach(() => { DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d)) })

const el = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
const cellOf = (html: string, fill: string) =>
  el(html).querySelector(`[data-fill="${fill}"]`) as HTMLElement | null
const emptiesIn = (c: HTMLElement | null) => c ? c.querySelectorAll('.sb-slot.empty').length : -1

/** An OFT row with both crew seats filled and `more` extras — the shape whose
 *  even counts had no door. */
const oft = (more: string[]) => {
  ;(DAYS[MON] as any).sims = { oft: [{ ac: 'EP-9', str: '0800', end: '1000', p: 'bane', w: 'stiff', more }], amt: [] }
  return 's:0.oft.0.+'
}
/** An AMT BOX row carrying `n` passengers, all of them real people. */
const amt = (pax: string[]) => {
  ;(DAYS[MON] as any).sims = { oft: [], amt: [{ label: 'BOX', str: '0800', end: '1000', pax }] }
  return 's:0.amt.0.+'
}

describe('a sim row that is exactly full still offers a seat for another body', () => {
  it('OFT — both seats taken and an EVEN number of extras: there is still a spare', () => {
    const fill = oft(['wolf', 'rocky'])
    const c = cellOf(boardHTML(MON), fill)
    expect(c, 'the row draws its seat grid').toBeTruthy()
    expect(emptiesIn(c), 'the row is full, so a spare pair is opened below it').toBeGreaterThan(0)
  })

  it('OFT — both seats taken and NO extras: the door is there too', () => {
    const fill = oft([])
    const c = cellOf(boardHTML(MON), fill)
    expect(emptiesIn(c), 'the commonest full sim row of all').toBeGreaterThan(0)
  })

  it('AMT — an EVEN number of passengers, all seated: there is still a spare', () => {
    const fill = amt(['bane', 'stiff'])
    const c = cellOf(boardHTML(MON), fill)
    expect(emptiesIn(c)).toBeGreaterThan(0)
  })

  it('the spare is a REAL drop target, addressed like every other seat', () => {
    const fill = oft(['wolf', 'rocky'])
    const c = cellOf(boardHTML(MON), fill)!
    const spare = c.querySelector('.sb-slot.empty') as HTMLElement
    expect(spare.getAttribute('data-slot'), 'it carries the row\'s own slot address').toMatch(/^s:0\.oft\.0\./)
    expect(spare.getAttribute('title') || '', 'and says what it is for').toBeTruthy()
  })
})

describe('what it does NOT do', () => {
  it('an ODD row is unchanged — it already showed exactly one spare', () => {
    const fill = oft(['wolf'])
    const c = cellOf(boardHTML(MON), fill)
    expect(emptiesIn(c), 'one, as before — no extra row of height bought for nothing').toBe(1)
  })

  it('a row with a real seat already empty gains nothing — that seat IS the door', () => {
    ;(DAYS[MON] as any).sims = { oft: [{ ac: 'EP-9', str: '0800', end: '1000', p: 'bane', w: '', more: [] }], amt: [] }
    const c = cellOf(boardHTML(MON), 's:0.oft.0.+')
    expect(emptiesIn(c), 'the empty RCP, and nothing added beneath it').toBe(1)
  })

  it('a BRIEF / DEBRIEF row still draws no seats at all', () => {
    ;(DAYS[MON] as any).sims = { oft: [], amt: [{ label: 'BRIEF', str: '0800', end: '0830' }] }
    const c = el(boardHTML(MON)).querySelector('.sb-panel.simr .ppl.fcprcp')
    expect(c, 'a time-only row has no crew, so no grid').toBeFalsy()
  })

  it('a READ-ONLY board offers no spare — it offers no seats at all', () => {
    oft(['wolf', 'rocky'])
    const c = cellOf(boardHTML(MON, true), 's:0.oft.0.+')
    expect(c, 'a frozen preview has no drop targets to fill').toBeFalsy()
    expect(el(boardHTML(MON, true)).querySelectorAll('.sb-slot.empty').length, 'none anywhere').toBe(0)
  })
})
