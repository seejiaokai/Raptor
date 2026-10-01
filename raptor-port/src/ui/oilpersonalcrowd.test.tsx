// @vitest-environment jsdom
/* [OIL-PERSONAL-PLACEHOLDER], ON SCREEN — ALL / ALL AVAIL on a member's "Personal" request row wears its count and
   opens the window, with OIL Earn off and on ([DB-READINESS] group A, phase 7; plan
   docs/superpowers/plans/2026-10-01-db-readiness-phase7-plan.md §1.1).

   The engine half is engine/oilpersonalcrowd.test.ts. This file is the roll-call's on-screen marks for that row: the
   board's chip, the edit week's chip, the window's list — and, inside OIL Earn on a Saturday, that every man behind the
   puck is drawn as earning NOTHING with the real reason, because a Personal request earns no OIL (D43: a placeholder
   behaves like named people, and a named man there earns nothing).

   jsdom has no layout engine: this proves the markup and the wiring; what it looks like is the walk. */
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
import { openScheduler, closeScheduler } from './board'
import { setOilDay } from '../state/view'
import { setAvailWin } from './pops'

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
const SAT = 5, TUE = 1, SAT_ISO = '2026-07-18', TUE_ISO = '2026-07-14'
const CROWD = ['stiff', 'plasma']

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

beforeEach(async () => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []; SCHED.dayOK = {}
  SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  for (const di of [SAT, TUE]) (DAYS[di] as any).ground = []
  ensureRowIds(DAYS)
  setOilDay(null)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : di === TUE ? TUE_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => CROWD.slice()
})
afterEach(async () => { await act(async () => { setOilDay(null); setAvailWin(null); closeScheduler(); notify() }) })

const open = async (di: number) => { await act(async () => { openScheduler(di); notify() }) }
const oilBtn = () => $('#sbBoard [data-oilmode]')
const groundRowEl = () => $$('#sbBoard .sb-panel.grnd .sb-arow.c6r')[0]

/* ignite's Personal request, landed on the day, with a placeholder standing under it */
const landed = (di: number, over: any = {}, row: any = {}) => {
  INPUTS.unshift({ iid: 'rq1', person: 'ignite', type: 'Personal', date: di === SAT ? 'Jul 18' : 'Jul 14', yr: 2026,
    acc: 'g', allday: false, s: 9 * 60, e: 17 * 60, remarks: '', mod: 'now', ...over })
  ;(DAYS[di] as any).ground = [{ prog: 'PERSONAL', str: '0900', end: '1700', who: 'ignite', src: 'rq1',
    srcType: 'Personal', more: ['allavail'], ...row }]
  ensureRowIds(DAYS)
}

describe('the count shows on a Personal request row, OIL Earn off (D27, D37)', () => {
  it('THE BOARD, on a weekday: the chip says how many, and opens the window on them', async () => {
    landed(TUE)
    await open(TUE)
    const chip = groundRowEl().querySelector('.oilcount') as HTMLElement
    expect(chip, 'the placeholder wears its count').toBeTruthy()
    expect((chip.textContent || '').trim()).toBe('2')
    await click(chip)
    const w = $('.availwin')
    expect(w && !w.hidden, 'the window opens').toBe(true)
    expect(([...w.querySelectorAll('[data-awp]')] as HTMLElement[]).map(r => r.dataset.awp).sort()).toEqual(['plasma', 'stiff'])
    expect(w.querySelector('.win-lost'), 'and it does not say the row has no puck').toBeNull()
  })

  it('THE EDIT WEEK draws the same chip on the same row', async () => {
    landed(TUE)
    await act(async () => { notify() })
    const chips = $$('#eWeek .oilcount[data-oilsent="i:rq1"]')
    expect(chips.length, 'one chip, on the request\'s row').toBe(1)
    expect((chips[0].textContent || '').trim()).toBe('2')
  })

  it('in the NAME BOX: the same count', async () => {
    landed(TUE, {}, { who: 'allavail', more: [] })
    await open(TUE)
    expect((groundRowEl().querySelector('.oilcount')!.textContent || '').trim()).toBe('2')
  })

  it('THE CONTROL: a Personal row with no placeholder wears no chip', async () => {
    landed(TUE, {}, { more: ['divot'] })
    await open(TUE)
    expect(groundRowEl().querySelector('.oilcount')).toBeNull()
  })
})

