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

/* ---- THE DOOR MOVED INTO THE WINDOW ([ALL-AVAIL-WINDOW], D38) --------------
   Step 7 built an INLINE crowd: inside the mode a placeholder became the
   individual pucks of the men behind it, drawn along the row. It was built for a
   real reason — step 5 made those seats EARN, and paying a crowd the scheduler
   cannot correct is worse than not paying it.

   The owner then ruled that the window replaces that in-row crowd (D38), so the
   door is now: the row shows the PLACEHOLDER and its counter, the counter opens
   the window, and the window is where one man is taken off.

   THE THING STEP 7 GUARANTEED IS WHAT THESE STILL CHECK, seat kind by seat kind:
   that every place a placeholder can land HAS a door, and that the door works.
   That is the roll-call, written as tests — and it is a stronger check than the
   old one, because it walks the whole route a scheduler actually takes instead
   of asserting that some pucks were drawn. */
const chipOn = (panel: string) => $(`#sbBoard .sb-panel.${panel} .oilcount`)
const openWin = async (panel: string) => {
  const c = chipOn(panel)
  expect(c, `the ${panel} placeholder has a counter to tap — this IS the door`).toBeTruthy()
  await click(c)
  expect($('.availwin'), 'and it opens the window').toBeTruthy()
}
const winSeats = () => ($$('.availwin .seat.oilpk') as HTMLElement[])
const winNames = () => winSeats().map(s => s.dataset.oilp).sort()
const winSeat = (id: string) => winSeats().find(s => s.dataset.oilp === id)!
const prog = (row: any) => {
  ;(DAYS[SAT] as any).allhands = [{ prog: 'SAFETY BRIEF', str: '0800', end: '1000', ...row }]
  ensureRowIds(DAYS)
  return (DAYS[SAT] as any).allhands[0]
}
const ground = (row: any) => {
  ;(DAYS[SAT] as any).ground = [{ prog: 'STORES CHECK', str: '0900', end: '1100', ...row }]
  ensureRowIds(DAYS)
  return (DAYS[SAT] as any).ground[0]
}

describe('a DUTY DESK opens its crowd (OIL8)', () => {
  it('a placeholder ON the desk keeps its counter, and the counter opens the crowd', async () => {
    desk({ id: 'allavail' })
    await enter()
    expect($('#sbBoard .sb-panel.duty .puck.allavail'), 'the placeholder STAYS a placeholder now').toBeTruthy()
    await openWin('duty')
    expect(winNames()).toEqual(['plasma', 'stiff'])
    expect(winSeats().filter(s => s.classList.contains('inert')).length,
      'none of them may be inert — the money is paying them').toBe(0)
  })

  it('a placeholder in the desk EXTRAS line, beside a named man', async () => {
    desk({ id: 'rocky', more: ['allavail'] })
    await enter()
    /* the named man keeps his own puck on the ROW, where he always was; the
       crowd behind the placeholder is what moved into the window */
    expect(($$('#sbBoard .sb-panel.duty .seat.oilpk') as HTMLElement[]).map(s => s.dataset.oilp))
      .toEqual(['rocky'])
    await openWin('duty')
    expect(winNames()).toEqual(['plasma', 'stiff'])
  })

  it('ONE MAN IS TAKEN OFF in the window, and the rest of the desk is untouched', async () => {
    const r = desk({ id: 'allavail' })
    await enter()
    await openWin('duty')
    const item = rowItemKey(r.rid)
    await click(winSeat('plasma').querySelector('.puck'))
    expect((DAYS[SAT] as any).oild.people[`plasma|${item}`]).toBe('deny')
    expect(winSeat('plasma').classList.contains('off')).toBe(true)
    expect(winSeat('stiff').classList.contains('on'), 'untouched').toBe(true)
  })
})

