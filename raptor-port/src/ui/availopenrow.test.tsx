// @vitest-environment jsdom
/* [ALLAVAIL-OPEN-ROW] — D360 (owner, 28 Sep 26: "ok, need to say something like no oil worked out due end time to the
   admin"), on screen. The engine half (the crowd recorded over the assumed hour, nothing credited) is
   engine/oilopenrow.test.ts; this is what a person reads:
   · the count chip shows on a row with a start and no end, on the board and the edit week, and its number is the
     window's list (Fable correction 2 — one reader);
   · the window's title names the assumed hour ("18:30–19:30 · no end time, an hour assumed") instead of saying the
     row has no usable times beside a count (Fable F2);
   · where OIL is decided — the window's "Who earns OIL" half and the row's switch in OIL Earn mode — the admin is told
     "No OIL worked out — this row has no end time";
   · a row with NO start keeps no count, but its placeholder wears a "?" of its own ("No start time — …"), never the
     older issued day's "?", and the tap opens the window on the row's reason (D31 — never a silent absence).
   Harness: availwin.test.tsx's. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { SCHED } from '../engine/publish'
import { ensureRowIds } from '../engine/rowids'
import { groundItemKey } from '../engine/oil'
import { openScheduler } from './board'
import { setOilDay } from '../state/view'
import { OIL_OPEN_END, OIL_NO_START } from './oilmode'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

let host: HTMLDivElement
let root: Root
const DSNAP = JSON.stringify(DAYS)
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel
const SAT = 5, SAT_ISO = '2026-07-18'
const CROWD = ['bane', 'freak']

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'ad', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
  HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel
})
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []; SCHED.dayOK = {}
  SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  setOilDay(null)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => CROWD.slice()
})
afterEach(async () => {
  setOilDay(null)
  await act(async () => { notify() })
})

/* the Saturday's ground programme gets the one row the owner's case is about: DINNER WITH CMD, 18:30, no end */
const openRow = (str = '1830', end = '') => {
  ;(DAYS[SAT] as any).ground = [{ prog: 'DINNER WITH CMD', str, end, who: 'allavail' }]
  ensureRowIds(DAYS)
  return groundItemKey((DAYS[SAT] as any).ground[0])
}
const open = async () => { await act(async () => { openScheduler(SAT); notify() }) }
const chip = () => $('#sbBoard .sb-panel.grnd .oilcount')

describe('a row with a start and no end shows its count (D360)', () => {
  it('the chip is drawn, and its number is the window\'s list', async () => {
    openRow(); await open()
    expect(chip(), 'the chip is on the board').toBeTruthy()
    expect(chip().textContent).toBe(String(CROWD.length))
    await click(chip())
    expect($$('.availwin .rpuck').length, 'the window lists the men the chip counted').toBe(CROWD.length)
  })

  it('the window names the assumed hour — not "no usable times" beside a count', async () => {
    openRow(); await open(); await click(chip())
    const ttl = $('.availwin .win-ttl').textContent || ''
    expect(ttl).toContain('18:30–19:30')
    expect(ttl).toContain('no end time, an hour assumed')
    expect($('.availwin .win-lost'), 'the list, not a reason it cannot be worked out').toBeNull()
  })

  it('the edit week draws the same chip', async () => {
    openRow(); await act(async () => { notify() })
    const item = groundItemKey((DAYS[SAT] as any).ground[0])
    const c = $$(`#eWeek .oilcount`).find(e => e.dataset.oilsent === item)
    expect(c, 'the week\'s chip').toBeTruthy()
    expect(c!.textContent).toBe(String(CROWD.length))
  })
})

describe('where OIL is decided, the admin is told none is worked out (D360)', () => {
  it('the window\'s "Who earns OIL" half says why nobody earns — 0 of 2', async () => {
    openRow(); setOilDay(SAT); await open(); await click(chip())
    expect($('.availwin .win-tab.on')?.textContent || '').toContain('Who earns OIL')
    expect($('.availwin .win-tab.on')?.textContent || '').toContain(`0 of ${CROWD.length}`)
    expect($('.availwin .win-foot .hint')?.textContent).toBe(`${OIL_OPEN_END}.`)
  })

  it('the row\'s switch in OIL Earn mode says the same, not "nothing on this row can earn"', async () => {
    const item = openRow(); setOilDay(SAT); await open()
    const cell = $$('#sbBoard .oilitem').find(e => e.closest('.sb-panel.grnd') && (e.textContent || '').includes('DINNER WITH CMD'))
    expect(cell, 'the row\'s item cell in the mode').toBeTruthy()
    expect(cell!.getAttribute('title')).toBe(OIL_OPEN_END)
    expect(item).toBeTruthy()
  })

  it('"who\'s available", open to everyone, carries the assumed hour only — no OIL sentence', async () => {
    openRow(); await open(); await click(chip())
    expect($('.availwin .win-foot .hint')?.textContent || '').not.toContain('No OIL')
  })
})

describe('a row with NO start: a "?" of its own, never a silent absence (D31)', () => {
  it('its placeholder wears "?" with the row\'s reason, distinct from the older issued day\'s "?"', async () => {
    openRow('', ''); await open()
    expect(chip(), 'a chip, not nothing').toBeTruthy()
    expect(chip().textContent).toBe('?')
    expect(chip().classList.contains('nostart')).toBe(true)
    expect(chip().getAttribute('title')).toBe(OIL_NO_START)
    expect(chip().getAttribute('title')).not.toMatch(/issued before/)
  })
  it('its tap opens the window on the row\'s reason', async () => {
    openRow('', ''); await open(); await click(chip())
    expect($('.availwin .win-lost')?.textContent || '').toMatch(/no usable start and end times/)
  })
  it('THE CONTROL — a row with both times keeps its plain count', async () => {
    openRow('1830', '2030'); await open()
    expect(chip().textContent).toBe(String(CROWD.length))
    expect(chip().classList.contains('nostart')).toBe(false)
  })
})