describe('inside OIL Earn, on a Saturday: counted, and nobody earns — said with its reason', () => {
  it('every man behind the puck is drawn as earning nothing, because a personal request earns no OIL', async () => {
    landed(SAT)
    await open(SAT)
    await click(oilBtn())
    const chip = groundRowEl().querySelector('.oilcount') as HTMLElement
    expect((chip.textContent || '').trim(), 'the plain count — nobody earns, so no "n of m earn"').toBe('2')
    await click(chip)
    const seats = [...$('.availwin').querySelectorAll('.seat.oilpk')] as HTMLElement[]
    expect(seats.length).toBe(2)
    for (const s of seats) {
      expect(s.classList.contains('inert'), 'no switch: there is nothing to switch').toBe(true)
      expect(s.title).toContain('a personal request earns no OIL')
      expect(s.title).not.toContain('nothing measurable')
    }
  })

  /* the walk (walker A, O2): before any tap the earn half's foot read "Tap a puck to stop a man earning from this
     event." beside "0 of 2" — an invitation to a tap that can do nothing. The foot says what is true of the row. */
  it('the earn half\'s own hint says why nobody earns, never "tap a puck to stop a man earning"', async () => {
    landed(SAT)
    await open(SAT)
    await click(oilBtn())
    await click(groundRowEl().querySelector('.oilcount'))
    const foot = $('.availwin .win-foot').textContent || ''
    expect(foot).toBe('A personal request earns no OIL.')
  })

  /* Fable's final read, F2: the earn half's foot kept the inert reason from the tap, so a request retyped BEHIND the open
     window left "…a personal request earns no OIL" standing beside pucks that now earn. The foot keeps WHO was tapped and
     says what is true of him at every draw — on this half as on the other. */
  it('the foot about a tapped man follows a retype made behind the open window', async () => {
    landed(SAT)
    await open(SAT)
    await click(oilBtn())
    await click(groundRowEl().querySelector('.oilcount'))
    await click($('.availwin').querySelector('.seat.oilpk .puck'))
    const foot = () => $('.availwin .win-foot').textContent || ''
    expect(foot()).toContain('a personal request earns no OIL')
    await act(async () => {
      Object.assign(INPUTS[0] as any, { type: 'Training', oil: { [SAT_ISO]: 1 } })
      ;(DAYS[SAT] as any).ground[0].srcType = 'Training'
      notify()
    })
    expect(($('.availwin').querySelector('.seat.oilpk') as HTMLElement).classList.contains('inert'), 'the list: he earns now').toBe(false)
    expect(foot(), 'and the foot no longer says he cannot').not.toContain('earns no OIL')
  })

  it('the requester\'s own puck on the row says the same', async () => {
    landed(SAT)
    await open(SAT)
    await click(oilBtn())
    const own = ([...groundRowEl().querySelectorAll('.seat.oilpk')] as HTMLElement[]).find(s => (s.title || '').includes('Ignite'))
      || (groundRowEl().querySelector('.seat.oilpk') as HTMLElement)
    expect(own.classList.contains('inert')).toBe(true)
    expect(own.title).toContain('a personal request earns no OIL')
  })

  it('and no OIL decision can be written from the window', async () => {
    landed(SAT)
    await open(SAT)
    await click(oilBtn())
    await click(groundRowEl().querySelector('.oilcount'))
    await click($('.availwin').querySelector('.seat.oilpk .puck'))
    expect((DAYS[SAT] as any).oild, 'a tap on a man who cannot earn writes nothing').toBeUndefined()
  })
})