describe('a SIM ROW opens its crowd (OIL8)', () => {
  it('a placeholder in a SEAT', async () => {
    sim({ p: 'allavail' })
    await enter()
    expect($('#sbBoard .sb-panel.simr .puck.allavail'), 'the placeholder stays').toBeTruthy()
    await openWin('simr')
    expect(winNames()).toEqual(['plasma', 'stiff'])
  })

  it('a placeholder among the PASSENGERS', async () => {
    sim({ pax: ['rocky', 'allavail'] })
    await enter()
    await openWin('simr')
    expect(winNames()).toEqual(['plasma', 'stiff'])
  })

  it('a placeholder on the EXTRAS line', async () => {
    sim({ p: 'rocky', more: ['allavail'] })
    await enter()
    await openWin('simr')
    expect(winNames()).toEqual(['plasma', 'stiff'])
  })

  it('one man is taken off a sim crowd on his own, in the window', async () => {
    const r = sim({ p: 'allavail' })
    await enter()
    await openWin('simr')
    await click(winSeat('stiff').querySelector('.puck'))
    expect((DAYS[SAT] as any).oild.people[`stiff|${rowItemKey(r.rid)}`]).toBe('deny')
    expect(winSeat('plasma').classList.contains('on'), 'untouched').toBe(true)
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

/* THE COMMON PROGRAMME — WRITTEN 22 Sep 26, AFTER A BREAK TEST PROVED IT HAD NO
   TEST AT ALL (the walk, docs/handpass/2026-09-22-oil-seats.md §8).
   OIL8 says a placeholder opens into real pucks "on a duty desk, a sim row and
   every extras line, not just a ground row" — and the file was written to the
   surfaces step 7 ADDED, so the two that already worked were never asserted.
   Breaking the Common Programme's crowd opening on purpose left all 3,301 unit
   tests green, while the same break turned 4 red on a duty desk, 4 on a sim and
   3 on a ground row. By proof, this surface had no test.
   It is also one of the three surfaces the owner found unwired by hand on
   21 Sep 26, which is the reason it is worth the minute: a surface that already
   works is exactly where the next unwiring goes unnoticed. */
describe('the COMMON PROGRAMME opens its crowd (OIL8)', () => {
  it('a placeholder ON a programme row keeps its counter, and it opens the crowd', async () => {
    prog({ who: 'allavail' })
    await enter()
    expect($('#sbBoard .sb-panel.prog .puck.allavail'), 'the placeholder STAYS a placeholder now').toBeTruthy()
    await openWin('prog')
    expect(winNames()).toEqual(['plasma', 'stiff'])
    expect(winSeats().filter(s => s.classList.contains('inert')).length,
      'none of them may be inert — the money is paying them').toBe(0)
  })

  it('a placeholder BESIDE a named man — the man stays on the row, the crowd is in the window', async () => {
    prog({ who: ['rocky', 'allavail'] })
    await enter()
    expect(($$('#sbBoard .sb-panel.prog .seat.oilpk') as HTMLElement[]).map(s => s.dataset.oilp))
      .toEqual(['rocky'])
    await openWin('prog')
    expect(winNames()).toEqual(['plasma', 'stiff'])
  })

  it('ONE MAN IS TAKEN OFF in the window, and the rest of the row is untouched', async () => {
    const r = prog({ who: 'allavail' })
    await enter()
    await openWin('prog')
    await click(winSeat('plasma').querySelector('.puck'))
    expect((DAYS[SAT] as any).oild.people[`plasma|${rowItemKey(r.rid)}`]).toBe('deny')
    expect(winSeat('stiff').classList.contains('on'), 'untouched').toBe(true)
  })

  it('a row of NAMED men draws exactly the men on it', async () => {
    prog({ who: ['rocky', 'divot'] })
    await enter()
    expect(namesIn('prog')).toEqual(['divot', 'rocky'])
  })

  it('a row with NO WRITTEN TIMES resolves nobody rather than inventing a crowd', async () => {
    prog({ who: 'allavail', str: '', end: '' })
    await enter()
    expect(namesIn('prog')).toEqual([])
  })

  it('OUT of the mode the row is drawn exactly as it always was', async () => {
    prog({ who: 'allavail' })
    await open(SAT)
    expect($('#sbBoard .sb-panel.prog .puck.allavail'), 'the placeholder is the body on the row').toBeTruthy()
    expect(seatsIn('prog').length, 'and no earn pucks at all').toBe(0)
  })
})

/* THE GROUND PROGRAMME, for the same reason. The break test turned 3 red here,
   so it is not unwatched — but those three live in other files and none of them
   is named for OIL8, so a reader of this file would take the surface for
   uncovered. One block, so the register's row and the surfaces it names are in
   one place. */
describe('a GROUND ROW opens its crowd (OIL8)', () => {
  it('a placeholder on a ground row keeps its counter, and it opens the crowd', async () => {
    ground({ who: 'allavail' })
    await enter()
    await openWin('grnd')
    expect(winNames()).toEqual(['plasma', 'stiff'])
  })

  it('one man is taken off in the window, and the rest are untouched', async () => {
    const r = ground({ who: 'allavail' })
    await enter()
    await openWin('grnd')
    await click(winSeat('stiff').querySelector('.puck'))
    expect((DAYS[SAT] as any).oild.people[`stiff|${rowItemKey(r.rid)}`]).toBe('deny')
    expect(winSeat('plasma').classList.contains('on')).toBe(true)
  })
})
