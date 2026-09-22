// @vitest-environment jsdom
/* D19's WAY OUT HAS TO SIT BESIDE THE REASON ON BOTH SURFACES
   (walk find, 22 Sep 26).

   The check "There is no leave war period for 2028, so no OIL can be paid for
   this day — create the period on the Leave War" is drawn in TWO places: the
   week's per-day list (`dayWarnHTML`, ui/html.ts) and the board's side panel
   (`boardWarnHTML`, ui/board.ts). Only the week's rows carried the action.

   Measured in the running app on Sat 6 Feb 28 (2026 AND 2027 are both held by
   demo war periods, so the first uncovered year is 2028): the reason appeared
   on the board and on the week; "Create the 2028 period" appeared on the week
   only. The board is where a scheduler works the day and publishes it, so the
   surface that tells him the money cannot land is the one that does not offer
   him the way out — he has to know to close the board and go looking.

   D19 in the owner's words: "Perhaps indicate that the leave war period doesn't
   exist, create it." Indicating without the offer is the half-answer the ruling
   was written against. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { HOOKS } from '../engine/hooks'
import { ensureRowIds } from '../engine/rowids'
import { setOilDay } from '../state/view'
import * as view from '../state/view'
import { validate } from '../engine/validate'
import { openScheduler, boardWarnHTML } from './board'
import { dayWarnHTML } from './html'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const SAT = 5
const DSNAP = JSON.stringify(DAYS)
let host: HTMLDivElement
let root: Root
let saved: any

beforeAll(async () => {
  initStore()
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' } as any); notify() })
  await act(async () => { view.setPage('editsched'); notify() })
})
afterAll(async () => { await act(async () => { root.unmount() }); host.remove() })
beforeEach(async () => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []; SCHED.dayOK = {}
  SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  ensureRowIds(DAYS); setOilDay(null)
  saved = { day: HOOKS.oilEarningDay, iso: HOOKS.oilDayISO, np: HOOKS.oilNoPeriod }
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? '2028-02-06' : '2028-02-03')
  /* the war holds no period for the year of this day */
  HOOKS.oilNoPeriod = (di: number) => (di === SAT ? '2028' : '')
  /* somebody down to earn, or the check is deliberately silent */
  ;(DAYS[SAT] as any).ground = (((DAYS[SAT] as any).ground) || [])
    .concat([{ prog: 'SDO', str: '0800', end: '1800', who: 'bane' }])
  ensureRowIds(DAYS)
  await act(async () => { validate(); openScheduler(SAT); notify() })
})
afterEach(() => {
  HOOKS.oilEarningDay = saved.day; HOOKS.oilDayISO = saved.iso; HOOKS.oilNoPeriod = saved.np
  setOilDay(null)
})

const REASON = /no leave war period for 2028/i

describe('a day no leave war period covers offers the way out wherever it names the reason', () => {
  it('the WEEK names the reason and offers the action', () => {
    view.DWOPEN.add(SAT)
    const h = dayWarnHTML(SAT)
    expect(h, 'the week names the reason').toMatch(REASON)
    expect(h, 'and offers to create the period').toContain('data-mkperiod="2028"')
    view.DWOPEN.delete(SAT)
  })

  it('the BOARD names the reason — and must offer the same action', () => {
    const h = boardWarnHTML(SAT)
    expect(h, 'the board names the reason').toMatch(REASON)
    expect(h, 'and offers to create the period, beside it').toContain('data-mkperiod="2028"')
  })

  it('and no OTHER check on the board grows an action', () => {
    const h = boardWarnHTML(SAT)
    const rows = h.split('class="wln ').length - 1
    const acts = h.split('data-mkperiod=').length - 1
    expect(acts, `one action across ${rows} rows`).toBe(1)
  })
})
