// @vitest-environment jsdom
/* [OIL-SEATS-CAN-EARN] STEP 7 — a placeholder opens into REAL pucks on a duty
   desk, a sim row and every extras line, so one man can be taken off the crowd.
   Plan: docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md §5 step 7;
   register OIL8; Fable M5.

   WHAT WAS MISSING. Inside the earn mode a placeholder on a GROUND row or the
   Common Programme opened into the people it stands for, and each of them could
   be tapped on or off. Nowhere else did: a duty desk, a sim seat, a sim
   passenger line and every extras line drew the placeholder itself as one inert
   body — "nothing measurable to earn from here" — so the only way to change
   anything about that crowd was the row's whole switch, all of them or none.

   Step 5 made those seats EARN. Without this step the screen would pay a crowd
   it gives the scheduler no way to correct, which is worse than not paying it:
   the money moved and the door did not.

   THE DOOR MATTERS AS MUCH AS THE RULE. Three of the owner's finds on 21 Sep 26
   were surfaces a finished rule was never wired to, and no amount of reading the
   engine would have found them. */
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
import { rowItemKey } from '../engine/oil'
import { openScheduler } from './board'
import { setOilDay } from '../state/view'

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
  /* one row per panel, so each crowd can be addressed without counting past the
     seed day's own duty and sim content */
  Object.assign(DAYS[SAT] as any, { dutywaves: [], sims: { amt: [], oft: [] }, oild: undefined })
  ensureRowIds(DAYS)
  setOilDay(null)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => CROWD.slice()
})
afterEach(() => { setOilDay(null) })

const open = async (di: number) => { await act(async () => { openScheduler(di); notify() }) }
const oilBtn = () => $('#sbBoard [data-oilmode]')
const seatsIn = (panel: string) =>
  ($$(`#sbBoard .sb-panel.${panel} .seat.oilpk`) as HTMLElement[])
const namesIn = (panel: string) => seatsIn(panel).map(s => s.dataset.oilp).sort()

const desk = (row: any) => {
  ;(DAYS[SAT] as any).dutywaves = [{ label: 'DUTIES', rows: [{ role: 'SDO', str: '0700', end: '1900', ...row }] }]
  ensureRowIds(DAYS)
  return (DAYS[SAT] as any).dutywaves[0].rows[0]
}
const sim = (row: any) => {
  ;(DAYS[SAT] as any).sims = { amt: [], oft: [{ label: 'EP SIM', str: '1300', end: '1500', p: '', w: '', ...row }] }
  ensureRowIds(DAYS)
  return (DAYS[SAT] as any).sims.oft[0]
}
const enter = async () => { await open(SAT); await click(oilBtn()) }

describe('a DUTY DESK opens its crowd (OIL8)', () => {
  it('a placeholder ON the desk draws the men behind it, each one tappable', async () => {
    desk({ id: 'allavail' })
    await enter()
    expect($('#sbBoard .sb-panel.duty .puck.allavail'), 'the placeholder itself is gone in the mode').toBeFalsy()
    expect(namesIn('duty')).toEqual(['plasma', 'stiff'])
    expect(seatsIn('duty').filter(s => s.classList.contains('inert')).length,
      'none of them may be inert — the money is paying them').toBe(0)
  })

  it('a placeholder in the desk\'s EXTRAS line, beside a named man', async () => {
    desk({ id: 'rocky', more: ['allavail'] })
    await enter()
    expect(namesIn('duty'), 'the named man keeps his place and the crowd joins him').toEqual(['plasma', 'rocky', 'stiff'])
  })

  it('ONE MAN IS TAKEN OFF, and the rest of the desk is untouched', async () => {
    const r = desk({ id: 'allavail' })
    await enter()
    const item = rowItemKey(r.rid)
    await click(seatsIn('duty').find(s => s.dataset.oilp === 'plasma')!)
    expect((DAYS[SAT] as any).oild.people[`plasma|${item}`]).toBe('deny')
    expect(seatsIn('duty').find(s => s.dataset.oilp === 'plasma')!.classList.contains('off')).toBe(true)
    expect(seatsIn('duty').find(s => s.dataset.oilp === 'stiff')!.classList.contains('on'), 'untouched').toBe(true)
  })
})

describe('a SIM ROW opens its crowd (OIL8)', () => {
  it('a placeholder in a SEAT', async () => {
    sim({ p: 'allavail' })
    await enter()
    expect($('#sbBoard .sb-panel.simr .puck.allavail'), 'the placeholder itself is gone').toBeFalsy()
    expect(namesIn('simr')).toEqual(['plasma', 'stiff'])
  })

  it('a placeholder among the PASSENGERS', async () => {
    sim({ pax: ['rocky', 'allavail'] })
    await enter()
    expect(namesIn('simr')).toEqual(['plasma', 'rocky', 'stiff'])
  })

  it('a placeholder on the EXTRAS line', async () => {
    sim({ p: 'rocky', more: ['allavail'] })
    await enter()
    expect(namesIn('simr')).toEqual(['plasma', 'rocky', 'stiff'])
  })

  it('one man is taken off a sim crowd on his own', async () => {
    const r = sim({ p: 'allavail' })
    await enter()
    await click(seatsIn('simr').find(s => s.dataset.oilp === 'stiff')!)
    expect((DAYS[SAT] as any).oild.people[`stiff|${rowItemKey(r.rid)}`]).toBe('deny')
    expect(seatsIn('simr').find(s => s.dataset.oilp === 'plasma')!.classList.contains('on'), 'untouched').toBe(true)
  })
})

describe('the controls — nothing else about these rows changes', () => {
  it('a duty desk of NAMED men draws exactly the men on it', async () => {
    desk({ id: 'rocky', more: ['divot'] })
    await enter()
    expect(namesIn('duty')).toEqual(['divot', 'rocky'])
  })

  it('a sim row of NAMED men draws exactly the men on it', async () => {
    sim({ p: 'rocky', w: 'divot' })
    await enter()
    expect(namesIn('simr')).toEqual(['divot', 'rocky'])
  })

  it('the mode shows EVERYONE the row pays, even where the planning view hides them', async () => {
    /* a passenger-style sim row draws only its passengers when it is being
       planned — the two seats are not part of that shape. The day's work walk
       reads the seats all the same, so a man sitting in one is being paid. The
       mode is about who earns, so it shows him: the alternative is a credit on
       screen nowhere, which is the shape this whole change exists to end. */
    sim({ p: 'rocky', pax: ['freak'] })
    await enter()
    expect(namesIn('simr')).toEqual(['freak', 'rocky'])
  })

  it('a desk with NO WRITTEN TIMES cannot resolve a crowd, and says so instead of inventing one', async () => {
    desk({ id: 'allavail', str: '', end: '' })
    await enter()
    expect(namesIn('duty'), 'nobody is credited from a desk the rules cannot measure').toEqual([])
  })

  it('OUT of the mode the row is drawn exactly as it always was', async () => {
    desk({ id: 'allavail' })
    await open(SAT)
    expect($('#sbBoard .sb-panel.duty .puck.allavail'), 'the placeholder is the body on the desk').toBeTruthy()
    expect(seatsIn('duty').length, 'and no earn pucks at all').toBe(0)
  })
})
