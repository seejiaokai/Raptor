// @vitest-environment jsdom
/* THE BOARD'S CREW COLUMN SHOWS THE BOARD'S DAY (the absence-record re-test, W6's first walk of roll-call row R19,
   26 Sep 26 — on main). The scheduler board is about ONE day, but its crew column asked the edit week's question — the
   armed slot's day, else the day the week behind was scrolled to (`paletteDay()`, ui-contracts §The aircrew panel's
   day) — and on the board that header, and its day name, are not drawn. So on Thursday's board, with the week scrolled
   to Monday, a man on leave on Thursday showed as free and could be dragged on; "On leave but tasked" came only after.
   With nothing armed the board's column now answers for the board's own day; an armed slot still wins. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { setRosDay } from '../state/view'
import { openScheduler } from './board'
import { paletteHTML } from './palette-html'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
let host: HTMLDivElement, root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await act(async () => { ([...document.querySelectorAll('.nav a[data-page]')] as HTMLElement[]).find(a => a.dataset.page === 'editsched')!.click() })
})
afterAll(async () => { await act(async () => { root.unmount() }); host.remove() })

describe('the scheduler board draws its crew column for its own day', () => {
  it('with the week behind scrolled to Monday, Thursday’s board lists Thursday’s crew', async () => {
    await act(async () => { setRosDay(0); notify() })
    await act(async () => { openScheduler(3); notify() })
    const col = $('#sbRoster')
    expect(col, 'the board is up with its crew column').toBeTruthy()
    expect(paletteHTML(3, { head: false }), 'the demo week differs between Monday and Thursday').not.toBe(paletteHTML(0, { head: false }))
    /* the signed-in person's own puck gains its "me" mark after the draw (a decoration, not the day's answer) */
    const drawn = col.innerHTML.replace(/ me(?=")/g, '')
    expect(drawn).toBe(paletteHTML(3, { head: false }))
  })
})
